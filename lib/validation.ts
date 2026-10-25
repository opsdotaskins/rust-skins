import { z } from "zod";
import { COUNTRIES, EXCLUDED_COUNTRIES, MIN_AGE } from "./config";

export const registerSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
  firstName: z.string().min(1, "First name is required").max(120),
  lastName: z.string().min(1, "Last name is required").max(120),
  phone: z.string().min(6, "Enter a valid phone number").max(40),
  dateOfBirth: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date")
    .refine((v) => {
      const dob = new Date(v);
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
      return age >= MIN_AGE && age < 120;
    }, `You must be at least ${MIN_AGE}`),
  street: z.string().min(1, "Street is required").max(255),
  city: z.string().min(1, "City is required").max(120),
  country: z
    .string()
    .refine(
      (c) =>
        COUNTRIES.includes(c) &&
        !EXCLUDED_COUNTRIES.includes(c as (typeof EXCLUDED_COUNTRIES)[number]),
      "This country is not available"
    ),
  postalCode: z.string().min(2, "Postal code is required").max(40),
  agree: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotSchema = z.object({ email: z.string().email() });

export const resetSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
});
