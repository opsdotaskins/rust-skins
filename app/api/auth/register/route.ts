import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema, ensureDb } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import {
  hashPassword,
  createSession,
  randomToken,
  getPendingSteam,
  clearPendingSteam,
} from "@/lib/auth";
import { sendEmail, registrationConfirmationEmail } from "@/lib/email";
import { SITE } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const data = parsed.data;

  await ensureDb();
  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, data.email.toLowerCase()))
    .limit(1);
  if (existing.length) {
    return NextResponse.json(
      { error: "An account with this email already exists", fields: { email: ["Email already registered"] } },
      { status: 409 }
    );
  }

  // Visitor came from "Sign in with Steam" with a SteamID not linked yet.
  const pendingSteam = await getPendingSteam();
  let steamFields = {};
  if (pendingSteam) {
    const [taken] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.steamId, pendingSteam.steamId))
      .limit(1);
    if (!taken) {
      steamFields = {
        steamId: pendingSteam.steamId,
        steamName: pendingSteam.steamName,
        steamAvatar: pendingSteam.steamAvatar,
      };
    }
  }

  const passwordHash = await hashPassword(data.password);
  const [user] = await db
    .insert(schema.users)
    .values({
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      street: data.street,
      city: data.city,
      country: data.country,
      postalCode: data.postalCode,
      ...steamFields,
    })
    .returning();

  // Email verification token
  const token = randomToken();
  await db.insert(schema.tokens).values({
    userId: user.id,
    token,
    purpose: "verify",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  const verifyUrl = `${SITE.url}/verify?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Confirm your rust-skins.com account",
    html: registrationConfirmationEmail(user.firstName, verifyUrl),
  }).catch((e) => console.error("Registration email failed:", e));

  if (pendingSteam) await clearPendingSteam();
  await createSession({ userId: user.id, email: user.email });
  return NextResponse.json({ ok: true });
}
