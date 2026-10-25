import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getUserTransactions } from "@/lib/orders";
import { Price } from "@/components/Price";
import { TopUpForm } from "@/components/dashboard/TopUpForm";

export const metadata: Metadata = {
  title: "Wallet",
  robots: { index: false, follow: false },
};

export default async function WalletPage() {
  const user = (await getCurrentUser())!;
  const topups = (await getUserTransactions(user.id))
    .filter((t) => t.type === "topup")
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="corner-brackets rounded-xl border border-gold/25 bg-card p-6 shadow-glow-soft">
        <p className="engraved text-[10px] text-sage">Available balance</p>
        <Price gbpMinor={user.balanceMinor} className="mt-1 block text-4xl text-gold" />
        <p className="mt-2 text-sm text-sage">Use your balance for one-tap checkout on any relic.</p>
        <p className="mt-1 text-xs text-sage/80">
          To request a refund of unused paid balance, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal hover:text-gold">{CONTACT_EMAIL}</a> with your Account email and
          top-up reference. Do not include full card details, passwords or security codes. See the{" "}
          <Link href="/legal/balance" className="text-teal hover:text-gold">Account Balance &amp; Top-Up Policy</Link>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-parchment">Top up your wallet</h2>
          <TopUpForm />
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-parchment">Recent top-ups</h2>
          <div className="card-surface p-4">
            {topups.length === 0 ? (
              <p className="py-6 text-center text-sm text-sage">No top-ups yet.</p>
            ) : (
              <ul className="divide-y divide-hairline">
                {topups.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm text-parchment">{t.description}</p>
                      <p className="text-xs text-sage">
                        {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <Price gbpMinor={t.amountMinor} className="text-profit" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
