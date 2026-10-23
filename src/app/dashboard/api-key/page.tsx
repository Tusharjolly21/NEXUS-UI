import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getApiTokenInfo } from "@/lib/entitlements";
import { ApiKeyClient } from "./api-key-client";
import { DashboardPage, PageHeader } from "@/components/dashboard/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API key — Nexus UI",
  description: "Generate your API key, save it in .env.local and connect your project to install Pro components.",
};

export default async function DashboardApiKeyPage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/api-key");

  // Only display metadata is available — the token itself is shown once, when generated
  const tokenInfo = await getApiTokenInfo(user.id);

  return (
    <DashboardPage>
      <PageHeader
        title="API key"
        description="Create a key so the shadcn CLI can install Pro components and blocks into your project. Four steps, in order."
      />
      <ApiKeyClient
        existingToken={
          tokenInfo
            ? {
                hint: tokenInfo.token_hint,
                createdAt: tokenInfo.created_at,
                lastUsedAt: tokenInfo.last_used_at,
              }
            : null
        }
      />
    </DashboardPage>
  );
}
