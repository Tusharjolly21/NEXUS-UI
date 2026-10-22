import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { safeNextPath } from "@/lib/safe-redirect";
import { authErrorCode, getPendingHandoff, isHandoffId, isOtpType } from "@/lib/login-handoff";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next"));
  const login = (error: string) => NextResponse.redirect(`${origin}/login?error=${error}`);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return login("supabase_not_configured");

  /* Supabase reports a bad/expired link as ?error_code=… (PKCE) or #error_code=… (fragment,
     never sent to the server — the login page reads that one itself). */
  const providerError = searchParams.get("error_code") ?? searchParams.get("error");
  if (providerError && !code && !tokenHash) {
    return login(providerError === "otp_expired" ? "otp_expired" : "exchange_failed");
  }

  if (!code && !(tokenHash && isOtpType(type))) return login("missing_code");

  /* A link that belongs to a cross-device request is not redeemed on GET: mail scanners and
     link previews fetch URLs automatically and would burn the one-time token (or sign in a
     device nobody checked). The approve screen redeems it on an explicit tap instead. */
  const rid = searchParams.get("rid");
  if (tokenHash && isOtpType(type) && isHandoffId(rid) && (await getPendingHandoff(rid))) {
    const approve = new URL(`${origin}/login/approve`);
    approve.searchParams.set("rid", rid);
    approve.searchParams.set("token_hash", tokenHash);
    approve.searchParams.set("type", type);
    approve.searchParams.set("next", next);
    return NextResponse.redirect(approve);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  /* token_hash links (custom email template) carry no PKCE verifier, so they also work when the
     link is opened in a different browser/device than the one that requested it. */
  const { error } =
    tokenHash && isOtpType(type)
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : await supabase.auth.exchangeCodeForSession(code!);

  if (error) {
    console.error("[auth/callback] sign-in failed:", error.code ?? "", error.message);
    return login(authErrorCode(error));
  }

  return NextResponse.redirect(`${origin}${next}`);
}
