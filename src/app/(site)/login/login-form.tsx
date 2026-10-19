"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/client";
import { NexusMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const authError = searchParams.get("error");
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  /* /auth/callback redirects back here with ?error= when the OAuth exchange fails.
     Never echo the raw param — anyone can craft a /login?error=... link. */
  React.useEffect(() => {
    if (!authError) return;
    toast.error(
      authError === "missing_code"
        ? "Sign-in was cancelled or expired. Please try again."
        : "Sign-in failed. Please try again.",
    );
  }, [authError]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function oauth(provider: "google" | "github") {
    if (!isSupabaseConfigured()) {
      toast.error("Add Supabase keys to enable OAuth.");
      return;
    }
    const supabase = createClient();
    setPending(true);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setPending(false);
    if (error) toast.error(error.message);
  }

  async function magicLink() {
    if (cooldown > 0) return;
    if (!isSupabaseConfigured()) {
      toast.error("Add Supabase keys to enable email login.");
      return;
    }
    if (!email) {
      toast.error("Enter your email");
      return;
    }
    const supabase = createClient();
    setPending(true);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setPending(false);
    if (error) toast.error(error.message);
    else {
      setCooldown(60);
      toast.success("Check your inbox for the magic link.");
    }
  }

  const canSendEmail = !pending && cooldown === 0;

  return (
    <div className="pg-dotgrid relative isolate -mt-[64px] flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 pb-16 pt-[120px]">
      <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />

      <div className="relative w-full max-w-[440px]">
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            aria-label="Go to Nexus UI home"
            className="grid size-12 place-items-center rounded-2xl bg-foreground text-background transition-transform hover:scale-105 motion-reduce:transition-none"
          >
            <NexusMark size={28} />
          </Link>
          <h1 className="pg-display mt-6 text-[clamp(44px,8vw,60px)] text-foreground">Sign in</h1>
          <p className="mt-3 max-w-[340px] text-[17px] leading-relaxed text-muted-foreground">
            New here? The same steps create your account. No password needed.
          </p>
        </div>

        <form
          className="pg-float mt-8 space-y-4 rounded-tile bg-card p-6 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            void magicLink();
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[51px] rounded-full border-border bg-background px-5 text-[16px]"
              placeholder="you@example.com"
            />
          </div>

          {!isSupabaseConfigured() && (
            <p className="rounded-2xl bg-tint-butter px-4 py-3 text-left text-[13px] leading-relaxed text-foreground">
              Supabase keys aren&apos;t configured, so sign-in is switched off in this environment.
            </p>
          )}

          <Button
            type="submit"
            disabled={!canSendEmail}
            className="relative h-[51px] w-full overflow-hidden rounded-full bg-foreground text-[15px] font-semibold text-background hover:bg-foreground/90"
          >
            {cooldown > 0 && (
              <motion.span
                aria-hidden
                className="absolute inset-y-0 left-0 bg-background/20"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: cooldown, ease: "linear" }}
                key={cooldown === 60 ? "cooldown-start" : "cooldown-running"}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-2">
              {pending ? (
                <Loader2 className="size-5 animate-spin" aria-label="Sending" />
              ) : cooldown > 0 ? (
                `Send another link in ${cooldown}s`
              ) : (
                "Email me a sign-in link"
              )}
            </span>
          </Button>

          {cooldown > 0 && (
            <p role="status" className="text-center text-[13px] text-muted-foreground">
              Link sent to {email}. Open it on this device to finish signing in.
            </p>
          )}

          <div className="flex items-center gap-3 py-1 text-[13px] text-muted-foreground">
            <Separator className="flex-1 bg-border" />
            or
            <Separator className="flex-1 bg-border" />
          </div>

          <div className="grid gap-2">
            <Button
              type="button"
              disabled={pending}
              variant="outline"
              className="pg-glass h-[51px] rounded-full border-0 bg-card text-[15px] font-semibold text-foreground hover:bg-muted"
              onClick={() => oauth("google")}
            >
              <FcGoogle className="size-5" aria-hidden />
              Continue with Google
            </Button>
            <Button
              type="button"
              disabled={pending}
              variant="outline"
              className="pg-glass h-[51px] rounded-full border-0 bg-card text-[15px] font-semibold text-foreground hover:bg-muted"
              onClick={() => oauth("github")}
            >
              <Github className="size-5" aria-hidden />
              Continue with GitHub
            </Button>
          </div>
        </form>

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
