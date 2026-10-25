import Link from "next/link";
import { Logo } from "./brand/Logo";
import { PaymentLogos } from "./PaymentLogos";
import { COMPANY, CONTACT_EMAIL, SITE, TRADEMARK_DISCLAIMER } from "@/lib/config";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Weapons", href: "/catalog?category=weapons" },
      { label: "Apparel", href: "/catalog?category=apparel" },
      { label: "Base & Building", href: "/catalog?category=base" },
      { label: "Deployables", href: "/catalog?category=deployables" },
      { label: "Deals", href: "/deals" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Delivery", href: "/legal/delivery" },
      { label: "Refunds", href: "/legal/refunds" },
      { label: "Contact", href: "/contacts" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Payment Policy", href: "/legal/payment" },
      { label: "Refund & Cancellation", href: "/legal/refunds" },
      { label: "Digital Delivery", href: "/legal/delivery" },
      { label: "Account Balance", href: "/legal/balance" },
      { label: "Cookies", href: "/legal/cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="grain border-t border-hairline bg-well/60">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo lockup="stacked" size={26} showTagline />
            <p className="mt-4 max-w-xs text-sm text-sage">{SITE.description}</p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="engraved mb-3 text-[10px] text-gold">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-sage transition-colors hover:text-parchment">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="filigree-divider my-8" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1 text-xs text-sage">
            <p className="text-parchment">{COMPANY.name}</p>
            <p>{COMPANY.address}</p>
            <p>Company reg no. {COMPANY.regNumber}</p>
            <p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-gold">{CONTACT_EMAIL}</a>
            </p>
          </div>
          <PaymentLogos />
        </div>

        <div className="mt-8 space-y-3 border-t border-hairline pt-6 text-xs text-sage/80">
          <p>{TRADEMARK_DISCLAIMER}</p>
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved. Trading as {SITE.name}.</p>
        </div>
      </div>
    </footer>
  );
}
