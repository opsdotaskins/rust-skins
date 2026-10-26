import "server-only";
import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { db, ensureDb } from "./db";

export interface CorefyCustomerInput {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  country?: string | null;
  postalCode?: string | null;
}

export interface CorefyCreateInvoiceParams {
  referenceId: string;
  amount: number; // e.g. 15.00
  currency?: string; // defaults to EUR or COREFY_CURRENCY
  service?: string; // defaults to payment_card_eur_hpp or COREFY_SERVICE
  description: string;
  customer: CorefyCustomerInput;
  returnUrl?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CorefyInvoiceResult {
  invoiceId: string;
  hppUrl: string;
  status: string;
  raw: unknown;
}

const COUNTRY_MAP: Record<string, string> = {
  "united kingdom": "GB",
  "great britain": "GB",
  "uk": "GB",
  "england": "GB",
  "ireland": "IE",
  "united states": "US",
  "usa": "US",
  "canada": "CA",
  "germany": "DE",
  "france": "FR",
  "spain": "ES",
  "italy": "IT",
  "netherlands": "NL",
  "sweden": "SE",
  "norway": "NO",
  "denmark": "DK",
  "finland": "FI",
  "poland": "PL",
  "portugal": "PT",
  "austria": "AT",
  "belgium": "BE",
  "switzerland": "CH",
  "australia": "AU",
  "new zealand": "NZ",
  "japan": "JP",
  "south korea": "KR",
  "singapore": "SG",
  "united arab emirates": "AE",
  "brazil": "BR",
  "mexico": "MX",
  "ukraine": "UA",
};

export function mapCountryToCode(country?: string | null): string {
  if (!country) return "GB";
  const clean = country.trim().toLowerCase();
  if (clean.length === 2) return clean.toUpperCase();
  return COUNTRY_MAP[clean] || "GB";
}

export function formatCorefyCustomer(u: CorefyCustomerInput) {
  const firstName = (u.firstName || "Customer").trim();
  const surname = (u.lastName || "User").trim();
  const name = `${firstName} ${surname}`.trim();
  const country = mapCountryToCode(u.country);
  const street = (u.street || "196 High Road").trim();
  const city = (u.city || "London").trim();
  const postCode = (u.postalCode || "N22 8HH").trim();
  const fullAddress = `${street}, ${city}, ${postCode}`;

  let phone = (u.phone || "").trim();
  if (phone && !phone.startsWith("+")) {
    const digits = phone.replace(/\D/g, "");
    phone = digits ? `+${digits}` : "+447476928624";
  }
  if (!phone) {
    phone = "+447476928624";
  }

  return {
    reference_id: String(u.id),
    email: u.email,
    name,
    first_name: firstName,
    surname,
    phone,
    address: {
      full_address: fullAddress,
      country,
      city,
      street,
      post_code: postCode,
    },
  };
}

export function getCorefyConfig() {
  const apiUrl = (process.env.COREFY_API_URL || "https://api.sterling-pay.com").replace(/\/+$/, "");
  const accountId = (process.env.COREFY_ACCOUNT_ID || "").trim();
  const apiKey = (process.env.COREFY_API_KEY || "").trim();
  const webhookSecret = (process.env.COREFY_WEBHOOK_SECRET || "").trim();
  const currency = (process.env.COREFY_CURRENCY || "EUR").toUpperCase();
  const service = process.env.COREFY_SERVICE || `payment_card_${currency.toLowerCase()}_hpp`;
  const appUrl = (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  return {
    apiUrl,
    accountId,
    apiKey,
    webhookSecret,
    currency,
    service,
    appUrl,
  };
}

let tableEnsured = false;
export async function ensurePaymentInvoicesTable(): Promise<void> {
  if (tableEnsured) return;
  tableEnsured = true;
  await ensureDb();
}

/**
 * Creates a Payment Invoice with Sterling Pay / Corefy HPP
 */
export async function createCorefyPaymentInvoice(
  params: CorefyCreateInvoiceParams
): Promise<CorefyInvoiceResult> {
  const config = getCorefyConfig();

  if (!config.accountId || !config.apiKey) {
    throw new Error(
      "Sterling Pay / Corefy credentials missing. Please set COREFY_ACCOUNT_ID and COREFY_API_KEY in .env"
    );
  }

  const basicAuth = Buffer.from(`${config.accountId}:${config.apiKey}`).toString("base64");
  const currency = params.currency || config.currency;
  const service = params.service || config.service;
  const returnUrl = params.returnUrl || `${config.appUrl}/payment/return?ref=${encodeURIComponent(params.referenceId)}`;
  const callbackUrl = params.callbackUrl || `${config.appUrl}/payments/corefy/webhook`;

  const payload = {
    data: {
      type: "payment-invoices",
      attributes: {
        reference_id: params.referenceId,
        amount: Number(Number(params.amount).toFixed(2)),
        currency,
        service,
        flow: "charge",
        test_mode: process.env.COREFY_TEST_MODE === "true",
        description: params.description,
        customer: formatCorefyCustomer(params.customer),
        return_url: returnUrl,
        return_urls: {
          success: returnUrl,
          pending: returnUrl,
          fail: returnUrl,
        },
        callback_url: callbackUrl,
        metadata: {
          ...params.metadata,
          source: "rust-skins",
          reference_id: params.referenceId,
        },
      },
    },
  };

  const endpoint = `${config.apiUrl}/payment-invoices`;
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new Error(
      `Failed to connect to Sterling Pay / Corefy gateway: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const json = (await res.json().catch(() => null)) as {
    data?: {
      id?: string;
      attributes?: {
        status?: string;
        hpp_url?: string;
        flow_data?: { action?: string; method?: string };
      };
    };
    errors?: Array<{ detail?: string; title?: string }>;
    message?: string;
  } | null;

  if (!res.ok || !json?.data) {
    const errorDetail =
      json?.errors?.map((e) => e.detail || e.title).filter(Boolean).join("; ") ||
      json?.message ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(`Sterling Pay payment creation failed: ${errorDetail}`);
  }

  const hppUrl =
    json.data.attributes?.hpp_url ||
    json.data.attributes?.flow_data?.action;

  if (!hppUrl) {
    throw new Error("No HPP redirect URL returned by Sterling Pay gateway.");
  }

  return {
    invoiceId: json.data.id || "",
    hppUrl,
    status: json.data.attributes?.status || "pending",
    raw: json,
  };
}

/**
 * Validates Corefy Webhook X-Signature:
 * Signature = base64(sha1(secret + rawBody + secret))
 */
export function verifyCorefyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const config = getCorefyConfig();
  if (!config.webhookSecret) {
    // If webhook secret is not configured in dev, log warning but allow
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ COREFY_WEBHOOK_SECRET is not configured; skipping signature check in dev.");
      return true;
    }
    return false;
  }

  if (!signature) return false;

  const expected = crypto
    .createHash("sha1")
    .update(config.webhookSecret + rawBody + config.webhookSecret)
    .digest("base64");

  return expected === signature;
}
