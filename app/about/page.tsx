import type { Metadata } from "next";
import Link from "next/link";
import { SITE, VALUES, TRADEMARK_DISCLAIMER } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE.name} is the store for authentic Rust skins — weapons, apparel, base and deployables, delivered instantly to your Steam inventory.`,
  alternates: { canonical: "/about" },
};

const PILLARS = [
  { title: "Authentic skins", body: "Every item is a genuine Rust skin, delivered to your Steam inventory via trade offer." },
  { title: "Instant delivery", body: `${VALUES.deliveryPromise}. The moment your payment clears, the skin is on its way to Steam.` },
  { title: "Honest pricing", body: "The price you see is the price you pay. Tax is included and there is no service fee." },
  { title: "Real support", body: `A team available ${VALUES.supportHours} for any order, delivery or account question.` },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <header className="text-center">
        <p className="engraved text-[10px] text-gold">Our story</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-parchment sm:text-4xl">{SITE.tagline}</h1>
        <p className="mt-4 text-sage">
          {SITE.name} was built for players who treat their loadout as identity — skins to be curated,
          understood and worn with pride. We bring the Rust skin market into one considered store,
          from the muted grey of Common finishes up to the rarest tiers.
        </p>
      </header>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <div key={p.title} className="card-surface p-6">
            <h2 className="font-display text-lg font-semibold text-parchment">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-sage">{p.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-12 space-y-4 text-sm leading-relaxed text-sage">
        <h2 className="font-display text-xl font-semibold text-parchment">The armoury philosophy</h2>
        <p>
          Rarity is the first language of the armoury. We designed {SITE.name} so that a single glance
          tells you where a skin sits — its tier and its price. The best loadouts are not the most
          expensive; they are the most considered.
        </p>
        <p>
          Whether you kit out a fresh wipe or hunt for a standout AK finish, our shelves are arranged to
          help you buy what moves you and deliver it straight to your Steam inventory.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link href="/catalog" className="btn-gold">Browse the armoury</Link>
        <Link href="/blog" className="btn-ghost">Read the journal</Link>
      </div>

      <p className="mt-12 border-t border-hairline pt-6 text-xs text-sage/70">{TRADEMARK_DISCLAIMER}</p>
    </div>
  );
}
