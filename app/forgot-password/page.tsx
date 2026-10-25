import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your rust-skins.com account password.",
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPage() {
  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a secure link to set a new one.">
      <ForgotForm />
    </AuthShell>
  );
}
