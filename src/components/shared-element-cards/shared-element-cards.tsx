"use client";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface StoryCard {
  id: string;
  eyebrow: string;
  title: string;
  art: string; // any CSS background
  body: string[];
}

const CARDS: StoryCard[] = [
  {
    id: "focus",
    eyebrow: "Get started",
    title: "Find your focus",
    art: "radial-gradient(120% 90% at 20% 10%,#ffd1e0 0%,rgba(255,209,224,0) 60%),radial-gradient(90% 80% at 90% 90%,#c7d7ff 0%,rgba(199,215,255,0) 60%),#f4ecff",
    body: [
      "Shared-element transitions keep people oriented. The image, title and eyebrow travel from the card into the sheet instead of cutting to a new screen.",
      "Each element carries a layoutId. Framer Motion measures both positions and animates between them with a spring.",
    ],
  },
  {
    id: "night",
    eyebrow: "Tonight",
    title: "Quiet hours",
    art: "radial-gradient(100% 80% at 80% 20%,#5e5ce6 0%,rgba(94,92,230,0) 60%),radial-gradient(90% 90% at 10% 100%,#0a84ff 0%,rgba(10,132,255,0) 55%),#1c1c3a",
    body: [
      "Close with the button, the Escape key, or by clicking outside. The sheet shrinks back into its card.",
      "Content that only exists in the open state fades in after the shared elements land, so the motion reads in two beats.",
    ],
  },
];

export interface SharedElementCardsProps {
  cards?: StoryCard[];
  /** Opens and closes the cards by itself until the user interacts. */
  autoplay?: boolean;
  /** How firmly the spring pulls the card open and shut. Higher is faster and snappier. Kept between 80 and 800. */
  stiffness?: number;
  /** How quickly the spring settles. Lower overshoots and wobbles, higher stops dead. Kept between 8 and 60. */
  damping?: number;
  /** Height of the whole stage in pixels. Kept between 280 and 460. */
  height?: number;
  /** Corner radius of the cards in pixels; the open sheet is 4px rounder. Kept between 0 and 44. */
  radius?: number;
  /** Space between the cards in pixels. Kept between 0 and 32. */
  gap?: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));

export function SharedElementCards({ cards = CARDS, autoplay = false, stiffness = 300, damping = 32, height = 340, radius = 24, gap = 12 }: SharedElementCardsProps) {
  const ns = useId();
  const [open, setOpen] = useState<string | null>(null);
  const touched = useRef(false);
  const active = cards.find((c) => c.id === open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      setOpen((o) => (o ? null : cards[k++ % cards.length].id));
    }, 2600);
    return () => clearInterval(t);
  }, [autoplay, cards]);

  const lid = (id: string, part: string) => `${ns}-${id}-${part}`;
  const spring = { type: "spring", stiffness: clamp(stiffness, 80, 800), damping: clamp(damping, 8, 60) } as const;
  const r = clamp(radius, 0, 44);

  return (
    <div
      className="relative w-full max-w-[460px]"
      style={{ height: clamp(height, 280, 460), "--sec-r": `${r}px`, "--sec-r-open": `${r + 4}px` } as CSSProperties}
      onPointerDown={() => (touched.current = true)}
    >
      <div className="grid h-full grid-cols-2" style={{ gap: clamp(gap, 0, 32) }}>
        {cards.map((c) => (
          <motion.button
            key={c.id}
            type="button"
            layoutId={lid(c.id, "card")}
            transition={spring}
            onClick={() => setOpen(c.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="relative flex flex-col overflow-hidden rounded-[var(--sec-r)] text-left shadow-[0_18px_40px_-22px_rgba(0,0,0,.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3]"
            style={{ background: c.art, visibility: open === c.id ? "hidden" : "visible" }}
            aria-label={`Open ${c.title}`}
          >
            <motion.span layoutId={lid(c.id, "text")} transition={spring} className="flex flex-col gap-1 p-5">
              <span className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${c.id === "night" ? "text-white/60" : "text-black/45"}`}>{c.eyebrow}</span>
              <span className={`text-[24px] font-bold leading-[1.1] tracking-[-0.025em] ${c.id === "night" ? "text-white" : "text-[#1d1d1f]"}`}>{c.title}</span>
            </motion.span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <>
            <motion.div
              key="scrim"
              className="absolute -inset-3 z-10 rounded-[var(--sec-r-open)] bg-white/60 backdrop-blur-md dark:bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(null)}
            />
            <motion.div
              key="sheet"
              layoutId={lid(active.id, "card")}
              transition={spring}
              role="dialog"
              aria-modal="true"
              aria-label={active.title}
              className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-[var(--sec-r-open)] bg-white shadow-[0_30px_70px_-20px_rgba(0,0,0,.45)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_70px_-20px_rgba(0,0,0,.8)]"
            >
              <div className="relative h-[150px] flex-none" style={{ background: active.art }}>
                <motion.div layoutId={lid(active.id, "text")} transition={spring} className="absolute bottom-0 left-0 flex flex-col gap-1 p-5">
                  <span className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${active.id === "night" ? "text-white/60" : "text-black/45"}`}>{active.eyebrow}</span>
                  <span className={`text-[28px] font-bold leading-[1.1] tracking-[-0.025em] ${active.id === "night" ? "text-white" : "text-[#1d1d1f]"}`}>{active.title}</span>
                </motion.div>
                <motion.button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Close"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
                  exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.1 } }}
                  whileTap={{ scale: 0.85 }}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </motion.button>
              </div>
              <motion.div
                className="flex flex-col gap-3 overflow-y-auto px-5 py-4 text-[15px] leading-[1.5] text-[#424245] dark:text-[#d2d2d7]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.35 } }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
              >
                {active.body.map((p) => (
                  <p key={p} className="m-0">{p}</p>
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
