"use client";

import * as React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

// ─── Theme ───────────────────────────────────────────────────────────────────
const T = {
  bg: "#09090c",
  bgCard: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  accent: "#c5a57b",
  accentDim: "rgba(197,165,123,0.14)",
  accentBorder: "rgba(197,165,123,0.28)",
  textPrimary: "#f5f5f0",
  textMuted: "rgba(245,245,240,0.45)",
  textFaint: "rgba(245,245,240,0.22)",
};

// ─── Content ──────────────────────────────────────────────────────────────────
const CONTENT = {
  name: "Jordan Vale",
  role: "Product Designer & Developer",
  tagline: "Crafting digital experiences that matter.",
  bio: "I'm a product designer and frontend developer with 5+ years of experience building interfaces for ambitious teams across the globe. I believe in design that ships — beautiful, fast, and accessible.",
  email: "hello@jordanvale.co",
  portrait: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&fit=crop",
  stats: [
    { value: 48, label: "Projects shipped", suffix: "+" },
    { value: 5, label: "Years of craft", suffix: "yr" },
    { value: 32, label: "Happy clients", suffix: "+" },
  ],
  trustedBy: ["Figma", "Stripe", "Linear", "Vercel", "Notion", "Arc", "Loom", "Framer"],
  services: [
    {
      icon: "✦",
      title: "Product Design",
      desc: "End-to-end UX strategy, interaction design, and design systems built for scale and consistency.",
    },
    {
      icon: "◈",
      title: "Frontend Development",
      desc: "Pixel-perfect React and Next.js implementations with smooth animations and top-tier performance.",
    },
    {
      icon: "⬡",
      title: "Brand & Identity",
      desc: "Visual identity systems — logo, typography, colour, and motion guidelines — that hold up anywhere.",
    },
  ],
  work: [
    {
      title: "Meridian Dashboard",
      type: "SaaS · Product Design",
      year: "2024",
      color: "#1a1a22",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80&fit=crop",
    },
    {
      title: "Prism Brand System",
      type: "Branding · Identity",
      year: "2024",
      color: "#1a1614",
      image: "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=600&q=80&fit=crop",
    },
    {
      title: "Orbit iOS App",
      type: "Mobile · Design",
      year: "2023",
      color: "#121a1a",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80&fit=crop",
    },
    {
      title: "Vault Finance",
      type: "Fintech · UX",
      year: "2023",
      color: "#141418",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80&fit=crop",
    },
  ],
  process: [
    { num: "01", title: "Discover", desc: "Deep-dive into goals, users, constraints, and existing patterns." },
    { num: "02", title: "Define", desc: "Synthesise research into clear problem statements and success metrics." },
    { num: "03", title: "Design", desc: "Prototype at the right fidelity — wireframes to high-fidelity mockups." },
    { num: "04", title: "Deliver", desc: "Handoff with specs, design tokens, and implementation support." },
  ],
  testimonials: [
    {
      text: "Jordan rethought our dashboard completely. The result is leagues ahead — our team's daily efficiency jumped immediately.",
      author: "Sara Kim",
      role: "Head of Product, Meridian",
      avatar: "SK",
    },
    {
      text: "The best designer-developer hybrid I've worked with. Jordan delivered pixel-perfect code alongside the designs.",
      author: "Marcus Chen",
      role: "CTO, Vault Finance",
      avatar: "MC",
    },
    {
      text: "From brand identity to motion system, Jordan brought a level of craft we'd struggled to find elsewhere.",
      author: "Leila Nour",
      role: "Founder, Prism Studio",
      avatar: "LN",
    },
  ],
  techStack: [
    { name: "Figma", icon: "https://cdn.simpleicons.org/figma/ffffff" },
    { name: "React", icon: "https://cdn.simpleicons.org/react/ffffff" },
    { name: "Next.js", icon: "https://cdn.simpleicons.org/nextdotjs/ffffff" },
    { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/ffffff" },
    { name: "Framer", icon: "https://cdn.simpleicons.org/framer/ffffff" },
    { name: "Tailwind", icon: "https://cdn.simpleicons.org/tailwindcss/ffffff" },
    { name: "Vercel", icon: "https://cdn.simpleicons.org/vercel/ffffff" },
    { name: "Linear", icon: "https://cdn.simpleicons.org/linear/ffffff" },
    { name: "Notion", icon: "https://cdn.simpleicons.org/notion/ffffff" },
    { name: "GitHub", icon: "https://cdn.simpleicons.org/github/ffffff" },
    { name: "Supabase", icon: "https://cdn.simpleicons.org/supabase/ffffff" },
    { name: "Stripe", icon: "https://cdn.simpleicons.org/stripe/ffffff" },
  ],
};

// ─── Smooth scroll ────────────────────────────────────────────────────────────
function useLenis() {
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenis: any = null;
    let rafId: number;
    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.075, smoothWheel: true });
      const raf = (t: number) => { lenis.raf(t); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);
    });
    return () => { if (lenis) lenis.destroy(); if (rafId) cancelAnimationFrame(rafId); };
  }, []);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const init =
    direction === "left" ? { opacity: 0, x: -36 }
    : direction === "right" ? { opacity: 0, x: 36 }
    : { opacity: 0, y: 32 };
  return (
    <motion.div
      ref={ref}
      initial={init}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    const dur = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function MagneticButton({
  children,
  className,
  style,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 20 });
  const sy = useSpring(y, { stiffness: 260, damping: 20 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  }
  function handleLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      style={{ x: sx, y: sy, ...style }}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function Nav() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.85]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const py = useTransform(scrollY, [0, 80], [22, 14]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        paddingTop: py,
        paddingBottom: py,
        backdropFilter: "blur(16px)",
      }}
    >
      <motion.div
        className="absolute inset-0 border-b"
        style={{
          background: `rgba(9,9,12,${bgOpacity.get()})`,
          borderColor: `rgba(255,255,255,${borderOpacity.get() * 0.06})`,
          opacity: bgOpacity,
        }}
      />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 md:px-10">
        <a href="#" className="text-sm font-bold tracking-tight" style={{ color: T.textPrimary }}>
          Jordan Vale
        </a>
        <nav className="hidden items-center gap-8 text-sm md:flex" style={{ color: T.textMuted }}>
          {["Work", "About", "Services", "Process", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="transition-colors duration-200 hover:text-white"
            >
              {item}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="hidden rounded-full px-4 py-2 text-xs font-semibold transition-opacity duration-200 hover:opacity-80 md:block"
          style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, color: T.accent }}
        >
          Get in touch
        </a>
      </div>
    </motion.header>
  );
}

function Hero() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24" id="work">
      {/* Background warm glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 65% 0%, rgba(197,165,123,0.08) 0%, transparent 65%)`,
        }}
      />
      {/* Grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto grid max-w-6xl w-full grid-cols-1 gap-12 md:grid-cols-2 md:items-center"
      >
        {/* Text side */}
        <div>
          {/* Availability chip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium"
            style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, color: T.accent }}
          >
            <span
              className="relative size-2 rounded-full"
              style={{ background: T.accent }}
            >
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: T.accent }}
                animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            </span>
            Available for new projects
          </motion.div>

          {/* Headline */}
          <div className="overflow-hidden">
            {["Crafting digital", "experiences that", "matter."].map((line, i) => (
              <motion.div
                key={i}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="block text-5xl font-bold leading-[1.06] tracking-tight text-white md:text-6xl lg:text-7xl"
              >
                {i === 1 ? (
                  <>
                    experiences{" "}
                    <span className="italic font-light" style={{ color: T.accent }}>that</span>
                  </>
                ) : (
                  line
                )}
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8 }}
            className="mt-6 max-w-md text-base leading-relaxed"
            style={{ color: T.textMuted }}
          >
            {CONTENT.bio}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.82 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <MagneticButton
              className="cursor-pointer rounded-full px-6 py-3 text-sm font-semibold text-black"
              style={{ background: T.accent }}
            >
              View my work
            </MagneticButton>
            <MagneticButton
              className="cursor-pointer rounded-full border px-6 py-3 text-sm font-medium"
              style={{ borderColor: T.border, color: T.textMuted }}
            >
              Download CV
            </MagneticButton>
          </motion.div>
        </div>

        {/* Portrait side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div
            className="relative overflow-hidden rounded-3xl"
            style={{ border: `1px solid ${T.accentBorder}`, aspectRatio: "3/4" }}
          >
            <img
              src={CONTENT.portrait}
              alt="Jordan Vale"
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${T.bg} 0%, transparent 55%)`,
              }}
            />
            {/* Name card overlay */}
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-lg font-bold text-white">{CONTENT.name}</p>
              <p className="text-xs" style={{ color: T.accent }}>{CONTENT.role}</p>
            </div>
          </div>

          {/* Floating stat card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.7 }}
            className="absolute -right-4 top-8 rounded-xl px-4 py-3 text-center shadow-xl md:-right-8"
            style={{
              background: "rgba(18,18,22,0.9)",
              border: `1px solid ${T.border}`,
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="text-xl font-bold text-white">48+</p>
            <p className="text-xs" style={{ color: T.textMuted }}>Projects</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-9 w-5 items-start justify-center rounded-full border pt-1.5"
          style={{ borderColor: T.border }}
        >
          <div className="h-1.5 w-0.5 rounded-full" style={{ background: T.accent }} />
        </motion.div>
      </motion.div>
    </section>
  );
}

function LogoMarquee() {
  const logos = [...CONTENT.trustedBy, ...CONTENT.trustedBy];
  return (
    <section className="relative overflow-hidden border-y py-8" style={{ borderColor: T.border }}>
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-32"
        style={{ background: `linear-gradient(to right, ${T.bg} 0%, transparent 100%)` }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-32"
        style={{ background: `linear-gradient(to left, ${T.bg} 0%, transparent 100%)` }}
      />
      <motion.div
        animate={{ x: "-50%" }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="flex"
      >
        {logos.map((name, i) => (
          <span
            key={i}
            className="mx-10 shrink-0 text-sm font-medium tracking-wide"
            style={{ color: T.textFaint }}
          >
            {name}
          </span>
        ))}
      </motion.div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-28 md:px-10">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:items-center">
        {/* Left */}
        <div>
          <Reveal>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest" style={{ color: T.accent }}>
              About me
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
              Design is how it{" "}
              <span className="italic font-light" style={{ color: T.accent }}>works</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 text-base leading-relaxed" style={{ color: T.textMuted }}>
              {CONTENT.bio}
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-4 text-base leading-relaxed" style={{ color: T.textMuted }}>
              When I&apos;m not designing, you&apos;ll find me contributing to open-source projects,
              writing about design systems, or exploring new typography trends.
            </p>
          </Reveal>

          {/* Stats */}
          <Reveal delay={0.3}>
            <div className="mt-10 grid grid-cols-3 gap-6">
              {CONTENT.stats.map(({ value, label, suffix }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-3xl font-bold text-white">
                    <CountUp to={value} suffix={suffix} />
                  </span>
                  <span className="mt-1 text-xs leading-tight" style={{ color: T.textMuted }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Portrait */}
        <Reveal direction="right" delay={0.1}>
          <div
            className="relative overflow-hidden rounded-3xl"
            style={{ border: `1px solid ${T.border}`, aspectRatio: "4/5" }}
          >
            <motion.img
              src={CONTENT.portrait}
              alt="Jordan Vale"
              className="h-full w-full object-cover"
              initial={{ scale: 1.08 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${T.bg}cc 0%, transparent 50%)` }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="border-t py-28" style={{ borderColor: T.border }}>
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <Reveal>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: T.accent }}>
            What I do
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mb-16 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Services
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {CONTENT.services.map(({ icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <motion.div
                whileHover={{ borderColor: T.accentBorder, y: -4 }}
                transition={{ duration: 0.25 }}
                className="group relative flex flex-col rounded-2xl p-7"
                style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
              >
                {/* Glow on hover */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(197,165,123,0.07) 0%, transparent 70%)` }}
                />
                <span className="mb-5 text-2xl" style={{ color: T.accent }}>{icon}</span>
                <h3 className="mb-3 text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: T.textMuted }}>{desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className="border-t py-28" style={{ borderColor: T.border }}>
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <Reveal>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: T.accent }}>
                Selected work
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                Projects
              </h2>
            </Reveal>
          </div>
          <Reveal direction="right">
            <a
              href="#"
              className="hidden rounded-full border px-5 py-2 text-sm transition-colors duration-200 hover:border-white/20 md:block"
              style={{ borderColor: T.border, color: T.textMuted }}
            >
              View all →
            </a>
          </Reveal>
        </div>

        {/* Featured */}
        <Reveal>
          <motion.div
            whileHover={{ scale: 1.012 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="group mb-5 overflow-hidden rounded-3xl"
            style={{ background: CONTENT.work[0].color, border: `1px solid ${T.border}` }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="flex flex-col justify-end p-8 md:w-2/5">
                <span className="mb-2 text-xs font-medium uppercase tracking-widest" style={{ color: T.accent }}>
                  {CONTENT.work[0].type}
                </span>
                <h3 className="text-2xl font-bold text-white">{CONTENT.work[0].title}</h3>
                <p className="mt-1 text-sm" style={{ color: T.textMuted }}>{CONTENT.work[0].year}</p>
              </div>
              <div className="relative h-64 overflow-hidden md:h-auto md:flex-1">
                <motion.img
                  src={CONTENT.work[0].image}
                  alt={CONTENT.work[0].title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </motion.div>
        </Reveal>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {CONTENT.work.slice(1).map(({ title, type, year, color, image }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <motion.div
                whileHover={{ scale: 1.02, y: -3 }}
                transition={{ duration: 0.35 }}
                className="group overflow-hidden rounded-2xl"
                style={{ background: color, border: `1px solid ${T.border}` }}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-600 group-hover:scale-106"
                  />
                </div>
                <div className="p-5">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider" style={{ color: T.accent }}>
                    {type}
                  </p>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs" style={{ color: T.textMuted }}>{year}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="border-t py-28" style={{ borderColor: T.border }}>
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <Reveal>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: T.accent }}>
            How I work
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mb-16 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Process
          </h2>
        </Reveal>

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 top-0 bottom-0 w-px hidden md:block"
            style={{ background: `linear-gradient(to bottom, ${T.accentBorder}, transparent)` }}
          />
          <div className="flex flex-col gap-10 md:pl-20">
            {CONTENT.process.map(({ num, title, desc }, i) => (
              <Reveal key={num} delay={i * 0.1}>
                <div className="flex gap-8 md:items-start">
                  <div
                    className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, color: T.accent }}
                  >
                    {num}
                    {/* Connector dot (desktop) */}
                    <div
                      className="absolute left-[-44px] top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full md:block"
                      style={{ background: T.accent }}
                    />
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed" style={{ color: T.textMuted }}>
                      {desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setIdx((p) => (p + 1) % CONTENT.testimonials.length), 5500);
    return () => clearInterval(id);
  }, []);

  const t = CONTENT.testimonials[idx];

  return (
    <section className="border-t py-28" style={{ borderColor: T.border }}>
      <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
        <Reveal>
          <p className="mb-12 text-xs font-medium uppercase tracking-widest" style={{ color: T.accent }}>
            Kind words
          </p>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-8 text-2xl font-light leading-relaxed text-white md:text-3xl">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-black"
                style={{ background: T.accent }}
              >
                {t.avatar}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{t.author}</p>
                <p className="text-xs" style={{ color: T.textMuted }}>{t.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="mt-10 flex justify-center gap-2">
          {CONTENT.testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 24 : 8,
                background: i === idx ? T.accent : T.border,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className="border-t py-28" style={{ borderColor: T.border }}>
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <Reveal>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: T.accent }}>
            Tools of the trade
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mb-14 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Tech stack
          </h2>
        </Reveal>

        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {CONTENT.techStack.map(({ name, icon }, i) => (
            <Reveal key={name} delay={i * 0.04}>
              <motion.div
                whileHover={{ borderColor: T.accentBorder, y: -3 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-3 rounded-2xl p-5"
                style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
              >
                <img src={icon} alt={name} className="h-6 w-6 object-contain opacity-60" />
                <span className="text-xs" style={{ color: T.textMuted }}>{name}</span>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const [copied, setCopied] = React.useState(false);

  function copyEmail() {
    navigator.clipboard.writeText(CONTENT.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <section className="border-t py-28" style={{ borderColor: T.border }}>
      <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
        <Reveal>
          <h2 className="mb-4 text-5xl font-bold tracking-tight text-white md:text-6xl">
            Let&apos;s build{" "}
            <span className="italic font-light" style={{ color: T.accent }}>together</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mb-10 text-lg" style={{ color: T.textMuted }}>
            Have a project in mind? I&apos;d love to hear about it. Send a message or copy my email below.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <MagneticButton
              className="cursor-pointer rounded-full px-8 py-3.5 text-sm font-semibold text-black"
              style={{ background: T.accent }}
            >
              <a href="#contact">Start a project →</a>
            </MagneticButton>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={copyEmail}
              className="flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm transition-colors duration-200"
              style={{
                borderColor: T.accentBorder,
                color: copied ? T.accent : T.textMuted,
                background: copied ? T.accentDim : "transparent",
              }}
            >
              {copied ? "✓ Copied!" : CONTENT.email}
            </motion.button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Contact() {
  const [focused, setFocused] = React.useState<string | null>(null);

  const inputStyle = (name: string): React.CSSProperties => ({
    background: T.bgCard,
    border: `1px solid ${focused === name ? T.accentBorder : T.border}`,
    color: T.textPrimary,
    outline: "none",
    transition: "border-color 0.2s",
  });

  return (
    <section id="contact" className="border-t py-28" style={{ borderColor: T.border }}>
      <div className="mx-auto max-w-2xl px-6 md:px-10">
        <Reveal>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: T.accent }}>
            Get in touch
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mb-10 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Contact
          </h2>
        </Reveal>

        <Reveal delay={0.14}>
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                className="rounded-xl px-4 py-3.5 text-sm placeholder:text-white/25"
                style={inputStyle("name")}
                placeholder="Your name"
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
              />
              <input
                className="rounded-xl px-4 py-3.5 text-sm placeholder:text-white/25"
                style={inputStyle("email")}
                placeholder="Email address"
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              />
            </div>
            <input
              className="rounded-xl px-4 py-3.5 text-sm placeholder:text-white/25"
              style={inputStyle("subject")}
              placeholder="Subject"
              onFocus={() => setFocused("subject")}
              onBlur={() => setFocused(null)}
            />
            <textarea
              rows={5}
              className="resize-none rounded-xl px-4 py-3.5 text-sm placeholder:text-white/25"
              style={inputStyle("message")}
              placeholder="Tell me about your project…"
              onFocus={() => setFocused("message")}
              onBlur={() => setFocused(null)}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="mt-2 rounded-full py-3.5 text-sm font-semibold text-black"
              style={{ background: T.accent }}
            >
              Send message →
            </motion.button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const [time, setTime] = React.useState("");

  React.useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="border-t overflow-hidden" style={{ borderColor: T.border }}>
      {/* Giant marquee text */}
      <div className="relative overflow-hidden border-b py-5" style={{ borderColor: T.border }}>
        <motion.div
          animate={{ x: "-50%" }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="mx-6 text-6xl font-bold tracking-tight md:text-8xl"
              style={{ color: T.textFaint }}
            >
              Jordan Vale ✦
            </span>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-white">{CONTENT.name}</p>
            <p className="mt-0.5 text-xs" style={{ color: T.textMuted }}>{CONTENT.role}</p>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: T.textMuted }}>
            <span
              className="size-1.5 rounded-full"
              style={{ background: T.accent }}
            />
            {time} — London, UK
          </div>

          <div className="flex items-center gap-6 text-sm" style={{ color: T.textMuted }}>
            {["Twitter", "GitHub", "LinkedIn", "Dribbble"].map((s) => (
              <a
                key={s}
                href="#"
                className="transition-colors duration-200 hover:text-white"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        <div
          className="mt-8 flex flex-col items-center justify-between gap-2 border-t pt-6 text-xs sm:flex-row"
          style={{ borderColor: T.border, color: T.textFaint }}
        >
          <span>© {new Date().getFullYear()} Jordan Vale. All rights reserved.</span>
          <span>Designed &amp; built with precision.</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export function AetherPortfolioPage() {
  useLenis();

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.textPrimary }}>
      <Nav />
      <Hero />
      <LogoMarquee />
      <About />
      <Services />
      <Work />
      <Process />
      <Testimonials />
      <TechStack />
      <CTA />
      <Contact />
      <Footer />
    </div>
  );
}
