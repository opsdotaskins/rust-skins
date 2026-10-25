"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-surface space-y-4 p-6">
      <label className="block">
        <span className="engraved mb-1 block text-[9px] text-sage">Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="email" required />
      </label>
      <label className="block">
        <span className="engraved mb-1 block text-[9px] text-sage">Password</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" autoComplete="current-password" required />
      </label>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-xs text-teal hover:text-gold">Forgot password?</Link>
      </div>
      {error && <p className="text-sm text-loss">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-gold w-full">
        {submitting ? "Signing in…" : "Log In"}
      </button>
      <p className="text-center text-sm text-sage">
        New to rust-skins.com? <Link href="/register" className="text-teal hover:text-gold">Create an account</Link>
      </p>
    </form>
  );
}
