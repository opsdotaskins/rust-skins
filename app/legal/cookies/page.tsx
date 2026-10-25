import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How rust-skins.com uses cookies and similar browser technologies.",
  alternates: { canonical: "/legal/cookies" },
};

export default function CookiesPage() {
  return <LegalPage slug="cookies" />;
}
