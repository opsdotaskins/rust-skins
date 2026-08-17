import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/checkout", "/cart", "/order", "/api", "/verify", "/reset-password"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
