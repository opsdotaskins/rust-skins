import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/ResetForm";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
  alternates: { canonical: "/reset-password" },
};

export default function ResetPage() {
  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password for your account.">
      <Suspense fallback={<div className="card-surface h-64 animate-pulse p-6" />}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
