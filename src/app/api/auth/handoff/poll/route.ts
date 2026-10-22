import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createRouteClient } from "@/lib/supabase/route-client";
import { isHandoffId, isHandoffSecret, secretMatches } from "@/lib/login-handoff";

type PollStatus = "pending" | "signed_in" | "expired" | "error";

const reply = (status: PollStatus, init?: ResponseInit) => NextResponse.json({ status }, init);

/**
 * Polled by the browser that asked for the link. Once another device has
 * approved, this signs *this* browser in: the one-time token is claimed
 * atomically (only one poller can win) and redeemed server-side, so it never
 * reaches the client.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: unknown; secret?: unknown } | null;
  if (!isHandoffId(body?.id) || !isHandoffSecret(body?.secret)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const { id, secret } = body;

  try {
    const admin = getAdminClient();
    const { data: row, error } = await admin
      .from("login_handoffs")
      .select("secret_hash, status, hashed_token, expires_at")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);

    /* Unknown id and wrong secret look identical to the caller. */
    if (!row || !secretMatches(secret, row.secret_hash)) return reply("expired");
    if (new Date(row.expires_at).getTime() < Date.now() || row.status === "claimed") {
      return reply("expired");
    }
    if (row.status === "pending") return reply("pending");

    const token = row.hashed_token;
    if (!token) return reply("expired");

    const { data: claimed, error: claimError } = await admin
      .from("login_handoffs")
      .update({ status: "claimed", hashed_token: null })
      .eq("id", id)
      .eq("status", "approved")
      .select("id");
    if (claimError) throw new Error(claimError.message);
    if (!claimed?.length) return reply("expired"); // another poll won the claim

    const supabase = await createRouteClient();
    if (!supabase) return reply("error", { status: 500 });
    const { error: verifyError } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: token });
    if (verifyError) {
      console.error("[auth/handoff/poll] verifyOtp failed:", verifyError.message);
      return reply("error", { status: 500 });
    }
    return reply("signed_in");
  } catch (err) {
    console.error("[auth/handoff/poll] failed:", err);
    return reply("error", { status: 500 });
  }
}
