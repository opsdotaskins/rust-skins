"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./providers";
import { useCurrency } from "./currency-helpers";
import { PaymentLogos } from "./PaymentLogos";
import { VALUES } from "@/lib/config";

export function CheckoutForm({
  seller,
  balanceMinor,
  steamLinked,
  steamName,
}: {
  seller: { name: string; address: string };
  balanceMinor: number;
  steamLinked: boolean;
  steamName: string | null;
}) {
  const cart = useCart();
  const { format } = useCurrency();
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalMinor = cart.subtotalMinor + VALUES.serviceFeeMinor;
  const canUseBalance = balanceMinor >= totalMinor;
  const canPay = steamLinked && canUseBalance && agreed && !submitting;

  if (cart.lines.length === 0) {
    return (
      <div className="rounded-lg border border-hairline bg-card p-10 text-center">
        <p className="text-sage">Your cart is empty.</p>
        <Link href="/catalog" className="btn-gold mt-4">Browse the catalog</Link>
      </div>
    );
  }

  const placeOrder = async () => {
    if (!canPay) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.lines.map((l) => ({ id: l.id, quantity: l.quantity })),
          payWithBalance: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      cart.clear();
      router.push(`/order/${data.reference}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {/* Steam delivery target */}
        <section className="card-surface p-5">
          <p className="engraved mb-3 text-[10px] text-gold">Delivery</p>
          {steamLinked ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-profit/10 px-2 py-1 text-[11px] text-profit">Steam linked</span>
              <span className="text-sage">Skins are delivered by trade offer to</span>
              <span className="text-parchment">{steamName ?? "your Steam account"}</span>
            </div>
          ) : (
            <div className="rounded-md border border-warn/40 bg-warn/5 p-3 text-sm">
              <p className="text-parchment">Link your Steam account to receive skins.</p>
              <p className="mt-1 text-[12px] text-sage">
                We deliver every item via a Steam trade offer, so we need your Steam account and trade URL first.
              </p>
              <Link href="/account" className="btn-gold mt-3 inline-flex">Link Steam account</Link>
            </div>
          )}
        </section>

        {/* Payment method — funded from your Runevault wallet */}
        <section className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="engraved text-[10px] text-gold">Payment</p>
            <PaymentLogos />
          </div>

          <div className="flex items-center justify-between rounded-md border border-gold/50 bg-gold/5 p-3">
            <span className="text-sm text-parchment">Runevault wallet</span>
            <span className="font-mono text-sm text-gold">{format(balanceMinor)}</span>
          </div>
          {!canUseBalance && (
            <p className="mt-2 text-[12px] text-sage">
              Balance too low for this order.{" "}
              <Link href="/dashboard/wallet" className="text-teal hover:underline">Top up your wallet</Link> to continue.
            </p>
          )}
        </section>

        {/* Seller details — legal name & address on final page */}
        <section className="card-surface p-5 text-sm">
          <p className="engraved mb-3 text-[10px] text-gold">Seller</p>
          <p className="text-parchment">{seller.name}</p>
          <p className="text-sage">{seller.address}</p>
        </section>
      </div>

      {/* Summary + place order */}
      <aside className="h-fit rounded-lg border border-hairline bg-card p-5 lg:sticky lg:top-40">
        <p className="engraved mb-4 text-[10px] text-gold">Your order</p>
        <ul className="mb-4 space-y-2">
          {cart.lines.map((l) => (
            <li key={l.id} className="flex justify-between gap-2 text-sm">
              <span className="min-w-0 truncate text-sage">{l.name}{l.quantity > 1 ? ` × ${l.quantity}` : ""}</span>
              <span className="font-mono text-parchment">{format(l.priceMinor * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1.5 border-t border-hairline pt-3 text-sm">
          <div className="flex justify-between"><dt className="text-sage">Subtotal</dt><dd className="font-mono text-parchment">{format(cart.subtotalMinor)}</dd></div>
          <div className="flex justify-between"><dt className="text-sage">Service fee</dt><dd className="font-mono text-parchment">{format(VALUES.serviceFeeMinor)}</dd></div>
        </dl>
        <div className="my-3 filigree-divider" />
        <div className="flex items-center justify-between">
          <span className="text-parchment">Total</span>
          <span className="font-mono text-xl text-gold">{format(totalMinor)}</span>
        </div>
        <p className="mt-1 text-[11px] text-sage">Tax is included in the price.</p>

        <label className="mt-5 flex items-start gap-2.5 text-sm text-sage">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-[#E8B44A]" />
          <span>
            I agree to the{" "}
            <Link href="/legal/terms" className="text-teal hover:underline">Terms &amp; Conditions</Link> and the{" "}
            <Link href="/legal/payment" className="text-teal hover:underline">Payment</Link>,{" "}
            <Link href="/legal/delivery" className="text-teal hover:underline">Digital Delivery</Link> and{" "}
            <Link href="/legal/refunds" className="text-teal hover:underline">Refund &amp; Cancellation</Link> Policies.
          </span>
        </label>

        {error && <p className="mt-3 text-sm text-loss">{error}</p>}

        <button type="button" onClick={placeOrder} disabled={!canPay} className="btn-gold mt-4 w-full">
          {submitting
            ? "Processing…"
            : !steamLinked
              ? "Link Steam to continue"
              : !canUseBalance
                ? "Top up to continue"
                : `Pay ${format(totalMinor)}`}
        </button>
        <p className="mt-3 text-center text-[11px] text-sage">✦ Secure payment · Delivered to Steam via trade offer</p>
      </aside>
    </div>
  );
}
