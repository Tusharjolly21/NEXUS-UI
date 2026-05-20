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
  Zap,
  ArrowRight,
  Shield,
  Lock,
  Database,
  Check,
  ChevronDown,
  Terminal,
  Code2,
  GitBranch,
  Github,
  Slack,
  Figma,
  Container,
  Mail,
  Twitter,
  Linkedin,
  ExternalLink,
  Star,
  Users,
  Activity,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── Lenis smooth scroll hook ──────────────────────────────────── */
function useLenis() {
  React.useEffect(() => {
    let lenis: { raf: (time: number) => void; destroy: () => void } | null =
      null;
    let rafId: number;

    import("@studio-freight/lenis")
      .then((mod) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const LenisClass = (mod.default ?? (mod as any).Lenis) as any;
        lenis = new LenisClass({ lerp: 0.1, duration: 1.2 }) as typeof lenis;
        function raf(time: number) {
          lenis?.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
      })
      .catch(() => {});

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);
}

/* ── FadeUp ──────────────────────────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className,
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
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Typewriter ──────────────────────────────────────────────────── */
const WORDS = ["code", "review", "deploy", "debug"];

function Typewriter() {
  const [wordIndex, setWordIndex] = React.useState(0);
  const [displayed, setDisplayed] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const word = WORDS[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(
        () => setDisplayed(word.slice(0, displayed.length + 1)),
        80
      );
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1400);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(
        () => setDisplayed(word.slice(0, displayed.length - 1)),
        45
      );
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % WORDS.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  return (
    <span className="text-violet-400">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

/* ── Prompt Rail Demo ────────────────────────────────────────────── */
const DEMO_MESSAGES = [
  {
    role: "user",
    text: "Refactor this auth middleware to use JWT refresh tokens",
  },
  {
    role: "ai",
    text: `Here's the refactored middleware with JWT refresh token support:

\`\`\`ts
export async function authMiddleware(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    // Token expired — attempt refresh
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) return res.status(401).json({ error: 'Session expired' });
    const newTokens = await rotateRefreshToken(refreshToken);
    res.cookie('access_token', newTokens.access, { httpOnly: true });
    res.cookie('refresh_token', newTokens.refresh, { httpOnly: true });
    req.user = verifyAccessToken(newTokens.access);
    next();
  }
}
\`\`\`

This handles silent token rotation, keeping sessions alive without re-login.`,
  },
  { role: "user", text: "Add rate limiting to the refresh endpoint" },
  {
    role: "ai",
    text: "Adding Redis-backed rate limiting — 5 refresh attempts per 15 minutes per IP...",
  },
];

function PromptRail() {
  const [visibleCount, setVisibleCount] = React.useState(0);
  const [typing, setTyping] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  React.useEffect(() => {
    if (!inView) return;
    let i = 0;
    function showNext() {
      if (i >= DEMO_MESSAGES.length) return;
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setVisibleCount((c) => c + 1);
        i++;
        if (i < DEMO_MESSAGES.length) setTimeout(showNext, 800);
      }, 1200);
    }
    setTimeout(showNext, 600);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden shadow-2xl shadow-violet-950/30"
    >
      {/* Editor bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#111]">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <div className="ml-4 flex items-center gap-2 text-xs text-white/40">
          <Terminal className="w-3 h-3" />
          <span>forge · copilot</span>
        </div>
      </div>
      {/* Messages */}
      <div className="p-5 space-y-4 min-h-[320px]">
        <AnimatePresence>
          {DEMO_MESSAGES.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm font-mono leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-violet-600/20 border border-violet-500/30 text-violet-100"
                    : "bg-white/5 border border-white/10 text-slate-300"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {/* Input bar */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-sm text-white/30 font-mono flex-1">
            Ask Forge anything...
          </span>
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Integration badges ──────────────────────────────────────────── */
const INTEGRATIONS = [
  { name: "VS Code", icon: <Code2 className="w-5 h-5" />, color: "#007ACC" },
  { name: "GitHub", icon: <Github className="w-5 h-5" />, color: "#fff" },
  { name: "GitLab", icon: <GitBranch className="w-5 h-5" />, color: "#FC6D26" },
  { name: "Slack", icon: <Slack className="w-5 h-5" />, color: "#4A154B" },
  {
    name: "Jira",
    icon: <Activity className="w-5 h-5" />,
    color: "#0052CC",
  },
  {
    name: "Linear",
    icon: <Star className="w-5 h-5" />,
    color: "#5E6AD2",
  },
  { name: "Figma", icon: <Figma className="w-5 h-5" />, color: "#F24E1E" },
  { name: "Docker", icon: <Container className="w-5 h-5" />, color: "#2496ED" },
  {
    name: "AWS",
    icon: <Database className="w-5 h-5" />,
    color: "#FF9900",
  },
  {
    name: "Vercel",
    icon: <ExternalLink className="w-5 h-5" />,
    color: "#fff",
  },
  {
    name: "Supabase",
    icon: <Database className="w-5 h-5" />,
    color: "#3ECF8E",
  },
  {
    name: "Stripe",
    icon: <Activity className="w-5 h-5" />,
    color: "#635BFF",
  },
];

/* ── Pricing ─────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Hobby",
    price: { monthly: 0, annual: 0 },
    description: "For personal projects and exploration",
    features: [
      "500 AI completions / mo",
      "1 workspace",
      "VS Code + GitHub",
      "Community support",
      "7-day history",
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: { monthly: 20, annual: 16 },
    description: "For professional developers who move fast",
    features: [
      "Unlimited completions",
      "5 workspaces",
      "All integrations",
      "Priority support",
      "90-day history",
      "Custom instructions",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: { monthly: 50, annual: 40 },
    description: "For engineering teams who ship together",
    features: [
      "Everything in Pro",
      "Unlimited workspaces",
      "SSO / SAML",
      "Audit logs",
      "Dedicated Slack support",
      "Custom data retention",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

/* ── FAQ ─────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "How does Forge keep my code private?",
    a: "Forge uses end-to-end encryption for all code in transit and at rest. We operate on a zero-retention policy — your code is never stored on our servers beyond the immediate inference window, and we never use customer code to train our models.",
  },
  {
    q: "Which AI models power Forge?",
    a: "Forge runs a custom ensemble of frontier models fine-tuned on millions of real developer workflows, including code generation, review, and deployment automation. The underlying models are continuously updated without any action required on your part.",
  },
  {
    q: "Can I self-host Forge for my enterprise?",
    a: "Yes. Forge Enterprise supports fully air-gapped, on-premises deployment with your own model weights. Contact our sales team for custom pricing and deployment timelines — typical rollout is under two weeks.",
  },
  {
    q: "Does Forge support all programming languages?",
    a: "Forge supports 40+ languages out of the box including TypeScript, Python, Go, Rust, Java, C#, Ruby, and more. Language-specific context engines provide idiomatic completions tailored to each ecosystem.",
  },
  {
    q: "How does the annual billing discount work?",
    a: "When you switch to annual billing, you receive a 20% discount applied immediately. You'll be charged for the full year upfront and can cancel anytime for a prorated refund on unused months.",
  },
];

/* ── Navbar ──────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080808]/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            Forge
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {["Product", "Docs", "Security", "Pricing"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#" className="text-sm text-white/60 hover:text-white">
            Sign in
          </a>
          <a
            href="#"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/60 hover:text-white"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className="block w-full h-px bg-current" />
            <span className="block w-full h-px bg-current" />
            <span className="block w-full h-px bg-current" />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-[#080808]/95 backdrop-blur-xl"
          >
            <div className="px-6 py-4 space-y-3">
              {["Product", "Docs", "Security", "Pricing"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="block text-sm text-white/60 hover:text-white py-1"
                >
                  {link}
                </a>
              ))}
              <a
                href="#"
                className="block w-full text-center px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium"
              >
                Get started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ── Hero ────────────────────────────────────────────────────────── */
function Hero() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden"
    >
      {/* Background glow orb */}
      <motion.div
        style={{ y }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div className="w-[600px] h-[600px] rounded-full bg-violet-700/20 blur-[120px]" />
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.08)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Now in public beta — join 50,000+ developers
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-6"
        >
          Your AI copilot
          <br />
          <span className="text-white/40">for the entire dev stack</span>
        </motion.h1>

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
          className="text-2xl md:text-3xl font-mono mb-8 text-white/80"
        >
          Forge helps you{" "}
          <Typewriter />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
          className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          From first commit to production deploy, Forge understands your entire
          codebase context and gives you AI-powered assistance across every tool
          in your stack.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <a
            href="#"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-900/40"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 hover:border-white/30 bg-white/5 text-white/80 hover:text-white font-medium text-sm transition-all"
          >
            <Terminal className="w-4 h-4" />
            View live demo
          </a>
        </motion.div>

        {/* Trust stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12"
        >
          {[
            { label: "AI completions served", value: "10M+", icon: <Zap className="w-4 h-4 text-violet-400" /> },
            { label: "p99 latency", value: "200ms", icon: <Activity className="w-4 h-4 text-violet-400" /> },
            { label: "Security certified", value: "SOC 2 Type II", icon: <Shield className="w-4 h-4 text-violet-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 text-white font-bold text-2xl">
                {stat.icon}
                {stat.value}
              </div>
              <span className="text-xs text-white/40">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
    </section>
  );
}

/* ── Prompt Rail Section ─────────────────────────────────────────── */
function PromptRailSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <FadeUp className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Meet your AI engineering partner
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Forge understands context across your entire repo — not just the
            current file — to give you accurate, idiomatic suggestions.
          </p>
        </FadeUp>
        <FadeUp delay={0.15}>
          <PromptRail />
        </FadeUp>
      </div>
    </section>
  );
}

/* ── Integrations ────────────────────────────────────────────────── */
function Integrations() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-3">
            Integrations
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Works with your stack
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Forge plugs into the tools you already use — no migration, no
            friction.
          </p>
        </FadeUp>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {INTEGRATIONS.map((item, i) => (
            <FadeUp key={item.name} delay={i * 0.04}>
              <div className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/20 transition-all cursor-pointer">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ color: item.color, background: `${item.color}15` }}
                >
                  {item.icon}
                </div>
                <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors text-center leading-tight">
                  {item.name}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Security ────────────────────────────────────────────────────── */
function Security() {
  const cards = [
    {
      icon: <Shield className="w-6 h-6 text-violet-400" />,
      title: "SOC 2 Type II",
      description:
        "Independently audited and certified. Our security controls are verified annually by a third-party auditor, ensuring your data meets the highest compliance standards.",
      badge: "Certified",
    },
    {
      icon: <Lock className="w-6 h-6 text-violet-400" />,
      title: "End-to-end encryption",
      description:
        "All code and context is encrypted with AES-256 at rest and TLS 1.3 in transit. Keys are managed in isolated HSMs and rotated automatically.",
      badge: "AES-256",
    },
    {
      icon: <Database className="w-6 h-6 text-violet-400" />,
      title: "Zero data retention",
      description:
        "Your code is never stored after inference completes. We enforce a hard zero-retention policy and never use customer code to improve or train our models.",
      badge: "Zero logs",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-3">
            Security
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Enterprise-grade security
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Built for engineering teams who can't compromise on compliance or
            data privacy.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <FadeUp key={card.title} delay={i * 0.1}>
              <div className="relative p-6 rounded-2xl border border-white/10 bg-white/3 hover:bg-white/5 transition-all group h-full">
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs">
                  {card.badge}
                </div>
                <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  {card.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {card.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ─────────────────────────────────────────────────────── */
function Pricing() {
  const [annual, setAnnual] = React.useState(false);

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-12">
          <p className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start free. Scale with your team.
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
            No credit card required. Upgrade or downgrade at any time.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl border border-white/10 bg-white/5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !annual
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                annual
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Annual
              <span className="px-1.5 py-0.5 rounded-full bg-violet-600 text-white text-xs font-semibold">
                -20%
              </span>
            </button>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <FadeUp key={plan.name} delay={i * 0.1}>
              <div
                className={`relative p-6 rounded-2xl border h-full flex flex-col transition-all ${
                  plan.highlighted
                    ? "border-violet-500/60 bg-violet-600/8 shadow-xl shadow-violet-950/40"
                    : "border-white/10 bg-white/3 hover:bg-white/5"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold">
                    Most popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-white font-bold text-xl mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-white/40 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-white">
                      {plan.price[annual ? "annual" : "monthly"] === 0
                        ? "Free"
                        : `$${plan.price[annual ? "annual" : "monthly"]}`}
                    </span>
                    {plan.price[annual ? "annual" : "monthly"] > 0 && (
                      <span className="text-white/40 text-sm mb-1">
                        /seat/mo
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-white/70"
                    >
                      <Check className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all ${
                    plan.highlighted
                      ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40"
                      : "border border-white/15 hover:border-white/30 bg-white/5 text-white/80 hover:text-white"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = React.useState<number | null>(null);

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Common questions
          </h2>
        </FadeUp>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FadeUp key={i} delay={i * 0.07}>
              <div
                className={`rounded-xl border transition-all overflow-hidden ${
                  open === i
                    ? "border-violet-500/40 bg-violet-600/5"
                    : "border-white/10 bg-white/3 hover:bg-white/5"
                }`}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="text-white font-medium text-sm pr-4">
                    {item.q}
                  </span>
                  <motion.div
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <p className="px-5 pb-5 text-sm text-white/55 leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Section ─────────────────────────────────────────────────── */
function CTASection() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <section className="py-24 px-6">
      <FadeUp>
        <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-950/60 via-[#0f0a1e] to-[#080808] p-12 text-center">
          {/* Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.15)_0%,_transparent_65%)] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-6">
              <Zap className="w-3 h-3 fill-violet-400 text-violet-400" />
              No credit card required
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Start building with AI
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
              Join 50,000+ developers shipping faster with Forge. Get started in
              under 60 seconds.
            </p>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
                >
                  <div className="relative flex-1 w-full">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white placeholder-white/30 text-sm outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors whitespace-nowrap shadow-lg shadow-violet-900/40"
                  >
                    Get started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-green-400 font-medium"
                >
                  <Check className="w-5 h-5" />
                  You're on the list! Check your inbox.
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-5 text-white/25 text-xs">
              By signing up you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────── */
function Footer() {
  const columns = [
    {
      heading: "Product",
      links: ["Features", "Integrations", "Changelog", "Roadmap", "Status"],
    },
    {
      heading: "Developers",
      links: ["Documentation", "API Reference", "SDKs", "VS Code Extension", "GitHub"],
    },
    {
      heading: "Company",
      links: ["About", "Blog", "Careers", "Press", "Contact"],
    },
    {
      heading: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security", "DPA"],
    },
  ];

  return (
    <footer className="border-t border-white/8 pt-16 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-white font-semibold text-lg">Forge</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-5">
              AI copilot for the entire dev stack.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <Twitter className="w-4 h-4" />, label: "Twitter" },
                { icon: <Github className="w-4 h-4" />, label: "GitHub" },
                { icon: <Linkedin className="w-4 h-4" />, label: "LinkedIn" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/40 hover:text-white text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-white/8">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} Forge AI, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-white/25 text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function AiStartupForgePage() {
  useLenis();

  return (
    <div className="min-h-screen bg-[#080808] text-white antialiased">
      <Navbar />
      <Hero />
      <PromptRailSection />
      <Integrations />
      <Security />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
