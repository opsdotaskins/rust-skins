import { redirect } from "next/navigation";

/** Legacy URL — Steam linking now lives in the dashboard. */
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ steam?: string }>;
}) {
  const { steam } = await searchParams;
  redirect(steam ? `/dashboard/steam?steam=${encodeURIComponent(steam)}` : "/dashboard/steam");
}
