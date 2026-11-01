"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleCheck, Github, Loader2, MailCheck } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/client";
import { pillClassName } from "@/components/site/pill-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/lib/track";
import { cn } from "@/lib/utils";

const RESEND_SECONDS = 60;
const POLL_MS = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Provider = "google" | "github";

/** Proof that this browser asked for the link, so it can be signed in from another device. */
type Handoff = { id: string; secret: string };

async function createHandoff(): Promise<Handoff | null> {
  try {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    const res = await fetch("/api/auth/handoff", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    if (!res.ok) return null;
    const { id } = (await res.json()) as { id?: unknown };
    return typeof id === "string" ? { id, secret } : null;
  } catch {
    return null; // sign-in still works; this device just won't auto-complete
  }
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const authError = searchParams.get("error");
  const configured = isSupabaseConfigured();

  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [handoff, setHandoff] = React.useState<Handoff | null>(null);
  const [signedIn, setSignedIn] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [oauthPending, setOauthPending] = React.useState<Provider | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

  /* /auth/callback redirects back here with ?error= when the exchange fails. Supabase reports an
     expired/used link in the URL #fragment, which survives that redirect, so check it too.
     Never echo a raw param — anyone can craft a /login?error=... link; map known codes only. */
  React.useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const code = fragment.get("error_code") ?? authError;
    if (!code) return;
    const messages: Record<string, string> = {
      otp_expired:
        "This sign-in link has expired or was already used (email security scanners can use it up). Request a new one.",
      pkce_missing:
        "Open the link in the same browser you requested it from, or request a new one.",
      missing_code: "Sign-in was cancelled or the link was incomplete. Please request a new link.",
    };
    /* This effect runs before <Toaster> (a later sibling in AppProviders) subscribes, and sonner
       drops toasts published with no subscriber — defer one tick so the message is shown. */
    const timer = window.setTimeout(() => {
      toast.error(messages[code] ?? "Sign-in failed. Please try again.");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [authError]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  /* Another device approved the link → the server signs this browser in. Poll until it does. */
  React.useEffect(() => {
    if (!sentTo || !handoff) return;
    let stopped = false;
    let timer: number | undefined;

    async function poll() {
      let status = "pending";
      try {
        const res = await fetch("/api/auth/handoff/poll", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(handoff),
        });
        const body = (await res.json()) as { status?: string };
        status = body.status ?? "pending";
      } catch {
        // offline blip — keep trying
      }
      if (stopped) return;

      if (status === "signed_in") {
        trackEvent("login_completed", { source: "other-device" });
        setSignedIn(true);
        window.location.replace(next);
        return;
      }
      if (status === "expired" || status === "error") {
        setHandoff(null);
        if (status === "error") toast.error("Couldn't finish signing in here. Open the link on this device, or send a new one.");
        return;
      }
      timer = window.setTimeout(poll, POLL_MS);
    }

    timer = window.setTimeout(poll, POLL_MS);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [sentTo, handoff, next]);

  const busy = sending || oauthPending !== null;

  async function oauth(provider: Provider) {
    if (busy) return;
    if (!configured) {
      toast.error("Sign-in isn't set up in this environment.");
      return;
    }
    setOauthPending(provider);
    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    // On success the browser is already leaving for the provider, so keep the spinner up.
    if (error) {
      setOauthPending(null);
      toast.error(error.message);
    }
  }

  async function sendLink(address: string) {
    if (busy || cooldown > 0) return;
    const clean = address.trim();
    if (!clean) {
      setEmailError("Enter your email address.");
      return;
    }
    if (!EMAIL_PATTERN.test(clean)) {
      setEmailError("That doesn't look like an email address.");
      return;
    }
    setEmailError(null);
    if (!configured) {
      toast.error("Sign-in isn't set up in this environment.");
      return;
    }
    setSending(true);
    const pending = await createHandoff();
    const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}${pending ? `&rid=${pending.id}` : ""}`;
    const { error } = await createClient().auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: redirect },
    });
    setSending(false);
    if (error) {
      setEmailError(error.message);
      return;
    }
    setHandoff(pending);
    setSentTo(clean);
    setCooldown(RESEND_SECONDS);
  }

  const card = "pg-float mt-8 rounded-tile bg-card p-6 sm:p-7";

  return (
    <div className="pg-dotgrid relative isolate -mt-[64px] flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 pb-16 pt-[120px]">
      <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />

      <div className="relative w-full max-w-[440px]">
        <div className="flex flex-col items-center text-center">
          <h1 className="pg-display text-[clamp(44px,8vw,60px)] text-foreground">
            {signedIn ? "You're signed in" : sentTo ? "Check your inbox" : "Sign in"}
          </h1>
          <p className="mt-3 max-w-[360px] text-[17px] leading-relaxed text-muted-foreground">
            {signedIn
              ? "Taking you to the site…"
              : sentTo
                ? handoff
                  ? "We sent a sign-in link. Open it on any device and this page signs in by itself."
                  : "We sent a sign-in link. Open it on this device to finish."
                : "New here? The same steps create your account. No password needed."}
          </p>
        </div>

        {sentTo ? (
          <section className={cn(card, "text-center")} aria-live="polite">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-foreground">
              {signedIn ? <CircleCheck className="size-6" aria-hidden /> : <MailCheck className="size-6" aria-hidden />}
            </span>
            <p className="mt-4 text-[15px] text-muted-foreground">Link sent to</p>
            <p className="mt-0.5 break-all text-[17px] font-semibold text-foreground">{sentTo}</p>
            {handoff && !signedIn ? (
              <p className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Waiting for you to open the link…
              </p>
            ) : null}
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              It can take a minute. If you don&apos;t see it, check your spam folder.
            </p>
            <div className="mt-6 grid gap-2">
              <button
                type="button"
                disabled={busy || cooldown > 0}
                onClick={() => void sendLink(sentTo)}
                className={pillClassName("white", "md", "w-full disabled:opacity-60")}
              >
                {sending ? <Loader2 className="size-5 animate-spin" aria-label="Sending" /> : cooldown > 0 ? `Resend in ${cooldown}s` : "Send it again"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSentTo(null);
                  setHandoff(null);
                  setCooldown(0);
                }}
                className="h-11 rounded-full text-[14.5px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Use a different email
              </button>
            </div>
          </section>
        ) : (
          <form
            noValidate
            className={cn(card, "space-y-4")}
            onSubmit={(event) => {
              event.preventDefault();
              void sendLink(email);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[14px] font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? "email-error" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                className="h-[51px] rounded-full border-border bg-background px-5 text-[16px]"
                placeholder="you@example.com"
              />
              {emailError ? (
                <p id="email-error" role="alert" className="px-1 text-[13px] text-destructive">
                  {emailError}
                </p>
              ) : null}
            </div>

            {!configured && (
              <p className="rounded-2xl bg-muted px-4 py-3 text-left text-[13px] leading-relaxed text-foreground">
                Supabase keys aren&apos;t configured, so sign-in is switched off in this environment.
              </p>
            )}

            <button type="submit" disabled={busy} className={pillClassName("ink", "md", "w-full disabled:opacity-60")}>
              {sending ? <Loader2 className="size-5 animate-spin" aria-label="Sending" /> : "Email me a sign-in link"}
            </button>

            <div className="flex items-center gap-3 py-1 text-[13px] text-muted-foreground" aria-hidden>
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void oauth("google")}
                className={pillClassName("white", "md", "w-full disabled:opacity-60")}
              >
                {oauthPending === "google" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <FcGoogle className="size-5" aria-hidden />}
                Continue with Google
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void oauth("github")}
                className={pillClassName("white", "md", "w-full disabled:opacity-60")}
              >
                {oauthPending === "github" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Github className="size-5" aria-hidden />}
                Continue with GitHub
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-[13px] leading-relaxed text-muted-foreground">
          By signing in you agree to the{" "}
          <Link href="/terms" className="text-foreground underline underline-offset-2">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-foreground underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
