"use client";
/**
 * Nova Studio: landing page template for an independent creative studio
 * (branding, motion and web). Built on Motion Kit: Curved Reel, Before / After,
 * Fan Deck, Scrub Inputs, Component Layers, Glass Lens, Capsule Toggles and
 * Sign & Seal, plus the shared template parts.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import CurvedReel from "@/components/templates/kit/components/CurvedReel";
import BeforeAfter from "@/components/templates/kit/components/BeforeAfter";
import FanDeck from "@/components/templates/kit/components/FanDeck";
import ScrubInput from "@/components/templates/kit/components/ScrubInput";
import ComponentLayers from "@/components/templates/kit/components/ComponentLayers";
import GlassLens from "@/components/templates/kit/components/GlassLens";
import { CapsuleToggle } from "@/components/templates/kit/components/CapsuleToggle";
import SignBadge from "@/components/templates/kit/components/SignBadge";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Marquee, Nav, Reveal, SectionHead, Stagger, StickyStory, card, scrollToId } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const SERIF = 'ui-serif, "New York", "Iowan Old Style", Georgia, serif';
const A = "#e11d48"; // rose, 4.7:1 on white
const INK = "#1d1d1f";
const spring = { type: "spring", stiffness: 320, damping: 28 } as const;

/** Media query hook that starts false on the server and on first paint, so hydration always matches. */
function useMq(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return m;
}

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-bold tracking-[-0.04em]">
      <motion.svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
        <path d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12 7.5-1.8 11.1-5.4 12-12z" fill={A} />
      </motion.svg>
      NOVA
      <span className="font-medium text-[#6e6e73]">Studio</span>
    </span>
  );
}

/* ------------------------------------------------------------------ hero */

const DISCIPLINES = [
  { word: "Branding", count: 58, line: "Identity, naming, packaging", project: "Halden Coffee · identity refresh" },
  { word: "Motion", count: 41, line: "Brand motion, launch films, UI motion", project: "Pilot Bikes · launch film" },
  { word: "Web", count: 47, line: "Marketing sites and design systems", project: "Sora Health · marketing site" },
];

const PW = 300;
const PH = 214;

/** One frame of a discipline's mini reel. Each has one moving part. */
function Frame({ d, f }: { d: number; f: number }) {
  if (d === 0) {
    if (f === 0)
      return (
        <div className="flex h-full items-center justify-center bg-[#2b1d14]">
          <span className="text-[58px] font-semibold tracking-[-0.07em] text-[#f6e7d4]">
            halden<motion.span className="inline-block text-[#ff6a3d]" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 12, delay: 0.25 }}>.</motion.span>
          </span>
        </div>
      );
    if (f === 1)
      return (
        <div className="flex h-full">
          {["#2b1d14", "#c8a27a", "#ff6a3d", "#f6e7d4", "#8fa58a"].map((c, i) => (
            <motion.span key={c} className="h-full flex-1 origin-bottom" style={{ background: c }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ type: "spring", stiffness: 260, damping: 22, delay: i * 0.05 }} />
          ))}
        </div>
      );
    return (
      <div className="flex h-full items-end justify-center gap-3 bg-[#f6e7d4] pb-0">
        {[0, 1].map((i) => (
          <motion.div key={i} className="flex h-[150px] w-[92px] flex-col justify-between rounded-t-[14px] p-3" style={{ background: i ? "#2b1d14" : "#ff6a3d" }} initial={{ y: 60 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 18, delay: i * 0.08 }}>
            <span className="text-[17px] font-semibold tracking-[-0.06em]" style={{ color: i ? "#f6e7d4" : "#2b1d14" }}>halden.</span>
            <span className="text-[9px] font-medium uppercase tracking-[0.14em]" style={{ color: i ? "#c8a27a" : "#2b1d14" }}>{i ? "Washed · Huila" : "House · Espresso"}</span>
          </motion.div>
        ))}
      </div>
    );
  }
  if (d === 1) {
    if (f === 0)
      return (
        <div className="relative h-full overflow-hidden bg-[#e11d48]">
          <motion.span className="absolute bottom-6 left-1/2 -ml-6 h-12 w-12 rounded-full bg-white" animate={{ y: [0, -110, 0], scaleY: [0.8, 1.05, 0.8], scaleX: [1.15, 0.95, 1.15] }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }} />
          <span className="absolute bottom-5 left-1/2 h-[3px] w-24 -translate-x-1/2 rounded-full bg-black/20" />
        </div>
      );
    if (f === 1)
      return (
        <div className="flex h-full items-center overflow-hidden bg-[#1d1d1f]">
          <motion.span className="whitespace-nowrap text-[76px] font-bold italic tracking-[-0.06em] text-white" initial={{ x: 280, skewX: -18 }} animate={{ x: 26, skewX: 0 }} transition={{ type: "spring", stiffness: 140, damping: 16 }}>
            PILOT
          </motion.span>
        </div>
      );
    return (
      <div className="flex h-full items-center justify-center bg-[#fff1f3]">
        <motion.svg width="110" height="110" viewBox="0 0 24 24" aria-hidden="true" initial={{ rotate: -90, scale: 0.4 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 12 }}>
          <path d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12 7.5-1.8 11.1-5.4 12-12z" fill="#e11d48" />
        </motion.svg>
      </div>
    );
  }
  if (f === 0)
    return (
      <div className="flex h-full flex-col bg-[#dff3ea] p-3">
        <div className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#0f3d2e]/30" />)}</div>
        <motion.div className="mt-3 flex flex-1 flex-col gap-2 rounded-[10px] bg-white p-3" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 240, damping: 22 }}>
          <span className="text-[22px] font-semibold leading-[1] tracking-[-0.04em] text-[#0f3d2e]">Care that<br />comes to you.</span>
          <span className="h-1.5 w-3/4 rounded-full bg-[#0f3d2e]/15" />
          <span className="h-1.5 w-1/2 rounded-full bg-[#0f3d2e]/15" />
          <span className="mt-auto h-6 w-20 rounded-full bg-[#0f3d2e]" />
        </motion.div>
      </div>
    );
  if (f === 1)
    return (
      <div className="grid h-full grid-cols-3 gap-2 bg-[#0f3d2e] p-3">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.span key={i} className="rounded-[8px] bg-[#dff3ea]" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 380, damping: 20, delay: i * 0.05 }} />
        ))}
      </div>
    );
  return (
    <div className="flex h-full items-center justify-center bg-[#dff3ea]">
      <motion.div className="h-[170px] w-[86px] rounded-[18px] border-[4px] border-[#0f3d2e] bg-white p-2" initial={{ y: 40, rotate: 8 }} animate={{ y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 16 }}>
        <span className="block h-10 rounded-[8px] bg-[#0f3d2e]" />
        <span className="mt-2 block h-1.5 w-3/4 rounded-full bg-[#0f3d2e]/20" />
        <span className="mt-1.5 block h-1.5 w-1/2 rounded-full bg-[#0f3d2e]/20" />
      </motion.div>
    </div>
  );
}

/** A three-frame reel for one discipline. Remount with a new key to restart it. */
function Reel({ d, className = "" }: { d: number; className?: string }) {
  const [f, setF] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setF((n) => (n + 1) % 3), 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={`overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_30px_60px_-24px_rgba(0,0,0,.45)] ${className}`}>
      <div className="relative h-[calc(100%-38px)] overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div key={f} className="absolute inset-0" initial={{ clipPath: "inset(0 0 0 100%)" }} animate={{ clipPath: "inset(0 0 0 0%)" }} exit={{ opacity: 0.4 }} transition={{ type: "spring", stiffness: 200, damping: 30 }}>
            <Frame d={d} f={f} />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-x-3 top-3 flex gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/40">
              {i <= f && <motion.span className="block h-full bg-white" initial={{ width: i < f ? "100%" : "0%" }} animate={{ width: "100%" }} transition={{ duration: i < f ? 0 : 1.5, ease: "linear" }} />}
            </span>
          ))}
        </div>
      </div>
      <div className="flex h-[38px] items-center justify-between px-3.5 text-[12px]">
        <span className="font-semibold text-[#1d1d1f]">{DISCIPLINES[d].project}</span>
        <span className="tabular-nums text-[#6e6e73]">0{f + 1}/03</span>
      </div>
    </div>
  );
}

function Hero() {
  const fine = useMq("(hover: hover) and (pointer: fine)");
  const wide = useMq("(min-width: 768px)");
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [ready, setReady] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const x = useSpring(tx, { stiffness: 230, damping: 24, mass: 0.7 });
  const y = useSpring(ty, { stiffness: 230, damping: 24, mass: 0.7 });
  const vx = useVelocity(x);
  const rotate = useSpring(useTransform(vx, [-1800, 0, 1800], [-11, 0, 11]), { stiffness: 300, damping: 30 });

  // When the pointer is not driving it, the preview parks at the right end of the active row.
  const park = useCallback((instant = false) => {
    const b = box.current, r = rows.current[active];
    if (!b || !r) return;
    const px = b.clientWidth - PW - 4;
    const py = r.offsetTop + r.offsetHeight / 2 - PH / 2;
    tx.set(px); ty.set(py);
    if (instant) { x.jump(px); y.jump(py); }
  }, [active, tx, ty, x, y]);

  useLayoutEffect(() => {
    if (!wide) return;
    if (!hovering) park(!ready);
    if (!ready) setReady(true);
  }, [wide, hovering, park, ready]);

  useEffect(() => {
    const on = () => park();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [park]);

  // Idle: cycle through the disciplines so the hero is never still.
  useEffect(() => {
    if (hovering) return;
    const t = setInterval(() => setActive((a) => (a + 1) % DISCIPLINES.length), 3600);
    return () => clearInterval(t);
  }, [hovering]);

  const follow = (e: React.PointerEvent) => {
    if (!fine || !box.current) return;
    const r = box.current.getBoundingClientRect();
    tx.set(Math.max(0, Math.min(r.width - PW, e.clientX - r.left + 28)));
    ty.set(Math.max(-40, Math.min(r.height - PH + 40, e.clientY - r.top - PH / 2)));
  };

  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pt-14">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(40% 40% at 88% 20%, rgba(225,29,72,.10), transparent 70%)" }} />
      <div className="relative mx-auto max-w-[1280px] px-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.4fr] md:items-end">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="m-0 flex flex-col gap-1 text-[13px] font-medium text-[#6e6e73]">
            <span className="text-[#1d1d1f]">Independent studio, est. 2016</span>
            <span>Lisbon and remote · 14 people</span>
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.05 }} className="m-0 max-w-[680px] text-[clamp(26px,3.2vw,42px)] font-semibold leading-[1.1] tracking-[-0.035em] text-[#1d1d1f] [text-wrap:balance]">
            We design brands, make them <span style={{ fontFamily: SERIF, color: A }} className="font-normal italic">move</span>, and build the sites they live on.
          </motion.h1>
        </div>

        <nav
          ref={box}
          aria-label="Disciplines"
          className="relative mt-10 border-b border-black/[.08] sm:mt-14"
          onPointerEnter={() => fine && setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onPointerMove={follow}
        >
          {DISCIPLINES.map((d, i) => {
            const on = active === i;
            return (
              <motion.button
                key={d.word}
                ref={(el) => { rows.current[i] = el; }}
                type="button"
                aria-label={`${d.word}: ${d.count} projects. See the work`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => (fine || on ? scrollToId("work") : setActive(i))}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 200, damping: 26, delay: 0.12 + i * 0.08 }}
                className="grid w-full grid-cols-[40px_1fr] items-center gap-2 border-t border-black/[.08] py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48] focus-visible:ring-offset-2 md:grid-cols-[170px_1fr] md:py-2"
              >
                <span className="flex flex-col gap-1 self-start pt-3 md:pt-6">
                  <span className="text-[13px] font-semibold tabular-nums" style={{ color: on ? A : "#6e6e73" }}>0{i + 1}</span>
                  <span className="hidden text-[13px] leading-[1.35] text-[#6e6e73] md:block">{d.line}</span>
                  <span className="hidden text-[13px] tabular-nums text-[#6e6e73] md:block">{d.count} projects</span>
                </span>
                <motion.span
                  className="block text-[clamp(64px,12.6vw,188px)] font-semibold leading-[0.9] tracking-[-0.068em]"
                  animate={{ x: on ? 14 : 0, color: on ? A : INK }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  {d.word}
                  <motion.span aria-hidden="true" className="ml-3 inline-block align-middle text-[0.32em]" animate={{ opacity: on ? 1 : 0, x: on ? 0 : -20 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>↘</motion.span>
                </motion.span>
              </motion.button>
            );
          })}
          {wide && (
            <motion.div className="pointer-events-none absolute left-0 top-0 z-10" style={{ x, y, rotate, width: PW, height: PH, opacity: ready ? 1 : 0 }} aria-hidden="true">
              <motion.div className="h-full w-full" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: hovering ? 1.04 : 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: hovering ? 0 : 0.4 }}>
                <Reel key={active} d={active} className="h-full w-full" />
              </motion.div>
            </motion.div>
          )}
        </nav>

        {!wide && (
          <div className="mt-6" aria-hidden="true">
            <Reel key={active} d={active} className="h-[230px] w-full" />
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.45 }} className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <Magnetic className="text-white shadow-[0_10px_30px_-12px_rgba(225,29,72,.8)] focus-visible:ring-[#e11d48]" style={{ background: A }} onClick={() => scrollToId("contact")}>Start a project</Magnetic>
            <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.1)] focus-visible:ring-[#e11d48]" onClick={() => scrollToId("work")}>Watch the reel</Magnetic>
          </div>
          <span className="flex items-center gap-2 text-[13px] text-[#6e6e73]">
            <motion.span className="h-2 w-2 rounded-full bg-[#30d158]" animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
            Booking new projects from February 2027. {fine ? "Hover a discipline to preview it." : "Tap a discipline to preview it."}
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ work reel */

const POSTERS = [
  { bg: "#2b1d14", fg: "#f6e7d4", big: "Halden", small: "Identity · 2026", serif: true },
  { bg: "#e11d48", fg: "#ffffff", big: "Pilot", small: "Launch film · 2025" },
  { bg: "#dff3ea", fg: "#0f3d2e", big: "Sora", small: "Website · 2026" },
  { bg: "#1d1d1f", fg: "#f5f5f7", big: "Ōto", small: "Sonic brand · 2024", serif: true },
  { bg: "#ffd60a", fg: "#1d1d1f", big: "Kiln", small: "Packaging · 2025" },
  { bg: "#3a3fd9", fg: "#ffffff", big: "Vela", small: "Motion system · 2024" },
  { bg: "#f2efe6", fg: "#1d1d1f", big: "Fable", small: "Book series · 2023", serif: true },
  { bg: "#0b6b50", fg: "#eafff5", big: "Moss", small: "Rebrand · 2025" },
  { bg: "#ff7a45", fg: "#1d1d1f", big: "Tide", small: "App launch · 2026" },
  { bg: "#e5e5ea", fg: "#1d1d1f", big: "N°9", small: "Studio archive" },
];

const CLIENTS = ["Halden Coffee", "Pilot Bikes", "Sora Health", "Ōto Audio", "Kiln Ceramics", "Vela Sailing", "Fable Press", "Moss Bank", "Tide Weather", "Arca Museum"];

function Work() {
  return (
    <section id="work" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHead eyebrow="Selected work, 2023–2026" title="Ten projects we'd show our parents." accent={A} />
        <Reveal y={12}><p className="m-0 max-w-[340px] text-[15px] leading-[1.5] text-[#6e6e73]">A slice of 146 projects. Every one was designed, animated and built by the same team.</p></Reveal>
      </div>
      <Reveal y={20} amount={0.1} className="mt-10 px-2"><CurvedReel posters={POSTERS} autoplay /></Reveal>
      <div className="mt-12">
        <Marquee speed={32}>
          {CLIENTS.map((c, i) => (
            <span key={c} className="mx-8 text-[22px] tracking-[-0.02em] text-[#6e6e73] transition-colors hover:text-[#1d1d1f]" style={i % 2 ? { fontFamily: SERIF, fontStyle: "italic" } : { fontWeight: 600 }}>{c}</span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ case study */

function OldMark() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#efe6d2]">
      <div className="flex h-[62%] aspect-square flex-col items-center justify-center gap-1 rounded-full border-[6px] border-double border-[#6b4f3a] text-[#6b4f3a]">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9zM16 10h2a2 2 0 0 1 0 4h-2M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" /></svg>
        <span className="text-[clamp(11px,1.6vw,18px)] font-bold uppercase tracking-[0.08em]" style={{ fontFamily: SERIF }}>Halden Coffee Co.</span>
        <span className="text-[clamp(8px,1vw,11px)] uppercase tracking-[0.2em]">Est. 1984 · Fresh roasted</span>
      </div>
    </div>
  );
}

function NewMark() {
  return (
    <div className="relative flex h-full w-full items-center justify-between overflow-hidden bg-[#2b1d14] px-[7%]">
      <div className="flex flex-col gap-2">
        <span className="text-[clamp(44px,8vw,104px)] font-semibold leading-[0.9] tracking-[-0.075em] text-[#f6e7d4]">halden<span className="text-[#ff6a3d]">.</span></span>
        <span className="text-[clamp(10px,1.2vw,13px)] font-medium uppercase tracking-[0.18em] text-[#c8a27a]">Roasted in Porto since 1984</span>
      </div>
      <div className="hidden h-[70%] w-[22%] flex-col justify-between rounded-t-[18px] bg-[#ff6a3d] p-[2%] sm:flex">
        <span className="text-[clamp(14px,1.6vw,20px)] font-semibold tracking-[-0.06em] text-[#2b1d14]">halden.</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2b1d14]">House espresso<br />250 g</span>
      </div>
    </div>
  );
}

function CaseStudy() {
  const facts = [
    { to: 31, f: (n: number) => `+${Math.round(n)}%`, l: "wholesale enquiries in the first quarter after launch" },
    { to: 9, f: (n: number) => `${Math.round(n)} wks`, l: "from kickoff to bags on shelves" },
    { to: 14, f: (n: number) => `${Math.round(n)}`, l: "bag designs from one flexible system" },
  ];
  return (
    <section id="case" className="mx-auto max-w-[1280px] px-5 py-20 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
        <Reveal y={20}>
          <BeforeAfter autoplay before={<OldMark />} after={<NewMark />} beforeLabel="1984 badge" afterLabel="2026 identity" />
          <p className="m-0 mt-3 text-center text-[13px] text-[#6e6e73]">Drag across the image, or use the arrow keys on the handle.</p>
        </Reveal>
        <div className="flex flex-col gap-7">
          <SectionHead eyebrow="Case study · Halden Coffee" title="A forty-year-old roaster, redrawn for the next forty." accent={A} />
          <Reveal y={14}>
            <p className="m-0 text-[17px] leading-[1.55] text-[#6e6e73]">
              Halden&apos;s badge was loved locally and invisible everywhere else. We kept the warmth, dropped the clip art, and drew a wordmark that holds up on a cup lid and a forty-foot truck. Then we built the bag system so their team can launch a new origin in an afternoon.
            </p>
          </Reveal>
          <Stagger className="flex flex-col">
            {facts.map((f) => (
              <div key={f.l} className="flex items-baseline gap-5 border-t border-black/[.08] py-4">
                <Counter to={f.to} format={f.f} className="w-[120px] flex-none text-[34px] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
                <span className="text-[15px] leading-[1.45] text-[#6e6e73]">{f.l}</span>
              </div>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ services story */

const HALDEN_CHIPS = [
  { name: "Espresso", hex: "#2B1D14" },
  { name: "Fig", hex: "#6B3A5B" },
  { name: "Clay", hex: "#B5523B" },
  { name: "Ember", hex: "#FF6A3D" },
  { name: "Marigold", hex: "#F2A93B" },
  { name: "Crema", hex: "#C8A27A" },
  { name: "Oat", hex: "#F6E7D4" },
  { name: "Sage", hex: "#8FA58A" },
  { name: "Moss", hex: "#4F6B4A" },
  { name: "Porto", hex: "#2E4A6B" },
  { name: "Slate", hex: "#5B6573" },
  { name: "Ink", hex: "#1D1D1F" },
];

function Specimen() {
  return (
    <div className="flex h-full flex-col justify-between bg-[#faf7f2] p-7">
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6e6e73]">Halden Grotesk · Specimen</span>
        <span className="text-[12px] tabular-nums text-[#6e6e73]">v2.3</span>
      </div>
      <span className="text-[112px] font-semibold leading-[0.85] tracking-[-0.07em] text-[#2b1d14]">Rg<span className="text-[#ff6a3d]">.</span></span>
      <p className="m-0 max-w-[400px] text-[12px] leading-[1.5] text-[#2b1d14]">
        Ink traps at every joint so the letters stay open at 9 px on a receipt. The &lsquo;g&rsquo; carries a single-storey tail; the full stop is the brand&apos;s ember dot.
      </p>
    </div>
  );
}

function Services() {
  return (
    <section id="services" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="What we do" title="One team from first sketch to last deploy." sub="Most studios hand the brand to a motion shop and the motion to a dev agency. We don't, so the idea survives all three." accent={A} />
        <div className="mt-8">
          <StickyStory
            accent={A}
            steps={[
              { kicker: "01 · Branding", title: "Systems, not just logos.", body: "Strategy, naming, wordmark, type and colour, written down as rules your team can use. Open the deck: this is Halden's full palette. Click a chip to copy its hex.", visual: <div className={`${card} p-6`}><FanDeck chips={HALDEN_CHIPS} autoplay /></div> },
              { kicker: "02 · Motion", title: "Every curve, tuned by hand.", body: "Logo animations, launch films and UI motion. We set radius, rotation and timing the way you'd set type: by eye, in small steps. Drag a label to try it.", visual: <div className={`${card} flex justify-center p-8`}><ScrubInput accent={A} autoplay /></div> },
              { kicker: "03 · Web", title: "Sites built from the brand's own parts.", body: "Design systems in Figma and code, then a fast marketing site on Next.js. Every screen is the same few layers, so new pages stay on-brand without us.", visual: <div className={`${card} p-6`}><ComponentLayers accent={A} autoplay /></div> },
              { kicker: "04 · Craft", title: "Look closer. We did.", body: "The details nobody asks for are the ones people remember. Drag the lens over Halden's typeface to see the ink traps we drew for tiny sizes.", visual: <GlassLens width={480} height={300} size={150} zoom={1.7} autoplay><Specimen /></GlassLens> },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ studio */

const TEAM = [
  { n: "Inês Duarte", r: "Founder, creative director", h: 350 },
  { n: "Tomás Reis", r: "Design director", h: 20 },
  { n: "Mei Lindqvist", r: "Motion lead", h: 280 },
  { n: "Jonah Okafor", r: "Technical director", h: 200 },
  { n: "Clara Moreau", r: "Brand strategist", h: 40 },
  { n: "Rafael Costa", r: "Producer", h: 160 },
];

function Studio() {
  const stats = [
    { to: 146, f: (n: number) => `${Math.round(n)}`, l: "projects shipped since 2016" },
    { to: 14, f: (n: number) => `${Math.round(n)}`, l: "people, all in-house" },
    { to: 68, f: (n: number) => `${Math.round(n)}%`, l: "of clients come back for more" },
    { to: 3, f: (n: number) => `${Math.round(n)}`, l: "projects at a time, never more" },
  ];
  return (
    <section id="studio" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <SectionHead eyebrow="The studio" title="Small on purpose." sub="Fourteen people in one room in Lisbon, plus a few who join on video. You meet the people doing the work on day one, and they stay until launch." accent={A} />
      <Stagger className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="flex flex-col gap-2 border-t border-black/[.08] pt-5">
            <Counter to={s.to} format={s.f} className="text-[clamp(40px,5vw,56px)] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
            <span className="text-[15px] text-[#6e6e73]">{s.l}</span>
          </div>
        ))}
      </Stagger>
      <Stagger className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3" gap={0.06}>
        {TEAM.map((p) => (
          <motion.div key={p.n} whileHover={{ y: -4 }} transition={spring} className={`${card} flex items-center gap-4 p-4 sm:p-5`}>
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full text-[15px] font-semibold text-white" style={{ background: `linear-gradient(140deg,hsl(${p.h} 70% 52%),hsl(${p.h + 30} 60% 32%))` }} aria-hidden="true">
              {p.n.split(" ").map((w) => w[0]).join("")}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{p.n}</span>
              <span className="text-[13px] leading-[1.35] text-[#6e6e73]">{p.r}</span>
            </span>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------------ engagements */

const PLANS = [
  { id: "sprint", n: "Sprint", t: "2 weeks", p: "from €18k", d: "A focused fix: a logo refresh, a launch film, one landing page.", f: ["One senior designer and one producer", "Two review rounds", "Source files and a short guide"] },
  { id: "identity", n: "Identity", t: "8–10 weeks", p: "from €65k", d: "The full system: strategy, identity, motion language and a site.", f: ["Strategy workshop in Lisbon or online", "Identity, motion and type", "Marketing site on Next.js", "Brand guidelines your team will read"] },
  { id: "partner", n: "Partner", t: "Monthly", p: "from €14k / mo", d: "For teams that ship constantly and want the same hands on it.", f: ["Two days a week from a mixed team", "Campaigns, product launches, site updates", "Cancel with 30 days' notice"] },
];

function Engagements() {
  const [sel, setSel] = useState("identity");
  return (
    <section id="pricing" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Engagements" title="Three ways to work with us." sub="Fixed scopes with fixed fees. If it grows, we tell you before it costs you anything." accent={A} center />
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3" role="radiogroup" aria-label="Engagement type">
          {PLANS.map((p, i) => {
            const on = sel === p.id;
            return (
              <Reveal key={p.id} y={16} delay={i * 0.06}>
                <motion.button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSel(p.id)}
                  animate={{ y: on ? -6 : 0 }}
                  transition={spring}
                  className={`${card} relative flex h-full w-full flex-col gap-4 p-7 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48]`}
                >
                  {on && <motion.span layoutId="nova-plan" className="pointer-events-none absolute inset-0 rounded-[28px]" style={{ boxShadow: `inset 0 0 0 2px ${A}` }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">{p.n}</span>
                    <span className="text-[13px] font-medium tabular-nums text-[#6e6e73]">{p.t}</span>
                  </span>
                  <span className="text-[15px] leading-[1.5] text-[#6e6e73]">{p.d}</span>
                  <span className="text-[30px] font-semibold tabular-nums tracking-[-0.04em]" style={{ color: on ? A : INK }}>{p.p}</span>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {p.f.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[14px] leading-[1.45] text-[#1d1d1f]">
                        <svg className="mt-0.5 flex-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={on ? A : "#86868b"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ contact */

const NEEDS = [
  { id: "brand", label: "Branding" },
  { id: "motion", label: "Motion" },
  { id: "web", label: "Website" },
  { id: "strategy", label: "Naming and strategy" },
];
const BUDGETS = ["< €25k", "€25–75k", "€75k+"];

function Segmented({ options, value, onChange, id, label }: { options: string[]; value: string; onChange: (v: string) => void; id: string; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="relative grid rounded-[14px] bg-[#f0f0f3] p-[3px]" style={{ gridTemplateColumns: `repeat(${options.length},1fr)` }}>
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)} className="relative z-10 h-9 rounded-[11px] px-2 text-[13px] font-medium tabular-nums text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48]">
          {value === o && <motion.span layoutId={id} className="absolute inset-0 -z-10 rounded-[11px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)]" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
          {o}
        </button>
      ))}
    </div>
  );
}

function Contact() {
  const [needs, setNeeds] = useState<Record<string, boolean>>({ brand: true, motion: true, web: false, strategy: false });
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [when, setWhen] = useState("Q1 2027");
  const picked = NEEDS.filter((n) => needs[n.id]).map((n) => n.label.toLowerCase());
  const summary = picked.length ? `${picked.join(", ")} · ${budget} · start ${when}` : "Pick at least one thing you need";
  return (
    <section id="contact" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Start a project" title="Tell us what needs to move." sub="Three questions, then sign the card. A real person replies within two working days with a rough scope and a fee range." accent={A} />
          <Reveal y={14}>
            <div className={`${card} flex flex-col gap-6 p-6 sm:p-7`}>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-[#1d1d1f]">What do you need?</span>
                <ul className="m-0 grid list-none grid-cols-1 gap-x-6 p-0 sm:grid-cols-2">
                  {NEEDS.map((n) => (
                    <li key={n.id} className="flex items-center justify-between gap-3 border-b border-black/[.06] py-3">
                      <span className="text-[15px] text-[#1d1d1f]">{n.label}</span>
                      <CapsuleToggle label={n.label} checked={needs[n.id]} onColor={A} onChange={(v) => setNeeds((s) => ({ ...s, [n.id]: v }))} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-semibold text-[#1d1d1f]">Budget</span>
                  <Segmented id="nova-budget" label="Budget" options={BUDGETS} value={budget} onChange={setBudget} />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] font-semibold text-[#1d1d1f]">Start</span>
                  <Segmented id="nova-when" label="Start date" options={["Q1 2027", "Q2 2027", "Later"]} value={when} onChange={setWhen} />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-[14px] bg-[#fff1f3] px-4 py-3 text-[14px] text-[#9f1239]" aria-live="polite">
                <span className="font-semibold">Brief:</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={summary} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={spring} className="min-w-0 truncate first-letter:uppercase">{summary}</motion.span>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
        <Reveal y={20} className="flex flex-col items-center gap-4">
          <Fit><SignBadge name="Your company" title="Project brief · Nova Studio" ink="#9f1239" autoplay /></Fit>
          <p className="m-0 max-w-[340px] text-center text-[13px] leading-[1.5] text-[#6e6e73]">Sign with your mouse or finger, then pause. It&apos;s a handshake, not a contract. Prefer email? <a href="#contact" onClick={(e) => e.preventDefault()} className="font-medium underline decoration-[#e11d48] underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[#e11d48]" style={{ color: "#9f1239" }}>hello@nova.studio</a></p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */

function Section({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default function MoonStudioPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-white text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
        <Nav brand={<Logo />} accent={A} cta="Start a project" onCta={() => scrollToId("contact")} links={[{ label: "Work", id: "work" }, { label: "Case study", id: "case" }, { label: "Services", id: "services" }, { label: "Studio", id: "studio" }, { label: "Contact", id: "contact" }]} />
        <Section>
          <Hero />
          <Work />
          <CaseStudy />
          <Services />
          <Studio />
          <Engagements />
          <Contact />
        </Section>
        <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 pb-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead eyebrow="FAQ" title="Before you write to us." accent={A} />
          <Reveal y={16}>
            <Faq
              accent={A}
              items={[
                { q: "Do you work with early-stage companies?", a: "Yes, usually through a Sprint. A two-week identity that's honest about being version one is better than a big system you'll outgrow in a year." },
                { q: "Who will actually work on our project?", a: "The people you meet in the first call. We don't pitch with seniors and staff with juniors, and we never outsource the build." },
                { q: "Can you work with our in-house team?", a: "Most of our clients have one. We share Figma files and a repo from week one, and finish with a handover session so your team can carry on without us." },
                { q: "How do payments work?", a: "Fixed fee, split into three: at kickoff, at the midpoint review and at launch. Partner engagements are billed monthly in advance." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Have something that needs to move?" sub="Tell us about it. We take on three projects at a time, so there's always a short wait list." cta="Start a project" secondary="See the reel" accent={A} glow="rgba(225,29,72,.32)" />
        </div>
        <Footer brand={<Logo />} note="An independent studio for branding, motion and web. Lisbon and remote." columns={[{ title: "Studio", links: ["Work", "Services", "People", "Journal"] }, { title: "Work with us", links: ["Start a project", "Engagements", "Careers"] }, { title: "Elsewhere", links: ["Newsletter", "Instagram", "Vimeo"] }]} />
      </div>
    </MotionConfig>
  );
}
