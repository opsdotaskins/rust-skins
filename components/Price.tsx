"use client";
import { useCurrency } from "./providers";

export function Price({
  gbpMinor,
  className = "",
}: {
  gbpMinor: number | null | undefined;
  className?: string;
}) {
  const { format } = useCurrency();
  return <span className={`font-mono ${className}`}>{format(gbpMinor)}</span>;
}

export function PriceWithOld({
  priceMinor,
  oldPriceMinor,
}: {
  priceMinor: number;
  oldPriceMinor?: number | null;
}) {
  const { format } = useCurrency();
  return (
    <span className="flex items-baseline gap-2">
      <span className="font-mono text-gold">{format(priceMinor)}</span>
      {oldPriceMinor ? (
        <span className="font-mono text-xs text-sage line-through">
          {format(oldPriceMinor)}
        </span>
      ) : null}
    </span>
  );
}
