import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { describeDevice, hashSecret, isHandoffSecret } from "@/lib/login-handoff";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Opens a cross-device sign-in request. The browser keeps `secret` private
 * (it never goes in the email); we store only its hash plus a description of
 * the device so the approval screen can say who is asking.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`handoff:${getClientIp(request)}`, 10, 10 * 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { secret?: unknown } | null;
  if (!isHandoffSecret(body?.secret)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  /* Vercel sends the city URL-encoded; both headers are absent in local dev. */
  const city = request.headers.get("x-vercel-ip-city");
  const country = request.headers.get("x-vercel-ip-country");
  let location: string | null = null;
  try {
    location = [city ? decodeURIComponent(city) : null, country].filter(Boolean).join(", ") || null;
  } catch {
    location = country;
  }

  try {
    const admin = getAdminClient();

    /* Opportunistic cleanup of long-dead rows; failure is harmless. */
    await admin
      .from("login_handoffs")
      .delete()
      .lt("expires_at", new Date(Date.now() - 60 * 60_000).toISOString());

    const { data, error } = await admin
      .from("login_handoffs")
      .insert({
        secret_hash: hashSecret(body.secret),
        device: describeDevice(request.headers.get("user-agent")),
        location,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "no row returned");

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("[auth/handoff] create failed:", err);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
