import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getUserEntitlements } from "@/lib/entitlements";
import { summarisePlan } from "@/lib/plan";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Each page redirects with its own ?next=, so a signed-out visit returns to the page they asked for.
  if (!user) {
    return <>{children}</>;
  }

  const { subscription, orders } = await getUserEntitlements(user.id);
  const plan = summarisePlan(subscription, orders);

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "User";

  const email = user.email ?? "";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-dvh overflow-hidden">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg"
      >
        Skip to content
      </a>
      <Sidebar user={{ email, name: displayName, avatarLetter, plan: plan.label, paid: plan.hasAccess }} />
      <main id="dashboard-main" className="flex-1 overflow-y-auto pt-14 lg:pl-60 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
