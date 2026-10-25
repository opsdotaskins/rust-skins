import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema, ensureDb } from "@/lib/db";
import { forgotSchema } from "@/lib/validation";
import { randomToken } from "@/lib/auth";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import { SITE } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);
  // Always return ok to avoid leaking which emails exist.
  if (!parsed.success) return NextResponse.json({ ok: true });

  await ensureDb();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, parsed.data.email.toLowerCase()))
    .limit(1);

  if (user) {
    const token = randomToken();
    await db.insert(schema.tokens).values({
      userId: user.id,
      token,
      purpose: "reset",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });
    const resetUrl = `${SITE.url}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your rust-skins.com password",
      html: passwordResetEmail(user.firstName, resetUrl),
    }).catch((e) => console.error("Reset email failed:", e));
  }

  return NextResponse.json({ ok: true });
}
