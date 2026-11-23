import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog, getCategories } from "@/lib/queries";
import { CatalogFilters } from "@/components/CatalogFilters";
import { CatalogToolbar } from "@/components/CatalogToolbar";
import { ItemGrid } from "@/components/ItemGrid";
import type { Rarity } from "@/lib/rarity";
import type { CatalogFilters as Filters } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Catalog — Browse Rust Skins",
  description:
    "Browse the rust-skins.com catalog of authentic Rust skins. Filter by category, rarity and price. Every skin is delivered to your Steam inventory via trade offer.",
  alternates: { canonical: "/catalog" },
};

type SP = Record<string, string | string[] | undefined>;

const PAGE_SIZE = 48;

function pageHref(sp: SP, page: number) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const val = str(v);
    if (val && k !== "page") next.set(k, val);
  }
  if (page > 1) next.set("page", String(page));
  const qs = next.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

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

  const [allItems, categories] = await Promise.all([
    getCatalog(filters),
    getCategories(),
  ]);
  const pageCount = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const page = Math.min(pageCount, Math.max(1, Number(str(sp.page)) || 1));
  const items = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          <CatalogToolbar count={allItems.length} />
          <ItemGrid items={items} />
          {pageCount > 1 && (
            <nav aria-label="Catalog pages" className="mt-10 flex items-center justify-center gap-3 text-sm">
              {page > 1 ? (
                <Link href={pageHref(sp, page - 1)} className="btn-ghost text-sm">← Previous</Link>
              ) : (
                <span className="btn-ghost pointer-events-none text-sm opacity-40">← Previous</span>
              )}
              <span className="text-sage">
                Page <span className="text-parchment">{page}</span> of {pageCount}
              </span>
              {page < pageCount ? (
                <Link href={pageHref(sp, page + 1)} className="btn-ghost text-sm">Next →</Link>
              ) : (
                <span className="btn-ghost pointer-events-none text-sm opacity-40">Next →</span>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
