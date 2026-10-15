# Connecting CollabAI to Firebase

CollabAI is wired for real sign-in and real data, but it needs **your own
Firebase project's keys** to do it — nobody else can generate those for you.
Everything below takes about 10 minutes.

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and
   **Add project**. Name it anything (e.g. `collabai-vnrvjiet`).
2. You can decline Google Analytics — not needed here.

## 2. Register a Web app

1. In the project overview, click the **</>** (Web) icon to add a web app.
2. Give it a nickname (e.g. `CollabAI web`) — you don't need Firebase Hosting.
3. Firebase shows you a `firebaseConfig` object. Copy its values into
   `.env.local` (copy `.env.local.example` to `.env.local` first):

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

## 3. Turn on Google sign-in

1. In the console, go to **Build → Authentication → Sign-in method**.
2. Enable the **Google** provider and save.
3. Under **Authentication → Settings → Authorized domains**, add the domain(s)
   you'll run the app on (`localhost` is already there for local dev; add
   your Vercel/production domain once you deploy).

> **Why only @vnrvjiet.in emails can sign in:** the app does **not** rely on
> Google alone to restrict this. After every sign-in, `lib/AuthContext.tsx`
> checks the signed-in email and immediately signs the user back out if it
> doesn't end in `@vnrvjiet.in` — so this works even though the project
> itself isn't a Google Workspace org. (If VNR VJIET's student email *is*
> on Google Workspace, the `hd` hint in `lib/firebase.ts` also pre-filters
> Google's account chooser, but the hard check is the sign-out logic, not
> that hint.)

## 4. Turn on Firestore

1. Go to **Build → Firestore Database → Create database**.
2. Choose **Production mode** (the app ships its own security rules — see
   below) and pick any region close to your users.

## 5. Deploy the security rules

The repo includes `firestore.rules`, which restricts every read/write to
signed-in `@vnrvjiet.in` users. Deploy it with the Firebase CLI:

```bash
npm install -g firebase-tools   # if you don't have it
firebase login
firebase use --add               # pick your project, give it an alias
firebase deploy --only firestore:rules
```

(Until you deploy rules, Firestore's default "production mode" rules deny
all access, so sign-in will work but reads/writes will fail — deploying
these rules is what turns the lights on.)

## 6. Add AI keys (optional but recommended)

Both the "✦ Polish with AI" writer and the automatic "Why this fits" project
recommendations work out of the box with a built-in local engine — no key
required. Add either of these to `.env.local` to upgrade them to a real LLM:

```
GEMINI_API_KEY=...     # get one free at https://aistudio.google.com/apikey
OPENAI_API_KEY=...     # used if GEMINI_API_KEY isn't set
```

Gemini is tried first, then OpenAI, then the local fallback — you never need
to set up both.

## 7. Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, sign in with a `@vnrvjiet.in` Google account,
and you're in. The first person to open **Discover** seeds a handful of
example projects into Firestore automatically so the page isn't empty —
real content takes over from there as people post and join.

## Notes on scope

This is a course/lab project, not a hardened production system — a few
deliberate simplifications, called out in `firestore.rules` and
`lib/AppState.tsx`:

- Any signed-in student can update any project document (needed so a
  project head can accept a join request from the client). A production
  version would move accept/decline into a Cloud Function that checks
  `project.authorId` server-side.
- There's no admin role or moderation — anyone with a `@vnrvjiet.in` email
  can post, chat, and request to join.
- File/image "attachments" in chat store only the file's name, not its
  bytes (no Firebase Storage upload yet) — wiring that in is a natural next
  step once the rest is running.
