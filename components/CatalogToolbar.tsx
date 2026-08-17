"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { RARITY_META, type Rarity } from "@/lib/rarity";

const SORTS = [
  { value: "popular", label: "Popularity" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "rarity", label: "Rarity" },
];

const LABELS: Record<string, string> = {
  category: "Category",
  hero: "Hero",
  attribute: "Attribute",
  slot: "Slot",
  quality: "Quality",
  q: "Search",
  minGbp: "Min",
  maxGbp: "Max",
};

export function CatalogToolbar({ count }: { count: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const remove = (key: string, value?: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && key === "rarity") {
      const set = new Set(next.get("rarity")?.split(",") ?? []);
      set.delete(value);
      set.size ? next.set("rarity", Array.from(set).join(",")) : next.delete("rarity");
    } else {
      next.delete(key);
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const chips: { key: string; value?: string; label: string }[] = [];
  params.forEach((value, key) => {
    if (key === "sort") return;
    if (key === "rarity") {
      value.split(",").filter(Boolean).forEach((r) =>
        chips.push({ key: "rarity", value: r, label: RARITY_META[r as Rarity]?.label ?? r })
      );
    } else {
      chips.push({ key, label: `${LABELS[key] ?? key}: ${value}` });
    }
  });

  const setSort = (v: string) => {
    const next = new URLSearchParams(params.toString());
    v ? next.set("sort", v) : next.delete("sort");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-sage">
          <span className="font-mono text-parchment">{count}</span> relics
        </p>
        <label className="flex items-center gap-2 text-sm text-sage">
          Sort
          <select value={params.get("sort") ?? "popular"} onChange={(e) => setSort(e.target.value)} className="field !w-auto !py-1.5 text-sm">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value} className="bg-panel">{s.label}</option>
            ))}
          </select>
        </label>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c, i) => (
            <button key={i} onClick={() => remove(c.key, c.value)} className="chip hover:border-gold/40 hover:text-parchment">
              {c.label}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          ))}
          <button onClick={() => router.push(pathname, { scroll: false })} className="text-xs text-teal hover:text-gold">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
