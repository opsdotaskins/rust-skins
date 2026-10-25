import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { VALUES } from "@/lib/config";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 px-4 py-12 lg:grid-cols-2">
      {/* Branded panel */}
      <aside className="grain relative hidden overflow-hidden rounded-2xl border border-hairline bg-panel p-10 lg:block">
        <div className="sigil relative">
          <Link href="/"><Logo lockup="stacked" size={30} showTagline /></Link>
          <p className="mt-8 font-display text-2xl leading-tight text-parchment">
            Your collection deserves a treasury like this.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-sage">
            <li>✦ {VALUES.deliveryPromise}</li>
            <li>✦ Authentic Rust skins</li>
            <li>✦ Secure Visa &amp; Mastercard payment</li>
            <li>✦ Email support</li>
          </ul>
        </div>
      </aside>

      {/* Form column */}
      <div className="flex flex-col items-center">
        <div className="mb-8 lg:hidden">
          <Link href="/"><Logo size={28} /></Link>
        </div>
        <div className="w-full max-w-lg">
          <h1 className="font-display text-3xl font-bold tracking-tight text-parchment">{title}</h1>
          <p className="mt-2 text-sm text-sage">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
