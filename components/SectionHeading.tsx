import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  children,
  href,
  hrefLabel = "View all",
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="sigil relative mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="engraved mb-1.5 text-[10px] text-gold">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-bold tracking-tight text-parchment sm:text-3xl">
          {title}
        </h2>
        {children && <p className="mt-2 max-w-2xl text-sm text-sage">{children}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 whitespace-nowrap text-sm text-teal hover:text-gold">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
