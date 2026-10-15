"use client";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";
import { projects as seedProjects, type Message, type Profile, type Project, type Request } from "./mockData";

type AppStateValue = {
  currentProfileId: string;
  projects: Project[];
  profiles: Profile[];
  requests: Request[];
  messages: Message[];
  /** True until the first snapshot of every collection has arrived. */
  loading: boolean;
  addProject: (project: Project) => Promise<void>;
  addRequest: (request: Request) => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  resolveRequest: (requestId: string, decision: "accepted" | "declined") => Promise<void>;
  sendMessage: (message: Message) => Promise<void>;
};

const AppState = createContext<AppStateValue | undefined>(undefined);

/** Strips the local `id` field before writing a record's body to its Firestore doc. */
function withoutId<T extends { id: string }>(value: T): Omit<T, "id"> {
  const { id, ...rest } = value;
  return rest;
}

/** Firestore rejects explicit `undefined` values (unlike a missing key), so strip them before writing. */
function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  const clean = { ...value };
  for (const key of Object.keys(clean)) if (clean[key] === undefined) delete clean[key];
  return clean;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}

/**
 * Firestore-backed data source for the product. Keeps the exact context shape
 * the UI already expects (see mockData.ts for the record types) so every page
 * built against useAppState() works unchanged — only where the data lives
 * changed, from an in-memory seed array to live Firestore collections.
 */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [readyCount, setReadyCount] = useState(0);
  const loading = readyCount < 4;
  const hasSeeded = useRef(false);
  const hasEnsuredProfile = useRef<string | null>(null);

  const markReady = () => setReadyCount((count) => Math.min(4, count + 1));

  useEffect(() => {
    const unsubProjects = onSnapshot(query(collection(db, "projects"), orderBy("createdAt", "desc")), (snap) => {
      setProjects(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, "id">) })));
      markReady();
    });
    const unsubProfiles = onSnapshot(collection(db, "profiles"), (snap) => {
      setProfiles(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Profile, "id">) })));
      markReady();
    });
    const unsubRequests = onSnapshot(collection(db, "requests"), (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Request, "id">) })));
      markReady();
    });
    const unsubMessages = onSnapshot(query(collection(db, "messages"), orderBy("sentAt", "asc")), (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) })));
      markReady();
    });
    return () => {
      unsubProjects();
      unsubProfiles();
      unsubRequests();
      unsubMessages();
    };
  }, []);

  // First-run convenience only: if a brand-new Firestore database has no
  // projects yet, seed the example projects so Discover isn't empty. Checked
  // directly against Firestore (not local state) and guarded by a ref so it
  // can only ever fire once per session, and never once real projects exist.
  useEffect(() => {
    if (loading || hasSeeded.current) return;
    hasSeeded.current = true;
    (async () => {
      const snap = await getDocs(collection(db, "projects"));
      if (!snap.empty) return;
      await Promise.all(
        seedProjects.map((project) =>
          setDoc(doc(db, "projects", project.id), {
            ...withoutId(project),
            authorId: null,
            memberIds: [],
            members: 0,
            createdAt: Date.now(),
          })
        )
      );
    })();
  }, [loading]);

  // Make sure every signed-in user has a profile document, seeded from their
  // Google account, the first time they arrive.
  useEffect(() => {
    if (!user || hasEnsuredProfile.current === user.uid) return;
    hasEnsuredProfile.current = user.uid;
    const ref = doc(db, "profiles", user.uid);
    getDoc(ref).then((snap) => {
      if (snap.exists()) return;
      const name = user.displayName || user.email?.split("@")[0] || "New member";
      const defaultProfile: Omit<Profile, "id"> = {
        name,
        initials: initialsFor(name),
        role: "VNR VJIET student",
        location: "Hyderabad, IN",
        bio: "New to CollabAI — add a bio and a few skills so collaborators know what you're great at.",
        skills: [],
        color: "#B65134",
        photo: user.photoURL || "",
        department: "",
        year: "",
        skillLevels: [],
        interests: [],
        experience: [],
        achievements: [],
        availability: "Open to collaborate",
      };
      setDoc(ref, defaultProfile);
    });
  }, [user]);

  const addProject = async (project: Project) => {
    await setDoc(doc(db, "projects", project.id), { ...withoutId(project), createdAt: Date.now() });
  };

  const addRequest = async (request: Request) => {
    await setDoc(doc(db, "requests", request.id), withoutId(request));
  };

  const updateProfile = async (profile: Profile) => {
    await setDoc(doc(db, "profiles", profile.id), withoutId(profile), { merge: true });
  };

  const resolveRequest = async (requestId: string, decision: "accepted" | "declined") => {
    const request = requests.find((item) => item.id === requestId);
    if (!request) return;
    await updateDoc(doc(db, "requests", requestId), { status: decision });
    if (decision !== "accepted") return;
    const project = projects.find((item) => item.id === request.projectId);
    if (project && !project.memberIds.includes(request.profileId)) {
      await updateDoc(doc(db, "projects", project.id), {
        memberIds: arrayUnion(request.profileId),
        members: project.members + 1,
        needed: Math.max(0, project.needed - 1),
      });
    }
    await updateDoc(doc(db, "profiles", request.profileId), { availability: "Collaborating" });
  };

  const sendMessage = async (message: Message) => {
    await setDoc(doc(db, "messages", message.id), stripUndefined(withoutId(message)));
  };

  return (
    <AppState.Provider
      value={{
        currentProfileId: user?.uid ?? "",
        projects,
        profiles,
        requests,
        messages,
        loading,
        addProject,
        addRequest,
        updateProfile,
        resolveRequest,
        sendMessage,
      }}
    >
      {children}
    </AppState.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppState);
  if (!value) throw new Error("useAppState must be used inside AppStateProvider");
  return value;
}
