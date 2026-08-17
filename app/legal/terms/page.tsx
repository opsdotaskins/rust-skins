import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { COMPANY, CONTACT_EMAIL, SITE, VALUES, TRADEMARK_DISCLAIMER } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms governing your use of ${SITE.name} and the purchase of Rust skins.`,
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="17 August 2026"
      intro={`These terms govern your access to and use of ${SITE.name}, operated by ${COMPANY.name} (trading as ${SITE.name}).`}
      sections={[
        {
          heading: "Agreement to these terms",
          body: [
            `By accessing ${SITE.name} or placing an order, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the store.`,
            `We may update these terms from time to time. Continued use of the store after changes take effect constitutes acceptance of the revised terms.`,
          ],
        },
        {
          heading: "Eligibility",
          body: [
            "You must be at least 16 years old and legally able to enter into a binding contract to register an account or make a purchase.",
            "We do not offer the store to residents of certain sanctioned or restricted jurisdictions. Registration from those regions is not available.",
          ],
        },
        {
          heading: "Products and delivery",
          body: [
            `${SITE.name} sells authentic Rust skins. All items are digital. ${VALUES.deliveryPromise} applies once payment is confirmed — skins are delivered to your Steam inventory via trade offer in seconds and nothing is physically shipped.`,
            "We take reasonable care to describe every skin accurately, including its category and rarity.",
          ],
        },
        {
          heading: "Pricing and payment",
          body: [
            "All prices are shown in your selected currency and include any applicable tax. The price displayed at checkout is the price you pay; there is no separate service fee.",
            "Payment is processed securely through a PCI DSS compliant provider. We accept Visa and Mastercard, and you may also pay using your Runevault wallet balance.",
          ],
        },
        {
          heading: "Refunds",
          body: [
            `Refund requests are handled under our Refund Policy, within ${VALUES.refundWindowDays} days of purchase and subject to the conditions described there.`,
          ],
        },
        {
          heading: "Accounts",
          body: [
            "You are responsible for keeping your account credentials confidential and for all activity under your account. Notify us immediately of any unauthorised use.",
          ],
        },
        {
          heading: "Intellectual property",
          body: [
            TRADEMARK_DISCLAIMER,
          ],
        },
        {
          heading: "Limitation of liability",
          body: [
            "To the fullest extent permitted by law, our liability arising from your use of the store is limited to the amount you paid for the relevant order.",
          ],
        },
        {
          heading: "Contact",
          body: [
            `Questions about these terms can be sent to ${CONTACT_EMAIL}. Our support team is available ${VALUES.supportHours}.`,
          ],
        },
      ]}
    />
  );
}
