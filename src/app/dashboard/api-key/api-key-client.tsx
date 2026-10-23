"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { pillClassName } from "@/components/site/pill-link";
import { regenerateApiToken } from "./actions";
import { API_KEY_ENV_VAR, REGISTRIES_PRO, envLocalLine, installCommand } from "@/lib/registry-config";

const STEP_BADGE =
  "flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background";

function maskKey(key: string) {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}...${key.slice(-6)}`;
}

type TokenInfo = { hint: string; createdAt: string; lastUsedAt: string | null };


// Fixed locale + time zone so server and client render the same string
const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

function CodeBox({
  title,
  text,
  copied,
  onCopy,
  onToggle,
  visible,
}: {
  title: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
  onToggle?: () => void;
  visible?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="font-mono text-xs text-zinc-400">{title}</span>
        <div className="flex items-center gap-2">
          {onToggle ? (
            <button
              type="button"
              onClick={onToggle}
              aria-label={visible ? "Hide the key" : "Show the key"}
              className="rounded p-1 text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onCopy}
            aria-label={`Copy ${title}`}
            className="rounded p-1 text-zinc-400 transition-colors hover:text-zinc-100"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-zinc-100">{text}</pre>
    </div>
  );
}

export function ApiKeyClient({ existingToken }: { existingToken: TokenInfo | null }) {
  // Plaintext token — only present right after generating, never refetched
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = React.useState<TokenInfo | null>(existingToken);
  const [visible, setVisible] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [copiedBlock, setCopiedBlock] = React.useState<"env" | "json" | "cmd" | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);

  const displayKey = apiKey
    ? visible ? apiKey : maskKey(apiKey)
    : tokenInfo
      ? `nxs_••••••••${tokenInfo.hint}`
      : "No key generated yet";

  // The .env.local line carries the real key right after generating, otherwise a placeholder. The key
  // never goes into components.json: that file is usually committed, this one is git-ignored.
  const envLine = envLocalLine(apiKey ?? undefined);
  const shownEnvLine = apiKey && !visible ? envLocalLine(maskKey(apiKey)) : envLine;

  async function copyKey() {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
    } catch {
      toast.error("Couldn't copy. Select the key and copy it by hand.");
      return;
    }
    setCopied(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyText(text: string, which: "env" | "json" | "cmd") {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it by hand.");
      return;
    }
    setCopiedBlock(which);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedBlock((c) => (c === which ? null : c)), 2000);
  }

  function handleRegenerate() {
    // Replacing a token breaks every project using it, so ask once, inline, before doing it.
    if (tokenInfo && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);

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
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
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

        {confirming ? (
          <p role="alert" className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
            The current key stops working immediately. Update .env.local in every project that uses it.
          </p>
        ) : apiKey ? (
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
            className={pillClassName(confirming ? "ink" : tokenInfo ? "white" : "ink", "sm", "disabled:opacity-60")}
          >
            <RefreshCw className={cn("size-3.5", isPending && "animate-spin")} aria-hidden />
            {confirming ? "Yes, replace it" : tokenInfo ? "Regenerate key" : "Generate key"}
          </button>
          {confirming ? (
            <button type="button" onClick={() => setConfirming(false)} className={pillClassName("white", "sm")}>
              Cancel
            </button>
          ) : null}

          {apiKey && (
            <>
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide API key" : "Show API key"}
                className={pillClassName("white", "sm")}
              >
                {visible ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
                {visible ? "Hide" : "Reveal"}
              </button>

              <button
                type="button"
                onClick={copyKey}
                aria-label="Copy API key"
                className={pillClassName("white", "sm")}
              >
                {copied ? <Check className="size-3.5 text-emerald-500" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Step 2 — .env.local */}
      <div className="pg-float rounded-tile border-0 bg-card p-6">
        <div className="mb-1 flex items-center gap-3">
          <div className={STEP_BADGE}>2</div>
          <h2 className="font-semibold text-foreground">Save it in .env.local</h2>
        </div>
        <p className="mb-5 ml-10 text-sm text-muted-foreground">
          In your project&apos;s root folder, next to{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">package.json</code>, create a file named{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code> and put this one line in it.
          A new Next.js project already keeps this file out of git, so the key stays private. Do not put the key in{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code>.
        </p>
        <CodeBox
          title=".env.local"
          text={shownEnvLine}
          copied={copiedBlock === "env"}
          onCopy={() => copyText(envLine, "env")}
          onToggle={apiKey ? () => setVisible((v) => !v) : undefined}
          visible={visible}
        />
        {!apiKey ? (
          <p className="mt-3 text-xs text-muted-foreground">
            {tokenInfo
              ? "Use the key you copied when you generated it. If you no longer have it, regenerate it above."
              : "Generate a key above first; this line then fills in with your key."}
          </p>
        ) : null}
      </div>

      {/* Step 3 — components.json */}
      <div className="pg-float rounded-tile border-0 bg-card p-6">
        <div className="mb-1 flex items-center gap-3">
          <div className={STEP_BADGE}>3</div>
          <h2 className="font-semibold text-foreground">Connect the registry in components.json</h2>
        </div>
        <p className="mb-5 ml-10 text-sm text-muted-foreground">
          Open <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code> (created by{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">npx shadcn@latest init -d</code>) and add this
          entry inside the outermost braces, next to <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">&quot;aliases&quot;</code>.
          If there is already a <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">&quot;registries&quot;</code> entry, replace it.
          Leave <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{"{name}"}</code> and{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{"${" + API_KEY_ENV_VAR + "}"}</code> exactly as
          written: the CLI fills in the component name and reads your key from .env.local.
        </p>
        <CodeBox
          title="components.json"
          text={REGISTRIES_PRO}
          copied={copiedBlock === "json"}
          onCopy={() => copyText(REGISTRIES_PRO, "json")}
        />
      </div>

      {/* Step 4 — Install components */}
      <div className="pg-float rounded-tile border-0 bg-card p-6">
        <div className="mb-1 flex items-center gap-3">
          <div className={STEP_BADGE}>4</div>
          <h2 className="font-semibold text-foreground">Install a component</h2>
        </div>
        <p className="mb-5 ml-10 text-sm text-muted-foreground">
          Run this from the project root, the folder that holds .env.local. Every component and block page shows its own
          command in the Install box; the part after <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@nexus-labs/</code> is
          its name.
        </p>
        <CodeBox
          title="Terminal"
          text={installCommand("particle-reveal")}
          copied={copiedBlock === "cmd"}
          onCopy={() => copyText(installCommand("particle-reveal"), "cmd")}
        />
        <p className="mt-3 text-sm text-muted-foreground">
          Starting a project from scratch? The{" "}
          <Link href="/docs/installation" className="font-medium text-link underline-offset-4 hover:underline">
            Quick Start
          </Link>{" "}
          has every command in order, and the{" "}
          <Link href="/docs/cli" className="font-medium text-link underline-offset-4 hover:underline">
            CLI page
          </Link>{" "}
          explains the error messages.
        </p>
      </div>
    </div>
  );
}
