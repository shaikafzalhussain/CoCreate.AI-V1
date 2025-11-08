import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from environment variable
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not set in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('OPENROUTER')));
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(500).json({ 
        error: 'Server configuration error: API key not found. Please set OPENROUTER_API_KEY in Vercel environment variables.',
        details: 'The OPENROUTER_API_KEY environment variable is missing. Go to Vercel Dashboard → Settings → Environment Variables to add it.'
      });
    }

    // Get request body
    const { model, messages, temperature, max_tokens } = req.body;

    if (!model || !messages) {
      return res.status(400).json({ error: 'Missing required fields: model, messages' });
    }

    // Forward request to OpenRouter API
    const openRouterResponse = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': req.headers.referer || req.headers.origin || 'https://cocreate.ai',
          'X-Title': 'CoCreate.AI',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: temperature || 0.9,
          max_tokens: max_tokens || 800,
        }),
      }
    );

    // Get response data
    const data = await openRouterResponse.json();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Check if OpenRouter returned an error
    if (!openRouterResponse.ok) {
      console.error('OpenRouter API error:', {
        status: openRouterResponse.status,
        data: data
      });
      
      // If it's an auth error, provide helpful message
      if (openRouterResponse.status === 401 || openRouterResponse.status === 403) {
        return res.status(openRouterResponse.status).json({
          error: 'Authentication failed',
          message: data.error?.message || 'Invalid API key. Please check your OPENROUTER_API_KEY in Vercel environment variables.',
          details: 'The API key may be invalid, expired, or not set correctly in Vercel.'
        });
      }
    }

    // Return the same status and data from OpenRouter
    return res.status(openRouterResponse.status).json(data);
  } catch (error) {
    console.error('Error in OpenRouter proxy:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

