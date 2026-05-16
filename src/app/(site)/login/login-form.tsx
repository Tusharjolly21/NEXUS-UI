"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { NexusMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard/orders";
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

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
    <div className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.10),transparent_34%),radial-gradient(circle_at_85%_78%,rgba(139,92,246,0.10),transparent_30%)]" />
      <div className="lf-grid pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.16]" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[420px]"
      >
        <div className="mx-auto flex flex-col items-center text-center">
          <Link
            href="/"
            aria-label="Go to Nexus UI home"
            className="grid size-12 place-items-center rounded-2xl bg-foreground text-background shadow-xl shadow-foreground/10 ring-1 ring-border/60 transition hover:scale-105"
          >
            <NexusMark size={28} />
          </Link>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground">Login</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Login to your Nexus UI Pro account
          </p>
        </div>

        <form
          className="mt-10 space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            void magicLink();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-xl border-border bg-background/90 px-4 text-lg shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/30 dark:bg-white/[0.03]"
              placeholder="name@example.com"
            />
          </div>

          {!isSupabaseConfigured() && (
            <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-left text-xs leading-relaxed text-muted-foreground">
              Supabase keys are not configured yet. The buttons are ready, but auth will activate
              after adding your environment keys.
            </p>
          )}

          <Button
            type="submit"
            disabled={!canSendEmail}
            className="relative h-14 w-full overflow-hidden rounded-xl bg-foreground text-base font-semibold text-background shadow-lg shadow-foreground/10 hover:bg-foreground/90"
          >
            {cooldown > 0 && (
              <motion.span
                aria-hidden
                className="absolute inset-y-0 left-0 bg-primary/25"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: cooldown, ease: "linear" }}
                key={cooldown === 60 ? "cooldown-start" : "cooldown-running"}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-2">
              {pending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : cooldown > 0 ? (
                `Send another email in ${cooldown}s`
              ) : (
                "Sign In with Email"
              )}
            </span>
          </Button>

          {cooldown > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-xs text-muted-foreground"
            >
              You can send another magic link after the timer ends.
            </motion.p>
          )}

          <div className="relative flex items-center">
            <Separator className="bg-border" />
            <span className="absolute left-1/2 -translate-x-1/2 rounded-full border border-border bg-background px-2 py-1 text-xs text-muted-foreground shadow-sm">
              or
            </span>
          </div>

          <Button
            type="button"
            disabled={pending}
            variant="outline"
            className="h-14 w-full rounded-xl border-border bg-background/80 text-base font-semibold text-foreground shadow-sm hover:bg-muted/70 dark:bg-white/[0.02]"
            onClick={() => oauth("github")}
          >
            <Github className="size-5" />
            Login with GitHub
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
