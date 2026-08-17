"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  steamId: string | null;
  steamName: string | null;
  steamAvatar: string | null;
  hasTradeToken: boolean;
}

export function SteamLinkPanel({ steamId, steamName, steamAvatar, hasTradeToken }: Props) {
  const router = useRouter();
  const [tradeUrl, setTradeUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(hasTradeToken);
  const [busy, setBusy] = useState(false);

  const saveTradeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/steam/trade-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save trade URL");
      setSaved(true);
      setTradeUrl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save trade URL");
    } finally {
      setBusy(false);
    }
  };

  const unlink = async () => {
    setBusy(true);
    await fetch("/api/steam/trade-url", { method: "DELETE" });
    setSaved(false);
    router.refresh();
    setBusy(false);
  };

  return (
    <div className="card-surface space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-parchment">Steam account</h2>
          <p className="text-sm text-sage">
            Link Steam so we can deliver skins straight to your inventory.
          </p>
        </div>
      </div>

      {steamId ? (
        <div className="flex items-center gap-3 rounded-md border border-hairline bg-well/40 p-3">
          {steamAvatar ? (
            <Image
              src={steamAvatar}
              alt={steamName ?? "Steam avatar"}
              width={48}
              height={48}
              className="rounded-md"
            />
          ) : null}
          <div className="min-w-0">
            <p className="truncate font-medium text-parchment">{steamName ?? "Steam user"}</p>
            <p className="truncate font-mono text-xs text-sage">{steamId}</p>
          </div>
          <span className="ml-auto rounded-full bg-profit/10 px-2 py-1 text-[11px] text-profit">
            Linked
          </span>
        </div>
      ) : (
        <a href="/api/steam/login" className="btn-gold inline-flex w-full justify-center">
          Sign in through Steam
        </a>
      )}

      {steamId && (
        <form onSubmit={saveTradeUrl} className="space-y-3 border-t border-hairline pt-4">
          <label className="block">
            <span className="engraved mb-1 block text-[9px] text-sage">
              Steam trade URL {saved && <span className="text-profit">— saved</span>}
            </span>
            <input
              type="url"
              placeholder="https://steamcommunity.com/tradeoffer/new/?partner=…&token=…"
              value={tradeUrl}
              onChange={(e) => setTradeUrl(e.target.value)}
              className="w-full rounded-md border border-hairline bg-well/60 px-3 py-2.5 font-mono text-sm text-parchment focus:border-gold/40 focus:outline-none"
            />
          </label>
          <p className="text-[11px] text-sage">
            Find it in Steam → Inventory → Trade Offers → Who can send me Trade Offers.
          </p>
          {error && <p className="text-sm text-loss">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy || !tradeUrl} className="btn-gold flex-1">
              {busy ? "Saving…" : "Save trade URL"}
            </button>
            <button
              type="button"
              onClick={unlink}
              disabled={busy}
              className="rounded-md border border-hairline px-4 text-sm text-sage hover:border-loss/50 hover:text-loss"
            >
              Unlink
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
