"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);

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
    else toast.success("Check your inbox for the magic link.");
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configure Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Set <code className="text-primary">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="text-primary">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
              <code className="text-primary">.env.local</code>, then restart the dev server.
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground"
              onClick={() => router.push("/")}
            >
              Back home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Sign in</CardTitle>
          <p className="text-sm text-muted-foreground">Continue with OAuth or email magic link.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              disabled={pending}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
              onClick={() => oauth("google")}
            >
              Google
            </Button>
            <Button
              type="button"
              disabled={pending}
              variant="outline"
              className="rounded-full border-border text-foreground"
              onClick={() => oauth("github")}
            >
              GitHub
            </Button>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1 bg-border" />
            or email
            <Separator className="flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs text-muted-foreground">
              Work email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
              placeholder="you@company.com"
            />
          </div>
          <Button
            type="button"
            disabled={pending}
            className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={magicLink}
          >
            Email magic link
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
