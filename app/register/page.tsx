import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a Runevault account to buy authentic Rust skins delivered via Steam trade offer.",
  alternates: { canonical: "/register" },
};

export default async function RegisterPage() {
  if (await getSession()) redirect("/dashboard");
  return (
    <AuthShell title="Create your account" subtitle="A few quick steps to join the vault.">
      <RegisterForm />
    </AuthShell>
  );
}
