import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/db/schema";

export function CategoryBrowser({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/catalog?category=${c.slug}`}
          className="group hover-lift relative overflow-hidden rounded-lg border border-hairline bg-card"
        >
          <div className="relative aspect-square">
            <Image src={c.image} alt={c.name} fill sizes="20vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/40 to-transparent" />
            <span aria-hidden className="sweep-mask absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between p-2.5 text-sm font-medium text-parchment">
              {c.name}
              <span className="translate-x-2 text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">→</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
