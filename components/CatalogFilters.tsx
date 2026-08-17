"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { RARITY_META, RARITY_ORDER } from "@/lib/rarity";
import { useCurrency, convertLabel } from "@/components/currency-helpers";
import type { Category } from "@/lib/db/schema";

export function CatalogFilters({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { format, toGbpMinor, meta } = useCurrency();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const rarities = params.get("rarity")?.split(",").filter(Boolean) ?? [];
  const toggleRarity = (r: string) => {
    const set = new Set(rarities);
    set.has(r) ? set.delete(r) : set.add(r);
    setParam("rarity", Array.from(set).join(","));
  };

  // Price bounds are stored in URL as GBP minor; UI shows selected currency.
  const minGbp = params.get("minGbp");
  const maxGbp = params.get("maxGbp");

  const onPrice = (key: "minGbp" | "maxGbp", displayValue: string) => {
    if (displayValue === "") return setParam(key, null);
    const num = Number(displayValue);
    if (!Number.isFinite(num)) return;
    setParam(key, String(toGbpMinor(num)));
  };

  return (
    <div className="space-y-6">
      <FilterGroup label="Category">
        <Select value={params.get("category") ?? ""} onChange={(v) => setParam("category", v || null)} options={[{ value: "", label: "All categories" }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]} />
      </FilterGroup>

      <FilterGroup label="Rarity">
        <div className="flex flex-wrap gap-1.5">
          {RARITY_ORDER.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggleRarity(r)}
              aria-pressed={rarities.includes(r)}
              className="rounded-full border px-2.5 py-1 text-[11px] transition-colors"
              style={{
                borderColor: rarities.includes(r) ? RARITY_META[r].color : "#25382E",
                color: RARITY_META[r].color,
                backgroundColor: rarities.includes(r) ? `${RARITY_META[r].color}1a` : "transparent",
              }}
            >
              {RARITY_META[r].label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label={`Price (${meta.code})`}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="decimal"
            defaultValue={minGbp ? convertLabel(Number(minGbp), meta) : ""}
            onBlur={(e) => onPrice("minGbp", e.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
            className="field !py-2 text-sm"
          />
          <span className="text-sage">–</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            defaultValue={maxGbp ? convertLabel(Number(maxGbp), meta) : ""}
            onBlur={(e) => onPrice("maxGbp", e.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
            className="field !py-2 text-sm"
          />
        </div>
        <p className="mt-1.5 font-mono text-[10px] text-sage">
          Filtering in {meta.symbol} {meta.code}
          {minGbp || maxGbp ? ` · ${format(Number(minGbp) || 0)} – ${maxGbp ? format(Number(maxGbp)) : "∞"}` : ""}
        </p>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="engraved mb-2 text-[10px] text-gold">{label}</p>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="field !py-2 text-sm">
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-panel">{o.label}</option>
      ))}
    </select>
  );
}
