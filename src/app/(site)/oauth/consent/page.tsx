import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { pillClassName } from "@/components/site/pill-link";
import { hasPremiumAccess } from "@/lib/entitlements";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AuthShell } from "../../login/auth-shell";

/**
 * The consent screen for Supabase Auth's OAuth 2.1 server ("Authorization Path" in the Supabase dashboard).
 * Supabase sends people here with ?authorization_id=... when an app such as Claude asks to connect to their
 * Nexus UI account. Signed-out visitors go through /login first and come back here.
 */

export const metadata: Metadata = {
  title: "Connect an app · Nexus UI",
  robots: { index: false, follow: false },
  // Same-origin only: the browser still tells our Allow handler where the form came from, and no other site
  // ever sees the authorization id.
  referrer: "same-origin",
};

const first = (value: string | string[] | undefined) => (typeof value === "string" ? value : null);
const isAuthorizationId = (value: string | null): value is string => !!value && /^[\w-]{8,128}$/.test(value);

function Expired() {
  return (
    <AuthShell title="Link expired" description="This connection request is no longer open.">
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Go back to the app you were connecting and start again from its connector settings.
      </p>
      <Link href="/" className={pillClassName("ink", "md", "mt-6 w-full")}>
        Back to Nexus UI
      </Link>
    </AuthShell>
  );
}

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const id = first((await searchParams).authorization_id);
  if (!isAuthorizationId(id) || !isSupabaseConfigured()) return <Expired />;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect(`/login?next=${encodeURIComponent(`/oauth/consent?authorization_id=${id}`)}`);
  }

  const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id);
  if (error || !data) return <Expired />;
  // Already approved before: Supabase hands back the app's redirect straight away.
  if (!("authorization_id" in data)) redirect(data.redirect_url);

  const app = data.client.name || "An app";
  let redirectHost = data.redirect_uri;
  try {
    redirectHost = new URL(data.redirect_uri).host;
  } catch {
    /* show the raw value */
  }
  const pro = await hasPremiumAccess(auth.user.id).catch(() => false);

  return (
    <AuthShell title="Connect an app" description={`${app} wants to use your Nexus UI account.`}>
      <ul className="grid gap-3 text-left text-[15px] leading-relaxed text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">What it&apos;s for:</span> getting the source of the components
          your account can use, including Pro ones if you have Pro.
        </li>
        <li>
          <span className="font-medium text-foreground">Your payment details</span> stay with our payment provider and
          are never shared with the app.
        </li>
        <li>
          <span className="font-medium text-foreground">Signed in as</span> {data.user.email}
          {pro ? " (Pro)" : ""}.
        </li>
      </ul>
      {!pro ? (
        <p className="mt-4 rounded-2xl bg-muted px-4 py-3 text-left text-[14px] leading-relaxed text-muted-foreground">
          This account doesn&apos;t have Pro yet, so the app gets free components only.{" "}
          <Link href="/pricing" className="font-medium text-foreground underline underline-offset-4">
            See plans
          </Link>
          .
        </p>
      ) : null}
      <p className="mt-4 text-left text-[13.5px] text-muted-foreground">
        After you choose, you&apos;ll go back to <span className="font-medium text-foreground">{redirectHost}</span>.
        You can disconnect the app at any time from its connector settings.
      </p>

      <form action="/api/oauth/consent" method="post" className="mt-6 grid gap-2">
        <input type="hidden" name="authorization_id" value={data.authorization_id} />
        <button type="submit" name="decision" value="approve" className={pillClassName("ink", "md", "w-full")}>
          Allow
        </button>
        <button
          type="submit"
          name="decision"
          value="deny"
          className="grid h-11 place-items-center rounded-full text-[14.5px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Deny
        </button>
      </form>
    </AuthShell>
  );
}
