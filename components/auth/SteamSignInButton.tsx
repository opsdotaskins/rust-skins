/** "Sign in through Steam" — starts Steam OpenID via /api/steam/login. */
export function SteamSignInButton({ label = "Sign in with Steam" }: { label?: string }) {
  return (
    <a
      href="/api/steam/login"
      className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-hairline bg-[#171a21] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-gold/60 hover:bg-[#1b2838]"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M11.98 0C5.67 0 .5 4.86.01 11.03l6.43 2.66a3.39 3.39 0 0 1 1.91-.59l.19.01 2.86-4.15v-.06a4.53 4.53 0 1 1 4.53 4.53h-.1l-4.08 2.91.01.16a3.4 3.4 0 0 1-6.74.66L.4 15.14A12 12 0 1 0 11.98 0ZM7.54 18.21l-1.47-.61a2.55 2.55 0 1 0 1.4-3.47l1.52.63a1.88 1.88 0 1 1-1.45 3.45Zm11.42-9.3a3.02 3.02 0 1 0-3.02 3.02 3.02 3.02 0 0 0 3.02-3.02Zm-5.28 0a2.27 2.27 0 1 1 2.27 2.27 2.27 2.27 0 0 1-2.27-2.27Z" />
      </svg>
      {label}
    </a>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-sage">
      <span className="h-px flex-1 bg-hairline" />
      or
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}
