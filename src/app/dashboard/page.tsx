import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Layers, FileCode2, Crown, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard – Nexus UI",
  description: "Your Nexus UI dashboard.",
};

const STATS = [
  { count: 55, label: "Free components", icon: LayoutGrid },
  { count: 9, label: "Premium blocks", icon: Layers },
  { count: 15, label: "Website templates", icon: FileCode2 },
  { count: 0, label: "Templates owned", icon: Crown },
] as const;

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "there";

  const firstName = displayName.split(" ")[0];

  return (
    <div className="px-8 py-10">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Browse components and templates
        </p>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ count, label, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <Icon className="size-4 text-muted-foreground" />
            <p className="mt-2 text-3xl font-bold text-foreground">{count}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Link cards */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link
          href="/components"
          className={cn(
            "group flex flex-col gap-2 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-accent/50",
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Browse Components
            </h2>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-sm text-muted-foreground">
            Explore 55+ free UI components ready to copy and use in your projects.
          </p>
        </Link>

        <Link
          href="/templates"
          className={cn(
            "group flex flex-col gap-2 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-accent/50",
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Browse Templates
            </h2>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-sm text-muted-foreground">
            Discover 15 full website templates for your next project.
          </p>
        </Link>
      </div>
    </div>
  );
}
