import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema, ensureDb } from "@/lib/db";
import { ensurePaymentInvoicesTable } from "@/lib/corefy";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  if (!ref) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  await ensureDb();
  await ensurePaymentInvoicesTable();

  // 1. Look in payment_invoices
  const [invoice] = await db
    .select()
    .from(schema.paymentInvoices)
    .where(eq(schema.paymentInvoices.referenceId, ref))
    .limit(1);

  if (invoice) {
    const isProcessed = invoice.status === "processed";
    return NextResponse.json({
      transactionRef: invoice.referenceId,
      status: invoice.status,
      type: invoice.type,
      planTitle: invoice.type === "wallet_topup" ? "Wallet Top-Up" : "Rust Skins Order",
      amountCents: Math.round(Number.parseFloat(invoice.payAmount || "0") * 100),
      currency: invoice.payCurrency,
      customerEmail: invoice.customerEmail,
      completedAt: isProcessed ? invoice.updatedAt.toISOString() : null,
      orderReference: invoice.type === "checkout" ? invoice.referenceId : null,
    });
  }

  // 2. Look in orders
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.reference, ref))
    .limit(1);

  if (order) {
    const isPaid = order.status === "paid";
    return NextResponse.json({
      transactionRef: order.reference,
      status: isPaid ? "processed" : order.status,
      type: "checkout",
      planTitle: "Rust Skins Order",
      amountCents: order.totalMinor,
      currency: order.currency,
      completedAt: isPaid ? order.createdAt.toISOString() : null,
      orderReference: order.reference,
    });
  }

  return NextResponse.json(
    {
      error: "Order or payment reference not found",
      transactionRef: ref,
      status: "not_found",
    },
    { status: 404 }
  );
}
