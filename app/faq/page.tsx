import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/Accordion";
import { FAQ } from "@/lib/faq";
import { CONTACT_EMAIL, SITE, VALUES } from "@/lib/config";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Answers to common questions about buying Rust skins at ${SITE.name} — Steam linking, delivery, payment, refunds and the store wallet.`,
  alternates: { canonical: "/faq" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <header className="text-center">
        <p className="engraved text-[10px] text-gold">Support</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-parchment sm:text-4xl">Frequently asked questions</h1>
        <p className="mt-3 text-sage">
          Everything about delivery, payment and your vault. Still stuck?{" "}
          <Link href="/contacts" className="text-teal hover:text-gold">Contact us</Link>.
        </p>
      </header>

      <div id="delivery" className="mt-10 scroll-mt-28">
        <Accordion items={FAQ} />
      </div>

      <div className="mt-10 rounded-xl border border-gold/25 bg-card p-6 text-center shadow-glow-soft">
        <p className="text-parchment">Need a hand from a real person?</p>
        <p className="mt-1 text-sm text-sage">Support is available {VALUES.supportHours}.</p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="btn-gold mt-4">Email {CONTACT_EMAIL}</a>
      </div>
    </div>
  );
}
