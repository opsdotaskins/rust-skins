import { NextResponse } from "next/server";
import { syncPrices } from "@/lib/catalog-sync";
import { importMissingItems } from "@/lib/catalog-import";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Refresh catalogue prices/stock from SIH. Protect with a secret so only a
 * scheduled job (or an operator) can trigger it. Pass ?key=<SIH_WEBHOOK_SECRET>.
 * Add &import=1 to first add catalogue skins from lib/db/rust-items.json that
 * are not in the database yet (non-destructive).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = process.env.SIH_WEBHOOK_SECRET;
  if (!secret || url.searchParams.get("key") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const imported = url.searchParams.get("import") === "1" ? await importMissingItems() : null;
    const result = await syncPrices();
    return NextResponse.json({ ok: true, ...result, imported });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 }
    );
  }
}
