import "server-only";
import { db, schema, ensureDb } from "./db";
import rustItemsRaw from "./db/rust-items.json";

interface RustItem {
  slug: string;
  name: string;
  marketHashName: string;
  image: string;
  color: string | null;
  category: string;
  rarity: string;
  priceMinor: number;
  stock: number;
  popularity?: number;
}

const CATEGORY_META: Record<string, { name: string; description: string }> = {
  weapons: { name: "Weapon Skins", description: "AKs, bolties, SARs and more — dressed for the raid." },
  apparel: { name: "Apparel & Armour", description: "Facemasks, hoodies, jackets and roadsign kits worn on the beach." },
  base: { name: "Base & Building", description: "Doors, boxes, garage doors and lockers to brand your base." },
  deployables: { name: "Deployables", description: "Furnaces, sleeping bags, boxes and decor for the home you defend." },
  tools: { name: "Tools", description: "Hatchets, pickaxes and the gear that starts every wipe." },
};

/**
 * Add catalogue skins from lib/db/rust-items.json that are not in the database
 * yet. Non-destructive: existing items, users and orders are left untouched
 * (unlike the seed). Matches on market_hash_name / slug.
 */
export async function importMissingItems(): Promise<{ added: number; total: number }> {
  await ensureDb();
  const all = rustItemsRaw as RustItem[];

  const cats = await db.select().from(schema.categories);
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));
  for (const slug of new Set(all.map((i) => i.category))) {
    if (catBySlug.has(slug)) continue;
    const cover = all.find((i) => i.category === slug)?.image ?? "";
    const [row] = await db
      .insert(schema.categories)
      .values({
        slug,
        name: CATEGORY_META[slug]?.name ?? slug,
        description: CATEGORY_META[slug]?.description ?? "",
        image: cover,
      })
      .returning();
    catBySlug.set(slug, row.id);
  }

  const existing = await db
    .select({ slug: schema.items.slug, mhn: schema.items.marketHashName })
    .from(schema.items);
  const haveSlug = new Set(existing.map((e) => e.slug));
  const haveMhn = new Set(existing.map((e) => e.mhn).filter(Boolean));

  const fresh = all.filter((i) => !haveMhn.has(i.marketHashName) && !haveSlug.has(i.slug));
  const values = fresh.map((it) => ({
    slug: it.slug,
    name: it.name,
    description: `${it.name} — an authentic Rust skin, delivered to your Steam inventory via trade offer.`,
    heroId: null,
    categoryId: catBySlug.get(it.category)!,
    slot: CATEGORY_META[it.category]?.name ?? it.category,
    rarity: it.rarity as schema.Item["rarity"],
    quality: "standard" as schema.Item["quality"],
    priceMinor: it.priceMinor,
    oldPriceMinor: null,
    image: it.image,
    setContents: null,
    featured: false,
    isNew: true,
    popularity: it.popularity ?? 0,
    marketHashName: it.marketHashName,
    color: it.color,
    stock: it.stock,
  }));
  for (let i = 0; i < values.length; i += 100) {
    await db.insert(schema.items).values(values.slice(i, i + 100)).onConflictDoNothing();
  }
  return { added: values.length, total: existing.length + values.length };
}
