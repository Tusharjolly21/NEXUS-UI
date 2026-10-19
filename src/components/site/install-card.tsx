"use client";

import * as React from "react";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

/** A white card holding a shell command and a Copy button that says "Copied". */
export function InstallCard({ command, className }: { command: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      // clipboard blocked (insecure context, permissions); the command stays selectable
    }
  }

  return (
    <div className={cn("pg-float flex items-center gap-3 rounded-2xl bg-card px-4 py-3", className)}>
      <Terminal className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <code className="flex-1 truncate text-left font-mono text-[13px] text-body">$ {command}</code>
      <button
        type="button"
        onClick={copy}
        className="pg-glass shrink-0 rounded-lg bg-foreground px-3 py-1.5 text-[12px] font-semibold text-background"
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
