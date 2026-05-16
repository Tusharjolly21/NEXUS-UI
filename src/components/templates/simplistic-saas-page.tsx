"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { MacKeyboard } from "@/components/keyboard";
import { InfiniteMovingCards } from "@/components/infinite-moving-cards/InfiniteMovingCards";
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  Check,
  Zap,
  BarChart,
  Puzzle,
  Globe,
  Shield,
  Smartphone,
  Laptop,
  Layers,
  Lock,
  MessageSquare,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SimplisticSaaSPage() {
  const reduce = useReducedMotion() === true;
  const [activeFaq, setActiveFaq] = React.useState<number | null>(0);
  const [kanbanTab, setKanbanTab] = React.useState<"issues" | "projects" | "views">("issues");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const clients = [
    { name: "OpenAI", text: true, className: "font-sans font-semibold tracking-tight text-zinc-900 dark:text-white" },
    { name: "hello patient", text: true, className: "font-serif lowercase tracking-tight" },
    { name: "granola", text: true, className: "font-sans font-bold tracking-tighter" },
    { name: "character.ai", text: true, className: "font-bold tracking-tighter lowercase" },
    { name: "ORACLE", text: true, className: "font-sans font-black tracking-widest text-red-600 dark:text-red-500" },
    { name: "Portola", text: true, className: "font-serif tracking-widest uppercase" },
    { name: "Accel", text: true, className: "font-black tracking-tight" },
    { name: "Bloomberg", text: true, className: "font-sans font-black tracking-tighter text-zinc-900 dark:text-white" },
    { name: "Forbes", text: true, className: "font-serif font-bold tracking-tighter uppercase text-zinc-900 dark:text-white" },
    { name: "SoftBank", text: true, className: "font-sans font-bold tracking-tight text-zinc-900 dark:text-white" },
    { name: "The Guardian", slug: "theguardian", invertDark: true },
    { name: "WIRED", text: true, className: "font-sans font-black tracking-tighter text-zinc-900 dark:text-white" },
    { name: "hulu", text: true, className: "font-sans font-bold tracking-tighter text-[#1ce783] lowercase" },
    { name: "YouTube", slug: "youtube" },
    { name: "NETFLIX", slug: "netflix" },
    { name: "Spotify", slug: "spotify" },
    { name: "twitch", slug: "twitch" },
    { name: "Raycast", slug: "raycast" },
    { name: "Vercel", slug: "vercel", invertDark: true },
    { name: "Stripe", slug: "stripe" },
    { name: "Linear", slug: "linear", invertDark: true },
    { name: "GitHub", slug: "github", invertDark: true },
    { name: "Notion", slug: "notion", invertDark: true },
  ];

  const renderClient = (client: typeof clients[0]) => {
    if (client.text) {
      return (
        <span className={cn("text-xl font-bold text-zinc-900 dark:text-white", client.className)}>
          {client.name}
        </span>
      );
    }
    return (
      <img
        src={`https://cdn.simpleicons.org/${client.slug}`}
        alt={client.name}
        className={cn("h-6 w-auto", client.invertDark && "dark:invert")}
        loading="lazy"
      />
    );
  };

  const testimonials = [
    {
      quote: "Best investment for our startup",
      body: "We deployed AI agents that automated our entire workflow overnight. The autonomous execution is exactly what we needed.",
      author: "Nina Kowalski",
      role: "VP Operations",
    },
    {
      quote: "Exceeded all expectations",
      body: "The AI agents handle complex decisions while we sleep. Our team's productivity has increased tenfold since we started using it.",
      author: "David Park",
      role: "Lead Architect",
    },
    {
      quote: "Game changer for our team",
      body: "Orchestrating intelligent workflows used to take weeks of manual work. Now our AI agents handle everything autonomously.",
      author: "Lisa Thompson",
      role: "Product Director",
    },
    {
      quote: "Worth every penny",
      body: "Building and deploying AI agents is incredibly simple. Our automation runs 24/7 without any human intervention.",
      author: "Marcus Vance",
      role: "Founding Engineer",
    },
    {
      quote: "Our secret weapon",
      body: "The autonomous AI workflows give us a competitive edge. Tasks that took hours are now executed automatically in minutes.",
      author: "Elena Rostova",
      role: "Growth Head",
    },
    {
      quote: "Incredible developer experience",
      body: "Deploy, orchestrate, automate. The platform makes building intelligent AI agents straightforward and powerful.",
      author: "Devon Lane",
      role: "Staff Developer",
    },
  ];

  const faqs = [
    {
      q: "What are autonomous AI workflows?",
      a: "Autonomous AI workflows allow intelligent agents to chain tool calls, monitor system state triggers, and execute conditional automation sequences independently without constant prompt intervention.",
    },
    {
      q: "How secure is the authentication setup?",
      a: "Our integrated auth flow leverages state-of-the-art secure SDK handlers, complete session encryption bounds, and dynamic API token protection suitable for enterprise deployments.",
    },
    {
      q: "Can I self-host the orchestration layer?",
      a: "Yes, our native platform SDKs support full edge proxy deployments and private VPC routing to fulfill strict SOC2 and HIPAA regulatory compliance requirements.",
    },
    {
      q: "What platforms do the SDKs support natively?",
      a: "We ship optimized drop-in SDK bundles for React, Next.js App Router, Vue, React Native, iOS (SwiftUI), and Android (Kotlin) out of the box.",
    },
  ];

  const easeOutExpo = [0.16, 1, 0.3, 1] as const;

  const staggerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)", 
      transition: { duration: 1.0, ease: easeOutExpo } 
    }
  };

  // Custom Animated Laptop Component for the Platforms Section
  const AnimatedLaptopMockup = () => {
    const ref = React.useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["0 1", "0.6 1"] // Starts opening when enters viewport, fully open when 60% in view
    });
    
    // Animate lid from closed (flat, folded down towards the user) to open (standing up)
    // rotateX: 90deg makes the top fold towards the user over the keyboard.
    const rotateX = useTransform(scrollYProgress, [0, 1], [90, 0]);

    return (
      <motion.div variants={itemVariants} ref={ref} className="flex flex-col items-center group cursor-pointer [perspective:1500px]">
        <div className="relative mt-8 md:mt-0 transition-transform group-hover:-translate-y-2 duration-500 flex flex-col items-center [transform-style:preserve-3d]">
          
          {/* Lid (Screen) */}
          <motion.div 
            style={{ rotateX, transformOrigin: "bottom" }}
            className="w-56 h-36 rounded-t-xl border-[6px] border-zinc-200 bg-black dark:border-zinc-800 flex flex-col relative shadow-2xl z-20 overflow-hidden"
          >
            <div className="flex-1 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center relative border-t border-zinc-300 dark:border-zinc-700">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 size-1 bg-zinc-800 rounded-full" />
              <div className="absolute inset-x-2 bottom-0 top-5 bg-white dark:bg-zinc-900 border border-zinc-100 border-b-0 dark:border-zinc-800 flex items-center justify-center overflow-hidden rounded-t-sm shadow-inner">
                <div className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:12px_12px]" />
              </div>
            </div>
            {/* Display bezel base */}
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
               <span className="text-[4px] font-bold text-zinc-500">MacBook Pro</span>
            </div>
          </motion.div>
          
          {/* Base (Keyboard deck front edge) */}
          <div className="w-64 h-3 bg-zinc-300 dark:bg-zinc-700 rounded-b-xl relative shadow-xl border-t border-zinc-400 dark:border-zinc-600 flex justify-center items-start z-10 -mt-[1px]">
            {/* Trackpad notch */}
            <div className="w-12 h-[2px] bg-zinc-400 dark:bg-zinc-800 rounded-b-md mt-[1px]"></div>
          </div>
        </div>
        <h4 className="mt-8 font-bold text-zinc-950 text-sm dark:text-white">Full control at your desk</h4>
        <p className="mt-2 text-xs text-zinc-500 text-center max-w-[200px]">Build, debug, and deploy agents with powerful desktop tools.</p>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 selection:bg-blue-500 selection:text-white antialiased font-sans dark:bg-zinc-950 dark:text-zinc-50">
      
      {/* ── Navigation Bar ── */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-zinc-950 text-white font-bold text-xs sm:text-sm shadow-md dark:bg-white dark:text-zinc-950">
              𝝠
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight">Simplistic</span>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-300">
            <a href="#product" className="transition hover:text-blue-600 dark:hover:text-blue-400">
              Product
            </a>
            <a href="#pricing" className="transition hover:text-blue-600 dark:hover:text-blue-400">
              Pricing
            </a>
            <div className="group relative flex items-center gap-1 cursor-pointer py-2">
              <span className="transition group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Resources
              </span>
              <ChevronDown className="size-3.5 text-zinc-400 transition group-hover:rotate-180" />
              <div className="absolute top-full left-0 hidden w-48 rounded-xl border border-zinc-100 bg-white p-2 shadow-xl group-hover:block dark:border-zinc-800 dark:bg-zinc-900">
                <a href="#docs" className="block rounded-lg px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  Documentation
                </a>
                <a href="#blog" className="block rounded-lg px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  Blog & Updates
                </a>
              </div>
            </div>
            <a href="#contact" className="transition hover:text-blue-600 dark:hover:text-blue-400">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#login" className="hidden text-sm font-medium text-zinc-600 transition hover:text-zinc-900 sm:inline-block dark:text-zinc-300 dark:hover:text-white">
              Login
            </a>
            <a
              href="#pricing"
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-blue-500 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
            >
              Try for free
            </a>
            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex md:hidden size-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {mobileMenuOpen ? <span className="text-lg">✕</span> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-100 bg-white/95 backdrop-blur-lg px-4 pb-4 pt-3 dark:border-zinc-800 dark:bg-zinc-950/95">
            <nav className="flex flex-col gap-1">
              <a href="#product" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900">Product</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900">Pricing</a>
              <a href="#docs" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900">Documentation</a>
              <a href="#blog" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900">Blog</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900">Contact</a>
            </nav>
            <div className="mt-3 flex gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <a href="#login" onClick={() => setMobileMenuOpen(false)} className="flex-1 rounded-lg border border-zinc-200 py-2.5 text-center text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">Login</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="flex-1 rounded-lg bg-blue-500 py-2.5 text-center text-sm font-semibold text-white">Try for free</a>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 lg:pt-32">
        {/* Absolute diagonal blue beams overlays mimic screenshots perfectly */}
        <div className="pointer-events-none absolute right-0 top-1/3 -z-10 h-[600px] w-[500px] origin-top-left -rotate-12 bg-gradient-to-tr from-blue-600/10 via-blue-400/5 to-transparent blur-3xl rounded-full" />
        <div className="pointer-events-none absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] bg-blue-500/[0.03] blur-3xl rounded-full" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Label banner */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 border border-zinc-200/60 px-4 py-1.5 text-xs font-medium text-zinc-600 mb-6 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
          >
            <span>Introducing autonomous AI workflows</span>
            <ArrowRight className="size-3 text-zinc-400" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-4xl text-balance text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white"
          >
            Deploy AI agents that <br className="hidden sm:inline" />
            work while you sleep.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-pretty text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400"
          >
            Build, deploy, and orchestrate intelligent AI agents that automate complex workflows, make decisions, and execute tasks autonomously.
          </motion.p>

          {/* Buttons Row */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-95"
            >
              <span>Get Started</span>
              <ArrowRight className="size-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-8 py-3.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
            >
              Learn More
            </a>
          </motion.div>

          {/* ── Immersive Browser App Dashboard Mockup ── */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 sm:mt-16 md:mt-20 relative mx-auto max-w-5xl"
          >
            <div className="rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-zinc-50 shadow-xl sm:shadow-2xl overflow-hidden dark:border-zinc-800 dark:bg-zinc-900 text-left">
              {/* Chrome Top Bar */}
              <div className="flex h-11 items-center justify-between border-b border-zinc-200/60 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-red-400" />
                  <span className="size-3 rounded-full bg-amber-400" />
                  <span className="size-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[11px] font-medium text-zinc-400 tracking-wide font-mono">
                  app.simplistic.ai
                </div>
                <div className="w-12" />
              </div>

              {/* Dashboard Internal Window Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[300px] md:min-h-[450px] bg-white dark:bg-zinc-950">
                {/* Internal Shell Sidebar — hidden on small mobile, shown as top bar on sm */}
                <div className="hidden sm:block border-r border-zinc-100 bg-zinc-50/50 p-3 sm:p-4 md:col-span-3 dark:border-zinc-900 dark:bg-zinc-900/40">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="size-5 rounded bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center">
                      𝝠
                    </div>
                    <span className="text-xs font-semibold">Simplistic Core</span>
                  </div>

                  <div className="mt-6 space-y-1">
                    <p className="px-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Workspace
                    </p>
                    {(["Issues", "Projects", "Views"] as const).map((label) => {
                      const lower = label.toLowerCase() as any;
                      return (
                        <button
                          key={label}
                          onClick={() => setKanbanTab(lower)}
                          className={cn(
                            "w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                            kanbanTab === lower
                              ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-400"
                              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50",
                          )}
                        >
                          <span>{label}</span>
                          {label === "Issues" && (
                            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                              30
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 space-y-1">
                    <p className="px-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Your Teams
                    </p>
                    <div className="rounded-lg px-2 py-1 text-xs text-zinc-500">
                      ⚡ Platform Infra
                    </div>
                    <div className="rounded-lg px-2 py-1 text-xs text-zinc-500">
                      🎨 Design Systems
                    </div>
                  </div>
                </div>

                {/* Internal Shell Content Panel */}
                <div className="p-3 sm:p-4 md:col-span-9 col-span-1 bg-white dark:bg-zinc-950 overflow-x-auto">
                  {/* Top utility row */}
                  <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-semibold text-zinc-500">Filter</span>
                      <span className="rounded-md bg-zinc-100 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                        Active
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-blue-600 font-medium">Live Workflow Rails</div>
                  </div>

                  {/* Kanban Columns Grid replicating target UI */}
                  <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    
                    {/* Column 1: Backlog */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-medium text-zinc-500">Backlog</span>
                        <span className="text-[10px] text-zinc-400">33</span>
                      </div>
                      <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 shadow-xs dark:border-zinc-900 dark:bg-zinc-900/50">
                        <span className="text-[10px] font-mono text-zinc-400">SMP-179</span>
                        <p className="mt-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                          Simplistic Builder v2 automated static parsing engine setup
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-medium text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
                            Document
                          </span>
                          <span className="size-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[8px] font-bold flex items-center justify-center">
                            AI
                          </span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 shadow-xs dark:border-zinc-900 dark:bg-zinc-900/50">
                        <span className="text-[10px] font-mono text-zinc-400">SMP-148</span>
                        <p className="mt-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                          Autonomous lead synchronization handler hooks
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[9px] font-medium text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                            Wisdom
                          </span>
                          <span className="size-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[8px] font-bold flex items-center justify-center">
                            NK
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Todo */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-medium text-zinc-500">Todo</span>
                        <span className="text-[10px] text-zinc-400">4</span>
                      </div>
                      <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 shadow-xs dark:border-zinc-900 dark:bg-zinc-900/50">
                        <span className="text-[10px] font-mono text-zinc-400">SMP-228</span>
                        <p className="mt-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                          Optimize autonomous tool chains for ChatGPT
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                            Improvement
                          </span>
                          <span className="size-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[8px] font-bold flex items-center justify-center">
                            AI
                          </span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 shadow-xs dark:border-zinc-900 dark:bg-zinc-900/50">
                        <span className="text-[10px] font-mono text-zinc-400">SMP-199</span>
                        <p className="mt-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                          Schedule daily analytics database backup trigger
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                            Task
                          </span>
                          <span className="size-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[8px] font-bold flex items-center justify-center">
                            DP
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: In Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-medium text-zinc-500">In Progress</span>
                        <span className="text-[10px] text-zinc-400">5</span>
                      </div>
                      <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3 shadow-xs dark:border-blue-950 dark:bg-blue-950/20">
                        <span className="text-[10px] font-mono text-blue-500 font-semibold">SMP-243</span>
                        <p className="mt-1 text-xs font-medium text-zinc-900 dark:text-white leading-snug">
                          List of premium autonomous block templates deployment
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                            Active Sync
                          </span>
                          <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── Logo Cloud Strip ── */}
      <section id="product" className="border-y border-zinc-100 py-12 md:py-16 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Trusted by teams building the future of AI.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            From prototype to production, autonomously.
          </p>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {}
            }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 transition-all"
          >
            {clients.map((brand, i) => (
              <motion.div 
                key={brand.name} 
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    filter: "blur(0px)", 
                    transition: { duration: 1.2, ease: easeOutExpo } 
                  }
                }}
                className="flex min-w-[100px] sm:min-w-[120px] items-center justify-center px-2"
              >
                {renderClient(brand)}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Autonomous AI workflow features (Bento Grid) ── */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
              Autonomous AI workflow features
            </h2>
            <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
              From prototype to production, autonomously
            </p>
          </div>

          {/* Asymmetrical Bento layout grid */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerVariants}
            className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3"
          >
            
            {/* Box 1: Easy auth setup */}
            <motion.div variants={itemVariants} className="flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 lg:col-span-1 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-100/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-white/5" />
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Easy auth setup</h3>
                <p className="mt-2 text-xs text-zinc-600 leading-relaxed dark:text-zinc-400">
                  Get started in minutes with our simple authentication flow.
                </p>
              </div>

              {/* Visual simulated auth profile form */}
              <div className="relative z-10 mt-8 rounded-2xl border border-zinc-200/60 bg-white/50 p-5 shadow-xs backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50 transition-transform group-hover:scale-[1.02] duration-500">
                <div className="flex items-center gap-2 pb-4 border-b border-zinc-100/80 dark:border-zinc-800/80 justify-center">
                  <div className="size-5 rounded-md bg-zinc-950 text-[10px] font-bold text-white flex items-center justify-center dark:bg-white dark:text-zinc-950">
                    N
                  </div>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">Nexus</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Email</label>
                    <div className="h-8 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[11px] flex items-center text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
                      you@example.com
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Password</label>
                    <div className="h-8 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[11px] flex items-center text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
                      ••••••••
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="h-9 w-full rounded-lg bg-zinc-950 flex items-center justify-center text-xs font-semibold text-white shadow-md dark:bg-white dark:text-zinc-950 transition-transform hover:scale-[1.02] cursor-pointer">
                      Sign in
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800"></div>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-widest whitespace-nowrap">Or continue with</span>
                    <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="h-8 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-[10px] font-semibold shadow-sm dark:border-zinc-800 dark:bg-zinc-950">Google</div>
                    <div className="h-8 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-[10px] font-semibold shadow-sm dark:border-zinc-800 dark:bg-zinc-950">GitHub</div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 rounded-2xl bg-zinc-50 p-4 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                <p className="text-[11px] text-zinc-500 leading-relaxed dark:text-zinc-400">
                  "Setting up auth took us 10 minutes instead of 2 weeks. The SDK just works out of the box with zero configuration. Our team shipped the entire login flow before lunch."
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="size-6 rounded-full" alt="User" />
                  <div>
                    <p className="text-[10px] font-bold text-zinc-900 dark:text-white">Sarah Chen</p>
                    <p className="text-[9px] text-zinc-500">CTO at TechFlow</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Middle stacked boxes */}
            <motion.div variants={itemVariants} className="flex flex-col gap-6 lg:col-span-1">
              
              {/* Box 2: You're secure everywhere */}
              <div className="flex-1 overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 flex flex-col relative dark:border-zinc-800 dark:bg-zinc-950 shadow-sm group">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-white">You&apos;re secure, everywhere</h3>
                  <p className="mt-2 text-xs text-zinc-600 leading-relaxed dark:text-zinc-400">
                    Enterprise-grade security that follows your users across the globe. Built-in encryption, compliance, and monitoring.
                  </p>
                </div>
                {/* Dotted Map Simulation */}
                <div className="mt-8 relative h-40 w-full overflow-hidden flex items-center justify-center rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
                  {/* Subtle dotted background pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:8px_8px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70"></div>
                  
                  {/* Avatar Pins */}
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                    className="absolute top-1/3 left-1/4 flex flex-col items-center"
                  >
                    <div className="relative">
                      <div className="size-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-blue-100 dark:border-zinc-800 relative z-10">
                         <img src="https://i.pravatar.cc/150?u=a04258a2462d826712d" alt="User" />
                      </div>
                      <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-md -z-10 animate-pulse"></div>
                    </div>
                    <div className="w-1 h-3 bg-gradient-to-b from-blue-500 to-transparent opacity-50 mt-1 rounded-full"></div>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-1/4 right-1/3 flex flex-col items-center"
                  >
                    <div className="relative">
                      <div className="size-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-indigo-100 dark:border-zinc-800 relative z-10">
                         <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                      </div>
                      <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-md -z-10 animate-pulse"></div>
                    </div>
                    <div className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-transparent opacity-50 mt-1 rounded-full"></div>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 flex flex-col items-center"
                  >
                    <div className="relative">
                      <div className="size-7 rounded-full border-2 border-white shadow-md overflow-hidden bg-emerald-100 dark:border-zinc-800 relative z-10">
                         <img src="https://i.pravatar.cc/150?u=a048581f4e29026701d" alt="User" />
                      </div>
                      <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-md -z-10 animate-pulse"></div>
                    </div>
                    <div className="w-1 h-2 bg-gradient-to-b from-emerald-500 to-transparent opacity-50 mt-1 rounded-full"></div>
                  </motion.div>
                </div>
              </div>

              {/* Box 3: SDK available for everything */}
              <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 relative dark:border-zinc-800 dark:bg-zinc-950 shadow-sm group">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-white">SDK available for everything</h3>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[200px]">
                    Native SDKs for every platform. React, Vue, iOS, Android, and more.
                  </p>
                </div>
                
                {/* Mac Keyboard Graphic */}
                <div className="mt-8 relative -mx-2 sm:-mx-0 group-hover:-translate-y-2 transition-transform duration-500 [perspective:1000px]">
                  <div className="[transform:rotateX(5deg)] [transform-origin:bottom]">
                    <MacKeyboard
                      className="border border-zinc-200/50 dark:border-zinc-800/50"
                      enableSound={true}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Box 4: Real-time collaboration */}
            <motion.div variants={itemVariants} className="flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 lg:col-span-1 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm relative group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Real-time collaboration</h3>
                <p className="mt-2 text-xs text-zinc-600 leading-relaxed dark:text-zinc-400">
                  Connect with your team instantly. AI-powered insights help you work smarter together.
                </p>
              </div>

              {/* Chat bubbles with avatars replicating the actual template */}
              <div className="relative z-10 mt-8 space-y-4 font-sans flex-1 flex flex-col justify-center">
                
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex items-end gap-3"
                >
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" className="size-8 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-800" alt="Avatar" />
                  <div className="rounded-2xl rounded-bl-sm bg-white p-3 shadow-sm border border-zinc-100 max-w-[220px] dark:border-zinc-800 dark:bg-zinc-900 group-hover:-translate-y-1 transition-transform duration-500">
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                      Workflow completed. 847 tasks processed.
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-end justify-end gap-3"
                >
                  <div className="rounded-2xl rounded-br-sm bg-blue-500 p-3 shadow-md max-w-[200px] group-hover:-translate-y-1 transition-transform duration-500">
                    <p className="text-xs text-white">
                      Deploy to production 🚀
                    </p>
                  </div>
                  <img src="https://i.pravatar.cc/150?u=a04258114e29026702d" className="size-8 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-800" alt="Avatar" />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex items-end gap-3"
                >
                  <img src="https://i.pravatar.cc/150?u=a048581f4e29026701d" className="size-8 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-800" alt="Avatar" />
                  <div className="rounded-2xl rounded-bl-sm bg-white p-3 shadow-sm border border-zinc-100 max-w-[220px] dark:border-zinc-800 dark:bg-zinc-900 group-hover:-translate-y-1 transition-transform duration-500">
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                      Deployed. All systems operational in us-east-1.
                    </p>
                  </div>
                </motion.div>

                {/* Simulated vertical glowing line behind avatars */}
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent -z-10" />

              </div>
              
              <div className="relative mt-8 mx-auto w-40 h-40 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl group-hover:scale-105 transition-transform duration-700">
                 <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=400" className="w-full h-full object-cover" alt="Focus mode" />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                 <div className="absolute bottom-3 left-3 flex items-center gap-2">
                   <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-white uppercase tracking-wider">Focus Mode</span>
                 </div>
              </div>
            </motion.div>

          </motion.div>

          {/* ── 3-Column Minor Feature Icons Row ── */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerVariants}
            className="mt-10 sm:mt-16 grid gap-6 sm:gap-8 border-t border-zinc-100 pt-8 sm:pt-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 dark:border-zinc-900"
          >
            <motion.div variants={itemVariants}>
              <Zap className="size-5 text-blue-500" />
              <h4 className="mt-3 font-bold text-zinc-950 text-sm dark:text-white">Lightning-fast deployments</h4>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Push to production in seconds. Our CI/CD pipeline handles builds, tests, and rollbacks automatically.
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <BarChart className="size-5 text-blue-500" />
              <h4 className="mt-3 font-bold text-zinc-950 text-sm dark:text-white">Built-in analytics</h4>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Track user behavior, monitor performance, and gain actionable insights without third-party tools.
              </p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Puzzle className="size-5 text-blue-500" />
              <h4 className="mt-3 font-bold text-zinc-950 text-sm dark:text-white">Seamless integrations</h4>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Connect with your existing stack. Slack, GitHub, Jira, and 100+ integrations out of the box.
              </p>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ── Loved by thousands of happy customers (Testimonials) ── */}
      <section className="border-t border-zinc-100 py-20 md:py-28 bg-zinc-50/30 dark:border-zinc-900 dark:bg-zinc-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
              Loved by thousands of happy customers
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Hear from our community of builders, designers, and creators who trust us to power their projects.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={itemVariants}
            className="mt-8 sm:mt-16 w-full relative"
          >
            <div className="w-full pb-6">
              <InfiniteMovingCards
                items={testimonials.map((t, i) => ({
                  id: `top-${i}`,
                  title: t.quote,
                  description: t.body,
                  name: t.author,
                  role: t.role,
                  rating: 5,
                }))}
                direction="left"
                speed="normal"
                pauseOnHover={true}
                cardClassName="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 w-[320px] max-w-full"
              />
            </div>
            <div className="w-full">
              <InfiniteMovingCards
                items={[...testimonials].reverse().map((t, i) => ({
                  id: `bottom-${i}`,
                  title: t.quote,
                  description: t.body,
                  name: t.author,
                  role: t.role,
                  rating: 5,
                }))}
                direction="right"
                speed="slow"
                pauseOnHover={true}
                cardClassName="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 w-[320px] max-w-full"
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── Secondary Platform / Device Array Matrix ── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Your AI agents work seamlessly on mobile, desktop, and tablet. Monitor and orchestrate from anywhere.
            </h2>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerVariants}
            className="mt-16 w-full flex flex-col items-center"
          >
            {/* Animated SVG Path connecting devices */}
            <div className="relative w-full h-24 hidden md:block max-w-4xl opacity-50 dark:opacity-30">
              <svg viewBox="0 0 1000 100" className="w-full h-full overflow-visible" fill="none" preserveAspectRatio="none">
                <path d="M100,80 Q250,20 500,50 T900,80" stroke="currentColor" strokeWidth="1" className="text-zinc-400 dark:text-zinc-600" strokeDasharray="4 4" />
                <motion.path 
                  d="M100,80 Q250,20 500,50 T900,80" 
                  stroke="url(#gradient)" 
                  strokeWidth="3" 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <circle cx="100" cy="80" r="4" fill="#3b82f6" />
                <circle cx="500" cy="50" r="4" fill="#3b82f6" />
                <circle cx="900" cy="80" r="4" fill="#3b82f6" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Device Mockups Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 w-full max-w-5xl gap-12 mt-8 md:-mt-4">
              
              {/* Mobile Mockup */}
              <motion.div variants={itemVariants} className="flex flex-col items-center group cursor-pointer">
                <div className="w-28 h-56 rounded-[2rem] border-[6px] border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 relative shadow-sm flex items-start justify-center transition-transform group-hover:-translate-y-2 duration-500">
                  <div className="w-10 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-b-xl absolute top-0"></div>
                  <div className="absolute inset-2 rounded-[1.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:8px_8px]" />
                  </div>
                </div>
                <h4 className="mt-8 font-bold text-zinc-950 text-sm dark:text-white">Agents in your pocket</h4>
                <p className="mt-2 text-xs text-zinc-500 text-center max-w-[200px]">Monitor workflows and receive real-time alerts on the go.</p>
              </motion.div>

              {/* Laptop Mockup (Animated 3D MacBook) */}
              <AnimatedLaptopMockup />

              {/* Tablet Mockup */}
              <motion.div variants={itemVariants} className="flex flex-col items-center group cursor-pointer">
                <div className="w-52 h-36 rounded-[1.5rem] border-[6px] border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 relative shadow-sm flex items-center justify-center mt-8 md:mt-2 transition-transform group-hover:-translate-y-2 duration-500">
                  <div className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full absolute right-2"></div>
                  <div className="absolute inset-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden">
                    <div className="size-14 rounded-full overflow-hidden border-2 border-white shadow-md z-10 relative">
                      <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                    </div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:12px_12px]" />
                  </div>
                </div>
                <h4 className="mt-8 font-bold text-zinc-950 text-sm dark:text-white">Orchestrate from anywhere</h4>
                <p className="mt-2 text-xs text-zinc-500 text-center max-w-[200px]">Manage complex workflows with touch-friendly dashboards.</p>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* ── Simple, Transparent Pricing ── */}
      <section id="pricing" className="border-t border-zinc-100 py-20 md:py-28 bg-zinc-50/40 dark:border-zinc-900 dark:bg-zinc-950/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Choose a plan that works best for you and your team. No hidden fees.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerVariants}
            className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3"
          >
            
            {/* Starter Plan */}
            <motion.div variants={itemVariants} className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm flex flex-col justify-between dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">Starter</h3>
                <p className="mt-1 text-xs text-zinc-500">Perfect for exploring AI agent capabilities</p>
                <p className="mt-6 text-4xl font-extrabold text-zinc-950 dark:text-white">$0</p>
                
                <ul className="mt-8 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-500" /> <span>5 active agents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-500" /> <span>Standard tool library</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-500" /> <span>Community Discord support</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => alert("Starter plan selected. Ready for immediate deployment.")}
                className="mt-8 w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Get Started
              </button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div variants={itemVariants} className="rounded-3xl border-2 border-blue-500 bg-white p-8 shadow-xl relative flex flex-col justify-between dark:bg-zinc-900">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 px-3 py-0.5 text-[10px] font-bold uppercase text-white tracking-wider">
                Popular
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">Pro</h3>
                <p className="mt-1 text-xs text-zinc-500">For teams automating complex workflows</p>
                <p className="mt-6 text-4xl font-extrabold text-zinc-950 dark:text-white">$49<span className="text-xs font-normal text-zinc-400">/mo</span></p>
                
                <ul className="mt-8 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-500" /> <span className="font-semibold text-zinc-950 dark:text-white">Unlimited agents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-500" /> <span>Advanced real-time sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-500" /> <span>Priority event loops</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-500" /> <span>Private webhook integrations</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => alert("Navigating to secure Pro Checkout profile.")}
                className="mt-8 w-full rounded-full bg-blue-500 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-blue-600"
              >
                Start Pro Access
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div variants={itemVariants} className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm flex flex-col justify-between dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">Enterprise</h3>
                <p className="mt-1 text-xs text-zinc-500">For organizations that need full autonomy</p>
                <p className="mt-6 text-4xl font-extrabold text-zinc-950 dark:text-white">Custom</p>
                
                <ul className="mt-8 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-500" /> <span>Dedicated edge clusters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-500" /> <span>SOC2 audit assistance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-blue-500" /> <span>Custom platform SLAs</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => alert("Initiating enterprise consulting schedule mapping.")}
                className="mt-8 w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Contact Sales
              </button>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* ── Frequently Asked Questions ── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Everything you need to know about deploying AI agents and automating your workflows.
            </p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerVariants}
            className="mt-12 space-y-4"
          >
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <motion.div
                  variants={itemVariants}
                  key={i}
                  className="rounded-2xl border border-zinc-200/80 bg-zinc-50/30 overflow-hidden transition dark:border-zinc-800 dark:bg-zinc-900/30"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-zinc-950 transition hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={cn("size-4 text-zinc-400 transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 pt-3 dark:border-zinc-800/50">
                      {faq.a}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* ── Start building autonomous workflows today (CTA Footer Strip) ── */}
      <section className="border-t border-zinc-100 py-20 bg-gradient-to-b from-zinc-50/50 to-white text-center dark:border-zinc-900 dark:from-zinc-950 dark:to-zinc-900/40">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={itemVariants}
          className="mx-auto max-w-4xl px-4"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Start building autonomous workflows today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Build, deploy, and orchestrate intelligent AI agents that automate complex workflows, make decisions, and execute tasks autonomously.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-600"
            >
              <span>Get Started Now</span>
              <ArrowRight className="size-4" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Footer Columns ── */}
      <footer className="border-t border-zinc-100 bg-white py-12 dark:border-zinc-900 dark:bg-zinc-950 text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-5">
            
            {/* Branding Column */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-lg bg-zinc-950 text-white font-bold text-xs dark:bg-white dark:text-zinc-950">
                  𝝠
                </div>
                <span className="font-bold text-zinc-950 dark:text-white">Simplistic</span>
              </div>
              <p className="max-w-xs text-[11px] text-zinc-400">
                Next-generation state mechanics tooling powering scalable autonomous operations out of the box.
              </p>
              <p className="text-[10px] text-zinc-400 pt-4">
                © {new Date().getFullYear()} Simplistic UI Systems Inc. All rights reserved.
              </p>
            </div>

            {/* Pages Column */}
            <div className="space-y-2">
              <p className="font-bold text-zinc-950 dark:text-white">Pages</p>
              <a href="#product" className="block hover:underline">Products</a>
              <a href="#features" className="block hover:underline">Features</a>
              <a href="#pricing" className="block hover:underline">Integrations</a>
              <a href="#pricing" className="block hover:underline">Pricing</a>
              <a href="#blog" className="block hover:underline">Blog</a>
            </div>

            {/* Socials Column */}
            <div className="space-y-2">
              <p className="font-bold text-zinc-950 dark:text-white">Socials</p>
              <a href="#twitter" className="block hover:underline">Twitter</a>
              <a href="#linkedin" className="block hover:underline">LinkedIn</a>
              <a href="#github" className="block hover:underline">GitHub</a>
              <a href="#discord" className="block hover:underline">Discord</a>
            </div>

            {/* Legal Column */}
            <div className="space-y-2">
              <p className="font-bold text-zinc-950 dark:text-white">Legal</p>
              <a href="#privacy" className="block hover:underline">Privacy Policy</a>
              <a href="#terms" className="block hover:underline">Terms of Service</a>
              <a href="#cookie" className="block hover:underline">Cookie Policy</a>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
