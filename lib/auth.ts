import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db, schema, ensureDb } from "./db";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "rv_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me"
);

export interface SessionPayload {
  userId: number;
  email: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as number, email: payload.email as string };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  await ensureDb();
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);
  return rows[0] ?? null;
}

export function randomToken(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- Pending Steam sign-in ----------
// A visitor who signs in with a Steam account that is not linked to any
// rust-skins.com account yet: we keep the verified SteamID in a short-lived
// signed cookie, send them to /register, and link it when the account is made.

const PENDING_STEAM_COOKIE = "rv_pending_steam";

export interface PendingSteam {
  steamId: string;
  steamName: string | null;
  steamAvatar: string | null;
}

export async function setPendingSteam(p: PendingSteam) {
  const token = await new SignJWT({ ...p, kind: "pending-steam" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secret);
  const store = await cookies();
  store.set(PENDING_STEAM_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30,
  });
}

export async function getPendingSteam(): Promise<PendingSteam | null> {
  const store = await cookies();
  const token = store.get(PENDING_STEAM_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.kind !== "pending-steam" || typeof payload.steamId !== "string") return null;
    return {
      steamId: payload.steamId,
      steamName: (payload.steamName as string | null) ?? null,
      steamAvatar: (payload.steamAvatar as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function clearPendingSteam() {
  const store = await cookies();
  store.delete(PENDING_STEAM_COOKIE);
}
