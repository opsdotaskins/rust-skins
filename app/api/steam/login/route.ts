import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildLoginUrl, steamCallbackUrl } from "@/lib/steam";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const url = new URL(request.url);
  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/dashboard/steam", url.origin));
  }

  return NextResponse.redirect(buildLoginUrl(steamCallbackUrl(url.origin)));
}
