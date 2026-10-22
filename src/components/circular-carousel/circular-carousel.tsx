"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
  /** Tag colour. Defaults to a system accent per card. */
  accent?: string;
}

export interface CircularCarouselProps {
  items?: CarouselItem[];
  /** Controlled active card. */
  activeIndex?: number;
  /** Called with the new active index. */
  onActiveChange?: (index: number) => void;
  /** Steps to the next card every `autoPlayInterval` ms until someone touches it. */
  autoplay?: boolean;
  /** @deprecated Same as `autoplay`. */
  autoPlay?: boolean;
  /** Time between autoplay steps, in ms. */
  autoPlayInterval?: number;
  /** Hint under the controls. Empty string hides it. */
  hint?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
  className?: string;
}

const DEFAULT_ITEMS: CarouselItem[] = [
  { id: "plan", tag: "Plan", title: "Shape the brief", description: "Goals, audience and the one thing to get right." },
  { id: "sketch", tag: "Sketch", title: "Rough it out", description: "Fast frames to find the flow before the polish." },
  { id: "build", tag: "Build", title: "Make it real", description: "Components, data and motion wired together." },
  { id: "test", tag: "Test", title: "Watch people use it", description: "Five sessions find most of the rough edges." },
  { id: "ship", tag: "Ship", title: "Put it out", description: "Release, measure and write down what you learned." },
  { id: "learn", tag: "Learn", title: "Loop back", description: "Feed what you saw into the next brief." },
];

/** Read the clock from event handlers only. */
const clock = () => performance.now();
const ACCENTS = ["#0071e3", "#bf5af2", "#ff9f0a", "#30b65a", "#ff375f", "#5e5ce6"];
const CW = 164;
const CH = 104;
const R = 300;
const STEP = 27;
/** Rounded so server and browser print identical styles. */
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const wrap = (o: number, n: number) => {
  const h = n / 2;
  return ((((o + h) % n) + n) % n) - h;
};

function WheelCard({
  item,
  index,
  n,
  pos,
  sway,
  onPick,
}: {
  item: CarouselItem;
  index: number;
  n: number;
  pos: MotionValue<number>;
  sway: MotionValue<number>;
  onPick: () => void;
}) {
  const off = useTransform(pos, (p) => wrap(index - p, n));
  const theta = useTransform(off, (o) => o * STEP);
  const x = useTransform(theta, (t) => r3(R * Math.sin((t * Math.PI) / 180)));
  const y = useTransform(theta, (t) => r3(R * (1 - Math.cos((t * Math.PI) / 180))));
  // Cards hang off the wheel: they swing with its momentum, then settle (follow-through).
  const rotate = useTransform([theta, sway, off], ([t, s, o]) => r3((t as number) + (s as number) * (1 - Math.min(1, Math.abs(o as number)) * 0.4)));
  const scale = useTransform(off, (o) => r3(1 - Math.min(2.5, Math.abs(o)) * 0.07));
  const opacity = useTransform(off, (o) => r3(Math.max(0, 1 - Math.max(0, Math.abs(o) - 1.2) * 1.1)));
  const zIndex = useTransform(off, (o) => 10 - Math.round(Math.abs(o) * 2));
  const ring = useTransform(off, (o) => Math.max(0, 1 - Math.abs(o) * 2));
  const accent = item.accent ?? ACCENTS[index % ACCENTS.length];

  return (
    <motion.div className="absolute left-1/2 top-0" style={{ width: CW, height: CH, marginLeft: -CW / 2, x, y, rotate, scale, opacity, zIndex }}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onPick}
        className="relative flex h-full w-full flex-col justify-between rounded-[20px] bg-white p-3.5 text-left text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_18px_34px_-22px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_18px_34px_-22px_rgba(0,0,0,.9)]"
      >
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-[20px]"
          style={{ opacity: ring, boxShadow: `0 0 0 2px ${accent}` }}
        />
        {item.tag ? (
          <span className="self-start rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: `${accent}1a`, color: accent }}>
            {item.tag}
          </span>
        ) : (
          <span />
        )}
        <span className="block">
          <span className="block truncate text-[14px] font-semibold leading-tight tracking-[-0.02em]">{item.title}</span>
          <span className="mt-0.5 line-clamp-2 block text-[11px] leading-[1.35] text-[#6e6e73] dark:text-[#a1a1a6]">{item.description}</span>
        </span>
      </button>
    </motion.div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/**
 * Cards hung round the rim of a wheel. Drag or fling the wheel and it coasts
 * to the nearest card; the cards swing on their pins as it turns and settle
 * when it stops, and the counter in the middle rolls to the new number.
 */
export function CircularCarousel({
  items = DEFAULT_ITEMS,
  activeIndex: controlled,
  onActiveChange,
  autoplay,
  autoPlay,
  autoPlayInterval = 2600,
  hint = "Drag the wheel, or use the arrow keys.",
  enableSound = true,
  className = "",
}: CircularCarouselProps) {
  const play = useSound(enableSound);
  // When the visitor last moved the wheel. Autoplay and a controlled `activeIndex` never set it, so they stay silent.
  const userAt = useRef(-Infinity);
  const lastTick = useRef(0);
  const n = Math.max(1, items.length);
  const still = useReducedMotion() === true;
  const pos = useMotionValue(controlled ?? 0);
  const vel = useVelocity(pos);
  const sway = useSpring(
    useTransform(vel, (v) => (still ? 0 : Math.max(-22, Math.min(22, v * -7)))),
    { stiffness: 120, damping: 7, mass: 0.6 },
  );
  const [active, setActive] = useState(((controlled ?? 0) % n + n) % n);
  const [dir, setDir] = useState(1);
  const run = useRef<AnimationPlaybackControls | undefined>(undefined);
  const touched = useRef(false);
  const from = useRef(0);
  const reported = useRef(active);

  const shown = useRef(active);
  useMotionValueEvent(pos, "change", (p) => {
    const i = ((Math.round(p) % n) + n) % n;
    if (i === shown.current) return;
    setDir(wrap(i - shown.current, n) >= 0 ? 1 : -1);
    shown.current = i;
    setActive(i);
    const now = performance.now();
    if (now - userAt.current < 1600 && now - lastTick.current > 40) {
      lastTick.current = now;
      play("tick", 0.4);
    }
  });

  const settle = (target: number, velocity = 0) => {
    userAt.current = clock();
    run.current?.stop();
    run.current = animate(pos, target, still ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 18, velocity });
    const i = ((Math.round(target) % n) + n) % n;
    if (i !== reported.current) {
      reported.current = i;
      onActiveChange?.(i);
    }
  };
  const goTo = (i: number) => {
    const p = pos.get();
    settle(Math.round(p + wrap(i - p, n)));
  };
  const step = (d: number) => settle(Math.round(pos.get()) + d);

  // Controlled mode: follow the prop the short way round.
  useEffect(() => {
    if (controlled === undefined) return;
    const p = pos.get();
    const target = Math.round(p + wrap(controlled - p, n));
    if (target === Math.round(p)) return;
    reported.current = ((controlled % n) + n) % n;
    run.current?.stop();
    run.current = animate(pos, target, { type: "spring", stiffness: 150, damping: 18 });
  }, [controlled, n, pos]);

  useEffect(() => () => run.current?.stop(), []);

  const demo = autoplay ?? autoPlay ?? false;
  useEffect(() => {
    if (!demo) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      run.current?.stop();
      run.current = animate(pos, Math.round(pos.get()) + 1, { type: "spring", stiffness: 110, damping: 14 });
    }, Math.max(1000, autoPlayInterval));
    return () => clearInterval(t);
  }, [demo, autoPlayInterval, pos]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "Home") goTo(0);
    else if (e.key === "End") goTo(n - 1);
    else return;
    e.preventDefault();
    touched.current = true;
  };

  const item = items[active];
  const num = String(active + 1).padStart(2, "0");

  return (
    <div
      className={`flex w-full max-w-full flex-col items-center gap-3 overflow-hidden ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <motion.div
        role="region"
        aria-roledescription="carousel"
        aria-label="Cards"
        tabIndex={0}
        onKeyDown={onKey}
        onPanStart={() => {
          userAt.current = clock();
          run.current?.stop();
          from.current = pos.get();
        }}
        onPan={(_, info) => {
          userAt.current = clock();
          pos.set(from.current - info.offset.x / 120);
        }}
        onPanEnd={(_, info) => {
          userAt.current = clock();
          const at = Math.round(pos.get());
          const land = (v: number) => Math.round(Math.max(at - 3, Math.min(at + 3, v)));
          run.current = animate(pos, [pos.get()], {
            type: "inertia",
            velocity: -info.velocity.x / 120,
            power: 0.25,
            timeConstant: 240,
            modifyTarget: land,
          });
          const i = ((land(pos.get() - (info.velocity.x / 120) * 0.25) % n) + n) % n;
          if (i !== reported.current) {
            reported.current = i;
            onActiveChange?.(i);
          }
        }}
        className="relative h-[214px] w-full max-w-[540px] cursor-grab touch-pan-y select-none rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:focus-visible:ring-[#0a84ff]"
      >
        <div className="absolute inset-x-0 top-3">
          {items.map((it, i) => (
            <WheelCard key={it.id} item={it} index={i} n={n} pos={pos} sway={sway} onPick={() => goTo(i)} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center" aria-live="polite">
          <span className="flex items-baseline gap-1.5 tabular-nums">
            <span className="relative inline-flex h-[40px] overflow-hidden text-[38px] font-semibold leading-[40px] tracking-[-0.05em] text-[#1d1d1f] dark:text-[#f5f5f7]">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.span
                  key={num}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ y: d * 30, opacity: 0 }),
                    center: { y: 0, opacity: 1 },
                    exit: (d: number) => ({ y: d * -30, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                >
                  {num}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">/ {String(n).padStart(2, "0")}</span>
          </span>
          <span className="sr-only">{item ? `${item.title}. ${item.description}` : ""}</span>
        </div>
      </motion.div>

      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            touched.current = true;
            step(-1);
          }}
          aria-label="Previous card"
          className="grid size-9 place-items-center rounded-full bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
        >
          <Chevron dir="left" />
        </motion.button>
        <div className="flex items-center" role="group" aria-label="Choose card">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              aria-label={`Go to ${it.title}`}
              aria-current={i === active}
              onClick={() => {
                touched.current = true;
                goTo(i);
              }}
              className="grid h-6 place-items-center rounded-full px-[3px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
            >
              <motion.span
                className={`block h-1.5 rounded-full ${i === active ? "bg-[#1d1d1f] dark:bg-[#f5f5f7]" : "bg-[#d2d2d7] dark:bg-[#48484a]"}`}
                animate={{ width: i === active ? 18 : 6 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          ))}
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            touched.current = true;
            step(1);
          }}
          aria-label="Next card"
          className="grid size-9 place-items-center rounded-full bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
        >
          <Chevron dir="right" />
        </motion.button>
      </div>
      {hint ? <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</span> : null}
    </div>
  );
}

export default CircularCarousel;
