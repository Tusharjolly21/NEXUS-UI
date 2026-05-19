"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
} from "framer-motion";

// ── constants ─────────────────────────────────────────────────────────────────
const BG = "#f5f0eb";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const BRAND = "Lumis";

// ── bootstrap: font + lenis ───────────────────────────────────────────────────
function useSetup() {
  React.useEffect(() => {
    if (!document.querySelector("[data-lumis-font]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap";
      link.setAttribute("data-lumis-font", "");
      document.head.appendChild(link);
    }
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let raf = 0;
    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }) as { raf: (t: number) => void; destroy: () => void };
      const tick = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);
}

// ══════════════════════════════════════════════════════════════════════════════
// INTRO OVERLAY — runs once per session
// ══════════════════════════════════════════════════════════════════════════════
function IntroOverlay({ onDone }: { onDone: () => void }) {
  // Drive each phase with an explicit timer so nothing is ambiguous
  const [sliding, setSliding] = React.useState(false);

  React.useEffect(() => {
    // After logo has faded in and held (~4 s) → slide the cover up
    const t = setTimeout(() => setSliding(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    // Dark full-screen cover — slides up at 1.4 s
    <motion.div
      className="fixed inset-0 z-[100] bg-[#1a1a1a]"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      animate={{ y: sliding ? "-100%" : "0%" }}
      transition={
        sliding ? { duration: 0.9, ease: [0.76, 0, 0.24, 1] } : { duration: 0 }
      }
      onAnimationComplete={() => {
        if (sliding) onDone();
      }}
    >
      {/*
        Logo sequence (total: 5 s)
        0–0.6 s    → fades + unblurs in  (opacity 0→1, blur 20→0)
        0.6–4.4 s  → holds sharp          (~3.8 s visible)
        4.4–5 s    → fades out            (opacity 1→0, blur 0→10)
      */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)" }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.85, 1, 1, 1],
          filter: ["blur(20px)", "blur(0px)", "blur(0px)", "blur(10px)"],
        }}
        transition={{
          duration: 2.5,
          times: [0, 0.16, 0.8, 1],
          ease: "easeInOut",
        }}
        style={{
          fontFamily: SERIF,
          fontSize: 44,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.03em",
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        {BRAND}
      </motion.div>
    </motion.div>
  );
}

// ── shared: count-up stat ─────────────────────────────────────────────────────
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const duration = 2000;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── shared: pill badge ────────────────────────────────────────────────────────
function Pill({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return dark ? (
    <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  ) : (
    <span className="inline-block rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500">
      {children}
    </span>
  );
}

// ── shared: scroll fade-up ────────────────────────────────────────────────────
function FadeUp({
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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NAVBAR — desktop links + mobile hamburger
// ══════════════════════════════════════════════════════════════════════════════
function Navbar() {
  const [open, setOpen] = React.useState(false);
  const NAV_LINKS = ["About", "Case Studies", "News"];

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5"
        style={{ background: BG }}
      >
        {/* desktop left links */}
        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              {item}
            </a>
          ))}
        </div>

        {/* mobile: hamburger (left) */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
            transition={{ duration: 0.25 }}
            className="block h-0.5 w-5 bg-gray-900 origin-center"
          />
          <motion.span
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="block h-0.5 w-5 bg-gray-900"
          />
          <motion.span
            animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
            transition={{ duration: 0.25 }}
            className="block h-0.5 w-5 bg-gray-900 origin-center"
          />
        </button>

        {/* center logo */}
        <span
          className="absolute left-1/2 -translate-x-1/2 text-[20px] text-gray-900"
          style={{ fontFamily: SERIF }}
        >
          {BRAND}
        </span>

        {/* right CTA */}
        <a
          href="#contact"
          className="rounded-full bg-[#1a1a1a] px-4 py-2 text-xs text-white transition hover:bg-gray-800 sm:px-5 sm:text-sm"
        >
          Book a free call
        </a>
      </motion.nav>

      {/* mobile menu drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="fixed inset-x-0 top-[60px] z-40 border-b border-gray-200 px-6 pb-6 pt-4 shadow-sm md:hidden"
            style={{ background: BG }}
          >
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  onClick={() => setOpen(false)}
                  className="text-base text-gray-700 hover:text-gray-900"
                >
                  {item}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 w-full rounded-full bg-[#1a1a1a] py-3 text-center text-sm text-white"
              >
                Book a free call
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HERO
// ══════════════════════════════════════════════════════════════════════════════
const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-screen flex-col items-center justify-center px-4 pb-12 pt-28 sm:px-6"
      style={{ background: BG }}
    >
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-4xl flex-col items-center text-center"
      >
        {/* star rating */}
        <motion.div
          variants={heroItem}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="size-4 text-amber-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            Trusted by 500+ businesses
          </span>
        </motion.div>

        {/* h1 */}
        <motion.h1
          variants={heroItem}
          className="mt-7 max-w-3xl font-bold leading-tight tracking-tight text-gray-900"
          style={{ fontFamily: SERIF, fontSize: "clamp(38px, 7vw, 72px)" }}
        >
          From AI confusion to <em>clarity.</em>
        </motion.h1>

        {/* subtext */}
        <motion.p
          variants={heroItem}
          className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-gray-500"
        >
          We identify where AI saves time and money in your business, then build
          and implement the systems that make it happen.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={heroItem}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#contact"
            className="rounded-full bg-[#1a1a1a] px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Book a free call
          </a>
          <a
            href="#how-we-work"
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            How we work
          </a>
        </motion.div>

        {/* hero image card — gradient blob + dot-grid overlay */}
        <motion.div
          variants={heroItem}
          transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
          className="relative mx-auto mt-12 w-full max-w-3xl overflow-hidden rounded-2xl"
          style={{ aspectRatio: "16/7" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, #f97316 0%, #ef4444 25%, #3b82f6 60%, #06b6d4 100%)",
            }}
          />
          {/* white dot-grid — sits on top, image shows through gaps */}
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.9) 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGO MARQUEE
// ══════════════════════════════════════════════════════════════════════════════
const BRANDS: { name: string; style: React.CSSProperties }[] = [
  {
    name: "amsterdam",
    style: { fontFamily: SERIF, fontSize: 22, fontWeight: 400 },
  },
  { name: "★ Hamilton", style: { fontFamily: "sans-serif", fontSize: 18 } },
  {
    name: "CALIFORNIA",
    style: {
      fontFamily: "sans-serif",
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: "0.06em",
    },
  },
  {
    name: "venice.",
    style: { fontFamily: SERIF, fontSize: 22, fontWeight: 300 },
  },
  {
    name: "Solaris",
    style: { fontFamily: SERIF, fontSize: 20, fontStyle: "italic" },
  },
];

function LogoMarquee() {
  const controls = useAnimation();

  const start = React.useCallback(() => {
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        duration: 35,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });
  }, [controls]);

  React.useEffect(() => {
    start();
  }, [start]);

  return (
    <section className="py-10 sm:py-12" style={{ background: BG }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-4 overflow-hidden sm:gap-6">
          <span className="hidden shrink-0 text-xs text-gray-400 sm:block">
            Brands we've helped implement AI:
          </span>
          <div
            className="relative flex-1 overflow-hidden"
            onMouseEnter={() => controls.stop()}
            onMouseLeave={start}
          >
            <motion.div
              animate={controls}
              className="flex items-center gap-10 whitespace-nowrap sm:gap-12"
            >
              {[...BRANDS, ...BRANDS].map((b, i) => (
                <span key={i} className="text-gray-600" style={b.style}>
                  {b.name}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WHO WE ARE + STATS + JOB BANNER
// ══════════════════════════════════════════════════════════════════════════════
const STATS = [
  { target: 1500, suffix: "+", label: "Hours saved for clients monthly" },
  { target: 35, suffix: "%", label: "Average reduction in manual work" },
  { target: 45, suffix: " days", label: "Average time to measurable ROI" },
];

function WhoWeAre() {
  return (
    <section id="about" className="py-20 sm:py-24" style={{ background: BG }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* two-col: sticky left heading / right body */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <FadeUp>
              <Pill>Who we are</Pill>
            </FadeUp>
            <FadeUp delay={0.06}>
              <h2
                className="mt-5 font-bold leading-tight text-gray-900"
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(34px, 4.5vw, 52px)",
                }}
              >
                The AI agency built for <em>you.</em>
              </h2>
            </FadeUp>
          </div>
          <FadeUp delay={0.1} className="lg:pt-16">
            <p className="max-w-sm text-sm leading-relaxed text-gray-500">
              We're a focused team of AI engineers and operators who've spent
              years inside real businesses — not just building technology, but
              understanding where it actually creates value. We don't sell
              trends. We solve problems.
            </p>
          </FadeUp>
        </div>

        {/* stats card */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative mt-14 overflow-hidden rounded-2xl"
          style={{ minHeight: 260 }}
        >
          <img
            src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:p-10">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex-1 rounded-xl p-5 sm:p-6"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p
                  className="font-bold leading-none text-white"
                  style={{
                    fontFamily: SERIF,
                    fontSize: "clamp(36px, 5vw, 64px)",
                  }}
                >
                  <CountUp target={s.target} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-xs leading-snug text-white/70 sm:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* job banner */}
        <FadeUp delay={0.2} className="mt-5">
          <div className="flex flex-col gap-4 rounded-2xl bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-gray-900">
                Want to be part of the team?
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                3 vacancies available
              </span>
            </div>
            <a
              href="#careers"
              className="shrink-0 rounded-full bg-[#1a1a1a] px-5 py-2 text-sm text-white transition hover:bg-gray-800"
            >
              Apply now
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOW WE WORK — interactive tabbed steps with image crossfade
// ══════════════════════════════════════════════════════════════════════════════
const HOW_STEPS = [
  {
    num: "01",
    name: "Discover",
    title: "Discovery & Assessment",
    desc: "We analyze your workflows and identify where automation creates the most value.",
    img: "https://images.unsplash.com/photo-1606787364406-a3cdf06c6d0c?w=800&q=80",
  },
  {
    num: "02",
    name: "Build",
    title: "Build",
    desc: "We design and build the exact systems your business needs — nothing extra.",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  },
  {
    num: "03",
    name: "Deploy",
    title: "Deploy",
    desc: "We implement everything and train your team so it works from day one.",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  },
  {
    num: "04",
    name: "Optimize",
    title: "Optimize",
    desc: "We monitor and improve your systems to keep delivering results over time.",
    img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
  },
];

function HowWeWork() {
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const step = HOW_STEPS[active];

  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setActive((p) => (p + 1) % HOW_STEPS.length),
      4000,
    );
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      id="how-we-work"
      className="py-20 sm:py-24"
      style={{ background: BG }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center"
        >
          <h2
            className="mx-auto max-w-2xl font-bold leading-tight text-gray-900"
            style={{ fontFamily: SERIF, fontSize: "clamp(28px, 5vw, 52px)" }}
          >
            We handle <span className="text-gray-400">everything</span> so you
            don't have to.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-gray-400">
            From first conversation to live deployment — we take care of every
            technical detail so you can focus on running your business.
          </p>
        </motion.div>

        {/* two-col */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[0.45fr_0.55fr] lg:items-start">
          {/* left: step list — large serif names */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {HOW_STEPS.map((s, i) => (
              <div
                key={s.name}
                onClick={() => setActive(i)}
                className="mb-1 cursor-pointer rounded-2xl transition-all duration-300"
                style={{
                  background:
                    i === active ? "rgba(255,255,255,0.85)" : "transparent",
                  padding: i === active ? "14px 20px" : "8px 20px",
                }}
              >
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize:
                      i === active
                        ? "clamp(32px,3.8vw,56px)"
                        : "clamp(24px,3vw,44px)",
                    fontWeight: 700,
                    color: i === active ? "#1a1a1a" : "#d1d5db",
                    lineHeight: 1.1,
                    transition: "all 0.4s ease",
                  }}
                >
                  <sup
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: 11,
                      fontWeight: 400,
                      color: "#9ca3af",
                      verticalAlign: "super",
                      marginRight: 4,
                    }}
                  >
                    {s.num}
                  </sup>
                  {s.name}
                </p>
              </div>
            ))}
          </motion.div>

          {/* right: image + content card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
            className="overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <div className="relative h-[220px] overflow-hidden rounded-t-2xl sm:h-[280px]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={step.img}
                  src={step.img}
                  alt={step.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="p-5 sm:p-6"
              >
                <h3 className="text-[17px] font-bold text-gray-900 sm:text-[18px]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {step.desc}
                </p>
                <a
                  href="#contact"
                  className="mt-4 inline-block text-sm text-gray-700 hover:text-gray-900"
                >
                  ↗ Book a free call
                </a>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TESTIMONIAL
// ══════════════════════════════════════════════════════════════════════════════
function Testimonial() {
  return (
    <section className="py-20 sm:py-24" style={{ background: BG }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: EASE }}
          className="relative overflow-hidden rounded-2xl"
          style={{ minHeight: 340 }}
        >
          <img
            src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 p-8 sm:p-10 md:p-14">
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl"
            >
              <p
                className="font-bold leading-snug text-white"
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(20px, 3.5vw, 36px)",
                }}
              >
                "They didn't overwhelm us with options. They just built exactly
                what we needed. We're saving 15 hours a week and saw ROI in
                under two months."
              </p>
              <footer className="mt-5 sm:mt-6">
                <span className="block text-[15px] font-bold text-white sm:text-[16px]">
                  Sarah Chen
                </span>
                <span className="text-sm text-white/60">
                  Founder at BrightPath Consulting
                </span>
              </footer>
            </motion.blockquote>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPARISON — scrolling tag marquees
// ══════════════════════════════════════════════════════════════════════════════
function TagMarquee({
  tags,
  duration,
  tagClass,
}: {
  tags: string[];
  duration: number;
  tagClass: string;
}) {
  return (
    <div className="absolute inset-x-0 top-5 overflow-hidden sm:top-6">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
        className="flex items-center gap-3 whitespace-nowrap px-4"
      >
        {[...tags, ...tags].map((tag, i) => (
          <span
            key={i}
            className={`inline-block rounded-full px-3 py-1.5 text-xs backdrop-blur-sm ${tagClass}`}
          >
            {tag}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Comparison() {
  return (
    <section className="py-20 sm:py-24" style={{ background: BG }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* card 1 — other agencies */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative min-h-[320px] overflow-hidden rounded-2xl sm:min-h-[360px]"
          >
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <TagMarquee
              tags={[
                "Sell what's trendy",
                "Unclear timelines",
                "Hidden costs",
                "Slow to deliver",
              ]}
              duration={20}
              tagClass="bg-black/40 text-white"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 sm:p-8">
              <h3
                className="font-bold text-white"
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(26px, 4vw, 40px)",
                }}
              >
                Other agencies
              </h3>
              <p className="mt-2 max-w-xs text-sm text-white/70">
                Other agencies overwhelm you with buzzwords, take months to
                deliver, and leave you with tools you can't use.
              </p>
            </div>
          </motion.div>

          {/* card 2 — Lumis */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
            className="relative min-h-[320px] overflow-hidden rounded-2xl sm:min-h-[360px]"
          >
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25" />
            <TagMarquee
              tags={[
                "Sell what matters",
                "Done with you",
                "Transparent process",
                "Real results",
              ]}
              duration={17}
              tagClass="bg-white/20 text-white"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 sm:p-8">
              <h3
                className="font-bold"
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(26px, 4vw, 40px)",
                  color: "#ff6b35",
                }}
              >
                {BRAND}
              </h3>
              <p className="mt-2 max-w-xs text-sm text-white/80">
                At {BRAND}, we use simple language, deliver results in weeks,
                and build systems that work from day one.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CASE STUDIES
// ══════════════════════════════════════════════════════════════════════════════
const CASES = [
  {
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    company: "BrightPath Consulting",
    tag: "Workflow Automation",
    result: "15 hours saved weekly with custom AI workflow automation",
    full: true,
  },
  {
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    company: "Nova Digital",
    tag: "Client Intake",
    result: "40% faster client onboarding after deploying intake automation",
    full: false,
  },
  {
    img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80",
    company: "Meridian Group",
    tag: "Process Automation",
    result: "ROI achieved in 38 days with targeted process automation",
    full: false,
  },
];

function CaseStudies() {
  return (
    <section
      id="case-studies"
      className="py-20 sm:py-24"
      style={{ background: BG }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeUp>
          <Pill>Case Studies</Pill>
        </FadeUp>
        <FadeUp delay={0.06}>
          <h2
            className="mt-5 font-bold leading-tight text-gray-900"
            style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4.5vw, 48px)" }}
          >
            Real businesses, <em>real results.</em>
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="mt-3 text-sm text-gray-500">
            We measure success by the impact we create for our clients.
          </p>
        </FadeUp>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {CASES.map((c, i) => (
            <motion.div
              key={c.company}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: EASE }}
              className={`relative min-h-[280px] overflow-hidden rounded-2xl sm:min-h-[320px] ${c.full ? "sm:col-span-2" : ""}`}
            >
              <img
                src={c.img}
                alt={c.company}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute left-5 top-5 sm:left-6 sm:top-6">
                <span className="rounded-full bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                  {c.tag}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-sm text-white/60">{c.company}</p>
                <h3
                  className="mt-1 font-bold text-white"
                  style={{
                    fontFamily: SERIF,
                    fontSize: "clamp(18px, 2.8vw, 28px)",
                  }}
                >
                  {c.result}
                </h3>
                <a
                  href="#"
                  className="mt-3 inline-block text-sm text-white/70 hover:text-white"
                >
                  ↗ Read case study
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MEET THE TEAM
// ══════════════════════════════════════════════════════════════════════════════
const TEAM = [
  {
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    name: "Sarah Chen",
    role: "Founder & CEO",
  },
  {
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    name: "Marcus Reid",
    role: "Head of AI Systems",
  },
  {
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80",
    name: "Priya Nair",
    role: "Client Success Lead",
  },
  {
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80",
    name: "Tom Baxter",
    role: "Automation Engineer",
  },
];

function MeetTheTeam() {
  return (
    <section className="py-20 sm:py-24" style={{ background: BG }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <FadeUp>
            <Pill>Our team</Pill>
          </FadeUp>
          <FadeUp delay={0.07}>
            <h2
              className="mx-auto mt-5 max-w-xl font-bold text-gray-900"
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(26px, 4.5vw, 48px)",
              }}
            >
              The people behind the work.
            </h2>
          </FadeUp>
          <FadeUp delay={0.12}>
            <p className="mx-auto mt-3 max-w-md text-sm text-gray-400">
              A small, focused team that moves fast and cares deeply about
              getting you results.
            </p>
          </FadeUp>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={m.img}
                alt={m.name}
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-5">
                <p className="text-[14px] font-semibold text-white sm:text-[16px]">
                  {m.name}
                </p>
                <p className="text-xs text-white/60 sm:text-sm">{m.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FAQ
// ══════════════════════════════════════════════════════════════════════════════
const FAQS = [
  {
    q: "Do I need technical knowledge to work with you?",
    a: "Not at all. We handle everything technical — you just tell us your goals and we build the systems that get you there.",
  },
  {
    q: "How long does it take to see results?",
    a: "Most clients see measurable results within the first 4–6 weeks of deployment.",
  },
  {
    q: "What if the automation doesn't work for my business?",
    a: "We do a full discovery before we build anything. If it's not a fit, we'll tell you upfront.",
  },
  {
    q: "How much does it cost?",
    a: "Pricing depends on scope. Book a free call and we'll give you a clear number within 24 hours.",
  },
];

const faqParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const faqChild2 = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

function FAQ() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  return (
    <section id="faq" className="py-20 sm:py-24" style={{ background: BG }}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <motion.div
          variants={faqParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div variants={faqChild2}>
            <Pill>FAQ</Pill>
          </motion.div>
          <motion.h2
            variants={faqChild2}
            className="mt-5 font-bold text-gray-900"
            style={{ fontFamily: SERIF, fontSize: "clamp(28px, 6vw, 52px)" }}
          >
            Your questions <em>answered.</em>
          </motion.h2>
          <motion.p
            variants={faqChild2}
            className="mx-auto mt-4 max-w-md text-sm text-gray-400"
          >
            Everything you need to know about working with us. Still have
            questions? Book a free call and we'll walk you through it.
          </motion.p>
        </motion.div>

        <div className="mt-10 sm:mt-12">
          {FAQS.map((item, i) => (
            <motion.div
              key={item.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: EASE }}
              className="border-b border-gray-200"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className="pr-4 text-base font-medium text-[#1a1a1a]">
                  {item.q}
                </span>
                <motion.span
                  animate={{ rotate: openIdx === i ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 text-xl text-gray-400"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="pb-4 pt-2 text-sm leading-relaxed text-gray-500">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CTA + CONTACT FORM
// ══════════════════════════════════════════════════════════════════════════════
function ContactForm() {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    company: "",
    teamSize: "",
    challenge: "",
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#1a1a1a]";

  return (
    <section id="contact" className="py-20 sm:py-24" style={{ background: BG }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-[#1a1a1a] p-8 sm:p-12 md:p-16">
          <img
            src="https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=1200&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            {/* left */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: EASE }}
            >
              <Pill dark>Get started</Pill>
              <h2
                className="mt-6 font-bold leading-tight text-white"
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(26px, 4.5vw, 48px)",
                }}
              >
                Turn confusion into clarity today.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
                Book a free call and we'll map out exactly how AI can save your
                team time and money — no commitment, no jargon.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Free 30-minute strategy call",
                  "No technical knowledge required",
                  "Clear plan within 24 hours",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/70"
                  >
                    <span className="text-green-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* right: form */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
            >
              <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex min-h-[280px] flex-col items-center justify-center text-center sm:min-h-[320px]"
                  >
                    <span className="text-5xl text-green-500">✓</span>
                    <p className="mt-4 text-[17px] font-semibold text-gray-900 sm:text-[18px]">
                      We'll be in touch within 24 hours
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Thank you for reaching out. We'll review your details and
                      get back to you soon.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className={input}
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Work Email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className={input}
                    />
                    <input
                      name="company"
                      type="text"
                      placeholder="Company Name"
                      value={form.company}
                      onChange={handleChange}
                      className={input}
                    />
                    <select
                      name="teamSize"
                      value={form.teamSize}
                      onChange={handleChange}
                      className={`${input} text-gray-500`}
                    >
                      <option value="" disabled>
                        Team Size
                      </option>
                      <option value="1-5">1–5</option>
                      <option value="6-20">6–20</option>
                      <option value="21-50">21–50</option>
                      <option value="50+">50+</option>
                    </select>
                    <textarea
                      name="challenge"
                      rows={4}
                      placeholder="What's taking up the most time in your business right now?"
                      value={form.challenge}
                      onChange={handleChange}
                      className={input}
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-2 w-full rounded-xl bg-[#1a1a1a] py-3.5 text-sm font-semibold text-white"
                    >
                      Book my free call →
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FOOTER
// ══════════════════════════════════════════════════════════════════════════════
const FOOTER_LINKS = {
  Company: ["About", "Case Studies", "News"],
  Services: ["Discovery", "Build", "Deploy", "Optimize"],
  Connect: ["Book a call", "LinkedIn", "Twitter"],
};

function Footer() {
  return (
    <footer className="bg-[#1a1a1a] px-6 pb-8 pt-14 text-white sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:gap-12">
          <div>
            <span
              className="text-[22px] text-white sm:text-[24px]"
              style={{ fontFamily: SERIF }}
            >
              {BRAND}
            </span>
            <p className="mt-2 text-sm text-white/40">
              The AI agency built for clarity,
              <br />
              speed, and real results.
            </p>
          </div>
          <div className="flex flex-wrap gap-10 sm:gap-16">
            {Object.entries(FOOTER_LINKS).map(([group, items]) => (
              <div key={group}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
                  {group}
                </p>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-white/60 transition hover:text-white"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-white/30">
            © 2025 {BRAND}. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-white/30">
            <a href="#" className="hover:text-white/60">
              Privacy Policy
            </a>
            <span>·</span>
            <a href="#" className="hover:text-white/60">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE ROOT — intro animation orchestration
// ══════════════════════════════════════════════════════════════════════════════
export function ClauraAgencyPage() {
  useSetup();

  const [showOverlay, setShowOverlay] = React.useState(true);
  // Content becomes visible at 1.6 s into the sequence
  const [contentReady, setContentReady] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setContentReady(true), 2700);
    return () => clearTimeout(t);
  }, []);

  const handleOverlayDone = () => setShowOverlay(false);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden font-sans"
      style={{ background: BG, color: "#111" }}
    >
      {/* dark cover — only mounted on first visit */}
      {showOverlay && <IntroOverlay onDone={handleOverlayDone} />}

      {/* actual website — fades in at 1.6 s */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: contentReady ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ pointerEvents: contentReady ? "auto" : "none" }}
      >
        <Navbar />
        <Hero />
        <LogoMarquee />
        <WhoWeAre />
        <HowWeWork />
        <Testimonial />
        <Comparison />
        <CaseStudies />
        <MeetTheTeam />
        <FAQ />
        <ContactForm />
        <Footer />
      </motion.div>
    </div>
  );
}
