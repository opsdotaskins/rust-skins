import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE, CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${SITE.name} uses cookies and how to manage your preferences.`,
  alternates: { canonical: "/legal/cookies" },
};

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="17 August 2026"
      intro="This policy explains what cookies are, how we use them, and how you can control them."
      sections={[
        {
          heading: "What cookies are",
          body: [
            "Cookies are small text files stored on your device. They let the store remember your actions and preferences so you don't have to re-enter them each visit.",
          ],
        },
        {
          heading: "Essential cookies",
          body: [
            "These are required for the store to function — for example, keeping you signed in, remembering the contents of your cart, and securing your session. They cannot be switched off.",
          ],
        },
        {
          heading: "Preference cookies",
          body: [
            "These remember choices such as your selected currency and light or dark theme, so the store looks and behaves the way you expect on your next visit.",
          ],
        },
        {
          heading: "Managing your choices",
          body: [
            "When you first visit, a consent banner lets you accept or decline optional cookies. You can change your decision at any time using the persistent “Cookie settings” control, and your preference is saved for future visits.",
          ],
        },
        {
          heading: "Contact",
          body: [
            `If you have questions about our use of cookies, email ${CONTACT_EMAIL}.`,
          ],
        },
      ]}
    />
  );
}
