import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type, authorization",
      },
    });
  }

  const { entryText } = await req.json();

  const systemPrompt = "You are Loop — a journal companion. You write like a wise, warm friend who listens carefully and reflects back what they hear. Read what the person wrote, and respond in 2-3 sentences. Acknowledge what's true. Ask one genuine question. Avoid platitudes, advice, or clinical language. Sound human, never therapeutic.";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: entryText }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 1000,
          thinkingConfig: { thinkingBudget: 0 }
        }
      }),
    }
  );

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});