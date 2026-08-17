import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY, CONTACT_EMAIL, SITE, VALUES } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${SITE.name} support team — available ${VALUES.supportHours}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <header className="text-center">
        <p className="engraved text-[10px] text-gold">We&apos;re here to help</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-parchment sm:text-4xl">Contact Runevault</h1>
        <p className="mt-3 text-sage">Support is available {VALUES.supportHours}. Most questions are answered in our FAQ.</p>
      </header>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="card-surface p-6">
          <p className="engraved text-[10px] text-sage">Email support</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-1 block text-lg text-parchment hover:text-gold">{CONTACT_EMAIL}</a>
          <p className="mt-2 text-sm text-sage">Order help, delivery, refunds and account questions.</p>
        </div>
        <div className="card-surface p-6">
          <p className="engraved text-[10px] text-sage">Phone</p>
          <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="mt-1 block text-lg text-parchment hover:text-gold">{COMPANY.phone}</a>
          <p className="mt-2 text-sm text-sage">Available {VALUES.supportHours} for urgent order matters.</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-hairline bg-card p-6">
        <p className="engraved text-[10px] text-sage">Registered office</p>
        <address className="mt-2 not-italic text-sm leading-relaxed text-parchment">
          {COMPANY.name}<br />
          {COMPANY.address}<br />
          Company reg no. {COMPANY.regNumber}
        </address>
      </div>

      <div className="mt-8 text-center text-sm text-sage">
        Looking for a quick answer? Try the{" "}
        <Link href="/faq" className="text-teal hover:text-gold">FAQ</Link>.
      </div>
    </div>
  );
}
