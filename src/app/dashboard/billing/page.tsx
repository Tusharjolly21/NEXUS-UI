import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getUserEntitlements } from "@/lib/entitlements";
import { BillingView } from "@/components/dashboard/billing-view";
import { summarisePlan } from "@/lib/plan";
import { legalConfig } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Billing — Nexus UI",
  description: "Manage your subscription and view invoices.",
};

export default async function DashboardBillingPage({ searchParams }: { searchParams: Promise<{ portal?: string }> }) {
  const { portal } = await searchParams;
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/billing");

  const { subscription, orders } = await getUserEntitlements(user.id);
  const plan = summarisePlan(subscription, orders);
  const canUsePortal = !!subscription?.customer_id || orders.some((o) => !!o.customer_id);

  return (
    <BillingView
      plan={plan}
      canUsePortal={canUsePortal}
      portalFlag={portal}
      recentOrders={orders.slice(0, 3)}
      contact={legalConfig.contactEmail}
    />
  );
}
