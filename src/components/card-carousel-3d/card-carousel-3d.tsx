"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type CarouselCard = {
  id: string;
  name: string;
  price: string;
  /** Optional product photo (any URL you host). Without it a phone is drawn in `color`. */
  image?: string;
  /** Finish colour for the drawn product. */
  color?: string;
};

export type CardCarousel3DProps = {
  cards?: CarouselCard[];
  /** Cylinder radius in px. Defaults to a radius that fits the cards edge to edge. */
  radius?: number;
  /** Card width in px. */
  itemWidth?: number;
  /** Card height in px. */
  itemHeight?: number;
  /** CSS perspective in px. */
  perspective?: number;
  /** Drift continuously (pauses under the pointer). */
  autoRotate?: boolean;
  /** Drift speed multiplier. */
  autoSpeed?: number;
  /** Drag and wheel speed multiplier. */
  scrollSpeed?: number;
  /** Direction for drift and autoplay. */
  direction?: "cw" | "ccw";
  /** Called with the index of the card that settles in front. */
  onChange?: (index: number) => void;
  /** Hint under the dots. Empty string hides it. */
  hint?: string;
  /** Steps to the next card every 2.4s until someone touches it. */
  autoplay?: boolean;
  className?: string;
};

export const DEFAULT_CARDS: CarouselCard[] = [
  { id: "pro-max", name: "Lumen Pro Max", price: "From $1,199", color: "#c9b8a3" },
  { id: "pro", name: "Lumen Pro", price: "From $999", color: "#3a3a3c" },
  { id: "air", name: "Lumen Air", price: "From $899", color: "#a9c7e8" },
  { id: "lumen", name: "Lumen", price: "From $799", color: "#f2a7c3" },
  { id: "mini", name: "Lumen Mini", price: "From $599", color: "#9fd9b3" },
  { id: "se", name: "Lumen SE", price: "From $429", color: "#f5f5f7" },
];

const mod = (a: number, n: number) => ((a % n) + n) % n;

function Phone({ color, gid }: { color: string; gid: string }) {
  return (
    <svg viewBox="0 0 120 160" className="h-full w-auto" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset=".45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <rect x="24" y="10" width="72" height="140" rx="16" fill="#000" opacity=".12" transform="translate(4 4)" />
      <rect x="24" y="10" width="72" height="140" rx="16" fill={color} stroke="rgba(0,0,0,.12)" />
      <rect x="24" y="10" width="72" height="140" rx="16" fill={`url(#${gid})`} />
      <rect x="31" y="17" width="34" height="34" rx="10" fill="rgba(0,0,0,.14)" />
      <circle cx="41" cy="27" r="6.5" fill="#1d1d1f" stroke="rgba(255,255,255,.35)" />
      <circle cx="56" cy="27" r="6.5" fill="#1d1d1f" stroke="rgba(255,255,255,.35)" />
      <circle cx="41" cy="42" r="6.5" fill="#1d1d1f" stroke="rgba(255,255,255,.35)" />
      <circle cx="56" cy="42" r="2.4" fill="#fff" opacity=".7" />
      <circle cx="60" cy="112" r="9" fill="none" stroke="rgba(0,0,0,.14)" strokeWidth="2" />
    </svg>
  );
}

function Card({
  card,
  index,
  step,
  rot,
  radius,
  width,
  height,
  onPick,
  gid,
}: {
  gid: string;
  card: CarouselCard;
  index: number;
  step: number;
  rot: MotionValue<number>;
  radius: MotionValue<number>;
  width: number;
  height: number;
  onPick: () => void;
}) {
  const angle = index * step;
  const facing = useTransform(rot, (r) => Math.round(Math.cos(((angle + r) * Math.PI) / 180) * 1000) / 1000);
  const scrim = useTransform(facing, [0, 1], [0.5, 0]);
  const backOpacity = useTransform(facing, (f) => Math.round(Math.max(0, -f) * 700) / 1000);
  const transform = useMotionTemplate`rotateY(${angle}deg) translateZ(${radius}px)`;
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2, transform, transformStyle: "preserve-3d" }}
    >
      {/* Back of the card, seen through the far side of the ring. */}
      <motion.span
        className="absolute inset-0 rounded-[24px] bg-[#e8e8ed] dark:bg-[#2c2c2e]"
        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", opacity: backOpacity }}
        aria-hidden="true"
      />
      <button
        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onPick}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-white p-3 text-left shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
      >
        <span className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[16px] bg-[#f5f5f7] py-2 dark:bg-[#2c2c2e]">
          {card.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          ) : (
            <Phone color={card.color ?? "#d2d2d7"} gid={gid} />
          )}
        </span>
        <span className="mt-2.5 block truncate px-1 text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{card.name}</span>
        <span className="block px-1 text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{card.price}</span>
        <motion.span className="pointer-events-none absolute inset-0 rounded-[24px] bg-[#f5f5f7] dark:bg-black" style={{ opacity: scrim }} />
      </button>
    </motion.div>
  );
}

/**
 * Product cards standing round a cylinder. Drag or fling it and it coasts,
 * then clicks into place with the nearest card facing you; spin it fast and
 * the cards swing outward and settle back in as it slows. Wheel, arrow keys,
 * dots and a tap on any card all work.
 */
export function CardCarousel3D({
  cards = DEFAULT_CARDS,
  radius,
  itemWidth = 168,
  itemHeight = 220,
  perspective = 1100,
  autoRotate = false,
  autoSpeed = 1,
  scrollSpeed = 1,
  direction = "cw",
  onChange,
  hint = "Drag, scroll or use the arrow keys.",
  autoplay = false,
  className = "",
}: CardCarousel3DProps) {
  const n = Math.max(1, cards.length);
  const step = 360 / n;
  const still = useReducedMotion() === true;
  const fit = Math.round(((itemWidth / 2) / Math.tan(Math.PI / Math.max(3, n))) * 1.16);
  const baseR = radius ?? fit;
  const sign = direction === "cw" ? 1 : -1;

  const rot = useMotionValue(0);
  const vel = useVelocity(rot);
  // Centrifugal spread: cards swing out while spinning fast, then spring back in.
  const spread = useSpring(
    useTransform(vel, (v) => (still ? 0 : Math.min(60, Math.abs(v) * 0.05))),
    { stiffness: 140, damping: 14 },
  );
  const r = useTransform(spread, (s) => baseR + s);
  const back = useTransform(r, (x) => -x);
  const tilt = useSpring(useTransform(vel, (v) => (still ? -4 : -4 + Math.max(-6, Math.min(6, v * -0.01)))), { stiffness: 160, damping: 16 });

  const [active, setActive] = useState(0);
  const settled = useRef(0);
  const run = useRef<AnimationPlaybackControls | undefined>(undefined);
  const touched = useRef(false);
  const hovering = useRef(false);
  const dragging = useRef(false);
  const from = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  /** Frames the drift waits after anyone moves the carousel. */
  const quiet = useRef(0);
  const wheelT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useMotionValueEvent(rot, "change", (v) => {
    const i = mod(Math.round(-v / step), n);
    setActive(i);
  });

  const snapTo = (target: number, velocity = 0) => {
    run.current?.stop();
    quiet.current = 100;
    run.current = animate(rot, target, { type: "spring", stiffness: still ? 600 : 170, damping: still ? 60 : 19, velocity });
    const i = mod(Math.round(-target / step), n);
    if (i !== settled.current) {
      settled.current = i;
      onChange?.(i);
    }
  };
  const goTo = (i: number) => {
    const cur = rot.get();
    const want = -i * step;
    // Shortest way round.
    const delta = mod(want - cur + 180, 360) - 180;
    snapTo(Math.round((cur + delta) / step) * step);
  };
  const nudge = (d: number) => snapTo((Math.round(rot.get() / step) - d) * step);

  useEffect(() => () => run.current?.stop(), []);

  useEffect(() => {
    if (!autoRotate) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (quiet.current > 0) quiet.current -= 1;
      else if (!hovering.current && !dragging.current) {
        rot.set(rot.get() - sign * autoSpeed * dt * 0.012);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotate, autoSpeed, sign, rot]);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      run.current?.stop();
      run.current = animate(rot, (Math.round(rot.get() / step) - sign) * step, { type: "spring", stiffness: 120, damping: 16 });
    }, 2400);
    return () => clearInterval(t);
  }, [autoplay, step, sign, rot]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      touched.current = true;
      run.current?.stop();
      quiet.current = 100;
      rot.set(rot.get() - d * 0.18 * scrollSpeed);
      clearTimeout(wheelT.current);
      wheelT.current = setTimeout(() => {
        run.current = animate(rot, Math.round(rot.get() / step) * step, { type: "spring", stiffness: 170, damping: 19 });
      }, 140);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(wheelT.current);
    };
  }, [rot, scrollSpeed, step]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") nudge(1);
    else if (e.key === "ArrowLeft") nudge(-1);
    else if (e.key === "Home") goTo(0);
    else if (e.key === "End") goTo(n - 1);
    else return;
    e.preventDefault();
    touched.current = true;
  };

  const k = 0.32 * scrollSpeed;
  const current = cards[active];

  return (
    <div className={`flex w-full max-w-full flex-col items-center gap-3 overflow-hidden ${className}`}>
      <motion.div
        ref={stage}
        role="region"
        aria-roledescription="carousel"
        aria-label="Products"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerEnter={() => {
          hovering.current = true;
        }}
        onPointerLeave={() => {
          hovering.current = false;
        }}
        onPointerDown={() => {
          touched.current = true;
          run.current?.stop();
        }}
        onPanStart={() => {
          dragging.current = true;
          from.current = rot.get();
        }}
        onPan={(_, info) => rot.set(from.current + info.offset.x * k)}
        onPanEnd={(_, info) => {
          dragging.current = false;
          quiet.current = 120;
          run.current = animate(rot, [rot.get()], {
            type: "inertia",
            velocity: info.velocity.x * k,
            power: 0.35,
            timeConstant: 260,
            modifyTarget: (v) => Math.round(v / step) * step,
          });
          const i = mod(Math.round(-(rot.get() + info.velocity.x * k * 0.5) / step), n);
          if (i !== settled.current) {
            settled.current = i;
            onChange?.(i);
          }
        }}
        className="relative w-full cursor-grab touch-pan-y select-none rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:focus-visible:ring-[#0a84ff]"
        style={{ height: itemHeight + 36, perspective }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 h-0 w-0"
          style={{ transformStyle: "preserve-3d", z: back, rotateX: tilt, rotateY: rot }}
        >
          {cards.map((c, i) => (
            <Card key={c.id} gid={`cc3d-${uid}-${i}`} card={c} index={i} step={step} rot={rot} radius={r} width={itemWidth} height={itemHeight} onPick={() => goTo(i)} />
          ))}
        </motion.div>
      </motion.div>

      <div className="flex flex-col items-center" aria-live="polite">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{current?.name}</span>
        <span className="text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{current?.price}</span>
      </div>
      <div className="flex items-center gap-1" role="group" aria-label="Choose product">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={`Show ${c.name}`}
            aria-current={i === active}
            onClick={() => {
              touched.current = true;
              goTo(i);
            }}
            className="grid h-6 place-items-center rounded-full px-1 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
          >
            <motion.span
              className={`block h-[7px] rounded-full ${i === active ? "bg-[#1d1d1f] dark:bg-[#f5f5f7]" : "bg-[#d2d2d7] dark:bg-[#48484a]"}`}
              animate={{ width: i === active ? 20 : 7 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        ))}
      </div>
      {hint ? <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</span> : null}
    </div>
  );
}

export default CardCarousel3D;
