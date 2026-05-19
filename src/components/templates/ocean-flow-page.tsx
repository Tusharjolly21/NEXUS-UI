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
import { InfiniteMovingCards } from "@/components/infinite-moving-cards/InfiniteMovingCards";
import type { InfiniteMovingCardItem } from "@/components/infinite-moving-cards/InfiniteMovingCards";

// ── Lenis smooth scroll ──────────────────────────────────────────────────────
function useLenis() {
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenis: any = null;
    let rafId: number;

    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      if (lenis) lenis.destroy();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
}

// ── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-8% 0px" });

  const initial =
    direction === "left"
      ? { opacity: 0, x: -40 }
      : direction === "right"
        ? { opacity: 0, x: 40 }
        : { opacity: 0, y: 36 };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Count-up number ──────────────────────────────────────────────────────────
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [val, setVal] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const dur = 1800;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(e * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {val}
      {suffix}
    </span>
  );
}

// ── FAQ Accordion ────────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5 text-left text-[15px] font-medium text-white/90 transition hover:text-white"
      >
        {q}
        <span
          className={cn(
            "ml-4 flex size-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/60 transition-transform duration-300",
            open && "rotate-45 border-cyan-400/60 bg-cyan-400/10 text-cyan-300",
          )}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M5 1v8M1 5h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[14px] leading-relaxed text-white/50">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name: "AquaVision Pro Mask",
    tagline: "See the deep in full clarity",
    price: "$349",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80&auto=format&fit=crop",
    badge: "Best Seller",
  },
  {
    name: "TidalForce Fins",
    tagline: "Engineered for effortless thrust",
    price: "$229",
    image:
      "https://images.unsplash.com/photo-1682687982107-14492010e05e?w=800&q=80&auto=format&fit=crop",
    badge: "New",
  },
  {
    name: "DeepBreath Regulator",
    tagline: "Smooth air delivery at any depth",
    price: "$689",
    image:
      "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80&auto=format&fit=crop",
    badge: null,
  },
  {
    name: "OceanGuard BCD",
    tagline: "Lift when you need, trim when you don't",
    price: "$879",
    image:
      "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&q=80&auto=format&fit=crop",
    badge: "Pro Pick",
  },
];

const GALLERY = [
  "https://images.unsplash.com/photo-1498623116890-37e912163d5d?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=900&q=80&auto=format&fit=crop",
];

const TESTIMONIALS_ROW_1: InfiniteMovingCardItem[] = [
  {
    id: "r1-1",
    description: "Ocean Flow gear changed how I experience the water. The mask clarity alone is worth every penny — I can finally see the reef the way it deserves to be seen.",
    name: "Mara Tanaka",
    role: "PADI Dive Master · Palawan",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
    tags: ["AquaVision Pro Mask"],
  },
  {
    id: "r1-2",
    description: "TidalForce fins are the only pair I'll bring on a trip now. Fifteen years of diving and nothing comes close for thrust efficiency.",
    name: "Jonas Becker",
    role: "Underwater Photographer · Red Sea",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    tags: ["TidalForce Fins"],
  },
  {
    id: "r1-3",
    description: "From the packaging to the first breath at 30 m — every detail screams quality. The DeepBreath regulator is buttery smooth at any depth.",
    name: "Celia Moreno",
    role: "Marine Biologist · Galapagos",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=240&q=80",
    tags: ["DeepBreath Regulator"],
  },
  {
    id: "r1-4",
    description: "The OceanGuard BCD fit perfectly out of the box. Trim is spot-on and the lift bladder responds instantly. Best piece of kit I've owned.",
    name: "Sam Reeves",
    role: "Technical Diver · Great Barrier Reef",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
    tags: ["OceanGuard BCD"],
  },
  {
    id: "r1-5",
    description: "I run dive courses for beginners. Ocean Flow gear is the first thing I recommend — robust enough to survive students, precise enough for pros.",
    name: "Aiko Hashimoto",
    role: "SSI Instructor · Okinawa",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=240&q=80",
    tags: ["Full Gear Set"],
  },
];

const TESTIMONIALS_ROW_2: InfiniteMovingCardItem[] = [
  {
    id: "r2-1",
    description: "The anti-fog coating on the AquaVision mask is no gimmick — 40 dives in and I haven't touched defogging solution once.",
    name: "Luca Ferrari",
    role: "Spearfisher · Sardinia",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80",
    tags: ["AquaVision Pro Mask"],
  },
  {
    id: "r2-2",
    description: "Customer service sorted my regulator service in 48 hours, zero hassle. That kind of post-sale care is rare in dive equipment.",
    name: "Priya Nair",
    role: "Rescue Diver · Lakshadweep",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
    tags: ["Service & Support"],
  },
  {
    id: "r2-3",
    description: "Took the TidalForce fins to a 3-knot current dive in the Azores. My legs thanked me. Would not attempt that site with anything lighter.",
    name: "Erik Lindqvist",
    role: "Expedition Diver · Azores",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
    tags: ["TidalForce Fins"],
  },
  {
    id: "r2-4",
    description: "I shot a full documentary series using Ocean Flow gear. The equipment never missed a beat, even under production pressure at depth.",
    name: "Mei Chen",
    role: "Ocean Filmmaker · Taiwan",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80",
    tags: ["Full Gear Set"],
  },
  {
    id: "r2-5",
    description: "The salt-water grade alloys actually hold up. After two years diving in the Red Sea, my kit still looks and performs like new.",
    name: "Omar Khalil",
    role: "Cave Diver · Dahab",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=240&q=80",
    tags: ["DeepBreath Regulator"],
  },
];

const FAQS = [
  {
    q: "What certification do I need to use the DeepBreath Regulator?",
    a: "Any open-water certification (PADI, SSI, NAUI) qualifies you to use all Ocean Flow regulators recreationally down to 40 m. Technical divers will need appropriate tec certifications for depth beyond that.",
  },
  {
    q: "Do you offer a trial period?",
    a: "Yes — every product ships with a 60-day ocean-tested guarantee. If it doesn't perform as described, we cover return shipping and issue a full refund.",
  },
  {
    q: "Can I service my regulator myself?",
    a: "We recommend annual servicing by a certified technician. Ocean Flow service kits are available for experienced divers, and our service network covers 48 countries.",
  },
  {
    q: "Are your products suitable for cold water diving?",
    a: "All Ocean Flow gear is rated for water temperatures from 4 °C to 35 °C. For drysuit diving in sub-10 °C water we recommend our Arctic Series add-ons.",
  },
];

const TECH_FEATURES = [
  {
    icon: "◈",
    title: "Hydrodynamic shell",
    body: "Computational fluid dynamics used on every fin blade. Less drag, more distance per kick.",
  },
  {
    icon: "◉",
    title: "Anti-fog nanotec",
    body: "Our proprietary SilverCoat nano-layer eliminates fogging without chemicals — rated 500+ dives.",
  },
  {
    icon: "◎",
    title: "Depth-matched seals",
    body: "Regulator seats re-calibrate automatically as pressure changes. Consistent flow from surface to 60 m.",
  },
  {
    icon: "◐",
    title: "Salt-water grade alloys",
    body: "316L marine stainless and DuoChrome anodised aluminium on every load-bearing part.",
  },
];

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/5 bg-[#050d1a]/90 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600">
            <svg viewBox="0 0 20 20" className="size-4 fill-white">
              <path d="M10 2C6 2 3 6 3 10s3 8 7 8 7-3.6 7-8-3-8-7-8zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 10c-2.5 0-4.7-1.3-6-3.3.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1C14.7 13.7 12.5 15 10 15z" />
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">
            OceanFlow
          </span>
        </motion.div>

        {/* Desktop links */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden items-center gap-8 md:flex"
        >
          {["Gear", "Technology", "About", "Journal"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-[13px] font-medium text-white/60 transition hover:text-white"
            >
              {item}
            </a>
          ))}
        </motion.nav>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="hidden items-center gap-3 md:flex"
        >
          <a
            href="#"
            className="text-[13px] font-medium text-white/60 transition hover:text-white"
          >
            Log in
          </a>
          <a
            href="#"
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
          >
            Shop now
          </a>
        </motion.div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex size-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:bg-white/5 md:hidden"
        >
          {menuOpen ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path
                d="M0 1h16M0 6h16M0 11h16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/5 bg-[#050d1a]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {["Gear", "Technology", "About", "Journal"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="py-2 text-[14px] font-medium text-white/70 transition hover:text-white"
                >
                  {item}
                </a>
              ))}
              <a
                href="#"
                className="mt-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-center text-[13px] font-semibold text-white"
              >
                Shop now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── Hero section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex h-[100svh] items-center justify-center overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <img
          src="https://images.unsplash.com/photo-1510074232337-05d50fa189ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Ocean diver"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050d1a]/60 via-[#050d1a]/30 to-[#050d1a]" />
      </motion.div>

      {/* Animated water ripples */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10"
            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
            transition={{
              duration: 4,
              delay: i * 1.3,
              repeat: Infinity,
              ease: "easeOut",
            }}
            style={{ width: 300, height: 300 }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
        style={{ opacity }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-400/80"
        >
          Precision diving equipment
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-bold leading-[1.0] tracking-[-0.03em] text-white"
          style={{ fontSize: "clamp(52px, 8vw, 108px)" }}
        >
          Dive deeper.
          <br />
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Fear less.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mx-auto mt-7 max-w-md text-[16px] leading-relaxed text-white/55"
        >
          Equipment born from the world&apos;s most demanding dive sites. Built
          for professionals, perfect for everyone beneath the surface.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#gear"
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-[14px] font-semibold text-white shadow-xl shadow-cyan-500/25 transition hover:brightness-110"
          >
            Explore the gear
          </a>
          <a
            href="#"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-[14px] font-medium text-white/80 backdrop-blur transition hover:bg-white/10"
          >
            Watch film
            <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 4l6 4-6 4V4z" />
            </svg>
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5"
        >
          <div className="h-2 w-1 rounded-full bg-cyan-400/70" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Stats band ───────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: 60, suffix: " m", label: "Max tested depth" },
    { value: 500, suffix: "+", label: "Dive-rated durability" },
    { value: 48, suffix: "", label: "Service countries" },
    { value: 12, suffix: "yr", label: "Ocean-tested R&D" },
  ];

  return (
    <section className="border-y border-white/5 bg-[#071020]/80 py-14 backdrop-blur">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="text-center">
                <p className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                  <CountUp to={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-[12px] uppercase tracking-[0.15em] text-white/40">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Philosophy ───────────────────────────────────────────────────────────────
function PhilosophySection() {
  return (
    <section className="py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 md:grid-cols-2 lg:gap-28">
          <Reveal direction="left">
            <div>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-400/70">
                Our philosophy
              </p>
              <h2
                className="font-bold leading-[1.05] tracking-[-0.02em] text-white"
                style={{ fontSize: "clamp(36px, 4.5vw, 58px)" }}
              >
                Built by divers,
                <br />
                <span className="text-white/40">tested by the ocean.</span>
              </h2>
              <p className="mt-7 text-[15px] leading-relaxed text-white/50">
                Every piece of Ocean Flow equipment spends a minimum of 300
                hours underwater before it reaches your hands. Our design team
                are active divers. Our test team are professional instructors.
                The ocean is the only lab that matters.
              </p>
              <div className="mt-10 flex flex-col gap-4">
                {[
                  "Designed in partnership with PADI professionals",
                  "Carbon-neutral manufacturing since 2022",
                  "300+ hours pre-release ocean testing",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-[14px] text-white/60"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-400 text-[10px]">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.15}>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl">
                <img
                  src="https://images.unsplash.com/photo-1517627043994-b991abb62fc8?q=80&w=1017&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Diver testing gear"
                  className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-[1.03]"
                />
              </div>
              {/* Float badge */}
              <div className="absolute -bottom-5 -left-5 rounded-2xl border border-white/10 bg-[#071020]/90 p-4 backdrop-blur-lg">
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">
                  Est.
                </p>
                <p className="text-2xl font-bold text-white">2012</p>
                <p className="text-[12px] text-cyan-400/80">Coral Bay, WA</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Horizontal gallery ───────────────────────────────────────────────────────
function GallerySection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-20%"]);

  return (
    <section ref={containerRef} className="overflow-hidden py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-400/70">
            The world below
          </p>
          <h2
            className="mb-16 font-bold tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            Every dive, a new world.
          </h2>
        </Reveal>
      </div>

      <div className="overflow-hidden">
        <motion.div
          style={{ x }}
          className="flex gap-5 pl-[max(1.5rem,calc((100vw-80rem)/2))]"
        >
          {GALLERY.map((src, i) => (
            <div
              key={i}
              className="relative aspect-[3/4] w-[min(320px,70vw)] shrink-0 overflow-hidden rounded-3xl"
            >
              <img
                src={src}
                alt={`Gallery ${i + 1}`}
                className="h-full w-full object-cover transition duration-700 hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Products grid ────────────────────────────────────────────────────────────
function ProductsSection() {
  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <section id="gear" className="py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-400/70">
            Featured gear
          </p>
          <h2
            className="mb-4 font-bold tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            The essentials.
          </h2>
          <p className="mb-16 max-w-lg text-[15px] leading-relaxed text-white/45">
            Four flagship products. Each one designed from first principles with
            ocean professionals.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.07}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-white/8 bg-white/3"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className={cn(
                      "h-full w-full object-cover transition duration-700",
                      hovered === i ? "scale-[1.06]" : "scale-100",
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a] via-transparent to-transparent" />
                  {p.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-cyan-500/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      {p.badge}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/35">
                    {p.tagline}
                  </p>
                  <h3 className="mt-1 text-[16px] font-semibold text-white">
                    {p.name}
                  </h3>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[15px] font-bold text-cyan-400">
                      {p.price}
                    </span>
                    <button
                      type="button"
                      className="rounded-full border border-white/15 px-3.5 py-1.5 text-[11px] font-medium text-white/70 transition hover:border-cyan-400/40 hover:text-cyan-300"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Technology ───────────────────────────────────────────────────────────────
function TechnologySection() {
  return (
    <section className="py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-400/70">
                How we engineer it
              </p>
              <h2
                className="font-bold leading-[1.05] tracking-[-0.02em] text-white"
                style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}
              >
                Technology at the
                <br />
                <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                  edge of physics.
                </span>
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-white/50">
                Years of R&D distilled into products that perform where most
                materials fail — cold, pressurized, and salt-laden water.
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col gap-6">
            {TECH_FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.09}>
                <div className="rounded-2xl border border-white/8 bg-white/3 p-6 transition hover:border-cyan-500/20 hover:bg-cyan-500/3">
                  <span className="text-2xl text-cyan-400/70">{f.icon}</span>
                  <h3 className="mt-3 text-[16px] font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/45">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Full-bleed video / editorial ──────────────────────────────────────────────
function EditorialSection() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.92]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [40, 0]);

  return (
    <section ref={ref} className="py-16 md:py-24">
      <motion.div
        style={{ scale }}
        className="relative mx-auto max-w-[1600px] overflow-hidden rounded-[40px]"
      >
        <img
          src="https://images.unsplash.com/photo-1567628065080-ecdec09a7588?q=80&w=1960&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Ocean depth"
          className="h-[60vh] w-full object-cover md:h-[80vh]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a]/80 via-[#050d1a]/20 to-transparent" />
        <motion.div
          style={{ y: textY }}
          className="absolute bottom-10 left-10 right-10 md:bottom-16 md:left-16"
        >
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-400/80">
            New for 2026
          </p>
          <h2
            className="max-w-2xl font-bold leading-[1.05] tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(30px, 4vw, 60px)" }}
          >
            AquaVision Pro Mk II — see in three dimensions.
          </h2>
          <a
            href="#"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-[13px] font-medium text-white backdrop-blur transition hover:bg-white/15"
          >
            Discover more
            <svg className="size-3.5" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 7h12M8 3l5 4-5 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────────────────────
function OceanTestimonialCard({ item }: { item: InfiniteMovingCardItem }) {
  const rating = item.rating ?? 5;
  return (
    <div
      className="flex w-[min(22rem,calc(100vw-3rem))] shrink-0 flex-col rounded-2xl border border-white/8 bg-white/3 p-6 transition-transform hover:-translate-y-0.5"
      style={{ backdropFilter: "blur(8px)" }}
    >
      {/* Stars */}
      <div className="mb-4 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={cn("size-3", i < rating ? "text-cyan-400" : "text-white/15")}
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <path d="M6 1l1.4 3h3.1L8 6.2l1 3L6 7.4l-3 1.8 1-3L1.5 4H4.6z" />
          </svg>
        ))}
      </div>

      <p className="flex-1 text-[14px] leading-relaxed text-white/65">
        &ldquo;{item.description}&rdquo;
      </p>

      {item.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-cyan-500/20 bg-cyan-500/8 px-2.5 py-0.5 text-[10px] font-medium text-cyan-400/80"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex items-center gap-3 border-t border-white/6 pt-5">
        {item.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.avatar}
            alt={item.name ?? ""}
            className="size-9 rounded-full border border-white/10 object-cover"
            loading="lazy"
          />
        ) : null}
        <div>
          <p className="text-[13px] font-semibold text-white">{item.name}</p>
          <p className="text-[11px] text-white/40">{item.role}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  return (
    <section className="overflow-hidden py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-400/70">
            From the community
          </p>
          <h2
            className="mb-16 font-bold tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            Trusted below 30 m.
          </h2>
        </Reveal>
      </div>

      <div className="flex flex-col gap-4">
        {[
          { items: TESTIMONIALS_ROW_1, direction: "left" as const },
          { items: TESTIMONIALS_ROW_2, direction: "right" as const },
        ].map(({ items, direction }) => (
          <div key={direction} className="relative">
            <InfiniteMovingCards
              items={items}
              direction={direction}
              speed="slow"
              pauseOnHover
              gap={16}
              showGradientMask={false}
              renderItem={(item) => <OceanTestimonialCard item={item} />}
            />
            {/* Ocean-matched gradient masks */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-linear-to-r from-[#050d1a] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-linear-to-l from-[#050d1a] to-transparent" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── FAQ section ───────────────────────────────────────────────────────────────
function FAQSection() {
  return (
    <section className="py-24 md:py-36">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-400/70">
            Have questions?
          </p>
          <h2
            className="mb-12 font-bold tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            Common dives.
          </h2>
        </Reveal>

        <div className="rounded-3xl border border-white/8 bg-white/3 px-6 py-2 md:px-8">
          {FAQS.map((faq) => (
            <FAQ key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600">
                <svg viewBox="0 0 20 20" className="size-4 fill-white">
                  <path d="M10 2C6 2 3 6 3 10s3 8 7 8 7-3.6 7-8-3-8-7-8zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 10c-2.5 0-4.7-1.3-6-3.3.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1C14.7 13.7 12.5 15 10 15z" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-white">
                OceanFlow
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-white/40">
              Precision diving equipment. Built for the ocean, tested below it.
            </p>
          </div>

          {/* Links */}
          {[
            {
              heading: "Gear",
              links: ["Masks", "Fins", "Regulators", "BCDs", "Wetsuits"],
            },
            {
              heading: "Company",
              links: ["About", "Journal", "Careers", "Press"],
            },
            {
              heading: "Support",
              links: ["FAQ", "Warranty", "Service Centers", "Contact"],
            },
          ].map((col) => (
            <div key={col.heading}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/35">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[13px] text-white/50 transition hover:text-white"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 text-[12px] text-white/30 md:flex-row md:items-center">
          <p>© 2026 OceanFlow. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <a key={l} href="#" className="transition hover:text-white/60">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export function OceanFlowPage() {
  useLenis();

  return (
    <div className="min-h-screen bg-[#050d1a] font-sans antialiased">
      <Nav />
      <HeroSection />
      <StatsSection />
      <PhilosophySection />
      <GallerySection />
      <ProductsSection />
      <TechnologySection />
      <EditorialSection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
