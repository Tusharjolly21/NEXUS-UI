"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Clock,
  Code2,
  Cpu,
  GitBranch,
  Globe,
  LayoutDashboard,
  Paperclip,
  Play,
  Plus,
  RefreshCw,
  Send,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── FadeUp ─────────────────────────────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className,
  from = "bottom",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  from?: "bottom" | "left" | "right";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const initial = {
    opacity: 0,
    filter: "blur(6px)",
    y: from === "bottom" ? 32 : 0,
    x: from === "left" ? -40 : from === "right" ? 40 : 0,
  };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { opacity: 1, y: 0, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── TiltCard ───────────────────────────────────────────────────────── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 180, damping: 22 });
  const sy = useSpring(my, { stiffness: 180, damping: 22 });
  const rotateX = useTransform(sy, [-80, 80], [4, -4]);
  const rotateY = useTransform(sx, [-80, 80], [-4, 4]);
  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left - r.width / 2);
        my.set(e.clientY - r.top - r.height / 2);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      whileHover={{ scale: 1.018, transition: { type: "spring", stiffness: 280, damping: 26 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stagger container variants ─────────────────────────────────────── */
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } },
};

/* ─── NAVBAR ─────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: EASE }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <motion.a href="#" className="flex items-center gap-2.5" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <motion.div
            className="grid size-7 place-items-center rounded-lg bg-orange-500"
            whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.35 } }}
          >
            <Zap className="size-3.5 text-white" />
          </motion.div>
          <span className="text-[15px] font-bold tracking-tight text-gray-900">Synapse</span>
        </motion.a>

        <nav className="hidden items-center gap-8 md:flex">
          {["Features", "Integrations", "Pricing", "Blog"].map((item) => (
            <motion.a
              key={item}
              href="#"
              className="group relative text-sm text-gray-500 transition hover:text-gray-900"
            >
              {item}
              <motion.span
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left bg-orange-400"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.22, ease: EASE }}
              />
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#" className="hidden text-sm text-gray-500 transition hover:text-gray-900 md:block">Sign in</a>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full bg-gray-900 px-4 py-2 text-[13px] font-semibold text-white"
          >
            Start building
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────────── */
const HEADLINE_LINES = [
  { words: ["Build", "and", "deploy"], orange: false },
  { words: ["intelligent", "agents"], orange: true },
  { words: ["at", "scale"], orange: false },
];

function Hero() {
  /* 3-D perspective tilt driven by mouse over the whole section */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 24 });
  const sy = useSpring(my, { stiffness: 55, damping: 24 });
  const rotateX = useTransform(sy, [-500, 500], [5, -5]);
  const rotateY = useTransform(sx, [-500, 500], [-5, 5]);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  };
  const handleLeave = () => { mx.set(0); my.set(0); };

  let wi = 0; // global word index for stagger delay calc

  return (
    <section
      className="relative overflow-hidden bg-white pb-0 pt-32"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* ── Animated gradient orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { cls: "-top-48 left-1/2 -translate-x-1/2 h-[560px] w-[560px] bg-orange-100/55", delay: 0, dx: 24, dy: -18 },
          { cls: "top-24 -left-24 h-80 w-80 bg-violet-50/55", delay: 1.8, dx: -18, dy: 22 },
          { cls: "top-24 -right-24 h-80 w-80 bg-sky-50/55", delay: 1, dx: 18, dy: 28 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            animate={{ x: [0, orb.dx, 0], y: [0, orb.dy, 0], scale: [1, 1.13, 1] }}
            transition={{ duration: 9 + i * 2, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
            className={cn("absolute rounded-full blur-3xl", orb.cls)}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-4xl px-5 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3.5 py-1.5 text-xs font-medium text-orange-600"
        >
          <motion.span
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="size-1.5 rounded-full bg-orange-500"
          />
          For high-velocity engineering teams
        </motion.div>

        {/* Headline — word-by-word blur-up */}
        <h1 className="mt-6 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl md:text-[4.5rem]">
          {HEADLINE_LINES.map((line, li) => (
            <div key={li} className="block">
              {line.words.map((word) => {
                const delay = 0.08 + wi++ * 0.075;
                return (
                  <motion.span
                    key={word + li}
                    initial={{ opacity: 0, y: 48, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay, duration: 0.65, ease: EASE }}
                    className={cn("inline-block mr-[0.22em]", line.orange ? "text-orange-500" : "text-gray-900")}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </div>
          ))}
        </h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, duration: 0.6, ease: EASE }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg"
        >
          Empower your engineering team to create, simulate, and monitor AI-driven
          workflows — no boilerplate required.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.84, duration: 0.6, ease: EASE }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: "0 8px 36px rgba(0,0,0,0.22)" }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Start building free
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="size-4" />
            </motion.span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06, backgroundColor: "rgb(249,250,251)", borderColor: "rgb(209,213,219)" }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Play className="size-4 fill-orange-500 text-orange-500" />
            </motion.span>
            Watch demo
          </motion.button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {["#F97316", "#7C3AED", "#10B981", "#3B82F6"].map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, scale: 0, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 1.0 + i * 0.08, type: "spring", stiffness: 380, damping: 18 }}
                  className="size-6 rounded-full border-2 border-white shadow-sm"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="font-medium text-gray-600">2,000+ engineering teams</span>
          </div>
          <span className="text-gray-200">·</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: -25 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1.1 + i * 0.07, type: "spring", stiffness: 340, damping: 14 }}
              >
                <Star className="size-3 fill-orange-400 text-orange-400" />
              </motion.span>
            ))}
            <span className="ml-1">4.9 on G2</span>
          </div>
          <span className="text-gray-200">·</span>
          <span>Innovative AI 2025 by <strong className="text-gray-600">Gartner</strong></span>
        </motion.div>
      </div>

      {/* ── App mockup: 3-D tilt + float ── */}
      <motion.div
        initial={{ opacity: 0, y: 90, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.58, duration: 1.05, ease: EASE }}
        className="relative mx-auto mt-16 max-w-5xl px-5"
        style={{ perspective: 1400 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.13),0_0_0_1px_rgba(0,0,0,0.04)]"
        >
          {/* Browser bar */}
          <div className="flex h-10 items-center gap-2 border-b border-gray-100 bg-gray-50 px-4">
            <div className="flex gap-1.5">
              {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c) => (
                <motion.span key={c} whileHover={{ scale: 1.35 }} className={cn("size-3 rounded-full cursor-pointer", c)} />
              ))}
            </div>
            <div className="mx-auto rounded-md border border-gray-200 bg-white px-12 py-0.5 text-[11px] text-gray-400">
              app.synapse.ai/dashboard
            </div>
          </div>

          {/* App layout */}
          <div className="flex" style={{ height: 420 }}>
            {/* Sidebar */}
            <div className="w-52 shrink-0 border-r border-gray-100 p-4">
              <div className="mb-5 flex items-center gap-2">
                <div className="grid size-6 place-items-center rounded-md bg-orange-500">
                  <Zap className="size-3 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900">Synapse</span>
              </div>
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true },
                { icon: Bot, label: "Agents" },
                { icon: GitBranch, label: "Workflows" },
                { icon: Play, label: "Simulations" },
                { icon: BarChart3, label: "Analytics" },
                { icon: Globe, label: "Integrations" },
              ].map(({ icon: Icon, label, active }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.07, duration: 0.4, ease: EASE }}
                  className={cn(
                    "mb-0.5 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors hover:bg-gray-50",
                    active ? "bg-orange-50 font-medium text-orange-600" : "text-gray-500",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </motion.div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 bg-gray-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-[15px] font-semibold text-gray-900"
                >
                  Dashboard
                </motion.h3>
                <motion.div
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, ease: EASE }}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-400"
                >
                  Search for anything...
                  <kbd className="ml-2 rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
                </motion.div>
              </div>

              {/* KPI strip */}
              <div className="mb-4 grid grid-cols-4 gap-3">
                {[
                  { label: "Active agents", value: "128", icon: Bot, color: "text-orange-500", trend: "+12%" },
                  { label: "Task success", value: "96.7%", icon: Check, color: "text-emerald-500", trend: "+4%" },
                  { label: "Avg latency", value: "12.4s", icon: Clock, color: "text-blue-500", trend: "-27%" },
                  { label: "Top model", value: "GPT-4o", icon: Cpu, color: "text-purple-500" },
                ].map(({ label, value, icon: Icon, color, trend }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.88 + i * 0.08, duration: 0.45, ease: EASE }}
                    whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", transition: { duration: 0.18 } }}
                    className="rounded-xl border border-gray-100 bg-white p-3 cursor-default"
                  >
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Icon className={cn("size-3.5", color)} />
                      <span className="text-[10px] text-gray-400">{label}</span>
                    </div>
                    <p className="text-lg font-bold tracking-tight text-gray-900">{value}</p>
                    {trend && <p className="mt-0.5 text-[10px] font-medium text-emerald-500">{trend}</p>}
                  </motion.div>
                ))}
              </div>

              {/* Agent table */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.12, duration: 0.5, ease: EASE }}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white"
              >
                <div className="border-b border-gray-100 px-4 py-2.5">
                  <p className="text-xs font-semibold text-gray-700">Workflow monitor</p>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-[10px] text-gray-400">
                      {["Agent name", "Model used", "Status", "Latency", "Last run"].map((h) => (
                        <th key={h} className="px-4 py-2 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "deploy-agent-7", model: "GPT-4o mini", status: "Running", latency: "8.2s", ago: "14 min ago" },
                      { name: "sales-sync-bot", model: "Llama 3.1 8B", status: "Paused", latency: "11.4s", ago: "32 min ago" },
                      { name: "social-marketing", model: "Llama 3.1 70B", status: "Running", latency: "6.7s", ago: "47 min ago" },
                    ].map((row, i) => (
                      <motion.tr
                        key={row.name}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.22 + i * 0.1, ease: EASE }}
                        className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60"
                      >
                        <td className="px-4 py-2.5 font-medium text-gray-800">{row.name}</td>
                        <td className="px-4 py-2.5">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">{row.model}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={cn("flex items-center gap-1.5 font-medium", row.status === "Running" ? "text-emerald-600" : "text-amber-500")}>
                            {row.status === "Running" ? (
                              <motion.span
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
                                className="size-1.5 rounded-full bg-emerald-500"
                              />
                            ) : (
                              <span className="size-1.5 rounded-full bg-amber-400" />
                            )}
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{row.latency}</td>
                        <td className="px-4 py-2.5 text-gray-400">{row.ago}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Glow reflection */}
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-20 bg-linear-to-b from-transparent to-orange-50/30 blur-2xl" />
      </motion.div>
    </section>
  );
}

/* ─── LOGO STRIP ─────────────────────────────────────────────────────── */
const LOGOS = ["Stripe", "Vercel", "Linear", "Notion", "Figma", "GitHub", "Slack", "Anthropic", "OpenAI", "Cloudflare"];

function LogoStrip() {
  return (
    <section className="overflow-hidden border-y border-gray-100 bg-gray-50 py-8">
      <FadeUp className="mb-6 text-center text-xs text-gray-400">
        Trusted by teams at world-class companies
      </FadeUp>
      <div className="flex flex-col gap-3">
        {/* Row 1 → */}
        <div className="flex overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            className="flex shrink-0 gap-14 pr-14"
          >
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <motion.span
                key={i}
                whileHover={{ color: "#111827", scale: 1.1, transition: { duration: 0.15 } }}
                className="whitespace-nowrap cursor-default select-none text-sm font-semibold tracking-tight text-gray-300"
              >
                {logo}
              </motion.span>
            ))}
          </motion.div>
        </div>
        {/* Row 2 ← */}
        <div className="flex overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex shrink-0 gap-14 pr-14"
          >
            {[...LOGOS.slice(5), ...LOGOS, ...LOGOS.slice(0, 5)].map((logo, i) => (
              <motion.span
                key={i}
                whileHover={{ color: "#111827", scale: 1.1, transition: { duration: 0.15 } }}
                className="whitespace-nowrap cursor-default select-none text-sm font-semibold tracking-tight text-gray-300"
              >
                {logo}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────────────────── */
function HowVisual({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-10">
        <div className="flex w-full max-w-xs flex-col items-center gap-1">
          {[
            { label: "Trigger: Webhook", bg: "bg-orange-50 border-orange-200 text-orange-700" },
            { label: "Process: LLM Agent", bg: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Action: Send Email", bg: "bg-emerald-50 border-emerald-200 text-emerald-700" },
          ].map((node, i) => (
            <React.Fragment key={node.label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.88, x: -12 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: i * 0.12, duration: 0.4, ease: EASE }}
                whileHover={{ scale: 1.03, x: 4 }}
                className={cn("w-full rounded-xl border px-6 py-3 text-center text-sm font-medium cursor-default", node.bg)}
              >
                {node.label}
              </motion.div>
              {i < 2 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 20, opacity: 1 }}
                  transition={{ delay: i * 0.12 + 0.2, duration: 0.3 }}
                  className="w-px border-l-2 border-dashed border-gray-200"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex h-full flex-col gap-3 p-6">
        {/* Slack connection card */}
        <motion.div
          initial={{ opacity: 0, y: -14, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.42, ease: EASE }}
          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-purple-600 text-base font-bold text-white">#</div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Slack</p>
                <p className="text-[11px] text-gray-400">#standups</p>
              </div>
            </div>
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.32, type: "spring", stiffness: 340, damping: 18 }}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600"
            >
              Connected
            </motion.span>
          </div>
        </motion.div>

        {/* AI model rows */}
        <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">AI Models</p>
        <div className="flex flex-col gap-2">
          {[
            { name: "Anthropic", model: "Claude 4", badge: "Generator", bg: "bg-orange-500", char: "A" },
            { name: "Meta", model: "Llama 2", badge: "Text Generator", bg: "bg-blue-600", char: "∞" },
            { name: "OpenAI", model: "GPT-4o", badge: "Code Generator", bg: "bg-gray-900", char: "O" },
          ].map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + i * 0.11, duration: 0.4, ease: EASE }}
              whileHover={{ x: 3, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", transition: { duration: 0.15 } }}
              className="flex cursor-default items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className={cn("grid size-6 place-items-center rounded-md text-[11px] font-bold text-white", m.bg)}>
                  {m.char}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-700">{m.name}</span>
                  <span className="text-[10px] text-gray-400">{m.model}</span>
                </div>
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38 + i * 0.1 }}
                className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-600"
              >
                {m.badge}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="w-full max-w-xs rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">Agent performance</span>
          <span className="text-[10px] text-gray-400">Past 7 days</span>
        </div>
        {[
          { label: "Completion rate", value: "96.7%", pct: 97 },
          { label: "Avg response time", value: "1.4s", pct: 85 },
          { label: "Cost efficiency", value: "↓ 34%", pct: 66 },
        ].map((m, i) => (
          <div key={m.label} className="mb-2.5">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-gray-500">{m.label}</span>
              <span className="font-semibold text-gray-800">{m.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.pct}%` }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.9, ease: EASE }}
                className="h-full rounded-full bg-orange-400"
              />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const HOW_STEPS = [
  { icon: GitBranch, title: "Design your workflow", desc: "A visual drag-and-drop editor to create, connect, and configure AI agents into logical pipelines — no code required." },
  { icon: Globe, title: "Connect your tools", desc: "Integrate 200+ services in one click. Agents access your data sources, APIs, and collaboration tools autonomously." },
  { icon: TrendingUp, title: "Deploy & monitor", desc: "Go live in seconds. Track agent performance, execution logs, and resource usage with real-time dashboards." },
];

function HowItWorks() {
  const [active, setActive] = React.useState(0);

  /* Auto-advance */
  React.useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % 3), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <FadeUp className="text-center">
          <p className="mb-3 text-sm font-semibold text-orange-500">How it works</p>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Set up in minutes</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            From idea to production-grade AI agents in three steps — no DevOps overhead required.
          </p>
        </FadeUp>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Steps */}
          <div className="flex flex-col gap-3">
            {HOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = active === i;
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  animate={isActive ? {
                    boxShadow: "0 0 0 2px #F97316, 0 8px 32px rgba(249,115,22,0.10)",
                  } : {
                    boxShadow: "0 0 0 1px transparent",
                  }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-6 text-left transition-colors duration-300",
                    isActive ? "border-orange-200 bg-orange-50" : "border-gray-100 bg-white hover:border-gray-200",
                  )}
                >
                  {/* Auto-fill progress bar */}
                  {isActive && (
                    <motion.div
                      key={`progress-${active}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4.5, ease: "linear" }}
                      className="absolute inset-x-0 bottom-0 h-0.75 bg-linear-to-r from-orange-400 to-orange-300"
                    />
                  )}

                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={isActive ? { rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-xl border",
                        isActive ? "border-orange-200 bg-white" : "border-gray-100 bg-gray-50",
                      )}
                    >
                      <Icon className={cn("size-5", isActive ? "text-orange-500" : "text-gray-400")} />
                    </motion.div>
                    <div>
                      <p className={cn("text-[15px] font-semibold transition-colors", isActive ? "text-gray-900" : "text-gray-600")}>
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Visual panel */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm" style={{ minHeight: 360 }}>
            <div className="flex h-8 items-center gap-1.5 border-b border-gray-100 bg-white px-4">
              {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c) => (
                <span key={c} className={cn("size-2.5 rounded-full", c)} />
              ))}
              <span className="ml-auto font-mono text-[9px] text-gray-300">step {active + 1} / 3</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 24, scale: 0.96, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -24, scale: 0.96, filter: "blur(4px)" }}
                transition={{ duration: 0.32, ease: EASE }}
                style={{ height: "calc(100% - 2rem)" }}
              >
                <HowVisual step={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES ───────────────────────────────────────────────────────── */

/* Left card — floating chip + staggered model rows */
function ModelSelectorCard() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const models = [
    { name: "Claude 4 Opus", badge: "Unavailable", bc: "text-red-500 border-red-200 bg-red-50", dot: "bg-red-400" },
    { name: "ChatGPT", badge: "Connected", bc: "text-emerald-600 border-emerald-200 bg-emerald-50", dot: "bg-emerald-400" },
    { name: "Llama 3.2", badge: "Waiting", bc: "text-amber-500 border-amber-200 bg-amber-50", dot: "bg-amber-400" },
  ];

  return (
    <TiltCard className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="p-6 pb-3">
        <div className="mb-1 flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          >
            <Cpu className="size-4 text-orange-500" />
          </motion.div>
          <h3 className="text-[15px] font-semibold text-gray-900">LLM Model Selector</h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-500">
          Track real-time activity of agents with detailed records of triggers, tools used, outcomes, and timestamps.
        </p>
      </div>

      <div ref={ref} className="relative px-6 pb-6">
        {/* ── Floating "Open AI · GPT 5 · Connected" chip ── */}
        <motion.div
          initial={{ opacity: 0, y: -22, scale: 0.86 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
          className="absolute -top-1 right-8 z-10"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.11)]"
          >
            {/* OpenAI circle logo */}
            <div className="grid size-5 shrink-0 place-items-center rounded-full bg-gray-900 text-[9px] font-black text-white">
              O
            </div>
            <span className="text-xs font-semibold text-gray-800">Open AI</span>
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">GPT 5</span>
            <div className="flex items-center gap-1.5">
              <motion.span
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="size-1.5 rounded-full bg-emerald-500"
              />
              <span className="text-[10px] font-semibold text-emerald-600">Connected</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Model list panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.18, duration: 0.5, ease: EASE }}
          className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
        >
          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2.5">
            <span className="text-xs font-semibold text-gray-700">All Models</span>
            <span className="text-xs text-gray-400">69,420 tokens used</span>
          </div>
          {models.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.28 + i * 0.11, duration: 0.42, ease: EASE }}
              whileHover={{ backgroundColor: "rgb(249,250,251)", x: 3, transition: { duration: 0.15 } }}
              className="flex cursor-default items-center justify-between border-b border-gray-100 px-4 py-3 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <motion.span
                  animate={m.badge === "Connected" ? { scale: [1, 1.4, 1], opacity: [1, 0.4, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  className={cn("size-1.5 rounded-full", m.dot)}
                />
                <span className="text-sm font-medium text-gray-700">{m.name}</span>
              </div>
              <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-medium", m.bc)}>
                {m.badge}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </TiltCard>
  );
}

/* Right card — chat UI matching the GIF exactly */
function ChatWorkflowCard() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const messages = [
    { side: "bot" as const, text: "How can I help you today?" },
    { side: "user" as const, text: "I want to create a workflow that will send an email to all my clients" },
    { side: "bot" as const, text: "Nah, do it yourself." },
  ];

  return (
    <TiltCard className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="p-6 pb-3">
        <div className="mb-1 flex items-center gap-2">
          <Code2 className="size-4 text-orange-500" />
          <h3 className="text-[15px] font-semibold text-gray-900">Text to workflow builder</h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-500">
          Preview and debug workflow logic in a safe sandbox before deploying, helping you iterate with confidence.
        </p>
      </div>

      <div ref={ref} className="px-6 pb-6">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          {/* Messages */}
          <div className="flex flex-col gap-3 p-4 pb-3">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16, scale: 0.91 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: 0.1 + i * 0.22, duration: 0.45, ease: EASE }}
                className={cn("flex items-end gap-2", msg.side === "user" ? "justify-end" : "justify-start")}
              >
                {/* Bot avatar */}
                {msg.side === "bot" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ delay: 0.1 + i * 0.22, type: "spring", stiffness: 350, damping: 18 }}
                    className="mb-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gray-100"
                  >
                    <Bot className="size-3.5 text-gray-400" />
                  </motion.div>
                )}

                <div className={cn(
                  "max-w-[76%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                  msg.side === "user"
                    ? "rounded-br-sm bg-blue-500 text-white shadow-md shadow-blue-200"
                    : "rounded-bl-sm border border-gray-100 bg-gray-50 text-gray-600",
                )}>
                  {msg.text}
                </div>

                {/* User avatar */}
                {msg.side === "user" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ delay: 0.1 + i * 0.22, type: "spring", stiffness: 350, damping: 18 }}
                    className="mb-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-blue-500 text-[9px] font-bold text-white shadow-sm"
                  >
                    U
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Input bar — matches GIF: "Ask Notus AI..." + paperclip + send */}
          <div className="border-t border-gray-100 px-4 py-3">
            <motion.div
              animate={{ borderColor: ["rgb(229,231,235)", "rgb(147,197,253)", "rgb(229,231,235)"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2.5 rounded-xl border bg-gray-50 px-3.5 py-2.5"
            >
              <span className="flex-1 text-xs text-gray-400">Ask Synapse AI...</span>
              <div className="flex shrink-0 items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.15, color: "#6b7280" }}
                  className="text-gray-300 transition-colors"
                >
                  <Paperclip className="size-3.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="grid size-6 place-items-center rounded-lg bg-blue-500 shadow-sm shadow-blue-200"
                >
                  <Send className="size-3 text-white" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <FadeUp className="text-center">
          <p className="mb-3 text-sm font-semibold text-orange-500">Features</p>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Built for agentic intelligence</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            Build, test, and deploy AI agents with a powerful visual interface designed for technical teams.
          </p>
        </FadeUp>

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          <FadeUp delay={0.08}><ModelSelectorCard /></FadeUp>
          <FadeUp delay={0.14}><ChatWorkflowCard /></FadeUp>
        </div>

        {/* Small feature cards */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Globe, title: "Native integrations", desc: "Connect 200+ tools in one click with pre-built, maintained connectors." },
            { icon: Shield, title: "One-click auth", desc: "Enterprise-grade SSO, RBAC, and audit logging out of the box." },
            { icon: RefreshCw, title: "Real-time sync", desc: "Agents work with live data — no stale caches or polling delays." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <FadeUp key={title} delay={0.1 + i * 0.06}>
              <motion.div
                whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(0,0,0,0.09)", transition: { duration: 0.22 } }}
                className="h-full cursor-default rounded-2xl border border-gray-200 bg-white p-6"
              >
                <motion.div
                  whileHover={{ scale: 1.12, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="mb-3 grid size-10 place-items-center rounded-xl border border-orange-100 bg-orange-50"
                >
                  <Icon className="size-5 text-orange-500" />
                </motion.div>
                <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── BENEFITS ───────────────────────────────────────────────────────── */
const BENEFITS_L = [
  { icon: Zap, title: "Launch faster", desc: "Orchestrate autonomous agents without writing boilerplate code." },
  { icon: RefreshCw, title: "Iterate rapidly", desc: "Test and refine workflows in sandbox mode before going live." },
  { icon: TrendingUp, title: "Scale smarter", desc: "Auto-scale agents up or down based on workload demand." },
];
const BENEFITS_R = [
  { icon: Sparkles, title: "Reuse intelligence", desc: "Library of pre-built agent templates for common use cases." },
  { icon: Shield, title: "Prevent breakdowns", desc: "Built-in monitoring with automatic retry and fallback logic." },
  { icon: BarChart3, title: "Automate more", desc: "Chain agents into complex multi-step orchestrations." },
];

function BenefitCard({ icon: Icon, title, desc, delay, from }: { icon: React.ElementType; title: string; desc: string; delay: number; from: "left" | "right" }) {
  return (
    <FadeUp delay={delay} from={from}>
      <motion.div
        whileHover={{ scale: 1.02, borderColor: "rgb(254,215,170)", backgroundColor: "rgb(255,247,237,0.6)", transition: { duration: 0.2 } }}
        className="rounded-2xl border border-gray-100 p-5 cursor-default transition-colors"
      >
        <motion.div
          whileHover={{ scale: 1.15, rotate: -6 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          <Icon className="mb-3 size-5 text-orange-400" />
        </motion.div>
        <p className="text-[15px] font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{desc}</p>
      </motion.div>
    </FadeUp>
  );
}

function BenefitsCenterVisual() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <FadeUp delay={0.2}>
      <div ref={ref} className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
        {/* Connected nodes */}
        <div className="mb-4 flex items-center justify-center gap-3">
          {[
            { label: "GPT", color: "bg-emerald-500", size: "size-11", ring: false },
            { label: "SYN", color: "bg-orange-500", size: "size-14", ring: true },
            { label: "SLK", color: "bg-purple-500", size: "size-11", ring: false },
          ].map((n, i) => (
            <React.Fragment key={n.label}>
              {i > 0 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.4, ease: EASE }}
                  className="h-px w-6 origin-left bg-gray-300"
                />
              )}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 300, damping: 16 }}
                className={cn("grid place-items-center rounded-xl text-xs font-bold text-white shadow-md", n.color, n.size)}
              >
                {n.ring && (
                  <motion.div
                    animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0.15, 0.5] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute rounded-xl ring-4 ring-orange-200 size-14"
                  />
                )}
                {n.label}
              </motion.div>
            </React.Fragment>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.4, ease: EASE }}
          className="mb-4 flex justify-center"
        >
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-600">
            ● Connected
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.58 }}
          className="mb-3 flex items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 shadow-sm"
        >
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="size-1.5 rounded-full bg-green-400"
          />
          <span className="text-[11px] text-gray-600">3 agents running, 0 errors</span>
        </motion.div>

        {/* Mini metrics */}
        <div className="rounded-xl border border-gray-100 bg-white p-3">
          <p className="mb-2 text-[11px] font-semibold text-gray-700">Dashboard</p>
          {[["API Calls", 78], ["Success Rate", 97], ["Workflows", 62]].map(([label, pct], i) => (
            <div key={String(label)} className="mb-1.5">
              <div className="mb-0.5 flex justify-between text-[10px] text-gray-400">
                <span>{label}</span><span>{pct}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${pct}%` } : {}}
                  transition={{ delay: 0.65 + i * 0.1, duration: 0.9, ease: EASE }}
                  className="h-full rounded-full bg-orange-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </FadeUp>
  );
}

function BenefitsSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <FadeUp className="text-center">
          <p className="mb-3 text-sm font-semibold text-orange-500">Benefits</p>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Making engineers 10× faster</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            Empower your team to deliver AI-powered products faster than ever before.
          </p>
        </FadeUp>

        <div className="mt-14 grid items-center gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4">
            {BENEFITS_L.map(({ icon, title, desc }, i) => (
              <BenefitCard key={title} icon={icon} title={title} desc={desc} delay={0.06 + i * 0.05} from="left" />
            ))}
          </div>
          <BenefitsCenterVisual />
          <div className="flex flex-col gap-4">
            {BENEFITS_R.map(({ icon, title, desc }, i) => (
              <BenefitCard key={title} icon={icon} title={title} desc={desc} delay={0.06 + i * 0.05} from="right" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ───────────────────────────────────────────────────── */
const TESTIMONIALS = [
  { quote: "Synapse cut our agent deployment time from weeks to hours. We now iterate on workflows daily.", author: "Sarah Chen", role: "Head of AI, Vercel", color: "#7C3AED" },
  { quote: "The visual workflow editor is a game-changer. Our PMs can now prototype agent flows independently.", author: "Marcus Rodriguez", role: "CTO, Linear", color: "#F97316" },
  { quote: "We run 300+ concurrent agents in production. Synapse's monitoring makes it trivial to debug issues.", author: "Priya Patel", role: "Engineering Lead, Stripe", color: "#10B981" },
];

function Testimonials() {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <FadeUp className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Loved by engineering teams</h2>
        </FadeUp>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.author} delay={0.07 * i}>
              <motion.div
                animate={active === i ? {
                  scale: 1.03,
                  y: -6,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.10)",
                  borderColor: "rgb(254,215,170)",
                } : {
                  scale: 1,
                  y: 0,
                  boxShadow: "0 0 0 rgba(0,0,0,0)",
                  borderColor: "rgb(243,244,246)",
                }}
                transition={{ duration: 0.35, ease: EASE }}
                onClick={() => setActive(i)}
                className="h-full cursor-pointer rounded-2xl border bg-white p-6"
              >
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <motion.span
                      key={j}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.07 * i + j * 0.05, type: "spring", stiffness: 320, damping: 16 }}
                    >
                      <Star className="size-4 fill-orange-400 text-orange-400" />
                    </motion.span>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {active === i ? (
                    <motion.p
                      key="active"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="text-sm leading-relaxed text-gray-700"
                    >
                      &ldquo;{t.quote}&rdquo;
                    </motion.p>
                  ) : (
                    <p className="text-sm leading-relaxed text-gray-500">&ldquo;{t.quote}&rdquo;</p>
                  )}
                </AnimatePresence>
                <div className="mt-5 flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    className="grid size-9 place-items-center rounded-full text-sm font-bold text-white"
                    style={{ background: t.color }}
                  >
                    {t.author[0]}
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                    <p className="text-[11px] text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>

        {/* Progress dots */}
        <div className="mt-8 flex justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              animate={{ width: active === i ? 24 : 8, backgroundColor: active === i ? "#fb923c" : "#e5e7eb" }}
              transition={{ duration: 0.3, ease: EASE }}
              className="h-2 rounded-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING ────────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Starter",
    monthly: 0,
    yearly: 0,
    desc: "Perfect for exploring and personal projects.",
    features: ["5 active agents", "1,000 tasks/month", "2 integrations", "Community support", "Basic analytics"],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Pro",
    monthly: 49,
    yearly: 39,
    desc: "For growing teams shipping production AI.",
    features: ["50 active agents", "100,000 tasks/month", "Unlimited integrations", "Priority support", "Advanced analytics", "Custom models"],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    monthly: 199,
    yearly: 159,
    desc: "Unlimited scale with enterprise controls.",
    features: ["Unlimited agents", "Unlimited tasks", "SSO & SAML", "Dedicated support", "SLA guarantees", "Custom deployment"],
    cta: "Contact sales",
    highlight: false,
  },
];

function PricingSection() {
  const [yearly, setYearly] = React.useState(false);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <FadeUp className="text-center">
          <p className="mb-3 text-sm font-semibold text-orange-500">Pricing</p>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            Start free. Scale as your agents grow. No surprise bills.
          </p>

          {/* Monthly / Yearly toggle */}
          <div className="mt-8 inline-flex items-center gap-3">
            <span className={cn("text-sm transition-colors", !yearly ? "font-semibold text-gray-900" : "text-gray-400")}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setYearly((v) => !v)}
              aria-label="Toggle billing period"
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors duration-300",
                yearly ? "bg-orange-500" : "bg-gray-200",
              )}
            >
              <motion.span
                animate={{ x: yearly ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow"
              />
            </button>
            <span className={cn("text-sm transition-colors", yearly ? "font-semibold text-gray-900" : "text-gray-400")}>
              Yearly
            </span>
            <AnimatePresence>
              {yearly && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.75, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.75, x: -8 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600"
                >
                  Save 20%
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </FadeUp>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <FadeUp key={plan.name} delay={0.07 * i}>
              <motion.div
                whileHover={
                  !plan.highlight
                    ? { y: -6, boxShadow: "0 20px 56px rgba(0,0,0,0.09)", transition: { duration: 0.22 } }
                    : {}
                }
                className={cn(
                  "relative h-full overflow-hidden rounded-2xl border p-7",
                  plan.highlight
                    ? "border-orange-200 bg-gray-900 shadow-[0_24px_64px_rgba(0,0,0,0.2)]"
                    : "border-gray-200 bg-white",
                )}
              >
                {plan.highlight && (
                  <>
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3.5 }}
                      className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/5 to-transparent"
                    />
                    <span className="absolute right-5 top-5 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      Most popular
                    </span>
                  </>
                )}

                <p className={cn("text-sm font-semibold", plan.highlight ? "text-orange-400" : "text-orange-500")}>
                  {plan.name}
                </p>

                <div className="mt-3 flex items-end gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${plan.name}-${yearly ? "y" : "m"}`}
                      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                      transition={{ duration: 0.26, ease: EASE }}
                      className={cn(
                        "text-4xl font-bold tracking-tight",
                        plan.highlight ? "text-white" : "text-gray-900",
                      )}
                    >
                      {plan.monthly === 0 ? "Free" : `$${yearly ? plan.yearly : plan.monthly}`}
                    </motion.span>
                  </AnimatePresence>
                  {plan.monthly > 0 && <span className="mb-1 text-sm text-gray-400">/mo</span>}
                </div>

                <p className={cn("mt-1.5 text-sm leading-relaxed", plan.highlight ? "text-gray-400" : "text-gray-500")}>
                  {plan.desc}
                </p>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "mt-6 w-full rounded-xl py-2.5 text-sm font-semibold transition",
                    plan.highlight
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
                  )}
                >
                  {plan.cta}
                </motion.button>

                <div className={cn("my-5 h-px", plan.highlight ? "bg-white/10" : "bg-gray-100")} />

                <ul className="space-y-3">
                  {plan.features.map((f, fi) => (
                    <motion.li
                      key={f}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.06 * i + fi * 0.05, duration: 0.35, ease: EASE }}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <Check className={cn("size-4 shrink-0", plan.highlight ? "text-orange-400" : "text-orange-500")} />
                      <span className={plan.highlight ? "text-gray-300" : "text-gray-600"}>{f}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "How do I get started with Synapse?",
    a: "Sign up for a free account, connect your first integration, and deploy your first agent in under 5 minutes using our guided setup wizard. No credit card required.",
  },
  {
    q: "What AI models does Synapse support?",
    a: "Synapse supports OpenAI (GPT-4o, GPT-4), Anthropic (Claude 3.5, Claude 4), Meta (Llama 2, Llama 3), Mistral, and any OpenAI-compatible endpoint. You can route tasks to different models per workflow step.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All data is encrypted in transit and at rest using AES-256. We're SOC 2 Type II certified, GDPR compliant, and we never use your data or agent outputs to train AI models.",
  },
  {
    q: "Can I run agents on my own infrastructure?",
    a: "Enterprise plans support self-hosted and VPC deployments. Agents run in isolated containers within your environment — no data leaves your infrastructure.",
  },
  {
    q: "How does billing work for task usage?",
    a: "Tasks are counted per successful agent execution. Monthly plans don't roll over unused tasks. Yearly plans include a 20% buffer before overage charges apply, keeping costs predictable.",
  },
];

function FAQSection() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-3xl px-5">
        <FadeUp className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold text-orange-500">FAQ</p>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-gray-500">
            Everything you need to know before deploying your first agent.
          </p>
        </FadeUp>

        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <FadeUp key={i} delay={i * 0.05}>
                <motion.div
                  animate={isOpen
                    ? { borderColor: "rgb(254,215,170)" }
                    : { borderColor: "rgb(229,231,235)" }
                  }
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden rounded-2xl border bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className={cn("pr-4 text-[15px] font-semibold transition-colors duration-200", isOpen ? "text-gray-900" : "text-gray-700")}>
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{
                        rotate: isOpen ? 45 : 0,
                        backgroundColor: isOpen ? "rgb(249,115,22)" : "rgb(243,244,246)",
                      }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="grid size-7 shrink-0 place-items-center rounded-full"
                    >
                      <Plus className={cn("size-3.5 transition-colors duration-200", isOpen ? "text-white" : "text-gray-400")} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.32, ease: EASE },
                          opacity: { duration: 0.2 },
                        }}
                      >
                        <div className="border-t border-orange-100 px-6 pb-5 pt-4">
                          <p className="text-sm leading-relaxed text-gray-500">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── CONNECT STACK (pre-footer) ─────────────────────────────────────── */
const FLOAT_LOGOS = [
  { label: "OpenAI",   bg: "#111827", fg: "#fff",  char: "O",  top: "6%",  left: "50%",  dx: "-50%", fy: -12, fr: 3,  delay: 0,   sz: 56 },
  { label: "Meta",     bg: "#1877F2", fg: "#fff",  char: "∞",  top: "20%", left: "16%",  dx: "0",    fy: -10, fr: -2, delay: 0.8, sz: 48 },
  { label: "Notion",   bg: "#fff",    fg: "#111",  char: "N",  top: "14%", right: "17%", dx: "0",    fy: -8,  fr: 2,  delay: 0.4, sz: 48, border: true },
  { label: "Slack",    bg: "#4A154B", fg: "#fff",  char: "#",  bottom: "30%", left: "10%",  dx: "0", fy: -9,  fr: -3, delay: 1.2, sz: 44 },
  { label: "GitHub",   bg: "#24292E", fg: "#fff",  char: "G",  bottom: "28%", right: "10%", dx: "0", fy: -7,  fr: 2,  delay: 0.6, sz: 44 },
  { label: "Stripe",   bg: "#635BFF", fg: "#fff",  char: "S",  top: "46%", left: "5%",   dx: "0",    fy: -11, fr: -2, delay: 1.6, sz: 40 },
  { label: "Vercel",   bg: "#000",    fg: "#fff",  char: "▲",  top: "42%", right: "5%",  dx: "0",    fy: -8,  fr: 3,  delay: 0.2, sz: 40 },
  { label: "Linear",   bg: "#5E6AD2", fg: "#fff",  char: "L",  bottom: "12%", left: "36%", dx: "0", fy: -6,  fr: 2,  delay: 1.0, sz: 36 },
  { label: "Figma",    bg: "#F24E1E", fg: "#fff",  char: "F",  bottom: "10%", right: "33%", dx: "0", fy: -9,  fr: -2, delay: 1.4, sz: 36 },
];

function ConnectStackSection() {
  return (
    <section className="relative overflow-hidden bg-white py-40">
      {/* Soft radial glow */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(249,115,22,0.06),transparent)]"
      />

      {/* Floating brand logos */}
      {FLOAT_LOGOS.map((logo, i) => {
        const posStyle: React.CSSProperties = {
          position: "absolute",
          ...(logo.top    !== undefined && { top:    logo.top }),
          ...(logo.bottom !== undefined && { bottom: logo.bottom }),
          ...(logo.left   !== undefined && { left:   logo.left }),
          ...(logo.right  !== undefined && { right:  logo.right }),
          transform: logo.dx !== "0" ? `translateX(${logo.dx})` : undefined,
          zIndex: 0,
        };
        return (
          <motion.div
            key={logo.label}
            style={posStyle}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 260, damping: 18 }}
          >
            <motion.div
              animate={{ y: [0, logo.fy, 0], rotate: [0, logo.fr, 0] }}
              transition={{ duration: 4 + (i % 3) * 0.8, repeat: Infinity, ease: "easeInOut", delay: logo.delay }}
              whileHover={{ scale: 1.15, transition: { duration: 0.2 } }}
              style={{
                width: logo.sz,
                height: logo.sz,
                background: logo.bg,
                color: logo.fg,
                fontSize: logo.sz * 0.3,
                border: logo.border ? "1.5px solid #e5e7eb" : undefined,
              }}
              className="grid cursor-default place-items-center rounded-2xl font-bold shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
            >
              {logo.char}
            </motion.div>
          </motion.div>
        );
      })}

      {/* Centre content */}
      <div className="relative z-10 mx-auto max-w-2xl px-5 text-center">
        <FadeUp>
          <motion.h2
            className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-[3.5rem]"
          >
            Connect your Current Stack<br />
            and Start Automating
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.28, duration: 0.5, ease: EASE }}
            className="mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 10px 36px rgba(0,0,0,0.22)" }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white"
            >
              Start Building for Free
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="size-4" />
              </motion.span>
            </motion.button>
          </motion.div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <FadeUp>
          <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-16 text-center sm:px-16">
            {/* Shimmer sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/5 to-transparent -skew-x-12"
            />

            {/* Background gradient pulse */}
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-purple-500/10"
            />

            <div className="relative">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: EASE }}
                className="mb-3 text-sm font-semibold text-orange-400"
              >
                Get started today
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
                className="text-4xl font-bold text-white sm:text-5xl"
              >
                Ready to deploy your first agent?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.16, duration: 0.5, ease: EASE }}
                className="mx-auto mt-4 max-w-lg text-base text-gray-400"
              >
                Join 2,000+ engineering teams already building intelligent agents with Synapse.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.24, duration: 0.5, ease: EASE }}
                className="mt-8 flex flex-wrap justify-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.06, boxShadow: "0 8px 32px rgba(249,115,22,0.45)" }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white"
                >
                  Start for free
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="size-4" />
                  </motion.span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.06, backgroundColor: "rgba(255,255,255,0.12)" }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition"
                >
                  Book a demo
                </motion.button>
              </motion.div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    { heading: "Product", links: ["Features", "Integrations", "Pricing", "Changelog"] },
    { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
    { heading: "Resources", links: ["Docs", "API Reference", "Community", "Status"] },
    { heading: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
  ];

  return (
    <footer className="border-t border-gray-100 bg-white px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <motion.div whileHover={{ scale: 1.04 }} className="inline-flex items-center gap-2.5 cursor-default">
              <div className="grid size-7 place-items-center rounded-lg bg-orange-500">
                <Zap className="size-3.5 text-white" />
              </div>
              <span className="text-[15px] font-bold text-gray-900">Synapse</span>
            </motion.div>
            <p className="mt-3 text-sm text-gray-400">Build and deploy intelligent agents at any scale.</p>
          </div>
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">{col.heading}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 3, color: "#111827" }}
                      transition={{ duration: 0.15 }}
                      className="text-sm text-gray-500"
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="text-xs text-gray-400">© 2026 Synapse AI. All rights reserved.</p>
          <p className="text-xs text-gray-300">Built with Next.js · Tailwind · Framer Motion</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN EXPORT ────────────────────────────────────────────────────── */
export function SynapseAIPage() {
  React.useEffect(() => {
    let lenis: any = null;
    (async () => {
      const LenisClass = (await import("@studio-freight/lenis")).default;
      lenis = new LenisClass({ lerp: 0.1, smoothWheel: true });
      const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    })();
    return () => { if (lenis) lenis.destroy(); };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">
      <Navbar />
      <Hero />
      <LogoStrip />
      <HowItWorks />
      <FeaturesSection />
      <BenefitsSection />
      <Testimonials />
      <PricingSection />
      <FAQSection />
      <ConnectStackSection />
      <Footer />
    </div>
  );
}
