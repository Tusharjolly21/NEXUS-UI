"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  type Variants,
} from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  FileText,
  MessageSquare,
  LayoutGrid,
  ArrowRight,
  Zap,
  Users,
  UploadCloud,
  BookOpen,
  Bell,
  Video,
  Star,
  Mail,
  Calendar,
  GitBranch,
  Box,
  Layers,
  Activity,
  BarChart2,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

/* ─── Lenis smooth-scroll hook ─────────────────────────────────────────────── */
function useLenis() {
  React.useEffect(() => {
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let rafId: number;

    import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.08, smoothWheel: true }) as unknown as {
        raf: (t: number) => void;
        destroy: () => void;
      };
      const loop = (time: number) => {
        lenis!.raf(time);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);
}

/* ─── Shared animation variants ─────────────────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.45, delay: i * 0.08 },
  }),
};

/* ─── Scroll-reveal wrapper ──────────────────────────────────────────────────── */
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
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const NAV_LINKS = ["Product", "Integrations", "Pricing", "Blog"];

const FEATURES = [
  {
    icon: <LayoutGrid size={22} className="text-violet-600" />,
    title: "Tasks & Projects",
    bullets: ["Smart scheduling", "Dependency tracking", "Time estimates"],
  },
  {
    icon: <FileText size={22} className="text-violet-600" />,
    title: "Docs & Knowledge",
    bullets: ["AI summarization", "Version history", "Team wikis"],
  },
  {
    icon: <MessageSquare size={22} className="text-violet-600" />,
    title: "Communication",
    bullets: ["Async updates", "Meeting notes", "Decision log"],
  },
];

const KANBAN_COLUMNS = [
  {
    label: "To Do",
    color: "bg-zinc-700",
    dot: "bg-zinc-400",
    cards: [
      { title: "Design onboarding flow", tag: "Design", priority: "medium" },
      { title: "Write API docs", tag: "Dev", priority: "low" },
    ],
  },
  {
    label: "In Progress",
    color: "bg-violet-700",
    dot: "bg-violet-400",
    cards: [
      { title: "Integrate Stripe billing", tag: "Dev", priority: "high" },
      { title: "Q2 roadmap review", tag: "Planning", priority: "medium" },
    ],
  },
  {
    label: "Done",
    color: "bg-emerald-700",
    dot: "bg-emerald-400",
    cards: [
      { title: "User research interviews", tag: "Research", priority: "low" },
      { title: "Set up CI pipeline", tag: "Dev", priority: "high" },
    ],
  },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-emerald-500/20 text-emerald-400",
};

const INTEGRATIONS = [
  { name: "Slack", icon: <MessageSquare size={18} /> },
  { name: "GitHub", icon: <GitBranch size={18} /> },
  { name: "Notion", icon: <BookOpen size={18} /> },
  { name: "Figma", icon: <Layers size={18} /> },
  { name: "Google Drive", icon: <UploadCloud size={18} /> },
  { name: "Zoom", icon: <Video size={18} /> },
  { name: "Jira", icon: <Activity size={18} /> },
  { name: "Linear", icon: <BarChart2 size={18} /> },
  { name: "Stripe", icon: <Box size={18} /> },
  { name: "HubSpot", icon: <Users size={18} /> },
  { name: "Zapier", icon: <Zap size={18} /> },
  { name: "Intercom", icon: <Bell size={18} /> },
  { name: "Loom", icon: <Video size={18} /> },
  { name: "Miro", icon: <RefreshCw size={18} /> },
  { name: "Calendar", icon: <Calendar size={18} /> },
  { name: "Dropbox", icon: <UploadCloud size={18} /> },
];

const TESTIMONIALS = [
  {
    name: "Priya Menon",
    role: "Head of Product, Sable",
    quote:
      "Orbit cut our weekly planning meetings in half. The AI scheduling just figures it out.",
  },
  {
    name: "Tom Riedel",
    role: "Engineering Lead, Foxline",
    quote:
      "Dependency tracking alone saved us from two release disasters last quarter.",
  },
  {
    name: "Sara Okafor",
    role: "Founder, Lightframe",
    quote:
      "I replaced four tools with Orbit. The knowledge base is shockingly good.",
  },
  {
    name: "James Vo",
    role: "Operations, ClearPath",
    quote:
      "Async updates keep our remote team aligned without another Slack thread.",
  },
];

const FAQS = [
  {
    q: "How does the AI scheduling work?",
    a: "Orbit analyses your team's workload, deadlines, and historical velocity to automatically suggest task assignments and time blocks — no manual juggling required.",
  },
  {
    q: "Can I migrate from Notion or Jira?",
    a: "Yes. Orbit ships first-party importers for Notion, Jira, Asana, Linear, and Trello. Most teams are fully migrated within a day.",
  },
  {
    q: "Is there a free plan?",
    a: "The Starter tier is free forever for up to 5 members with unlimited projects and docs. AI features are included on the Pro plan.",
  },
  {
    q: "Where is my data stored?",
    a: "All data is stored in SOC 2 Type II certified infrastructure in the region of your choice (US, EU, APAC). You can export everything at any time.",
  },
  {
    q: "Do you offer SSO and SCIM?",
    a: "SSO (SAML 2.0) and SCIM provisioning are available on the Pro plan. Enterprise SLAs and dedicated support are available on request.",
  },
];

const FOOTER_COLS = [
  {
    heading: "Product",
    links: ["Overview", "Changelog", "Roadmap", "Status", "Docs"],
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Careers", "Press", "Contact"],
  },
  {
    heading: "Resources",
    links: ["Templates", "Guides", "Webinars", "Affiliates", "Security"],
  },
];

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-300 bg-white ${
        scrolled ? "shadow-sm border-b border-zinc-100" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-auto font-semibold text-zinc-900 text-sm tracking-tight select-none">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <Circle size={22} className="text-violet-600 absolute" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-violet-600" />
          </div>
          Orbit
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3 ml-6">
          <a
            href="#"
            className="hidden sm:inline text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Log in
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Try free
            <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────────── */
function Hero() {
  const [email, setEmail] = React.useState("");

  return (
    <section className="pt-36 pb-24 px-6 bg-white text-center">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full mb-6">
            <Zap size={12} /> Now in public beta
          </span>
        </Reveal>

        <Reveal delay={1}>
          <h1 className="text-5xl sm:text-6xl font-bold text-zinc-900 leading-tight tracking-tight mb-5">
            The workspace that{" "}
            <span className="text-violet-600">thinks ahead</span>
          </h1>
        </Reveal>

        <Reveal delay={2}>
          <p className="text-lg text-zinc-500 leading-relaxed max-w-xl mx-auto mb-10">
            Orbit is an AI-powered productivity suite that unifies tasks, docs,
            and communication — and surfaces what your team needs before they
            have to ask.
          </p>
        </Reveal>

        <Reveal delay={3}>
          <form
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full sm:w-72 px-4 py-2.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Get early access
              <ArrowRight size={15} />
            </button>
          </form>
        </Reveal>

        {/* Stats */}
        <Reveal delay={4}>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-zinc-500">
            {[
              { value: "50k+", label: "teams" },
              { value: "2.4×", label: "faster" },
              { value: "99.9%", label: "uptime" },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <span className="text-xl font-semibold text-zinc-900">{value}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Feature columns ────────────────────────────────────────────────────────── */
function Features() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6 bg-zinc-50 border-y border-zinc-100">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3 text-center">
            Platform
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 text-center mb-14 tracking-tight">
            Everything in one place
          </h2>
        </Reveal>

        <div ref={ref} className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={i}
              className="bg-white rounded-2xl border border-zinc-100 p-7 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-5">
                {feat.icon}
              </div>
              <h3 className="font-semibold text-zinc-900 mb-4 text-base">
                {feat.title}
              </h3>
              <ul className="space-y-2.5">
                {feat.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-zinc-500">
                    <CheckCircle2 size={14} className="text-violet-400 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Product showcase — Kanban mock ─────────────────────────────────────────── */
function ProductShowcase() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3 text-center">
            Product
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 text-center mb-3 tracking-tight">
            See Orbit in action
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="text-center text-zinc-500 text-sm mb-10 max-w-md mx-auto">
            A single view keeps every task, every owner, and every deadline
            visible at a glance.
          </p>
        </Reveal>

        {/* App window */}
        <Reveal delay={3}>
          <div className="rounded-2xl border border-zinc-200 overflow-hidden shadow-xl">
            {/* Window chrome */}
            <div className="bg-zinc-900 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-400/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
              <div className="ml-4 flex-1 bg-zinc-800 rounded px-3 py-1 text-xs text-zinc-500 max-w-xs">
                app.orbit.so/team/q2-roadmap
              </div>
            </div>

            {/* Sidebar + board */}
            <div className="bg-zinc-950 flex">
              {/* Sidebar */}
              <div className="w-44 shrink-0 border-r border-zinc-800 py-4 px-3 hidden sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-2 mb-2">
                  Workspace
                </p>
                {["Q2 Roadmap", "Design System", "Bug Triage", "OKRs"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-default transition-colors ${
                        i === 0
                          ? "bg-violet-600/20 text-violet-300"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <LayoutGrid size={12} />
                      {item}
                    </div>
                  )
                )}
              </div>

              {/* Kanban */}
              <div className="flex-1 p-5 overflow-x-auto">
                <div ref={ref} className="flex gap-4 min-w-[540px]">
                  {KANBAN_COLUMNS.map((col, ci) => (
                    <div key={col.label} className="flex-1 min-w-[160px]">
                      {/* Column header */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                        <span className="text-xs font-medium text-zinc-400">
                          {col.label}
                        </span>
                        <span className="ml-auto text-[10px] text-zinc-600">
                          {col.cards.length}
                        </span>
                      </div>

                      {/* Cards */}
                      <div className="space-y-2.5">
                        {col.cards.map((card, ki) => (
                          <motion.div
                            key={card.title}
                            variants={fadeUp}
                            initial="hidden"
                            animate={inView ? "visible" : "hidden"}
                            custom={ci * 0.4 + ki * 0.15}
                            className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-3 cursor-default hover:border-zinc-600 transition-colors"
                          >
                            <p className="text-xs text-zinc-200 leading-snug mb-2">
                              {card.title}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-500 bg-zinc-700/60 px-1.5 py-0.5 rounded">
                                {card.tag}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  PRIORITY_COLORS[card.priority]
                                }`}
                              >
                                {card.priority}
                              </span>
                            </div>
                          </motion.div>
                        ))}

                        {/* Add card ghost */}
                        <div className="flex items-center gap-1.5 px-1 py-1 text-[11px] text-zinc-700 cursor-default hover:text-zinc-500 transition-colors">
                          <span className="text-base leading-none">+</span> Add task
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Integrations ───────────────────────────────────────────────────────────── */
function Integrations() {
  return (
    <section className="py-24 px-6 bg-zinc-50 border-y border-zinc-100">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3 text-center">
            Integrations
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 text-center mb-12 tracking-tight">
            Connects to the tools you love
          </h2>
        </Reveal>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {INTEGRATIONS.map((int, i) => (
            <Reveal key={int.name} delay={i * 0.04}>
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-1.5 bg-white border border-zinc-100 rounded-xl p-3 cursor-default hover:border-violet-200 hover:shadow-sm transition-all"
              >
                <span className="text-violet-600">{int.icon}</span>
                <span className="text-[10px] text-zinc-500 text-center leading-tight">
                  {int.name}
                </span>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ────────────────────────────────────────────────────────────────── */
const STARTER_FEATURES = [
  "Up to 5 members",
  "Unlimited projects & tasks",
  "Docs & wikis",
  "5 GB storage",
  "Community support",
];
const PRO_FEATURES = [
  "Unlimited members",
  "Everything in Starter",
  "AI scheduling & summarization",
  "Advanced analytics",
  "SSO & SCIM",
  "Priority support",
  "50 GB storage",
];

function Pricing() {
  const [annual, setAnnual] = React.useState(true);

  return (
    <section className="py-24 px-6 bg-white" id="pricing">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3 text-center">
            Pricing
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 text-center mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
        </Reveal>

        {/* Toggle */}
        <Reveal delay={2}>
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-sm ${annual ? "text-zinc-900" : "text-zinc-400"}`}>
              Annual
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                annual ? "bg-violet-600" : "bg-zinc-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  annual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm ${!annual ? "text-zinc-900" : "text-zinc-400"}`}>
              Monthly
            </span>
            {annual && (
              <span className="text-[11px] font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                Save 20%
              </span>
            )}
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Starter */}
          <Reveal delay={0}>
            <div className="rounded-2xl border border-zinc-200 p-8 h-full flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
                Starter
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-zinc-900">$0</span>
              </div>
              <p className="text-sm text-zinc-400 mb-8">Free forever, no card needed</p>
              <ul className="space-y-3 mb-10 flex-1">
                {STARTER_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-600">
                    <CheckCircle2 size={14} className="text-zinc-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="block text-center text-sm font-medium border border-zinc-200 hover:border-violet-300 text-zinc-700 hover:text-violet-700 py-2.5 rounded-lg transition-colors"
              >
                Get started free
              </a>
            </div>
          </Reveal>

          {/* Pro */}
          <Reveal delay={1}>
            <div className="rounded-2xl border-2 border-violet-600 bg-violet-600 p-8 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
                Most popular
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-200 mb-2">
                Pro
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-white">
                  ${annual ? "10" : "12"}
                </span>
                <span className="text-white/70 text-sm">/seat/mo</span>
              </div>
              <p className="text-sm text-violet-200 mb-8">
                Billed {annual ? "annually" : "monthly"}
              </p>
              <ul className="space-y-3 mb-10 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/90">
                    <CheckCircle2 size={14} className="text-violet-200 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="block text-center text-sm font-semibold bg-white text-violet-700 hover:bg-violet-50 py-2.5 rounded-lg transition-colors"
              >
                Start free trial
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────────────────────── */
function Testimonials() {
  return (
    <section className="py-24 px-6 bg-zinc-50 border-y border-zinc-100">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3 text-center">
            Testimonials
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 text-center mb-12 tracking-tight">
            Loved by focused teams
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="bg-white border border-zinc-100 rounded-2xl p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      size={13}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed mb-5">
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{t.name}</p>
                  <p className="text-xs text-zinc-400">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────────────────────── */
function FAQ() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 mb-3 text-center">
            FAQ
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 text-center mb-12 tracking-tight">
            Common questions
          </h2>
        </Reveal>

        <div className="divide-y divide-zinc-100">
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <Reveal key={faq.q} delay={i * 0.07}>
                <div>
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full flex items-center justify-between py-5 text-left group"
                  >
                    <span className="text-sm font-medium text-zinc-900 group-hover:text-violet-700 transition-colors pr-4">
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0 text-zinc-400"
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 text-sm text-zinc-500 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────────── */
function Footer() {
  const [email, setEmail] = React.useState("");

  return (
    <footer className="bg-zinc-950 text-zinc-400 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm mb-4 select-none">
              <div className="relative w-6 h-6 flex items-center justify-center">
                <Circle size={22} className="text-violet-500 absolute" strokeWidth={1.5} />
                <div className="w-2 h-2 rounded-full bg-violet-500" />
              </div>
              Orbit
            </div>
            <p className="text-xs leading-relaxed mb-5">
              The AI-powered workspace for teams who move fast without breaking
              things.
            </p>
            {/* Newsletter */}
            <form
              className="flex gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-600 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
              />
              <button
                type="submit"
                className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-lg transition-colors"
              >
                <Mail size={14} />
              </button>
            </form>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>© 2025 Orbit Technologies, Inc. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function ProductivityOrbitSuitePage() {
  useLenis();

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ProductShowcase />
        <Integrations />
        <Pricing />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
