/**
 * Currency system. Base currency is USD (the Rust market is USD-denominated);
 * all prices are stored in minor units (cents) of USD. The header selection
 * converts and re-renders every price. Rates are static, representative fixtures.
 */

export type CurrencyCode = "USD" | "EUR" | "GBP";

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  /** Units of this currency per 1 USD. */
  rate: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: { code: "USD", symbol: "$", locale: "en-US", rate: 1 },
  EUR: { code: "EUR", symbol: "€", locale: "de-DE", rate: 0.92 },
  GBP: { code: "GBP", symbol: "£", locale: "en-GB", rate: 0.79 },
};

export const DEFAULT_CURRENCY: CurrencyCode = "USD";
export const CURRENCY_STORAGE_KEY = "runevault.currency";

/** Convert base (USD) minor units into a display amount in the target currency. */
export function convertFromMinor(
  baseMinor: number,
  code: CurrencyCode
): number {
  const meta = CURRENCIES[code];
  return (baseMinor / 100) * meta.rate;
}

/** Convert a display amount (major units) in a currency back to base (USD) minor. */
export function toGbpMinor(amount: number, code: CurrencyCode): number {
  const meta = CURRENCIES[code];
  return Math.round((amount / meta.rate) * 100);
}

/** Format base (USD) minor units in the selected currency. Never returns NaN. */
export function formatMinor(
  baseMinor: number | null | undefined,
  code: CurrencyCode
): string {
  const meta = CURRENCIES[code];
  const value = Number.isFinite(baseMinor as number)
    ? convertFromMinor(baseMinor as number, code)
    : 0;
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: meta.code,
  }).format(value);
}

/** Format an already-converted major amount safely (guards £NaN). */
export function formatAmount(amount: number, code: CurrencyCode): string {
  const meta = CURRENCIES[code];
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: meta.code,
  }).format(safe);
}
