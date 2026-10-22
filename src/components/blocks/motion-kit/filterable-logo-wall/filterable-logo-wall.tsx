"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FilterableLogo {
  /** Wordmark text next to the mark. Also the key, so keep it unique. */
  name: string;
  /** Industry label. The filter pills are built from the distinct values, in order of first appearance. */
  industry: string;
  /** Inline SVG shapes drawn in a 20 x 20 box. Use `currentColor` so the mark follows the theme. */
  mark: ReactNode;
}

export interface FilterableLogoWallProps {
  /** Small line above the count. */
  heading?: string;
  /** Label of the pill that shows everything. */
  allLabel?: string;
  /** Customers on the wall. Twelve fill three rows of four. Use a stable array. */
  logos?: FilterableLogo[];
  /**
   * Steps through the filters every 2.6 s until the visitor picks one. Pauses off screen and in a hidden
   * tab. Never runs under reduced motion.
   */
  autoplay?: boolean;
  /** Called when the visitor picks a filter (the all label or an industry). */
  onFilterChange?: (filter: string) => void;
  className?: string;
}

const ink = "currentColor";

/* Invented companies for the demo. Replace with your own customers, with their permission. */
export const DEFAULT_FILTERABLE_LOGOS: FilterableLogo[] = [
  {
    name: "Quadrel",
    industry: "Fintech",
    mark: (
      <>
        <rect x="3" y="3" width="6" height="6" rx="1.5" fill={ink} />
        <rect x="11" y="11" width="6" height="6" rx="1.5" fill={ink} />
        <rect x="11" y="3" width="6" height="6" rx="1.5" fill={ink} opacity=".35" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" fill={ink} opacity=".35" />
      </>
    ),
  },
  { name: "Hexel", industry: "Dev tools", mark: <path d="M10 2l7 4v8l-7 4-7-4V6z" fill={ink} /> },
  { name: "Kitefly", industry: "Commerce", mark: <path d="M10 2l7 8-7 8-7-8z" fill={ink} /> },
  { name: "Orbitly", industry: "Media", mark: <circle cx="10" cy="10" r="7" fill="none" stroke={ink} strokeWidth="2.4" /> },
  {
    name: "Meridane",
    industry: "Fintech",
    mark: (
      <>
        <circle cx="10" cy="10" r="7.5" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M2.5 10h15" stroke={ink} strokeWidth="2" />
      </>
    ),
  },
  {
    name: "Paraleon",
    industry: "Dev tools",
    mark: <path d="M5 3v14M15 3v14M5 10h10" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />,
  },
  {
    name: "Velara",
    industry: "Commerce",
    mark: <path d="M10 3l8 14H2z" fill="none" stroke={ink} strokeWidth="2.2" strokeLinejoin="round" />,
  },
  {
    name: "Northgale",
    industry: "Media",
    mark: (
      <path
        d="M3 8c2.5-2 4.5-2 7 0s4.5 2 7 0M3 13c2.5-2 4.5-2 7 0s4.5 2 7 0"
        fill="none"
        stroke={ink}
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
  {
    name: "Duetly",
    industry: "Fintech",
    mark: (
      <>
        <circle cx="7" cy="10" r="5" fill={ink} />
        <circle cx="14" cy="10" r="5" fill={ink} opacity=".4" />
      </>
    ),
  },
  {
    name: "Pulsely",
    industry: "Dev tools",
    mark: (
      <path d="M2 11h4l2-6 4 10 2-4h4" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    name: "Lumora",
    industry: "Commerce",
    mark: (
      <>
        <circle cx="10" cy="10" r="4" fill={ink} />
        <path d="M10 1v3M10 16v3M1 10h3M16 10h3" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    name: "Astrel",
    industry: "Dev tools",
    mark: <path d="M10 2v16M3 6l14 8M17 6L3 14" stroke={ink} strokeWidth="2" strokeLinecap="round" />,
  },
];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/** True while the element is on screen and the tab is visible, so timers can stand down otherwise. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);
  return inView && visible;
}

/**
 * A customer wall you can sort by industry, so a visitor finds the companies that look like theirs. Pick a
 * filter and the others shrink away while the matches glide together into place; the count rolls to the
 * new total.
 */
export function FilterableLogoWall({
  heading = "Customers",
  allLabel = "All",
  logos = DEFAULT_FILTERABLE_LOGOS,
  autoplay = false,
  onFilterChange,
  className,
}: FilterableLogoWallProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const root = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(root);
  const filters = useMemo(() => [allLabel, ...Array.from(new Set(logos.map((l) => l.industry)))], [allLabel, logos]);
  const [picked, setPicked] = useState(allLabel);
  const [touched, setTouched] = useState(false);

  // If the filter list changes under the current pick, fall back to "all".
  const f = filters.includes(picked) ? picked : allLabel;
  const shown = useMemo(() => logos.filter((l) => f === allLabel || l.industry === f), [logos, f, allLabel]);
  const playing = autoplay && !reduce && !touched && filters.length > 1;
  const running = playing && onScreen;
  const label = f === allLabel ? "teams" : `in ${f.toLowerCase()}`;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setPicked((x) => filters[(Math.max(0, filters.indexOf(x)) + 1) % filters.length]);
    }, 2600);
    return () => window.clearInterval(id);
  }, [running, filters]);

  const pick = (x: string) => {
    setTouched(true);
    setPicked(x);
    onFilterChange?.(x);
  };

  const tileFx = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0.12 } },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, scale: 0.85, filter: "blur(6px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 0.85, filter: "blur(6px)", transition: { duration: 0.18 } },
        transition: { type: "spring" as const, stiffness: 300, damping: 30, filter: { duration: 0.25 }, opacity: { duration: 0.2 } },
      };

  return (
    <section
      ref={root}
      aria-label="Customer wall"
      className={cn("flex w-full justify-center bg-[#f5f5f7] px-4 py-12 dark:bg-black", className)}
    >
      <div className="w-full max-w-[760px] rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.3)] sm:p-7 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_#3a3a3c,0_20px_40px_-26px_rgba(0,0,0,.9)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="m-0 text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{heading}</p>
            <p
              className="m-0 mt-1 flex items-baseline gap-1.5 text-[26px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]"
              aria-live={playing ? "off" : "polite"}
            >
              <span className="sr-only">{`${shown.length} ${label}`}</span>
              <span aria-hidden="true" className="flex items-baseline gap-1.5">
                <span className="relative inline-flex h-[1.15em] overflow-hidden tabular-nums">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={shown.length}
                      initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
                      transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 32 }}
                    >
                      {shown.length}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span>{label}</span>
              </span>
            </p>
          </div>
          <LayoutGroup id={`${uid}-tabs`}>
            <div
              className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-[#f5f5f7] p-1 dark:bg-[#2c2c2e]"
              role="group"
              aria-label="Filter by industry"
            >
              {filters.map((x) => {
                const on = f === x;
                return (
                  <button
                    key={x}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(x)}
                    className={cn(
                      "relative h-8 flex-none rounded-full px-3.5 text-[13px] font-medium focus-visible:outline-offset-[-2px]",
                      FOCUS,
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId="lf-thumb"
                        className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.04)] dark:bg-[#3a3a3c] dark:shadow-none"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span
                      className={cn(
                        "relative transition-colors",
                        on ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]",
                      )}
                    >
                      {x}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
        <motion.ul
          layout
          className="m-0 mt-6 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-4"
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 32 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((l) => (
              <motion.li
                key={l.name}
                layout={!reduce}
                {...tileFx}
                className="flex h-[76px] flex-col items-center justify-center gap-1 rounded-[16px] bg-[#f5f5f7] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
              >
                <span className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    {l.mark}
                  </svg>
                  <span className="text-[16px] font-semibold tracking-[-0.02em]">{l.name}</span>
                </span>
                <span className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">{l.industry}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
