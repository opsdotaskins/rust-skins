import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BETTERB LTD collects, uses and protects personal data on rust-skins.com.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />;
}
