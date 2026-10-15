import { NextResponse } from "next/server";

function localPolish(input: string) {
  const clean = input
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[a-z]/, (letter) => letter.toUpperCase())
    .replace(/[.!?]$/, "");
  const lead = clean.toLowerCase().startsWith("people") || clean.toLowerCase().startsWith("students")
    ? "This project addresses a gap where "
    : "This project responds to the challenge that ";
  return `${lead}${clean.charAt(0).toLowerCase()}${clean.slice(1)}, creating a practical and inclusive path toward meaningful change.`;
}

const SYSTEM_PROMPT =
  "Rewrite project problem statements in a concise, professional, human tone. Return one paragraph only; preserve the original meaning and do not invent facts.";

async function polishWithGemini(text: string, apiKey: string): Promise<string> {
  const candidateModels = Array.from(
    new Set([process.env.GEMINI_MODEL, "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.8-flash"].filter(Boolean))
  ) as string[];

  let lastError: Error | null = null;
  for (const model of candidateModels) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nProblem statement:\n${text}` }] }],
          generationConfig: { temperature: 0.45 },
        }),
      });
      if (!response.ok) {
        lastError = new Error(`Gemini (${model}) responded ${response.status}`);
        continue;
      }
      const data = await response.json();
      const polished = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (polished) return polished;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("Empty Gemini response");
}

async function polishWithOpenAi(text: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.45,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI responded ${response.status}`);
  const data = await response.json();
  const polished = data?.choices?.[0]?.message?.content?.trim();
  if (!polished) throw new Error("Empty OpenAI response");
  return polished;
}

export async function POST(request: Request) {
  const { text } = await request.json();
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "A problem statement is required." }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      return NextResponse.json({ text: await polishWithGemini(text, geminiKey), source: "llm" });
    } catch {
      /* fall through to the next provider */
    }
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    try {
      return NextResponse.json({ text: await polishWithOpenAi(text, openAiKey), source: "llm" });
    } catch {
      /* The local writer below keeps the product usable when no provider can be reached. */
    }
  }

  return NextResponse.json({ text: localPolish(text), source: "local" });
}
