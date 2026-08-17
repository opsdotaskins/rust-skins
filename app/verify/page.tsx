import Link from "next/link";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, schema, ensureDb } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let ok = false;

  if (token) {
    await ensureDb();
    const [row] = await db
      .select()
      .from(schema.tokens)
      .where(
        and(
          eq(schema.tokens.token, token),
          eq(schema.tokens.purpose, "verify"),
          isNull(schema.tokens.usedAt),
          gt(schema.tokens.expiresAt, new Date())
        )
      )
      .limit(1);
    if (row) {
      await db.update(schema.users).set({ emailVerified: true }).where(eq(schema.users.id, row.userId));
      await db.update(schema.tokens).set({ usedAt: new Date() }).where(eq(schema.tokens.id, row.id));
      ok = true;
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-parchment">
        {ok ? "Email confirmed" : "Verification failed"}
      </h1>
      <p className="mt-3 text-sage">
        {ok
          ? "Your Runevault account is fully verified. Welcome to the vault."
          : "This verification link is invalid or has expired."}
      </p>
      <Link href={ok ? "/dashboard" : "/login"} className="btn-gold mt-6">
        {ok ? "Go to dashboard" : "Back to login"}
      </Link>
    </div>
  );
}
