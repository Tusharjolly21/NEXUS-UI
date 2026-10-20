"use client";
/**
 * Nova One: launch page template for a fanless 13.6-inch creative laptop.
 * Built in the Motion Kit style from Lit Keyboard, Before / After, Text Reveal,
 * Standing Calendar (as Battery Calendar), Capsule Toggles, Elastic Stepper,
 * Progress Button and the Price Odometer's rolling number.
 */
import { useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { MotionConfig, motion, useAnimationFrame, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import LitKeyboard from "@/components/templates/kit/components/LitKeyboard";
import BeforeAfter from "@/components/templates/kit/components/BeforeAfter";
import TextReveal from "@/components/templates/kit/components/TextReveal";
import { CapsuleToggle } from "@/components/templates/kit/components/CapsuleToggle";
import ElasticStepper from "@/components/templates/kit/components/ElasticStepper";
import ProgressButton from "@/components/templates/kit/components/ProgressButton";
import { RollingNumber } from "@/components/templates/kit/components/PriceOdometer";
import BatteryCalendar from "@/components/templates/nova-one/BatteryCalendar";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Stagger, StickyStory, Words, card, scrollToId } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const A = "#b45309"; // amber text and buttons (5:1 on white)
const GLOW = "#f59e0b"; // amber graphics

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="#1d1d1f" />
        <motion.circle cx="16" cy="16" r="6" fill={GLOW} animate={{ r: [5.5, 7, 5.5] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
      Nova
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Shared art: a dusk landscape drawn with gradients (no images)       */
/* ------------------------------------------------------------------ */

function Scene({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#263a63 0%,#7b6a9a 38%,#f0a46b 62%,#f7c98b 70%)" }} />
      <div className="absolute left-[58%] top-[46%] h-[16%] w-[10%] rounded-full" style={{ background: "radial-gradient(circle,#fff4d6 0 40%,rgba(255,226,170,.0) 72%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[42%]" style={{ background: "#7a4630", clipPath: "polygon(0 38%,18% 22%,36% 40%,55% 18%,74% 36%,100% 20%,100% 100%,0 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[30%]" style={{ background: "#4b2a1f", clipPath: "polygon(0 30%,24% 52%,46% 26%,70% 50%,88% 32%,100% 44%,100% 100%,0 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[14%]" style={{ background: "#2a1812" }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: drag the lamp, the display retunes itself to the room          */
/* ------------------------------------------------------------------ */

const FINISHES = [
  { id: "sand", n: "Sand", c: "#d9ccb6", edge: "#b9ab93" },
  { id: "graphite", n: "Graphite", c: "#5a5b60", edge: "#3f4044" },
  { id: "copper", n: "Copper", c: "#bf8262", edge: "#9b6045" },
];

function Laptop({ width = 760, finish = FINISHES[0], screen, tint, dim, glare }: { width?: number; finish?: (typeof FINISHES)[number]; screen: ReactNode; tint?: MotionValue<string>; dim?: MotionValue<number>; glare?: MotionValue<string> }) {
  const h = Math.round(width * 0.64);
  return (
    <div className="relative flex flex-col items-center" style={{ width: width * 1.12 }}>
      <div className="relative overflow-hidden rounded-t-[22px] bg-[#16161a] p-[10px] pb-[18px]" style={{ width, height: h, boxShadow: "0 0 0 1.5px #2c2c30" }}>
        <div className="relative h-full w-full overflow-hidden rounded-[10px] bg-[#f4f1ec]">
          {screen}
          {tint !== undefined && <motion.div className="pointer-events-none absolute inset-0" style={{ background: tint, mixBlendMode: "multiply" }} />}
          {dim !== undefined && <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: dim }} />}
          {glare !== undefined && <motion.div className="pointer-events-none absolute inset-0" style={{ background: glare }} />}
        </div>
        <span className="absolute left-1/2 top-[3px] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#2c2c30]" aria-hidden="true" />
      </div>
      <motion.div className="relative h-[16px] rounded-b-[14px]" style={{ width: width * 1.12 }} initial={false} animate={{ background: `linear-gradient(180deg, ${finish.c} 0%, ${finish.edge} 100%)` }} transition={{ duration: 0.4 }}>
        <span className="absolute left-1/2 top-0 h-[5px] w-[16%] -translate-x-1/2 rounded-b-[6px]" style={{ background: "rgba(0,0,0,.14)" }} />
      </motion.div>
    </div>
  );
}

function HeroScreen({ kelvin, nits }: { kelvin: MotionValue<string>; nits: MotionValue<string> }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex h-[26px] flex-none items-center gap-1.5 bg-white/80 px-3">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-[9px] w-[9px] rounded-full" style={{ background: c }} />)}
        <span className="ml-3 text-[11px] font-medium text-[#6e6e73]">Dusk, Wadi Rum · edit</span>
      </div>
      <div className="flex min-h-0 flex-1 gap-3 p-3">
        <div className="relative flex-1 overflow-hidden rounded-[8px]"><Scene /></div>
        <div className="flex w-[30%] flex-col gap-2.5 rounded-[8px] bg-white p-3 text-[#1d1d1f]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73]">Ambient</span>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#6e6e73]">White point</span>
            <motion.span className="text-[20px] font-semibold tabular-nums tracking-[-0.03em]">{kelvin}</motion.span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#6e6e73]">Brightness</span>
            <motion.span className="text-[20px] font-semibold tabular-nums tracking-[-0.03em]">{nits}</motion.span>
          </div>
          <div className="mt-auto flex flex-col gap-1.5">
            {[82, 64, 74, 48].map((w, i) => <span key={i} className="h-[6px] rounded-full bg-[#ece8e2]" style={{ width: `${w}%` }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function AmbientStage() {
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const u = useMotionValue(0.26);
  const v = useMotionValue(0.3);
  const us = useSpring(u, { stiffness: 140, damping: 20 });
  const vs = useSpring(v, { stiffness: 140, damping: 20 });
  const touched = useRef(false);
  const dragging = useRef(false);

  // Until the visitor grabs it, the lamp wanders slowly around the room.
  useAnimationFrame((t) => {
    if (touched.current || reduce) return;
    u.set(0.5 + 0.3 * Math.sin(t / 2600 - 0.9));
    v.set(0.34 + 0.16 * Math.sin(t / 1900 + 0.4));
  });

  const setFrom = (e: RPointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    u.set(Math.max(0.04, Math.min(0.96, (e.clientX - r.left) / r.width)));
    v.set(Math.max(0.06, Math.min(0.94, (e.clientY - r.top) / r.height)));
  };
  const onKey = (e: RKeyboardEvent) => {
    const d = e.shiftKey ? 0.15 : 0.05;
    const map: Record<string, [number, number]> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] };
    const m = map[e.key];
    if (!m) return;
    e.preventDefault();
    touched.current = true;
    u.set(Math.max(0.04, Math.min(0.96, u.get() + m[0])));
    v.set(Math.max(0.06, Math.min(0.94, v.get() + m[1])));
  };

  const kelvinN = useTransform(us, [0, 1], [2700, 6500]);
  const nitsN = useTransform(vs, [0.06, 0.94], [480, 90]);
  const kelvin = useTransform(kelvinN, (k) => `${(Math.round(k / 100) * 100).toLocaleString("en-US")} K`);
  const nits = useTransform(nitsN, (n) => `${Math.round(n / 10) * 10} nits`);
  const lux = useTransform(vs, [0.06, 0.94], [900, 40]);
  const luxText = useTransform(lux, (l) => `${Math.round(l / 10) * 10} lux`);
  const roomText = useTransform(us, (x) => (x < 0.35 ? "Warm lamp" : x > 0.65 ? "Daylight" : "Mixed light"));

  const lx = useTransform(us, (x) => x * 100);
  const ly = useTransform(vs, (y) => y * 100);
  const light = useTransform(us, [0, 0.5, 1], ["rgba(255,184,98,0.62)", "rgba(255,236,206,0.55)", "rgba(190,214,255,0.6)"]);
  const base = useTransform(vs, [0, 1], ["#f4f1ec", "#d8d3cb"]);
  const bg = useMotionTemplate`radial-gradient(640px circle at ${lx}% ${ly}%, ${light}, rgba(255,255,255,0) 64%), ${base}`;
  const tint = useTransform(us, [0, 0.5, 1], ["rgba(255,170,90,0.26)", "rgba(255,255,255,0)", "rgba(160,190,255,0.2)"]);
  const dim = useTransform(vs, [0, 1], [0, 0.22]);
  const gx = useTransform(us, (x) => 100 - x * 100);
  const glare = useMotionTemplate`radial-gradient(60% 80% at ${gx}% -10%, rgba(255,255,255,.28), rgba(255,255,255,0) 60%)`;
  const shadowX = useTransform(us, [0, 1], [70, -70]);
  const left = useMotionTemplate`${lx}%`;
  const top = useMotionTemplate`${ly}%`;

  return (
    <motion.div
      ref={stage}
      className="relative mx-auto h-[400px] w-full select-none overflow-hidden rounded-[36px] sm:h-[600px]"
      style={{ background: bg }}
    >
      <div className="absolute inset-x-0 bottom-[8%] flex justify-center sm:bottom-[12%]">
        <div className="relative">
          <motion.div className="absolute -bottom-6 left-[6%] right-[6%] h-10 rounded-[50%] bg-black/25 blur-2xl" style={{ x: shadowX }} aria-hidden="true" />
          <Fit className="!w-[min(86vw,860px)]"><Laptop screen={<HeroScreen kelvin={kelvin} nits={nits} />} tint={tint} dim={dim} glare={glare} /></Fit>
        </div>
      </div>

      <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
        <span className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-[12px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] backdrop-blur">
          <span className="h-2 w-2 rounded-full" style={{ background: GLOW }} />
          <motion.span>{roomText}</motion.span> · <motion.span className="tabular-nums">{luxText}</motion.span>
        </span>
      </div>

      <motion.button
        type="button"
        aria-label="Lamp. Drag it, or use the arrow keys, to change the light in the room."
        onKeyDown={onKey}
        onPointerDown={(e) => { touched.current = true; dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => dragging.current && setFrom(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="absolute z-10 -ml-7 -mt-7 flex h-14 w-14 cursor-grab touch-none items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#b45309] focus-visible:ring-offset-2 active:cursor-grabbing"
        style={{ left, top, background: "radial-gradient(circle at 40% 35%, #fff 0 18%, #ffe2a8 40%, #f59e0b 100%)", boxShadow: "0 0 0 6px rgba(255,255,255,.55), 0 0 60px 18px rgba(255,190,100,.55)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" /></svg>
      </motion.button>

      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3 py-1 text-[12px] font-medium text-[#424245] backdrop-blur sm:bottom-4">Drag the lamp. The display follows the room.</span>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-10 pt-12 sm:pt-16">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-5 px-5 text-center">
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 26 }} className="text-[15px] font-semibold" style={{ color: A }}>
          Nova One · 13.6-inch · fanless
        </motion.span>
        <h1 className="m-0 max-w-[900px] text-[clamp(44px,7.4vw,92px)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f] [text-wrap:balance]">
          <Words text="A screen that reads the room." className="justify-center" accentWords={["room."]} accent={A} />
        </h1>
        <Reveal delay={0.3} y={14}>
          <p className="m-0 max-w-[600px] text-[clamp(17px,2.1vw,21px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73]">
            0.92 kg, 22 hours on a charge, and not a single fan. Nova One matches its display to the light around you, so a late edit looks the way it will in daylight.
          </p>
        </Reveal>
        <Reveal delay={0.4} y={14} className="flex flex-wrap items-center justify-center gap-3">
          <Magnetic className="text-white focus-visible:ring-[#b45309]" style={{ background: A }} onClick={() => scrollToId("buy")}>Buy from $1,499</Magnetic>
          <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:ring-[#b45309]" onClick={() => scrollToId("display")}>See the display</Magnetic>
        </Reveal>
      </div>
      <motion.div className="mx-auto mt-10 max-w-[1280px] px-3 sm:px-5" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.2 }}>
        <AmbientStage />
      </motion.div>
    </section>
  );
}

function Stats() {
  const items = [
    { to: 0.92, f: (n: number) => `${n.toFixed(2)} kg`, l: "lighter than most of the bags it goes in" },
    { to: 22, f: (n: number) => `${Math.round(n)} hrs`, l: "of video playback, or about 15 of real work" },
    { to: 0, f: () => "0 dB", l: "fan noise, because there is no fan" },
    { to: 100, f: (n: number) => `${Math.round(n)}%`, l: "recycled aluminium in the case" },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-14" aria-label="Key numbers">
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

function Silent() {
  return (
    <section className="bg-[#f5f5f7] px-5 py-24" aria-label="Silent by design">
      <Reveal y={16}>
        <TextReveal lead="Silent while you're" words={["editing.", "mixing.", "writing.", "grading."]} sub="No fan anywhere. The N2 chip spreads its heat across the whole case, so there's nothing to spin up." accent={A} interval={2200} />
      </Reveal>
    </section>
  );
}

function ScreenShot({ cool }: { cool: boolean }) {
  return (
    <div className="absolute inset-0">
      <Scene />
      <div className="absolute inset-0" style={{ background: cool ? "rgba(150,190,255,.34)" : "rgba(255,190,120,.10)", mixBlendMode: cool ? "screen" : "multiply" }} />
      <div className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-semibold tabular-nums text-white backdrop-blur">{cool ? "Fixed at 6,500 K · 500 nits" : "Matched to room · 3,900 K · 210 nits"}</div>
    </div>
  );
}

function Display() {
  const specs = [
    ["2560 × 1664", "13.6-inch, 224 pixels per inch"],
    ["10 to 120 Hz", "Slows down on still pages to save power"],
    ["1,000 nits", "Readable outside, in actual sun"],
    ["Two light sensors", "One on each side of the lid"],
  ];
  return (
    <section id="display" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Display" title="Late-night edits that survive the morning." sub="Most screens stay cold and bright whatever the room is doing, so you overcorrect warm photos at night. Nova One shifts its white point and brightness with the light. Drag the divider to compare." accent={A} />
      <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
        <Reveal y={20} amount={0.15}>
          <BeforeAfter autoplay beforeLabel="Ambient off" afterLabel="Ambient on" before={<ScreenShot cool />} after={<ScreenShot cool={false} />} />
        </Reveal>
        <Stagger className="flex flex-col">
          {specs.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 border-t border-black/[.08] py-5">
              <span className="text-[24px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f]">{k}</span>
              <span className="text-[15px] text-[#6e6e73]">{v}</span>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Keyboard() {
  return (
    <section id="keyboard" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Keyboard" title="Every key, tuned to 38 grams." sub="We weighed each switch by hand until the whole board pressed the same. The backlight dims with the room, and lingers a moment where you typed." accent={A} />
          <Stagger className="flex flex-col gap-3">
            {["1.1 mm of travel, with a soft bottom-out", "Backlight follows the same light sensors as the display", "A fingerprint key that wakes and unlocks in one press"].map((t) => (
              <span key={t} className="flex items-center gap-3 text-[16px] text-[#1d1d1f]">
                <span className="h-2 w-2 flex-none rounded-full" style={{ background: GLOW }} />
                {t}
              </span>
            ))}
          </Stagger>
        </div>
        <Reveal y={20} amount={0.15}>
          <div className={`${card} flex flex-col items-center gap-3 px-4 py-10`}>
            <Fit><LitKeyboard glow={GLOW} autoplay /></Fit>
            <span className="text-[12px] text-[#6e6e73]">Click the field and type. Record a line, then replay it.</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Design story visuals                                                */
/* ------------------------------------------------------------------ */

function WakeVisual() {
  return (
    <div className={`${card} flex h-[400px] w-[440px] flex-col items-center justify-center gap-8`}>
      <div className="relative h-[150px] w-[260px]" style={{ perspective: 900 }}>
        <motion.div
          className="absolute bottom-[12px] left-[10px] h-[150px] w-[240px] origin-bottom overflow-hidden rounded-t-[12px] bg-[#16161a] p-[6px]"
          initial={{ rotateX: -86 }}
          animate={{ rotateX: [-86, -86, 0, 0, -86] }}
          transition={{ duration: 4.4, times: [0, 0.12, 0.42, 0.85, 1], repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[6px] bg-[#f4f1ec]" animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 4.4, times: [0, 0.3, 0.38, 0.85, 0.9], repeat: Infinity }}>
            <span className="text-[13px] font-semibold text-[#1d1d1f]">Welcome back, Ines</span>
            <span className="text-[11px] text-[#6e6e73]">Right where you left it</span>
          </motion.div>
        </motion.div>
        <div className="absolute bottom-0 left-0 h-[12px] w-[260px] rounded-b-[8px]" style={{ background: "linear-gradient(180deg,#d9ccb6,#b9ab93)" }} />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[56px] font-semibold tabular-nums leading-none tracking-[-0.05em] text-[#1d1d1f]">0.3 s</span>
        <span className="mt-2 text-[14px] text-[#6e6e73]">from lid open to a working cursor</span>
      </div>
    </div>
  );
}

function QuietVisual() {
  const rows = [
    { l: "Quiet bedroom at night", v: 28, c: "#d6d1c9" },
    { l: "Laptop with a fan, under load", v: 41, c: "#a8a29a" },
    { l: "Nova One, exporting 4K video", v: 0, c: GLOW },
  ];
  return (
    <div className={`${card} flex w-[440px] flex-col gap-6 p-7`}>
      <span className="text-[12px] font-semibold text-[#6e6e73]">Sound at 30 cm, dB(A)</span>
      {rows.map((r, i) => (
        <div key={r.l} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between text-[15px]">
            <span className="text-[#1d1d1f]">{r.l}</span>
            <span className="font-semibold tabular-nums text-[#1d1d1f]">{r.v === 0 ? "none" : r.v}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#f2efea]">
            <motion.div className="h-full origin-left rounded-full" style={{ width: `${Math.max(2, (r.v / 45) * 100)}%`, background: r.c }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.15 + i * 0.12 }} />
          </div>
        </div>
      ))}
      <svg viewBox="0 0 380 60" className="h-[60px] w-full" aria-hidden="true">
        <motion.path d="M0 30 C 40 30, 60 30, 95 30 S 150 30, 190 30 S 250 30, 285 30 S 340 30, 380 30" fill="none" stroke={GLOW} strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ type: "spring", stiffness: 40, damping: 14 }} />
      </svg>
      <span className="text-[13px] text-[#6e6e73]">A flat line. That&apos;s the whole graph.</span>
    </div>
  );
}

function RepairVisual() {
  const layers = [
    { l: "Lid · recycled aluminium", c: "#d9ccb6" },
    { l: "Display · swaps in 10 minutes", c: "#26262b" },
    { l: "Logic board · N2 chip", c: "#3f6b4d" },
    { l: "Battery · 6 screws, no glue", c: GLOW },
  ];
  return (
    <div className={`${card} flex h-[420px] w-[460px] items-center gap-2 px-6`}>
      <div className="relative h-[300px] w-[220px] flex-none" style={{ perspective: 1000 }}>
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: "rotateX(58deg) rotateZ(-34deg)" }}>
          {layers.map((ly, i) => (
            <motion.div
              key={ly.l}
              className="absolute left-[30px] top-[70px] h-[150px] w-[160px] rounded-[14px]"
              style={{ background: ly.c, boxShadow: "0 0 0 1px rgba(0,0,0,.08), 0 20px 30px -14px rgba(0,0,0,.4)" }}
              initial={{ z: 0 }}
              animate={{ z: [(3 - i) * 4, (3 - i) * 46, (3 - i) * 46, (3 - i) * 4] }}
              transition={{ duration: 5, times: [0, 0.3, 0.75, 1], repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {layers.map((ly) => (
          <li key={ly.l} className="flex items-center gap-2.5 text-[14px] text-[#1d1d1f]">
            <span className="h-3 w-3 flex-none rounded-[4px]" style={{ background: ly.c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)" }} />
            {ly.l}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Design() {
  return (
    <section id="design" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Designed to last" title="Small things you notice every day." accent={A} />
      <div className="mt-6">
        <StickyStory
          accent={A}
          steps={[
            { kicker: "Instant on", title: "Awake before you sit down.", body: "Open the lid and Nova One is already where you left it. No boot screen, no logo, no waiting for the cursor.", visual: <WakeVisual /> },
            { kicker: "Battery", title: "22 hours, measured on ordinary days.", body: "This is one tester's six months: most days ended with charge to spare. Stand the grid up to see the long ones.", visual: <div className={`${card} p-6`}><BatteryCalendar weeks={24} noun="hours on battery" autoplay /></div> },
            { kicker: "Thermals", title: "Nothing to hear. Ever.", body: "A passive copper spreader and the aluminium case do the cooling. Under a long export it gets warm, and stays silent.", visual: <QuietVisual /> },
            { kicker: "Repair", title: "Opens with one screwdriver.", body: "Standard screws, labelled cables and a battery that lifts out. Repair guides and parts are on our site, at cost.", visual: <RepairVisual /> },
          ]}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Configure and buy                                                   */
/* ------------------------------------------------------------------ */

const TIERS = [
  { id: "essential", n: "Essential", s: "N2 · 12-core · 16 GB · 512 GB", p: 1499 },
  { id: "studio", n: "Studio", s: "N2 · 14-core · 24 GB · 1 TB", p: 1999 },
  { id: "atelier", n: "Atelier", s: "N2 · 18-core · 32 GB · 2 TB", p: 2799 },
];
const ADDONS = [
  { id: "engrave", l: "Engraving", h: "Free · adds 2 days", p: 0 },
  { id: "care", l: "NovaCare+ for 3 years", h: "Accidents and a battery swap · $199", p: 199 },
  { id: "charger", l: "Second 35W charger", h: "One for the bag · $49", p: 49 },
];

function BuyScreen({ finish }: { finish: (typeof FINISHES)[number] }) {
  return (
    <div className="absolute inset-0">
      <motion.div className="absolute inset-0" initial={false} animate={{ background: `radial-gradient(80% 90% at 30% 20%, #fff 0%, ${finish.c} 60%, ${finish.edge} 100%)` }} transition={{ duration: 0.5 }} />
      <span className="absolute bottom-[10%] left-[8%] text-[28px] font-semibold tracking-[-0.04em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,.3)]">Nova One</span>
    </div>
  );
}

function Buy() {
  const [finish, setFinish] = useState(FINISHES[0]);
  const [tier, setTier] = useState(TIERS[1].id);
  const [adds, setAdds] = useState<Record<string, boolean>>({ engrave: true, care: false, charger: false });
  const [qty, setQty] = useState(1);
  const t = TIERS.find((x) => x.id === tier)!;
  const total = useMemo(() => (t.p + ADDONS.reduce((s, a) => s + (adds[a.id] ? a.p : 0), 0)) * qty, [t, adds, qty]);
  return (
    <section id="buy" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Buy" title="Make it yours." sub="Three configurations, three finishes. Every Nova One has the same display, keyboard and battery." accent={A} center />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
          <Reveal y={20} amount={0.1}>
            <div className={`${card} flex h-full flex-col items-center justify-center gap-8 px-5 py-10`}>
              <Fit max={1}><Laptop width={420} finish={finish} screen={<BuyScreen finish={finish} />} /></Fit>
              <div className="flex flex-col items-center gap-3">
                <div role="radiogroup" aria-label="Finish" className="flex gap-3">
                  {FINISHES.map((f) => {
                    const on = f.id === finish.id;
                    return (
                      <button key={f.id} type="button" role="radio" aria-checked={on} aria-label={f.n} onClick={() => setFinish(f)} className="relative flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#b45309] focus-visible:ring-offset-2">
                        {on && <motion.span layoutId="nova-finish" className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 0 0 2px ${A}` }} transition={{ type: "spring", stiffness: 420, damping: 30 }} />}
                        <span className="h-8 w-8 rounded-full" style={{ background: `linear-gradient(140deg, ${f.c}, ${f.edge})`, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)" }} />
                      </button>
                    );
                  })}
                </div>
                <span className="text-[14px] font-medium text-[#1d1d1f]">{finish.n}</span>
              </div>
            </div>
          </Reveal>
          <Reveal y={20} delay={0.06} amount={0.1}>
            <div className={`${card} flex h-full flex-col gap-6 p-6 sm:p-7`}>
              <div role="radiogroup" aria-label="Configuration" className="flex flex-col gap-2.5">
                {TIERS.map((x) => {
                  const on = x.id === tier;
                  return (
                    <button key={x.id} type="button" role="radio" aria-checked={on} onClick={() => setTier(x.id)} className="relative flex items-center justify-between gap-4 rounded-[18px] px-5 py-4 text-left shadow-[0_0_0_1px_rgba(0,0,0,.07)] outline-none focus-visible:ring-2 focus-visible:ring-[#b45309]">
                      {on && <motion.span layoutId="nova-tier" className="absolute inset-0 rounded-[18px]" style={{ boxShadow: `inset 0 0 0 2px ${A}`, background: "rgba(245,158,11,.06)" }} transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                      <span className="relative flex flex-col">
                        <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{x.n}</span>
                        <span className="text-[13px] tabular-nums text-[#6e6e73]">{x.s}</span>
                      </span>
                      <span className="relative text-[16px] font-semibold tabular-nums text-[#1d1d1f]">${x.p.toLocaleString("en-US")}</span>
                    </button>
                  );
                })}
              </div>
              <ul className="m-0 flex list-none flex-col divide-y divide-black/[.06] p-0">
                {ADDONS.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <span className="flex flex-1 flex-col">
                      <span className="text-[15px] font-medium text-[#1d1d1f]">{a.l}</span>
                      <span className="text-[13px] text-[#6e6e73]">{a.h}</span>
                    </span>
                    <CapsuleToggle label={a.l} checked={adds[a.id]} onColor={GLOW} onChange={(val) => setAdds((s) => ({ ...s, [a.id]: val }))} />
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/[.06] pt-5">
                <ElasticStepper label="Quantity" min={1} max={5} defaultValue={1} onChange={setQty} accent={A} />
                <div className="flex flex-col items-end">
                  <span className="text-[12px] font-medium text-[#6e6e73]">Total</span>
                  <span className="text-[34px] font-semibold tabular-nums tracking-[-0.04em] text-[#1d1d1f]">$<RollingNumber value={total} /></span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ProgressButton label="Add to bag" doneLabel="Review bag" accent={A} />
                <span className="text-[12px] text-[#6e6e73]">Ships in 5 to 7 business days. Free returns for 30 days.</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Specs() {
  const groups = [
    { k: "Chip", v: ["N2, 12 to 18 cores", "16-core neural engine", "Up to 32 GB memory"] },
    { k: "Display", v: ["13.6-inch, 2560 × 1664", "10 to 120 Hz", "1,000 nits peak, P3"] },
    { k: "Battery", v: ["66 Wh", "Up to 22 hours video", "35W charger in the box"] },
    { k: "Size and weight", v: ["0.92 kg", "11.3 mm thin", "30.4 × 21.5 cm"] },
    { k: "Ports", v: ["Two USB-C, 40 Gb/s", "Headphone jack", "Charges from either side"] },
    { k: "Wireless", v: ["Wi-Fi 7", "Bluetooth 5.4", "1080p camera, mic array"] },
  ];
  return (
    <section id="specs" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Tech specs" title="The short version." accent={A} />
      <Stagger className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div key={g.k} className={`${card} flex h-full flex-col gap-3 p-6`}>
            <span className="text-[13px] font-semibold" style={{ color: A }}>{g.k}</span>
            {g.v.map((x, i) => <span key={x} className={i === 0 ? "text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]" : "text-[15px] text-[#6e6e73]"}>{x}</span>)}
          </div>
        ))}
      </Stagger>
      <Reveal y={12} className="mt-8">
        <p className="m-0 text-[15px] leading-[1.5] text-[#6e6e73]"><b className="font-semibold text-[#1d1d1f]">In the box:</b> Nova One, a 35W USB-C charger and a 2 m braided cable, in one moulded-pulp tray. No foam, no plastic ties.</p>
      </Reveal>
    </section>
  );
}

export function NovaLandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-white text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
        <Nav brand={<Logo />} accent={A} cta="Buy" onCta={() => scrollToId("buy")} links={[{ label: "Display", id: "display" }, { label: "Keyboard", id: "keyboard" }, { label: "Design", id: "design" }, { label: "Specs", id: "specs" }, { label: "FAQ", id: "faq" }]} />
        <Hero />
        <Stats />
        <Silent />
        <Display />
        <Keyboard />
        <Design />
        <Buy />
        <Specs />
        <section id="faq" className="bg-[#f5f5f7]">
          <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[1fr_1.4fr]">
            <SectionHead eyebrow="FAQ" title="Before you order." accent={A} />
            <Reveal y={16} amount={0.1}>
              <Faq
                accent={A}
                items={[
                  { q: "What's actually different about Nova One?", a: "It has no fan at all, and the chip is tuned for long, steady work instead of short bursts. So it doesn't slow down half an hour into an export, and it never makes a sound." },
                  { q: "Does the ambient display mess with colour work?", a: "Turn it off in one click, or lock it to a calibrated preset while you grade. It only adjusts white point and brightness, never contrast or saturation." },
                  { q: "When will it ship?", a: "Most configurations ship in 5 to 7 business days. Engraving adds two days. You'll get a tracking link the day it leaves." },
                  { q: "What if I don't like it?", a: "Send it back within 30 days for a full refund, and we pay the shipping. Engraved machines can be exchanged but not refunded." },
                  { q: "Will my apps run?", a: "Most editing, audio, 3D and coding tools ship native builds for the N2. Older apps run through a built-in translation layer, usually without you noticing." },
                ]}
              />
            </Reveal>
          </div>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 py-20">
          <CtaBand title="Quiet, light, and ready when you open it." sub="Nova One starts at $1,499. Order today and it ships within a week." cta="Buy Nova One" secondary="Compare configurations" accent={A} glow="rgba(245,158,11,.32)" />
        </div>
        <Footer brand={<Logo />} note="Nova One is a template. The company, product and figures on this page are invented." columns={[{ title: "Shop", links: ["Nova One", "Accessories", "Education", "Gift cards"] }, { title: "Support", links: ["Repair guides", "NovaCare+", "Returns", "Contact"] }, { title: "Company", links: ["About", "Environment", "Careers", "Press"] }]} />
      </div>
    </MotionConfig>
  );
}

export default NovaLandingPage;
