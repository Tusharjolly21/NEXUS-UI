"use client";
/**
 * Relay: landing page template for an AI gateway / developer platform.
 * Built from Motion Kit components: Packet Router, Context Meter, Voice Orb,
 * Matrix Loaders, Toast Stack, Dot Globe, Squeeze Progress, Feedback Pill,
 * Progress Button, Radio Cards and Price Odometer.
 */
import { useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring, useTransform } from "framer-motion";
import PacketRouter from "@/components/templates/kit/components/PacketRouter";
import ContextMeter from "@/components/templates/kit/components/ContextMeter";
import VoiceOrb from "@/components/templates/kit/components/VoiceOrb";
import { MatrixLoader } from "@/components/templates/kit/components/MatrixLoaders";
import ToastStack from "@/components/templates/kit/components/ToastStack";
import DotGlobe from "@/components/templates/kit/components/DotGlobe";
import SqueezeProgress from "@/components/templates/kit/components/SqueezeProgress";
import FeedbackPill from "@/components/templates/kit/components/FeedbackPill";
import ProgressButton from "@/components/templates/kit/components/ProgressButton";
import RadioCards from "@/components/templates/kit/components/RadioCards";
import PriceOdometer from "@/components/templates/kit/components/PriceOdometer";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Marquee, Nav, Reveal, SectionHead, Spotlight, Stagger, StickyStory, Words, card, ease, scrollToId } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const A = "#0071e3";

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="relay-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5ac8fa" /><stop offset="1" stopColor="#0071e3" /></linearGradient>
        </defs>
        <circle cx="16" cy="16" r="13" fill="none" stroke="url(#relay-g)" strokeWidth="4" />
        <motion.circle cx="16" cy="3" r="3.4" fill="#0071e3" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} style={{ originX: "16px", originY: "16px" }} />
      </svg>
      Relay
    </span>
  );
}

function InstallPill() {
  const [copied, setCopied] = useState(false);
  const cmd = "npm i @relay/sdk";
  return (
    <button
      type="button"
      onClick={async () => { try { await navigator.clipboard.writeText(cmd); } catch { /* ignore */ } setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="group inline-flex h-12 items-center gap-3 rounded-full bg-white pl-5 pr-2 text-[14px] text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none focus-visible:ring-2"
      aria-label={`Copy ${cmd}`}
    >
      <span className="text-[#86868b]">$</span>
      <code style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }}>{cmd}</code>
      <span className="relative flex h-8 w-16 items-center justify-center overflow-hidden rounded-full bg-[#f5f5f7] text-[12px] font-medium">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={copied ? "c" : "n"} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} style={{ color: copied ? "#248a3d" : "#1d1d1f" }}>
            {copied ? "Copied" : "Copy"}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}

function Hero() {
  const frame = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: frame, offset: ["start end", "center center"] });
  const rx = useSpring(useTransform(scrollYProgress, [0, 1], [26, 0]), { stiffness: 120, damping: 24 });
  const sc = useSpring(useTransform(scrollYProgress, [0, 1], [0.88, 1]), { stiffness: 120, damping: 24 });
  return (
    <section className="relative overflow-hidden pb-10 pt-16 sm:pt-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px]" aria-hidden="true" style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(90,200,250,.22), transparent 70%), radial-gradient(40% 40% at 80% 20%, rgba(0,113,227,.12), transparent 70%)" }} />
      <div className="relative mx-auto flex max-w-[1180px] flex-col items-center gap-7 px-5 text-center">
        <motion.button
          type="button"
          onClick={() => scrollToId("routing")}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.07)]"
        >
          <span className="rounded-full bg-[#0071e3] px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
          Quality routing is live
          <span aria-hidden="true" className="text-[#0071e3]">→</span>
          <motion.span aria-hidden="true" className="absolute inset-y-0 w-16 -skew-x-12 bg-gradient-to-r from-transparent via-white/90 to-transparent" initial={{ x: -120 }} animate={{ x: 420 }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }} />
        </motion.button>
        <h1 className="m-0 max-w-[980px] text-[clamp(46px,8.4vw,104px)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f] [text-wrap:balance]">
          <Words text="One API. Every model. Half the bill." className="justify-center" accentWords={["Half", "the", "bill."]} accent={A} />
        </h1>
        <Reveal delay={0.45} y={16}>
          <p className="m-0 max-w-[640px] text-[clamp(18px,2.2vw,22px)] leading-[1.42] tracking-[-0.015em] text-[#6e6e73]">
            Relay sits between your app and every major model. It routes each request to the cheapest one that can do the job, and falls back the moment a provider wobbles.
          </p>
        </Reveal>
        <Reveal delay={0.6} y={16} className="flex flex-wrap items-center justify-center gap-3">
          <Magnetic className="text-white shadow-[0_10px_30px_-10px_rgba(0,113,227,.7)]" style={{ background: A }} onClick={() => scrollToId("pricing")}>Start free</Magnetic>
          <InstallPill />
        </Reveal>
      </div>
      <div className="relative mx-auto mt-16 max-w-[1180px] px-5" style={{ perspective: 1400 }}>
        <motion.div ref={frame} style={{ rotateX: rx, scale: sc, transformOrigin: "50% 0%" }} className={`${card} overflow-hidden`}>
          <div className="flex items-center gap-2 border-b border-black/[.06] px-5 py-3.5">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />)}
            <span className="ml-3 text-[12px] font-medium text-[#86868b]">console.relay.dev / live traffic</span>
            <span className="ml-auto flex items-center gap-1.5 text-[12px] font-medium text-[#248a3d]"><motion.span className="h-2 w-2 rounded-full bg-[#30d158]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />Live</span>
          </div>
          <div className="px-4 py-8 sm:py-12">
            <Fit><PacketRouter autoplay /></Fit>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const BRANDS = [
  { n: "Northwind", c: "font-serif italic" },
  { n: "LUMEN", c: "tracking-[0.3em] font-semibold" },
  { n: "parcel", c: "font-bold lowercase" },
  { n: "Orbit Labs", c: "font-medium" },
  { n: "HALCYON", c: "font-black tracking-tight" },
  { n: "fieldnote", c: "font-serif" },
  { n: "Quanta", c: "font-semibold italic" },
  { n: "MERIDIAN", c: "tracking-[0.2em]" },
];

function Logos() {
  return (
    <section className="py-12" aria-label="Customers">
      <Reveal><p className="m-0 mb-6 text-center text-[13px] font-medium text-[#86868b]">Routing traffic for teams at</p></Reveal>
      <Marquee speed={36}>
        {BRANDS.map((b) => (
          <span key={b.n} className={`mx-10 text-[24px] text-[#a1a1a6] transition-colors hover:text-[#1d1d1f] ${b.c}`}>{b.n}</span>
        ))}
      </Marquee>
    </section>
  );
}

function Stats() {
  const items = [
    { to: 2.4, f: (n: number) => `${n.toFixed(1)}B`, l: "requests routed every month" },
    { to: 38, f: (n: number) => `${Math.round(n)}%`, l: "average saving on model spend" },
    { to: 99.99, f: (n: number) => `${n.toFixed(2)}%`, l: "gateway uptime, last 12 months" },
    { to: 9, f: (n: number) => `${Math.round(n)}ms`, l: "added latency at p50" },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-16">
      <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.l} className="flex flex-col gap-2 border-t border-black/[.08] pt-6">
            <Counter to={it.to} format={it.f} className="text-[clamp(40px,5vw,56px)] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
            <span className="text-[15px] text-[#6e6e73]">{it.l}</span>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

function LoaderBoard() {
  const rows = [
    { p: 0, t: "Indexing docs", s: "1,204 / 3,880 chunks" },
    { p: 1, t: "Thinking", s: "claude · 2.1s" },
    { p: 2, t: "Searching the web", s: "6 sources" },
    { p: 3, t: "Syncing embeddings", s: "eu-west-1" },
  ];
  return (
    <div className={`${card} flex w-[420px] flex-col gap-1 p-4`}>
      <span className="px-3 pb-2 pt-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#86868b]">Active jobs</span>
      {rows.map((r, i) => (
        <motion.div key={r.t} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4 rounded-2xl px-3 py-3 hover:bg-[#f5f5f7]">
          <MatrixLoader pattern={r.p} size={32} />
          <span className="flex flex-col">
            <span className="text-[15px] font-medium text-[#1d1d1f]">{r.t}</span>
            <span className="text-[13px] tabular-nums text-[#86868b]">{r.s}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function Product() {
  return (
    <section id="product" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="The gateway" title="Everything between your app and the model." sub="Relay handles the parts every AI feature ends up needing: memory, voice, status, and telling you when something breaks." accent={A} />
      <div className="mt-10">
        <StickyStory
          accent={A}
          steps={[
            { kicker: "01 · Context", title: "Context that tidies itself up.", body: "See exactly what fills the window, by category. When a chat gets long, Relay compacts the old turns and keeps what still matters.", visual: <div className={`${card} p-6`}><ContextMeter autoplay /></div> },
            { kicker: "02 · Voice", title: "Voice in, voice out, one endpoint.", body: "Stream audio straight to any speech model. Relay handles turn-taking, so your assistant listens, thinks and talks like one thing.", visual: <div className={`${card} flex h-[420px] w-[420px] items-center justify-center`}><VoiceOrb autoplay /></div> },
            { kicker: "03 · Status", title: "Know what every request is doing.", body: "Long jobs report their state as they go. Drop these loaders into your UI and they match whatever the job is up to.", visual: <LoaderBoard /> },
            { kicker: "04 · Alerts", title: "Problems reach you before users do.", body: "Failovers, spend limits and slow providers show up as alerts in your app, Slack or email. Stack them, expand them, clear them.", visual: <div className={`${card} flex h-[420px] w-[440px] items-end justify-center p-6`}><ToastStack autoplay /></div> },
          ]}
        />
      </div>
    </section>
  );
}

function Routing() {
  return (
    <section id="routing" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Built for production" title="Fast everywhere. Calm under load." accent={A} />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <Spotlight className={`${card} h-full p-8`} color="rgba(90,200,250,.16)">
              <div className="flex h-full flex-col">
                <h3 className="m-0 text-[26px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">Edge nodes in 32 regions.</h3>
                <p className="m-0 mt-2 max-w-[420px] text-[16px] leading-[1.5] text-[#6e6e73]">Requests enter at the closest node and leave on the fastest healthy route. Drag the globe to look around.</p>
                <div className="mt-6 flex flex-1 items-center justify-center"><Fit><DotGlobe autoplay accent={A} size={400} /></Fit></div>
              </div>
            </Spotlight>
          </Reveal>
          <div className="flex flex-col gap-5">
          <Reveal delay={0.1}>
            <div className={`${card} flex h-full flex-col p-7`}>
              <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Pause batch jobs safely.</h3>
              <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73]">Stop a million-row run mid-way and resume without double billing.</p>
              <div className="mt-6 flex flex-1 items-center justify-center"><Fit><SqueezeProgress autoplay accent={A} /></Fit></div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className={`${card} flex h-full flex-col p-7`}>
              <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Feedback on every answer.</h3>
              <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73]">Collect ratings in your UI and Relay ties them to the model that answered.</p>
              <div className="mt-6 flex min-h-[160px] flex-1 items-center justify-center"><FeedbackPill autoplay accent={A} label="Rate this answer" placeholder="What was wrong with it?" /></div>
            </div>
          </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

const CODE: Record<string, string[]> = {
  TypeScript: [
    `import { Relay } from "@relay/sdk";`,
    ``,
    `const relay = new Relay({ strategy: "balanced" });`,
    ``,
    `// Same call, any model. Relay picks the route.`,
    `const reply = await relay.chat({`,
    `  messages: [{ role: "user", content: "Summarise this PR" }],`,
    `  fallback: ["claude", "gpt", "gemini"],`,
    `});`,
  ],
  Python: [
    `from relay import Relay`,
    ``,
    `relay = Relay(strategy="balanced")`,
    ``,
    `# Same call, any model. Relay picks the route.`,
    `reply = relay.chat(`,
    `    messages=[{"role": "user", "content": "Summarise this PR"}],`,
    `    fallback=["claude", "gpt", "gemini"],`,
    `)`,
  ],
  cURL: [
    `curl https://api.relay.dev/v1/chat \\`,
    `  -H "Authorization: Bearer $RELAY_KEY" \\`,
    `  -d '{`,
    `    "strategy": "balanced",`,
    `    "messages": [{ "role": "user", "content": "Summarise this PR" }],`,
    `    "fallback": ["claude", "gpt", "gemini"]`,
    `  }'`,
  ],
};

function hl(line: string) {
  const parts = line.split(/("[^"]*"|'[^']*'|\/\/.*$|#.*$|\b(?:import|from|const|await|new)\b)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    let c = "#e8e8ed";
    if (/^["']/.test(p)) c = "#a6e3a1";
    else if (/^(\/\/|#)/.test(p)) c = "#7c7c84";
    else if (/^(import|from|const|await|new)$/.test(p)) c = "#ff8ac7";
    return <span key={i} style={{ color: c }}>{p}</span>;
  });
}

function Developers() {
  const [lang, setLang] = useState("TypeScript");
  return (
    <section id="dev" className="bg-[#000] py-24 text-white">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-14 px-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Developers" title="Switch in three lines." sub="Keep your prompts and your SDK habits. Point the base URL at Relay and every model is a string away." accent="#5ac8fa" dark />
          <Stagger className="flex flex-col gap-4">
            {["OpenAI-compatible endpoints", "Typed SDKs for TypeScript and Python", "Per-request cost and latency headers", "Replay any request from the console"].map((t) => (
              <span key={t} className="flex items-center gap-3 text-[16px] text-[#d2d2d7]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5ac8fa]/15 text-[#5ac8fa]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                {t}
              </span>
            ))}
          </Stagger>
          <Reveal><ProgressButton label="Deploy to edge" doneLabel="View logs" accent={A} autoplay /></Reveal>
        </div>
        <Reveal>
          <div className="overflow-hidden rounded-[28px] bg-[#1c1c1e] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_40px_80px_-40px_rgba(90,200,250,.35)]">
            <div className="flex items-center gap-1 border-b border-white/[.08] p-2" role="tablist" aria-label="Language">
              {Object.keys(CODE).map((k) => (
                <button key={k} type="button" role="tab" aria-selected={lang === k} onClick={() => setLang(k)} className="relative rounded-full px-4 py-2 text-[13px] font-medium outline-none focus-visible:ring-2" style={{ color: lang === k ? "#fff" : "#8e8e93" }}>
                  {lang === k && <motion.span layoutId="relay-lang" className="absolute inset-0 rounded-full bg-white/10" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                  <span className="relative">{k}</span>
                </button>
              ))}
            </div>
            <div className="min-h-[300px] overflow-x-auto p-6">
              <AnimatePresence mode="wait">
                <motion.pre key={lang} className="m-0 text-[13.5px] leading-[1.75]" style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" }} initial="h" animate="s" exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }} variants={{ s: { transition: { staggerChildren: 0.04 } } }}>
                  {CODE[lang].map((l, i) => (
                    <motion.div key={i} variants={{ h: { opacity: 0, x: -10, filter: "blur(4px)" }, s: { opacity: 1, x: 0, filter: "blur(0px)" } }} className="flex gap-5">
                      <span className="w-4 flex-none select-none text-right text-[#48484a]">{i + 1}</span>
                      <code>{hl(l)}{l === "" ? " " : null}</code>
                    </motion.div>
                  ))}
                </motion.pre>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Pricing" title="Pay for routing, not for guesswork." sub="Start free. Every plan includes failover and cost tracking. Model usage is billed at provider rates, with no markup." accent={A} center />
      <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Reveal>
          <div className={`${card} flex h-full flex-col gap-6 p-7`}>
            <div>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Choose a plan</h3>
              <p className="m-0 mt-1 text-[15px] text-[#6e6e73]">Switch any time. Changes apply from the next request.</p>
            </div>
            <Fit>
              <RadioCards
                accent={A}
                autoplay
                defaultValue="pro"
                options={[
                  { id: "hobby", title: "Hobby", description: "For side projects", meta: "Free", features: ["100k requests / month", "3 providers", "Community support"] },
                  { id: "pro", title: "Pro", description: "For products in production", meta: "$20/mo", features: ["10M requests / month", "All providers", "Quality routing"] },
                  { id: "scale", title: "Scale", description: "For high-volume teams", meta: "Custom", features: ["Unlimited requests", "Private edge nodes", "99.99% SLA"] },
                ]}
              />
            </Fit>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className={`${card} flex h-full flex-col gap-6 p-7`}>
            <div>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Team seats</h3>
              <p className="m-0 mt-1 text-[15px] text-[#6e6e73]">Console seats for everyone who needs logs and spend controls.</p>
            </div>
            <div className="flex flex-1 items-center justify-center"><Fit><PriceOdometer accent={A} monthlyRate={12} yearlyRate={9} maxSeats={200} autoplay /></Fit></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const QUOTES = [
  { q: "We cut our model bill by a third in the first week, without touching a prompt.", n: "Head of Platform", c: "Northwind" },
  { q: "The failover is the feature. Our assistant stayed up through two provider outages.", n: "Staff Engineer", c: "Parcel" },
  { q: "Being able to replay any request from the console has changed how we debug.", n: "AI Lead", c: "Orbit Labs" },
  { q: "Voice used to be its own project. With Relay it was an afternoon.", n: "CTO", c: "Fieldnote" },
];

function Quotes() {
  return (
    <section className="bg-[#f5f5f7] py-20" aria-label="What teams say">
      <Marquee speed={28}>
        {QUOTES.map((q) => (
          <figure key={q.q} className={`${card} m-0 mx-2.5 flex w-[360px] flex-none flex-col gap-5 p-7`}>
            <blockquote className="m-0 text-[18px] leading-[1.45] tracking-[-0.01em] text-[#1d1d1f]">“{q.q}”</blockquote>
            <figcaption className="text-[14px] text-[#6e6e73]"><span className="font-semibold text-[#1d1d1f]">{q.n}</span> · {q.c}</figcaption>
          </figure>
        ))}
      </Marquee>
    </section>
  );
}

export function RelayPage() {
  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
      <Nav brand={<Logo />} accent={A} cta="Start free" onCta={() => scrollToId("pricing")} links={[{ label: "Product", id: "product" }, { label: "Routing", id: "routing" }, { label: "Developers", id: "dev" }, { label: "Pricing", id: "pricing" }, { label: "FAQ", id: "faq" }]} />
      <Hero />
      <Logos />
      <Stats />
      <Product />
      <Routing />
      <Developers />
      <Pricing />
      <Quotes />
      <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[1fr_1.4fr]">
        <SectionHead eyebrow="FAQ" title="Questions, answered." accent={A} />
        <Reveal>
          <Faq
            accent={A}
            items={[
              { q: "Does Relay store my prompts?", a: "Only if you turn on request logging, and only for as long as you choose. Logs are encrypted and stay in the region you pick." },
              { q: "How does routing decide which model to use?", a: "Each strategy weighs price, latency and a quality score from your own feedback. You can pin a model per route whenever you need to." },
              { q: "What happens when a provider goes down?", a: "Relay notices failed or slow responses within a few hundred milliseconds and retries on the next model in your fallback list." },
              { q: "Can I bring my own provider keys?", a: "Yes. Use your keys and your existing rate limits, or use ours and get one bill for everything." },
            ]}
          />
        </Reveal>
      </section>
      <div className="mx-auto max-w-[1180px] px-5 pb-20">
        <CtaBand title="Route your first request in five minutes." sub="Free up to 100k requests a month. No card needed." cta="Get your API key" secondary="Talk to sales" accent={A} glow="rgba(90,200,250,.28)" />
      </div>
      <Footer brand={<Logo />} note="The AI gateway for teams that ship. Route, fall back and track spend across every model." columns={[{ title: "Product", links: ["Routing", "Voice", "Console", "Pricing"] }, { title: "Developers", links: ["Docs", "SDKs", "Status", "Changelog"] }, { title: "Company", links: ["About", "Careers", "Security", "Contact"] }]} />
    </div>
    </MotionConfig>
  );
}

export default RelayPage;
