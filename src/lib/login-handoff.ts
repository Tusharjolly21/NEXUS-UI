/**
 * login-handoff.ts — SERVER ONLY.
 *
 * Cross-device magic-link sign-in. The device that asks for the link keeps a
 * random secret and polls; the device that opens the link approves; the server
 * then signs the polling device in. Rows live in `login_handoffs`
 * (see supabase/migrations/0006_login_handoffs.sql).
 */

import { createHash, timingSafeEqual } from "node:crypto";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/supabase/admin";

export const OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

export function isOtpType(value: string | null | undefined): value is EmailOtpType {
  return OTP_TYPES.includes(value as EmailOtpType);
}

/** Collapse a Supabase auth error into a stable code the login page can map to a message. */
export function authErrorCode(error: { message: string; code?: string }): string {
  if (/code verifier/i.test(error.message)) return "pkce_missing";
  if (error.code === "otp_expired" || /expired|invalid/i.test(error.message)) return "otp_expired";
  return "exchange_failed";
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SECRET_PATTERN = /^[0-9a-f]{64}$/;

export function isHandoffId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/** The browser generates 32 random bytes and sends them hex-encoded. */
export function isHandoffSecret(value: unknown): value is string {
  return typeof value === "string" && SECRET_PATTERN.test(value);
}

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function secretMatches(secret: string, storedHash: string): boolean {
  const a = Buffer.from(hashSecret(secret), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** "Chrome on Windows" — enough for the user to recognise their own device. */
export function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "an unknown device";
  const os = /iPhone|iPad/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(userAgent)
          ? "macOS"
          : /CrOS/.test(userAgent)
            ? "ChromeOS"
            : /Linux/.test(userAgent)
              ? "Linux"
              : null;
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\/|Opera/.test(userAgent)
      ? "Opera"
      : /Firefox\/|FxiOS\//.test(userAgent)
        ? "Firefox"
        : /Chrome\/|CriOS\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : null;
  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os ?? "an unknown device";
}

export type PendingHandoff = {
  id: string;
  device: string | null;
  location: string | null;
  created_at: string;
};

/**
 * The still-open request for `id`, or null. Also null when the table is
 * missing or unreachable, so callers fall back to a plain same-device sign-in.
 */
export async function getPendingHandoff(id: string): Promise<PendingHandoff | null> {
  try {
    const { data, error } = await getAdminClient()
      .from("login_handoffs")
      .select("id, device, location, created_at")
      .eq("id", id)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (error) {
      console.error("[login-handoff] lookup failed:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error("[login-handoff] lookup threw:", err);
    return null;
  }
}
