import "server-only";
import { db, schema, ensureDb } from "./db";
import { and, asc, desc, eq, gte, inArray, lte, sql, or, ilike } from "drizzle-orm";
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

export async function getCatalog(filters: CatalogFilters): Promise<ItemWithRefs[]> {
  await ensureDb();
  const conds = [];
  if (filters.hero) conds.push(eq(heroes.slug, filters.hero));
  if (filters.attribute)
    conds.push(eq(heroes.attribute, filters.attribute as schema.Hero["attribute"]));
  if (filters.category) conds.push(eq(categories.slug, filters.category));
  if (filters.slot) conds.push(eq(items.slot, filters.slot));
  if (filters.rarities?.length)
    conds.push(inArray(items.rarity, filters.rarities));
  if (filters.quality) conds.push(eq(items.quality, filters.quality as schema.Item["quality"]));
  if (filters.minGbpMinor != null) conds.push(gte(items.priceMinor, filters.minGbpMinor));
  if (filters.maxGbpMinor != null) conds.push(lte(items.priceMinor, filters.maxGbpMinor));
  if (filters.q)
    conds.push(
      or(ilike(items.name, `%${filters.q}%`), ilike(heroes.name, `%${filters.q}%`))!
    );

  let rows = await withRefsSelect().where(conds.length ? and(...conds) : undefined);

  switch (filters.sort) {
    case "price-asc": rows.sort((a, b) => a.priceMinor - b.priceMinor); break;
    case "price-desc": rows.sort((a, b) => b.priceMinor - a.priceMinor); break;
    case "newest": rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); break;
    case "rarity": rows.sort((a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity]); break;
    default: rows.sort((a, b) => b.popularity - a.popularity);
  }
  return rows as ItemWithRefs[];
}

export async function getItemBySlug(slug: string): Promise<ItemWithRefs | null> {
  await ensureDb();
  const rows = await withRefsSelect().where(eq(items.slug, slug)).limit(1);
  return (rows[0] as ItemWithRefs) ?? null;
}

export async function getFeatured(limit = 8) {
  await ensureDb();
  const rows = await withRefsSelect().where(eq(items.featured, true));
  return (rows as ItemWithRefs[]).sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}

export async function getByRarity(rarity: Rarity, limit = 8) {
  await ensureDb();
  const rows = await withRefsSelect().where(eq(items.rarity, rarity));
  return (rows as ItemWithRefs[]).sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}

export async function getNewArrivals(limit = 8) {
  await ensureDb();
  const rows = await withRefsSelect().where(eq(items.isNew, true));
  return (rows as ItemWithRefs[])
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit);
}

export async function getMostExpensive(limit = 6) {
  await ensureDb();
  const rows = await withRefsSelect();
  return (rows as ItemWithRefs[]).sort((a, b) => b.priceMinor - a.priceMinor).slice(0, limit);
}

export async function getRelated(item: ItemWithRefs, limit = 4) {
  await ensureDb();
  const rows = await withRefsSelect().where(
    and(eq(categories.slug, item.categorySlug))
  );
  return (rows as ItemWithRefs[]).filter((r) => r.id !== item.id).slice(0, limit);
}

export async function getHeroes() {
  await ensureDb();
  return db.select().from(heroes).orderBy(asc(heroes.name));
}

export async function getCategories() {
  await ensureDb();
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function getSlots(): Promise<string[]> {
  await ensureDb();
  const rows = await db
    .selectDistinct({ slot: items.slot })
    .from(items)
    .where(sql`${items.slot} <> ''`);
  return rows.map((r) => r.slot).sort();
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
