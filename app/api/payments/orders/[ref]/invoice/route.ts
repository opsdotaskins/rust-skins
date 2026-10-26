import { eq } from "drizzle-orm";
import { db, schema, ensureDb } from "@/lib/db";
import { buildInvoicePdf } from "@/lib/invoice";
import { formatMinor } from "@/lib/currency";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const url = new URL(req.url);
  const emailParam = url.searchParams.get("email")?.toLowerCase();

  await ensureDb();

  // Find order by reference
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.reference, ref))
    .limit(1);

  if (!order) {
    return new Response("Order not found", { status: 404 });
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, order.userId))
    .limit(1);

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  if (emailParam && user.email.toLowerCase() !== emailParam) {
    return new Response("Forbidden: email does not match order", { status: 403 });
  }

  const lines = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, order.id));

  const pdf = await buildInvoicePdf({
    reference: order.reference,
    date: new Date(order.createdAt),
    customer: {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      address: `${user.street}, ${user.city}, ${user.country} ${user.postalCode}`,
    },
    lines: lines.map((l) => ({
      name: l.quantity > 1 ? `${l.name} × ${l.quantity}` : l.name,
      price: formatMinor(l.unitPriceMinor * l.quantity, "USD"),
    })),
    subtotal: formatMinor(order.subtotalMinor, "USD"),
    fee: order.feeMinor ? formatMinor(order.feeMinor, "USD") : undefined,
    total: formatMinor(order.totalMinor, "USD"),
    currency: "USD",
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${ref}.pdf"`,
    },
  });
}
