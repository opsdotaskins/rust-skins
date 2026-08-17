import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrders, getUserTransactions } from "@/lib/orders";
import { Price } from "@/components/Price";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardHome() {
  const user = (await getCurrentUser())!;
  const [orders, txns] = await Promise.all([
    getUserOrders(user.id),
    getUserTransactions(user.id),
  ]);

  const spentMinor = txns
    .filter((t) => t.type === "purchase")
    .reduce((s, t) => s + Math.abs(t.amountMinor), 0);
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="corner-brackets rounded-xl border border-gold/25 bg-card p-5 shadow-glow-soft">
          <p className="engraved text-[10px] text-sage">Wallet balance</p>
          <Price gbpMinor={user.balanceMinor} className="mt-1 block text-2xl text-gold" />
          <Link href="/dashboard/wallet" className="btn-gold mt-3 w-full text-sm">Top up</Link>
        </div>
        <div className="rounded-xl border border-hairline bg-card p-5">
          <p className="engraved text-[10px] text-sage">Total orders</p>
          <p className="mt-1 font-mono text-2xl text-parchment">{orders.length}</p>
          <Link href="/dashboard/orders" className="mt-3 inline-block text-sm text-teal hover:text-gold">View activity →</Link>
        </div>
        <div className="rounded-xl border border-hairline bg-card p-5">
          <p className="engraved text-[10px] text-sage">Lifetime spend</p>
          <Price gbpMinor={spentMinor} className="mt-1 block text-2xl text-parchment" />
          <Link href="/catalog" className="mt-3 inline-block text-sm text-teal hover:text-gold">Browse the vault →</Link>
        </div>
      </div>

      <section className="card-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-parchment">Recent orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-teal hover:text-gold">See all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-hairline p-8 text-center">
            <p className="text-sage">No orders yet.</p>
            <Link href="/catalog" className="btn-gold mt-4">Explore relics</Link>
          </div>
        ) : (
          <ul className="divide-y divide-hairline">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <Link href={`/order/${o.reference}`} className="font-mono text-sm text-parchment hover:text-gold">
                    {o.reference}
                  </Link>
                  <p className="text-xs text-sage">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    <span className="capitalize text-teal">{o.status}</span>
                  </p>
                </div>
                <Price gbpMinor={o.totalMinor} className="text-gold" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-surface p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-parchment">Account details</h2>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Field label="Name" value={`${user.firstName} ${user.lastName}`} />
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={user.phone} />
          <Field
            label="Address"
            value={[user.street, user.city, user.postalCode, user.country].filter(Boolean).join(", ")}
          />
        </dl>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="engraved text-[9px] text-sage">{label}</dt>
      <dd className="mt-0.5 text-parchment">{value}</dd>
    </div>
  );
}
