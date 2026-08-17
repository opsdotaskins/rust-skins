import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { SteamLinkPanel } from "@/components/steam/SteamLinkPanel";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ steam?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const { steam } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-parchment">Your account</h1>
      <p className="mt-2 text-sage">
        Manage the Steam account your Rust skins are delivered to.
      </p>

      {steam === "linked" && (
        <p className="mt-4 rounded-md border border-profit/30 bg-profit/10 px-4 py-2 text-sm text-profit">
          Steam account linked successfully.
        </p>
      )}
      {steam === "error" && (
        <p className="mt-4 rounded-md border border-loss/30 bg-loss/10 px-4 py-2 text-sm text-loss">
          Steam sign-in could not be verified. Please try again.
        </p>
      )}

      <div className="mt-8">
        <SteamLinkPanel
          steamId={user.steamId}
          steamName={user.steamName}
          steamAvatar={user.steamAvatar}
          hasTradeToken={Boolean(user.steamTradeToken)}
        />
      </div>
    </div>
  );
}
