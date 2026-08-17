"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/wallet", label: "Wallet" },
  { href: "/dashboard/orders", label: "Orders & activity" },
  { href: "/wishlist", label: "Wishlist" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const logout = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/");
    router.refresh();
  };

  return (
    <nav aria-label="Account" className="card-surface p-2">
      <ul className="space-y-0.5">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-gold/10 text-gold" : "text-parchment/80 hover:bg-card hover:text-gold"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-hairline pt-2">
        <button
          type="button"
          onClick={logout}
          disabled={signingOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sage transition-colors hover:bg-card hover:text-loss disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
