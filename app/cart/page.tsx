"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers";
import { useCurrency } from "@/components/currency-helpers";
import { RARITY_META, type Rarity } from "@/lib/rarity";
import { VALUES } from "@/lib/config";

export default function CartPage() {
  const cart = useCart();
  const { format } = useCurrency();

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-parchment">Your cart is empty</h1>
        <p className="mt-3 text-sage">The vault awaits. Find a relic worthy of your collection.</p>
        <Link href="/catalog" className="btn-gold mt-6">Browse the catalog</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 font-display text-3xl font-bold tracking-tight text-parchment sm:text-4xl">Your cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-3">
          {cart.lines.map((l) => (
            <li key={l.id} className="flex items-center gap-4 rounded-lg border border-hairline bg-card p-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-well">
                <span className="absolute left-0 top-0 z-10 h-full w-1" style={{ backgroundColor: RARITY_META[l.rarity as Rarity]?.color }} />
                <Image src={l.image} alt={l.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/item/${l.slug}`} className="font-mono text-sm text-parchment hover:text-gold">{l.name}</Link>
                <p className="mt-1 font-mono text-xs" style={{ color: RARITY_META[l.rarity as Rarity]?.color }}>{RARITY_META[l.rarity as Rarity]?.label}</p>
              </div>
              <div className="flex items-center rounded-md border border-hairline">
                <button onClick={() => cart.setQty(l.id, l.quantity - 1)} aria-label="Decrease" className="px-2.5 py-1.5 text-sage hover:text-gold">−</button>
                <span className="w-8 text-center font-mono text-sm text-parchment">{l.quantity}</span>
                <button onClick={() => cart.setQty(l.id, l.quantity + 1)} aria-label="Increase" className="px-2.5 py-1.5 text-sage hover:text-gold">+</button>
              </div>
              <span className="w-24 text-right font-mono text-gold">{format(l.priceMinor * l.quantity)}</span>
              <button onClick={() => cart.remove(l.id)} aria-label={`Remove ${l.name}`} className="text-sage hover:text-loss">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg border border-hairline bg-card p-5 lg:sticky lg:top-40">
          <p className="engraved mb-4 text-[10px] text-gold">Order summary</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-sage">Subtotal</dt><dd className="font-mono text-parchment">{format(cart.subtotalMinor)}</dd></div>
            <div className="flex justify-between"><dt className="text-sage">Service fee</dt><dd className="font-mono text-parchment">{format(VALUES.serviceFeeMinor)}</dd></div>
            <div className="flex justify-between"><dt className="text-sage">Delivery</dt><dd className="font-mono text-teal">Steam trade offer</dd></div>
          </dl>
          <div className="my-4 filigree-divider" />
          <div className="flex items-center justify-between">
            <span className="text-parchment">Total</span>
            <span className="font-mono text-xl text-gold">{format(cart.subtotalMinor + VALUES.serviceFeeMinor)}</span>
          </div>
          <p className="mt-1 text-[11px] text-sage">Tax included. No hidden fees.</p>
          <Link href="/checkout" className="btn-gold mt-5 w-full">Proceed to checkout</Link>
          <Link href="/catalog" className="btn-ghost mt-2 w-full text-sm">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
