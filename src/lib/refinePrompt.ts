export async function refinePrompt(userInput: string, accessToken: string): Promise<string> {
  const response = await fetch("/api/openrouter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      purpose: "refine",
      messages: [
        { role: "system", content: "Improve the user's prompt for clarity, specificity, and usefulness while preserving intent. Return only the refined prompt." },
        { role: "user", content: userInput },
      ],
      temperature: 0.4,
      max_tokens: 800,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || result.error || "Prompt refinement is unavailable. Please try again.");
  const refined = result.choices?.[0]?.message?.content;
  if (typeof refined !== "string" || !refined.trim()) throw new Error("The refiner returned an empty prompt. Please try again.");
  return refined.trim();
}
