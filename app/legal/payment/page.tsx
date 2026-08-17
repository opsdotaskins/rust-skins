import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE, VALUES, CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Payment Policy",
  description: `Accepted payment methods, currency and security at ${SITE.name}.`,
  alternates: { canonical: "/legal/payment" },
};

export default function PaymentPolicyPage() {
  return (
    <LegalPage
      title="Payment Policy"
      updated="17 August 2026"
      intro="How payments work at Runevault, including accepted methods, currency and security."
      sections={[
        {
          heading: "Accepted payment methods",
          body: [
            "We accept Visa and Mastercard. You can also pay instantly using your Runevault wallet balance, which you can top up at any time from your account.",
          ],
        },
        {
          heading: "Currency",
          body: [
            "You can browse and pay in GBP, EUR or USD. Prices update everywhere to reflect your selected currency, and your choice is remembered for future visits.",
          ],
        },
        {
          heading: "Tax and fees",
          body: [
            "The price you see is the price you pay. Any applicable tax is already included in the displayed price, and there is no separate service fee added at checkout.",
          ],
        },
        {
          heading: "Security",
          body: [
            "All card payments are handled through a PCI DSS compliant payment process. Sensitive card details are never stored on our servers.",
          ],
        },
        {
          heading: "Order confirmation",
          body: [
            `Once payment is confirmed, ${VALUES.deliveryPromise.toLowerCase()} applies and you receive an order confirmation email with a PDF invoice. Your order and its invoice are always available from your account.`,
          ],
        },
        {
          heading: "Questions",
          body: [
            `If you have a question about a payment, contact ${CONTACT_EMAIL} — support is available ${VALUES.supportHours}.`,
          ],
        },
      ]}
    />
  );
}
