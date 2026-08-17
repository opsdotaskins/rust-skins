import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE, VALUES, CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `${SITE.name}'s refund terms for digital Rust skins.`,
  alternates: { canonical: "/legal/refunds" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="17 August 2026"
      intro={`We want you to be happy with every relic. This policy explains when and how you can request a refund within ${VALUES.refundWindowDays} days of purchase.`}
      sections={[
        {
          heading: "Refund window",
          body: [
            `You may request a refund within ${VALUES.refundWindowDays} days of your purchase, subject to the conditions below.`,
          ],
        },
        {
          heading: "Digital delivery conditions",
          body: [
            `Because ${VALUES.deliveryPromise.toLowerCase()} applies, items are delivered to your inventory immediately. Where an item has already been delivered and used or altered, a refund may not be possible.`,
            "If a delivery fails or you were charged for an item you did not receive, you are entitled to a full refund.",
          ],
        },
        {
          heading: "How to request a refund",
          body: [
            `Contact ${CONTACT_EMAIL} with your order reference and the reason for your request. Our team is available ${VALUES.supportHours} and will respond promptly.`,
          ],
        },
        {
          heading: "How refunds are issued",
          body: [
            "Approved refunds are returned to your original payment method or, at your choice, credited to your Runevault wallet balance. Wallet credits are available for immediate use.",
          ],
        },
        {
          heading: "Wallet top-ups",
          body: [
            "Unspent wallet top-ups can be refunded on request, subject to identity verification and applicable payment-provider limits.",
          ],
        },
      ]}
    />
  );
}
