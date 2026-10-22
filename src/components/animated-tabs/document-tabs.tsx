"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { AnimatePresence, Reorder, motion, useReducedMotion } from "framer-motion";

export interface DocumentTab {
  id: number;
  title: string;
  /** Shown in the address bar while the tab is active. */
  url: string;
  /** Colour of the tab icon and the page header. */
  color: string;
  /** One letter shown on the icon. */
  letter: string;
}

export interface DocumentTabsProps {
  /** The tabs it starts with. Closing the last one brings these back. Defaults to Roadmap, Pricing page draft and Analytics. */
  initialTabs?: DocumentTab[];
  /** Called with the tab id when the active tab changes. */
  onActiveChange?: (id: number) => void;
  /** Opens, switches, reorders and closes tabs on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the window. */
  className?: string;
}

const START: DocumentTab[] = [
  { id: 1, title: "Roadmap", url: "nexus.app/roadmap", color: "#0a84ff", letter: "R" },
  { id: 2, title: "Pricing page draft", url: "nexus.app/pricing", color: "#bf5af2", letter: "P" },
  { id: 3, title: "Analytics", url: "nexus.app/analytics", color: "#30d158", letter: "A" },
];
const NEW_TABS = [
  { title: "Docs", url: "nexus.app/docs", color: "#ff9f0a", letter: "D" },
  { title: "Changelog", url: "nexus.app/changelog", color: "#ff375f", letter: "C" },
  { title: "Settings", url: "nexus.app/settings", color: "#5e5ce6", letter: "S" },
];
const MAX_TABS = 6;
const FIRST_NEW_ID = 10;
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

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
 * A document tab strip for editors and dashboards. Drag tabs to reorder and
 * the others slide out of the way, close one and its neighbours close the
 * gap, open a new one and it grows in from the plus. The active tab joins the
 * page below it, and the address and content follow whatever you pick.
 */
export function DocumentTabs({ initialTabs = START, onActiveChange, autoplay = false, className = "" }: DocumentTabsProps) {
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [tabs, setTabs] = useState(initialTabs);
  const [active, setActive] = useState(() => (initialTabs[1] ?? initialTabs[0])?.id ?? 0);
  const nextId = useRef(FIRST_NEW_ID);
  const touched = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const refocus = useRef<number | null>(null);
  const step = useRef(0);
  const [stripW, setStripW] = useState(420);
  const demoOn = useDemoActive(root, autoplay && !reduce);

  const tabsRef = useRef(tabs);
  const activeRef = useRef(active);
  const onActiveRef = useRef(onActiveChange);
  useEffect(() => {
    tabsRef.current = tabs;
    activeRef.current = active;
    onActiveRef.current = onActiveChange;
  });

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStripW(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Tell the parent when the active tab changes (not on mount).
  const announced = useRef(active);
  useEffect(() => {
    if (announced.current === active) return;
    announced.current = active;
    onActiveRef.current?.(active);
  }, [active]);

  // Keep keyboard focus on a tab that was just moved with the arrow keys.
  useEffect(() => {
    const id = refocus.current;
    if (id === null) return;
    refocus.current = null;
    strip.current?.querySelector<HTMLElement>(`[data-tab="${id}"]`)?.focus();
  }, [tabs]);

  const add = () => {
    if (tabsRef.current.length >= MAX_TABS) return;
    const t = NEW_TABS[nextId.current % NEW_TABS.length];
    const tab = { ...t, id: nextId.current++ };
    setTabs((x) => (x.length >= MAX_TABS ? x : [...x, tab]));
    setActive(tab.id);
  };
  const close = (id: number) => {
    const list = tabsRef.current;
    const i = list.findIndex((t) => t.id === id);
    if (i < 0) return;
    const next = list.filter((t) => t.id !== id);
    if (!next.length) {
      setTabs(initialTabs);
      setActive((initialTabs[0] ?? { id: 0 }).id);
      return;
    }
    if (id === activeRef.current) setActive(next[Math.min(i, next.length - 1)].id);
    setTabs(next);
  };
  const move = (id: number, by: number) => {
    const list = tabsRef.current;
    const i = list.findIndex((t) => t.id === id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= list.length) return;
    const a = [...list];
    [a[i], a[j]] = [a[j], a[i]];
    refocus.current = id;
    setTabs(a);
  };
  const focusTab = (id: number) => {
    setActive(id);
    strip.current?.querySelector<HTMLElement>(`[data-tab="${id}"]`)?.focus();
  };
  const onTabKey = (e: KeyboardEvent, t: DocumentTab, i: number) => {
    if (e.target !== e.currentTarget) return;
    touched.current = true;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActive(t.id);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      close(t.id);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const by = e.key === "ArrowLeft" ? -1 : 1;
      if (e.altKey) move(t.id, by);
      else {
        const n = tabsRef.current[i + by];
        if (n) focusTab(n.id);
      }
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const n = tabsRef.current[e.key === "Home" ? 0 : tabsRef.current.length - 1];
      if (n) focusTab(n.id);
    }
  };

  // Demo: open a tab, switch, reorder, close the new one, and around again.
  useEffect(() => {
    if (!autoplay || reduce || !demoOn) return;
    const script = [
      () => add(),
      () => {
        const second = tabsRef.current[1];
        if (second) setActive(second.id);
      },
      () =>
        setTabs((x) => {
          if (x.length < 2) return x;
          const a = [...x];
          [a[0], a[1]] = [a[1], a[0]];
          return a;
        }),
      () => {
        const x = tabsRef.current;
        const last = x[x.length - 1];
        if (last && last.id >= FIRST_NEW_ID) close(last.id);
      },
    ];
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      script[step.current++ % script.length]();
    }, 1600);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, demoOn]);

  const cur = tabs.find((t) => t.id === active) ?? tabs[0];
  // The active tab keeps room for its title; the rest share what's left and drop to just an icon when tight.
  const room = stripW - 52;
  const even = room / Math.max(1, tabs.length);
  const activeW = Math.min(190, Math.max(Math.min(150, room * 0.45), even));
  const otherW = tabs.length > 1 ? Math.max(32, Math.min(190, (room - activeW) / (tabs.length - 1))) : activeW;
  const hintId = `${uid}-hint`;

  return (
    <div
      ref={root}
      className={`w-[600px] max-w-full overflow-hidden rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.07),0_30px_60px_-32px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_30px_60px_-32px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <span id={hintId} className="sr-only">
        Arrow keys switch tabs. Alt with an arrow key moves the tab. Delete closes it.
      </span>
      <div ref={strip} className="flex items-end bg-[#e9e9ee] px-2 pt-2 dark:bg-black">
        <Reorder.Group as="div" axis="x" values={tabs} onReorder={setTabs} className="flex min-w-0 items-end overflow-x-clip" role="tablist" aria-label="Open documents" aria-describedby={hintId}>
          <AnimatePresence initial={false}>
            {tabs.map((t, i) => {
              const on = t.id === (cur?.id ?? -1);
              const nextOn = tabs[i + 1]?.id === cur?.id;
              const showTitle = on || otherW >= 96;
              return (
                <Reorder.Item
                  key={t.id}
                  value={t}
                  as="div"
                  id={`${uid}-tab-${t.id}`}
                  data-tab={t.id}
                  role="tab"
                  aria-selected={on}
                  aria-controls={`${uid}-page`}
                  aria-keyshortcuts="Delete"
                  tabIndex={on ? 0 : -1}
                  onKeyDown={(e) => onTabKey(e, t, i)}
                  onPointerDown={() => setActive(t.id)}
                  className="group relative flex h-10 flex-none cursor-default select-none items-center outline-none focus-visible:z-20 [&:focus-visible>span:first-child]:outline-2 [&:focus-visible>span:first-child]:-outline-offset-2 [&:focus-visible>span:first-child]:outline-[#0071e3] dark:[&:focus-visible>span:first-child]:outline-[#0a84ff]"
                  style={{ zIndex: on ? 10 : 1 }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: on ? activeW : otherW, opacity: 1 }}
                  exit={{ width: 0, opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
                  transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 420, damping: 36 }}
                  whileDrag={{ scale: 1.03, boxShadow: "0 8px 20px -8px rgba(0,0,0,.3)", borderRadius: 12 }}
                >
                  {/* tab surface; the active one flows into the toolbar with little curved feet */}
                  <span className={`absolute inset-0 rounded-t-[12px] transition-colors ${on ? "bg-white dark:bg-[#1c1c1e]" : "group-hover:bg-white/50 dark:group-hover:bg-white/10"}`} />
                  {on && (
                    <>
                      <svg className="absolute -left-[10px] bottom-0" width="10" height="10" aria-hidden="true">
                        <path d="M10 0v10H0a10 10 0 0010-10z" className="fill-white dark:fill-[#1c1c1e]" />
                      </svg>
                      <svg className="absolute -right-[10px] bottom-0" width="10" height="10" aria-hidden="true">
                        <path d="M0 0v10h10A10 10 0 010 0z" className="fill-white dark:fill-[#1c1c1e]" />
                      </svg>
                    </>
                  )}
                  {!on && !nextOn && i < tabs.length - 1 && <span className="absolute right-0 top-1/2 h-4 w-px -translate-y-1/2 bg-[#c7c7cc] dark:bg-[#48484a]" />}
                  <span className={`relative flex min-w-0 flex-1 items-center gap-2 pr-1.5 ${showTitle ? "pl-3" : "justify-center pl-1.5"}`} title={t.title}>
                    <span className="flex h-4 w-4 flex-none items-center justify-center rounded-[4px] text-[10px] font-bold text-white" style={{ background: t.color }} aria-hidden="true">
                      {t.letter}
                    </span>
                    {showTitle ? <span className={`truncate text-[13px] ${on ? "font-medium text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}>{t.title}</span> : <span className="sr-only">{t.title}</span>}
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={`Close ${t.title}`}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        touched.current = true;
                        close(t.id);
                      }}
                      className={`ml-auto h-5 w-5 flex-none items-center justify-center rounded-full text-[#6e6e73] hover:bg-black/10 dark:text-[#a1a1a6] dark:hover:bg-white/15 ${on ? "flex opacity-100" : otherW >= 96 ? "flex opacity-0 group-hover:opacity-100" : "hidden"}`}
                    >
                      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true">
                        <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
        <motion.button
          type="button"
          layout={!reduce}
          whileTap={reduce ? undefined : { scale: 0.9 }}
          onClick={() => {
            touched.current = true;
            add();
          }}
          disabled={tabs.length >= MAX_TABS}
          aria-label="New tab"
          className={`mb-1.5 ml-2 flex h-7 w-7 flex-none items-center justify-center rounded-full text-[#1d1d1f] hover:bg-black/5 disabled:opacity-30 dark:text-[#f5f5f7] dark:hover:bg-white/10 ${FOCUS}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>
      {/* toolbar and page */}
      <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2 dark:border-white/10">
        <div className="flex h-8 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-full bg-[#f5f5f7] px-3.5 text-[13px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" strokeWidth="2.6" className="flex-none stroke-[#6e6e73] dark:stroke-[#a1a1a6]" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
          <span className="relative h-[18px] min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={cur?.url} className="block truncate leading-[18px]" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.2 }}>
                {cur?.url}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </div>
      <div id={`${uid}-page`} role="tabpanel" aria-labelledby={cur ? `${uid}-tab-${cur.id}` : undefined} className="relative h-[220px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {cur && (
            <motion.div key={cur.id} className="absolute inset-0 p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[12px] text-[16px] font-bold text-white" style={{ background: cur.color }} aria-hidden="true">
                  {cur.letter}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{cur.title}</div>
                  <div className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Edited 4 minutes ago</div>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-2.5">
                {[92, 78, 85, 60].map((w, k) => (
                  <motion.span
                    key={k}
                    className={`h-3 rounded-full ${k === 0 ? "" : "bg-[#f0f0f3] dark:bg-[#2c2c2e]"}`}
                    style={{ width: `${w}%`, ...(k === 0 ? { background: `${cur.color}33` } : {}) }}
                    initial={{ scaleX: 0.6, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.05 * k, duration: 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
