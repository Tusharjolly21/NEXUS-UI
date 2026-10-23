"use client";
/* eslint-disable react/no-unescaped-entities */
/**
 * Kiln: a productized design + development studio. Dark hero with a rising
 * ember horizon, a bento of what the subscription covers, a work wall, two
 * testimonial rails, a comparison table, monthly plans, a founder's note,
 * FAQ and a closing band with the giant wordmark.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Faq, Reveal, ease, scrollToId } from "@/components/templates/kit/parts";
import { Avatar, CountUp, DotWorld, Icon, SnapCarousel, Wordmark } from "@/components/templates/kit/blocks";
import MacKeyboard from "@/components/templates/kit/components/MacKeyboard";
const relayThumb = "/templates/kit/thumbs/relay.jpg";
const tallyThumb = "/templates/kit/thumbs/tally.jpg";
const wayfareThumb = "/templates/kit/thumbs/wayfare.jpg";
const sideBThumb = "/templates/kit/thumbs/sideb.jpg";
const tplHelix = "/videos/assets/tpl-helix.jpg";
const tplAether = "/videos/assets/tpl-aether.jpg";

const AMBER = "#ffc23d";
const PAGE = "#efefec";

function Logo({ light = true }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em]" style={{ color: light ? "#fff" : "#111" }}>
      <span className="flex h-7 w-7 items-center justify-center rounded-[8px]" style={{ background: light ? "#fff" : "#111" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13V3M3 8l6-5M3 8l7 5" stroke={light ? "#111" : "#fff"} strokeWidth="2.4" strokeLinecap="round" fill="none" /></svg>
      </span>
      Kiln
    </span>
  );
}

function ChatButton({ label = "Chat with Maya", dark = true, onClick }: { label?: string; dark?: boolean; onClick?: () => void }) {
  return (
    <motion.button type="button" onClick={onClick} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
      className={`group inline-flex h-10 items-center gap-2.5 rounded-[10px] pl-1.5 pr-4 text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#ffc23d] ${dark ? "bg-[#151515] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)]" : "bg-[#111] text-white"}`}>
      <span className="relative flex-none">
        <Avatar name="Maya Ortiz" size={28} hue={38} />
        <span className={`absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full bg-[#34c759] ring-2 ${dark ? "ring-[#151515]" : "ring-[#111]"}`} aria-hidden="true" />
      </span>
      {label}
    </motion.button>
  );
}

/** A plain action button: no avatar, so only the one that opens a chat carries Maya's face. */
function ActionButton({ label, tone = "dark", onClick }: { label: string; tone?: "dark" | "light"; onClick?: () => void }) {
  return (
    <motion.button type="button" onClick={onClick} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
      className={`inline-flex h-10 items-center rounded-[10px] px-4 text-[14px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#ffc23d] ${tone === "light" ? "bg-white text-[#111]" : "bg-[#111] text-white"}`}>
      {label}
    </motion.button>
  );
}

/* ---------------- hero ---------------- */

function GridGlow() {
  // a few grid cells warm up and cool down at random
  const [cells, setCells] = useState<number[]>([]);
  useEffect(() => {
    const id = setInterval(() => setCells(Array.from({ length: 5 }, () => Math.floor(Math.random() * 160))), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 opacity-[.35]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)", backgroundSize: "88px 88px", maskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)" }} />
      <div className="absolute inset-0 grid grid-cols-[repeat(20,88px)]" style={{ maskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)" }}>
        {Array.from({ length: 160 }, (_, i) => (
          <motion.span key={i} className="h-[88px] w-[88px]" animate={{ backgroundColor: cells.includes(i) ? "rgba(255,194,61,.10)" : "rgba(255,194,61,0)" }} transition={{ duration: 1.2 }} />
        ))}
      </div>
      {Array.from({ length: 40 }, (_, i) => (
        <motion.span key={i} className="absolute h-[2px] w-[2px] rounded-full bg-white" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 55}%` }} animate={{ opacity: [0.15, 0.8, 0.15] }} transition={{ duration: 2 + (i % 5), repeat: Infinity, delay: i * 0.13 }} />
      ))}
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const horizonY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const markY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const mx = useMotionValue(0.5);
  const glowX = useSpring(useTransform(mx, [0, 1], [-120, 120]), { stiffness: 60, damping: 20 });
  return (
    <section ref={ref} id="top" className="relative overflow-hidden rounded-b-[28px] bg-[#050505] text-white" onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width); }}>
      <GridGlow />
      {/* ember horizon */}
      <motion.div className="absolute left-1/2 top-[52%] h-[1400px] w-[2200px]" style={{ y: horizonY, x: "-50%" }} aria-hidden="true">
        <motion.div className="absolute inset-0 rounded-[50%]" initial={{ y: 260, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 2.2, ease }}
          style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1208 0%, #050505 40%)", boxShadow: "0 -2px 0 rgba(255,194,61,.85), 0 -30px 120px rgba(255,160,40,.45), inset 0 40px 120px rgba(255,170,60,.18)" }} />
        <motion.div className="absolute left-1/2 top-[-60px] ml-[-450px] h-[160px] w-[900px] rounded-[50%] blur-[60px]" style={{ x: glowX, background: "radial-gradient(ellipse, rgba(255,180,60,.55), transparent 70%)" }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
      </motion.div>

      <div className="relative mx-auto flex max-w-[1180px] items-center justify-between px-6 pt-6">
        <Logo />
        <nav className="hidden items-center gap-9 text-[14px] text-white/75 md:flex" aria-label="Main">
          {[["Work", "work"], ["Services", "services"], ["Pricing", "pricing"], ["Journal", "faq"]].map(([l, id]) => <button key={id} type="button" onClick={() => scrollToId(id)} className="outline-none hover:text-white focus-visible:text-white">{l}</button>)}
        </nav>
        <ActionButton label="Book a call" tone="light" onClick={() => scrollToId("pricing")} />
      </div>

      <div className="relative mx-auto grid min-h-[86vh] max-w-[1180px] grid-cols-1 items-center gap-10 px-6 pb-48 pt-24 md:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="inline-flex items-center gap-2 rounded-full bg-white/[.06] py-1 pl-1 pr-3 text-[12.5px] text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]">
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-white">Kiln Studio</span>Now booking for December
          </motion.span>
          <h1 className="m-0 mt-6 text-[clamp(40px,6vw,76px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            {["The design and", "engineering team", "you don't hire."].map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1.1, ease, delay: 0.25 + i * 0.1 }}>{l}</motion.span>
              </span>
            ))}
          </h1>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.9, ease }} className="md:justify-self-end">
          <p className="m-0 max-w-[340px] text-[16px] leading-[1.55] text-white/70">We design and build websites that bring in customers and keep up with your product. One flat monthly price. No calls you don't need. Just results.</p>
          <div className="mt-6"><ChatButton /></div>
        </motion.div>
      </div>

      <motion.div className="pointer-events-none absolute bottom-[-0.24em] left-0 right-0 select-none text-center text-[clamp(160px,28vw,420px)] font-semibold leading-none tracking-[-0.06em]" style={{ y: markY, color: "transparent", backgroundImage: "linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,0) 70%)", WebkitBackgroundClip: "text", backgroundClip: "text" }} aria-hidden="true">
        Kiln
      </motion.div>
    </section>
  );
}

/* ---------------- logos ---------------- */

const BRANDS = ["Quillbase", "Orbitly", "Fernhouse", "Copperline", "Mosswell", "Brightpath", "Tidewater", "Parcelkit", "Juniper", "Arcadia", "Keystone", "Lumenly", "Driftwood", "Sable"];

function Logos() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-20 text-center">
      <p className="m-0 text-[11.5px] font-medium uppercase tracking-[0.18em] text-[#8a8a85]">Trusted by fast-growing teams</p>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4 lg:grid-cols-7">
        {BRANDS.map((b, i) => (
          <Reveal key={b} delay={(i % 7) * 0.04} y={14}>
            <motion.div whileHover={{ y: -2, color: "#111" }} className="flex justify-center text-[#7d7d78]"><Wordmark name={b} glyph={i} /></motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- what's included bento ---------------- */

function BrowserBuild() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.4 });
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 5), 900);
    return () => clearInterval(id);
  }, [on]);
  return (
    <div ref={ref} className="overflow-hidden rounded-[14px] bg-[#f6f6f3] shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)]">
      <div className="flex items-center gap-1.5 border-b border-black/5 px-3 py-2">{["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />)}</div>
      <div className="flex flex-col items-center gap-2 px-6 pb-6 pt-5">
        <motion.div animate={{ width: step >= 1 ? "60%" : "20%", opacity: step >= 1 ? 1 : 0.4 }} className="h-2.5 rounded-full bg-[#111]" />
        <motion.div animate={{ width: step >= 1 ? "44%" : "10%", opacity: step >= 1 ? 0.5 : 0.2 }} className="h-2 rounded-full bg-[#111]" />
        <motion.div animate={{ scale: step >= 2 ? 1 : 0.6, opacity: step >= 2 ? 1 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="mt-2 h-6 w-20 rounded-full" style={{ background: AMBER }} />
        <div className="mt-3 grid w-full grid-cols-3 gap-2">
          {[0, 1, 2].map((k) => <motion.div key={k} animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 10 }} transition={{ delay: k * 0.08 }} className="h-14 rounded-[8px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)]" />)}
        </div>
        <motion.div animate={{ opacity: step >= 4 ? 1 : 0 }} className="mt-1 h-16 w-full rounded-[8px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)]" />
      </div>
    </div>
  );
}

function ProgressCard() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.5 });
  const [n, setN] = useState(0);
  const msg = "Pricing page v2 is live. Changes from Tuesday are in.";
  useEffect(() => {
    if (!on) return;
    let k = 0;
    const id = setInterval(() => { k++; setN(Math.min(msg.length, k)); if (k > msg.length + 30) k = 0; }, 45);
    return () => clearInterval(id);
  }, [on]);
  return (
    <div ref={ref} className="relative mt-3 flex flex-col items-center">
      <svg width="170" height="100" viewBox="0 0 170 100" aria-hidden="true">
        <path d="M15 95a70 70 0 01140 0" fill="none" stroke="#ecebe6" strokeWidth="20" strokeLinecap="round" />
        <motion.path d="M15 95a70 70 0 01140 0" fill="none" stroke={AMBER} strokeWidth="20" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: on ? 0.72 : 0 }} transition={{ duration: 1.6, ease }} />
      </svg>
      <div className="relative -mt-4 w-full rounded-[12px] bg-white p-3 text-left shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-20px_rgba(0,0,0,.4)]">
        <div className="flex items-center gap-2 text-[11px] text-[#8a8a85]"><Avatar name="Maya Ortiz" size={18} hue={30} />Maya · 2m ago</div>
        <p className="m-0 mt-1.5 min-h-[34px] text-[12.5px] leading-[1.4] text-[#111]">{msg.slice(0, n)}<span className="ml-0.5 inline-block h-3 w-[2px] bg-[#111] align-middle" style={{ opacity: n < msg.length ? 1 : 0 }} /></p>
      </div>
    </div>
  );
}

function SearchCard() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.5 });
  const q = "best studio for SaaS websites";
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    let k = 0;
    const id = setInterval(() => { k++; setN(k); if (k > q.length + 40) k = 0; }, 60);
    return () => clearInterval(id);
  }, [on]);
  const done = n >= q.length + 4;
  return (
    <div ref={ref} className="mt-4 space-y-2">
      <div className="flex h-9 items-center gap-2 rounded-full bg-white px-3 text-[12.5px] text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,.08)]">
        <Icon name="search" size={14} className="text-[#8a8a85]" />{q.slice(0, n)}<span className="h-3.5 w-[2px] bg-[#111]" style={{ opacity: done ? 0 : 1 }} />
      </div>
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="rounded-[12px] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,.06)]">
            <div className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111]"><svg width="10" height="10" viewBox="0 0 16 16"><path d="M3 13V3M3 8l6-5M3 8l7 5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" /></svg></span><span className="text-[12px] font-semibold text-[#111]">Kiln Studio</span><span className="text-[11px] text-[#8a8a85]">kiln.studio</span></div>
            <p className="m-0 mt-1 text-[12px] text-[#1a0dab]">Design and development on a subscription</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Circuit() {
  const traces = ["M0 30 H60 V70 H120", "M0 110 H80 V90 H120", "M240 40 H180 V75 H160", "M240 120 H200 V100 H160", "M140 0 V55", "M140 170 V125"];
  return (
    <svg viewBox="0 0 240 170" className="h-full w-full" aria-hidden="true">
      {traces.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="#e7e5df" strokeWidth="2" />
          <motion.path d={d} fill="none" stroke={AMBER} strokeWidth="2.4" strokeLinecap="round" initial={{ pathLength: 0, pathOffset: 0 }} animate={{ pathLength: [0, 0.35, 0], pathOffset: [0, 0.65, 1] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }} />
        </g>
      ))}
      <motion.rect x="112" y="55" width="56" height="70" rx="12" fill="url(#chip)" animate={{ filter: ["drop-shadow(0 0 0px #ffb347)", "drop-shadow(0 0 12px #ffb347)", "drop-shadow(0 0 0px #ffb347)"] }} transition={{ duration: 2.4, repeat: Infinity }} />
      <defs><linearGradient id="chip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd37a" /><stop offset="1" stopColor="#ff9a3d" /></linearGradient></defs>
    </svg>
  );
}

function Included() {
  const card = "relative overflow-hidden rounded-[18px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05)]";
  return (
    <section id="services" className="mx-auto max-w-[1180px] px-6 pb-28">
      <Reveal><h2 className="m-0 text-[clamp(30px,4vw,44px)] font-semibold tracking-[-0.035em] text-[#111]">Replace your whole product team</h2></Reveal>
      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1.1fr_1.5fr] md:grid-rows-[auto_auto] [&>*]:min-w-0">
        <Reveal className="md:row-span-2">
          <div className="flex h-full flex-col justify-between gap-6 rounded-[18px] bg-[#0b0b0b] p-5 text-white">
            <BrowserBuild />
            <div>
              <h3 className="m-0 text-[17px] font-semibold">Design and development</h3>
              <p className="m-0 mt-2 text-[14px] leading-[1.5] text-white/60">Designed to the pixel and built to last. We take you from a rough idea to a site you're proud to send people to.</p>
              <div className="mt-4"><ActionButton label="View pricing" tone="light" onClick={() => scrollToId("pricing")} /></div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.05}><div className={`${card} h-full`}><h3 className="m-0 text-[15px] font-semibold text-[#111]">Weekly updates, written down</h3><ProgressCard /></div></Reveal>
        <Reveal delay={0.1}>
          <div className="relative h-full overflow-hidden rounded-[18px] bg-[#0b0b0b] p-5 text-white">
            <h3 className="relative z-10 m-0 text-[15px] font-semibold">Hosting, launches and upkeep</h3>
            <DotWorld className="mt-2" cell={6} dot="rgba(255,255,255,.18)" lit={AMBER} pins={[{ lat: 40.7, lon: -74, label: "Ada", avatar: "linear-gradient(140deg,#ffc23d,#ff7a3d)" }, { lat: 51.5, lon: -0.1, label: "Leo", avatar: "linear-gradient(140deg,#7aa2ff,#4f46e5)" }, { lat: 12.9, lon: 77.6, label: "Ira", avatar: "linear-gradient(140deg,#34d399,#059669)" }, { lat: -33.9, lon: 151.2, label: "Sam", avatar: "linear-gradient(140deg,#f472b6,#db2777)" }]} />
          </div>
        </Reveal>
        <Reveal delay={0.12}><div className={`${card} h-full`}><h3 className="m-0 text-[15px] font-semibold text-[#111]">Found on Google, and in AI answers</h3><SearchCard /></div></Reveal>
        <Reveal delay={0.16}><div className={`${card} h-full`}><h3 className="m-0 text-[15px] font-semibold text-[#111]">Components, dashboards and everything else</h3><div className="mt-2 h-[150px]"><Circuit /></div></div></Reveal>
      </div>
    </section>
  );
}

/* ---------------- work ---------------- */

const WORK = [
  { src: relayThumb, name: "Relay", kind: "AI gateway", span: "md:col-span-2" },
  { src: tallyThumb, name: "Tally", kind: "Fintech app", span: "" },
  { src: wayfareThumb, name: "Wayfare", kind: "Travel booking", span: "" },
  { src: sideBThumb, name: "Side B", kind: "Music streaming", span: "md:col-span-2" },
  { src: tplHelix, name: "Helix", kind: "AI agents", span: "md:col-span-2" },
  { src: tplAether, name: "Aether", kind: "Portfolio", span: "" },
];

function Request() {
  return (
    <section id="request" className="mx-auto max-w-[1180px] px-6 pb-28">
      <div className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[24px] bg-white p-8 shadow-[0_0_0_1px_rgba(0,0,0,.05)] md:grid-cols-[1fr_1.15fr] md:p-12 [&>*]:min-w-0">
        <div>
          <Reveal><h2 className="m-0 text-[clamp(28px,3.6vw,40px)] font-semibold leading-[1.08] tracking-[-0.035em] text-[#111]">Send a request in one line</h2></Reveal>
          <p className="m-0 mt-4 max-w-[400px] text-[15px] leading-[1.55] text-[#555]">No briefs and no kickoff decks. Type what you need and it lands on our board. Most requests ship within 48 hours.</p>
          <ul className="m-0 mt-6 flex list-none flex-col gap-2.5 p-0">
            {["Unlimited requests, one at a time", "An update in your inbox every weekday", "Pause or cancel whenever you like"].map((t, i) => (
              <Reveal key={t} delay={0.05 * i}><li className="flex items-center gap-2.5 text-[14px] text-[#111]"><span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-[#111]" style={{ background: AMBER }}>✓</span>{t}</li></Reveal>
            ))}
          </ul>
        </div>
        <Reveal delay={0.1}>
          <div className="rounded-[20px] bg-[#f5f5f7] px-4 py-8 sm:px-8">
            <MacKeyboard theme="light" accent="#ff9f0a" autoplay autoplayText="a launch page by friday" placeholder="What do you need?" listen />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function WorkTile({ w, i }: { w: (typeof WORK)[number]; i: number }) {
  const [hover, setHover] = useState(false);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 200, damping: 20 }), sy = useSpring(ry, { stiffness: 200, damping: 20 });
  return (
    <Reveal delay={(i % 3) * 0.06} className={w.span}>
      <motion.a href="#work" onClick={(e) => e.preventDefault()} onPointerEnter={() => setHover(true)} onPointerLeave={() => { setHover(false); rx.set(0); ry.set(0); }}
        onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); ry.set(((e.clientX - r.left) / r.width - 0.5) * 6); rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6); }}
        style={{ rotateX: sx, rotateY: sy, transformPerspective: 1200 }}
        className="group relative block h-[340px] overflow-hidden rounded-[20px] bg-[#dcdcd6] outline-none focus-visible:ring-2 focus-visible:ring-[#111]">
        <motion.img src={w.src} alt={`${w.name} project`} className="absolute left-1/2 top-8 w-[78%] -translate-x-1/2 rounded-t-[12px] shadow-[0_30px_60px_-24px_rgba(0,0,0,.55)]" animate={{ y: hover ? -140 : 0 }} transition={{ type: "spring", stiffness: 60, damping: 18 }} draggable={false} />
        <motion.div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-[12px] bg-white/85 px-4 py-3 backdrop-blur-md" initial={false} animate={{ y: hover ? 0 : 70, opacity: hover ? 1 : 0 }} transition={{ type: "spring", stiffness: 320, damping: 26 }}>
          <span><span className="block text-[15px] font-semibold text-[#111]">{w.name}</span><span className="text-[12.5px] text-[#6e6e73]">{w.kind}</span></span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111] text-white"><Icon name="arrow" size={14} /></span>
        </motion.div>
      </motion.a>
    </Reveal>
  );
}

function Work() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const x = useTransform(scrollYProgress, [0, 1], [-60, 0]);
  return (
    <section ref={ref} id="work" className="mx-auto max-w-[1180px] px-6 pb-28">
      <motion.div style={{ x }} className="pointer-events-none -mb-16 select-none text-[clamp(90px,15vw,200px)] font-semibold leading-none tracking-[-0.06em] text-[#e2e2dd]" aria-hidden="true">Projects</motion.div>
      <div className="relative grid grid-cols-1 gap-3 md:grid-cols-3 [&>*]:min-w-0">
        {WORK.map((w, i) => <WorkTile key={w.name} w={w} i={i} />)}
      </div>
    </section>
  );
}

/* ---------------- testimonials ---------------- */

const QUOTES = [
  { co: "Quillbase", q: "They communicate like product people. Quick to agree, quicker to push back when we were wrong.", n: "Priya Raman", r: "CTO, Quillbase" },
  { co: "Orbitly", q: "Fast, careful, and they shipped the new site in nine days. We've already booked the next project.", n: "Daniel Okafor", r: "Founder, Orbitly" },
  { co: "Fernhouse", q: "The best front-end team we've worked with. They take loose requirements and come back with something better.", n: "Lena Brandt", r: "Head of Product, Fernhouse" },
  { co: "Copperline", q: "Our demo requests doubled the month the new site went live. Not because it was pretty, because it was clear.", n: "Marco Silva", r: "VP Growth, Copperline" },
  { co: "Tidewater", q: "Weekly Loom updates, no meetings, and nothing ever slipped. It felt like an in-house team.", n: "Hana Kim", r: "COO, Tidewater" },
];

function QuoteCard({ q, dark, i }: { q: (typeof QUOTES)[number]; dark?: boolean; i: number }) {
  return (
    <div className={`flex h-full min-h-[220px] flex-col justify-between rounded-[18px] p-6 ${dark ? "bg-[#0b0b0b] text-white" : "bg-white text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,.05)]"}`} style={dark ? { backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)", backgroundSize: "32px 32px" } : undefined}>
      <div>
        <div className="flex items-center justify-between">
          <Wordmark name={q.co} glyph={i} className={dark ? "text-white" : "text-[#8a8a85]"} />
          <Icon name="chat" size={16} className={dark ? "text-white/40" : "text-[#b0b0aa]"} />
        </div>
        <p className={`m-0 mt-5 text-[15.5px] leading-[1.5] ${dark ? "text-white/90" : ""}`}>"{q.q}"</p>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Avatar name={q.n} size={34} hue={(i * 70) % 360} />
        <span><span className="block text-[13.5px] font-semibold">{q.n}</span><span className={`text-[12.5px] ${dark ? "text-white/50" : "text-[#8a8a85]"}`}>{q.r}</span></span>
      </div>
    </div>
  );
}

function Testimonials({ dark = false, title }: { dark?: boolean; title: string }) {
  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-28">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Reveal><h2 className="m-0 text-[clamp(28px,3.6vw,40px)] font-semibold tracking-[-0.035em] text-[#111]">{title}</h2></Reveal>
      </div>
      <SnapCarousel label={title} itemWidth={dark ? 520 : 400}>
        {(dark ? [...QUOTES].reverse() : QUOTES).map((q, i) => <QuoteCard key={q.n} q={q} dark={dark} i={i} />)}
      </SnapCarousel>
    </section>
  );
}

/* ---------------- scaling bento ---------------- */

function Scaling() {
  const team = ["Maya Ortiz", "Leo Hart", "Ira Shah", "Sam Cole"];
  const stack = ["Next.js", "React", "Tailwind", "Motion", "Figma", "Vercel"];
  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-28">
      <Reveal><h2 className="m-0 mb-8 text-[clamp(28px,3.6vw,40px)] font-semibold tracking-[-0.035em] text-[#111]">Scaling teams that move fast</h2></Reveal>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr] md:grid-rows-[auto_auto_auto] [&>*]:min-w-0">
        <Reveal className="md:row-span-3">
          <div className="flex h-full flex-col justify-between rounded-[18px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: 9 }, (_, k) => {
                const who = [1, 3, 5, 7].indexOf(k);
                return (
                  <motion.div key={k} className="flex aspect-square items-center justify-center rounded-[12px] bg-[#f4f4f1] shadow-[inset_0_0_0_1px_rgba(0,0,0,.04)]" whileHover={{ scale: 1.05 }} animate={who < 0 ? { opacity: [0.5, 1, 0.5] } : {}} transition={who < 0 ? { duration: 3, repeat: Infinity, delay: k * 0.3 } : {}}>
                    {who >= 0 && <Avatar name={team[who]} size={52} hue={[30, 210, 150, 330][who]} />}
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-6"><p className="m-0 text-[15px] font-semibold text-[#111]">Get to know the team</p><div className="mt-3"><ActionButton label="Meet the team" onClick={() => scrollToId("founder")} /></div></div>
          </div>
        </Reveal>
        <Reveal className="md:row-span-2" delay={0.05}>
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[18px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05)]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.035) 1px, transparent 1px)", backgroundSize: "44px 44px" }}>
            <div><div className="text-[clamp(56px,7vw,88px)] font-semibold leading-none tracking-[-0.05em] text-[#111]"><CountUp to={120} suffix="+" /></div><p className="m-0 mt-2 text-[14px] text-[#8a8a85]">Launches shipped</p></div>
            <p className="m-0 mt-10 text-[14px] leading-[1.5] text-[#6e6e73]">Sites, apps and dashboards for teams from seed to Series C, most of them live in under a month.</p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="overflow-hidden rounded-[18px] bg-white py-5 shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
            <motion.div className="flex w-max gap-6 px-5" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>
              {[...BRANDS, ...BRANDS].map((b, i) => <span key={i} className="flex-none rounded-full bg-[#f4f4f1] px-3 py-1.5"><Wordmark name={b} glyph={i} className="text-[13px] text-[#6e6e73]" /></span>)}
            </motion.div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative h-full overflow-hidden rounded-[18px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
            <motion.div className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-[40px]" style={{ background: "rgba(255,194,61,.45)" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} />
            <Wordmark name="Orbitly" glyph={1} className="relative text-[13px] text-[#8a8a85]" />
            <p className="relative m-0 mt-3 text-[14px] leading-[1.5] text-[#111]">"Since the relaunch, support tickets about pricing dropped by half. People just understand it now."</p>
            <p className="relative m-0 mt-3 text-[12.5px] text-[#8a8a85]">Daniel Okafor, Founder</p>
          </div>
        </Reveal>
        <Reveal className="md:col-span-2" delay={0.12}>
          <div className="flex flex-wrap items-center gap-4 rounded-[18px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
            <span className="text-[14px] font-semibold text-[#111]">What we build with</span>
            {stack.map((s, i) => (
              <motion.span key={s} whileHover={{ y: -3 }} className="flex h-11 items-center rounded-full bg-[#f4f4f1] px-4 text-[13px] font-medium text-[#424245] shadow-[inset_0_0_0_1px_rgba(0,0,0,.04)]" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: i * 0.05 }}>{s}</motion.span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- comparison ---------------- */

const ROWS: [string, string, string, string][] = [
  ["layers", "Approach", "Design and engineering in one room", "Separate teams, handed off"],
  ["refresh", "Process", "Weekly drops, async, transparent", "Endless calls, vague timelines"],
  ["spark", "Taste", "Modern, minimal, on purpose", "Trend-chasing and cluttered"],
  ["code", "Stack", "Built with current frameworks", "Whatever the last dev used"],
  ["chat", "Updates", "Short, clear and written", "Through account managers"],
  ["stack", "Deliverables", "Production code and a design system", "Static mockups"],
  ["users", "Support", "A long-term partner", "One and done"],
];

function Compare() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-28">
      <Reveal><h2 className="m-0 mb-8 text-[clamp(28px,3.6vw,40px)] font-semibold tracking-[-0.035em] text-[#111]">Kiln vs. the usual agency</h2></Reveal>
      <Reveal>
        <div className="overflow-x-auto rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-black/5">
                <th className="w-[26%] bg-[#f6f6f3] p-5" />
                <th className="p-5 font-semibold text-[#111]"><span className="flex items-center gap-2"><Logo light={false} /></span></th>
                <th className="p-5 font-medium text-[#8a8a85]">The usual agency</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([ic, a, b, c], i) => (
                <motion.tr key={a} className="border-b border-black/5" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ delay: i * 0.05, duration: 0.5, ease }}>
                  <td className="bg-[#f6f6f3] p-5 text-[#424245]"><span className="flex items-center gap-2.5"><Icon name={ic} size={16} />{a}</span></td>
                  <td className="p-5 text-[#111]"><span className="flex items-center gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#30d158] text-white"><Icon name="check" size={12} /></span>{b}</span></td>
                  <td className="p-5 text-[#6e6e73]"><span className="flex items-center gap-2.5"><span className="h-5 w-5 rounded-full bg-[#ffc23d]/70" />{c}</span></td>
                </motion.tr>
              ))}
              <tr>
                <td className="bg-[#f6f6f3] p-5 text-[#424245]"><span className="flex items-center gap-2.5"><Icon name="phone" size={16} />First call</span></td>
                <td className="p-5"><ActionButton label="Book a free call" /></td>
                <td className="p-5"><span className="inline-flex h-10 items-center rounded-[10px] bg-[#e8e8e3] px-4 text-[14px] text-[#8a8a85]">Book a paid call</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {[["bolt", "Start this week", "Skip the hiring rounds. We start within days and you see work by Friday."], ["pulse", "High impact, low overhead", "One flat price covers design, build and upkeep. Pause any month."], ["users", "Calm collaboration", "Async by default, a call when it helps. Everything in one shared thread."]].map(([ic, t, d], i) => (
          <Reveal key={t} delay={i * 0.06}>
            <motion.div whileHover={{ y: -4 }} className="h-full rounded-[18px] bg-white p-6 text-center shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
              <motion.span className="mx-auto flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#fff5dc] text-[#b07800]" whileHover={{ rotate: -8, scale: 1.1 }}><Icon name={ic} /></motion.span>
              <h3 className="m-0 mt-4 text-[16px] font-semibold text-[#111]">{t}</h3>
              <p className="m-0 mt-2 text-[14px] leading-[1.5] text-[#6e6e73]">{d}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- pricing ---------------- */

function Feature({ children, dark }: { children: string; dark?: boolean }) {
  return <li className={`flex items-center gap-2 text-[13px] ${dark ? "text-white/70" : "text-[#6e6e73]"}`}><span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-white/50" : "bg-[#b0b0aa]"}`} />{children}</li>;
}

function Plan({ dark, label, chip, chipTone, title, blurb, price, quote, who }: { dark?: boolean; label: string; chip: string; chipTone: "red" | "green"; title: string; blurb: string; price: string; quote: string; who: [string, string] }) {
  const feats = ["Custom strategy and wireframes", "High-fidelity design in Figma", "Built in Next.js or Framer", "Conversion-focused copy", "Smooth animation and interaction", "SEO and performance setup", "Unlimited revisions", "Pause or cancel anytime"];
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className={`flex h-full flex-col rounded-[22px] p-2 ${dark ? "bg-[#0b0b0b] text-white" : "bg-white text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,.05)]"}`}>
      <div className={`rounded-[16px] p-5 ${dark ? "bg-[#161616]" : "bg-[#f6f6f3]"}`}>
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="font-medium">{label}</span>
          <span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${chipTone === "red" ? "bg-[#ffe3e0] text-[#d70015]" : "bg-[#dff7e6] text-[#1a7f42]"}`}>{chip}</span>
        </div>
        <h3 className="m-0 mt-4 text-[20px] font-semibold tracking-[-0.02em]">{title}</h3>
        <p className={`m-0 text-[16px] ${dark ? "text-white/50" : "text-[#8a8a85]"}`}>{blurb}</p>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div><div className="text-[30px] font-semibold tracking-[-0.03em]">{price}<span className={`text-[15px] font-normal ${dark ? "text-white/50" : "text-[#8a8a85]"}`}>/mo</span></div><div className="mt-3"><ActionButton label="Select plan" tone={dark ? "light" : "dark"} /></div></div>
          <div className={`max-w-[230px] rounded-[12px] p-3 text-[12px] ${dark ? "bg-white/[.06] text-white/80" : "bg-white text-[#424245] shadow-[0_0_0_1px_rgba(0,0,0,.05)]"}`}>
            <div className="flex items-center gap-2"><Avatar name={who[0]} size={20} hue={dark ? 280 : 20} /><span className="font-medium">{who[0]}, {who[1]}</span></div>
            <p className="m-0 mt-1.5 leading-[1.4]">{quote}</p>
          </div>
        </div>
      </div>
      <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-5 sm:grid-cols-2">{feats.map((f) => <Feature key={f} dark={dark}>{f}</Feature>)}</ul>
    </motion.div>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-6 pb-28">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <Reveal><h2 className="m-0 text-[clamp(28px,3.6vw,40px)] font-semibold tracking-[-0.035em] text-[#111]">Simple monthly plans</h2></Reveal>
        <p className="m-0 text-[13.5px] text-[#6e6e73]">Questions? Write to <span className="text-[#111] underline decoration-[#ffc23d] decoration-2 underline-offset-4">hello@kiln.studio</span></p>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Reveal><Plan label="Components" chip="Booked through November" chipTone="red" title="Product components" blurb="Buttons, forms, tables and every state between them." price="$3,900" quote="They rebuilt our onboarding flow in a week." who={["Lena Brandt", "Fernhouse"]} /></Reveal>
        <Reveal delay={0.06}><Plan dark label="Website pages" chip="2 spots left" chipTone="green" title="Marketing pages" blurb="Landing pages that load fast and say one thing well." price="$5,900" quote="Our best-converting landing page, by a mile." who={["Marco Silva", "Copperline"]} /></Reveal>
        <Reveal className="lg:col-span-2" delay={0.1}>
          <div className="grid grid-cols-1 gap-3 rounded-[22px] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,.05)] md:grid-cols-2">
            <div className="p-5">
              <div className="flex items-center gap-2 text-[13px]"><span className="font-medium text-[#111]">Multi-page</span><span className="rounded-full bg-[#fff1d6] px-2 py-0.5 text-[12px] font-medium text-[#9a5b00]">Waitlist open</span></div>
              <h3 className="m-0 mt-4 text-[20px] font-semibold tracking-[-0.02em] text-[#111]">Full website, built to convert</h3>
              <div className="mt-8 text-[30px] font-semibold tracking-[-0.03em] text-[#111]">$9,800<span className="text-[15px] font-normal text-[#8a8a85]">/mo</span></div>
              <div className="mt-3"><ActionButton label="Select plan" /></div>
            </div>
            <ul className="m-0 grid list-none grid-cols-1 gap-2.5 rounded-[16px] bg-[#f6f6f3] p-5 sm:grid-cols-2">
              {["Strategy and sitemap", "Design for every page", "CMS and blog", "Multilingual setup", "Conversion copy", "Animation and interaction", "SEO and analytics", "Priority support", "Unlimited revisions", "Handover and training"].map((f) => <Feature key={f}>{f}</Feature>)}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- founder ---------------- */

function Founder() {
  return (
    <section id="founder" className="relative overflow-hidden bg-[#0b0b0b] py-24 text-white" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)", backgroundSize: "56px 56px" }}>
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal><h2 className="m-0 text-[clamp(30px,4vw,48px)] font-semibold tracking-[-0.035em]">A note from the founder</h2></Reveal>
        <div className="mt-10 grid grid-cols-1 items-start gap-10 md:grid-cols-[380px_1fr] [&>*]:min-w-0">
          <Reveal>
            <motion.div whileHover={{ rotate: -1.5, y: -4 }} className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[18px]" style={{ background: "radial-gradient(circle at 30% 20%, #ffd37a, #ff8a3d 45%, #2a1a0a 100%)" }}>
              <div className="w-[68%] drop-shadow-[0_24px_30px_rgba(0,0,0,.35)]"><Avatar name="Maya Ortiz" size={400} hue={38} fluid /></div>
              <div className="absolute inset-x-6 bottom-5 text-[#111]"><p className="m-0 text-[17px] font-semibold tracking-[-0.02em]">Maya Ortiz</p><p className="m-0 text-[13px] text-black/60">Founder, lead engineer</p></div>
            </motion.div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="max-w-[560px] text-[16px] leading-[1.65] text-white/75">
              <p className="m-0">I'm Maya. I've been designing and building for the web for nine years, for tiny startups and for companies you've heard of. People call me a full-stack engineer; I'd rather be the person who makes the problem go away.</p>
              <p className="m-0 mt-4">I started Kiln so teams could get senior design and engineering without the hiring round. We keep the studio small on purpose, and every project gets the same people from first sketch to launch.</p>
              <div className="mt-8 overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)" }}>
                <motion.div className="flex w-max gap-3" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 26, repeat: Infinity, ease: "linear" }}>
                  {[...QUOTES, ...QUOTES].map((q, i) => (
                    <span key={i} className="flex flex-none items-center gap-2 rounded-[12px] bg-white/[.06] px-3 py-2 text-[12.5px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"><Avatar name={q.n} size={22} hue={(i * 70) % 360} /><span className="text-white/80">{q.n.split(" ")[0]}</span><span className="text-white/40">·</span><span className="text-white/60">{q.co}</span></span>
                  ))}
                </motion.div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- faq + cta + footer ---------------- */

function FaqBlock() {
  return (
    <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-6 py-28 md:grid-cols-[1fr_1.2fr]">
      <div>
        <Reveal><h2 className="m-0 text-[clamp(28px,3.6vw,40px)] font-semibold tracking-[-0.035em] text-[#111]">Questions, answered</h2></Reveal>
        <p className="m-0 mt-2 text-[14px] text-[#6e6e73]">Something else? Write to <span className="text-[#111] underline decoration-[#ffc23d] decoration-2 underline-offset-4">hello@kiln.studio</span></p>
        <Reveal delay={0.08}>
          <div className="mt-8 rounded-[18px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-32px_rgba(0,0,0,.35)]">
            <h3 className="m-0 text-[19px] font-semibold tracking-[-0.02em] text-[#111]">Need a team that ships this month?</h3>
            <p className="m-0 mt-2 text-[14px] leading-[1.5] text-[#6e6e73]">Designers, engineers and a project lead, ready to take your product from zero to launch.</p>
            <div className="mt-4"><ChatButton dark={false} /></div>
          </div>
        </Reveal>
      </div>
      <Faq items={[
        { q: "What does the subscription actually cover?", a: "Design, development, copy and upkeep for the scope of your plan. You send requests to one shared board, we ship them in order, usually within a few days each." },
        { q: "Do I need to be technical to work with you?", a: "No. Tell us the outcome you want in plain words. We'll ask the right questions and handle the rest, including hosting and launch." },
        { q: "How fast is the first delivery?", a: "Most teams see first designs within a week of kickoff and a live page within two or three." },
        { q: "Can you work with our existing site and stack?", a: "Yes. We regularly pick up existing Next.js, Framer and Webflow projects, and we leave the code cleaner than we found it." },
        { q: "Can I pause or cancel?", a: "Anytime. Unused days roll over to when you come back." },
      ]} />
    </section>
  );
}

function Closing() {
  return (
    <section className="relative overflow-hidden bg-[#050505] px-6 pb-10 pt-24 text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: "rgba(255,194,61,.12)" }} aria-hidden="true" />
      <Reveal>
        <motion.div whileHover={{ scale: 1.005 }} className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[24px] bg-white/[.04] px-8 pb-0 pt-10 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
          <div className="flex items-start justify-between gap-6">
            <h2 className="m-0 max-w-[460px] text-[clamp(28px,3.6vw,44px)] font-semibold leading-[1.1] tracking-[-0.035em]">Make your website your best salesperson</h2>
            <motion.button type="button" whileHover={{ x: 4 }} whileTap={{ scale: 0.94 }} onClick={() => scrollToId("pricing")} className="flex h-9 w-12 flex-none items-center justify-center rounded-[10px] bg-white text-[#111] outline-none focus-visible:ring-2 focus-visible:ring-[#ffc23d]" aria-label="See pricing"><Icon name="arrow" size={16} /></motion.button>
          </div>
          <div className="pointer-events-none mt-6 select-none text-[clamp(120px,22vw,300px)] font-semibold leading-[0.78] tracking-[-0.06em]" style={{ color: "transparent", backgroundImage: "linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,.04))", WebkitBackgroundClip: "text", backgroundClip: "text" }} aria-hidden="true">Kiln</div>
        </motion.div>
      </Reveal>
      <footer className="mx-auto mt-16 max-w-[1180px]">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="m-0 mt-3 max-w-[260px] text-[13px] text-white/50">We design and build websites that bring in customers.</p>
            <div className="mt-4"><ActionButton label="Get started" tone="light" onClick={() => scrollToId("pricing")} /></div>
          </div>
          {[["Home", ["Overview", "Services", "Pricing", "Work", "FAQ"]], ["Studio", ["Our story", "Team", "Careers", "Journal"]], ["Contact", ["Email us", "Book a call", "Help centre"]], ["Legal", ["Privacy", "Terms", "Cookies"]]].map(([t, ls]) => (
            <div key={t as string}><p className="m-0 text-[12px] text-white/40">{t as string}</p><ul className="m-0 mt-3 list-none space-y-2 p-0">{(ls as string[]).map((l) => <li key={l}><a href="#top" onClick={(e) => e.preventDefault()} className="text-[13px] text-white/80 no-underline hover:text-white">{l}</a></li>)}</ul></div>
          ))}
        </div>
        <div className="mt-14 flex items-center justify-between border-t border-white/10 pt-6 text-[12px] text-white/40"><span>© 2026 Kiln Studio</span><span>Made with Nexus UI</span></div>
      </footer>
    </section>
  );
}

export function KilnPage() {
  return (
    <div className="min-h-screen font-sans" style={{ background: PAGE }}>
      <Hero />
      <Logos />
      <Included />
      <Request />
      <Work />
      <Testimonials title="What clients say after launch" />
      <Scaling />
      <Compare />
      <Pricing />
      <Founder />
      <div className="pt-28"><Testimonials dark title="More from the teams we work with" /></div>
      <FaqBlock />
      <Closing />
    </div>
  );
}
