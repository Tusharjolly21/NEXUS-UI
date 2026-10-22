import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createRouteClient } from "@/lib/supabase/route-client";
import { authErrorCode, isHandoffId, isOtpType } from "@/lib/login-handoff";
import { safeNextPath } from "@/lib/safe-redirect";

const field = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : null;
};

/**
 * "Approve sign-in" form target. Redeems the emailed token (signing in the
 * device that approved), then — if the link came from a pending cross-device
 * request — mints a fresh one-time token for the requesting device to claim.
 */
export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const form = await request.formData();
  const tokenHash = field(form, "token_hash");
  const type = field(form, "type");
  const rid = field(form, "rid");
  const next = safeNextPath(field(form, "next"));

  const toLogin = (error: string) => NextResponse.redirect(`${origin}/login?error=${error}`, 303);

  if (!tokenHash || tokenHash.length > 512 || !isOtpType(type)) return toLogin("missing_code");

  const supabase = await createRouteClient();
  if (!supabase) return toLogin("supabase_not_configured");

  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error || !data.user) {
    console.error("[auth/approve] sign-in failed:", error?.code ?? "", error?.message);
    return toLogin(error ? authErrorCode(error) : "exchange_failed");
  }

  let handedOff = false;
  if (isHandoffId(rid) && data.user.email) {
    try {
      const admin = getAdminClient();
      const { data: link, error: linkError } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email: data.user.email,
      });
      const hashedToken = link?.properties?.hashed_token;
      if (linkError || !hashedToken) throw new Error(linkError?.message ?? "no hashed_token");

      const { data: updated, error: updateError } = await admin
        .from("login_handoffs")
        .update({ status: "approved", hashed_token: hashedToken, user_id: data.user.id })
        .eq("id", rid)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .select("id");
      if (updateError) throw new Error(updateError.message);
      handedOff = Boolean(updated?.length);
    } catch (err) {
      /* This device is already signed in; only the other device misses out. */
      console.error("[auth/approve] handoff failed:", err);
    }
  }

  const done = new URL(`${origin}/login/approved`);
  done.searchParams.set("next", next);
  if (handedOff) done.searchParams.set("handoff", "1");
  return NextResponse.redirect(done, 303);
}
