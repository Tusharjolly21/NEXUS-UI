"use client";

import * as React from "react";
import { Eye, EyeOff, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { regenerateApiToken } from "./actions";

const STEP_BADGE =
  "flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background";

function maskKey(key: string) {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}...${key.slice(-6)}`;
}

type TokenInfo = { hint: string; createdAt: string; lastUsedAt: string | null };

const TOKEN_PLACEHOLDER = "nxs_your_token_here";

// Fixed locale + time zone so server and client render the same string
const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

export function ApiKeyClient({ existingToken }: { existingToken: TokenInfo | null }) {
  // Plaintext token — only present right after generating, never refetched
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = React.useState<TokenInfo | null>(existingToken);
  const [visible, setVisible] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [codeCopied, setCodeCopied] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const configKey = apiKey ?? TOKEN_PLACEHOLDER;
  const displayKey = apiKey
    ? visible ? apiKey : maskKey(apiKey)
    : tokenInfo
      ? `nxs_••••••••${tokenInfo.hint}`
      : "No token generated yet";

  const componentsJson = `{
  "registries": {
    "@nexus-labs": {
      "url": "https://www.nexus-ui.com/api/registry/{name}",
      "headers": {
        "Authorization": "Bearer ${configKey}"
      }
    }
  }
}`;

  const maskedComponentsJson = `{
  "registries": {
    "@nexus-labs": {
      "url": "https://www.nexus-ui.com/api/registry/{name}",
      "headers": {
        "Authorization": "Bearer ••••••••••••••••••••"
      }
    }
  }
}`;

  async function copyKey() {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(componentsJson);
    setCodeCopied(true);
    toast.success("Config copied to clipboard");
    setTimeout(() => setCodeCopied(false), 2000);
  }

  function handleRegenerate() {
    if (
      tokenInfo &&
      !window.confirm(
        "Regenerate your API token? The current token stops working immediately, so update components.json everywhere you use it.",
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await regenerateApiToken();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setApiKey(result.token);
      setTokenInfo({ hint: result.hint, createdAt: result.createdAt, lastUsedAt: null });
      setVisible(true);
      toast.success("New API key generated — copy it now, it won't be shown again");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step 1 — Generate your API key */}
      <div className="pg-float rounded-tile border-0 bg-card p-6">
        <div className="mb-1 flex items-center gap-3">
          <div className={STEP_BADGE}>1</div>
          <h2 className="font-semibold text-foreground">Generate your API key</h2>
        </div>
        <p className="mb-5 ml-10 text-sm text-muted-foreground">
          Click the button below to generate a new API key. It is shown only once, so copy it
          somewhere safe. If you already have one, generating a new key will invalidate the
          previous one.
        </p>

        {/* Key row */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
          <code
            className={cn(
              "flex-1 truncate font-mono text-sm",
              tokenInfo ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {displayKey}
          </code>
          {tokenInfo && (
            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          )}
        </div>

        {apiKey ? (
          <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            Copy this key now. For your security it won&apos;t be shown again.
          </p>
        ) : tokenInfo ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Created {formatDate(tokenInfo.createdAt)} · Last used{" "}
            {tokenInfo.lastUsedAt ? formatDate(tokenInfo.lastUsedAt) : "never"}. The full key is only
            shown when generated; regenerate it if you lost it.
          </p>
        ) : null}

        {/* Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
          >
            <RefreshCw className={cn("size-3.5", isPending && "animate-spin")} />
            {tokenInfo ? "Regenerate key" : "Generate key"}
          </button>

          {apiKey && (
            <>
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide API key" : "Show API key"}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                {visible ? "Hide" : "Reveal"}
              </button>

              <button
                type="button"
                onClick={copyKey}
                aria-label="Copy API key"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Step 2 — Add to components.json */}
      <div className="pg-float rounded-tile border-0 bg-card p-6">
        <div className="mb-1 flex items-center gap-3">
          <div className={STEP_BADGE}>2</div>
          <h2 className="font-semibold text-foreground">Add to components.json</h2>
        </div>
        <p className="mb-5 ml-10 text-sm text-muted-foreground">
          Add the Nexus UI registry to your{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code>{" "}
          file. This allows shadcn CLI to fetch components directly from Nexus UI.
        </p>

        {/* Code block */}
        <div className="overflow-x-auto rounded-xl bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
            <span className="font-mono text-xs text-zinc-400">components.json</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide key in config" : "Show key in config"}
                className="rounded p-1 text-zinc-400 transition-colors hover:text-zinc-100"
              >
                {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
              <button
                type="button"
                onClick={copyCode}
                aria-label="Copy config"
                className="rounded p-1 text-zinc-400 transition-colors hover:text-zinc-100"
              >
                {codeCopied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
            {(visible ? componentsJson : maskedComponentsJson)
              .split("\n")
              .map((line, i) => {
                const isKey = line.includes('"registries"') || line.includes('"@nexus-labs"');
                const isUrl = line.includes('"url"');
                const isHeader = line.includes('"headers"') || line.includes('"Authorization"');
                const isBearer = line.includes("Bearer");
                return (
                  <span key={i} className={cn("block",
                    isKey ? "text-emerald-400" :
                    isUrl ? "text-sky-400" :
                    isHeader ? "text-violet-400" :
                    isBearer ? "text-amber-300" :
                    "text-zinc-100"
                  )}>
                    {line}
                  </span>
                );
              })}
          </pre>
        </div>
      </div>

      {/* Step 3 — Install components */}
      <div className="pg-float rounded-tile border-0 bg-card p-6">
        <div className="mb-1 flex items-center gap-3">
          <div className={STEP_BADGE}>3</div>
          <h2 className="font-semibold text-foreground">Install components</h2>
        </div>
        <p className="mb-5 ml-10 text-sm text-muted-foreground">
          Now you can install any Nexus UI component using the shadcn CLI:
        </p>

        <div className="overflow-x-auto rounded-xl bg-zinc-950">
          <pre className="p-4 font-mono text-sm text-zinc-100">
            <span className="text-zinc-500">$</span>{" "}
            <span className="text-emerald-400">npx</span>{" "}
            <span className="text-sky-400">shadcn@latest</span>{" "}
            <span className="text-zinc-100">add @nexus-labs/component-name</span>
          </pre>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Replace{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">component-name</code>{" "}
          with the component you want to install.
        </p>
      </div>
    </div>
  );
}
