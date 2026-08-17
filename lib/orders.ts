import "server-only";
import { db, schema, ensureDb } from "./db";
import { eq, inArray, desc } from "drizzle-orm";
import { VALUES } from "./config";
import {
  createOrder as sihCreateOrder,
  getMinItemPrice,
  buyCeilingUsd,
  SIH_TEST_MODE,
  SihError,
} from "./sih";

const { items, orders, orderItems, transactions, users } = schema;

export interface CartInput {
  id: number;
  quantity: number;
}

/** Raised when the buyer has not linked a Steam account + trade URL. */
export class SteamNotLinkedError extends Error {
  constructor() {
    super("Link your Steam account and trade URL before buying.");
    this.name = "SteamNotLinkedError";
  }
}

/** Raised when the wallet cannot cover the order (card fallback disabled for live buys). */
export class InsufficientBalanceError extends Error {
  constructor() {
    super("Your wallet balance does not cover this order.");
    this.name = "InsufficientBalanceError";
  }
}

export function makeReference() {
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  const stamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `RV-${stamp}${rnd}`;
}

/**
 * Create a paid order and dispatch each skin to the buyer's Steam account via
 * the SIH market (trade offer). Retail prices come from the DB (authoritative);
 * the amount we authorise SIH to spend is re-checked against the live market.
 *
 * The buyer must have linked a Steam account and saved a trade URL. Payment is
 * taken from the wallet; card is a UI placeholder only.
 */
export async function createOrder(
  userId: number,
  cart: CartInput[],
  payWithBalance: boolean
) {
  await ensureDb();
  const ids = cart.map((c) => c.id);
  if (!ids.length) throw new Error("Cart is empty");

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("User not found");
  if (!user.steamId || !user.steamTradeToken) throw new SteamNotLinkedError();

  const rows = await db.select().from(items).where(inArray(items.id, ids));
  const byId = new Map(rows.map((r) => [r.id, r]));

  const lines = cart
    .map((c) => {
      const it = byId.get(c.id);
      if (!it) return null;
      return { item: it, quantity: Math.max(1, c.quantity) };
    })
    .filter(Boolean) as { item: schema.Item; quantity: number }[];

  if (!lines.length) throw new Error("No valid items in cart");

  const subtotalMinor = lines.reduce(
    (s, l) => s + l.item.priceMinor * l.quantity,
    0
  );
  const feeMinor = VALUES.serviceFeeMinor;
  const totalMinor = subtotalMinor + feeMinor;

  // Wallet must cover the order (single source of truth for payment).
  if (user.balanceMinor < totalMinor) throw new InsufficientBalanceError();

  const reference = makeReference();

  const [order] = await db
    .insert(orders)
    .values({
      reference,
      userId,
      status: "paid",
      subtotalMinor,
      feeMinor,
      totalMinor,
      currency: "USD",
      steamId: user.steamId,
      sihStatus: "created",
    })
    .returning();

  // Charge the wallet up front.
  await db
    .update(users)
    .set({ balanceMinor: user.balanceMinor - totalMinor })
    .where(eq(users.id, userId));
  await db.insert(transactions).values({
    userId,
    type: "purchase",
    amountMinor: -totalMinor,
    description: `Order ${reference}`,
    orderId: order.id,
  });

  // Dispatch each line to SIH (one purchase per unit).
  const insertedLines: (typeof schema.orderItems.$inferInsert)[] = [];
  const statuses: string[] = [];
  for (const l of lines) {
    for (let unit = 0; unit < l.quantity; unit++) {
      const mhn = l.item.marketHashName;
      const line: typeof schema.orderItems.$inferInsert = {
        orderId: order.id,
        itemId: l.item.id,
        name: l.item.name,
        unitPriceMinor: l.item.priceMinor,
        quantity: 1,
        marketHashName: mhn,
      };
      if (!mhn) {
        line.sihStatus = "failed";
        line.sihError = "Item is not linked to the market";
        statuses.push("failed");
        insertedLines.push(line);
        continue;
      }
      try {
        // Re-check live cost; authorise a small tolerance above it.
        const min = await getMinItemPrice(mhn);
        const costUsd = min?.price ?? l.item.priceMinor / 100;
        const authorised = buyCeilingUsd(costUsd);
        const res = await sihCreateOrder({
          steamId: user.steamId!,
          token: user.steamTradeToken!,
          amount: authorised,
          item: mhn,
          customId: `${reference}-${order.id}-${insertedLines.length}`,
          test: SIH_TEST_MODE,
        });
        line.sihOrderId = res.id ?? null;
        line.sihStatus = "created";
        statuses.push("created");
      } catch (e) {
        line.sihStatus = "failed";
        line.sihError = e instanceof SihError ? e.message : "Market order failed";
        statuses.push("failed");
      }
      insertedLines.push(line);
    }
  }
  await db.insert(orderItems).values(insertedLines);

  // Aggregate status: failed if any line failed, else created (awaiting trade).
  const anyFailed = statuses.includes("failed");
  const allFailed = statuses.length > 0 && statuses.every((s) => s === "failed");
  const aggregate = allFailed ? "failed" : anyFailed ? "partial" : "created";
  await db
    .update(orders)
    .set({ sihStatus: aggregate, status: allFailed ? "cancelled" : "paid" })
    .where(eq(orders.id, order.id));

  // If every purchase failed, refund the wallet so the buyer is not charged.
  if (allFailed) {
    await db
      .update(users)
      .set({ balanceMinor: user.balanceMinor })
      .where(eq(users.id, userId));
    await db.insert(transactions).values({
      userId,
      type: "refund",
      amountMinor: totalMinor,
      description: `Refund for failed order ${reference}`,
      orderId: order.id,
    });
  }

  return {
    reference,
    orderId: order.id,
    totalMinor,
    subtotalMinor,
    feeMinor,
    lines,
    sihStatus: aggregate,
    testMode: SIH_TEST_MODE,
  };
}

export async function topUp(userId: number, amountMinor: number) {
  if (amountMinor <= 0) throw new Error("Invalid amount");
  await ensureDb();
  const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!u) throw new Error("User not found");
  await db
    .update(users)
    .set({ balanceMinor: u.balanceMinor + amountMinor })
    .where(eq(users.id, userId));
  await db.insert(transactions).values({
    userId,
    type: "topup",
    amountMinor,
    description: "Wallet top-up",
  });
  return u.balanceMinor + amountMinor;
}

/**
 * Poll SIH for the latest delivery status of each line in an order and persist
 * it. Safe to call on every order-page view. Returns the aggregate status.
 */
export async function refreshOrderStatus(orderId: number) {
  await ensureDb();
  const lines = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const { getOrder } = await import("./sih");
  const statuses: string[] = [];
  for (const line of lines) {
    if (!line.sihOrderId) {
      statuses.push(line.sihStatus ?? "failed");
      continue;
    }
    if (line.sihStatus === "finished" || line.sihStatus === "failed") {
      statuses.push(line.sihStatus);
      continue;
    }
    try {
      const remote = await getOrder({ id: line.sihOrderId });
      if (remote?.status) {
        await db
          .update(orderItems)
          .set({ sihStatus: remote.status, sihError: remote.error ?? null })
          .where(eq(orderItems.id, line.id));
        statuses.push(remote.status);
        continue;
      }
    } catch {
      // keep prior status on transient failure
    }
    statuses.push(line.sihStatus ?? "created");
  }

  const allDone = statuses.length > 0 && statuses.every((s) => s === "finished");
  const anyFailed = statuses.some((s) => s === "failed" || s === "penalized");
  const aggregate = allDone
    ? "finished"
    : anyFailed && statuses.some((s) => s === "finished")
      ? "partial"
      : anyFailed
        ? "failed"
        : statuses.some((s) => s === "sent")
          ? "sent"
          : "processing";
  await db.update(orders).set({ sihStatus: aggregate }).where(eq(orders.id, orderId));
  return aggregate;
}

export async function getOrderByReference(reference: string, userId: number) {
  await ensureDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.reference, reference))
    .limit(1);
  if (!order || order.userId !== userId) return null;
  const lines = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  return { order, lines };
}

export async function getUserOrders(userId: number) {
  await ensureDb();
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getUserTransactions(userId: number) {
  await ensureDb();
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt));
}
