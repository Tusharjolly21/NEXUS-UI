"use client";
/**
 * Halcyon: cinematic launch page template for a pro laptop.
 * The hero is a CSS 3D laptop (no WebGL, no model files) that opens as you
 * scroll and turns when you drag it. Built in the Motion Kit style from
 * Glass Lens, Scrub Inputs, Squeeze Progress, Upload Chips (as Offload Chips),
 * Stretch Nav, Matrix Loaders and the Price Odometer's rolling number.
 *
 * The name is kept for routing; the page no longer uses GSAP or three.js.
 */
import { useMemo, useRef, useState, type ReactNode } from "react";
import { MotionConfig, animate, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue, type PanInfo } from "framer-motion";
import GlassLens from "@/components/templates/kit/components/GlassLens";
import { ScrubField } from "@/components/templates/kit/components/ScrubInput";
import SqueezeProgress from "@/components/templates/kit/components/SqueezeProgress";
import StretchNav from "@/components/templates/kit/components/StretchNav";
import { MatrixLoader } from "@/components/templates/kit/components/MatrixLoaders";
import { RollingNumber } from "@/components/templates/kit/components/PriceOdometer";
import OffloadChips from "@/components/templates/halcyon/OffloadChips";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Spotlight, Stagger, card, scrollToId } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const A = "#475569"; // slate: 7.5:1 on white
const SKY = "#7dd3fc"; // screen glow only

const FINISHES = [
  { id: "slate", n: "Slate", top: "#5b6472", side: "#3f4651", deck: "linear-gradient(180deg,#646d7b,#535b68)" },
  { id: "mist", n: "Mist", top: "#d5d8dd", side: "#aeb3ba", deck: "linear-gradient(180deg,#dfe2e6,#cdd1d6)" },
];

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="3" y="3" width="26" height="26" rx="8" fill="#1d1d1f" />
        <motion.path d="M9 19c3-5 11-5 14 0" fill="none" stroke={SKY} strokeWidth="2.6" strokeLinecap="round" animate={{ pathLength: [0.2, 1, 0.2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <circle cx="16" cy="12" r="2.4" fill="#fff" />
      </svg>
      Halcyon
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Art: a film still drawn with gradients                              */
/* ------------------------------------------------------------------ */

function Still({ filter }: { filter?: MotionValue<string> | string }) {
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ filter }} aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#0b2545 0%,#13406b 30%,#3f7aa6 52%,#f2b38a 66%,#e98a5e 72%)" }} />
      <div className="absolute left-[64%] top-[52%] h-[18%] w-[12%] rounded-full" style={{ background: "radial-gradient(circle,#fff5e0 0 35%,rgba(255,230,190,0) 70%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: "#1d2d44", clipPath: "polygon(0 30%,14% 18%,30% 34%,48% 12%,66% 30%,82% 16%,100% 28%,100% 100%,0 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[22%]" style={{ background: "linear-gradient(180deg,#5f7d95,#2a3d52)" }} />
      <div className="absolute bottom-[12%] left-[22%] h-[16%] w-[2.2%] rounded-t-full bg-[#0d1726]" />
      <div className="absolute bottom-[27%] left-[21.6%] h-[3.5%] w-[3%] rounded-full bg-[#0d1726]" />
    </motion.div>
  );
}

function ScreenUI() {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#101114] text-white">
      <div className="flex h-[22px] flex-none items-center gap-1.5 px-3">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-[8px] w-[8px] rounded-full" style={{ background: c }} />)}
        <span className="ml-3 text-[9px] font-medium text-white/60">Reel 3 · Shot 14 · Grade</span>
      </div>
      <div className="flex min-h-0 flex-1 gap-2 px-2">
        <div className="relative flex-1 overflow-hidden rounded-[4px]"><Still /></div>
        <div className="flex w-[22%] flex-col gap-2 rounded-[4px] bg-white/[.06] p-2">
          {["Lift", "Gamma", "Gain"].map((l, i) => (
            <div key={l} className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full" style={{ background: `conic-gradient(from ${i * 40}deg,#f87171,#facc15,#4ade80,#38bdf8,#a78bfa,#f87171)` }} />
              <span className="text-[8px] text-white/70">{l}</span>
            </div>
          ))}
          <div className="mt-auto h-[30%] rounded-[3px]" style={{ background: "linear-gradient(0deg,rgba(125,211,252,.5),rgba(125,211,252,0))", clipPath: "polygon(0 100%,0 70%,12% 50%,24% 62%,40% 20%,55% 45%,70% 30%,85% 55%,100% 40%,100% 100%)" }} />
        </div>
      </div>
      <div className="flex h-[24%] flex-none flex-col gap-1 p-2">
        {[0, 1, 2].map((r) => (
          <div key={r} className="flex h-[30%] gap-[2px]">
            {[18, 26, 12, 30, 14].map((w, i) => <span key={i} className="rounded-[2px]" style={{ width: `${w}%`, background: r === 0 ? (i === 2 ? SKY : "#3b4b63") : r === 1 ? "#2b3647" : "#36463a" }} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: scroll to open the lid, drag to turn the machine              */
/* ------------------------------------------------------------------ */

const W = 600; // base width
const D = 404; // base depth
const H = 390; // lid height
const T = 14; // base thickness

function Machine({ lid, screenOn, finish }: { lid: MotionValue<number>; screenOn: MotionValue<number>; finish: (typeof FINISHES)[number] }) {
  const glow = useTransform(screenOn, [0, 1], [0, 0.55]);
  const off = useTransform(screenOn, (v) => 1 - v);
  const face = { position: "absolute" as const, backfaceVisibility: "hidden" as const, WebkitBackfaceVisibility: "hidden" as const };
  return (
    <>
      {/* floor shadow */}
      <div style={{ ...face, left: -W * 0.62, top: -D * 0.62, width: W * 1.24, height: D * 1.24, transform: `translateY(${T + 2}px) rotateX(90deg)`, background: "radial-gradient(50% 50% at 50% 50%, rgba(15,23,42,.38), rgba(15,23,42,0) 70%)" }} />
      {/* base: top deck */}
      <div style={{ ...face, left: -W / 2, top: -D / 2, width: W, height: D, transform: "rotateX(90deg)", background: finish.deck, borderRadius: 18, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.18)" }}>
        <div className="absolute left-[6%] right-[6%] top-[7%] h-[50%] rounded-[10px] bg-[#16181c] p-[10px]">
          <div className="grid h-full grid-cols-[repeat(14,1fr)] grid-rows-6 gap-[4px]">
            {Array.from({ length: 84 }, (_, i) => <span key={i} className="rounded-[3px] bg-[#2a2d33] shadow-[inset_0_-1px_0_rgba(0,0,0,.5)]" />)}
          </div>
        </div>
        <div className="absolute left-1/2 top-[62%] h-[31%] w-[42%] -translate-x-1/2 rounded-[10px]" style={{ background: "rgba(255,255,255,.08)", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)" }} />
      </div>
      {/* base: edges */}
      <div style={{ ...face, left: -W / 2, top: 0, width: W, height: T, transform: `translateZ(${D / 2}px)`, background: finish.side, borderRadius: "0 0 10px 10px" }}>
        <span className="absolute left-1/2 top-0 h-[5px] w-[90px] -translate-x-1/2 rounded-b-[5px] bg-black/20" />
      </div>
      <div style={{ ...face, left: -D / 2, top: 0, width: D, height: T, transform: `translateX(${W / 2}px) rotateY(90deg)`, background: finish.side }} />
      <div style={{ ...face, left: -D / 2, top: 0, width: D, height: T, transform: `translateX(${-W / 2}px) rotateY(-90deg)`, background: finish.side }} />
      <div style={{ ...face, left: -W / 2, top: 0, width: W, height: T, transform: `translateZ(${-D / 2}px) rotateY(180deg)`, background: finish.side }} />
      {/* lid, hinged on the back edge */}
      <motion.div style={{ position: "absolute", left: -W / 2, top: -H - 3, width: W, height: H, transformOrigin: "50% 100%", transformStyle: "preserve-3d", z: -D / 2 + 6, rotateX: lid }}>
        <div style={{ ...face, inset: 0, borderRadius: 18, background: "#0b0c0e", padding: 12, boxShadow: "0 0 0 1.5px #2a2c31" }}>
          <div className="relative h-full w-full overflow-hidden rounded-[8px]">
            <ScreenUI />
            <motion.div className="absolute inset-0 bg-black" style={{ opacity: off }} />
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 38%)" }} />
          </div>
          <span className="absolute left-1/2 top-[4px] h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-[#2a2c31]" />
        </div>
        <div style={{ ...face, inset: 0, borderRadius: 18, transform: "rotateY(180deg)", background: `linear-gradient(160deg, ${finish.top}, ${finish.side})`, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.16)" }}>
          <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40" width="54" height="54" viewBox="0 0 32 32" aria-hidden="true"><path d="M9 19c3-5 11-5 14 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" /><circle cx="16" cy="12" r="2.2" fill="#fff" /></svg>
        </div>
        <motion.div className="pointer-events-none absolute -inset-10 rounded-[40px] blur-3xl" style={{ background: SKY, opacity: glow, transform: "translateZ(-2px)" }} aria-hidden="true" />
      </motion.div>
    </>
  );
}

function StageText({ p, range, children, className = "" }: { p: MotionValue<number>; range: [number, number, number, number]; children: ReactNode; className?: string }) {
  const opacity = useTransform(p, range, [0, 1, 1, 0]);
  const y = useTransform(p, [range[0], range[1], range[2], range[3]], [20, 0, 0, -20]);
  const events = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));
  return (
    <motion.div className={`absolute inset-x-0 top-[9vh] flex flex-col items-center gap-4 px-5 text-center ${className}`} style={{ opacity, y, pointerEvents: events }}>
      {children}
    </motion.div>
  );
}

function Hero() {
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.0005 });
  const lidScroll = useTransform(p, [0.04, 0.46], [-88, 14]);
  const lid = useTransform(lidScroll, (v) => (reduce ? 14 : v));
  const screenOn = useTransform(p, (v) => (reduce ? 1 : Math.max(0, Math.min(1, (v - 0.3) / 0.18))));
  const tilt = useTransform(p, [0, 0.5, 1], [-32, -14, -11]);
  const scale = useTransform(p, [0, 0.5, 1], [0.84, 1, 1.05]);
  const turnScroll = useTransform(p, [0, 0.5, 1], [-26, -6, 8]);
  const spin = useMotionValue(0);
  const spinS = useSpring(spin, { stiffness: 80, damping: 14 });
  const rotY = useTransform([turnScroll, spinS], ([a, b]: number[]) => a + b);
  const bar = useTransform(p, [0, 1], [0, 1]);
  const [hint, setHint] = useState(true);

  const onPan = (_: unknown, info: PanInfo) => {
    setHint(false);
    spin.set(Math.max(-70, Math.min(70, spin.get() + info.delta.x * 0.35)));
  };
  const onPanEnd = (_: unknown, info: PanInfo) => {
    animate(spin, 0, { type: "spring", stiffness: 50, damping: 9, velocity: info.velocity.x * 0.08 });
  };

  return (
    <section ref={wrap} className="relative h-[230vh] sm:h-[260vh]" aria-label="Halcyon 16">
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: "radial-gradient(70% 55% at 50% 70%, #ffffff 0%, #eef0f3 55%, #e3e6ea 100%)" }}>
        <StageText p={p} range={[-1, 0, 0.14, 0.24]}>
          <span className="text-[15px] font-semibold" style={{ color: A }}>New · Halcyon 14 and 16</span>
          <h1 className="m-0 text-[clamp(52px,10vw,132px)] font-semibold leading-[0.92] tracking-[-0.06em] text-[#1d1d1f]">Halcyon</h1>
          <p className="m-0 max-w-[520px] text-[clamp(17px,2vw,21px)] leading-[1.45] text-[#424245]">A laptop for people who finish films on it. Scroll to open it, drag to turn it.</p>
        </StageText>
        <StageText p={p} range={[0.26, 0.36, 0.5, 0.6]}>
          <span className="text-[15px] font-semibold" style={{ color: A }}>Studio display</span>
          <h2 className="m-0 max-w-[820px] text-[clamp(36px,6vw,76px)] font-semibold leading-[1] tracking-[-0.05em] text-[#1d1d1f] [text-wrap:balance]">1,600 nits, the moment it opens.</h2>
        </StageText>
        <StageText p={p} range={[0.62, 0.72, 1.5, 2]}>
          <span className="text-[15px] font-semibold" style={{ color: A }}>HX2 Max</span>
          <h2 className="m-0 max-w-[860px] text-[clamp(36px,6vw,76px)] font-semibold leading-[1] tracking-[-0.05em] text-[#1d1d1f] [text-wrap:balance]">Full-speed 8K, unplugged.</h2>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Magnetic className="text-white focus-visible:ring-[#475569]" style={{ background: A }} onClick={() => scrollToId("buy")}>Order from $2,099</Magnetic>
            <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:ring-[#475569]" onClick={() => scrollToId("performance")}>See performance</Magnetic>
          </div>
        </StageText>

        <motion.div
          className="absolute inset-x-0 bottom-[2vh] top-[34vh] flex cursor-grab items-center justify-center active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
          onPan={onPan}
          onPanEnd={onPanEnd}
          role="img"
          aria-label="Halcyon 16 in Slate. It opens as you scroll; drag sideways to turn it."
        >
          <div className="origin-center scale-[0.5] sm:scale-[0.8] lg:scale-100" style={{ perspective: 1900 }}>
            <div className="relative h-[520px] w-[760px]">
              <motion.div className="absolute left-1/2 top-[66%] h-0 w-0" style={{ transformStyle: "preserve-3d", rotateX: tilt, rotateY: rotY, scale }}>
                <Machine lid={lid} screenOn={screenOn} finish={FINISHES[0]} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-2">
          <motion.span className="rounded-full bg-white/85 px-3 py-1 text-[12px] font-medium text-[#424245] shadow-[0_0_0_1px_rgba(0,0,0,.05)] backdrop-blur" animate={{ opacity: hint ? 1 : 0 }}>Scroll to open · drag to turn</motion.span>
          <div className="h-[3px] w-[120px] overflow-hidden rounded-full bg-black/10">
            <motion.div className="h-full origin-left rounded-full" style={{ scaleX: bar, background: A }} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Stats() {
  const items = [
    { to: 3.1, f: (n: number) => `${n.toFixed(1)}×`, l: "faster 8K renders than Halcyon 15 (2023)" },
    { to: 1600, f: (n: number) => `${Math.round(n).toLocaleString("en-US")}`, l: "nits of HDR peak brightness" },
    { to: 18, f: (n: number) => `${Math.round(n)} hrs`, l: "of battery, or a full day in an edit suite" },
    { to: 80, f: (n: number) => `${Math.round(n)} Gb/s`, l: "on each of the three USB-C ports" },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-20" aria-label="Key numbers">
      <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.l} className="flex flex-col gap-2 border-t border-black/[.08] pt-6">
            <Counter to={it.to} format={it.f} className="text-[clamp(36px,4.6vw,52px)] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
            <span className="text-[15px] leading-[1.4] text-[#6e6e73]">{it.l}</span>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

function Performance() {
  const race = [
    { l: "Halcyon 16 · HX2 Max", s: 252, c: "#1d1d1f" },
    { l: "Halcyon 16 · HX2", s: 400, c: A },
    { l: "Halcyon 15 · 2023", s: 785, c: "#c4cad3" },
  ];
  const jobs = [
    { p: 1, t: "Transcribing interview", s: "41 min of audio · on device" },
    { p: 4, t: "Tracking roto masks", s: "Frame 212 of 412" },
    { p: 2, t: "Denoising dialogue", s: "Scene 14 · 6 tracks" },
    { p: 5, t: "Building proxies", s: "38 clips · 1080p" },
  ];
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  return (
    <section id="performance" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Performance" title="Built for the long render, not the benchmark." sub="HX2 Max has 16 performance cores and a 40-core graphics engine. More to the point, it holds its speed at minute forty, plugged in or not." accent={A} />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
          <Reveal y={20} amount={0.15}>
            <div className={`${card} flex h-full flex-col gap-6 p-6 sm:p-8`}>
              <div>
                <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Export a 10-minute 8K timeline</h3>
                <p className="m-0 mt-1 text-[15px] text-[#6e6e73]">Minutes and seconds, shorter is better. On battery.</p>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-5">
                {race.map((r, i) => (
                  <div key={r.l} className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between text-[15px]">
                      <span className="text-[#1d1d1f]">{r.l}</span>
                      <Counter to={r.s} format={mmss} className="font-semibold text-[#1d1d1f]" />
                    </div>
                    <div className="h-3.5 overflow-hidden rounded-full bg-[#eef0f3]">
                      <motion.div className="h-full origin-left rounded-full" style={{ width: `${(r.s / 785) * 100}%`, background: r.c }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.6 }} transition={{ type: "spring", stiffness: 70, damping: 18, delay: i * 0.15 }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="m-0 text-[12px] text-[#6e6e73]">Tested by Halcyon in September 2026 with a pre-release build. Your timeline will vary.</p>
            </div>
          </Reveal>
          <div className="flex flex-col gap-5">
            <Reveal y={20} delay={0.06} amount={0.15}>
              <div className={`${card} flex flex-col items-center gap-4 p-6`}>
                <div className="w-full">
                  <h3 className="m-0 text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Pause an export, take the call.</h3>
                  <p className="m-0 mt-1 text-[14px] text-[#6e6e73]">It picks up from the same frame.</p>
                </div>
                <Fit><SqueezeProgress accent={A} autoplay /></Fit>
              </div>
            </Reveal>
            <Reveal y={20} delay={0.12} amount={0.15}>
              <div className={`${card} flex flex-col gap-1 p-4`}>
                <span className="px-3 pb-1 pt-2 text-[12px] font-semibold text-[#6e6e73]">Running on the neural engine, right now</span>
                {jobs.map((j) => (
                  <div key={j.t} className="flex items-center gap-4 rounded-2xl px-3 py-2.5">
                    <MatrixLoader pattern={j.p} size={28} color={A} />
                    <span className="flex flex-col">
                      <span className="text-[15px] font-medium text-[#1d1d1f]">{j.t}</span>
                      <span className="text-[13px] tabular-nums text-[#6e6e73]">{j.s}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function LensFrame() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b0c0e]">
      <Still />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
        <div className="flex flex-col">
          <span className="text-[7px] font-semibold uppercase tracking-[0.2em] text-white/80">Reel 3 · Shot 14 · Take 2</span>
          <span className="text-[6px] text-white/70">ARRI-style log · 23.976 · 8192 × 4320 · ISO 800 · 180° · 5600 K</span>
        </div>
        <span className="text-[7px] tabular-nums text-white/80">01:04:12:09</span>
      </div>
      <div className="absolute left-4 top-4 flex gap-[2px]" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => <span key={i} className="h-[6px] w-[2px] rounded-[1px]" style={{ background: i < 17 ? "#a3e635" : "#3f3f46" }} />)}
      </div>
      <div className="absolute right-4 top-4 rounded-[3px] border border-white/40 px-1 text-[6px] font-semibold tracking-[0.1em] text-white/80">HDR</div>
    </div>
  );
}

function Display() {
  return (
    <section id="display" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Display" title="Detail you can check without a loupe." sub="254 pixels per inch on a 16.2-inch mini-LED panel. Drag the lens over the frame: the six-point slate in the corner is still readable type." accent={A} />
          <Stagger className="flex flex-col">
            {[["3456 × 2234", "16.2-inch, 120 Hz"], ["1,600 nits", "HDR peak, 1,000 sustained"], ["1,000,000 : 1", "contrast across 2,500 dimming zones"]].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-t border-black/[.08] py-4">
                <span className="text-[22px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f]">{k}</span>
                <span className="text-right text-[14px] text-[#6e6e73]">{v}</span>
              </div>
            ))}
          </Stagger>
        </div>
        <Reveal y={20} amount={0.15} className="flex justify-center">
          <Fit>
            <GlassLens width={640} height={360} size={170} zoom={2.2} autoplay>
              <LensFrame />
            </GlassLens>
          </Fit>
        </Reveal>
      </div>
    </section>
  );
}

function Grade() {
  const [exp, setExp] = useState(0);
  const [con, setCon] = useState(10);
  const [warm, setWarm] = useState(20);
  const [vib, setVib] = useState(15);
  const filter = useMemo(
    () => `brightness(${(1 + exp / 100).toFixed(2)}) contrast(${(1 + con / 100).toFixed(2)}) saturate(${(1 + vib / 100).toFixed(2)}) sepia(${Math.max(0, warm / 220).toFixed(2)}) hue-rotate(${Math.min(0, warm / 4).toFixed(1)}deg)`,
    [exp, con, warm, vib],
  );
  return (
    <section id="grade" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Pro apps" title="Grade on battery, at full brightness." sub="Drag a label sideways to grade the shot. The same controls you'd use in an edit suite, running on a machine you can carry into one." accent={A} center />
        <Reveal y={20} amount={0.15} className="mt-12">
          <div className={`${card} grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_270px]`}>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[18px] bg-black">
              <Still filter={filter} />
              <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur">Shot 14 · graded live</span>
            </div>
            <div className="flex flex-col justify-center gap-2.5">
              <ScrubField label="Exposure" value={exp} onChange={setExp} min={-40} max={40} unit="%" accent={A} />
              <ScrubField label="Contrast" value={con} onChange={setCon} min={-30} max={60} unit="%" accent={A} />
              <ScrubField label="Warmth" value={warm} onChange={setWarm} min={-40} max={80} unit="" accent={A} />
              <ScrubField label="Vibrance" value={vib} onChange={setVib} min={-60} max={80} unit="%" accent={A} />
              <span className="pt-1 text-[12px] leading-[1.45] text-[#6e6e73]">Drag a label, or type a value. Shift for big steps.</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Ports() {
  const left = ["Magnetic charging, 140 W", "Two USB-C, 80 Gb/s", "Headphone jack, high impedance"];
  const right = ["USB-C, 80 Gb/s", "HDMI 2.1, 8K at 60 Hz", "Full-size SD card slot"];
  return (
    <section id="ports" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Connectivity" title="Off the card before you've packed the camera." sub="A full card of 8K raw copies in under four minutes. Drop some footage in to try it." accent={A} />
          <div className="grid grid-cols-2 gap-6">
            {[{ t: "Left side", v: left }, { t: "Right side", v: right }].map((g) => (
              <div key={g.t} className="flex flex-col gap-3">
                <span className="text-[13px] font-semibold" style={{ color: A }}>{g.t}</span>
                {g.v.map((x) => <span key={x} className="border-t border-black/[.08] pt-3 text-[15px] text-[#1d1d1f]">{x}</span>)}
              </div>
            ))}
          </div>
        </div>
        <Reveal y={20} amount={0.15}>
          <div className={`${card} flex justify-center px-5 py-8`}>
            <OffloadChips accent={A} autoplay />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Details() {
  const items = [
    { t: "Six speakers", b: "Force-cancelling woofers, so the desk doesn't buzz when the score swells." },
    { t: "12 MP camera", b: "Keeps you centred on calls as you lean back from the timeline." },
    { t: "Wi-Fi 7", b: "Pull proxies off the shared drive as fast as the office network allows." },
    { t: "Full-height function row", b: "Real keys for scrubbing, marking and ripple delete." },
  ];
  return (
    <section className="bg-[#f5f5f7] py-24" aria-label="More details">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="And the rest" title="The small things, done properly." accent={A} />
        <Stagger className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <Spotlight key={it.t} className={`${card} h-full p-6`} color="rgba(71,85,105,.12)">
              <h3 className="m-0 text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{it.t}</h3>
              <p className="m-0 mt-2 text-[15px] leading-[1.5] text-[#6e6e73]">{it.b}</p>
            </Spotlight>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

const SIZES = [
  { n: "14-inch", base: 2099, scale: 0.86 },
  { n: "16-inch", base: 2599, scale: 1 },
];
const CHIPS = [
  { id: "hx2", n: "HX2", s: "12-core CPU · 24-core GPU · 24 GB", add: 0 },
  { id: "max", n: "HX2 Max", s: "16-core CPU · 40-core GPU · 48 GB", add: 800 },
];

function Buy() {
  const [size, setSize] = useState(1);
  const [chip, setChip] = useState("hx2");
  const [finish, setFinish] = useState(FINISHES[0]);
  const total = SIZES[size].base + (CHIPS.find((c) => c.id === chip)?.add ?? 0);
  return (
    <section id="buy" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Buy" title="Pick a size. The rest follows." sub="Both sizes have the same display quality, ports and battery life per inch." accent={A} center />
      <Reveal y={20} amount={0.1} className="mt-12">
        <div className={`${card} grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr]`}>
          <div className="flex min-h-[300px] items-center justify-center rounded-[22px]" style={{ background: "radial-gradient(70% 70% at 50% 60%, #ffffff, #eceef1)" }}>
            <motion.div className="flex flex-col items-center" animate={{ scale: SIZES[size].scale }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
              <div className="h-[190px] w-[300px] rounded-t-[14px] bg-[#0b0c0e] p-[7px]">
                <div className="relative h-full w-full overflow-hidden rounded-[5px]"><Still /></div>
              </div>
              <motion.div className="h-[10px] w-[336px] rounded-b-[10px]" initial={false} animate={{ backgroundColor: finish.side }} transition={{ duration: 0.4 }} />
            </motion.div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-[#6e6e73]">Size</span>
              <StretchNav items={SIZES.map((s) => s.n)} defaultIndex={1} onChange={setSize} />
            </div>
            <div role="radiogroup" aria-label="Chip" className="flex flex-col gap-2.5">
              <span className="text-[13px] font-semibold text-[#6e6e73]">Chip</span>
              {CHIPS.map((c) => {
                const on = c.id === chip;
                return (
                  <button key={c.id} type="button" role="radio" aria-checked={on} onClick={() => setChip(c.id)} className="relative flex items-center justify-between gap-4 rounded-[18px] px-5 py-4 text-left shadow-[0_0_0_1px_rgba(0,0,0,.07)] outline-none focus-visible:ring-2 focus-visible:ring-[#475569]">
                    {on && <motion.span layoutId="halcyon-chip" className="absolute inset-0 rounded-[18px]" style={{ boxShadow: `inset 0 0 0 2px ${A}`, background: "rgba(71,85,105,.05)" }} transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                    <span className="relative flex flex-col">
                      <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{c.n}</span>
                      <span className="text-[13px] tabular-nums text-[#6e6e73]">{c.s}</span>
                    </span>
                    <span className="relative text-[15px] font-semibold tabular-nums text-[#1d1d1f]">{c.add ? `+$${c.add}` : "Included"}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-[#6e6e73]">Finish · {finish.n}</span>
              <div role="radiogroup" aria-label="Finish" className="flex gap-3">
                {FINISHES.map((f) => {
                  const on = f.id === finish.id;
                  return (
                    <button key={f.id} type="button" role="radio" aria-checked={on} aria-label={f.n} onClick={() => setFinish(f)} className="relative flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#475569] focus-visible:ring-offset-2">
                      {on && <motion.span layoutId="halcyon-finish" className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 0 0 2px ${A}` }} transition={{ type: "spring", stiffness: 420, damping: 30 }} />}
                      <span className="h-8 w-8 rounded-full" style={{ background: `linear-gradient(140deg, ${f.top}, ${f.side})`, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)" }} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-black/[.06] pt-5">
              <div className="flex flex-col">
                <span className="text-[12px] font-medium text-[#6e6e73]">Halcyon {SIZES[size].n.replace("-inch", "")} · {CHIPS.find((c) => c.id === chip)?.n}</span>
                <span className="text-[34px] font-semibold tabular-nums tracking-[-0.04em] text-[#1d1d1f] leading-none">$<RollingNumber value={total} /></span>
              </div>
              <Magnetic className="text-white focus-visible:ring-[#475569]" style={{ background: A }}>Order</Magnetic>
            </div>
            <span className="text-[12px] text-[#6e6e73]">Ships in one to two weeks. Free returns within 14 days.</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function GsapMacbookLandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-white text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
        <Nav brand={<Logo />} accent={A} cta="Order" onCta={() => scrollToId("buy")} links={[{ label: "Performance", id: "performance" }, { label: "Display", id: "display" }, { label: "Pro apps", id: "grade" }, { label: "Ports", id: "ports" }, { label: "Buy", id: "buy" }]} />
        <Hero />
        <Stats />
        <Performance />
        <Display />
        <Grade />
        <Ports />
        <Details />
        <Buy />
        <section id="faq" className="bg-[#f5f5f7]">
          <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[1fr_1.4fr]">
            <SectionHead eyebrow="FAQ" title="Questions from the edit suite." accent={A} />
            <Reveal y={16} amount={0.1}>
              <Faq
                accent={A}
                items={[
                  { q: "Does it slow down on battery?", a: "No. HX2 and HX2 Max run at the same clocks on battery as plugged in. Battery life drops under a heavy export, of course: plan on about four hours of continuous 8K rendering." },
                  { q: "How loud do the fans get?", a: "Under a long render they reach about 30 dB(A) at arm's length, roughly a quiet office. For editing and grading they usually stay off." },
                  { q: "Can I drive external monitors?", a: "HX2 drives two external displays, HX2 Max drives four, including one 8K screen over HDMI." },
                  { q: "Is the display colour-accurate out of the box?", a: "Each panel is calibrated at the factory and ships with reference presets for HDR video, broadcast, photography and print." },
                  { q: "What's the 14-inch missing?", a: "Nothing but size: same chips, ports and display quality. It has a smaller battery, so it runs about 2 hours less." },
                ]}
              />
            </Reveal>
          </div>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 py-20">
          <CtaBand title="Finish the film on the plane home." sub="Halcyon 14 from $2,099. Halcyon 16 from $2,599. Order now, ships in one to two weeks." cta="Order Halcyon" secondary="Compare models" accent={A} glow="rgba(125,211,252,.28)" />
        </div>
        <Footer brand={<Logo />} note="Halcyon is a template. The brand, products, people and figures on this page are invented." columns={[{ title: "Shop", links: ["Halcyon 14", "Halcyon 16", "Accessories", "Education"] }, { title: "Support", links: ["Care plans", "Repairs", "Returns", "Contact"] }, { title: "Company", links: ["About", "Environment", "Careers", "Press"] }]} />
      </div>
    </MotionConfig>
  );
}
