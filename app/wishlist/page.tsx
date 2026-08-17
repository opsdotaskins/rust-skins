"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/components/providers";
import { ItemGrid } from "@/components/ItemGrid";
import type { ItemWithRefs } from "@/lib/queries";

export default function WishlistPage() {
  const wish = useWishlist();
  const [items, setItems] = useState<ItemWithRefs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!wish.ids.length) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/items?ids=${wish.ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => active && setItems(data))
      .catch(() => active && setItems([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [wish.ids]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <p className="engraved mb-2 text-[10px] text-gold">Saved for later</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-parchment sm:text-4xl">Wishlist</h1>
      </header>
      {loading ? (
        <p className="text-sage">Loading your saved relics…</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline bg-card/50 p-12 text-center">
          <p className="text-sage">Your wishlist is empty.</p>
          <Link href="/catalog" className="btn-gold mt-4">Browse the catalog</Link>
        </div>
      ) : (
        <ItemGrid items={items} />
      )}
    </div>
  );
}
