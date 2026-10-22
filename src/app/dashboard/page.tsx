import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getUserEntitlements } from "@/lib/entitlements";
import { blocksManifest } from "@/lib/catalog/blocks-manifest";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { OverviewView } from "@/components/dashboard/overview-view";
import { summarisePlan } from "@/lib/plan";
import { legalConfig } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Dashboard — Nexus UI",
  description: "Your Nexus UI dashboard.",
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
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

  const { subscription, orders } = await getUserEntitlements(user.id);
  const plan = summarisePlan(subscription, orders);
  const isPremium = plan.hasAccess;

  const freeBlocks = blocksManifest.filter((b) => !b.premium).length;
  const counts = {
    components: { yours: isPremium ? CATALOG_COUNTS.components : CATALOG_COUNTS.freeComponents, total: CATALOG_COUNTS.components },
    blocks: { yours: isPremium ? CATALOG_COUNTS.blocks : freeBlocks, total: CATALOG_COUNTS.blocks },
    templates: { yours: isPremium ? CATALOG_COUNTS.templates : CATALOG_COUNTS.freeTemplates, total: CATALOG_COUNTS.templates },
    proComponents: CATALOG_COUNTS.proComponents,
    freeComponents: CATALOG_COUNTS.freeComponents,
  };

  const displayName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "there";
  const firstName = String(displayName).split(" ")[0];

  return (
    <OverviewView
      firstName={firstName}
      plan={plan}
      counts={counts}
      activating={checkout === "success" && !isPremium}
      contact={legalConfig.contactEmail}
    />
  );
}
