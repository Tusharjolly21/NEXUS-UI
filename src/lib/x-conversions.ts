import { createHash } from "node:crypto";

/**
 * X (Twitter) Conversion API for pixel `riinx`. Server code only: call it where the conversion is
 * confirmed (for example the payment webhook or the sign-up callback), never from the browser. It uses
 * node:crypto and a secret token, so importing it into a client component fails the build.
 *
 * The access token comes from the X_PIXEL_TOKEN environment variable (generated in X Ads Manager). Without
 * it nothing is sent. Like trackServer it can never throw, so a failure here cannot make a webhook fail
 * and be retried; check the returned result when testing.
 *
 * Every conversion needs at least one identifier: a `twclid`, a hashed email, a hashed phone number, or
 * both an IP address and a user agent. Emails are trimmed and lowercased, phone numbers must be E.164
 * (+15551234567), and both are SHA-256 hashed to hex here, so pass them in plain.
 *
 * If the web pixel fires the same event, pass the same `conversionId` to both so X counts it once.
 */

export const X_PIXEL_ID = "riinx";
const ENDPOINT = `https://ads-api.x.com/12/measurement/conversions/${X_PIXEL_ID}`;
/** Event IDs are copied from Events Manager and look like tw-riinx-xxxxx. */
const EVENT_ID = /^tw-riinx-[A-Za-z0-9]+$/;
const TIMEOUT_MS = 5000;

export type XConversionInput = {
  /** From Events Manager, e.g. "tw-riinx-xxxxx". */
  eventId: string;
  /** Same value the web pixel sends for this event, so X can drop the duplicate. */
  conversionId?: string;
  /** Page where the conversion happened (optional). */
  eventSourceUrl?: string;
  /** Defaults to now. */
  conversionTime?: Date;
  /** The `twclid` URL parameter from the visitor's landing page. */
  twclid?: string;
  email?: string;
  /** E.164 only, e.g. +15551234567. Anything else is left out rather than guessed. */
  phone?: string;
  /** Used only together with userAgent. */
  ipAddress?: string;
  userAgent?: string;
};

export type XConversionResult = {
  ok: boolean;
  /** HTTP status from X, when the request was made. */
  status?: number;
  /** Why nothing was sent, or what went wrong. Never contains the token or personal data. */
  reason?: "no_token" | "bad_event_id" | "no_identifier" | "request_failed" | "rejected";
  /** X's response body on a non-2xx answer, to help debugging. */
  detail?: string;
};

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Trim and lowercase, then hash. Returns undefined for an empty value. */
export function hashEmail(email: string): string | undefined {
  const normalized = email.trim().toLowerCase();
  return normalized ? sha256Hex(normalized) : undefined;
}

/** Hashes an E.164 number (+, then 7 to 15 digits, not starting with 0). Spaces, dashes and brackets are dropped first. */
export function hashPhone(phone: string): string | undefined {
  const normalized = phone.trim().replace(/[\s().-]/g, "");
  return /^\+[1-9]\d{6,14}$/.test(normalized) ? sha256Hex(normalized) : undefined;
}

export async function sendXConversion(input: XConversionInput): Promise<XConversionResult> {
  const token = process.env.X_PIXEL_TOKEN;
  if (!token) return { ok: false, reason: "no_token" };
  if (!EVENT_ID.test(input.eventId)) return { ok: false, reason: "bad_event_id" };

  const identifier: Record<string, string> = {};
  const twclid = input.twclid?.trim();
  if (twclid) identifier.twclid = twclid;
  const email = input.email ? hashEmail(input.email) : undefined;
  if (email) identifier.hashed_email = email;
  const phone = input.phone ? hashPhone(input.phone) : undefined;
  if (phone) identifier.hashed_phone_number = phone;
  if (input.ipAddress && input.userAgent) {
    identifier.ip_address = input.ipAddress;
    identifier.user_agent = input.userAgent;
  }
  if (Object.keys(identifier).length === 0) return { ok: false, reason: "no_identifier" };

  const conversion: Record<string, unknown> = {
    conversion_time: (input.conversionTime ?? new Date()).toISOString(),
    event_id: input.eventId,
    identifiers: [identifier],
  };
  if (input.eventSourceUrl) conversion.event_source_url = input.eventSourceUrl;
  if (input.conversionId) conversion.conversion_id = input.conversionId;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "X-Pixel-Token": token, "Content-Type": "application/json" },
      body: JSON.stringify({ conversions: [conversion] }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) return { ok: true, status: res.status };
    return { ok: false, status: res.status, reason: "rejected", detail: (await res.text().catch(() => "")).slice(0, 300) };
  } catch {
    return { ok: false, reason: "request_failed" };
  }
}
