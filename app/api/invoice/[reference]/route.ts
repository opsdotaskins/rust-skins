import { getCurrentUser } from "@/lib/auth";
import { getOrderByReference } from "@/lib/orders";
import { buildInvoicePdf } from "@/lib/invoice";
import { formatMinor } from "@/lib/currency";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const data = await getOrderByReference(reference, user.id);
  if (!data) return new Response("Not found", { status: 404 });

  const pdf = await buildInvoicePdf({
    reference: data.order.reference,
    date: new Date(data.order.createdAt),
    customer: {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      address: `${user.street}, ${user.city}, ${user.country} ${user.postalCode}`,
    },
    lines: data.lines.map((l) => ({
      name: l.quantity > 1 ? `${l.name} × ${l.quantity}` : l.name,
      price: formatMinor(l.unitPriceMinor * l.quantity, "GBP"),
    })),
    subtotal: formatMinor(data.order.subtotalMinor, "GBP"),
    fee: data.order.feeMinor ? formatMinor(data.order.feeMinor, "GBP") : undefined,
    total: formatMinor(data.order.totalMinor, "GBP"),
    currency: "GBP",
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rust-skins-invoice-${reference}.pdf"`,
    },
  });
}
