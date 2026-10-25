import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms governing your use of rust-skins.com and purchases from BETTERB LTD.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return <LegalPage slug="terms" />;
}
