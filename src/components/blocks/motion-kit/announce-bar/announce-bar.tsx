"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface AnnounceBarItem {
  /** Short label in the pill, for example "New". */
  tag: string;
  /** The message. */
  text: string;
  /** Call-to-action shown after the message on wide screens. */
  cta: string;
  /** Where it points. Left as "#" the message is a placeholder and never navigates. */
  href?: string;
}

export interface AnnounceBarProps {
  /** Messages that take turns in the bar. One message holds still with no timer. Use a stable array. */
  items?: AnnounceBarItem[];
  /** How long each message stays, in ms. */
  holdMs?: number;
  /** Name shown in the demo page header under the bar. */
  brand?: string;
  /** Heading of the demo page under the bar. */
  headline?: string;
  /** Label of the button that brings a dismissed bar back. */
  restoreLabel?: string;
  /** Plays a soft swipe when the bar is dismissed. The rotation and bringing the bar back are silent. It follows the site-wide sound switch. */
  enableSound?: boolean;
  /** Called when the bar is dismissed. */
  onDismiss?: () => void;
  /** Called with the message when its link is followed. */
  onNavigate?: (item: AnnounceBarItem) => void;
  className?: string;
}

export const DEFAULT_ANNOUNCE_ITEMS: AnnounceBarItem[] = [
  { tag: "New", text: "Blocks 2.0 is out: 40 new sections", cta: "See what's new" },
  { tag: "Live", text: "Motion workshop, Thursday 6pm CET", cta: "Save a seat" },
  { tag: "Pro", text: "Annual plans are 20% off this week", cta: "Get the deal" },
];

const SPRING = { type: "spring", stiffness: 380, damping: 36 } as const;
const INSTANT = { duration: 0 } as const;
const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useOnScreen(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setOn(shown && inView);
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
      setOn(false);
    };
  }, [ref, enabled]);
  return on;
}

/**
 * An announcement bar that can say more than one thing without shouting. Messages roll up in turn with a thin
 * timer underneath; hovering or focusing the bar pauses the roll so you can read, and it also holds still
 * while off screen or in a hidden tab. Dismissing folds the bar away while the page slides up to fill the
 * space, and a button brings it back. Under reduced motion nothing rolls by itself: the first message shows
 * with a Next button, and the bar folds without animation. The rotation is the component's resting
 * behaviour, so there is no autoplay prop.
 */
export function AnnounceBar({
  items = DEFAULT_ANNOUNCE_ITEMS,
  holdMs = 3600,
  brand = "Nexus",
  headline = "Your page starts here.",
  restoreLabel = "Bring the banner back",
  enableSound = true,
  onDismiss,
  onNavigate,
  className,
}: AnnounceBarProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(true);
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const keyboardDismiss = useRef(false);
  const visible = useOnScreen(root, true);
  const count = items.length;
  const idx = count ? i % count : 0;
  const n = items[idx];
  const rolling = open && count > 1 && !reduce;
  const paused = hover || focusIn || !visible;

  useEffect(() => {
    if (!rolling || paused) return;
    const id = window.setTimeout(() => setI((k) => (k + 1) % count), holdMs);
    return () => window.clearTimeout(id);
  }, [i, rolling, paused, count, holdMs]);

  const spring = reduce ? INSTANT : SPRING;
  const slide = reduce ? 0 : 20;

  return (
    <div ref={root} className={cn("w-full overflow-hidden bg-[#f5f5f7] dark:bg-black", className)}>
      <AnimatePresence initial={false}>
        {open && n && (
          <motion.div
            key="bar"
            className="overflow-hidden"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={spring}
          >
            <div
              className="relative flex h-12 items-center justify-center gap-3 bg-[#1d1d1f] px-12 text-[13.5px] text-white dark:bg-[#1c1c1e]"
              onPointerEnter={() => setHover(true)}
              onPointerLeave={() => setHover(false)}
              onFocus={() => setFocusIn(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusIn(false);
              }}
              role="region"
              aria-label="Announcements"
              aria-live={rolling ? "off" : "polite"}
            >
              <div className="relative h-5 min-w-0 flex-1 overflow-hidden sm:flex-none">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.a
                    key={idx}
                    href={n.href ?? "#"}
                    onClick={(e) => {
                      if ((n.href ?? "#") === "#") e.preventDefault();
                      onNavigate?.(n);
                    }}
                    className="group flex min-w-0 items-center justify-center gap-2 whitespace-nowrap leading-5 text-white no-underline outline-none focus-visible:underline focus-visible:decoration-2 focus-visible:underline-offset-4"
                    initial={{ y: slide, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -slide, opacity: 0 }}
                    transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 400, damping: 34 }}
                  >
                    <span className="flex-none rounded-full bg-white/15 px-2 text-[11px] font-semibold uppercase tracking-[0.08em]">{n.tag}</span>
                    <span className="truncate">{n.text}</span>
                    <span className="hidden flex-none items-center gap-1 font-semibold text-[#64d2ff] sm:flex">
                      {n.cta}
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                        →
                      </span>
                    </span>
                  </motion.a>
                </AnimatePresence>
              </div>
              {reduce && count > 1 && (
                <button
                  type="button"
                  onClick={() => setI((k) => (k + 1) % count)}
                  aria-label="Next announcement"
                  className="absolute right-12 flex h-8 items-center rounded-full px-3 text-[12.5px] font-medium text-white/80 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                >
                  Next
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  play("swipe", 0.5);
                  onDismiss?.();
                  // A key press (no pointer) moves focus to the restore button so keyboard users keep their place.
                  keyboardDismiss.current = e.detail === 0;
                  setFocusIn(false);
                  setHover(false);
                  setOpen(false);
                }}
                aria-label="Dismiss announcements"
                className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full text-white/70 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              {rolling && (
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10" aria-hidden="true">
                  <motion.div
                    key={`${idx}-${paused}`}
                    className="h-full origin-left bg-[#64d2ff]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: paused ? 0 : 1 }}
                    transition={{ duration: paused ? 0.2 : holdMs / 1000, ease: "linear" }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* The page underneath slides up when the bar goes. */}
      <motion.div layout transition={spring} className="px-5 pb-6 pt-4">
        <div className="flex h-12 items-center justify-between rounded-full bg-white px-4 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
          <span className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{brand}</span>
          <span className="flex gap-4 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
            <span>Product</span>
            <span>Pricing</span>
            <span className="hidden sm:inline">Docs</span>
          </span>
        </div>
        <div className="mt-6 flex flex-col items-center py-6 text-center">
          <div className="text-[clamp(26px,4.5vw,40px)] font-semibold tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7]">{headline}</div>
          <AnimatePresence>
            {!open && (
              <motion.button
                type="button"
                ref={(el) => {
                  if (el && keyboardDismiss.current) {
                    keyboardDismiss.current = false;
                    el.focus();
                  }
                }}
                onClick={() => {
                  setOpen(true);
                  setI(0);
                }}
                className={cn(
                  "mt-4 h-9 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]",
                  FOCUS,
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduce ? INSTANT : undefined}
              >
                {restoreLabel}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
