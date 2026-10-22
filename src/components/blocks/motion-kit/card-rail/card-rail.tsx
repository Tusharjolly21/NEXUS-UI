"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface CardRailCard {
  id: string;
  /** Small caps line at the top of the card. */
  kicker: string;
  title: string;
  /** Shown in the detail panel when the card opens. */
  body: string;
  /** Gradient start and end. Keep both dark enough for white text. */
  colors: [string, string];
}

export interface CardRailProps {
  cards?: CardRailCard[];
  /** Accessible name for the rail. */
  label?: string;
  /**
   * Scrolls the rail and opens a card on a loop until the visitor touches the section. Pauses off
   * screen and in a hidden tab, and never runs under reduced motion.
   */
  autoplay?: boolean;
  /** Plays a lift when a card opens and a drop when it closes. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
}

/* Colours are tuned so white text stays above 4.5:1 on both ends of every gradient. */
export const DEFAULT_CARD_RAIL_CARDS: CardRailCard[] = [
  { id: "spring", kicker: "Motion", title: "Springs that feel right", body: "Every component ships with tuned springs. Change one number to make it heavier or snappier.", colors: ["#0a6fe0", "#5e5ce6"] },
  { id: "layout", kicker: "Layout", title: "Things travel, never jump", body: "Shared layout means a thumbnail becomes the page it opens. The eye never loses its place.", colors: ["#1a7f37", "#0a6fe0"] },
  { id: "gesture", kicker: "Gestures", title: "Drag, fling, pinch", body: "Velocity-aware gestures with rubber-banding at the edges, on mouse and touch alike.", colors: ["#b84f08", "#c4264a"] },
  { id: "a11y", kicker: "Access", title: "Respects reduced motion", body: "Big movement turns into fades when people ask for less motion. Focus rings everywhere.", colors: ["#0a7ea4", "#1a7f37"] },
  { id: "own", kicker: "Code", title: "One file, yours to edit", body: "No black-box package. Copy a component, read it top to bottom, change anything.", colors: ["#8e3cc0", "#c4264a"] },
  { id: "dark", kicker: "Themes", title: "Light and dark", body: "Every surface has a dark fill and the motion is tuned for both.", colors: ["#1d1d1f", "#5e5ce6"] },
];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const GAP = 14;

type Open = { id: string; by: "user" | "auto" };

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
 * A card rail that feels physical. Swipe, scroll or use the arrow buttons (it snaps), cards ease up to full
 * size as they reach the front, the bar underneath tracks where you are, and opening a card grows it into a
 * detail panel that shrinks back into its slot when you close it (Escape, the close button or the backdrop).
 * With `autoplay` it scrolls and opens cards by itself until you touch it. Under reduced motion the panel
 * simply appears and the rail scrolls without easing.
 */
export function CardRail({
  cards = DEFAULT_CARD_RAIL_CARDS,
  label = "Features",
  autoplay = false,
  enableSound = true,
  className,
}: CardRailProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLUListElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const returnTo = useRef<string | null>(null);
  const touched = useRef(false);
  const demoIndex = useRef(0);
  const [focus, setFocus] = useState<number[]>(() => cards.map(() => 1));
  const [open, setOpen] = useState<Open | null>(null);
  const { scrollXProgress } = useScroll({ container: rail });
  const bar = useSpring(scrollXProgress, { stiffness: 200, damping: 30 });
  const active = useDemoActive(section, autoplay && !reduce);
  const cur = open ? cards.find((c) => c.id === open.id) : undefined;
  const modal = open?.by === "user";

  // Cards ease up to full size as they reach the front of the rail.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      setFocus(
        [...el.children].map((ch) => {
          const c = ch.getBoundingClientRect();
          const d = Math.abs(c.left - r.left - 4) / c.width; // 0 when at the front
          return Math.max(0, 1 - d * 0.6);
        }),
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [cards]);

  const openCard = (id: string) => {
    touched.current = true;
    returnTo.current = id;
    setOpen({ id, by: "user" });
    play("lift", 0.5);
  };
  const closeCard = () => {
    if (!open) return;
    touched.current = true;
    setOpen(null);
    play("drop", 0.5);
  };

  // Escape closes the panel wherever focus is.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      touched.current = true;
      setOpen(null);
      play("drop", 0.5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, play]);

  // After a panel the visitor opened closes, focus goes back to its card.
  useEffect(() => {
    if (open === null && returnTo.current) {
      buttons.current.get(returnTo.current)?.focus();
      returnTo.current = null;
    }
  }, [open]);

  const by = (d: number) => {
    const el = rail.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    el.scrollBy({ left: d * ((first?.offsetWidth ?? 260) + GAP), behavior: reduce ? "auto" : "smooth" });
  };

  // Demo: bring a card to the front, open it, close it, move on to the next one.
  useEffect(() => {
    if (!autoplay || reduce || !active || cards.length === 0) return;
    const ids: number[] = [];
    let alive = true;
    const run = () => {
      if (!alive || touched.current) return;
      const idx = demoIndex.current % cards.length;
      const card = cards[idx];
      const el = rail.current;
      const first = el?.firstElementChild as HTMLElement | null;
      el?.scrollTo({ left: idx * ((first?.offsetWidth ?? 260) + GAP), behavior: "smooth" });
      ids.push(
        window.setTimeout(() => {
          if (touched.current) return;
          setOpen({ id: card.id, by: "auto" });
          play.auto("lift", 0.5);
        }, 1100),
      );
      ids.push(
        window.setTimeout(() => {
          if (touched.current) return;
          setOpen(null);
          play.auto("drop", 0.5);
        }, 3900),
      );
      ids.push(
        window.setTimeout(() => {
          demoIndex.current += 1;
          run();
        }, 5400),
      );
    };
    run();
    return () => {
      alive = false;
      ids.forEach((id) => window.clearTimeout(id));
      setOpen((o) => (o && o.by === "auto" ? null : o));
    };
  }, [autoplay, reduce, active, cards, play]);

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={section}
        aria-label={label}
        className={cn("w-full bg-white px-4 py-12 sm:px-6 sm:py-16 dark:bg-black", className)}
        onPointerDownCapture={() => {
          touched.current = true;
        }}
        onKeyDownCapture={() => {
          touched.current = true;
        }}
        onWheelCapture={() => {
          touched.current = true;
        }}
      >
        <div className="relative mx-auto w-full max-w-[1100px]">
          <LayoutGroup>
            <ul
              ref={rail}
              inert={modal ? true : undefined}
              className="m-0 flex list-none snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth px-1 pb-2 pt-1 [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
            >
              {cards.map((c, i) => (
                <li key={c.id} className="flex-none snap-start">
                  <motion.button
                    ref={(node) => {
                      if (node) buttons.current.set(c.id, node);
                      else buttons.current.delete(c.id);
                    }}
                    layoutId={`rail-${c.id}`}
                    type="button"
                    onClick={() => openCard(c.id)}
                    className={cn(
                      "relative block h-[340px] w-[260px] overflow-hidden rounded-[26px] p-5 text-left text-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]",
                      FOCUS,
                    )}
                    style={{ background: `linear-gradient(160deg, ${c.colors[0]}, ${c.colors[1]})`, borderRadius: 26 }}
                    animate={{ scale: 0.9 + (focus[i] ?? 1) * 0.1, opacity: 0.55 + (focus[i] ?? 1) * 0.45 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label={`${c.title}. Open details`}
                    aria-haspopup="dialog"
                  >
                    <motion.span layoutId={`rail-k-${c.id}`} className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-white/90">
                      {c.kicker}
                    </motion.span>
                    <motion.span layoutId={`rail-t-${c.id}`} className="mt-2 block text-[26px] font-semibold leading-[1.1] tracking-[-0.03em]">
                      {c.title}
                    </motion.span>
                    <span aria-hidden="true" className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </motion.button>
                </li>
              ))}
            </ul>

            <AnimatePresence>
              {cur && open && (
                <motion.div
                  key="scrim"
                  aria-hidden="true"
                  className="absolute inset-0 z-10 rounded-[28px] bg-white/70 backdrop-blur-sm dark:bg-black/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeCard}
                />
              )}
              {cur && open && (
                <motion.div
                  key="panel"
                  layoutId={`rail-${cur.id}`}
                  role="dialog"
                  aria-modal={modal ? true : undefined}
                  aria-label={cur.title}
                  className="absolute inset-x-2 top-1 z-20 mx-auto max-w-[520px] overflow-hidden p-6 text-white"
                  style={{ background: `linear-gradient(160deg, ${cur.colors[0]}, ${cur.colors[1]})`, borderRadius: 26, height: 340 }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                >
                  <motion.span layoutId={`rail-k-${cur.id}`} className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-white/90">
                    {cur.kicker}
                  </motion.span>
                  <motion.span layoutId={`rail-t-${cur.id}`} className="mt-2 block text-[30px] font-semibold leading-[1.1] tracking-[-0.03em]">
                    {cur.title}
                  </motion.span>
                  <motion.p
                    className="m-0 mt-4 max-w-[380px] text-[16px] leading-[1.5] text-white/90"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  >
                    {cur.body}
                  </motion.p>
                  <motion.button
                    autoFocus={modal}
                    type="button"
                    onClick={closeCard}
                    aria-label="Close"
                    className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 outline-none backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>

          <div className="mt-4 flex items-center gap-3 px-1" inert={modal ? true : undefined}>
            <div aria-hidden="true" className="h-1 flex-1 overflow-hidden rounded-full bg-[#e5e5ea] dark:bg-[#3a3a3c]">
              <motion.div className="h-full origin-left rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" style={{ scaleX: bar }} />
            </div>
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => by(d)}
                aria-label={d < 0 ? "Previous cards" : "Next cards"}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]",
                  FOCUS,
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <path d={d < 0 ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
