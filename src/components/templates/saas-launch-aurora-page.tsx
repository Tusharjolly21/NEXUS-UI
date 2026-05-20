"use client";

import * as React from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import {
  Zap,
  Server,
  Users,
  Clock,
  ChevronDown,
  Check,
  ArrowRight,
  Menu,
  X,
  Star,
  Shield,
  BarChart2,
  Globe,
  Mail,
} from "lucide-react";

// ─── Lenis smooth scroll hook ────────────────────────────────────────────────
function useLenis() {
  React.useEffect(() => {
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let rafId: number;

    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true } as ConstructorParameters<typeof Lenis>[0]);
      function raf(time: number) {
        lenis!.raf(time);
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

// ─── Reusable reveal wrapper ──────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;

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
      transition={{ duration: 0.72, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Counter animation hook ───────────────────────────────────────────────────
function useCounter(end: number, duration = 1.6, shouldStart: boolean = false) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!shouldStart) return;
    let start = 0;
    const step = Math.ceil(end / (duration * 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration, shouldStart]);

  return count;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = ["Product", "Pricing", "Docs", "Blog"];

const TRUSTED_HERO = ["Vercel", "Linear", "Stripe", "Notion", "GitHub", "Raycast"];

const LOGO_CLOUD = [
  "Acme Corp",
  "NovaTech",
  "Elevate AI",
  "QuantumIO",
  "PulseHQ",
  "SkyBridge",
  "CoreLogic",
  "ZenithCloud",
];

type MetricItem = {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
  prefix: string;
  description: string;
};

const METRICS: MetricItem[] = [
  {
    icon: Zap,
    label: "Faster deploys",
    value: 10,
    suffix: "x",
    prefix: "",
    description: "Compared to traditional CI/CD pipelines",
  },
  {
    icon: Server,
    label: "Uptime SLA",
    value: 99,
    suffix: ".9%",
    prefix: "",
    description: "Guaranteed across all regions globally",
  },
  {
    icon: Users,
    label: "Teams shipped",
    value: 50,
    suffix: "k+",
    prefix: "",
    description: "Engineering teams trust Aurora daily",
  },
  {
    icon: Clock,
    label: "Load time",
    value: 2,
    suffix: "s",
    prefix: "< ",
    description: "Median cold start across all deployments",
  },
];

type Testimonial = {
  initials: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  color: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    initials: "SL",
    name: "Sarah Lin",
    role: "CTO",
    company: "NovaTech",
    quote:
      "Aurora cut our deploy cycle from 40 minutes to under 4. The DX is the best we've ever shipped with — our engineers were productive on day one.",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    initials: "MK",
    name: "Marcus Kim",
    role: "VP Engineering",
    company: "Elevate AI",
    quote:
      "We evaluated five platforms. Aurora was the only one that gave us zero-config edge deployments AND the observability our enterprise clients require.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    initials: "PR",
    name: "Priya Rao",
    role: "Head of Product",
    company: "QuantumIO",
    quote:
      "The analytics dashboard alone saved us two full sprints of custom tooling. Pricing is honest and scales predictably — rare in this space.",
    color: "from-emerald-500 to-teal-500",
  },
];

type PricingTier = {
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
};

const PRICING: PricingTier[] = [
  {
    name: "Starter",
    monthlyPrice: "$0",
    annualPrice: "$0",
    description: "For indie hackers and small side projects.",
    features: [
      "3 projects",
      "100 GB bandwidth",
      "Community support",
      "Shared infrastructure",
      "Basic analytics",
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: "$49",
    annualPrice: "$39",
    description: "For growing teams shipping real products.",
    features: [
      "Unlimited projects",
      "1 TB bandwidth",
      "Priority support",
      "Dedicated edge nodes",
      "Advanced analytics",
      "Custom domains",
      "Team collaboration",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    description: "For large orgs with complex requirements.",
    features: [
      "Everything in Pro",
      "Unlimited bandwidth",
      "SLA guarantees",
      "SSO / SAML",
      "Dedicated account manager",
      "Custom contracts",
      "99.99% uptime SLA",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

type FaqItem = {
  q: string;
  a: string;
};

const FAQS: FaqItem[] = [
  {
    q: "How does the free trial work?",
    a: "Start a 14-day Pro trial with no credit card required. You get full access to every Pro feature. At the end of the trial, choose a plan or stay on Starter for free — no surprises.",
  },
  {
    q: "Can I migrate from another platform?",
    a: "Yes. Our migration CLI detects your existing configuration (Vercel, Netlify, Railway, Render) and generates an equivalent Aurora config automatically. Most teams complete migration in under an hour.",
  },
  {
    q: "Where are your data centers located?",
    a: "Aurora runs on a global edge network with PoPs in 18 regions across North America, Europe, Asia-Pacific, and South America. Your workloads run closest to your users automatically.",
  },
  {
    q: "Is Aurora SOC 2 compliant?",
    a: "Aurora is SOC 2 Type II certified. We also offer HIPAA-ready configurations for healthcare customers and GDPR data residency controls for EU-based organizations.",
  },
  {
    q: "How does billing work for teams?",
    a: "Billing is per workspace, not per seat. Add as many collaborators as you need. You only pay for what you use — bandwidth and compute are metered and visible in real time on your dashboard.",
  },
];

const FOOTER_LINKS: Record<string, string[]> = {
  Product: ["Features", "Changelog", "Roadmap", "Status"],
  Company: ["About", "Blog", "Careers", "Press"],
  Developers: ["Docs", "API Reference", "CLI", "Open Source"],
  Legal: ["Privacy", "Terms", "Cookie Policy", "Security"],
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function SaasLaunchAuroraPage() {
  useLenis();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [annual, setAnnual] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  // Navbar scroll frost
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(9,9,11,0)", "rgba(9,9,11,0.85)"]);
  const navBlur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(16px)"]);
  const navBorder = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,0.08)"]);

  // Orb parallax
  const orbY = useTransform(scrollY, [0, 600], [0, 120]);

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden font-sans antialiased">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <motion.header
        style={{
          backgroundColor: navBg,
          backdropFilter: navBlur,
          WebkitBackdropFilter: navBlur,
          borderBottomColor: navBorder,
        }}
        className="fixed top-0 inset-x-0 z-50 border-b"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 select-none">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-lg font-bold tracking-tight">Aurora</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Sign in
            </a>
            <a
              href="#"
              className="text-sm bg-white text-zinc-950 font-semibold px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Start free
            </a>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden text-zinc-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="md:hidden border-t border-white/[0.08] bg-zinc-950/95 backdrop-blur-xl"
            >
              <div className="px-6 py-6 flex flex-col gap-5">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-zinc-300 hover:text-white text-sm"
                  >
                    {link}
                  </a>
                ))}
                <a
                  href="#"
                  className="mt-2 text-center text-sm bg-white text-zinc-950 font-semibold px-4 py-2.5 rounded-lg"
                >
                  Start free
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          style={{ y: orbY }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-cyan-500/20 blur-[120px] opacity-70" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-600/10 blur-[80px] opacity-50" />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-8">
          {/* Badge */}
          <Reveal>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium">
              <Zap className="w-3 h-3" />
              Now in public beta — free for 14 days
            </span>
          </Reveal>

          {/* Headline */}
          <Reveal delay={0.08}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]">
              <span className="block text-white">Ship B2B products</span>
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                faster.
              </span>
            </h1>
          </Reveal>

          {/* Subtext */}
          <Reveal delay={0.14}>
            <p className="max-w-2xl text-lg sm:text-xl text-zinc-400 leading-relaxed">
              Aurora is the deployment platform built for B2B teams. Instant edge deploys, real-time
              observability, and team workflows that keep everyone aligned — all in one place.
            </p>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={0.2}>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-white text-zinc-950 font-semibold px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors text-sm shadow-lg shadow-white/10"
              >
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 border border-white/20 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm"
              >
                View demo
              </a>
            </div>
          </Reveal>

          {/* Trusted by strip */}
          <Reveal delay={0.28}>
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Trusted by teams at</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {TRUSTED_HERO.map((name) => (
                  <span key={name} className="text-sm font-semibold text-zinc-400">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />
      </section>

      {/* ── Logo Cloud ─────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-center text-sm text-zinc-500 uppercase tracking-widest mb-12">
              Trusted by teams at leading companies
            </p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {LOGO_CLOUD.map((name, i) => (
              <Reveal key={name} delay={i * 0.05}>
                <div className="flex items-center justify-center px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300">
                  <span className="text-xs font-semibold text-zinc-400 whitespace-nowrap">{name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento Metrics ──────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Numbers that speak for themselves
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Aurora is built for performance-obsessed teams who treat reliability as a feature, not a
                footnote.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {METRICS.map((m, i) => (
              <BentoMetricCard key={m.label} item={m} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                What engineering leaders say
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Real feedback from teams who ship production products on Aurora every day.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <div className="h-full flex flex-col gap-6 p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-colors">
                  <p className="text-zinc-300 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-zinc-500">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto mb-8">
                No seat taxes. No surprise bills. Start free and scale without anxiety.
              </p>

              {/* Toggle */}
              <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                <button
                  onClick={() => setAnnual(false)}
                  className="relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <motion.span
                    animate={{ opacity: annual ? 0.4 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    Monthly
                  </motion.span>
                  {!annual && (
                    <motion.div
                      layoutId="pricing-pill"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className="relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <motion.span
                    animate={{ opacity: annual ? 1 : 0.4 }}
                    transition={{ duration: 0.2 }}
                  >
                    Annual
                  </motion.span>
                  <span className="text-xs text-emerald-400 font-semibold">–20%</span>
                  {annual && (
                    <motion.div
                      layoutId="pricing-pill"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                </button>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 0.1}>
                <div
                  className={`relative h-full flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
                    tier.highlighted
                      ? "border-violet-500/60 bg-gradient-to-b from-violet-950/40 to-zinc-950 shadow-xl shadow-violet-500/10"
                      : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14]"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-violet-500 text-xs font-bold text-white">
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
                    <p className="text-zinc-500 text-sm">{tier.description}</p>
                  </div>

                  <div className="mb-6">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={annual ? "annual" : "monthly"}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.22, ease: EASE }}
                        className="text-4xl font-extrabold"
                      >
                        {annual ? tier.annualPrice : tier.monthlyPrice}
                      </motion.span>
                    </AnimatePresence>
                    {tier.name !== "Enterprise" && (
                      <span className="text-zinc-500 text-sm ml-1">/mo</span>
                    )}
                  </div>

                  <ul className="flex flex-col gap-3 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#"
                    className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      tier.highlighted
                        ? "bg-violet-500 hover:bg-violet-400 text-white"
                        : "border border-white/20 hover:bg-white/5 text-white"
                    }`}
                  >
                    {tier.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Frequently asked questions
              </h2>
              <p className="text-zinc-400">
                Can&apos;t find an answer?{" "}
                <a href="#" className="text-violet-400 hover:text-violet-300 underline underline-offset-4">
                  Chat with us
                </a>
                .
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <FaqItem
                key={i}
                faq={faq}
                index={i}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────────────── */}
      <section className="py-28 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl p-12 sm:p-16 bg-gradient-to-br from-violet-950 via-zinc-900 to-cyan-950 border border-violet-500/20">
              {/* Background glow */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-violet-500/20 to-transparent blur-[80px]" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                  Ready to launch?
                </h2>
                <p className="text-zinc-400 text-lg mb-10 max-w-lg mx-auto">
                  Join 50,000+ engineering teams. Start free, no credit card needed.
                </p>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-medium"
                  >
                    <Check className="w-4 h-4" />
                    You&apos;re on the list — we&apos;ll be in touch!
                  </motion.div>
                ) : (
                  <form
                    onSubmit={handleEmailSubmit}
                    className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
                  >
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 bg-white text-zinc-950 font-semibold px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors text-sm flex-shrink-0"
                    >
                      Start free
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" strokeWidth={2.5} />
                </span>
                <span className="text-lg font-bold tracking-tight">Aurora</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                The edge deployment platform for serious B2B teams.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
                  {group}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-sm text-zinc-400 hover:text-white transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-zinc-600 text-xs">
              © {new Date().getFullYear()} Aurora Technologies, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-zinc-600 text-xs">SOC 2 Type II · GDPR · HIPAA ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BentoMetricCard({ item, delay }: { item: MetricItem; delay: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  const count = useCounter(item.value, 1.6, inView);
  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.72, ease: EASE, delay }}
      className="group relative overflow-hidden rounded-2xl p-8 bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/30 transition-all duration-300"
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-violet-500/10 blur-[60px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-0.5 mb-2">
            <span className="text-5xl font-extrabold tracking-tight">
              {item.prefix}
              {count}
              {item.suffix}
            </span>
          </div>
          <p className="text-base font-semibold text-white mb-1">{item.label}</p>
          <p className="text-sm text-zinc-500">{item.description}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 ml-4">
          <Icon className="w-5 h-5 text-violet-400" />
        </div>
      </div>
    </motion.div>
  );
}

function FaqItem({
  faq,
  index,
  open,
  onToggle,
}: {
  faq: FaqItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.07 }}
      className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
        open
          ? "border-violet-500/40 bg-violet-950/20"
          : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14]"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="text-sm font-semibold text-white">{faq.q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <div className="px-6 pb-5">
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
