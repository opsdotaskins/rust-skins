import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="engraved text-[10px] text-sage">Your vault</p>
        <h1 className="font-display text-3xl font-bold text-parchment">
          Welcome back, {user.firstName}
        </h1>
      </div>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-28 md:self-start">
          <DashboardNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
