import { redirect } from "next/navigation";
import { Copy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Token – Nexus UI",
  description: "Generate your API key and configure your project.",
};

const STEP_BADGE =
  "flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background";

export default async function DashboardApiKeyPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/api-key");
  }

  const apiKey = `nxs_${user.id.replace(/-/g, "").slice(0, 32)}`;

  const componentsJson = JSON.stringify(
    {
      registries: {
        "@nexus": {
          url: "https://nexus-ui.com/registry/{name}.json",
          headers: {
            Authorization: "Bearer <YOUR-API-KEY>",
          },
        },
      },
    },
    null,
    2,
  );

  return (
    <div className="px-8 py-10">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          API Token
        </h1>
        <p className="mt-1 text-muted-foreground">
          Generate your API key and configure your project to install Nexus UI
          components.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Step 1 */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className={STEP_BADGE}>1</div>
            <h2 className="font-semibold text-foreground">
              Generate your API key
            </h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Your unique API key is automatically generated from your account. Use
            it to authenticate requests to the Nexus UI registry.
          </p>

          {/* Key display */}
          <div className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-3">
            <code className="flex-1 truncate font-mono text-sm text-zinc-100">
              {apiKey}
            </code>
            <button
              type="button"
              aria-label="Copy API key"
              className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              <Copy className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Keep this key secret — do not share it publicly or commit it to
            version control.
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className={STEP_BADGE}>2</div>
            <h2 className="font-semibold text-foreground">
              Add to components.json
            </h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Add the following registry configuration to your{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              components.json
            </code>{" "}
            file, replacing{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              {"<YOUR-API-KEY>"}
            </code>{" "}
            with the key above.
          </p>

          {/* Dark code block */}
          <div className="rounded-xl bg-zinc-950 p-4">
            <pre className="overflow-x-auto font-mono text-sm text-zinc-100">
              {componentsJson}
            </pre>
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className={STEP_BADGE}>3</div>
            <h2 className="font-semibold text-foreground">Install components</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Now you can install any Nexus UI component using the shadcn CLI:
          </p>

          {/* Terminal block */}
          <div className="rounded-xl bg-zinc-950 p-4">
            <pre className="font-mono text-sm text-zinc-100">
              <span className="text-zinc-500">$</span>{" "}
              npx shadcn@latest add @nexus/component-name
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
