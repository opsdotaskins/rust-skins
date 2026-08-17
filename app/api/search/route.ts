import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/queries";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json([]);

  try {
    const items = await getCatalog({ q, sort: "popular" });
    return NextResponse.json(
      items.slice(0, 8).map((i) => ({
        id: i.id,
        slug: i.slug,
        name: i.name,
        image: i.image,
        rarity: i.rarity,
        heroName: i.heroName,
        priceMinor: i.priceMinor,
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
