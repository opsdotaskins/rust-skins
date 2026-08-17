"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, useWishlist } from "./providers";

interface Props {
  item: { id: number; slug: string; name: string; priceMinor: number; image: string; rarity: string };
}

export function AddToCart({ item }: Props) {
  const cart = useCart();
  const wish = useWishlist();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = () => {
    cart.add(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border border-hairline bg-well/60">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="px-3 py-2 text-sage hover:text-gold">−</button>
          <span className="w-10 text-center font-mono text-parchment" aria-live="polite">{qty}</span>
          <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity" className="px-3 py-2 text-sage hover:text-gold">+</button>
        </div>
        <button type="button" onClick={add} className="btn-gold flex-1">
          {added ? "Added ✓" : "Add to cart"}
        </button>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => { cart.add(item, qty); router.push("/checkout"); }}
          className="btn-teal flex-1"
        >
          Buy now
        </button>
        <button
          type="button"
          onClick={() => wish.toggle(item.id)}
          aria-pressed={wish.has(item.id)}
          className="btn-ghost"
        >
          {wish.has(item.id) ? "In wishlist" : "Wishlist"}
        </button>
      </div>
    </div>
  );
}
