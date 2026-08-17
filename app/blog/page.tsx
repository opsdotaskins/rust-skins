import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/queries";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Journal",
  description: `The ${SITE.name} journal — guides to Rust skin rarity, trading, base themes and collecting.`,
  alternates: { canonical: "/blog" },
};

export default async function BlogIndex() {
  const posts = await getPosts();
  const [lead, ...rest] = posts;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="text-center">
        <p className="engraved text-[10px] text-gold">The journal</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-parchment sm:text-4xl">Notes from the armoury</h1>
        <p className="mt-3 text-sage">Guides to rarity, trading, base themes and the art of collecting Rust skins.</p>
      </header>

      {lead && (
        <Link href={`/blog/${lead.slug}`} className="group corner-brackets mt-10 grid overflow-hidden rounded-2xl border border-gold/20 bg-card md:grid-cols-2">
          <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto">
            <Image src={lead.cover} alt={lead.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
          <div className="flex flex-col justify-center p-8">
            <p className="engraved text-[10px] text-gold">{lead.category} · {lead.readingMinutes} min read</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-parchment group-hover:text-gold">{lead.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-sage">{lead.excerpt}</p>
            <span className="mt-4 text-sm text-teal group-hover:text-gold">Read the article →</span>
          </div>
        </Link>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-xl border border-hairline bg-card transition-colors hover:border-gold/30">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image src={p.cover} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
            </div>
            <div className="p-5">
              <p className="engraved text-[9px] text-sage">{p.category} · {p.readingMinutes} min read</p>
              <h3 className="mt-1.5 font-display text-lg font-semibold text-parchment group-hover:text-gold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sage line-clamp-3">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
