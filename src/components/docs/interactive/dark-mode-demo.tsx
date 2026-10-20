"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  useVelocity,
} from "framer-motion";
import type { Transition } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export type DarkModeDemoProps = {
  /** Flips the demo wrapper every ~2.5s until the first interaction. Off under reduced motion. */
  autoplay?: boolean;
  className?: string;
};

/*
 * How this works (checked against Tailwind v4's compiler output):
 *
 *   @custom-variant dark (&:is(.dark *));
 *   dark:bg-zinc-900  →  .dark\:bg-zinc-900:is(.dark *) { background-color: var(--color-zinc-900) }
 *
 * `:is(.dark *)` matches an element that has ANY ancestor with class `dark`. This site puts `.dark` on
 * <html> in dark mode, so the real `dark:` classes would always match here and the card could never show
 * its light side on a dark page. The card therefore uses the identical selector shape keyed to its own
 * wrapper: `[&:is(.nx-dm-scope_*)]:bg-zinc-900` compiles to `.…:is(.nx-dm-scope *) { … }`. The wrapper
 * gets both `dark` (the class the code panel talks about) and `nx-dm-scope` (what the card listens to).
 * Each class below is written out in full so Tailwind's scanner generates it.
 */
type Pair = { light: string; dark: string; scoped: string };
type Part = { key: string; tag: string; label: string; pairs: Pair[] };

const PARTS: Part[] = [
  {
    key: "card",
    tag: "div",
    label: "card",
    pairs: [
      { light: "bg-white", dark: "dark:bg-zinc-900", scoped: "[&:is(.nx-dm-scope_*)]:bg-zinc-900" },
      { light: "text-zinc-900", dark: "dark:text-zinc-50", scoped: "[&:is(.nx-dm-scope_*)]:text-zinc-50" },
      { light: "ring-zinc-200", dark: "dark:ring-zinc-800", scoped: "[&:is(.nx-dm-scope_*)]:ring-zinc-800" },
    ],
  },
  {
    key: "avatar",
    tag: "span",
    label: "avatar",
    pairs: [
      { light: "bg-zinc-100", dark: "dark:bg-zinc-800", scoped: "[&:is(.nx-dm-scope_*)]:bg-zinc-800" },
      { light: "text-zinc-700", dark: "dark:text-zinc-200", scoped: "[&:is(.nx-dm-scope_*)]:text-zinc-200" },
    ],
  },
  {
    key: "meta",
    tag: "p",
    label: "subtitle",
    pairs: [{ light: "text-zinc-500", dark: "dark:text-zinc-400", scoped: "[&:is(.nx-dm-scope_*)]:text-zinc-400" }],
  },
  {
    key: "stat",
    tag: "strong",
    label: "stat",
    pairs: [{ light: "text-blue-600", dark: "dark:text-blue-400", scoped: "[&:is(.nx-dm-scope_*)]:text-blue-400" }],
  },
  {
    key: "button",
    tag: "button",
    label: "button",
    pairs: [
      { light: "bg-zinc-900", dark: "dark:bg-white", scoped: "[&:is(.nx-dm-scope_*)]:bg-white" },
      { light: "text-white", dark: "dark:text-zinc-900", scoped: "[&:is(.nx-dm-scope_*)]:text-zinc-900" },
    ],
  },
];

const byKey = Object.fromEntries(PARTS.map((p) => [p.key, p])) as Record<string, Part>;
const classesFor = (key: string) => byKey[key].pairs.map((p) => `${p.light} ${p.scoped}`).join(" ");

const TRACK_W = 56;
const KNOB = 24;
const PAD = 3;
const TRAVEL = TRACK_W - KNOB - PAD * 2;

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-card dark:focus-visible:ring-[#0a84ff]";

export function DarkModeDemo({ autoplay = true, className }: DarkModeDemoProps) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const reduce = useReducedMotion();

  const [isDark, setIsDark] = useState(true);
  const [interacted, setInteracted] = useState(false);
  const touchedRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);

  const markTouched = useCallback(() => {
    if (touchedRef.current) return;
    touchedRef.current = true;
    window.clearTimeout(timerRef.current);
    setInteracted(true);
  }, []);

  useEffect(() => {
    if (!autoplay || reduce || touchedRef.current) return;
    const t = window.setTimeout(() => {
      if (!touchedRef.current) setIsDark((d) => !d);
    }, 2500);
    timerRef.current = t;
    return () => window.clearTimeout(t);
  }, [autoplay, reduce, isDark]);

  // Signature move: the knob squashes and stretches with its own velocity, driven by motion values only.
  const x = useMotionValue(TRAVEL);
  const vx = useVelocity(x);
  const scaleX = useTransform(vx, (v) => 1 + Math.min(Math.abs(v) / 900, 0.5));
  const scaleY = useTransform(vx, (v) => 1 - Math.min(Math.abs(v) / 1800, 0.22));
  const sunOpacity = useTransform(x, [0, TRAVEL], [1, 0.35]);
  const moonOpacity = useTransform(x, [0, TRAVEL], [0.35, 1]);

  useEffect(() => {
    const target = isDark ? TRAVEL : 0;
    if (reduce) {
      x.set(target);
      return;
    }
    const controls = animate(x, target, { type: "spring", stiffness: 520, damping: 22, mass: 0.9 });
    return () => controls.stop();
  }, [isDark, reduce, x]);

  const toggle = () => setIsDark((d) => !d);

  const pill: Transition = reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 30 };

  return (
    <div
      className={cn(
        "@container rounded-[24px] bg-card p-4 text-foreground shadow-[0_0_0_0.5px_var(--border),0_20px_40px_-26px_rgba(0,0,0,.35)] sm:p-5",
        className,
      )}
      onPointerDownCapture={markTouched}
      onKeyDownCapture={markTouched}
      onFocusCapture={markTouched}
    >
      <LayoutGroup id={`dm-${id}`}>
        <div className="grid gap-4 @xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* Stage */}
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span id={`${id}-switch-label`} className="text-[13px] font-medium text-foreground">
                Add <code className="font-mono">.dark</code> to the wrapper
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-labelledby={`${id}-switch-label`}
                onClick={toggle}
                className={cn(
                  "relative inline-flex shrink-0 items-center rounded-full transition-colors duration-300",
                  isDark ? "bg-[#0071e3] dark:bg-[#0a84ff]" : "bg-[#d2d2d7] dark:bg-[#3a3a3c]",
                  focusRing,
                )}
                style={{ width: TRACK_W, height: KNOB + PAD * 2, padding: PAD }}
              >
                <motion.span aria-hidden className="absolute left-[7px] text-white" style={{ opacity: sunOpacity }}>
                  <Sun className="size-3.5" strokeWidth={2.4} />
                </motion.span>
                <motion.span aria-hidden className="absolute right-[7px] text-white" style={{ opacity: moonOpacity }}>
                  <Moon className="size-3.5" strokeWidth={2.4} />
                </motion.span>
                <motion.span
                  aria-hidden
                  className="relative block rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.3)]"
                  style={{ width: KNOB, height: KNOB, x, scaleX, scaleY }}
                />
              </button>
            </div>

            {/* Explicit light container: the page theme never reaches the card. */}
            <div className="flex-1 rounded-[20px] bg-[#f5f5f7] p-2 shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)]">
              <div
                data-testid="dark-mode-demo-wrapper"
                className={cn(
                  "flex h-full min-h-[210px] items-center justify-center rounded-[14px] p-4 transition-colors duration-300 motion-reduce:transition-none",
                  isDark ? "dark nx-dm-scope bg-black" : "bg-[#f5f5f7]",
                )}
              >
                <div
                  className={cn(
                    "w-full max-w-[260px] rounded-[20px] p-4 ring-1 shadow-[0_12px_28px_-18px_rgba(0,0,0,.45)] transition-colors duration-300 motion-reduce:transition-none",
                    classesFor("card"),
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-full text-[15px] font-semibold transition-colors duration-300 motion-reduce:transition-none",
                        classesFor("avatar"),
                      )}
                    >
                      MC
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold">Maya Chen</p>
                      <p
                        className={cn(
                          "truncate text-[13px] transition-colors duration-300 motion-reduce:transition-none",
                          classesFor("meta"),
                        )}
                      >
                        Design engineer
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-[12px] transition-colors duration-300 motion-reduce:transition-none",
                          classesFor("meta"),
                        )}
                      >
                        Components shipped
                      </p>
                      <strong
                        className={cn(
                          "block text-[26px] leading-tight font-semibold tabular-nums transition-colors duration-300 motion-reduce:transition-none",
                          classesFor("stat"),
                        )}
                      >
                        128
                      </strong>
                    </div>
                    {/* A sample, not a control: styled like a button but not focusable. */}
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-300 motion-reduce:transition-none",
                        classesFor("button"),
                      )}
                    >
                      Follow
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Class list */}
          <div className="flex min-w-0 flex-col gap-3">
            <div
              role="group"
              aria-label="Card class list"
              className="min-w-0 flex-1 rounded-[20px] bg-[#1d1d1f] p-4 font-mono text-[12px] leading-[1.6] text-[#e6e6ea]"
            >
              <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                <span className="text-[#98989d]">{"<div className=\""}</span>
                <AnimatePresence initial={false} mode="popLayout">
                  {isDark ? (
                    <motion.span
                      key="dark"
                      layout
                      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 6 }}
                      transition={pill}
                      className="rounded-md bg-[#0a84ff]/30 px-1.5 text-[#f5f5f7] shadow-[0_0_0_1px_rgba(10,132,255,.6)]"
                    >
                      dark
                    </motion.span>
                  ) : null}
                </AnimatePresence>
                <motion.span layout transition={pill} className="text-[#98989d]">
                  {"\">"}
                </motion.span>
              </div>

              <ul className="mt-2 space-y-2.5 border-l border-white/10 pl-3">
                {PARTS.map((part) => (
                  <li key={part.key} className="min-w-0">
                    <span className="text-[#98989d]">
                      {`<${part.tag}`} <span className="text-[#8e8e93]">{`/* ${part.label} */`}</span>
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {part.pairs.map((pair, i) => (
                        <span key={pair.light} className="inline-flex flex-wrap gap-1">
                          <Token
                            text={pair.light}
                            active={!isDark}
                            pillId={`${id}-${part.key}-${i}`}
                            transition={pill}
                            tone="light"
                          />
                          <Token
                            text={pair.dark}
                            active={isDark}
                            pillId={`${id}-${part.key}-${i}`}
                            transition={pill}
                            tone="dark"
                          />
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[20px] bg-[#f5f5f7] p-4 dark:bg-[#2c2c2e]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12.5px] font-medium text-foreground">What Tailwind generates</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11.5px] font-medium transition-colors duration-300",
                    isDark
                      ? "bg-[#0071e3] text-white dark:bg-[#0a84ff] dark:text-black"
                      : "bg-card text-muted-foreground shadow-[0_0_0_0.5px_var(--border)]",
                  )}
                >
                  {isDark ? "Selector matches" : "No .dark ancestor"}
                </span>
              </div>
              <pre className="mt-2 overflow-x-auto rounded-[14px] bg-[#1d1d1f] p-3 font-mono text-[11.5px] leading-[1.6] text-[#e6e6ea]">
                <code>
                  <span className="text-[#64d2ff]">{".dark\\:bg-zinc-900"}</span>
                  <span className="text-[#ffb340]">{":is(.dark *)"}</span>
                  {" {\n  background-color: var(--color-zinc-900);\n}"}
                </code>
              </pre>
              <p className="mt-2 text-[12.5px] leading-[1.55] text-muted-foreground">
                <code className="font-mono text-foreground">:is(.dark *)</code> matches any element inside something
                with the <code className="font-mono text-foreground">dark</code> class. Add it to one wrapper and
                every <code className="font-mono text-foreground">dark:</code> utility below it switches at once. This
                demo keys the same selector to its own wrapper so the page&apos;s theme stays out.
              </p>
            </div>
          </div>
        </div>

        <p className="sr-only" aria-live={interacted ? "polite" : "off"} aria-atomic>
          {interacted
            ? isDark
              ? "Wrapper has the dark class. The dark: classes are in effect."
              : "Wrapper has no dark class. The light classes are in effect."
            : ""}
        </p>
      </LayoutGroup>
    </div>
  );
}

function Token({
  text,
  active,
  pillId,
  transition,
  tone,
}: {
  text: string;
  active: boolean;
  pillId: string;
  transition: Transition;
  tone: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "relative rounded-md px-1.5 py-px whitespace-nowrap transition-opacity duration-200",
        active ? "opacity-100" : "opacity-60",
      )}
    >
      {active ? (
        <motion.span
          layoutId={pillId}
          transition={transition}
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-md",
            tone === "dark"
              ? "bg-[#0a84ff]/30 shadow-[0_0_0_1px_rgba(10,132,255,.6)]"
              : "bg-white/12 shadow-[0_0_0_1px_rgba(255,255,255,.18)]",
          )}
        />
      ) : null}
      <span className={cn("relative", active && tone === "dark" ? "text-[#f5f5f7]" : undefined)}>{text}</span>
      {active ? <span className="sr-only"> (in effect)</span> : null}
    </span>
  );
}
