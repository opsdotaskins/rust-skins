"use client";
import { ItemCard } from "./ItemCard";
import type { ItemWithRefs } from "@/lib/queries";

export function ItemGrid({ items }: { items: ItemWithRefs[] }) {
  if (!items.length)
    return (
      <div className="rounded-lg border border-dashed border-hairline bg-card/50 p-12 text-center">
        <p className="text-sage">No relics match your filters. Try clearing a few.</p>
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item, i) => (
        <div key={item.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
          <ItemCard item={item} />
        </div>
      ))}
    </div>
  );
}
