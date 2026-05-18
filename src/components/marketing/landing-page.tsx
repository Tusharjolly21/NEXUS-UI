"use client";

import * as React from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import {
  ArrowRight,
  ChevronDown,
  Cpu,
  Layers,
  MousePointer2,
  Sparkles as SparklesIcon,
  Zap,
} from "lucide-react";
import type { LibraryComponent } from "@/lib/catalog/library-components";
import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParticleNoise } from "@/components/particle-noise";
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

const STUDENT_LOGO_CLOUD = [
  {
    name: "OpenAI",
    text: true,
    className:
      "font-sans font-semibold tracking-tight text-zinc-900 dark:text-white",
  },
  {
    name: "granola",
    text: true,
    className: "font-sans font-bold tracking-tighter",
  },
  {
    name: "character.ai",
    text: true,
    className: "font-bold tracking-tighter lowercase",
  },
  { name: "Vercel", slug: "vercel", invertDark: true },
  { name: "Stripe", slug: "stripe" },
  { name: "Linear", slug: "linear", invertDark: true },
  { name: "GitHub", slug: "github", invertDark: true },
  { name: "Notion", slug: "notion", invertDark: true },
];

const TESTIMONIAL_WALL = [
  {
    id: "w1",
    name: "Maya Chen",
    handle: "@mayacodes",
    text: "Nexus UI feels like having a motion designer sitting inside our component library.",
    accent: "MC",
  },
  {
    id: "w2",
    name: "Ishan Rao",
    handle: "@ishanbuilds",
    text: "The template previews are the rare kind of polished that engineers can still understand and edit.",
    accent: "IR",
  },
  {
    id: "w3",
    name: "Nora Vale",
    handle: "@norav",
    text: "We shipped a launch page with animated cards, inputs, and backgrounds in one afternoon.",
    accent: "NV",
  },
  {
    id: "w4",
    name: "Leo Martin",
    handle: "@leom",
    text: "Copy-paste ownership plus tasteful motion. That combination is weirdly hard to find.",
    accent: "LM",
  },
  {
    id: "w5",
    name: "Priya Shah",
    handle: "@priyaui",
    text: "The blocks feel premium without turning the codebase into a mystery box.",
    accent: "PS",
  },
  {
    id: "w6",
    name: "Evan Brooks",
    handle: "@evanb",
    text: "Nexus UI became our shortcut for demos that need to feel real, not like wireframes.",
    accent: "EB",
  },
  {
    id: "w7",
    name: "Ari Kim",
    handle: "@arikim",
    text: "The animated inputs and chat components made our onboarding flow feel instantly more alive.",
    accent: "AK",
  },
  {
    id: "w8",
    name: "Sam Rivera",
    handle: "@samships",
    text: "I keep finding little interaction details that save me from hand-rolling another motion pattern.",
    accent: "SR",
  },
  {
    id: "w9",
    name: "Tara Singh",
    handle: "@taras",
    text: "The dark theme, borders, and glow language line up beautifully with modern SaaS products.",
    accent: "TS",
  },
];

const FEATURED_CAROUSEL_SLUGS = [
  "terminal",
  "infinite-moving-cards",
  "starfield-hero",
  "phone-input",
  "circular-carousel",
  "shader-flow",
];

// ── Utilities ──────────────────────────────────────────────────────────────────

function useLandingLenis() {
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let lenis: { raf: (time: number) => void; destroy: () => void } | null =
      null;

    void import("@studio-freight/lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.18,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 0.82,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };

      rafId = requestAnimationFrame(raf);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);
}

function ScrollProgress() {
  const reduce = useReducedMotion() === true;
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.35,
  });

  if (reduce) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-3 top-1/2 z-50 hidden h-28 w-px -translate-y-1/2 overflow-hidden rounded-full bg-border/60 md:block"
    >
      <motion.div
        className="h-full origin-top rounded-full bg-gradient-to-b from-primary via-cyan-400 to-violet-400"
        style={{ scaleY }}
      />
    </div>
  );
}

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
        align === "left" &&
          "md:flex-row md:flex-wrap md:items-end md:justify-between",
      )}
    >
      <div
        className={cn("max-w-2xl space-y-2", align === "center" && "mx-auto")}
      >
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
        <div className={cn("shrink-0", align === "center" && "mt-2")}>
          {action}
        </div>
      )}
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero() {
  const reduce = useReducedMotion() === true;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  const isDark = !mounted || resolvedTheme !== "light";

  return (
    <section className="relative isolate flex min-h-[78dvh] flex-col items-center justify-center overflow-hidden border-b border-border bg-[#f7fbff] px-4 py-20 text-center dark:bg-black md:py-28">
      {/* Particle Noise — light mode: animate only when theme is light */}
      <ParticleNoise
        positionX={0}
        positionY={0.45}
        zoom={0.9}
        spacing={18}
        inflation={58}
        particleSize={1.5}
        density={0.95}
        animationEnabled={!isDark}
        speed="medium"
        backgroundColor="transparent"
        dotColor="#1e293b"
        secondaryDotColor="#475569"
        opacity={0.72}
        blur={0}
        surfaceBias={0.82}
        gridJitter={0}
        className="absolute inset-0 h-full min-h-full dark:hidden"
      />
      {/* Particle Noise — dark mode: animate only when theme is dark */}
      <ParticleNoise
        positionX={0}
        positionY={0.45}
        zoom={0.9}
        spacing={18}
        inflation={58}
        particleSize={1.5}
        density={0.95}
        animationEnabled={isDark}
        speed="medium"
        backgroundColor="#000000"
        dotColor="#f8fafc"
        secondaryDotColor="#94a3b8"
        opacity={0.86}
        blur={0}
        surfaceBias={0.82}
        gridJitter={0}
        className="absolute inset-0 hidden h-full min-h-full dark:block"
      />

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
          Build luminous interfaces <br className="hidden sm:block" />
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
          A developer-first catalog of animated components, templates, and
          blocks — engineered for Next.js, Tailwind CSS, and production-grade
          SaaS experiences you can copy, tune, and ship.
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
              "rounded-full border-border/70 bg-background/60 px-8 py-3.5 text-foreground backdrop-blur-xl hover:bg-accent",
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

      {/* Scroll indicator */}
      {!reduce && (
        <motion.button
          type="button"
          aria-label="Scroll to explore"
          onClick={() => {
            document
              .getElementById("nexus-below-fold")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="size-6" />
          </motion.div>
        </motion.button>
      )}
    </section>
  );
}

function TrustedBy() {
  return (
    <section className="border-b border-border/50 bg-zinc-50/70 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <CinematicLogoCloud
            clients={STUDENT_LOGO_CLOUD}
            eyebrow="Used by students working with"
            description="Modern frontend tools, design systems, and deployment workflows."
            className="bg-transparent py-10 dark:bg-transparent md:py-12"
          />
        </div>
      </div>
    </section>
  );
}

function NexusMosaicSection() {
  const reduce = useReducedMotion() === true;
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-16 md:py-20">
      <div className="lf-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[0.52fr_1.48fr] lg:items-center">
        <ViewportFade>
          <div className="max-w-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              From idea to interface
            </p>
            <h2 className="mt-4 text-balance text-4xl font-bold leading-[0.98] tracking-tight text-foreground md:text-5xl">
              Build polished pages in hours,{" "}
              <span className="text-primary">not days.</span>
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
              A tighter Nexus UI canvas with forms, product previews, animated
              background cards, and chat states moving together like a finished
              interface.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Live cursor", "Motion cards", "Theme aware"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm dark:bg-white/[0.03]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </ViewportFade>

        <ViewportFade delay={0.08}>
          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-background/80 p-3 shadow-[0_35px_120px_-70px_rgba(15,23,42,0.65)] backdrop-blur dark:bg-white/[0.025]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:112px_112px] opacity-35" />
            <motion.div
              aria-hidden
              className="absolute -left-24 top-10 h-56 w-80 rounded-full bg-primary/15 blur-3xl"
              animate={
                reduce
                  ? undefined
                  : { x: [0, 120, 0], opacity: [0.35, 0.65, 0.35] }
              }
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="absolute -bottom-24 right-10 h-64 w-96 rounded-full bg-foreground/8 blur-3xl"
              animate={
                reduce
                  ? undefined
                  : { x: [0, -80, 0], opacity: [0.25, 0.5, 0.25] }
              }
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            {!reduce && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute z-30"
                animate={{
                  x: [78, 490, 610, 320, 78],
                  y: [92, 76, 334, 405, 92],
                }}
                transition={{
                  duration: 9.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <MousePointer2 className="size-6 fill-primary text-primary drop-shadow-[0_8px_18px_rgba(34,211,238,0.35)]" />
                <div className="ml-5 mt-1 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm backdrop-blur">
                  live preview
                </div>
              </motion.div>
            )}

            <div className="relative hidden h-[510px] lg:block">
              <MosaicPanel className="left-0 top-0 h-full w-[31%]" delay={0.02}>
                <SignupMini />
              </MosaicPanel>
              <MosaicPanel
                className="right-0 top-0 h-[58%] w-[66%]"
                delay={0.08}
                featured
              >
                <BrowserTemplateMini />
              </MosaicPanel>
              <MosaicPanel
                className="left-[34%] bottom-0 h-[38%] w-[29%]"
                delay={0.14}
              >
                <GlobeMini />
              </MosaicPanel>
              <MosaicPanel
                className="right-0 bottom-0 h-[38%] w-[34%]"
                delay={0.2}
              >
                <ChatMini />
              </MosaicPanel>
              <MosaicPanel
                className="left-[48%] top-[45%] h-[26%] w-[28%]"
                delay={0.26}
              >
                <TestimonialMini />
              </MosaicPanel>
            </div>

            <div className="relative grid gap-3 lg:hidden">
              <MosaicPanel
                className="relative inset-auto min-h-[390px]"
                delay={0.02}
              >
                <SignupMini />
              </MosaicPanel>
              <MosaicPanel
                className="relative inset-auto min-h-[245px]"
                delay={0.08}
                featured
              >
                <BrowserTemplateMini />
              </MosaicPanel>
              <div className="grid gap-3 sm:grid-cols-2">
                <MosaicPanel
                  className="relative inset-auto min-h-[190px]"
                  delay={0.14}
                >
                  <GlobeMini />
                </MosaicPanel>
                <MosaicPanel
                  className="relative inset-auto min-h-[190px]"
                  delay={0.2}
                >
                  <ChatMini />
                </MosaicPanel>
              </div>
            </div>
          </div>
        </ViewportFade>
      </div>
    </section>
  );
}

function MosaicPanel({
  children,
  className,
  delay,
  featured = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  featured?: boolean;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -5 }}
      className={cn(
        "absolute overflow-hidden rounded-[1.35rem] border border-border/70 bg-background shadow-xl shadow-foreground/5 dark:bg-zinc-950/80",
        featured && "shadow-[0_26px_70px_-36px_rgba(15,23,42,0.9)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function SignupMini() {
  return (
    <div className="flex h-full min-h-[390px] flex-col p-5">
      <div>
        <div className="mb-7 flex items-center gap-2 text-sm font-semibold text-foreground">
          <div className="grid size-7 place-items-center rounded-lg bg-foreground text-background">
            N
          </div>
          Nexus Studio
        </div>
        <h3 className="text-xl font-bold leading-tight tracking-tight text-foreground">
          Sign up for an account
        </h3>
        <div className="mt-6 space-y-4">
          {["Full name", "Email address", "Password"].map((label, i) => (
            <label key={label} className="block">
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
              <div className="mt-2 flex h-11 items-center rounded-lg border border-border bg-muted/25 px-3 text-sm text-muted-foreground">
                {i === 0
                  ? "Avery Stone"
                  : i === 1
                    ? "avery@nexus.dev"
                    : "••••••••"}
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="mt-auto space-y-3 pt-6">
        <button className="h-11 w-full rounded-full bg-foreground text-sm font-semibold text-background">
          Sign Up
        </button>
      </div>
    </div>
  );
}

function BrowserTemplateMini() {
  return (
    <div className="min-h-[245px] bg-zinc-950 p-5 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[11px] text-zinc-400">
        <span className="font-semibold text-white">nexus ai</span>
        <div className="hidden gap-5 sm:flex">
          <span>Features</span>
          <span>Pricing</span>
          <span>Blog</span>
        </div>
        <span className="rounded-md bg-cyan-400 px-2 py-1 font-medium text-zinc-950">
          Get started
        </span>
      </div>
      <div className="grid gap-5 pt-8 lg:grid-cols-2">
        <div>
          <p className="text-[11px] text-zinc-500">
            Read our series: Product Systems
          </p>
          <h3 className="mt-3 max-w-sm text-3xl font-bold leading-none tracking-tight">
            Create the best product page today.
          </h3>
          <div className="mt-6 flex gap-2">
            <span className="rounded-md bg-cyan-400 px-3 py-2 text-xs font-semibold text-zinc-950">
              Get started
            </span>
            <span className="rounded-md border border-white/10 px-3 py-2 text-xs">
              Sign in
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex gap-1.5">
            <span className="size-2 rounded-full bg-red-400" />
            <span className="size-2 rounded-full bg-yellow-400" />
            <span className="size-2 rounded-full bg-green-400" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="h-9 rounded-md bg-white/[0.08]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobeMini() {
  return (
    <div className="relative min-h-[190px] overflow-hidden p-5">
      <h3 className="text-base font-semibold text-foreground">
        Hosting over the edge
      </h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Animated backgrounds and global product scenes for high-end pages.
      </p>
      <motion.div
        className="absolute -bottom-32 left-1/2 size-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_35%,oklch(0.72_0.18_250),oklch(0.12_0.02_260)_52%,transparent_70%)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute bottom-7 left-1/2 size-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_30px_oklch(0.72_0.18_250)]" />
    </div>
  );
}

function ChatMini() {
  return (
    <div className="flex min-h-[190px] flex-col justify-end gap-3 bg-muted/20 p-5">
      {["Can this be live?", "Already is.", "Ship it."].map((msg, i) => (
        <motion.div
          key={msg}
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: 3,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "max-w-[86%] rounded-2xl px-3 py-2 text-sm",
            i % 2
              ? "self-end bg-foreground text-background"
              : "self-start border border-border bg-background",
          )}
        >
          {msg}
        </motion.div>
      ))}
    </div>
  );
}

function TestimonialMini() {
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <p className="text-3xl leading-none text-muted-foreground/35">“</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">
        Motion, forms, and page blocks finally feel like one polished system.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
          NV
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">Nora Vale</p>
          <p className="text-[10px] text-muted-foreground">Product Lead</p>
        </div>
      </div>
    </div>
  );
}

// ── Infinite Testimonials ─────────────────────────────────────────────────────

function TestimonialWallSection() {
  const rows = [
    TESTIMONIAL_WALL.slice(0, 4),
    TESTIMONIAL_WALL.slice(3, 7),
    TESTIMONIAL_WALL.slice(5, 9),
  ];

  return (
    <section className="overflow-hidden border-y border-border bg-background py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <ViewportFade>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Loved by builders
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Loved by thousands of people
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            A wall of developer reactions, product team notes, and shipping wins
            powered by Nexus UI.
          </p>
        </ViewportFade>
      </div>
      <div className="mt-14 space-y-4">
        {rows.map((row, i) => (
          <InfiniteMovingCards
            key={i}
            items={row}
            direction={i === 1 ? "right" : "left"}
            speed={i === 1 ? "normal" : "slow"}
            showGradientMask
            gap={16}
            cardClassName="w-[22rem]"
            renderItem={(item) => <TweetCard item={item} />}
          />
        ))}
      </div>
    </section>
  );
}

function TweetCard({ item }: { item: (typeof TESTIMONIAL_WALL)[number] }) {
  return (
    <article className="h-full rounded-2xl border border-border/70 bg-card/95 p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] dark:bg-white/[0.035]">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
          {item.accent}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-foreground">
              {item.name}
            </p>
            <span className="grid size-4 place-items-center rounded-full bg-primary text-[9px] text-primary-foreground">
              ✓
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{item.handle}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {item.text}
      </p>
    </article>
  );
}

// ── Featured Components ────────────────────────────────────────────────────────

function FeaturedComponents() {
  const [items, setItems] = React.useState<LibraryComponent[] | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [cardsPerView, setCardsPerView] = React.useState(3);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion() === true;
  const visibleItems = React.useMemo(() => {
    if (!items) return [];
    return Array.from(
      { length: Math.min(cardsPerView, items.length) },
      (_, offset) => items[(activeIndex + offset) % items.length],
    );
  }, [activeIndex, cardsPerView, items]);

  const moveCarousel = React.useCallback((direction: 1 | -1) => {
    setActiveIndex((current) => {
      const total = FEATURED_CAROUSEL_SLUGS.length;
      return (current + direction + total) % total;
    });
  }, []);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        void import("@/lib/catalog/library-components").then((m) => {
          setItems(
            FEATURED_CAROUSEL_SLUGS.map((slug) =>
              m.libraryComponents.find((component) => component.slug === slug),
            ).filter((component): component is LibraryComponent =>
              Boolean(component),
            ),
          );
        });
      },
      { root: null, rootMargin: "320px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      setCardsPerView(width >= 1024 ? 3 : width >= 640 ? 2 : 1);
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  return (
    <section className="relative overflow-hidden border-y border-border bg-muted/20 py-24 dark:bg-zinc-950/40 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.10),transparent_34%),radial-gradient(circle_at_0%_100%,rgba(124,58,237,0.08),transparent_32%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.10),transparent_34%),radial-gradient(circle_at_0%_100%,rgba(139,92,246,0.10),transparent_32%)]" />
      <div className="mx-auto max-w-6xl px-4">
        <ViewportFade>
          <SectionHeader
            eyebrow="Featured"
            title="Components developers reach for first"
            description="Each entry is a real React implementation — inspect motion boundaries, copy patterns, and adapt tokens to your design system."
            action={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveCarousel(-1)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "rounded-full border-border/70 bg-background/70 backdrop-blur",
                  )}
                  aria-label="Previous featured components"
                >
                  <ArrowRight className="size-4 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => moveCarousel(1)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "rounded-full border-border/70 bg-background/70 backdrop-blur",
                  )}
                  aria-label="Next featured components"
                >
                  <ArrowRight className="size-4" />
                </button>
                <Link
                  href="/components"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "inline-flex items-center gap-2 text-primary hover:text-foreground",
                  )}
                >
                  View all <ArrowRight className="size-4" />
                </Link>
              </div>
            }
          />
        </ViewportFade>

        <div
          ref={rootRef}
          className={cn(
            "relative mt-12 grid min-h-[360px] gap-5",
            cardsPerView === 1 && "grid-cols-1",
            cardsPerView === 2 && "grid-cols-2",
            cardsPerView === 3 && "grid-cols-3",
          )}
        >
          {!items
            ? Array.from({ length: cardsPerView }).map((_, i) => (
                <div
                  key={i}
                  className="h-full min-h-[360px] animate-pulse overflow-hidden rounded-[1.6rem] border border-border bg-background/60 dark:bg-white/[0.04]"
                  aria-hidden
                >
                  <div className="h-56 bg-muted/60 dark:bg-white/[0.08]" />
                  <div className="space-y-2 p-5">
                    <div className="h-4 w-2/3 rounded bg-muted dark:bg-white/[0.08]" />
                    <div className="h-3 w-full rounded bg-muted dark:bg-white/[0.06]" />
                  </div>
                </div>
              ))
            : visibleItems.map((c, i) => {
                const Preview = c.Preview;
                return (
                  <motion.div
                    key={`${c.slug}-${activeIndex}`}
                    initial={reduce ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, scale: i === 1 ? 1.02 : 1 }}
                    exit={
                      reduce ? undefined : { opacity: 0, y: -16, scale: 0.98 }
                    }
                    viewport={{ once: true, margin: "-48px" }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.52,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={
                      reduce
                        ? undefined
                        : {
                            y: -10,
                            rotateX: 1.5,
                            rotateY:
                              cardsPerView === 1
                                ? 0
                                : i === 1
                                  ? 0
                                  : i === 0
                                    ? -1.4
                                    : 1.4,
                          }
                    }
                    className="h-full"
                  >
                    <div className="group block h-full">
                      <Card className="relative h-full overflow-hidden rounded-[1.6rem] border-border/70 bg-background/85 shadow-sm transition-all duration-500 before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(135deg,rgba(14,165,233,0.20),transparent_32%,rgba(139,92,246,0.16))] before:opacity-0 before:transition-opacity hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:before:opacity-100 dark:bg-white/[0.035] dark:hover:border-primary/25">
                        <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                        <CardHeader className="relative pb-3">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-lg font-semibold tracking-tight">
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
                        <CardContent className="relative space-y-4">
                          <div className="relative h-56 overflow-hidden rounded-2xl border border-border bg-muted/80 ring-0 transition duration-500 group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-primary/15 sm:h-60 xl:h-64 dark:bg-zinc-950">
                            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                            <div className="origin-top scale-[0.9] transition duration-500 group-hover:scale-[0.94]">
                              <Preview />
                            </div>
                          </div>
                          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            {c.description}
                          </p>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-1.5">
                              {c.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-border/70 bg-muted/35 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <Link
                              href={`/components/${c.slug}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-70 transition hover:text-foreground group-hover:translate-x-0.5 group-hover:opacity-100"
                            >
                              Open <ArrowRight className="size-3" />
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                );
              })}
        </div>
        {items && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {items.map((item, index) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === activeIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
                aria-label={`Show ${item.name}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Faq() {
  const reduce = useReducedMotion() === true;
  const items = [
    {
      q: "Can I use Nexus-UI in client projects?",
      a: "Premium includes a commercial license for unlimited client work while your subscription or lifetime pass is active.",
    },
    {
      q: "Do components work with the Next.js App Router?",
      a: "Yes. Examples are built around App Router conventions, with client directives only around interactive motion boundaries.",
    },
    {
      q: "Can I customize the components?",
      a: "Yes. Nexus UI is copy-paste first, so you own the JSX, Tailwind classes, tokens, and animation timings.",
    },
    {
      q: "Are the previews real components?",
      a: "The featured previews are real React implementations or lightweight landing-page previews built from the same design language.",
    },
    {
      q: "Does it support dark and light mode?",
      a: "Yes. Core sections use semantic theme tokens so components can adapt to your existing Nexus UI theme.",
    },
    {
      q: "What do I get with templates?",
      a: "Templates combine backgrounds, cards, inputs, pricing, FAQ, and CTA blocks into complete landing page compositions.",
    },
    {
      q: "How do updates work?",
      a: "Premium includes future component drops and template revisions. A changelog ships with every release.",
    },
  ];

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
        <Accordion className="mt-10 w-full space-y-3" defaultValue={["item-0"]}>
          {items.map((item, i) => (
            <motion.div
              key={item.q}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.045, duration: 0.4 }}
            >
              <AccordionItem
                value={`item-${i}`}
                className="rounded-2xl border border-border/60 bg-background/70 px-5 shadow-sm dark:bg-white/[0.025]"
              >
                <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {item.a}
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
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
          Join teams shipping cinematic interfaces — premium templates, blocks,
          and motion primitives in one place.
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

function useScrollDepthTracking() {
  React.useEffect(() => {
    const milestones = [25, 50, 75, 90];
    const fired = new Set<number>();

    const onScroll = () => {
      const scrolled =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;
      for (const milestone of milestones) {
        if (scrolled >= milestone && !fired.has(milestone)) {
          fired.add(milestone);
          track("scroll_depth", { percent: milestone });
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

export function LandingPage() {
  useLandingLenis();
  useScrollDepthTracking();

  return (
    <div>
      <ScrollProgress />
      <Hero />
      <div id="nexus-below-fold">
        <NexusMosaicSection />
        <TrustedBy />
        <FeaturedComponents />
        <TestimonialWallSection />
        <Faq />
        <CtaFooter />
      </div>
    </div>
  );
}
