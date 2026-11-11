import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { SteamLinkPanel } from "@/components/steam/SteamLinkPanel";

export const metadata: Metadata = {
  title: "Steam account",
  robots: { index: false, follow: false },
};

export default async function DashboardSteamPage({
  searchParams,
}: {
  searchParams: Promise<{ steam?: string }>;
}) {
  // The dashboard layout already redirects signed-out visitors to /login.
  const user = (await getCurrentUser())!;
  const { steam } = await searchParams;

  return (
    <div className="space-y-4">
      {steam === "linked" && (
        <p className="rounded-md border border-profit/30 bg-profit/10 px-4 py-2 text-sm text-profit">
          Steam account linked successfully.
        </p>
      )}
      {steam === "error" && (
        <p className="rounded-md border border-loss/30 bg-loss/10 px-4 py-2 text-sm text-loss">
          Steam sign-in could not be verified. Please try again.
        </p>
      )}
      <SteamLinkPanel
        steamId={user.steamId}
        steamName={user.steamName}
        steamAvatar={user.steamAvatar}
        hasTradeToken={Boolean(user.steamTradeToken)}
      />
    </div>
  );
}
