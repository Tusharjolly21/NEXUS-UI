import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getUserEntitlements } from "@/lib/entitlements";
import { OrdersView } from "@/components/dashboard/orders-view";
import { summarisePlan } from "@/lib/plan";
import { legalConfig } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Orders — Nexus UI",
  description: "Your purchases and subscription.",
};

export default async function DashboardOrdersPage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/orders");

  const { orders, subscription } = await getUserEntitlements(user.id);
  const plan = summarisePlan(subscription, orders);
  const canUsePortal = !!subscription?.customer_id || orders.some((o) => !!o.customer_id);

  return (
    <OrdersView orders={orders} subscription={subscription} plan={plan} canUsePortal={canUsePortal} contact={legalConfig.contactEmail} />
  );
}
