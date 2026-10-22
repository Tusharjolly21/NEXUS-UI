"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface EmptyProjectsTemplate {
  /** Stable id. `landing`, `dashboard` and `docs` draw their own little page; any other id draws a plain page. */
  id: string;
  /** Name shown on the card and used for the new project ("My <name>"). */
  name: string;
  /** `[pastel background, accent]` for the card's header area. */
  tint: readonly [string, string];
}

export interface EmptyProjectsProps {
  /** The starter templates in the stack, left to right. Three works best. */
  templates?: EmptyProjectsTemplate[];
  /** Heading above the grid. */
  title?: string;
  /** Headline of the empty state. */
  emptyTitle?: string;
  /** Line under the headline. */
  emptyDescription?: string;
  /** Called when a template, or the blank project, is picked. Not called by the autoplay demo. */
  onCreate?: (template: EmptyProjectsTemplate) => void;
  /** Fans the stack, picks a template and starts over on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const EMPTY_PROJECTS_TEMPLATES: EmptyProjectsTemplate[] = [
  { id: "landing", name: "Landing page", tint: ["#e8f1ff", "#0a84ff"] },
  { id: "dashboard", name: "Dashboard", tint: ["#f3ecff", "#bf5af2"] },
  { id: "docs", name: "Docs site", tint: ["#e9f9ee", "#30d158"] },
];

const BLANK: EmptyProjectsTemplate = { id: "blank", name: "Untitled", tint: ["#f5f5f7", "#c7c7cc"] };
const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

const projectName = (t: EmptyProjectsTemplate) => (t.id === "blank" ? "Untitled" : `My ${t.name.toLowerCase()}`);

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

function TemplateCard({ t, big = false }: { t: EmptyProjectsTemplate; big?: boolean }) {
  const vars = { "--tl": t.tint[0], "--td": `color-mix(in srgb, ${t.tint[1]} 26%, #2c2c2e)` } as CSSProperties;
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-18px_rgba(0,0,0,.45)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_14px_30px_-18px_rgba(0,0,0,.9)]" aria-hidden="true">
      <div className="relative h-[46%] bg-[var(--tl)] p-2.5 dark:bg-[var(--td)]" style={vars}>
        <div className="flex gap-1">
          {[0, 1, 2].map((k) => (
            <span key={k} className="h-1.5 w-1.5 rounded-full bg-black/10 dark:bg-white/25" />
          ))}
        </div>
        {t.id === "landing" && (
          <>
            <span className="mx-auto mt-3 block h-2 w-[60%] rounded-full" style={{ background: t.tint[1] }} />
            <span className="mx-auto mt-1.5 block h-1.5 w-[40%] rounded-full bg-black/10 dark:bg-white/25" />
          </>
        )}
        {t.id === "dashboard" && (
          <div className="mt-2.5 flex h-[60%] items-end gap-1">
            {[40, 70, 55, 90, 65].map((h, k) => (
              <span key={k} className="flex-1 rounded-[2px]" style={{ height: `${h}%`, background: t.tint[1], opacity: 0.35 + k * 0.13 }} />
            ))}
          </div>
        )}
        {t.id === "docs" && (
          <div className="mt-2.5 flex gap-2">
            <span className="h-10 w-[28%] rounded-[4px] bg-black/[.06] dark:bg-white/15" />
            <span className="flex-1 space-y-1">
              <span className="block h-1.5 w-full rounded-full" style={{ background: t.tint[1] }} />
              <span className="block h-1.5 w-[80%] rounded-full bg-black/10 dark:bg-white/25" />
              <span className="block h-1.5 w-[65%] rounded-full bg-black/10 dark:bg-white/25" />
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between p-2.5">
        <span className="space-y-1">
          <span className="block h-1.5 w-[85%] rounded-full bg-[#ececf0] dark:bg-[#48484a]" />
          <span className="block h-1.5 w-[60%] rounded-full bg-[#ececf0] dark:bg-[#48484a]" />
        </span>
        <span className={cn("font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]", big ? "text-[14px]" : "text-[11.5px]")}>{t.name}</span>
      </div>
    </div>
  );
}

/**
 * An empty projects screen that is one click from not being empty. Three
 * starter templates sit in a loose stack; point at them (or focus one) and
 * they fan out so you can see each one. Pick one and that exact card flies
 * into the grid as your first project while the empty state steps aside.
 * "Start over" brings the stack back. With `autoplay` it demos the whole
 * thing until the first touch.
 */
export function EmptyProjects({
  templates = EMPTY_PROJECTS_TEMPLATES,
  title = "Projects",
  emptyTitle = "No projects yet",
  emptyDescription = "Pick a starting point. You can change everything later.",
  onCreate,
  autoplay = false,
  enableSound = true,
  className,
}: EmptyProjectsProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [fan, setFan] = useState(false);
  const [picked, setPicked] = useState<EmptyProjectsTemplate | null>(null);
  const [gap, setGap] = useState(118);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const againBtn = useRef<HTMLButtonElement>(null);
  const tplBtns = useRef<(HTMLButtonElement | null)[]>([]);
  const touched = useRef(false);
  const landTimer = useRef<number | undefined>(undefined);
  const refocus = useRef<"again" | "first" | null>(null);
  const active = useDemoActive(root, autoplay && !reduce);

  // Pull the fan in on narrow containers so the cards never poke out of the card.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setGap(Math.max(64, Math.min(118, (entry.contentRect.width - 112 - 24) / 2)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(landTimer.current), []);

  const pick = (t: EmptyProjectsTemplate, auto = false, byKey = false) => {
    const p = auto ? play.auto : play;
    p("tap", 0.5);
    window.clearTimeout(landTimer.current);
    landTimer.current = window.setTimeout(() => p("drop", 0.55), reduce ? 120 : 520);
    if (byKey) refocus.current = "again";
    setPicked(t);
    setFan(false);
    if (!auto) onCreate?.(t);
  };
  const startOver = (byKey: boolean) => {
    window.clearTimeout(landTimer.current);
    play("tap", 0.35);
    if (byKey) refocus.current = "first";
    setPicked(null);
  };

  // After a keyboard pick the focused button leaves the page, so hand focus to the next sensible control.
  useEffect(() => {
    const want = refocus.current;
    refocus.current = null;
    if (want === "again") againBtn.current?.focus();
    else if (want === "first") tplBtns.current[0]?.focus();
  }, [picked]);

  // The demo reads the latest handler through a ref.
  const latest = useRef({ pick, templates });
  useEffect(() => {
    latest.current = { pick, templates };
  });

  // Demo: fan the stack, pick the second template, start over.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    const at = (fn: () => void, ms: number) => ids.push(window.setTimeout(() => !touched.current && fn(), ms));
    const loop = () => {
      if (touched.current) return;
      at(() => {
        setPicked(null);
        setFan(false);
      }, 0);
      at(() => setFan(true), 900);
      at(() => {
        const { templates: list, pick: choose } = latest.current;
        const t = list[1] ?? list[0];
        if (t) choose(t, true);
      }, 2600);
      at(() => setPicked(null), 6200);
      ids.push(window.setTimeout(loop, 6800));
    };
    loop();
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [autoplay, reduce, active]);

  const n = templates.length;
  const layoutT = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 26 };

  return (
    <div
      ref={root}
      className={cn(
        "w-[540px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h3>
        <button
          type="button"
          onClick={(e) => {
            touched.current = true;
            if (templates[0]) pick(templates[0], false, e.detail === 0);
          }}
          className={cn("h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
        >
          New project
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {picked ? `Project created: ${projectName(picked)}` : ""}
      </span>
      <LayoutGroup>
        <div ref={stage} className="relative mt-5 h-[330px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {!picked ? (
              <motion.div
                key="empty"
                className="absolute inset-0 flex flex-col items-center rounded-[20px] border border-dashed border-[#d2d2d7] pt-8 dark:border-white/15"
                exit={{ opacity: 0, transition: { duration: reduce ? 0.1 : 0.2 } }}
              >
                <div
                  className="relative h-[150px] w-[300px] max-w-full"
                  onPointerEnter={() => {
                    touched.current = true;
                    setFan(true);
                  }}
                  onPointerLeave={() => setFan(false)}
                  onFocus={() => setFan(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFan(false);
                  }}
                >
                  {templates.map((t, i) => {
                    const o = i - (n - 1) / 2;
                    const side = Math.abs(o);
                    const spread = { x: o * gap, r: o * 12, y: 10 - 24 * Math.max(0, 1 - side) };
                    const rest = { x: o * 16, r: o * 7, y: 6 * Math.min(1, side) };
                    const p = fan ? spread : rest;
                    return (
                      <motion.button
                        key={t.id}
                        ref={(el) => {
                          tplBtns.current[i] = el;
                        }}
                        layoutId={`tpl-${t.id}`}
                        type="button"
                        onClick={(e) => pick(t, false, e.detail === 0)}
                        aria-label={`Start from the ${t.name} template`}
                        className={cn("absolute left-1/2 top-0 -ml-[56px] h-[136px] w-[112px] rounded-[14px]", FOCUS)}
                        style={{ zIndex: side < 0.5 ? 3 : 2 }}
                        animate={{ x: p.x, y: p.y, rotate: p.r }}
                        whileHover={fan && !reduce ? { y: p.y - 10, scale: 1.04 } : undefined}
                        transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 22 }}
                      >
                        <TemplateCard t={t} />
                      </motion.button>
                    );
                  })}
                </div>
                <h4 className="m-0 mt-5 text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{emptyTitle}</h4>
                <p className="m-0 mt-1 px-4 text-center text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{emptyDescription}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => pick(BLANK, false, e.detail === 0)}
                    className={cn("h-9 rounded-full bg-[#f5f5f7] px-4 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]", FOCUS)}
                  >
                    Blank project
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="grid" className="absolute inset-0 grid grid-cols-2 content-start gap-3 sm:grid-cols-3" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
                <motion.div layoutId={`tpl-${picked.id}`} className="h-[160px] rounded-[14px]" transition={layoutT}>
                  <TemplateCard t={{ ...picked, name: projectName(picked) }} big />
                </motion.div>
                <motion.button
                  ref={againBtn}
                  type="button"
                  onClick={(e) => {
                    touched.current = true;
                    startOver(e.detail === 0);
                  }}
                  className={cn("flex h-[160px] flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#d2d2d7] text-[13px] font-medium text-[#6e6e73] hover:bg-[#fafafa] dark:border-white/15 dark:text-[#a1a1a6] dark:hover:bg-white/5", FOCUS)}
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: reduce ? 0 : 0.35 } }}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[18px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]" aria-hidden="true">
                    +
                  </span>
                  Start over
                </motion.button>
                <motion.div
                  className="col-span-full mt-2 flex items-center gap-2 rounded-[14px] bg-[#f5f5f7] px-4 py-3 text-[13px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
                  initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: reduce ? 0 : 0.45 } }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" className="flex-none" aria-hidden="true">
                    <circle cx="12" cy="12" r="11" fill="#34c759" />
                    <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Project created. Invite your team when you&apos;re ready.
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}
