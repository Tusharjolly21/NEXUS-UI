"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";

export interface CollapsingRailProps {
  /** Accent colour. Defaults to Apple blue (#0071e3 light, #0a84ff dark). */
  accent?: string;
  /** Workspace name shown in the header and breadcrumb. */
  workspace?: string;
  /** Item selected on first render: a nav id ("home", "inbox", "analytics", "customers", "settings") or a project name. */
  defaultActive?: string;
  /** Runs when a nav item or project is chosen. */
  onNavigate?: (id: string) => void;
  /** Runs from the "Upgrade plan" link in the storage card. */
  onUpgrade?: () => void;
  /** Walks through items and folds the rail by itself until the visitor touches the section. */
  autoplay?: boolean;
  className?: string;
}

const NAV = [
  { id: "home", label: "Home", d: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z", badge: 0 },
  { id: "inbox", label: "Inbox", d: "M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 13h5l1 3h6l1-3h5", badge: 4 },
  { id: "analytics", label: "Analytics", d: "M4 20V10M10 20V4M16 20v-7M22 20H2", badge: 0 },
  { id: "customers", label: "Customers", d: "M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-2a4 4 0 0 0-3-3.9M16 3.1a3.5 3.5 0 0 1 0 6.8", badge: 0 },
  {
    id: "settings",
    label: "Settings",
    d: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
    badge: 0,
  },
];
const PROJECTS = [
  { n: "Website relaunch", c: "#0a84ff" },
  { n: "Mobile app", c: "#30d158" },
  { n: "Brand refresh", c: "#ff9f0a" },
];

/** Below this frame width the rail stays collapsed in the layout and expands as an overlay. */
const NARROW = 600;

type Step = { go: string } | { fold: boolean };
const DEMO: Step[] = [{ go: "inbox" }, { go: "customers" }, { fold: true }, { go: "settings" }, { go: "Mobile app" }, { fold: false }, { go: "Brand refresh" }, { go: "analytics" }];

const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const muted = "text-[#6e6e73] dark:text-[#a1a1a6]";
const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-a)]";

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="flex-none" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/**
 * App sidebar. Collapse it and it springs down to an icon rail with tooltips; the active pill
 * slides between items; projects fold open with a stagger; the page title crossfades to match
 * where you are. In a narrow frame the rail stays put and expands over the content instead.
 */
export function CollapsingRail({ accent, workspace = "Northwind", defaultActive = "analytics", onNavigate, onUpgrade, autoplay = false, className }: CollapsingRailProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reduce = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const wasNarrow = useRef(false);
  const [narrow, setNarrow] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState(defaultActive);
  const [projects, setProjects] = useState(true);
  const [tip, setTip] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const current = NAV.find((n) => n.id === active)?.label ?? PROJECTS.find((p) => p.n === active)?.n ?? "";

  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const n = el.offsetWidth < NARROW;
      if (n !== wasNarrow.current) {
        wasNarrow.current = n;
        setNarrow(n);
        setCollapsed(n);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Autoplay: step through items and fold the rail (folding is skipped in a narrow frame).
  const demo = autoplay && !touched && !reduce;
  useEffect(() => {
    if (!demo) return;
    let n = 0;
    const t = setInterval(() => {
      const step = DEMO[n % DEMO.length];
      n += 1;
      if ("go" in step) setActive(step.go);
      else if (!wasNarrow.current) setCollapsed(step.fold);
    }, 1900);
    return () => clearInterval(t);
  }, [demo]);

  const overlayOpen = narrow && !collapsed;
  const choose = (id: string) => {
    setActive(id);
    onNavigate?.(id);
    if (narrow) setCollapsed(true);
  };

  const item = (id: string, label: string, icon: ReactNode, badge = 0) => {
    const on = active === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => choose(id)}
        onPointerEnter={() => setTip(id)}
        onPointerLeave={() => setTip(null)}
        onFocus={() => setTip(id)}
        onBlur={() => setTip(null)}
        aria-current={on ? "page" : undefined}
        aria-label={collapsed ? label : undefined}
        className={`relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] font-medium ${focusRing} ${on ? ink : muted}`}
      >
        {on && (
          <motion.span
            layoutId="rail-active"
            className="absolute inset-0 rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_4px_10px_-4px_rgba(0,0,0,.15)] dark:bg-[#3a3a3c] dark:shadow-none"
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
          />
        )}
        <span className={`relative flex ${on ? "text-[var(--mk-a)]" : ""}`}>{icon}</span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span key="l" className="relative flex-1 truncate" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {badge > 0 &&
          (collapsed ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--mk-a)]" aria-hidden="true" />
          ) : (
            <span className="relative rounded-full bg-[var(--mk-a)] px-1.5 text-[11px] font-semibold text-white">
              {badge}
              <span className="sr-only"> unread</span>
            </span>
          ))}
        <AnimatePresence>
          {collapsed && tip === id && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              aria-hidden="true"
              className="pointer-events-none absolute left-[calc(100%+10px)] z-40 whitespace-nowrap rounded-lg bg-[#1d1d1f] px-2.5 py-1.5 text-[12px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  };

  return (
    <section
      className={`w-full bg-[#f5f5f7] px-4 py-[clamp(40px,6vw,56px)] [--mk-a:#0071e3] sm:px-5 dark:bg-black dark:[--mk-a:#0a84ff] ${className ?? ""}`}
      style={accent ? ({ "--mk-a": accent } as CSSProperties) : undefined}
      onPointerDown={() => setTouched(true)}
      onKeyDown={(e) => {
        setTouched(true);
        if (e.key === "Escape" && overlayOpen) setCollapsed(true);
      }}
    >
      <LayoutGroup id={`rail-${uid}`}>
        <div
          ref={frame}
          className="relative mx-auto flex h-[560px] max-w-[1040px] overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_30px_60px_-36px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
        >
          {narrow && <div className="w-[76px] flex-none" aria-hidden="true" />}
          <motion.aside
            initial={false}
            animate={{ width: collapsed ? 76 : 248 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className={`flex flex-none flex-col gap-1 border-r border-black/[.06] bg-[#f5f5f7] p-3 dark:border-[#3a3a3c] dark:bg-[#2c2c2e] ${
              narrow ? "absolute inset-y-0 left-0 z-30" : "relative"
            } ${overlayOpen ? "shadow-[12px_0_40px_-12px_rgba(0,0,0,.35)]" : ""}`}
            aria-label="Sidebar"
          >
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-[var(--mk-a)] text-[13px] font-bold text-white" aria-hidden="true">
                  {workspace.trim().charAt(0).toUpperCase() || "N"}
                </span>
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`truncate text-[15px] font-semibold ${ink}`}>
                      {workspace}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              {!collapsed && (
                <button type="button" onClick={() => setCollapsed(true)} aria-label="Collapse sidebar" className={`flex h-10 w-10 flex-none items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${muted} ${focusRing}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="3" />
                    <path d="M9 4v16M15 10l-2 2 2 2" />
                  </svg>
                </button>
              )}
            </div>
            {collapsed && (
              <button type="button" onClick={() => setCollapsed(false)} aria-label="Expand sidebar" aria-expanded={false} className={`mb-2 flex h-10 w-full items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 ${muted} ${focusRing}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <path d="M9 4v16M13 10l2 2-2 2" />
                </svg>
              </button>
            )}
            <nav className="flex flex-col gap-0.5" aria-label="Main">
              {NAV.map((n) => item(n.id, n.label, <Icon d={n.d} />, n.badge))}
            </nav>
            <div className="mt-4 flex flex-col gap-0.5">
              {!collapsed ? (
                <button
                  type="button"
                  aria-expanded={projects}
                  onClick={() => setProjects((p) => !p)}
                  className={`flex min-h-10 items-center justify-between rounded-lg px-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#86868b] dark:text-[#8e8e93] ${focusRing}`}
                >
                  Projects
                  <motion.svg animate={{ rotate: projects ? 0 : -90 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </motion.svg>
                </button>
              ) : (
                <span className="mx-auto my-2 h-px w-8 bg-black/10 dark:bg-white/15" aria-hidden="true" />
              )}
              <AnimatePresence initial={false}>
                {(projects || collapsed) && (
                  <motion.div
                    key="p"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                    className="-m-1 flex flex-col gap-0.5 overflow-hidden p-1"
                  >
                    {PROJECTS.map((p, i) => (
                      <motion.div key={p.n} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        {item(p.n, p.n, <span className="m-[5px] h-2 w-2 rounded-full" style={{ background: p.c }} />)}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  key="up"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-auto min-w-0 rounded-2xl bg-white p-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.06)]"
                >
                  <div className="flex justify-between gap-2 whitespace-nowrap text-[12px]">
                    <span className={`font-semibold ${ink}`}>Storage</span>
                    <span className={muted}>7.2 of 10 GB</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f0f0f3] dark:bg-[#3a3a3c]">
                    <motion.div className="h-full rounded-full bg-[var(--mk-a)]" initial={{ width: 0 }} animate={{ width: "72%" }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
                  </div>
                  <button type="button" onClick={() => onUpgrade?.()} className={`-mb-2 mt-1 inline-flex min-h-10 items-center rounded-md text-[12px] font-semibold text-[var(--mk-a)] ${focusRing}`}>
                    Upgrade plan
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
          <AnimatePresence>
            {overlayOpen && (
              <motion.button
                key="scrim"
                type="button"
                aria-label="Close sidebar"
                tabIndex={-1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCollapsed(true)}
                className="absolute inset-0 z-20 bg-black/20 dark:bg-black/50"
              />
            )}
          </AnimatePresence>
          <main className="flex min-w-0 flex-1 flex-col gap-5 p-5 sm:p-8">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ filter: { duration: 0.35 }, type: "spring", stiffness: 300, damping: 30 }}
                className="min-w-0"
              >
                <span className="block truncate text-[13px] text-[#86868b] dark:text-[#8e8e93]">
                  {workspace} / {current}
                </span>
                <h3 className={`m-0 mt-1 truncate text-[clamp(22px,3vw,28px)] font-semibold tracking-[-0.03em] ${ink}`}>{current}</h3>
              </motion.div>
            </AnimatePresence>
            <motion.div layout className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <motion.div
                  key={`${active}-${i}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl bg-[#f5f5f7] p-4 dark:bg-[#2c2c2e]"
                  aria-hidden="true"
                >
                  <div className="h-2 w-1/2 rounded-full bg-[#e0e0e5] dark:bg-[#48484a]" />
                  <div className="mt-3 h-2 w-3/4 rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]" />
                </motion.div>
              ))}
            </motion.div>
          </main>
        </div>
      </LayoutGroup>
    </section>
  );
}
