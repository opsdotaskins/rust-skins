import type { Metadata } from "next";
import { getCatalog } from "@/lib/queries";
import { ItemGrid } from "@/components/ItemGrid";

export const metadata: Metadata = {
  title: "Deals — Discounted Rust Skins",
  description: "Discounted Rust skins at Runevault. Weapon finishes, apparel and base skins with reduced prices — instant delivery on every skin.",
  alternates: { canonical: "/deals" },
};

export default async function DealsPage() {
  const all = await getCatalog({ sort: "price-desc" });
  const deals = all.filter((i) => i.oldPriceMinor && i.oldPriceMinor > i.priceMinor);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <p className="engraved mb-2 text-[10px] text-gold">Marked down</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-parchment sm:text-4xl">Deals</h1>
        <p className="mt-2 max-w-2xl text-sm text-sage">Skins with reduced prices, straight from the armoury. Tax included, delivered to Steam instantly.</p>
      </header>
      {deals.length === 0 ? (
        <p className="rounded-lg border border-hairline bg-card p-10 text-center text-sage">No active deals right now — check back soon.</p>
      ) : (
        <ItemGrid items={deals} />
      )}
    </div>
  );
}
