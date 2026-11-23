/**
 * Import Rust skins from the live SIH market feed into the catalogue.
 *
 *   SIH  /get-items (appId 252490)  → which skins are buyable, price, stock
 *   Steam Community Market search   → image (icon_url) and rarity colour
 *
 * The merged result is written to lib/db/rust-items.json (the catalogue the
 * seed and the /api/admin/sync?import=1 endpoint read). Existing entries are
 * kept as they are; only new market_hash_names are appended.
 *
 * Usage:
 *   npm run catalog:import                 # crawl (resumable) + write JSON
 *   npm run catalog:import -- --dry-run    # report counts only
 *
 * The Steam crawl is rate-limited (~10 items per request), so it is cached in
 * scripts/.cache/steam-market-rust.json and resumes where it stopped.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { classifyCategory, rarityForPrice, slugify } from "../lib/catalog-classify";

const ROOT = process.cwd();
const JSON_PATH = path.join(ROOT, "lib/db/rust-items.json");
const CACHE_DIR = path.join(ROOT, "scripts/.cache");
const STEAM_CACHE = path.join(CACHE_DIR, "steam-market-rust.json");
const APP_ID = Number(process.env.SIH_APP_ID) || 252490;

const MARGIN = Number(process.env.SIH_MARGIN) || 0.07;
const MIN_MARGIN_ABS = Number(process.env.SIH_MIN_MARGIN_ABS) || 0.1;
const MAX_ITEM_PRICE = Number(process.env.SIH_MAX_ITEM_PRICE) || 20000;

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

interface SteamEntry {
  icon: string;
  color: string | null;
  listings: number;
}

interface SteamCache {
  total: number;
  nextStart: number;
  items: Record<string, SteamEntry>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function retailCents(usd: number): number | null {
  if (!Number.isFinite(usd) || usd <= 0 || usd > MAX_ITEM_PRICE) return null;
  return Math.round(Math.max(usd * (1 + MARGIN), usd + MIN_MARGIN_ABS) * 100);
}

async function fetchSih(): Promise<Record<string, { price: number; count: number }>> {
  const key = process.env.SIH_API_KEY;
  if (!key) throw new Error("SIH_API_KEY is not set (.env)");
  const base = process.env.SIH_API_BASE || "https://api.sih.market/api/v1";
  const res = await fetch(`${base}/get-items?appId=${APP_ID}&extended=true`, {
    headers: { apikey: key },
  });
  const json = (await res.json()) as { success?: boolean; error?: string; items?: Record<string, { price: number; count: number }> };
  if (!json.success || !json.items) throw new Error(`SIH get-items failed: ${json.error ?? res.status}`);
  return json.items;
}

function loadSteamCache(): SteamCache {
  if (existsSync(STEAM_CACHE)) return JSON.parse(readFileSync(STEAM_CACHE, "utf8"));
  return { total: Infinity, nextStart: 0, items: {} };
}

async function crawlSteam(log: (m: string) => void): Promise<SteamCache> {
  mkdirSync(CACHE_DIR, { recursive: true });
  const cache = loadSteamCache();
  let delay = 3500;
  while (cache.nextStart < cache.total) {
    const url =
      `https://steamcommunity.com/market/search/render/?appid=${APP_ID}&norender=1` +
      `&count=100&start=${cache.nextStart}&sort_column=name&sort_dir=asc`;
    const res = await fetch(url, { headers: { "accept-language": "en" } });
    if (res.status === 429 || !res.ok) {
      delay = Math.min(delay * 2, 120_000);
      log(`steam ${res.status} at start=${cache.nextStart}, backing off ${delay / 1000}s`);
      await sleep(delay);
      continue;
    }
    const json = (await res.json()) as {
      success: boolean;
      total_count: number;
      results: { hash_name: string; sell_listings: number; asset_description: { icon_url: string; name_color?: string } }[];
    };
    if (!json.success || !json.results?.length) {
      if (cache.nextStart >= json.total_count) break;
      delay = Math.min(delay * 2, 120_000);
      log(`steam empty page at start=${cache.nextStart}, retrying in ${delay / 1000}s`);
      await sleep(delay);
      continue;
    }
    cache.total = json.total_count;
    for (const r of json.results) {
      cache.items[r.hash_name] = {
        icon: r.asset_description.icon_url,
        color: r.asset_description.name_color ? `#${r.asset_description.name_color}` : null,
        listings: r.sell_listings,
      };
    }
    cache.nextStart += json.results.length;
    writeFileSync(STEAM_CACHE, JSON.stringify(cache));
    if (cache.nextStart % 500 < json.results.length) {
      log(`steam ${cache.nextStart}/${cache.total} (${Object.keys(cache.items).length} cached)`);
    }
    delay = 3500;
    await sleep(delay);
  }
  return cache;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const log = (m: string) => console.log(`[import] ${m}`);

  const existing = JSON.parse(readFileSync(JSON_PATH, "utf8")) as RustItem[];
  const known = new Set(existing.map((i) => i.marketHashName));
  const slugs = new Set(existing.map((i) => i.slug));
  log(`existing catalogue: ${existing.length}`);

  const sih = await fetchSih();
  log(`SIH feed: ${Object.keys(sih).length} items`);

  const steam = await crawlSteam(log);
  log(`Steam market: ${Object.keys(steam.items).length} items with images`);

  const added: RustItem[] = [];
  const skipped = { noStock: 0, noPrice: 0, noImage: 0 };
  for (const [mhn, offer] of Object.entries(sih)) {
    if (known.has(mhn)) continue;
    if (!offer.count) { skipped.noStock++; continue; }
    const cents = retailCents(offer.price);
    if (cents == null) { skipped.noPrice++; continue; }
    const st = steam.items[mhn];
    if (!st?.icon) { skipped.noImage++; continue; }

    let slug = slugify(mhn);
    for (let n = 2; slugs.has(slug); n++) slug = `${slugify(mhn)}-${n}`;
    slugs.add(slug);

    added.push({
      slug,
      name: mhn,
      marketHashName: mhn,
      image: `https://community.cloudflare.steamstatic.com/economy/image/${st.icon}`,
      color: st.color,
      category: classifyCategory(mhn),
      rarity: rarityForPrice(cents),
      priceMinor: cents,
      stock: offer.count,
      popularity: Math.min(50, st.listings || 0),
    });
  }

  const byCat: Record<string, number> = {};
  for (const a of added) byCat[a.category] = (byCat[a.category] ?? 0) + 1;
  log(`new skins: ${added.length} ${JSON.stringify(byCat)}; skipped ${JSON.stringify(skipped)}`);

  if (dryRun) return;
  const merged = [...existing, ...added].sort((a, b) => b.priceMinor - a.priceMinor);
  writeFileSync(JSON_PATH, JSON.stringify(merged, null, 2) + "\n");
  log(`wrote ${merged.length} skins → lib/db/rust-items.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
