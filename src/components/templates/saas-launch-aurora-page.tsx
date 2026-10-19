"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ChevronDown,
  Check,
  ArrowRight,
  Menu,
  X,
  Shield,
  Globe,
  Mail,
  Copy,
  GitBranch,
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

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = ["Product", "Pricing", "Docs", "Blog"];

const LOGO_CLOUD = [
  { name: "Northwind", className: "text-lg font-bold tracking-tight" },
  { name: "QUANTUMIO", className: "text-sm font-semibold tracking-[0.2em]" },
  { name: "elevate", className: "text-xl font-medium italic tracking-tight" },
  { name: "Pulse/HQ", className: "font-mono text-base" },
  { name: "SkyBridge", className: "text-lg font-light tracking-wide" },
  { name: "corelogic", className: "text-lg font-black tracking-tighter" },
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
    color: "from-emerald-200 to-emerald-400",
  },
  {
    initials: "MK",
    name: "Marcus Kim",
    role: "VP Engineering",
    company: "Elevate AI",
    quote:
      "We evaluated five platforms. Aurora was the only one that gave us zero-config edge deployments AND the observability our enterprise clients require.",
    color: "from-violet-200 to-violet-400",
  },
  {
    initials: "PR",
    name: "Priya Rao",
    role: "Head of Product",
    company: "QuantumIO",
    quote:
      "The analytics dashboard alone saved us two full sprints of custom tooling. Pricing is honest and scales predictably — rare in this space.",
    color: "from-teal-200 to-cyan-300",
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
            <AuroraMark className="w-7 h-7" />
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
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 lg:pb-28">
        <AuroraSky offsetY={orbY} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <Reveal>
              <a
                href="#"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 text-xs text-zinc-300 hover:border-white/20 transition-colors"
              >
                <span className="rounded-full bg-emerald-300 px-2 py-0.5 font-semibold text-zinc-950">v4.2</span>
                Preview deploys now run in all 18 regions
              </a>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="mt-7 text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[4.25rem] font-semibold tracking-[-0.035em]">
                Push once.
                <br />
                <span className="text-zinc-500">Live in 18 regions in 38&nbsp;seconds.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-6 max-w-xl text-lg text-zinc-400 leading-relaxed">
                Aurora builds your app once, ships it to eighteen edge regions in parallel and rolls it back on its own
                when error rates move. Your B2B customers never see a bad deploy.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
                >
                  Start deploying
                  <ArrowRight className="w-4 h-4" />
                </a>
                <CopyCommand command="npx aurora deploy" />
              </div>
            </Reveal>

            <Reveal delay={0.28}>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/[0.08] pt-6">
                {[
                  ["18", "edge regions"],
                  ["99.99%", "uptime, 12 mo"],
                  ["< 2s", "p50 cold start"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="sr-only">{l}</dt>
                    <dd className="text-xl font-semibold tracking-tight tabular-nums">{v}</dd>
                    <dd className="mt-1 text-xs text-zinc-500">{l}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.18}>
            <DeployPanel />
          </Reveal>
        </div>
      </section>

      {/* ── Logo Cloud ─────────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-zinc-500 md:max-w-[14rem]">
            Shipping production traffic for 50,000 teams, including
          </p>
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-4 md:flex md:flex-1 md:flex-wrap md:justify-end md:gap-x-12">
            {LOGO_CLOUD.map((logo) => (
              <span key={logo.name} className={`text-zinc-400 whitespace-nowrap ${logo.className}`}>
                {logo.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento Metrics ──────────────────────────────────────────────── */}
      <section id="product" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="max-w-2xl mb-14">
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-balance">
                Reliability you can show your customers.
              </h2>
              <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
                Every Aurora workspace gets the same status page we run ourselves. These are the numbers on it.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <Reveal className="md:col-span-4 md:row-span-2">
              <DeployTimeCard />
            </Reveal>
            <Reveal delay={0.08} className="md:col-span-2">
              <UptimeCard />
            </Reveal>
            <Reveal delay={0.14} className="md:col-span-2">
              <RegionsCard />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="mb-14 max-w-2xl">
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-balance mb-4">
                Teams that stopped dreading Friday deploys
              </h2>
              <p className="text-lg text-zinc-400">
                Real feedback from teams who ship production products on Aurora every day.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1} className={i === 0 ? "md:col-span-3 md:row-span-2" : "md:col-span-2"}>
                <figure
                  className={`h-full flex flex-col justify-between gap-8 rounded-2xl border border-white/[0.08] ${
                    i === 0 ? "bg-gradient-to-br from-emerald-400/[0.06] to-transparent p-8 sm:p-10" : "bg-white/[0.025] p-6"
                  }`}
                >
                  <blockquote
                    className={
                      i === 0
                        ? "text-2xl sm:text-[1.75rem] leading-snug tracking-[-0.015em] text-zinc-100 text-pretty"
                        : "text-sm leading-relaxed text-zinc-300"
                    }
                  >
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-semibold text-zinc-950 flex-shrink-0`}
                    >
                      {t.initials}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{t.name}</span>
                      <span className="block text-xs text-zinc-500">
                        {t.role}, {t.company}
                      </span>
                    </span>
                  </figcaption>
                </figure>
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
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] mb-4">
                Pricing per workspace, never per seat
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto mb-8">
                Add every engineer, designer and PM you like. You pay for bandwidth and compute, metered live on your dashboard.
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
                  <span className="text-xs text-emerald-300 font-semibold">–20%</span>
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
                  className={`relative h-full flex flex-col p-7 rounded-2xl border transition-all duration-300 ${
                    tier.highlighted
                      ? "border-emerald-300/40 bg-gradient-to-b from-emerald-400/[0.07] to-zinc-950 shadow-xl shadow-emerald-500/5"
                      : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14]"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-emerald-300 text-xs font-semibold text-zinc-950">
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
                        className="text-4xl font-semibold tracking-tight tabular-nums"
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
                        <Check className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#"
                    className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      tier.highlighted
                        ? "bg-emerald-300 hover:bg-emerald-200 text-zinc-950"
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
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] mb-4">
                Questions teams ask before migrating
              </h2>
              <p className="text-zinc-400">
                Can&apos;t find an answer?{" "}
                <a href="#" className="text-emerald-300 hover:text-emerald-200 underline underline-offset-4">
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
            <div className="relative overflow-hidden rounded-3xl p-12 sm:p-16 bg-zinc-900/60 border border-white/[0.08]">
              {/* Background glow */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 left-[-10%] h-[260px] w-[120%] -skew-y-6 rounded-[50%] bg-[linear-gradient(90deg,transparent,rgba(52,211,153,.30)_35%,rgba(139,92,246,.25)_70%,transparent)] blur-[60px]" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-balance mb-4">
                  Your next deploy could be your first on Aurora.
                </h2>
                <p className="text-zinc-400 text-lg mb-10 max-w-lg mx-auto">
                  Import a repo, keep your build command, and watch it go live in 18 regions. Free for 14 days, no card.
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
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 transition-colors"
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
                <AuroraMark className="w-7 h-7" />
                <span className="text-lg font-bold tracking-tight">Aurora</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                The edge deployment platform for serious B2B teams.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <div key={group}>
                <h4 className="text-sm font-medium text-zinc-200 mb-4">
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

function AuroraMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      <rect width="28" height="28" rx="8" fill="#0b0f0e" stroke="rgba(255,255,255,.12)" />
      <path d="M5 18c4-7 7-7 9-3s5 4 9-4" fill="none" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M5 13c4-5 7-5 9-2s5 3 9-3" fill="none" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

/** Slow-moving aurora ribbons behind the hero. Static when the visitor prefers reduced motion. */
function AuroraSky({ offsetY }: { offsetY: MotionValue<number> }) {
  return (
    <motion.div style={{ y: offsetY }} className="pointer-events-none absolute inset-0" aria-hidden>
      <style>{`
        @keyframes aurora-drift { 0%,100% { transform: translate3d(-4%,0,0) skewY(-8deg) } 50% { transform: translate3d(4%,-3%,0) skewY(-4deg) } }
        @keyframes aurora-drift-b { 0%,100% { transform: translate3d(3%,2%,0) skewY(6deg) } 50% { transform: translate3d(-5%,-2%,0) skewY(2deg) } }
        .aurora-band { animation: aurora-drift 18s ease-in-out infinite; }
        .aurora-band-b { animation: aurora-drift-b 24s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .aurora-band, .aurora-band-b { animation: none; } }
      `}</style>
      <div className="aurora-band absolute -top-40 left-[-10%] h-[420px] w-[120%] rounded-[50%] bg-[linear-gradient(90deg,transparent_5%,rgba(52,211,153,.32)_30%,rgba(45,212,191,.22)_50%,rgba(139,92,246,.28)_72%,transparent_95%)] blur-[70px]" />
      <div className="aurora-band-b absolute top-10 left-[-20%] h-[260px] w-[110%] rounded-[50%] bg-[linear-gradient(90deg,transparent,rgba(167,139,250,.22)_35%,rgba(110,231,183,.18)_65%,transparent)] blur-[60px]" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:56px_56px] opacity-[0.06] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-zinc-950 to-transparent" />
    </motion.div>
  );
}

function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(command).catch(() => {});
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className="group inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-zinc-300 hover:border-white/20 transition-colors"
    >
      <span className="text-emerald-300">$</span>
      {command}
      <span className="w-4 text-zinc-500 group-hover:text-zinc-200 transition-colors">
        {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
      </span>
    </button>
  );
}

type RegionState = "queued" | "building" | "live";

const DEPLOY_REGIONS = [
  { id: "iad1", city: "Washington, D.C.", ms: 4.1 },
  { id: "sfo1", city: "San Francisco", ms: 6.8 },
  { id: "gru1", city: "São Paulo", ms: 11.2 },
  { id: "lhr1", city: "London", ms: 5.3 },
  { id: "fra1", city: "Frankfurt", ms: 5.9 },
  { id: "bom1", city: "Mumbai", ms: 9.4 },
  { id: "hnd1", city: "Tokyo", ms: 7.7 },
  { id: "syd1", city: "Sydney", ms: 12.6 },
];

/** A deploy rolling out region by region; loops every few seconds. */
function DeployPanel() {
  const reduce = useReducedMotion();
  const total = DEPLOY_REGIONS.length;
  // tick 0..total*2: each region spends one tick building, then goes live
  const [tick, setTick] = React.useState(reduce ? total * 2 : 0);

  React.useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setTick((t) => (t >= total * 2 + 6 ? 0 : t + 1));
    }, 520);
    return () => window.clearInterval(id);
  }, [reduce, total]);

  const stateOf = (i: number): RegionState => (tick > i + 1 ? "live" : tick > i ? "building" : "queued");
  const live = DEPLOY_REGIONS.filter((_, i) => stateOf(i) === "live").length;
  const done = live === total;
  const elapsed = Math.min(38.2, (tick * 38.2) / (total + 1)).toFixed(1);

  return (
    <div className="relative">
      <div className="absolute -inset-px rounded-[20px] bg-gradient-to-b from-emerald-300/30 via-white/5 to-violet-400/20" aria-hidden />
      <div className="relative rounded-[19px] bg-zinc-950/90 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5 font-mono text-xs text-zinc-400">
            <GitBranch className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            <span className="truncate">acme/console · main · 8f3c2a1</span>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              done ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-emerald-300" : "bg-amber-300 animate-pulse"}`} />
            {done ? "Live" : "Rolling out"}
          </span>
        </div>

        <ul className="divide-y divide-white/[0.05]">
          {DEPLOY_REGIONS.map((r, i) => {
            const st = stateOf(i);
            return (
              <li key={r.id} className="grid grid-cols-[3.25rem_1fr_auto] items-center gap-3 px-5 py-2.5 text-sm">
                <span className="font-mono text-xs text-zinc-500">{r.id}</span>
                <span className="truncate text-zinc-300">{r.city}</span>
                <span className="flex items-center gap-2 font-mono text-xs tabular-nums">
                  {st === "live" && (
                    <>
                      <span className="text-zinc-500">{r.ms.toFixed(1)}s</span>
                      <span className="text-emerald-300">live</span>
                    </>
                  )}
                  {st === "building" && <span className="text-amber-300">building…</span>}
                  {st === "queued" && <span className="text-zinc-600">queued</span>}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-white/[0.07] px-5 py-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-violet-400"
              animate={{ width: `${(live / total) * 100}%` }}
              transition={{ duration: 0.4, ease: EASE }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <span className="tabular-nums">
              {live}/{total} regions live
            </span>
            <span className="font-mono tabular-nums">{done ? "38.2s" : `${elapsed}s`} total</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEPLOY_WEEKS = [41, 39, 36, 31, 24, 19, 14, 11, 8.5, 6.2, 4.6, 3.8];

function DeployTimeCard() {
  const max = 44;
  const w = 600;
  const h = 220;
  const pts = DEPLOY_WEEKS.map((v, i) => [(i / (DEPLOY_WEEKS.length - 1)) * w, h - (v / max) * h] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <div ref={ref} className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8 flex flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">Median deploy time after moving to Aurora</p>
          <p className="mt-2 text-5xl sm:text-6xl font-semibold tracking-[-0.04em] tabular-nums">
            3.8<span className="text-2xl text-zinc-500"> min</span>
          </p>
        </div>
        <p className="text-sm text-zinc-500">
          from <span className="text-zinc-300 tabular-nums">41 min</span> in week one
        </p>
      </div>
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="mt-8 w-full flex-1 min-h-[160px]" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="aurora-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#6ee7b7" stopOpacity=".28" />
            <stop offset="1" stopColor="#6ee7b7" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="rgba(255,255,255,.06)" strokeDasharray="3 5" />
        ))}
        <motion.path
          d={`${line} L${w},${h} L0,${h} Z`}
          fill="url(#aurora-area)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="#6ee7b7"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.4, ease: EASE }}
        />
        {["W1", "W4", "W8", "W12"].map((l, i) => (
          <text key={l} x={(i / 3) * (w - 24)} y={h + 20} fill="#71717a" fontSize="12" fontFamily="ui-monospace, monospace">
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}

/** 90 days of uptime bars, one degraded day. */
function UptimeCard() {
  return (
    <div className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">99.99%</p>
        <p className="text-xs text-zinc-500">last 90 days</p>
      </div>
      <p className="mt-1 text-sm text-zinc-400">API and edge uptime</p>
      <div className="mt-6 flex h-9 items-end gap-[2px]" aria-hidden>
        {Array.from({ length: 60 }, (_, i) => (
          <span
            key={i}
            className={`flex-1 rounded-[1px] ${i === 41 ? "h-2/3 bg-amber-300" : "h-full bg-emerald-300/70"}`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500">One 4-minute partial outage in fra1, auto-rerouted.</p>
    </div>
  );
}

function RegionsCard() {
  return (
    <div className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          &lt; 2s<span className="text-base text-zinc-500"> p50</span>
        </p>
        <Globe className="w-4 h-4 text-zinc-500" />
      </div>
      <p className="mt-1 text-sm text-zinc-400">Cold start, measured from every region</p>
      <div className="mt-5 grid grid-cols-4 gap-x-3 gap-y-2 font-mono text-[11px]">
        {DEPLOY_REGIONS.map((r) => (
          <span key={r.id} className="flex items-center gap-1.5 text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {r.id}
          </span>
        ))}
      </div>
    </div>
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
          ? "border-emerald-300/30 bg-emerald-400/[0.04]"
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
