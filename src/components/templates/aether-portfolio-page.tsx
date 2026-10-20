"use client";
/**
 * Aether: the personal portfolio of an independent designer and developer.
 * Built from Motion Kit components: Glass Lens, Layout Switch (local copy),
 * Fan Deck, Page Curl, Dock, Copy Chip and Sign & Seal.
 * The hero is a contact sheet of every project in miniature, read through a
 * glass lens you drag across it.
 */
import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import GlassLens from "@/components/templates/kit/components/GlassLens";
import FanDeck from "@/components/templates/kit/components/FanDeck";
import PageCurl from "@/components/templates/kit/components/PageCurl";
import Dock, { type DockApp } from "@/components/templates/kit/components/Dock";
import { CopyChip } from "@/components/templates/kit/components/CopyButton";
import SignBadge from "@/components/templates/kit/components/SignBadge";
import WorkLayout, { type WorkTile } from "@/components/templates/aether-portfolio/WorkLayout";
import { Story } from "@/components/templates/aether-portfolio/Story";
import { CtaBand, Faq, Fit, Footer, Magnetic, Marquee, Nav, Reveal, SectionHead, Stagger, Words, card, ease, scrollToId } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const R = "#9d174d"; // rose: text, buttons and graphics (8:1 on white)
const RT = "#fdf2f8"; // rose tint for washes

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="6.5" fill={R} />
        <ellipse cx="16" cy="16" rx="14" ry="6" fill="none" stroke="#1d1d1f" strokeWidth="1.6" transform="rotate(-24 16 16)" />
        <motion.circle r="2.4" fill="#1d1d1f" initial={{ cx: 29, cy: 10 }} animate={{ cx: [29, 3, 29], cy: [10, 22, 10] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
      Aether
    </span>
  );
}

/* ------------------------------------------------------------------ the work */

const svgBox = "absolute inset-0 h-full w-full";

const WORK: (WorkTile & { client: string; role: string; year: string; note: string })[] = [
  {
    id: "halden",
    title: "Halden",
    client: "Banking for freelancers",
    role: "iOS app, design system",
    year: "2026",
    note: "Shipped in 11 weeks with two engineers.",
    meta: "Banking for freelancers · iOS app and design system · 2026",
    art: "radial-gradient(70% 60% at 25% 20%, rgba(94,156,132,.55), rgba(94,156,132,0) 60%), linear-gradient(160deg,#0f3d33,#1f6f5c 70%,#2c8a6f)",
    ui: (
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet" className={svgBox}>
        <rect x="76" y="18" width="48" height="98" rx="10" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.7)" strokeWidth="2" />
        <rect x="84" y="32" width="22" height="4" rx="2" fill="rgba(255,255,255,.7)" />
        <rect x="84" y="42" width="32" height="9" rx="3" fill="#fff" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={84 + i * 8.5} y={84 - i * 6} width="5.5" height={14 + i * 6} rx="2" fill={i === 3 ? "#a7d3bf" : "rgba(255,255,255,.45)"} />)}
      </svg>
    ),
  },
  {
    id: "fieldnote",
    title: "Fieldnote",
    client: "A journal that writes back",
    role: "Web app, writing tools",
    year: "2025",
    note: "Daily writers up from 9% to 31%.",
    meta: "A journal that writes back · Web app · 2025",
    art: "radial-gradient(60% 60% at 80% 20%, rgba(253,230,138,.45), rgba(253,230,138,0) 60%), linear-gradient(165deg,#a16207,#713f12)",
    ui: (
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet" className={svgBox}>
        <rect x="48" y="22" width="104" height="96" rx="8" fill="#fef3c7" />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x="60" y={36 + i * 12} width={[70, 80, 62, 76, 50, 66][i]} height="4" rx="2" fill={i === 3 ? "#9d174d" : "rgba(113,63,18,.45)"} />)}
      </svg>
    ),
  },
  {
    id: "kiln",
    title: "Kiln",
    client: "A ceramics studio's shop",
    role: "Brand, storefront",
    year: "2025",
    note: "Sold out the spring firing in four days.",
    meta: "A ceramics studio's shop · Brand and storefront · 2025",
    art: "radial-gradient(60% 50% at 70% 25%, rgba(253,186,116,.75), rgba(253,186,116,0) 60%), linear-gradient(160deg,#c2410c,#7c2d12)",
    ui: (
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet" className={svgBox}>
        <path d="M52 112 Q46 78 66 70 L82 70 Q100 78 94 112Z" fill="#fed7aa" />
        <path d="M104 112 Q98 62 122 54 L130 54 Q152 62 146 112Z" fill="#fff7ed" />
        <ellipse cx="126" cy="54" rx="8" ry="3" fill="#7c2d12" />
        <path d="M30 112 H170" stroke="rgba(255,255,255,.6)" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "line4",
    title: "Line 4",
    client: "Wayfinding for a city tram",
    role: "Signage, journey app",
    year: "2024",
    note: "Twelve stations, one colour, zero arrows.",
    meta: "Wayfinding for a city tram line · Signage and app · 2024",
    art: "linear-gradient(160deg,#2c2c2e,#1d1d1f)",
    ui: (
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet" className={svgBox}>
        <path d="M24 100 H76 Q90 100 96 86 L108 58 Q114 46 128 46 H178" fill="none" stroke="#facc15" strokeWidth="7" strokeLinecap="round" />
        {[[24, 100], [56, 100], [100, 76], [140, 46], [178, 46]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="5.5" fill="#1d1d1f" stroke="#fff" strokeWidth="3" />)}
      </svg>
    ),
  },
  {
    id: "mono",
    title: "Aether Mono",
    client: "A variable monospace",
    role: "Type design",
    year: "2024",
    note: "Three weights, one file, 41 KB.",
    meta: "A variable monospace typeface · Type design · 2024",
    art: "radial-gradient(60% 60% at 30% 25%, rgba(244,114,182,.45), rgba(244,114,182,0) 60%), linear-gradient(160deg,#9d174d,#500724)",
    ui: (
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet" className={svgBox}>
        <text x="100" y="94" textAnchor="middle" fontSize="64" fontWeight="600" fill="rgba(255,255,255,.92)" style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}>Aa</text>
        <path d="M60 106 H140" stroke="rgba(255,255,255,.45)" strokeWidth="1.5" strokeDasharray="3 4" />
      </svg>
    ),
  },
  {
    id: "tidewater",
    title: "Tidewater",
    client: "Sea levels for coastal towns",
    role: "Data dashboard",
    year: "2023",
    note: "Read by 140 town councils.",
    meta: "Sea-level data for coastal towns · Dashboard · 2023",
    art: "radial-gradient(60% 60% at 75% 20%, rgba(125,211,252,.4), rgba(125,211,252,0) 60%), linear-gradient(170deg,#075985,#0c4a6e 60%,#082f49)",
    ui: (
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet" className={svgBox}>
        <path d="M24 98 L52 92 L80 96 L108 80 L136 74 L164 58 L180 54" fill="none" stroke="#7dd3fc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 98 L52 92 L80 96 L108 80 L136 74 L164 58 L180 54 V112 H24Z" fill="rgba(125,211,252,.18)" />
        <path d="M24 112 H180" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ hero: contact sheet under a lens */

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.round(el.clientWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

function ContactSheet({ w, h }: { w: number; h: number }) {
  const cols = w >= 900 ? 6 : 3;
  return (
    <div className="relative h-full w-full bg-[#fbfaf8] p-5 sm:p-7" style={{ width: w, height: h }}>
      <div className="flex items-center justify-between pb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">
        <span>Contact sheet · Selected work 2023–2026</span>
        <span className="hidden sm:inline">Aether / J. Vale</span>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {WORK.map((p, i) => (
          <div key={p.id} className="relative flex flex-col gap-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[10px]" style={{ background: p.art }}>
              {p.ui}
              <span className="absolute left-2 top-2 text-[10px] font-semibold tabular-nums text-white/90">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <span className="text-[12px] font-semibold leading-tight text-[#1d1d1f]">{p.title}</span>
            <span className="text-[10px] leading-[1.35] text-[#6e6e73]">{p.client}. {p.note}</span>
            {i === 2 && (
              <>
                <span className="pointer-events-none absolute -inset-2 rounded-[18px] border-[2px]" style={{ borderColor: R, transform: "rotate(-2deg)" }} />
                <span className="absolute -top-5 right-0 text-[11px] font-semibold italic" style={{ color: R }}>my favourite</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  const { ref, w } = useWidth<HTMLDivElement>();
  const h = w >= 900 ? 390 : w >= 520 ? 640 : 560;
  return (
    <section className="relative overflow-hidden pb-14 pt-8 sm:pt-10">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: `radial-gradient(40% 40% at 85% 10%, ${RT}, transparent 70%)` }} />
      <div className="relative mx-auto max-w-[1180px] px-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[.08] pb-4 text-[13px] text-[#6e6e73]">
          <span className="font-semibold text-[#1d1d1f]">Issue 07 · Autumn 2026</span>
          <span className="hidden sm:inline">Jordan Vale, independent designer and developer, Lisbon</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.07)]">
            <span className="relative flex h-2 w-2">
              <motion.span className="absolute inset-0 rounded-full" style={{ background: R }} animate={{ scale: [1, 2.2], opacity: [0.5, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
              <span className="relative h-2 w-2 rounded-full" style={{ background: R }} />
            </span>
            Booking from January
          </span>
        </motion.div>
        <h1 className="m-0 mt-7 max-w-[1100px] text-[clamp(48px,8vw,112px)] font-semibold leading-[0.95] tracking-[-0.06em] text-[#1d1d1f] [text-wrap:balance]">
          <Words text="I design and build quiet software." accentWords={["quiet"]} accent={R} />
        </h1>
        <div className="mt-6 grid grid-cols-1 items-end gap-6 md:grid-cols-[1.2fr_1fr]">
          <Reveal delay={0.3} y={14}>
            <p className="m-0 max-w-[560px] text-[clamp(17px,2vw,21px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73]">
              Aether is a studio of one. I take a product from a rough idea to shipped code: the research, the screens, the design system and the front end. Six projects below, all still in use.
            </p>
          </Reveal>
          <Reveal delay={0.4} y={14} className="flex flex-wrap gap-3 md:justify-end">
            <Magnetic className="text-white" style={{ background: R }} onClick={() => scrollToId("work")}>See the work</Magnetic>
            <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" onClick={() => scrollToId("services")}>Book a call</Magnetic>
          </Reveal>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.35 }} className="relative mx-auto mt-10 max-w-[1320px] px-3 sm:px-5">
        <div ref={ref} className="relative w-full" style={{ height: w ? h : 390 }}>
          {w > 0 && (
            <div className="absolute inset-0 [&>div]:!rounded-[28px]">
              <GlassLens width={w} height={h} size={w >= 900 ? 190 : 140} zoom={1.7} autoplay>
                <ContactSheet w={w} h={h} />
              </GlassLens>
            </div>
          )}
        </div>
        <p className="m-0 mt-4 text-center text-[13px] text-[#6e6e73]">Drag the lens across the contact sheet. Every project is on it, in miniature.</p>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ disciplines */

function Disciplines() {
  const items = ["Product design", "Design systems", "Front-end in React", "Interaction and motion", "Type", "Prototypes you can test"];
  return (
    <section className="border-y border-black/[.06] bg-white py-7" aria-label="What I do">
      <Marquee speed={34}>
        {items.map((t) => (
          <span key={t} className="mx-8 flex items-center gap-8 text-[clamp(22px,3vw,32px)] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
            {t}
            <span className="h-2 w-2 rounded-full" style={{ background: R }} aria-hidden="true" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/* ------------------------------------------------------------------ selected work */

function Work() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section id="work" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Selected work" title="Six projects, all still shipping." sub="Pick a layout to browse, or open one from the index. Each line says what changed, not just what I made." accent={R} />
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        <Reveal y={20} className="min-w-0">
          <div className={`${card} flex h-full items-center justify-center px-4 py-8`}>
            <Fit><WorkLayout items={WORK} accent={R} autoplay openId={open} onOpenChange={setOpen} /></Fit>
          </div>
        </Reveal>
        <Reveal y={20} delay={0.08} className="min-w-0">
          <ol className={`${card} m-0 flex h-full list-none flex-col p-2`}>
            {WORK.map((p, i) => {
              const on = open === p.id;
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => setOpen(on ? null : p.id)} aria-pressed={on} className="relative flex w-full items-center gap-4 rounded-[18px] px-4 py-3.5 text-left outline-none focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: R }}>
                    {on && <motion.span layoutId="aether-index" className="absolute inset-0 rounded-[18px]" style={{ background: RT }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    <span className="relative w-6 text-[13px] font-semibold tabular-nums text-[#6e6e73]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="relative h-9 w-9 flex-none rounded-[10px]" style={{ background: p.art }} aria-hidden="true" />
                    <span className="relative flex min-w-0 flex-1 flex-col">
                      <span className="text-[16px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{p.title}</span>
                      <span className="truncate text-[13px] text-[#6e6e73]">{p.role} · {p.note}</span>
                    </span>
                    <span className="relative text-[13px] tabular-nums text-[#6e6e73]">{p.year}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ process */

const PALETTE = [
  { name: "Moss", hex: "#0F3D33" }, { name: "Fern", hex: "#1F6F5C" }, { name: "Sage", hex: "#5E9C84" }, { name: "Mint", hex: "#A7D3BF" },
  { name: "Paper", hex: "#F4EFE6" }, { name: "Sand", hex: "#E2D3B5" }, { name: "Clay", hex: "#C98B5C" }, { name: "Rust", hex: "#A4502E" },
  { name: "Rose", hex: "#9D174D" }, { name: "Plum", hex: "#5B2140" }, { name: "Ink", hex: "#1D1D1F" }, { name: "Fog", hex: "#C7CBD1" },
];

const NOTE_FRONT = (
  <div className="flex h-full flex-col justify-between bg-[#fffdf8] p-7">
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6e6e73]">Halden · review, week 3</span>
      <span className="text-[24px] font-semibold leading-[1.12] tracking-[-0.03em] text-[#1d1d1f]">Put the balance first. Freelancers check it before anything else.</span>
      <span className="max-w-[300px] text-[14px] leading-[1.5] text-[#6e6e73]">Invoices move below the fold. Taxes get their own tab, not a banner.</span>
    </div>
    <span className="text-[13px] italic" style={{ color: R }}>Peel the corner for the sketch</span>
  </div>
);

const NOTE_BACK = (
  <div className="relative h-full w-full bg-[#f3f0ea]">
    <svg viewBox="0 0 420 270" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <g fill="none" stroke="#3a3a3c" strokeWidth="2" strokeLinecap="round">
        <rect x="150" y="24" width="120" height="222" rx="18" />
        <path d="M168 52 H230" />
        <path d="M168 74 H252" strokeWidth="6" stroke={R} />
        <path d="M168 104 Q190 96 210 108 T252 104" />
        <rect x="166" y="124" width="88" height="34" rx="8" />
        <rect x="166" y="166" width="88" height="34" rx="8" />
        <path d="M166 218 H254" strokeDasharray="4 6" />
      </g>
      <path d="M290 72 Q330 60 352 86" fill="none" stroke={R} strokeWidth="2" strokeLinecap="round" />
      <text x="296" y="110" fontSize="15" fontStyle="italic" fill={R} style={{ fontFamily: SYSTEM_FONT }}>balance, big</text>
      <text x="40" y="150" fontSize="15" fontStyle="italic" fill="#6e6e73" style={{ fontFamily: SYSTEM_FONT }}>invoices</text>
      <path d="M104 146 Q130 142 160 140" fill="none" stroke="#6e6e73" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  </div>
);

const glyph = (d: string) => (
  <svg width="56%" height="56%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const DESK: DockApp[] = [
  { id: "home", label: "Sketchbook", bg: "linear-gradient(180deg,#fda4af,#9d174d)", glyph: glyph("M4 20l4-1 11-11-3-3L5 16zM14 6l3 3") },
  { id: "canvas", label: "Canvas", bg: "linear-gradient(180deg,#a1a1aa,#3f3f46)", glyph: glyph("M7 3v18M17 3v18M3 7h18M3 17h18") },
  { id: "type", label: "Type specimens", bg: "linear-gradient(180deg,#fcd34d,#b45309)", glyph: glyph("M5 19L10 5l5 14M7 14h6M16 19v-6a2.5 2.5 0 0 1 5 0v6") },
  { id: "code", label: "Code editor", bg: "linear-gradient(180deg,#60a5fa,#1d4ed8)", glyph: glyph("M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12") },
  { id: "motion", label: "Motion curves", bg: "linear-gradient(180deg,#5eead4,#0f766e)", glyph: glyph("M3 18C9 18 9 6 15 6h6") },
  { id: "ship", label: "Deploys", bg: "linear-gradient(180deg,#4b5563,#111827)", glyph: glyph("M12 3v12M7 10l5 5 5-5M5 21h14") },
];

function Process() {
  return (
    <section id="process" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="How I work" title="Paper, then pixels, then production." accent={R} />
        <div className="mt-6">
          <Story
            accent={R}
            steps={[
              { kicker: "01 · Colour", title: "Chosen on paper before a screen exists.", body: "Every brand starts as a deck of chips I can hold up to the client's actual office light. Fan it out, hover a chip, click to copy the hex.", visual: <div className={`${card} flex justify-center px-6 py-10`}><FanDeck chips={PALETTE} autoplay /></div> },
              { kicker: "02 · Critique", title: "Notes in the margin, sketches underneath.", body: "Reviews are written, short and specific. The sketch that started the idea is still under the page, so we never forget why a screen looks the way it does.", visual: <div className={`${card} p-6`}><PageCurl width={420} height={270} front={NOTE_FRONT} back={NOTE_BACK} autoplay /></div> },
              { kicker: "03 · Code", title: "Shipped by the same hands.", body: "I build the front end myself in React and TypeScript, so nothing gets lost between the design file and the pull request. Six tools on the desk, no more.", visual: <div className={`${card} flex flex-col items-center gap-2 px-8 pb-8 pt-4`}><Dock apps={DESK} autoplay /><span className="text-[13px] text-[#6e6e73]">Hover the dock, click a tool to open it.</span></div> },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ writing + kind words */

const ESSAYS = [
  { t: "The balance is the homepage", d: "Sep 2026", r: "6 min", x: "What eleven weeks of designing a bank for freelancers taught me about hierarchy." },
  { t: "One person, one repo", d: "Jun 2026", r: "9 min", x: "Why I stopped handing off design files and started handing off pull requests." },
  { t: "Signs without arrows", d: "Feb 2026", r: "5 min", x: "Wayfinding for Line 4, and the surprising cost of a single arrow on a platform." },
];

function Writing() {
  return (
    <section id="writing" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead eyebrow="Writing" title="Notes from the desk." accent={R} />
        <Reveal y={12}><span className="text-[15px] text-[#6e6e73]">One essay a quarter. No newsletter pop-ups.</span></Reveal>
      </div>
      <Stagger className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {ESSAYS.map((e, i) => (
          <motion.a key={e.t} href="#writing" onClick={(ev) => ev.preventDefault()} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className={`${card} group flex h-full flex-col gap-5 p-7 outline-none focus-visible:ring-2`} style={{ ["--tw-ring-color" as string]: R }}>
            <span className="flex items-center justify-between text-[13px] text-[#6e6e73]"><span>{e.d}</span><span>{e.r} read</span></span>
            <span className="text-[24px] font-semibold leading-[1.12] tracking-[-0.03em] text-[#1d1d1f]">{e.t}</span>
            <span className="text-[15px] leading-[1.5] text-[#6e6e73]">{e.x}</span>
            <span className="mt-auto inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: R }}>
              Read essay {i + 1}
              <motion.span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</motion.span>
            </span>
          </motion.a>
        ))}
      </Stagger>
    </section>
  );
}

const WORDS = [
  { q: "Jordan rebuilt our whole app in eleven weeks and left us a design system our two engineers actually use.", n: "Mara Ellison", r: "Founder, Halden" },
  { q: "The review notes were the best part. Short, kind and impossible to misread.", n: "Tobias Wren", r: "Head of product, Fieldnote" },
  { q: "We asked for a shop. We got a brand people recognise from across a market hall.", n: "Inês Carvalho", r: "Potter, Kiln Studio" },
];

function KindWords() {
  return (
    <section className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Kind words" title="From people I've shipped with." accent={R} center />
        <Stagger className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {WORDS.map((w) => (
            <figure key={w.n} className={`${card} m-0 flex h-full flex-col gap-6 p-7`}>
              <svg width="28" height="22" viewBox="0 0 28 22" aria-hidden="true"><path d="M0 22V12Q0 2 11 0v5Q6 6 6 11h5v11zM16 22V12q0-10 11-12v5q-5 1-5 6h5v11z" fill={R} /></svg>
              <blockquote className="m-0 text-[18px] leading-[1.45] tracking-[-0.015em] text-[#1d1d1f]">{w.q}</blockquote>
              <figcaption className="mt-auto flex flex-col">
                <span className="text-[15px] font-semibold text-[#1d1d1f]">{w.n}</span>
                <span className="text-[13px] text-[#6e6e73]">{w.r}</span>
              </figcaption>
            </figure>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ services + booking */

const OFFERS = [
  { id: "sprint", n: "Two-week sprint", p: "$9,800", f: ["One flow, researched, designed and built", "A clickable prototype by day five", "You keep the code and the files"] },
  { id: "partner", n: "Product partner", p: "$14,500 / month", f: ["Three days a week inside your team", "Design system and front end, together", "Three months minimum, cancel monthly after"] },
  { id: "audit", n: "Design system audit", p: "$6,200", f: ["A written review of components and tokens", "A fix list ranked by effort", "One workshop with your engineers"] },
];

function Services() {
  const [pick, setPick] = useState("sprint");
  const offer = OFFERS.find((o) => o.id === pick)!;
  return (
    <section id="services" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Work together" title="Three ways in. Fixed prices." sub="Two projects at a time, never more. Next openings: January for sprints, March for partnerships." accent={R} />
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Engagement">
            {OFFERS.map((o) => {
              const on = pick === o.id;
              return (
                <motion.button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => setPick(o.id)} layout className="relative overflow-hidden rounded-[24px] bg-white p-6 text-left shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: R }}>
                  {on && <motion.span layoutId="aether-offer" className="absolute inset-0 rounded-[24px]" style={{ boxShadow: `inset 0 0 0 2px ${R}` }} transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative flex items-center justify-between gap-4">
                    <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{o.n}</span>
                    <span className="text-[16px] font-medium tabular-nums text-[#6e6e73]">{o.p}</span>
                  </span>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.ul key="f" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative m-0 flex list-none flex-col gap-2 overflow-hidden p-0">
                        {o.f.map((f, i) => (
                          <motion.li key={f} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 + i * 0.05 }} className={`flex items-center gap-2.5 text-[15px] text-[#1d1d1f] ${i === 0 ? "mt-4" : ""}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={R} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                            {f}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
        <Reveal y={20}>
          <div className={`${card} flex flex-col items-center gap-6 p-8`} style={{ background: `linear-gradient(180deg, #fff, ${RT})` }}>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">One page, one signature.</h3>
              <p className="m-0 max-w-[340px] text-[15px] leading-[1.5] text-[#6e6e73]">The agreement fits on a single page. Sign it with your pointer and I countersign within a day.</p>
            </div>
            <Fit><SignBadge name="Your studio" title={`${offer.n} · ${offer.p}`} ink={R} autoplay /></Fit>
            <div className="flex w-full flex-col items-center gap-2 border-t border-black/[.06] pt-6">
              <span className="text-[13px] text-[#6e6e73]">Rather write first?</span>
              <CopyChip value="hello@aether.studio" label="Copy email" accent={R} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */

export function AetherPortfolioPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
        <Nav brand={<Logo />} accent={R} cta="Book a call" onCta={() => scrollToId("services")} links={[{ label: "Work", id: "work" }, { label: "Process", id: "process" }, { label: "Writing", id: "writing" }, { label: "Services", id: "services" }]} />
        <Hero />
        <Disciplines />
        <Work />
        <Process />
        <Writing />
        <KindWords />
        <Services />
        <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 pb-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead eyebrow="FAQ" title="Before we talk." accent={R} />
          <Reveal y={16}>
            <Faq
              accent={R}
              items={[
                { q: "Do you work with agencies?", a: "Sometimes, as long as I talk to the product team directly. I don't work behind a white label." },
                { q: "Can you just design, without building?", a: "Yes, but most clients pick the sprint because the code is where designs usually lose their edges." },
                { q: "What do you need from us to start?", a: "One person who can make decisions, access to real customers or support tickets, and a repo I can open a branch in." },
                { q: "Where are you, and when are you online?", a: "Lisbon. I overlap with Europe all day and with the US East Coast in the afternoon." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Have something that should feel quieter?" sub="Tell me what it is and who uses it. I reply within two working days." cta="Book a call" secondary="Copy email" accent={R} glow="rgba(244,114,182,.28)" />
        </div>
        <Footer brand={<Logo />} note="The studio of Jordan Vale, independent designer and developer. Aether is a Motion Kit template; the people and projects are invented." columns={[{ title: "Work", links: ["Halden", "Fieldnote", "Kiln", "Line 4"] }, { title: "Studio", links: ["Process", "Writing", "Services"] }, { title: "Elsewhere", links: ["Email", "CV", "Source code", "Talks"] }]} />
      </div>
    </MotionConfig>
  );
}

export default AetherPortfolioPage;
