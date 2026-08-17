"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "runevault.cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [manage, setManage] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {}
  }, []);

  const decide = (choice: "all" | "essential") => {
    try {
      localStorage.setItem(KEY, choice);
    } catch {}
    setVisible(false);
    setManage(false);
  };

  return (
    <>
      {/* Persistent management access */}
      <button
        type="button"
        onClick={() => {
          setManage(true);
          setVisible(true);
        }}
        className="fixed bottom-4 left-4 z-40 hidden rounded-full border border-hairline bg-panel/90 px-3 py-1.5 text-xs text-sage shadow-relic backdrop-blur hover:text-gold data-[hidden=false]:block"
        data-hidden={visible ? "true" : "false"}
        aria-label="Manage cookie preferences"
      >
        Cookie settings
      </button>

      {visible && (
        <div role="dialog" aria-label="Cookie consent" className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-panel/98 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center">
            <div className="flex-1 text-sm text-sage">
              <p className="mb-1 font-semibold text-parchment">We use cookies</p>
              <p>
                Runevault uses essential cookies to run the store and optional cookies to improve your experience. Read our{" "}
                <Link href="/legal/cookies" className="text-teal hover:underline">Cookie Policy</Link>.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => decide("essential")} className="btn-ghost text-sm">
                Essential only
              </button>
              <button type="button" onClick={() => decide("all")} className="btn-gold text-sm">
                Accept all
              </button>
            </div>
            {manage && (
              <button type="button" onClick={() => setVisible(false)} aria-label="Close" className="absolute right-3 top-3 text-sage hover:text-gold">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
