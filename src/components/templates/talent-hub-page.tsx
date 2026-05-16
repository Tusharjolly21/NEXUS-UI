"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

// ── Lenis smooth scroll (lerp: 0.1 matching Assistantly) ─────────────────────
function useLenis() {
  React.useEffect(() => {
    let lenis: any = null;
    let rafId: number;
    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      const raf = (t: number) => { lenis.raf(t); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);
    });
    return () => { if (lenis) lenis.destroy(); if (rafId) cancelAnimationFrame(rafId); };
  }, []);
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  brand:   "#13139C",
  brandB:  "#4A4FFD",  // brighter indigo for hover state (matches Assistantly rgb(74,79,253))
  lav:     "#BBC2FB",
  lavSoft: "#E8EAFF",
  ink:     "#0B0B1A",
  muted:   "#6B6B80",
  bg:      "#FFFFFF",
  bgSoft:  "#F7F7FF",
  bgCard:  "#F4F5FF",
  border:  "#E4E5F5",
};

// ── SplitText: letter-by-letter reveal (GSAP SplitText equivalent) ────────────
function SplitReveal({
  text,
  className,
  style,
  delay = 0,
  stagger = 0.022,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  stagger?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const words = text.split(" ");

  return (
    <span ref={ref} className={cn("inline", className)} style={style} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((char, ci) => {
            const idx = words.slice(0, wi).join("").length + wi + ci;
            return (
              <motion.span
                key={ci}
                className="inline-block"
                initial={{ opacity: 0, y: "0.35em" }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.55,
                  delay: delay + idx * stagger,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {char}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

// ── Paragraph reveal (whole line slides up) ────────────────────────────────────
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
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Gradual blur overlay (matches Assistantly's `.gradual-blur`) ──────────────
function GradualBlur({ position = "bottom" }: { position?: "top" | "bottom" }) {
  const divs = 6;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-10"
      style={{
        [position]: 0,
        height: "7rem",
      }}
    >
      {Array.from({ length: divs }).map((_, i) => {
        const p = (i + 1) / divs;
        const blur = 0.0625 * (p * divs + 1) * 1.5;
        const p1 = ((100 / divs) * i).toFixed(1);
        const p2 = ((100 / divs) * (i + 1)).toFixed(1);
        const dir = position === "bottom" ? "to bottom" : "to top";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              backdropFilter: `blur(${blur.toFixed(2)}rem)`,
              WebkitBackdropFilter: `blur(${blur.toFixed(2)}rem)`,
              maskImage: `linear-gradient(${dir}, transparent ${p1}%, black ${p2}%, black 100%, transparent 100%)`,
              WebkitMaskImage: `linear-gradient(${dir}, transparent ${p1}%, black ${p2}%, black 100%, transparent 100%)`,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1400, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

// ── Infinite marquee ──────────────────────────────────────────────────────────
function Marquee({ items, speed = 35 }: { items: string[]; speed?: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex shrink-0 items-center gap-3 text-[14px] font-semibold" style={{ color: C.muted }}>
            <span className="size-1.5 rounded-full" style={{ background: C.lav }} />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Differentiator card: flips bg white→indigo on hover (Assistantly pattern) ─
function DiffCard({ emoji, num, title, desc }: { emoji: string; num: string; title: string; desc: string }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ backgroundColor: hovered ? C.brandB : "#FFFFFF" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col rounded-2xl border p-7 cursor-default"
      style={{ borderColor: hovered ? C.brandB : C.border }}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{emoji}</span>
        <motion.span
          animate={{ color: hovered ? C.lav : C.muted }}
          className="font-mono text-[10px] font-semibold"
        >
          diff — {num}
        </motion.span>
      </div>
      <motion.h3
        animate={{ color: hovered ? "#FFFFFF" : C.ink }}
        transition={{ duration: 0.3 }}
        className="mt-4 text-[18px] font-extrabold"
      >
        {title}
      </motion.h3>
      <motion.p
        animate={{ color: hovered ? C.lav : C.muted }}
        transition={{ duration: 0.3 }}
        className="mt-2 text-[14px] leading-relaxed"
      >
        {desc}
      </motion.p>
    </motion.div>
  );
}

// ── FAQ row with growing underline extender (Assistantly pattern) ─────────────
function FaqRow({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [hovered, setHovered] = React.useState(false);

  return (
    <div className="border-b" style={{ borderColor: C.border }}>
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setOpen(v => !v)}
        className="group relative flex w-full items-center justify-between gap-4 pb-4 pt-5 text-left"
      >
        <span className="relative text-[16px] font-bold" style={{ color: C.ink }}>
          {q}
          {/* Extender underline — grows full width on hover/open (Assistantly signature) */}
          <motion.span
            className="absolute bottom-0 left-0 h-[1.5px] block"
            style={{ background: C.brand }}
            animate={{ width: open || hovered ? "100%" : "0%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </span>
        <motion.span
          className="flex size-7 shrink-0 items-center justify-center rounded-full border text-[16px] font-light transition-colors"
          animate={{
            borderColor: open ? C.brand : C.border,
            background: open ? C.brand : "transparent",
            color: open ? "white" : C.muted,
          }}
          transition={{ duration: 0.25 }}
        >
          {open ? "−" : "+"}
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[15px] leading-relaxed" style={{ color: C.muted }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Horizontal department card scroller (Swiper-style) ────────────────────────
const DEPT_CARDS = [
  { emoji: "🗂️", title: "Administrative", color: "#EEF0FF", roles: ["Executive Assistants", "Virtual Assistants", "Admin Coordinators"], tasks: ["Inbox & calendar management", "Travel & expense reports", "Research & comparisons", "SOP updates & vendor coordination"] },
  { emoji: "⚙️", title: "Operations",     color: "#FFF7EE", roles: ["Project Managers", "Ops Specialists", "Process Coordinators"],    tasks: ["Project planning & delivery", "Workflow optimization", "KPI tracking & reporting", "Team coordination"] },
  { emoji: "📣", title: "Marketing",      color: "#F0FFF4", roles: ["Marketing Coordinators", "Video Editors", "Social Media Managers"], tasks: ["Content scheduling & SEO", "Video editing (short-form)", "Newsletter & landing pages", "Community engagement"] },
  { emoji: "💬", title: "Customer Support", color: "#FFF0F6", roles: ["Client Success Managers", "Account Reps", "Support Specialists"],  tasks: ["Inbox & ticket responses", "CRM updates & check-ins", "Feedback & NPS", "Issue tracking"] },
  { emoji: "🎯", title: "Niche Roles",    color: "#F5F0FF", roles: ["Tool/Platform Experts", "Industry Specialists", "eCommerce & Real Estate"], tasks: ["CRM & automation setup", "Podcast & YouTube production", "Paid ads management", "HR & recruiting coordination"] },
  { emoji: "💵", title: "Finance",        color: "#F0FFFA", roles: ["Bookkeepers", "Accountants", "Analysts"],                           tasks: ["Invoices & expense tracking", "Payroll & reconciliations", "Financial reporting", "Cash flow summaries"] },
];

function DeptSlider() {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(true);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 360 : -360, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  return (
    <div className="relative">
      {/* Prev */}
      <AnimatePresence>
        {canLeft && (
          <motion.button
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
            onClick={() => scroll("left")}
            className="absolute -left-5 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-md transition hover:border-[#13139C]"
            style={{ borderColor: C.border }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke={C.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Gradient edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-white to-transparent" />

      {/* Scrollable track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollSnapType: "x mandatory", msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        {DEPT_CARDS.map((d, i) => (
          <motion.div
            key={d.title}
            whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(19,19,156,0.10)" }}
            transition={{ duration: 0.25 }}
            className="flex w-72 shrink-0 flex-col rounded-2xl border p-7"
            style={{ background: d.color, borderColor: C.border, scrollSnapAlign: "start" }}
          >
            <span className="text-3xl">{d.emoji}</span>
            <h3 className="mt-3 text-[20px] font-extrabold">{d.title}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {d.roles.map(r => (
                <span key={r} className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(0,0,0,0.07)", color: C.ink }}>{r}</span>
              ))}
            </div>
            <ul className="mt-4 space-y-1.5">
              {d.tasks.map(t => (
                <li key={t} className="flex gap-2 text-[13px] leading-snug" style={{ color: C.muted }}>
                  <span className="mt-0.5 shrink-0" style={{ color: C.brand }}>✓</span> {t}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Next */}
      <AnimatePresence>
        {canRight && (
          <motion.button
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
            onClick={() => scroll("right")}
            className="absolute -right-5 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-md transition hover:border-[#13139C]"
            style={{ borderColor: C.border }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={C.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { quote: "From day one, their attitude and eagerness to learn stood out. Delegating has always been hard for me — but time and time again they delivered.", name: "Andrew Walsh", role: "VP, WFG Title", emoji: "🏆" },
  { quote: "My go-to platform for my team, clients and partners. They all work exclusively with this service for one simple reason: they genuinely care.", name: "Sharran Srivatsaa", role: "President, Acquisition.com", emoji: "💙" },
  { quote: "We upgraded their hours almost immediately. A true marketing guru who produced more in months than previous team members did in years.", name: "Kalli Beckwith", role: "A3 Sports & Wellness", emoji: "🚀" },
  { quote: "Within 72 hours, not only found the perfect assistant but also set up the interview. Working with this team is amazing.", name: "Drew Thompson", role: "Head, Real Academy", emoji: "⚡" },
  { quote: "The level of talent is unbelievable. We've been so impressed that we've referred everyone we know.", name: "Colette Stevenson", role: "CEO, Resides", emoji: "✨" },
];

// ── Main component ────────────────────────────────────────────────────────────
export function TalentHubPage() {
  useLenis();

  const [navScrolled, setNavScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activeTestimonial, setActiveTestimonial] = React.useState(0);

  // Parallax on hero floating emojis
  const heroRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const emojiY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const smoothY = useSpring(emojiY, { stiffness: 80, damping: 20 });

  React.useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 32);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Auto-advance testimonials
  React.useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(v => (v + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const navLinks = ["Unicorns", "Process", "Pricing", "About"];

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans antialiased" style={{ background: C.bg, color: C.ink }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background: navScrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: navScrolled ? "saturate(180%) blur(14px)" : "none",
          borderBottom: navScrolled ? `1px solid ${C.border}` : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex h-14.5 max-w-300 items-center justify-between px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2.5">
            <span className="text-xl">🦄</span>
            <span className="text-[16px] font-extrabold tracking-tight" style={{ color: C.brand }}>TalentHub</span>
          </a>

          <nav className="hidden items-center gap-8 text-[14px] font-medium md:flex" style={{ color: C.muted }}>
            {navLinks.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="transition-colors hover:text-black">{l}</a>
            ))}
            <a href="#top-talent" className="font-semibold transition-colors hover:text-black" style={{ color: C.ink }}>Top Talent</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#pricing"
              className="hidden rounded-full px-5 py-2 text-[13px] font-bold text-white transition hover:opacity-90 md:inline-flex"
              style={{ background: C.brand }}
            >
              Start Hiring
            </a>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="inline-flex size-9 items-center justify-center rounded-full border md:hidden"
              style={{ borderColor: C.border }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                {mobileOpen
                  ? <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  : <path d="M3 5h10M3 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
              </svg>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t px-6 py-5"
              style={{ background: C.bg, borderColor: C.border }}
            >
              <div className="flex flex-col gap-4 text-[15px]">
                {[...navLinks, "Top Talent"].map(l => (
                  <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} onClick={() => setMobileOpen(false)} style={{ color: C.ink }}>{l}</a>
                ))}
                <a href="#pricing" onClick={() => setMobileOpen(false)} className="mt-1 self-start rounded-full px-5 py-2.5 text-sm font-bold text-white" style={{ background: C.brand }}>
                  Start Hiring
                </a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden px-6 pb-28 pt-36 text-center lg:px-8 lg:pb-36 lg:pt-48"
        style={{ background: `radial-gradient(70% 50% at 50% 0%, ${C.lavSoft} 0%, ${C.bg} 70%)` }}
      >
        {/* Floating emoji strip with parallax (Assistantly floating elements) */}
        <motion.div
          style={{ y: smoothY }}
          className="pointer-events-none absolute inset-x-0 top-24 flex justify-center gap-8 select-none"
          aria-hidden
        >
          {["🦄", "💰", "🚀", "✨", "🏆", "🤝", "⚡", "🎯"].map((e, i) => (
            <motion.span
              key={i}
              className="text-2xl lg:text-3xl opacity-70"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5 + i * 0.25, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }}
            >
              {e}
            </motion.span>
          ))}
        </motion.div>

        <div className="relative mx-auto max-w-250">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-widest"
            style={{ borderColor: C.lav, color: C.brand, background: C.lavSoft }}
          >
            <span className="size-1.5 animate-pulse rounded-full" style={{ background: C.brand }} />
            Unicorn Talent at 70% Less
          </motion.div>

          {/* Headline — SplitText letter reveal */}
          <h1
            className="font-extrabold tracking-tight"
            style={{ fontSize: "clamp(44px, 8vw, 96px)", lineHeight: 1.0, letterSpacing: "-0.03em" }}
          >
            <span className="block overflow-hidden">
              <SplitReveal text="Scale Faster with" delay={0.1} />
            </span>
            <span className="block overflow-hidden">
              <SplitReveal
                text="Unicorn Talent 🦄"
                delay={0.22}
                style={{
                  background: `linear-gradient(135deg, ${C.brand} 0%, #5B5BF5 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              />
            </span>
          </h1>

          {/* Sub */}
          <Reveal delay={0.45} className="mt-6">
            <p className="mx-auto max-w-2xl text-[17px] leading-relaxed" style={{ color: C.muted }}>
              From scaling startups to serious growth — world-class Admin, Ops, Marketing, Support, and Finance talent from the Philippines and Latin America.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.55} className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <motion.a
              href="#pricing"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-bold text-white"
              style={{ background: C.brand, boxShadow: `0 8px 32px ${C.brand}44` }}
            >
              Start Hiring
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10m0 0L8 3m4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </motion.a>
            <motion.a
              href="#unicorns"
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-[15px] font-semibold transition"
              style={{ borderColor: C.border, color: C.ink }}
            >
              Become a Unicorn
            </motion.a>
          </Reveal>

          {/* Stats */}
          <Reveal delay={0.65} className="mt-14">
            <div className="flex flex-wrap items-center justify-center gap-10">
              {[
                { val: 1000, suffix: "+", label: "Businesses Served" },
                { val: 70, suffix: "%", label: "Average Cost Savings" },
                { val: 14, suffix: " days", label: "Avg. Hire Time" },
                { val: 98, suffix: "%", label: "Client Satisfaction" },
              ].map(({ val, suffix, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-extrabold" style={{ color: C.brand, letterSpacing: "-0.03em" }}>
                    <Counter to={val} suffix={suffix} />
                  </div>
                  <div className="mt-1 text-[12px] font-medium" style={{ color: C.muted }}>{label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Gradual blur at bottom of hero */}
        <GradualBlur position="bottom" />
      </section>

      {/* ── Trust marquee ───────────────────────────────────────────────────── */}
      <div className="border-y py-5" style={{ borderColor: C.border, background: C.bgSoft }}>
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-widest" style={{ color: C.muted }}>
          Trusted by Growing Businesses &amp; Industry Leaders
        </p>
        <Marquee
          speed={30}
          items={[
            "Acquisition.com", "WFG Title", "Real Academy", "A3 Sports & Wellness",
            "Resides", "Modern Ventures", "Apex Growth", "Founders Club",
            "Scale Labs", "Studio One", "Meridian Partners", "NovaBridge",
          ]}
        />
      </div>

      {/* ── More than staffing: 5 pillars ───────────────────────────────────── */}
      <section className="relative px-6 py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-300">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-widest" style={{ background: C.lavSoft, color: C.brand }}>
                ✦ Our Approach
              </div>
              <h2 className="mt-4 font-extrabold tracking-tight" style={{ fontSize: "clamp(32px, 5vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.025em" }}>
                <SplitReveal text="More Than Staffing —" delay={0} stagger={0.018} />
                <br />
                <SplitReveal text="Your Unicorn Team," delay={0.2} stagger={0.018} style={{ color: C.brand }} />
                <br />
                <SplitReveal text="Fully Supported." delay={0.38} stagger={0.018} />
              </h2>
              <Reveal delay={0.2}>
                <p className="mt-5 text-[16px] leading-relaxed" style={{ color: C.muted }}>
                  We don&apos;t just fill roles. We build Unicorn teams with the skills, culture fit, and accountability to thrive long-term.
                </p>
              </Reveal>
            </Reveal>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { emoji: "🔍", title: "Sourcing & Vetting", desc: "AI-powered + human screening for skills and culture fit." },
                { emoji: "🚀", title: "Onboarding & Integration", desc: "Seamless setup so Unicorns plug right into your workflows." },
                { emoji: "📊", title: "Performance Monitoring", desc: "Built-in accountability to keep Unicorns aligned and growing." },
                { emoji: "🌐", title: "Compliance & Payroll", desc: "Hassle-free international hiring across PH + LATAM." },
                { emoji: "🏢", title: "Multi-Department Expertise", desc: "Admin, Ops, Marketing, Support, Finance & beyond.", wide: true },
              ].map((p, i) => (
                <Reveal key={p.title} delay={i * 0.07} className={p.wide ? "sm:col-span-2" : ""}>
                  <motion.div
                    whileHover={{ y: -3, boxShadow: "0 8px 30px rgba(19,19,156,0.08)" }}
                    className="h-full rounded-2xl border p-5 transition"
                    style={{ borderColor: C.border, background: C.bgCard }}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <p className="mt-2 text-[15px] font-bold">{p.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed" style={{ color: C.muted }}>{p.desc}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How we help: 4 benefit cards ────────────────────────────────────── */}
      <section className="px-6 py-28 lg:px-8 lg:py-36" style={{ background: C.bgSoft }}>
        <div className="mx-auto max-w-300">
          <Reveal className="mb-14 text-center">
            <h2 className="font-extrabold tracking-tight" style={{ fontSize: "clamp(30px, 4.5vw, 56px)", letterSpacing: "-0.025em" }}>
              How TalentHub Helps You Grow
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px]" style={{ color: C.muted }}>
              Every feature designed to remove friction and put elite talent in your corner — fast.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { emoji: "🚀", title: "Scale Faster", desc: "Hire Unicorns in as little as 10 days. We handle sourcing, vetting, and onboarding so you can expand without bottlenecks." },
              { emoji: "💰", title: "Save Smarter", desc: "Reduce costs by 60–70% while gaining top-tier offshore talent with both the hard and soft skills to thrive." },
              { emoji: "🥇", title: "Gain an Edge", desc: "Tap into deep talent pools in the Philippines and LATAM — professionals your competitors haven't discovered yet." },
              { emoji: "🤝", title: "Teams That Last", desc: "Our Leadership DNA™ Profile ensures every Unicorn is the right one-to-one match for your team." },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(19,19,156,0.10)" }}
                  className="flex h-full flex-col rounded-2xl border p-7"
                  style={{ background: C.bg, borderColor: C.border }}
                >
                  <span className="text-3xl">{card.emoji}</span>
                  <h3 className="mt-4 text-[18px] font-extrabold">{card.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed" style={{ color: C.muted }}>{card.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Department horizontal swiper (Swiper.js-style) ──────────────────── */}
      <section id="unicorns" className="relative overflow-hidden px-6 py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-300">
          <Reveal className="mb-14">
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-widest" style={{ background: C.lavSoft, color: C.brand }}>
              ✦ Departments
            </div>
            <h2 className="mt-4 font-extrabold tracking-tight" style={{ fontSize: "clamp(30px, 4.5vw, 56px)", letterSpacing: "-0.025em" }}>
              From Admin to Ops —<br />The Right Unicorn, Every Time
            </h2>
            <p className="mt-4 max-w-2xl text-[16px]" style={{ color: C.muted }}>
              Hire across departments — from day-to-day support to specialized roles.{" "}
              <span className="font-bold" style={{ color: C.ink }}>💰 Most roles: $2,500–$3,000 / month</span>
            </p>
          </Reveal>

          <DeptSlider />
        </div>
      </section>

      {/* ── Differentiators — white→indigo flip on hover ─────────────────────── */}
      <section className="px-6 py-28 lg:px-8 lg:py-36" style={{ background: C.bgSoft }}>
        <div className="mx-auto max-w-300">
          <Reveal className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-widest" style={{ background: C.lavSoft, color: C.brand }}>
              ✦ What Sets Us Apart
            </div>
            <h2 className="font-extrabold tracking-tight" style={{ fontSize: "clamp(30px, 4.5vw, 56px)", letterSpacing: "-0.025em" }}>
              What Makes TalentHub Different
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px]" style={{ color: C.muted }}>
              From how we match talent to how we support you long after the hire.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { emoji: "💬", num: "001", title: "Soft Skills First", desc: "We prioritise Unicorn Vibes™ — proactivity, initiative, and critical thinking — backed by world-class hard skills." },
              { emoji: "🎯", num: "002", title: "The Right Match", desc: "Our Leadership DNA™ Profile aligns each Unicorn to your leadership style for the perfect one-to-one fit." },
              { emoji: "💖", num: "003", title: "White-Glove Pods", desc: "Every client gets a Success Pod: your Unicorn, Client Success Manager, and Unicorn Success Manager." },
              { emoji: "✨", num: "004", title: "AI + Visibility", desc: "Unicorns get AI productivity tools. You get the TalentHub Dashboard with full visibility into time, tasks, and outcomes." },
            ].map((d, i) => (
              <Reveal key={d.title} delay={i * 0.07}>
                <DiffCard {...d} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process timeline ─────────────────────────────────────────────────── */}
      <section id="process" className="px-6 py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-300">
          <Reveal className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-widest" style={{ background: C.lavSoft, color: C.brand }}>
              ✦ How It Works
            </div>
            <h2 className="font-extrabold tracking-tight" style={{ fontSize: "clamp(30px, 4.5vw, 56px)", letterSpacing: "-0.025em" }}>
              Our Proven Hiring Process
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px]" style={{ color: C.muted }}>
              Simple, seamless, and risk-free — with full support before and after the hire.
            </p>
          </Reveal>

          {/* Phase labels */}
          <div className="mb-8 flex items-center gap-4">
            <span className="shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold" style={{ borderColor: C.border, color: C.muted }}>Before the hire</span>
            <div className="h-px flex-1" style={{ background: C.border }} />
            <span className="shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold" style={{ borderColor: C.border, color: C.muted }}>After the hire</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { step: "01", emoji: "🔎", title: "Discovery Session", desc: "We learn your goals and build your Leadership DNA™ Profile.", phase: "before" },
              { step: "02", emoji: "🧠", title: "Interviews & Selection", desc: "Review your pre-vetted Unicorn match. We handle the rest.", phase: "before" },
              { step: "03", emoji: "📞", title: "Kick-Off Call", desc: "Meet your Success Manager to finalise role and plan.", phase: "after" },
              { step: "04", emoji: "📋", title: "Onboarding Plan", desc: "We build a 90-Day Unicorn Success Plan tailored to you.", phase: "after" },
              { step: "05", emoji: "📈", title: "Ongoing Support", desc: "Continuous performance monitoring via your Success Pod.", phase: "after" },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.09}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 10px 32px rgba(19,19,156,0.09)" }}
                  className="relative flex flex-col rounded-2xl border p-6 h-full"
                  style={{
                    borderColor: s.phase === "before" ? C.border : C.lav,
                    background: s.phase === "before" ? C.bgCard : C.lavSoft,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="font-mono text-[11px] font-bold" style={{ color: C.brand }}>{s.step}</span>
                  </div>
                  <h3 className="mt-3 text-[16px] font-extrabold">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: C.muted }}>{s.desc}</p>

                  {/* Connector line between steps */}
                  {i < 4 && (
                    <div
                      className="absolute -right-2.5 top-1/2 hidden h-px w-5 lg:block"
                      style={{ background: C.border }}
                    />
                  )}
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-28 lg:px-8 lg:py-36" style={{ background: C.bgSoft }}>
        <GradualBlur position="top" />
        <div className="mx-auto max-w-300">
          <Reveal className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-widest" style={{ background: C.lavSoft, color: C.brand }}>
              ✦ What Our Clients Say
            </div>
            <h2 className="font-extrabold tracking-tight" style={{ fontSize: "clamp(30px, 4.5vw, 56px)", letterSpacing: "-0.025em" }}>
              Real Results, Real Teams
            </h2>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-3xl rounded-3xl border p-10 text-center"
              style={{ background: C.bg, borderColor: C.border }}
            >
              <span className="text-4xl">{TESTIMONIALS[activeTestimonial].emoji}</span>
              <p className="mx-auto mt-6 max-w-2xl text-[20px] font-semibold leading-snug" style={{ color: C.ink }}>
                &ldquo;{TESTIMONIALS[activeTestimonial].quote}&rdquo;
              </p>
              <div className="mt-6">
                <p className="font-extrabold">{TESTIMONIALS[activeTestimonial].name}</p>
                <p className="text-[13px]" style={{ color: C.muted }}>{TESTIMONIALS[activeTestimonial].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="mt-7 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                animate={{ width: i === activeTestimonial ? 24 : 8, background: i === activeTestimonial ? C.brand : C.lav }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div className="mt-5 flex items-center justify-center gap-3">
            {[
              { dir: "prev", icon: <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />, onClick: () => setActiveTestimonial(v => (v - 1 + TESTIMONIALS.length) % TESTIMONIALS.length) },
              { dir: "next", icon: <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />, onClick: () => setActiveTestimonial(v => (v + 1) % TESTIMONIALS.length) },
            ].map(({ dir, icon, onClick }) => (
              <motion.button
                key={dir}
                onClick={onClick}
                whileHover={{ scale: 1.08, borderColor: C.brand }}
                className="flex size-10 items-center justify-center rounded-full border transition"
                style={{ borderColor: C.border, color: C.ink }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">{icon}</svg>
              </motion.button>
            ))}
          </div>
        </div>
        <GradualBlur position="bottom" />
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-300">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-widest" style={{ background: C.lavSoft, color: C.brand }}>
                ✦ FAQ
              </div>
              <h2 className="mt-2 font-extrabold tracking-tight" style={{ fontSize: "clamp(28px, 4vw, 52px)", letterSpacing: "-0.025em" }}>
                Frequently<br />Asked Questions
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: C.muted }}>
                Don&apos;t see what you&apos;re looking for? Write us — a real person responds within a business day.
              </p>
              <a href="#" className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-bold transition hover:opacity-70" style={{ color: C.brand }}>
                Contact support →
              </a>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-8">
              {[
                { q: "Where does TalentHub source its talent?", a: "We work with offshore professionals primarily from the Philippines and Latin America — regions known for strong English proficiency, cultural compatibility with Western business practices, and a deep talent pool across many disciplines.", open: true },
                { q: "What roles can I hire through TalentHub?", a: "You can hire across Admin, Operations, Marketing, Customer Support, Finance, and niche roles including eCommerce, real estate, CRM automation, podcast production, and more." },
                { q: "How fast can I hire a Unicorn?", a: "On average, we place Unicorns in 14 days or less — discovery to interviews in days, not weeks." },
                { q: "How does pricing work?", a: "Most roles are $2,500–$3,000/month, while niche or highly specialized roles start at $3,000+/month. No hidden fees, ever." },
                { q: "What if my Unicorn isn't the right fit?", a: "We offer a risk-free replacement guarantee. If a Unicorn isn't the right fit, we find you a new match at no extra cost." },
                { q: "How do you ensure Unicorns are the right match?", a: "Every Unicorn goes through skills assessments, cognitive and behavioral testing, and soft skills screening using our Leadership DNA™ Profile — monitored by Success Managers with full dashboard visibility." },
              ].map((item, i) => (
                <FaqRow key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-6 py-32 text-center lg:px-8 lg:py-44"
        style={{ background: `radial-gradient(70% 60% at 50% 50%, ${C.lavSoft} 0%, ${C.bg} 70%)` }}
      >
        <GradualBlur position="top" />
        <Reveal>
          <motion.span
            className="inline-block text-6xl"
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🦄
          </motion.span>
          <h2
            className="mx-auto mt-5 font-extrabold tracking-tight"
            style={{ fontSize: "clamp(36px, 6vw, 80px)", letterSpacing: "-0.03em", maxWidth: 800, lineHeight: 1.02 }}
          >
            Unicorn Talent for Modern Teams
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed" style={{ color: C.muted }}>
            Join 1,000+ businesses that trust TalentHub to scale their team with world-class talent at a fraction of the cost.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.a
              href="#pricing"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-[16px] font-bold text-white"
              style={{ background: C.brand, boxShadow: `0 12px 40px ${C.brand}55` }}
            >
              Start Hiring Today →
            </motion.a>
            <a
              href="#unicorns"
              className="inline-flex items-center gap-2 rounded-full border px-8 py-4 text-[16px] font-semibold transition hover:bg-zinc-50"
              style={{ borderColor: C.border, color: C.ink }}
            >
              Explore Unicorns
            </a>
          </div>
          <p className="mt-6 text-[13px]" style={{ color: C.muted }}>
            No contracts. Risk-free replacement. Avg. hire in 14 days.
          </p>
        </Reveal>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t pb-10 pt-16" style={{ borderColor: C.border, background: C.bgSoft }}>
        <div className="mx-auto max-w-300 px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
            <div className="col-span-2">
              <a href="#" className="flex items-center gap-2">
                <span className="text-2xl">🦄</span>
                <span className="text-[16px] font-extrabold tracking-tight" style={{ color: C.brand }}>TalentHub</span>
              </a>
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed" style={{ color: C.muted }}>
                Strategic partners for founders. World-class talent from the Philippines and LATAM, fully supported.
              </p>
              <p className="mt-4 text-[12px] font-medium" style={{ color: C.muted }}>support@talenthub.com</p>
            </div>
            {[
              { heading: "Explore", links: ["Home", "Unicorns", "Process", "Pricing", "About Us"] },
              { heading: "Learn & Proof", links: ["Case Studies", "Top Talent", "Blog", "Affiliates", "Careers"] },
              { heading: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
            ].map(col => (
              <div key={col.heading}>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>{col.heading}</p>
                <ul className="space-y-3 text-[13px]">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="transition hover:text-black" style={{ color: C.muted }}>{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8 text-[12px]" style={{ borderColor: C.border, color: C.muted }}>
            <p>© {new Date().getFullYear()} TalentHub. All rights reserved.</p>
            <div className="flex gap-5">
              {["Privacy", "Terms", "Cookies"].map(l => (
                <a key={l} href="#" className="transition hover:text-black">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
