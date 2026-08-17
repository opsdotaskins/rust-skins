import "server-only";
import { db, schema, ensureDb } from "./db";
import { eq } from "drizzle-orm";
import { getItems, retailCents } from "./sih";

/**
 * Refresh retail prices and stock for catalogue items from the live SIH feed.
 * Matches on market_hash_name. SIH prices update every ~20-30s and the
 * get-items endpoint is rate-limited (4/min), so call this on an interval,
 * not per request. Returns how many rows were updated.
 */
export async function syncPrices(): Promise<{ updated: number; total: number }> {
  await ensureDb();
  const feed = await getItems();

  const rows = await db
    .select({
      id: schema.items.id,
      mhn: schema.items.marketHashName,
      priceMinor: schema.items.priceMinor,
      stock: schema.items.stock,
    })
    .from(schema.items);

  let updated = 0;
  for (const row of rows) {
    if (!row.mhn) continue;
    const entry = feed[row.mhn];
    if (!entry) continue;
    const cents = retailCents(entry.price);
    if (cents == null) continue;
    const stock = entry.count ?? row.stock;
    if (cents === row.priceMinor && stock === row.stock) continue;
    await db
      .update(schema.items)
      .set({ priceMinor: cents, stock })
      .where(eq(schema.items.id, row.id));
    updated++;
  }
  return { updated, total: rows.length };
}
