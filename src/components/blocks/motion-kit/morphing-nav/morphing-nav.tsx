"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MorphingNavLink {
  title: string;
  desc: string;
  /** SVG path data drawn in a 24x24 box. */
  icon: string;
  /** Tint for the icon tile. */
  color: string;
}

export interface MorphingNavMenu {
  label: string;
  /** Panel width in px on wide screens. */
  width: number;
  /** Panel height in px on wide screens. */
  height: number;
  /** Menus without links render as a plain link. */
  links?: MorphingNavLink[];
  feature?: { title: string; body: string };
}

export interface MorphingNavProps {
  brand?: string;
  accent?: string;
  /** Accent used in dark mode. Defaults to Apple dark blue when `accent` is left at its default. */
  accentDark?: string;
  menus?: MorphingNavMenu[];
  /** Cycles through the menus until the visitor interacts. */
  autoplay?: boolean;
  /** Called with the label of whichever link or button is chosen. Links are placeholders and never navigate. */
  onNavigate?: (label: string) => void;
  className?: string;
}

const DEFAULT_ACCENT = "#0071e3";

const MENUS: MorphingNavMenu[] = [
  {
    label: "Product", width: 560, height: 248,
    links: [
      { title: "Analytics", desc: "See what moves your numbers", icon: "M4 19V9M10 19V5M16 19v-7M22 19H2", color: "#0071e3" },
      { title: "Automations", desc: "Workflows that run themselves", icon: "M13 2L4 14h7l-1 8 9-12h-7z", color: "#ff9f0a" },
      { title: "Docs", desc: "Write, share and comment", icon: "M6 2h9l5 5v15H6zM14 2v6h6", color: "#30d158" },
      { title: "Security", desc: "SSO, audit logs, roles", icon: "M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z", color: "#bf5af2" },
    ],
    feature: { title: "New in 4.0", body: "Live dashboards that update as your data changes." },
  },
  {
    label: "Solutions", width: 420, height: 212,
    links: [
      { title: "Startups", desc: "Launch with less setup", icon: "M5 19l4-4M14 4c3 0 6 3 6 6l-7 7-6-6z", color: "#ff375f" },
      { title: "Enterprise", desc: "Scale with control", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6", color: "#0071e3" },
      { title: "Agencies", desc: "One login, every client", icon: "M17 20h5v-2a4 4 0 0 0-5-3.9M9 20H2v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2zM8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", color: "#30d158" },
    ],
  },
  {
    label: "Resources", width: 480, height: 212,
    links: [
      { title: "Guides", desc: "From setup to scale", icon: "M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z", color: "#ff9f0a" },
      { title: "Changelog", desc: "Shipped every week", icon: "M12 8v4l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", color: "#bf5af2" },
      { title: "Community", desc: "40k builders, one forum", icon: "M21 12a8 8 0 0 1-12 7l-5 1 1-4A8 8 0 1 1 21 12z", color: "#0071e3" },
    ],
  },
  { label: "Pricing", width: 0, height: 0 },
];

const spring = { type: "spring", stiffness: 380, damping: 32 } as const;
const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-accent)] dark:focus-visible:ring-[var(--mk-accent-dark)]";
const panelSurface =
  "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_30px_60px_-24px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_#3a3a3c,0_30px_60px_-24px_rgba(0,0,0,.9)]";

function Glyph({ d, color }: { d: string; color: string }) {
  return (
    <span
      className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--mk-glyph)_8%,transparent)] text-[var(--mk-glyph)] dark:bg-[color-mix(in_srgb,var(--mk-glyph)_20%,transparent)]"
      style={{ "--mk-glyph": color } as CSSProperties}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
    </span>
  );
}

function LinkBody({ l }: { l: MorphingNavLink }) {
  return (
    <>
      <Glyph d={l.icon} color={l.color} />
      <span className="flex min-w-0 flex-col">
        <span className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{l.title}</span>
        <span className="text-[12.5px] text-[#6e6e73] dark:text-[#a1a1a6]">{l.desc}</span>
      </span>
    </>
  );
}

function Panel({ m, onPick }: { m: MorphingNavMenu; onPick: (e: ReactMouseEvent, label: string) => void }) {
  const links = m.links ?? [];
  return (
    <div className="flex gap-3 p-3" style={{ width: m.width }}>
      <ul className={cn("m-0 grid flex-1 list-none gap-1 p-0", links.length > 3 ? "grid-cols-2" : "grid-cols-1")}>
        {links.map((l, i) => (
          <motion.li key={l.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
            <a
              href="#"
              onClick={(e) => onPick(e, l.title)}
              className="flex items-center gap-3 rounded-2xl p-2.5 outline-none transition-colors hover:bg-[#f5f5f7] focus-visible:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] dark:focus-visible:bg-[#2c2c2e]"
            >
              <LinkBody l={l} />
            </a>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Navigation bar with a single dropdown panel that morphs between menus.
 * Move across the items and the panel resizes, the caret slides under the
 * active item, and the content slides in from the side you came from.
 * Tap or press Enter to open a menu; below ~768px of width it collapses
 * to a menu button with an accordion sheet.
 */
export function MorphingNav({
  brand = "Lumen",
  accent = DEFAULT_ACCENT,
  accentDark,
  menus = MENUS,
  autoplay = true,
  onNavigate,
  className,
}: MorphingNavProps) {
  const [nav, setNav] = useState<{ active: number | null; dir: number }>({ active: null, dir: 0 });
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const sheetId = `mk-nav-sheet-${uid}`;
  const panelId = `mk-nav-panel-${uid}`;

  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const touched = useRef(false);
  const pointerFocus = useRef(false);
  const prevActive = useRef<number | null>(null);

  const panelX = useSpring(0, spring);
  const caretX = useSpring(0, spring);
  const caretLeft = useTransform([caretX, panelX], ([c, p]: number[]) => c - p - 6);

  const { active, dir } = nav;
  const dark = accentDark ?? (accent === DEFAULT_ACCENT ? "#0a84ff" : accent);
  const vars = { "--mk-accent": accent, "--mk-accent-dark": dark } as CSSProperties;

  const close = () => setNav((p) => ({ ...p, active: null }));
  const show = (i: number) => {
    window.clearTimeout(timer.current);
    if (!menus[i]?.links) {
      close();
      return;
    }
    setNav((p) => ({ active: i, dir: p.active === null ? 0 : i > p.active ? 1 : -1 }));
  };
  const hideSoon = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(close, 120);
  };
  const pick = (e: ReactMouseEvent, label: string) => {
    e.preventDefault();
    touched.current = true;
    onNavigate?.(label);
    close();
    setOpen(false);
  };

  // Place the panel and caret under the active item. Motion values only, no React state.
  useLayoutEffect(() => {
    const place = (instant: boolean) => {
      if (active === null) return;
      const el = items.current[active];
      const b = bar.current;
      if (!el || !b) return;
      const r = el.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      const cx = r.left + r.width / 2 - br.left;
      const w = Math.min(menus[active].width, br.width);
      const px = Math.max(0, Math.min(br.width - w, cx - w / 2));
      if (instant) {
        caretX.jump(cx);
        panelX.jump(px);
      } else {
        caretX.set(cx);
        panelX.set(px);
      }
    };
    place(prevActive.current === null);
    prevActive.current = active;
    if (active === null) return;
    const onResize = () => place(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, menus, caretX, panelX]);

  // Close on outside tap/click and on Escape.
  useEffect(() => {
    if (active === null && !open) return;
    const onDown = (e: PointerEvent) => {
      if (root.current && e.target instanceof Node && !root.current.contains(e.target)) {
        setNav((p) => ({ ...p, active: null }));
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const inside = root.current?.contains(document.activeElement) ?? false;
      setNav((p) => ({ ...p, active: null }));
      setOpen(false);
      if (inside && active !== null) items.current[active]?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!autoplay || reduce) return;
    const order = menus.map((mm, i) => (mm.links ? i : -1)).filter((i) => i >= 0);
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      const i = order[k++ % (order.length + 1)];
      if (i === undefined) setNav((p) => ({ ...p, active: null }));
      else setNav((p) => ({ active: i, dir: p.active === null ? 0 : i > p.active ? 1 : -1 }));
    }, 1500);
    return () => window.clearInterval(t);
  }, [autoplay, reduce, menus]);

  const m = active !== null ? menus[active] : null;

  return (
    <div
      ref={root}
      style={vars}
      className={cn("@container relative w-full bg-[#fbfbfd] px-4 pb-10 pt-6 dark:bg-black @3xl:pb-72", className)}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") hideSoon();
      }}
      onPointerEnter={() => {
        touched.current = true;
      }}
      onFocus={() => {
        touched.current = true;
      }}
    >
      <div
        ref={bar}
        className="relative mx-auto flex h-16 max-w-[1080px] items-center justify-between gap-2 rounded-full bg-white/80 px-3 pl-5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_12px_30px_-18px_rgba(0,0,0,.3)] backdrop-blur-xl dark:bg-[#1c1c1e]/80 dark:shadow-[0_0_0_1px_#3a3a3c,0_12px_30px_-18px_rgba(0,0,0,.8)]"
      >
        <a
          href="#"
          onClick={(e) => pick(e, brand)}
          className={cn("flex min-h-10 min-w-0 items-center gap-2 rounded-full text-[18px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]", focusRing)}
        >
          <motion.span
            className="h-6 w-6 flex-none rounded-[8px]"
            style={{ background: "conic-gradient(from 0deg, var(--mk-accent), #5ac8fa, var(--mk-accent))" }}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <span className="truncate">{brand}</span>
        </a>

        <LayoutGroup id={`mk-nav-${uid}`}>
          <nav className="hidden items-center @3xl:flex" aria-label="Main">
            {menus.map((mm, i) => (
              <button
                key={mm.label}
                ref={(el) => {
                  items.current[i] = el;
                }}
                type="button"
                aria-expanded={mm.links ? active === i : undefined}
                aria-controls={mm.links && active === i ? panelId : undefined}
                onPointerDown={() => {
                  pointerFocus.current = true;
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") show(i);
                }}
                onFocus={() => {
                  // Keyboard focus moves an open panel along; taps are handled by click.
                  if (pointerFocus.current) {
                    pointerFocus.current = false;
                    return;
                  }
                  if (active !== null) show(i);
                }}
                onClick={(e) => {
                  pointerFocus.current = false;
                  touched.current = true;
                  if (!mm.links) {
                    pick(e, mm.label);
                    return;
                  }
                  if (active === i) close();
                  else show(i);
                }}
                className={cn(
                  "relative flex h-10 items-center gap-1 rounded-full px-4 text-[14px] font-medium text-[#424245] dark:text-[#d1d1d6]",
                  focusRing,
                )}
              >
                {active === i && (
                  <motion.span
                    layoutId="morphnav-hover"
                    className="absolute inset-0 rounded-full bg-black/[.05] dark:bg-white/[.1]"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative">{mm.label}</span>
                {mm.links && (
                  <motion.svg className="relative" animate={{ rotate: active === i ? 180 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </motion.svg>
                )}
              </button>
            ))}
          </nav>
        </LayoutGroup>

        <div className="flex flex-none items-center gap-1.5 @sm:gap-2">
          <a
            href="#"
            onClick={(e) => pick(e, "Sign in")}
            className={cn("hidden h-10 items-center rounded-full px-3 text-[14px] font-medium text-[#424245] dark:text-[#d1d1d6] @md:flex", focusRing)}
          >
            Sign in
          </a>
          <motion.a
            href="#"
            onClick={(e) => pick(e, "Get started")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex h-10 items-center whitespace-nowrap rounded-full bg-[var(--mk-accent)] px-4 text-[14px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-accent)] focus-visible:ring-offset-2 dark:bg-[var(--mk-accent-dark)] dark:focus-visible:ring-offset-black @sm:px-5"
          >
            Get started
          </motion.a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={sheetId}
            onClick={() => {
              touched.current = true;
              setOpen((o) => !o);
            }}
            className={cn("flex h-10 w-10 items-center justify-center rounded-full text-[#1d1d1f] dark:text-[#f5f5f7] @3xl:hidden", focusRing)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <motion.path initial={false} animate={{ d: open ? "M6 6L18 18" : "M4 8h16" }} />
              <motion.path initial={false} animate={{ d: open ? "M6 18L18 6" : "M4 16h16" }} />
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {m && (
            <motion.div
              key="panel"
              id={panelId}
              className="absolute top-[calc(100%+12px)] z-20 hidden @3xl:block"
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={spring}
              style={{ left: 0, x: panelX, transformOrigin: "top center" }}
              onPointerEnter={() => window.clearTimeout(timer.current)}
            >
              <motion.span
                className="absolute -top-[6px] h-3 w-3 rotate-45 rounded-[2px] bg-white shadow-[-1px_-1px_0_rgba(0,0,0,.06)] dark:bg-[#1c1c1e] dark:shadow-[-1px_-1px_0_#3a3a3c]"
                style={{ left: caretLeft }}
              />
              <motion.div
                className={cn("relative overflow-hidden rounded-[22px]", panelSurface)}
                animate={{ width: m.width, height: m.height }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              >
                <AnimatePresence initial={false} custom={dir} mode="popLayout">
                  <motion.div
                    key={active}
                    custom={dir}
                    className="absolute left-0 top-0"
                    variants={{ in: (d: number) => ({ x: d * 80, opacity: 0 }), out: (d: number) => ({ x: d * -80, opacity: 0 }) }}
                    initial="in"
                    animate={{ x: 0, opacity: 1 }}
                    exit="out"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  >
                    <Panel m={m} onPick={pick} />
                    {m.feature && (
                      <div className="mx-3 mb-3 flex items-center justify-between gap-4 rounded-2xl bg-[linear-gradient(120deg,color-mix(in_srgb,var(--mk-accent)_8%,transparent),rgba(90,200,250,.12))] p-4 dark:bg-[linear-gradient(120deg,color-mix(in_srgb,var(--mk-accent-dark)_18%,transparent),rgba(90,200,250,.1))]">
                        <span className="flex flex-col">
                          <span className="text-[12px] font-semibold text-[var(--mk-accent)] dark:text-[var(--mk-accent-dark)]">{m.feature.title}</span>
                          <span className="text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{m.feature.body}</span>
                        </span>
                        <a
                          href="#"
                          onClick={(e) => pick(e, m.feature?.title ?? "Learn more")}
                          className={cn("flex-none rounded-md text-[13px] font-medium text-[var(--mk-accent)] dark:text-[var(--mk-accent-dark)]", focusRing)}
                        >
                          Learn more →
                        </a>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            id={sheetId}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={spring}
            className={cn("mx-auto mt-3 max-w-[1080px] overflow-hidden rounded-[24px] p-2 @3xl:hidden", panelSurface)}
          >
            {menus.map((mm, i) =>
              mm.links ? (
                <motion.div key={mm.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <button
                    type="button"
                    aria-expanded={expanded === i}
                    onClick={() => setExpanded((e) => (e === i ? null : i))}
                    className={cn(
                      "flex min-h-12 w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f] hover:bg-[#f5f5f7] dark:text-[#f5f5f7] dark:hover:bg-[#2c2c2e]",
                      focusRing,
                    )}
                  >
                    {mm.label}
                    <motion.span className="text-[#86868b] dark:text-[#a1a1a6]" animate={{ rotate: expanded === i ? 90 : 0 }} aria-hidden="true">›</motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded === i && (
                      <motion.ul
                        key="links"
                        className="m-0 list-none overflow-hidden p-0"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 36 }}
                      >
                        {mm.links.map((l) => (
                          <li key={l.title}>
                            <a
                              href="#"
                              onClick={(e) => pick(e, l.title)}
                              className="flex items-center gap-3 rounded-2xl px-3 py-2 outline-none hover:bg-[#f5f5f7] focus-visible:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] dark:focus-visible:bg-[#2c2c2e]"
                            >
                              <LinkBody l={l} />
                            </a>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.a
                  key={mm.label}
                  href="#"
                  onClick={(e) => pick(e, mm.label)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f] hover:bg-[#f5f5f7] dark:text-[#f5f5f7] dark:hover:bg-[#2c2c2e]",
                    focusRing,
                  )}
                >
                  {mm.label}
                  <span className="text-[#86868b] dark:text-[#a1a1a6]" aria-hidden="true">›</span>
                </motion.a>
              ),
            )}
            <div className="mt-1 border-t border-black/[.06] pt-1 dark:border-[#3a3a3c] @md:hidden">
              <a
                href="#"
                onClick={(e) => pick(e, "Sign in")}
                className={cn("flex min-h-12 items-center rounded-2xl px-4 text-[16px] font-medium text-[#424245] hover:bg-[#f5f5f7] dark:text-[#d1d1d6] dark:hover:bg-[#2c2c2e]", focusRing)}
              >
                Sign in
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
