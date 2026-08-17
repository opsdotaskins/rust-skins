import type { SVGProps } from "react";

/**
 * Runevault mark — a carved rune inside a faceted vault-door ring with a
 * faint inner glow. Geometric, mystical, legible at 16px. `mono` renders a
 * single-colour lockup.
 */
export function RuneMark({
  size = 32,
  mono = false,
  title = "Runevault",
  ...props
}: { size?: number; mono?: boolean; title?: string } & SVGProps<SVGSVGElement>) {
  const gold = mono ? "currentColor" : "#E8B44A";
  const ember = mono ? "currentColor" : "#C68A2E";
  const glow = mono ? "currentColor" : "#E8B44A";
  const uid = title.replace(/\s+/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      fill="none"
      {...props}
    >
      <title>{title}</title>
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow} stopOpacity={mono ? 0 : 0.35} />
          <stop offset="70%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* inner glow */}
      <circle cx="32" cy="32" r="22" fill={`url(#${uid}-glow)`} />
      {/* faceted vault-door ring — outer octagon */}
      <path
        d="M32 4 L52 12 L60 32 L52 52 L32 60 L12 52 L4 32 L12 12 Z"
        stroke={gold}
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* inner ring */}
      <circle cx="32" cy="32" r="18" stroke={ember} strokeWidth="1.5" fill="none" opacity="0.7" />
      {/* vault-door facet spokes */}
      {[0, 45, 90, 135].map((a) => (
        <line
          key={a}
          x1={32 + 18 * Math.cos((a * Math.PI) / 180)}
          y1={32 + 18 * Math.sin((a * Math.PI) / 180)}
          x2={32 - 18 * Math.cos((a * Math.PI) / 180)}
          y2={32 - 18 * Math.sin((a * Math.PI) / 180)}
          stroke={ember}
          strokeWidth="0.75"
          opacity="0.35"
        />
      ))}
      {/* carved rune — an angular "R" glyph */}
      <path
        d="M25 20 L25 44 M25 20 L36 20 L40 26 L36 32 L25 32 M34 32 L41 44"
        stroke={gold}
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />
    </svg>
  );
}

type Lockup = "horizontal" | "stacked" | "mono";

export function Logo({
  lockup = "horizontal",
  size = 32,
  className = "",
  showTagline = false,
}: {
  lockup?: Lockup;
  size?: number;
  className?: string;
  showTagline?: boolean;
}) {
  const mono = lockup === "mono";
  const wordmark = (
    <span
      className="font-display font-bold leading-none tracking-[0.06em]"
      style={{ fontSize: size * 0.62 }}
    >
      <span className={mono ? "" : "text-parchment"}>Rune</span>
      <span className={mono ? "" : "text-gold"}>vault</span>
    </span>
  );

  if (lockup === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
        <RuneMark size={size * 1.4} />
        {wordmark}
        {showTagline && (
          <span className="engraved text-[10px] text-sage">Arcane Treasury</span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${mono ? "text-parchment" : ""} ${className}`}>
      <RuneMark size={size} mono={mono} />
      <span className="inline-flex flex-col">
        {wordmark}
        {showTagline && (
          <span className="engraved text-[9px] text-sage">Arcane Treasury</span>
        )}
      </span>
    </span>
  );
}
