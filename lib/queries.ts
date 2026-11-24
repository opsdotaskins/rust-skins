import "server-only";
import { db, schema, ensureDb } from "./db";
import { asc, desc, eq, gte, lt, and, max } from "drizzle-orm";
import { unstable_cache, revalidateTag } from "next/cache";
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
 * Catalogue caching — keeps anonymous traffic off Postgres entirely so the
 * database stays inside the Neon free-plan limits (compute scales to zero,
 * network transfer stays tiny).
 *
 *   L2  Next/Vercel Data Cache (unstable_cache), shared by every instance,
 *       revalidated every CATALOG_REVALIDATE_S or on demand via the "catalog"
 *       tag (admin sync / import). Stored in id-range chunks because a cache
 *       entry is capped at 2 MB and the full catalogue is ~3.5 MB.
 *   L1  per-instance memory copy for MEMORY_TTL_MS, so hot pages do not even
 *       touch the Data Cache.
 *
 * If Postgres is unreachable (quota, outage) the last good copy is served.
 * Checkout/balance code paths (lib/orders, lib/auth) still read the database.
 */
export const CATALOG_TAG = "catalog";
const CATALOG_REVALIDATE_S = 24 * 60 * 60;
const MEMORY_TTL_MS = 10 * 60 * 1000;
const CHUNK = 1000;

const cachedMaxItemId = unstable_cache(
  async () => {
    await ensureDb();
    const [row] = await db.select({ m: max(items.id) }).from(items);
    return row?.m ?? 0;
  },
  ["catalog-max-id-v1"],
  { revalidate: CATALOG_REVALIDATE_S, tags: [CATALOG_TAG] }
);

const cachedChunk = unstable_cache(
  async (index: number) => {
    await ensureDb();
    const from = index * CHUNK;
    return withRefsSelect().where(and(gte(items.id, from), lt(items.id, from + CHUNK)));
  },
  ["catalog-chunk-v1"],
  { revalidate: CATALOG_REVALIDATE_S, tags: [CATALOG_TAG] }
);

const cachedHeroAttrs = unstable_cache(
  async () => {
    await ensureDb();
    return db.select({ id: heroes.id, attribute: heroes.attribute }).from(heroes);
  },
  ["catalog-hero-attrs-v1"],
  { revalidate: CATALOG_REVALIDATE_S, tags: [CATALOG_TAG] }
);

interface Snapshot {
  at: number;
  items: ItemWithRefs[];
  heroAttr: Map<number, string>;
}

let snapshot: Snapshot | null = null;
let inflight: Promise<Snapshot> | null = null;

async function loadSnapshot(): Promise<Snapshot> {
  const maxId = await cachedMaxItemId();
  const chunkCount = Math.floor(maxId / CHUNK) + 1;
  const [chunks, heroRows] = await Promise.all([
    Promise.all(Array.from({ length: chunkCount }, (_, i) => cachedChunk(i))),
    cachedHeroAttrs(),
  ]);
  // The Data Cache stores JSON, so dates come back as strings.
  const all = chunks.flat().map((r) => ({ ...r, createdAt: new Date(r.createdAt) })) as ItemWithRefs[];
  return {
    at: Date.now(),
    items: all,
    heroAttr: new Map(heroRows.map((h) => [h.id, String(h.attribute)])),
  };
}

async function getSnapshot(): Promise<Snapshot> {
  if (snapshot && Date.now() - snapshot.at < MEMORY_TTL_MS) return snapshot;
  if (!inflight) {
    inflight = loadSnapshot()
      .then((s) => (snapshot = s))
      .catch((e) => {
        if (snapshot) {
          console.error("[catalog] refresh failed, serving cached copy:", e);
          return snapshot;
        }
        throw e;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Drop every cached copy of the catalogue (after imports or price syncs). */
export function invalidateCatalogCache() {
  snapshot = null;
  refCache = null;
  revalidateTag(CATALOG_TAG);
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

const cachedRefs = unstable_cache(
  async () => {
    await ensureDb();
    const [h, c] = await Promise.all([
      db.select().from(heroes).orderBy(asc(heroes.name)),
      db.select().from(categories).orderBy(asc(categories.name)),
    ]);
    return { heroes: h, categories: c };
  },
  ["catalog-refs-v1"],
  { revalidate: CATALOG_REVALIDATE_S, tags: [CATALOG_TAG] }
);

let refCache: { at: number; heroes: schema.Hero[]; categories: schema.Category[] } | null = null;

async function getRefs() {
  if (refCache && Date.now() - refCache.at < MEMORY_TTL_MS) return refCache;
  refCache = { at: Date.now(), ...(await cachedRefs()) };
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

const cachedPosts = unstable_cache(
  async () => {
    await ensureDb();
    const rows = await db.select().from(posts).orderBy(desc(posts.publishedAt));
    return rows;
  },
  ["posts-v1"],
  { revalidate: CATALOG_REVALIDATE_S, tags: [CATALOG_TAG] }
);

const cachedReviews = unstable_cache(
  async () => {
    await ensureDb();
    return db.select().from(reviews);
  },
  ["reviews-v1"],
  { revalidate: CATALOG_REVALIDATE_S, tags: [CATALOG_TAG] }
);

type Post = typeof posts.$inferSelect;

function revivePost(p: Post): Post {
  return { ...p, publishedAt: new Date(p.publishedAt as unknown as string) } as Post;
}

export async function getPosts(): Promise<Post[]> {
  return (await cachedPosts()).map(revivePost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}

export async function getReviews() {
  return cachedReviews();
}

/** Cart / wishlist display. Checkout re-reads prices from the database. */
export async function getItemsByIds(ids: number[]): Promise<ItemWithRefs[]> {
  if (!ids.length) return [];
  const wanted = new Set(ids);
  return (await allItems()).filter((r) => wanted.has(r.id));
}
