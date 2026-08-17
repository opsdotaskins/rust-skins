import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema, ensureDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseTradeUrl } from "@/lib/steam";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const tradeUrl = typeof body?.tradeUrl === "string" ? body.tradeUrl : "";
  const parsed = parseTradeUrl(tradeUrl);
  if (!parsed) {
    return NextResponse.json(
      { error: "Enter a valid Steam trade URL (with partner and token)." },
      { status: 400 }
    );
  }

  await ensureDb();
  await db
    .update(schema.users)
    .set({ steamTradeToken: parsed.token })
    .where(eq(schema.users.id, user.id));

  return NextResponse.json({ ok: true, token: parsed.token });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  await ensureDb();
  await db
    .update(schema.users)
    .set({ steamId: null, steamName: null, steamAvatar: null, steamTradeToken: null })
    .where(eq(schema.users.id, user.id));
  return NextResponse.json({ ok: true });
}
