"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CursorCardItem {
  /** Row title, set large. */
  title: string;
  /** Short kind label on the right of the row. */
  kind: string;
  /** Year or date shown after the kind. */
  year: string;
  /** The two colours of the card's cover gradient. */
  colors: [string, string];
  /** Where the row links to. Leave unset (or "#") for a row that only drives the card. */
  href?: string;
}

export interface CursorCardProps {
  /** The rows of the list. Defaults to six invented projects. */
  items?: CursorCardItem[];
  /** Text of the call to action at the foot of the card. */
  ctaLabel?: string;
  /** Moves the card down the list by itself, row by row, until someone points at the list or focuses a row. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the wrapper. */
  className?: string;
}

export const CURSOR_CARD_ITEMS: CursorCardItem[] = [
  { title: "Orbitly", kind: "Brand and site", year: "2026", colors: ["#0a84ff", "#5e5ce6"] },
  { title: "Wayfolk", kind: "Booking app", year: "2025", colors: ["#ff9f0a", "#ff375f"] },
  { title: "Tallyford", kind: "Pricing page", year: "2025", colors: ["#30d158", "#0a84ff"] },
  { title: "Velaworks", kind: "Design system", year: "2024", colors: ["#bf5af2", "#ff375f"] },
  { title: "Quadrille", kind: "Dashboard", year: "2024", colors: ["#64d2ff", "#30d158"] },
  { title: "Relaymint", kind: "Onboarding", year: "2023", colors: ["#1d1d1f", "#5e5ce6"] },
];

const FOCUS = "focus-visible:rounded-[8px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const CARD_W = 200;

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
 * A preview card that follows the cursor around a project list. It trails a
 * little behind on a spring, leans into the direction you move, and swaps its
 * contents as you pass from row to row without disappearing in between.
 * On touch, tapping a row pins the card beside it (a second tap follows the
 * link). Focusing a row with the keyboard pins the card there too. Under
 * reduced motion the card sits exactly under the pointer and only fades.
 */
export function CursorCard({ items = CURSOR_CARD_ITEMS, ctaLabel = "View case study", autoplay = false, className }: CursorCardProps) {
  const reduce = useReducedMotion() ?? false;
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const lastPointer = useRef("mouse");
  const [hot, setHot] = useState<number | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 300, damping: 28, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 300, damping: 28, mass: 0.6 });
  const x = reduce ? mx : sx;
  const y = reduce ? my : sy;
  const vx = useVelocity(x);
  const rotate = useTransform(vx, (v) => Math.max(-12, Math.min(12, v / 90)));
  const active = useDemoActive(box, autoplay && !reduce);

  /** Keeps the card's centre far enough from the sides that it never spills out of the list. */
  const clampX = (v: number) => {
    const w = box.current?.offsetWidth ?? 0;
    const half = Math.min(CARD_W / 2, w / 2);
    return Math.max(half, Math.min(w - half, v));
  };
  const pinTo = (li: HTMLElement | null) => {
    const el = box.current;
    if (!el || !li) return;
    mx.set(clampX(el.offsetWidth * 0.62));
    my.set(li.offsetTop + li.offsetHeight / 2);
  };

  // Demo: the card visits each row in turn.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    let k = 0;
    const id = window.setInterval(() => {
      const el = box.current;
      if (touched.current || !el) return;
      const rows = el.querySelectorAll<HTMLElement>("li");
      const i = k++ % items.length;
      const r = rows[i];
      if (!r) return;
      setHot(i);
      const half = Math.min(CARD_W / 2, el.offsetWidth / 2);
      const target = Math.max(half, Math.min(el.offsetWidth - half, el.offsetWidth * (0.45 + 0.3 * Math.sin(k))));
      animate(mx, target, { duration: 0.7, ease: "easeInOut" });
      animate(my, r.offsetTop + r.offsetHeight / 2, { duration: 0.7, ease: "easeInOut" });
    }, 1100);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, active, items.length, mx, my]);

  const w = hot !== null ? items[hot] : null;
  return (
    <div
      ref={box}
      className={cn("relative w-full max-w-[620px]", className)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        touched.current = true;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(clampX(e.clientX - r.left));
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setHot(null);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHot(null);
      }}
    >
      <ul className="m-0 list-none p-0">
        {items.map((it, i) => {
          const dimmed = hot !== null && hot !== i;
          const real = !!it.href && it.href !== "#";
          return (
            <li key={it.title}>
              <a
                href={it.href ?? "#"}
                onPointerDown={(e) => {
                  lastPointer.current = e.pointerType;
                }}
                onClick={(e) => {
                  touched.current = true;
                  // A row with no destination only drives the card; with one, the first tap on touch pins the card and the second follows the link.
                  if (!real || (lastPointer.current !== "mouse" && hot !== i)) {
                    e.preventDefault();
                    pinTo(e.currentTarget.parentElement);
                    setHot(i);
                  }
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setHot(i);
                }}
                onFocus={(e) => {
                  touched.current = true;
                  pinTo(e.currentTarget.parentElement);
                  setHot(i);
                }}
                className={cn("flex items-baseline justify-between gap-4 border-b border-black/[.07] py-5 no-underline dark:border-white/[.1]", FOCUS)}
              >
                <motion.span
                  className={cn("text-[clamp(26px,5vw,40px)] font-semibold tracking-[-0.035em] transition-colors duration-200", dimmed ? "text-[#c7c7cc] dark:text-[#48484a]" : "text-[#1d1d1f] dark:text-[#f5f5f7]")}
                  animate={{ x: hot === i && !reduce ? 10 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                >
                  {it.title}
                </motion.span>
                <span className="flex-none text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                  {it.kind} &middot; {it.year}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <AnimatePresence>
        {w && (
          <motion.div
            className="pointer-events-none absolute left-0 top-0 z-10 overflow-hidden rounded-[18px] bg-white p-2 shadow-[0_24px_50px_-18px_rgba(0,0,0,.45),0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#2c2c2e] dark:shadow-[0_24px_50px_-18px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.08)]"
            style={{ width: CARD_W, x, y, rotate: reduce ? 0 : rotate, translateX: "-50%", translateY: "-50%" }}
            initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 26 }}
            aria-hidden="true"
          >
            <div className="relative h-[120px] overflow-hidden rounded-[12px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={w.title}
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(150deg, ${w.colors[0]}, ${w.colors[1]})` }}
                  initial={reduce ? { opacity: 0 } : { y: "100%" }}
                  animate={reduce ? { opacity: 1 } : { y: 0 }}
                  exit={reduce ? { opacity: 0 } : { y: "-40%", opacity: 0.4 }}
                  transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 30 }}
                >
                  <span className="absolute bottom-3 left-3 text-[22px] font-semibold tracking-[-0.03em] text-white">{w.title}</span>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between px-1.5 pb-1 pt-2 text-[12px]">
              <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{ctaLabel}</span>
              <span className="text-[#0071e3] dark:text-[#0a84ff]">&rarr;</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
