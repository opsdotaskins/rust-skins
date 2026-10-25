import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Legal pages are rendered from the policy texts in content/legal/*.md.
 * The renderer covers only the markdown subset those texts use:
 * ## title, ### headings, paragraphs (two trailing spaces = line break),
 * "- " lists, pipe tables, **bold** and [links](url).
 */

export type LegalSlug =
  | "terms"
  | "privacy"
  | "cookies"
  | "refunds"
  | "delivery"
  | "payment"
  | "balance";

type Block =
  | { type: "h3"; text: string }
  | { type: "p"; lines: string[] }
  | { type: "ul"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

async function loadPolicy(slug: LegalSlug) {
  const raw = await readFile(path.join(process.cwd(), "content/legal", `${slug}.md`), "utf8");
  const lines = raw.split("\n");

  let title = "";
  let updated = "";
  const blocks: Block[] = [];
  let i = 0;

  const splitRow = (l: string) =>
    l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
    } else if (line.startsWith("## ")) {
      title = line.slice(3).trim();
      i++;
    } else if (line.startsWith("Last updated:")) {
      updated = line.slice("Last updated:".length).trim();
      i++;
    } else if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i++;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) items.push(lines[i++].slice(2).trim());
      blocks.push({ type: "ul", items });
    } else if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(splitRow(lines[i++]));
      const [head, , ...body] = rows; // second row is the --- separator
      blocks.push({ type: "table", head, rows: body });
    } else {
      const para: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^(#{2,3} |- |\|)/.test(lines[i])
      ) {
        para.push(lines[i++]);
      }
      blocks.push({ type: "p", lines: para });
    }
  }

  return { title, updated, blocks };
}

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <strong key={m.index} className="font-semibold text-parchment">
          {inline(m[1])}
        </strong>
      );
    } else {
      const href = m[3];
      const cls = "text-teal hover:text-gold hover:underline";
      out.push(
        href.startsWith("/") ? (
          <Link key={m.index} href={href} className={cls}>{m[2]}</Link>
        ) : (
          <a key={m.index} href={href} className={cls} rel="noopener noreferrer">{m[2]}</a>
        )
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export async function LegalPage({ slug }: { slug: LegalSlug }) {
  const { title, updated, blocks } = await loadPolicy(slug);

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
        {updated && <p className="mt-2 text-xs text-sage/70">Last updated {updated}</p>}
      </header>

      <div className="mt-8 space-y-3 text-sm leading-relaxed text-sage">
        {blocks.map((b, k) => {
          switch (b.type) {
            case "h3":
              return (
                <h2 key={k} className="!mt-8 font-display text-lg font-semibold text-parchment">
                  {b.text}
                </h2>
              );
            case "p":
              return (
                <p key={k}>
                  {b.lines.map((l, j) => (
                    <span key={j}>
                      {inline(l.trimEnd())}
                      {j < b.lines.length - 1 && (l.endsWith("  ") ? <br /> : " ")}
                    </span>
                  ))}
                </p>
              );
            case "ul":
              return (
                <ul key={k} className="list-disc space-y-1.5 pl-5">
                  {b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}
                </ul>
              );
            case "table":
              return (
                <div key={k} className="overflow-x-auto rounded-lg border border-hairline">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-card text-parchment">
                      <tr>
                        {b.head.map((h, j) => <th key={j} className="px-3 py-2 font-semibold">{inline(h)}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {b.rows.map((r, j) => (
                        <tr key={j} className="border-t border-hairline align-top">
                          {r.map((c, n) => <td key={n} className="px-3 py-2">{inline(c)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
          }
        })}
      </div>
    </div>
  );
}
