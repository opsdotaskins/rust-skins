import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getPosts } from "@/lib/queries";
import { SITE } from "@/lib/config";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.cover }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: [post.cover] },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const paragraphs = post.body.split("\n\n").filter(Boolean);
  const published = new Date(post.publishedAt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [post.cover],
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: SITE.name },
    datePublished: published.toISOString(),
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-sage">
        <Link href="/blog" className="hover:text-gold">Journal</Link>
        <span className="px-1.5">/</span>
        <span className="text-parchment">{post.category}</span>
      </nav>

      <header>
        <p className="engraved text-[10px] text-gold">{post.category} · {post.readingMinutes} min read</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-parchment sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sage">{post.excerpt}</p>
        <p className="mt-4 text-xs text-sage/70">
          By {post.author} · {published.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </header>

      <div className="corner-brackets relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-gold/20">
        <Image src={post.cover} alt={post.title} fill className="object-cover" sizes="(min-width: 768px) 768px, 100vw" priority />
      </div>

      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-sage">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-12 border-t border-hairline pt-6">
        <Link href="/blog" className="text-sm text-teal hover:text-gold">← Back to the journal</Link>
      </div>
    </article>
  );
}
