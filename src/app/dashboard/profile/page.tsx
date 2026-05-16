import { redirect } from "next/navigation";
import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile – Nexus UI",
  description: "Manage your profile and security settings.",
};

export default async function DashboardProfilePage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/profile");
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "User";

  const email = user.email ?? "";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="px-8 py-10">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and security settings
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Avatar card */}
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-6">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-xl font-bold text-foreground">
            {avatarLetter}
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">{displayName}</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              <span>{email}</span>
            </div>
          </div>
        </div>

        {/* Account information card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold text-foreground">
            Account Information
          </h2>
          <div className="flex flex-col divide-y divide-border">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium text-foreground">
                {displayName}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Email</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {email}
                </span>
                <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  Verified
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="font-mono text-sm text-muted-foreground">
                {user.id}
              </span>
            </div>
          </div>
        </div>

        {/* Quick links card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold text-foreground">Quick Links</h2>
          <div className="flex gap-3">
            <Link
              href="/dashboard/billing"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-2 rounded-lg",
              )}
            >
              <ExternalLink className="size-3.5" />
              Manage Billing
            </Link>
            <Link
              href="/dashboard/api-key"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-2 rounded-lg",
              )}
            >
              <ExternalLink className="size-3.5" />
              API Tokens
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
