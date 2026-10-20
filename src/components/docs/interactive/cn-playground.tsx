"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";

export type CnPlaygroundSize = "sm" | "md" | "lg";

export type CnPlaygroundProps = {
  /** Steps through preset scenarios until the first interaction. Off under reduced motion. */
  autoplay?: boolean;
  className?: string;
};

const MAX_LEN = 200;
/** Only tokens shaped like utility classes reach the preview's className. */
const SAFE_TOKEN = /^[a-z0-9:_\-\/\.\[\]#%]+$/i;

const DEFAULT_BASE = "px-4 py-2 rounded-lg bg-zinc-900 text-white";
const ACTIVE_CLASS = "bg-blue-600";
const SIZES: Record<CnPlaygroundSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-3 text-lg",
};
const SIZE_ORDER: CnPlaygroundSize[] = ["sm", "md", "lg"];

/** Written out in full so Tailwind ships these utilities and the preview can paint them. */
const OVERRIDE_SUGGESTIONS = ["px-8 bg-emerald-600", "rounded-full px-10", "bg-white text-zinc-900"];

type Config = { base: string; isActive: boolean; size: CnPlaygroundSize; override: string };

const SCENARIOS: { config: Config; caption: string }[] = [
  {
    config: { base: DEFAULT_BASE, isActive: false, size: "md", override: "" },
    caption: "Base plus size md: the repeated px-4 py-2 collapse to one copy",
  },
  {
    config: { base: DEFAULT_BASE, isActive: true, size: "md", override: "" },
    caption: "isActive adds bg-blue-600, which knocks out bg-zinc-900",
  },
  {
    config: { base: DEFAULT_BASE, isActive: true, size: "lg", override: "" },
    caption: "size lg brings px-6 py-3 text-lg, replacing the base padding",
  },
  {
    config: { base: DEFAULT_BASE, isActive: true, size: "lg", override: "px-8 bg-emerald-600" },
    caption: "className comes last, so px-8 and bg-emerald-600 win",
  },
];
const LAST = SCENARIOS.length - 1;

type Source = "base" | "active" | "size" | "override";
type Token = { key: string; value: string; source: Source; kept: boolean };

const SOURCE_META: Record<Source, { label: string; dot: string }> = {
  base: { label: "base", dot: "bg-[#8e8e93]" },
  active: { label: "isActive", dot: "bg-[#0071e3] dark:bg-[#0a84ff]" },
  size: { label: "sizes[size]", dot: "bg-[#af52de] dark:bg-[#bf5af2]" },
  override: { label: "className", dot: "bg-[#248a3d] dark:bg-[#30d158]" },
};

function evaluate(config: Config) {
  const parts: [Source, string | false][] = [
    ["base", config.base],
    ["active", config.isActive && ACTIVE_CLASS],
    ["size", SIZES[config.size]],
    ["override", config.override],
  ];
  // The real thing: clsx first, then tailwind-merge — exactly what cn() does.
  const clsxOut = clsx(config.base, config.isActive && ACTIVE_CLASS, SIZES[config.size], config.override);
  const merged = twMerge(clsxOut);

  const raw: Omit<Token, "kept">[] = [];
  for (const [source, value] of parts) {
    if (!value) continue;
    const seen = new Map<string, number>();
    for (const t of value.split(/\s+/)) {
      if (!t) continue;
      const n = seen.get(t) ?? 0;
      seen.set(t, n + 1);
      raw.push({ key: `${source}:${t}:${n}`, value: t, source });
    }
  }

  // tailwind-merge keeps the last of each conflicting group and preserves order, so its output is a
  // subsequence of the input: match it from the end to learn which tokens survived.
  const mergedTokens = merged.split(/\s+/).filter(Boolean);
  const kept = new Array<boolean>(raw.length).fill(false);
  let j = mergedTokens.length - 1;
  for (let i = raw.length - 1; i >= 0 && j >= 0; i--) {
    if (raw[i].value === mergedTokens[j]) {
      kept[i] = true;
      j--;
    }
  }

  const tokens: Token[] = raw.map((t, i) => ({ ...t, kept: kept[i] }));
  const safe = mergedTokens.filter((t) => SAFE_TOKEN.test(t));
  const dropped = mergedTokens.filter((t) => !SAFE_TOKEN.test(t));
  return { tokens, clsxOut, merged, safe: safe.join(" "), dropped };
}

function truncate(s: string, n: number) {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
}

const chipSpring: Transition = { type: "spring", stiffness: 520, damping: 34, mass: 0.7 };

const chipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: -8 },
  shown: { opacity: 1, scale: 1, y: 0, rotate: 0, transition: chipSpring },
  // Signature move: the strike line draws, then the chip is knocked out with a springy drop and fades.
  out: (i: number) => ({
    opacity: 0,
    y: 22,
    rotate: i % 2 ? 10 : -10,
    scale: 0.92,
    transition: {
      y: { type: "spring", stiffness: 420, damping: 13, delay: 0.14 },
      rotate: { type: "spring", stiffness: 300, damping: 16, delay: 0.14 },
      scale: { type: "spring", stiffness: 300, damping: 20, delay: 0.14 },
      opacity: { type: "spring", stiffness: 200, damping: 30, delay: 0.3 },
    },
  }),
};

const strikeVariants: Variants = {
  hidden: { scaleX: 0 },
  shown: { scaleX: 0 },
  out: { scaleX: 1, transition: { type: "spring", stiffness: 700, damping: 40 } },
};

const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0 } },
  out: { opacity: 0, transition: { duration: 0 } },
};

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-card dark:focus-visible:ring-[#0a84ff]";

const fieldClass = cn(
  "w-full min-w-0 rounded-[14px] bg-[#f5f5f7] px-3.5 py-2.5 font-mono text-[13px] text-foreground placeholder:text-muted-foreground dark:bg-[#2c2c2e]",
  focusRing,
);

export function CnPlayground({ autoplay = true, className }: CnPlaygroundProps) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const reduce = useReducedMotion();

  const [step, setStep] = useState(LAST);
  const [config, setConfig] = useState<Config>(SCENARIOS[LAST].config);
  const [interacted, setInteracted] = useState(false);
  const touchedRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const sizeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const markTouched = useCallback(() => {
    if (touchedRef.current) return;
    touchedRef.current = true;
    window.clearTimeout(timerRef.current);
    setInteracted(true);
  }, []);

  useEffect(() => {
    if (!autoplay || reduce || touchedRef.current) return;
    const t = window.setTimeout(() => {
      if (touchedRef.current) return;
      const next = (step + 1) % SCENARIOS.length;
      setStep(next);
      setConfig(SCENARIOS[next].config);
    }, step === LAST ? 3400 : 2300);
    timerRef.current = t;
    return () => window.clearTimeout(t);
  }, [autoplay, reduce, step]);

  const result = useMemo(() => evaluate(config), [config]);
  const survivors = result.tokens.filter((t) => t.kept);
  const removedCount = result.tokens.length - survivors.length;
  const variants = reduce ? reducedVariants : chipVariants;
  const layoutTransition: Transition = reduce ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 36 };

  const update = (patch: Partial<Config>) => setConfig((c) => ({ ...c, ...patch }));

  const onSizeKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const i = SIZE_ORDER.indexOf(config.size);
    let n = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % SIZE_ORDER.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i + SIZE_ORDER.length - 1) % SIZE_ORDER.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = SIZE_ORDER.length - 1;
    else return;
    e.preventDefault();
    update({ size: SIZE_ORDER[n] });
    sizeRefs.current[n]?.focus();
  };

  const baseShown = truncate(config.base, 30);
  const caption = interacted || reduce || !autoplay ? null : SCENARIOS[step].caption;

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
      <LayoutGroup id={`cn-${id}`}>
        {/* Inputs */}
        <div className="grid gap-4 @xl:grid-cols-2">
          <div className="min-w-0 space-y-1.5 @xl:col-span-2">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={`${id}-base`} className="text-[13px] font-medium text-foreground">
                Base classes
              </label>
              <span className="text-[12px] tabular-nums text-muted-foreground" aria-hidden>
                {config.base.length}/{MAX_LEN}
              </span>
            </div>
            <input
              id={`${id}-base`}
              type="text"
              value={config.base}
              maxLength={MAX_LEN}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              onChange={(e) => update({ base: e.target.value.slice(0, MAX_LEN) })}
              className={fieldClass}
            />
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                role="switch"
                aria-checked={config.isActive}
                aria-labelledby={`${id}-active-label`}
                onClick={() => update({ isActive: !config.isActive })}
                className={cn(
                  "relative inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-full p-[3px] transition-colors duration-200",
                  config.isActive ? "bg-[#0071e3] dark:bg-[#0a84ff]" : "bg-[#d2d2d7] dark:bg-[#3a3a3c]",
                  focusRing,
                )}
              >
                <motion.span
                  className="block size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.25)]"
                  initial={false}
                  animate={{ x: config.isActive ? 18 : 0 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 32 }}
                />
              </button>
              <span id={`${id}-active-label`} className="font-mono text-[13px] text-foreground">
                isActive
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span id={`${id}-size-label`} className="font-mono text-[13px] text-foreground">
                size
              </span>
              <div
                role="radiogroup"
                aria-labelledby={`${id}-size-label`}
                className="relative inline-flex rounded-full bg-[#f5f5f7] p-[3px] dark:bg-[#2c2c2e]"
              >
                {SIZE_ORDER.map((s, i) => {
                  const on = config.size === s;
                  return (
                    <button
                      key={s}
                      ref={(el) => {
                        sizeRefs.current[i] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      tabIndex={on ? 0 : -1}
                      onClick={() => update({ size: s })}
                      onKeyDown={onSizeKey}
                      className={cn(
                        "relative h-7 min-w-10 rounded-full px-3 font-mono text-[12.5px] transition-colors",
                        on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                        focusRing,
                      )}
                    >
                      {on ? (
                        <motion.span
                          layoutId={`${id}-size-pill`}
                          className="absolute inset-0 rounded-full bg-card shadow-[0_0_0_0.5px_var(--border),0_2px_6px_-2px_rgba(0,0,0,.2)]"
                          transition={layoutTransition}
                        />
                      ) : null}
                      <span className="relative">{s}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-1.5">
            <label htmlFor={`${id}-override`} className="text-[13px] font-medium text-foreground">
              <span className="font-mono">className</span> override
            </label>
            <input
              id={`${id}-override`}
              type="text"
              value={config.override}
              maxLength={MAX_LEN}
              placeholder="px-8 bg-emerald-600"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              onChange={(e) => update({ override: e.target.value.slice(0, MAX_LEN) })}
              className={fieldClass}
            />
            <div className="flex flex-wrap gap-1.5 pt-0.5" aria-label="Try an override">
              {OVERRIDE_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update({ override: s })}
                  className={cn(
                    "rounded-full px-2.5 py-1 font-mono text-[11.5px] text-muted-foreground shadow-[0_0_0_0.5px_var(--border)] transition-colors hover:text-foreground",
                    config.override === s && "bg-[#f5f5f7] text-foreground dark:bg-[#2c2c2e]",
                    focusRing,
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Autoplay caption */}
        <p className="mt-4 min-h-[20px] text-[13px] text-muted-foreground" aria-hidden={caption ? true : undefined}>
          {caption ?? "Edit any input: conflicting utilities are resolved left to right, last one wins."}
        </p>

        {/* Output rows */}
        <div className="mt-3 space-y-4 rounded-[20px] bg-[#f5f5f7] p-4 dark:bg-black">
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 id={`${id}-clsx-h`} className="text-[13px] font-semibold text-foreground">
                clsx only
              </h3>
              <span className="text-[12px] tabular-nums text-muted-foreground">
                {result.tokens.length} {result.tokens.length === 1 ? "class" : "classes"}
              </span>
            </div>
            <ul aria-labelledby={`${id}-clsx-h`} className="relative flex min-h-8 flex-wrap gap-1.5">
              <AnimatePresence initial={false} mode="popLayout">
                {result.tokens.map((t) => (
                  <motion.li
                    key={t.key}
                    layout={reduce ? false : "position"}
                    transition={layoutTransition}
                    variants={reduce ? reducedVariants : chipVariants}
                    initial="hidden"
                    animate="shown"
                    exit={reduce ? "out" : { opacity: 0, scale: 0.7, transition: chipSpring }}
                    className={cn(
                      "inline-flex max-w-full items-center gap-1.5 rounded-full bg-card px-2.5 py-1 font-mono text-[12.5px] break-all shadow-[0_0_0_0.5px_var(--border)] transition-colors duration-200",
                      t.kept ? "text-foreground" : "text-muted-foreground line-through decoration-[1.5px]",
                    )}
                  >
                    <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", SOURCE_META[t.source].dot)} />
                    {t.value}
                    {t.kept ? null : <span className="sr-only"> (removed by tailwind-merge)</span>}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 id={`${id}-cn-h`} className="font-mono text-[13px] font-semibold text-foreground">
                cn()
              </h3>
              <span className="text-[12px] tabular-nums text-muted-foreground">
                {survivors.length} kept · {removedCount} removed
              </span>
            </div>
            <ul aria-labelledby={`${id}-cn-h`} className="relative flex min-h-8 flex-wrap gap-1.5">
              <AnimatePresence initial={false} mode="popLayout">
                {survivors.map((t, i) => (
                  <motion.li
                    key={t.key}
                    custom={i}
                    layout={reduce ? false : "position"}
                    transition={layoutTransition}
                    variants={variants}
                    initial="hidden"
                    animate="shown"
                    exit="out"
                    className="relative inline-flex max-w-full items-center gap-1.5 rounded-full bg-card px-2.5 py-1 font-mono text-[12.5px] break-all text-foreground shadow-[0_0_0_0.5px_var(--border)]"
                  >
                    <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", SOURCE_META[t.source].dot)} />
                    {t.value}
                    {reduce ? null : (
                      <motion.span
                        aria-hidden
                        variants={strikeVariants}
                        className="pointer-events-none absolute inset-x-2 top-1/2 h-[1.5px] origin-left rounded-full bg-current"
                      />
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-1" aria-label="Where each class came from">
            {(Object.keys(SOURCE_META) as Source[]).map((s) => (
              <li key={s} className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-muted-foreground">
                <span aria-hidden className={cn("size-1.5 rounded-full", SOURCE_META[s].dot)} />
                {SOURCE_META[s].label}
              </li>
            ))}
          </ul>
        </div>

        {/* The expression being evaluated */}
        <pre
          className="mt-4 overflow-x-auto rounded-[20px] bg-[#1d1d1f] p-4 font-mono text-[12.5px] leading-[1.7] text-[#e6e6ea]"
          aria-label="Expression being evaluated"
        >
          <code>
            <span className="text-[#64d2ff]">cn</span>
            {"("}
            <span className="text-[#ffb340]">{`"${baseShown}"`}</span>
            {", isActive && "}
            <span className="text-[#ffb340]">{`"${ACTIVE_CLASS}"`}</span>
            {", sizes[size], className)"}
            {"\n"}
            <span className="text-[#98989d]">
              {`// isActive: ${config.isActive} · size: "${config.size}" · className: "${truncate(config.override, 40)}"`}
            </span>
            {"\n"}
            <span className="text-[#98989d]">{"// → "}</span>
            <span className="break-all whitespace-pre-wrap text-[#30d158]">{`"${result.merged}"`}</span>
          </code>
        </pre>

        {/* Live preview */}
        <div className="mt-4 rounded-[20px] shadow-[0_0_0_0.5px_var(--border)]">
          <div className="flex min-h-[120px] items-center justify-center overflow-hidden rounded-t-[20px] bg-[#f5f5f7] p-6 dark:bg-[#2c2c2e]">
            <button
              type="button"
              aria-describedby={`${id}-preview-note`}
              className={`${result.safe} outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#0071e3]`}
            >
              Preview
            </button>
          </div>
          <p id={`${id}-preview-note`} className="px-4 py-3 text-[12.5px] leading-[1.5] text-muted-foreground">
            This button&apos;s className is the cn() result. Utilities this site&apos;s stylesheet doesn&apos;t ship
            merge correctly but won&apos;t paint.
            {result.dropped.length > 0 ? (
              <span className="mt-1 block break-all">
                Left out of the preview (not a class name): {result.dropped.join(" ")}
              </span>
            ) : null}
          </p>
        </div>

        <p className="sr-only" aria-live={interacted ? "polite" : "off"} aria-atomic>
          {interacted ? `cn() result: ${result.merged || "empty"}. ${removedCount} removed.` : ""}
        </p>
      </LayoutGroup>
    </div>
  );
}
