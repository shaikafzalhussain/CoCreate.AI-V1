// Gemini Prompt Refiner Helper
// This will try the Gemini API when an API key is provided. If the API key is missing,
// placeholder, or the network request fails, it falls back to a deterministic local
// refinement so the feature remains useful during development and without a key.
export async function refinePrompt(userInput: string, apiKey: string): Promise<string> {
  // Allow an OpenRouter/OpenAI key via Vite env or runtime localStorage so users can test without
  // committing secrets. We prefer OpenRouter if available, then Gemini, then local fallback.
  const OPENROUTER_API_KEY = typeof window !== "undefined"
    ? (import.meta.env.VITE_OPENROUTER_API_KEY as string) || window.localStorage.getItem("openrouter_api_key") || ""
    : (import.meta.env.VITE_OPENROUTER_API_KEY as string) || "";

  const localRefine = (input: string) => {
    // Idempotent local refinements - avoid repeatedly prefixing "Please" or duplicating changes.
    // Steps:
    // 1) Trim and normalize whitespace
    // 2) Remove a leading polite "please" so we don't add another one
    // 3) Detect if the prompt already looks "refined" and return as-is
    // 4) Apply keyword-driven templates (HTML/code/general) to produce useful refinements

    let raw = (input || "").trim().replace(/\s+/g, " ");

    // If the prompt already contains obvious refinement markers, return it unchanged
    const alreadyRefinedPatterns = [/Write a complete/i, /well-structured/i, /<!doctype html>/i, /Provide a detailed/i];
    if (alreadyRefinedPatterns.some((rx) => rx.test(raw))) return raw;

    // Normalize common acronyms
    raw = raw.replace(/\bhtml\b/ig, "HTML");
    raw = raw.replace(/\bcss\b/ig, "CSS");
    raw = raw.replace(/\bjs\b/ig, "JavaScript");

    // Remove an existing leading 'please' to avoid duplication on repeated refinements
    const hadLeadingPlease = /^please\b[, ]*/i.test(raw);
    if (hadLeadingPlease) raw = raw.replace(/^please\b[, ]*/i, "");

    // If the prompt clearly looks code/HTML-related, return a specific code-oriented template
    if (/\b(html|website|webpage|site|html5|react|component|css|js|javascript|code)\b/i.test(raw)) {
      return (
        "Write a complete, well-structured HTML document including <!doctype html>, a <head> with meta charset and a title, and a <body> demonstrating basic layout elements (headers, paragraphs, and a simple navigation). Include brief comments and minimal CSS to illustrate styling."
      );
    }

    // For short prompts, expand them into a clear instruction only once (we removed any existing leading 'please')
    const words = raw.split(" ").filter(Boolean);
    if (words.length <= 6) {
      // Give small variations by intent keywords
      if (/\b(image|photo|picture)\b/i.test(raw)) {
        return `Please generate a detailed description and usage notes for the image request: ${raw}. Include style, color palette, and suggested layout.`;
      }
      if (/\bsocial|post|tweet|caption\b/i.test(raw)) {
        return `Please write a concise, engaging social-media post for: ${raw}. Keep it under 280 characters and include a clear call to action.`;
      }

      // Default polite expansion (single leading 'Please')
      let expanded = raw.charAt(0).toLowerCase() + raw.slice(1);
      expanded = `Please ${expanded}`;
      expanded = expanded.charAt(0).toUpperCase() + expanded.slice(1);
      if (!/[.?!]$/.test(expanded)) expanded += ".";
      return expanded;
    }

    // For longer prompts, ensure sentence-case and punctuation
    let out = raw.charAt(0).toUpperCase() + raw.slice(1);
    if (!/[.?!]$/.test(out)) out = out + ".";
    return out;
  };

  // Prefer OpenRouter if available (Vite env or localStorage). If present, call OpenRouter's
  // chat completions endpoint to ask the model to refine the prompt.
  const hasOpenRouterKey = Boolean(OPENROUTER_API_KEY && !OPENROUTER_API_KEY.includes("YOUR_"));
  const hasGeminiKey = Boolean(apiKey && !apiKey.includes("YOUR_"));

  if (hasOpenRouterKey) {
    try {
      const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      const body = {
        model: "anthropic/claude-3-opus-20240229",
        messages: [
          { role: "system", content: "You are a helpful prompt-refinement assistant. Improve the user's prompt for clarity, completeness, and specificity without changing intent." },
          { role: "user", content: `Refine this prompt:\n\n${userInput}` },
        ],
        temperature: 0.7,
        max_tokens: 300,
      };

      console.log('Calling OpenRouter API...'); // Debug log
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://localhost:8083",
          "X-Title": "CoCreate Synth Prompt Refinement"
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('OpenRouter API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return localRefine(userInput);
      }
      
      const data = await response.json();
      console.log('OpenRouter API response:', data); // Debug log
      const candidate = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message || data?.choices?.[0]?.text;
      if (candidate && typeof candidate === "string" && candidate.trim()) {
        console.log('Successfully refined prompt using OpenRouter');
        return candidate.trim();
      }
    } catch (e) {
      // fall through to Gemini/local
      console.warn("OpenRouter refine failed, falling back:", e);
    }
  }

  // If OpenRouter isn't available, try Gemini if a key was passed in
  if (hasGeminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Refine this user prompt for clarity, completeness, and better AI understanding, without changing its meaning:\n\n"${userInput}"`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          data?.candidates?.[0]?.content?.text ||
          data?.outputText ||
          data?.result?.[0]?.output ||
          null;
        if (candidateText) return candidateText;
      }
    } catch (err) {
      console.warn("Gemini refine failed, falling back:", err);
    }
  }

  // Final fallback: local refinement
  return localRefine(userInput);
}
