import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY, CONTACT_EMAIL, SITE, VALUES } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contacts & company details",
  description: `Get in touch with the ${SITE.name} support team and view our registered company details.`,
  alternates: { canonical: "/contacts" },
};

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <header className="text-center">
        <p className="engraved text-[10px] text-gold">We&apos;re here to help</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-parchment sm:text-4xl">Contacts</h1>
        <p className="mt-3 text-sage">Email us any time — we aim to give an {VALUES.supportResponse}. Most questions are answered in our FAQ.</p>
      </header>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="card-surface p-6">
          <p className="engraved text-[10px] text-sage">Email support</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-1 block text-lg text-parchment hover:text-gold">{CONTACT_EMAIL}</a>
          <p className="mt-2 text-sm text-sage">Order help, delivery, refunds and account questions.</p>
        </div>
        <div className="card-surface p-6">
          <p className="engraved text-[10px] text-sage">Response time</p>
          <p className="mt-1 text-lg text-parchment">Within 5 business days</p>
          <p className="mt-2 text-sm text-sage">Our target for an initial reply. Delivery issues can be reported any time.</p>
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-hairline bg-card p-6">
        <p className="engraved text-[10px] text-sage">Company details</p>
        <dl className="mt-3 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-sage">Legal name</dt>
            <dd className="text-parchment">{COMPANY.name}</dd>
          </div>
          <div>
            <dt className="text-sage">Trading as</dt>
            <dd className="text-parchment">{COMPANY.tradingAs}</dd>
          </div>
          <div>
            <dt className="text-sage">Registered office</dt>
            <dd className="not-italic text-parchment">
              <address className="not-italic">{COMPANY.address}</address>
            </dd>
          </div>
          <div>
            <dt className="text-sage">Company reg no.</dt>
            <dd className="text-parchment">{COMPANY.regNumber}</dd>
          </div>
          <div>
            <dt className="text-sage">Email</dt>
            <dd>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-parchment hover:text-gold">{CONTACT_EMAIL}</a>
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 text-center text-sm text-sage">
        Looking for a quick answer? Try the{" "}
        <Link href="/faq" className="text-teal hover:text-gold">FAQ</Link>.
      </div>
    </div>
  );
}
