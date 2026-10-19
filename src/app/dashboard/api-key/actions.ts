"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { issueApiToken } from "@/lib/entitlements";
import { rateLimit } from "@/lib/rate-limit";

export type RegenerateApiTokenResult =
  | { ok: true; token: string; hint: string; createdAt: string }
  | { ok: false; error: string };

/**
 * Issues a fresh API token for the signed-in user and revokes the old one.
 * The plaintext is returned once and never stored.
 */
export async function regenerateApiToken(): Promise<RegenerateApiTokenResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Sign in to generate a token." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to generate a token." };

  const rl = rateLimit(`api-token:${user.id}`, 5, 60_000);
  if (!rl.success) {
    return { ok: false, error: "Too many attempts. Please wait a minute and try again." };
  }

  try {
    const token = await issueApiToken(user.id);
    return { ok: true, token, hint: token.slice(-4), createdAt: new Date().toISOString() };
  } catch {
    return { ok: false, error: "Could not generate a token. Please try again." };
  }
}
