import type { MetadataRoute } from "next";
import { getCatalog, getPosts, getCategories } from "@/lib/queries";
import { SITE } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const [items, posts, categories] = await Promise.all([
    getCatalog({}),
    getPosts(),
    getCategories(),
  ]);

  const staticRoutes = [
    "",
    "/catalog",
    "/deals",
    "/blog",
    "/about",
    "/contacts",
    "/faq",
    "/legal/terms",
    "/legal/privacy",
    "/legal/payment",
    "/legal/refunds",
    "/legal/cookies",
    "/legal/delivery",
    "/legal/balance",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const itemRoutes = items.map((it) => ({
    url: `${base}/item/${it.slug}`,
    lastModified: it.createdAt ? new Date(it.createdAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const postRoutes = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/catalog?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  return [...staticRoutes, ...itemRoutes, ...postRoutes, ...categoryRoutes];
}
