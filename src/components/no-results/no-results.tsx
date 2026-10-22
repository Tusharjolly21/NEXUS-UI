"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export type NoResultsStatus = "Paid" | "Pending" | "Overdue";

export interface NoResultsRow {
  id: string;
  who: string;
  amount: string;
  status: NoResultsStatus;
  /** Age in days; the demo filter "Last 7 days" keeps rows of 7 or less. */
  age: number;
}

export interface NoResultsFilter {
  /** Text on the chip. */
  label: string;
  /** Keeps the row when it returns true. */
  test: (row: NoResultsRow) => boolean;
}

export interface NoResultsTypo {
  /** Misspellings to look for in the query (case-insensitive). While one is present the list is empty. */
  wrong: string[];
  /** What the fix button puts in their place. */
  right: string;
}

export interface NoResultsProps {
  /** The rows the list shows once nothing is hiding them. Defaults to four demo invoices. */
  rows?: NoResultsRow[];
  /** The filter chips applied at the start. Defaults to "Status: Paid" and "Last 7 days". */
  filters?: NoResultsFilter[];
  /** The query in the search box at the start. */
  query?: string;
  /** The misspelling the empty state spots and how it fixes it. */
  typo?: NoResultsTypo;
  /** What the rows are called, used in the headline and the input label. */
  noun?: string;
  /** Called with the new query when the typo fix is pressed. Not called by the autoplay demo. */
  onFixTypo?: (query: string) => void;
  /** Called when the filters are cleared. Not called by the autoplay demo. */
  onClearFilters?: () => void;
  /** Fixes the typo, clears the filters and starts over on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const NO_RESULTS_ROWS: NoResultsRow[] = [
  { id: "INV-1042", who: "Orbitly", amount: "$4,200", status: "Pending", age: 3 },
  { id: "INV-1039", who: "Fernhill", amount: "$1,180", status: "Overdue", age: 12 },
  { id: "INV-1036", who: "Vela", amount: "$860", status: "Paid", age: 19 },
  { id: "INV-1031", who: "Quadrant", amount: "$12,400", status: "Paid", age: 24 },
];
export const NO_RESULTS_FILTERS: NoResultsFilter[] = [
  { label: "Status: Paid", test: (r) => r.status === "Paid" },
  { label: "Last 7 days", test: (r) => r.age <= 7 },
];
export const NO_RESULTS_TYPO: NoResultsTypo = { wrong: ["invoce", "invioce", "invocie"], right: "invoice" };
const START_QUERY = "invoce march";

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const TONE: Record<NoResultsStatus, string> = {
  Paid: "bg-[#e9f9ee] text-[#1a7f37] dark:bg-[#30d158]/15 dark:text-[#4ade80]",
  Pending: "bg-[#fff4e5] text-[#b25e00] dark:bg-[#ff9f0a]/15 dark:text-[#ffb340]",
  Overdue: "bg-[#fff1f0] text-[#c4271b] dark:bg-[#ff453a]/15 dark:text-[#ff6961]",
};

type Ch = { k: string; c: string };
type Field = { chars: Ch[]; seq: number; fresh: string[] };

const fieldFrom = (s: string, seq = 0): Field => ({ chars: [...s].map((c, i) => ({ k: `c${seq + i}`, c })), seq: seq + [...s].length, fresh: [] });
/** Keep keys for the unchanged start and end so only the edited letters animate. */
function edit(f: Field, next: string): Field {
  const a = f.chars.map((x) => x.c).join("");
  let s = 0;
  while (s < a.length && s < next.length && a[s] === next[s]) s++;
  let e = 0;
  while (e < a.length - s && e < next.length - s && a[a.length - 1 - e] === next[next.length - 1 - e]) e++;
  const mid = [...next.slice(s, next.length - e)].map((c, i) => ({ k: `c${f.seq + i}`, c }));
  return { chars: [...f.chars.slice(0, s), ...mid, ...f.chars.slice(f.chars.length - e)], seq: f.seq + mid.length, fresh: mid.map((x) => x.k) };
}

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/**
 * A "no results" state that tells you why and fixes it for you. When a typo
 * or filters hide everything, it says which, and offers the fix in one tap:
 * the missing letter slides into the search box, the filter chips peel away
 * one by one, and the matching rows drop back in. The search box is a real
 * input; typing a typo back in brings the empty state back.
 */
export function NoResults({
  rows = NO_RESULTS_ROWS,
  filters: initialFilters = NO_RESULTS_FILTERS,
  query = START_QUERY,
  typo = NO_RESULTS_TYPO,
  noun = "invoices",
  onFixTypo,
  onClearFilters,
  autoplay = false,
  enableSound = true,
  className,
}: NoResultsProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [field, setField] = useState<Field>(() => fieldFrom(query));
  const [filters, setFilters] = useState(initialFilters);
  const root = useRef<HTMLDivElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const peel = useRef<number[]>([]);
  const active = useDemoActive(root, autoplay && !reduce);

  const q = field.chars.map((x) => x.c).join("");
  const typoRe = new RegExp(typo.wrong.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") || "$^", "i");
  const hasTypo = typoRe.test(q);
  const shown = hasTypo ? [] : rows.filter((r) => filters.every((f) => f.test(r)));
  const changed = q !== query || filters.length !== initialFilters.length;
  const fresh = new Set(field.fresh);

  const clearPeel = () => {
    peel.current.forEach((id) => window.clearTimeout(id));
    peel.current = [];
  };
  useEffect(
    () => () => {
      peel.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const fixTypo = (auto = false) => {
    const p = auto ? play.auto : play;
    p("pop", 0.5);
    const next = q.replace(typoRe, typo.right);
    setField((f) => edit(f, next));
    if (!auto) onFixTypo?.(next);
  };
  const clearFilters = (auto = false) => {
    const p = auto ? play.auto : play;
    clearPeel();
    const n = filters.length;
    // One tick for every second chip that peels away, so a longer row never rattles.
    Array.from({ length: n }, (_, i) => i).forEach((i) => {
      const run = () => {
        setFilters((f) => f.slice(1));
        if (i % 2 === 0) p("tick", 0.4);
      };
      if (reduce) run();
      else peel.current.push(window.setTimeout(run, i * 180));
    });
    if (!auto) onClearFilters?.();
  };
  const reset = () => {
    clearPeel();
    setField((f) => fieldFrom(query, f.seq));
    setFilters(initialFilters);
  };

  // The demo reads the latest handlers through a ref.
  const latest = useRef({ fixTypo, clearFilters, reset });
  useEffect(() => {
    latest.current = { fixTypo, clearFilters, reset };
  });

  // Demo: fix the typo, clear the filters, start over.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    const at = (fn: () => void, ms: number) => ids.push(window.setTimeout(() => !touched.current && fn(), ms));
    const loop = () => {
      if (touched.current) return;
      at(() => latest.current.reset(), 0);
      at(() => latest.current.fixTypo(true), 1800);
      at(() => latest.current.clearFilters(true), 3600);
      at(() => latest.current.reset(), 7400);
      ids.push(window.setTimeout(loop, 7600));
    };
    loop();
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [autoplay, reduce, active]);

  // When a keyboard press makes the button vanish, keep focus on the list instead of dropping it to the page.
  const settle = (e: ReactMouseEvent) => {
    if (e.detail === 0) window.requestAnimationFrame(() => results.current?.focus({ preventScroll: true }));
  };

  const headline = `No ${noun} match "${q.trim() || "…"}"`;
  const reason =
    hasTypo && filters.length
      ? `There's a typo, and ${filters.length} filter${filters.length === 1 ? " is" : "s are"} narrowing things down.`
      : hasTypo
        ? "Looks like a typo."
        : `${filters.length} filter${filters.length === 1 ? " is" : "s are"} hiding everything.`;

  return (
    <div
      ref={root}
      className={cn(
        "w-[520px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      {/* search field: the real input sits on top with clear text; the letters underneath are the ones you see */}
      <label className="relative flex h-12 items-center gap-2.5 rounded-[14px] bg-[#f5f5f7] px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0071e3] dark:bg-[#2c2c2e] dark:focus-within:outline-[#0a84ff]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2.4" strokeLinecap="round" className="flex-none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <span className="relative h-[22px] min-w-0 flex-1">
          <LayoutGroup>
            <span className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre text-[16px] text-[#1d1d1f] dark:text-[#f5f5f7]" aria-hidden="true">
              {field.chars.map((x) => (
                <motion.span
                  key={x.k}
                  layout={reduce ? false : "position"}
                  className="relative inline-block"
                  initial={fresh.has(x.k) && !reduce ? { opacity: 0, y: -10, scale: 0.6 } : false}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 26 }}
                >
                  {fresh.has(x.k) && !reduce && (
                    <motion.span
                      className="absolute -inset-x-[1px] inset-y-0 rounded-[3px] bg-[#34c759]/30"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                    />
                  )}
                  <span className="relative">{x.c}</span>
                </motion.span>
              ))}
            </span>
          </LayoutGroup>
          <input
            value={q}
            onChange={(e) => {
              touched.current = true;
              const v = e.target.value;
              setField((f) => edit(f, v));
            }}
            aria-label={`Search ${noun}`}
            spellCheck={false}
            className="absolute inset-0 w-full bg-transparent text-[16px] text-transparent caret-[#0071e3] outline-none dark:caret-[#0a84ff]"
          />
        </span>
      </label>
      <div className="mt-3 flex min-h-[30px] flex-wrap items-center gap-2">
        <AnimatePresence initial={false}>
          {filters.map((f) => (
            <motion.button
              key={f.label}
              type="button"
              layout={!reduce}
              onClick={(e) => {
                touched.current = true;
                play("tick", 0.4);
                setFilters((x) => x.filter((y) => y.label !== f.label));
                settle(e);
              }}
              className={cn("flex h-[30px] items-center gap-1.5 rounded-full bg-[#eef5ff] pl-3 pr-2 text-[12.5px] font-medium text-[#0071e3] dark:bg-[#0a84ff]/20 dark:text-[#6cb6ff]", FOCUS)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0.1 } } : { opacity: 0, x: 30, rotate: 8, transition: { duration: 0.25 } }}
              aria-label={`Remove filter ${f.label}`}
            >
              {f.label}
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </motion.button>
          ))}
        </AnimatePresence>
        {changed && (
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              play("tap", 0.35);
              reset();
            }}
            className={cn("ml-auto rounded px-1 text-[12.5px] font-medium text-[#0071e3] hover:underline dark:text-[#6cb6ff]", FOCUS)}
          >
            Reset
          </button>
        )}
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {shown.length === 0 ? `${headline}. ${reason}` : `${shown.length} ${noun} shown`}
      </span>

      <div ref={results} tabIndex={-1} className="relative mt-3 min-h-[250px] outline-none">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.length === 0 ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center px-4 pt-6 text-center"
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -8, transition: { duration: 0.18 } }}
            >
              {/* a magnifier passing over rows that aren't there */}
              <div className="relative h-[72px] w-[150px]" aria-hidden="true">
                {[0, 1, 2].map((k) => (
                  <span key={k} className="absolute left-0 h-2.5 rounded-full bg-[#f0f0f3] dark:bg-[#2c2c2e]" style={{ top: 10 + k * 22, width: `${[100, 78, 88][k]}%` }} />
                ))}
                <motion.svg
                  className="absolute top-1 text-[#1d1d1f] dark:text-[#f5f5f7]"
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  animate={reduce ? undefined : { x: [0, 100, 30, 0], y: [0, 18, 26, 0], rotate: [0, 8, -6, 0] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <circle cx="10" cy="10" r="6.5" className="fill-white/75 dark:fill-[#1c1c1e]/75" />
                  <path d="M15 15l5 5" />
                </motion.svg>
              </div>
              <h4 className="m-0 mt-4 text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {headline}
              </h4>
              <p className="m-0 mt-1 text-[13.5px] text-[#6e6e73] dark:text-[#a1a1a6]">
                {reason}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {hasTypo && (
                  <motion.button
                    layout={!reduce}
                    type="button"
                    onClick={(e) => {
                      touched.current = true;
                      fixTypo();
                      settle(e);
                    }}
                    className={cn("h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
                  >
                    Search &quot;{typo.right}&quot; instead
                  </motion.button>
                )}
                {filters.length > 0 && (
                  <motion.button
                    layout={!reduce}
                    type="button"
                    onClick={(e) => {
                      touched.current = true;
                      clearFilters();
                      settle(e);
                    }}
                    className={cn("h-9 rounded-full bg-[#f5f5f7] px-4 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]", FOCUS)}
                  >
                    Clear {filters.length} filter{filters.length > 1 ? "s" : ""}
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.ul key="list" className="m-0 list-none p-0" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {shown.map((r, i) => (
                <motion.li
                  key={r.id}
                  className="flex items-center gap-3 border-b border-black/5 py-3 last:border-0 dark:border-white/[.08]"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: -14, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={reduce ? { duration: 0.15 } : { delay: i * 0.06, type: "spring", stiffness: 380, damping: 30, filter: { duration: 0.25, delay: i * 0.06 } }}
                >
                  <span className="w-[76px] flex-none font-mono text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{r.id}</span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{r.who}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-semibold", TONE[r.status])}>{r.status}</span>
                  <span className="w-[70px] flex-none text-right text-[14px] tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">{r.amount}</span>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
