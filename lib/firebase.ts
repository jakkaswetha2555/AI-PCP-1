import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { GoogleAuthProvider, getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * CollabAI is restricted to the VNR VJIET community: every sign-in must use a
 * college address ending in this domain. Enforced again (defense in depth) in
 * lib/AuthContext.tsx and in firestore.rules.
 */
export const ALLOWED_EMAIL_DOMAIN = "vnrvjiet.in";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True once real Firebase keys have been dropped into .env.local. */
export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// getAuth()/getFirestore() validate their config eagerly and throw the
// moment they're called with a missing/placeholder apiKey — which would
// otherwise crash every page (via module import) and `next build`'s static
// prerender before .env.local is ever filled in. So these only really
// initialize once real keys are present; everywhere else in the app only
// touches `auth`/`db` after checking `firebaseConfigured` (AuthGate keeps
// unconfigured sessions on the setup screen, so this is never dereferenced
// for real before that check passes).
let auth: Auth;
let db: Firestore;
if (firebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  auth = null as unknown as Auth;
  db = null as unknown as Firestore;
}
export { auth, db };

// Hints Google's account chooser toward the college Workspace domain. This is
// a UX nicety only — it does not by itself block other emails, which is why
// AuthContext re-checks the signed-in email before accepting the session.
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ hd: ALLOWED_EMAIL_DOMAIN });

export function isAllowedCollegeEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`));
}
