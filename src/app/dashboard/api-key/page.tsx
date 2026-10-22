import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getApiTokenInfo } from "@/lib/entitlements";
import { ApiKeyClient } from "./api-key-client";
import { DashboardPage, PageHeader } from "@/components/dashboard/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API token — Nexus UI",
  description: "Generate your API key and configure your project to install Nexus UI components.",
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
        title="API token"
        description="Create a token so the shadcn CLI can install Pro components and premium blocks into your project."
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
