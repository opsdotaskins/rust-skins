import Image from "next/image";
import type { Review } from "@/lib/db/schema";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < n ? "#E8B44A" : "none"} stroke="#E8B44A" strokeWidth="1.5">
          <path d="m12 2 3 6.5 7 .6-5.3 4.6L18.2 21 12 17.3 5.8 21l1.5-7.3L2 9.1l7-.6L12 2Z" />
        </svg>
      ))}
    </span>
  );
}

export function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {reviews.map((r) => (
        <figure key={r.id} className="card-surface hover-lift flex flex-col gap-3 p-4">
          <Stars n={r.rating} />
          <blockquote className="flex-1 text-sm leading-relaxed text-parchment/90">
            &ldquo;{r.body}&rdquo;
          </blockquote>
          <figcaption className="flex items-center gap-2.5 border-t border-hairline pt-3">
            <Image src={r.avatar} alt={r.authorName} width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
            <span>
              <span className="block text-xs font-medium text-parchment">{r.authorName}</span>
              {r.itemName && <span className="block font-mono text-[10px] text-sage">{r.itemName}</span>}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
