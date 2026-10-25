import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createOrder,
  SteamNotLinkedError,
  InsufficientBalanceError,
  type CartInput,
} from "@/lib/orders";
import { buildInvoicePdf } from "@/lib/invoice";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";
import { formatMinor } from "@/lib/currency";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { cart?: CartInput[]; payWithBalance?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const cart = (body.cart ?? []).filter(
    (c) => Number.isInteger(c.id) && Number.isInteger(c.quantity) && c.quantity > 0
  );
  if (!cart.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  try {
    const result = await createOrder(user.id, cart, Boolean(body.payWithBalance));

    const lines = result.lines.map((l) => ({
      name: l.quantity > 1 ? `${l.item.name} × ${l.quantity}` : l.item.name,
      price: formatMinor(l.item.priceMinor * l.quantity, "USD"),
    }));

    // Build PDF invoice and email confirmation (non-blocking failures tolerated).
    try {
      const pdf = await buildInvoicePdf({
        reference: result.reference,
        date: new Date(),
        customer: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          address: `${user.street}, ${user.city}, ${user.country} ${user.postalCode}`,
        },
        lines,
        subtotal: formatMinor(result.subtotalMinor, "USD"),
        fee: result.feeMinor ? formatMinor(result.feeMinor, "USD") : undefined,
        total: formatMinor(result.totalMinor, "USD"),
        currency: "USD",
      });

      await sendEmail({
        to: user.email,
        subject: `rust-skins.com order ${result.reference} confirmed`,
        html: orderConfirmationEmail(
          user.firstName,
          result.reference,
          formatMinor(result.totalMinor, "USD"),
          lines
        ),
        attachments: [
          { filename: `invoice-${result.reference}.pdf`, content: pdf, contentType: "application/pdf" },
        ],
      });
    } catch (e) {
      console.error("Invoice/email failed:", e);
    }

    return NextResponse.json({
      reference: result.reference,
      sihStatus: result.sihStatus,
      testMode: result.testMode,
    });
  } catch (e) {
    if (e instanceof SteamNotLinkedError) {
      return NextResponse.json({ error: e.message, code: "STEAM_NOT_LINKED" }, { status: 409 });
    }
    if (e instanceof InsufficientBalanceError) {
      return NextResponse.json({ error: e.message, code: "INSUFFICIENT_BALANCE" }, { status: 402 });
    }
    console.error("Checkout failed:", e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
