import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, getPendingSteam } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a rust-skins.com account to buy authentic Rust skins delivered via Steam trade offer.",
  alternates: { canonical: "/register" },
};

export default async function RegisterPage() {
  if (await getSession()) redirect("/dashboard");
  const pendingSteam = await getPendingSteam();
  return (
    <AuthShell
      title={pendingSteam ? "Finish signing up" : "Create your account"}
      subtitle={
        pendingSteam
          ? "Your Steam account is verified. Complete your profile to start buying."
          : "A few quick steps to join the vault."
      }
    >
      <RegisterForm
        steam={pendingSteam ? { name: pendingSteam.steamName, avatar: pendingSteam.steamAvatar } : null}
      />
    </AuthShell>
  );
}
