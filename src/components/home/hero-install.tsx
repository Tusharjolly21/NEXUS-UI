"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const PREFIX = "npx shadcn@latest add @nexus-labs/";
/** Free components, so every command shown works without a plan. */
const NAMES = ["gooey-input", "floating-dock", "dynamic-island", "price-odometer", "slide-to-confirm", "like-burst"];

const TYPE_MS = 55;
const DELETE_MS = 28;
const HOLD_MS = 2200;

/**
 * The hero install command, typing out a different free component every few seconds.
 * Copy always copies the whole command for the component being shown. Pauses while
 * hovered or focused; reduced motion shows the first command, still.
 */
export function HeroInstall({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [typed, setTyped] = React.useState(NAMES[0]);
  const [phase, setPhase] = React.useState<"holding" | "deleting" | "typing">("holding");
  const [paused, setPaused] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const name = NAMES[index];

  React.useEffect(() => {
    if (reduce || paused) return;
    let t: ReturnType<typeof setTimeout>;
    if (phase === "holding") {
      t = setTimeout(() => setPhase("deleting"), HOLD_MS);
    } else if (phase === "deleting") {
      t = setTimeout(() => {
        if (typed === "") {
          setIndex((i) => (i + 1) % NAMES.length);
          setPhase("typing");
        } else {
          setTyped((v) => v.slice(0, -1));
        }
      }, DELETE_MS);
    } else {
      t = setTimeout(() => {
        if (typed === name) setPhase("holding");
        else setTyped(name.slice(0, typed.length + 1));
      }, TYPE_MS);
    }
    return () => clearTimeout(t);
  }, [phase, typed, name, reduce, paused]);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(PREFIX + name);
      setCopied(true);
    } catch {
      // clipboard blocked; the command stays selectable
    }
  }

  return (
    <div
      className={cn("pg-float flex items-center gap-3 rounded-2xl bg-card px-4 py-3", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Terminal className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <code className="min-w-0 flex-1 text-left font-mono text-[13px] text-body">
        <span className="sr-only">{PREFIX + name}</span>
        {/* Two lines on phones so the part that changes is always visible; one line from sm up */}
        <span aria-hidden className="flex flex-col sm:block sm:truncate">
          <span className="whitespace-nowrap">$ npx shadcn@latest add </span>
          <span className="whitespace-nowrap">
            @nexus-labs/<span className="text-foreground">{typed}</span>
            {reduce ? null : (
              <span className="pg-caret ml-px inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-action" />
            )}
          </span>
        </span>
      </code>
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
