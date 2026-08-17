"use client";
import { useState } from "react";

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-card">
      {items.map((item, i) => (
        <div key={i}>
          <h3>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-parchment hover:text-gold"
            >
              {item.q}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 transition-transform ${open === i ? "rotate-45 text-gold" : "text-sage"}`}>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </h3>
          {open === i && (
            <div className="px-5 pb-4 text-sm leading-relaxed text-sage">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}
