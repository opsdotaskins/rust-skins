import { NextResponse } from "next/server";
import { getItemsByIds } from "@/lib/queries";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") || "")
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 0);
  if (!ids.length) return NextResponse.json([]);
  try {
    const items = await getItemsByIds(ids);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
