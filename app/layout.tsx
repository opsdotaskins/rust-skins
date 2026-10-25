import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { getCurrentUser } from "@/lib/auth";
import { SITE, COMPANY, CONTACT_EMAIL } from "@/lib/config";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Rust Skins Store`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["Rust", "Rust skins", "weapon skins", "apparel", "deployables", "Steam", SITE.name],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — Rust Skins Store`,
    description: SITE.description,
    url: SITE.url,
    locale: SITE.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Rust Skins Store`,
    description: SITE.description,
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    legalName: COMPANY.name,
    url: SITE.url,
    email: CONTACT_EMAIL,
    description: SITE.description,
    slogan: SITE.tagline,
  };

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-abyss">
          Skip to content
        </a>
        <Providers>
          <Header user={user ? { firstName: user.firstName, balanceMinor: user.balanceMinor } : null} />
          <main id="main">{children}</main>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
