"use client";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, firebaseConfigured, googleProvider, isAllowedCollegeEmail } from "./firebase";

type AuthValue = {
  user: User | null;
  /** True while Firebase is still reporting the initial auth state. */
  loading: boolean;
  /** Set when a sign-in was rejected (wrong domain, popup closed, etc.). */
  error: string | null;
  firebaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

const WRONG_DOMAIN_MESSAGE =
  "CollabAI is only open to the VNR VJIET community — please sign in with your college email ending in @vnrvjiet.in.";

/**
 * Maps a Firebase Auth error code to a message a non-technical user can act
 * on. Most of these can only happen because of a Firebase Console / Vercel
 * misconfiguration (not something the user did), so the message says what's
 * wrong rather than just "try again" — that's the whole point of this map.
 */
function messageForAuthError(code: string | undefined): string | null {
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      // The user closed the popup themselves — not an error worth showing.
      return null;
    case "auth/unauthorized-domain":
      return "Sign-in is blocked because this site's domain isn't on the allow-list yet. " +
        "In the Firebase Console, go to Authentication → Settings → Authorized domains and add this domain.";
    case "auth/operation-not-allowed":
      return "Google sign-in isn't turned on for this Firebase project yet. " +
        "In the Firebase Console, go to Authentication → Sign-in method and enable the Google provider.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
    case "auth/network-request-failed":
      return "Network error while signing in. Check your connection and try again.";
    case "auth/internal-error":
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      return "Firebase rejected this request (invalid project configuration). " +
        "Double-check the NEXT_PUBLIC_FIREBASE_* values set for this deployment.";
    default:
      return code
        ? `We couldn't sign you in just now (${code}). Please try again.`
        : "We couldn't sign you in just now. Please try again.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser && !isAllowedCollegeEmail(nextUser.email)) {
        // Someone authenticated with a non-college Google account. Reject the
        // session immediately rather than letting them see any app data.
        await firebaseSignOut(auth);
        setUser(null);
        setError(WRONG_DOMAIN_MESSAGE);
        setLoading(false);
        return;
      }
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!firebaseConfigured) {
      setError("Firebase isn't configured yet — add your project keys to .env.local first.");
      return;
    }
    setError(null);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      if (!isAllowedCollegeEmail(credential.user.email)) {
        await firebaseSignOut(auth);
        setUser(null);
        setError(WRONG_DOMAIN_MESSAGE);
      }
    } catch (err) {
      const code = (err as { code?: string })?.code;
      // Surfaced in prod too (not just dev) — this is what makes a
      // misconfigured authorized-domain/provider diagnosable without
      // needing someone to open devtools on the deployed site.
      console.error("[CollabAI] Google sign-in failed:", code, err);
      const message = messageForAuthError(code);
      if (message) setError(message);
    }
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, firebaseConfigured, signInWithGoogle, signOutUser, clearError: () => setError(null) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
