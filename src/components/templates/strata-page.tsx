"use client";
/**
 * Strata: a dark landing page for an AI inference platform. A live dashboard
 * tilts flat as you scroll into it, a tabbed deploy story over a mountain
 * panel, a draggable node canvas that wires up an endpoint, a dotted world of
 * requests, a code panel that streams its response, a model catalog and
 * tiered pricing with a comparison table.
 */
import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { Reveal, ease, scrollToId } from "@/components/templates/kit/parts";
import { Avatar, DotWorld, Icon, Mountains, Wordmark } from "@/components/templates/kit/blocks";
import MacKeyboard from "@/components/templates/kit/components/MacKeyboard";

const BG = "#09090b";
const LINE = "rgba(255,255,255,.08)";
const SOFT = "rgba(255,255,255,.62)";
const BLUE = "#4c8dff";

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.02em] text-white">
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l7.5 4.3v8.4L10 18.5l-7.5-4.3V5.8z" fill="#fff" /><path d="M10 6l4 2.3v4.4L10 15l-4-2.3V8.3z" fill={BG} /><path d="M10 9.2l1.6.9v1.8l-1.6.9-1.6-.9v-1.8z" fill="#fff" /></svg>
      Strata
    </span>
  );
}
function Btn({ children, light = false, onClick }: { children: ReactNode; light?: boolean; onClick?: () => void }) {
  return (
    <motion.button type="button" onClick={onClick} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#4c8dff] ${light ? "bg-white text-[#09090b]" : "bg-white/[.07] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] hover:bg-white/[.12]"}`}>
      {children}
    </motion.button>
  );
}

/* ---------------- dashboard (hero) ---------------- */

function Spark({ on }: { on: boolean }) {
  const pts = useMemo(() => Array.from({ length: 30 }, (_, i) => 20 - Math.sin(i * 0.5) * 6 - Math.cos(i * 1.3) * 3 - (i > 22 ? (i - 22) * 1.2 : 0)), []);
  const d = pts.map((y, i) => `${i ? "L" : "M"}${i * 6},${y}`).join(" ");
  return (
    <svg viewBox="0 0 174 34" className="h-9 w-full" aria-hidden="true">
      <motion.path d={d} fill="none" stroke="#2f6bff" strokeWidth="1.8" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: on ? 1 : 0 }} transition={{ duration: 1.6, ease }} />
    </svg>
  );
}

function Dashboard() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.2 });
  const [region, setRegion] = useState(0);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => { setTick((t) => t + 1); setRegion((r) => (r + 1) % 4); }, 2200);
    return () => clearInterval(id);
  }, [on]);
  const regions = ["All regions", "Americas", "Europe", "Asia-Pacific"];
  const traffic = [["Virginia", "us-east · 41% of traffic", 23], ["Frankfurt", "eu-central · 26%", 41], ["Tokyo", "ap-northeast · 19%", 18], ["Mumbai", "ap-south · 14%", 52]] as const;
  const bars = useMemo(() => Array.from({ length: 18 }, (_, i) => 0.3 + ((Math.sin(i * 1.7 + tick) + 1) / 2) * 0.7), [tick]);
  return (
    <div ref={ref} className="grid grid-cols-[180px_1fr] overflow-hidden rounded-[14px] bg-white text-[#111] shadow-[0_40px_120px_-40px_rgba(0,0,0,.8)]">
      <aside className="hidden flex-col gap-1 border-r border-black/5 bg-[#fafafa] p-3 text-[12px] sm:flex">
        <div className="mb-2 flex items-center gap-2 px-1"><span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#111]"><svg width="12" height="12" viewBox="0 0 20 20"><path d="M10 1.5l7.5 4.3v8.4L10 18.5l-7.5-4.3V5.8z" fill="#fff" /></svg></span><span><span className="block text-[12px] font-semibold">Strata</span><span className="text-[10px] text-[#888]">Inference</span></span></div>
        <div className="mb-2 flex h-7 items-center gap-1.5 rounded-[7px] bg-white px-2 text-[11px] text-[#999] shadow-[0_0_0_1px_rgba(0,0,0,.06)]"><Icon name="search" size={12} />Search</div>
        {["Playground", "Deployments", "Models", "Logs", "Usage", "Datasets"].map((x) => <span key={x} className={`rounded-[7px] px-2 py-1.5 ${x === "Deployments" ? "bg-[#111] text-white" : "text-[#555]"}`}>{x}</span>)}
        <p className="m-0 mt-3 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#aaa]">Recent runs</p>
        {["Support triage eval", "Translate PDF batch", "Summarise call notes", "Extract invoice fields"].map((x) => <span key={x} className="truncate px-2 py-1 text-[11px] text-[#666]">{x}</span>)}
      </aside>
      <div className="min-w-0 p-4">
        <div className="flex items-center justify-between"><span className="rounded-[7px] bg-[#f4f4f5] px-2.5 py-1 text-[12px] font-medium">Deployments</span><span className="flex items-center gap-1.5"><span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#f4f4f5] text-[#555]"><Icon name="pulse" size={13} /></span><span className="flex h-7 items-center gap-1 rounded-[7px] bg-[#111] px-2.5 text-[11px] font-medium text-white"><Icon name="plus" size={12} />New</span></span></div>
        <div className="relative mt-3 overflow-hidden rounded-[12px] bg-[#e8eef7] p-4" style={{ minHeight: 120 }}>
          <Mountains theme="day" seed={11} parallax={false} className="inset-y-0 right-0 w-[65%]" style={{ maskImage: "linear-gradient(90deg, transparent, #000 40%)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 40%)" }} />
          <div className="relative"><span className="text-[11px] font-medium text-[#2f6bff]">Production</span><p className="m-0 text-[20px] font-semibold tracking-[-0.02em]">Support agent</p><p className="m-0 mt-1 max-w-[230px] text-[11px] text-[#555]">One model served from four regions, scaled by traffic.</p>
            <div className="mt-3 flex gap-2"><span className="flex h-7 items-center gap-1 rounded-[7px] bg-[#111] px-2.5 text-[11px] font-medium text-white"><Icon name="plus" size={11} />Deploy model</span><span className="flex h-7 items-center rounded-[7px] bg-white px-2.5 text-[11px] font-medium shadow-[0_0_0_1px_rgba(0,0,0,.08)]">Playground</span></div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="relative flex rounded-[8px] bg-[#f4f4f5] p-0.5 text-[11px]">
            {regions.map((r, i) => (
              <button key={r} type="button" onClick={() => setRegion(i)} className="relative rounded-[6px] px-2.5 py-1 outline-none">
                {region === i && <motion.span layoutId="strata-region" className="absolute inset-0 rounded-[6px] bg-white shadow-[0_1px_2px_rgba(0,0,0,.12)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative" style={{ color: region === i ? "#111" : "#888" }}>{r}</span>
              </button>
            ))}
          </div>
          <span className="hidden rounded-[7px] px-2 py-1 text-[11px] text-[#555] shadow-[0_0_0_1px_rgba(0,0,0,.08)] sm:inline">Last 24 hours</span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1.1fr]">
          <div className="rounded-[10px] p-3 shadow-[0_0_0_1px_rgba(0,0,0,.06)]"><p className="m-0 text-[10.5px] text-[#888]">p50 latency</p><p className="m-0 text-[22px] font-semibold tracking-[-0.02em] tabular-nums">{84 - (tick % 3)}<span className="text-[12px] font-normal text-[#888]"> ms</span></p><p className="m-0 text-[10px] text-[#1a7f42]">12% faster than last week</p><Spark on={on} /></div>
          <div className="rounded-[10px] p-3 shadow-[0_0_0_1px_rgba(0,0,0,.06)]"><p className="m-0 text-[10.5px] text-[#888]">Throughput</p><p className="m-0 text-[22px] font-semibold tracking-[-0.02em] tabular-nums">{(2410 + (tick % 5) * 13).toLocaleString()}<span className="text-[12px] font-normal text-[#888]"> tok/s</span></p>
            <div className="mt-2 flex h-9 items-end gap-[3px]">{bars.map((b, i) => <motion.span key={i} className="flex-1 rounded-[2px]" style={{ background: i === bars.length - 1 ? "#111" : "#d4d4d8" }} animate={{ height: `${b * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 16 }} />)}</div>
          </div>
          <div className="rounded-[10px] p-3 shadow-[0_0_0_1px_rgba(0,0,0,.06)]"><p className="m-0 text-[10.5px] text-[#888]">Traffic by region</p>
            {traffic.map(([n, s, ms], i) => (
              <div key={n} className="mt-1.5 flex items-center gap-2 text-[11px]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eef3ff] text-[#2f6bff]"><Icon name="globe" size={11} /></span><span className="min-w-0 flex-1"><span className="block font-medium">{n}</span><span className="block truncate text-[9.5px] text-[#999]">{s}</span></span><motion.span className="rounded-[5px] px-1.5 py-0.5 text-[10px] tabular-nums" animate={{ backgroundColor: region === i || region === 0 ? "#eef3ff" : "#f4f4f5" }}>{ms}ms</motion.span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const tilt = useTransform(scrollYProgress, [0, 0.35], [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.35], [0.92, 1]);
  return (
    <section ref={ref} id="top" className="relative overflow-hidden">
      <Mountains theme="dusk" seed={9} className="inset-x-0 top-0 h-[1100px]" style={{ maskImage: "linear-gradient(#000 60%, transparent)", WebkitMaskImage: "linear-gradient(#000 60%, transparent)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(9,9,11,.6), rgba(9,9,11,.42) 40%, rgba(9,9,11,.7) 75%, #09090b)" }} />
      <header className="relative mx-auto flex max-w-[1120px] items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden gap-7 text-[13px] text-white/70 md:flex" aria-label="Main">{[["Features", "features"], ["Network", "network"], ["Developers", "developers"], ["Models", "models"], ["Pricing", "pricing"]].map(([l, id]) => <button key={id} type="button" onClick={() => scrollToId(id)} className="outline-none hover:text-white focus-visible:text-white">{l}</button>)}</nav>
        <span className="flex items-center gap-3"><span className="hidden text-[13px] text-white/80 sm:inline">Log in</span><Btn light>Talk to sales</Btn></span>
      </header>
      <div className="relative mx-auto max-w-[760px] px-6 pb-16 pt-20 text-center text-white">
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="inline-flex items-center gap-2 rounded-full bg-black/30 py-1 pl-1 pr-3 text-[12px] text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)] backdrop-blur"><span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#09090b]">New</span>Multi-region autoscaling is live</motion.span>
        <h1 className="m-0 mt-6 text-[clamp(40px,6.4vw,74px)] font-medium leading-[1.04] tracking-[-0.045em]">
          {["Serve any model,", "near every user"].map((l, i) => <span key={l} className="block overflow-hidden"><motion.span className="block" initial={{ y: "100%", filter: "blur(8px)" }} animate={{ y: 0, filter: "blur(0px)" }} transition={{ duration: 1.1, ease, delay: 0.15 + i * 0.12 }}>{l}</motion.span></span>)}
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="mx-auto mb-0 mt-5 max-w-[470px] text-[16px] leading-[1.55]" style={{ color: SOFT }}>Deploy open or custom models on GPUs that scale to zero. Every request runs in the region closest to the person who sent it.</motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="mt-7 flex flex-wrap items-center justify-center gap-5">
          <Btn light>Deploy a model <Icon name="arrow" size={14} /></Btn>
          <span className="flex items-center gap-2 text-left text-[12px] leading-[1.45] text-white/70"><span className="text-[#34d399]"><Icon name="check" size={16} /></span><span><b className="font-medium text-white">$5 in credits every month</b><br />No card to start</span></span>
        </motion.div>
      </div>
      <div className="relative mx-auto max-w-[1000px] px-6 pb-10" style={{ perspective: 1600 }}>
        <motion.div style={{ rotateX: tilt, scale, transformOrigin: "50% 0%" }} initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease, delay: 0.5 }}><Dashboard /></motion.div>
      </div>
      <p className="relative m-0 text-center text-[12px] text-white/45">Serving production traffic for teams at</p>
      <div className="relative mx-auto mt-5 flex max-w-[900px] flex-wrap justify-center gap-x-12 gap-y-4 px-6 pb-24">
        {["Quillbase", "Orbitly", "Lumenly", "Copperline", "Halcyon", "Keystone"].map((b, i) => <Wordmark key={b} name={b} glyph={i} className="text-[19px] text-white/70" />)}
      </div>
    </section>
  );
}

/* ---------------- deploy story ---------------- */

const STEPS = [
  { t: "Deploy any model", d: "Pull weights from a hub or your own bucket. We build the container and warm it in seconds.", card: { title: "Build #1284", sub: "llama-3.1-8b-instruct", rows: ["Pull weights", "Build image", "Allocate GPUs", "Warm replicas"] } },
  { t: "Scale with traffic", d: "Replicas follow demand second by second, and scale to zero when it's quiet.", card: { title: "Autoscaler", sub: "support-agent · prod", rows: ["2 → 9 replicas", "Queue under 40ms", "Cold start 1.8s", "Back to 0 at night"] } },
  { t: "Route to the nearest region", d: "Each request is answered by the healthy region closest to the user. No DNS changes.", card: { title: "Router", sub: "7 regions live", rows: ["Virginia 23ms", "Frankfurt 41ms", "Tokyo 18ms", "Failover ready"] } },
  { t: "Pay per token", d: "Pay for what you serve. Reserve GPUs when traffic is steady and save on every hour.", card: { title: "This month", sub: "support-agent", rows: ["18.2M tokens", "$0.21 / 1M input", "Reserved: 2 GPUs", "Saved 31%"] } },
];

function DeployStory() {
  const [i, setI] = useState(0);
  const [p, setP] = useState(0);
  const touched = useRef(false);
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref, { amount: 0.4 });
  useEffect(() => {
    if (!on) return;
    let raf = 0, last = performance.now(), acc = p;
    const step = (now: number) => {
      acc += (now - last) / 4200; last = now;
      if (acc >= 1) { acc = 0; if (!touched.current) setI((x) => (x + 1) % STEPS.length); }
      setP(touched.current ? 1 : acc);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);
  const s = STEPS[i];
  return (
    <section ref={ref} id="features" className="mx-auto max-w-[1000px] px-6 pb-32">
      <Reveal><h2 className="m-0 max-w-[460px] text-[clamp(30px,4vw,44px)] font-medium leading-[1.08] tracking-[-0.035em] text-white">Everything between your weights and your users</h2></Reveal>
      <div className="relative mt-10 h-[380px] overflow-hidden rounded-[16px]">
        <Mountains theme="day" seed={3} parallax={false} className="inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, y: 20, scale: 0.96, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, y: -14, scale: 0.98, filter: "blur(6px)" }} transition={{ type: "spring", stiffness: 260, damping: 26 }} className="w-[290px] rounded-[14px] bg-white/95 p-4 text-[#111] shadow-[0_30px_60px_-24px_rgba(0,0,0,.5)] backdrop-blur">
              <div className="flex items-center justify-between"><span className="text-[11px] text-[#888]">{s.card.sub}</span><span className="rounded-full bg-[#e7f7ec] px-2 py-0.5 text-[10px] font-semibold text-[#1a7f42]">Live</span></div>
              <p className="m-0 mt-0.5 text-[20px] font-semibold tracking-[-0.02em]">{s.card.title}</p>
              <ul className="m-0 mt-3 list-none space-y-1.5 p-0">{s.card.rows.map((r, k) => (
                <motion.li key={r} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + k * 0.12 }} className="flex items-center gap-2 text-[12.5px]">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25 + k * 0.12, type: "spring", stiffness: 500, damping: 16 }} className="flex h-4 w-4 items-center justify-center rounded-full bg-[#30d158] text-white"><Icon name="check" size={10} /></motion.span>{r}
                </motion.li>
              ))}</ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 md:grid-cols-4" role="tablist">
        {STEPS.map((x, k) => (
          <button key={x.t} type="button" role="tab" aria-selected={i === k} onClick={() => { touched.current = true; setI(k); }} className="group text-left outline-none">
            <span className="block h-[2px] overflow-hidden rounded-full bg-white/10"><span className="block h-full bg-white" style={{ width: k < i ? "100%" : k === i ? `${p * 100}%` : "0%", transition: k === i ? "none" : "width .3s" }} /></span>
            <span className={`mt-3 block text-[14px] font-medium ${i === k ? "text-white" : "text-white/50 group-hover:text-white/80"}`}>{x.t}</span>
            <AnimatePresence initial={false}>{i === k && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1 block overflow-hidden text-[13px] leading-[1.5]" style={{ color: SOFT }}>{x.d}</motion.span>}</AnimatePresence>
          </button>
        ))}
      </div>
      <div className="mt-8 flex gap-3"><Btn light>Start deploying <Icon name="arrow" size={14} /></Btn><Btn>Talk to an engineer</Btn></div>
    </section>
  );
}

/* ---------------- node canvas ---------------- */

type N = { id: string; x: number; y: number; title: string; icon: string; body: ReactNode; out?: boolean; inn?: boolean };

function NodeCard({ n, onDrag, active }: { n: N; onDrag: (id: string, dx: number, dy: number) => void; active: boolean }) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const down = (e: RPointerEvent<HTMLDivElement>) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); start.current = { x: e.clientX, y: e.clientY }; };
  const move = (e: RPointerEvent<HTMLDivElement>) => { if (!start.current) return; onDrag(n.id, e.clientX - start.current.x, e.clientY - start.current.y); start.current = { x: e.clientX, y: e.clientY }; };
  return (
    <motion.div role="group" aria-label={n.title} onPointerDown={down} onPointerMove={move} onPointerUp={() => (start.current = null)}
      className="absolute w-[200px] cursor-grab touch-none select-none rounded-[12px] bg-[#141417] p-3 text-[11.5px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-20px_rgba(0,0,0,.8)] active:cursor-grabbing"
      style={{ left: n.x, top: n.y }} animate={{ boxShadow: active ? "inset 0 0 0 1px rgba(76,141,255,.6), 0 0 0 4px rgba(76,141,255,.12)" : "inset 0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -20px rgba(0,0,0,.8)" }}>
      <div className="flex items-center gap-1.5 text-white"><span className="text-white/60"><Icon name={n.icon} size={13} /></span><b className="font-medium">{n.title}</b></div>
      <div className="mt-2 text-white/55">{n.body}</div>
      {n.out && <span className="absolute -right-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_#09090b]" />}
      {n.inn && <span className="absolute -left-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_#09090b]" />}
    </motion.div>
  );
}

function Canvas() {
  const init: N[] = [
    { id: "model", x: 210, y: 30, title: "Model", icon: "cpu", body: <>llama-3.1-70b-instruct<br />fp8 · 128k context</>, out: true },
    { id: "hw", x: 20, y: 170, title: "Hardware", icon: "layers", body: <>H100 · 2 replicas<br />scale to zero</>, out: true },
    { id: "regions", x: 230, y: 170, title: "Regions", icon: "globe", body: <span className="flex flex-wrap gap-1">{["us-east", "eu-central", "ap-ne"].map((r) => <span key={r} className="rounded bg-white/[.06] px-1.5 py-0.5">{r}</span>)}</span>, out: true },
    { id: "prompt", x: 210, y: 300, title: "System prompt", icon: "chat", body: <>You are a helpful support agent for Orbitly. Be brief.</>, out: true },
    { id: "endpoint", x: 470, y: 120, title: "Endpoint", icon: "bolt", body: <>support-agent · prod<br /><span className="text-[#34d399]">● healthy</span></>, inn: true, out: true },
    { id: "widget", x: 740, y: 30, title: "Support widget", icon: "chat", body: <>help.orbitly.com</>, inn: true },
    { id: "slack", x: 760, y: 170, title: "Slack bot", icon: "users", body: <>#support-triage</>, inn: true },
    { id: "alerts", x: 740, y: 300, title: "Usage alerts", icon: "pulse", body: <>p95 over 300ms</>, inn: true },
  ];
  const [nodes, setNodes] = useState(init);
  const [wired, setWired] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.35 });
  useEffect(() => {
    if (!on || wired) return;
    const id = setTimeout(() => setWired(1), 500);
    return () => clearTimeout(id);
  }, [on, wired]);
  const by = (id: string) => nodes.find((n) => n.id === id)!;
  const edges: [string, string][] = [["model", "endpoint"], ["hw", "endpoint"], ["regions", "endpoint"], ["prompt", "endpoint"], ["endpoint", "widget"], ["endpoint", "slack"], ["endpoint", "alerts"]];
  const drag = (id: string, dx: number, dy: number) => setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, x: n.x + dx, y: n.y + dy } : n)));
  return (
    <section id="developers" className="border-y py-28" style={{ borderColor: LINE, backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
      <div className="mx-auto max-w-[1000px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><Reveal><h2 className="m-0 text-[clamp(30px,4vw,44px)] font-medium leading-[1.08] tracking-[-0.035em] text-white">Wire up an endpoint<br />in a minute</h2></Reveal><p className="m-0 mt-3 max-w-[400px] text-[14px] leading-[1.55]" style={{ color: SOFT }}>Connect a model, hardware, regions and a prompt. Strata turns the graph into a live API. Drag the nodes around.</p></div>
          <span className="flex gap-2"><Btn onClick={() => { setNodes(init); setWired(0); setTimeout(() => setWired(1), 50); }}>Reset</Btn><Btn light onClick={() => { setWired(0); setTimeout(() => setWired(1), 50); }}>Connect all</Btn></span>
        </div>
        <div ref={ref} className="relative mt-10 overflow-x-auto">
          <div className="relative h-[400px] w-[960px]">
            <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
              {edges.map(([a, b], k) => {
                const A = by(a), B = by(b);
                const x1 = A.x + 200, y1 = A.y + 34, x2 = B.x, y2 = B.y + 34, mx = (x1 + x2) / 2;
                const d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
                return (
                  <g key={`${a}-${b}`}>
                    <path d={d} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
                    <motion.path d={d} fill="none" stroke={a === "model" ? "#ff9f0a" : BLUE} strokeWidth="1.8" initial={{ pathLength: 0 }} animate={{ pathLength: wired ? 1 : 0 }} transition={{ duration: 0.7, delay: wired ? k * 0.12 : 0, ease }} />
                    {wired ? <motion.circle r="3" fill="#fff" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity, delay: 1 + k * 0.3 }}><animateMotion dur="1.6s" repeatCount="indefinite" path={d} begin={`${1 + k * 0.3}s`} /></motion.circle> : null}
                  </g>
                );
              })}
            </svg>
            {nodes.map((n) => <NodeCard key={n.id} n={n} onDrag={drag} active={wired === 1 && n.id === "endpoint"} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- playground ---------------- */

function Playground() {
  return (
    <section id="playground" className="mx-auto max-w-[1100px] px-6 py-24">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1fr_1.2fr] [&>*]:min-w-0">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: BLUE }}><Icon name="chat" size={14} />Playground</span>
          <Reveal><h2 className="m-0 mt-2 text-[clamp(30px,4vw,44px)] font-medium leading-[1.08] tracking-[-0.035em] text-white">The first token lands before you lift your hand</h2></Reveal>
          <p className="m-0 mt-4 max-w-[380px] text-[15px] leading-[1.55]" style={{ color: SOFT }}>Try any model from the catalog in the browser. Same endpoint, same latency as production.</p>
          <div className="mt-8 flex gap-10 text-white">
            <div><p className="m-0 text-[11px] text-white/50">First token</p><p className="m-0 text-[24px] font-medium tabular-nums">83 ms</p></div>
            <div><p className="m-0 text-[11px] text-white/50">Throughput</p><p className="m-0 text-[24px] font-medium tabular-nums">2,400 tok/s</p></div>
          </div>
        </div>
        <Reveal delay={0.1}>
          <MacKeyboard theme="dark" accent={BLUE} autoplay autoplayText="summarize this ticket in two lines" placeholder="Ask the model anything" listen />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- network ---------------- */

function Network() {
  const [rps, setRps] = useState(49531);
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref, { amount: 0.3 });
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setRps((r) => r + Math.round((Math.random() - 0.35) * 900)), 700);
    return () => clearInterval(id);
  }, [on]);
  return (
    <section ref={ref} id="network" className="relative mx-auto max-w-[1100px] overflow-hidden px-6 py-28">
      <div className="relative">
        <div className="relative z-10 mb-8 max-w-[360px] md:absolute md:left-0 md:top-[8%] md:mb-0">
          <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: BLUE }}><Icon name="globe" size={14} />Global network</span>
          <h2 className="m-0 mt-2 text-[clamp(30px,4vw,44px)] font-medium leading-[1.08] tracking-[-0.035em] text-white">Every request lands close to home</h2>
          <div className="mt-5"><Btn>See all regions <Icon name="arrow" size={14} /></Btn></div>
        </div>
        <DotWorld cell={9} dot="rgba(255,255,255,.14)" lit={BLUE} pins={[{ lat: 38.9, lon: -77, label: "Virginia · 23ms" }, { lat: 50.1, lon: 8.7 }, { lat: 35.7, lon: 139.7 }, { lat: 19.1, lon: 72.9 }, { lat: -23.5, lon: -46.6 }, { lat: 1.35, lon: 103.8 }, { lat: 37.4, lon: -122 }]} />
        <div className="relative z-10 mt-6 flex gap-8 text-white md:absolute md:bottom-[4%] md:right-[4%] md:mt-0">
          <div><p className="m-0 text-[11px] text-white/50">Requests / sec</p><p className="m-0 text-[24px] font-medium tabular-nums">{rps.toLocaleString()}</p></div>
          <div><p className="m-0 text-[11px] text-white/50">Regions</p><p className="m-0 text-[24px] font-medium">7</p></div>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-8 border-t pt-10 sm:grid-cols-2 md:grid-cols-4" style={{ borderColor: LINE }}>
        {[["globe", "One endpoint, seven regions", "Deploy once and Strata serves your model from every region on the map."], ["route", "Nearest-region routing", "Each request goes to the closest healthy region. No DNS to manage."], ["refresh", "Automatic failover", "If a region slows down, traffic moves to the next nearest in seconds."], ["pulse", "Health checks every 10s", "Every GPU is tested continuously and drained before it can serve errors."]].map(([ic, t, d], i) => (
          <Reveal key={t} delay={i * 0.05}><div><span style={{ color: BLUE }}><Icon name={ic} /></span><h3 className="m-0 mt-3 text-[14px] font-medium text-white">{t}</h3><p className="m-0 mt-1.5 text-[13px] leading-[1.55]" style={{ color: SOFT }}>{d}</p></div></Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- code ---------------- */

const CODE = [
  ["import", " os"],
  ["from", " openai ", "import", " OpenAI"],
  [""],
  ["client", " = OpenAI("],
  ["    base_url=", "\"https://api.strata.dev/v1\"", ","],
  ["    api_key=os.environ[", "\"STRATA_API_KEY\"", "],"],
  [")"],
  [""],
  ["stream", " = client.chat.completions.create("],
  ["    model=", "\"llama-3.1-70b-instruct\"", ","],
  ["    messages=[{", "\"role\"", ": ", "\"user\"", ", ", "\"content\"", ": ", "\"Where is my order?\"", "}],"],
  ["    stream=", "True", ","],
  [")"],
];
const TABS = [["Chat completions", ""], ["Function calling", ""], ["Batch", "Beta"], ["Fine-tuning", ""], ["Training", "New"]];

function CodeBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.4 });
  const [tab, setTab] = useState(0);
  const [line, setLine] = useState(4);
  const [n, setN] = useState(0);
  const reply = "Your order #4821 left our Berlin warehouse this morning. It should reach you on Thursday, and you can track it from the link in your confirmation email.";
  useEffect(() => {
    if (!on) return;
    const id0 = setTimeout(() => setN(0), 0);
    let k = 0;
    const id = setInterval(() => { k += 2; setN(k); if (k > reply.length + 60) k = 0; }, 40);
    const id2 = setInterval(() => setLine((l) => (l === 4 ? 9 : l === 9 ? 11 : 4)), 1800);
    return () => { clearTimeout(id0); clearInterval(id); clearInterval(id2); };
  }, [on, tab]);
  const color = (tok: string, idx: number) => (tok.startsWith("\"") ? "#a5d6ff" : ["import", "from"].includes(tok) ? "#ff7b72" : idx === 0 && /^[a-z]+$/.test(tok) ? "#d2a8ff" : tok === "True" ? "#79c0ff" : "#e6edf3");
  return (
    <section className="mx-auto max-w-[1000px] px-6 py-28">
      <Reveal><h2 className="m-0 text-[clamp(30px,4vw,44px)] font-medium leading-[1.08] tracking-[-0.035em] text-white">Change one URL.<br />Keep the code you have.</h2></Reveal>
      <p className="m-0 mt-4 max-w-[440px] text-[14px] leading-[1.55]" style={{ color: SOFT }}>Strata speaks the OpenAI API, so the SDKs and tools you use today work without changes.</p>
      <div className="mt-6 flex gap-2"><Btn light>Read the docs <Icon name="arrow" size={14} /></Btn><Btn>Get an API key</Btn></div>
      <div className="mt-12 grid grid-cols-2 gap-4 border-t pt-0 sm:grid-cols-5" style={{ borderColor: LINE }} role="tablist">
        {TABS.map(([t, badge], k) => (
          <button key={t} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="relative pt-4 text-left outline-none">
            {tab === k && <motion.span layoutId="strata-code-tab" className="absolute inset-x-0 top-[-1px] h-[2px] bg-white" />}
            <span className={`text-[13px] font-medium ${tab === k ? "text-white" : "text-white/50"}`}>{t}</span>{badge && <span className="ml-1.5 rounded-full bg-[#4c8dff]/20 px-1.5 py-0.5 text-[10px] text-[#8fb6ff]">{badge}</span>}
          </button>
        ))}
      </div>
      <div ref={ref} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1.25fr_1fr]">
        <div className="overflow-hidden rounded-[14px] bg-[#0f0f12] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
          <div className="flex items-center justify-between border-b px-4 py-2.5 text-[11.5px]" style={{ borderColor: LINE }}><span className="text-white/60">main.py</span><span className="flex items-center gap-1 rounded-full bg-white/[.06] px-2 py-0.5 text-white/80"><Icon name="bolt" size={11} />Run</span></div>
          <pre className="m-0 overflow-x-auto p-4 text-[12px] leading-[1.75]" style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}>
            {CODE.map((toks, i) => (
              <motion.div key={i} className="-mx-4 flex px-4" animate={{ backgroundColor: i === line ? "rgba(76,141,255,.12)" : "rgba(76,141,255,0)" }}>
                <span className="w-7 flex-none select-none text-right text-white/25">{i + 1}</span><span className="pl-4">{toks.map((t, k) => <span key={k} style={{ color: color(t, k) }}>{t}</span>)}</span>
              </motion.div>
            ))}
          </pre>
        </div>
        <div className="flex flex-col overflow-hidden rounded-[14px] bg-[#0f0f12] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
          <div className="flex items-center justify-between border-b px-4 py-2.5 text-[11.5px]" style={{ borderColor: LINE }}><span className="text-white/60">Response</span><span className="flex items-center gap-1.5 text-[#34d399]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399]" />Streaming</span></div>
          <div className="flex-1 p-4">
            <span className="inline-block rounded-full bg-white/[.06] px-3 py-1 text-[12px] text-white/80">Where is my order?</span>
            <p className="m-0 mt-4 text-[13.5px] leading-[1.6] text-white/85">{reply.slice(0, Math.min(n, reply.length))}{n < reply.length && <span className="ml-0.5 inline-block h-3.5 w-[6px] bg-white/70 align-middle" />}</p>
          </div>
          <div className="grid grid-cols-3 border-t text-[11px]" style={{ borderColor: LINE }}>
            {[["First token", "84 ms"], ["Throughput", "2,410 tok/s"], ["Cost", "$0.0004"]].map(([a, b]) => <div key={a} className="border-r p-3 last:border-r-0" style={{ borderColor: LINE }}><p className="m-0 text-white/45">{a}</p><p className="m-0 mt-0.5 text-[14px] text-white">{b}</p></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- models ---------------- */

const MODELS = [
  { n: "llama-3.1-70b-instruct", by: "Meta", c: "#4c8dff", ctx: "128k", tags: ["Chat", "Tools"] },
  { n: "mistral-large-2", by: "Mistral", c: "#ff7a1a", ctx: "128k", tags: ["Chat", "Code"] },
  { n: "qwen2.5-72b-instruct", by: "Qwen", c: "#bf5af2", ctx: "128k", tags: ["Multilingual"] },
  { n: "gemma-2-27b-it", by: "Google", c: "#30d158", ctx: "8k", tags: ["Small", "Fast"] },
  { n: "deepseek-coder-v2", by: "DeepSeek", c: "#64d2ff", ctx: "128k", tags: ["Code"] },
];

const MODEL_GLYPH: Record<string, ReactNode> = {
  Meta: <path d="M2 12.5c0-4 2-7 3.6-7 2.6 0 4.4 7 6.8 7 1.6 0 3.6-3 3.6-7" />,
  Mistral: <><rect x="2.5" y="3" width="4" height="4" fill="currentColor" stroke="none" /><rect x="11.5" y="3" width="4" height="4" fill="currentColor" stroke="none" /><rect x="2.5" y="11" width="13" height="4" fill="currentColor" stroke="none" /></>,
  Qwen: <><path d="M9 2.5l5.8 3.3v6.4L9 15.5l-5.8-3.3V5.8z" /><path d="M9 9l5.8 3.2" /></>,
  Google: <path d="M9 2.2c.7 4 2.8 6.1 6.8 6.8-4 .7-6.1 2.8-6.8 6.8-.7-4-2.8-6.1-6.8-6.8C6.2 8.3 8.3 6.2 9 2.2z" />,
  DeepSeek: <><path d="M2 9c2.3-3.5 4.7-3.5 7 0s4.7 3.5 7 0" /><path d="M2 13.5h9" opacity=".6" /></>,
};

function Models() {
  const [m, setM] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.4 });
  const touched = useRef(false);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => { if (!touched.current) setM((x) => (x + 1) % MODELS.length); }, 3000);
    return () => clearInterval(id);
  }, [on]);
  const cur = MODELS[m];
  return (
    <section id="models" className="mx-auto grid max-w-[1000px] grid-cols-1 items-start gap-10 px-6 py-28 md:grid-cols-[1fr_1.3fr]">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: BLUE }}><Icon name="layers" size={14} />Model catalog</span>
        <Reveal><h2 className="m-0 mt-2 text-[clamp(30px,4vw,44px)] font-medium leading-[1.08] tracking-[-0.035em] text-white">Every open model, ready to serve</h2></Reveal>
        <p className="m-0 mt-4 text-[14px] leading-[1.55]" style={{ color: SOFT }}>Pick from over a hundred tuned builds, or bring your own weights. Each one runs on the same API.</p>
        <div className="mt-6 flex gap-2"><Btn light>Browse models <Icon name="arrow" size={14} /></Btn><Btn>Upload weights</Btn></div>
        <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-3 border-t p-0 pt-6 text-[12.5px]" style={{ borderColor: LINE, color: SOFT }}>
          {["Cold starts under 2s", "Private weights", "FP8, INT8 and AWQ", "Up to 128k context", "Pinned versions", "Your own fine-tunes"].map((x) => <li key={x} className="flex items-center gap-2"><span className="text-white/70"><Icon name="check" size={13} /></span>{x}</li>)}
        </ul>
      </div>
      <div ref={ref} className="grid grid-cols-[52px_1fr] overflow-hidden rounded-[16px] bg-[#0f0f12] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]" onPointerDown={() => (touched.current = true)}>
        <div className="flex flex-col items-center gap-2 border-r py-3" style={{ borderColor: LINE }}>
          {MODELS.map((x, k) => (
            <button key={x.n} type="button" onClick={() => setM(k)} aria-label={x.n} className="relative flex h-9 w-9 items-center justify-center rounded-[9px] text-[12px] font-bold outline-none focus-visible:ring-2" style={{ color: x.c }}>
              {m === k && <motion.span layoutId="strata-model" className="absolute inset-0 rounded-[9px] bg-white/10" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
              <svg className="relative" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{MODEL_GLYPH[x.by]}</svg>
            </button>
          ))}
        </div>
        <div className="min-w-0 p-5">
          <AnimatePresence mode="wait">
            <motion.div key={cur.n} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              <p className="m-0 font-mono text-[15px] text-white">{cur.n}</p>
              <p className="m-0 mt-1 text-[12px] text-white/50">by {cur.by} · {cur.ctx} context</p>
              <div className="mt-2 flex gap-1.5">{cur.tags.map((t) => <span key={t} className="rounded-full bg-white/[.06] px-2 py-0.5 text-[10.5px] text-white/70">{t}</span>)}</div>
              <div className="mt-5 rounded-[10px] bg-white/[.03] p-3 text-[12px]">
                <p className="m-0 flex items-center gap-2 text-white/80"><Avatar name="Jordan Reyes" size={20} hue={215} />Which plan fits a team of 12?</p>
                <p className="m-0 mt-3 leading-[1.55] text-white/60"><span style={{ color: cur.c }}>●</span> For 12 people, Team at $18 per seat covers SSO and shared workspaces. Want me to compare it with Business?</p>
              </div>
              <table className="mt-5 w-full text-left text-[11.5px]">
                <thead><tr className="text-white/40"><th className="pb-2 font-normal">Region</th><th className="pb-2 font-normal">Replicas</th><th className="pb-2 font-normal">p50</th><th className="pb-2 font-normal">Status</th></tr></thead>
                <tbody className="text-white/75">{[["us-east", 3, 82], ["eu-central", 2, 94], ["ap-northeast", 2, 77]].map(([r, n2, l], k) => <tr key={r as string} className="border-t" style={{ borderColor: LINE }}><td className="py-2">{r}</td><td>{n2}</td><td className="tabular-nums">{(l as number) + m * 3}ms</td><td><span className="text-[#34d399]">Healthy</span>{k === 0 && m % 2 ? " · scaling" : ""}</td></tr>)}</tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ---------------- pricing ---------------- */

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const tiers = [
    { n: "Hobby", d: "For side projects and trying things out", p: "Free", sub: "No card required", cta: "Start for free", feats: ["$5 in free credits each month", "Serverless endpoints", "60 requests per minute", "Community support"] },
    { n: "Pro", d: "For products with real users", p: annual ? "$39" : "$49", sub: "per month, plus usage", cta: "Start a 14-day trial", badge: "Saves $120 a year", feats: ["Everything in Hobby", "Every catalog model", "600 requests per minute", "LoRA fine-tuning", "All 7 regions"] },
    { n: "Dedicated", d: "For steady traffic that needs reserved GPUs", p: annual ? "$1.99" : "$2.49", sub: "per H100-hour, billed monthly", cta: "Reserve GPUs", badge: "Saves $0.50 an hour", hot: true, feats: ["Everything in Pro", "Reserved H100 and H200", "No rate limits", "Autoscaling floors", "Private model weights", "Priority support"] },
    { n: "Enterprise", d: "For regulated teams at scale", p: "Custom", sub: "Volume pricing", cta: "Talk to sales", feats: ["Everything in Dedicated", "SSO and audit logs", "99.99% uptime SLA", "Dedicated support engineer", "Invoicing and custom terms"] },
  ];
  const rows: [string, string[]][] = [["Usage", []], ["Monthly credits", ["$5", "$25", "$100", "Custom"]], ["Requests per minute", ["60", "600", "No limit", "No limit"]], ["Concurrent requests", ["5", "50", "500", "Custom"]], ["Models", []], ["Catalog models", ["Top 10", "All", "All", "All"]], ["LoRA fine-tuning", ["-", "✓", "✓", "✓"]], ["Upload your own weights", ["-", "-", "✓", "✓"]], ["Infrastructure", []], ["Regions", ["3", "7", "7", "7 + private"]], ["Reserved GPUs", ["-", "-", "✓", "✓"]], ["Uptime SLA", ["-", "99.9%", "99.95%", "99.99%"]], ["Support", ["Community", "Email", "Priority", "Named engineer"]]];
  return (
    <section id="pricing" className="mx-auto max-w-[1000px] px-6 py-28">
      <div className="text-center"><Reveal><h2 className="m-0 text-[clamp(32px,4.4vw,48px)] font-medium tracking-[-0.035em] text-white">Pricing</h2></Reveal><p className="mx-auto mb-0 mt-3 max-w-[380px] text-[14px] leading-[1.55]" style={{ color: SOFT }}>Start free, pay for the tokens you serve, and reserve GPUs when your traffic is steady.</p>
        <div className="mt-6 inline-flex rounded-full bg-white/[.06] p-1 text-[12.5px]" role="radiogroup" aria-label="Billing period">
          {[["Monthly", false], ["Annual", true]].map(([l, v]) => (
            <button key={l as string} type="button" role="radio" aria-checked={annual === v} onClick={() => setAnnual(v as boolean)} className="relative rounded-full px-4 py-1.5 outline-none">
              {annual === v && <motion.span layoutId="strata-bill" className="absolute inset-0 rounded-full bg-white/[.14]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative text-white">{l as string}{v && <span className="ml-1.5 rounded-full bg-[#4c8dff]/25 px-1.5 py-0.5 text-[10px] text-[#9cc0ff]">Save 20%</span>}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[16px] bg-white/[.08] md:grid-cols-4">
        {tiers.map((t, i) => (
          <Reveal key={t.n} delay={i * 0.05} className="h-full">
            <div className={`flex h-full flex-col ${t.hot ? "bg-[#17171b]" : "bg-[#0f0f12]"}`}>
              <div className="p-5">
                <div className="flex items-center justify-between"><span className="text-[13px] font-medium text-white">{t.n}</span>{t.badge && annual && <span className="rounded-full bg-[#4c8dff]/20 px-1.5 py-0.5 text-[10px] text-[#9cc0ff]">{t.badge}</span>}</div>
                <p className="m-0 mt-1 min-h-[34px] text-[12px] leading-[1.4] text-white/50">{t.d}</p>
                <AnimatePresence mode="popLayout" initial={false}><motion.p key={t.p} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} className="m-0 mt-4 text-[34px] font-medium tracking-[-0.03em] text-white">{t.p}</motion.p></AnimatePresence>
                <p className="m-0 text-[11.5px] text-white/45">{t.sub}</p>
              </div>
              <ul className="m-0 flex-1 list-none space-y-2 border-t p-5 text-[12.5px]" style={{ borderColor: LINE, color: SOFT }}>{t.feats.map((f) => <li key={f} className="flex items-center gap-2"><span className="text-white/60"><Icon name="check" size={13} /></span>{f}</li>)}</ul>
              <div className="p-5 pt-0"><button type="button" className={`h-9 w-full rounded-full text-[12.5px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#4c8dff] ${t.hot ? "bg-white text-[#09090b]" : "bg-white/[.07] text-white hover:bg-white/[.12]"}`}>{t.cta}</button></div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-[12.5px]">
          <thead><tr className="text-white/50"><th className="py-3 font-normal">Features</th>{tiers.map((t) => <th key={t.n} className={`py-3 font-normal ${t.hot ? "bg-white/[.04] px-3" : "px-3"}`}>{t.n}</th>)}</tr></thead>
          <tbody>
            {rows.map(([r, vals]) => vals.length ? (
              <tr key={r} className="border-t" style={{ borderColor: LINE }}><td className="py-3 text-white/80">{r}</td>{vals.map((v, k) => <td key={k} className={`px-3 py-3 ${k === 2 ? "bg-white/[.04]" : ""} ${v === "✓" ? "text-white" : "text-white/55"}`}>{v}</td>)}</tr>
            ) : (
              <tr key={r}><td colSpan={5} className="pb-1 pt-7 text-[11.5px] font-medium" style={{ color: BLUE }}>{r}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------------- cta + footer ---------------- */

function Closing() {
  return (
    <section className="mx-auto max-w-[1000px] px-6 pb-16 pt-10">
      <Reveal>
        <motion.div whileHover={{ scale: 1.005 }} className="relative h-[360px] overflow-hidden rounded-[18px] shadow-[0_40px_80px_-40px_rgba(0,0,0,.8)]">
          <Mountains theme="day" seed={5} className="inset-0" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,.45))" }} />
          <div className="absolute left-7 top-6"><Logo /></div>
          <div className="absolute inset-x-7 bottom-7 flex flex-wrap items-end justify-between gap-5">
            <h2 className="m-0 text-[clamp(30px,4.2vw,48px)] font-medium leading-[1.05] tracking-[-0.035em] text-white">Ready to serve<br />your first model?</h2>
            <span className="flex gap-2"><Btn light>Deploy a model <Icon name="arrow" size={14} /></Btn><Btn>Read the docs</Btn></span>
          </div>
        </motion.div>
      </Reveal>
      <footer className="mt-16 grid grid-cols-2 gap-10 border-b pb-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]" style={{ borderColor: LINE }}>
        <div className="col-span-2 md:col-span-1"><Logo /><p className="m-0 mt-3 max-w-[240px] text-[12.5px]" style={{ color: SOFT }}>Fast inference for open models, served close to every user.</p></div>
        {[["Product", ["Models", "Workflows", "Pricing", "Training"]], ["Developers", ["Docs", "API reference", "Changelog", "Status"]], ["Company", ["About", "Careers", "Security", "Contact"]]].map(([t, ls]) => (
          <div key={t as string}><p className="m-0 text-[12px] text-white/45">{t as string}</p><ul className="m-0 mt-3 list-none space-y-2 p-0">{(ls as string[]).map((l) => <li key={l}><a href="#top" onClick={(e) => e.preventDefault()} className="text-[13px] text-white/80 no-underline hover:text-white">{l}{l === "Training" && <span className="ml-1.5 rounded-full bg-[#4c8dff]/25 px-1.5 py-0.5 text-[10px] text-[#9cc0ff]">New</span>}</a></li>)}</ul></div>
        ))}
      </footer>
      <div className="flex flex-wrap justify-between gap-3 pt-6 text-[12px] text-white/40"><span>All systems operational</span><span>© 2026 Strata Inference</span></div>
    </section>
  );
}

export function StrataPage() {
  return (
    <div className="min-h-screen overflow-x-clip font-sans text-white" style={{ background: BG }}>
      <Hero />
      <DeployStory />
      <Canvas />
      <Playground />
      <Network />
      <CodeBlock />
      <Models />
      <Pricing />
      <Closing />
    </div>
  );
}
