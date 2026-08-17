"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type CurrencyCode,
  DEFAULT_CURRENCY,
  CURRENCY_STORAGE_KEY,
  CURRENCIES,
  formatMinor,
  toGbpMinor as toGbpMinorFn,
} from "@/lib/currency";

// ---------- Currency ----------
interface CurrencyCtx {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (gbpMinor: number | null | undefined) => string;
  toGbpMinor: (displayAmount: number) => number;
  meta: (typeof CURRENCIES)[CurrencyCode];
}
const CurrencyContext = createContext<CurrencyCtx | null>(null);

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within Providers");
  return ctx;
}

// ---------- Theme ----------
type Theme = "dark" | "light";
interface ThemeCtx {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeCtx | null>(null);
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within Providers");
  return ctx;
}

// ---------- Cart ----------
export interface CartLine {
  id: number;
  slug: string;
  name: string;
  priceMinor: number;
  image: string;
  rarity: string;
  quantity: number;
}
interface CartCtx {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
  count: number;
  subtotalMinor: number;
}
const CartContext = createContext<CartCtx | null>(null);
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within Providers");
  return ctx;
}

// ---------- Wishlist ----------
interface WishCtx {
  ids: number[];
  toggle: (id: number) => void;
  has: (id: number) => boolean;
}
const WishContext = createContext<WishCtx | null>(null);
export function useWishlist() {
  const ctx = useContext(WishContext);
  if (!ctx) throw new Error("useWishlist must be used within Providers");
  return ctx;
}

const CART_KEY = "runevault.cart";
const WISH_KEY = "runevault.wishlist";
const THEME_KEY = "runevault.theme";

export function Providers({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [theme, setTheme] = useState<Theme>("dark");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wish, setWish] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
      if (c && CURRENCIES[c]) setCurrencyState(c);
      const t = localStorage.getItem(THEME_KEY) as Theme | null;
      if (t) setTheme(t);
      const cart = localStorage.getItem(CART_KEY);
      if (cart) setLines(JSON.parse(cart));
      const w = localStorage.getItem(WISH_KEY);
      if (w) setWish(JSON.parse(w));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(WISH_KEY, JSON.stringify(wish));
  }, [wish, hydrated]);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, c);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  const add: CartCtx["add"] = useCallback((line, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === line.id);
      if (existing)
        return prev.map((l) =>
          l.id === line.id ? { ...l, quantity: l.quantity + qty } : l
        );
      return [...prev, { ...line, quantity: qty }];
    });
  }, []);
  const remove = useCallback(
    (id: number) => setLines((prev) => prev.filter((l) => l.id !== id)),
    []
  );
  const setQty = useCallback(
    (id: number, qty: number) =>
      setLines((prev) =>
        prev
          .map((l) => (l.id === id ? { ...l, quantity: Math.max(1, qty) } : l))
          .filter((l) => l.quantity > 0)
      ),
    []
  );
  const clear = useCallback(() => setLines([]), []);

  const toggleWish = useCallback(
    (id: number) =>
      setWish((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      ),
    []
  );

  const subtotalMinor = lines.reduce(
    (sum, l) => sum + l.priceMinor * l.quantity,
    0
  );
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        format: (m) => formatMinor(m, currency),
        toGbpMinor: (amount) => toGbpMinorFn(amount, currency),
        meta: CURRENCIES[currency],
      }}
    >
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <CartContext.Provider
          value={{ lines, add, remove, setQty, clear, count, subtotalMinor }}
        >
          <WishContext.Provider
            value={{ ids: wish, toggle: toggleWish, has: (id) => wish.includes(id) }}
          >
            {children}
          </WishContext.Provider>
        </CartContext.Provider>
      </ThemeContext.Provider>
    </CurrencyContext.Provider>
  );
}
