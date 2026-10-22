"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface TravellingTooltipTool {
  id: string;
  /** Name shown in the tooltip and used as the button's accessible name. */
  label: string;
  /** Shortcut shown as a keycap in the tooltip. */
  keys: string;
  /** SVG path data for the 24 x 24 stroke icon. */
  d: string;
}

export interface TravellingTooltipProps {
  /** The toolbar buttons. Defaults to a six-button text formatting bar. */
  tools?: TravellingTooltipTool[];
  /** Accessible name of the toolbar. */
  label?: string;
  /** How long the first hover waits before the tooltip appears, in ms. After that it travels with no delay. */
  openDelay?: number;
  /** How long the tooltip stays "warm" after the pointer leaves the bar, in ms. Re-enter within this time and it appears at once. */
  warmMs?: number;
  /** Caption under the toolbar. Pass an empty string to hide it. */
  hint?: string;
  /** Called when a button is pressed. */
  onSelect?: (tool: TravellingTooltipTool) => void;
  /** Walks the tooltip along the bar by itself until someone points at or focuses the bar. Pauses off screen and never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the wrapper. */
  className?: string;
}

export const TRAVELLING_TOOLTIP_TOOLS: TravellingTooltipTool[] = [
  { id: "bold", label: "Bold", keys: "⌘B", d: "M7 5h6a3.5 3.5 0 010 7H7zM7 12h7a3.5 3.5 0 010 7H7z" },
  { id: "italic", label: "Italic", keys: "⌘I", d: "M10 5h8M6 19h8M14 5l-4 14" },
  { id: "link", label: "Add link", keys: "⌘K", d: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" },
  { id: "list", label: "Bulleted list", keys: "⌘⇧8", d: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" },
  { id: "comment", label: "Comment", keys: "⌘⌥M", d: "M4 5h16v11H9l-5 4z" },
  { id: "ai", label: "Rewrite with AI", keys: "⌘J", d: "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z" },
];

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
 * One tooltip for a whole toolbar. The first hover waits a beat, as tooltips
 * should; after that it glides from button to button with no delay, resizing
 * to each label and showing the shortcut. Leave the toolbar and it fades;
 * focus with the keyboard and it follows focus the same way. The bar is a
 * single tab stop: arrow keys, Home and End move between buttons, and
 * Escape hides the tooltip.
 */
export function TravellingTooltip({
  tools = TRAVELLING_TOOLTIP_TOOLS,
  label = "Formatting",
  openDelay = 450,
  warmMs = 600,
  hint = "Hover one button, then slide along the bar",
  onSelect,
  autoplay = false,
  className = "",
}: TravellingTooltipProps) {
  const reduce = useReducedMotion() ?? false;
  const bar = useRef<HTMLDivElement>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const [hot, setHot] = useState<number | null>(null);
  const [x, setX] = useState(0);
  const [warm, setWarm] = useState(false);
  const [tab, setTab] = useState(0);
  const wait = useRef<number | undefined>(undefined);
  const cool = useRef<number | undefined>(undefined);
  const touched = useRef(false);
  const active = useDemoActive(bar, autoplay && !reduce);

  useEffect(
    () => () => {
      window.clearTimeout(wait.current);
      window.clearTimeout(cool.current);
    },
    [],
  );

  const place = (i: number) => {
    const b = btns.current[i];
    if (b) setX(b.offsetLeft + b.offsetWidth / 2);
  };
  const show = (i: number) => {
    window.clearTimeout(cool.current);
    place(i);
    if (warm) {
      setHot(i);
      return;
    }
    window.clearTimeout(wait.current);
    wait.current = window.setTimeout(() => {
      setHot(i);
      setWarm(true);
    }, openDelay);
  };
  const hide = () => {
    window.clearTimeout(wait.current);
    setHot(null);
    cool.current = window.setTimeout(() => setWarm(false), warmMs);
  };
  const focusAt = (i: number) => {
    const n = (i + tools.length) % tools.length;
    btns.current[n]?.focus();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = btns.current.findIndex((b) => b === document.activeElement);
    if (e.key === "Escape") {
      hide();
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusAt(i + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusAt(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusAt(tools.length - 1);
    }
  };

  // Demo: walk along the bar, then rest for two beats.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      const i = k++ % (tools.length + 2);
      if (i >= tools.length) {
        setHot(null);
        return;
      }
      const b = btns.current[i];
      if (!b) return;
      setX(b.offsetLeft + b.offsetWidth / 2);
      setHot(i);
      setWarm(true);
    }, 900);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, active, tools.length]);

  const t = hot !== null ? tools[hot] : null;
  const glide = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 520, damping: 36 };
  return (
    <div className={`flex w-full flex-col items-center gap-4 pt-12 ${className}`}>
      <div
        ref={bar}
        className="relative flex items-center gap-0.5 rounded-[16px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-18px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_30px_-18px_rgba(0,0,0,.9)]"
        role="toolbar"
        aria-label={label}
        onPointerLeave={hide}
        onPointerDown={() => {
          touched.current = true;
        }}
        onPointerEnter={() => {
          touched.current = true;
        }}
        onKeyDown={onKeyDown}
      >
        {tools.map((tool, i) => (
          <button
            key={tool.id}
            ref={(el) => {
              btns.current[i] = el;
            }}
            type="button"
            tabIndex={i === tab ? 0 : -1}
            aria-label={`${tool.label} (${tool.keys})`}
            onClick={() => onSelect?.(tool)}
            onPointerEnter={() => show(i)}
            onFocus={() => {
              touched.current = true;
              window.clearTimeout(cool.current);
              setTab(i);
              place(i);
              setHot(i);
              setWarm(true);
            }}
            onBlur={(e) => {
              if (!bar.current?.contains(e.relatedTarget as Node | null)) hide();
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-[10px] transition-colors hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] ${FOCUS} ${hot === i ? "bg-[#f5f5f7] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={tool.d} />
            </svg>
          </button>
        ))}
        <AnimatePresence>
          {t && (
            <motion.div
              key="tip"
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[calc(100%+10px)] left-0 flex items-center gap-2 whitespace-nowrap rounded-[10px] bg-[#1d1d1f] px-2.5 py-1.5 text-[12.5px] font-medium text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,.5)] dark:bg-[#3a3a3c] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_8px_20px_-8px_rgba(0,0,0,.9)]"
              initial={reduce ? { opacity: 0, x: "-50%", left: x } : { opacity: 0, y: 6, scale: 0.92, x: "-50%", left: x }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%", left: x }}
              exit={reduce ? { opacity: 0, transition: { duration: 0.1 } } : { opacity: 0, y: 4, scale: 0.96, transition: { duration: 0.12 } }}
              transition={glide}
              layout="size"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={t.id}
                  className="flex items-center gap-2"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(3px)" }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(3px)" }}
                  transition={{ duration: reduce ? 0.1 : 0.15 }}
                >
                  {t.label}
                  <kbd className="rounded-[5px] bg-white/15 px-1.5 py-[1px] font-sans text-[11px] text-white/80">{t.keys}</kbd>
                </motion.span>
              </AnimatePresence>
              <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-[#1d1d1f] dark:border-t-[#3a3a3c]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {hint && <p className="m-0 text-center text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</p>}
    </div>
  );
}
