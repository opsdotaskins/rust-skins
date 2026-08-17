import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getFeatured,
  getNewArrivals,
  getMostExpensive,
  getCategories,
  getCatalog,
} from "@/lib/queries";
import { ItemGrid } from "@/components/ItemGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { RarityExplorer } from "@/components/RarityExplorer";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { CategoryShowcase, type ShowcaseGroup } from "@/components/CategoryShowcase";
import { SkinTicker } from "@/components/SkinTicker";
import { StatStrip } from "@/components/StatStrip";
import { Reveal } from "@/components/Reveal";
import { Accordion } from "@/components/Accordion";
import { EmberField } from "@/components/EmberField";
import { PriceWithOld } from "@/components/Price";
import { FAQ } from "@/lib/faq";
import { VALUES } from "@/lib/config";
import { RARITY_META } from "@/lib/rarity";

export default async function HomePage() {
  // Logged-in users never land on the public homepage.
  const session = await getSession();
  if (session) redirect("/dashboard");

  const [featured, newArrivals, mostExpensive, categories, allPopular] =
    await Promise.all([
      getFeatured(8),
      getNewArrivals(8),
      getMostExpensive(8),
      getCategories(),
      getCatalog({ sort: "popular" }),
    ]);

  const hero = featured[0];
  const ticker = allPopular.slice(0, 24);
  const budget = [...allPopular]
    .filter((i) => i.priceMinor > 0)
    .sort((a, b) => a.priceMinor - b.priceMinor)
    .slice(0, 8);

  const showcaseGroups: ShowcaseGroup[] = categories.map((c) => {
    const items = allPopular.filter((i) => i.categorySlug === c.slug);
    return { slug: c.slug, name: c.name, count: items.length, items: items.slice(0, 8) };
  });

  const stats = [
    { value: allPopular.length, suffix: "+", label: "Rust skins in stock" },
    { value: categories.length, label: "Categories to raid" },
    { value: 30, suffix: "s", label: "Avg trade delivery" },
    { value: 100, suffix: "%", label: "Delivered via Steam" },
  ];

  return (
    <>
      {/* Armoury hero */}
      <section className="grain relative overflow-hidden border-b border-hairline">
        <EmberField />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <p className="engraved mb-4 text-[11px] text-gold">The Rust Armoury · Skin Store</p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-parchment sm:text-5xl lg:text-6xl">
              Gear up your <span className="text-shimmer">survival</span> in style.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-sage">
              Weapon skins, apparel, base and deployables — delivered straight to your Steam inventory by trade offer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className="btn-gold animate-glow-pulse">Browse the armoury</Link>
              <Link href="/catalog?category=weapons" className="btn-ghost">Shop weapons</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-sage">
              <span>✦ {VALUES.deliveryPromise}</span>
              <span>✦ Authentic Rust skins</span>
              <span>✦ Secure payment</span>
              <span>✦ Support {VALUES.supportHours}</span>
            </div>
          </div>

          {hero && (
            <div className="animate-fade-up">
              <div className="animate-float">
                <Link href={`/item/${hero.slug}`} className="group aura corner-brackets relative block overflow-hidden rounded-2xl border border-gold/25 bg-card p-3 shadow-glow-soft">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-well">
                    <div className="absolute inset-0 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-90" style={{ background: `radial-gradient(circle at 50% 55%, ${RARITY_META[hero.rarity].color}66, transparent 60%)` }} />
                    <Image src={hero.image} alt={`${hero.name} — featured Rust ${RARITY_META[hero.rarity].label} skin`} fill priority sizes="(max-width:1024px) 100vw, 45vw" className="relative object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="sweep-mask sweep-always absolute inset-0" />
                  </div>
                  <div className="flex items-center justify-between px-2 pt-3">
                    <div>
                      <p className="engraved text-[9px]" style={{ color: RARITY_META[hero.rarity].color }}>{RARITY_META[hero.rarity].label}</p>
                      <p className="mt-0.5 font-display text-lg text-parchment">{hero.name}</p>
                    </div>
                    <PriceWithOld priceMinor={hero.priceMinor} oldPriceMinor={hero.oldPriceMinor} />
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Live market ticker */}
      <SkinTicker items={ticker} />

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16">
        {/* Trust stats */}
        <Reveal as="section">
          <StatStrip stats={stats} />
        </Reveal>

        {/* Most coveted */}
        <Reveal as="section">
          <SectionHeading eyebrow="Top shelf" title="The most coveted skins" href="/catalog?sort=price-desc">
            The rarest weapon finishes and apparel — framed with intensified glow.
          </SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mostExpensive.map((item, i) => (
              <Link key={item.id} href={`/item/${item.slug}`} className="group hover-lift corner-brackets relative flex items-center gap-4 overflow-hidden rounded-lg border border-gold/20 bg-card p-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-well">
                  <div className="absolute inset-0 opacity-50 blur-lg transition-opacity group-hover:opacity-80" style={{ background: `radial-gradient(circle, ${RARITY_META[item.rarity].color}66, transparent 65%)` }} />
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="relative object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="min-w-0">
                  <p className="engraved text-[9px]" style={{ color: RARITY_META[item.rarity].color }}>{RARITY_META[item.rarity].label}</p>
                  <p className="truncate font-mono text-sm text-parchment">{item.name}</p>
                  <div className="mt-1"><PriceWithOld priceMinor={item.priceMinor} oldPriceMinor={item.oldPriceMinor} /></div>
                </div>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 translate-x-2 text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">→</span>
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Interactive category showcase */}
        <Reveal as="section">
          <SectionHeading eyebrow="Browse the racks" title="Shop by category" href="/catalog">
            Flip between racks — every skin lands in your Steam inventory by trade offer.
          </SectionHeading>
          <CategoryShowcase groups={showcaseGroups} />
        </Reveal>

        {/* Rarity explorer */}
        <Reveal as="section" className="rounded-2xl border border-hairline bg-panel/50 p-6 sm:p-8">
          <SectionHeading eyebrow="Interactive" title="Explore by rarity">
            The full colour scale, from Common to the rarest tier. Tap a tier to preview the armoury.
          </SectionHeading>
          <RarityExplorer items={allPopular} />
        </Reveal>

        {/* New arrivals */}
        <Reveal as="section">
          <SectionHeading eyebrow="Fresh from the workshop" title="New arrivals" href="/catalog?sort=newest" />
          <ItemGrid items={newArrivals} />
        </Reveal>

        {/* Budget picks */}
        <Reveal as="section">
          <SectionHeading eyebrow="Wipe-day ready" title="Budget picks under budget" href="/catalog?sort=price-asc">
            Kit out a fresh wipe without breaking the bank.
          </SectionHeading>
          <ItemGrid items={budget} />
        </Reveal>

        {/* Featured */}
        <Reveal as="section">
          <SectionHeading eyebrow="Curated" title="Featured skins" href="/catalog?sort=popular" />
          <ItemGrid items={featured.slice(0, 8)} />
        </Reveal>

        {/* Category tiles */}
        <Reveal as="section">
          <SectionHeading eyebrow="Pick a category" title="Jump into a rack" href="/catalog">
            Straight to the skins that fit your loadout.
          </SectionHeading>
          <CategoryBrowser categories={categories} />
        </Reveal>

        {/* Benefits */}
        <Reveal as="section" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Instant delivery", d: VALUES.deliveryPromise + " to your Steam inventory." , icon: "M13 2 3 14h7l-1 8 10-12h-7l1-8Z" },
            { t: "Authentic skins", d: "Real Rust skins, delivered by trade offer.", icon: "M12 2 4 6v6c0 5 3.4 8 8 10 4.6-2 8-5 8-10V6l-8-4Z" },
            { t: "Secure payment", d: "PCI DSS compliant Visa & Mastercard.", icon: "M2 7h20v10H2zM2 11h20" },
            { t: "Support 24/7", d: "Real help whenever you need it.", icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 6v5l3 2" },
          ].map((b) => (
            <div key={b.t} className="card-surface hover-lift group p-5">
              <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-110 group-hover:animate-glow-pulse">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={b.icon} /></svg>
              </span>
              <p className="font-medium text-parchment">{b.t}</p>
              <p className="mt-1 text-sm text-sage">{b.d}</p>
            </div>
          ))}
        </Reveal>

        {/* Compact FAQ */}
        <Reveal as="section">
          <SectionHeading eyebrow="Questions" title="Quick answers" href="/faq" hrefLabel="Full FAQ" />
          <Accordion items={FAQ.slice(0, 5)} />
        </Reveal>
      </div>
    </>
  );
}
