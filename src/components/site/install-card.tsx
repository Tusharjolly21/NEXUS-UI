"use client";

import * as React from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { useProAccess } from "@/components/pro/pro-access";
import { cn } from "@/lib/utils";

/** A white card holding a shell command and a Copy button that says "Copied". */
export function InstallCard({
  command,
  wrap = false,
  className,
  upsell = false,
}: {
  command: string;
  wrap?: boolean;
  className?: string;
  /** After the first copy, a one-line note on what Pro adds (hidden for Pro visitors). */
  upsell?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const [didCopy, setDidCopy] = React.useState(false);
  const { isPro, proCount } = useProAccess();

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setDidCopy(true);
    } catch {
      // clipboard blocked (insecure context, permissions); the command stays selectable
    }
  }

  return (
    <div className={className}>
    <div className="pg-float flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
      <Terminal className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <code className={cn("flex-1 text-left font-mono text-[13px] text-body", wrap ? "break-all" : "truncate")}>$ {command}</code>
      <button
        type="button"
        onClick={copy}
        className="pg-glass shrink-0 rounded-lg bg-foreground px-3 py-1.5 text-[12px] font-semibold text-background"
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
    {upsell && didCopy && !isPro ? (
      <p className="mt-2 px-1 text-[13px] text-muted-foreground">
        That one is free.{proCount ? ` Pro adds ${proCount} more components,` : " Pro adds more components,"} every template and every block.{" "}
        <Link href="/pricing" className="font-medium text-action hover:underline hover:underline-offset-4">
          See pricing
        </Link>
      </p>
    ) : null}
    </div>
  );
}
