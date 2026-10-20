"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useMotionValue } from "framer-motion";
import { GlowPointerContext } from "./GlowingEffect";
import { GlowingCard, type GlowingCardProps } from "./GlowingCard";

const I = (d: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

export const DEFAULT_GLOW_CARDS: GlowingCardProps[] = [
  { title: "Interface polish", description: "Borders that answer the cursor.", accent: "#0071e3", cta: "Components", icon: I(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />) },
  { title: "Live metrics", description: "Every signal on one card.", accent: "#bf5af2", cta: "Dashboard", icon: I(<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />) },
  { title: "Control rail", description: "A tall card that keeps the key actions in reach.", accent: "#ff9f0a", cta: "Manage flow", tall: true, icon: I(<><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 6H14a4 4 0 0 1 4 4v5.5" /></>) },
  { title: "Secure by default", description: "Trust, shown plainly.", accent: "#30b65a", cta: "Policy", icon: I(<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" />) },
  { title: "Composable", description: "Mix blocks across pages.", accent: "#ff375f", cta: "Templates", icon: I(<><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /><path d="M13 7h8M7 13v8" /></>) },
];

export type GlowingCardsLayoutProps = {
  /** Five cards: two left, one tall centre, two right. */
  cards?: GlowingCardProps[];
  /** Sweeps a light across the cards until someone moves over them. */
  autoplay?: boolean;
  /** Caption above the grid. Empty string hides it. */
  hint?: string;
  className?: string;
};

/**
 * Five glowing cards in a 2-1-2 grid (stacked when narrow, using container
 * queries so it adapts to its parent rather than the window). The light
 * passes from card to card as the pointer moves across the grid.
 */
export function GlowingCardsLayout({ cards = DEFAULT_GLOW_CARDS, autoplay = false, hint = "Move across the cards.", className = "" }: GlowingCardsLayoutProps) {
  const ref = useRef<HTMLElement>(null);
  const touched = useRef(false);
  const x = useMotionValue(-1e6);
  const y = useMotionValue(-1e6);
  const pointer = useMemo(() => ({ x, y }), [x, y]);
  const [a, b, c, d, e] = cards;

  useEffect(() => {
    if (!autoplay) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      if (touched.current) return;
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const t = (now - t0) / 1000;
        // A slow figure eight that crosses every card.
        y.set(r.top + r.height * (0.5 + Math.sin(t * 1.1) * 0.42));
        x.set(r.left + r.width * (0.5 + Math.sin(t * 0.55) * 0.48));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, x, y]);

  return (
    <GlowPointerContext.Provider value={autoplay ? pointer : null}>
      <section
        ref={ref}
        className={`@container mx-auto w-full max-w-6xl ${className}`}
        onPointerMove={(ev) => {
          if (ev.pointerType === "mouse" || ev.pointerType === "pen") touched.current = true;
        }}
        onPointerDown={() => {
          touched.current = true;
        }}
      >
        {hint ? <p className="mb-3 text-center text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</p> : null}
        <div className="grid grid-cols-1 gap-3 @[480px]:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1fr)] @[480px]:grid-rows-2">
          {a ? <GlowingCard {...a} /> : null}
          {b ? <GlowingCard {...b} className={`@[480px]:col-start-1 @[480px]:row-start-2 ${b.className ?? ""}`} /> : null}
          {c ? <GlowingCard tall {...c} className={`@[480px]:col-start-2 @[480px]:row-span-2 @[480px]:row-start-1 ${c.className ?? ""}`} /> : null}
          {d ? <GlowingCard {...d} className={`@[480px]:col-start-3 @[480px]:row-start-1 ${d.className ?? ""}`} /> : null}
          {e ? <GlowingCard {...e} className={`@[480px]:col-start-3 @[480px]:row-start-2 ${e.className ?? ""}`} /> : null}
        </div>
      </section>
    </GlowPointerContext.Provider>
  );
}
