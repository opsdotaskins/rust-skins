"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Logo } from "./brand/Logo";
import { NAV } from "@/lib/nav";
import { RARITY_META, RARITY_ORDER, type Rarity } from "@/lib/rarity";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { useCart, useCurrency, useTheme, useWishlist } from "./providers";

export interface HeaderUser {
  firstName: string;
  balanceMinor: number;
}

const REASSURANCE = [
  "Instant delivery",
  "Official store",
  "24/7 support",
  "Secure payment",
];

interface SearchHit {
  id: number;
  slug: string;
  name: string;
  image: string;
  rarity: Rarity;
  heroName: string | null;
  priceMinor: number;
}

export function Header({ user }: { user: HeaderUser | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [strip, setStrip] = useState(0);
  const { currency, setCurrency, format } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const cart = useCart();
  const wish = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setStrip((s) => (s + 1) % REASSURANCE.length), 3200);
    return () => clearInterval(id);
  }, []);

  const homeHref = user ? "/dashboard" : "/";

  return (
    <header className="sticky top-0 z-50">
      {/* Top strip */}
      <div className="border-b border-hairline bg-well/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <div className="flex items-center gap-2 text-sage" aria-live="polite">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            <span className="engraved text-[10px]">{REASSURANCE[strip]}</span>
            <span className="hidden text-sage/50 sm:inline">· Official store · 24/7 support</span>
          </div>
          <div className="flex items-center gap-3">
            <CurrencySelector value={currency} onChange={setCurrency} />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="grid h-6 w-6 place-items-center rounded text-sage hover:text-gold"
            >
              {theme === "dark" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className={`border-b border-hairline bg-abyss/95 backdrop-blur transition-all ${scrolled ? "py-2" : "py-3"}`}>
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4">
          <Link href={homeHref} aria-label="Runevault home">
            <Logo size={scrolled ? 26 : 30} />
          </Link>

          <div className="hidden flex-1 md:block">
            <SearchBox format={format} />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {user ? (
              <Link href="/dashboard/wallet" className="hidden items-center gap-1.5 rounded-md border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm sm:flex">
                <span className="engraved text-[9px] text-sage">Balance</span>
                <span className="font-mono text-gold">{format(user.balanceMinor)}</span>
              </Link>
            ) : null}
            <Link href={user ? "/dashboard" : "/login"} aria-label="Account" className="grid h-9 w-9 place-items-center rounded-md text-sage hover:bg-panel hover:text-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
            </Link>
            <Link href="/wishlist" aria-label={`Wishlist, ${wish.ids.length} items`} className="relative grid h-9 w-9 place-items-center rounded-md text-sage hover:bg-panel hover:text-gold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.6 8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg>
              {wish.ids.length > 0 && <Badge n={wish.ids.length} />}
            </Link>
            <MiniCart />
          </div>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-sage md:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </div>
        <div className="mx-auto mt-2 max-w-7xl px-4 md:hidden">
          <SearchBox format={format} />
        </div>
      </div>

      {/* Desktop nav row */}
      <nav aria-label="Primary" className="hidden border-b border-hairline bg-panel/95 backdrop-blur md:block" onMouseLeave={() => setOpenMenu(null)}>
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          {NAV.map((group) => (
            <div key={group.label} className="static" onMouseEnter={() => setOpenMenu(group.label)}>
              <Link
                href={group.href}
                className={`inline-flex items-center gap-1 px-3 py-2.5 text-sm font-medium transition-colors ${openMenu === group.label ? "text-gold" : "text-parchment/80 hover:text-gold"}`}
                aria-expanded={openMenu === group.label}
              >
                {group.label}
              </Link>
              {openMenu === group.label && (
                <MegaPanel group={group} onNavigate={() => setOpenMenu(null)} />
              )}
            </div>
          ))}
        </div>
      </nav>

      {mobileOpen && <MobileDrawer onClose={() => setMobileOpen(false)} />}
    </header>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-abyss">
      {n}
    </span>
  );
}

function CurrencySelector({ value, onChange }: { value: CurrencyCode; onChange: (c: CurrencyCode) => void }) {
  return (
    <label className="flex items-center gap-1 text-sage">
      <span className="sr-only">Currency</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        className="cursor-pointer rounded bg-transparent py-0.5 pr-1 font-mono text-[11px] text-parchment focus:outline-none"
        aria-label="Select currency"
      >
        {Object.values(CURRENCIES).map((c) => (
          <option key={c.code} value={c.code} className="bg-panel text-parchment">
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
      <span className="hidden font-mono text-[10px] text-sage/60 sm:inline">{CURRENCIES[value].locale}</span>
    </label>
  );
}

function SearchBox({ format }: { format: (m: number) => string }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          setHits(await res.json());
          setOpen(true);
        }
      } catch {}
    }, 200);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <form
        role="search"
        action="/catalog"
        className="flex items-center gap-2 rounded-md border border-hairline bg-well/60 px-3 py-2 focus-within:border-gold/40"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8FA093" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          placeholder="Search skins, weapons, apparel…"
          className="w-full bg-transparent text-sm text-parchment placeholder:text-sage/60 focus:outline-none"
          aria-label="Search the vault"
          aria-expanded={open}
          role="combobox"
          aria-controls="search-results"
        />
      </form>
      {open && hits.length > 0 && (
        <ul id="search-results" className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-lg border border-hairline bg-panel p-1.5 shadow-relic" role="listbox">
          {hits.map((h) => (
            <li key={h.id} role="option" aria-selected={false}>
              <Link href={`/item/${h.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md p-2 hover:bg-card">
                <Image src={h.image} alt="" width={40} height={40} className="h-10 w-10 rounded object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-parchment">{h.name}</span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RARITY_META[h.rarity].color }} />
                    {h.heroName && <span className="text-sage">{h.heroName}</span>}
                  </span>
                </span>
                <span className="font-mono text-sm text-gold">{format(h.priceMinor)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MiniCart() {
  const cart = useCart();
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <Link
        href="/cart"
        onMouseEnter={() => setOpen(true)}
        aria-label={`Cart, ${cart.count} items`}
        className="relative grid h-9 w-9 place-items-center rounded-md text-sage hover:bg-panel hover:text-gold"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l2.4 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 7H6" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>
        {cart.count > 0 && <Badge n={cart.count} />}
      </Link>
      {open && cart.lines.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-hairline bg-panel p-3 shadow-relic">
          <p className="engraved mb-2 text-[10px] text-sage">Mini cart</p>
          <ul className="max-h-64 space-y-2 overflow-auto">
            {cart.lines.map((l) => (
              <li key={l.id} className="flex items-center gap-2">
                <Image src={l.image} alt="" width={36} height={36} className="h-9 w-9 rounded object-cover" />
                <span className="min-w-0 flex-1 truncate text-xs text-parchment">{l.name}</span>
                <span className="font-mono text-xs text-gold">{format(l.priceMinor * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2">
            <span className="text-xs text-sage">Subtotal</span>
            <span className="font-mono text-sm text-gold">{format(cart.subtotalMinor)}</span>
          </div>
          <Link href="/cart" className="btn-gold mt-3 w-full text-sm">View cart</Link>
        </div>
      )}
    </div>
  );
}

function MegaPanel({ group, onNavigate }: { group: (typeof NAV)[number]; onNavigate: () => void }) {
  return (
    <div className="absolute left-0 right-0 top-full z-40 border-y border-hairline bg-panel/98 shadow-relic backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-6 px-4 py-6">
        <div className="col-span-2">
          <p className="engraved mb-3 text-[10px] text-sage">{group.label}</p>
          <ul className="grid grid-cols-2 gap-1">
            {group.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={onNavigate} className="block rounded px-2 py-1.5 text-sm text-parchment/80 hover:bg-card hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          {group.rarityQuickFilters && (
            <>
              <p className="engraved mb-3 text-[10px] text-sage">Rarity</p>
              <div className="flex flex-wrap gap-1.5">
                {RARITY_ORDER.map((r) => (
                  <Link key={r} href={`/catalog?rarity=${r}`} onClick={onNavigate} className="rounded-full border border-hairline px-2 py-0.5 text-[10px] hover:border-gold/40" style={{ color: RARITY_META[r].color }}>
                    {RARITY_META[r].label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        {group.featured && (
          <Link href={group.featured.href} onClick={onNavigate} className="group corner-brackets relative block overflow-hidden rounded-lg border border-gold/20 bg-card">
            <Image src={group.featured.image} alt={group.featured.name} width={300} height={200} className="h-32 w-full object-cover transition-transform group-hover:scale-105" />
            <div className="p-3">
              <p className="engraved text-[9px] text-gold">Featured relic</p>
              <p className="mt-1 text-sm text-parchment">{group.featured.name}</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-abyss/70" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] overflow-auto border-l border-hairline bg-panel p-4">
        <div className="mb-4 flex items-center justify-between">
          <Logo size={26} />
          <button onClick={onClose} aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-md text-sage">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <ul className="divide-y divide-hairline">
          {NAV.map((group) => (
            <li key={group.label}>
              <details>
                <summary className="cursor-pointer list-none py-3 text-parchment [&::-webkit-details-marker]:hidden">{group.label}</summary>
                <ul className="pb-2 pl-3">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={onClose} className="block py-1.5 text-sm text-sage hover:text-gold">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/login" onClick={onClose} className="btn-ghost text-sm">Log In</Link>
          <Link href="/register" onClick={onClose} className="btn-gold text-sm">Register</Link>
        </div>
      </div>
    </div>
  );
}
