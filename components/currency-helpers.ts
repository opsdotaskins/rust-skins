"use client";
import { convertFromMinor, type CurrencyMeta } from "@/lib/currency";

export { useCurrency } from "./providers";

/** GBP minor → display-currency major, rounded to 2dp, as a string for inputs. */
export function convertLabel(gbpMinor: number, meta: CurrencyMeta): string {
  const v = convertFromMinor(gbpMinor, meta.code);
  return (Math.round(v * 100) / 100).toString();
}
