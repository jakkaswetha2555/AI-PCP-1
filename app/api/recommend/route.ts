import { NextResponse } from "next/server";

type ProfileSummary = { name: string; skills: string[]; interests: string[]; availability: string };
type Candidate = { id: string; title: string; summary: string; domain: string; skills: string[]; techStack: string[]; score: number };
type Body = { profile: ProfileSummary; candidates: Candidate[] };

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const overlap = (a: string[], b: string[]) =>
  a.filter((x) => b.some((y) => normalize(x) === normalize(y) || normalize(x).includes(normalize(y)) || normalize(y).includes(normalize(x))));

/** Deterministic fallback so recommendations always come with a reason, even with no AI key configured. */
function localReason(profile: ProfileSummary, project: Candidate): string {
  const sharedSkills = overlap(profile.skills, [...project.skills, ...project.techStack]);
  const sharedInterest = profile.interests.find(
    (interest) => normalize(interest).includes(normalize(project.domain)) || normalize(project.domain).includes(normalize(interest))
  );
  if (sharedSkills.length) {
    return `Strong fit — you bring ${sharedSkills.slice(0, 2).join(" and ")}, which this project is short on.`;
  }
  if (sharedInterest) {
    return `Matches your interest in ${project.domain.toLowerCase()}, and a good way to pick up ${project.skills[0] ?? "new skills"} alongside the team.`;
  }
  return `A stretch pick: fewer overlapping skills today, but an open team and a chance to grow into ${project.skills[0] ?? "something new"}.`;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse(fenced ? fenced[1] : text);
}

function buildPrompt(profile: ProfileSummary, candidates: Candidate[]): string {
  return [
    "You help a university project-collaboration platform explain AI project recommendations.",
    "Given one student profile and a short list of candidate projects (already ranked by a match score), write ONE short, specific, encouraging sentence per project explaining why it could be a good fit for this student.",
    "Base it on real overlap between their skills/interests and the project's skills/domain, or be honest that it's a stretch/growth pick when overlap is thin. Never invent skills the student doesn't have.",
    "Respond with ONLY a JSON object mapping each project id to its one-sentence reason — no markdown, no extra keys.",
    "",
    `Student: ${JSON.stringify(profile)}`,
    `Candidate projects: ${JSON.stringify(candidates.map(({ id, title, summary, domain, skills, techStack, score }) => ({ id, title, summary, domain, skills, techStack, score })))}`,
  ].join("\n");
}

async function geminiReasons(profile: ProfileSummary, candidates: Candidate[], apiKey: string): Promise<Record<string, string>> {
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
          contents: [{ parts: [{ text: buildPrompt(profile, candidates) }] }],
          generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
        }),
      });
      if (!response.ok) {
        lastError = new Error(`Gemini (${model}) responded ${response.status}`);
        continue;
      }
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text === "string" && text.trim()) {
        return extractJson(text) as Record<string, string>;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("Empty Gemini response");
}

async function openAiReasons(profile: ProfileSummary, candidates: Candidate[], apiKey: string): Promise<Record<string, string>> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Reply with only a JSON object mapping project id to a one-sentence match reason." },
        { role: "user", content: buildPrompt(profile, candidates) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI responded ${response.status}`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("Empty OpenAI response");
  return extractJson(text) as Record<string, string>;
}

/**
 * Auto-recommendations endpoint: the Discover page's deterministic match
 * scores (lib/ai.ts) decide WHICH projects to show; this route asks an LLM
 * (Gemini first, then OpenAI) to explain WHY each one is a good fit in plain
 * language, and falls back to a rule-based reason so the feature never
 * breaks when no key is configured or a provider is unreachable.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body?.profile || !Array.isArray(body.candidates) || !body.candidates.length) {
    return NextResponse.json({ error: "A profile and at least one candidate project are required." }, { status: 400 });
  }
  const candidates = body.candidates.slice(0, 6);
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const reasons = await geminiReasons(body.profile, candidates, geminiKey);
      return NextResponse.json({ reasons, source: "gemini" });
    } catch {
      /* fall through to the next provider */
    }
  }
  if (openAiKey) {
    try {
      const reasons = await openAiReasons(body.profile, candidates, openAiKey);
      return NextResponse.json({ reasons, source: "openai" });
    } catch {
      /* fall through to the local engine */
    }
  }
  const reasons = Object.fromEntries(candidates.map((project) => [project.id, localReason(body.profile, project)]));
  return NextResponse.json({ reasons, source: "local" });
}
