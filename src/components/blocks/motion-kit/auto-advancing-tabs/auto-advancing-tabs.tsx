"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, LayoutGroup, motion, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Props every tab visual receives. */
export interface AutoAdvancingTabVisualProps {
  /** Keeps the visual's own little loop running. Off under reduced motion. */
  live: boolean;
}

export interface AutoAdvancingTab {
  title: string;
  body: string;
  /** The picture shown on the right while this tab is active. */
  V: ComponentType<AutoAdvancingTabVisualProps>;
  /** Panel background in light mode. */
  tint: string;
  /** Panel background in dark mode. Defaults to a deep neutral. */
  tintDark?: string;
}

export interface AutoAdvancingTabsProps {
  title?: string;
  tabs?: AutoAdvancingTab[];
  /** Any CSS colour. Leave empty to use Apple blue, which brightens in dark mode. */
  accent?: string;
  /** Advances to the next tab on its own while the section is on screen. */
  autoplay?: boolean;
  /** Seconds each tab stays up before advancing. */
  duration?: number;
  className?: string;
}

const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const chipCls =
  "rounded-xl bg-white p-2.5 text-[12px] font-medium shadow-[0_0_0_1px_rgba(0,0,0,.05),0_6px_12px_-8px_rgba(0,0,0,.25)] sm:p-3 dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]";

function Kanban({ live }: AutoAdvancingTabVisualProps) {
  const group = useId();
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setMoved((m) => !m), 1800);
    return () => clearInterval(t);
  }, [live]);
  const col = (title: string, cards: ReactNode, cls?: string) => (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-2 rounded-2xl bg-white/70 p-2 sm:p-3 dark:bg-[#1c1c1e]/80", cls)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6e6e73] dark:text-[#a1a1a6]">{title}</span>
      {cards}
    </div>
  );
  const chip = (t: string, k?: string) => (
    <motion.div layout layoutId={k} transition={{ type: "spring", stiffness: 300, damping: 28 }} className={cn(chipCls, ink)}>
      {t}
    </motion.div>
  );
  return (
    <LayoutGroup id={group}>
      <div className="flex w-full gap-2 sm:gap-3">
        {col("To do", <>{chip("Write launch post")}{!moved && chip("Pricing page copy", "ft-move")}</>)}
        {col("Doing", <>{chip("Onboarding emails")}{moved && chip("Pricing page copy", "ft-move")}</>)}
        {col("Done", <>{chip("Brand refresh")}</>, "hidden sm:flex")}
      </div>
    </LayoutGroup>
  );
}

function Doc() {
  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05)] sm:p-6 dark:bg-[#2c2c2e] dark:shadow-none">
      <div className={cn("mb-4 text-[18px] font-semibold tracking-[-0.02em]", ink)}>Q4 plan</div>
      {[92, 76, 84, 58].map((w, i) => (
        <div key={i} className="relative mb-3 h-2.5 rounded-full bg-[#f0f0f3] dark:bg-[#48484a]" style={{ width: `${w}%` }}>
          {i === 1 && (
            <motion.div
              className="absolute inset-y-[-4px] left-0 rounded-md bg-[color-mix(in_srgb,var(--ft-accent)_20%,transparent)]"
              initial={{ width: 0 }}
              animate={{ width: "70%" }}
              transition={{ delay: 0.4, duration: 0.8 }}
            />
          )}
        </div>
      ))}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.1, type: "spring", stiffness: 300, damping: 22 }}
        className={cn("ml-auto mt-4 w-full rounded-2xl bg-[#f5f5f7] p-3 text-[12px] sm:w-[78%] dark:bg-[#3a3a3c]", ink)}
      >
        <b>Maya:</b> Can we pull this into October?
      </motion.div>
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function Bars() {
  const v = [42, 66, 54, 88, 72, 96];
  return (
    <div className="flex h-[220px] w-full items-end gap-2 rounded-2xl bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05)] sm:gap-3 sm:p-6 dark:bg-[#2c2c2e] dark:shadow-none">
      {v.map((h, i) => (
        <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
          <motion.div
            className={cn(
              "rounded-lg",
              i === v.length - 1 ? "bg-[var(--ft-accent)]" : "bg-[color-mix(in_srgb,var(--ft-accent)_25%,transparent)]",
            )}
            style={{ height: `${h}%`, originY: 1 }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 16, delay: i * 0.07 }}
          />
          <span className="text-center text-[11px] text-[#86868b] dark:text-[#a1a1a6]">{MONTHS[i]}</span>
        </div>
      ))}
    </div>
  );
}

const ROWS = [
  ["Billing", "Invoice paid"],
  ["Leo", "Standup moved to 10"],
  ["Maya", "Deck is ready"],
  ["Ops", "Deploy finished"],
];
const AVATAR = ["", "#ff9f0a", "#30d158", "#ff375f"];

function Inbox() {
  return (
    <div className="flex w-full flex-col gap-2">
      {ROWS.map(([a, b], i) => (
        <motion.div
          key={a}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 260, damping: 24 }}
          className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#2c2c2e] dark:shadow-none"
        >
          <span
            className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white", i === 0 && "bg-[var(--ft-accent)]")}
            style={i === 0 ? undefined : { background: AVATAR[i] }}
          >
            {a[0]}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className={cn("text-[13px] font-semibold", ink)}>{a}</span>
            <span className="truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{b}</span>
          </span>
          {i === 0 && <span className="ml-auto shrink-0 rounded-full bg-[var(--ft-accent)] px-2 py-0.5 text-[11px] font-semibold text-white">Now</span>}
        </motion.div>
      ))}
    </div>
  );
}

export const DEFAULT_AUTO_ADVANCING_TABS: AutoAdvancingTab[] = [
  { title: "Plan the work", body: "Boards that move as fast as your team. Drag a card and everyone sees it land.", V: Kanban, tint: "#e9f3ff", tintDark: "#0b1a2c" },
  { title: "Write it down", body: "Docs with comments in the margin, right next to the work they're about.", V: Doc, tint: "#fff2e3", tintDark: "#2a1d0f" },
  { title: "Track the results", body: "Charts that build themselves from the work you already do.", V: Bars, tint: "#eaf8ee", tintDark: "#0f2416" },
  { title: "Stay in the loop", body: "One inbox for every update, sorted by what needs you first.", V: Inbox, tint: "#f3ecfd", tintDark: "#1d1530" },
];

/**
 * Feature tabs that advance on their own. Each tab has a progress bar that fills while its visual
 * plays; pick a tab to jump to it. Hovering the block, or moving keyboard focus into the tabs,
 * pauses the timer.
 */
export function AutoAdvancingTabs({
  title = "One workspace, four jobs done.",
  tabs = DEFAULT_AUTO_ADVANCING_TABS,
  accent,
  autoplay = true,
  duration = 6,
  className,
}: AutoAdvancingTabsProps) {
  const reduce = useReducedMotion() ?? false;
  const advancing = autoplay && !reduce;
  const [i, setI] = useState(0);
  const progress = useMotionValue(0);
  const hovered = useRef(false);
  const focused = useRef(false);
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { amount: 0.3 });
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = tabs.length;
  const active = Math.min(i, Math.max(0, count - 1));
  const secs = Math.max(1, duration);

  useEffect(() => {
    if (!advancing) {
      progress.set(1);
      return;
    }
    progress.set(0);
    if (!seen || count < 2) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!hovered.current && !focused.current) progress.set(progress.get() + dt / secs);
      if (progress.get() >= 1) {
        setI((n) => (n + 1) % count);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, seen, progress, count, advancing, secs]);

  const select = (k: number) => {
    setI(k);
    progress.set(advancing ? 0 : 1);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next: number | null = null;
    if (e.key in keys) next = (active + keys[e.key] + count) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  if (count === 0) return null;
  const T = tabs[active];

  return (
    <section
      ref={ref}
      className={cn(
        "w-full bg-white px-5 py-16 sm:py-20 dark:bg-black",
        !accent && "[--ft-accent:#0071e3] dark:[--ft-accent:#2997ff]",
        className,
      )}
      style={accent ? ({ "--ft-accent": accent } as CSSProperties) : undefined}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hovered.current = true;
      }}
      onPointerLeave={() => {
        hovered.current = false;
      }}
    >
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
          <h2 className={cn("m-0 text-balance text-[clamp(32px,5vw,54px)] font-semibold leading-[1.04] tracking-[-0.04em]", ink)}>{title}</h2>
          <div
            className="flex flex-col"
            role="tablist"
            aria-label="Features"
            aria-orientation="vertical"
            onKeyDown={onKey}
            onFocus={(e) => {
              if (e.target instanceof HTMLElement && e.target.matches(":focus-visible")) focused.current = true;
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focused.current = false;
            }}
          >
            {tabs.map((t, k) => {
              const on = k === active;
              return (
                <button
                  key={t.title}
                  ref={(el) => {
                    tabRefs.current[k] = el;
                  }}
                  id={`${uid}-tab-${k}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={`${uid}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(k)}
                  className="group relative flex min-h-[48px] flex-col gap-1 rounded-xl py-4 pl-6 pr-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--ft-accent)]"
                >
                  <span className="absolute bottom-3 left-0 top-3 w-[3px] overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]">
                    {on && (
                      <motion.span
                        className="absolute inset-x-0 top-0 h-full origin-top rounded-full bg-[var(--ft-accent)]"
                        style={{ scaleY: progress }}
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-[19px] font-semibold tracking-[-0.02em] transition-colors sm:text-[20px]",
                      on
                        ? ink
                        : "text-[#86868b] group-hover:text-[#424245] dark:text-[#a1a1a6] dark:group-hover:text-[#d1d1d6]",
                    )}
                  >
                    {t.title}
                  </span>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span
                        key="b"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                        className="overflow-hidden text-[16px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]"
                      >
                        {t.body}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>
        <div
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${active}`}
          className="relative flex min-h-[320px] min-w-0 items-center overflow-hidden rounded-[28px] bg-[var(--ft-tint)] p-4 transition-colors duration-500 sm:min-h-[380px] sm:rounded-[32px] sm:p-10 dark:bg-[var(--ft-tint-dark)]"
          style={{ "--ft-tint": T.tint, "--ft-tint-dark": T.tintDark ?? "#1c1c1e" } as CSSProperties}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active}
              className="w-full"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96, filter: "blur(10px)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -30, scale: 0.96, filter: "blur(10px)" }}
              transition={reduce ? { duration: 0.2 } : { filter: { duration: 0.35 }, type: "spring", stiffness: 180, damping: 24 }}
            >
              <T.V live={!reduce} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
