/**
 * Single source of truth for company data, values and policy constants.
 * Every page, policy, footer and checkout MUST read from here so numbers
 * never drift.
 */

export const CONTACT_EMAIL = "info@rust-skins.com";

export const COMPANY = {
  name: "BETTERB LTD",
  tradingAs: "rust-skins.com",
  address: "Dept 7014, 196 High Road, Wood Green, London, United Kingdom, N22 8HH",
  regNumber: "17406491",
  email: CONTACT_EMAIL,
  website: "https://www.rust-skins.com/",
} as const;

export const SITE = {
  name: "Runevault",
  tagline: "Gear up your survival in style.",
  description:
    "Runevault is the store for authentic Rust skins — weapons, apparel, base and deployables, delivered to your Steam inventory via trade offer.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "en_GB",
} as const;

/**
 * Single canonical values — identical everywhere (FAQ, policies, checkout).
 * Must match content/legal/*.md: no instant/"in seconds" or 24/7 promises.
 */
export const VALUES = {
  deliveryPromise: "Digital delivery via Steam trade offer",
  deliveryEstimate: "usually within a few minutes",
  supportResponse: "initial response within 5 business days",
  serviceFeeMinor: 0, // no service fee; if ever set, reads identically everywhere
} as const;

/** Minimum customer age (Terms §3). */
export const MIN_AGE = 18;

/**
 * Countries we do not serve (Terms §3). Keep in sync with content/legal/terms.md.
 */
export const EXCLUDED_COUNTRIES = [
  "Afghanistan",
  "Belarus",
  "Central African Republic",
  "Cuba",
  "Democratic Republic of the Congo",
  "Haiti",
  "Iran",
  "Iraq",
  "Mali",
  "Myanmar",
  "North Korea",
  "Russia",
  "Somalia",
  "South Sudan",
  "Sudan",
  "Syria",
  "Venezuela",
  "Yemen",
  "Zimbabwe",
] as const;

/** Allowed registration countries (region-appropriate, GB-first). */
export const COUNTRIES = [
  "United Kingdom",
  "Ireland",
  "United States",
  "Canada",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Portugal",
  "Austria",
  "Belgium",
  "Switzerland",
  "Australia",
  "New Zealand",
  "Japan",
  "South Korea",
  "Singapore",
  "United Arab Emirates",
  "Brazil",
  "Mexico",
  "Ukraine",
].filter(
  (c) => !EXCLUDED_COUNTRIES.includes(c as (typeof EXCLUDED_COUNTRIES)[number])
);

/** Phone hint for the project's region. */
export const PHONE_HINT = "+44 7700 900123";

export const TRADEMARK_DISCLAIMER =
  "rust-skins.com is not affiliated with or endorsed by Facepunch Studios or Valve Corporation. Rust is a trademark of Facepunch Studios. All skin names and related imagery are the property of their respective owners.";
