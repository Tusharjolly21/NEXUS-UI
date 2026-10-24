# Context Meter

Add the "Context Meter" component from Nexus UI to my project.

A context-window token meter drawn as a 40 by 5 dot grid. Hover a category to light only its dots; the conversation keeps growing, and Compact chat drops its dots out of the grid while everything after them reflows to close the gap.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ContextMeter, DEFAULT_CONTEXT_CATEGORIES } from "@/components/context-meter";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/context-meter/context-meter.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ContextCategory {
  id: string;
  label: string;
  /** Dot and swatch colour (any CSS colour, including var()). */
  color: string;
  /** Size in thousands of tokens. */
  tokens: number;
}

export interface ContextMeterProps {
  /** Starting categories, in grid order. */
  categories?: ContextCategory[];
  /** Window size in thousands of tokens. The grid always has 200 dots. */
  limit?: number;
  /** Id of the category that keeps growing and is cleared by "Compact chat". */
  growId?: string;
  /** Cycles the highlight and compacts when nearly full, until someone touches the card. */
  autoplay?: boolean;
}

export const DEFAULT_CONTEXT_CATEGORIES: ContextCategory[] = [
  // `--cm-ink` is near-black in light mode and near-white in dark mode.
  { id: "sys", label: "System prompt", color: "var(--cm-ink)", tokens: 4.2 },
  { id: "tools", label: "Tools", color: "#5e5ce6", tokens: 12.8 },
  { id: "files", label: "Files", color: "#ff9f0a", tokens: 46.1 },
  { id: "conv", label: "Conversation", color: "#0071e3", tokens: 38.4 },
  { id: "mem", label: "Memory", color: "#30d158", tokens: 3.9 },
];

const COLS = 40;
const ROWS = 5;
const COMPACT_TO = 6.2;

/**
 * A context-window meter drawn as a dot grid. Hover a category to light only its dots. The
 * conversation keeps growing; press Compact and its dots drop out of the grid and everything
 * after them closes the gap.
 */
export function ContextMeter({ categories = DEFAULT_CONTEXT_CATEGORIES, limit = 200, growId = "conv", autoplay = false }: ContextMeterProps) {
  const [cats, setCats] = useState(categories);
  const [hover, setHover] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const touched = useRef(false);
  const droppingRef = useRef(false);
  const totalRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const per = limit / (COLS * ROWS); // K per dot
  const total = cats.reduce((a, c) => a + c.tokens, 0);

  useEffect(() => {
    totalRef.current = total;
  }, [total]);

  const dots = useMemo(() => {
    const out: { cat: ContextCategory; k: string }[] = [];
    cats.forEach((c) => {
      const n = Math.round(c.tokens / per);
      for (let i = 0; i < n; i++) out.push({ cat: c, k: `${c.id}-${i}` });
    });
    return out.slice(0, COLS * ROWS);
  }, [cats, per]);

  // The conversation keeps growing until the window is nearly full.
  useEffect(() => {
    const t = setInterval(() => {
      if (dropping) return;
      setCats((cs) => {
        const sum = cs.reduce((a, x) => a + x.tokens, 0);
        return sum < limit - 8 ? cs.map((c) => (c.id === growId ? { ...c, tokens: c.tokens + 2.2 } : c)) : cs;
      });
    }, 380);
    return () => clearInterval(t);
  }, [dropping, limit, growId]);

  const compact = useCallback(() => {
    if (droppingRef.current) return;
    droppingRef.current = true;
    setDropping(true);
    timer.current = setTimeout(() => {
      setCats((cs) => cs.map((c) => (c.id === growId ? { ...c, tokens: COMPACT_TO } : c)));
      droppingRef.current = false;
      setDropping(false);
    }, 650);
  }, [growId]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (!touched.current && totalRef.current > limit * 0.9) compact();
    }, 1000);
    const order: (string | null)[] = [null, "files", "tools", growId];
    const h = setInterval(() => {
      if (touched.current) return;
      setHover((p) => order[(order.indexOf(p) + 1) % order.length]);
    }, 1700);
    return () => { clearInterval(t); clearInterval(h); };
  }, [autoplay, compact, limit, growId]);

  const touch = () => {
    if (touched.current) return;
    touched.current = true;
    if (autoplay) setHover(null);
  };

  const pct = Math.round((total / limit) * 100);
  const pctClass = pct > 85 ? "text-[#d70015] dark:text-[#ff453a]" : pct > 70 ? "text-[#b25000] dark:text-[#ff9f0a]" : "text-[#86868b] dark:text-[#98989d]";

  return (
    <div
      className="w-[400px] max-w-full rounded-[22px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] [--cm-empty:#e8e8ed] [--cm-ink:#1d1d1f] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)] dark:[--cm-empty:#3a3a3c] dark:[--cm-ink:#f5f5f7]"
      onPointerDown={touch}
      onPointerEnter={touch}
    >
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Context window</span>
        <span className={`text-[12px] font-semibold tabular-nums ${pctClass}`}>{pct}%</span>
      </div>
      <div className="mb-3 flex items-baseline gap-1">
        <span className="text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{total.toFixed(1)}K</span>
        <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">of {limit}K tokens</span>
      </div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        role="meter"
        aria-label="Context window"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.round(total * 10) / 10}
        aria-valuetext={`${total.toFixed(1)}K of ${limit}K tokens`}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const d = dots[i];
          const dim = hover && d && d.cat.id !== hover;
          const falling = dropping && d?.cat.id === growId;
          return (
            <motion.span
              key={d ? d.k : `e${i}`}
              layout="position"
              className="aspect-square rounded-full transition-[background-color] duration-300"
              style={{ backgroundColor: d ? d.cat.color : "var(--cm-empty)" }}
              initial={d ? { scale: 0 } : false}
              animate={
                falling
                  ? { y: 26 + (i % 7) * 3, opacity: 0, scale: 0.4, transition: { duration: 0.5, delay: (i % COLS) * 0.008, ease: "easeIn" } }
                  : { scale: 1, y: 0, opacity: d && dim ? 0.18 : 1 }
              }
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          );
        })}
      </div>
      <ul className="mt-4 flex list-none flex-col gap-0.5 p-0">
        {cats.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onPointerEnter={() => setHover(c.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => {
                touch();
                setHover(c.id);
              }}
              onBlur={() => setHover(null)}
              className="flex h-8 w-full items-center gap-2.5 rounded-lg px-2 text-left text-[13px] text-[#1d1d1f] hover:bg-[#f5f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:text-[#f5f5f7] dark:hover:bg-[#2c2c2e] dark:focus-visible:outline-[#0a84ff]"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
              <span className="flex-1">{c.label}</span>
              <span className="relative h-4 overflow-hidden tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={c.tokens.toFixed(1)} className="block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                    {c.tokens.toFixed(1)}K
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-[#f0f0f3] pt-3 dark:border-[#3a3a3c]">
        <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">{(limit - total).toFixed(1)}K left</span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => {
            touched.current = true;
            compact();
          }}
          className="h-8 rounded-full bg-[#1d1d1f] px-3.5 text-[12px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:outline-[#0a84ff]"
        >
          Compact chat
        </motion.button>
      </div>
    </div>
  );
}
```

--- components/context-meter/index.ts ---

```ts
export { ContextMeter, DEFAULT_CONTEXT_CATEGORIES } from "./context-meter";
export type { ContextMeterProps, ContextCategory } from "./context-meter";
```
