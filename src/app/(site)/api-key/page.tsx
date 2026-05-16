import { redirect } from "next/navigation";
import { Key, Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Key – Nexus UI",
};

export default async function ApiKeyPage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/api-key");

  const apiKey = `nxs_${user.id.replace(/-/g, "").slice(0, 32)}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">API Key</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Use this key to access Nexus UI resources programmatically.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl border border-border bg-muted">
            <Key className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Your API Key</p>
            <p className="text-xs text-muted-foreground">Keep this secret — do not share it publicly.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <code className="flex-1 truncate font-mono text-sm text-foreground">{apiKey}</code>
          <button
            type="button"
            aria-label="Copy API key"
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Copy className="size-4" />
          </button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          This key is derived from your account. Rotate it by contacting support.
        </p>
      </div>
    </div>
  );
}
