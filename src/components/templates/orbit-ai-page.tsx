"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  Circle,
  GitMerge,
  Eye,
  Files,
  FlaskConical,
  Shield,
  GitBranch,
  ArrowRight,
  Terminal,
  Code2,
  Check,
  Zap,
  Menu,
  X,
} from "lucide-react";

// ─── Lenis smooth scroll ────────────────────────────────────────────────────

function useLenis() {
  React.useEffect(() => {
    let lenis: any = null;
    let rafId: number;
    import("@studio-freight/lenis")
      .then((mod) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const LenisClass = (mod.default ?? (mod as any).Lenis) as any;
        lenis = new LenisClass({ lerp: 0.08 });
        function raf(time: number) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
      })
      .catch(() => {});
    return () => {
      if (lenis) lenis.destroy();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
}

// ─── Reveal wrapper ──────────────────────────────────────────────────────────

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUpVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Orbit SVG icon ──────────────────────────────────────────────────────────

function OrbitIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="14"
        cy="14"
        rx="12"
        ry="5.5"
        stroke="#06b6d4"
        strokeWidth="1.5"
        fill="none"
        transform="rotate(-30 14 14)"
      />
      <ellipse
        cx="14"
        cy="14"
        rx="12"
        ry="5.5"
        stroke="#06b6d4"
        strokeWidth="1.5"
        fill="none"
        transform="rotate(30 14 14)"
        opacity="0.5"
      />
      <circle cx="14" cy="14" r="3" fill="#06b6d4" />
      <circle cx="22" cy="10" r="2" fill="#06b6d4" opacity="0.8" />
    </svg>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ["Product", "Docs", "Pricing", "Features"];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 backdrop-blur-md bg-[#080810]/80"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <OrbitIcon size={26} />
          <span className="text-white font-semibold text-lg tracking-tight">
            Orbit
          </span>
        </div>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link}>
              <a
                href="#"
                className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign in
          </a>
          <a
            href="#"
            className="text-sm px-4 py-2 border border-cyan-500 text-cyan-400 rounded-md hover:bg-cyan-500/10 transition-all duration-200"
          >
            Get started
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-t border-white/10 bg-[#080810]/95 backdrop-blur-md overflow-hidden"
          >
            <ul className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-zinc-300 hover:text-white text-sm">
                    {link}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#"
                  className="inline-block text-sm px-4 py-2 border border-cyan-500 text-cyan-400 rounded-md"
                >
                  Get started
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Typewriter Hero ─────────────────────────────────────────────────────────

const TYPEWRITER_WORDS = ["writes", "reviews", "ships", "deploys", "tests"];

function HeroSection() {
  const [wordIndex, setWordIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % TYPEWRITER_WORDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const wordVariants: Variants = {
    enter: { opacity: 0, y: 12 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      y: -12,
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      {/* Radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(6,182,212,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-5xl mx-auto text-center z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 mb-8"
        >
          <Zap size={12} className="text-cyan-400" />
          <span className="text-xs text-cyan-400 font-medium tracking-wide">
            Now in public beta
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
        >
          The AI that{" "}
          <span className="relative inline-block min-w-[200px] text-cyan-400">
            <AnimatePresence mode="wait">
              <motion.span
                key={TYPEWRITER_WORDS[wordIndex]}
                variants={wordVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="inline-block"
              >
                {TYPEWRITER_WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          <br />
          your code
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Orbit runs autonomously inside your dev environment — no context switching,
          no prompts, just results.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="#"
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-md text-sm transition-all duration-200 flex items-center gap-2"
          >
            Start for free <ArrowRight size={14} />
          </a>
          <a
            href="#"
            className="px-6 py-3 border border-white/20 text-white hover:border-white/40 hover:bg-white/5 rounded-md text-sm transition-all duration-200 flex items-center gap-2"
          >
            Watch demo
          </a>
        </motion.div>

        {/* Trust stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12"
        >
          {[
            { value: "10M+", label: "lines generated" },
            { value: "< 80ms", label: "response time" },
            { value: "SOC 2 Type II", label: "certified" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-white font-bold text-xl">{stat.value}</span>
              <span className="text-zinc-500 text-xs tracking-wide uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Workspace Mockup ─────────────────────────────────────────────────────────

function WorkspaceMockup() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.3], [8, 0]);

  const fileTree = [
    "src/",
    "  agent.ts",
    "  context.ts",
    "  executor.ts",
    "  tools/",
    "  index.ts",
  ];

  const codeLines: { tokens: { text: string; color: string }[] }[] = [
    {
      tokens: [
        { text: "import", color: "text-cyan-400" },
        { text: " { Agent } ", color: "text-white" },
        { text: "from", color: "text-cyan-400" },
        { text: " './core'", color: "text-amber-400" },
      ],
    },
    { tokens: [{ text: "", color: "text-white" }] },
    {
      tokens: [
        { text: "export", color: "text-cyan-400" },
        { text: " ", color: "text-white" },
        { text: "async", color: "text-cyan-400" },
        { text: " function ", color: "text-white" },
        { text: "runOrbit", color: "text-white" },
        { text: "(ctx: Context) {", color: "text-zinc-300" },
      ],
    },
    {
      tokens: [
        { text: "  ", color: "text-white" },
        { text: "// Initialize autonomous agent", color: "text-zinc-500" },
      ],
    },
    {
      tokens: [
        { text: "  ", color: "text-white" },
        { text: "const", color: "text-cyan-400" },
        { text: " agent = ", color: "text-white" },
        { text: "new", color: "text-cyan-400" },
        { text: " Agent(ctx)", color: "text-white" },
      ],
    },
    {
      tokens: [
        { text: "  ", color: "text-white" },
        { text: "await", color: "text-cyan-400" },
        { text: " agent.", color: "text-white" },
        { text: "readContext", color: "text-white" },
        { text: "()", color: "text-zinc-300" },
      ],
    },
    {
      tokens: [
        { text: "  ", color: "text-white" },
        { text: "const", color: "text-cyan-400" },
        { text: " plan = ", color: "text-white" },
        { text: "await", color: "text-cyan-400" },
        { text: " agent.", color: "text-white" },
        { text: "buildPlan", color: "text-white" },
        { text: "()", color: "text-zinc-300" },
      ],
    },
    {
      tokens: [
        { text: "  ", color: "text-white" },
        { text: "return", color: "text-cyan-400" },
        { text: " agent.", color: "text-white" },
        { text: "execute", color: "text-white" },
        { text: "(plan)", color: "text-zinc-300" },
      ],
    },
    { tokens: [{ text: "}", color: "text-zinc-300" }] },
    { tokens: [{ text: "", color: "text-white" }] },
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(6,182,212,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-12">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-3 font-medium">
            Your environment. Supercharged.
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            AI that lives inside your editor
          </h2>
        </Reveal>

        <div ref={ref} style={{ perspective: "1000px" }}>
          <motion.div
            initial={{ rotateX: 8, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            style={{ rotateX }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-white/10 bg-[#0d0d1a] overflow-hidden shadow-2xl shadow-cyan-500/5"
          >
            {/* Window top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0a0a16]">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-zinc-500 font-mono">agent.ts — Orbit</span>
            </div>

            <div className="flex" style={{ minHeight: "320px" }}>
              {/* File tree */}
              <div className="hidden sm:flex flex-col w-44 border-r border-white/10 bg-[#090915] px-3 py-4 gap-1">
                {fileTree.map((file, i) => (
                  <div
                    key={i}
                    className={`text-xs font-mono py-0.5 ${
                      file === "  agent.ts"
                        ? "text-cyan-400 bg-cyan-500/10 -mx-1 px-1 rounded"
                        : "text-zinc-500"
                    }`}
                  >
                    {file}
                  </div>
                ))}
              </div>

              {/* Code panel */}
              <div className="flex-1 px-5 py-4 font-mono text-sm overflow-x-auto">
                {codeLines.map((line, lineIndex) => (
                  <div key={lineIndex} className="flex items-center gap-4 leading-6">
                    <span className="text-zinc-700 text-xs select-none w-4 text-right shrink-0">
                      {lineIndex + 1}
                    </span>
                    <span>
                      {line.tokens.map((token, ti) => (
                        <span key={ti} className={token.color}>
                          {token.text}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI chat strip */}
            <div className="border-t border-white/10 bg-[#080813] px-4 py-3 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shrink-0">
                <Circle size={8} className="text-cyan-400 fill-cyan-400" />
              </div>
              <span className="text-xs font-mono text-zinc-300">
                <span className="text-cyan-400">Orbit:</span> Refactoring complete — 3 files
                updated{" "}
                <span className="text-green-400">✓</span>
              </span>
              <div className="ml-auto flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-zinc-600">running</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Agent Workflow Steps ─────────────────────────────────────────────────────

function WorkflowSection() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const steps: {
    number: string;
    icon: React.ReactNode;
    title: string;
    description: string;
  }[] = [
    {
      number: "01",
      icon: <GitBranch size={20} className="text-cyan-400" />,
      title: "Connect repo",
      description: "Link your GitHub or GitLab repository in one click.",
    },
    {
      number: "02",
      icon: <Code2 size={20} className="text-cyan-400" />,
      title: "Orbit reads context",
      description: "Ingests your codebase, history, and conventions.",
    },
    {
      number: "03",
      icon: <Zap size={20} className="text-cyan-400" />,
      title: "Agent executes",
      description: "Writes, tests, and refactors autonomously in minutes.",
    },
    {
      number: "04",
      icon: <Check size={20} className="text-cyan-400" />,
      title: "You review & ship",
      description: "Inspect the diff, approve the PR, and deploy.",
    },
  ];

  return (
    <section className="py-24 px-6 relative" ref={sectionRef}>
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-3 font-medium">
            Workflow
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">How Orbit works</h2>
        </Reveal>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-0 md:gap-0">
          {steps.map((step, i) => (
            <React.Fragment key={step.number}>
              {/* Step card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex-1 flex flex-col items-center text-center px-4 py-6"
              >
                {/* Number badge */}
                <div className="w-10 h-10 rounded-full border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center mb-4 relative">
                  <span className="text-xs font-bold text-cyan-400">{step.number}</span>
                </div>
                {/* Icon */}
                <div className="mb-3">{step.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-2">{step.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed max-w-[160px]">
                  {step.description}
                </p>
              </motion.div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block flex-shrink-0 w-16 h-px bg-white/5 relative overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.15 + 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 bg-cyan-500/40 origin-left"
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Grid ─────────────────────────────────────────────────────────────

function FeatureGrid() {
  const features: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[] = [
    {
      icon: <GitMerge size={22} className="text-cyan-400" />,
      title: "Autonomous PRs",
      description:
        "Orbit opens pull requests with full context, linked issues, and meaningful commit messages — no human needed.",
    },
    {
      icon: <Eye size={22} className="text-cyan-400" />,
      title: "Real-time code review",
      description:
        "Get instant inline suggestions, complexity scores, and idiomatic refactors as you write.",
    },
    {
      icon: <Files size={22} className="text-cyan-400" />,
      title: "Multi-file refactors",
      description:
        "Rename, reorganize, and rewrite across your entire codebase with zero conflicts.",
    },
    {
      icon: <FlaskConical size={22} className="text-cyan-400" />,
      title: "Test generation",
      description:
        "Automatically generates unit, integration, and edge-case tests with 90%+ branch coverage.",
    },
    {
      icon: <Shield size={22} className="text-cyan-400" />,
      title: "Security scanning",
      description:
        "Identifies CVEs, injection risks, and secret leaks before code reaches production.",
    },
    {
      icon: <GitBranch size={22} className="text-cyan-400" />,
      title: "CI/CD integration",
      description:
        "Hooks into GitHub Actions, GitLab CI, and CircleCI to monitor pipelines and fix failing builds.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-3 font-medium">
            Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Built for serious engineering
          </h2>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            Every feature is designed to amplify—not replace—your engineering judgment.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.05}>
              <div className="group relative p-6 rounded-xl border border-white/8 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] transition-all duration-300 h-full">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold mb-2 text-sm">{feature.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{feature.description}</p>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(6,182,212,0.15)" }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Split Showcase ───────────────────────────────────────────────────────────

function GitDiffMockup() {
  const diffLines = [
    { type: "meta", text: "--- a/src/api/handler.ts" },
    { type: "meta", text: "+++ b/src/api/handler.ts" },
    { type: "meta", text: "@@ -12,7 +12,9 @@" },
    { type: "context", text: "  const data = await fetch(url)" },
    { type: "removed", text: "-  return JSON.parse(data)" },
    { type: "added", text: "+  if (!data.ok) throw new ApiError(data.status)" },
    { type: "added", text: "+  const json = await data.json()" },
    { type: "added", text: "+  return json" },
    { type: "context", text: "  }" },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d1a] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-[#0a0a16]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-xs text-zinc-500 font-mono">diff — handler.ts</span>
      </div>
      <div className="px-4 py-4 font-mono text-xs">
        {diffLines.map((line, i) => (
          <div
            key={i}
            className={`leading-5 px-2 -mx-2 rounded ${
              line.type === "added"
                ? "text-green-400 bg-green-500/5"
                : line.type === "removed"
                ? "text-red-400 bg-red-500/5 line-through decoration-red-600/50"
                : line.type === "meta"
                ? "text-zinc-600"
                : "text-zinc-400"
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 bg-[#080813] px-4 py-2.5 flex items-center gap-2">
        <Circle size={7} className="text-cyan-400 fill-cyan-400" />
        <span className="text-xs font-mono text-zinc-400">
          <span className="text-cyan-400">Orbit</span> suggested this change
        </span>
      </div>
    </div>
  );
}

function TestRunnerMockup() {
  const lines = [
    { text: "PASS  src/api/handler.test.ts", color: "text-green-400" },
    { text: "  ✓ returns parsed JSON on success (12ms)", color: "text-zinc-400" },
    { text: "  ✓ throws ApiError on non-ok response (8ms)", color: "text-zinc-400" },
    { text: "  ✓ handles network timeout gracefully (5ms)", color: "text-zinc-400" },
    { text: "", color: "" },
    { text: "Test Suites: 1 passed, 1 total", color: "text-white" },
    { text: "Tests:       3 passed, 3 total", color: "text-white" },
    { text: "Coverage:    94.2% statements", color: "text-cyan-400" },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d1a] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-[#0a0a16]">
        <Terminal size={12} className="text-zinc-500" />
        <span className="ml-1 text-xs text-zinc-500 font-mono">jest — test runner</span>
      </div>
      <div className="px-4 py-4 font-mono text-xs">
        {lines.map((line, i) => (
          <div key={i} className={`leading-5 ${line.color}`}>
            {line.text || " "}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 bg-[#080813] px-4 py-2.5 flex items-center gap-2">
        <Check size={10} className="text-green-400" />
        <span className="text-xs font-mono text-zinc-400">
          <span className="text-green-400">3 tests</span> generated by Orbit
        </span>
      </div>
    </div>
  );
}

function SplitShowcase() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-24">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal className="order-2 md:order-1">
            <p className="text-xs text-cyan-400 uppercase tracking-widest mb-3 font-medium">
              Seamless
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
              Zero context switching
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Orbit lives inside your IDE. It watches your cursor, understands your intent,
              and suggests production-ready changes inline — no tab-switching, no copy-pasting
              from a chat window.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Inline diff previews",
                "One-click accept or reject",
                "Explainability panel for every suggestion",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={14} className="text-cyan-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="order-1 md:order-2">
            <GitDiffMockup />
          </Reveal>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <TestRunnerMockup />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xs text-cyan-400 uppercase tracking-widest mb-3 font-medium">
              Automated
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
              Tests written automatically
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Every function Orbit writes or modifies ships with a comprehensive test suite.
              Unit, integration, and edge-case coverage — generated from your codebase's own
              patterns and idioms.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Jest, Vitest, and Pytest support",
                "90%+ branch coverage by default",
                "Automatically runs in CI on every PR",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={14} className="text-cyan-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Gradient Section ──────────────────────────────────────────────────────

function CTASection() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  }

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(6,182,212,0.10) 0%, transparent 65%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 mb-6">
            <Zap size={12} className="text-cyan-400" />
            <span className="text-xs text-cyan-400 font-medium">Limited early access</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to ship 10x faster?
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-10">
            Join 3,000+ engineers already on the waitlist. Be the first to experience
            autonomous AI-native development.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                  <Check size={22} className="text-green-400" />
                </div>
                <p className="text-white font-semibold">You're on the list!</p>
                <p className="text-zinc-500 text-sm">
                  We'll reach out to{" "}
                  <span className="text-cyan-400">{email}</span> when your spot is ready.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-md bg-white/5 border border-white/15 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-black font-semibold rounded-md text-sm transition-all duration-200 flex items-center justify-center gap-2 shrink-0"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Join waitlist <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const columns: { heading: string; links: string[] }[] = [
    {
      heading: "Product",
      links: ["Features", "Pricing", "Changelog", "Roadmap"],
    },
    {
      heading: "Developers",
      links: ["Documentation", "API Reference", "SDKs", "Status"],
    },
    {
      heading: "Company",
      links: ["About", "Blog", "Careers", "Press"],
    },
    {
      heading: "Legal",
      links: ["Privacy", "Terms", "Security", "Cookies"],
    },
  ];

  return (
    <footer className="border-t border-white/8 px-6 pt-16 pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <OrbitIcon size={22} />
              <span className="text-white font-semibold text-base">Orbit</span>
            </div>
            <p className="text-zinc-600 text-xs leading-relaxed max-w-[160px]">
              Code at the speed of thought.
            </p>
          </div>

          {/* Columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-white text-xs font-semibold mb-4 uppercase tracking-wider">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-zinc-500 hover:text-white text-xs transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} Orbit AI, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "GitHub", "Discord"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-zinc-600 hover:text-white text-xs transition-colors duration-200"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function OrbitAIPage() {
  useLenis();

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#080810" }}>
      <Navbar />
      <HeroSection />
      <WorkspaceMockup />
      <WorkflowSection />
      <FeatureGrid />
      <SplitShowcase />
      <CTASection />
      <Footer />
    </div>
  );
}
