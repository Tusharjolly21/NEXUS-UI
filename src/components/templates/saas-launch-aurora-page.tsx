"use client";
/**
 * Aurora: landing page template for an edge deploy platform.
 * "Push once, live in 18 regions in 38 seconds." The hero is a polar night:
 * aurora curtains over a dot-matrix world where each push fans out region by
 * region in aurora light. Unbounded and Onest. Built from Motion Kit components: Folder Peek (as a repo
 * peek), Matrix Loaders, Toast Stack (deploy alerts), Bolting Sliders (canary
 * controls), Hold to Confirm (rollback), Standing Calendar (deploy history),
 * Copy Buttons and Radio Cards.
 */
import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { MatrixLoader } from "@/components/templates/kit/components/MatrixLoaders";
import { CopyCommand } from "@/components/templates/kit/components/CopyButton";
import RadioCards from "@/components/templates/kit/components/RadioCards";
import RepoPeek from "@/components/templates/aurora/RepoPeek";
import CanarySliders from "@/components/templates/aurora/CanarySliders";
import HoldToRollback from "@/components/templates/aurora/HoldToRollback";
import DeployCalendar from "@/components/templates/aurora/DeployCalendar";
import DeployToasts from "@/components/templates/aurora/DeployToasts";
import { DOTS, MAP_H, MAP_W, REGIONS, project } from "@/components/templates/aurora/world";
import Curtains from "@/components/templates/aurora/Curtains";
import { fontFaces } from "@/components/templates/kit/fonts";
import { CtaBand, Faq, Fit, Footer, Magnetic, Marquee, Nav, Reveal, SectionHead, Stagger, Words, card, scrollToId } from "@/components/templates/kit/parts";

const A = "#059669"; // emerald for fills and graphics
const AT = "#047857"; // emerald for text and buttons (5.5:1 on white)
const FONT = "'Onest Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
const POLAR = { bg: "#060b14", dot: "#1b2638", text: "#e9eef7", muted: "#8d9ab0", green: "#5af0b4", violet: "#8a7bff" };
const FONT_CSS =
  fontFaces("aurora", [
    { family: "Unbounded Variable", file: "unbounded" },
    { family: "Onest Variable", file: "onest" },
  ]) + `.au h1,.au h2{font-family:'Unbounded Variable',sans-serif;font-weight:560;letter-spacing:-0.035em}`;
const spring = { type: "spring", stiffness: 260, damping: 26 } as const;

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M4 24 C 9 10, 23 10, 28 24" fill="none" stroke={A} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M9 24 C 12 16, 20 16, 23 24" fill="none" stroke="#6ee7b7" strokeWidth="3.5" strokeLinecap="round" />
        <motion.circle cx="16" cy="24" r="3" fill={AT} animate={{ y: [0, -3, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
      Aurora
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: push from any region and watch the rollout ripple outward.    */
/* ------------------------------------------------------------------ */

const T_BUILD = 14.2;
const T_UPLOAD = 17.4;
const T_TOTAL = 37.6;
const REPLAY = 5; // the rollout replays five times faster than real time
const PTS = Object.fromEntries(REGIONS.map((r) => [r.id, project(r.lon, r.lat)]));
const ORIGINS = ["fra", "iad", "sin", "syd"];

function arc(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.min(120, Math.hypot(b.x - a.x, b.y - a.y) * 0.28);
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

function useRollout() {
  const [origin, setOrigin] = useState("fra");
  const [run, setRun] = useState(0);
  const [stage, setStage] = useState(0); // 0 idle, 1 detected, 2 building, 3 uploading, 4 rolling out, 5 done
  const [lit, setLit] = useState(0);
  const elapsed = useMotionValue(0);
  const ring = useMotionValue(0);
  const ringOpacity = useMotionValue(0);
  const clockRef = useRef<HTMLSpanElement>(null);
  const ctl = useRef<{ stop: () => void } | null>(null);

  const order = useMemo(() => {
    const o = PTS[origin];
    const d = REGIONS.map((r) => ({ id: r.id, d: Math.hypot(PTS[r.id].x - o.x, PTS[r.id].y - o.y) }));
    const max = Math.max(...d.map((x) => x.d)) || 1;
    return d.map((x) => ({ id: x.id, at: T_UPLOAD + (T_TOTAL - T_UPLOAD) * (x.d / max), d: x.d })).sort((p, q) => p.at - q.at);
  }, [origin]);
  const orderRef = useRef(order);
  useEffect(() => { orderRef.current = order; }, [order]);

  useMotionValueEvent(elapsed, "change", (e) => {
    if (clockRef.current) clockRef.current.textContent = `${e.toFixed(1)}s`;
    const s = e <= 0 ? 0 : e < 0.8 ? 1 : e < T_BUILD ? 2 : e < T_UPLOAD ? 3 : e < T_TOTAL ? 4 : 5;
    setStage((p) => (p === s ? p : s));
    const n = orderRef.current.filter((r) => e >= r.at).length;
    setLit((p) => (p === n ? p : n));
    const max = orderRef.current[orderRef.current.length - 1]?.d ?? 1;
    const k = Math.max(0, Math.min(1, (e - T_UPLOAD) / (T_TOTAL - T_UPLOAD)));
    ring.set(k * max);
    ringOpacity.set(e < T_UPLOAD || e >= T_TOTAL ? 0 : 0.9 - k * 0.7);
  });

  const push = (from: string) => {
    ctl.current?.stop();
    setOrigin(from);
    setRun((r) => r + 1);
    elapsed.jump(0);
    setStage(0);
    setLit(0);
    ctl.current = animate(elapsed, T_TOTAL, { duration: T_TOTAL / REPLAY, ease: "linear", delay: 0.15 });
  };
  useEffect(() => () => ctl.current?.stop(), []);

  const litIds = new Set(order.slice(0, lit).map((r) => r.id));
  return { origin, run, stage, lit, litIds, ring, ringOpacity, clockRef, push, order };
}

/** The static land dots, memoised so rollout state changes never re-render them. */
const DotLayer = memo(function DotLayer() {
  return (
    <g fill={POLAR.dot}>
      {DOTS.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="2.3" />)}
    </g>
  );
});

function LogLine({ done, running, children }: { done: boolean; running: boolean; children: ReactNode }) {
  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={spring} className="flex items-center gap-2.5">
      <span className="flex h-4 w-4 flex-none items-center justify-center">
        {done ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        ) : running ? (
          <MatrixLoader pattern={0} size={14} color="#6ee7b7" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
        )}
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </motion.div>
  );
}

function Hero() {
  const { origin, run, stage, lit, litIds, ring, ringOpacity, clockRef, push } = useRollout();
  const touched = useRef(false);
  const o = PTS[origin];
  const city = REGIONS.find((r) => r.id === origin)!.city;
  const running = stage > 0 && stage < 5;

  useEffect(() => {
    let k = 0;
    const go = () => { if (!touched.current) push(ORIGINS[k++ % ORIGINS.length]); };
    const a = window.setTimeout(go, 1000);
    const b = window.setInterval(go, 13000);
    return () => { clearTimeout(a); clearInterval(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userPush = (from: string) => { touched.current = true; push(from); };

  return (
    <section id="top" className="relative -mt-[76px] overflow-hidden pb-10 pt-[76px]" style={{ background: POLAR.bg, color: POLAR.text }}>
      <Curtains className="absolute inset-x-0 top-0 h-[460px] w-full" />
      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-end gap-8 px-5 pt-14 lg:grid-cols-[1.35fr_1fr] lg:gap-14 lg:pt-20">
        <div className="flex flex-col items-start gap-6">
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]" style={{ background: "rgba(255,255,255,.05)" }}>
            <motion.span className="h-2 w-2 rounded-full" style={{ background: POLAR.green }} animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
            All 18 regions operational
          </motion.span>
          <h1 className="m-0 text-[clamp(36px,5.6vw,72px)] leading-[1.02] [text-wrap:balance]">
            <Words text="Push once. Live in 18 regions in 38 seconds." />
          </h1>
        </div>
        <div className="flex flex-col items-start gap-6 lg:pb-3">
          <Reveal delay={0.3} y={14}>
            <p className="m-0 max-w-[460px] text-[clamp(16px,1.8vw,18px)] leading-[1.55]" style={{ color: POLAR.muted }}>
              Aurora builds your app once, ships it to every edge region in parallel, and rolls back on its own if errors climb. Click any region on the map to push from there.
            </p>
          </Reveal>
          <Reveal delay={0.45} y={14} className="flex flex-wrap gap-3">
            <Magnetic className="font-semibold" style={{ background: POLAR.green, color: "#032016" }} onClick={() => scrollToId("pricing")}>Deploy free</Magnetic>
            <Magnetic className="text-[#e9eef7] shadow-[inset_0_0_0_1px_rgba(233,238,247,.2)]" style={{ background: "transparent" }} onClick={() => scrollToId("pipeline")}>How a push works</Magnetic>
          </Reveal>
        </div>
      </div>

      <div className="relative mx-auto mt-10 max-w-[1260px] px-3 sm:px-5 lg:pb-[200px]">
        <motion.div initial={{ scale: 0.985 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.2 }} className="relative">
          <div className="relative w-full" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
            <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="au-arc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={POLAR.green} /><stop offset="1" stopColor={POLAR.violet} /></linearGradient>
                <filter id="au-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <DotLayer />
              <motion.circle cx={o.x} cy={o.y} r={ring} fill="none" stroke={POLAR.green} strokeWidth="1.5" style={{ opacity: ringOpacity }} filter="url(#au-glow)" />
              <g fill="none" stroke="url(#au-arc)" strokeWidth="1.6" strokeLinecap="round" filter="url(#au-glow)">
                {REGIONS.filter((r) => r.id !== origin && litIds.has(r.id)).map((r) => (
                  <motion.path key={`${run}-${r.id}`} d={arc(o, PTS[r.id])} initial={{ pathLength: 0, opacity: 0.9 }} animate={{ pathLength: 1, opacity: 0.45 }} transition={{ type: "spring", stiffness: 60, damping: 18 }} />
                ))}
              </g>
              {REGIONS.map((r) => {
                const p = PTS[r.id];
                const on = litIds.has(r.id);
                return (
                  <g key={r.id}>
                    {on && <motion.circle key={`p${run}`} cx={p.x} cy={p.y} fill={POLAR.green} initial={{ r: 5, opacity: 0.5 }} animate={{ r: 20, opacity: 0 }} transition={{ duration: 1.1, ease: "easeOut" }} />}
                    <motion.circle cx={p.x} cy={p.y} initial={false} animate={{ r: on ? 6 : 4.5, fill: on ? POLAR.green : POLAR.bg }} transition={{ type: "spring", stiffness: 500, damping: 20 }} stroke={on ? "#d9fff0" : "#3a4a63"} strokeWidth="2" filter={on ? "url(#au-glow)" : undefined} />
                  </g>
                );
              })}
            </svg>
            {REGIONS.map((r) => {
              const p = PTS[r.id];
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => userPush(r.id)}
                  aria-label={`Push from ${r.city}`}
                  title={`Push from ${r.city}`}
                  className="absolute -ml-3 -mt-3 h-6 w-6 rounded-full outline-none hover:bg-[#5af0b4]/15 focus-visible:ring-2 focus-visible:ring-[#5af0b4] sm:-ml-4 sm:-mt-4 sm:h-8 sm:w-8"
                  style={{ left: `${(p.x / MAP_W) * 100}%`, top: `${(p.y / MAP_H) * 100}%` }}
                />
              );
            })}
            <motion.span key={`label-${origin}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="pointer-events-none absolute hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-[#060b14] sm:block" style={{ left: `${(o.x / MAP_W) * 100}%`, top: `calc(${(o.y / MAP_H) * 100}% - 40px)` }}>
              {city}
            </motion.span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-[20px] px-5 py-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)] backdrop-blur-md lg:absolute lg:right-5 lg:top-0 lg:mt-0 lg:w-[300px]" style={{ background: "rgba(255,255,255,.04)" }} aria-live="polite">
            <span className="flex flex-col">
              <span className="text-[12px] font-medium" style={{ color: POLAR.muted }}>Regions live</span>
              <span className="text-[26px] font-semibold tabular-nums tracking-[-0.04em]">{lit}<span style={{ color: POLAR.muted }}> / 18</span></span>
            </span>
            <span className="flex flex-col items-end">
              <span className="text-[12px] font-medium" style={{ color: POLAR.muted }}>Since push</span>
              <span ref={clockRef} className="text-[26px] font-semibold tabular-nums tracking-[-0.04em]" style={{ color: stage === 5 ? POLAR.green : POLAR.text }}>0.0s</span>
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-[24px] bg-[#0d1524] text-[#e8e8ed] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_40px_80px_-40px_rgba(0,0,0,.8)] lg:absolute lg:left-5 lg:top-[80%] lg:mt-0 lg:w-[440px]">
            <div className="flex items-center gap-2 border-b border-white/[.08] px-4 py-3">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
              <span className="ml-2 text-[12px] text-[#a1a1a6]">acme-web, main</span>
              <span className="ml-auto text-[12px] tabular-nums text-[#a1a1a6]">replayed {REPLAY} times faster</span>
            </div>
            <div className="flex min-h-[172px] flex-col gap-1.5 px-4 py-3.5 text-[13px] leading-[1.5]" style={{ fontFamily: MONO }}>
              <span className="text-white"><span className="text-[#6ee7b7]">$</span> git push aurora main <span className="text-[#a1a1a6]">--from {origin}</span></span>
              {stage >= 1 && <LogLine done running={false}>Detected Next.js 16, 214 files</LogLine>}
              {stage >= 2 && <LogLine done={stage > 2} running={stage === 2}>{stage > 2 ? `Built in ${T_BUILD}s, 81% cache hits` : "Building…"}</LogLine>}
              {stage >= 3 && <LogLine done={stage > 3} running={stage === 3}>{stage > 3 ? "Uploaded 31.4 MB in 3.2s" : "Uploading to the edge…"}</LogLine>}
              {stage >= 4 && <LogLine done={stage > 4} running={stage === 4}>{stage > 4 ? `Live in 18 regions in ${T_TOTAL}s` : `Rolling out from ${city}…`}</LogLine>}
              {stage === 0 && <span className="text-[#a1a1a6]">Pick a region, then push.</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-white/[.08] px-4 py-3">
              <span className="mr-1 text-[12px] text-[#a1a1a6]">Push from</span>
              {ORIGINS.map((id) => (
                <button key={id} type="button" onClick={() => userPush(id)} aria-pressed={origin === id} className="h-8 rounded-full px-3 text-[12px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#6ee7b7]" style={origin === id ? { background: "#6ee7b7", color: "#022c22" } : { background: "rgba(255,255,255,.08)", color: "#e8e8ed" }}>
                  {REGIONS.find((r) => r.id === id)!.city}
                </button>
              ))}
              <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => userPush(origin)} disabled={running} className="ml-auto h-8 rounded-full bg-white px-3.5 text-[12px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#6ee7b7] disabled:opacity-60">
                {running ? "Rolling out…" : stage === 5 ? "Push again" : "git push"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const BUILD_STEPS = [
  { t: "Install dependencies", s: "cached, 0.8s" },
  { t: "Compile 214 routes", s: "6.1s" },
  { t: "Optimise 1,180 images", s: "4.4s" },
  { t: "Bundle edge functions", s: "2.9s" },
];

function BuildLog() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % (BUILD_STEPS.length + 2)), 1300);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex w-full flex-col gap-1">
      {BUILD_STEPS.map((b, i) => {
        const done = step > i;
        const active = step === i;
        return (
          <div key={b.t} className="flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: active ? "#ecfdf5" : "transparent" }}>
            <span className="flex h-7 w-7 flex-none items-center justify-center">
              {done ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 18 }} className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: A }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </motion.span>
              ) : active ? (
                <MatrixLoader pattern={i % 2 ? 3 : 0} size={24} color={A} />
              ) : (
                <span className="h-2 w-2 rounded-full bg-[#d2d2d7]" />
              )}
            </span>
            <span className="flex flex-1 flex-col">
              <span className="text-[15px] font-medium text-[#1d1d1f]">{b.t}</span>
              <span className="text-[13px] tabular-nums text-[#6e6e73]">{done ? b.s : active ? "Running…" : "Queued"}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Pipeline() {
  const cards = [
    { k: "Detect", t: "It reads the repo.", d: "Next.js, Remix, Astro, SvelteKit, plain Node or a Dockerfile. Aurora picks the build and tells you what it found.", v: <RepoPeek color={AT} autoplay />, fit: true },
    { k: "Build", t: "Once, with a warm cache.", d: "One build per commit, reused for every region. Unchanged steps come straight from cache.", v: <BuildLog />, fit: false },
    { k: "Ship", t: "Everywhere, and it tells you.", d: "Deploys, previews and alerts land in your inbox, chat and the dashboard. Swipe one away when you have read it.", v: <DeployToasts autoplay />, fit: false },
  ];
  return (
    <section id="pipeline" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <SectionHead title="From git push to everywhere." sub="No YAML to start. Connect a repository and every push to main ships, every pull request gets its own preview." accent={AT} />
      <Stagger className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.k} className={`${card} flex h-full flex-col gap-3 p-7`}>
            <span className="text-[14px] font-semibold" style={{ color: AT }}>{c.k}</span>
            <h3 className="m-0 text-[22px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">{c.t}</h3>
            <p className="m-0 text-[15px] leading-[1.5] text-[#6e6e73]">{c.d}</p>
            <div className="mt-4 flex min-h-[330px] w-full flex-1 items-center justify-center">{c.fit ? <Fit>{c.v}</Fit> : c.v}</div>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------ Rollouts ------------------------------ */

function Rollouts() {
  return (
    <section id="rollouts" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead title="Ship to five percent first." sub="New versions take a slice of traffic while Aurora watches error rates and latency. If the numbers slip past your budget, it rolls back before most users notice." accent={AT} />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
          <Reveal y={16}>
            <div className={`${card} flex h-full flex-col gap-6 p-7 sm:p-8`}>
              <div>
                <h3 className="m-0 text-[22px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">Canary controls</h3>
                <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73]">Set the slice, the error budget and how long to watch before going wide.</p>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <Fit>
                  <CanarySliders
                    accent={A}
                    autoplay
                    title="Rollout for a41f9c2"
                    hint="Click a track and the knob jumps there."
                    settings={[
                      { id: "canary", label: "Canary traffic", min: 0, max: 100, unit: "%", value: 5 },
                      { id: "budget", label: "Error budget", min: 0, max: 5, unit: "%", value: 1 },
                      { id: "bake", label: "Watch for", min: 1, max: 30, unit: " min", value: 10 },
                    ]}
                    demoValues={[[25, 50, 5], [0.5, 2, 1], [15, 5, 10]]}
                  />
                </Fit>
              </div>
            </div>
          </Reveal>
          <Reveal y={16} delay={0.08}>
            <div className={`${card} flex h-full flex-col gap-6 p-7 sm:p-8`}>
              <div>
                <h3 className="m-0 text-[22px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">Rollback, by hand or by itself</h3>
                <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73]">The previous version stays warm in every region, so going back is a pointer swap, not a rebuild.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-[#f5f5f7] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d97706]" />
                <span className="flex-1 text-[14px] text-[#1d1d1f]">a41f9c2, error rate <span className="font-semibold tabular-nums">2.1%</span> in Singapore</span>
                <span className="text-[12px] tabular-nums text-[#6e6e73]">budget 1%</span>
              </div>
              <div className="flex flex-1 items-center justify-center py-4"><Fit><HoldToRollback label="Hold to roll back" holdingLabel="Rolling back…" doneLabel="v412 is live again" color={AT} autoplay /></Fit></div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ History ------------------------------ */

function History() {
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1.5fr]">
        <SectionHead title="Deploy often. Sleep fine." sub="The median team on Aurora ships 13 times a week. Every deploy is kept, so you can open, compare or promote any of them." accent={AT} />
        <Reveal y={16}>
          <div className={`${card} overflow-hidden px-4 py-7 sm:px-7`}>
            <Fit><DeployCalendar weeks={30} noun="deploys from one team in 30 weeks" autoplay /></Fit>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Developers ------------------------------ */

const TOML: [string, string][][] = [
  [["# aurora.toml", "#6e6e73"]],
  [["[build]", "#b45309"]],
  [["framework", "#1d1d1f"], [" = ", "#6e6e73"], ['"nextjs"', AT]],
  [["output", "#1d1d1f"], [" = ", "#6e6e73"], ['".next"', AT]],
  [["", ""]],
  [["[rollout]", "#b45309"]],
  [["regions", "#1d1d1f"], [" = ", "#6e6e73"], ['"all"', AT], ["          # 18 today", "#6e6e73"]],
  [["canary", "#1d1d1f"], [" = ", "#6e6e73"], ["5", "#7c3aed"], ["             # percent", "#6e6e73"]],
  [["error_budget", "#1d1d1f"], [" = ", "#6e6e73"], ["1.0", "#7c3aed"]],
  [["auto_rollback", "#1d1d1f"], [" = ", "#6e6e73"], ["true", "#7c3aed"]],
  [["", ""]],
  [["[previews]", "#b45309"]],
  [["on_pull_request", "#1d1d1f"], [" = ", "#6e6e73"], ["true", "#7c3aed"]],
];

function Developers() {
  return (
    <section id="developers" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col gap-8">
          <SectionHead title="One command, one small file." sub="Deploy from your laptop with the CLI, or connect the repo and never think about it. The config is optional and fits on one screen." accent={AT} />
          <Reveal y={12}><CopyCommand command="npx aurora deploy" autoplay /></Reveal>
          <Stagger className="flex flex-col gap-3.5">
            {["Preview URL for every pull request", "Environment variables per branch", "Logs streamed from all 18 regions", "Works with any Git host"].map((t) => (
              <span key={t} className="flex items-center gap-3 text-[16px] text-[#1d1d1f]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d1fae5]" style={{ color: AT }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                {t}
              </span>
            ))}
          </Stagger>
        </div>
        <Reveal y={16}>
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center gap-2 border-b border-black/[.06] px-5 py-3.5">
              <span className="text-[13px] font-semibold text-[#1d1d1f]">aurora.toml</span>
              <span className="ml-auto rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[12px] font-semibold" style={{ color: AT }}>Optional</span>
            </div>
            <pre className="m-0 overflow-x-auto px-5 py-5 text-[13.5px] leading-[1.8]" style={{ fontFamily: MONO }}>
              {TOML.map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ ...spring, delay: i * 0.03 }} className="flex gap-5">
                  <span className="w-5 flex-none select-none text-right text-[#6e6e73]">{i + 1}</span>
                  <code>{line.map(([t, c], j) => <span key={j} style={{ color: c || undefined }}>{t}</span>)}{line.length === 1 && line[0][0] === "" ? " " : null}</code>
                </motion.div>
              ))}
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Pricing ------------------------------ */

function Pricing() {
  const [plan, setPlan] = useState("pro");
  const summary: Record<string, { price: string; note: string }> = {
    hobby: { price: "$0", note: "For side projects. One member, fair-use bandwidth." },
    pro: { price: "$24", note: "Per member per month. 1 TB of bandwidth included, then $0.06 per GB." },
    scale: { price: "Talk to us", note: "Committed-use pricing, private regions and a 99.99% SLA." },
  };
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <SectionHead title="Every plan gets every region." sub="We don't sell regions or rollbacks as add-ons. Plans differ by team size, bandwidth and support." accent={AT} center />
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Reveal y={16}>
          <div className={`${card} flex h-full flex-col gap-6 p-7`}>
            <div>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Choose a plan</h3>
              <p className="m-0 mt-1 text-[15px] text-[#6e6e73]">Change plans any time. Billing is prorated by the day.</p>
            </div>
            <div className="flex justify-center">
              <RadioCards
                accent={AT}
                defaultValue="pro"
                onChange={setPlan}
                options={[
                  { id: "hobby", title: "Hobby", description: "For side projects", meta: "Free", features: ["18 regions", "Previews for every PR", "Community support"] },
                  { id: "pro", title: "Pro", description: "For teams in production", meta: "$24/member", features: ["Canary rollouts and auto-rollback", "1 TB bandwidth included", "Email support, 1-day reply"] },
                  { id: "scale", title: "Scale", description: "For high-traffic products", meta: "Custom", features: ["Private regions", "SSO and audit logs", "99.99% SLA"] },
                ]}
              />
            </div>
          </div>
        </Reveal>
        <Reveal y={16} delay={0.08}>
          <div className="flex h-full flex-col gap-6 rounded-[28px] bg-[#1d1d1f] p-7 text-white sm:p-8">
            <span className="text-[13px] text-[#a1a1a6]">You picked</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={plan} initial={{ opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(6px)" }} transition={spring} className="flex flex-col gap-2">
                <span className="text-[52px] font-semibold leading-none tracking-[-0.05em]">{summary[plan].price}</span>
                <span className="max-w-[360px] text-[15px] leading-[1.5] text-[#d2d2d7]">{summary[plan].note}</span>
              </motion.div>
            </AnimatePresence>
            <ul className="m-0 mt-2 flex list-none flex-col gap-3 p-0 text-[15px] text-[#d2d2d7]">
              {["All 18 regions, no surcharge", "Instant rollback on every plan", "DDoS protection and free TLS", "No per-seat fee for viewers"].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <motion.button type="button" whileTap={{ scale: 0.96 }} className="mt-auto h-12 rounded-full bg-white text-[15px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#6ee7b7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d1d1f]">
              {plan === "scale" ? "Talk to sales" : "Deploy your first app"}
            </motion.button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const QUOTES = [
  { q: "Our deploys went from a nervous twenty minutes to under a minute. The canary caught a bad release in Singapore before our on-call did.", n: "Lena Fischer", c: "Platform lead, Fernway" },
  { q: "We moved forty services in a weekend. The config file is shorter than our old README.", n: "Kwame Asante", c: "CTO, Saltbox" },
  { q: "Rollback is a pointer swap. I held the button, it was back in under a second, and I went back to dinner.", n: "Mia Takahashi", c: "Staff engineer, Kiln" },
  { q: "Previews on every pull request changed how design reviews work here. Nobody asks for screenshots any more.", n: "Diego Ruiz", c: "Engineering manager, Quillmark" },
];

function Quotes() {
  return (
    <section className="bg-[#f5f5f7] py-20" aria-label="What teams say">
      <Marquee speed={26}>
        {QUOTES.map((q) => (
          <figure key={q.n} className={`${card} m-0 mx-2.5 flex w-[340px] flex-none flex-col gap-5 p-7 sm:w-[380px]`}>
            <blockquote className="m-0 text-[18px] leading-[1.45] tracking-[-0.01em] text-[#1d1d1f]">“{q.q}”</blockquote>
            <figcaption className="text-[14px] text-[#6e6e73]"><span className="font-semibold text-[#1d1d1f]">{q.n}</span>, {q.c}</figcaption>
          </figure>
        ))}
      </Marquee>
    </section>
  );
}

export default function SaasLaunchAuroraPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="au min-h-screen overflow-x-clip bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: FONT }}>
        <style>{FONT_CSS}</style>
        <Nav dark brand={<Logo />} accent={AT} cta="Deploy free" onCta={() => scrollToId("pricing")} links={[{ label: "Pipeline", id: "pipeline" }, { label: "Rollouts", id: "rollouts" }, { label: "Developers", id: "developers" }, { label: "Pricing", id: "pricing" }, { label: "FAQ", id: "faq" }]} />
        <main>
          <Hero />
              <Pipeline />
          <Rollouts />
          <History />
          <Developers />
          <Pricing />
          <Quotes />
          <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-20 sm:py-24 lg:grid-cols-[1fr_1.4fr]">
            <SectionHead title="Before you push." accent={AT} />
            <Reveal y={16}>
              <Faq
                accent={AT}
                items={[
                  { q: "Is 38 seconds real?", a: "It is the median from git push to the new version answering in all 18 regions, measured across Pro workspaces over the last 30 days. Big builds take longer; the rollout itself is usually under 20 seconds." },
                  { q: "How does auto-rollback decide?", a: "During the watch window Aurora compares the new version's error rate and p95 latency against the previous one. If either passes the budget you set, traffic goes back to the old version and you get an alert with the failing requests." },
                  { q: "Can I move from another host?", a: "Yes. Aurora reads common framework configs and environment files, and the CLI imports variables in one step. Most teams are running in an afternoon." },
                  { q: "Where does my data live?", a: "Static assets and functions run in all regions. Logs and build artifacts stay in the home region you pick, in the EU or the US." },
                  { q: "Is there a free plan?", a: "Hobby is free for personal projects with every region, previews and rollback. You only pay when a team or real bandwidth gets involved." },
                ]}
              />
            </Reveal>
          </section>
          <div className="mx-auto max-w-[1180px] px-5 pb-20">
            <CtaBand title="Your next push could be live everywhere." sub="Connect a repo and ship to 18 regions in about a minute. Free for personal projects." cta="Deploy free" secondary="Read the docs" accent={AT} glow="rgba(110,231,183,.25)" />
          </div>
        </main>
        <Footer brand={<Logo />} note="The edge deploy platform for teams that ship daily. Build once, roll out everywhere, roll back in a second." columns={[{ title: "Platform", links: ["Pipeline", "Rollouts", "Previews", "Pricing"] }, { title: "Developers", links: ["Docs", "CLI", "Status", "Changelog"] }, { title: "Company", links: ["About", "Careers", "Security", "Contact"] }]} />
      </div>
    </MotionConfig>
  );
}
