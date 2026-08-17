import Link from "next/link";

export interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-sage">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="px-1.5">/</span>
        <span className="text-parchment">{title}</span>
      </nav>

      <header className="border-b border-hairline pb-6">
        <p className="engraved text-[10px] text-gold">Legal</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-parchment sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sage">{intro}</p>
        <p className="mt-2 text-xs text-sage/70">Last updated {updated}</p>
      </header>

      <div className="mt-8 space-y-8">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-lg font-semibold text-parchment">
              {i + 1}. {s.heading}
            </h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-sage">
              {s.body.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
