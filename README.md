# CollabAI

**A good idea needs good company.** CollabAI is a web platform for the VNR VJIET community to post project ideas, discover ones worth joining, and get matched with collaborators whose skills and interests actually fit — with a few small, honest touches of AI along the way.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Firebase** (Authentication + Firestore).

## What it does

- **Discover & post projects** — Browse projects by domain, stage, and skills needed, or post your own with a short form.
- **Skill-aware matching** — A deterministic scoring model (`projectMatchScore`) ranks every profile against every open project across required skills (60%), domain interest (25%), availability (10%), and open team capacity (5%), producing a live match percentage.
- **Natural-language search** — Type something like *"climate projects needing data skills"* and the search engine parses domain terms and keywords to return relevant results, no filters required.
- **"Why this fits" recommendations** — The Discover page's recommendation rail calls an AI endpoint that writes one honest sentence per suggested project explaining the match, using your real skill/interest overlap — never inventing skills you don't have.
- **"Polish with AI" writing assistant** — Turn a rough project description into a clearer, more structured problem statement with one click.
- **Team requests & in-project chat** — Request to join a project, have the project lead accept or decline, and chat with your team once you're in.
- **Profiles** — Skills, skill levels, interests, experience, and availability, all factored into matching.
- Both AI features try **Gemini** first, fall back to **OpenAI**, and fall back again to a built-in local engine — so the app is fully usable with no API key at all.
- **Restricted sign-in** — Google sign-in is limited to `@vnrvjiet.in` addresses, enforced in the client, and again at the database layer via Firestore security rules.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication (Google sign-in, domain-restricted) |
| Database | Cloud Firestore |
| AI | Gemini → OpenAI → local rule-based fallback (both optional) |

## Project structure

```
app/
  page.tsx                  # Landing page
  about/                    # How CollabAI works
  projects/                 # Discover, project detail, new project form
  projects/[id]/chat/       # In-project team chat
  profile/                  # View & edit profile
  api/polish/               # AI writing assistant endpoint
  api/recommend/            # AI "why this fits" endpoint
components/                 # Shared UI (cards, modals, buttons, auth gate)
lib/
  AppState.tsx               # App-wide data/state (projects, requests, messages)
  AuthContext.tsx             # Firebase auth + @vnrvjiet.in enforcement
  ai.ts                        # Local match-scoring & smart search logic
  firebase.ts                   # Firebase client setup
  mockData.ts                    # Shared types + seed/demo data
firestore.rules               # Database security rules
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Firebase

This project needs its own Firebase project to run (for sign-in and data storage). **[SETUP.md](./SETUP.md) walks through the whole process in about 10 minutes** — creating the Firebase project, enabling Google sign-in, turning on Firestore, and deploying the included security rules.

At minimum, create a `.env.local` in the project root with your Firebase web app config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. (Optional) Add AI keys

Both AI features work out of the box with a local fallback engine — no key required. To upgrade them to a real LLM, add either to `.env.local`:

```bash
GEMINI_API_KEY=...     # free tier available at https://aistudio.google.com/apikey
OPENAI_API_KEY=...     # used only if GEMINI_API_KEY isn't set
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with a `@vnrvjiet.in` Google account.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build for production |
| `npm start` | Serve the production build |
| `npm run lint` | Run Next.js/ESLint checks |

## Scope & known simplifications

This is a course/lab project, not a hardened production system. A few deliberate simplifications (detailed further in `firestore.rules` and `lib/AppState.tsx`):

- Any signed-in student can update any project document, so a project lead can accept/decline join requests client-side. A production version would move that into a server-side Cloud Function.
- There's no admin role or moderation layer.
- Chat attachments currently store only the file name, not the file's bytes (no Firebase Storage upload wired in yet).

See [SETUP.md](./SETUP.md) for full configuration details and rationale.

## License

No license specified yet — all rights reserved by the author unless stated otherwise.
