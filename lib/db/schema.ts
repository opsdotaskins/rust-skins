import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- Enums ----------
export const rarityEnum = pgEnum("rarity", [
  "common",
  "uncommon",
  "rare",
  "mythical",
  "legendary",
  "immortal",
  "arcana",
  "ancient",
]);

export const qualityEnum = pgEnum("quality", [
  "standard",
  "inscribed",
  "autographed",
  "genuine",
  "unusual",
  "corrupted",
  "exalted",
  "frozen",
  "golden",
]);

export const attributeEnum = pgEnum("attribute", [
  "strength",
  "agility",
  "intelligence",
  "universal",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "delivered",
  "cancelled",
  "refunded",
]);

export const txnTypeEnum = pgEnum("txn_type", ["topup", "purchase", "refund"]);

// ---------- Users & auth ----------
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: varchar("first_name", { length: 120 }).notNull(),
    lastName: varchar("last_name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    dateOfBirth: date("date_of_birth").notNull(),
    // Address split into 4 separate fields (client requirement)
    street: varchar("street", { length: 255 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    country: varchar("country", { length: 120 }).notNull(),
    postalCode: varchar("postal_code", { length: 40 }).notNull(),
    // Store wallet balance, stored in minor units (cents) of base currency USD
    balanceMinor: integer("balance_minor").notNull().default(0),
    emailVerified: boolean("email_verified").notNull().default(false),
    // Steam account link (required to receive skins via trade offer).
    steamId: varchar("steam_id", { length: 32 }),
    steamName: varchar("steam_name", { length: 120 }),
    steamAvatar: text("steam_avatar"),
    // Token parsed from the user's Steam trade URL.
    steamTradeToken: varchar("steam_trade_token", { length: 32 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  })
);

export const tokens = pgTable(
  "tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 128 }).notNull(),
    purpose: varchar("purpose", { length: 40 }).notNull(), // verify | reset
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    tokenIdx: index("tokens_token_idx").on(t.token),
  })
);

// ---------- Catalog ----------
export const heroes = pgTable(
  "heroes",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    attribute: attributeEnum("attribute").notNull(),
    portrait: text("portrait").notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("heroes_slug_idx").on(t.slug),
    attrIdx: index("heroes_attr_idx").on(t.attribute),
  })
);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull().default(""),
    image: text("image").notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("categories_slug_idx").on(t.slug),
  })
);

export const items = pgTable(
  "items",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description").notNull().default(""),
    heroId: integer("hero_id").references(() => heroes.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    slot: varchar("slot", { length: 80 }).notNull().default(""),
    rarity: rarityEnum("rarity").notNull(),
    quality: qualityEnum("quality").notNull().default("standard"),
    // Prices stored in minor units of base currency USD (cents)
    priceMinor: integer("price_minor").notNull(),
    oldPriceMinor: integer("old_price_minor"),
    image: text("image").notNull(),
    setContents: text("set_contents"), // JSON array of piece names
    featured: boolean("featured").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),
    popularity: integer("popularity").notNull().default(0),
    // SIH market linkage — the Steam market_hash_name used to buy this skin.
    marketHashName: varchar("market_hash_name", { length: 220 }),
    // Exact accent colour from SIH (hex) for the rarity glow.
    color: varchar("color", { length: 16 }),
    // Listings available on the market at last sync.
    stock: integer("stock").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("items_slug_idx").on(t.slug),
    heroIdx: index("items_hero_idx").on(t.heroId),
    catIdx: index("items_cat_idx").on(t.categoryId),
    rarityIdx: index("items_rarity_idx").on(t.rarity),
    priceIdx: index("items_price_idx").on(t.priceMinor),
    mhnIdx: uniqueIndex("items_mhn_idx").on(t.marketHashName),
  })
);

// ---------- Orders & wallet ----------
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    reference: varchar("reference", { length: 40 }).notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull().default("pending"),
    subtotalMinor: integer("subtotal_minor").notNull(),
    feeMinor: integer("fee_minor").notNull().default(0),
    totalMinor: integer("total_minor").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    // Steam account the skins are delivered to (snapshot at purchase time).
    steamId: varchar("steam_id", { length: 32 }),
    // Aggregate SIH delivery status across the order's line purchases.
    sihStatus: varchar("sih_status", { length: 24 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    refIdx: uniqueIndex("orders_reference_idx").on(t.reference),
    userIdx: index("orders_user_idx").on(t.userId),
  })
);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  name: varchar("name", { length: 200 }).notNull(),
  unitPriceMinor: integer("unit_price_minor").notNull(),
  quantity: integer("quantity").notNull().default(1),
  // Per-line SIH purchase linkage (one create-order per skin).
  marketHashName: varchar("market_hash_name", { length: 220 }),
  sihOrderId: integer("sih_order_id"),
  sihStatus: varchar("sih_status", { length: 24 }),
  sihError: text("sih_error"),
});

export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: txnTypeEnum("type").notNull(),
    amountMinor: integer("amount_minor").notNull(), // + credit, - debit
    description: varchar("description", { length: 255 }).notNull(),
    orderId: integer("order_id").references(() => orders.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("transactions_user_idx").on(t.userId),
  })
);

// ---------- Blog ----------
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    cover: text("cover").notNull(),
    author: varchar("author", { length: 120 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    readingMinutes: integer("reading_minutes").notNull().default(5),
    publishedAt: timestamp("published_at").notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("posts_slug_idx").on(t.slug),
  })
);

// ---------- Reviews (Rust-themed, curated) ----------
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  authorName: varchar("author_name", { length: 120 }).notNull(),
  avatar: text("avatar").notNull(),
  rating: integer("rating").notNull().default(5),
  body: text("body").notNull(),
  itemName: varchar("item_name", { length: 200 }).notNull().default(""),
});

// ---------- Relations ----------
export const itemsRelations = relations(items, ({ one }) => ({
  hero: one(heroes, { fields: [items.heroId], references: [heroes.id] }),
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

// ---------- Inferred types ----------
export type User = typeof users.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Hero = typeof heroes.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Review = typeof reviews.$inferSelect;
