import "server-only";
import { db, schema, ensureDb } from "./db";
import { asc, desc, eq, inArray } from "drizzle-orm";
import type { Rarity } from "./rarity";

const { items, heroes, categories, posts, reviews } = schema;

export interface CatalogFilters {
  hero?: string;
  attribute?: string;
  category?: string;
  slot?: string;
  rarities?: Rarity[];
  quality?: string;
  minGbpMinor?: number;
  maxGbpMinor?: number;
  sort?: "price-asc" | "price-desc" | "newest" | "rarity" | "popular";
  q?: string;
}

const RARITY_RANK: Record<string, number> = {
  common: 1, uncommon: 2, rare: 3, mythical: 4,
  legendary: 5, immortal: 6, arcana: 7, ancient: 8,
};

export type ItemWithRefs = schema.Item & {
  heroName: string | null;
  heroSlug: string | null;
  categoryName: string;
  categorySlug: string;
};

function withRefsSelect() {
  return db
    .select({
      id: items.id,
      slug: items.slug,
      name: items.name,
      description: items.description,
      heroId: items.heroId,
      categoryId: items.categoryId,
      slot: items.slot,
      rarity: items.rarity,
      quality: items.quality,
      priceMinor: items.priceMinor,
      oldPriceMinor: items.oldPriceMinor,
      image: items.image,
      setContents: items.setContents,
      featured: items.featured,
      isNew: items.isNew,
      popularity: items.popularity,
      createdAt: items.createdAt,
      heroName: heroes.name,
      heroSlug: heroes.slug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(items)
    .leftJoin(heroes, eq(items.heroId, heroes.id))
    .innerJoin(categories, eq(items.categoryId, categories.id));
}

/**
 * The whole catalogue is read once per server instance and kept in memory for
 * CATALOG_TTL_MS. Every list (home, catalogue, deals, item pages) filters this
 * snapshot instead of pulling thousands of rows from Postgres on each request,
 * which is what exhausted the Neon data-transfer quota.
 */
const CATALOG_TTL_MS = 5 * 60 * 1000;

interface Snapshot {
  at: number;
  items: ItemWithRefs[];
  heroAttr: Map<number, string>;
}

let snapshot: Snapshot | null = null;
let inflight: Promise<Snapshot> | null = null;

async function loadSnapshot(): Promise<Snapshot> {
  await ensureDb();
  const [rows, heroRows] = await Promise.all([
    withRefsSelect(),
    db.select({ id: heroes.id, attribute: heroes.attribute }).from(heroes),
  ]);
  return {
    at: Date.now(),
    items: rows as ItemWithRefs[],
    heroAttr: new Map(heroRows.map((h) => [h.id, String(h.attribute)])),
  };
}

async function getSnapshot(): Promise<Snapshot> {
  if (snapshot && Date.now() - snapshot.at < CATALOG_TTL_MS) return snapshot;
  if (!inflight) {
    inflight = loadSnapshot()
      .then((s) => (snapshot = s))
      .catch((e) => {
        // Serve the last good copy rather than failing the page.
        if (snapshot) return snapshot;
        throw e;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Drop the cached catalogue (after imports or price syncs). */
export function invalidateCatalogCache() {
  snapshot = null;
}

async function allItems(): Promise<ItemWithRefs[]> {
  return (await getSnapshot()).items;
}

const byPopularity = (a: ItemWithRefs, b: ItemWithRefs) => b.popularity - a.popularity;

export async function getCatalog(filters: CatalogFilters): Promise<ItemWithRefs[]> {
  const { items: all, heroAttr } = await getSnapshot();
  const q = filters.q?.toLowerCase();
  const rarities = filters.rarities?.length ? new Set<string>(filters.rarities) : null;

  const rows = all.filter((r) => {
    if (filters.hero && r.heroSlug !== filters.hero) return false;
    if (filters.attribute && (r.heroId == null || heroAttr.get(r.heroId) !== filters.attribute)) return false;
    if (filters.category && r.categorySlug !== filters.category) return false;
    if (filters.slot && r.slot !== filters.slot) return false;
    if (rarities && !rarities.has(r.rarity)) return false;
    if (filters.quality && r.quality !== filters.quality) return false;
    if (filters.minGbpMinor != null && r.priceMinor < filters.minGbpMinor) return false;
    if (filters.maxGbpMinor != null && r.priceMinor > filters.maxGbpMinor) return false;
    if (q && !r.name.toLowerCase().includes(q) && !(r.heroName ?? "").toLowerCase().includes(q)) return false;
    return true;
  });

  switch (filters.sort) {
    case "price-asc": rows.sort((a, b) => a.priceMinor - b.priceMinor); break;
    case "price-desc": rows.sort((a, b) => b.priceMinor - a.priceMinor); break;
    case "newest": rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break;
    case "rarity": rows.sort((a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity]); break;
    default: rows.sort(byPopularity);
  }
  return rows;
}

export async function getItemBySlug(slug: string): Promise<ItemWithRefs | null> {
  return (await allItems()).find((r) => r.slug === slug) ?? null;
}

export async function getFeatured(limit = 8) {
  return (await allItems()).filter((r) => r.featured).sort(byPopularity).slice(0, limit);
}

export async function getByRarity(rarity: Rarity, limit = 8) {
  return (await allItems()).filter((r) => r.rarity === rarity).sort(byPopularity).slice(0, limit);
}

export async function getNewArrivals(limit = 8) {
  return (await allItems())
    .filter((r) => r.isNew)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit);
}

export async function getMostExpensive(limit = 6) {
  return [...(await allItems())].sort((a, b) => b.priceMinor - a.priceMinor).slice(0, limit);
}

export async function getRelated(item: ItemWithRefs, limit = 4) {
  return (await allItems())
    .filter((r) => r.categorySlug === item.categorySlug && r.id !== item.id)
    .slice(0, limit);
}

let refCache: { at: number; heroes: schema.Hero[]; categories: schema.Category[] } | null = null;

async function getRefs() {
  if (refCache && Date.now() - refCache.at < CATALOG_TTL_MS) return refCache;
  await ensureDb();
  const [h, c] = await Promise.all([
    db.select().from(heroes).orderBy(asc(heroes.name)),
    db.select().from(categories).orderBy(asc(categories.name)),
  ]);
  refCache = { at: Date.now(), heroes: h, categories: c };
  return refCache;
}

export async function getHeroes() {
  return (await getRefs()).heroes;
}

export async function getCategories() {
  return (await getRefs()).categories;
}

export async function getSlots(): Promise<string[]> {
  const slots = new Set((await allItems()).map((r) => r.slot).filter(Boolean));
  return [...slots].sort();
}

export async function getPosts() {
  await ensureDb();
  return db.select().from(posts).orderBy(desc(posts.publishedAt));
}

export async function getPostBySlug(slug: string) {
  await ensureDb();
  const rows = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getReviews() {
  await ensureDb();
  return db.select().from(reviews);
}

export async function getItemsByIds(ids: number[]): Promise<ItemWithRefs[]> {
  if (!ids.length) return [];
  await ensureDb();
  const rows = await withRefsSelect().where(inArray(items.id, ids));
  return rows as ItemWithRefs[];
}
