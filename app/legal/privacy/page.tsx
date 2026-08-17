import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { COMPANY, CONTACT_EMAIL, SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, uses and protects your personal data.`,
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="17 August 2026"
      intro={`${COMPANY.name} respects your privacy. This policy explains what personal data we collect and how we use it.`}
      sections={[
        {
          heading: "Data we collect",
          body: [
            "When you register we collect your name, email address, phone number, date of birth and address. When you place an order we record the items purchased and the payment method used.",
            "We collect limited technical data — such as your currency preference and cookie choices — to make the store work and to remember your settings.",
          ],
        },
        {
          heading: "How we use your data",
          body: [
            "We use your data to create and secure your account, process and deliver your orders, send transactional emails (registration, password reset and order confirmations with your invoice), and provide support.",
            "We do not sell your personal data.",
          ],
        },
        {
          heading: "Payment data",
          body: [
            "Card payments are processed by a PCI DSS compliant payment provider. We do not store full card numbers on our systems.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "We use essential cookies to run the store and optional cookies to remember preferences. You can manage your choices at any time via the cookie settings control. See our Cookie Policy for details.",
          ],
        },
        {
          heading: "Data retention",
          body: [
            "We keep your account and order data for as long as your account is active and as required to meet legal, accounting and reporting obligations.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You may request access to, correction of, or deletion of your personal data, and you may object to certain processing. To exercise these rights, contact us using the details below.",
          ],
        },
        {
          heading: "Contact",
          body: [
            `For any privacy request, email ${CONTACT_EMAIL} or write to ${COMPANY.name}, ${COMPANY.address}.`,
          ],
        },
      ]}
    />
  );
}
