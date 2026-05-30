import { create } from "zustand";
import { play } from "./lib/sound";

// ---------------------------------------------------------------------------
// AUTH (mock / frontend-only for now).
// Persists a fake session to localStorage so the app remembers you across
// reloads. NO real credential checking — any valid-looking input "works".
//
// LATER (backend wiring): replace the mock register/login with real calls to
// the backend (Neon Postgres `users` + `sessions` tables, hashed passwords,
// JWT/session cookie). Keep this store's shape so views don't change. See
// server/DATABASE_NOTES.md.
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  plan: "Starter" | "Pro" | "Agency";
  avatarSeed: string; // used to generate a deterministic gradient avatar
  isAdmin: boolean;
}

type AuthStatus = "anonymous" | "authenticated";

// Emails that get admin / super-admin rights (docs visibility + scheduling).
const ADMIN_EMAILS = ["shahriarseam17@gmail.com"];
function computeIsAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

interface AuthStore {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  loginAsGuest: () => void;
  logout: () => void;
}

const STORAGE_KEY = "ainigma.auth.user";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function uid() {
  return `u_${Math.random().toString(36).slice(2, 10)}`;
}

const existing = loadUser();

export const useAuth = create<AuthStore>((set) => ({
  status: existing ? "authenticated" : "anonymous",
  user: existing,

  login: (email, password) => {
    if (!emailRe.test(email)) return { ok: false, error: "Enter a valid email address." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    const user: User = {
      id: uid(),
      name: email.split("@")[0].replace(/[._]/g, " "),
      email,
      plan: "Pro",
      avatarSeed: email,
      isAdmin: computeIsAdmin(email),
    };
    saveUser(user);
    play("success");
    set({ status: "authenticated", user });
    return { ok: true };
  },

  register: (name, email, password) => {
    if (name.trim().length < 2) return { ok: false, error: "Tell us your name." };
    if (!emailRe.test(email)) return { ok: false, error: "Enter a valid email address." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    const user: User = { id: uid(), name: name.trim(), email, plan: "Starter", avatarSeed: email, isAdmin: computeIsAdmin(email) };
    saveUser(user);
    play("success");
    set({ status: "authenticated", user });
    return { ok: true };
  },

  loginAsGuest: () => {
    const user: User = {
      id: uid(),
      name: "Guest",
      email: "guest@aignis.ai",
      plan: "Starter",
      avatarSeed: `guest-${Date.now()}`,
      isAdmin: false,
    };
    saveUser(user);
    play("tick");
    set({ status: "authenticated", user });
  },

  logout: () => {
    saveUser(null);
    play("tick");
    set({ status: "anonymous", user: null });
  },
}));

/** Deterministic gradient avatar from a seed string. */
export function avatarGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const h2 = (h + 60) % 360;
  return `linear-gradient(135deg, hsl(${h} 80% 60%), hsl(${h2} 75% 55%))`;
}
