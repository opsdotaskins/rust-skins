import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrderByReference, refreshOrderStatus } from "@/lib/orders";
import { formatMinor } from "@/lib/currency";
import { VALUES } from "@/lib/config";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

const LINE_STATUS: Record<string, { label: string; cls: string }> = {
  created: { label: "Searching market", cls: "text-warn" },
  processing: { label: "Preparing trade", cls: "text-warn" },
  sent: { label: "Trade offer sent", cls: "text-teal" },
  finished: { label: "Delivered", cls: "text-profit" },
  failed: { label: "Failed", cls: "text-loss" },
  penalized: { label: "Failed", cls: "text-loss" },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const initial = await getOrderByReference(reference, user.id);
  if (!initial) notFound();
  // Pull the latest delivery status from SIH, then re-read.
  await refreshOrderStatus(initial.order.id).catch(() => {});
  const data = await getOrderByReference(reference, user.id);
  if (!data) notFound();
  const { order, lines } = data;
  const delivered = order.sihStatus === "finished";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="corner-brackets rounded-2xl border border-gold/25 bg-card p-8 text-center shadow-glow-soft">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-gold/10 text-gold">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        <h1 className="font-display text-3xl font-bold text-parchment">Order confirmed</h1>
        <p className="mt-2 text-sage">
          Thank you, {user.firstName}.{" "}
          {delivered
            ? "Your skins have been delivered to your Steam inventory."
            : "Your skins are on the way — accept the Steam trade offer to complete delivery."}
        </p>
        <p className="mt-1 font-mono text-sm text-gold">{order.reference}</p>

        <ul className="mt-6 space-y-2 text-left">
          {lines.map((l) => {
            const s = LINE_STATUS[l.sihStatus ?? "created"] ?? LINE_STATUS.created;
            return (
              <li key={l.id} className="flex items-center justify-between border-b border-hairline pb-2 text-sm">
                <span className="min-w-0">
                  <span className="text-parchment">{l.name}</span>
                  <span className={`ml-2 text-[11px] ${s.cls}`}>{s.label}</span>
                  {l.sihError ? <span className="ml-2 text-[11px] text-loss">· {l.sihError}</span> : null}
                </span>
                <span className="font-mono text-gold">{formatMinor(l.unitPriceMinor * l.quantity, "USD")}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-sage">Total</span>
          <span className="font-mono text-lg text-gold">{formatMinor(order.totalMinor, "USD")}</span>
        </div>
        <p className="mt-2 text-[11px] text-sage">Tax included · Delivered to Steam via trade offer</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`/api/invoice/${order.reference}`} className="btn-gold">Download invoice (PDF)</a>
          <Link href="/dashboard/orders" className="btn-ghost">View my orders</Link>
        </div>
        <p className="mt-4 text-xs text-sage">A confirmation email with your invoice has been sent.</p>
      </div>
    </div>
  );
}
