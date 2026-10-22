"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface ElasticTabItem {
  id: string;
  label: string;
  /** What the panel shows while this tab is selected. */
  content: ReactNode;
}

export interface ElasticTabsProps {
  /** The tabs. Defaults to a small analytics dashboard: Overview, Traffic, Reports and Alerts. */
  tabs?: ElasticTabItem[];
  /** Accessible name for the tab list. */
  label?: string;
  /** Called with the tab id whenever the selected tab changes. */
  onChange?: (id: string) => void;
  /** Steps through the tabs every 2.4s until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the card. */
  className?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

function Stat({ k, v, d }: { k: string; v: string; d: string }) {
  return (
    <div className="min-w-0 rounded-[16px] bg-[#f5f5f7] p-4 dark:bg-[#2c2c2e]">
      <div className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{k}</div>
      <div className="mt-1 truncate text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{v}</div>
      <div className="text-[12px] font-medium text-[#1a7f37] dark:text-[#30d158]">{d}</div>
    </div>
  );
}

const DEFAULT_TABS: ElasticTabItem[] = [
  {
    id: "overview",
    label: "Overview",
    content: (
      <div className="grid grid-cols-3 gap-2">
        <Stat k="Visitors" v="48.2k" d="+12%" />
        <Stat k="Signups" v="1,904" d="+8%" />
        <Stat k="Revenue" v="$31k" d="+21%" />
      </div>
    ),
  },
  {
    id: "traffic",
    label: "Traffic",
    content: (
      <div className="rounded-[16px] bg-[#f5f5f7] p-4 dark:bg-[#2c2c2e]">
        <div className="flex justify-between text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
          <span>Last 14 days</span>
          <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Peak 6.1k</span>
        </div>
        <svg viewBox="0 0 300 90" className="mt-2 block w-full overflow-visible" aria-hidden="true">
          <motion.path
            d="M0 70 C 20 66, 30 50, 50 54 S 80 72, 100 58 S 130 30, 150 36 S 180 60, 200 44 S 240 12, 260 22 S 290 30, 300 18"
            fill="none"
            className="stroke-[#0071e3] dark:stroke-[#0a84ff]"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: [0.3, 0, 0.2, 1] }}
          />
          <motion.circle
            cx="300"
            cy="18"
            r="4"
            className="fill-[#0071e3] dark:fill-[#0a84ff]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            transition={{ delay: 0.85, type: "spring", stiffness: 500, damping: 18 }}
          />
        </svg>
      </div>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    content: (
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {["Weekly summary.pdf", "Cohorts, October.csv", "Funnel breakdown.pdf"].map((f, i) => (
          <motion.li
            key={f}
            className="flex items-center justify-between gap-3 rounded-[14px] bg-[#f5f5f7] px-4 py-3 text-[14px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <span className="min-w-0 truncate">{f}</span>
            <span className="flex-none text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{["2 MB", "640 kB", "1.1 MB"][i]}</span>
          </motion.li>
        ))}
      </ul>
    ),
  },
  {
    id: "alerts",
    label: "Alerts",
    content: (
      <div className="rounded-[16px] bg-[#f5f5f7] p-4 text-[14px] leading-[1.5] text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">
        No alerts right now. We&apos;ll tell you when signups drop more than <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">20% below</span> the weekly average.
      </div>
    ),
  },
];

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
 * Tabs whose pill stretches as it travels: the edge in front leaps ahead and
 * the edge behind catches up, so the highlight moves like something elastic
 * instead of sliding. The labels under the pill invert to white exactly where
 * it covers them, the panel slides in from the side you moved toward, and the
 * frame eases to the new height.
 */
export function ElasticTabs({ tabs = DEFAULT_TABS, label = "Dashboard", onChange, autoplay = false, className = "", enableSound = true }: ElasticTabsProps) {
  const play = useSound(enableSound);
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const count = tabs.length;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const L = useMotionValue(0);
  const R = useMotionValue(0);
  const clip = useMotionTemplate`inset(0 calc(100% - ${R}px) 0 ${L}px round 999px)`;
  const W = useMotionTemplate`calc(${R}px - ${L}px)`;
  const first = useRef(true);
  const touched = useRef(false);
  const index = useRef(0);
  const onChangeRef = useRef(onChange);
  const [h, setH] = useState<number | "auto">("auto");
  const active = useDemoActive(root, autoplay && !reduce);

  const edges = (k: number): readonly [number, number] | null => {
    const b = btns.current[k];
    return b ? [b.offsetLeft, b.offsetLeft + b.offsetWidth] : null;
  };

  useEffect(() => {
    index.current = i;
    onChangeRef.current = onChange;
  });

  // The pill: the leading edge springs hard, the trailing edge lags behind.
  useLayoutEffect(() => {
    const e = edges(i);
    if (!e) return;
    const [l, r] = e;
    if (first.current) {
      L.set(l);
      R.set(r);
      first.current = false;
      return;
    }
    if (reduce) {
      L.set(l);
      R.set(r);
      return;
    }
    const forward = r > R.get();
    const lead = { type: "spring" as const, stiffness: 520, damping: 34 };
    const trail = { type: "spring" as const, stiffness: 170, damping: 22 };
    const a = animate(L, l, forward ? trail : lead);
    const b = animate(R, r, forward ? lead : trail);
    return () => {
      a.stop();
      b.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, reduce]);

  // Keep the pill on its tab when the bar resizes (font load, container width).
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    let ready = false;
    const ro = new ResizeObserver(() => {
      if (!ready) {
        ready = true;
        return;
      }
      const e = edges(index.current);
      if (!e) return;
      L.set(e[0]);
      R.set(e[1]);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The frame follows the panel's height.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const select = (k: number) => {
    if (k === index.current || k < 0 || k >= count) return;
    setDir(k > index.current ? 1 : -1);
    setI(k);
    index.current = k;
    const t = tabs[k];
    if (t) onChangeRef.current?.(t.id);
  };

  useEffect(() => {
    if (!autoplay || reduce || !active || count < 2) return;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      play.auto("tick", 0.6);
      select((index.current + 1) % count);
    }, 2400);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, active, count]);

  const go = (k: number) => {
    touched.current = true;
    if (k !== index.current && k >= 0 && k < count) play("tick", 0.6);
    select(k);
  };
  const key = (e: KeyboardEvent) => {
    let k = -1;
    if (e.key === "ArrowRight") k = (i + 1) % count;
    else if (e.key === "ArrowLeft") k = (i - 1 + count) % count;
    else if (e.key === "Home") k = 0;
    else if (e.key === "End") k = count - 1;
    if (k < 0) return;
    e.preventDefault();
    go(k);
    btns.current[k]?.focus();
  };

  const current = tabs[i] ?? tabs[0];
  if (!current) return null;
  const panelId = `${uid}-panel`;
  const tabId = (k: number) => `${uid}-tab-${k}`;
  const labelClass = "relative h-10 flex-none rounded-full px-3 text-[13px] font-medium sm:px-5 sm:text-[14px]";

  return (
    <div
      ref={root}
      className={`w-[480px] max-w-full rounded-[28px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-5 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
      onPointerDownCapture={() => {
        touched.current = true;
      }}
      onFocusCapture={() => {
        touched.current = true;
      }}
    >
      <div ref={bar} className="relative flex w-fit max-w-full overflow-x-auto rounded-full bg-[#f5f5f7] p-1 dark:bg-[#2c2c2e]" role="tablist" aria-label={label} onKeyDown={key}>
        {tabs.map((t, k) => (
          <button
            key={t.id}
            ref={(el) => {
              btns.current[k] = el;
            }}
            id={tabId(k)}
            type="button"
            role="tab"
            aria-selected={i === k}
            aria-controls={panelId}
            tabIndex={i === k ? 0 : -1}
            onClick={() => go(k)}
            className={`${labelClass} text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7] ${FOCUS}`}
          >
            {t.label}
          </button>
        ))}
        {/* the elastic pill */}
        <motion.span className="pointer-events-none absolute bottom-1 top-1 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" style={{ left: L, width: W }} aria-hidden="true" />
        {/* the same labels inverted, clipped to the pill */}
        <motion.div className="pointer-events-none absolute inset-0 flex p-1" style={{ clipPath: clip, WebkitClipPath: clip }} aria-hidden="true">
          {tabs.map((t) => (
            <span key={t.id} className={`${labelClass} inline-flex items-center text-white dark:text-[#1d1d1f]`}>
              {t.label}
            </span>
          ))}
        </motion.div>
      </div>
      <motion.div className="relative mt-4 overflow-hidden" animate={{ height: h }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 32 }}>
        <div ref={panel} id={panelId} role="tabpanel" aria-labelledby={tabId(Math.min(i, count - 1))}>
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div
              key={current.id}
              custom={dir}
              variants={{
                in: (d: number) => (reduce ? { opacity: 0 } : { x: d * 40, opacity: 0, filter: "blur(4px)" }),
                show: { x: 0, opacity: 1, filter: "blur(0px)" },
                out: (d: number) => (reduce ? { opacity: 0 } : { x: d * -40, opacity: 0, filter: "blur(4px)" }),
              }}
              initial="in"
              animate="show"
              exit="out"
              transition={{ type: "spring", stiffness: 340, damping: 32, filter: { duration: 0.2 }, opacity: { duration: 0.2 } }}
            >
              {current.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
