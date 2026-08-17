import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const url = new URL(request.url);
  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/account", url.origin));
  }

  const returnTo = new URL("/api/steam/callback", url.origin).toString();
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": url.origin,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return NextResponse.redirect(`${OPENID_ENDPOINT}?${params.toString()}`);
}
