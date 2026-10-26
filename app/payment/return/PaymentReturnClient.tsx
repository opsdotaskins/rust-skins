"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMinor, type CurrencyCode } from "@/lib/currency";

interface PaymentStatusResponse {
  transactionRef: string;
  status: string;
  type?: string;
  planTitle?: string;
  amountCents?: number;
  currency?: string;
  customerEmail?: string;
  completedAt?: string;
  orderReference?: string;
  error?: string;
}

export function PaymentReturnClient({ initialRef }: { initialRef: string }) {
  const [ref] = useState(initialRef);
  const [data, setData] = useState<PaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let timer: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payments/orders/${encodeURIComponent(ref)}/status`);
        if (!res.ok) {
          if (res.status === 404 && pollCount < 5) {
            // Might still be writing to DB, retry a few times
            timer = setTimeout(() => {
              if (isMounted) setPollCount((c) => c + 1);
            }, 2000);
            return;
          }
        }
        const json = await res.json();
        if (isMounted) {
          setData(json);
          setLoading(false);
          if (json.status === "pending" && pollCount < 30) {
            timer = setTimeout(() => {
              if (isMounted) setPollCount((c) => c + 1);
            }, 2500);
          }
        }
      } catch {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [ref, pollCount]);

  if (!ref) {
    return (
      <div className="corner-brackets rounded-2xl border border-hairline bg-card p-8 text-center shadow-glow-soft">
        <h1 className="font-display text-2xl font-bold text-parchment">No reference provided</h1>
        <p className="mt-2 text-sm text-sage">No payment reference was found in the URL.</p>
        <Link href="/" className="btn-gold mt-6 inline-flex">Return to Home</Link>
      </div>
    );
  }

  const isProcessed = data?.status === "processed" || data?.status === "paid";
  const isFailed = data?.status === "process_failed" || data?.status === "failed" || data?.status === "cancelled";
  const isTopup = data?.type === "wallet_topup" || ref.startsWith("TOPUP-");

  if (loading || data?.status === "pending") {
    return (
      <div className="corner-brackets rounded-2xl border border-gold/25 bg-card p-8 text-center shadow-glow-soft">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
          <svg className="h-7 w-7 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-parchment">Confirming Payment</h1>
        <p className="mt-2 text-sm text-sage">
          We&apos;re waiting for confirmation from Visa / Mastercard. Please don&apos;t close this page.
        </p>
        <p className="mt-3 font-mono text-xs text-gold">{ref}</p>
      </div>
    );
  }

  if (isProcessed) {
    return (
      <div className="corner-brackets rounded-2xl border border-profit/30 bg-card p-8 text-center shadow-glow-soft">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-profit/15 text-profit">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold text-parchment">
          {isTopup ? "Wallet Top-up Successful!" : "Payment Confirmed!"}
        </h1>
        <p className="mt-2 text-sm text-sage">
          {isTopup
            ? "Your wallet balance has been topped up successfully."
            : "Your order has been paid and your skins are being prepared for Steam delivery."}
        </p>
        <p className="mt-2 font-mono text-sm text-gold">{ref}</p>

        {data?.amountCents ? (
          <div className="mx-auto my-6 max-w-xs rounded-lg border border-hairline bg-well/50 p-4">
            <span className="text-xs text-sage">Amount Paid</span>
            <p className="font-mono text-xl font-bold text-parchment">
              {formatMinor(data.amountCents, (data.currency as CurrencyCode) || "EUR")}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {isTopup ? (
            <>
              <Link href="/dashboard/wallet" className="btn-gold">View Wallet</Link>
              <Link href="/catalog" className="btn-ghost">Explore Catalog</Link>
            </>
          ) : (
            <>
              <Link href={`/order/${encodeURIComponent(ref)}`} className="btn-gold">View Order</Link>
              <a href={`/api/payments/orders/${encodeURIComponent(ref)}/invoice`} className="btn-ghost">
                Download PDF Invoice
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="corner-brackets rounded-2xl border border-loss/30 bg-card p-8 text-center shadow-glow-soft">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-loss/15 text-loss">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="font-display text-2xl font-bold text-parchment">
        {isFailed ? "Payment Unsuccessful" : "Payment Pending"}
      </h1>
      <p className="mt-2 text-sm text-sage">
        {isFailed
          ? "The transaction could not be completed or was cancelled. Your card has not been charged."
          : "We haven't received confirmation for this payment yet."}
      </p>
      <p className="mt-2 font-mono text-xs text-loss">{ref}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {isTopup ? (
          <Link href="/dashboard/wallet" className="btn-gold">Back to Wallet</Link>
        ) : (
          <Link href="/checkout" className="btn-gold">Back to Checkout</Link>
        )}
        <Link href="/contact" className="btn-ghost">Contact Support</Link>
      </div>
    </div>
  );
}
