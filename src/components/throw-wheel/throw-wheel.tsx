"use client";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, useVelocity, type MotionValue } from "framer-motion";

export interface WheelCard {
  title: string;
  sub: string;
  /** Any CSS background for the card face. */
  art: string;
}

export interface ThrowWheelProps {
  cards?: WheelCard[];
  /** Throws the wheel by itself every few seconds until the user grabs it. */
  autoplay?: boolean;
}

const CARDS: WheelCard[] = [
  { title: "Kyoto", sub: "Temples at dawn", art: "linear-gradient(160deg,#ffb3c7,#ff6482 60%,#bf5af2)" },
  { title: "Lisbon", sub: "Yellow trams", art: "linear-gradient(160deg,#ffe58a,#ffcc00 50%,#ff9f0a)" },
  { title: "Reykjavík", sub: "Blue lagoons", art: "linear-gradient(160deg,#c6f1ff,#64d2ff 50%,#0a84ff)" },
  { title: "Marrakesh", sub: "Spice markets", art: "linear-gradient(160deg,#ffc9a3,#ff9f0a 50%,#d1495b)" },
  { title: "Oaxaca", sub: "Painted streets", art: "linear-gradient(160deg,#b7f7c5,#30d158 55%,#0b8f6a)" },
  { title: "Hokkaido", sub: "Powder snow", art: "linear-gradient(160deg,#f2f2f7,#c7d7ff 55%,#7d8cff)" },
  { title: "Tbilisi", sub: "Balconies", art: "linear-gradient(160deg,#ffd6e7,#c49bff 60%,#5e5ce6)" },
  { title: "Cape Town", sub: "Table Mountain", art: "linear-gradient(160deg,#ffe2b8,#ffb36b 50%,#5ac8fa)" },
  { title: "Hanoi", sub: "Lakeside mornings", art: "linear-gradient(160deg,#d5ffe6,#66d4cf 55%,#0a84ff)" },
  { title: "Bergen", sub: "Fjords", art: "linear-gradient(160deg,#dbe9ff,#8fb5ff 50%,#30486e)" },
];

const CW = 150;
const CH = 200;

function Card({ card, i, n, rot, tilt, blur, radius }: { card: WheelCard; i: number; n: number; rot: MotionValue<number>; tilt: MotionValue<number>; blur: MotionValue<number>; radius: number }) {
  const step = 360 / n;
  // Cards nearer the front straighten first: each gets its own spring.
  const distance = useTransform(rot, (r) => {
    const a = (((i * step + r) % 360) + 540) % 360 - 180;
    return Math.abs(a);
  });
  const stiffness = 90 + (i % 3) * 40;
  const t = useSpring(tilt, { stiffness, damping: 18 });
  const opacity = useTransform(distance, [0, 90, 120], [1, 0.75, 0]);
  const filter = useTransform(blur, (b) => `blur(${b.toFixed(2)}px)`);
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{ width: CW, height: CH, marginLeft: -CW / 2, marginTop: -CH / 2, transform: `rotateY(${i * step}deg) translateZ(${radius}px)`, transformStyle: "preserve-3d", opacity }}
    >
      <motion.div
        className="flex h-full w-full flex-col justify-end overflow-hidden rounded-[18px] p-3.5 shadow-[0_18px_30px_-16px_rgba(0,0,0,.45)]"
        style={{ background: card.art, rotateY: t, filter, backfaceVisibility: "hidden" }}
      >
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-white [text-shadow:0_1px_8px_rgba(0,0,0,.25)]">{card.title}</span>
        <span className="text-[12px] text-white/85">{card.sub}</span>
      </motion.div>
    </motion.div>
  );
}

/**
 * Cards on a drum you can throw. While it spins, each card turns edge-on in the
 * direction of travel and blurs with speed; as it slows they straighten one by
 * one and the wheel snaps a card to the front.
 */
export function ThrowWheel({ cards = CARDS, autoplay = false }: ThrowWheelProps) {
  const n = cards.length;
  const step = 360 / n;
  const radius = Math.round(CW / 2 / Math.tan(Math.PI / n)) + 40;
  const rot = useMotionValue(0);
  const vel = useVelocity(rot);
  const tilt = useTransform(vel, (v) => Math.max(-70, Math.min(70, -v * 0.09)));
  const blur = useTransform(vel, (v) => Math.min(6, Math.abs(v) * 0.006));
  const [front, setFront] = useState(0);
  const drag = useRef<{ x: number; r: number; lastX: number; lastT: number; v: number } | null>(null);
  const ctl = useRef<{ stop: () => void } | null>(null);
  const touched = useRef(false);

  useMotionValueEvent(rot, "change", (r) => setFront(((Math.round(-r / step) % n) + n) % n));

  const settle = (velocity: number) => {
    ctl.current?.stop();
    ctl.current = animate(rot, rot.get(), {
      type: "inertia",
      velocity,
      power: 0.55,
      timeConstant: 420,
      modifyTarget: (t) => Math.round(t / step) * step,
    });
  };

  const spinBy = (cardsToMove: number) => {
    ctl.current?.stop();
    const target = Math.round(rot.get() / step) * step - cardsToMove * step;
    ctl.current = animate(rot, target, { type: "spring", stiffness: 60, damping: 14 });
  };

  const throwIt = useEffectEvent(() => {
    if (!touched.current) settle((Math.random() > 0.3 ? -1 : 1) * (500 + Math.random() * 900));
  });

  useEffect(() => {
    if (!autoplay) return;
    const a = setTimeout(() => throwIt(), 700);
    const b = setInterval(() => throwIt(), 3600);
    return () => { clearTimeout(a); clearInterval(b); };
  }, [autoplay]);

  useEffect(() => () => ctl.current?.stop(), []);

  const current = cards[front] ?? cards[0];

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div
        className="relative h-[260px] w-full max-w-[720px] cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
        style={{ perspective: 1100, maskImage: "linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent)" }}
        onPointerDown={(e) => {
          touched.current = true;
          ctl.current?.stop();
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, r: rot.get(), lastX: e.clientX, lastT: performance.now(), v: 0 };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const now = performance.now();
          const dx = e.clientX - d.lastX;
          d.v = (dx * 0.28) / Math.max(0.008, (now - d.lastT) / 1000);
          d.lastX = e.clientX;
          d.lastT = now;
          rot.set(d.r + (e.clientX - d.x) * 0.28);
        }}
        onPointerUp={() => { if (drag.current) { settle(drag.current.v); drag.current = null; } }}
        onPointerCancel={() => { if (drag.current) { settle(0); drag.current = null; } }}
        role="region"
        aria-label={`Destinations carousel, showing ${current?.title ?? ""}`}
      >
        <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateY: rot, z: -radius }}>
          {cards.map((c, i) => (
            <Card key={c.title} card={c} i={i} n={n} rot={rot} tilt={tilt} blur={blur} radius={radius} />
          ))}
        </motion.div>
      </div>
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Previous" onClick={() => { touched.current = true; spinBy(-1); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] dark:focus-visible:outline-[#0a84ff]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </motion.button>
        <span className="min-w-[120px] text-center text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]" aria-live="polite">{current?.title}</span>
        <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label="Next" onClick={() => { touched.current = true; spinBy(1); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] dark:focus-visible:outline-[#0a84ff]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </motion.button>
      </div>
    </div>
  );
}
