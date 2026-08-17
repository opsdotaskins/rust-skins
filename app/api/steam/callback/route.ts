import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema, ensureDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { verifyCallback, getPlayerSummary } from "@/lib/steam";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/account", url.origin));
  }

  const steamId = await verifyCallback(url.searchParams);
  if (!steamId) {
    return NextResponse.redirect(new URL("/account?steam=error", url.origin));
  }

  const profile = await getPlayerSummary(steamId);

  await ensureDb();
  await db
    .update(schema.users)
    .set({
      steamId,
      steamName: profile?.personaName ?? null,
      steamAvatar: profile?.avatar ?? null,
    })
    .where(eq(schema.users.id, user.id));

  return NextResponse.redirect(new URL("/account?steam=linked", url.origin));
}
