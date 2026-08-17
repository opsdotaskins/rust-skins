"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/components/providers";
import { PaymentLogos } from "@/components/PaymentLogos";

const PRESETS = [10, 25, 50, 100];

export function TopUpForm() {
  const router = useRouter();
  const { meta, format } = useCurrency();
  const [amount, setAmount] = useState<string>("25");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const parsed = Number.parseFloat(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!valid) return setError("Enter a valid amount");
    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsed, currency: meta.code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Top-up failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Top-up failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-surface space-y-5 p-6">
      <div>
        <p className="engraved mb-2 text-[10px] text-sage">Choose an amount</p>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(String(p))}
              className={`rounded-md border px-2 py-2 font-mono text-sm transition-colors ${
                amount === String(p)
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-hairline text-parchment/80 hover:border-gold/40"
              }`}
            >
              {meta.symbol}{p}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="engraved mb-1 block text-[9px] text-sage">Custom amount ({meta.code})</span>
        <div className="flex items-center gap-2 rounded-md border border-hairline bg-well/60 px-3 focus-within:border-gold/40">
          <span className="font-mono text-sage">{meta.symbol}</span>
          <input
            type="number"
            min="1"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent py-2.5 font-mono text-parchment focus:outline-none"
            aria-label={`Amount in ${meta.code}`}
          />
        </div>
      </label>

      <div className="rounded-md border border-hairline bg-well/40 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-sage">You&apos;ll add</span>
          <span className="font-mono text-lg text-gold">
            {valid ? format(Math.round(parsed / meta.rate * 100)) : format(0)}
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-loss">{error}</p>}

      <button type="submit" disabled={submitting || !valid} className="btn-gold w-full">
        {submitting ? "Processing…" : "Add funds"}
      </button>

      <div className="flex items-center justify-between border-t border-hairline pt-4">
        <span className="text-[11px] text-sage">Secured payment</span>
        <PaymentLogos />
      </div>
    </form>
  );
}
