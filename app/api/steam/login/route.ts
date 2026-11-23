import { NextResponse } from "next/server";
import { buildLoginUrl, steamCallbackUrl } from "@/lib/steam";

export const runtime = "nodejs";

/**
 * Start Steam OpenID. Works in two modes, decided in the callback:
 *  - signed in  → link the Steam account to the current user
 *  - signed out → sign in with Steam (or finish registration for a new SteamID)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(buildLoginUrl(steamCallbackUrl(url.origin)));
}
