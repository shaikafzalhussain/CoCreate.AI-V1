import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, mode, images } = await req.json();
    // Use the provided API key directly
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AIzaSyB9FyGQqUElSWe11_YmyTUOCb09rJdHofg";

    // System prompts based on mode
    const systemPrompts = {
      story: "You are a creative storytelling assistant. Continue the user's story with vivid descriptions, engaging dialogue, and compelling narrative. Match their tone and style while adding creative elements.",
      idea: "You are an innovation brainstorming partner. Expand on the user's ideas with fresh perspectives, practical applications, and creative solutions. Think big but keep it actionable.",
      tutor: "You are a patient and knowledgeable educational assistant. Help explain concepts clearly, provide examples, and guide learning. Make complex topics accessible and engaging.",
    };

    const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.story;

    // Determine which model to use based on whether images are present
    const hasImages = images && Array.isArray(images) && images.length > 0;
    // Use gemini-1.5-flash for both text and images (works with v1beta API)
    const model = "gemini-1.5-flash";
    
    // Build parts array
    const parts: any[] = [];
    
    // Add images if present
    if (hasImages) {
      for (const imageData of images) {
        parts.push({
          inline_data: {
            mime_type: imageData.mimeType || "image/jpeg",
            data: imageData.data,
          },
        });
      }
    }
    
    // Add text prompt
    parts.push({
      text: `${systemPrompt}\n\nUser input: ${prompt}\n\nContinue or expand on this thoughtfully:`,
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: parts,
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error in ai-cocreate function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
