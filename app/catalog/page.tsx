import type { Metadata } from "next";
import { getCatalog, getCategories } from "@/lib/queries";
import { CatalogFilters } from "@/components/CatalogFilters";
import { CatalogToolbar } from "@/components/CatalogToolbar";
import { ItemGrid } from "@/components/ItemGrid";
import type { Rarity } from "@/lib/rarity";
import type { CatalogFilters as Filters } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Catalog — Browse Rust Skins",
  description:
    "Browse the Runevault catalog of authentic Rust skins. Filter by category, rarity and price. Every skin is delivered to your Steam inventory via trade offer.",
  alternates: { canonical: "/catalog" },
};

type SP = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const filters: Filters = {
    hero: str(sp.hero),
    attribute: str(sp.attribute),
    category: str(sp.category),
    slot: str(sp.slot),
    quality: str(sp.quality),
    q: str(sp.q),
    rarities: str(sp.rarity)?.split(",").filter(Boolean) as Rarity[] | undefined,
    minGbpMinor: sp.minGbp ? Number(str(sp.minGbp)) : undefined,
    maxGbpMinor: sp.maxGbp ? Number(str(sp.maxGbp)) : undefined,
    sort: (str(sp.sort) as Filters["sort"]) ?? "popular",
  };

  const [items, categories] = await Promise.all([
    getCatalog(filters),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <p className="engraved mb-2 text-[10px] text-gold">The Armoury</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-parchment sm:text-4xl">
          Catalog
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-sage">
          Every skin in the armoury. Filter, sort and add to cart — delivered to Steam by trade offer.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="card-surface p-5">
            <CatalogFilters categories={categories} />
          </div>
        </aside>

        <section>
          <CatalogToolbar count={items.length} />
          <ItemGrid items={items} />
        </section>
      </div>
    </div>
  );
}
