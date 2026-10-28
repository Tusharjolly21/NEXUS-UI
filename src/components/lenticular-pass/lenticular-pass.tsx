"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "framer-motion";

export interface LenticularPassProps {
  /** Rocks the card back and forth by itself until someone touches it. */
  autoplay?: boolean;
  /** How many ridges the card is cut into, 44 is the default. Fewer gives coarse bands, more gives a finer print. */
  strips?: number;
  /** How far the card leans as you move across it, 1 is the default. 0.4 barely leans, 1.6 swings right over. */
  tilt?: number;
  /** How stiffly the card follows your pointer, 170 is the default. Lower is soft and floaty, higher is quick and a little bouncy. */
  stiffness?: number;
  /** How bright the light running along the ridges is, 1 is the default. 0 turns the shine off. */
  shine?: number;
}

const W = 300, H = 400, N0 = 44;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));

/** Paints the day or night print onto a canvas and returns it as a JPEG data URL. */
function scene(night: boolean) {
  const k = 2, c = document.createElement("canvas");
  c.width = W * k; c.height = H * k;
  const x = c.getContext("2d")!;
  x.scale(k, k);
  const sky = x.createLinearGradient(0, 0, 0, H);
  if (night) { sky.addColorStop(0, "#0b1033"); sky.addColorStop(0.55, "#3a2c6e"); sky.addColorStop(1, "#7a4a8c"); }
  else { sky.addColorStop(0, "#7cc4ff"); sky.addColorStop(0.55, "#bfe3ff"); sky.addColorStop(1, "#ffd9b0"); }
  x.fillStyle = sky; x.fillRect(0, 0, W, H);
  if (night) {
    for (let i = 0; i < 90; i++) { const sx = (i * 97) % W, sy = (i * 53) % 230; x.globalAlpha = 0.3 + ((i * 7) % 10) / 14; x.fillStyle = "#fff"; x.fillRect(sx, sy, i % 9 ? 1.2 : 2, i % 9 ? 1.2 : 2); }
    x.globalAlpha = 1;
    x.fillStyle = "#f4f1ff"; x.beginPath(); x.arc(206, 112, 30, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#3a2c6e"; x.beginPath(); x.arc(218, 104, 26, 0, Math.PI * 2); x.fill();
  } else {
    const sun = x.createRadialGradient(206, 112, 4, 206, 112, 70);
    sun.addColorStop(0, "#fff8e0"); sun.addColorStop(0.35, "#ffe08a"); sun.addColorStop(1, "rgba(255,224,138,0)");
    x.fillStyle = sun; x.beginPath(); x.arc(206, 112, 70, 0, Math.PI * 2); x.fill();
  }
  const ridge = (base: number, amp: number, f: number, col: string) => {
    x.fillStyle = col; x.beginPath(); x.moveTo(0, H);
    for (let px = 0; px <= W; px += 4) x.lineTo(px, base - Math.abs(Math.sin(px * f + base)) * amp - Math.sin(px * f * 3.1) * amp * 0.15);
    x.lineTo(W, H); x.fill();
  };
  ridge(250, 70, 0.018, night ? "#2b2060" : "#8fb4d9");
  ridge(290, 60, 0.024, night ? "#1d1648" : "#5f8fbd");
  ridge(330, 40, 0.03, night ? "#120e30" : "#2f5d86");
  if (night) { x.fillStyle = "#ffd36e"; for (const [wx, wy] of [[60, 352], [74, 356], [210, 348], [226, 352], [240, 350]]) x.fillRect(wx, wy, 3, 4); }
  x.fillStyle = "#fff"; x.textAlign = "left";
  x.font = "600 13px -apple-system, system-ui, sans-serif"; x.globalAlpha = 0.8; x.fillText(night ? "NIGHT PASS" : "DAY PASS", 24, 40);
  x.globalAlpha = 1; x.font = "700 30px -apple-system, system-ui, sans-serif"; x.fillText("Nexus Summit", 24, 76);
  x.font = "500 13px -apple-system, system-ui, sans-serif"; x.globalAlpha = 0.85; x.fillText(night ? "Afterparty · 21:00 – late" : "Talks · 09:00 – 18:00", 24, 98);
  x.globalAlpha = 1;
  return c.toDataURL("image/jpeg", 0.9);
}

// The prints are painted once per page and shared by every card. On the server (and while hydrating)
// there is no canvas yet, so the card first shows a plain sky gradient and swaps the prints in.
let printCache: readonly [string, string] | null = null;
const getPrints = () => (printCache ??= [scene(false), scene(true)] as const);
const getServerPrints = () => null;
const subscribeNever = () => () => {};

function Strip({ i, n, mix, glint, shine }: { i: number; n: number; mix: MotionValue<number>; glint: MotionValue<number>; shine: MotionValue<number> }) {
  const w = W / n;
  // each strip changes over a slightly different tilt, so the switch sweeps across the card
  const phase = (i / (n - 1) - 0.5) * 0.35;
  const op = useTransform(mix, (m) => { const t = Math.min(1, Math.max(0, (m + phase - 0.5) * 5 + 0.5)); return t * t * (3 - 2 * t); });
  const hl = useTransform([glint, shine], ([g, k]: number[]) => `linear-gradient(90deg, rgba(255,255,255,0) ${g * 100 - 30}%, rgba(255,255,255,${0.22 * k}) ${g * 100}%, rgba(255,255,255,0) ${g * 100 + 30}%)`);
  const bg = (v: string) => ({ backgroundImage: `var(${v})`, backgroundSize: `${W}px ${H}px`, backgroundPosition: `${-i * w}px 0` });
  return (
    <div className="absolute top-0 h-full overflow-hidden" style={{ left: i * w, width: w + 0.5 }}>
      <div className="absolute inset-0" style={bg("--lp-a")} />
      <motion.div className="absolute inset-0" style={{ ...bg("--lp-b"), opacity: op }} />
      <motion.div className="absolute inset-0" style={{ backgroundImage: hl }} />
      <div className="absolute inset-y-0 right-0 w-px bg-black/[.07]" />
    </div>
  );
}

/**
 * A ticket printed lenticular, like the ridged cards that change picture as
 * you tilt them. Lean it one way for the day pass, the other for the night
 * pass: the switch sweeps across the ridges strip by strip and light runs
 * along them as the card turns.
 */
export function LenticularPass({ autoplay = false, strips = N0, tilt = 1, stiffness = 170, shine = 1 }: LenticularPassProps) {
  const prints = useSyncExternalStore(subscribeNever, getPrints, getServerPrints);
  const root = useRef<HTMLDivElement>(null);
  const tx = useMotionValue(0), ty = useMotionValue(0);
  const count = Math.round(clamp(strips, 12, 80));
  const stripList = Array.from({ length: count }, (_, i) => i);
  const sx = useSpring(tx, { stiffness: clamp(stiffness, 60, 320), damping: 18 }), sy = useSpring(ty, { stiffness: clamp(stiffness, 60, 320), damping: 18 });
  // tilt and shine ride on motion values, so the sliders change the card while it is resting
  const tiltMv = useMotionValue(clamp(tilt, 0, 1.6)), shineMv = useMotionValue(clamp(shine, 0, 2));
  useEffect(() => { tiltMv.set(clamp(tilt, 0, 1.6)); shineMv.set(clamp(shine, 0, 2)); }, [tilt, shine, tiltMv, shineMv]);
  const unit = (v: number) => Math.min(1, Math.max(-1, v));
  const rotateY = useTransform([sx, tiltMv], ([v, k]: number[]) => unit(v) * 22 * k);
  const rotateX = useTransform([sy, tiltMv], ([v, k]: number[]) => unit(v) * -14 * k);
  const mix = useTransform(sx, [-0.6, 0.6], [0, 1], { clamp: true });
  const glint = useTransform(sx, [-1, 1], [0.1, 0.9]);
  const sheen = useTransform([sx, shineMv], ([v, k]: number[]) => `linear-gradient(${105 + v * 20}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,${(0.12 + Math.abs(v) * 0.12) * k}) 50%, rgba(255,255,255,0) 70%)`);
  const [night, setNight] = useState(false);
  useMotionValueEvent(mix, "change", (m) => setNight(m > 0.5));
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let k = 0;
    let inView = true;
    const io = typeof IntersectionObserver === "undefined" || !root.current ? null : new IntersectionObserver(([e]) => { inView = e.isIntersecting; });
    if (io && root.current) io.observe(root.current);
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      if (!inView || document.hidden) return;
      k++;
      animate(tx, k % 2 ? 0.85 : -0.85, { duration: 1.6, ease: "easeInOut" });
      animate(ty, k % 2 ? -0.3 : 0.25, { duration: 1.6, ease: "easeInOut" });
    }, 2200);
    return () => { clearInterval(id); io?.disconnect(); };
  }, [autoplay, tx, ty]);

  const vars = (prints ? { "--lp-a": `url(${prints[0]})`, "--lp-b": `url(${prints[1]})` } : {}) as CSSProperties;
  const pill = (on: boolean) =>
    `h-8 rounded-full px-3 font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#2997ff] ${
      on ? "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]" : "bg-[#f0f0f3] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
    }`;
  return (
    <div ref={root} className="flex flex-col items-center gap-4" style={{ perspective: 900 }}>
      <motion.div
        className="relative cursor-grab touch-none overflow-hidden rounded-[24px] bg-gradient-to-b from-[#7cc4ff] via-[#bfe3ff] to-[#ffd9b0] shadow-[0_30px_60px_-30px_rgba(20,20,60,.6),0_0_0_1px_rgba(0,0,0,.06)] active:cursor-grabbing dark:shadow-[0_30px_60px_-30px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.1)]"
        style={{ width: W, height: H, rotateX, rotateY, ...vars }}
        onPointerMove={(e) => {
          if (e.pointerType === "touch" && e.buttons === 0) return;
          touched.current = true;
          const r = e.currentTarget.getBoundingClientRect();
          tx.set(((e.clientX - r.left) / r.width) * 2 - 1);
          ty.set(((e.clientY - r.top) / r.height) * 2 - 1);
        }}
        onPointerLeave={() => { tx.set(tx.get() > 0 ? 0.75 : -0.75); ty.set(0); }}
        role="img"
        aria-label={night ? "Nexus Summit night pass, Afterparty from 21:00" : "Nexus Summit day pass, talks 09:00 to 18:00"}
      >
        {stripList.map((i) => <Strip key={`${count}-${i}`} i={i} n={count} mix={mix} glint={glint} shine={shineMv} />)}
        <motion.div className="pointer-events-none absolute inset-0" style={{ backgroundImage: sheen }} />
        <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-end justify-between text-white">
          <div className="flex flex-col"><span className="text-[11px] uppercase tracking-[0.14em] opacity-75">Admit one</span><span className="font-mono text-[15px] tracking-[0.1em]">NXS-0427</span></div>
          <div className="grid grid-cols-5 gap-[2px] rounded-[6px] bg-white p-1.5" aria-hidden="true">{Array.from({ length: 25 }, (_, k) => <span key={k} className="h-[5px] w-[5px]" style={{ background: (k * 7) % 3 ? "#1d1d1f" : "#fff" }} />)}</div>
        </div>
      </motion.div>
      <div className="flex items-center gap-2 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
        <button type="button" onClick={() => { touched.current = true; tx.set(-0.85); }} aria-pressed={!night} className={pill(!night)}>Day pass</button>
        <button type="button" onClick={() => { touched.current = true; tx.set(0.85); }} aria-pressed={night} className={pill(night)}>Night pass</button>
        <span className="ml-1 hidden sm:inline">or tilt it</span>
      </div>
    </div>
  );
}
