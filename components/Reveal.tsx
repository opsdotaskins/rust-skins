"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode, type Ref } from "react";

/**
 * Fades + slides its children into view the first time they enter the viewport.
 * Motion is disabled automatically via CSS for prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const Tag = as as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${shown ? "in-view" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
