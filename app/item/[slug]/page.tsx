import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getItemBySlug, getRelated } from "@/lib/queries";
import { AddToCart } from "@/components/AddToCart";
import { PriceWithOld } from "@/components/Price";
import { ItemGrid } from "@/components/ItemGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { RARITY_META, qualityLabel, isEnchanted, type Rarity } from "@/lib/rarity";
import { SITE, VALUES } from "@/lib/config";
import { formatMinor } from "@/lib/currency";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) return { title: "Skin not found" };
  const q = qualityLabel(item.quality);
  const title = `${q ? q + " " : ""}${item.name}`;
  return {
    title,
    description: `${title} — a Rust ${RARITY_META[item.rarity as Rarity].label} skin. ${VALUES.deliveryPromise} from Runevault.`,
    alternates: { canonical: `/item/${item.slug}` },
    openGraph: { title, images: [{ url: item.image }] },
  };
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);
  if (!item) notFound();

  const related = await getRelated(item, 4);
  const meta = RARITY_META[item.rarity as Rarity];
  const q = qualityLabel(item.quality);
  const enchanted = isEnchanted(item.rarity as Rarity);
  const setPieces: string[] = item.setContents ? JSON.parse(item.setContents) : [];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${q ? q + " " : ""}${item.name}`,
    image: [item.image],
    description: item.description,
    brand: { "@type": "Brand", name: SITE.name },
    category: item.categoryName,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (item.priceMinor / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/item/${item.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-sage">
        <Link href="/" className="hover:text-gold">Home</Link> ·{" "}
        <Link href="/catalog" className="hover:text-gold">Catalog</Link> ·{" "}
        <Link href={`/catalog?category=${item.categorySlug}`} className="hover:text-gold">{item.categoryName}</Link> ·{" "}
        <span className="text-parchment">{item.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Render */}
        <div className="corner-brackets relative overflow-hidden rounded-2xl border border-hairline bg-card p-3">
          <span className="absolute left-0 top-0 z-10 h-full w-1" style={{ backgroundColor: meta.color, boxShadow: `0 0 16px ${meta.color}` }} />
          <div className="relative aspect-square overflow-hidden rounded-xl bg-well">
            <div className="absolute inset-0 opacity-50 blur-3xl" style={{ background: `radial-gradient(circle at 50% 55%, ${meta.color}66, transparent 60%)` }} />
            <Image src={item.image} alt={`${q ? q + " " : ""}${item.name} — Rust ${meta.label} skin`} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="relative object-cover" />
            {enchanted && <span className="sweep-mask sweep-always absolute inset-0" />}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="engraved mb-2 text-[11px]" style={{ color: meta.color }}>{meta.label}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-parchment sm:text-4xl">
            {q && <span className="text-sage">{q} </span>}
            {item.name}
          </h1>

          <div className="mt-4 text-2xl">
            <PriceWithOld priceMinor={item.priceMinor} oldPriceMinor={item.oldPriceMinor} />
          </div>

          <p className="mt-5 leading-relaxed text-sage">{item.description}</p>

          {/* Engraved data plaque */}
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline text-sm">
            <Plaque label="Category" value={item.categoryName} />
            <Plaque label="Rarity" value={meta.label} color={meta.color} />
          </dl>

          {setPieces.length > 0 && (
            <div className="mt-6">
              <p className="engraved mb-2 text-[10px] text-gold">Set contents</p>
              <div className="flex flex-wrap gap-2">
                {setPieces.map((p) => (
                  <span key={p} className="chip">{p}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <AddToCart item={{ id: item.id, slug: item.slug, name: item.name, priceMinor: item.priceMinor, image: item.image, rarity: item.rarity }} />
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-sage">
            <span>✦ {VALUES.deliveryPromise}</span>
            <span>✦ Authentic Rust skin</span>
            <span>✦ {VALUES.refundWindowDays}-day refund window</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow="You may also like" title="Similar skins" />
          <ItemGrid items={related} />
        </section>
      )}
    </div>
  );
}

function Plaque({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-well/70 px-4 py-3">
      <dt className="engraved text-[9px] text-sage">{label}</dt>
      <dd className="mt-0.5 font-mono" style={{ color: color ?? "#EFEAD8" }}>{value}</dd>
    </div>
  );
}
