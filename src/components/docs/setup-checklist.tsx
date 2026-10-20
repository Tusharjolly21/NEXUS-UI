"use client";

import * as React from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = { id: string; title: string };

const KEY = "nx-docs-setup";
const EVENT = "nx-docs-setup-change";
const EMPTY: string[] = [];

let cache: { raw: string | null; value: string[] } = { raw: null, value: EMPTY };
function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const value = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string").slice(0, 50) : [];
    cache = { raw, value };
    return value;
  } catch {
    return EMPTY;
  }
}
function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
function write(next: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage blocked: ticks last until reload
  }
  window.dispatchEvent(new Event(EVENT));
}

/**
 * The quick start as a checklist you tick off as you go: a ring fills with a little overshoot,
 * each row jumps to its step, and your progress is remembered in this browser.
 */
export function SetupChecklist({ steps }: { steps: Step[] }) {
  const reduce = useReducedMotion();
  const done = React.useSyncExternalStore(subscribe, read, () => EMPTY);
  const doneSet = new Set(done);
  const count = steps.filter((s) => doneSet.has(s.id)).length;
  const ratio = steps.length ? count / steps.length : 0;
  const all = count === steps.length && steps.length > 0;

  const progress = useSpring(ratio, { stiffness: 260, damping: 14, mass: 0.8 });
  React.useEffect(() => {
    progress.set(ratio);
  }, [progress, ratio]);
  const R = 26;
  const C = 2 * Math.PI * R;
  const dash = useTransform(progress, (v) => `${Math.max(0, Math.min(1.08, v)) * C} ${C}`);

  const toggle = (id: string) => {
    // Read the stored list now, not the render's copy, so quick taps don't drop each other.
    const latest = read();
    write(latest.includes(id) ? latest.filter((d) => d !== id) : [...latest, id]);
  };

  return (
    <aside
      aria-label="Setup checklist"
      className="rounded-tile bg-card p-5 shadow-[0_0_0_0.5px_var(--border),0_20px_40px_-26px_rgba(0,0,0,.35)] sm:p-6"
    >
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden>
            <circle cx="32" cy="32" r={R} fill="none" strokeWidth="6" className="stroke-foreground/[0.08]" />
            <motion.circle
              cx="32"
              cy="32"
              r={R}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className={all ? "stroke-[#30d158]" : "stroke-[#0071e3] dark:stroke-[#0a84ff]"}
              style={{ strokeDasharray: reduce ? `${ratio * C} ${C}` : dash }}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[15px] font-semibold tabular-nums text-foreground">
            {count}/{steps.length}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">
            {all ? "You're set up" : "Setup checklist"}
          </p>
          <p className="mt-0.5 text-[14px] text-muted-foreground" aria-live="polite">
            {all
              ? "Every step is done. Add any component with one command."
              : `${count} of ${steps.length} done. Tick each step as you finish it.`}
          </p>
        </div>
      </div>

      <ol className="mt-5 grid gap-1 sm:grid-cols-2">
        {steps.map((s, i) => {
          const on = doneSet.has(s.id);
          return (
            <li key={s.id} className="flex items-center gap-2 rounded-[14px] px-1.5 py-1 hover:bg-foreground/[0.03]">
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={`Mark "${s.title}" as done`}
                onClick={() => toggle(s.id)}
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <motion.span
                  className={cn(
                    "grid size-6 place-items-center rounded-full border-2 transition-colors",
                    on ? "border-[#30d158] bg-[#30d158] text-white" : "border-foreground/20 text-transparent",
                  )}
                  animate={on && !reduce ? { scale: [1, 1.25, 0.92, 1] } : { scale: 1 }}
                  transition={{ duration: 0.45, times: [0, 0.35, 0.7, 1] }}
                >
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </motion.span>
              </button>
              <a
                href={`#${s.id}`}
                className={cn(
                  "min-w-0 flex-1 truncate rounded-md py-2 text-[14.5px] !no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  on ? "!text-muted-foreground line-through decoration-foreground/30" : "!text-foreground",
                )}
              >
                <span className="mr-1.5 tabular-nums text-muted-foreground">{i + 1}.</span>
                {s.title}
              </a>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
