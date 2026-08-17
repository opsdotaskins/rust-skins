"use client";

import Link from "next/link";
import Image from "next/image";
import { RARITY_META, type Rarity } from "@/lib/rarity";
import { useCurrency } from "./currency-helpers";
import type { ItemWithRefs } from "@/lib/queries";

/** Infinite, pause-on-hover marquee of trending skins with live prices. */
export function SkinTicker({ items }: { items: ItemWithRefs[] }) {
  const { format } = useCurrency();
  if (!items.length) return null;
  // Duplicate the list so the -50% translate loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="marquee-mask relative overflow-hidden border-y border-hairline bg-well/40 py-3">
      <div className="marquee-track gap-3">
        {loop.map((item, i) => {
          const meta = RARITY_META[item.rarity as Rarity];
          return (
            <Link
              key={`${item.id}-${i}`}
              href={`/item/${item.slug}`}
              className="group flex shrink-0 items-center gap-2.5 rounded-full border border-hairline bg-card/70 py-1.5 pl-1.5 pr-4 transition-colors hover:border-gold/50"
            >
              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-well">
                <Image src={item.image} alt="" fill sizes="32px" className="object-cover" />
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full ring-1 ring-inset"
                  style={{ boxShadow: `inset 0 0 8px ${meta.color}77`, borderColor: meta.color }}
                />
              </span>
              <span className="whitespace-nowrap text-xs text-parchment group-hover:text-gold">
                {item.name}
              </span>
              <span className="whitespace-nowrap font-mono text-xs text-gold">
                {format(item.priceMinor)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
