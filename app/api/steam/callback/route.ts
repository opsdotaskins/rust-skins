import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db, schema, ensureDb } from "@/lib/db";
import { getCurrentUser, createSession, setPendingSteam } from "@/lib/auth";
import { verifyCallback, getPlayerSummary, steamCallbackUrl } from "@/lib/steam";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = await getCurrentUser();

  const steamId = await verifyCallback(url.searchParams, steamCallbackUrl(url.origin));
  if (!steamId) {
    const dest = user ? "/dashboard/steam?steam=error" : "/login?steam=error";
    return NextResponse.redirect(new URL(dest, url.origin));
  }

  const profile = await getPlayerSummary(steamId);
  const steamName = profile?.personaName ?? null;
  const steamAvatar = profile?.avatar ?? null;

  await ensureDb();

  // ── Linking mode: attach this SteamID to the signed-in user. ──
  if (user) {
    const [taken] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(and(eq(schema.users.steamId, steamId), ne(schema.users.id, user.id)))
      .limit(1);
    if (taken) {
      return NextResponse.redirect(new URL("/dashboard/steam?steam=taken", url.origin));
    }
    await db
      .update(schema.users)
      .set({ steamId, steamName, steamAvatar })
      .where(eq(schema.users.id, user.id));
    return NextResponse.redirect(new URL("/dashboard/steam?steam=linked", url.origin));
  }

  // ── Sign-in mode: log in the account this SteamID is linked to. ──
  const [owner] = await db
    .select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.steamId, steamId))
    .limit(1);
  if (owner) {
    if (profile) {
      await db
        .update(schema.users)
        .set({ steamName, steamAvatar })
        .where(eq(schema.users.id, owner.id));
    }
    await createSession({ userId: owner.id, email: owner.email });
    return NextResponse.redirect(new URL("/dashboard", url.origin));
  }

  // New SteamID: the store needs a full profile (email, address, 18+), so the
  // visitor completes registration and the Steam account is linked on create.
  await setPendingSteam({ steamId, steamName, steamAvatar });
  return NextResponse.redirect(new URL("/register?steam=1", url.origin));
}
