"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface MorphMenuEntry {
  title: string;
  desc: string;
  /** Tile colour behind the title. Any CSS background, a gradient works. */
  color: string;
  /** Tile colour in dark mode. Defaults to `color`. */
  colorDark?: string;
  /** Where the entry points. Left as "#" the entry is a placeholder and never navigates. */
  href?: string;
}

export interface MorphMenuFeature {
  eyebrow: string;
  title: string;
  href?: string;
}

export interface MorphMenuSection {
  /** Label on the bar. */
  label: string;
  /** Width of the panel on wide screens, in px. */
  width: number;
  /** One or two columns of entries. */
  columns?: 1 | 2;
  entries: MorphMenuEntry[];
  /** An optional dark card shown beside the entries (hidden on narrow screens). */
  feature?: MorphMenuFeature;
}

export interface MorphMenuProps {
  /** One mega-menu panel per section. Use a stable array. */
  sections?: MorphMenuSection[];
  /** One or two letters inside the logo chip. */
  mark?: string;
  /** Label of the call-to-action on the right of the bar. */
  ctaLabel?: string;
  /** Opens the menus one after another until the visitor interacts. Never runs under reduced motion; pauses off screen. */
  autoplay?: boolean;
  /** Plays a soft tap when an entry or the call-to-action is chosen. Opening a menu is silent. It follows the site-wide sound switch. */
  enableSound?: boolean;
  /** Called with the section label and entry title when an entry is chosen. */
  onSelect?: (section: string, entry: string) => void;
  /** Called when the call-to-action is pressed. */
  onCta?: () => void;
  className?: string;
}

export const DEFAULT_MORPH_MENU_SECTIONS: MorphMenuSection[] = [
  {
    label: "Product",
    width: 520,
    columns: 2,
    entries: [
      { title: "Components", desc: "Over a hundred, one file each.", color: "linear-gradient(135deg,#0a84ff,#5e5ce6)" },
      { title: "Blocks", desc: "Whole sections, ready to drop in.", color: "linear-gradient(135deg,#30d158,#0a84ff)" },
      { title: "Templates", desc: "Complete sites you can ship today.", color: "linear-gradient(135deg,#ff9f0a,#ff375f)" },
      { title: "Tune panel", desc: "Change springs live, copy the result.", color: "linear-gradient(135deg,#bf5af2,#ff375f)" },
    ],
  },
  {
    label: "Solutions",
    width: 300,
    entries: [
      { title: "For startups", desc: "Launch a site that looks funded.", color: "#eef5ff", colorDark: "#12263f" },
      { title: "For agencies", desc: "Ship client work faster.", color: "#f3ecff", colorDark: "#271a3d" },
      { title: "For product teams", desc: "Motion your design system can own.", color: "#e9f9ee", colorDark: "#0f2b1a" },
    ],
  },
  {
    label: "Resources",
    width: 440,
    entries: [
      { title: "Docs", desc: "Install and customise.", color: "#f5f5f7", colorDark: "#2c2c2e" },
      { title: "Changelog", desc: "What's new this week.", color: "#f5f5f7", colorDark: "#2c2c2e" },
    ],
    feature: { eyebrow: "Guide", title: "Motion that earns its place" },
  },
];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const SPRING = { type: "spring", stiffness: 420, damping: 32 } as const;
const MORPH = { type: "spring", stiffness: 380, damping: 34 } as const;
const INSTANT = { duration: 0 } as const;
const SURFACE =
  "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_50px_-20px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-20px_rgba(0,0,0,.9)]";

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

function Entry({ entry, onPick }: { entry: MorphMenuEntry; onPick: (e: ReactMouseEvent<HTMLAnchorElement>, entry: MorphMenuEntry) => void }) {
  return (
    <a
      href={entry.href ?? "#"}
      onClick={(e) => onPick(e, entry)}
      className={cn(
        "flex gap-3 rounded-[12px] p-2.5 no-underline hover:bg-[#f5f5f7] focus-visible:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] dark:focus-visible:bg-[#2c2c2e]",
        FOCUS,
      )}
    >
      <span
        className="mt-0.5 h-8 w-8 flex-none rounded-[9px] bg-[var(--mm-c)] dark:bg-[var(--mm-cd)]"
        style={{ "--mm-c": entry.color, "--mm-cd": entry.colorDark ?? entry.color } as CSSProperties}
        aria-hidden="true"
      />
      <span>
        <span className="block text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{entry.title}</span>
        <span className="block text-[12.5px] leading-[1.4] text-[#6e6e73] dark:text-[#a1a1a6]">{entry.desc}</span>
      </span>
    </a>
  );
}

function Body({
  section,
  onPick,
}: {
  section: MorphMenuSection;
  onPick: (e: ReactMouseEvent<HTMLAnchorElement>, entry: MorphMenuEntry) => void;
}) {
  const list = (
    <div className={cn("grid gap-1", section.columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1", section.feature && "flex-1")}>
      {section.entries.map((e) => (
        <Entry key={e.title} entry={e} onPick={onPick} />
      ))}
    </div>
  );
  return (
    <div className={cn(section.feature && "flex gap-3")} style={{ width: section.width, maxWidth: "calc(100vw - 48px)" }}>
      {list}
      {section.feature && (
        <a
          href={section.feature.href ?? "#"}
          onClick={(e) => onPick(e, { title: section.feature!.title, desc: "", color: "", href: section.feature!.href })}
          className={cn(
            "hidden w-[170px] flex-none flex-col justify-end rounded-[14px] p-3 text-white no-underline dark:ring-1 dark:ring-white/10 sm:flex",
            FOCUS,
          )}
          style={{ background: "linear-gradient(160deg,#1d1d1f,#3a3a5e)" }}
        >
          <span className="text-[11px] uppercase tracking-[0.14em] text-white/60">{section.feature.eyebrow}</span>
          <span className="mt-1 text-[14px] font-semibold leading-tight">{section.feature.title}</span>
        </a>
      )}
    </div>
  );
}

/**
 * A mega menu with one panel that reshapes itself. Move between the menu items and the panel stretches to the
 * new content's size while that content slides in from the side you moved toward; a small caret glides under
 * the active item. Hover or click a label to open, leave and it closes after a short grace period. From the
 * keyboard, Enter or the down arrow opens a menu and moves into it, the left and right arrows travel along
 * the bar, and Escape closes and returns to the label. Under reduced motion the panel simply fades.
 */
export function MorphMenu({
  sections = DEFAULT_MORPH_MENU_SECTIONS,
  mark = "N",
  ctaLabel = "Get started",
  autoplay = false,
  enableSound = true,
  onSelect,
  onCta,
  className,
}: MorphMenuProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const panelId = `mk-mm-panel-${uid}`;
  const [nav, setNav] = useState<{ i: number | null; dir: number }>({ i: null, dir: 0 });
  const [caret, setCaret] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const trig = useRef<(HTMLButtonElement | null)[]>([]);
  const closeT = useRef<number | undefined>(undefined);
  const touched = useRef(false);
  const pendingFocus = useRef(false);
  const active = useDemoActive(root, autoplay && !reduce);
  const { i, dir } = nav;

  const open = useCallback((k: number) => {
    window.clearTimeout(closeT.current);
    const b = trig.current[k];
    if (!b) return;
    setCaret(b.offsetLeft + b.offsetWidth / 2);
    setNav((p) => ({ i: k, dir: p.i === null ? 0 : k > p.i ? 1 : -1 }));
  }, []);
  const close = useCallback(() => {
    window.clearTimeout(closeT.current);
    setNav((p) => ({ ...p, i: null }));
  }, []);
  const closeSoon = () => {
    window.clearTimeout(closeT.current);
    closeT.current = window.setTimeout(close, 180);
  };

  useEffect(() => () => window.clearTimeout(closeT.current), []);

  // After a keyboard open, move focus to the first entry of the new panel.
  useEffect(() => {
    if (i === null || !pendingFocus.current) return;
    pendingFocus.current = false;
    panel.current?.querySelector<HTMLElement>(`[data-body="${i}"] a`)?.focus();
  }, [i]);

  // Escape and outside presses close the panel while it is open.
  useEffect(() => {
    if (i === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const inside = root.current?.contains(document.activeElement) ?? false;
      close();
      if (inside) trig.current[i]?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (root.current && e.target instanceof Node && !root.current.contains(e.target)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [i, close]);

  // Demo: open each menu in turn, then rest with everything closed, until the visitor touches it.
  useEffect(() => {
    if (!autoplay || reduce || !active || touched.current) return;
    const n = sections.length;
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      const s = k++ % (n + 2);
      if (s < n) open(s);
      else close();
    }, 1300);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, active, sections.length, open, close]);

  const pick = (e: ReactMouseEvent<HTMLAnchorElement>, section: string, entry: MorphMenuEntry) => {
    if ((entry.href ?? "#") === "#") e.preventDefault();
    touched.current = true;
    play("tap", 0.5);
    onSelect?.(section, entry.title);
    close();
  };

  const onTriggerKey = (e: ReactKeyboardEvent<HTMLButtonElement>, k: number) => {
    touched.current = true;
    const n = sections.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (i === k) panel.current?.querySelector<HTMLElement>(`[data-body="${k}"] a`)?.focus();
      else {
        pendingFocus.current = true;
        open(k);
      }
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = (k + (e.key === "ArrowRight" ? 1 : n - 1)) % n;
      trig.current[next]?.focus();
      if (i !== null) open(next);
    }
  };

  const off = reduce ? 0 : 1;
  const section = i !== null ? sections[i] : null;

  return (
    <div className={cn("relative flex min-h-[360px] w-full justify-center bg-[#fbfbfd] px-3 pt-4 dark:bg-black", className)}>
      <div
        ref={root}
        className="relative h-fit max-w-full"
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") closeSoon();
        }}
        onPointerEnter={() => {
          touched.current = true;
        }}
        onFocus={() => {
          touched.current = true;
        }}
        onBlur={(e) => {
          // Tabbing out of the menu closes it.
          if (e.relatedTarget instanceof Node && root.current && !root.current.contains(e.relatedTarget)) close();
        }}
      >
        <nav
          aria-label="Main"
          className="flex items-center gap-1 rounded-full bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_12px_28px_-18px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_12px_28px_-18px_rgba(0,0,0,.9)]"
        >
          <span
            className="ml-1.5 mr-2 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#1d1d1f] text-[13px] font-bold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
            aria-hidden="true"
          >
            {mark}
          </span>
          {sections.map((m, k) => (
            <button
              key={m.label}
              ref={(el) => {
                trig.current[k] = el;
              }}
              type="button"
              aria-expanded={i === k}
              aria-controls={i === k ? panelId : undefined}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") open(k);
              }}
              onClick={(e) => {
                touched.current = true;
                if (i === k) close();
                else {
                  // A click with no pointer (Enter or Space) is the keyboard: land inside the panel.
                  pendingFocus.current = e.detail === 0;
                  open(k);
                }
              }}
              onKeyDown={(e) => onTriggerKey(e, k)}
              className={cn(
                "flex h-9 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[13.5px] font-medium transition-colors sm:px-3",
                FOCUS,
                i === k
                  ? "bg-[#f5f5f7] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
                  : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]",
              )}
            >
              {m.label}
              <motion.svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                animate={{ rotate: i === k ? 180 : 0 }}
                transition={reduce ? INSTANT : undefined}
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </motion.svg>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              play("tap", 0.5);
              onCta?.();
            }}
            className={cn("ml-1 hidden h-9 rounded-full bg-[#0071e3] px-4 text-[13px] font-medium text-white sm:block", FOCUS)}
          >
            {ctaLabel}
          </button>
        </nav>
        <AnimatePresence>
          {section && (
            <motion.span
              key="caret"
              aria-hidden="true"
              className="absolute top-[calc(100%+5px)] z-20 h-3 w-3 rounded-[2px] bg-white shadow-[-1px_-1px_0_rgba(0,0,0,.07)] dark:bg-[#1c1c1e] dark:shadow-[-1px_-1px_0_rgba(255,255,255,.1)]"
              style={{ rotate: 45 }}
              initial={{ opacity: 0, left: caret - 6 }}
              animate={{ opacity: 1, left: caret - 6 }}
              exit={{ opacity: 0 }}
              transition={reduce ? INSTANT : SPRING}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {section && i !== null && (
            <motion.div
              key="panel"
              ref={panel}
              id={panelId}
              role="group"
              aria-label={section.label}
              className="absolute left-1/2 top-[calc(100%+10px)] z-10"
              style={{ x: "-50%" }}
              initial={{ opacity: 0, y: -6 * off, scale: 1 - 0.03 * off }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 * off, scale: 1 - 0.03 * off, transition: { duration: 0.15 } }}
              transition={reduce ? { duration: 0.12 } : SPRING}
              onPointerEnter={() => window.clearTimeout(closeT.current)}
            >
              <motion.div layout className={cn("overflow-hidden rounded-[18px] p-2", SURFACE)} transition={reduce ? INSTANT : MORPH}>
                <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                  <motion.div
                    key={i}
                    data-body={i}
                    custom={dir}
                    variants={{
                      in: (d: number) => ({ x: d * 60 * off, opacity: 0 }),
                      show: { x: 0, opacity: 1 },
                      out: (d: number) => ({ x: d * -60 * off, opacity: 0 }),
                    }}
                    initial="in"
                    animate="show"
                    exit="out"
                    transition={reduce ? { duration: 0.12 } : { ...MORPH, opacity: { duration: 0.15 } }}
                  >
                    <Body section={section} onPick={(e, entry) => pick(e, section.label, entry)} />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
