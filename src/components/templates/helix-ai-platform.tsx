"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Globe,
  Play,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  GitMerge,
  Eye,
  Lock,
  Filter,
  Activity,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── shared: FadeUp ──────────────────────────────────────────────── */
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
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        filter: "blur(6px)",
        y: from === "bottom" ? 28 : 0,
        x: from === "left" ? -32 : from === "right" ? 32 : 0,
      }}
      animate={inView ? { opacity: 1, y: 0, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── shared: TiltCard ────────────────────────────────────────────── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 180, damping: 20 });
  const sy = useSpring(my, { stiffness: 180, damping: 20 });
  const rotateX = useTransform(sy, [-80, 80], [3.5, -3.5]);
  const rotateY = useTransform(sx, [-80, 80], [-3.5, 3.5]);
  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left - r.width / 2);
        my.set(e.clientY - r.top - r.height / 2);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      whileHover={{ scale: 1.014, transition: { type: "spring", stiffness: 240, damping: 22 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── shared: AnimatedCounter ─────────────────────────────────────── */
function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    let start: number;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1400, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ══════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-gray-100 bg-white/96 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <motion.a href="#" className="flex items-center gap-2" whileHover={{ scale: 1.02 }}>
          <div className="flex size-6 items-center justify-center rounded bg-gray-950">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L11 4.5V7.5L6 11L1 7.5V4.5L6 1Z" fill="white" />
              <path d="M6 4L9 5.75V8.25L6 10L3 8.25V5.75L6 4Z" fill="black" />
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight text-gray-950">Helix</span>
        </motion.a>

        {/* Center nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {["Features", "Product", "FAQs", "Pricing"].map((item) => (
            <motion.a
              key={item}
              href="#"
              className="relative text-sm text-gray-500 transition-colors hover:text-gray-900"
            >
              {item}
              <motion.span
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gray-950"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.18, ease: EASE }}
              />
            </motion.a>
          ))}
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-4">
          <a href="#" className="hidden text-sm text-gray-500 transition hover:text-gray-900 md:block">
            Login
          </a>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 4px 18px rgba(0,0,0,0.18)" }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full bg-gray-950 px-4 py-2 text-[13px] font-semibold text-white"
          >
            Start free trial
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PRODUCT MOCKUP — Linear-style task tracker at perspective angle
══════════════════════════════════════════════════════════════════ */
const TASKS = [
  { title: "Sync and enrich lead records from HubSpot",   agent: "Agent-01", status: "done",    priority: "High" },
  { title: "Generate Q4 performance report draft",        agent: "Agent-02", status: "done",    priority: "Med" },
  { title: "Run outreach personalisation pipeline",       agent: "Agent-03", status: "running", priority: "High" },
  { title: "Review and approve campaign copy",            agent: "Human",    status: "pending", priority: "High" },
  { title: "Publish approved assets to channels",         agent: "Agent-01", status: "queued",  priority: "Med" },
  { title: "Reconcile invoice data across systems",       agent: "Agent-04", status: "queued",  priority: "Low" },
];

const STATUS_STYLES = {
  done:    "bg-emerald-50 text-emerald-600 border-emerald-100",
  running: "bg-sky-50    text-sky-600    border-sky-100",
  pending: "bg-amber-50  text-amber-600  border-amber-100",
  queued:  "bg-gray-50   text-gray-400   border-gray-100",
};

const STATUS_DOT = {
  done:    "bg-emerald-500",
  running: "bg-sky-500",
  pending: "bg-amber-400",
  queued:  "bg-gray-300",
};

function ProductMockup() {
  const { scrollY } = useScroll();
  const rotateX = useTransform(scrollY, [0, 500], [16, 3]);

  const projects = [
    { name: "Marketing Ops",   active: true },
    { name: "Revenue Ops",     active: false },
    { name: "Support Ops",     active: false },
    { name: "Finance Ops",     active: false },
    { name: "HR Automation",   active: false },
  ];

  return (
    <div className="overflow-visible" style={{ perspective: "1600px" }}>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 1.0, ease: EASE }}
      >
        <motion.div
          animate={{ y: [0, -9, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{ rotateX }}
          className="origin-top overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_48px_120px_rgba(0,0,0,0.13),0_0_0_1px_rgba(0,0,0,0.03)]"
        >
          {/* Chrome */}
          <div className="flex h-10 items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4">
            <div className="flex gap-1.5">
              {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c) => (
                <motion.span
                  key={c}
                  whileHover={{ scale: 1.35 }}
                  className={cn("size-2.5 cursor-pointer rounded-full", c)}
                />
              ))}
            </div>
            <div className="mx-auto flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-0.5 text-[11px] text-gray-400">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              app.helix.ai/workspace/marketing-ops
            </div>
            <div className="ml-auto flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-gray-500">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="size-1.5 rounded-full bg-emerald-400"
              />
              3 agents running
            </div>
          </div>

          <div className="flex" style={{ height: 390 }}>
            {/* Sidebar */}
            <div className="w-52 shrink-0 border-r border-gray-100 bg-gray-950 flex flex-col py-4">
              <div className="mb-5 flex items-center gap-2 px-4">
                <div className="flex size-6 items-center justify-center rounded bg-white/10">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1L11 4.5V7.5L6 11L1 7.5V4.5L6 1Z" fill="white" />
                    <path d="M6 4L9 5.75V8.25L6 10L3 8.25V5.75L6 4Z" fill="black" />
                  </svg>
                </div>
                <span className="text-[12px] font-bold text-white">Helix</span>
                <ChevronRight className="ml-auto size-3 text-gray-600" />
              </div>

              <div className="mb-1 px-4 text-[9px] font-semibold uppercase tracking-wider text-gray-600">
                Workspaces
              </div>
              <div className="space-y-0.5 px-2">
                {projects.map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.06, ease: EASE }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer",
                      p.active ? "bg-white/10" : "",
                    )}
                  >
                    <span className={cn("size-1.5 shrink-0 rounded-full", p.active ? "bg-emerald-400" : "bg-gray-700")} />
                    <span className={cn("text-[11px] font-medium", p.active ? "text-white" : "text-gray-500")}>
                      {p.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto border-t border-white/5 px-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full bg-gray-700 grid place-items-center text-[9px] font-bold text-white">
                    MO
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-white">Marcus Owen</p>
                    <p className="text-[9px] text-gray-500">Admin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main task table */}
            <div className="flex-1 overflow-hidden bg-white">
              {/* Toolbar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85, ease: EASE }}
                className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-2.5"
              >
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="font-medium text-gray-700">Marketing Ops</span>
                  <ChevronRight className="size-3" />
                  <span>Active Tasks</span>
                  <span className="ml-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500">
                    {TASKS.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-[10px] text-gray-500">
                    <Filter className="size-2.5" /> Filter
                  </button>
                  <button className="rounded-md bg-gray-950 px-3 py-1 text-[10px] font-semibold text-white">
                    + Add task
                  </button>
                </div>
              </motion.div>

              {/* Column headers */}
              <div className="grid grid-cols-[1fr_100px_100px_72px] border-b border-gray-50 bg-gray-50/50 px-5 py-2 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                <span>Task</span>
                <span>Agent</span>
                <span>Status</span>
                <span>Priority</span>
              </div>

              {/* Task rows */}
              {TASKS.map((task, i) => (
                <motion.div
                  key={task.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.07, ease: EASE }}
                  whileHover={{ backgroundColor: "rgb(249,250,251)", transition: { duration: 0.12 } }}
                  className="grid cursor-default grid-cols-[1fr_100px_100px_72px] items-center border-b border-gray-50 px-5 py-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-4">
                    <span className={cn("size-2 shrink-0 rounded-full", STATUS_DOT[task.status as keyof typeof STATUS_DOT])} />
                    <span className={cn("truncate text-[11px] font-medium", task.status === "queued" ? "text-gray-300" : "text-gray-700")}>
                      {task.title}
                    </span>
                    {task.status === "running" && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                        className="shrink-0"
                      >
                        <RefreshCw className="size-2.5 text-sky-500" />
                      </motion.div>
                    )}
                  </div>
                  <span className={cn(
                    "text-[9px] font-medium",
                    task.agent === "Human" ? "text-amber-600" : "text-gray-400",
                  )}>
                    {task.agent}
                  </span>
                  <span className={cn(
                    "w-fit rounded-full border px-1.5 py-0.5 text-[9px] font-medium capitalize",
                    STATUS_STYLES[task.status as keyof typeof STATUS_STYLES],
                  )}>
                    {task.status}
                  </span>
                  <span className={cn(
                    "text-[9px] font-semibold",
                    task.priority === "High" ? "text-gray-700" : task.priority === "Med" ? "text-gray-400" : "text-gray-300",
                  )}>
                    {task.priority}
                  </span>
                </motion.div>
              ))}

              {/* Bottom summary row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, ease: EASE }}
                className="flex items-center gap-4 px-5 py-3 text-[10px] text-gray-400"
              >
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400" /> 2 completed
                </span>
                <span className="flex items-center gap-1">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="size-1.5 rounded-full bg-sky-500"
                  />
                  1 running
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-400" /> 1 awaiting review
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-gray-300" /> 2 queued
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════════ */
const H1_WORDS = [
  { text: "AI agents that act.", newline: false },
  { text: "Humans who decide.", newline: true },
];

function Hero() {
  let wi = 0;
  return (
    <section className="relative min-h-screen overflow-hidden bg-white pt-24 pb-0">
      {/* Faint dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-14">
        {/* Headline */}
        <h1 className="max-w-4xl text-[4.5rem] font-black leading-[1.0] tracking-tight text-gray-950 sm:text-[5.5rem] lg:text-[6.5rem]">
          {H1_WORDS.map((line) => (
            <React.Fragment key={line.text}>
              {line.newline && <br />}
              {line.text.split(" ").map((word) => {
                const delay = 0.06 + wi++ * 0.065;
                return (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 48, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay, duration: 0.65, ease: EASE }}
                    className="inline-block mr-[0.22em]"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </React.Fragment>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, duration: 0.6, ease: EASE }}
          className="mt-8 max-w-lg text-lg leading-relaxed text-gray-500"
        >
          Deploy AI agents that plan, act through your tools, and report
          outcomes — without changing how your teams work.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.86, duration: 0.55, ease: EASE }}
          className="mt-9 flex flex-wrap items-center gap-5"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(0,0,0,0.20)" }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white"
          >
            Start your free trial
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="size-4" />
            </motion.span>
          </motion.button>
          <motion.button
            className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
            whileHover={{ x: 3 }}
          >
            View role-based demos
            <motion.div
              className="grid size-7 place-items-center rounded-full border border-gray-200 bg-white shadow-sm"
              whileHover={{ scale: 1.12 }}
            >
              <Play className="size-3 fill-gray-700 text-gray-700" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Social proof row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center gap-5 text-xs text-gray-400"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {["#111827", "#374151", "#4B5563", "#6B7280", "#1F2937"].map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.05 + i * 0.06, type: "spring", stiffness: 360, damping: 16 }}
                  className="size-6 rounded-full border-2 border-white"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="font-medium text-gray-600">500+ enterprise teams</span>
          </div>
          <span className="text-gray-200">·</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1 + i * 0.05, type: "spring", stiffness: 320, damping: 14 }}
              >
                <Star className="size-3 fill-amber-400 text-amber-400" />
              </motion.span>
            ))}
            <span className="ml-1 font-medium text-gray-600">4.9 on G2</span>
          </div>
          <span className="text-gray-200">·</span>
          <span>SOC 2 Type II</span>
        </motion.div>
      </div>

      {/* Product mockup floats below */}
      <div className="relative mx-auto mt-20 max-w-6xl px-6">
        <ProductMockup />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent to-white" />
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TRUST STRIP
══════════════════════════════════════════════════════════════════ */
const TRUST_LOGOS = [
  "OpenAI", "Salesforce", "Oracle", "Atlassian", "HubSpot",
  "Notion", "Stripe", "GitHub", "Linear", "Figma", "Intercom", "Workday",
];

function TrustStrip() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="border-y border-gray-100 bg-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-8 text-center text-sm text-gray-400"
        >
          Trusted by modern operators across industries.{" "}
          <span className="text-gray-300">From pilot to scale without chaos.</span>
        </motion.p>

        <div className="overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            className="flex shrink-0 gap-14"
          >
            {[...TRUST_LOGOS, ...TRUST_LOGOS].map((logo, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.05 * (i % TRUST_LOGOS.length), duration: 0.5 }}
                whileHover={{ color: "#111827", scale: 1.08, transition: { duration: 0.12 } }}
                className="cursor-default select-none whitespace-nowrap text-sm font-semibold text-gray-200"
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

/* ══════════════════════════════════════════════════════════════════
   FEATURE HIGHLIGHT — big headline, split layout
══════════════════════════════════════════════════════════════════ */
/* Visual: connected agent network diagram */
function AgentNetworkVisual() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const nodes = [
    { id: "Hub",   x: "50%", y: "50%", size: 44, color: "bg-gray-950",   textColor: "text-white" },
    { id: "CRM",   x: "20%", y: "22%", size: 36, color: "bg-gray-100",   textColor: "text-gray-600" },
    { id: "Slack", x: "80%", y: "20%", size: 36, color: "bg-gray-100",   textColor: "text-gray-600" },
    { id: "DB",    x: "14%", y: "68%", size: 36, color: "bg-gray-100",   textColor: "text-gray-600" },
    { id: "API",   x: "86%", y: "66%", size: 36, color: "bg-gray-100",   textColor: "text-gray-600" },
    { id: "Docs",  x: "50%", y: "88%", size: 32, color: "bg-gray-50",    textColor: "text-gray-500" },
  ];

  const edges = [
    { from: { x: "50%", y: "50%" }, to: { x: "20%", y: "22%" } },
    { from: { x: "50%", y: "50%" }, to: { x: "80%", y: "20%" } },
    { from: { x: "50%", y: "50%" }, to: { x: "14%", y: "68%" } },
    { from: { x: "50%", y: "50%" }, to: { x: "86%", y: "66%" } },
    { from: { x: "50%", y: "50%" }, to: { x: "50%", y: "88%" } },
  ];

  return (
    <div ref={ref} className="relative h-72 w-full select-none">
      {/* SVG edges */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 300">
        {edges.map((e, i) => {
          const x1 = parseFloat(e.from.x) * 3;
          const y1 = parseFloat(e.from.y) * 3;
          const x2 = parseFloat(e.to.x) * 3;
          const y2 = parseFloat(e.to.y) * 3;
          return (
            <g key={i}>
              <motion.line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="4 3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: EASE }}
              />
              {inView && (
                <motion.circle
                  r="3.5" fill="#111827"
                  initial={{ cx: x1, cy: y1, opacity: 0 }}
                  animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 0.8, 0] }}
                  transition={{
                    delay: 0.9 + i * 0.35,
                    duration: 1.1,
                    repeat: Infinity,
                    repeatDelay: 2.5 + i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((n, i) => (
        <motion.div
          key={n.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 280, damping: 16 }}
          whileHover={{ scale: 1.1, transition: { duration: 0.16 } }}
          className="absolute cursor-default"
          style={{ left: n.x, top: n.y, transform: "translate(-50%,-50%)" }}
        >
          <div
            className={cn("grid place-items-center rounded-2xl border border-gray-200 shadow-sm font-bold", n.color, n.textColor)}
            style={{ width: n.size, height: n.size, fontSize: n.size * 0.22 }}
          >
            {n.id}
          </div>
          {n.id === "Hub" && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl bg-gray-950/20"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* Visual: dashboard metrics snapshot */
function DashboardVisual() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const metrics = [
    { label: "Tasks completed", value: "45,678", delta: "+12%" },
    { label: "Active agents",   value: "1,234",  delta: "+34%" },
    { label: "Avg run cost",    value: "$0.07",   delta: "-18%" },
  ];

  const bars = [68, 82, 55, 91, 74, 88, 63, 95];

  return (
    <div ref={ref} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 + i * 0.1, ease: EASE }}
            className="rounded-xl border border-gray-50 bg-gray-50/50 p-3"
          >
            <p className="text-[9px] text-gray-400">{m.label}</p>
            <p className="mt-0.5 text-base font-black text-gray-900">{m.value}</p>
            <p className={cn("mt-0.5 text-[9px] font-semibold", m.delta.startsWith("+") ? "text-emerald-500" : "text-rose-400")}>
              {m.delta} vs last week
            </p>
          </motion.div>
        ))}
      </div>

      {/* Mini bar chart */}
      <div>
        <p className="mb-2 text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Task throughput — last 8 sessions</p>
        <div className="flex items-end gap-1" style={{ height: 56 }}>
          {bars.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={inView ? { height: `${h}%` } : {}}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.55, ease: EASE }}
              className="flex-1 rounded-sm bg-gray-200"
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[8px] text-gray-300">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Now"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureHighlights() {
  const sections = [
    {
      tag: "Orchestration",
      headline: "Built for fast-moving\nteams that need control.",
      body: "Helix agents work inside your existing tools, with built-in approvals, brand guardrails, and full traceability. Every action is auditable, every outcome accountable.",
      bullets: ["Multi-agent task routing", "Conditional logic & interrupts", "Memory across runs"],
      visual: <AgentNetworkVisual />,
      flip: false,
    },
    {
      tag: "Observability",
      headline: "Governed AI.\nTrusted outcomes.",
      body: "Deploy AI agents with built-in approvals, brand guardrails, and audit trails. Every step is visible, reviewable, and compliant — from trigger to delivery.",
      bullets: ["Immutable audit trail per run", "Role-based access controls", "SOC 2 & HIPAA ready"],
      visual: <DashboardVisual />,
      flip: true,
    },
  ];

  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-6 space-y-28">
        {sections.map((sec) => (
          <div key={sec.tag} className={cn("grid items-center gap-14 lg:grid-cols-2", sec.flip && "lg:[&>*:first-child]:order-2")}>
            {/* Text */}
            <FadeUp from={sec.flip ? "right" : "left"}>
              <motion.span
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mb-4 inline-block rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500"
              >
                {sec.tag}
              </motion.span>
              <h2 className="text-4xl font-black leading-tight tracking-tight text-gray-950 sm:text-5xl whitespace-pre-line">
                {sec.headline.split("\n").map((line, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-gray-500">{sec.body}</p>
              <ul className="mt-6 space-y-2.5">
                {sec.bullets.map((b, i) => (
                  <motion.li
                    key={b}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 + i * 0.07, duration: 0.38, ease: EASE }}
                    className="flex items-center gap-2.5 text-sm text-gray-700"
                  >
                    <div className="grid size-5 shrink-0 place-items-center rounded-full bg-gray-100">
                      <Check className="size-3 text-gray-700" />
                    </div>
                    {b}
                  </motion.li>
                ))}
              </ul>
            </FadeUp>

            {/* Visual */}
            <FadeUp from={sec.flip ? "left" : "right"} delay={0.08}>
              <TiltCard className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60 p-6 shadow-sm">
                {sec.visual}
              </TiltCard>
            </FadeUp>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FEATURE BENTO — 2×2 grid with mini-UI cards
══════════════════════════════════════════════════════════════════ */
/* Card 1: Audit Trail — recent activity feed */
function AuditTrailCard() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const items = [
    { text: "Personalised Email sent → 4 recipients",   tag: "Delivered", color: "bg-emerald-50 text-emerald-600" },
    { text: "Peer Review completed — 3 outputs",        tag: "✓ Verified",  color: "bg-gray-100   text-gray-600" },
    { text: "Content Drafting — running",               tag: "In progress", color: "bg-sky-50     text-sky-600" },
    { text: "Admin Approval requested",                  tag: "Pending",    color: "bg-amber-50   text-amber-600" },
  ];
  return (
    <div ref={ref} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Recent Activity</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.08 + i * 0.09, ease: EASE }}
            className="flex items-center justify-between gap-2 rounded-lg border border-gray-50 bg-gray-50/60 px-3 py-2"
          >
            <span className="text-[10px] text-gray-600 leading-snug truncate">{item.text}</span>
            <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold", item.color)}>
              {item.tag}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* Card 2: Role-Based Access — avatars with role tags */
function RoleAccessCard() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const users = [
    { initials: "MO", name: "Marcus Owen",    role: "Admin",    color: "#1F2937" },
    { initials: "SP", name: "Sara Patel",     role: "Reviewer", color: "#374151" },
    { initials: "JK", name: "James Kim",      role: "Viewer",   color: "#4B5563" },
    { initials: "AL", name: "Aisha Lopez",    role: "Agent Dev",color: "#6B7280" },
  ];
  return (
    <div ref={ref} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Team Access</p>
      <div className="space-y-2">
        {users.map((u, i) => (
          <motion.div
            key={u.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.06 + i * 0.08, type: "spring", stiffness: 260, damping: 18 }}
            className="flex items-center gap-2.5 rounded-lg p-1.5"
          >
            <div className="grid size-7 shrink-0 place-items-center rounded-full text-[9px] font-black text-white" style={{ background: u.color }}>
              {u.initials}
            </div>
            <span className="flex-1 text-[10px] font-medium text-gray-700">{u.name}</span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[8px] font-medium text-gray-500">
              {u.role}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* Card 3: Approval Queue */
function ApprovalQueueCard() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const [approved, setApproved] = React.useState<null | boolean>(null);

  const items = [
    { text: "Weekly Campaign Report", badge: "Review" },
    { text: "SEO Audit Recommendations", badge: "Review" },
    { text: "Price Monitoring Alert", badge: "Needs action" },
  ];

  return (
    <div ref={ref} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Approval Queue</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.08 + i * 0.09, ease: EASE }}
            className="flex items-center justify-between rounded-lg border border-gray-50 bg-gray-50/60 px-3 py-2"
          >
            <span className="text-[10px] text-gray-600">{item.text}</span>
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[8px] font-semibold",
              item.badge === "Needs action" ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500",
            )}>
              {item.badge}
            </span>
          </motion.div>
        ))}
        <AnimatePresence mode="wait">
          {approved === null ? (
            <motion.div
              key="btns"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex gap-1.5 pt-1"
            >
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setApproved(true)}
                className="flex-1 rounded-lg bg-gray-950 py-1.5 text-[10px] font-semibold text-white"
              >
                Approve all
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => { setApproved(false); setTimeout(() => setApproved(null), 2200); }}
                className="flex-1 rounded-lg border border-gray-200 py-1.5 text-[10px] font-medium text-gray-600"
              >
                Request edits
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className={cn("mt-1 rounded-lg px-3 py-2 text-[10px] font-semibold", approved ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500")}
            >
              {approved ? "✓ All approved — agents resuming" : "Feedback sent to agents"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Card 4: Guardrail Engine — policy tag pills */
function GuardrailCard() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const tags = [
    { label: "Brand & Style",      active: true },
    { label: "Compliance & Policy", active: true },
    { label: "Content Safety",      active: true },
    { label: "Approval Triggers",   active: false },
    { label: "Tone Guardrails",     active: true },
    { label: "Output Validation",   active: false },
  ];
  return (
    <div ref={ref} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Guardrails</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, i) => (
          <motion.span
            key={tag.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.06 + i * 0.07, type: "spring", stiffness: 300, damping: 18 }}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[9px] font-semibold",
              tag.active
                ? "border-gray-900 bg-gray-950 text-white"
                : "border-gray-200 bg-gray-50 text-gray-400",
            )}
          >
            {tag.label}
          </motion.span>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-[10px] leading-relaxed text-gray-500">
        All outputs screened before delivery.{" "}
        <span className="font-semibold text-gray-700">3 guardrails active</span> — 0 violations today.
      </div>
    </div>
  );
}

function FeatureBento() {
  const bentoItems = [
    {
      icon: Activity,
      title: "Audit Trail",
      desc: "Tracks every agent action with full input-output visibility and timestamps.",
      card: <AuditTrailCard />,
    },
    {
      icon: Users,
      title: "Role-Based Access",
      desc: "Controls who can launch, review, or manage agents based on roles.",
      card: <RoleAccessCard />,
    },
    {
      icon: Bell,
      title: "Approval Queue",
      desc: "Sends agent-generated content to human reviewers before it's published.",
      card: <ApprovalQueueCard />,
    },
    {
      icon: Shield,
      title: "Guardrail Engine",
      desc: "Applies brand tone and policy checks before output goes live.",
      card: <GuardrailCard />,
    },
  ];

  return (
    <section className="bg-gray-50/60 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp className="mb-14">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Platform
          </p>
          <h2 className="max-w-xl text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            Everything your team needs. Nothing it doesn&apos;t.
          </h2>
        </FadeUp>

        <div className="grid gap-5 sm:grid-cols-2">
          {bentoItems.map(({ icon: Icon, title, desc, card }, i) => (
            <FadeUp key={title} delay={i * 0.08}>
              <TiltCard className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: -4 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  className="mb-4 grid size-10 place-items-center rounded-xl border border-gray-100 bg-gray-50"
                >
                  <Icon className="size-5 text-gray-700" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-950">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{desc}</p>
                <div className="mt-5">{card}</div>
              </TiltCard>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PRICING — left text + right stacked cards (matching GIF)
══════════════════════════════════════════════════════════════════ */
const PLANS = [
  {
    price: 0,
    label: "Starter",
    desc: "Perfect for individuals or small teams exploring automation.",
    cta: "Start your free trial",
    features: ["1 AI agent included", "Standard integrations", "Basic approval flows", "7-day activity logs"],
    highlight: false,
  },
  {
    price: 60,
    label: "Growth",
    desc: "Ideal for growing teams running live automation workflows.",
    cta: "Start free trial",
    features: ["Up to 5 AI agents", "Multi-agent orchestration", "Advanced approval flows", "Full activity logs", "ROI insights"],
    highlight: false,
  },
  {
    price: 200,
    label: "Enterprise",
    desc: "For organisations that need compliance, scale, and dedicated support.",
    cta: "Talk to sales",
    features: ["Unlimited agents", "SSO + SAML", "Custom guardrails", "SOC 2 / HIPAA", "Dedicated CSM"],
    highlight: false,
  },
];

function PricingSection() {
  const [yearly, setYearly] = React.useState(false);

  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr]">
          {/* Left: Headline + feature highlights */}
          <FadeUp from="left" className="flex flex-col justify-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Pricing</p>
            <h2 className="text-4xl font-black leading-tight tracking-tight text-gray-950 sm:text-5xl">
              Affordable pricing.<br />Easy scaling.
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-gray-500">
              Start small to explore automation, add agents as you scale, and
              unlock enterprise-grade guardrails, orchestration, and reporting
              when you&apos;re ready.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                { icon: Shield, text: "Built-in guardrails on every output" },
                { icon: GitMerge, text: "Agent orchestration across tools" },
                { icon: Users, text: "Human-in-the-loop approvals" },
                { icon: Eye, text: "Full audit trail per workflow run" },
              ].map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 + i * 0.08, duration: 0.4, ease: EASE }}
                  className="flex items-center gap-3 text-sm text-gray-700"
                >
                  <div className="grid size-6 shrink-0 place-items-center rounded-full bg-gray-100">
                    <Icon className="size-3.5 text-gray-600" />
                  </div>
                  {text}
                </motion.li>
              ))}
            </ul>

            {/* Toggle */}
            <div className="mt-8 flex items-center gap-3">
              <span className={cn("text-sm transition-colors", !yearly ? "font-bold text-gray-900" : "text-gray-400")}>Monthly</span>
              <button
                type="button"
                onClick={() => setYearly((v) => !v)}
                className={cn("relative h-6 w-11 rounded-full transition-colors", yearly ? "bg-gray-950" : "bg-gray-200")}
              >
                <motion.span
                  animate={{ x: yearly ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow"
                />
              </button>
              <span className={cn("text-sm transition-colors", yearly ? "font-bold text-gray-900" : "text-gray-400")}>Yearly</span>
              <AnimatePresence>
                {yearly && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8, x: -8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -8 }}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600"
                  >
                    Save 20%
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </FadeUp>

          {/* Right: Stacked pricing cards */}
          <div className="space-y-4">
            {PLANS.map((plan, i) => (
              <FadeUp key={plan.label} delay={0.1 + i * 0.1}>
                <motion.div
                  whileHover={{ y: -3, boxShadow: "0 16px 40px rgba(0,0,0,0.07)", transition: { duration: 0.2 } }}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-500">{plan.label}</p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={`${plan.label}-${yearly}`}
                            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                            transition={{ duration: 0.22, ease: EASE }}
                            className="text-3xl font-black text-gray-950"
                          >
                            {plan.price === 0 ? "Free" : `$${yearly ? Math.round(plan.price * 0.8) : plan.price}`}
                          </motion.span>
                        </AnimatePresence>
                        {plan.price > 0 && <span className="text-sm text-gray-400">/mo</span>}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">{plan.desc}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
                      whileTap={{ scale: 0.96 }}
                      className="shrink-0 rounded-full bg-gray-950 px-4 py-2 text-[12px] font-semibold text-white"
                    >
                      {plan.cta}
                    </motion.button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                    {plan.features.map((f, fi) => (
                      <motion.span
                        key={f}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.06 * i + fi * 0.04 }}
                        className="flex items-center gap-1.5 text-[11px] text-gray-500"
                      >
                        <Check className="size-3 shrink-0 text-gray-400" />
                        {f}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </FadeUp>
            ))}
            <FadeUp delay={0.4}>
              <p className="text-center text-xs text-gray-400">
                All plans include a 14-day free trial · No credit card required
              </p>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FAQ — huge title, dark-circle toggle (matches GIF exactly)
══════════════════════════════════════════════════════════════════ */
const FAQS = [
  { q: "What is Helix AI?", a: "Helix is an enterprise AI workflow platform that lets you deploy autonomous agents across your business operations. Agents execute multi-step tasks, integrate with your tools, and escalate to humans exactly when required." },
  { q: "Who is Helix built for?", a: "Helix is designed for operations, marketing, finance, and revenue teams at fast-growing companies who want to automate repetitive workflows without sacrificing control or compliance." },
  { q: "How does Helix AI work?", a: "You connect your tools, define tasks in plain language, and Helix builds an execution plan. Agents run autonomously, log every step, and pause for human review whenever you configure an approval gate." },
  { q: "Is there a free trial available?", a: "Yes — all plans include a 14-day free trial with full access to the Growth plan features. No credit card required. You can upgrade or downgrade at any time." },
  { q: "What kind of support do you provide?", a: "Starter plans include community support and documentation. Growth plans include priority email support with a 4-hour SLA. Enterprise plans include a dedicated Customer Success Manager and 24/7 phone support." },
];

function FAQSection() {
  const [open, setOpen] = React.useState<number | null>(null);

  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-4xl px-6">
        <FadeUp className="mb-14">
          <h2 className="text-4xl font-black tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
            Frequently Asked<br />Questions
          </h2>
        </FadeUp>

        <div className="space-y-1">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <FadeUp key={i} delay={i * 0.05}>
                <div className={cn("overflow-hidden border-b border-gray-100 transition-colors", isOpen && "border-gray-100")}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between py-5 text-left"
                  >
                    <span className={cn("pr-6 text-base font-semibold transition-colors", isOpen ? "text-gray-950" : "text-gray-700")}>
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{
                        backgroundColor: isOpen ? "rgb(17,24,39)" : "rgb(243,244,246)",
                        rotate: isOpen ? 45 : 0,
                      }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="grid size-8 shrink-0 place-items-center rounded-full"
                    >
                      <Plus className={cn("size-4 transition-colors", isOpen ? "text-white" : "text-gray-400")} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { duration: 0.3, ease: EASE }, opacity: { duration: 0.18 } }}
                      >
                        <div className="pb-6">
                          <p className="text-base leading-relaxed text-gray-500">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FOOTER — matches GIF layout exactly
══════════════════════════════════════════════════════════════════ */
function Footer() {
  const [email, setEmail] = React.useState("");

  const cols = [
    {
      heading: "Product",
      links: ["Agent Studio", "AI Workflows", "Agent Builder", "Analytics Dashboard", "API Integration", "Enterprise Solutions"],
    },
    {
      heading: "Company",
      links: ["About", "Careers", "Press", "Blog"],
    },
  ];

  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand col */}
          <div>
            <motion.div whileHover={{ scale: 1.03 }} className="mb-3 inline-flex cursor-default items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-gray-950">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L11 4.5V7.5L6 11L1 7.5V4.5L6 1Z" fill="white" />
                  <path d="M6 4L9 5.75V8.25L6 10L3 8.25V5.75L6 4Z" fill="black" />
                </svg>
              </div>
              <span className="text-[15px] font-black text-gray-950">Helix</span>
            </motion.div>
            <p className="mb-5 text-sm leading-relaxed text-gray-400">
              Safe, observable,<br />outcome-driven AI.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full bg-gray-950 px-4 py-2 text-[12px] font-bold text-white"
            >
              Start a 30-day trial
            </motion.button>
          </div>

          {/* Link cols */}
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 3, color: "#111827" }}
                      transition={{ duration: 0.14 }}
                      className="text-sm text-gray-500"
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Newsletter</p>
            <p className="mb-4 text-sm leading-relaxed text-gray-400">
              Get the latest product news and behind-the-scenes updates.
            </p>
            <div className="flex overflow-hidden rounded-full border border-gray-200 bg-gray-50 focus-within:border-gray-400 transition-colors">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                className="mr-1 my-1 grid size-7 place-items-center rounded-full bg-gray-950"
              >
                <ArrowRight className="size-3.5 text-white" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="text-xs text-gray-400">© 2026 Helix AI, Inc. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <motion.a href="#" whileHover={{ color: "#111827" }} className="transition">Privacy Policy</motion.a>
            <motion.a href="#" whileHover={{ color: "#111827" }} className="transition">Terms of Service</motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════════════════ */
export function HelixAIPlatformPage() {
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
      <TrustStrip />
      <FeatureHighlights />
      <FeatureBento />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
