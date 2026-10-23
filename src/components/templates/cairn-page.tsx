"use client";
/* eslint-disable react/no-unescaped-entities */
/**
 * Cairn: a design + development studio on a blueprint layout. Dashed guide
 * rails frame the page, a mountain hero with a highlighted promise, a 2x2
 * process grid with live mini scenes, a 3D coverflow of client work, a
 * masonry of quotes, a services bento with a globe, two-plan pricing, FAQ,
 * a collage CTA and a floating pill that names the section you're in.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import DotGlobe from "@/components/templates/kit/components/DotGlobe";
import { Reveal, ease, scrollToId } from "@/components/templates/kit/parts";
import { Avatar, BrandGlyph, Icon, Laptop, Mark, Mountains, ScaleBox, SectionPill, Wordmark } from "@/components/templates/kit/blocks";
import MacKeyboard from "@/components/templates/kit/components/MacKeyboard";
const landDusk = "/templates/kit/assets/landscape-dusk.jpg";
const relayThumb = "/templates/kit/thumbs/relay.jpg";
const tallyThumb = "/templates/kit/thumbs/tally.jpg";
const wayfareThumb = "/templates/kit/thumbs/wayfare.jpg";
const sideBThumb = "/templates/kit/thumbs/sideb.jpg";
const tplNova = "/videos/assets/tpl-nova.jpg";
const tplHelix = "/videos/assets/tpl-helix.jpg";
const tplLaunch = "/videos/assets/tpl-launch.jpg";
const tplAether = "/videos/assets/tpl-aether.jpg";

const BLUE = "#2f6bff";
const INK = "#16181d";
const MUTED = "#6b7280";

/* ---------------- frame ---------------- */

function Rails() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-full max-w-[1120px]" style={{ transform: "translateX(-50%)" }} aria-hidden="true">
      <div className="absolute inset-y-0 left-0 border-l border-dashed border-[#d4d7de]" />
      <div className="absolute inset-y-0 right-0 border-r border-dashed border-[#d4d7de]" />
    </div>
  );
}
function Hatch() {
  return <div className="pointer-events-none absolute inset-0 -z-0" style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(22,24,29,.035) 0 1px, transparent 1px 9px)" }} aria-hidden="true" />;
}
function Section({ id, children, className = "", hatch = false }: { id?: string; children: ReactNode; className?: string; hatch?: boolean }) {
  return (
    <section id={id} className={`relative border-b border-dashed border-[#d4d7de] ${className}`}>
      {hatch && <Hatch />}
      <div className="relative mx-auto max-w-[1120px]">{children}</div>
    </section>
  );
}

function TalkButton({ label = "Talk to Ava", small = false, avatar = true }: { label?: string; small?: boolean; avatar?: boolean }) {
  return (
    <motion.button type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} className={`group inline-flex items-center gap-2 rounded-[10px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${avatar ? "pl-3.5 pr-1.5" : "px-4"} ${small ? "h-9 text-[13px]" : "h-10 text-[14px]"}`} style={{ background: BLUE, boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 8px 20px -10px rgba(47,107,255,.8)" }}>
      {label}
      {avatar && (
        <span className="relative flex-none">
          <Avatar name="Ava Lin" size={28} hue={215} />
          <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full bg-[#34c759] ring-2 ring-[#2f6bff]" aria-hidden="true" />
        </span>
      )}
    </motion.button>
  );
}
function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <motion.button type="button" onClick={onClick} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} className="inline-flex h-10 items-center rounded-[10px] bg-white px-4 text-[14px] font-medium outline-none shadow-[0_0_0_1px_rgba(22,24,29,.1),0_4px_10px_-6px_rgba(0,0,0,.2)] focus-visible:ring-2" style={{ color: INK }}>{children}</motion.button>;
}

/* ---------------- hero ---------------- */

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden border-b border-dashed border-[#d4d7de]">
      <div className="relative mx-auto max-w-[1120px] overflow-hidden">
        <Mountains theme="day" seed={4} className="inset-x-0 top-0 h-[460px]" style={{ maskImage: "linear-gradient(#000 45%, transparent)", WebkitMaskImage: "linear-gradient(#000 45%, transparent)" }} />
        <div className="relative px-6 pt-5">
          <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease }} className="mx-auto flex h-14 max-w-[640px] items-center justify-between rounded-[14px] bg-white/90 pl-5 pr-2 shadow-[0_0_0_1px_rgba(22,24,29,.06),0_10px_30px_-18px_rgba(0,0,0,.35)] backdrop-blur" aria-label="Main">
            <span className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.02em]" style={{ color: INK }}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><ellipse cx="9" cy="15" rx="7" ry="2.4" fill={INK} /><ellipse cx="9" cy="10.4" rx="5.2" ry="2" fill={INK} opacity=".75" /><ellipse cx="9" cy="6.4" rx="3.4" ry="1.7" fill={INK} opacity=".5" /><ellipse cx="9" cy="3.2" rx="2" ry="1.3" fill={BLUE} /></svg>
              Cairn
            </span>
            <span className="hidden items-center gap-3 text-[13.5px] sm:flex" style={{ color: MUTED }}>
              {[["Pricing", "pricing"], ["Work", "work"], ["Services", "services"]].map(([l, id], i) => (
                <span key={id} className="flex items-center gap-3">{i > 0 && <span className="h-1 w-1 rounded-full bg-[#c4c8d0]" />}<button type="button" onClick={() => scrollToId(id)} className="outline-none hover:text-[#16181d] focus-visible:text-[#16181d]">{l}</button></span>
              ))}
            </span>
            <TalkButton label="Book a call" small avatar={false} />
          </motion.nav>
          <div className="mx-auto max-w-[680px] pb-16 pt-24 text-center">
            <h1 className="m-0 text-balance text-[clamp(34px,5vw,54px)] font-semibold leading-[1.1] tracking-[-0.035em]" style={{ color: INK }}>
              Websites that <Mark color={BLUE} delay={0.9}>earn trust</Mark> before the first scroll ends
            </h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="mx-auto mb-0 mt-5 max-w-[470px] text-[16px] leading-[1.6]" style={{ color: MUTED }}>Cairn is a small design and development studio. We build custom sites with a clear story, considered motion, and the performance to hold up when real traffic arrives.</motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.8 }} className="mt-7 flex flex-wrap items-center justify-center gap-3"><TalkButton /><GhostButton onClick={() => scrollToId("work")}>See our work</GhostButton></motion.div>
            <p className="m-0 mt-14 text-[12.5px] font-medium" style={{ color: MUTED }}>A few of the teams we've worked with</p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {[["Quillbase", "Docs platform"], ["Orbitly", "Analytics"], ["Fernhouse", "Hospitality"], ["Brightpath", "Learning"]].map(([n, k], i) => (
                <motion.span key={n} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.07 }} className="flex items-center gap-2 text-left">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-white shadow-[0_0_0_1px_rgba(22,24,29,.08)]"><BrandGlyph name={n} /></span>
                  <span><span className="block text-[12.5px] font-semibold" style={{ color: INK }}>{n}</span><span className="block text-[11px]" style={{ color: MUTED }}>{k}</span></span>
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- process ---------------- */

function useLoop(ms: number, steps: number) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.4 });
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setS((x) => (x + 1) % steps), ms);
    return () => clearInterval(id);
  }, [on, ms, steps]);
  return [ref, s] as const;
}

function DesignScene() {
  const [ref, s] = useLoop(1100, 4);
  const pos = [[30, 30], [140, 60], [70, 120], [150, 130]][s];
  return (
    <div ref={ref} className="relative h-[230px] overflow-hidden rounded-[14px] bg-white shadow-[0_0_0_1px_rgba(22,24,29,.06)]">
      <div className="absolute inset-y-0 left-0 w-[70px] border-r border-[#eef0f3] p-2">{[1, 2, 3, 4, 5, 6].map((k) => <div key={k} className="mb-2 h-2 rounded-full bg-[#eef0f3]" style={{ width: `${40 + (k % 3) * 15}%` }} />)}</div>
      <div className="absolute inset-y-0 left-[70px] right-0 bg-[#f7f8fa]" style={{ backgroundImage: "radial-gradient(#dde1e7 1px, transparent 1px)", backgroundSize: "14px 14px" }}>
        <motion.div className="absolute h-[54px] w-[80px] rounded-[8px] bg-white shadow-[0_0_0_1.5px_#2f6bff,0_8px_20px_-10px_rgba(0,0,0,.3)]" animate={{ left: pos[0], top: pos[1] }} transition={{ type: "spring", stiffness: 160, damping: 18 }}>
          <div className="m-2 h-1.5 w-10 rounded-full bg-[#16181d]" /><div className="mx-2 h-1.5 w-14 rounded-full bg-[#e5e7eb]" />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-[2px] bg-white shadow-[0_0_0_1.5px_#2f6bff]" /><span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-[2px] bg-white shadow-[0_0_0_1.5px_#2f6bff]" />
        </motion.div>
        <motion.div className="absolute" animate={{ left: pos[0] + 72, top: pos[1] + 46 }} transition={{ type: "spring", stiffness: 140, damping: 16 }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 2l15 9.5-6.6 1.4 3.6 7-2.6 1.3-3.6-7L4 18.5z" fill="#16181d" stroke="#fff" strokeWidth="1.5" /></svg>
          <span className="ml-3 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: BLUE }}>Ava</span>
        </motion.div>
      </div>
    </div>
  );
}

const TERM = [
  [{ t: "~/orbitly-site", c: "#7dd3fc" }, { t: " main", c: "#c084fc" }],
  [{ t: "$ ", c: "#6b7280" }, { t: "pnpm build", c: "#f4f4f5" }],
  [{ t: "  ▲ Next.js 15.0.3", c: "#f4f4f5" }],
  [{ t: "  Creating an optimized production build ...", c: "#a1a1aa" }],
  [{ t: "  ✓ Compiled successfully", c: "#4ade80" }],
  [{ t: "  ✓ Generating static pages (42/42)", c: "#4ade80" }],
  [{ t: "  ○ (Static)  prerendered as static content", c: "#a1a1aa" }],
  [{ t: "$ ", c: "#6b7280" }, { t: "vercel deploy --prod", c: "#f4f4f5" }],
  [{ t: "  ✓ Production: https://orbitly.com", c: "#4ade80" }, { t: "  [18s]", c: "#6b7280" }],
];

function Lights() {
  return <span className="flex gap-[9px]">{["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-[14px] w-[14px] rounded-full" style={{ background: c, boxShadow: "inset 0 0 0 .5px rgba(0,0,0,.18)" }} />)}</span>;
}

/** What the laptop shows: a desktop with a terminal that builds, then the shipped page in a browser. */
function DevDesktop({ s }: { s: number }) {
  const shown = [1, 2, 4, 6, 7, 9][Math.min(s, 5)];
  const browser = s >= 6;
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, Inter, sans-serif" }}>
      <img src={landDusk} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 70%" }} />
      <div className="absolute inset-x-0 top-0 flex h-[30px] items-center justify-between bg-black/25 px-5 text-[15px] font-medium text-white/90 backdrop-blur-md">
        <span className="flex gap-6"><b className="font-semibold">{browser ? "Safari" : "Terminal"}</b><span className="opacity-80">File</span><span className="opacity-80">Edit</span><span className="opacity-80">View</span><span className="opacity-80">Window</span></span>
        <span className="opacity-90">Tue 14 Oct  9:41</span>
      </div>
      <AnimatePresence mode="wait">
        {!browser ? (
          <motion.div key="term" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35, ease }} className="absolute left-[120px] top-[96px] h-[580px] w-[1040px] overflow-hidden rounded-[14px] bg-[#1c1c1e]/[.97] shadow-[0_40px_80px_-20px_rgba(0,0,0,.7),0_0_0_1px_rgba(255,255,255,.12)]">
            <div className="relative flex h-[46px] items-center border-b border-white/10 px-5"><Lights /><span className="absolute inset-x-0 text-center text-[15px] font-medium text-white/60">orbitly-site — zsh — 120×32</span></div>
            <div className="px-7 py-6 text-[29px] leading-[1.6]" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {TERM.slice(0, shown).map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="whitespace-pre">{line.map((p, j) => <span key={j} style={{ color: p.c }}>{p.t}</span>)}</motion.div>
              ))}
              <motion.span className="inline-block h-[32px] w-[15px] translate-y-[5px] bg-white/80" animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="web" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35, ease }} className="absolute left-[120px] top-[70px] h-[660px] w-[1040px] overflow-hidden rounded-[14px] bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,.7),0_0_0_1px_rgba(0,0,0,.2)]">
            <div className="relative flex h-[52px] items-center border-b border-black/10 bg-[#f6f6f6] px-5"><Lights /><span className="absolute left-1/2 top-1/2 flex h-[32px] w-[420px] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 rounded-[9px] bg-black/[.06] text-[16px] text-[#3c3c43]"><svg width="13" height="15" viewBox="0 0 13 15"><rect x="1" y="6.5" width="11" height="8" rx="2" fill="#8e8e93" /><path d="M3.5 6.5V4.5a3 3 0 0 1 6 0v2" stroke="#8e8e93" strokeWidth="1.6" fill="none" /></svg>orbitly.com</span></div>
            <div className="relative h-[608px] overflow-hidden">
              <motion.img src={relayThumb} alt="" className="absolute left-0 top-0 w-full" initial={{ y: 0 }} animate={{ y: [0, 0, -900] }} transition={{ duration: 3.4, times: [0, 0.2, 1], ease: [0.45, 0, 0.2, 1] }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DevScene() {
  const [ref, s] = useLoop(900, 10);
  return (
    <div ref={ref} className="relative flex h-[250px] items-end justify-center overflow-hidden rounded-[14px] bg-white shadow-[0_0_0_1px_rgba(22,24,29,.06)]">
      <Laptop className="mb-1 w-[92%] max-w-[350px]"><DevDesktop s={s} /></Laptop>
    </div>
  );
}

function MicroScene() {
  const [ref, s] = useLoop(1300, 2);
  return (
    <div ref={ref} className="relative flex h-[230px] items-center justify-center gap-5 overflow-hidden rounded-[14px] bg-[#f7f8fa] shadow-[0_0_0_1px_rgba(22,24,29,.06)]">
      <pre className="m-0 rounded-[10px] bg-white p-3 text-[10px] leading-[1.6] shadow-[0_8px_20px_-12px_rgba(0,0,0,.3)]" style={{ color: INK, fontFamily: "ui-monospace, Menlo, monospace" }}>
{`<motion.span
  animate={{ x: on ? 22 : 0 }}
  transition={{
    type: "spring",
    stiffness: `}<motion.b key={s} initial={{ color: BLUE }} animate={{ color: INK }}>{s ? "520" : "380"}</motion.b>{`,
  }}
/>`}
      </pre>
      <span className="relative h-8 w-[54px] rounded-full" style={{ background: s ? "#30d158" : "#d1d5db", transition: "background .3s" }}>
        <motion.span className="absolute top-1 h-6 w-6 rounded-full bg-white shadow" animate={{ left: s ? 26 : 4 }} transition={{ type: "spring", stiffness: s ? 520 : 380, damping: 22 }} />
      </span>
    </div>
  );
}

function ChatScene() {
  const msgs = [
    { who: "Ava", t: "Morning! Mobile nav is tightened up and the hero loads 40% faster.", me: false },
    { who: "You", t: "Looks great. Can we try the darker CTA?", me: true },
    { who: "Ava", t: "Done, preview is up. Shipping after your thumbs up.", me: false },
  ];
  const [ref, s] = useLoop(1500, 5);
  return (
    <div ref={ref} className="relative h-[230px] overflow-hidden rounded-[14px] bg-white p-3 shadow-[0_0_0_1px_rgba(22,24,29,.06)]">
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold" style={{ color: INK }}># daily-updates<span className="flex items-center gap-1 text-[10px] font-normal" style={{ color: MUTED }}><span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />Live</span></div>
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {msgs.slice(0, Math.min(3, s + 1)).map((m, i) => (
            <motion.div key={i} layout initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 26 }} className={`flex items-end gap-2 ${m.me ? "flex-row-reverse" : ""}`}>
              <Avatar name={m.me ? "You Me" : "Ava Lin"} size={20} hue={m.me ? 30 : 200} />
              <span className={`max-w-[78%] rounded-[12px] px-2.5 py-1.5 text-[11px] leading-[1.4] ${m.me ? "text-white" : ""}`} style={{ background: m.me ? BLUE : "#f1f3f6", color: m.me ? "#fff" : INK }}>{m.t}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Step({ n, color, title, body }: { n: number; color: string; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 border-t border-dashed border-[#d4d7de] px-6 py-5">
      <motion.span initial={{ scale: 0, rotate: -30 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 300, damping: 14 }} className="flex h-6 w-6 flex-none items-center justify-center rounded-[6px] text-[12px] font-bold text-white" style={{ background: color }}>{n}</motion.span>
      <p className="m-0 text-[14px] leading-[1.5]" style={{ color: MUTED }}><b style={{ color: INK }}>{title}</b> {body}</p>
    </div>
  );
}

function Process() {
  return (
    <Section id="process">
      <div className="px-6 pb-8 pt-12">
        <Reveal><h2 className="m-0 text-[22px] font-semibold tracking-[-0.02em]" style={{ color: INK }}>A process tuned for momentum</h2></Reveal>
        <p className="m-0 mt-1 max-w-[340px] text-[14px]" style={{ color: MUTED }}>Design, build, polish, and stay in sync. Nothing gets lost in the handoff.</p>
      </div>
      <div className="grid grid-cols-1 border-t border-dashed border-[#d4d7de] md:grid-cols-2">
        {[
          { scene: <DesignScene />, n: 1, c: "#2f6bff", t: "Designing", b: "in the browser, so what you approve is what ships." },
          { scene: <DevScene />, n: 2, c: "#f5b40a", t: "Development", b: "on Next.js, with a performance budget agreed up front." },
          { scene: <MicroScene />, n: 3, c: "#ff375f", t: "Motion", b: "drawn for your brand instead of pulled from a template." },
          { scene: <ChatScene />, n: 4, c: "#ff7a1a", t: "Updates", b: "in one shared channel, written up at the end of each day." },
        ].map((x, i) => (
          <div key={x.t} className={`relative ${i % 2 === 0 ? "md:border-r md:border-dashed md:border-[#d4d7de]" : ""} ${i < 2 ? "border-b border-dashed border-[#d4d7de]" : ""}`}>
            <Hatch />
            <Reveal className="relative p-5" delay={i * 0.05}>{x.scene}</Reveal>
            <div className="relative bg-white"><Step n={x.n} color={x.c} title={x.t} body={x.b} /></div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- coverflow ---------------- */

const SHOTS = [relayThumb, tplNova, tallyThumb, tplHelix, wayfareThumb, tplLaunch, sideBThumb, tplAether];

function Coverflow() {
  const [i, setI] = useState(2);
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.3 });
  const touched = useRef(false);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => { if (!touched.current) setI((x) => (x + 1) % SHOTS.length); }, 2400);
    return () => clearInterval(id);
  }, [on]);
  return (
    <Section id="work">
      <div ref={ref} className="relative overflow-hidden py-20">
        <Reveal><h2 className="m-0 text-center text-[clamp(24px,3vw,30px)] font-semibold leading-[1.25] tracking-[-0.025em]" style={{ color: INK }}>Recent work for teams you may know</h2></Reveal>
        <div className="relative mt-10 h-[340px]" style={{ perspective: 1400 }} onPointerDown={() => (touched.current = true)}>
          <Hatch />
          {SHOTS.map((src, k) => {
            let d = k - i;
            if (d > SHOTS.length / 2) d -= SHOTS.length;
            if (d < -SHOTS.length / 2) d += SHOTS.length;
            const ad = Math.abs(d);
            return (
              <motion.button key={k} type="button" onClick={() => { touched.current = true; setI(k); }} aria-label={`Show project ${k + 1}`}
                className="absolute left-1/2 top-1/2 h-[250px] w-[400px] overflow-hidden rounded-[12px] bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,.45),0_0_0_1px_rgba(22,24,29,.06)] outline-none focus-visible:ring-2"
                style={{ marginLeft: -200, marginTop: -125, zIndex: 10 - ad }}
                animate={{ x: d * 230 * (ad > 1 ? 0.85 : 1), rotateY: d === 0 ? 0 : d > 0 ? -38 : 38, scale: d === 0 ? 1.12 : 0.82 - ad * 0.04, opacity: ad > 3 ? 0 : 1, filter: d === 0 ? "blur(0px)" : `blur(${Math.min(3, ad)}px)` }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}>
                <img src={src} alt="" className="h-full w-full object-cover object-top" draggable={false} />
              </motion.button>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ---------------- testimonials ---------------- */

const T = [
  { q: "They moved the launch up by two weeks and the Lighthouse scores were green on the first deploy.", n: "Marcus Chen", r: "CTO, Quillbase" },
  { q: "I sent a messy Notion page as the brief. Three days later there was a staging link that matched what I had in my head.", n: "Elena Vargas", r: "Founder, Orbitly" },
  { q: "Our old site took 6 seconds to show anything. The new one is up before people finish moving the mouse.", n: "Kenji Sato", r: "Head of Design, Fernhouse" },
  { q: "They told us which of our own ideas to cut. That saved us a month.", n: "Sofia Almeida", r: "Founder, Brightpath" },
  { q: "Written update every afternoon, never a surprise invoice, and a handover doc our new hire read in one sitting.", n: "Priya Nair", r: "PM, Copperline" },
  { q: "Signups from the pricing page went up 31% the month after relaunch.", n: "Jonas Keller", r: "CMO, Tidewater" },
];

function Quotes() {
  return (
    <Section hatch>
      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
        {T.slice(0, 2).map((t, i) => <QuoteCell key={t.n} t={t} i={i} />)}
        <Reveal className="md:row-span-2">
          <motion.div whileHover={{ y: -4 }} className="flex h-full flex-col justify-between rounded-[16px] p-6 text-white" style={{ background: `linear-gradient(170deg, ${BLUE}, #1d4fd6)` }}>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-medium"><Wordmark name="Orbitly" glyph={1} className="text-[12px] text-white" /></span>
              <p className="m-0 mt-6 text-[19px] font-medium leading-[1.45]">"We asked for three pages. They sent back a type system, a motion spec and the three pages, and the whole thing was live before our board meeting."</p>
            </div>
            <div className="mt-6 flex items-center gap-3"><Avatar name="Daniel Cho" size={36} hue={30} /><span><span className="block text-[14px] font-semibold">Daniel Cho</span><span className="text-[12.5px] text-white/70">Head of Product, Orbitly</span></span></div>
          </motion.div>
        </Reveal>
        {T.slice(2).map((t, i) => <QuoteCell key={t.n} t={t} i={i + 2} />)}
      </div>
    </Section>
  );
}
function QuoteCell({ t, i }: { t: (typeof T)[number]; i: number }) {
  return (
    <Reveal delay={(i % 3) * 0.05}>
      <motion.div whileHover={{ y: -3 }} className="flex h-full min-h-[180px] flex-col justify-between rounded-[16px] bg-white p-5 shadow-[0_0_0_1px_rgba(22,24,29,.06)]">
        <p className="m-0 text-[14px] leading-[1.55]" style={{ color: INK }}>"{t.q}"</p>
        <div className="mt-5 flex items-center gap-2.5"><Avatar name={t.n} size={30} hue={(i * 63) % 360} /><span><span className="block text-[13px] font-semibold" style={{ color: INK }}>{t.n}</span><span className="text-[12px]" style={{ color: MUTED }}>{t.r}</span></span></div>
      </motion.div>
    </Reveal>
  );
}

/* ---------------- services ---------------- */

function TypingKeys() {
  return (
    <div className="flex min-h-[230px] items-center">
      <MacKeyboard layout="compact" theme="light" accent={BLUE} autoplay autoplayText="words that get found" placeholder="Write the headline" listen />
    </div>
  );
}

const CAPTIONS = [
  { who: "Ava Lin", t: "Lead with the promise, then put the proof right under it." },
  { who: "Daniel Cho", t: "So the customer count moves up into the hero?" },
  { who: "Ava Lin", t: "Yes. Features wait until section three, after the how-it-works." },
  { who: "Daniel Cho", t: "Makes sense. Pricing stays where it is?" },
];
const OUTLINE = [
  ["Promise", "Close the books in a day, not a week"],
  ["Proof", "1,200 finance teams · 4.8 on G2"],
  ["How it works", "Connect, reconcile, report"],
  ["Pricing", "Two plans, cancel anytime"],
];

function CallIcon({ d, red }: { d: string; red?: boolean }) {
  return <span className={`flex h-[34px] items-center justify-center rounded-full ${red ? "w-[52px] bg-[#ea4335]" : "w-[34px] bg-[#3c4043]"}`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8eaed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg></span>;
}

function Tile({ name, hue, talking }: { name: string; hue: number; talking: boolean }) {
  return (
    <div className="relative flex flex-1 items-center justify-center rounded-[10px] bg-[#3c4043]" style={{ boxShadow: talking ? "inset 0 0 0 2px #8ab4f8" : "none", transition: "box-shadow .25s" }}>
      <span className="relative">
        {talking && <motion.span className="absolute -inset-[5px] rounded-full" style={{ boxShadow: "0 0 0 3px rgba(138,180,248,.55)" }} animate={{ scale: [1, 1.12, 1.04, 1.16, 1] }} transition={{ duration: 1.1, repeat: Infinity }} />}
        <Avatar name={name} size={40} hue={hue} />
      </span>
      <span className="absolute bottom-1.5 left-2 text-[10.5px] font-medium text-[#e8eaed]">{name.split(" ")[0]}</span>
      <span className="absolute right-2 top-2 flex h-[16px] items-center gap-[2px]">
        {talking ? [0, 1, 2].map((k) => <motion.span key={k} className="w-[3px] rounded-full bg-[#8ab4f8]" animate={{ height: [4, 11, 6, 13, 5] }} transition={{ duration: 0.8, repeat: Infinity, delay: k * 0.12 }} />)
          : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8eaed" strokeWidth="2.2" strokeLinecap="round"><path d="M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V5a3 3 0 0 0-5.9-.7M19 11a7 7 0 0 1-1.2 3.9M5 11a7 7 0 0 0 10.6 6M12 18v3M3 3l18 18" /></svg>}
      </span>
    </div>
  );
}

/** A video call the way they actually look: cameras off, a shared doc, live captions. */
function CallScene() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.3 });
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setT((x) => x + 1), 120);
    return () => clearInterval(id);
  }, [on]);
  const PER = 48;
  const ci = Math.floor(t / PER) % CAPTIONS.length;
  const cap = CAPTIONS[ci];
  const words = cap.t.split(" ");
  const said = words.slice(0, Math.min(words.length, Math.floor((t % PER) / 2.4) + 1)).join(" ");
  const secs = 12 * 60 + 4 + Math.floor((t * 120) / 1000);
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  const line = [0, 1, 2, 3][ci];
  const ava = cap.who === "Ava Lin";
  return (
    <div ref={ref}>
      <ScaleBox w={600} h={330} contain className="h-[230px] w-full">
        <div className="flex h-full w-full flex-col gap-[7px] rounded-[16px] bg-[#202124] p-[10px] shadow-[0_24px_50px_-24px_rgba(0,0,0,.6)]" style={{ fontFamily: "Inter, -apple-system, sans-serif" }}>
          <div className="flex h-[20px] items-center justify-between px-1 text-[11.5px]">
            <span className="flex items-center gap-2 text-[#e8eaed]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#ea4335]" />Strategy call<span className="tabular-nums text-[#9aa0a6]">{clock}</span></span>
            <span className="text-[#9aa0a6]">Orbitly × Cairn</span>
          </div>
          <div className="flex h-[200px] gap-[7px]">
            <div className="relative flex-1 overflow-hidden rounded-[10px] bg-white px-5 py-4">
              <span className="absolute right-2 top-2 rounded-full bg-[#202124]/80 px-2 py-0.5 text-[9.5px] text-[#e8eaed]">Ava is presenting</span>
              <p className="m-0 text-[10px] font-medium uppercase tracking-[.08em] text-[#9aa0a6]">Orbitly · Homepage</p>
              <p className="m-0 mt-1 text-[15px] font-semibold" style={{ color: INK }}>Message order, top to bottom</p>
              <div className="relative mt-3 flex flex-col gap-[3px]">
                {OUTLINE.map(([k, v], i) => (
                  <div key={k} className="relative flex items-baseline gap-2 rounded-[6px] px-2 py-[5px] text-[11.5px]">
                    {i === line && <motion.span layoutId="call-hl" className="absolute inset-0 rounded-[6px] bg-[#fff3c4]" transition={{ type: "spring", stiffness: 260, damping: 28 }} />}
                    <span className="relative w-3 text-[#9aa0a6]">{i + 1}</span>
                    <b className="relative w-[86px] flex-none font-semibold" style={{ color: INK }}>{k}</b>
                    <span className="relative" style={{ color: "#4b5563" }}>{v}</span>
                  </div>
                ))}
                <motion.span className="pointer-events-none absolute left-[410px] flex items-start" animate={{ top: line * 27 + 14 }} transition={{ type: "spring", stiffness: 120, damping: 18 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24"><path d="M4 2l15 9.5-6.6 1.4 3.6 7-2.6 1.3-3.6-7L4 18.5z" fill="#1a73e8" stroke="#fff" strokeWidth="1.5" /></svg>
                  <span className="ml-0.5 mt-2.5 rounded-full bg-[#1a73e8] px-1.5 py-[1px] text-[9px] font-semibold text-white">Ava</span>
                </motion.span>
              </div>
            </div>
            <div className="flex w-[124px] flex-col gap-[7px]">
              <Tile name="Ava Lin" hue={200} talking={ava} />
              <Tile name="Daniel Cho" hue={30} talking={!ava} />
            </div>
          </div>
          <div className="flex h-[30px] items-center rounded-[8px] bg-black/40 px-3 text-[12px] text-[#e8eaed]">
            <b className="mr-1.5 font-semibold text-[#8ab4f8]">{cap.who.split(" ")[0]}:</b><span className="truncate">{said}</span>
          </div>
          <div className="flex h-[38px] items-center justify-center gap-2">
            <CallIcon d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 11a7 7 0 0 1-14 0M12 18v3" />
            <CallIcon d="M23 7l-7 5 7 5V7zM1 5h15v14H1z" />
            <CallIcon d="M3 4h18v12H3zM8 20h8M12 16v4M9 10l3-3 3 3M12 7v6" />
            <CallIcon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <CallIcon red d="M10.7 13.3a16 16 0 0 0 3.4 2.6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 4.2 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8.9 9.7" />
          </div>
        </div>
      </ScaleBox>
    </div>
  );
}

function WavesCard() {
  return (
    <div className="relative mx-auto h-[210px] w-[56%] overflow-hidden rounded-[22px] shadow-[0_20px_40px_-20px_rgba(0,0,0,.45)]" style={{ background: "linear-gradient(180deg,#0c3b5c,#1673a3 60%,#7fd3e6)" }}>
      <div className="absolute inset-x-0 top-5 text-center text-white"><div className="text-[11px] opacity-80">Tuesday, 14 October</div><div className="text-[40px] font-semibold leading-none tracking-[-0.03em]">7:00</div></div>
      {[0, 1, 2].map((k) => (
        <motion.svg key={k} viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute left-0 h-[60px] w-[200%]" style={{ bottom: k * 18 - 8, opacity: 0.35 + k * 0.2 }} animate={{ x: ["0%", "-50%"] }} transition={{ duration: 6 + k * 2, repeat: Infinity, ease: "linear" }}>
          <path d="M0 30 Q50 10 100 30 T200 30 T300 30 T400 30 V60 H0Z" fill="#fff" />
        </motion.svg>
      ))}
    </div>
  );
}

function Services() {
  const box = "relative flex flex-col justify-between overflow-hidden rounded-[18px] bg-[#f3f4f7] p-5";
  return (
    <Section id="services">
      <div className="px-6 pb-10 pt-16">
        <Reveal><h2 className="m-0 text-center text-[clamp(24px,3vw,30px)] font-semibold tracking-[-0.025em]" style={{ color: INK }}>One studio, from first sketch to launch day</h2></Reveal>
        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Reveal><div className={box}><DevScene /><div className="mt-4"><h3 className="m-0 text-[15px] font-semibold" style={{ color: INK }}>Web and app design and development</h3><p className="m-0 mt-1 text-[13.5px] leading-[1.5]" style={{ color: MUTED }}>From idea to wireframes to launch, handled at a speed most teams can't match.</p></div></div></Reveal>
          <Reveal delay={0.05}><div className={box}><WavesCard /><div className="mt-4"><h3 className="m-0 text-[15px] font-semibold" style={{ color: INK }}>Microinteractions and 3D</h3><p className="m-0 mt-1 text-[13.5px] leading-[1.5]" style={{ color: MUTED }}>Small moments of motion that make a site feel alive and make people stay.</p></div></div></Reveal>
          <Reveal delay={0.08}><div className={box}><TypingKeys /><div className="mt-4"><h3 className="m-0 text-[15px] font-semibold" style={{ color: INK }}>Copywriting and SEO</h3><p className="m-0 mt-1 text-[13.5px] leading-[1.5]" style={{ color: MUTED }}>Words that sell and get found, on Google and in AI answers.</p></div></div></Reveal>
          <Reveal delay={0.1}><div className={box}><CallScene /><div className="mt-4"><h3 className="m-0 text-[15px] font-semibold" style={{ color: INK }}>Creative direction and strategy</h3><p className="m-0 mt-1 text-[13.5px] leading-[1.5]" style={{ color: MUTED }}>We help you decide what the site should say before we decide how it looks.</p></div></div></Reveal>
          <Reveal className="md:col-span-2" delay={0.12}>
            <div className="grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[18px] bg-[#f3f4f7] p-6 md:grid-cols-[1fr_auto]">
              <div>
                <h3 className="m-0 text-[15px] font-semibold" style={{ color: INK }}>Anything and everything web</h3>
                <p className="m-0 mt-1 max-w-[420px] text-[13.5px] leading-[1.5]" style={{ color: MUTED }}>Payments, hosting, maintenance, revisions, design systems, and everything in between.</p>
                <p className="m-0 mt-6 text-[12.5px] font-medium" style={{ color: INK }}>Trusted by 60+ teams worldwide</p>
                <div className="mt-2 flex">{["Ana Ruiz", "Ben Ode", "Cy Lam", "Dee Fox", "Eli Ng"].map((n, i) => <span key={n} className="-ml-1.5 first:ml-0 rounded-full ring-2 ring-[#f3f4f7]"><Avatar name={n} size={28} hue={i * 60} /></span>)}</div>
              </div>
              <div className="justify-self-center"><DotGlobe size={280} accent={BLUE} autoplay /></div>
            </div>
          </Reveal>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
          {[["layers", "Web design and development", "Designed and built with care, start to finish."], ["phone", "Mobile first", "Every page works beautifully on every screen."], ["moon", "Light and dark", "Accessible in both, tested by real eyes."], ["code", "Current stack", "Next.js, Tailwind and Motion, kept up to date."], ["chat", "Regular updates", "You always know what shipped and what's next."], ["refresh", "Future-proof", "Easy for your team to change after handover."]].map(([ic, t, d], i) => (
            <Reveal key={t} delay={(i % 3) * 0.05}>
              <div><motion.span whileHover={{ rotate: -10, scale: 1.1 }} className="inline-flex" style={{ color: BLUE }}><Icon name={ic} /></motion.span><h4 className="m-0 mt-2 text-[14px] font-semibold" style={{ color: INK }}>{t}</h4><p className="m-0 mt-1 text-[13px] leading-[1.5]" style={{ color: MUTED }}>{d}</p></div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------------- pricing ---------------- */

function Price({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const on = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const txt = useTransform(mv, (v) => Math.round(v).toLocaleString("en-US"));
  const [s, setS] = useState("0");
  useEffect(() => { if (on) { const c = animate(mv, to, { duration: 1.2, ease }); return () => c.stop(); } }, [on, mv, to]);
  useEffect(() => txt.on("change", setS), [txt]);
  return <span ref={ref} className="tabular-nums">{s}</span>;
}

function Pricing() {
  const plan = (blue: boolean, name: string, desc: string, price: number, items: string[], cta: string, tag?: string) => (
    <div className="flex flex-col" style={{ background: blue ? BLUE : "#fff", color: blue ? "#fff" : INK }}>
      <div className="flex-1 p-7">
        <div className="flex items-center justify-between"><h3 className="m-0 text-[17px] font-semibold">{name}</h3>{tag && <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11.5px] font-medium">{tag}</span>}</div>
        <p className="m-0 mt-1 max-w-[260px] text-[13px] leading-[1.5]" style={{ color: blue ? "rgba(255,255,255,.75)" : MUTED }}>{desc}</p>
        <div className="mt-6 text-[12px]" style={{ color: blue ? "rgba(255,255,255,.7)" : MUTED }}>Starts at</div>
        <div className="flex items-end gap-2"><span className="text-[34px] font-semibold tracking-[-0.03em]">$<Price to={price} /></span><span className="mb-1.5 text-[12px]" style={{ color: blue ? "rgba(255,255,255,.7)" : MUTED }}>one-time</span></div>
        <ul className="m-0 mt-6 list-none space-y-2.5 p-0">
          {items.map((it, i) => (
            <motion.li key={it} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 text-[13.5px]">
              <span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: blue ? "rgba(255,255,255,.25)" : "#e8efff", color: blue ? "#fff" : BLUE }}><Icon name="check" size={10} /></span>{it}
            </motion.li>
          ))}
        </ul>
      </div>
      <motion.button type="button" whileHover={{ backgroundColor: blue ? "#1d4fd6" : "#2559e0" }} className="h-14 border-t text-[14px] font-medium text-white outline-none focus-visible:ring-2" style={{ background: blue ? "#2a62f0" : BLUE, borderColor: "rgba(255,255,255,.2)" }}>{cta}</motion.button>
    </div>
  );
  return (
    <Section id="pricing">
      <div className="px-6 pb-6 pt-16 text-center">
        <Reveal><h2 className="m-0 text-[clamp(24px,3vw,30px)] font-semibold leading-[1.25] tracking-[-0.025em]" style={{ color: INK }}>Fixed prices, paid once.<br />No retainers, no hourly billing.</h2></Reveal>
      </div>
      <div className="grid grid-cols-1 border-y border-dashed border-[#d4d7de] md:grid-cols-2">
        {plan(false, "One page", "A high-converting landing page, designed and built to last.", 2400, ["One page, fully custom", "Custom design with React or Next.js", "Two revision rounds", "Delivered in 1-2 weeks", "SEO, hosting and launch handled", "24h support on a private channel"], "Start your page")}
        {plan(true, "Company site", "A complete multi-page site that tells your whole story.", 4600, ["Up to 5 pages", "CMS and blog template", "Three revision rounds", "Delivered in 3-4 weeks", "Add a page anytime for $900"], "Start your site", "Most popular")}
      </div>
      <p className="m-0 px-6 pt-5 text-center text-[12.5px]" style={{ color: MUTED }}>Fixed scope, fixed price. No hourly billing, no surprises. We take a handful of projects each month.</p>
      <div className="m-6 flex flex-wrap items-center justify-between gap-4 rounded-[16px] bg-[#f3f4f7] p-6">
        <div className="max-w-[520px]"><h3 className="m-0 text-[15px] font-semibold" style={{ color: INK }}>Custom work</h3><p className="m-0 mt-1 text-[13px] leading-[1.5]" style={{ color: MUTED }}>An app, a dashboard, a design system or something odder. Tell us what you need and we'll quote a fixed price within a day.</p></div>
        <TalkButton label="Book a call" small avatar={false} />
      </div>
    </Section>
  );
}

/* ---------------- faq ---------------- */

function FaqGrid() {
  const qa = [
    ["code", "What stack do you build on?", "Mostly Next.js, TypeScript, Tailwind and Motion, hosted on Vercel. If your team already has a stack, we'll work in it."],
    ["users", "Why choose Cairn for my project?", "Senior people only, small batches of clients, and a track record of shipping on the date we promise."],
    ["refresh", "What if I need changes after launch?", "Every plan includes post-launch support, and you can add small changes anytime at a fixed rate."],
    ["chat", "How do I reach you during a project?", "A shared Slack channel from day one, with a written update every afternoon."],
    ["clock", "How fast can we start?", "Usually within a week. If we're fully booked, we'll tell you the real start date up front."],
    ["spark", "Do you only offer packages?", "No. The packages cover most sites, and anything else gets a custom fixed quote."],
  ];
  return (
    <Section id="faq">
      <div className="px-6 py-16">
        <Reveal><h2 className="m-0 text-center text-[clamp(24px,3vw,30px)] font-semibold leading-[1.25] tracking-[-0.025em]" style={{ color: INK }}>What people ask before they write</h2></Reveal>
        <div className="mx-auto mt-10 grid max-w-[900px] grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
          {qa.map(([ic, q, a], i) => (
            <Reveal key={q} delay={(i % 2) * 0.05}>
              <div className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-[7px]" style={{ background: "#e8efff", color: BLUE }}><Icon name={ic} size={14} /></span><div><h3 className="m-0 text-[14px] font-semibold italic" style={{ color: INK }}>{q}</h3><p className="m-0 mt-1.5 text-[13.5px] leading-[1.55]" style={{ color: MUTED }}>{a}</p></div></div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------------- cta + footer ---------------- */

function Closing() {
  const side = [relayThumb, tplHelix, tallyThumb, tplNova, wayfareThumb, sideBThumb];
  return (
    <Section id="contact">
      <div className="relative grid grid-cols-1 overflow-hidden md:grid-cols-[1fr_1.1fr_1fr]">
        {[0, 1].map((col) => (
          <div key={col} className={`relative hidden h-[340px] overflow-hidden md:block ${col ? "order-3" : ""}`}>
            <motion.div className="flex flex-col gap-3 p-3" animate={{ y: col ? ["-50%", "0%"] : ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
              {[...side, ...side].map((s, k) => <img key={k} src={s} alt="" className="h-[150px] w-full rounded-[10px] object-cover object-top opacity-80 shadow-[0_0_0_1px_rgba(22,24,29,.06)]" draggable={false} />)}
            </motion.div>
            <div className="absolute inset-0" style={{ background: `linear-gradient(${col ? "270deg" : "90deg"}, rgba(255,255,255,0), #fff)` }} />
          </div>
        ))}
        <div className="relative order-2 flex flex-col items-center justify-center bg-white px-6 py-16 text-center">
          <h2 className="m-0 text-[clamp(24px,3vw,30px)] font-semibold leading-[1.25] tracking-[-0.025em]" style={{ color: INK }}>Let's get your website<br /><Mark color={BLUE} delay={0.2}>designed and launched</Mark> soon.</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><TalkButton /><GhostButton onClick={() => scrollToId("pricing")}>See pricing</GhostButton></div>
        </div>
      </div>
      <footer className="flex flex-wrap items-start justify-between gap-8 border-t border-dashed border-[#d4d7de] px-6 py-12">
        <div><span className="text-[16px] font-semibold" style={{ color: INK }}>Cairn</span><p className="m-0 mt-2 max-w-[220px] text-[13px]" style={{ color: MUTED }}>Design-led websites that earn trust in the first scroll.</p></div>
        <div className="flex gap-14 text-[13px]">
          {[["Studio", ["Work", "Services", "Pricing"]], ["Products", ["UI kit", "Templates"]], ["Legal", ["Privacy", "Terms", "Refunds"]]].map(([t, ls]) => (
            <div key={t as string}><p className="m-0 text-[11.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: MUTED }}>{t as string}</p><ul className="m-0 mt-3 list-none space-y-2 p-0">{(ls as string[]).map((l) => <li key={l}><a href="#home" onClick={(e) => e.preventDefault()} className="no-underline" style={{ color: INK }}>{l}</a></li>)}</ul></div>
          ))}
        </div>
      </footer>
      <div className="flex justify-between border-t border-dashed border-[#d4d7de] px-6 py-5 text-[12px]" style={{ color: MUTED }}><span>© 2026 Cairn Studio</span><span>hello@cairn.studio</span></div>
    </Section>
  );
}

export function CairnPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-white font-sans">
      <Rails />
      <Hero />
      <Process />
      <Coverflow />
      <Quotes />
      <Services />
      <Pricing />
      <FaqGrid />
      <Closing />
      <SectionPill brand="Cairn" accent={BLUE} sections={[{ id: "home", label: "Home" }, { id: "process", label: "Process" }, { id: "work", label: "Work" }, { id: "services", label: "Services" }, { id: "pricing", label: "Pricing" }, { id: "faq", label: "FAQs" }, { id: "contact", label: "Contact" }]} />
    </div>
  );
}
