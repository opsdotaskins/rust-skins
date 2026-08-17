import "server-only";

/**
 * Client for the SIH market API (https://api.sih.market/api/v1).
 * Docs: https://docs.sih.app/ — auth via `apikey` header.
 *
 * All market prices from SIH are USD major units (e.g. 1.01 = $1.01).
 * Our storefront stores prices as USD minor units (cents). The retail price
 * we charge is the SIH price plus a configured margin, capped at a max.
 */

const BASE = process.env.SIH_API_BASE || "https://api.sih.market/api/v1";
const API_KEY = process.env.SIH_API_KEY || "";
export const RUST_APP_ID = Number(process.env.SIH_APP_ID) || 252490;

const MARGIN = Number(process.env.SIH_MARGIN) || 0.07;
const MIN_MARGIN_ABS = Number(process.env.SIH_MIN_MARGIN_ABS) || 0.1;
const MAX_ITEM_PRICE = Number(process.env.SIH_MAX_ITEM_PRICE) || 20000;
const PRICE_TOLERANCE = Number(process.env.SIH_PRICE_TOLERANCE) || 0.03;

/** Test mode: SIH does not debit the project balance. On unless SIH_LIVE=1. */
export const SIH_TEST_MODE =
  process.env.SIH_LIVE !== "1" && process.env.SIH_TEST_MODE !== "false";

export interface SihItem {
  price: number; // USD, cheapest listing
  count: number; // listings available
  phase?: string;
  market?: string;
  sell?: number;
  steam?: number; // steam market reference price
  image: string; // full image URL
  color?: string; // hex rarity/paint colour
}

export interface SihItemsResponse {
  success: boolean;
  items?: Record<string, SihItem>;
  error?: string;
}

export interface SihMinItemResponse {
  success: boolean;
  items?: Record<string, { price: number; count: number }>;
  error?: string;
}

export interface SihCreateOrderResponse {
  success: boolean;
  id?: number;
  balance?: number;
  error?: string;
}

export type SihOrderStatus =
  | "created"
  | "processing"
  | "sent"
  | "finished"
  | "failed"
  | "penalized";

export interface SihOrder {
  id: number;
  customId?: string;
  status: SihOrderStatus;
  error?: string;
  item?: string;
  amount?: number;
}

export interface SihProject {
  id: number;
  name: string;
  balance: number;
  webhook?: string;
}

class SihError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "SihError";
  }
}

async function request<T>(
  method: "GET" | "POST",
  path: string,
  opts: { query?: Record<string, string | number | boolean | undefined>; body?: unknown } = {}
): Promise<T> {
  if (!API_KEY || API_KEY === "placeholder-sih-key") {
    throw new SihError("SIH_API_KEY is not configured");
  }
  const url = new URL(`${BASE}${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url, {
    method,
    headers: {
      apikey: API_KEY,
      ...(opts.body ? { "content-type": "application/json" } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    throw new SihError(`SIH returned non-JSON (${res.status})`, res.status);
  }
  const data = json as { success?: boolean; error?: string } & T;
  if (!res.ok || data?.success === false) {
    throw new SihError(data?.error || `SIH request failed (${res.status})`, res.status);
  }
  return data as T;
}

/** Fetch the full Rust item catalogue keyed by market_hash_name. */
export async function getItems(appId = RUST_APP_ID): Promise<Record<string, SihItem>> {
  const data = await request<SihItemsResponse>("GET", "/get-items", {
    query: { appId, extended: true },
  });
  return data.items ?? {};
}

/** Cheapest current price for a single item (used to re-check at checkout). */
export async function getMinItemPrice(
  marketHashName: string,
  appId = RUST_APP_ID
): Promise<{ price: number; count: number } | null> {
  const data = await request<SihMinItemResponse>("GET", "/get-min-item", {
    query: { item: marketHashName, appId },
  });
  const entry = data.items?.[marketHashName];
  return entry ?? null;
}

/** Project wallet balance (funds SIH will draw purchases from). */
export async function getProject(): Promise<SihProject> {
  const data = await request<{ success: boolean; project: SihProject }>("GET", "/project");
  return data.project;
}

/** Place a buy order. Delivered to the buyer's Steam via a trade offer. */
export async function createOrder(input: {
  steamId: string;
  token: string; // trade link token
  amount: number; // USD price we authorise paying the seller
  item: string; // market_hash_name
  customId: string; // our order reference
  appId?: number;
  test?: boolean;
}): Promise<SihCreateOrderResponse> {
  return request<SihCreateOrderResponse>("POST", "/create-order", {
    body: {
      steamId: input.steamId,
      token: input.token,
      amount: input.amount,
      item: input.item,
      customId: input.customId,
      appId: input.appId ?? RUST_APP_ID,
      test: input.test ?? SIH_TEST_MODE,
    },
  });
}

/** Poll a single order by our customId or SIH id. */
export async function getOrder(params: {
  id?: number;
  customId?: string;
}): Promise<SihOrder | null> {
  const data = await request<{ success: boolean; order?: SihOrder } & SihOrder>(
    "GET",
    "/get-order",
    { query: { id: params.id, customId: params.customId } }
  );
  // API may return the order at the top level or nested under `order`.
  return (data.order ?? (data.id ? (data as unknown as SihOrder) : null)) ?? null;
}

// ---------- Pricing ----------

/**
 * Retail price (USD cents) we charge for an item given its SIH cost.
 * Applies the relative margin, enforces a minimum absolute margin, and caps
 * at the configured maximum. Returns null for items above the cap.
 */
export function retailCents(sihPriceUsd: number): number | null {
  if (!Number.isFinite(sihPriceUsd) || sihPriceUsd <= 0) return null;
  if (sihPriceUsd > MAX_ITEM_PRICE) return null;
  const withMargin = Math.max(sihPriceUsd * (1 + MARGIN), sihPriceUsd + MIN_MARGIN_ABS);
  return Math.round(withMargin * 100);
}

/**
 * The max USD amount we authorise SIH to spend for a purchase. Allows a small
 * upward tolerance so the buy still succeeds if the market moved slightly.
 */
export function buyCeilingUsd(sihPriceUsd: number): number {
  return Math.round(sihPriceUsd * (1 + PRICE_TOLERANCE) * 100) / 100;
}

export { SihError };
