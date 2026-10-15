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
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setError("We couldn't sign you in just now. Please try again.");
      }
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
