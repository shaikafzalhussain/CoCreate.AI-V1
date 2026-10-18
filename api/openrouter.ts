import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenRouter } from '@openrouter/sdk';
import { createClient } from '@supabase/supabase-js';

const PROMPT_REFINER_MODEL = 'xingchen-agi/xing4.0-29b-a4b:free';
const GENERAL_MODEL = 'google/gemma-4-26b-a4b-it:free';
const COMPLEX_MODEL = 'nvidia/nemotron-3.5-super-vl:free';
const COMPLEX_PROMPT = /\b(code|coding|program|debug|bug|stack trace|algorithm|sql|api|architecture|math|calculate|equation|proof|derive|analy[sz]e|analysis|compare|evaluate|research|reasoning|step[- ]by[- ]step|trade[- ]off|technical|science|statistics|data model|visual|image|screenshot|photo|pdf|document|video)\b/i;

function routeModel(messages: Array<{ role?: string; content?: unknown }>) {
  const latestUser = [...messages].reverse().find((message) => message.role === 'user');
  const content = typeof latestUser?.content === 'string' ? latestUser.content : JSON.stringify(latestUser?.content ?? '');
  return content.length > 420 || COMPLEX_PROMPT.test(content) ? COMPLEX_MODEL : GENERAL_MODEL;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { model, messages, temperature, max_tokens, stream = false, purpose = 'legacy' } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0 || (purpose === 'legacy' && !model)) {
    return res.status(400).json({ error: 'Missing required fields: model, messages' });
  }
  if (purpose !== 'chat' && purpose !== 'refine' && purpose !== 'legacy') {
    return res.status(400).json({ error: 'Invalid request purpose' });
  }

  // Vite/Arena preview is temporarily open for testing. Vercel always enforces Supabase auth.
  const previewAuthBypass = process.env.COCREATE_PREVIEW_AUTH_BYPASS === 'true' && process.env.VERCEL !== '1';
  if (!previewAuthBypass) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Server configuration error', message: 'Supabase server auth settings are not configured.' });
    }
    const authorization = req.headers.authorization;
    const accessToken = typeof authorization === 'string' ? authorization.replace(/^Bearer\s+/i, '') : '';
    if (!accessToken) return res.status(401).json({ error: 'Sign-in required', message: 'Please sign in to use CoCreate.' });
    const authClient = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
    try {
      const { data: userData, error: authError } = await authClient.auth.getUser(accessToken);
      if (authError || !userData.user) {
        return res.status(401).json({ error: 'Invalid session', message: 'Your sign-in session expired. Please sign in again.' });
      }
    } catch {
      return res.status(503).json({ error: 'Authentication service unavailable', message: 'We could not verify your sign-in. Please try again.' });
    }
  }

  const isRefinement = purpose === 'refine';
  const keyName = isRefinement ? 'OPENROUTER_REFINE_API_KEY' : 'OPENROUTER_API_KEY';
  const apiKey = isRefinement ? process.env.OPENROUTER_REFINE_API_KEY : process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: `${keyName} is not configured in the server environment.`,
    });
  }

  const selectedModel = isRefinement ? PROMPT_REFINER_MODEL : purpose === 'chat' ? routeModel(messages) : model;
  const openrouter = new OpenRouter({ apiKey });
  try {
    if (stream) {
      const response = await openrouter.chat.send({
        chatRequest: {
          model: selectedModel,
          messages,
          temperature: temperature ?? 0.7,
          maxTokens: max_tokens ?? 1200,
          stream: true,
          streamOptions: { includeUsage: true },
        },
      });
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      for await (const chunk of response as AsyncIterable<{ choices?: unknown; usage?: unknown; error?: unknown }>) {
        const clientChunk = purpose === 'legacy' ? chunk : { choices: chunk.choices, usage: chunk.usage, error: chunk.error };
        res.write(`data: ${JSON.stringify(clientChunk)}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const completion = await openrouter.chat.send({
      chatRequest: {
        model: selectedModel,
        messages,
        temperature: temperature ?? 0.7,
        maxTokens: max_tokens ?? 1200,
        stream: false,
      },
    });
    return res.status(200).json(completion);
  } catch (error) {
    console.error('OpenRouter request failed:', error);
    const message = error instanceof Error ? error.message : 'OpenRouter request failed';
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: { message } })}\n\n`);
      return res.end();
    }
    return res.status(502).json({ error: 'OpenRouter request failed', message });
  }
}
