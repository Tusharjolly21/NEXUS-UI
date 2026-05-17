"use client";

import * as React from "react";
import { CodeBlock } from "@/components/code-block/code-block";

export function UsageSnippet({
  title = "Usage",
  description = "Tweak the controls, then copy this JSX into your page.",
  code,
}: {
  title?: string;
  description?: string;
  code: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/25 p-3 dark:bg-white/[0.03]">
      <div className="mb-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{description}</p>
      </div>
      <CodeBlock
        code={code}
        language="tsx"
        theme="dark"
        header={{
          enabled: true,
          showDots: false,
          title: "usage.tsx",
          copy: {
            enabled: true,
            label: "Copy",
            copiedLabel: "Copied",
            copiedDurationMs: 1200,
          },
        }}
        codeArea={{ showLineNumbers: false, wrap: true, padding: 12 }}
        border={{ radius: "12px" }}
      />
    </div>
  );
}
