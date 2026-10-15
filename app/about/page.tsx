"use client";
import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-content px-5 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">How CollabAI Works</p>
        <h1 className="mt-3 font-display text-5xl tracking-editorial md:text-6xl">
          AI tuned for human collaboration.
        </h1>
        
        {/* 30-Second Judge Explanation Callout Card */}
        <Card className="mt-8 border-terra/30 bg-terra-pale/40 p-6 md:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-terra">
            <span>✦</span> 30-Second Judge Summary
          </div>
          <p className="mt-4 text-base leading-8 font-medium text-ink md:text-lg">
            CollabAI replaces noisy job boards with intelligent matching. A deterministic engine scores project-to-collaborator compatibility across skills, domain interests, and working availability, then a generative model (Gemini, with OpenAI and a rule-based engine as fallbacks) explains each recommendation in plain English — automatically, with nothing to click. It features natural language intent search to translate informal queries into exact project fits, an integrated writing assistant that refines raw project drafts into clear, actionable problem statements, and sign-in restricted to the VNR VJIET community via Firebase.
          </p>
        </Card>

        {/* Feature Breakdown */}
        <div className="mt-12 space-y-8">
          <div className="border-t border-line pt-8">
            <span className="font-display text-2xl text-terra">01</span>
            <h2 className="mt-2 font-display text-3xl tracking-editorial text-ink">
              Multi-Dimensional Match Scoring
            </h2>
            <p className="mt-3 leading-7 text-muted">
              Our match algorithm (<code className="rounded bg-cream px-2 py-1 text-xs text-terra font-mono">projectMatchScore</code>) calculates compatibility across four weighted vectors: required skills coverage (up to 60%), domain interest alignment (25%), active working availability (10%), and open team capacity (5%). This produces real-time personalized match percentages for every profile-project pairing.
            </p>
          </div>

          <div className="border-t border-line pt-8">
            <span className="font-display text-2xl text-terra">02</span>
            <h2 className="mt-2 font-display text-3xl tracking-editorial text-ink">
              Smart Intent & Natural Language Search
            </h2>
            <p className="mt-3 leading-7 text-muted">
              Users can search using plain expressions (e.g., <em>"climate projects needing data skills"</em>). The search engine normalizes stop words, extracts domain taxonomy terms, and scans project titles, summaries, and tech stacks to deliver contextually accurate matches.
            </p>
          </div>

          <div className="border-t border-line pt-8">
            <span className="font-display text-2xl text-terra">03</span>
            <h2 className="mt-2 font-display text-3xl tracking-editorial text-ink">
              Generative Idea Polish
            </h2>
            <p className="mt-3 leading-7 text-muted">
              When creating a project, authors can click <strong>✦ Polish with AI</strong>. The system passes raw initial thoughts to an LLM endpoint (with a resilient local text formatter fallback) to refine problem statements into structured, compelling invitations.
            </p>
          </div>

          <div className="border-t border-line pt-8">
            <span className="font-display text-2xl text-terra">04</span>
            <h2 className="mt-2 font-display text-3xl tracking-editorial text-ink">
              Auto-Generated Match Reasoning
            </h2>
            <p className="mt-3 leading-7 text-muted">
              Every time Discover loads, the "Recommended for you" rail quietly calls <code className="rounded bg-cream px-2 py-1 text-xs text-terra font-mono">/api/recommend</code>, which hands your profile and the top-ranked projects to Gemini (falling back to OpenAI, then to a rule-based explainer) and asks for one honest sentence per project on why it fits — no button, nothing to request, it's just there.
            </p>
          </div>

          <div className="border-t border-line pt-8">
            <span className="font-display text-2xl text-terra">05</span>
            <h2 className="mt-2 font-display text-3xl tracking-editorial text-ink">
              A Real, Signed-In Community
            </h2>
            <p className="mt-3 leading-7 text-muted">
              CollabAI is restricted to the VNR&nbsp;VJIET community: sign-in runs through Firebase Authentication and only accepts college addresses ending in <code className="rounded bg-cream px-2 py-1 text-xs text-terra font-mono">@vnrvjiet.in</code>. Every project, profile, request, and chat message is stored live in Firestore — this is the real product, not a mock-data demo.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-line pt-8">
          <Link href="/projects">
            <Button>Explore Projects →</Button>
          </Link>
          <Link href="/projects/new">
            <Button variant="secondary">Create a Project</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
