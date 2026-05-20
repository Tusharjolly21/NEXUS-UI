"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  ArrowUpRight,
  Play,
  Layers,
  Globe,
  Film,
  BarChart2,
  ChevronRight,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react";

// ─── Lenis smooth scroll hook ────────────────────────────────────────────────
function useLenis() {
  React.useEffect(() => {
    let lenis: any = null;
    let rafId: number;

    import("@studio-freight/lenis")
      .then((mod) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Lenis = (mod.default ?? (mod as any).Lenis) as any;
        lenis = new Lenis({ lerp: 0.08 });

        function raf(time: number) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
      })
      .catch(() => {
        // lenis not installed — silently fall back to native scroll
      });

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy?.();
    };
  }, []);
}

// ─── Magnetic button ─────────────────────────────────────────────────────────
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  dark?: boolean;
}

function MagneticButton({
  children,
  className = "",
  strength = 0.35,
  onClick,
  dark = false,
}: MagneticButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 180, damping: 18 });
  const y = useSpring(rawY, { stiffness: 180, damping: 18 });

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = ref.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rawX.set((e.clientX - cx) * strength);
    rawY.set((e.clientY - cy) * strength);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-flex items-center gap-2 font-medium tracking-tight select-none transition-colors ${
        dark
          ? "bg-[#f8f6f2] text-black hover:bg-white"
          : "bg-black text-[#f8f6f2] hover:bg-neutral-800"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────
interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  from?: "bottom" | "left" | "right";
}

function Reveal({ children, delay = 0, className = "", from = "bottom" }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  const variants = {
    hidden: {
      opacity: 0,
      y: from === "bottom" ? 40 : 0,
      x: from === "left" ? -40 : from === "right" ? 40 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hero headline word stagger ───────────────────────────────────────────────
function StaggerHeadline({ text }: { text: string }) {
  const ref = React.useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const words = text.split(" ");

  return (
    <h1
      ref={ref}
      className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <motion.span
            className="inline-block overflow-hidden"
            initial={{ opacity: 0, y: "110%" }}
            animate={inView ? { opacity: 1, y: "0%" } : {}}
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1 + i * 0.07,
            }}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </h1>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Work", "Services", "About", "Contact"];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#f8f6f2]/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          Studio Deck
        </a>

        {/* Links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium text-neutral-600 hover:text-black transition-colors"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <MagneticButton className="rounded-full px-5 py-2.5 text-sm">
          Let&apos;s talk <ArrowUpRight size={14} />
        </MagneticButton>
      </nav>
    </motion.header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, -80]);

  return (
    <section
      id="work"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background glass layers */}
      <motion.div
        style={{ y: parallaxY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute top-20 left-10 w-[480px] h-[480px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle at center, #d4c9b0 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-10 right-10 w-[360px] h-[360px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle at center, #b8a98a 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* Glass cards */}
        <div
          className="absolute top-32 right-16 w-48 h-28 rounded-2xl hidden lg:block"
          style={{
            background: "rgba(255,255,255,0.35)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          }}
        />
        <div
          className="absolute bottom-32 left-12 w-36 h-20 rounded-2xl hidden lg:block"
          style={{
            background: "rgba(255,255,255,0.25)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-28 flex flex-col gap-10">
        {/* Label */}
        <Reveal>
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500 border border-neutral-300 rounded-full px-4 py-1.5"
          >
            Creative Agency — Est. 2019
          </span>
        </Reveal>

        {/* Headline */}
        <div className="max-w-4xl">
          <StaggerHeadline text="We craft brands that move people" />
        </div>

        {/* Sub row */}
        <Reveal delay={0.4}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <p className="max-w-sm text-base md:text-lg text-neutral-500 leading-relaxed">
              An independent creative studio obsessed with brand storytelling,
              digital experiences, and bold ideas that last.
            </p>

            {/* Stat */}
            <div
              className="shrink-0 px-6 py-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <p className="text-3xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>
                180+
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">Happy clients worldwide</p>
            </div>
          </div>
        </Reveal>

        {/* Buttons */}
        <Reveal delay={0.55}>
          <div className="flex items-center gap-4 flex-wrap">
            <MagneticButton className="rounded-full px-7 py-3.5 text-sm">
              View our work <ArrowUpRight size={14} />
            </MagneticButton>

            {/* Reel button */}
            <button className="group flex items-center gap-3 text-sm font-medium text-neutral-700 hover:text-black transition-colors">
              <span
                className="flex items-center justify-center w-11 h-11 rounded-full border border-neutral-300 group-hover:border-black transition-colors group-hover:scale-105 transform duration-200"
              >
                <Play size={14} fill="currentColor" />
              </span>
              Watch reel
            </button>
          </div>
        </Reveal>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-400"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-neutral-400 to-transparent"
          />
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Services bento ───────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: Layers,
    title: "Brand Identity",
    desc: "Logos, marks, type systems, and visual language that set you apart for decades.",
    span: "md:col-span-2",
  },
  {
    icon: Globe,
    title: "Web Design",
    desc: "Pixel-perfect interfaces engineered for conversion and delight.",
    span: "",
  },
  {
    icon: Film,
    title: "Motion & Film",
    desc: "Brand films, UI animations, and campaign content that captivates.",
    span: "",
  },
  {
    icon: BarChart2,
    title: "Strategy",
    desc: "Positioning, audience insight, and narrative architecture.",
    span: "md:col-span-2",
  },
];

function Services() {
  return (
    <section id="services" className="py-28 max-w-7xl mx-auto px-6 md:px-10">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-neutral-400">
              02 — Services
            </span>
            <h2
              className="text-4xl md:text-5xl font-bold mt-2 tracking-tight"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              What we do
            </h2>
          </div>
          <p className="max-w-xs text-neutral-500 text-sm leading-relaxed">
            End-to-end creative services from concept to production.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SERVICES.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <Reveal key={svc.title} delay={i * 0.1} className={svc.span}>
              <motion.div
                whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(0,0,0,0.09)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group h-full rounded-2xl border border-neutral-200 bg-white p-8 cursor-pointer flex flex-col gap-6"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{svc.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{svc.desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-xs font-medium text-neutral-400 group-hover:text-black transition-colors">
                  Learn more <ChevronRight size={12} />
                </div>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ─── Case studies ─────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    title: "Apex Fashion Brand",
    category: "Brand Identity",
    year: "2024",
    color: "#1a1a2e",
    textColor: "#e8d5b7",
    desc: "Full rebrand for a premium fashion house — new visual identity, campaign art direction, and e-commerce experience.",
  },
  {
    title: "Meridian App Launch",
    category: "Web Design · Motion",
    year: "2023",
    color: "#0d3b2e",
    textColor: "#b8e0c8",
    desc: "Go-to-market identity and animated product launch for a B2B SaaS platform targeting logistics companies.",
  },
  {
    title: "Nova Festival Identity",
    category: "Brand · Print · Film",
    year: "2023",
    color: "#2d1b4e",
    textColor: "#d4b8f0",
    desc: "Complete festival branding from logo to stage graphics, wristbands, and a 90-second hype film.",
  },
];

function CaseStudies() {
  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <section id="about" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-neutral-400">
                03 — Work
              </span>
              <h2
                className="text-4xl md:text-5xl font-bold mt-2 tracking-tight"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
              >
                Selected work
              </h2>
            </div>
            <button className="flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 text-neutral-600 hover:text-black transition-colors">
              View all projects <ArrowUpRight size={14} />
            </button>
          </div>
        </Reveal>

        <div className="flex flex-col divide-y divide-neutral-100">
          {PROJECTS.map((project, i) => (
            <Reveal key={project.title} delay={i * 0.12}>
              <div
                className="relative group py-8 cursor-pointer overflow-hidden"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6 md:gap-10">
                    <span
                      className="text-xs font-semibold text-neutral-300 shrink-0 hidden sm:block"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3
                        className="text-xl md:text-2xl font-semibold group-hover:translate-x-1 transition-transform duration-300"
                        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                      >
                        {project.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">{project.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="text-sm text-neutral-400 hidden md:block">{project.year}</span>
                    <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all duration-300">
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <AnimatePresence>
                  {hovered === i && (
                    <motion.div
                      key="overlay"
                      initial={{ opacity: 0, y: "100%" }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: "100%" }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 flex items-center justify-between px-6 md:px-16 rounded-xl z-10"
                      style={{ backgroundColor: project.color }}
                    >
                      <div>
                        <p
                          className="text-xl md:text-2xl font-semibold"
                          style={{ color: project.textColor, fontFamily: "'Georgia', serif" }}
                        >
                          {project.title}
                        </p>
                        <p className="text-sm mt-2 max-w-md leading-relaxed opacity-80" style={{ color: project.textColor }}>
                          {project.desc}
                        </p>
                      </div>
                      <div
                        className="shrink-0 w-10 h-10 rounded-full border flex items-center justify-center"
                        style={{ borderColor: project.textColor, color: project.textColor }}
                      >
                        <ArrowUpRight size={16} />
                      </div>
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

// ─── Process ──────────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", label: "Brief", icon: Mail, desc: "We listen deeply and ask the questions others don't." },
  { num: "02", label: "Strategy", icon: BarChart2, desc: "Data-driven positioning with a creative edge." },
  { num: "03", label: "Design", icon: Layers, desc: "Iterations until every pixel earns its place." },
  { num: "04", label: "Deliver", icon: Globe, desc: "Handoff, launch support, and ongoing partnership." },
];

function Process() {
  return (
    <section className="py-28 max-w-7xl mx-auto px-6 md:px-10">
      <Reveal>
        <div className="mb-14">
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-neutral-400">
            04 — Process
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold mt-2 tracking-tight"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            How we work
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <Reveal key={step.num} delay={i * 0.1}>
              <div className="relative p-8 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-400 transition-colors group h-full flex flex-col gap-5">
                <span
                  className="text-5xl font-bold text-neutral-100 absolute top-6 right-6 select-none"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {step.num}
                </span>
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300 z-10">
                  <Icon size={18} />
                </div>
                <div className="z-10">
                  <h3 className="text-lg font-semibold">{step.label}</h3>
                  <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "50+", label: "Projects delivered" },
  { value: "98%", label: "Repeat clients" },
  { value: "12", label: "Industry awards" },
];

function About() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <Reveal>
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-neutral-400">
            05 — Studio
          </span>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <Reveal from="left" delay={0.1}>
            <div className="flex flex-col gap-7">
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight leading-tight"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
              >
                The studio
              </h2>
              <p className="text-neutral-500 leading-relaxed text-base md:text-lg max-w-md">
                Founded in 2019, Studio Deck is a tight-knit team of 12 designers,
                strategists, and filmmakers operating across 3 continents. We partner
                with ambitious founders and established companies alike.
              </p>
              <p className="text-neutral-500 leading-relaxed text-sm max-w-md">
                We believe the best creative work comes from genuine collaboration.
                Every engagement starts with listening — really listening — before
                a single pixel is drawn or a word is written.
              </p>
              <MagneticButton className="rounded-full px-7 py-3 text-sm self-start">
                Meet the team <ArrowUpRight size={14} />
              </MagneticButton>
            </div>
          </Reveal>

          {/* Right — stats */}
          <Reveal from="right" delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={0.15 + i * 0.1}>
                  <div className="rounded-2xl border border-neutral-200 p-8 flex flex-col gap-1 hover:border-neutral-400 transition-colors">
                    <span
                      className="text-4xl font-bold"
                      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    >
                      {s.value}
                    </span>
                    <span className="text-sm text-neutral-500">{s.label}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section
      id="contact"
      className="py-36 bg-black text-[#f8f6f2] overflow-hidden relative"
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #ffffff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 flex flex-col items-center text-center gap-10">
        <Reveal>
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-neutral-400">
            06 — Let&apos;s work together
          </span>
        </Reveal>

        <Reveal delay={0.1}>
          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Ready to build something iconic?
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="max-w-md text-neutral-400 text-base md:text-lg leading-relaxed">
            We&apos;re selective with who we work with — not because we&apos;re precious,
            but because great work needs the right conditions. Tell us about your project.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <MagneticButton dark className="rounded-full px-8 py-4 text-base font-semibold">
              Start a project <ArrowUpRight size={16} />
            </MagneticButton>
            <button className="text-sm text-neutral-400 hover:text-white transition-colors underline underline-offset-4">
              Or just say hello
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const socials = [
    { icon: Instagram, label: "Instagram", href: "#" },
    { icon: Twitter, label: "Twitter / X", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
  ];

  return (
    <footer className="bg-black text-[#f8f6f2] border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              Studio Deck
            </span>
            <p className="text-sm text-neutral-400 max-w-xs leading-relaxed">
              An independent creative studio. We make brands that people remember.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Navigation</p>
            {["Work", "Services", "About", "Contact"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm text-neutral-400 hover:text-white transition-colors w-fit"
              >
                {l}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Get in touch</p>
            <a
              href="mailto:hello@studiodeck.co"
              className="text-sm text-neutral-400 hover:text-white transition-colors w-fit"
            >
              hello@studiodeck.co
            </a>
            <div className="flex items-center gap-3 mt-2">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:border-neutral-400 hover:text-white transition-colors"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} Studio Deck Agency. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AgencyStudioDeckPage() {
  useLenis();

  return (
    <div
      className="min-h-screen bg-[#f8f6f2] text-black antialiased"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
    >
      <Navbar />
      <Hero />
      <Services />
      <CaseStudies />
      <Process />
      <About />
      <CTA />
      <Footer />
    </div>
  );
}
