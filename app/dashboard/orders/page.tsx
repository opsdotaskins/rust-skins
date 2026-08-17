import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrders, getUserTransactions } from "@/lib/orders";
import { Price } from "@/components/Price";

export const metadata: Metadata = {
  title: "Orders & activity",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const user = (await getCurrentUser())!;
  const [orders, txns] = await Promise.all([
    getUserOrders(user.id),
    getUserTransactions(user.id),
  ]);
  const refByOrderId = new Map(orders.map((o) => [o.id, o.reference]));

  return (
    <div className="space-y-6">
      <section className="card-surface p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-parchment">Order history</h2>
        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-hairline p-8 text-center">
            <p className="text-sage">You haven&apos;t placed any orders yet.</p>
            <Link href="/catalog" className="btn-gold mt-4">Browse the vault</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th className="engraved py-2 pr-4 text-[9px] text-sage">Reference</th>
                  <th className="engraved py-2 pr-4 text-[9px] text-sage">Date</th>
                  <th className="engraved py-2 pr-4 text-[9px] text-sage">Status</th>
                  <th className="engraved py-2 pr-4 text-right text-[9px] text-sage">Total</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 pr-4 font-mono text-parchment">{o.reference}</td>
                    <td className="py-3 pr-4 text-sage">
                      {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 pr-4 capitalize text-teal">{o.status}</td>
                    <td className="py-3 pr-4 text-right"><Price gbpMinor={o.totalMinor} className="text-gold" /></td>
                    <td className="py-3 text-right">
                      <Link href={`/order/${o.reference}`} className="text-teal hover:text-gold">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card-surface p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-parchment">Wallet activity</h2>
        {txns.length === 0 ? (
          <p className="py-6 text-center text-sm text-sage">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {txns.map((t) => {
              const ref = t.orderId ? refByOrderId.get(t.orderId) : null;
              return (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full ${
                        t.amountMinor >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                      }`}
                      aria-hidden
                    >
                      {t.amountMinor >= 0 ? "+" : "−"}
                    </span>
                    <div>
                      <p className="text-sm text-parchment">
                        {ref ? (
                          <Link href={`/order/${ref}`} className="hover:text-gold">{t.description}</Link>
                        ) : (
                          t.description
                        )}
                      </p>
                      <p className="text-xs text-sage">
                        {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        {" · "}
                        <span className="capitalize">{t.type}</span>
                      </p>
                    </div>
                  </div>
                  <Price
                    gbpMinor={Math.abs(t.amountMinor)}
                    className={t.amountMinor >= 0 ? "text-profit" : "text-parchment"}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
