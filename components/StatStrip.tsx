"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

function useCountUp(target: number, run: boolean, ms = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return n;
}

function StatCell({ stat, run, delay }: { stat: Stat; run: boolean; delay: number }) {
  const n = useCountUp(stat.value, run);
  return (
    <div
      className="reveal in-view card-surface hover-lift relative overflow-hidden p-6 text-center"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-0 -top-8 mx-auto h-16 w-16 rounded-full bg-gold/10 blur-2xl" />
      <p className="font-display text-3xl font-bold text-gold sm:text-4xl">
        {stat.prefix}
        {n.toLocaleString("en-US")}
        {stat.suffix}
      </p>
      <p className="mt-1.5 text-xs uppercase tracking-wider text-sage">{stat.label}</p>
    </div>
  );
}

export function StatStrip({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <StatCell key={s.label} stat={s} run={run} delay={i * 90} />
      ))}
    </div>
  );
}
