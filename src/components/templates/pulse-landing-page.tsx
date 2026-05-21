"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Zap,
  ChevronRight,
  ChevronLeft,
  Check,
  Paperclip,
  Globe,
  Lightbulb,
  Plus,
  ArrowRight,
  GitBranch,
  MessageSquare,
  Puzzle,
  Figma,
  Triangle,
  Inbox,
  CircleUser,
  Layers,
  FolderKanban,
  LayoutGrid,
  Users,
  Smartphone,
  Map,
  FileText,
  ChevronDown,
  Link2,
  MoreHorizontal,
  Sparkles,
  Settings,
  HelpCircle,
  Search,
  type LucideProps,
} from "lucide-react";

// ─── Navbar ──────────────────────────────────────────────────────────────────

function PulseNavbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 border-b transition-colors duration-300"
      style={{
        borderColor: scrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
        background: scrolled ? "rgba(9,9,11,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-white" />
          <span className="font-semibold text-white">Pulse</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          {["Platform", "Docs", "Pricing", "Stories", "Support"].map((link) => (
            <a key={link} href="#" className="text-sm text-zinc-400 transition-colors hover:text-white">
              {link}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-zinc-400 transition-colors hover:text-white">
            Log in
          </a>
          <a
            href="#"
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-sm text-white transition-colors hover:bg-zinc-700"
          >
            Get started
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function NavItemMini({
  icon: Icon,
  label,
  badge,
  active,
  hasSubmenu,
  color,
}: {
  icon: React.ComponentType<LucideProps>;
  label: string;
  badge?: number;
  active?: boolean;
  hasSubmenu?: boolean;
  color?: string;
}) {
  return (
    <div
      className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
        active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
      }`}
    >
      <Icon className={`h-4 w-4 ${color || ""}`} />
      <span className="flex-1 text-xs">{label}</span>
      {badge && (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-indigo-500/80 px-1 text-[10px] font-medium text-white">
          {badge}
        </span>
      )}
      {hasSubmenu && <ChevronRight className="h-3 w-3 text-zinc-600" />}
    </div>
  );
}

function InboxItemMini({
  id,
  title,
  subtitle,
  time,
  avatar,
  status,
  isProject,
  active,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  time?: string;
  avatar: string;
  status: string;
  isProject?: boolean;
  active?: boolean;
}) {
  const statusColors: Record<string, string> = {
    "in-progress": "bg-yellow-500",
    todo: "bg-zinc-600",
    bug: "bg-red-500",
    done: "bg-emerald-500",
  };
  return (
    <div
      className={`cursor-pointer border-b border-zinc-800/30 px-4 py-3 transition-colors ${
        active ? "bg-zinc-800/50" : "hover:bg-zinc-800/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <img src={avatar} alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2">
            {id && <span className="text-[10px] text-zinc-500">{id}</span>}
            {isProject && <span className="text-[10px] text-violet-400">Project</span>}
            <div className={`h-2 w-2 rounded-full ${statusColors[status] || "bg-zinc-500"}`} />
          </div>
          <p className="truncate text-xs leading-tight text-white">{title}</p>
          {subtitle && <p className="mt-0.5 truncate text-[10px] text-zinc-500">{subtitle}</p>}
        </div>
        {time && <span className="shrink-0 text-[10px] text-zinc-600">{time}</span>}
      </div>
    </div>
  );
}

function DashboardMockupFull() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.3, delayChildren: 0.5 } },
  };
  const panelVariants = {
    hidden: { opacity: 0, x: 100, y: -80 },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <motion.div
      className="flex h-full w-full overflow-hidden bg-zinc-950"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sidebar */}
      <motion.div
        className="flex h-full w-[220px] shrink-0 flex-col border-r border-zinc-800/50 bg-zinc-900/80"
        variants={panelVariants}
      >
        <div className="border-b border-zinc-800/50 p-3">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Zap className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold text-white">Pulse</span>
            <ChevronDown className="ml-auto h-3.5 w-3.5 text-zinc-500" />
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2 rounded-md bg-zinc-800/50 px-2.5 py-1.5 text-xs text-zinc-500">
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
            <span className="ml-auto rounded bg-zinc-700/50 px-1.5 py-0.5 text-[10px]">⌘K</span>
          </div>
        </div>
        <div className="space-y-0.5 px-3">
          <NavItemMini icon={Inbox} label="Inbox" badge={3} active />
          <NavItemMini icon={CircleUser} label="My Issues" />
        </div>
        <div className="mt-5 px-3">
          <div className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Workspace
          </div>
          <div className="mt-1 space-y-0.5">
            <NavItemMini icon={Layers} label="Roadmaps" hasSubmenu />
            <NavItemMini icon={FolderKanban} label="Projects" hasSubmenu />
            <NavItemMini icon={LayoutGrid} label="Views" hasSubmenu />
            <NavItemMini icon={Users} label="Teams" hasSubmenu />
          </div>
        </div>
        <div className="mt-5 px-3">
          <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Favorites
          </div>
          <div className="mt-1 space-y-0.5">
            <NavItemMini icon={Smartphone} label="iOS Release" color="text-blue-400" />
            <NavItemMini icon={Map} label="Q3 Roadmap" color="text-orange-400" />
            <NavItemMini icon={FileText} label="API Gateway spec" color="text-emerald-400" />
          </div>
        </div>
        <div className="mt-5 flex-1 px-3">
          <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Your Teams
          </div>
          <div className="mt-1 space-y-0.5">
            <NavItemMini icon={Sparkles} label="Product" hasSubmenu />
            <NavItemMini icon={Settings} label="Engineering" hasSubmenu />
          </div>
        </div>
        <div className="border-t border-zinc-800/50 p-3">
          <NavItemMini icon={HelpCircle} label="Help & Support" />
        </div>
      </motion.div>

      {/* Inbox list */}
      <motion.div
        className="flex h-full w-[320px] shrink-0 flex-col border-r border-zinc-800/50 bg-zinc-900/40"
        variants={panelVariants}
      >
        <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Inbox</h3>
          <button className="text-zinc-500 transition-colors hover:text-white">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <InboxItemMini id="PLS-241" title="Migrate auth tokens to short-lived JWTs" subtitle="maya assigned you" time="2h" avatar="https://i.pravatar.cc/32?img=1" status="in-progress" active />
          <InboxItemMini id="API" title="API Gateway v2" subtitle="New milestone update by priya" time="1d" avatar="https://i.pravatar.cc/32?img=2" status="todo" isProject />
          <InboxItemMini id="PLS-302" title="Webhook delivery silently failing" subtitle="SLA breached" time="2d" avatar="https://i.pravatar.cc/32?img=3" status="bug" />
          <InboxItemMini id="DES-112" title="Refresh notification center UI" subtitle="alex mentioned you" time="4h" avatar="https://i.pravatar.cc/32?img=4" status="todo" />
          <InboxItemMini id="PLS-309" title="Rate limiter not resetting on retry" subtitle="You asked to be reminded" time="1w" avatar="https://i.pravatar.cc/32?img=5" status="bug" />
          <InboxItemMini title="Onboarding flow v2" subtitle="Added as project member" avatar="https://i.pravatar.cc/32?img=6" status="done" isProject />
          <InboxItemMini id="MKT-088" title="Launch blog post assets" subtitle="jordan marked as Duplicate" time="1w" avatar="https://i.pravatar.cc/32?img=7" status="done" />
          <InboxItemMini title="Dashboard v4" subtitle="New update by priya" avatar="https://i.pravatar.cc/32?img=8" status="todo" isProject />
        </div>
      </motion.div>

      {/* Detail panel */}
      <motion.div className="flex h-full flex-1 flex-col overflow-hidden bg-zinc-950" variants={panelVariants}>
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/50 px-5 py-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500">Infrastructure</span>
            <span className="text-zinc-600">›</span>
            <span className="text-emerald-400">Auth service</span>
            <span className="text-zinc-600">›</span>
            <span className="text-zinc-300">PLS-241</span>
          </div>
          <MoreHorizontal className="h-4 w-4 text-zinc-500" />
        </div>
        <div className="flex-1 overflow-auto p-5">
          <h2 className="mb-5 text-xl font-semibold text-white">Migrate auth tokens to short-lived JWTs</h2>
          <div className="mb-5 rounded-lg border border-zinc-800/50 bg-zinc-900/80 p-4 font-mono text-[11px]">
            <div className="space-y-2">
              <div>
                <span className="text-zinc-500">Note. </span>
                <span className="text-amber-300">refreshToken</span>
                <span className="text-zinc-400"> is stored incorrectly. It should use a </span>
                <span className="text-cyan-300">HttpOnly</span>
                <span className="text-zinc-400"> cookie strategy.</span>
              </div>
              <div>
                <span className="text-purple-400">@Column</span>
                <span className="text-zinc-400">(</span>
                <span className="text-cyan-300">RefreshToken</span>
                <span className="text-zinc-400">, </span>
                <span className="text-amber-300">cascade</span>
                <span className="text-zinc-400">: </span>
                <span className="text-orange-300">true</span>
                <span className="text-zinc-400">)</span>
              </div>
              <div>
                <span className="text-blue-400">public </span>
                <span className="text-amber-300">refreshToken</span>
                <span className="text-zinc-400">?: </span>
                <span className="text-cyan-300">RefreshToken</span>
                <span className="text-zinc-400">;</span>
              </div>
              <div className="mt-3 text-zinc-400">
                Validate against{" "}
                <span className="text-emerald-400">CachedSession&lt;RefreshToken&gt;</span>
                , rotate on use.
              </div>
            </div>
          </div>
          <div className="mb-5 space-y-2 text-sm">
            <div className="flex cursor-pointer items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-300">
              <Plus className="h-4 w-4" /><span>Add sub-issues</span>
            </div>
            <div className="flex cursor-pointer items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-300">
              <Link2 className="h-4 w-4" /><span>Links</span>
            </div>
          </div>
          <div className="border-t border-zinc-800/50 pt-4">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Activity</div>
            <div className="space-y-3">
              {[
                { name: "maya", action: "moved from", from: "Backlog", to: "In Progress", time: "3 days ago", img: "1" },
                { name: "priya", action: "commented on", from: "this issue", time: "2 days ago", img: "2" },
              ].map((a) => (
                <div key={a.name + a.time} className="flex items-start gap-2">
                  <img src={`https://i.pravatar.cc/24?img=${a.img}`} alt="" className="h-5 w-5 rounded-full" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-400">
                      <span className="text-white">{a.name}</span>
                      <span className="text-zinc-500"> {a.action} </span>
                      <span className="text-zinc-300">{a.from}</span>
                      {a.to && <><span className="text-zinc-500"> to </span><span className="text-zinc-300">{a.to}</span></>}
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-600">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const [yOffset, setYOffset] = useState(0);
  useEffect(() => {
    const handleScroll = () => setYOffset(Math.min(window.scrollY / 300, 1) * -20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "#09090B" }}>
      {/* Glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "50%", left: "50%",
          transform: "translate(-50%, -30%)",
          width: "1200px", height: "800px",
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col pt-28">
        {/* Hero text */}
        <div className="mt-16 flex w-full justify-center px-6">
          <div className="w-full max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-balance text-4xl font-medium leading-[1.1] text-white md:text-5xl lg:text-[56px]"
            >
              Pulse is the operating system for high-velocity engineering teams
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-lg text-zinc-400"
            >
              Coordinate your team. Ship faster. Never lose context.
              <br />
              One platform from first commit to production.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex items-center gap-6"
            >
              <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100">
                Start free
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white">
                <span className="text-zinc-500">New:</span> Pulse AI for GitHub
                <span aria-hidden="true">→</span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* 3D Stage */}
        <div
          className="relative mt-[-60px]"
          style={{ width: "100vw", marginLeft: "-50vw", left: "50%", height: "700px" }}
        >
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-72"
            style={{ background: "linear-gradient(to top, #09090B 20%, transparent 100%)" }}
          />
          <div
            style={{
              transform: `translateY(${yOffset}px)`,
              transition: "transform 0.1s ease-out",
              perspective: "4000px",
              perspectiveOrigin: "100% 0",
              width: "100%", height: "100%",
              transformStyle: "preserve-3d",
              position: "relative",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                backgroundColor: "#09090B",
                border: "1px solid #1e1e1e",
                borderRadius: "10px",
                width: "1600px", height: "900px",
                margin: "280px auto auto",
                position: "absolute",
                top: 0, bottom: 0, left: 0, right: 0,
                transform: "translate(2%) scale(1.2) rotateX(47deg) rotateY(31deg) rotate(324deg)",
                transformStyle: "preserve-3d",
                overflow: "hidden",
                backfaceVisibility: "hidden",
              }}
            >
              <DashboardMockupFull />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Logo Cloud ───────────────────────────────────────────────────────────────

function LogoCloudSection() {
  return (
    <div className="relative z-20 pb-24 pt-8" style={{ backgroundColor: "#09090B" }}>
      <div className="flex w-full justify-center px-6">
        <div className="w-full max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-2 text-lg text-zinc-300"
          >
            Trusted by teams shipping things that matter.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16 text-lg text-zinc-500"
          >
            From early-stage startups to scaling companies.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative cursor-pointer"
          >
            <div className="grid grid-cols-2 items-center justify-items-center gap-x-16 gap-y-10 transition-all duration-300 group-hover:blur-[2.5px] group-hover:opacity-50 md:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 text-xl font-semibold text-white">
                  <Triangle className="h-5 w-5 fill-white" />
                  Vercel
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/80 px-5 py-2.5 text-sm text-zinc-300 backdrop-blur-sm">
                See our customers <span aria-hidden="true">›</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Cards ────────────────────────────────────────────────────────────

const featureCards = [
  {
    title: "Release planning at scale",
    illustration: (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg">
        <svg width="100%" height="100%" viewBox="0 0 791 669" fill="none">
          {[0, 120, 240, 360].map((offset) => (
            <path
              key={offset}
              opacity="0.25"
              d={`M${377 + offset} 24L${22 + offset} 192C9 198 1 211 1.5 225L11 610C11.6 637 40 654 63.5 641L${409 + offset} 461C421 455 428 443 428 429V57C428 30 401 13 ${377 + offset} 24Z`}
              fill="#2C2C2C" fillOpacity="0.8" stroke="#424242" strokeWidth="3"
            />
          ))}
        </svg>
      </div>
    ),
  },
  {
    title: "Velocity-driven cycle management",
    illustration: (
      <div className="flex h-full w-full items-center justify-center bg-zinc-900/50">
        <div className="space-y-2 px-8">
          {[80, 95, 60, 85, 70].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-2 rounded-full bg-indigo-500/40" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Zero-defect shipping culture",
    illustration: (
      <div className="flex h-full w-full items-center justify-center">
        <div className="grid grid-cols-3 gap-2 p-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700/50"
              style={{ background: i % 3 === 0 ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)" }}
            >
              {i % 3 === 0 && <Check className="h-4 w-4 text-indigo-400" />}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

function FeatureCardsSection() {
  return (
    <div className="relative z-20 py-40" style={{ backgroundColor: "#09090B" }}>
      <div
        className="pointer-events-none absolute left-0 right-0 top-0"
        style={{ height: "20%", background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)" }}
      />
      <div className="flex w-full justify-center px-6">
        <div className="w-full max-w-5xl">
          <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="max-w-md text-3xl text-white sm:text-4xl md:text-5xl lg:text-[56px]"
              style={{ letterSpacing: "-0.0325em", fontWeight: 538, lineHeight: 1.1 }}
            >
              Built for teams that move fast
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-md"
            >
              <p className="leading-relaxed text-zinc-400">
                Pulse is forged from the habits and principles that set elite engineering teams apart: ruthless
                prioritization, tight feedback loops, and an obsession with shipping quality.{" "}
                <a href="#" className="inline-flex items-center gap-1 text-white hover:underline">
                  Make the switch <ChevronRight className="h-4 w-4" />
                </a>
              </p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="group relative flex cursor-pointer flex-col justify-end overflow-hidden border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700"
                style={{ borderRadius: "30px", height: "360px", isolation: "isolate" }}
              >
                <div
                  className="absolute left-0 top-0 w-full"
                  style={{ maskImage: "linear-gradient(#000 70%, transparent 90%)", WebkitMaskImage: "linear-gradient(#000 70%, transparent 90%)" }}
                >
                  <div style={{ height: "280px", width: "100%" }}>{card.illustration}</div>
                </div>
                <div className="relative z-10 flex w-full items-center justify-between" style={{ padding: "0 24px 40px", gap: "16px" }}>
                  <h3 className="text-lg font-medium leading-tight text-white">{card.title}</h3>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-500 transition-colors group-hover:border-zinc-500 group-hover:text-zinc-300">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Section ───────────────────────────────────────────────────────────────

const agents = [
  { name: "Cursor", isAgent: true, selected: true, icon: "◇" },
  { name: "GitHub Copilot", isAgent: true, selected: false, icon: "◉" },
  { name: "Devin", isAgent: true, selected: false, icon: "◈" },
  { name: "Maya", isAgent: false, selected: false, icon: "○" },
  { name: "Claude Code", isAgent: true, selected: false, icon: "◎" },
  { name: "Jordan", isAgent: false, selected: false, icon: "○" },
];

function AISection() {
  return (
    <div className="relative z-20 py-40" style={{ backgroundColor: "#09090B" }}>
      <div
        className="pointer-events-none absolute left-0 right-0 top-0"
        style={{ height: "20%", background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)" }}
      />
      <div className="flex w-full justify-center px-6">
        <div className="w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-6 flex items-center gap-2"
          >
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm text-zinc-400">Artificial intelligence</span>
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 max-w-3xl text-3xl text-white sm:text-4xl md:text-5xl lg:text-[56px]"
            style={{ letterSpacing: "-0.0325em", fontWeight: 538, lineHeight: 1.1 }}
          >
            AI-native workflow automation
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 max-w-md text-zinc-400"
          >
            <span className="font-medium text-white">Pulse for Agents.</span> Delegate repetitive ops to AI agents —
            from triage and assignment to deployment verification and status reporting.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16 flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Learn more <ChevronRight className="h-4 w-4" />
          </motion.button>

          {/* Agent dropdown mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-24 flex justify-center"
          >
            <div style={{ perspective: "900px", userSelect: "none", WebkitUserSelect: "none", width: "100%", maxWidth: "720px", position: "relative" }}>
              <div style={{ transformOrigin: "top", willChange: "transform", transform: "translateY(0%) rotateX(30deg) scale(1.15)", position: "relative" }}>
                <div style={{ border: "1px solid rgba(66,66,66,0.5)", background: "linear-gradient(rgba(255,255,255,0.1) 40%, rgba(8,9,10,0.1) 100%)", borderRadius: "8px", position: "absolute", inset: 0, boxShadow: "inset 0 1.5px 5.3px rgba(255,255,255,0.04), inset 0 -0.75px 0.75px rgba(255,255,255,0.1)", pointerEvents: "none", zIndex: 10 }} />
                <div style={{ background: "linear-gradient(180deg, transparent 0%, #09090B 100%)", height: "80%", position: "absolute", bottom: "-2px", left: "-180px", right: "-180px", pointerEvents: "none", zIndex: 11 }} />
                <div className="rounded-t-xl border border-zinc-700 bg-zinc-800/50 px-5 py-4">
                  <span className="italic text-zinc-500">Assign to...</span>
                </div>
                <div className="rounded-b-xl border border-t-0 border-zinc-700 bg-zinc-900/80 py-1">
                  {agents.map((agent, index) => (
                    <div
                      key={agent.name}
                      style={
                        agent.selected
                          ? { transform: "scale(1.04) rotateX(17deg)", background: "linear-gradient(#343434 0%, #2d2d2d 100%)", borderRadius: "6px", height: "48px", position: "relative", boxShadow: "inset 0 -2.75px 4.75px rgba(255,255,255,0.14), 0 54px 73px 3px rgba(0,0,0,0.5)", zIndex: 20, marginLeft: "-12px", marginRight: "-12px" }
                          : { opacity: 1 - index * 0.15, height: "42px" }
                      }
                    >
                      <div className="flex h-full items-center justify-between" style={{ paddingLeft: "24px", paddingRight: "24px", gap: "12px" }}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg text-zinc-400">{agent.icon}</span>
                          <span className={agent.selected ? "font-medium text-white" : "text-zinc-300"}>{agent.name}</span>
                          {agent.isAgent && <span className="rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">Agent</span>}
                        </div>
                        {agent.selected && <Check className="h-4 w-4 text-zinc-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Two-column bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2"
          >
            <div className="border-b border-r border-t border-zinc-800/60 pb-16 pr-12 pt-12">
              <h3 className="mb-3 text-xl font-medium text-zinc-200">Autonomous triage and routing</h3>
              <p className="mb-8 text-base text-zinc-500">
                Let AI handle the repetitive work — auto-assign issues, detect duplicates, and surface blockers before
                they slow your team down.
              </p>
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5">
                <div className="mb-5 flex items-center gap-2">
                  <svg className="h-4 w-4 text-zinc-500" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0L9.5 5.5L15 7L9.5 8.5L8 14L6.5 8.5L1 7L6.5 5.5L8 0Z" /></svg>
                  <span className="text-sm text-zinc-500">Smart <span className="text-zinc-300">Routing</span></span>
                </div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="w-20 text-sm text-zinc-600">Suggestions</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm" style={{ background: "#7170ff" }}>
                      <span className="h-4 w-4 rounded-full bg-white/30" />
                      <span className="text-white">maya</span>
                    </span>
                    <span className="flex items-center gap-1.5 rounded-md bg-zinc-800/30 px-2 py-1 text-sm text-zinc-600">
                      Auth Service Refactor
                    </span>
                  </div>
                </div>
                <div className="ml-4 rounded-lg bg-zinc-800/40 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-zinc-600" />
                    <span className="text-sm font-medium text-zinc-300">maya</span>
                  </div>
                  <p className="mb-4 text-sm text-zinc-500">
                    This person was the owner of previous issues related to authentication and token refresh bugs.
                  </p>
                  <button className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-700/50 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-600/50">
                    <Check className="h-4 w-4" /> Accept suggestion
                  </button>
                </div>
              </div>
            </div>
            <div className="border-b border-t border-zinc-800/60 pb-16 pl-12 pt-12">
              <h3 className="mb-3 text-xl font-medium text-zinc-200">Pulse MCP</h3>
              <p className="mb-8 text-base text-zinc-500">
                Connect Pulse to your favorite AI tools including Cursor, Claude, ChatGPT, and more.
              </p>
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5 font-mono text-sm">
                <p className="mb-3 text-zinc-700">//mcp.pulse.app/sse</p>
                <div className="mb-6 space-y-1">
                  <p><span className="text-orange-400/70">"mcpServers"</span><span className="text-zinc-500">: {"{"}</span></p>
                  <p className="pl-4"><span className="text-orange-400/70">"pulse"</span><span className="text-zinc-500">: {"{"}</span></p>
                  <p className="pl-8"><span className="text-orange-400/70">"command"</span><span className="text-zinc-500">: </span><span className="text-green-400/70">"npx"</span></p>
                </div>
                <div className="rounded-lg bg-zinc-800/40 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-5 w-0.5 bg-zinc-600" />
                    <span className="text-zinc-600">Ask anything</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[{ icon: Paperclip, label: "Attach" }, { icon: Globe, label: "Search" }, { icon: Lightbulb, label: "Reason" }].map(({ icon: Icon, label }) => (
                      <button key={label} className="flex items-center gap-1.5 rounded-full border border-zinc-700/60 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-700/30">
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Direction Section ────────────────────────────────────────────────

function ProductDirectionSection() {
  return (
    <section className="relative px-6 py-40 md:px-12 lg:px-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: "20%", background: "linear-gradient(to bottom, rgba(255,255,255,0.05), transparent 100%)" }}
      />
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm text-zinc-400">Roadmapping and long-term planning</span>
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        </div>
        <h2
          className="mb-8 max-w-3xl text-3xl font-medium text-white sm:text-4xl md:text-5xl lg:text-[56px]"
          style={{ letterSpacing: "-0.0325em", fontWeight: 538, lineHeight: 1.1 }}
        >
          Define your product trajectory
        </h2>
        <p className="mb-16 max-w-md text-lg text-zinc-400">
          <span className="font-medium text-white">Align every engineer around a shared shipping plan.</span> Map,
          manage, and track all engineering initiatives with Pulse's visual roadmapping tools.
        </p>

        {/* 3D Timeline */}
        <div className="relative mb-16 w-full" style={{ perspective: "1200px" }}>
          <div style={{ transform: "rotateX(50deg) rotateZ(-35deg)", transformStyle: "preserve-3d", transformOrigin: "center center" }}>
            <div className="relative h-[400px]">
              <div className="absolute w-[1px] bg-zinc-600/50" style={{ height: "600px", left: "55%", top: "-100px", backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 4px, rgba(113,113,122,0.5) 4px, rgba(113,113,122,0.5) 8px)" }} />
              <div className="absolute bottom-0 left-[5%] right-0 flex items-end gap-[3px]">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div key={i} className="bg-zinc-600/60" style={{ width: "1px", height: i % 7 === 0 ? "16px" : "8px" }} />
                ))}
              </div>
              {[{ left: "8%", top: "80px", label: "30" }, { left: "18%", top: "55px", label: "AUG 3" }, { left: "32%", top: "35px", label: "10" }, { left: "48%", top: "15px", label: "17" }, { left: "70%", top: "-5px", label: "24" }].map((d) => (
                <div key={d.label} className="absolute text-sm text-zinc-500" style={{ left: d.left, top: d.top }}>{d.label}</div>
              ))}
              <div className="absolute rounded-md bg-zinc-700/80 px-3 py-1 text-sm font-medium text-zinc-300" style={{ left: "58%", top: "-10px" }}>AUG 22</div>

              {[
                { left: "5%", top: "100px", width: "45%", height: "48px", label: "API v2 migration", diamond: true },
                { left: "15%", top: "155px", width: "25%", height: "44px", label: "Design spike", diamond: false },
                { left: "45%", top: "155px", width: "45%", height: "48px", label: "Beta rollout", diamond: false },
                { left: "35%", top: "240px", width: "28%", height: "48px", label: "Performance tuning", diamond: false },
              ].map((bar) => (
                <div
                  key={bar.label}
                  className="absolute flex items-center gap-3 rounded-lg border border-zinc-700/50 px-4 py-3"
                  style={{ left: bar.left, top: bar.top, width: bar.width, height: bar.height, background: bar.diamond ? "rgba(24,24,27,0.9)" : "rgba(24,24,27,0.7)" }}
                >
                  <div className="h-4 w-4 rotate-45 bg-zinc-500/60" />
                  <span className="text-sm text-zinc-400">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two-column */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="border-b border-r border-t border-zinc-800 pb-16 pr-10 pt-10">
            <h3 className="mb-3 text-xl font-medium text-zinc-200">Manage initiatives end-to-end</h3>
            <p className="mb-8 text-base leading-relaxed text-zinc-500">Consolidate specs, milestones, tasks, and technical docs in one centralized workspace.</p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h4 className="mb-5 text-lg font-medium text-zinc-200">Initiative Overview</h4>
              {[
                { label: "Properties", content: <div className="flex gap-2"><span className="flex items-center gap-1.5 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300"><span className="h-2 w-2 rounded-full bg-yellow-500" />In Progress</span><span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">INFRA</span></div> },
                { label: "Resources", content: <div className="flex gap-2"><span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">🚩 Architecture doc</span><span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">⚠ Load test results</span></div> },
              ].map(({ label, content }) => (
                <div key={label} className="mb-4 flex items-center gap-4">
                  <span className="w-20 text-sm text-zinc-500">{label}</span>
                  {content}
                </div>
              ))}
              <div className="flex items-start gap-4">
                <span className="w-20 pt-1 text-sm text-zinc-500">Milestones</span>
                <div className="flex flex-col gap-2">
                  {[{ label: "Schema finalized", pct: "100%", done: true }, { label: "Internal staging", pct: "100% of 10", done: true }, { label: "GA launch", pct: "25% of 53", done: false }].map((m) => (
                    <span key={m.label} className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className={`h-2.5 w-2.5 rotate-45 ${m.done ? "bg-purple-500" : "border border-zinc-500"}`} />
                      {m.label} <span className="text-zinc-500">{m.pct}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-b border-t border-zinc-800 pb-16 pl-10 pt-10">
            <h3 className="mb-3 text-xl font-medium text-zinc-200">Deployment health updates</h3>
            <p className="mb-8 text-base leading-relaxed text-zinc-500">Communicate release status and incident health directly inside the issue tracker.</p>
            <div className="relative h-48">
              {[
                { top: 0, left: "10%", width: "80%", label: "Degraded", color: "bg-zinc-500" },
                { top: 30, left: "5%", width: "85%", label: "Monitoring", color: "bg-zinc-400" },
              ].map((card) => (
                <div key={card.label} className="absolute rounded-lg border border-zinc-700/30 bg-zinc-800/40 px-4 py-2" style={{ top: card.top, left: card.left, width: card.width }}>
                  <span className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className={`h-1.5 w-1.5 rounded-full ${card.color}`} /> {card.label}
                  </span>
                </div>
              ))}
              <div className="absolute rounded-xl border border-zinc-700/50 bg-zinc-800/90 px-5 py-4" style={{ top: "60px", left: 0, width: "95%" }}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                    <svg className="h-3 w-3 text-green-500" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" /></svg>
                  </span>
                  <span className="text-sm font-medium text-green-500">All systems nominal</span>
                </div>
                <p className="mb-3 text-sm text-zinc-300">Deployment verified — rolling to 100% of traffic</p>
                <span className="text-xs text-zinc-500">Sep 8</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 border-b border-zinc-800 pt-16 md:grid-cols-4">
          {[
            { icon: <svg className="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8" /><circle cx="10" cy="10" r="4" /><circle cx="10" cy="10" r="1" fill="currentColor" /></svg>, label: "Roadmaps", desc: "Coordinate strategic engineering efforts." },
            { icon: <svg className="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8" /><path d="M2 10h16M10 2a15 15 0 010 16M10 2a15 15 0 000 16" /></svg>, label: "Cross-squad projects", desc: "Ship across teams without silos." },
            { icon: <div className="h-4 w-4 rotate-45 bg-zinc-400" />, label: "Checkpoints", desc: "Break cycles into concrete delivery phases." },
            { icon: <svg className="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="10" width="3" height="8" rx="1" /><rect x="7" y="6" width="3" height="12" rx="1" /><rect x="12" y="8" width="3" height="10" rx="1" /><rect x="17" y="4" width="3" height="14" rx="1" /></svg>, label: "Velocity insights", desc: "Track throughput, scope, and burndown." },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="pb-16">
              <div className="mb-3 flex items-center gap-2">{icon}<span className="font-medium text-zinc-200">{label}</span></div>
              <p className="text-sm leading-relaxed text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Workflows Section ────────────────────────────────────────────────────────

const carouselCards = [
  { id: 1, category: "Customer Signals", title: "Build what your users are actually asking for", icon: ArrowRight, mockup: "intercom" },
  { id: 2, category: "Git-native workflows", title: "Automate pull requests and branch lifecycle", icon: Plus, mockup: "github" },
  { id: 3, category: "Pulse Mobile", title: "Stay unblocked from anywhere in the world", icon: ArrowRight, mockup: "mobile" },
  { id: 4, category: "Pulse Requests", title: "Turn Slack messages into tracked action items", icon: ArrowRight, mockup: "asks" },
  { id: 5, category: "Pulse Integrations", title: "100+ ways to extend your Pulse workspace", icon: ArrowRight, mockup: "integrations" },
  { id: 6, category: "Figma Integration", title: "Keep design and engineering in perfect sync", icon: ArrowRight, mockup: "figma" },
  { id: 7, category: "Built for developers", title: "Extend anything with the Pulse API", icon: ArrowRight, mockup: "api" },
];

function CardMockupMini({ type }: { type: string }) {
  switch (type) {
    case "intercom":
      return (
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400"><MessageSquare className="h-3.5 w-3.5" /><span>Intercom</span></div>
          <p className="text-sm text-zinc-300">We need a cost breakdown <span className="text-zinc-500">across...</span></p>
          <div className="flex items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-700"><span className="text-[10px] text-zinc-400">A</span></div>
            <span className="text-sm text-zinc-300">ACME</span><span className="text-xs text-zinc-500">New request</span>
          </div>
        </div>
      );
    case "github":
      return (
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-xs"><GitBranch className="h-3.5 w-3.5 text-zinc-500" /><span className="text-zinc-400">#18042</span><span className="text-blue-400/70">add cache...</span></div>
          <div className="mt-3 space-y-2">
            {["alex linked maya/pls-241", "alex changed status from In Progre...", "GitHub changed status from In Revie..."].map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs"><span className="text-zinc-600">↗</span><span className="text-zinc-500">{t}</span></div>
            ))}
          </div>
        </div>
      );
    case "mobile":
      return (
        <div className="flex h-full items-center justify-center">
          <div className="relative h-56 w-32 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900">
            <div className="absolute left-1/2 top-2 h-1 w-12 -translate-x-1/2 rounded-full bg-zinc-800" />
            <div className="mt-6 px-3"><div className="mb-2 text-[10px] text-zinc-400">My Issues</div><div className="space-y-1.5">{[1,2,3,4].map(i => <div key={i} className="h-6 rounded bg-zinc-800/50" />)}</div></div>
          </div>
        </div>
      );
    case "integrations":
      return (
        <div className="flex h-full items-center justify-center">
          <div className="grid grid-cols-2 gap-2">{[1,2,3,4].map(i => <div key={i} className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50"><Puzzle className="h-5 w-5 text-zinc-500" /></div>)}</div>
        </div>
      );
    case "figma":
      return <div className="flex h-full items-center justify-center"><Figma className="h-16 w-16 text-zinc-400" /></div>;
    case "api":
      return <div className="flex h-full items-center justify-center"><div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-2"><span className="font-mono text-xs text-zinc-400">PULSE API</span></div></div>;
    default:
      return null;
  }
}

function WorkflowsSection() {
  const [scrollPosition, setScrollPosition] = useState(0);
  return (
    <section className="relative py-24" style={{ backgroundColor: "#09090B" }}>
      <div className="pointer-events-none absolute left-0 right-0 top-0" style={{ height: "20%", background: "linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)" }} />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="lg:max-w-xl">
            <div className="mb-6 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-sm text-zinc-400">Integrations and automation</span>
              <ChevronRight className="h-4 w-4 text-zinc-600" />
            </div>
            <h2 className="text-4xl font-medium leading-[1.1] text-white md:text-5xl">
              Integrate with your<br />entire engineering stack
            </h2>
          </div>
          <p className="text-zinc-400 lg:max-w-sm lg:pt-12">
            Expand the power of the Pulse platform with a wide variety of integrations that keep every developer in
            your organization unblocked and in flow.
          </p>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex gap-4 transition-transform duration-300 ease-out" style={{ transform: `translateX(-${scrollPosition * (100 / 4)}%)` }}>
            {carouselCards.map((card) => (
              <div key={card.id} className="w-[calc(25%-12px)] min-w-[280px] shrink-0">
                <div className="flex h-[340px] flex-col overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50">
                  <div className="relative flex-1 overflow-hidden">
                    <CardMockupMini type={card.mockup} />
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16" style={{ background: "linear-gradient(to top, rgba(9,9,11,0.9), transparent)" }} />
                  </div>
                  <div className="border-t border-zinc-800/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs text-zinc-500">{card.category}</p>
                        <p className="text-sm leading-snug text-zinc-200">{card.title}</p>
                      </div>
                      <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300">
                        <card.icon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setScrollPosition(Math.max(0, scrollPosition - 1))}
            disabled={scrollPosition === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setScrollPosition(Math.min(carouselCards.length - 4, scrollPosition + 1))}
            disabled={scrollPosition >= carouselCards.length - 4}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="px-6 py-24" style={{ backgroundColor: "#09090B" }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <h2 className="text-3xl font-medium tracking-tight text-white md:text-4xl lg:text-[42px]">
            Ship today. Scale tomorrow.
          </h2>
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800">
              Talk to us
            </button>
            <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100">
              Start free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function FooterSection() {
  const footerLinks = {
    Platform: ["Issues", "Cycles", "Roadmaps", "Initiatives", "Pulse Requests", "Security", "Mobile"],
    Product: ["Pricing", "Method", "Integrations", "Changelog", "Documentation", "Download", "Migrate"],
    Company: ["About", "Customers", "Careers", "Now", "README", "Quality", "Brand"],
    Resources: ["Developers", "Status", "Startups", "Report vulnerability", "DPA", "Privacy", "Terms"],
    Connect: ["Contact us", "Community", "X (Twitter)", "GitHub", "YouTube"],
  };
  return (
    <footer className="border-t border-zinc-800 px-6 py-16" style={{ backgroundColor: "#09090B" }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2 md:col-span-1">
            <svg width="20" height="20" viewBox="0 0 100 100" fill="none" className="text-white">
              <path d="M20 30 L50 10 L80 30 L80 70 L50 90 L20 70 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" />
              <path d="M50 10 L50 50 L20 30" fill="#09090B" />
              <path d="M50 50 L80 70 L50 90" fill="#09090B" />
            </svg>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-medium text-white">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Page Root ────────────────────────────────────────────────────────────────

export function PulseLandingPage() {
  return (
    <div style={{ backgroundColor: "#09090B" }}>
      <PulseNavbar />
      <HeroSection />
      <LogoCloudSection />
      <FeatureCardsSection />
      <AISection />
      <ProductDirectionSection />
      <WorkflowsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
