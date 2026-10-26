import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createWalletTopupInvoice } from "@/lib/orders";
import { type CurrencyCode } from "@/lib/currency";

export const runtime = "nodejs";

const schema = z.object({
  amount: z.number().finite().positive().max(100000),
  currency: z.enum(["GBP", "EUR", "USD"]),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
  }

  try {
    const result = await createWalletTopupInvoice(
      user.id,
      parsed.data.amount,
      parsed.data.currency as CurrencyCode
    );
    return NextResponse.json({
      ok: true,
      reference: result.reference,
      hppUrl: result.hppUrl,
    });
  } catch (err) {
    console.error("Wallet top-up creation failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Top-up failed" },
      { status: 500 }
    );
  }
}
