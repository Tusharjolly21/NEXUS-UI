"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { DocPre } from "@/components/docs/doc-page";
import { cn } from "@/lib/utils";

/**
 * Connect panel for the MCP docs page. Two switches pick the snippet: which tool you use (Claude Code
 * or Cursor) and whether you only want free items or Pro as well. The snippet below always matches
 * both, so there is one thing to copy instead of four blocks to compare.
 */

const ENDPOINT = "https://www.nexus-ui.com/mcp";

type Tool = "claude-code" | "cursor";
type Plan = "free" | "pro";

/** The app icons for the tools this page connects to. */
export const TOOL_ICONS = {
  "claude-code": "/images/mcp/claude-code.webp",
  cursor: "/images/mcp/cursor.webp",
} as const;

export function ToolIcon({ tool, size = 20, className }: { tool: keyof typeof TOOL_ICONS; size?: number; className?: string }) {
  return (
    <Image
      src={TOOL_ICONS[tool]}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      style={{ width: size, height: size, borderRadius: size * 0.225 }}
    />
  );
}

const TOOLS: { id: Tool; label: string; where: string }[] = [
  { id: "claude-code", label: "Claude Code", where: "Run this in your project folder." },
  { id: "cursor", label: "Cursor", where: "Add this to .cursor/mcp.json in your project, or to ~/.cursor/mcp.json for every project." },
];

const PLANS: { id: Plan; label: string }[] = [
  { id: "free", label: "Free items" },
  { id: "pro", label: "Free and Pro items" },
];

function snippet(tool: Tool, plan: Plan, envVar: string) {
  if (tool === "claude-code") {
    return plan === "free"
      ? `claude mcp add --transport http nexus-ui ${ENDPOINT}`
      : `claude mcp add --transport http nexus-ui ${ENDPOINT} \\\n  --header "Authorization: Bearer $${envVar}"`;
  }
  return plan === "free"
    ? `{\n  "mcpServers": {\n    "nexus-ui": {\n      "url": "${ENDPOINT}"\n    }\n  }\n}`
    : `{\n  "mcpServers": {\n    "nexus-ui": {\n      "url": "${ENDPOINT}",\n      "headers": {\n        "Authorization": "Bearer \${env:${envVar}}"\n      }\n    }\n  }\n}`;
}

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; icon?: keyof typeof TOOL_ICONS }[];
}) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-full bg-muted p-1">
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.id)}
            className={cn(
              "relative h-9 rounded-full px-4 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {on ? (
              <motion.span
                layoutId={`${uid}-seg`}
                aria-hidden
                className="absolute inset-0 rounded-full bg-card shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 34 }}
              />
            ) : null}
            <span className="relative flex items-center gap-2">
              {o.icon ? <ToolIcon tool={o.icon} size={18} /> : null}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function McpConnect({ envVar }: { envVar: string }) {
  const [tool, setTool] = useState<Tool>("claude-code");
  const [plan, setPlan] = useState<Plan>("free");
  const reduce = useReducedMotion();
  const current = TOOLS.find((t) => t.id === tool)!;

  return (
    <div data-doc-widget className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented label="Tool" value={tool} onChange={setTool} options={TOOLS.map((t) => ({ id: t.id, label: t.label, icon: t.id }))} />
        <Segmented label="What to unlock" value={plan} onChange={setPlan} options={PLANS} />
      </div>
      <p className="text-sm text-muted-foreground">{current.where}</p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${tool}-${plan}`}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <DocPre>{snippet(tool, plan, envVar)}</DocPre>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** One-click copy for the example prompts. */
export function PromptChips({ prompts }: { prompts: string[] }) {
  const [copied, setCopied] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const copy = (i: number) => {
    navigator.clipboard.writeText(prompts[i]).then(
      () => {
        setCopied(i);
        setTimeout(() => setCopied((c) => (c === i ? null : c)), 1800);
      },
      () => {},
    );
  };

  return (
    <ul data-doc-widget className="grid gap-2.5">
      {prompts.map((p, i) => (
        <li key={p}>
          <button
            type="button"
            onClick={() => copy(i)}
            aria-label={`Copy prompt: ${p}`}
            className="group flex w-full items-center justify-between gap-4 rounded-[18px] bg-card px-5 py-3.5 text-left text-[15px] leading-snug text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            <span>{p}</span>
            <span className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:text-foreground">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={copied === i ? "ok" : "copy"}
                  initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 20 }}
                  className={copied === i ? "text-[#1f9d4a]" : undefined}
                >
                  {copied === i ? <Check className="size-3.5" strokeWidth={2.5} /> : <Copy className="size-3.5" />}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
