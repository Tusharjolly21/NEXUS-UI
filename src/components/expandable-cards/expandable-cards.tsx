"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface CardItem {
  id: string;
  title: string;
  /** One line on the card. */
  description: string;
  /** Shown when the card is open. */
  fullDescription: string;
  /** Optional cover photo (any URL you host). Without it the drawn cover in `bg` is used. */
  image?: string;
  /** CSS background for the drawn cover. */
  bg?: string;
  /** Small label above the title. */
  category: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface ExpandableCardsProps {
  cards?: CardItem[];
  /** "grid" opens a card over the grid itself; "viewport" opens it in a centred dialog over the page. */
  expandInto?: "grid" | "viewport";
  /** Called with the card id when one opens, and null when it closes. */
  onOpenChange?: (id: string | null) => void;
  /** Opens each card in turn until someone touches the grid. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
  className?: string;
}

const COVERS = [
  "radial-gradient(80% 90% at 85% 10%, #ffd6a5 0%, transparent 60%), linear-gradient(150deg, #ff9f0a, #ff375f)",
  "radial-gradient(80% 90% at 15% 15%, #b8f0ff 0%, transparent 60%), linear-gradient(150deg, #64d2ff, #0a5bd6)",
  "radial-gradient(80% 90% at 80% 85%, #ffd1f5 0%, transparent 60%), linear-gradient(150deg, #bf5af2, #5e2bd6)",
  "radial-gradient(80% 90% at 20% 85%, #d8ffd2 0%, transparent 60%), linear-gradient(150deg, #30d158, #0b7a55)",
  "radial-gradient(80% 90% at 90% 50%, #fff3b0 0%, transparent 60%), linear-gradient(150deg, #ffd60a, #ff9f0a)",
  "radial-gradient(80% 90% at 10% 40%, #d6dcff 0%, transparent 60%), linear-gradient(150deg, #5e5ce6, #1d1d6b)",
];

const DEFAULT_CARDS: CardItem[] = [
  { id: "motion", category: "Design", title: "Motion system", description: "Spring presets for every surface.", fullDescription: "One set of springs for buttons, sheets and lists, tuned to feel the same at every size. Each preset respects reduced motion and comes with a short note on when to use it.", ctaText: "Explore system", ctaLink: "#" },
  { id: "particles", category: "Engineering", title: "Particle engine", description: "Thousands of points at 60 fps.", fullDescription: "A canvas renderer with a tiny physics step: gravity, wind and turbulence, all driven from one requestAnimationFrame loop and paused when the tab is hidden.", ctaText: "View docs", ctaLink: "#" },
  { id: "layout", category: "AI", title: "Adaptive layout", description: "Composition that fits the content.", fullDescription: "Layout primitives that pick a composition from the shape of your content, so a feed, a dashboard and an article each get the arrangement that reads best.", ctaText: "Try it", ctaLink: "#" },
  { id: "type", category: "Typography", title: "Fluid type", description: "A scale that breathes with the screen.", fullDescription: "A type scale built on clamp(), with optical size and tight tracking on display sizes, and comfortable line length on body copy at every width.", ctaText: "See examples", ctaLink: "#" },
  { id: "theme", category: "Theming", title: "Dark mode kit", description: "Tokens that switch themselves.", fullDescription: "Semantic colour tokens that flip with the user's preference, with contrast checked at every step and a smooth crossfade when the theme changes.", ctaText: "Read more", ctaLink: "#" },
  { id: "grid", category: "Tools", title: "Grid builder", description: "Draw a grid, export the CSS.", fullDescription: "Sketch named areas and breakpoints visually, then export clean CSS grid for Tailwind, CSS Modules or plain stylesheets.", ctaText: "Open builder", ctaLink: "#" },
];

const noop = () => () => {};
const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

function Cover({ card, index, big = false }: { card: CardItem; index: number; big?: boolean }) {
  return (
    <span className="absolute inset-0 block overflow-hidden" style={{ background: card.bg ?? COVERS[index % COVERS.length] }}>
      {card.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      ) : (
        <span aria-hidden="true">
          <span className="absolute -bottom-1/3 -right-[12%] aspect-square w-[64%] rounded-full bg-white/20" />
          <span className="absolute -bottom-[45%] right-[28%] aspect-square w-[46%] rounded-full bg-white/15" />
          <span
            className="absolute left-[7%] top-[12%] font-semibold leading-none tracking-[-0.05em] text-white/90"
            style={{ fontSize: big ? 56 : 30 }}
          >
            {card.title.slice(0, 1)}
          </span>
        </span>
      )}
    </span>
  );
}

function Close({ onClick, btnRef }: { onClick: () => void; btnRef: Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-black/35 text-white backdrop-blur outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}

/**
 * A grid of cards where picking one grows it, in one continuous spring, into
 * a full card with the long description and a call to action, while the rest
 * of the grid sinks back. Close it and it shrinks home into its slot.
 */
export function ExpandableCards({ cards = DEFAULT_CARDS, expandInto = "grid", onOpenChange, autoplay = false, enableSound = true, className = "" }: ExpandableCardsProps) {
  const play = useSound(enableSound);
  const uid = useId().replace(/:/g, "");
  const still = useReducedMotion() === true;
  const mounted = useMounted();
  const [activeId, setActiveId] = useState<string | null>(null);
  const touched = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const lastOpen = useRef<string | null>(null);
  const activeIndex = cards.findIndex((c) => c.id === activeId);
  const active = activeIndex >= 0 ? cards[activeIndex] : null;

  const spring = still ? { duration: 0 } : { type: "spring" as const, stiffness: 320, damping: 30, mass: 0.9 };
  const lid = (part: string, id: string) => `ec-${uid}-${part}-${id}`;

  const setOpen = (id: string | null) => {
    play(id ? "whoosh" : "swipe");
    setActiveId(id);
    onOpenChange?.(id);
  };

  useEffect(() => {
    if (activeId) {
      lastOpen.current = activeId;
      if (touched.current) closeRef.current?.focus({ preventScroll: true });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          play("swipe");
          setActiveId(null);
          onOpenChange?.(null);
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (lastOpen.current && touched.current) triggers.current.get(lastOpen.current)?.focus({ preventScroll: true });
  }, [activeId, onOpenChange, play]);

  useEffect(() => {
    if (expandInto !== "viewport" || !activeId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [expandInto, activeId]);

  const ids = cards.map((c) => c.id).join("\u0000");
  useEffect(() => {
    if (!autoplay) return;
    const order = ids.split("\u0000").filter(Boolean);
    let k = 0;
    let open = false;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      if (open) {
        setActiveId(null);
        k++;
      } else {
        setActiveId(order[k % order.length] ?? null);
      }
      open = !open;
    }, 2000);
    return () => clearInterval(t);
  }, [autoplay, ids]);

  const panel: ReactNode = active ? (
    <motion.div
      key={active.id}
      layoutId={lid("card", active.id)}
      transition={spring}
      role="dialog"
      aria-modal={expandInto === "viewport"}
      aria-labelledby={lid("h", active.id)}
      className={`flex flex-col overflow-hidden bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_30px_60px_-30px_rgba(0,0,0,.5)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_60px_-30px_rgba(0,0,0,.9)] ${expandInto === "viewport" ? "relative max-h-[86dvh] w-full max-w-[560px]" : "absolute inset-0 z-20"}`}
      style={{ borderRadius: 24 }}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div layoutId={lid("art", active.id)} transition={spring} className="relative h-[42%] min-h-[120px] shrink-0 overflow-hidden" style={{ borderRadius: 0 }}>
        <Cover card={active} index={activeIndex} big />
      </motion.div>
      <Close btnRef={closeRef} onClick={() => setOpen(null)} />
      <motion.div
        className="min-h-0 flex-1 overflow-y-auto p-5"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, transition: { delay: still ? 0 : 0.12, type: "spring", stiffness: 300, damping: 28 } }}
        exit={{ opacity: 0, transition: { duration: 0.08 } }}
      >
        <p className="text-[12px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]">{active.category}</p>
        <h3 id={lid("h", active.id)} className="mt-0.5 text-[24px] font-semibold leading-[1.1] tracking-[-0.03em]">
          {active.title}
        </h3>
        <p className="mt-2 text-[14px] leading-[1.55] text-[#424245] dark:text-[#a1a1a6]">{active.fullDescription}</p>
        {active.ctaText ? (
          <a
            href={active.ctaLink ?? "#"}
            className="mt-4 inline-flex h-9 items-center rounded-full bg-[#0071e3] px-4 text-[13px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
          >
            {active.ctaText}
          </a>
        ) : null}
      </motion.div>
    </motion.div>
  ) : null;

  return (
    <LayoutGroup id={`ec-${uid}`}>
      <div
        className={`@container relative w-full ${className}`}
        onPointerDown={() => {
          touched.current = true;
        }}
        onKeyDown={() => {
          touched.current = true;
        }}
      >
        <div className="grid grid-cols-1 gap-3 @[400px]:grid-cols-2 @[540px]:grid-cols-3">
          {cards.map((card, i) => {
            const dim = activeId !== null && activeId !== card.id;
            return (
              <motion.div
                key={card.id}
                animate={{ scale: dim ? 0.96 : 1, opacity: dim ? 0.45 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              >
                <motion.button
                  ref={(el) => {
                    if (el) triggers.current.set(card.id, el);
                    else triggers.current.delete(card.id);
                  }}
                  type="button"
                  layoutId={lid("card", card.id)}
                  transition={spring}
                  onClick={() => {
                    touched.current = true;
                    setOpen(card.id);
                  }}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ y: -3 }}
                  aria-haspopup="dialog"
                  aria-expanded={activeId === card.id}
                  className="flex h-[168px] w-full flex-col overflow-hidden bg-white text-left text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
                  style={{ borderRadius: 22 }}
                >
                  <motion.span layoutId={lid("art", card.id)} transition={spring} className="relative block h-[74px] w-full shrink-0 overflow-hidden">
                    <Cover card={card} index={i} />
                  </motion.span>
                  <span className="flex min-h-0 flex-1 flex-col px-3.5 pb-3 pt-2.5">
                    <span className="text-[11px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]">{card.category}</span>
                    <span className="truncate text-[15px] font-semibold leading-tight tracking-[-0.02em]">{card.title}</span>
                    <span className="mt-1 line-clamp-2 text-[12px] leading-[1.35] text-[#6e6e73] dark:text-[#a1a1a6]">{card.description}</span>
                  </span>
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {expandInto === "grid" ? <AnimatePresence>{panel}</AnimatePresence> : null}
      </div>

      {expandInto === "viewport" && mounted
        ? createPortal(
            <AnimatePresence>
              {active ? (
                <motion.div
                  key="ec-backdrop"
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(null)}
                >
                  {panel}
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </LayoutGroup>
  );
}

export default ExpandableCards;
