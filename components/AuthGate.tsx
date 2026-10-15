"use client";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/AuthContext";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/firebase";
import { Button } from "@/components/ui";

/** Renders the app for signed-in @vnrvjiet.in users, and a sign-in screen for everyone else. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, error, firebaseConfigured, signInWithGoogle, clearError } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="eyebrow animate-pulse">Loading CollabAI…</p>
      </div>
    );
  }

  if (!firebaseConfigured) {
    return (
      <section className="mx-auto max-w-xl px-5 py-24 text-center md:px-8">
        <p className="eyebrow">Setup needed</p>
        <h1 className="mt-3 font-display text-4xl tracking-editorial md:text-5xl">
          Connect your Firebase project.
        </h1>
        <p className="mt-5 leading-7 text-muted">
          CollabAI signs people in with their <b>@{ALLOWED_EMAIL_DOMAIN}</b> college email through
          Firebase. Copy <code className="rounded bg-cream px-1.5 py-0.5 text-sm">.env.local.example</code>{" "}
          to <code className="rounded bg-cream px-1.5 py-0.5 text-sm">.env.local</code>, add your
          Firebase web app keys, and restart the dev server. See{" "}
          <code className="rounded bg-cream px-1.5 py-0.5 text-sm">SETUP.md</code> for the full walkthrough.
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center md:px-8">
        <p className="eyebrow">Welcome to CollabAI</p>
        <h1 className="mt-3 font-display text-5xl tracking-editorial md:text-6xl">
          Good ideas need good company.
        </h1>
        <p className="mt-5 max-w-md leading-7 text-muted">
          Sign in with your VNR&nbsp;VJIET college email to discover projects, get matched with
          collaborators, and start building.
        </p>
        {error && (
          <p className="mt-6 max-w-md rounded-xl border border-terra/30 bg-terra-pale px-4 py-3 text-sm font-medium text-terra-dark">
            {error}
          </p>
        )}
        <Button className="mt-8" onClick={() => { clearError(); void signInWithGoogle(); }}>
          Sign in with Google (@{ALLOWED_EMAIL_DOMAIN}) →
        </Button>
        <p className="mt-4 text-xs text-muted">Only emails ending in @{ALLOWED_EMAIL_DOMAIN} can access CollabAI.</p>
      </section>
    );
  }

  return <>{children}</>;
}
