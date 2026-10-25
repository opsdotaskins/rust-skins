/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com" },
      { protocol: "https", hostname: "community.cloudflare.steamstatic.com" },
      { protocol: "https", hostname: "community.akamai.steamstatic.com" },
      { protocol: "https", hostname: "steamcommunity-a.akamaihd.net" },
      { protocol: "https", hostname: "avatars.steamstatic.com" },
      { protocol: "https", hostname: "avatars.cloudflare.steamstatic.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.steamstatic.com" },
      { protocol: "https", hostname: "**.sih.market" },
      { protocol: "https", hostname: "**.sih.app" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Keep native/WASM-backed packages out of the webpack bundle so they load
  // their own assets from node_modules at runtime.
  serverExternalPackages: ["@electric-sql/pglite", "pdfkit", "fontkit"],
  // Policy texts are read from disk at request time by components/LegalPage.
  outputFileTracingIncludes: {
    "/legal/*": ["./content/legal/**/*"],
  },
};

export default nextConfig;
