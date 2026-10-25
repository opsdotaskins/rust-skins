import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Account Balance & Top-Up Policy",
  description: "How Account Balance top-ups and refunds of unused paid balance work on rust-skins.com.",
  alternates: { canonical: "/legal/balance" },
};

export default function BalancePage() {
  return <LegalPage slug="balance" />;
}
