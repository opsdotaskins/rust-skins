import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Cancellation rights, refunds and unused balance refunds on rust-skins.com.",
  alternates: { canonical: "/legal/refunds" },
};

export default function RefundsPage() {
  return <LegalPage slug="refunds" />;
}
