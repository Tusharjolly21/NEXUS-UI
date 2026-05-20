"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowUpRight,
  Download,
  Copy,
  Check,
  Github,
  Twitter,
  Linkedin,
  ArrowRight,
  Circle,
  Zap,
} from "lucide-react";

// ─── Lenis smooth scroll hook ────────────────────────────────────────────────
function useLenis() {
  React.useEffect(() => {
    let lenis: {
      raf: (time: number) => void;
      destroy: () => void;
    } | null = null;

    let rafId: number;

    import("@studio-freight/lenis").then((mod) => {
      const Lenis = mod.default;
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true });

      function raf(time: number) {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);
}

// ─── Reusable scroll-reveal wrapper ──────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const WORK = [
  {
    title: "Fintech Dashboard Redesign",
    year: "2024",
    tags: ["UX Design", "React", "Data Viz"],
    description:
      "Rebuilt a legacy analytics platform for a Series-B fintech. Reduced task completion time by 38% and increased daily active usage through a focused information architecture overhaul.",
    gradient: "from-violet-950 to-indigo-950",
    accent: "bg-violet-500",
  },
  {
    title: "E-Commerce Mobile App",
    year: "2023",
    tags: ["React Native", "Node.js", "Stripe"],
    description:
      "End-to-end design and development of a cross-platform shopping app. Shipped to 50k+ users in 3 months with a 4.8-star rating and a 22% higher conversion rate vs the web baseline.",
    gradient: "from-emerald-950 to-teal-950",
    accent: "bg-emerald-500",
  },
  {
    title: "AI Content Platform",
    year: "2023",
    tags: ["Next.js", "Python", "OpenAI"],
    description:
      "Designed and built a generative content tool used by 200+ marketing teams. Includes a custom prompt editor, approval workflows, and brand-voice fine-tuning interface.",
    gradient: "from-rose-950 to-pink-950",
    accent: "bg-rose-500",
  },
];

const STACK = [
  "React",
  "TypeScript",
  "Next.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Figma",
  "AWS",
  "Tailwind",
  "Framer",
  "GraphQL",
  "Docker",
];

const ARTICLES = [
  {
    date: "Apr 12, 2025",
    title: "Why your design system is failing — and how to fix it",
    description:
      "Token naming, component API design, and the organisational habits that keep design systems healthy.",
    readTime: "6 min read",
  },
  {
    date: "Feb 28, 2025",
    title: "Building type-safe APIs with tRPC and Next.js App Router",
    description:
      "A practical guide to wiring up end-to-end type safety without sacrificing developer ergonomics.",
    readTime: "8 min read",
  },
  {
    date: "Jan 9, 2025",
    title: "The case for boring technology in startup MVPs",
    description:
      "When Postgres outperforms every shiny alternative, and how to convince your team.",
    readTime: "5 min read",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Discover",
    desc: "Deep stakeholder interviews, user research, and competitive analysis to surface the real problem — not the assumed one.",
  },
  {
    step: "02",
    title: "Design",
    desc: "Rapid wireframes → high-fidelity prototypes → usability tests. Iterate fast before a single line of production code is written.",
  },
  {
    step: "03",
    title: "Build",
    desc: "Component-driven development, continuous deployment, and a relentless focus on performance, accessibility, and code quality.",
  },
  {
    step: "04",
    title: "Ship",
    desc: "Structured launch playbook, metric baselines, and a feedback loop to keep improving post-release.",
  },
];

const EMAIL = "alex@alexchen.dev";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md"
      style={{
        borderBottom: "1px solid rgba(228,228,231,var(--b-op,0))",
      }}
    >
      <motion.div
        style={{ ["--b-op" as string]: borderOpacity }}
        className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between"
      >
        {/* Name */}
        <span className="font-semibold text-zinc-900 tracking-tight text-sm">
          Alex Chen
        </span>

        {/* Open to work badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-700">
            Open to work
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-7">
          {["Work", "Writing", "Stack", "Contact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-zinc-900 transition-transform origin-center ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-zinc-900 transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-zinc-900 transition-transform origin-center ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="sm:hidden overflow-hidden bg-white border-t border-zinc-100"
          >
            <div className="flex flex-col px-5 py-4 gap-4">
              {["Work", "Writing", "Stack", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-zinc-700"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 w-full py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="flex flex-col gap-8">
          {/* Availability chip */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 w-fit border border-zinc-200 rounded-full px-3 py-1"
          >
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
            <span className="text-xs text-zinc-500 font-medium">
              Available for new projects · Jun 2025
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.08]"
          >
            I design &amp; build products{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500">
              people love
            </span>
          </motion.h1>

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-lg text-zinc-500 leading-relaxed max-w-lg"
          >
            Product-minded software engineer &amp; UI/UX designer with 6 years
            of experience shipping full-stack web and mobile products at
            startups and scale-ups. I care deeply about the craft — from
            pixel-perfect interfaces to clean, maintainable code.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            <a
              href="#work"
              className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-5 py-3 rounded-full hover:bg-zinc-700 transition-colors"
            >
              View Work <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 border border-zinc-200 text-zinc-700 text-sm font-medium px-5 py-3 rounded-full hover:border-zinc-400 transition-colors"
            >
              Download CV <Download className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Right — geometric avatar placeholder */}
        <motion.div
          initial={{ opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
          animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center justify-center"
        >
          <div className="relative w-full max-w-md aspect-square">
            {/* Gradient background blob */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-100 via-indigo-50 to-sky-100" />

            {/* Decorative geometric grid */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#grid)" />
            </svg>

            {/* Floating shape — outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8 rounded-full border border-dashed border-violet-300"
            />

            {/* Floating shape — inner ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-16 rounded-full border border-dashed border-indigo-300"
            />

            {/* Center monogram */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-violet-200">
                <span className="text-white font-bold text-4xl tracking-tighter select-none">
                  AC
                </span>
              </div>
            </div>

            {/* Floating badge: years */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="absolute bottom-8 left-4 bg-white rounded-2xl shadow-lg shadow-zinc-100 border border-zinc-100 px-4 py-2.5"
            >
              <p className="text-xs text-zinc-400 font-medium">Experience</p>
              <p className="text-2xl font-bold text-zinc-900">6 yrs</p>
            </motion.div>

            {/* Floating badge: projects */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.05, duration: 0.4 }}
              className="absolute top-8 right-4 bg-white rounded-2xl shadow-lg shadow-zinc-100 border border-zinc-100 px-4 py-2.5"
            >
              <p className="text-xs text-zinc-400 font-medium">Projects</p>
              <p className="text-2xl font-bold text-zinc-900">40+</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Selected Work ────────────────────────────────────────────────────────────
function WorkCard({
  item,
  index,
}: {
  item: (typeof WORK)[number];
  index: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative rounded-2xl bg-gradient-to-br ${item.gradient} p-8 overflow-hidden cursor-pointer`}
    >
      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-white/60 border border-white/15 rounded-full px-3 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-sm text-white/40 font-medium shrink-0 ml-4">
            {item.year}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-white/60 text-sm leading-relaxed max-w-lg">
          {item.description}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 text-white text-sm font-medium group/cta w-fit">
          <span>View case study</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
        </div>
      </div>

      {/* Decorative accent circle */}
      <div
        className={`absolute -bottom-16 -right-16 w-48 h-48 rounded-full ${item.accent} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
      />
    </motion.div>
  );
}

function SelectedWork() {
  return (
    <section id="work" className="py-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm text-violet-600 font-medium mb-2 uppercase tracking-widest">
                Portfolio
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight">
                Selected work
              </h2>
            </div>
            <a
              href="#"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              All projects <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {WORK.map((item, i) => (
            <WorkCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Tech Stack ───────────────────────────────────────────────────────────────
function TechStack() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <section id="stack" className="py-24 bg-zinc-50">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <Reveal>
          <p className="text-sm text-violet-600 font-medium mb-2 uppercase tracking-widest">
            Toolkit
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight mb-4">
            My toolkit
          </h2>
          <p className="text-zinc-500 max-w-lg mb-12">
            Technologies I reach for most when building products — from
            prototyping through to production.
          </p>
        </Reveal>

        <div ref={ref} className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {STACK.map((tech, i) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-zinc-200 px-4 py-5 hover:border-violet-300 hover:shadow-sm hover:shadow-violet-50 transition-all"
            >
              <Zap className="w-5 h-5 text-zinc-300 group-hover:text-violet-500 transition-colors" />
              <span className="text-xs font-semibold text-zinc-600 text-center">
                {tech}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Writing ──────────────────────────────────────────────────────────────────
function ArticleCard({
  article,
  index,
}: {
  article: (typeof ARTICLES)[number];
  index: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.65,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex flex-col gap-4 border-b border-zinc-100 pb-8 last:border-0"
    >
      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <time>{article.date}</time>
        <span>·</span>
        <span>{article.readTime}</span>
      </div>
      <h3 className="text-xl font-semibold text-zinc-900 leading-snug group-hover:text-violet-700 transition-colors">
        {article.title}
      </h3>
      <p className="text-zinc-500 text-sm leading-relaxed">
        {article.description}
      </p>
      <a
        href="#"
        className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors w-fit"
      >
        Read <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </motion.article>
  );
}

function Writing() {
  return (
    <section id="writing" className="py-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28 self-start">
              <p className="text-sm text-violet-600 font-medium mb-2 uppercase tracking-widest">
                Blog
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight mb-4">
                From the blog
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                I write about design systems, full-stack engineering, and the
                intersection of craft and product thinking.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors mt-6"
              >
                All articles <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </Reveal>

          <div className="flex flex-col gap-8">
            {ARTICLES.map((a, i) => (
              <ArticleCard key={a.title} article={a} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Process Timeline ─────────────────────────────────────────────────────────
function Process() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <section className="py-24 bg-zinc-900">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <Reveal>
          <p className="text-sm text-violet-400 font-medium mb-2 uppercase tracking-widest">
            Approach
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-16">
            How I work
          </h2>
        </Reveal>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PROCESS.map((p, i) => (
            <motion.div
              key={p.step}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.65,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col gap-4"
            >
              {/* Step number */}
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-white/10 font-mono leading-none">
                  {p.step}
                </span>
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block flex-1 h-px bg-zinc-700" />
                )}
              </div>

              <h3 className="text-xl font-semibold text-white">{p.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
  const [copied, setCopied] = React.useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <section id="contact" className="py-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <p className="text-sm text-violet-600 font-medium mb-2 uppercase tracking-widest">
              Contact
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight mb-6">
              Let&apos;s work together
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-10">
              I&apos;m currently available for freelance projects, contract
              work, and full-time opportunities. If you have a project you&apos;d
              like to discuss, I&apos;d love to hear from you.
            </p>

            {/* Email copy button */}
            <button
              onClick={handleCopy}
              className="group inline-flex items-center gap-3 border border-zinc-200 rounded-full px-6 py-3.5 hover:border-violet-300 hover:bg-violet-50 transition-all mb-10 mx-auto"
            >
              <span className="text-base font-medium text-zinc-700 group-hover:text-violet-700 transition-colors">
                {EMAIL}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="w-4 h-4 text-emerald-500" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Copy className="w-4 h-4 text-zinc-400 group-hover:text-violet-500 transition-colors" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <AnimatePresence>
              {copied && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-emerald-600 font-medium -mt-6 mb-8"
                >
                  Copied to clipboard!
                </motion.p>
              )}
            </AnimatePresence>

            {/* Social links */}
            <div className="flex items-center justify-center gap-4">
              {[
                {
                  icon: <Github className="w-5 h-5" />,
                  label: "GitHub",
                  href: "https://github.com",
                },
                {
                  icon: <Twitter className="w-5 h-5" />,
                  label: "Twitter / X",
                  href: "https://twitter.com",
                },
                {
                  icon: <Linkedin className="w-5 h-5" />,
                  label: "LinkedIn",
                  href: "https://linkedin.com",
                },
              ].map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 text-zinc-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Availability note */}
            <p className="mt-8 text-xs text-zinc-400">
              Typical response time: within 24 hours · Based in San Francisco,
              CA · Open to remote worldwide
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-zinc-100 py-8">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
        <span className="font-semibold text-zinc-600">Alex Chen</span>
        <span>© {new Date().getFullYear()} · Built with Next.js</span>
        <a
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-700 transition-colors"
        >
          nextjs.org
        </a>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DevPortfolioVectorPage() {
  useLenis();

  return (
    <div className="bg-white text-zinc-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <SelectedWork />
        <TechStack />
        <Writing />
        <Process />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
