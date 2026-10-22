import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getUserEntitlements } from "@/lib/entitlements";
import { ProfileView } from "@/components/dashboard/profile-view";
import { summarisePlan } from "@/lib/plan";

export const metadata: Metadata = {
  title: "Account — Nexus UI",
  description: "Your account details.",
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

  const name = String(
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User",
  );
  const { subscription, orders } = await getUserEntitlements(user.id);

  return (
    <ProfileView
      data={{
        name,
        email: user.email ?? "",
        avatarLetter: name.charAt(0).toUpperCase(),
        provider: String(user.app_metadata?.provider ?? "email"),
        createdAt: user.created_at ?? null,
        userId: user.id,
        planLabel: summarisePlan(subscription, orders).label,
      }}
    />
  );
}
