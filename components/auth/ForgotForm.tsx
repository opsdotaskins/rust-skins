"use client";

import { useState } from "react";
import Link from "next/link";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setSent(true);
    setSubmitting(false);
  };

  if (sent) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-parchment">Check your inbox.</p>
        <p className="mt-2 text-sm text-sage">
          If an account exists for <span className="text-parchment">{email}</span>, we&apos;ve sent a password reset link. It expires in 60 minutes.
        </p>
        <Link href="/login" className="btn-ghost mt-6">Back to login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-surface space-y-4 p-6">
      <label className="block">
        <span className="engraved mb-1 block text-[9px] text-sage">Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="email" required />
      </label>
      <button type="submit" disabled={submitting} className="btn-gold w-full">
        {submitting ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-sage">
        Remembered it? <Link href="/login" className="text-teal hover:text-gold">Log In</Link>
      </p>
    </form>
  );
}
