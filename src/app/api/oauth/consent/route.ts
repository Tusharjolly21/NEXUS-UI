import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route-client";
import { PUBLIC_SITE } from "@/lib/mcp/config";

/**
 * Allow / Deny on /oauth/consent. Supabase records the decision for the signed-in user and returns the app's
 * redirect URL (with an authorization code, or an access_denied error), which we send the browser to.
 */
/**
 * Only our own consent page may post here, so a form on another site can't approve on someone's behalf.
 * Browsers mark every request with Sec-Fetch-Site; older ones send only Origin, which is checked against the site's
 * public address and the address the request came in on.
 */
function fromOurSite(request: Request, origin: string) {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const from = request.headers.get("origin");
  if (!from) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return from === origin || from === PUBLIC_SITE || (!!host && from === `https://${host}`);
}

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  if (!fromOurSite(request, origin)) return new NextResponse("Forbidden", { status: 403 });

  // The consent page asks for JSON and moves the browser itself (see consent-form.tsx); a plain form post without
  // JavaScript gets redirects.
  const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;
  const go = (url: string, status = 200) =>
    wantsJson ? NextResponse.json({ redirect_url: url }, { status }) : NextResponse.redirect(url, 303);
  const fail = (message: string, back: string) =>
    wantsJson ? NextResponse.json({ error: message }, { status: 400 }) : NextResponse.redirect(back, 303);

  const form = await request.formData();
  const id = form.get("authorization_id");
  const decision = form.get("decision");
  if (typeof id !== "string" || !/^[\w-]{8,128}$/.test(id) || (decision !== "approve" && decision !== "deny")) {
    return fail("This connection request isn't valid. Go back to the app and connect again.", `${origin}/oauth/consent`);
  }
  const consentPage = `${origin}/oauth/consent?authorization_id=${id}`;

  const supabase = await createRouteClient();
  if (!supabase) return fail("Sign-in isn't available right now. Try again in a minute.", consentPage);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return go(`${origin}/login?next=${encodeURIComponent(`/oauth/consent?authorization_id=${id}`)}`, 401);

  const { data, error } =
    decision === "approve"
      ? await supabase.auth.oauth.approveAuthorization(id, { skipBrowserRedirect: true })
      : await supabase.auth.oauth.denyAuthorization(id, { skipBrowserRedirect: true });
  if (error || !data?.redirect_url) {
    console.error("[oauth/consent] decision failed:", error?.code ?? "", error?.message);
    // A request that was already answered (a second tap, Back then Allow) may still have its way back to the app.
    const { data: details } = await supabase.auth.oauth.getAuthorizationDetails(id);
    if (details && !("authorization_id" in details) && details.redirect_url) return go(details.redirect_url);
    return fail("This connection request has expired. Go back to the app and connect again.", consentPage);
  }
  return go(data.redirect_url);
}
