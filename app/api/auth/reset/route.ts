import { NextResponse } from "next/server";
import { and, eq, isNull, gt } from "drizzle-orm";
import { db, schema, ensureDb } from "@/lib/db";
import { resetSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors.password?.[0] || "Invalid request" },
      { status: 400 }
    );
  }
  const { token, password } = parsed.data;

  await ensureDb();
  const [row] = await db
    .select()
    .from(schema.tokens)
    .where(
      and(
        eq(schema.tokens.token, token),
        eq(schema.tokens.purpose, "reset"),
        isNull(schema.tokens.usedAt),
        gt(schema.tokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!row) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired" },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  await db.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, row.userId));
  await db.update(schema.tokens).set({ usedAt: new Date() }).where(eq(schema.tokens.id, row.id));

  return NextResponse.json({ ok: true });
}
