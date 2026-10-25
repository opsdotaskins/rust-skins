"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COUNTRIES, MIN_AGE, PHONE_HINT } from "@/lib/config";

type Fields = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
};

const STEPS = ["Account", "About you", "Address", "Confirm"] as const;

const EMPTY: Fields = {
  email: "", password: "", firstName: "", lastName: "", phone: "",
  dateOfBirth: "", street: "", city: "", country: "United Kingdom", postalCode: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (k: keyof Fields, v: string) =>
    setFields((f) => ({ ...f, [k]: v }));

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) e.email = "Enter a valid email";
      if (fields.password.length < 8) e.password = "At least 8 characters";
      else if (!/[A-Z]/.test(fields.password)) e.password = "Include an uppercase letter";
      else if (!/[0-9]/.test(fields.password)) e.password = "Include a number";
    }
    if (s === 1) {
      if (!fields.firstName.trim()) e.firstName = "First name is required";
      if (!fields.lastName.trim()) e.lastName = "Last name is required";
      if (fields.phone.trim().length < 6) e.phone = "Enter a valid phone number";
      if (!fields.dateOfBirth) e.dateOfBirth = "Date of birth is required";
      else {
        const age = (Date.now() - Date.parse(fields.dateOfBirth)) / (365.25 * 864e5);
        if (age < MIN_AGE) e.dateOfBirth = `You must be at least ${MIN_AGE}`;
      }
    }
    if (s === 2) {
      if (!fields.street.trim()) e.street = "Street is required";
      if (!fields.city.trim()) e.city = "City is required";
      if (!fields.country) e.country = "Select a country";
      if (!fields.postalCode.trim()) e.postalCode = "Postal code is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!agree || submitting) return;
    if (![0, 1, 2].every(validateStep)) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, agree: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.fields)) flat[k] = (v as string[])[0];
          setErrors(flat);
          if (flat.email) setStep(0);
        }
        throw new Error(data.error || "Registration failed");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Registration failed");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-2" aria-label="Registration progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                i < step ? "border-gold bg-gold text-abyss" : i === step ? "border-gold text-gold" : "border-hairline text-sage"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className={`hidden text-xs sm:block ${i === step ? "text-parchment" : "text-sage"}`}>{label}</span>
            {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < step ? "bg-gold/50" : "bg-hairline"}`} />}
          </li>
        ))}
      </ol>

      <div className="card-surface p-6">
        {step === 0 && (
          <div className="space-y-4">
            <Input label="Email" type="email" value={fields.email} onChange={(v) => set("email", v)} error={errors.email} autoComplete="email" />
            <Input label="Password" type="password" value={fields.password} onChange={(v) => set("password", v)} error={errors.password} hint="At least 8 characters, one uppercase letter and one number." autoComplete="new-password" />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={fields.firstName} onChange={(v) => set("firstName", v)} error={errors.firstName} autoComplete="given-name" />
              <Input label="Last name" value={fields.lastName} onChange={(v) => set("lastName", v)} error={errors.lastName} autoComplete="family-name" />
            </div>
            <Input label="Phone number" type="tel" value={fields.phone} onChange={(v) => set("phone", v)} error={errors.phone} hint={`Include your country code, e.g. ${PHONE_HINT}`} autoComplete="tel" />
            <Input label="Date of birth" type="date" value={fields.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} error={errors.dateOfBirth} autoComplete="bday" />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <Input label="Street" value={fields.street} onChange={(v) => set("street", v)} error={errors.street} autoComplete="address-line1" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={fields.city} onChange={(v) => set("city", v)} error={errors.city} autoComplete="address-level2" />
              <Input label="Postal code" value={fields.postalCode} onChange={(v) => set("postalCode", v)} error={errors.postalCode} autoComplete="postal-code" />
            </div>
            <label className="block">
              <span className="engraved mb-1 block text-[9px] text-sage">Country</span>
              <select value={fields.country} onChange={(e) => set("country", e.target.value)} className="field" autoComplete="country-name">
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} className="bg-panel">{c}</option>
                ))}
              </select>
              {errors.country && <span className="mt-1 block text-xs text-loss">{errors.country}</span>}
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <p className="engraved text-[10px] text-gold">Review your details</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Review label="Email" value={fields.email} />
              <Review label="Name" value={`${fields.firstName} ${fields.lastName}`} />
              <Review label="Phone" value={fields.phone} />
              <Review label="Date of birth" value={fields.dateOfBirth} />
              <Review label="Street" value={fields.street} />
              <Review label="City" value={fields.city} />
              <Review label="Country" value={fields.country} />
              <Review label="Postal code" value={fields.postalCode} />
            </dl>

            <label className="mt-2 flex items-start gap-2.5 text-sm text-sage">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-[#E8B44A]" />
              <span>
                I read and agree to the{" "}
                <Link href="/legal/terms" className="text-teal hover:underline">Terms &amp; Conditions</Link> and{" "}
                <Link href="/legal/privacy" className="text-teal hover:underline">Privacy Policy</Link>.
              </span>
            </label>
            {serverError && <p className="text-sm text-loss">{serverError}</p>}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn-ghost text-sm">Back</button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn-gold text-sm">Continue</button>
          ) : (
            <button type="button" onClick={submit} disabled={!agree || submitting} className="btn-gold text-sm">
              {submitting ? "Creating account…" : "Create account"}
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-sage">
        Already have an account? <Link href="/login" className="text-teal hover:text-gold">Log In</Link>
      </p>
    </div>
  );
}

function Input({
  label, value, onChange, error, type = "text", hint, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  type?: string; hint?: string; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="engraved mb-1 block text-[9px] text-sage">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className={`field ${error ? "!border-loss" : ""}`}
      />
      {error ? (
        <span className="mt-1 block text-xs text-loss">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-sage">{hint}</span>
      ) : null}
    </label>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-hairline bg-well/50 px-3 py-2">
      <dt className="engraved text-[8px] text-sage">{label}</dt>
      <dd className="truncate text-parchment">{value || "—"}</dd>
    </div>
  );
}
