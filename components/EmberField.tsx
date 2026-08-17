"use client";
import { useMemo } from "react";

/** GPU-cheap ember particles. Hero-only. Respects prefers-reduced-motion via CSS. */
export function EmberField({ count = 14 }: { count?: number }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 5,
        size: 2 + Math.random() * 3,
      })),
    [count]
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {embers.map((e) => (
        <span
          key={e.id}
          className="absolute bottom-0 rounded-full bg-gold/70"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            animation: `ember ${e.duration}s ease-in ${e.delay}s infinite`,
            boxShadow: "0 0 6px rgba(232,180,74,0.8)",
          }}
        />
      ))}
    </div>
  );
}
