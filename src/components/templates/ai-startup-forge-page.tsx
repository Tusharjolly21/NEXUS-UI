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
  GitBranch,
  Github,
  Mail,
  Twitter,
  Linkedin,
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
      timeout = setTimeout(() => {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % WORDS.length);
      }, 120);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  return (
    <span className="text-orange-300">
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
  // the first prompt is already on screen; the replies stream in
  const [visibleCount, setVisibleCount] = React.useState(1);
  const [typing, setTyping] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  React.useEffect(() => {
    if (!inView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let i = 1;
    function showNext() {
      if (i >= DEMO_MESSAGES.length) return;
      setTyping(true);
      timers.push(
        setTimeout(() => {
          setTyping(false);
          setVisibleCount((c) => c + 1);
          i++;
          if (i < DEMO_MESSAGES.length) timers.push(setTimeout(showNext, 700));
        }, 900),
      );
    }
    timers.push(setTimeout(showNext, 250));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-white/10 bg-[#0e0b09] overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-orange-400/10"
    >
      {/* Editor bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#111]">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <div className="ml-4 flex items-center gap-2 text-xs text-white/40">
          <Terminal className="w-3 h-3" />
          <span>auth/middleware.ts · forge</span>
        </div>
      </div>
      {/* Messages */}
      <div className="p-5 h-[400px] sm:h-[440px] overflow-hidden flex flex-col justify-end gap-4">
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
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-black" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 font-mono leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "text-sm bg-orange-500/15 border border-orange-400/25 text-orange-50"
                    : "text-[11.5px] bg-white/[0.04] border border-white/10 text-stone-300"
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
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-3.5 h-3.5 text-black" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-orange-300"
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
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Integration badges ──────────────────────────────────────────── */
const INTEGRATIONS = [
  { name: "VS Code", kind: "Editor" },
  { name: "JetBrains", kind: "Editor" },
  { name: "Neovim", kind: "Editor" },
  { name: "GitHub", kind: "Code host" },
  { name: "GitLab", kind: "Code host" },
  { name: "Bitbucket", kind: "Code host" },
  { name: "Slack", kind: "Chat" },
  { name: "Linear", kind: "Issues" },
  { name: "Jira", kind: "Issues" },
  { name: "Buildkite", kind: "CI" },
  { name: "CircleCI", kind: "CI" },
  { name: "Sentry", kind: "Errors" },
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
          ? "bg-[#0a0806]/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-black fill-black" />
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-black text-sm font-medium transition-colors"
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
            className="md:hidden border-t border-white/10 bg-[#0a0806]/95 backdrop-blur-xl"
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
                className="block w-full text-center px-4 py-2 rounded-lg bg-orange-500 text-black text-sm font-medium"
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
    <section ref={ref} className="relative overflow-hidden pt-32 pb-24 md:pt-40">
      {/* Ember glow rising from below the fold, plus a faint forge-grate grid */}
      <motion.div style={{ y }} className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -bottom-40 left-1/2 h-[520px] w-[1100px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(249,115,22,0.28),rgba(234,88,12,0.10)_55%,transparent)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <motion.a
            href="#"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70 hover:border-white/20 transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            Forge 2.0 reads monorepos up to 4M lines
          </motion.a>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="mt-7 text-[2.75rem] sm:text-6xl lg:text-[4.1rem] font-semibold tracking-[-0.035em] text-white leading-[1.02]"
          >
            The copilot that has read your whole repo.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
            className="mt-6 text-lg text-white/55 max-w-lg leading-relaxed"
          >
            Forge indexes every file, commit and open PR, so its suggestions match how your team actually writes
            code, not how a tutorial would.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
            className="mt-7 inline-flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 font-mono text-sm text-white/70"
          >
            <span className="text-orange-300">forge</span>
            <span className="text-white/30">›</span>
            <Typewriter />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
            className="mt-9 flex flex-col sm:flex-row gap-3"
          >
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-semibold text-sm transition-colors"
            >
              Install for VS Code
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 hover:border-white/30 text-white/80 hover:text-white font-medium text-sm transition-all"
            >
              <Terminal className="w-4 h-4" />
              Try it on a public repo
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6"
          >
            {[
              ["10M+", "completions a day"],
              ["200ms", "p99 latency"],
              ["0 days", "code retention"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="text-xl font-semibold tracking-tight text-white tabular-nums">{v}</dd>
                <dd className="mt-1 text-xs text-white/40">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
        >
          <PromptRail />
        </motion.div>
      </div>
    </section>
  );
}

/* ── Context section: what "whole repo" means in practice ────────── */
const REPO_TREE = [
  { path: "apps/web", files: 1842, done: true },
  { path: "apps/api", files: 964, done: true },
  { path: "packages/auth", files: 211, done: true },
  { path: "packages/billing", files: 388, done: true },
  { path: "packages/ui", files: 1207, done: false },
];

function ContextSection() {
  return (
    <section id="product" className="py-24 md:py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="max-w-2xl mb-14">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">
            Context first. Then code.
          </h2>
          <p className="mt-5 text-white/55 text-lg leading-relaxed">
            Most assistants see the file you have open. Forge sees the package that imports it, the test that covers it
            and the PR that last broke it.
          </p>
        </FadeUp>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Index */}
          <FadeUp className="md:row-span-2">
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.025] p-6 flex flex-col">
              <p className="text-sm text-white/50">Indexing acme/platform</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-white tabular-nums">4,612 files</p>
              <ul className="mt-8 space-y-4 font-mono text-xs">
                {REPO_TREE.map((d) => (
                  <li key={d.path}>
                    <div className="flex justify-between text-white/60">
                      <span>{d.path}</span>
                      <span className="tabular-nums text-white/35">{d.files}</span>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className={`h-full rounded-full ${d.done ? "w-full bg-orange-400/80" : "w-2/3 bg-orange-400/40"}`} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-8 text-sm text-white/45">Re-indexes incrementally on every push, in under 9 seconds.</p>
            </div>
          </FadeUp>

          {/* Review */}
          <FadeUp delay={0.08} className="md:col-span-2">
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center gap-2 text-xs text-white/45">
                <GitBranch className="w-3.5 h-3.5" />
                <span className="font-mono">#4182 · billing: prorate seat changes</span>
              </div>
              <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                    <Zap className="w-3 h-3 text-black fill-black" />
                  </span>
                  <span className="text-sm font-medium text-white">Forge</span>
                  <span className="text-xs text-white/35">reviewed proration.ts:48</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  <span className="text-white">This rounds before converting currencies.</span> packages/billing/fx.ts
                  rounds after, and invoice snapshots in apps/api expect that order. JPY seats will be off by up to ¥1
                  per line item.
                </p>
              </div>
              <p className="mt-4 text-sm text-white/45">Reviews read like a teammate who knows the codebase, because it does.</p>
            </div>
          </FadeUp>

          {/* Diff */}
          <FadeUp delay={0.14} className="md:col-span-2">
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <p className="text-sm text-white/50">Suggested fix, matching fx.ts</p>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-6">
                <code>
                  <span className="block text-red-300/80">- const amount = Math.round(seats * unit * ratio);</span>
                  <span className="block text-red-300/80">- return convert(amount, currency);</span>
                  <span className="block text-emerald-300/90">+ const amount = convert(seats * unit * ratio, currency);</span>
                  <span className="block text-emerald-300/90">+ return roundMinorUnits(amount, currency);</span>
                </code>
              </pre>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ── Integrations ────────────────────────────────────────────────── */
function Integrations() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
        <FadeUp>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-white">Works where you already work</h2>
          <p className="mt-4 text-white/55 text-lg leading-relaxed">
            One index, shared by your editor, your code host and your chat. No migration, no new tab.
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <ul className="grid grid-cols-2 sm:grid-cols-3 border-t border-l border-white/10">
            {INTEGRATIONS.map((item) => (
              <li
                key={item.name}
                className="flex items-baseline justify-between gap-3 border-b border-r border-white/10 px-5 py-4 hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-sm font-medium text-white/85">{item.name}</span>
                <span className="text-[11px] text-white/35">{item.kind}</span>
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </section>
  );
}

/* ── Security ────────────────────────────────────────────────────── */
function Security() {
  const cards = [
    {
      icon: <Shield className="w-6 h-6 text-orange-300" />,
      title: "SOC 2 Type II",
      description:
        "Independently audited and certified. Our security controls are verified annually by a third-party auditor, ensuring your data meets the highest compliance standards.",
      badge: "Certified",
    },
    {
      icon: <Lock className="w-6 h-6 text-orange-300" />,
      title: "End-to-end encryption",
      description:
        "All code and context is encrypted with AES-256 at rest and TLS 1.3 in transit. Keys are managed in isolated HSMs and rotated automatically.",
      badge: "AES-256",
    },
    {
      icon: <Database className="w-6 h-6 text-orange-300" />,
      title: "Zero data retention",
      description:
        "Your code is never stored after inference completes. We enforce a hard zero-retention policy and never use customer code to improve or train our models.",
      badge: "Zero logs",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="max-w-2xl mb-14">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white mb-4">
            Your code is read, never kept.
          </h2>
          <p className="text-white/55 text-lg">
            Built for engineering teams who can&apos;t compromise on compliance or
            data privacy.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <FadeUp key={card.title} delay={i * 0.1}>
              <div className="relative p-6 rounded-2xl border border-white/10 bg-white/3 hover:bg-white/5 transition-all group h-full">
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full border border-orange-400/30 bg-orange-400/10 text-orange-300 text-xs">
                  {card.badge}
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-400/20 flex items-center justify-center mb-4">
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
          <p className="text-orange-300 text-sm font-medium mb-3">
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
              <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-black text-xs font-semibold">
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
                    ? "border-orange-400/60 bg-orange-500/8 shadow-xl shadow-orange-950/40"
                    : "border-white/10 bg-white/3 hover:bg-white/5"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-orange-500 text-black text-xs font-semibold">
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
                      <Check className="w-4 h-4 text-orange-300 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all ${
                    plan.highlighted
                      ? "bg-orange-500 hover:bg-orange-400 text-black shadow-lg shadow-orange-950/40"
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
          <p className="text-orange-300 text-sm font-medium mb-3">
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
                    ? "border-orange-400/40 bg-orange-500/5"
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
        <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden border border-orange-400/20 bg-gradient-to-br from-orange-950/60 via-[#170d06] to-[#0a0806] p-12 text-center">
          {/* Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.15)_0%,_transparent_65%)] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-400/30 bg-orange-400/10 text-orange-200 text-xs font-medium mb-6">
              <Zap className="w-3 h-3 fill-orange-300 text-orange-300" />
              No credit card required
            </div>

            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-white mb-4 leading-tight">
              Point Forge at your repo.
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
              It finishes indexing before your coffee does. Then ask it about
              the code nobody on the team wants to touch.
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white placeholder-white/30 text-sm outline-none focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-sm font-semibold transition-colors whitespace-nowrap shadow-lg shadow-orange-950/40"
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
                  You&apos;re on the list! Check your inbox.
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
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-black fill-black" />
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
    <div className="min-h-screen bg-[#0a0806] text-white antialiased">
      <Navbar />
      <Hero />
      <ContextSection />
      <Integrations />
      <Security />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
