"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "runevault.cookie-consent";

/**
 * Only essential cookies/storage are used and no analytics or advertising
 * services are connected, so this is a notice rather than a consent choice.
 * If optional technologies are ever added, restore a real accept/refuse choice
 * that gates them (see the Cookie Policy).
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {}
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "notice-seen");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="Cookie notice" className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-panel/98 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center">
        <div className="flex-1 text-sm text-sage">
          <p className="mb-1 font-semibold text-parchment">Cookies and browser storage</p>
          <p>
            We only use the cookies and browser storage needed to run the store — sign-in, cart, checkout security and
            your settings. We do not use analytics or advertising cookies. Read our{" "}
            <Link href="/legal/cookies" className="text-teal hover:underline">Cookie Policy</Link>.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={dismiss} className="btn-gold text-sm">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
