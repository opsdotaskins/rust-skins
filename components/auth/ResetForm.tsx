"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-parchment">Invalid reset link.</p>
        <Link href="/forgot-password" className="btn-gold mt-4">Request a new link</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError("Passwords do not match");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-parchment">Password updated.</p>
        <p className="mt-2 text-sm text-sage">Redirecting you to log in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-surface space-y-4 p-6">
      <label className="block">
        <span className="engraved mb-1 block text-[9px] text-sage">New password</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" autoComplete="new-password" required />
        <span className="mt-1 block text-xs text-sage">At least 8 characters, one uppercase letter and one number.</span>
      </label>
      <label className="block">
        <span className="engraved mb-1 block text-[9px] text-sage">Confirm password</span>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field" autoComplete="new-password" required />
      </label>
      {error && <p className="text-sm text-loss">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-gold w-full">
        {submitting ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}
