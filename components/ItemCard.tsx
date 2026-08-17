"use client";

import Link from "next/link";
import Image from "next/image";
import { RARITY_META, qualityLabel, isEnchanted, type Rarity } from "@/lib/rarity";
import { PriceWithOld } from "./Price";
import { useCart, useWishlist } from "./providers";
import type { ItemWithRefs } from "@/lib/queries";

export function ItemCard({ item }: { item: ItemWithRefs }) {
  const cart = useCart();
  const wish = useWishlist();
  const meta = RARITY_META[item.rarity as Rarity];
  const enchanted = isEnchanted(item.rarity as Rarity);
  const q = qualityLabel(item.quality);
  const inWish = wish.has(item.id);

  return (
    <div className="group hover-lift relative flex flex-col overflow-hidden rounded-lg border border-hairline bg-card shadow-relic">
      {/* rarity edge-strip */}
      <span
        aria-hidden
        className="absolute left-0 top-0 z-10 h-full w-[3px] transition-all duration-300 group-hover:w-1"
        style={{ backgroundColor: meta.color, boxShadow: `0 0 12px ${meta.color}` }}
      />
      <Link
        href={`/item/${item.slug}`}
        className="relative block"
        aria-label={`${q ? q + " " : ""}${item.name}`}
      >
        {/* render stage with rarity glow */}
        <div className="relative aspect-square overflow-hidden bg-well">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-70 group-hover:animate-breathe"
            style={{
              background: `radial-gradient(circle at 50% 60%, ${meta.color}55, transparent 60%)`,
            }}
          />
          <Image
            src={item.image}
            alt={`${q ? q + " " : ""}${item.name} — Rust ${meta.label} skin`}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="relative object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {enchanted && (
            <span aria-hidden className="sweep-mask absolute inset-0" />
          )}
          {/* hover veil + view CTA */}
          <div aria-hidden className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-abyss/85 via-abyss/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="mb-4 translate-y-3 rounded-full border border-gold/40 bg-abyss/70 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
              View skin →
            </span>
          </div>
          {/* quality chip */}
          {q && (
            <span className="absolute left-3 top-3 z-10 rounded bg-well/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-parchment">
              {q}
            </span>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => wish.toggle(item.id)}
        aria-pressed={inWish}
        aria-label={inWish ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-hairline bg-abyss/70 text-sage backdrop-blur transition-all hover:scale-110 hover:text-gold active:scale-90"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" className={inWish ? "animate-pop-in" : ""} fill={inWish ? "#E8B44A" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-center justify-between">
          <span
            className="engraved text-[9px]"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
          {item.heroName && (
            <span className="chip !py-0.5 !text-[9px]">{item.heroName}</span>
          )}
        </div>
        <Link
          href={`/item/${item.slug}`}
          className="font-mono text-sm leading-snug text-parchment hover:text-gold"
        >
          {q && <span className="text-sage">{q} </span>}
          {item.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <PriceWithOld priceMinor={item.priceMinor} oldPriceMinor={item.oldPriceMinor} />
          <button
            type="button"
            onClick={() =>
              cart.add({
                id: item.id,
                slug: item.slug,
                name: item.name,
                priceMinor: item.priceMinor,
                image: item.image,
                rarity: item.rarity,
              })
            }
            className="rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1.5 text-xs font-semibold text-gold transition-all hover:bg-gold hover:text-abyss hover:shadow-glow active:scale-90"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-card">
      <div className="skeleton aspect-square" />
      <div className="space-y-2 p-3.5">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-1/2 rounded" />
      </div>
    </div>
  );
}
