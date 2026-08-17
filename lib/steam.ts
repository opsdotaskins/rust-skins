import "server-only";
import { SITE } from "./config";

/**
 * Steam OpenID 2.0 sign-in + profile lookup.
 * Used to link a Steam account so skins can be delivered via trade offer,
 * and to pull the player's persona name and avatar.
 */

const OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const STEAM_API_KEY = process.env.STEAM_API_KEY || "";
const REALM = SITE.url.replace(/\/$/, "");

/** Build the URL to redirect the user to for Steam sign-in. */
export function buildLoginUrl(returnTo: string): string {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": REALM,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${OPENID_ENDPOINT}?${params.toString()}`;
}

const STEAMID_RE = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

/**
 * Verify the OpenID assertion returned by Steam. Returns the 64-bit steamId
 * on success, or null if the signature does not check out.
 */
export async function verifyCallback(query: URLSearchParams): Promise<string | null> {
  const claimedId = query.get("openid.claimed_id");
  const match = claimedId ? STEAMID_RE.exec(claimedId) : null;
  if (!match) return null;

  // Echo every openid.* param back with mode=check_authentication.
  const body = new URLSearchParams();
  for (const [k, v] of query.entries()) {
    if (k.startsWith("openid.")) body.set(k, v);
  }
  body.set("openid.mode", "check_authentication");

  const res = await fetch(OPENID_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });
  const text = await res.text();
  if (!/is_valid\s*:\s*true/.test(text)) return null;
  return match[1];
}

export interface SteamProfile {
  steamId: string;
  personaName: string;
  avatar: string;
}

/** Fetch persona name + avatar for a steamId via the Steam Web API. */
export async function getPlayerSummary(steamId: string): Promise<SteamProfile | null> {
  if (!STEAM_API_KEY) return null;
  const url = new URL("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/");
  url.searchParams.set("key", STEAM_API_KEY);
  url.searchParams.set("steamids", steamId);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    response?: { players?: { personaname?: string; avatarfull?: string }[] };
  };
  const p = json.response?.players?.[0];
  if (!p) return null;
  return {
    steamId,
    personaName: p.personaname ?? "Steam user",
    avatar: p.avatarfull ?? "",
  };
}

/**
 * Parse a Steam trade URL into its partner id and token.
 * e.g. https://steamcommunity.com/tradeoffer/new/?partner=123&token=AbCdEf12
 */
export function parseTradeUrl(
  tradeUrl: string
): { partner: string; token: string } | null {
  try {
    const u = new URL(tradeUrl.trim());
    if (!/steamcommunity\.com$/.test(u.hostname)) return null;
    const partner = u.searchParams.get("partner");
    const token = u.searchParams.get("token");
    if (!partner || !token) return null;
    return { partner, token };
  } catch {
    return null;
  }
}
