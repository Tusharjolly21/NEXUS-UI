"use client";

import * as React from "react";
import { useMotionValue, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type CarouselCard = {
  id: string;
  name: string;
  price: string;
  image: string;
};

export type CardCarousel3DProps = {
  cards?: CarouselCard[];
  /** Circle radius of the carousel cylinder in px (200–1000). */
  radius?: number;
  /** Card width in px (200–800). */
  itemWidth?: number;
  /** Card height in px (200–800). */
  itemHeight?: number;
  /** CSS perspective depth in px (500–3000). */
  perspective?: number;
  /** Enable continuous auto-rotation. */
  autoRotate?: boolean;
  /** Auto-rotation speed multiplier (0.1–5). */
  autoSpeed?: number;
  /** Scroll/drag speed multiplier (0.1–5). */
  scrollSpeed?: number;
  /** Rotation direction. */
  direction?: "cw" | "ccw";
  className?: string;
};

export const DEFAULT_CARDS: CarouselCard[] = [
  {
    id: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    price: "from $1199",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=800&fit=crop&q=80",
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    price: "from $999",
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&h=800&fit=crop&q=80",
  },
  {
    id: "iphone-16",
    name: "iPhone 16",
    price: "from $699",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=800&fit=crop&q=80",
  },
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    price: "from $899",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=800&fit=crop&q=80",
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    price: "from $499",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=800&fit=crop&q=80",
  },
];

export function CardCarousel3D({
  cards = DEFAULT_CARDS,
  radius = 380,
  itemWidth = 280,
  itemHeight = 380,
  perspective = 1000,
  autoRotate = true,
  autoSpeed = 1,
  scrollSpeed = 1,
  direction = "cw",
  className,
}: CardCarousel3DProps) {
  const n = cards.length;
  const angleStep = 360 / n;
  const rotY = useMotionValue(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const touchStartX = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastTimeRef = React.useRef<number | null>(null);

  // ── Active index for dots ──────────────────────────────────────────
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    return rotY.on("change", (v) => {
      const raw = ((-v / angleStep) % n + n) % n;
      setActiveIndex(Math.round(raw) % n);
    });
  }, [rotY, angleStep, n]);

  // ── Auto-rotate ────────────────────────────────────────────────────
  React.useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastTimeRef.current = null;
    if (!autoRotate) return;

    const sign = direction === "cw" ? 1 : -1;

    const tick = (now: number) => {
      if (lastTimeRef.current !== null) {
        const delta = now - lastTimeRef.current;
        rotY.set(rotY.get() + sign * autoSpeed * delta * 0.02);
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [autoRotate, autoSpeed, direction, rotY]);

  // ── Wheel ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sign = direction === "cw" ? 1 : -1;
      rotY.set(rotY.get() + sign * e.deltaY * scrollSpeed * 0.08);
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [direction, scrollSpeed, rotY]);

  // ── Touch ──────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.touches[0]?.clientX ?? 0) - touchStartX.current;
    const sign = direction === "cw" ? -1 : 1;
    rotY.set(rotY.get() + sign * dx * scrollSpeed * 0.4);
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  // ── Keyboard ───────────────────────────────────────────────────────
  React.useEffect(() => {
    const sign = direction === "cw" ? 1 : -1;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") rotY.set(rotY.get() + sign * angleStep);
      if (e.key === "ArrowLeft")  rotY.set(rotY.get() - sign * angleStep);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [direction, angleStep, rotY]);

  // ── Dot click ─────────────────────────────────────────────────────
  const jumpTo = (i: number) => {
    const sign = direction === "cw" ? 1 : -1;
    rotY.set(-sign * i * angleStep);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-screen w-full select-none flex-col items-center justify-center overflow-hidden bg-[#e8e8e8]",
        className,
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
    >
      {/* 3D stage */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: "100%",
          height: itemHeight + 80,
          perspective: `${perspective}px`,
          perspectiveOrigin: "50% 50%",
        }}
      >
        <motion.div
          style={{
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            rotateY: rotY,
          }}
        >
          {cards.map((card, i) => {
            const cardAngle = angleStep * i;
            return (
              <div
                key={card.id}
                onClick={() => jumpTo(i)}
                style={{
                  position: "absolute",
                  width: itemWidth,
                  height: itemHeight,
                  left: -itemWidth / 2,
                  top: -itemHeight / 2,
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                  cursor: "pointer",
                }}
              >
                <div className="flex h-full flex-col rounded-[40px] bg-white px-4 pb-5 pt-4 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
                  <div className="flex flex-1 items-center justify-center overflow-hidden rounded-[28px]">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <div className="mt-3 shrink-0">
                    <p className="text-base font-semibold text-[#1a1a1a]">{card.name}</p>
                    <p className="mt-0.5 text-sm text-gray-400">{card.price}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Progress dots */}
      <div className="mt-8 flex items-center gap-2">
        {cards.map((card, i) => (
          <button
            key={card.id}
            type="button"
            aria-label={`Go to ${card.name}`}
            onClick={() => jumpTo(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === activeIndex ? "w-6 bg-[#1a1a1a]" : "w-2 bg-gray-300",
            )}
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400">Scroll · swipe · or arrow keys</p>
    </div>
  );
}

export default CardCarousel3D;
