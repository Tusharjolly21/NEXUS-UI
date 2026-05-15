"use client";

import * as React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";

// ── Lenis smooth scroll ─────────────────────────────────────────────────────
function useLenis() {
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenis: any = null;
    let rafId: number;

    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      });
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      if (lenis) lenis.destroy();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
}

// ── Scroll reveal wrapper ───────────────────────────────────────────────────
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-6% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Animated big number counter ─────────────────────────────────────────────
function Counter({
  to,
  suffix = "",
  smallSuffix,
}: {
  to: number | string;
  suffix?: string;
  smallSuffix?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [value, setValue] = React.useState(0);
  const numericTo = typeof to === "number" ? to : parseFloat(to);

  React.useEffect(() => {
    if (!isInView || typeof to === "string") return;
    let start = 0;
    const duration = 1600;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(e * numericTo * 10) / 10);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, numericTo, to]);

  const display = typeof to === "string" ? to : value % 1 ? value.toFixed(1) : value;

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
      {smallSuffix && (
        <span className="text-zinc-400" style={{ fontSize: "0.6em", verticalAlign: "top" }}>
          {smallSuffix}
        </span>
      )}
    </span>
  );
}

// ── FAQ/Spec Accordion item ─────────────────────────────────────────────────
function AccordionRow({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="border-t border-zinc-200">
      <button
        type="button"
        className="flex w-full items-center justify-between py-[22px] text-left text-[17px] font-medium tracking-tight text-zinc-900 transition hover:text-zinc-600"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {summary}
        <span
          className={cn(
            "flex size-[22px] shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-all duration-300",
            open && "rotate-45 border-zinc-900 bg-zinc-900 text-white",
          )}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-zinc-600">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Scramble text effect ────────────────────────────────────────────────────
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&";

function ScrambleText({
  text,
  active,
  className,
  style,
}: {
  text: string;
  active: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = React.useState(text);
  const frameRef = React.useRef<number>(0);
  const iterRef = React.useRef(0);

  React.useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }

    iterRef.current = 0;
    const totalFrames = text.length * 5; // frames to fully reveal

    const animate = () => {
      iterRef.current += 1;
      const revealed = Math.floor(iterRef.current / 5);

      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealed) return char;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join(""),
      );

      if (iterRef.current < totalFrames + 8) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [active, text]);

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
}

// ── Scroll story (walkthrough) ──────────────────────────────────────────────
const STORY_IMAGES = [
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=1400&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=85&auto=format&fit=crop",
];

const STORY_STEPS = [
  {
    num: "01 / Wake",
    headline: "It's awake before you've sat down.",
    body: "Open the lid and Nova One is already where you left it — no boot, no logo, no waiting for the cursor to find itself.",
  },
  {
    num: "02 / Work",
    headline: "A keyboard that listens, quietly.",
    body: "Each switch was tuned by hand to the same 38g actuation. Type for an hour without noticing — that's the goal.",
  },
  {
    num: "03 / Night",
    headline: "The display reads the room.",
    body: "Dim the room, and Nova One follows — colour temperature, contrast, and refresh rate all shift to match where the light is going.",
  },
  {
    num: "04 / Carry",
    headline: "Lighter than the bag it lives in.",
    body: "At 0.92 kg, you can forget it's there until you need it. Engineered around the daily reality of leaving the studio.",
  },
];

function StoryStep({
  step,
  index,
  onActive,
  isActive,
}: {
  step: (typeof STORY_STEPS)[0];
  index: number;
  onActive: (i: number) => void;
  isActive: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-35% 0px -35% 0px" });
  const cb = React.useCallback(() => onActive(index), [index, onActive]);

  React.useEffect(() => {
    if (isInView) cb();
  }, [isInView, cb]);

  return (
    <div ref={ref} className="flex min-h-[70vh] items-center py-[5vh]">
      <div>
        <motion.p
          animate={{ opacity: isActive ? 1 : 0.35 }}
          transition={{ duration: 0.4 }}
          className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em]"
          style={{ color: "oklch(58% 0.14 252)" }}
        >
          {step.num}
        </motion.p>
        <h3
          className="font-medium leading-[1.05] tracking-tight text-zinc-900"
          style={{ fontSize: "clamp(32px, 3.5vw, 52px)" }}
        >
          <ScrambleText
            text={step.headline}
            active={isActive}
          />
        </h3>
        <motion.p
          animate={{ opacity: isActive ? 1 : 0.35 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-5 max-w-md text-[15px] leading-relaxed text-zinc-500"
        >
          {step.body}
        </motion.p>
      </div>
    </div>
  );
}

function ScrollStory() {
  const [activeStep, setActiveStep] = React.useState(0);
  const onActive = React.useCallback((i: number) => setActiveStep(i), []);

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Sticky image */}
      <div className="hidden lg:block">
        <div className="sticky top-28">
          <div
            className="relative overflow-hidden rounded-[22px] border border-zinc-200 bg-zinc-100"
            style={{ aspectRatio: "4/5" }}
          >
            {STORY_IMAGES.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                loading="lazy"
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-all duration-700",
                  activeStep === i
                    ? "scale-100 opacity-100"
                    : "scale-[1.04] opacity-0",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable steps */}
      <div>
        {STORY_STEPS.map((step, i) => (
          <StoryStep key={i} step={step} index={i} onActive={onActive} isActive={activeStep === i} />
        ))}
      </div>
    </div>
  );
}

// ── Marquee ─────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  { text: "Built quietly", italic: "in", end: "Copenhagen" },
  { text: "Designed to last", italic: "a", end: "decade" },
  { text: "Zero compromise", italic: "on", end: "material" },
  { text: "A single port", italic: "for", end: "everything" },
];

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div
      className="overflow-hidden border-y border-zinc-200"
      style={{ background: "oklch(96.5% 0.006 80)" }}
      aria-hidden="true"
    >
      <motion.div
        className="flex"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="inline-flex shrink-0 items-center gap-14 whitespace-nowrap py-5"
            style={{
              fontSize: "clamp(36px, 6vw, 88px)",
              fontWeight: 500,
              letterSpacing: "-0.04em",
              color: "oklch(14% 0.012 255)",
              paddingInline: "3.5rem",
            }}
          >
            {item.text}{" "}
            <span
              className="shrink-0 rounded-full"
              style={{ width: 10, height: 10, background: "oklch(58% 0.14 252)" }}
            />
            <span
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontStyle: "italic",
                fontWeight: 400,
                color: "oklch(65% 0.01 255)",
              }}
            >
              {item.italic}
            </span>{" "}
            {item.end}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Section eyebrow tag ──────────────────────────────────────────────────────
function SectionTag({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <span
        className="inline-block size-1.5 rounded-full"
        style={{ background: "oklch(58% 0.14 252)" }}
      />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</span>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function NovaLandingPage() {
  useLenis();

  const [navScrolled, setNavScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Parallax on hero image
  const heroImgRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroImgRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(heroScroll, [0, 1], ["0%", "8%"]);

  React.useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = ["Product", "Features", "Gallery", "Specs", "Pricing"];

  // Accent blue
  const accent = "oklch(58% 0.14 252)";

  // ─── Template styles ──────────────────────────────────────────────────────
  const bg = "#F9F7F3"; // warm off-white
  const ink = "oklch(14% 0.012 255)";
  const borderColor = "oklch(90% 0.006 80)";

  const darken = "oklch(13% 0.012 255)";
  const darkLine = "oklch(28% 0.012 255)";

  return (
    <div
      className="relative min-h-screen overflow-x-hidden font-sans antialiased selection:bg-blue-500 selection:text-white"
      style={{ background: bg, color: ink }}
    >

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background: navScrolled ? "color-mix(in oklch, #F9F7F3 72%, transparent)" : "transparent",
          backdropFilter: navScrolled ? "saturate(180%) blur(16px)" : "none",
          WebkitBackdropFilter: navScrolled ? "saturate(180%) blur(16px)" : "none",
          borderBottom: navScrolled ? `1px solid ${borderColor}` : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex h-[52px] max-w-[1320px] items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <a href="#" className="flex shrink-0 items-center gap-2">
            <span
              className="inline-flex size-6 items-center justify-center rounded-[6px]"
              style={{ background: ink }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 12 L7 2 L12 12 M4.2 8.5 H9.8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[14px] font-semibold tracking-tight">Nova</span>
          </a>

          {/* Center nav */}
          <nav className="hidden items-center gap-7 text-[13px] md:flex" style={{ color: "oklch(38% 0.012 255)" }}>
            {navLinks.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="transition-colors hover:text-black">
                {link}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-3">
            <a
              href="#pricing"
              className="hidden rounded-full border border-zinc-300 px-4 py-1.5 text-[13px] font-medium transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white md:inline-flex"
              style={{ color: ink }}
            >
              Buy →
            </a>
            <button
              className="inline-flex size-8 items-center justify-center rounded-full border border-zinc-200 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 5h10M3 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
              className="overflow-hidden border-t border-zinc-200 px-6 py-5"
              style={{ background: bg }}
            >
              <div className="flex flex-col gap-4 text-[15px]">
                {navLinks.map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    style={{ color: ink }}
                  >
                    {link}
                  </a>
                ))}
                <a
                  href="#pricing"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 self-start rounded-full px-5 py-2.5 text-sm font-medium text-white"
                  style={{ background: ink }}
                >
                  Buy Nova One
                </a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Top text block — centered, text-only */}
        <div
          className="px-6 pb-12 pt-36 text-center lg:px-10 lg:pt-44"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 0%, oklch(92% 0.04 252 / 0.55) 0%, transparent 65%), #F9F7F3",
          }}
        >
          {/* Pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-1.5 text-[11px] font-medium text-zinc-600"
            style={{ background: "white" }}
          >
            <span className="size-1.5 animate-pulse rounded-full" style={{ background: accent }} />
            Introducing Nova One — Gen 02
          </motion.div>

          {/* Headline — one big statement */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.08, ease: [0.2, 0.7, 0.2, 1] }}
            style={{
              fontSize: "clamp(52px, 9vw, 148px)",
              letterSpacing: "-0.038em",
              lineHeight: "0.92",
              fontWeight: 600,
              textWrap: "balance",
            }}
          >
            A new kind of{" "}
            <em
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontStyle: "italic",
                fontWeight: 400,
                letterSpacing: "-0.02em",
              }}
            >
              quiet
            </em>{" "}
            power.
          </motion.h1>

          {/* One-liner */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            className="mx-auto mt-6 max-w-lg text-[16px] leading-relaxed"
            style={{ color: "oklch(35% 0.012 255)" }}
          >
            Engineered around a single silent surface — and the things it lets you forget about.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium text-white transition hover:opacity-85"
              style={{ background: ink }}
            >
              Buy — from $1,499
            </a>
            <a
              href="#product"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium transition hover:opacity-60"
              style={{ color: accent }}
            >
              Learn more ↓
            </a>
          </motion.div>
        </div>

        {/* Full-width hero image — no padding, bleeds edge-to-edge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative w-full"
        >
          {/* Ambient glow behind image */}
          <div
            className="pointer-events-none absolute -inset-x-0 -top-20 -z-10 h-40"
            style={{ background: "radial-gradient(50% 100% at 50% 100%, oklch(88% 0.06 252 / 0.3) 0%, transparent 100%)" }}
          />
          <motion.div ref={heroImgRef} style={{ y: heroImgY, aspectRatio: "16/8.5" }} className="relative w-full">
            <img
              src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=2800&q=90&auto=format&fit=crop"
              alt="Nova One — open on a minimal desk"
              className="h-full w-full object-cover"
              loading="eager"
            />
            {/* Travelling light shimmer */}
            <motion.div
              className="pointer-events-none absolute -left-[10%] top-0 h-full w-[22%]"
              style={{
                background: "linear-gradient(90deg, transparent, oklch(98% 0.04 252 / 0.45), transparent)",
                filter: "blur(32px)",
                rotate: "6deg",
              }}
              animate={{ x: ["-20%", "180%"] }}
              transition={{ duration: 9, repeat: Infinity, delay: 1.5, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Key-spec strip directly below the image */}
          <div
            className="border-b border-zinc-200 px-6 lg:px-10"
            style={{ background: bg }}
          >
            <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-px border-x border-zinc-200 md:grid-cols-4">
              {[
                { label: "Build", value: "Aerograde recycled aluminum" },
                { label: "Display", value: "14.2″ Retina XDR, 1,600 nits" },
                { label: "Silicon", value: "Nova N2 · 18 cores · 0 dB idle" },
                { label: "Battery", value: "Up to 22 hours sustained" },
              ].map((item) => (
                <div key={item.label} className="border-r border-zinc-200 px-6 py-6 last:border-r-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">{item.label}</p>
                  <p className="mt-1.5 text-[13px] font-medium text-zinc-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Product intro ────────────────────────────────────────────────── */}
      <section id="product" className="px-6 py-28 lg:px-10 lg:py-40">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <SectionTag label="Introducing Nova One" />
                <h2
                  className="font-semibold tracking-tight"
                  style={{ fontSize: "clamp(40px, 6vw, 104px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
                >
                  Designed to disappear
                  <br />
                  into the work.
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-5">
              <Reveal delay={0.1}>
                <p className="max-w-md text-[17px] leading-relaxed" style={{ color: "oklch(28% 0.012 255)" }}>
                  We removed everything that wasn&apos;t the work. No fans. No bezels worth noticing. No status lights blinking at you in the dark. What&apos;s left is a quiet surface that responds the moment you do.
                </p>
                <a
                  href="#features"
                  className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium transition hover:opacity-70"
                  style={{ color: accent }}
                >
                  Explore the design{" "}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </Reveal>
            </div>
          </div>

          <Reveal className="mt-16 lg:mt-24">
            <div className="overflow-hidden rounded-[28px] border border-zinc-200">
              <div className="relative aspect-[21/9]">
                <img
                  src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=2520&q=85&auto=format&fit=crop"
                  alt="Nova One wide"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 40%, oklch(10% 0.01 255 / 0.55))" }}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Feature showcase — 4 sections ──────────────────────────────── */}
      <section id="features">

        {/* Feature 01 — light */}
        <div className="border-t border-zinc-200 px-6 py-28 lg:px-10 lg:py-40">
          <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionTag label="01 — Silicon" />
                <h3
                  className="font-semibold tracking-tight"
                  style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
                >
                  The fastest thing
                  <br />
                  that won&apos;t
                  <br />
                  make a sound.
                </h3>
                <p className="mt-8 max-w-md text-[17px] leading-relaxed" style={{ color: "oklch(28% 0.012 255)" }}>
                  The Nova N2 chip moves 38 trillion operations a second through a passive thermal stack you can&apos;t hear, even pressed against your ear.
                </p>
                <div className="mt-8 flex flex-wrap gap-8">
                  {[["38T", "ops / sec"], ["0 dB", "idle"], ["7 nm", "process"]].map(([val, lbl]) => (
                    <div key={lbl}>
                      <div className="text-3xl font-medium" style={{ letterSpacing: "-0.05em" }}>{val}</div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">{lbl}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={0.1}>
                <div className="overflow-hidden rounded-[24px] border border-zinc-200">
                  <div className="relative aspect-[5/4]">
                    <img
                      src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=2000&q=85&auto=format&fit=crop"
                      alt="Silicon"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Feature 02 — dark */}
        <div className="px-6 py-28 lg:px-10 lg:py-40" style={{ background: darken, color: "oklch(94% 0.004 80)" }}>
          <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <Reveal>
                <div className="overflow-hidden rounded-[24px]" style={{ border: `1px solid ${darkLine}` }}>
                  <div className="relative aspect-[5/4]">
                    <img
                      src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=2000&q=85&auto=format&fit=crop"
                      alt="Display"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5">
              <Reveal delay={0.1}>
                <SectionTag label="02 — Display" />
                <h3
                  className="font-semibold tracking-tight"
                  style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
                >
                  A black
                  <br />
                  you can fall
                  <br />
                  into.
                </h3>
                <p className="mt-8 max-w-md text-[17px] leading-relaxed" style={{ color: "oklch(80% 0.01 255)" }}>
                  1,600 nits sustained. 1,000,000:1 contrast. A panel calibrated so closely to reference that colorists use it as one.
                </p>
                <div className="mt-8 flex flex-wrap gap-8">
                  {[["1,600", "nits sustained"], ["120Hz", "ProMotion"], ["P3", "wide color"]].map(([val, lbl]) => (
                    <div key={lbl}>
                      <div className="text-3xl font-medium" style={{ letterSpacing: "-0.05em" }}>{val}</div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "oklch(65% 0.01 255)" }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Feature 03 — light */}
        <div className="border-t border-zinc-200 px-6 py-28 lg:px-10 lg:py-40">
          <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionTag label="03 — Audio" />
                <h3
                  className="font-semibold tracking-tight"
                  style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
                >
                  Sound that
                  <br />
                  arrives from
                  <br />
                  nowhere.
                </h3>
                <p className="mt-8 max-w-md text-[17px] leading-relaxed" style={{ color: "oklch(28% 0.012 255)" }}>
                  Six-driver spatial array tuned in an anechoic chamber for three months by people who care deeply about cellos.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={0.1}>
                <div className="overflow-hidden rounded-[24px] border border-zinc-200">
                  <div className="relative aspect-[5/4]">
                    <img
                      src="https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=2000&q=85&auto=format&fit=crop"
                      alt="Audio"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Feature 04 — dark */}
        <div className="px-6 py-28 lg:px-10 lg:py-40" style={{ background: darken, color: "oklch(94% 0.004 80)" }}>
          <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionTag label="04 — Battery" />
                <h3
                  className="font-semibold tracking-tight"
                  style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
                >
                  A full day
                  <br />
                  and then
                  <br />
                  another half.
                </h3>
                <p className="mt-8 max-w-md text-[17px] leading-relaxed" style={{ color: "oklch(80% 0.01 255)" }}>
                  22 hours of sustained creative work. 36 hours of reading. A graphite-lithium cell that takes only 28 minutes to half-charge.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal delay={0.1}>
                <div className="overflow-hidden rounded-[24px]" style={{ border: `1px solid ${darkLine}` }}>
                  <div className="relative aspect-[5/4]">
                    <img
                      src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=2000&q=85&auto=format&fit=crop"
                      alt="Battery"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Auto-scrolling Marquee ───────────────────────────────────────── */}
      <Marquee />

      {/* ── Cinematic sticky section ─────────────────────────────────────── */}
      <div className="relative" style={{ height: "260vh", background: darken, color: "oklch(94% 0.004 80)" }}>
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          {/* BG image with subtle parallax */}
          <img
            className="absolute inset-0 h-full w-full scale-105 object-cover"
            src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=2600&q=85&auto=format&fit=crop"
            alt=""
            loading="lazy"
          />
          {/* Veil */}
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(60% 60% at 50% 50%, oklch(10% 0.01 255 / 0.25), oklch(8% 0.01 255 / 0.75))" }}
          />
          {/* Content */}
          <div className="relative z-10 max-w-[1100px] px-6 text-center">
            <div
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border px-3.5 py-2 backdrop-blur-lg"
              style={{ borderColor: "oklch(70% 0.01 255 / 0.3)", color: "oklch(75% 0.01 255)", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" }}
            >
              <span className="size-1.5 rounded-full" style={{ background: accent }} />
              Chapter 02 — Material
            </div>
            <Reveal>
              <h2
                className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(56px, 7.5vw, 132px)", letterSpacing: "-0.035em", lineHeight: "0.95", textWrap: "balance" }}
              >
                Sculpted from{" "}
                <em
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                    letterSpacing: "-0.015em",
                  }}
                >
                  one
                </em>{" "}
                piece of
                <br />
                recycled aluminum.
              </h2>
              <p
                className="mx-auto mt-8 max-w-xl text-[17px] leading-relaxed"
                style={{ color: "oklch(82% 0.01 255)" }}
              >
                It takes 14 hours of CNC milling to shape a single chassis, and 38 seconds to break the toolhead on the first one we tried. We kept trying.
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Walkthrough / Scroll story ───────────────────────────────────── */}
      <section className="border-t border-zinc-200 px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-16 max-w-2xl">
            <Reveal>
              <SectionTag label="Walkthrough" />
              <h2
                className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
              >
                Four moments,
                <br />
                one device.
              </h2>
            </Reveal>
          </div>
          <ScrollStory />
        </div>
      </section>

      {/* ── Gallery / Studio ─────────────────────────────────────────────── */}
      <section id="gallery" className="border-t border-zinc-200 px-6 py-28 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1320px]">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionTag label="Studio" />
              <h2
                className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
              >
                Every angle, considered.
              </h2>
            </div>
            <a href="#" className="inline-flex items-center gap-1.5 text-[14px] font-medium transition hover:opacity-70" style={{ color: accent }}>
              View the press kit →
            </a>
          </Reveal>

          {/* Gallery grid */}
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            <Reveal className="col-span-12 lg:col-span-8">
              <div className="group overflow-hidden rounded-[22px] border border-zinc-200">
                <div className="relative aspect-[16/10]">
                  <img
                    src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=2400&q=85&auto=format&fit=crop"
                    alt="Front three-quarter"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                    loading="lazy"
                  />
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.07} className="col-span-12 lg:col-span-4">
              <div className="group overflow-hidden rounded-[22px] border border-zinc-200">
                <div className="relative aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1400&q=85&auto=format&fit=crop"
                    alt="Port detail"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                    loading="lazy"
                  />
                </div>
              </div>
            </Reveal>
            {[
              { src: "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?w=1400&q=85&auto=format&fit=crop", alt: "Hinge" },
              { src: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1400&q=85&auto=format&fit=crop", alt: "Keyboard" },
              { src: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1400&q=85&auto=format&fit=crop", alt: "Engraving" },
            ].map((img, i) => (
              <Reveal key={img.alt} delay={i * 0.06} className="col-span-6 lg:col-span-4">
                <div className="group overflow-hidden rounded-[22px] border border-zinc-200">
                  <div className="relative aspect-square">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento feature grid ───────────────────────────────────────────── */}
      <section className="px-6 py-28 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1320px]">
          <Reveal className="mb-14 max-w-2xl">
            <SectionTag label="System" />
            <h2
              className="font-semibold tracking-tight"
              style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
            >
              Six small ideas
              <br />
              that add up to one big one.
            </h2>
          </Reveal>

          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            {/* Wide card */}
            <Reveal className="col-span-12 lg:col-span-7">
              <div
                className="rounded-[22px] border border-zinc-200 p-8 lg:p-10"
                style={{ background: "linear-gradient(180deg, oklch(99% 0.003 80) 0%, oklch(96% 0.006 80) 100%)" }}
              >
                <div className="mb-6 inline-flex size-9 items-center justify-center rounded-[10px] border border-zinc-200 bg-zinc-100 text-zinc-600">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="9" cy="9" r="1.6" fill="currentColor"/></svg>
                </div>
                <h3 className="text-2xl font-medium tracking-tight lg:text-3xl" style={{ letterSpacing: "-0.02em" }}>Privacy is the default, not a setting.</h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-500">Every neural workload runs on-device. The cloud sees only what you send it — and what you send is encrypted twice.</p>
              </div>
            </Reveal>
            <Reveal delay={0.07} className="col-span-12 sm:col-span-6 lg:col-span-5">
              <div className="rounded-[22px] border border-zinc-200 p-8 lg:p-10" style={{ background: "linear-gradient(180deg, oklch(99% 0.003 80) 0%, oklch(96% 0.006 80) 100%)" }}>
                <div className="mb-6 inline-flex size-9 items-center justify-center rounded-[10px] border border-zinc-200 bg-zinc-100 text-zinc-600">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 6h12M3 9h12M3 12h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </div>
                <h3 className="text-2xl font-medium tracking-tight lg:text-3xl" style={{ letterSpacing: "-0.02em" }}>Hand-off, anywhere.</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">Pick up from your phone, tablet, or studio rig — without thinking about it.</p>
              </div>
            </Reveal>
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="3" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 9h12M9 3v12" stroke="currentColor" strokeWidth="1.4"/></svg>, title: "One port. Everything.", desc: "Power, dual-8K display out, 80 Gbps data, MIDI, balanced audio. One cable." },
              { icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v3M9 13v3M2 9h3M13 9h3M4 4l2 2M12 12l2 2M14 4l-2 2M4 14l2-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>, title: "Adaptive ambient.", desc: "The display reads the room and changes its temperature 96 times a second." },
              { icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 14l4-10 4 10M6.5 11h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: "Built to recycle.", desc: "100% recycled aluminum. 96% recycled rare earths. Zero adhesives in the chassis." },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.07} className="col-span-12 sm:col-span-6 lg:col-span-4">
                <div className="rounded-[22px] border border-zinc-200 p-8 lg:p-10" style={{ background: "linear-gradient(180deg, oklch(99% 0.003 80) 0%, oklch(96% 0.006 80) 100%)" }}>
                  <div className="mb-6 inline-flex size-9 items-center justify-center rounded-[10px] border border-zinc-200 bg-zinc-100 text-zinc-600">{card.icon}</div>
                  <h3 className="text-2xl font-medium tracking-tight lg:text-3xl" style={{ letterSpacing: "-0.02em" }}>{card.title}</h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">{card.desc}</p>
                </div>
              </Reveal>
            ))}
            {/* Wide bottom card */}
            <Reveal className="col-span-12">
              <div className="rounded-[22px] border border-zinc-200 p-8 lg:p-10" style={{ background: "linear-gradient(120deg, oklch(96% 0.02 252) 0%, oklch(98% 0.006 80) 60%)" }}>
                <div className="grid items-center gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <div className="mb-6 inline-flex size-9 items-center justify-center rounded-[10px] border border-zinc-200 bg-white/60 text-zinc-600">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M9 5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    </div>
                    <h3 className="text-2xl font-medium tracking-tight lg:text-3xl" style={{ letterSpacing: "-0.02em" }}>It updates while it&apos;s off.</h3>
                    <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-zinc-500">Quiet OTA channels mean your software is ready before you sit down. No download bars, ever.</p>
                  </div>
                  <div className="lg:col-span-5">
                    <div className="overflow-hidden rounded-[16px] border border-zinc-200">
                      <div className="relative aspect-[16/10]">
                        <img src="https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=1600&q=85&auto=format&fit=crop" alt="OTA update" className="h-full w-full object-cover" loading="lazy" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Performance stats ────────────────────────────────────────────── */}
      <section className="border-t border-zinc-200 px-6 py-28 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionTag label="Numbers" />
                <h2
                  className="font-semibold tracking-tight"
                  style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
                >
                  Measured against itself.
                </h2>
                <p className="mt-6 max-w-md text-[16px] leading-relaxed" style={{ color: "oklch(28% 0.012 255)" }}>
                  All comparisons are against the previous Nova generation, tested under identical sustained loads.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
                {[
                  { val: "3.4", suf: "×", label: "render speed" },
                  { val: 22, suf: "h", label: "battery" },
                  { val: 0.92, suf: "", smallSuf: "kg", label: "weight" },
                  { val: 8.2, suf: "", smallSuf: "mm", label: "thickness" },
                  { val: "38T", suf: "", label: "neural ops / sec" },
                  { val: "1,600", suf: "", label: "nits sustained" },
                  { val: 100, suf: "", smallSuf: "%", label: "recycled shell" },
                  { val: 28, suf: "", smallSuf: "min", label: "half charge" },
                ].map((s, i) => (
                  <Reveal key={s.label} delay={i * 0.05}>
                    <div
                      className="font-medium"
                      style={{ fontSize: "clamp(40px, 5vw, 64px)", letterSpacing: "-0.05em", lineHeight: 1 }}
                    >
                      <Counter
                        to={typeof s.val === "string" ? s.val : s.val}
                        suffix={s.suf}
                        smallSuffix={s.smallSuf}
                      />
                    </div>
                    <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">{s.label}</div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── In the box ───────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-200 px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1320px]">
          <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionTag label="In the box" />
              <h2
                className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
              >
                Five things,
                <br />
                nothing extra.
              </h2>
            </div>
            <p className="max-w-xs text-[14px] text-zinc-500">Every Nova One ships in a single moulded-pulp tray. No foam, no ties, no plastics.</p>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
            {[
              { src: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=900&q=85&auto=format&fit=crop", name: "Nova One", sub: "14.2″ chassis" },
              { src: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900&q=85&auto=format&fit=crop", name: "N-Cable", sub: "2m, braided" },
              { src: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=900&q=85&auto=format&fit=crop", name: "96W Adapter", sub: "GaN, foldable" },
              { src: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&q=85&auto=format&fit=crop", name: "Polish cloth", sub: "Nano-microfiber" },
              { src: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=900&q=85&auto=format&fit=crop", name: "Owner's card", sub: "Letterpress, A6" },
            ].map((item, i) => (
              <Reveal key={item.name} delay={i * 0.06}>
                <div className="overflow-hidden rounded-[18px] border border-zinc-200 bg-white">
                  <div className="relative border-b border-zinc-200 bg-zinc-50" style={{ aspectRatio: "4/3" }}>
                    <img src={item.src} alt={item.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <p className="text-[15px] font-medium">{item.name}</p>
                    <p className="mt-1 text-[12px] text-zinc-500">{item.sub}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────────── */}
      <section id="compare" className="border-t border-zinc-200 px-6 py-28 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1320px]">
          <Reveal className="mb-14 max-w-2xl">
            <SectionTag label="Compare" />
            <h2
              className="font-semibold tracking-tight"
              style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
            >
              Nova One, against the room.
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed" style={{ color: "oklch(28% 0.012 255)" }}>
              A short, honest accounting of where it lands versus the obvious alternatives.
            </p>
          </Reveal>

          <Reveal>
            <div className="overflow-hidden overflow-x-auto rounded-[22px] border border-zinc-200 bg-white">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b border-zinc-200">
                    {["Specification", "Nova One", "Studio Pro Q", "Arc Book 14", "Halo M3"].map((h) => (
                      <th key={h} className="px-5 py-[18px] text-left font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Sustained CPU", "38T ops/s", "22T ops/s", "19T ops/s", "26T ops/s"],
                    ["Display", "14.2″ XDR, 1,600 nits", "14″ OLED, 800 nits", "14″ IPS, 500 nits", "14″ Mini-LED, 1,200 nits"],
                    ["Battery, sustained", "22 hours", "14 hours", "12 hours", "17 hours"],
                    ["Passive cooling", "✓ Fully fanless", "— Active fan", "— Active fan", "✓ Hybrid"],
                    ["On-device privacy", "✓ All workloads", "— Partial", "— Cloud-first", "✓ All workloads"],
                    ["Recycled shell", "100%", "62%", "48%", "80%"],
                    ["Weight", "0.92 kg", "1.30 kg", "1.45 kg", "1.10 kg"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-t border-zinc-200 transition hover:bg-zinc-50">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className={cn("px-5 py-[18px] align-middle",
                            ci === 0 && "text-zinc-500",
                            ci === 1 && "font-medium",
                            cell.startsWith("✓") && "text-green-600",
                            cell.startsWith("—") && "text-zinc-400",
                          )}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Tech specs accordion ──────────────────────────────────────────── */}
      <section id="specs" className="border-t border-zinc-200 px-6 py-28 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <SectionTag label="Tech specs" />
              <h2
                className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
              >
                Everything,
                <br />
                for the engineers.
              </h2>
              <p className="mt-6 max-w-xs text-[14px] leading-relaxed text-zinc-500">
                A complete data sheet — for the people who read those carefully.
              </p>
              <a href="#" className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium transition hover:opacity-70" style={{ color: accent }}>
                Download PDF data sheet →
              </a>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-8">
              <AccordionRow summary="Silicon" defaultOpen>
                <dl className="mt-2 grid grid-cols-1 gap-4 text-[14px] sm:grid-cols-2">
                  {[["Chip", "Nova N2, 7 nm"], ["CPU", "18-core (12P + 6E)"], ["GPU", "24-core integrated"], ["Neural engine", "16-core, 38T ops/s"], ["Memory bandwidth", "400 GB/s"], ["Thermal design", "Passive, fanless"]].map(([k, v]) => (
                    <div key={k}><dt className="text-zinc-400">{k}</dt><dd className="text-zinc-700">{v}</dd></div>
                  ))}
                </dl>
              </AccordionRow>
              <AccordionRow summary="Display">
                <dl className="mt-2 grid grid-cols-1 gap-4 text-[14px] sm:grid-cols-2">
                  {[["Size", "14.2″ Liquid Retina XDR"], ["Resolution", "3456 × 2234 at 254 ppi"], ["Brightness", "1,600 nits sustained"], ["Contrast", "1,000,000 : 1"], ["Color", "P3 wide gamut, 10-bit"], ["Refresh", "ProMotion 10–120 Hz"]].map(([k, v]) => (
                    <div key={k}><dt className="text-zinc-400">{k}</dt><dd className="text-zinc-700">{v}</dd></div>
                  ))}
                </dl>
              </AccordionRow>
              <AccordionRow summary="Memory & storage">
                <dl className="mt-2 grid grid-cols-1 gap-4 text-[14px] sm:grid-cols-2">
                  {[["Unified memory", "16 / 32 / 64 GB"], ["Storage", "512 GB / 1 TB / 2 TB / 4 TB"], ["SSD read", "up to 7.4 GB/s"], ["SSD write", "up to 6.8 GB/s"]].map(([k, v]) => (
                    <div key={k}><dt className="text-zinc-400">{k}</dt><dd className="text-zinc-700">{v}</dd></div>
                  ))}
                </dl>
              </AccordionRow>
              <AccordionRow summary="Battery & power">
                <dl className="mt-2 grid grid-cols-1 gap-4 text-[14px] sm:grid-cols-2">
                  {[["Battery", "72 Wh graphite-lithium"], ["Web browsing", "up to 22 hours"], ["Video playback", "up to 28 hours"], ["Half-charge", "28 minutes (96W)"], ["Idle drain", "0.4% / hr lid-closed"]].map(([k, v]) => (
                    <div key={k}><dt className="text-zinc-400">{k}</dt><dd className="text-zinc-700">{v}</dd></div>
                  ))}
                </dl>
              </AccordionRow>
              <AccordionRow summary="Connectivity & ports">
                <dl className="mt-2 grid grid-cols-1 gap-4 text-[14px] sm:grid-cols-2">
                  {[["Wi-Fi", "Wi-Fi 7 (802.11be), tri-band"], ["Bluetooth", "5.4"], ["Port", "1 × Nova-Bus (80 Gbps, 240W)"], ["Display out", "Dual 8K at 60 Hz"]].map(([k, v]) => (
                    <div key={k}><dt className="text-zinc-400">{k}</dt><dd className="text-zinc-700">{v}</dd></div>
                  ))}
                </dl>
              </AccordionRow>
              <AccordionRow summary="Dimensions & environment">
                <dl className="mt-2 grid grid-cols-1 gap-4 text-[14px] sm:grid-cols-2">
                  {[["Weight", "0.92 kg / 2.03 lb"], ["Thickness", "8.2 mm"], ["Material", "100% recycled aerograde aluminum"], ["Compliance", "ENERGY STAR, EPEAT Gold"]].map(([k, v]) => (
                    <div key={k}><dt className="text-zinc-400">{k}</dt><dd className="text-zinc-700">{v}</dd></div>
                  ))}
                </dl>
              </AccordionRow>
              <div className="border-b border-zinc-200" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-zinc-200 px-6 py-28 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1320px]">
          <Reveal className="mb-14 max-w-2xl">
            <SectionTag label="Order" />
            <h2
              className="font-semibold tracking-tight"
              style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
            >
              Choose your Nova One.
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed" style={{ color: "oklch(28% 0.012 255)" }}>
              Configured to order. Ships in 5–7 days. Free returns for 30.
            </p>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            {[
              {
                eyebrow: "Essential",
                sku: "N1-512",
                price: "$1,499",
                monthly: "$124/mo for 12 months",
                desc: "A complete Nova One for everyday creative work and long days on battery.",
                features: ["Nova N2 — 12-core", "16 GB unified memory", "512 GB storage", "14.2″ XDR display", "22-hour battery"],
                cta: "Configure essential",
                rec: false,
              },
              {
                eyebrow: "Studio",
                sku: "N1-1TB",
                price: "$1,999",
                monthly: "$166/mo for 12 months",
                desc: "The configuration we ship to our own design studio. More memory, more storage, the same silence.",
                features: ["Nova N2 — 14-core", "32 GB unified memory", "1 TB storage", "14.2″ XDR, nano-texture", "Engraving included"],
                cta: "Configure studio",
                rec: true,
              },
              {
                eyebrow: "Atelier",
                sku: "N1-2TB",
                price: "$2,799",
                monthly: "$232/mo for 12 months",
                desc: "For the kind of work that fills a hard drive every quarter and asks for color you can trust.",
                features: ["Nova N2 — 18-core", "64 GB unified memory", "2 TB storage", "Reference-calibrated XDR", "NovaCare+ included, 3 yr"],
                cta: "Configure atelier",
                rec: false,
              },
            ].map((plan, i) => (
              <Reveal key={plan.eyebrow} delay={i * 0.08}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-[22px] border p-8 lg:p-10",
                    plan.rec ? "" : "border-zinc-200 bg-white",
                  )}
                  style={plan.rec ? { background: ink, border: `1px solid ${ink}`, color: "oklch(94% 0.004 80)" } : undefined}
                >
                  {plan.rec && (
                    <div
                      className="absolute -top-3 left-8 rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-white"
                      style={{ background: accent }}
                    >
                      Most chosen
                    </div>
                  )}
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: plan.rec ? "oklch(72% 0.01 255)" : "oklch(45% 0.012 255)" }}>{plan.eyebrow}</span>
                    <span className="font-mono text-[12px]" style={{ color: plan.rec ? "oklch(60% 0.01 255)" : "oklch(65% 0.010 255)" }}>{plan.sku}</span>
                  </div>
                  <div className="mt-6">
                    <div className="text-5xl font-medium" style={{ letterSpacing: "-0.03em" }}>{plan.price}</div>
                    <div className="mt-2 text-[13px]" style={{ color: plan.rec ? "oklch(72% 0.01 255)" : "oklch(45% 0.012 255)" }}>{plan.monthly}</div>
                  </div>
                  <p className="mt-6 text-[14px] leading-relaxed" style={{ color: plan.rec ? "oklch(80% 0.01 255)" : "oklch(28% 0.012 255)" }}>{plan.desc}</p>
                  <ul className="mt-8 grow space-y-3 text-[14px]">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-3">
                        <span className="mt-0.5" style={{ color: plan.rec ? "oklch(75% 0.13 150)" : "oklch(55% 0.13 150)" }}>✓</span>
                        <span style={{ color: plan.rec ? "oklch(80% 0.01 255)" : "oklch(28% 0.012 255)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10">
                    <a
                      href="#"
                      className="flex w-full items-center justify-center rounded-full py-3 text-[14px] font-medium transition hover:opacity-90"
                      style={plan.rec
                        ? { background: bg, color: ink }
                        : i === 2
                          ? { border: `1px solid ${ink}`, color: ink }
                          : { background: ink, color: "white" }
                      }
                    >
                      {plan.cta}
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-200 px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <SectionTag label="Questions" />
              <h2
                className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(32px, 4.5vw, 72px)", letterSpacing: "-0.035em", lineHeight: "0.95" }}
              >
                Honest
                <br />
                answers.
              </h2>
              <p className="mt-6 max-w-xs text-[14px] leading-relaxed text-zinc-500">
                If you don&apos;t see what you&apos;re looking for, write us — a real person responds within a day.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-8">
              {[
                { q: "What's actually different about Nova One?", a: "A fully passive thermal stack — no fan, ever — paired with a chip designed around sustained workloads instead of bursts. The result is a machine that doesn't slow down at minute thirty and doesn't sound like one either." },
                { q: "When does Nova One ship?", a: "Configured-to-order units ship within 5–7 business days. Engraved units add 2 days. Studio configuration is in stock at all Nova showrooms." },
                { q: "What's the return policy?", a: "Free returns within 30 days, for any reason. We pay the shipping. Engraved devices are non-refundable but exchangeable." },
                { q: "Is it really 100% recycled aluminum?", a: "Yes — sourced from beverage-can stream and post-industrial scrap, smelted using hydroelectric power. The number is audited annually by a third party." },
                { q: "Can I run pro applications on it?", a: "Yes. Nova One ships with native builds of every major creative tool — DaVinci Resolve, Logic, Ableton, Houdini, Blender, and the JetBrains suite — and a translation layer for x86 binaries when needed." },
                { q: "What does NovaCare+ cover?", a: "Three years of accidental damage coverage, priority support, and free battery replacement when capacity drops below 80%." },
              ].map((item, i) => (
                <AccordionRow key={item.q} summary={item.q} defaultOpen={i === 0}>
                  {item.a}
                </AccordionRow>
              ))}
              <div className="border-b border-zinc-200" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-200 px-6 py-28 text-center lg:px-10 lg:py-40">
        <div className="mx-auto max-w-[1320px]">
          <Reveal>
            <div
              className="mb-8 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium text-zinc-700"
              style={{ borderColor: borderColor, background: "color-mix(in oklch, #F9F7F3 70%, white)" }}
            >
              <span className="size-1.5 rounded-full" style={{ background: accent }} />
              Ships May 24
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2
              className="mx-auto max-w-3xl font-semibold tracking-tight"
              style={{ fontSize: "clamp(40px, 6vw, 104px)", letterSpacing: "-0.035em", lineHeight: "0.95", textWrap: "balance" }}
            >
              The most honest thing
              <br />
              we&apos;ve ever made.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-7 max-w-lg text-[17px] leading-relaxed" style={{ color: "oklch(28% 0.012 255)" }}>
              Configure your Nova One today. Pre-order, take it home, return it inside a month if it doesn&apos;t quietly become the only one you reach for.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-9 flex flex-wrap items-center justify-center gap-6">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium text-white transition hover:opacity-90"
              style={{ background: ink }}
            >
              Configure & buy →
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 text-[15px] font-medium transition hover:opacity-70" style={{ color: accent }}>
              Visit a Nova showroom →
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer id="support" className="border-t border-zinc-200 pb-10 pt-20">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
            <div className="col-span-2">
              <a href="#" className="flex items-center gap-2">
                <span className="inline-flex size-7 items-center justify-center rounded-md" style={{ background: ink }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 12 L7 2 L12 12 M4.2 8.5 H9.8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[15px] font-semibold tracking-tight">Nova</span>
              </a>
              <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-zinc-500">
                Built in Copenhagen, assembled in Kyoto. A small company making one thing carefully.
              </p>
            </div>
            {[
              { heading: "Shop", links: ["Nova One", "Accessories", "Gift cards", "Refurbished", "Educational pricing"] },
              { heading: "Support", links: ["Help center", "NovaCare+", "Order status", "Repair", "Contact"] },
              { heading: "Company", links: ["About", "Journal", "Sustainability", "Careers", "Press"] },
              { heading: "Stay in touch", links: ["Newsletter", "Showrooms", "Events", "Developers", "Partners"] },
            ].map((col) => (
              <div key={col.heading}>
                <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">{col.heading}</p>
                <ul className="space-y-3 text-[13px]">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-zinc-500 transition hover:text-zinc-900">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-8 text-[12px] text-zinc-400">
            <p>© {new Date().getFullYear()} Nova Systems, Inc. All rights reserved.</p>
            <div className="flex gap-5">
              {["Privacy Policy", "Terms of Use", "Cookies"].map((l) => (
                <a key={l} href="#" className="transition hover:text-zinc-700">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
