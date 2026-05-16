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
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  Clock,
  GitBranch,
  Globe,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── FadeUp ─────────────────────────────────────────────────────────── */
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
  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        filter: "blur(8px)",
        y: from === "bottom" ? 30 : 0,
        x: from === "left" ? -36 : from === "right" ? 36 : 0,
      }}
      animate={inView ? { opacity: 1, y: 0, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── TiltCard ───────────────────────────────────────────────────────── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 22 });
  const sy = useSpring(my, { stiffness: 200, damping: 22 });
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
      whileHover={{ scale: 1.016, transition: { type: "spring", stiffness: 260, damping: 24 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── AnimatedCounter ─────────────────────────────────────────────────── */
function AnimatedCounter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    let start: number;
    const dur = 1400;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(e * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <motion.a href="#" className="flex items-center gap-2.5" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <motion.div
            className="flex size-7 items-center justify-center rounded-lg bg-gray-950"
            whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.35 } }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="3" cy="3" r="2" fill="white" />
              <circle cx="11" cy="3" r="2" fill="white" fillOpacity="0.45" />
              <circle cx="3" cy="11" r="2" fill="white" fillOpacity="0.45" />
              <circle cx="11" cy="11" r="2" fill="white" />
            </svg>
          </motion.div>
          <span className="text-[15px] font-bold tracking-tight text-gray-900">Orion</span>
        </motion.a>

        {/* Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {["Features", "Platform", "Pricing", "Docs"].map((item) => (
            <motion.a
              key={item}
              href="#"
              className="relative text-sm text-gray-500 transition hover:text-gray-900"
            >
              {item}
              <motion.span
                className="absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gray-900"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.2, ease: EASE }}
              />
            </motion.a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a href="#" className="hidden text-sm text-gray-500 transition hover:text-gray-900 md:block">Log in</a>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 20px rgba(0,0,0,0.22)" }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full bg-gray-950 px-4 py-2 text-[13px] font-semibold text-white"
          >
            Get early access
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────────────────── */
const HERO_LINE1 = ["Agents", "that", "execute."];
const HERO_LINE2 = ["Teams", "that", "govern."];

function KanbanMockup() {
  const { scrollY } = useScroll();
  const rotateX = useTransform(scrollY, [0, 400], [14, 4]);

  const cols = [
    {
      label: "Queued",
      count: 4,
      color: "bg-gray-100 text-gray-500",
      dot: "bg-gray-400",
      cards: [
        { title: "Sync CRM contacts", agent: "Agent-012", pct: 0, avatars: ["#374151", "#6B7280"] },
        { title: "Generate Q3 report", agent: "Agent-019", pct: 0, avatars: ["#10B981"] },
      ],
    },
    {
      label: "Running",
      count: 3,
      color: "bg-sky-50 text-sky-600",
      dot: "bg-sky-500",
      cards: [
        { title: "Deploy staging build", agent: "Agent-007", pct: 64, avatars: ["#F97316", "#374151"] },
        { title: "Scan security logs", agent: "Agent-031", pct: 38, avatars: ["#10B981", "#374151"] },
      ],
    },
    {
      label: "Approval",
      count: 2,
      color: "bg-amber-50 text-amber-600",
      dot: "bg-amber-400",
      cards: [
        { title: "Merge PR #2841", agent: "Agent-003", pct: 100, avatars: ["#6B7280"] },
        { title: "Publish blog post", agent: "Agent-014", pct: 100, avatars: ["#F97316", "#10B981"] },
      ],
    },
    {
      label: "Completed",
      count: 8,
      color: "bg-emerald-50 text-emerald-600",
      dot: "bg-emerald-500",
      cards: [
        { title: "Invoice reconciliation", agent: "Agent-005", pct: 100, avatars: ["#374151", "#6B7280", "#F97316"] },
        { title: "Email campaign sent", agent: "Agent-022", pct: 100, avatars: ["#10B981"] },
      ],
    },
  ];

  return (
    <div className="overflow-hidden" style={{ perspective: "1300px" }}>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ rotateX }}
        className="origin-top overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_32px_96px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]"
      >
        {/* Browser chrome */}
        <div className="flex h-10 items-center gap-2 border-b border-gray-100 bg-gray-50 px-4">
          <div className="flex gap-1.5">
            {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c) => (
              <motion.span key={c} whileHover={{ scale: 1.3 }} className={cn("size-3 rounded-full cursor-pointer", c)} />
            ))}
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-0.5 text-[11px] text-gray-400">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            orion.ai/workspace/core
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5">
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="size-1.5 rounded-full bg-gray-500"
            />
            <span className="text-[10px] font-semibold text-gray-600">24 agents live</span>
          </div>
        </div>

        {/* App layout */}
        <div className="flex" style={{ height: 380 }}>
          {/* Sidebar */}
          <div className="w-14 shrink-0 border-r border-gray-100 bg-gray-950 py-4">
            <div className="mb-5 flex justify-center">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gray-700">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <circle cx="3" cy="3" r="2" fill="white" />
                  <circle cx="11" cy="3" r="2" fill="white" fillOpacity="0.45" />
                  <circle cx="3" cy="11" r="2" fill="white" fillOpacity="0.45" />
                  <circle cx="11" cy="11" r="2" fill="white" />
                </svg>
              </div>
            </div>
            {[BarChart3, Bot, GitBranch, Shield, Users].map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.07, ease: EASE }}
                className={cn("mb-1 flex justify-center py-2.5 cursor-pointer relative")}
              >
                <Icon className={cn("size-4", i === 1 ? "text-white" : "text-gray-600")} />
                {i === 1 && (
                  <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-white" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Main */}
          <div className="flex-1 overflow-hidden bg-gray-50 p-4">
            {/* Header row */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, ease: EASE }}
              className="mb-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <span>Orion Core</span>
                <ChevronRight className="size-3" />
                <span className="font-medium text-gray-700">My Workspace</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] text-gray-400">
                  Filter
                </div>
                <div className="rounded-lg bg-gray-950 px-3 py-1.5 text-[10px] font-semibold text-white">
                  + New Agent
                </div>
              </div>
            </motion.div>

            {/* Kanban columns */}
            <div className="grid grid-cols-4 gap-3 h-[calc(100%-2rem)]">
              {cols.map((col, ci) => (
                <div key={col.label} className="flex flex-col gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + ci * 0.08, ease: EASE }}
                    className="flex items-center justify-between px-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={cn("size-1.5 rounded-full", col.dot)} />
                      <span className="text-[10px] font-semibold text-gray-600">{col.label}</span>
                    </div>
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold", col.color)}>
                      {col.count}
                    </span>
                  </motion.div>

                  {col.cards.map((card, ki) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 14, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.7 + ci * 0.1 + ki * 0.08, ease: EASE }}
                      whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", transition: { duration: 0.18 } }}
                      className="cursor-default rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                    >
                      <p className="mb-1 text-[11px] font-semibold leading-tight text-gray-800 line-clamp-1">
                        {card.title}
                      </p>
                      <p className="mb-2 text-[9px] text-gray-400">{card.agent}</p>
                      {card.pct > 0 && card.pct < 100 && (
                        <div className="mb-2 h-1 overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${card.pct}%` }}
                            transition={{ delay: 0.9 + ci * 0.1, duration: 0.8, ease: EASE }}
                            className="h-full rounded-full bg-gray-800"
                          />
                        </div>
                      )}
                      {card.pct === 100 && col.label !== "Completed" && (
                        <div className="mb-2 flex items-center gap-1">
                          <Check className="size-2.5 text-emerald-500" />
                          <span className="text-[9px] text-emerald-500">Ready for review</span>
                        </div>
                      )}
                      <div className="flex -space-x-1">
                        {card.avatars.map((color, ai) => (
                          <div
                            key={ai}
                            className="size-4 rounded-full border border-white text-[7px] font-bold text-white grid place-items-center"
                            style={{ background: color }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
  let wi = 0;

  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-0">
      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Subtle warm glow */}
      <motion.div
        animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.06, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gray-200/50 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3.5 py-1.5 text-xs font-medium text-gray-600"
        >
          <motion.span
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="size-1.5 rounded-full bg-gray-500"
          />
          Now available for enterprise teams
          <ChevronRight className="size-3 text-gray-400" />
        </motion.div>

        {/* Headline — word-by-word blur reveal */}
        <h1 className="max-w-3xl text-[4rem] font-black leading-[1.0] tracking-tight text-gray-950 sm:text-[5rem] md:text-[5.5rem]">
          {[HERO_LINE1, HERO_LINE2].map((line, li) => (
            <div key={li} className={cn("block", li === 1 ? "text-gray-400" : "")}>
              {line.map((word) => {
                const delay = 0.07 + wi++ * 0.07;
                return (
                  <motion.span
                    key={word + li}
                    initial={{ opacity: 0, y: 52, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay, duration: 0.7, ease: EASE }}
                    className="inline-block mr-[0.2em]"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </div>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: EASE }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-gray-500"
        >
          Orion orchestrates AI agents across your entire operation — from code review to contract
          approval — with human oversight built in at every step.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.82, duration: 0.55, ease: EASE }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(0,0,0,0.22)" }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white"
          >
            Start your free pilot
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowRight className="size-4" />
            </motion.span>
          </motion.button>
          <motion.button
            whileHover={{ gap: "10px" }}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-all hover:text-gray-900"
          >
            <div className="grid size-8 place-items-center rounded-full border border-gray-200 bg-white shadow-sm">
              <Play className="size-3.5 fill-gray-700 text-gray-700" />
            </div>
            See role-based demos
          </motion.button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center gap-4 text-xs text-gray-400"
        >
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["#1F2937", "#374151", "#4B5563", "#6B7280", "#111827"].map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, scale: 0, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 1.0 + i * 0.07, type: "spring", stiffness: 380, damping: 18 }}
                  className="size-7 rounded-full border-2 border-white shadow-sm"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="font-medium text-gray-600">500+ enterprise teams</span>
          </div>
          <span className="text-gray-200">·</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + i * 0.06, type: "spring", stiffness: 340, damping: 14 }}
              >
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
              </motion.span>
            ))}
            <span className="ml-1 font-medium text-gray-600">4.9 / 5 on G2</span>
          </div>
          <span className="text-gray-200">·</span>
          <span>SOC 2 Type II certified</span>
        </motion.div>
      </div>

      {/* Kanban mockup */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 1.0, ease: EASE }}
        className="relative mx-auto mt-16 max-w-6xl px-6"
      >
        <KanbanMockup />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-white" />
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   LOGO STRIP
───────────────────────────────────────────────────────────────────── */
const LOGOS = ["Salesforce", "Atlassian", "HubSpot", "Notion", "GitHub", "Slack", "Linear", "Datadog", "Figma", "Workday"];

function LogoStrip() {
  return (
    <section className="overflow-hidden border-y border-gray-100 bg-white py-10">
      <FadeUp className="mb-6 text-center text-xs font-medium tracking-widest text-gray-300 uppercase">
        Deployed inside the world&apos;s best teams
      </FadeUp>
      <div className="flex flex-col gap-4">
        {[
          { logos: LOGOS, duration: 28, dir: "left" as const },
          { logos: [...LOGOS.slice(5), ...LOGOS.slice(0, 5)], duration: 22, dir: "right" as const },
        ].map(({ logos, duration, dir }, ri) => (
          <div key={ri} className="flex overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <motion.div
              animate={{ x: dir === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
              className="flex shrink-0 gap-16 pr-16"
            >
              {[...logos, ...logos].map((logo, i) => (
                <motion.span
                  key={i}
                  whileHover={{ color: "#111827", scale: 1.1, transition: { duration: 0.15 } }}
                  className="cursor-default select-none whitespace-nowrap text-sm font-semibold tracking-tight text-gray-200"
                >
                  {logo}
                </motion.span>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STATS STRIP
───────────────────────────────────────────────────────────────────── */
function StatsStrip() {
  const stats = [
    { label: "Agents deployed", to: 12400, suffix: "+" },
    { label: "Task completion rate", to: 97, suffix: "%" },
    { label: "Avg ops cost reduction", to: 41, suffix: "%" },
    { label: "Enterprise customers", to: 520, suffix: "+" },
  ];

  return (
    <section className="bg-gray-950 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map(({ label, to, suffix }, i) => (
            <FadeUp key={label} delay={i * 0.08}>
              <div className="text-center">
                <div className="text-4xl font-black tracking-tight text-white">
                  <AnimatedCounter to={to} suffix={suffix} />
                </div>
                <p className="mt-1.5 text-sm text-gray-500">{label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   FEATURES — alternating sections
───────────────────────────────────────────────────────────────────── */
function WorkflowDAG() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const nodes = [
    { id: "T", label: "Trigger", sub: "Webhook", x: 30, y: 50, color: "bg-gray-900" },
    { id: "A1", label: "Fetch data", sub: "Agent-01", x: 165, y: 20, color: "bg-gray-700" },
    { id: "A2", label: "Analyze", sub: "Agent-02", x: 165, y: 80, color: "bg-gray-600" },
    { id: "P", label: "Approve", sub: "Human step", x: 300, y: 50, color: "bg-amber-500" },
    { id: "D", label: "Deploy", sub: "Auto-exec", x: 435, y: 50, color: "bg-emerald-500" },
  ];

  const edges = [
    { x1: 72, y1: 95, x2: 150, y2: 55 },
    { x1: 72, y1: 95, x2: 150, y2: 135 },
    { x1: 210, y1: 55, x2: 285, y2: 95 },
    { x1: 210, y1: 135, x2: 285, y2: 95 },
    { x1: 345, y1: 95, x2: 420, y2: 95 },
  ];

  return (
    <div ref={ref} className="relative h-44 w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 190">
        {edges.map((e, i) => (
          <motion.line
            key={i}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="4 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: EASE }}
          />
        ))}
        {inView && edges.map((e, i) => (
          <motion.circle
            key={i}
            r="3" fill="#111827"
            initial={{ cx: e.x1, cy: e.y1, opacity: 0 }}
            animate={{ cx: [e.x1, e.x2], cy: [e.y1, e.y2], opacity: [0, 1, 0] }}
            transition={{ delay: 0.8 + i * 0.3, duration: 1.2, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
          />
        ))}
      </svg>
      {nodes.map((n, i) => (
        <motion.div
          key={n.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 300, damping: 18 }}
          whileHover={{ scale: 1.08, transition: { duration: 0.18 } }}
          className="absolute cursor-default"
          style={{ left: `${n.x}px`, top: `${n.y}%`, transform: "translate(-50%,-50%)" }}
        >
          <div className={cn("grid size-10 place-items-center rounded-2xl text-xs font-black text-white shadow-md", n.color)}>
            {n.id}
          </div>
          <p className="mt-1 text-center text-[9px] font-semibold text-gray-700 leading-tight">{n.label}</p>
          <p className="text-center text-[8px] text-gray-400">{n.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

function ApprovalCard() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [approved, setApproved] = React.useState<boolean | null>(null);

  return (
    <div ref={ref} className="flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.94 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md"
      >
        <div className="border-b border-amber-100 bg-amber-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="size-2 rounded-full bg-amber-500"
            />
            <span className="text-xs font-semibold text-amber-700">Awaiting your approval</span>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm font-semibold text-gray-900">Merge PR #2841 to production</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Agent-003 completed testing with 99.4% pass rate. 3 reviewers signed off. Ready to merge.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-[11px]">
            <div className="grid size-6 place-items-center rounded-md bg-gray-100 text-gray-700 font-bold text-[9px]">AI</div>
            <span className="text-gray-500">Confidence: <strong className="text-gray-800">98.1%</strong> — Low risk deployment</span>
          </div>
          <AnimatePresence mode="wait">
            {approved === null ? (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 flex gap-2"
              >
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setApproved(true)}
                  className="flex-1 rounded-xl bg-gray-950 py-2.5 text-xs font-semibold text-white"
                >
                  ✓ Approve & Deploy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setApproved(false); setTimeout(() => setApproved(null), 2000); }}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-medium text-gray-600"
                >
                  Request changes
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn(
                  "mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold",
                  approved ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600",
                )}
              >
                {approved ? <Check className="size-4" /> : <Plus className="size-4 rotate-45" />}
                {approved ? "Deployment initiated by Orion" : "Agent paused — feedback sent"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function AuditLog() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const entries = [
    { time: "09:41:03", agent: "Agent-003", action: "PR #2841 merged to main", type: "success" },
    { time: "09:40:57", agent: "Human", action: "Marcus approved deployment", type: "approval" },
    { time: "09:38:22", agent: "Agent-003", action: "Test suite passed (247/249)", type: "success" },
    { time: "09:31:05", agent: "Agent-003", action: "Staging deploy completed", type: "info" },
    { time: "09:14:40", agent: "Agent-003", action: "PR #2841 created from feature/auth", type: "info" },
  ];
  const typeStyles = {
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
    approval: "bg-gray-100 text-gray-600 border-gray-200",
    info: "bg-gray-50 text-gray-500 border-gray-100",
  };
  return (
    <div ref={ref} className="p-6">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
          <span className="text-xs font-semibold text-gray-700">Audit Trail — PR #2841</span>
          <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Live</span>
        </div>
        <div className="divide-y divide-gray-50">
          {entries.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.4, ease: EASE }}
              className="flex items-start gap-3 px-5 py-3"
            >
              <span className="mt-0.5 shrink-0 font-mono text-[9px] text-gray-300">{e.time}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed text-gray-700 line-clamp-1">{e.action}</p>
              </div>
              <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-medium", typeStyles[e.type as keyof typeof typeStyles])}>
                {e.agent}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      label: "Autonomous execution",
      heading: "Agents that plan, execute, and adapt.",
      desc: "Orion agents understand context, chain multi-step tasks, and self-correct when something changes — without waiting for a human to press go.",
      bullets: ["Multi-step task orchestration", "Real-time tool integration", "Self-healing on failure"],
      visual: <WorkflowDAG />,
      flip: false,
    },
    {
      label: "Human-in-the-loop",
      heading: "Control without micromanaging.",
      desc: "Define exactly where you want human sign-off. Agents pause, surface a clear decision card, and resume the moment you approve.",
      bullets: ["Configurable approval thresholds", "One-click approve or redirect", "Full context surfaced instantly"],
      visual: <ApprovalCard />,
      flip: true,
    },
    {
      label: "Complete audit trail",
      heading: "Every action. Fully traceable.",
      desc: "Every agent decision is logged with timestamp, reasoning, and outcome. Search, export, and share any run for compliance or debugging.",
      bullets: ["Immutable execution logs", "SOC 2 compliant storage", "Exportable to your SIEM"],
      visual: <AuditLog />,
      flip: false,
    },
  ];

  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp className="mb-20 text-center">
          <p className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">Platform capabilities</p>
          <h2 className="text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            Everything you need.<br />Nothing you don&apos;t.
          </h2>
        </FadeUp>

        <div className="space-y-24">
          {features.map((feat) => (
            <FadeUp key={feat.label} delay={0.05}>
              <div className={cn("grid items-center gap-12 lg:grid-cols-2", feat.flip && "lg:[&>*:first-child]:order-2")}>
                <div>
                  <motion.span
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="mb-4 inline-block rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                  >
                    {feat.label}
                  </motion.span>
                  <h3 className="text-3xl font-black leading-tight tracking-tight text-gray-950 sm:text-4xl">
                    {feat.heading}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-gray-500">{feat.desc}</p>
                  <ul className="mt-6 space-y-2.5">
                    {feat.bullets.map((b, bi) => (
                      <motion.li
                        key={b}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + bi * 0.08, duration: 0.4, ease: EASE }}
                        className="flex items-center gap-2.5 text-sm text-gray-700"
                      >
                        <div className="grid size-5 shrink-0 place-items-center rounded-full bg-gray-100">
                          <Check className="size-3 text-gray-700" />
                        </div>
                        {b}
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <TiltCard className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
                  {feat.visual}
                </TiltCard>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────────────────────────────── */
function WorkflowSection() {
  const steps = [
    { n: "01", icon: Globe, title: "Connect your stack", desc: "One-click integrations with 200+ tools. Orion reads your existing workflows and maps data sources automatically." },
    { n: "02", icon: Bot, title: "Define agent behaviors", desc: "Set tasks, triggers, and approval rules in plain language. No prompt engineering. No YAML configs." },
    { n: "03", icon: TrendingUp, title: "Ship with confidence", desc: "Agents execute live. You get real-time status, full audit logs, and one-click rollback if anything looks off." },
  ];

  return (
    <section className="bg-gray-50 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">Getting started</p>
          <h2 className="text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">Up and running in an afternoon.</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
            No ML expertise required. Orion handles the complexity — you handle the strategy.
          </p>
        </FadeUp>

        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map(({ n, icon: Icon, title, desc }, i) => (
            <FadeUp key={n} delay={i * 0.1}>
              <TiltCard className="h-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
                <div className="mb-5 flex items-start justify-between">
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="grid size-11 place-items-center rounded-xl border border-gray-200 bg-gray-100"
                  >
                    <Icon className="size-5 text-gray-700" />
                  </motion.div>
                  <span className="font-black text-[2rem] leading-none text-gray-100">{n}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              </TiltCard>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  { quote: "We replaced an entire ops rotation with Orion agents. They never miss SLAs, never need stand-ups, and escalate with full context.", author: "Priya Mehta", role: "VP Engineering, Meridian Health", color: "#1F2937" },
  { quote: "The approval flow is what sold us. Our compliance team finally trusts an AI tool because they're always in the loop.", author: "Jordan Blake", role: "CTO, Beacon Financial", color: "#374151" },
  { quote: "Orion handles our nightly data reconciliation across 14 systems. We shipped that workflow in two hours.", author: "Tomás Reyes", role: "Head of Data, Solstice Retail", color: "#4B5563" },
];

function TestimonialsSection() {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp className="mb-12 text-center">
          <h2 className="text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            Trusted by teams who ship.
          </h2>
        </FadeUp>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.author} delay={0.07 * i}>
              <motion.div
                onClick={() => setActive(i)}
                animate={active === i ? {
                  scale: 1.03, y: -6,
                  boxShadow: "0 20px 56px rgba(0,0,0,0.10)",
                  borderColor: "rgb(209,213,219)",
                } : { scale: 1, y: 0, boxShadow: "none", borderColor: "rgb(243,244,246)" }}
                transition={{ duration: 0.35, ease: EASE }}
                className="h-full cursor-pointer rounded-2xl border bg-white p-6"
              >
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <motion.span key={j} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                      transition={{ delay: 0.07 * i + j * 0.05, type: "spring", stiffness: 320, damping: 16 }}>
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                    </motion.span>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {active === i ? (
                    <motion.p key="active" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: EASE }}
                      className="text-sm leading-relaxed text-gray-800">
                      &ldquo;{t.quote}&rdquo;
                    </motion.p>
                  ) : (
                    <p className="text-sm leading-relaxed text-gray-400">&ldquo;{t.quote}&rdquo;</p>
                  )}
                </AnimatePresence>
                <div className="mt-5 flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.1 }}
                    className="grid size-9 place-items-center rounded-full text-sm font-black text-white"
                    style={{ background: t.color }}>
                    {t.author[0]}
                  </motion.div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.author}</p>
                    <p className="text-[11px] text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <motion.button key={i} type="button" onClick={() => setActive(i)}
              animate={{ width: active === i ? 28 : 8, backgroundColor: active === i ? "#111827" : "#e5e7eb" }}
              transition={{ duration: 0.3, ease: EASE }}
              className="h-2 rounded-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   PRICING
───────────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Team",
    monthly: 0,
    yearly: 0,
    desc: "For small teams exploring autonomous ops.",
    cta: "Start free",
    highlight: false,
    features: ["10 active agents", "5,000 executions/mo", "3 integrations", "Community support", "Basic audit logs"],
  },
  {
    name: "Growth",
    monthly: 79,
    yearly: 63,
    desc: "For scaling teams with production workloads.",
    cta: "Start free trial",
    highlight: true,
    features: ["100 active agents", "200,000 executions/mo", "Unlimited integrations", "Priority support", "Advanced audit + export", "Custom approval flows"],
  },
  {
    name: "Enterprise",
    monthly: 299,
    yearly: 239,
    desc: "For large orgs with compliance requirements.",
    cta: "Talk to sales",
    highlight: false,
    features: ["Unlimited agents", "Unlimited executions", "SSO + SAML", "Dedicated CSM", "SOC 2 / HIPAA", "Custom SLA"],
  },
];

function PricingSection() {
  const [yearly, setYearly] = React.useState(false);

  return (
    <section className="bg-gray-50 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp className="text-center">
          <p className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">Pricing</p>
          <h2 className="text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">Simple pricing. Serious power.</h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-gray-500">
            Start free. Scale your agent fleet as your operations grow.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3">
            <span className={cn("text-sm transition-colors", !yearly ? "font-bold text-gray-900" : "text-gray-400")}>Monthly</span>
            <button
              type="button"
              onClick={() => setYearly((v) => !v)}
              className={cn("relative h-6 w-11 rounded-full transition-colors duration-300", yearly ? "bg-gray-950" : "bg-gray-200")}
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
                  initial={{ opacity: 0, scale: 0.75, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.75, x: -8 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600"
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
                whileHover={!plan.highlight ? { y: -6, boxShadow: "0 20px 56px rgba(0,0,0,0.08)", transition: { duration: 0.22 } } : {}}
                className={cn(
                  "relative h-full overflow-hidden rounded-2xl border p-7",
                  plan.highlight
                    ? "border-gray-800 bg-gray-950 shadow-[0_24px_64px_rgba(0,0,0,0.18)]"
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
                    <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      Most popular
                    </span>
                  </>
                )}

                <p className={cn("text-sm font-bold", plan.highlight ? "text-gray-400" : "text-gray-500")}>{plan.name}</p>

                <div className="mt-3 flex items-end gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${plan.name}-${yearly}`}
                      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                      transition={{ duration: 0.26, ease: EASE }}
                      className={cn("text-4xl font-black tracking-tight", plan.highlight ? "text-white" : "text-gray-950")}
                    >
                      {plan.monthly === 0 ? "Free" : `$${yearly ? plan.yearly : plan.monthly}`}
                    </motion.span>
                  </AnimatePresence>
                  {plan.monthly > 0 && <span className="mb-1 text-sm text-gray-400">/mo</span>}
                </div>

                <p className={cn("mt-1.5 text-sm", plan.highlight ? "text-gray-400" : "text-gray-500")}>{plan.desc}</p>

                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className={cn(
                    "mt-6 w-full rounded-xl py-2.5 text-sm font-bold transition",
                    plan.highlight
                      ? "bg-white text-gray-950 hover:bg-gray-100"
                      : "border border-gray-200 bg-white text-gray-950 hover:bg-gray-50",
                  )}
                >
                  {plan.cta}
                </motion.button>

                <div className={cn("my-5 h-px", plan.highlight ? "bg-white/10" : "bg-gray-100")} />

                <ul className="space-y-3">
                  {plan.features.map((f, fi) => (
                    <motion.li key={f} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: 0.06 * i + fi * 0.05, duration: 0.35, ease: EASE }}
                      className="flex items-center gap-2.5 text-sm">
                      <Check className={cn("size-4 shrink-0", plan.highlight ? "text-gray-400" : "text-gray-500")} />
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

/* ─────────────────────────────────────────────────────────────────────
   FAQ
───────────────────────────────────────────────────────────────────── */
const FAQS = [
  { q: "How quickly can I deploy my first agent?", a: "Most teams ship their first agent within an afternoon. Connect your tools, describe the task in plain language, and Orion generates the execution plan. No ML expertise needed." },
  { q: "What tools and APIs does Orion integrate with?", a: "Orion has pre-built connectors for 200+ tools including GitHub, Jira, Salesforce, Slack, HubSpot, Linear, and any REST/GraphQL API. Custom connectors are available on Growth and Enterprise plans." },
  { q: "How does human-in-the-loop approval work?", a: "You define approval gates per agent or per task type. When triggered, the agent pauses and surfaces a decision card — with full context and confidence score — to the right person via Slack, email, or the Orion dashboard." },
  { q: "Is Orion SOC 2 compliant?", a: "Yes. Orion is SOC 2 Type II certified. All execution logs are immutable, encrypted at rest with AES-256, and available for export to your SIEM. Enterprise plans include HIPAA BAA on request." },
  { q: "Can agents be paused, edited, or rolled back?", a: "Yes. Every agent can be paused instantly from the dashboard, the Slack bot, or via API. Execution history is retained so you can re-run, modify, or roll back any workflow." },
];

function FAQSection() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-3xl px-6">
        <FadeUp className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">FAQ</p>
          <h2 className="text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">Common questions.</h2>
        </FadeUp>

        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <FadeUp key={i} delay={i * 0.04}>
                <motion.div
                  animate={isOpen ? { borderColor: "rgb(209,213,219)" } : { borderColor: "rgb(243,244,246)" }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden rounded-2xl border bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className={cn("pr-4 text-[15px] font-bold transition-colors", isOpen ? "text-gray-950" : "text-gray-700")}>
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0, backgroundColor: isOpen ? "rgb(17,24,39)" : "rgb(243,244,246)" }}
                      transition={{ duration: 0.22, ease: EASE }}
                      className="grid size-7 shrink-0 place-items-center rounded-full"
                    >
                      <Plus className={cn("size-3.5 transition-colors", isOpen ? "text-white" : "text-gray-400")} />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { duration: 0.32, ease: EASE }, opacity: { duration: 0.2 } }}
                      >
                        <div className="border-t border-gray-100 px-6 pb-5 pt-4">
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

/* ─────────────────────────────────────────────────────────────────────
   CTA
───────────────────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gray-950 py-28">
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Soft glow */}
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <FadeUp>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-widest"
          >
            Start your pilot today
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
            className="text-4xl font-black text-white sm:text-5xl md:text-6xl"
          >
            Your ops team,<br />
            <span className="text-gray-300">supercharged.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16, duration: 0.5, ease: EASE }}
            className="mx-auto mt-5 max-w-lg text-base text-gray-500"
          >
            Join 500+ enterprise teams running Orion in production. Free pilot. No credit card. Cancel anytime.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.24, duration: 0.5, ease: EASE }}
            className="mt-9 flex flex-wrap justify-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 8px 32px rgba(255,255,255,0.18)" }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-gray-950"
            >
              Start your free pilot
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
                <ArrowRight className="size-4" />
              </motion.span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-white transition"
            >
              Talk to sales
            </motion.button>
          </motion.div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    { heading: "Product", links: ["Features", "Platform", "Integrations", "Changelog", "Roadmap"] },
    { heading: "Company", links: ["About", "Blog", "Careers", "Press", "Partners"] },
    { heading: "Resources", links: ["Docs", "API Reference", "Community", "Status", "Security"] },
    { heading: "Legal", links: ["Privacy", "Terms", "SOC 2", "DPA", "Cookies"] },
  ];

  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <motion.div whileHover={{ scale: 1.04 }} className="inline-flex cursor-default items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gray-950">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="3" cy="3" r="2" fill="white" />
                  <circle cx="11" cy="3" r="2" fill="white" fillOpacity="0.45" />
                  <circle cx="3" cy="11" r="2" fill="white" fillOpacity="0.45" />
                  <circle cx="11" cy="11" r="2" fill="white" />
                </svg>
              </div>
              <span className="text-[15px] font-black text-gray-950">Orion</span>
            </motion.div>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Autonomous enterprise AI. Built for teams that can&apos;t afford to slow down.
            </p>
            <div className="mt-4 flex gap-3">
              {["X", "LI", "GH"].map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
                  className="grid size-8 place-items-center rounded-lg border border-gray-200 text-[10px] font-bold text-gray-400 transition"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">{col.heading}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <motion.a href="#" whileHover={{ x: 3, color: "#111827" }} transition={{ duration: 0.15 }}
                      className="text-sm text-gray-500">
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="text-xs text-gray-400">© 2026 Orion AI, Inc. All rights reserved.</p>
          <p className="text-xs text-gray-300">Built with Next.js · Tailwind CSS · Framer Motion</p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────────────────────── */
export function OrionAIPage() {
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
      <StatsStrip />
      <FeaturesSection />
      <WorkflowSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
