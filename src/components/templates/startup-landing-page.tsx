"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
  useAnimationFrame,
} from "framer-motion";
import {
  BarChart3,
  Check,
  ChevronDown,
  CircleDollarSign,
  Globe2,
  LineChart,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1800&q=85";
const ADVISOR_IMAGE =
  "https://images.unsplash.com/photo-1723990720522-e8e0d5f8c052?q=80&w=1440&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function useLenis() {
  React.useEffect(() => {
    let lenis: { raf: (time: number) => void; destroy: () => void } | null =
      null;
    let frame = 0;

    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.075, smoothWheel: true }) as {
        raf: (time: number) => void;
        destroy: () => void;
      };

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };

      frame = requestAnimationFrame(raf);
    });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AureonMark({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${small ? "h-3 w-6" : "h-4 w-8"} relative`}>
        <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-white" />
        <span className="absolute left-[7px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-white" />
        <span className="absolute left-[14px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-white" />
      </div>
      <span
        className={`${small ? "text-[11px]" : "text-sm"} font-semibold text-white`}
      >
        aureon
      </span>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = ["Home", "About", "Pricing", "Blog", "Contact"];

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/10 bg-black/70 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#home" aria-label="Aureon home">
          <AureonMark />
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {items.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs text-white/45 transition hover:text-white"
            >
              {item}
            </a>
          ))}
          <a
            href="#pricing"
            className="rounded-full border border-white/15 bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/85"
          >
            Get Started
          </a>
        </nav>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-white md:hidden"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden border-t border-white/10 bg-black/90 md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {items.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const beamX = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section
      id="home"
      ref={ref}
      className="relative min-h-[100svh] overflow-hidden bg-black pt-16 text-white"
    >
      <motion.div style={{ y: imageY }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_18%,rgba(109,137,137,0.26),transparent_20%),linear-gradient(90deg,#000_0%,rgba(0,0,0,0.95)_33%,rgba(0,0,0,0.34)_62%,#080402_100%)]" />
        <div
          className="absolute inset-y-0 right-0 w-[70%] bg-cover bg-center opacity-65 mix-blend-screen"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,.72)_34%,rgba(0,0,0,.08)_60%,rgba(0,0,0,.58)_100%)]" />
        <motion.div
          style={{ x: beamX }}
          className="absolute right-[-15%] top-[20%] h-[56%] w-[68%] origin-left skew-y-[-18deg]"
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="absolute left-0 h-[5px] w-full rounded-full bg-[linear-gradient(90deg,rgba(255,122,20,0),rgba(255,122,20,.95),rgba(255,202,80,.9),rgba(255,112,18,0))] blur-[1px]"
              style={{ top: `${i * 24}%` }}
              animate={{ opacity: [0.3, 1, 0.45], scaleX: [0.88, 1, 0.92] }}
              transition={{
                duration: 3.2 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.22,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col px-5 pb-8 pt-20 sm:px-8 lg:pt-28">
        <motion.div style={{ y: textY }} className="max-w-[660px]">
          <motion.h1
            initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="text-balance text-[44px] font-normal leading-[0.96] tracking-[-0.04em] text-white sm:text-6xl lg:text-[82px]"
          >
            Investment decisions guided by intelligence
          </motion.h1>
          <motion.a
            href="#pricing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: EASE }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 inline-flex rounded-full border border-white/15 bg-white px-4 py-2 text-xs font-semibold text-black"
          >
            Get Started
          </motion.a>
        </motion.div>

        <div className="mt-auto grid gap-6 pb-4 pt-20 md:grid-cols-[1fr_auto] md:items-end">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
            className="max-w-xl text-xs leading-relaxed text-white/48 sm:text-sm"
          >
            Connect your portfolio and unlock AI-powered analysis. Get real-time
            insights, risk assessments, and strategic guidance tailored to your
            financial goals.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.58, ease: EASE }}
            className="max-w-xs text-xs leading-relaxed text-white/55"
          >
            <span className="mr-2 inline-block size-1.5 rounded-full bg-white" />
            Meet Nova, your AI investment advisor
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { prefix: "$", value: 998, suffix: "+", label: "Portfolio value analyzed" },
    { value: 150, suffix: "K+", label: "Active investors" },
    { value: 12, suffix: "K+", label: "Daily recommendations" },
    { value: 94, suffix: "%", label: "Decision confidence" },
  ];
  return (
    <section id="about" className="bg-black py-24 text-white lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <Reveal>
          <h2 className="max-w-sm text-3xl font-normal leading-tight tracking-[-0.04em] sm:text-5xl">
            Trusted by thousands{" "}
            <span className="block text-white/45">of investors worldwide</span>
          </h2>
          <div className="mt-12 grid max-w-xl grid-cols-2 gap-7 text-xs text-white/52">
            {[
              "Real-time market signals",
              "Risk clarity across every holding",
              "Portfolio-aware insights",
              "AI-generated strategies",
            ].map((item) => (
              <p key={item} className="border-t border-white/10 pt-3">
                {item}
              </p>
            ))}
          </div>
        </Reveal>
        <div className="grid grid-cols-2 border border-white/10">
          {stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.08}
              className="border-b border-r border-white/10 p-8 last:border-r-0 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0"
            >
              <p className="text-4xl font-normal tracking-[-0.04em] sm:text-5xl">
                <CountUpStat
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-3 text-xs text-white/40">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUpStat({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;

    let frame = 0;
    const duration = 850;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function FeatureVisual({ type }: { type: "dial" | "orb" | "exposure" }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  if (type === "orb") {
    return (
      <div
        ref={ref}
        className="relative flex h-[260px] items-center justify-center"
      >
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border border-white/[0.07]"
            style={{ width: 110 + i * 58, height: 110 + i * 58 }}
            animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.16, 0.34, 0.16] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              delay: i * 0.45,
              ease: "easeInOut",
            }}
          />
        ))}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex size-28 flex-col items-center justify-center rounded-full border border-white/10 bg-black text-white shadow-[0_0_60px_rgba(255,255,255,.04)]"
        >
          <Sparkles className="size-7" />
          <span className="mt-2 font-mono text-base">Nova</span>
        </motion.div>
      </div>
    );
  }

  if (type === "exposure") {
    const holdings = [
      { label: "Tech", impact: "+18%", x: "18%", y: "62%", delay: 0 },
      { label: "Energy", impact: "-7%", x: "55%", y: "42%", delay: 0.18 },
      { label: "Bonds", impact: "+4%", x: "72%", y: "70%", delay: 0.34 },
    ];

    return (
      <div
        ref={ref}
        className="relative flex h-[260px] items-center justify-center overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.75, ease: EASE }}
          className="relative h-[220px] w-full max-w-[310px] overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-5 shadow-[0_0_70px_rgba(255,255,255,.035)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:52px_42px]" />
          <motion.div
            aria-hidden
            className="absolute inset-y-4 w-14 rounded-full bg-white/12 blur-xl"
            initial={{ left: "-20%" }}
            animate={inView ? { left: ["-20%", "82%", "-20%"] } : {}}
            transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs text-white/35">Portfolio exposure</p>
              <p className="mt-1 max-w-[170px] text-[22px] leading-none tracking-[-0.05em]">
                Volatility impact
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.72, 1, 0.72] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="grid size-12 place-items-center rounded-full border border-white/10 bg-white/[0.04]"
            >
              <ShieldCheck className="size-5 text-white/85" />
            </motion.div>
          </div>

          <div className="relative mt-3 h-[118px]">
            <motion.svg
              viewBox="0 0 260 112"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              <path
                d="M4 78 C35 60 50 96 82 70 C111 46 124 52 146 35 C178 9 194 55 220 37 C238 26 249 24 256 22"
                fill="none"
                stroke="rgba(255,255,255,.08)"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <motion.path
                d="M4 78 C35 60 50 96 82 70 C111 46 124 52 146 35 C178 9 194 55 220 37 C238 26 249 24 256 22"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  inView
                    ? {
                        pathLength: [0, 1, 1],
                        opacity: [0, 1, 0.72],
                      }
                    : {}
                }
                transition={{ duration: 2.1, ease: EASE }}
              />
              <motion.path
                d="M4 78 C35 60 50 96 82 70 C111 46 124 52 146 35 C178 9 194 55 220 37 C238 26 249 24 256 22"
                fill="none"
                stroke="rgba(255,255,255,.55)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="18 240"
                animate={inView ? { strokeDashoffset: [0, -260] } : {}}
                transition={{
                  duration: 3.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.svg>

            {holdings.map((holding) => (
              <motion.div
                key={holding.label}
                className="absolute rounded-full border border-white/10 bg-[#141414]/95 px-3 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,.28)]"
                style={{ left: holding.x, top: holding.y }}
                initial={{ opacity: 0, y: 12, scale: 0.88 }}
                animate={
                  inView
                    ? {
                        opacity: 1,
                        y: [0, -5, 0],
                        scale: 1,
                      }
                    : {}
                }
                transition={{
                  opacity: { duration: 0.55, delay: 0.45 + holding.delay },
                  scale: {
                    duration: 0.55,
                    delay: 0.45 + holding.delay,
                    ease: EASE,
                  },
                  y: {
                    duration: 2.7,
                    repeat: Infinity,
                    delay: holding.delay,
                    ease: "easeInOut",
                  },
                }}
              >
                <span className="mr-2 text-[10px] text-white/38">
                  {holding.label}
                </span>
                <span className="font-mono text-[11px] text-white/82">
                  {holding.impact}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="relative flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-[10px] text-white/35">Market volatility</span>
            <motion.span
              className="font-mono text-lg leading-none tracking-[-0.05em] text-white"
              animate={{ opacity: [0.62, 1, 0.62] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              -12.4%
            </motion.span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative flex h-[260px] items-center justify-center"
    >
      <motion.svg
        viewBox="0 0 220 220"
        className="size-56 -rotate-90"
        animate={{ rotate: [-90, -65, -90] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle
          cx="110"
          cy="110"
          r="78"
          fill="none"
          stroke="rgba(255,255,255,.065)"
          strokeWidth="13"
        />
        <circle
          cx="110"
          cy="110"
          r="100"
          fill="none"
          stroke="rgba(255,255,255,.055)"
          strokeWidth="2"
          strokeDasharray="112 16 64 22"
        />
        <motion.circle
          cx="110"
          cy="110"
          r="78"
          fill="none"
          stroke="white"
          strokeWidth="13"
          strokeLinecap="butt"
          strokeDasharray="490"
          initial={{ strokeDashoffset: 490 }}
          animate={inView ? { strokeDashoffset: 128 } : {}}
          transition={{ duration: 1.5, ease: EASE }}
        />
      </motion.svg>
      <div className="absolute text-center">
        <p className="font-mono text-2xl tracking-[-0.04em]">$125,000</p>
        <p className="text-xs text-white/35">Total Value</p>
      </div>
    </div>
  );
}

function Features() {
  const cards = [
    {
      icon: CircleDollarSign,
      title: "Real-time portfolio insights",
      body: "Instant analysis of allocation, risk exposure, and rebalancing opportunities.",
      type: "dial" as const,
    },
    {
      icon: Sparkles,
      title: "Ask Nova anything",
      body: "Research any stock, ETF, or strategy with data-driven answers in seconds.",
      type: "orb" as const,
    },
    {
      icon: ShieldCheck,
      title: "Understand your exposure",
      body: "Quantify portfolio risk and see how market volatility could impact your holdings.",
      type: "exposure" as const,
    },
  ];

  return (
    <section id="features" className="bg-black py-24 text-white lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-12">
          <h2 className="max-w-2xl text-4xl font-normal leading-[1.02] tracking-[-0.05em] sm:text-6xl">
            Everything you need{" "}
            <span className="text-white/45">to invest with confidence</span>
          </h2>
        </Reveal>
        <div className="grid gap-3 lg:grid-cols-3">
          {cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.08}>
              <motion.article
                whileHover={{ y: -6 }}
                className="flex min-h-[520px] flex-col justify-between rounded-lg border border-white/5 bg-[#141414] p-7 transition-colors hover:bg-[#181818]"
              >
                <FeatureVisual type={card.type} />
                <div>
                  <card.icon className="mb-5 size-6 text-white/80" />
                  <h3 className="text-xl font-normal tracking-[-0.03em]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-lg leading-snug text-white/42">
                    {card.body}
                  </p>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const process = [
  [
    "01",
    "Connect your accounts",
    "Link your brokerage accounts using secure, read-only access. We integrate with 300+ financial institutions through bank-level encryption.",
  ],
  [
    "02",
    "AI analyzes instantly",
    "Orion evaluates your portfolio in seconds—assessing allocation, risk exposure, sector concentration, and identifying optimization opportunities.",
  ],
  [
    "03",
    "Receive personalized insights",
    "Get clear, actionable recommendations tailored to your goals. Ask Nova questions anytime and receive answers in plain language.",
  ],
  [
    "04",
    "Make informed decisions",
    "Execute through your broker when you're ready. Track progress and refine your strategy over time while staying in control.",
  ],
];

function Process() {
  const ref = React.useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // This moves the whole card list upward through the visible mask.
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, -300]);

  return (
    <section
      ref={ref}
      id="product"
      className="relative z-10 -mt-20 h-[170vh] bg-black text-white"
    >
      <div className="sticky top-0 mx-auto grid h-screen max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[0.55fr_1.45fr] lg:px-10">
        {/* Left side */}
        <div className="self-center">
          <h2 className="max-w-[260px] text-3xl font-normal leading-[0.95] tracking-[-0.06em] sm:text-4xl">
            Simple process,
            <span className="block text-white/50">powerful results</span>
          </h2>

          <a
            href="#pricing"
            className="mt-5 inline-flex rounded-full border border-white/15 px-4 py-2 text-[11px] font-medium text-white/80 transition hover:bg-white hover:text-black"
          >
            Get Started
          </a>
        </div>

        {/* Right side mask */}
        <div className="relative h-[520px] overflow-hidden">
          <motion.div style={{ y: cardsY }} className="space-y-5">
            {process.map(([num, title, body], index) => (
              <ProcessCard
                key={num}
                num={num}
                title={title}
                body={body}
                index={index}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProcessCard({
  num,
  title,
  body,
  index,
}: {
  num: string;
  title: string;
  body: string;
  index: number;
}) {
  const progress = ["24%", "52%", "76%", "100%"][index] ?? "50%";
  const labels = ["Secure sync", "Portfolio scan", "AI brief", "Ready to act"];

  return (
    <motion.article
      initial={{ opacity: 0, x: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -4, scale: 1.012 }}
      transition={{
        duration: 0.65,
        delay: index * 0.06,
        ease: EASE,
      }}
      className="group relative h-[146px] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121212] px-7 py-6 shadow-2xl shadow-black/55"
    >
      <motion.div
        aria-hidden
        className="absolute -right-20 -top-24 size-48 rounded-full bg-white/[0.055] blur-3xl"
        animate={{
          opacity: [0.25, 0.7, 0.25],
          scale: [0.86, 1.08, 0.86],
        }}
        transition={{
          duration: 4 + index * 0.3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent)]"
        initial={{ x: "-100%" }}
        whileInView={{ x: "100%" }}
        viewport={{ once: true }}
        transition={{
          duration: 1.8,
          delay: 0.25 + index * 0.1,
          ease: "easeInOut",
        }}
      />

      <span className="pointer-events-none absolute -left-5 top-1/2 -translate-y-1/2 select-none text-[128px] font-semibold leading-none tracking-[-0.08em] text-white/[0.035]">
        {num}
      </span>

      <div className="relative grid h-full gap-5 sm:grid-cols-[108px_1fr] sm:items-center">
        <div className="hidden sm:block">
          <motion.div
            className="relative size-16 rounded-full border border-white/10 bg-black/40"
            animate={{ rotate: [0, 8, 0] }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              delay: index * 0.18,
              ease: "easeInOut",
            }}
          >
            <div className="absolute inset-2 rounded-full border border-white/[0.06]" />
            <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            <motion.span
              className="absolute left-1/2 top-1/2 h-px w-6 origin-left bg-white/70"
              animate={{ rotate: [-24, 22, -12] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-normal tracking-[-0.035em] text-white">
              {title}
            </h3>
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-white/48">
              {labels[index]}
            </span>
          </div>

          <p className="max-w-[560px] text-xs leading-relaxed text-white/45">
            {body}
          </p>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: 0 }}
              whileInView={{ width: progress }}
              viewport={{ once: true }}
              transition={{
                duration: 1,
                delay: 0.2 + index * 0.08,
                ease: EASE,
              }}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

type InvestorTab = {
  key: "retirement" | "rebalance" | "tax" | "risk";
  label: string;
  eyebrow: string;
  copy: string;
};

const investorTabs: InvestorTab[] = [
  {
    key: "retirement",
    label: "Retirement map",
    eyebrow: "Planning long term",
    copy: "Model different scenarios, optimize withdrawal timing, and keep your portfolio aligned with your timeline and risk tolerance.",
  },
  {
    key: "rebalance",
    label: "Allocation reset",
    eyebrow: "Rebalancing your portfolio",
    copy: "Identify allocation drift, receive rebalancing recommendations, and maintain your target asset mix without emotional guesswork.",
  },
  {
    key: "tax",
    label: "Tax timing",
    eyebrow: "Optimizing taxes",
    copy: "Discover loss-harvesting opportunities, manage capital gains efficiently, and improve after-tax returns with smarter timing.",
  },
  {
    key: "risk",
    label: "Risk radar",
    eyebrow: "Managing portfolio risk",
    copy: "Quantify exposure with advanced metrics, stress-test against market scenarios, and understand how volatility impacts your holdings.",
  },
];

function RetirementVisual() {
  return (
    <svg viewBox="0 0 760 540" className="h-[420px] w-full lg:h-[520px]">
      {["$600k", "$450k", "$300k", "$150k"].map((label, i) => (
        <g key={label}>
          <text
            x="34"
            y={54 + i * 94}
            fill="rgba(255,255,255,.45)"
            fontSize="15"
          >
            {label}
          </text>
          <line
            x1="34"
            x2="720"
            y1={70 + i * 94}
            y2={70 + i * 94}
            stroke="rgba(255,255,255,.08)"
            strokeDasharray="4 4"
          />
        </g>
      ))}
      {["2028", "2032", "2036", "2040", "2044", "2048", "2052"].map(
        (label, i) => (
          <text
            key={label}
            x={48 + i * 105}
            y="508"
            fill="rgba(255,255,255,.35)"
            fontSize="14"
          >
            {label}
          </text>
        ),
      )}
      <path
        d="M40 466 C150 430 260 405 360 348 C470 282 560 214 720 126"
        fill="none"
        stroke="rgba(255,255,255,.24)"
        strokeWidth="3"
      />
      <motion.path
        d="M40 466 C150 420 270 360 370 300 C500 220 604 150 720 78"
        fill="none"
        stroke="#ff4d20"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
      />
      <line
        x1="560"
        x2="560"
        y1="166"
        y2="482"
        stroke="rgba(255,255,255,.12)"
        strokeDasharray="4 4"
      />
      <circle cx="560" cy="216" r="5" fill="#ff4d20" />
      <circle cx="560" cy="364" r="5" fill="rgba(255,255,255,.28)" />
      <foreignObject x="330" y="102" width="250" height="110">
        <div className="rounded-lg border border-white/10 bg-black/70 p-4 text-sm text-white/70">
          <p className="mb-3 text-white/40">2048</p>
          <p>
            <span className="mr-2 inline-block size-2 rounded-sm bg-orange-600" />
            With Aureon <span className="float-right text-white">$268,900</span>
          </p>
          <p className="mt-3">
            <span className="mr-2 inline-block size-2 rounded-sm bg-white/45" />
            Self managed <span className="float-right">$131,400</span>
          </p>
        </div>
      </foreignObject>
    </svg>
  );
}

function RebalanceVisual() {
  return (
    <div className="grid h-[420px] place-items-center gap-5 px-4 lg:h-[520px] lg:grid-cols-2">
      {[
        ["Drifted allocation", "10%", "90%", "rgba(255,255,255,.35)"],
        ["Balanced target", "42%", "58%", "url(#warm-band)"],
      ].map(([title, a, b, stroke], i) => (
        <div key={title} className="w-full text-center">
          <p className="mb-6 text-2xl tracking-[-0.04em] text-white/75">
            {title}
          </p>
          <svg viewBox="0 0 260 260" className="mx-auto size-64">
            <defs>
              <linearGradient id="warm-band" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#d7f8ff" />
                <stop offset="45%" stopColor="#ff5a2a" />
                <stop offset="100%" stopColor="#6d170a" />
              </linearGradient>
            </defs>
            <circle
              cx="130"
              cy="130"
              r="96"
              fill="none"
              stroke="rgba(255,255,255,.07)"
              strokeWidth="3"
            />
            <motion.circle
              cx="130"
              cy="130"
              r="78"
              fill="none"
              stroke={stroke}
              strokeWidth="28"
              strokeDasharray={i ? "210 300" : "42 468"}
              strokeLinecap="butt"
              initial={{ rotate: -120 }}
              animate={{ rotate: i ? [-120, -96, -120] : [-88, -78, -88] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "130px 130px" }}
            />
            <text x="42" y="50" fill="rgba(255,255,255,.55)" fontSize="17">
              {a}
            </text>
            <text x="210" y="228" fill="rgba(255,255,255,.55)" fontSize="17">
              {b}
            </text>
          </svg>
        </div>
      ))}
      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 rounded-lg border border-white/10 bg-black/50 px-5 py-2 text-sm text-white/50 lg:block">
        <span className="mr-2 inline-block size-2 rounded-sm bg-orange-700" />{" "}
        Bonds
        <span className="ml-5 mr-2 inline-block size-2 rounded-sm border border-white/15" />{" "}
        Stocks
      </div>
    </div>
  );
}

// function TaxVisual() {
//   return (
//     <svg viewBox="0 0 760 540" className="h-[420px] w-full lg:h-[520px]">
//       {["$6k", "$4.5k", "$3k", "$1.5k"].map((label, i) => (
//         <g key={label}>
//           <text
//             x="34"
//             y={54 + i * 94}
//             fill="rgba(255,255,255,.45)"
//             fontSize="15"
//           >
//             {label}
//           </text>
//           <line
//             x1="34"
//             x2="720"
//             y1={70 + i * 94}
//             y2={70 + i * 94}
//             stroke="rgba(255,255,255,.08)"
//             strokeDasharray="4 4"
//           />
//         </g>
//       ))}
//       <foreignObject x="102" y="42" width="280" height="54">
//         <div className="rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-lg text-white/80">
//           $4,200 in tax savings found
//         </div>
//       </foreignObject>
//       {[130, 275, 420].map((x, i) => (
//         <g key={x}>
//           <motion.rect
//             x={x}
//             y={250 + i * 18}
//             width="96"
//             height={260 - i * 18}
//             rx="8"
//             fill="transparent"
//             stroke="rgba(255,255,255,.09)"
//             initial={{ height: 0, y: 510 }}
//             animate={{ height: 260 - i * 18, y: 250 + i * 18 }}
//             transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
//           />
//           <text x={x + 30} y="508" fill="rgba(255,255,255,.35)" fontSize="14">
//             {2023 + i}
//           </text>
//         </g>
//       ))}
//       <foreignObject x="555" y="95" width="100" height="365">
//         <motion.div
//           initial={{ height: 0 }}
//           animate={{ height: 365 }}
//           transition={{ duration: 0.9, ease: EASE }}
//           className="h-full overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(160deg,#c8f8ff_0%,#07100f_24%,#000_44%,#ff6a2a_64%,#270803_100%)]"
//         />
//       </foreignObject>
//       <text x="548" y="76" fill="white" fontSize="20">
//         aureon
//       </text>
//     </svg>
//   );
// }
function TaxVisual() {
  const grid = [
    { label: "$6k", y: 72 },
    { label: "$4.5k", y: 142 },
    { label: "$3k", y: 212 },
    { label: "$1.5k", y: 282 },
  ];

  const ghostBars = [
    { x: 130, h: 128 },
    { x: 282, h: 92 },
    { x: 434, h: 132 },
  ];

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-3xl bg-[#111] lg:h-[420px]">
      <svg
        viewBox="0 0 760 430"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="taxBarGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c8f8ff" />
            <stop offset="24%" stopColor="#07100f" />
            <stop offset="44%" stopColor="#000000" />
            <stop offset="64%" stopColor="#ff6a2a" />
            <stop offset="100%" stopColor="#270803" />
          </linearGradient>
        </defs>

        {grid.map((item) => (
          <g key={item.label}>
            <text
              x="44"
              y={item.y - 12}
              fill="rgba(255,255,255,.45)"
              fontSize="15"
            >
              {item.label}
            </text>

            <line
              x1="44"
              x2="704"
              y1={item.y}
              y2={item.y}
              stroke="rgba(255,255,255,.08)"
              strokeDasharray="4 4"
            />
          </g>
        ))}

        <foreignObject x="116" y="42" width="300" height="58">
          <div className="rounded-lg border border-white/10 bg-black/60 px-4 py-3 text-lg text-white/80">
            $4,200 in tax savings found
          </div>
        </foreignObject>

        {ghostBars.map((bar, i) => (
          <g key={bar.x}>
            <motion.rect
              x={bar.x}
              y={354 - bar.h}
              width="96"
              height={bar.h}
              rx="8"
              fill="transparent"
              stroke="rgba(255,255,255,.09)"
              initial={{ height: 0, y: 354 }}
              animate={{ height: bar.h, y: 354 - bar.h }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: EASE,
              }}
            />

            <text
              x={bar.x + 30}
              y="394"
              fill="rgba(255,255,255,.35)"
              fontSize="14"
            >
              {2023 + i}
            </text>
          </g>
        ))}

        <text x="570" y="92" fill="white" fontSize="20">
          aureon
        </text>

        <motion.rect
          x="560"
          width="112"
          rx="8"
          fill="url(#taxBarGradient)"
          stroke="rgba(255,255,255,.12)"
          initial={{ height: 0, y: 354 }}
          animate={{ height: 255, y: 104 }}
          transition={{
            duration: 0.9,
            ease: EASE,
          }}
        />
      </svg>
    </div>
  );
}

function RiskVisual() {
  return (
    <div className="relative h-[420px] overflow-hidden lg:h-[520px]">
      <div className="absolute inset-8 border border-dashed border-white/10" />
      <div className="absolute left-8 right-8 top-[47%] h-px bg-white/10" />
      <div className="absolute left-[38%] top-[16%] rounded-lg border border-white/10 bg-black/45 px-5 py-3 text-2xl tracking-[-0.04em]">
        Current risk exposure
      </div>
      <div className="absolute left-8 top-[58%] h-24 w-[38%] rounded-lg border border-white/10 bg-[linear-gradient(135deg,#7b1d0d,#050505_45%,#ff7d31)]" />
      <motion.div
        className="absolute left-8 top-[28%] h-24 w-[70%] rounded-lg border border-white/10"
        animate={{ x: [0, 28, 0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="absolute right-24 top-[38%] text-sm text-white/38">
        Self-directed
      </p>
      <p className="absolute left-[44%] top-[66%] text-xl text-white">aureon</p>
    </div>
  );
}

function InvestorVisual({ active }: { active: InvestorTab["key"] }) {
  if (active === "rebalance") return <RebalanceVisual />;
  if (active === "tax") return <TaxVisual />;
  if (active === "risk") return <RiskVisual />;
  return <RetirementVisual />;
}

function InvestorChart() {
  const [active, setActive] = React.useState<InvestorTab["key"]>("retirement");
  const current = investorTabs.find((tab) => tab.key === active)!;

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setActive((value) => {
        const index = investorTabs.findIndex((tab) => tab.key === value);
        return investorTabs[(index + 1) % investorTabs.length].key;
      });
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="bg-black py-24 text-white lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-8">
          <h2 className="text-4xl font-normal tracking-[-0.05em] sm:text-6xl">
            Perfect for every{" "}
            <span className="text-white/45">kind of investor</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex flex-wrap gap-6">
            {investorTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`rounded-lg px-5 py-3 text-lg transition ${
                  active === tab.key
                    ? "bg-[#151515] text-white shadow-[0_0_0_1px_rgba(255,255,255,.1),0_0_0_2px_rgba(59,130,246,.7)]"
                    : "text-white/45 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>
        <div className="mt-9 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-[#101010]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <InvestorVisual active={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-xl text-white/42">{current.eyebrow}</p>
            <p className="mt-7 text-3xl leading-tight tracking-[-0.04em] text-white">
              {current.copy}
            </p>
            <a
              href="#pricing"
              className="mt-7 inline-flex rounded-full border border-white/15 px-5 py-3 text-lg font-semibold text-white/80 transition hover:bg-white hover:text-black"
            >
              Get Started
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    [
      ShieldCheck,
      "Never lose sight of downside",
      "Risk bands surface hidden exposure before it compounds.",
    ],
    [
      LineChart,
      "Optimal performance tracking",
      "Benchmark returns against the goals that matter to you.",
    ],
    [
      BarChart3,
      "Stay ahead of trends",
      "Market context is folded into each recommendation.",
    ],
    [
      Sparkles,
      "No-code decisions",
      "Ask plain-language questions and get portfolio-aware answers.",
    ],
    [
      Globe2,
      "Markets, everywhere",
      "Track equities, funds, crypto, and cash from one place.",
    ],
    [
      Zap,
      "Lean on real speed",
      "Insights update as your connected accounts move.",
    ],
  ];
  return (
    <section className="bg-black py-24 text-white lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-10 flex items-end justify-between gap-6">
          <h2 className="text-4xl font-normal tracking-[-0.05em] sm:text-6xl">
            Invest smarter, not harder
          </h2>
          <a
            href="#pricing"
            className="hidden rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white hover:text-black sm:inline-flex"
          >
            Get Started
          </a>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([Icon, title, body], i) => (
            <Reveal key={title as string} delay={i * 0.05}>
              <motion.article
                whileHover={{ y: -5 }}
                className="border border-white/10 bg-white/[0.03] p-6"
              >
                {React.createElement(Icon as typeof ShieldCheck, {
                  className: "size-5 text-white/55",
                })}
                <h3 className="mt-10 text-lg font-normal tracking-[-0.03em]">
                  {title as string}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/42">
                  {body as string}
                </p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Advisor() {
  return (
    <section id="blog" className="bg-black py-24 text-white lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-8">
          <h2 className="max-w-3xl text-4xl font-normal leading-[1.02] tracking-[-0.05em] sm:text-6xl">
            See how investors use Aureon daily
          </h2>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <Reveal className="h-full">
            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] lg:h-full lg:min-h-[520px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${ADVISOR_IMAGE})` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.2),rgba(0,0,0,.78))]" />
            </div>
          </Reveal>
          <Reveal delay={0.12} className="h-full">
            <blockquote className="flex h-full min-h-[420px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-xl leading-relaxed tracking-[-0.03em] text-white/72 lg:min-h-[520px] lg:p-10">
              <span>
                Aureon helped me rebalance my portfolio in a week instead of a
                month. The AI explains the rationale, the risk, and the exact
                trade-offs before I act.
              </span>
              <footer className="mt-8 text-sm text-white/38">
                Maya Rodriguez, private investor
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

type BillingCycle = "Monthly" | "Yearly" | "Lifetime";

const plans = [
  {
    name: "Free",
    prices: { Monthly: "$0", Yearly: "$0", Lifetime: "$0" },
    cadence: "",
    desc: "Explore AI insights",
    features: [
      "Connect one portfolio",
      "Weekly market overview",
      "Basic risk profile",
    ],
  },
  {
    name: "Pro",
    prices: { Monthly: "$29", Yearly: "$279", Lifetime: "$699" },
    cadence: { Monthly: "/mo", Yearly: "/yr", Lifetime: " once" },
    desc: "For active investors",
    features: [
      "Unlimited portfolios",
      "Real-time AI advisor",
      "Scenario planning",
      "Priority alerts",
    ],
  },
  {
    name: "Business",
    prices: { Monthly: "$99", Yearly: "$949", Lifetime: "$2,499" },
    cadence: { Monthly: "/mo", Yearly: "/yr", Lifetime: " once" },
    desc: "For teams and advisors",
    features: [
      "Client workspaces",
      "Shared reports",
      "Compliance exports",
      "Dedicated support",
    ],
  },
];

function Pricing() {
  const [billing, setBilling] = React.useState<BillingCycle>("Monthly");
  return (
    <section id="pricing" className="bg-black py-24 text-white lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mb-8">
          <h2 className="text-4xl font-normal leading-[1.02] tracking-[-0.05em] sm:text-6xl">
            Plans that scale{" "}
            <span className="block text-white/45">with your portfolio</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08} className="mb-9 flex gap-1">
          {(["Monthly", "Yearly", "Lifetime"] as BillingCycle[]).map((item) => (
            <button
              key={item}
              onClick={() => setBilling(item)}
              className={`rounded-full border px-4 py-2 text-xs transition ${billing === item ? "border-white/30 bg-white text-black" : "border-white/10 text-white/45 hover:text-white"}`}
            >
              {item}
            </button>
          ))}
        </Reveal>
        <div className="grid gap-3 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <motion.article
                whileHover={{ y: -7 }}
                className={`border p-7 ${i === 1 ? "border-white/25 bg-white/[0.07]" : "border-white/10 bg-white/[0.03]"}`}
              >
                <p className="text-sm text-white/45">{plan.name}</p>
                <div className="mt-4 flex h-14 items-baseline gap-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${plan.name}-${billing}`}
                      initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="text-5xl font-normal tracking-[-0.06em]"
                    >
                      {plan.prices[billing]}
                    </motion.span>
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${plan.name}-cadence-${billing}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm tracking-normal text-white/35"
                    >
                      {typeof plan.cadence === "string"
                        ? plan.cadence
                        : plan.cadence[billing]}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <p className="mt-3 text-sm text-white/42">{plan.desc}</p>
                <a
                  href="#contact"
                  className={`mt-7 inline-flex w-full justify-center rounded-full px-4 py-3 text-xs font-semibold ${i === 1 ? "bg-white text-black" : "border border-white/15 text-white/75"}`}
                >
                  Get Started
                </a>
                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-white/48"
                    >
                      <Check className="size-4 text-white/70" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = React.useState(0);
  const faqs = [
    [
      "What is Aureon?",
      "Aureon is an AI investment workspace that analyzes your connected portfolio and turns market data into clear recommendations.",
    ],
    [
      "How does Aureon access my accounts?",
      "Connections are read-only and encrypted. Aureon can analyze balances and holdings, but it cannot move money for you.",
    ],
    [
      "Can Aureon replace a financial advisor?",
      "No. It is decision support software that helps you understand scenarios, risks, and opportunities before you act.",
    ],
    [
      "What data sources do you use?",
      "Portfolio data, market feeds, asset fundamentals, and your stated goals are combined to generate context-aware insight.",
    ],
  ];
  return (
    <section className="bg-black py-24 text-white lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <h2 className="text-4xl font-normal leading-[1.02] tracking-[-0.05em] sm:text-6xl">
            Your questions,{" "}
            <span className="block text-white/45">clearly answered</span>
          </h2>
        </Reveal>
        <div className="space-y-3">
          {faqs.map(([q, a], i) => (
            <Reveal key={q} delay={i * 0.05}>
              <div className="border border-white/10 bg-white/[0.03]">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm text-white/75"
                >
                  {q}
                  <ChevronDown
                    className={`size-4 transition ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-white/42">
                        {a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const INVESTOR_AVATARS = [
  "photo-1494790108377-be9c29b29330",
  "photo-1507003211169-0a1dd7228f2d",
  "photo-1560250097-0b93528c311a",
  "photo-1438761681033-6461ffad8d80",
  "photo-1500648767791-00dcc994a43e",
  "photo-1544005313-94ddf0286df2",
  "photo-1519345182560-3f2917c472ef",
  "photo-1508214751196-bcfd4ca60f91",
  "photo-1527980965255-d3b416303d12",
  "photo-1487412720507-e7ab37603c6f",
];

export function InvestorArc() {
  const radius = 520;
  const center = 590;

  // Bigger than visible arc so images can enter/exit smoothly.
  const startAngle = 190;
  const endAngle = 350;

  const slotCount = INVESTOR_AVATARS.length;
  const angleGap = (endAngle - startAngle) / (slotCount - 1);

  // 20 = speed of the avatar movement.
  const cycleDuration = 20;

  const [phase, setPhase] = useState(0);

  useAnimationFrame((time) => {
    const progress = ((time / 1000) % cycleDuration) / cycleDuration;

    // Moves one full loop across all slots.
    setPhase(progress * slotCount);
  });

  const avatarPositions = useMemo(() => {
    return INVESTOR_AVATARS.map((id, index) => {
      // This creates continuous slot movement.
      // When one image exits from one side, it wraps back from the other side.
      const slot = (index + phase) % slotCount;
      const angle = startAngle + slot * angleGap;

      const x = center + radius * Math.cos((angle * Math.PI) / 180);
      const y = center + radius * Math.sin((angle * Math.PI) / 180);

      const rotation = angle - 270;

      const leftFade = Math.min(Math.max((angle - startAngle) / 18, 0), 1);
      const rightFade = Math.min(Math.max((endAngle - angle) / 18, 0), 1);
      const exitFade = Math.min(leftFade, rightFade);
      const opacity = 0.18 + exitFade * 0.82;
      const blur = (1 - exitFade) * 5;

      return {
        id,
        x,
        y,
        rotation,
        opacity,
        blur,
      };
    });
  }, [phase, slotCount, angleGap]);

  return (
    <footer
      id="contact"
      className="relative overflow-x-clip bg-black pt-24 text-white"
    >
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <div className="relative mx-auto h-[650px] max-w-7xl overflow-x-visible overflow-y-clip">
          {/* Outer rotating circle only */}
          <motion.div
            className="absolute left-1/2 top-[680px] h-295 w-295 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025]"
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Avatar arc — not full 360 rotation anymore */}
          <div className="absolute left-1/2 top-[680px] h-295 w-295 -translate-x-1/2 -translate-y-1/2">
            {avatarPositions.map((avatar) => {
              return (
                <motion.div
                  key={avatar.id}
                  className="absolute h-36 w-31 overflow-hidden rounded-[18px] border border-white/10 bg-black shadow-2xl shadow-black/70"
                  style={{
                    left: avatar.x,
                    top: avatar.y,
                    marginLeft: -62,
                    marginTop: -72,
                    rotate: avatar.rotation,
                    opacity: avatar.opacity,
                    filter: `blur(${avatar.blur}px)`,
                  }}
                  whileHover={{
                    y: -18,
                    scale: 1.06,
                    zIndex: 20,
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                >
                  <div
                    className="absolute inset-[-8%] bg-cover bg-top"
                    style={{
                      backgroundImage: `url(https://images.unsplash.com/${avatar.id}?auto=format&fit=crop&w=360&q=85)`,
                    }}
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(0,0,0,.28))]" />
                </motion.div>
              );
            })}
          </div>

          {/* Center CTA content */}
          <div className="absolute left-1/2 top-[245px] z-10 w-full max-w-2xl -translate-x-1/2 px-4 text-center">
            <h2 className="text-6xl font-normal leading-none tracking-[-0.065em] sm:text-7xl">
              Join 100,000+ investors
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-3xl leading-tight tracking-[-0.04em] text-white/45">
              Connect your portfolio and unlock AI-powered insights in minutes.
              No credit card required.
            </p>

            <a
              href="#pricing"
              className="mt-11 inline-flex rounded-full border border-white/15 bg-white/[0.06] px-8 py-4 text-2xl font-semibold text-white transition hover:bg-white hover:text-black"
            >
              Start free trial
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-20 border-t border-white/10 bg-[#141414] py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-start md:justify-between">
          <div>
            <AureonMark small />

            <p className="mt-6 max-w-sm text-lg leading-snug text-white/38">
              Aureon helps individual investors make smarter decisions with
              AI-powered portfolio intelligence.
            </p>

            <div className="mt-6 flex gap-4 text-white/45">
              <span className="grid size-7 place-items-center rounded border border-white/20 text-xs">
                in
              </span>

              <span className="grid size-7 place-items-center rounded border border-white/20 text-xs">
                X
              </span>

              <span className="grid size-7 place-items-center rounded border border-white/20 text-xs">
                ▶
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-20 text-left text-lg text-white/38">
            <div className="space-y-4">
              <p className="text-white">Pages</p>
              <p>Home</p>
              <p>Pricing</p>
              <p>Journal</p>
            </div>

            <div className="space-y-4">
              <p className="text-white">Navigation</p>
              <p>Features</p>
              <p>How It Works</p>
              <p>Use cases</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function StartupLandingPage() {
  useLenis();

  return (
    <main className="min-h-screen bg-black font-sans text-white [color-scheme:dark] selection:bg-orange-500/30 selection:text-white">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Process />
      <InvestorChart />
      <Benefits />
      <Advisor />
      <Pricing />
      <FAQ />
      <InvestorArc />
    </main>
  );
}
