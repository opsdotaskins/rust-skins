"use client";

import { useState } from "react";
import Link from "next/link";
import { ItemCard } from "./ItemCard";
import type { ItemWithRefs } from "@/lib/queries";

export interface ShowcaseGroup {
  slug: string;
  name: string;
  count: number;
  items: ItemWithRefs[];
}

/** Tabbed, client-side category browser — swapping a tab re-animates the grid. */
export function CategoryShowcase({ groups }: { groups: ShowcaseGroup[] }) {
  const [active, setActive] = useState(groups[0]?.slug ?? "");
  const current = groups.find((g) => g.slug === active) ?? groups[0];
  if (!current) return null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {groups.map((g) => {
          const on = g.slug === active;
          return (
            <button
              key={g.slug}
              type="button"
              onClick={() => setActive(g.slug)}
              aria-pressed={on}
              className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                on
                  ? "border-gold/60 bg-gold/10 text-gold shadow-glow-soft"
                  : "border-hairline text-sage hover:border-gold/30 hover:text-parchment"
              }`}
            >
              {g.name}
              <span className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${on ? "bg-gold/20 text-gold" : "bg-well/60 text-sage"}`}>
                {g.count}
              </span>
            </button>
          );
        })}
      </div>

      <div key={active} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {current.items.map((item, i) => (
          <div key={item.id} className="animate-pop-in" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
            <ItemCard item={item} />
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link href={`/catalog?category=${current.slug}`} className="btn-ghost">
          View all {current.name} →
        </Link>
      </div>
    </div>
  );
}
