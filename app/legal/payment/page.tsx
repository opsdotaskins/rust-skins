import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Payment Policy",
  description: "Accepted payment methods, currencies and payment processing on rust-skins.com.",
  alternates: { canonical: "/legal/payment" },
};

export default function PaymentPage() {
  return <LegalPage slug="payment" />;
}
