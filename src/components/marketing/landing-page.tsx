"use client";

import * as React from "react";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Cpu,
  Globe,
  Layers,
  LayoutGrid,
  Palette,
  ShieldCheck,
  Sparkles as SparklesIcon,
  Zap,
} from "lucide-react";
import type { LibraryComponent } from "@/lib/catalog/library-components";
import { blocksManifest } from "@/lib/catalog/blocks-manifest";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InfiniteMovingCards } from "@/components/infinite-moving-cards/InfiniteMovingCards";
import { EncryptedText } from "@/components/encrypted-text";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

const BLOCK_CATEGORY_LINKS = (() => {
  const seen = new Set<string>();
  const rows: { category: string; slug: string }[] = [];
  for (const b of blocksManifest) {
    if (seen.has(b.category)) continue;
    seen.add(b.category);
    rows.push({ category: b.category, slug: b.slug });
  }
  return rows;
})();

const TECH_ITEMS = [
  { id: 0, title: "Next.js App Router" },
  { id: 1, title: "Tailwind CSS v4" },
  { id: 2, title: "Framer Motion" },
  { id: 3, title: "shadcn/ui" },
  { id: 4, title: "TypeScript" },
  { id: 5, title: "React 19" },
  { id: 6, title: "Supabase" },
  { id: 7, title: "Stripe" },
  { id: 8, title: "Server Components" },
  { id: 9, title: "Radix UI" },
];

const TESTIMONIALS = [
  {
    id: "t1",
    description: "We replaced three internal libraries with Nexus-UI patterns. Velocity is noticeably higher.",
    name: "Sarah Chen",
    role: "Director of Design · Fintech",
    rating: 5,
  },
  {
    id: "t2",
    description: "The previews are real implementations, not GIFs. That sold our engineering team immediately.",
    name: "Marcus R.",
    role: "CTO · AI Infrastructure",
    rating: 5,
  },
  {
    id: "t3",
    description: "Our marketing site finally matches the polish of the product — without a dedicated motion engineer.",
    name: "Priya S.",
    role: "VP Engineering · B2B SaaS",
    rating: 5,
  },
  {
    id: "t4",
    description: "Copy-pasting from Nexus-UI and it just works. Tokens, responsive breakpoints, dark mode — all there.",
    name: "Alex Kim",
    role: "Senior Frontend Engineer",
    rating: 5,
  },
  {
    id: "t5",
    description: "The bento and hero blocks saved our design team two weeks on the rebrand. Incredible quality.",
    name: "Jordan M.",
    role: "Product Designer · Series A",
    rating: 5,
  },
  {
    id: "t6",
    description: "Template scenes are real App Router implementations. We shipped a full SaaS template in a week.",
    name: "Dev T.",
    role: "Indie Hacker",
    rating: 5,
  },
];

const TRUSTED_BY = [
  "Streamline", "Meridian Labs", "Orbital", "Flux", "Catalyst", "Prism Co",
];

// ── Utilities ──────────────────────────────────────────────────────────────────

function ViewportFade({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        align === "left" && "md:flex-row md:flex-wrap md:items-end md:justify-between",
      )}
    >
      <div className={cn("max-w-2xl space-y-2", align === "center" && "mx-auto")}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className={cn("shrink-0", align === "center" && "mt-2")}>{action}</div>
      )}
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero() {
  const reduce = useReducedMotion() === true;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(900px circle at ${mouseX}px ${mouseY}px, oklch(0.72 0.18 195 / 0.10), transparent 52%)`;

  return (
    <section
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - r.left);
        mouseY.set(e.clientY - r.top);
      }}
      className="relative isolate flex min-h-[90dvh] flex-col items-center justify-center overflow-hidden border-b border-border px-4 py-24 text-center md:py-32"
    >
      {/* Layered backgrounds */}
      <div className="lf-aurora absolute inset-0 opacity-55 dark:opacity-45" />
      <div className="lf-grid absolute inset-0 opacity-[0.18] dark:opacity-[0.22]" />
      {!reduce && (
        <motion.div className="pointer-events-none absolute inset-0" style={{ backgroundImage: spotlight }} />
      )}

      {/* Accent lines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -left-40 top-1/4 size-96 rounded-full bg-foreground/[0.04] blur-[96px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 size-96 rounded-full bg-foreground/[0.04] blur-[96px]" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-8">
        {/* Badge */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -10, scale: 0.94 }}
          animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex"
        >
          <Badge className="gap-1.5 border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
            <SparklesIcon className="size-3.5 shrink-0" />
            <EncryptedText
              text="Motion-native component marketplace"
              trigger="load"
              speed={28}
              shuffleSpeed={18}
              iterations={6}
              className="text-sm"
            />
          </Badge>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          className="text-balance text-[2.6rem] font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4.5rem]"
        >
          Build luminous interfaces{" "}
          <br className="hidden sm:block" />
          <EncryptedText
            text="without limits."
            trigger="load"
            speed={60}
            shuffleSpeed={30}
            iterations={10}
            revealDelay={300}
            className="text-foreground"
          />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
          className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          A developer-first catalog of animated components, templates, and blocks — engineered for
          Next.js, Tailwind CSS, and production-grade SaaS experiences you can copy, tune, and ship.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
          className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <MotionLink
            href="/components"
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-background shadow-lg shadow-primary/15 ring-1 ring-foreground/10 transition-shadow hover:shadow-xl hover:shadow-primary/20"
          >
            Browse library <ArrowRight className="size-4" />
          </MotionLink>
          <MotionLink
            href="/templates"
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-full border-border/70 bg-background/60 px-8 py-3.5 text-foreground backdrop-blur-xl hover:bg-accent dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
            )}
          >
            Explore templates
          </MotionLink>
        </motion.div>

        {/* Trust pills */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ delay: 0.36, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          {[
            { icon: Zap, label: "Copy-ready TypeScript" },
            { icon: Layers, label: "Blocks + layouts" },
            { icon: Cpu, label: "Supabase & Stripe ready" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Icon className="size-3.5 shrink-0 text-primary" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Product Mockup ─────────────────────────────────────────────────────────────

function ProductMockup() {
  const reduce = useReducedMotion() === true;

  const SIDEBAR_ITEMS = ["Overview", "Components", "Templates", "Blocks", "Analytics", "Settings"];
  const STATS = [
    { label: "Components", value: "240+" },
    { label: "Templates", value: "18" },
    { label: "Downloads", value: "14k" },
    { label: "Stars", value: "3.8k" },
  ];
  const BAR_HEIGHTS = [0.38, 0.62, 0.48, 0.82, 0.55, 0.92, 0.70, 0.45, 0.78, 0.60];

  return (
    <section className="relative overflow-hidden pb-0 pt-16 md:pt-20">
      {/* Fade-out at bottom so it bleeds into next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-background to-transparent" />

      <div className="mx-auto max-w-5xl px-4">
        <ViewportFade>
          <div className="relative">
            {/* Outer glow halo */}
            <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl dark:from-white/8 dark:via-white/3" />

            {/* Browser chrome */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="lf-glow relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl dark:border-white/[0.08] dark:bg-zinc-900/80"
            >
              {/* Top bar */}
              <div className="flex h-10 items-center gap-3 border-b border-border/40 bg-muted/30 px-4 dark:bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400/60" />
                  <span className="size-2.5 rounded-full bg-yellow-400/60" />
                  <span className="size-2.5 rounded-full bg-green-400/60" />
                </div>
                <div className="flex flex-1 justify-center">
                  <div className="flex w-52 items-center gap-2 rounded-md border border-border/40 bg-background/50 px-3 py-1 text-[11px] text-muted-foreground/60 dark:bg-white/[0.04]">
                    <span className="shrink-0 text-muted-foreground/40">🔒</span>
                    nexus-ui.com/components
                  </div>
                </div>
              </div>

              {/* App shell */}
              <div className="flex h-[340px] overflow-hidden sm:h-[420px] lg:h-[480px]">

                {/* Sidebar */}
                <div className="hidden w-44 shrink-0 border-r border-border/30 bg-background/25 p-3 sm:block dark:bg-black/20">
                  <div className="mb-4 flex items-center gap-2 px-2 py-1">
                    <span className="size-4 rounded-md bg-primary/25 dark:bg-white/20" />
                    <span className="text-[11px] font-semibold text-foreground/80">Nexus-UI</span>
                  </div>
                  <nav className="space-y-0.5">
                    {SIDEBAR_ITEMS.map((item, i) => (
                      <div
                        key={item}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                          i === 0
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground/60",
                        )}
                      >
                        {item}
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-hidden bg-background/10 p-4 dark:bg-black/10">
                  {/* Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-foreground">Component Library</p>
                    <div className="flex gap-2">
                      <div className="h-6 w-20 rounded-md border border-border/40 bg-muted/40" />
                      <div className="h-6 w-16 rounded-md bg-primary/15 dark:bg-white/10" />
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {STATS.map((s, i) => (
                      <div
                        key={s.label}
                        className={cn(
                          "rounded-xl border border-border/30 bg-background/50 p-2.5 dark:bg-white/[0.025]",
                          i >= 2 && "hidden sm:block",
                        )}
                      >
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50">{s.label}</p>
                        <p className="mt-0.5 text-sm font-bold text-foreground">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart + list row */}
                  <div className="mb-4 flex gap-3">
                    {/* Bar chart */}
                    <div className="flex-1 rounded-xl border border-border/30 bg-background/40 p-3 dark:bg-white/[0.02]">
                      <p className="mb-2 text-[10px] font-medium text-muted-foreground/60">Usage trend</p>
                      <div className="flex h-14 items-end gap-1">
                        {BAR_HEIGHTS.map((h, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 rounded-sm bg-primary/25 dark:bg-white/15"
                            style={{ height: `${h * 100}%` }}
                            animate={reduce ? undefined : { scaleY: [1, 1.05, 1] }}
                            transition={{
                              repeat: Infinity,
                              duration: 2 + i * 0.2,
                              ease: "easeInOut",
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Recent list */}
                    <div className="hidden w-40 rounded-xl border border-border/30 bg-background/40 p-3 dark:bg-white/[0.02] lg:block">
                      <p className="mb-2 text-[10px] font-medium text-muted-foreground/60">Recent</p>
                      <div className="space-y-2">
                        {["Starfield Hero", "Compare Slider", "Expandable Cards", "Dot Grid"].map((name) => (
                          <div key={name} className="flex items-center gap-2">
                            <span className="size-1.5 shrink-0 rounded-full bg-primary/50 dark:bg-white/30" />
                            <span className="truncate text-[10.5px] text-muted-foreground/70">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Component thumbnail grid */}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] overflow-hidden rounded-lg border border-border/25 bg-muted/30 dark:bg-white/[0.02]"
                      >
                        <div className="h-3/4 bg-gradient-to-br from-muted/50 to-transparent dark:from-white/[0.03] dark:to-transparent" />
                        <div className="space-y-1 p-1.5">
                          <div className="h-1 w-3/4 rounded-full bg-muted-foreground/15" />
                          <div className="h-0.5 w-1/2 rounded-full bg-muted-foreground/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </ViewportFade>
      </div>
    </section>
  );
}

// ── Trusted By ─────────────────────────────────────────────────────────────────

function TrustedBy() {
  const reduce = useReducedMotion() === true;
  return (
    <section className="border-b border-border/50 py-14">
      <div className="mx-auto max-w-5xl px-4">
        <ViewportFade>
          <p className="mb-8 text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground/50">
            Trusted by product teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {TRUSTED_BY.map((brand, i) => (
              <motion.span
                key={brand}
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="text-[15px] font-semibold text-muted-foreground/30 transition-colors duration-200 hover:text-muted-foreground/60"
              >
                {brand}
              </motion.span>
            ))}
          </div>
        </ViewportFade>
      </div>
    </section>
  );
}

// ── Tech Marquee ───────────────────────────────────────────────────────────────

function TechMarquee() {
  return (
    <section className="border-b border-border bg-muted/20 py-5 dark:bg-zinc-950/50">
      <p className="mb-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
        Stack you already run
      </p>
      <InfiniteMovingCards
        items={TECH_ITEMS}
        direction="left"
        speed="slow"
        showGradientMask
        gap={10}
        renderItem={(item) => (
          <span className="inline-flex shrink-0 items-center rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm dark:bg-white/[0.04]">
            {item.title}
          </span>
        )}
      />
    </section>
  );
}

// ── Bento Features ─────────────────────────────────────────────────────────────

function BentoFeatures() {
  const reduce = useReducedMotion() === true;

  const features = [
    {
      title: "Copy-ready TypeScript",
      body: "Every component ships with full TypeScript types, dependency callouts, and install commands you can run directly.",
      icon: SparklesIcon,
      colSpan: "md:col-span-2",
      accent: "text-foreground",
      glow: "hover:border-primary/30 hover:shadow-primary/8",
      visual: (
        <div className="mt-5 space-y-1 rounded-xl border border-border/50 bg-black/10 p-4 text-left font-mono dark:bg-black/35">
          {[
            "import { Sparkles } from '@nexus-ui/react'",
            "// ✓ TypeScript types included",
            "// ✓ Framer Motion peer dep",
          ].map((line, i) => (
            <p key={i} className="text-[11px] text-muted-foreground">
              <span className="mr-1 text-muted-foreground/70">{i === 0 ? ">" : " "}</span>
              {line}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: "Motion system",
      body: "Spring-tuned interactions, scroll choreography, and reduced-motion fallbacks — out of the box.",
      icon: Zap,
      colSpan: "md:col-span-1",
      accent: "text-foreground",
      glow: "hover:border-primary/30 hover:shadow-primary/8",
      visual: (
        <div className="mt-5 flex h-10 items-end gap-1.5">
          {[0.35, 0.6, 0.85, 1, 0.7, 0.45, 0.6].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm bg-muted-foreground/35"
              style={{ height: `${h * 36}px` }}
              animate={reduce ? undefined : { scaleY: [1, h * 1.35, 1] }}
              transition={{
                repeat: Infinity,
                duration: 1.3 + i * 0.12,
                ease: "easeInOut",
                delay: i * 0.09,
              }}
            />
          ))}
        </div>
      ),
    },
    {
      title: "Performance aware",
      body: "Lazy previews, ISR-friendly patterns, SEO-first routing defaults, and Web Vitals respect built-in.",
      icon: Cpu,
      colSpan: "md:col-span-1",
      accent: "text-foreground",
      glow: "hover:border-primary/30 hover:shadow-primary/8",
      visual: (
        <div className="mt-5 grid grid-cols-2 gap-2">
          {[
            ["Perf", "99"],
            ["A11y", "96"],
            ["SEO", "100"],
            ["Best", "98"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-lg border border-border/40 bg-background/40 p-2 text-center dark:bg-black/20"
            >
              <p className="text-base font-bold text-foreground">{v}</p>
              <p className="text-[10px] text-muted-foreground">{k}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Dark mode & theming",
      body: "Semantic oklch tokens with a dark-mode-first palette. One line swap for full brand customisation.",
      icon: Palette,
      colSpan: "md:col-span-1",
      accent: "text-violet-500 dark:text-violet-400",
      glow: "hover:border-violet-500/25 dark:hover:border-violet-400/25 hover:shadow-violet-500/5",
      visual: (
        <div className="mt-5 flex items-center gap-1.5">
          {[
            "bg-zinc-950",
            "bg-zinc-800",
            "bg-zinc-600",
            "bg-zinc-400",
            "bg-zinc-200",
            "bg-violet-600",
            "bg-violet-400",
          ].map((cls) => (
            <span key={cls} className={cn("h-6 flex-1 rounded-md", cls)} />
          ))}
        </div>
      ),
    },
    {
      title: "Accessible by default",
      body: "ARIA roles, keyboard navigation, focus rings, and reduced-motion support in every component.",
      icon: ShieldCheck,
      colSpan: "md:col-span-1",
      accent: "text-emerald-500 dark:text-emerald-400",
      glow: "hover:border-emerald-500/25 dark:hover:border-emerald-400/25 hover:shadow-emerald-500/5",
      visual: (
        <div className="mt-5 space-y-2">
          {[
            { label: "WCAG AA", done: true },
            { label: "Keyboard nav", done: true },
            { label: "Screen reader", done: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[12px]">
              <Check className="size-3.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Marketplace rails included",
      body: "Stripe checkout, Supabase auth, and an admin dashboard so you can monetize a component library in hours, not months.",
      icon: Globe,
      colSpan: "md:col-span-2",
      accent: "text-amber-500 dark:text-amber-400",
      glow: "hover:border-amber-500/25 dark:hover:border-amber-400/25 hover:shadow-amber-500/5",
      visual: (
        <div className="mt-5 flex flex-wrap gap-2">
          {["Stripe Checkout", "Supabase Auth", "Webhook handlers", "Admin panel"].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/40 px-3 py-1 text-[11px] font-medium text-muted-foreground dark:bg-white/[0.03]"
            >
              <Check className="size-3 text-amber-500 dark:text-amber-400" />
              {item}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 md:py-28">
      <ViewportFade>
        <SectionHeader
          eyebrow="Why Nexus-UI"
          title="Opinionated defaults, zero rigid themes"
          description="Compose like a design system — ship like a product team. Every pattern drops into App Router projects with minimal ceremony."
        />
      </ViewportFade>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {features.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-56px" }}
            transition={{ delay: i * 0.07, duration: 0.5 }}
            className={feat.colSpan}
          >
            <div
              className={cn(
                "h-full rounded-3xl border border-border/60 bg-muted/35 p-7",
                "shadow-sm transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-xl dark:bg-white/[0.025]",
                feat.glow,
              )}
            >
              <feat.icon className={cn("size-5", feat.accent)} />
              <p className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                {feat.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feat.body}</p>
              {feat.visual}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Featured Components ────────────────────────────────────────────────────────

function FeaturedComponents() {
  const [items, setItems] = React.useState<LibraryComponent[] | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion() === true;

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        void import("@/lib/catalog/library-components").then((m) => {
          setItems(
            [...m.libraryComponents]
              .sort((a, b) => b.trendingScore - a.trendingScore)
              .slice(0, 6),
          );
        });
      },
      { root: null, rootMargin: "320px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="border-y border-border bg-muted/20 py-24 dark:bg-zinc-950/40 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <ViewportFade>
          <SectionHeader
            eyebrow="Featured"
            title="Components developers reach for first"
            description="Each entry is a real React implementation — inspect motion boundaries, copy patterns, and adapt tokens to your design system."
            action={
              <Link
                href="/components"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "inline-flex items-center gap-2 text-primary hover:text-foreground",
                )}
              >
                View all <ArrowRight className="size-4" />
              </Link>
            }
          />
        </ViewportFade>

        <div ref={rootRef} className="mt-12 grid min-h-[280px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {!items
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-full animate-pulse overflow-hidden rounded-2xl border border-border bg-muted/30 dark:bg-white/[0.04]"
                  aria-hidden
                >
                  <div className="h-40 bg-muted/60 dark:bg-white/[0.08]" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-2/3 rounded bg-muted dark:bg-white/[0.08]" />
                    <div className="h-3 w-full rounded bg-muted dark:bg-white/[0.06]" />
                  </div>
                </div>
              ))
            : items.map((c, i) => {
                const Preview = c.Preview;
                return (
                  <motion.div
                    key={c.slug}
                    initial={reduce ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-48px" }}
                    transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={reduce ? undefined : { y: -6 }}
                    className="h-full"
                  >
                    <Link href={`/components/${c.slug}`} className="group block h-full">
                      <Card className="h-full overflow-hidden border-border/70 bg-background/80 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 dark:bg-white/[0.03] dark:hover:border-primary/20 dark:hover:shadow-primary/5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-base font-semibold tracking-tight">
                              {c.name}
                            </CardTitle>
                            {c.premium ? (
                              <Badge className="border border-border/60 bg-muted/30 text-foreground">
                                Premium
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-border text-muted-foreground"
                              >
                                Free
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="relative overflow-hidden rounded-xl border border-border bg-muted ring-0 transition duration-300 group-hover:ring-2 group-hover:ring-primary/15 dark:bg-zinc-950">
                            <div className="origin-top scale-[0.92]">
                              <Preview />
                            </div>
                          </div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            {c.description}
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                            Open detail <ArrowRight className="size-3" />
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ───────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const mid = Math.ceil(TESTIMONIALS.length / 2);
  const row1 = TESTIMONIALS.slice(0, mid);
  const row2 = TESTIMONIALS.slice(mid);

  return (
    <section className="overflow-hidden py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <ViewportFade>
          <SectionHeader
            align="center"
            eyebrow="Social proof"
            title="Teams shipping with confidence"
            description="Built for design engineers who care about implementation fidelity — not screenshot culture."
          />
        </ViewportFade>
      </div>
      <div className="mt-12 space-y-4">
        <InfiniteMovingCards
          items={row1}
          direction="left"
          speed="slow"
          showGradientMask
          cardClassName="w-72 sm:w-80"
        />
        <InfiniteMovingCards
          items={row2}
          direction="right"
          speed="slow"
          showGradientMask
          cardClassName="w-72 sm:w-80"
        />
      </div>
    </section>
  );
}

// ── Blocks Discovery ───────────────────────────────────────────────────────────

function BlocksDiscovery() {
  const reduce = useReducedMotion() === true;
  return (
    <section className="border-y border-border bg-muted/25 py-24 dark:bg-zinc-950/40">
      <div className="mx-auto max-w-6xl px-4">
        <ViewportFade>
          <SectionHeader
            eyebrow="Blocks"
            title="Full sections — paste and choreograph"
            description="Marketing-grade blocks with motion variants, tuned for accessibility and responsive density."
            action={
              <Link
                href="/blocks"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "inline-flex items-center gap-2 text-primary hover:text-foreground",
                )}
              >
                All blocks <ArrowRight className="size-4" />
              </Link>
            }
          />
        </ViewportFade>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCK_CATEGORY_LINKS.map((row, i) => (
            <motion.div
              key={row.category}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05 }}
              whileHover={reduce ? undefined : { y: -4 }}
            >
              <Link
                href={`/blocks/${row.slug}`}
                className="lf-glass group flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <LayoutGrid className="size-5 text-primary" />
                  <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" />
                </div>
                <p className="mt-5 text-base font-semibold text-foreground">{row.category}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Reference implementation with motion variants.
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing Preview ────────────────────────────────────────────────────────────

function PricingPreview() {
  return (
    <section className="py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <ViewportFade>
          <SectionHeader
            align="center"
            eyebrow="Pricing"
            title="Free to explore. Premium to ship everywhere."
            description="Start with curated free components, then unlock templates, blocks, and commercial licensing when you're ready."
            action={
              <Link
                href="/pricing"
                className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-border")}
              >
                Compare plans
              </Link>
            }
          />
        </ViewportFade>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <Card className="border-border/70 bg-muted/35 dark:bg-white/[0.025]">
            <CardHeader>
              <CardTitle className="text-xl">Starter</CardTitle>
              <p className="text-sm text-muted-foreground">For side projects and evaluation.</p>
              <p className="mt-3 text-4xl font-bold text-foreground">$0</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <PricingRow>Curated free components</PricingRow>
              <PricingRow>Limited templates</PricingRow>
              <PricingRow>Community updates</PricingRow>
              <Link
                href="/components"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-4 w-full rounded-full",
                )}
              >
                Browse free
              </Link>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/60 bg-muted/20">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-foreground/[0.03] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 size-40 rounded-full bg-foreground/[0.03] blur-2xl" />
            <CardHeader className="relative">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Premium</CardTitle>
                <Badge className="border-primary/40 bg-primary/12 text-primary">Popular</Badge>
              </div>
              <p className="text-sm text-muted-foreground dark:text-foreground/65">
                Everything unlocked — lifetime updates.
              </p>
              <p className="mt-3 text-4xl font-bold text-foreground">$290</p>
            </CardHeader>
            <CardContent className="relative space-y-3 text-sm text-foreground/90">
              <PricingRow>All templates & blocks</PricingRow>
              <PricingRow>Premium motion components</PricingRow>
              <PricingRow>Commercial license</PricingRow>
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants(),
                  "mt-4 w-full rounded-full bg-foreground text-background hover:bg-foreground/90",
                )}
              >
                Get premium
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function PricingRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="size-4 shrink-0 text-primary" />
      <span>{children}</span>
    </div>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────────

function Faq() {
  return (
    <section className="border-t border-border bg-muted/15 py-24 dark:bg-zinc-950/30 md:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <ViewportFade className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need to decide
          </h2>
        </ViewportFade>
        <Accordion className="mt-10 w-full" defaultValue={["item-0"]}>
          {[
            {
              q: "Can I use Nexus-UI in client projects?",
              a: "Premium includes a commercial license for unlimited client work while your subscription or lifetime pass is active.",
            },
            {
              q: "Do components work with the Next.js App Router?",
              a: "Yes. All examples use the App Router, Server Components where appropriate, and client directives only around motion boundaries.",
            },
            {
              q: "How do updates work?",
              a: "Premium includes future component drops and template revisions. A changelog ships with every release.",
            },
          ].map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`item-${i}`}
              className="border-border/60"
            >
              <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// ── CTA Footer ─────────────────────────────────────────────────────────────────

function CtaFooter() {
  const reduce = useReducedMotion() === true;
  return (
    <section className="relative overflow-hidden border-t border-border py-28 md:py-36">
      <div className="lf-aurora pointer-events-none absolute inset-0 opacity-55 dark:opacity-38" />
      <div className="lf-grid pointer-events-none absolute inset-0 opacity-[0.14]" />

      {/* Orbs */}
      <div className="pointer-events-none absolute left-1/4 top-0 size-80 -translate-x-1/2 rounded-full bg-foreground/[0.03] blur-[80px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 size-80 translate-x-1/2 rounded-full bg-foreground/[0.03] blur-[80px]" />

      {/* Glowing border accent at top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <motion.div
        className="relative mx-auto max-w-3xl px-4 text-center"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.62 }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-primary">
          Get building
        </p>
        <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]">
          Ready to ship something{" "}
          <span className="text-foreground">unforgettable?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
          Join teams shipping cinematic interfaces — premium templates, blocks, and motion
          primitives in one place.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <MotionLink
            href="/pricing"
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            className={cn(
              buttonVariants(),
              "rounded-full border-transparent bg-foreground px-9 py-3.5 text-sm font-semibold text-background shadow-lg hover:bg-foreground/90",
            )}
          >
            Upgrade to premium
          </MotionLink>
          <MotionLink
            href="/login"
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-full border-border/70 px-9 py-3.5",
            )}
          >
            Create account
          </MotionLink>
        </div>

        {/* Social proof micro-stat */}
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-[12px] text-muted-foreground/50"
        >
          Trusted by 2,400+ developers worldwide · No credit card required
        </motion.p>
      </motion.div>
    </section>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div>
      <Hero />
      <ProductMockup />
      <TrustedBy />
      <TechMarquee />
      <BentoFeatures />
      <FeaturedComponents />
      <TestimonialsSection />
      <BlocksDiscovery />
      <PricingPreview />
      <Faq />
      <CtaFooter />
    </div>
  );
}
