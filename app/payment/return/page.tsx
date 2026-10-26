import type { Metadata } from "next";
import { PaymentReturnClient } from "./PaymentReturnClient";

export const metadata: Metadata = {
  title: "Payment Status",
  robots: { index: false, follow: false },
};

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <PaymentReturnClient initialRef={ref || ""} />
    </div>
  );
}
