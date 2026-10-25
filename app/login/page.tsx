import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your rust-skins.com account to browse and buy authentic Rust skins.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");
  return (
    <AuthShell title="Welcome back" subtitle="Log in to enter the vault.">
      <Suspense fallback={<div className="card-surface h-64 animate-pulse p-6" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
