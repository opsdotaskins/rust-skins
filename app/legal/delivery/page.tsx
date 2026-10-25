import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Digital Delivery Policy",
  description: "How Rust skins are delivered via Steam trade offers on rust-skins.com.",
  alternates: { canonical: "/legal/delivery" },
};

export default function DeliveryPage() {
  return <LegalPage slug="delivery" />;
}
