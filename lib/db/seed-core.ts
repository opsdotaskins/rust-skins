import bcrypt from "bcryptjs";
import * as schema from "./schema";
import rustItemsRaw from "./rust-items.json";

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
}

const rustItems = rustItemsRaw as RustItem[];

const CATEGORY_META: Record<string, { name: string; description: string }> = {
  weapons: {
    name: "Weapon Skins",
    description: "AKs, bolties, SARs and more — dressed for the raid.",
  },
  apparel: {
    name: "Apparel & Armour",
    description: "Facemasks, hoodies, jackets and roadsign kits worn on the beach.",
  },
  base: {
    name: "Base & Building",
    description: "Doors, boxes, garage doors and lockers to brand your base.",
  },
  deployables: {
    name: "Deployables",
    description: "Furnaces, sleeping bags, boxes and decor for the home you defend.",
  },
  tools: {
    name: "Tools",
    description: "Hatchets, pickaxes and the gear that starts every wipe.",
  },
};

// Cover image per category = the priciest item in that category.
function categoryCover(slug: string): string {
  const first = rustItems.find((i) => i.category === slug);
  return first?.image ?? "https://picsum.photos/seed/rust-cat/600/600";
}

const postsData = [
  { slug: "rust-skin-rarity-explained", title: "Rust Skin Values Explained: What Drives a Price", excerpt: "Supply, hype and workshop prestige — the forces that separate a $2 door from a $200 AK.", category: "Market Guides", author: "Corin Blackmane", readingMinutes: 7, cover: categoryCover("weapons") },
  { slug: "trade-safely-steam-trade-offers", title: "Trading Safely: How Steam Trade Offers Deliver Your Skins", excerpt: "How the trade-offer pipeline works, and why a correct trade URL keeps deliveries instant.", category: "Guides", author: "Sable Wren", readingMinutes: 6, cover: categoryCover("apparel") },
  { slug: "building-a-themed-base-loadout", title: "Building a Themed Base: Matching Doors, Boxes and Deployables", excerpt: "Slot by slot, how to assemble a base skin set that reads instantly across the server.", category: "Loadouts", author: "Ivo Frostfell", readingMinutes: 8, cover: categoryCover("base") },
  { slug: "top-ak-skins-worth-collecting", title: "The AK-47 Skins Worth Collecting Right Now", excerpt: "From Alien Red to No Mercy — the assault-rifle finishes that hold their value.", category: "Market Guides", author: "Corin Blackmane", readingMinutes: 6, cover: categoryCover("weapons") },
  { slug: "reading-the-rarity-colours", title: "Reading Rarity: The Colour Scale on Every Card", excerpt: "Common to the rarest tier — what each accent colour means and how to scan a grid fast.", category: "Guides", author: "Sable Wren", readingMinutes: 5, cover: categoryCover("deployables") },
  { slug: "wipe-day-loadout-on-a-budget", title: "Wipe-Day Loadout on a Budget", excerpt: "Kitting out your first wipe without breaking the bank — tools, apparel and one flex piece.", category: "Loadouts", author: "Ivo Frostfell", readingMinutes: 6, cover: categoryCover("tools") },
];

const reviewsData = [
  { authorName: "Marcus Vayne", avatar: "https://picsum.photos/seed/rev-marcus/200/200", rating: 5, body: "Bought an AK skin, linked my Steam, and the trade offer landed in seconds. Flawless.", itemName: "AK Royale" },
  { authorName: "Elena Sorokina", avatar: "https://picsum.photos/seed/rev-elena/200/200", rating: 5, body: "The No Mercy Jacket looks even better in-game. Delivery was instant via trade offer.", itemName: "No Mercy Jacket" },
  { authorName: "Deng Wei", avatar: "https://picsum.photos/seed/rev-deng/200/200", rating: 5, body: "Secure checkout, wallet paid, skin in my inventory. No fuss at all.", itemName: "Blackout Vest" },
  { authorName: "Priya Nair", avatar: "https://picsum.photos/seed/rev-priya/200/200", rating: 4, body: "Huge selection of base skins. Support answered my trade-URL question within minutes.", itemName: "Abyss Garage Door" },
  { authorName: "Tomas Novak", avatar: "https://picsum.photos/seed/rev-tomas/200/200", rating: 5, body: "The rarity glow on the cards makes browsing genuinely fun. Prices were fair.", itemName: "After Death AR" },
  { authorName: "Aisha Bello", avatar: "https://picsum.photos/seed/rev-aisha/200/200", rating: 5, body: "Smoothest skin purchase I've made. Linked Steam once and never looked back.", itemName: "Alien Red" },
  { authorName: "Lukas Berger", avatar: "https://picsum.photos/seed/rev-lukas/200/200", rating: 4, body: "Wallet top-up then instant delivery. Invoice hit my inbox right away.", itemName: "Abyss Boots" },
  { authorName: "Sofia Marino", avatar: "https://picsum.photos/seed/rev-sofia/200/200", rating: 5, body: "Official-feeling storefront, safe delivery, and skins that actually match my base theme.", itemName: "Abyss Locker" },
];

function buildPostBody(title: string, minutes: number): string {
  const paras = [
    `In Rust, a skin is more than decoration — it is identity. ${title} starts from a simple idea: the finishes you run should feel earned, coherent, and unmistakably yours across every wipe.`,
    `Value in the Rust market is driven by scarcity and demand. Retired workshop skins, limited drops and community favourites climb in price, while common finishes stay accessible. Learning to read that market changes how you buy.`,
    `Delivery is the part people worry about most, and it need not be. Every skin here is delivered through a standard Steam trade offer to the account you link — which is why keeping your trade URL correct matters so much.`,
    `Colour is the quickest signal on any card. The accent glow maps to an item's rarity tier, so a grid can be scanned in a glance once you know the scale. That fluency is what separates casual buyers from collectors.`,
    `Loadouts reward coherence. When your door, box, deployables and weapon speak the same visual language, your base reads as a set rather than a pile of unrelated finishes. The best loadouts are considered, not just expensive.`,
    `Whatever your budget, the principle holds: buy what you like, understand what you own, link your Steam once, and let your inventory tell a story only you could have written.`,
  ];
  const needed = Math.max(3, Math.round((minutes * 180) / 60));
  const out: string[] = [];
  let i = 0;
  while (out.join(" ").split(/\s+/).length < needed) {
    out.push(paras[i % paras.length]);
    i++;
    if (i > 40) break;
  }
  return out.join("\n\n");
}

/** Drizzle instance compatible with both neon-http and pglite drivers. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDb = any;

/** Seed the database with the full Rust catalogue. Idempotent: clears first. */
export async function runSeed(db: AnyDb): Promise<void> {
  await db.delete(schema.orderItems);
  await db.delete(schema.transactions);
  await db.delete(schema.orders);
  await db.delete(schema.items);
  await db.delete(schema.categories);
  await db.delete(schema.heroes);
  await db.delete(schema.posts);
  await db.delete(schema.reviews);
  await db.delete(schema.tokens);
  await db.delete(schema.users);

  const usedCats = Array.from(new Set(rustItems.map((i) => i.category)));
  const categoriesData = usedCats.map((slug) => ({
    slug,
    name: CATEGORY_META[slug]?.name ?? slug,
    description: CATEGORY_META[slug]?.description ?? "",
    image: categoryCover(slug),
  }));
  const catRows = await db.insert(schema.categories).values(categoriesData).returning();
  const catBySlug = new Map<string, number>(
    catRows.map((c: schema.Category) => [c.slug, c.id])
  );

  // Rank by price to derive featured / popularity; newest tag on a slice.
  const sorted = [...rustItems].sort((a, b) => b.priceMinor - a.priceMinor);
  const itemValues = sorted.map((it, idx) => ({
    slug: it.slug,
    name: it.name,
    description: `${it.name} — an authentic Rust skin, delivered to your Steam inventory via trade offer.`,
    heroId: null,
    categoryId: catBySlug.get(it.category)!,
    slot: CATEGORY_META[it.category]?.name ?? it.category,
    rarity: it.rarity as schema.Item["rarity"],
    quality: "standard" as schema.Item["quality"],
    priceMinor: it.priceMinor,
    // Mark roughly every sixth skin as discounted so the Deals page has stock.
    oldPriceMinor: idx % 6 === 0 ? Math.round(it.priceMinor * 1.25) : null,
    image: it.image,
    setContents: null,
    featured: idx < 8,
    isNew: idx % 7 === 0,
    popularity: Math.max(1, 100 - idx),
    marketHashName: it.marketHashName,
    color: it.color,
    stock: it.stock,
  }));
  // Insert in chunks to stay within parameter limits on some drivers.
  for (let i = 0; i < itemValues.length; i += 100) {
    await db.insert(schema.items).values(itemValues.slice(i, i + 100));
  }

  await db
    .insert(schema.posts)
    .values(postsData.map((p) => ({ ...p, body: buildPostBody(p.title, p.readingMinutes) })));

  await db.insert(schema.reviews).values(reviewsData);

  const passwordHash = await bcrypt.hash("Treasure123!", 10);
  await db.insert(schema.users).values({
    email: "demo@rust-skins.example.com",
    passwordHash,
    firstName: "Demo",
    lastName: "Raider",
    phone: "+44 7700 900123",
    dateOfBirth: "1996-04-12",
    street: "1 Vault Lane",
    city: "London",
    country: "United Kingdom",
    postalCode: "EC1A 1BB",
    balanceMinor: 25000,
    emailVerified: true,
  });
}
