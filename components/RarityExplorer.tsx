"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RARITY_META, RARITY_ORDER, type Rarity } from "@/lib/rarity";
import type { ItemWithRefs } from "@/lib/queries";

export function RarityExplorer({ items }: { items: ItemWithRefs[] }) {
  const [active, setActive] = useState<Rarity | "all">("all");
  const filtered =
    active === "all" ? items : items.filter((i) => i.rarity === active);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setActive("all")}
          aria-pressed={active === "all"}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${active === "all" ? "border-gold bg-gold/10 text-gold" : "border-hairline text-sage hover:border-gold/40"}`}
        >
          All tiers
        </button>
        {RARITY_ORDER.map((r) => (
          <button
            key={r}
            onClick={() => setActive(r)}
            aria-pressed={active === r}
            className="rounded-full border px-3 py-1 text-xs transition-colors"
            style={{
              borderColor: active === r ? RARITY_META[r].color : "#25382E",
              color: RARITY_META[r].color,
              backgroundColor: active === r ? `${RARITY_META[r].color}1a` : "transparent",
            }}
          >
            {RARITY_META[r].label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {filtered.slice(0, 12).map((item) => (
          <Link
            key={item.id}
            href={`/item/${item.slug}`}
            className="group relative overflow-hidden rounded-lg border border-hairline bg-card"
          >
            <span className="absolute left-0 top-0 z-10 h-full w-[3px]" style={{ backgroundColor: RARITY_META[item.rarity as Rarity].color }} />
            <div className="relative aspect-square">
              <div className="absolute inset-0 opacity-40 blur-xl" style={{ background: `radial-gradient(circle at 50% 60%, ${RARITY_META[item.rarity as Rarity].color}55, transparent 60%)` }} />
              <Image src={item.image} alt={item.name} fill sizes="16vw" className="relative object-cover transition-transform group-hover:scale-105" />
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-sage">No relics in this tier yet.</p>
        )}
      </div>
    </div>
  );
}
