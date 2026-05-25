import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { ApiKeyClient } from "./api-key-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Token – Nexus UI",
  description: "Generate your API key and configure your project to install Nexus UI components.",
};

export default async function DashboardApiKeyPage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/api-key");

  const apiKey = `nxs_${user.id.replace(/-/g, "")}`;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">API Token</h1>
        <p className="mt-1 text-muted-foreground">
          Generate your API key and configure your project to install Nexus UI components.
        </p>
      </div>
      <ApiKeyClient apiKey={apiKey} />
    </div>
  );
}
