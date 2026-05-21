"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { track } from "@vercel/analytics";
import type { GlobeMethods, GlobeProps } from "react-globe.gl";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Cpu,
  Github,
  MapPin,
  MousePointer2,
  Rocket,
  Sparkles as SparklesIcon,
  Video,
  Zap,
} from "lucide-react";
import type { LibraryComponent } from "@/lib/catalog/library-components";
import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ParticleNoise } from "@/components/particle-noise";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InfiniteMovingCards } from "@/components/infinite-moving-cards/InfiniteMovingCards";
import { EncryptedText } from "@/components/encrypted-text";
import { GlobePins3D } from "@/components/globe-pins/globe-pins-3d";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

const ColorGlobe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <span className="size-10 animate-pulse rounded-full bg-sky-400/30" />
    </div>
  ),
}) as React.ComponentType<
  GlobeProps & { ref?: React.MutableRefObject<GlobeMethods | undefined> }
>;

const STUDENT_LOGO_CLOUD = [
  {
    name: "Vercel",
    slug: "vercel",
    invertDark: true,
    nameClassName: "font-sans font-bold tracking-tight",
  },
  {
    name: "Next.js",
    slug: "nextdotjs",
    invertDark: true,
    nameClassName: "font-sans font-semibold tracking-tight",
  },
  { name: "React", slug: "react", nameClassName: "font-sans font-semibold" },
  {
    name: "Tailwind CSS",
    slug: "tailwindcss",
    nameClassName: "font-sans font-semibold",
  },
  { name: "Figma", slug: "figma", invertDark: true },
  { name: "Framer", slug: "framer" },
  { name: "Linear", slug: "linear", invertDark: true },
  { name: "GitHub", slug: "github", invertDark: true },
  { name: "Notion", slug: "notion", invertDark: true },
  { name: "Stripe", slug: "stripe" },
  { name: "Supabase", slug: "supabase" },
  { name: "Raycast", slug: "raycast" },
  {
    name: "TypeScript",
    slug: "typescript",
    nameClassName: "font-sans font-semibold",
  },
  { name: "shadcn/ui", slug: "shadcnui", invertDark: true },
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
  "card-carousel-3d",
  "three-d-folder",
  "profile-orbit",
  "mac-keyboard",
];

const EDGE_GLOBE_PINS = [
  {
    id: "london",
    country: "United Kingdom",
    city: "London",
    lat: 51.5074,
    lon: -0.1278,
  },
  {
    id: "new-york",
    country: "United States",
    city: "New York",
    lat: 40.7128,
    lon: -74.006,
  },
  { id: "mumbai", country: "India", city: "Mumbai", lat: 19.076, lon: 72.8777 },
  { id: "tokyo", country: "Japan", city: "Tokyo", lat: 35.6762, lon: 139.6503 },
  {
    id: "sydney",
    country: "Australia",
    city: "Sydney",
    lat: -33.8688,
    lon: 151.2093,
  },
  {
    id: "cape-town",
    country: "South Africa",
    city: "Cape Town",
    lat: -33.9249,
    lon: 18.4241,
  },
  {
    id: "sao-paulo",
    country: "Brazil",
    city: "Sao Paulo",
    lat: -23.5505,
    lon: -46.6333,
  },
  {
    id: "dubai",
    country: "United Arab Emirates",
    city: "Dubai",
    lat: 25.2048,
    lon: 55.2708,
  },
];

const EDGE_GLOBE_CONNECTIONS = [
  { from: "london", to: "new-york" },
  { from: "new-york", to: "sao-paulo" },
  { from: "london", to: "mumbai" },
  { from: "mumbai", to: "tokyo" },
  { from: "tokyo", to: "sydney" },
  { from: "dubai", to: "cape-town" },
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

function FastCountUp({ to, suffix = "+" }: { to: number; suffix?: string }) {
  const [value, setValue] = React.useState(0);
  const reduce = useReducedMotion() === true;

  React.useEffect(() => {
    if (reduce) {
      return;
    }

    let frame = 0;
    const totalFrames = 34;
    let rafId = 0;

    const tick = () => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.max(1, Math.round(eased * to)));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reduce, to]);

  return (
    <>
      {reduce ? to : value}
      {suffix}
    </>
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

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero() {
  const reduce = useReducedMotion() === true;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);
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
      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-7">
        {/* Badge */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -10, scale: 0.94 }}
          animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex"
        >
          <Badge className="gap-1.5 border border-violet-500/25 bg-violet-500/10 px-4 py-1.5 text-sm font-medium shadow-sm shadow-violet-500/10">
            <SparklesIcon className="size-3.5 shrink-0 text-violet-500 dark:text-violet-300" />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent dark:from-violet-300 dark:via-fuchsia-300 dark:to-indigo-300">
              Built for the AI generation of developers
            </span>
          </Badge>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          className="text-[2.6rem] font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4.5rem]"
        >
          <span className="block">Yes, you can build</span>
          <span className="block">
            all of this{" "}
            <EncryptedText
              text={"using\u00A0AI."}
              trigger="load"
              speed={60}
              shuffleSpeed={30}
              iterations={10}
              revealDelay={400}
              className="block whitespace-nowrap font-sans font-bold tracking-tight text-violet-600 dark: text-violet-500 sm:inline sm:bg-gradient-to-r sm:from-violet-600 sm:via-fuchsia-500 sm:to-indigo-500 sm:bg-clip-text sm:text-transparent sm:dark:from-violet-600 sm:dark:via-fuchsia-500 sm:dark:to-indigo-500"
              scrambleClassName="text-fuchsia-500 dark:text-fuchsia-300"
            />
          </span>
        </motion.h1>
        {/* bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent */}
        {/* block whitespace-nowrap font-sans font-bold tracking-tight text-violet-600 dark:text-violet-300 sm:inline sm:bg-gradient-to-r sm:from-violet-600 sm:via-fuchsia-500 sm:to-indigo-500 sm:bg-clip-text sm:text-transparent sm:dark:from-violet-600 sm:dark:via-fuchsia-500 sm:dark:to-indigo-500 */}

        {/* Subtitle */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
          className="mx-auto max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          100+ animated React components, Next.js templates, and Tailwind UI
          blocks. Copy-paste TypeScript, ship your product faster.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {[
            { value: <FastCountUp to={100} />, label: "Components" },
            { value: <FastCountUp to={20} />, label: "Templates" },
            { value: "Free", label: "to start" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {value}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
          className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <MotionLink
            href="/components"
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-background shadow-lg shadow-primary/15 ring-1 ring-foreground/10 transition-shadow hover:shadow-xl hover:shadow-primary/20"
          >
            Browse components <ArrowRight className="size-4" />
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
          transition={{ delay: 0.38, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          {[
            { icon: Zap, label: "Copy-paste TypeScript" },
            { icon: MousePointer2, label: "No UI expertise needed" },
            { icon: Cpu, label: "AI-ready codebase" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-indigo-500 text-white shadow-sm shadow-violet-500/20 dark:from-violet-400 dark:via-fuchsia-400 dark:to-indigo-400">
                <Icon className="size-3 shrink-0" />
              </span>
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
    <section className="relative overflow-hidden border-b border-border/50 bg-white py-14 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(24,24,27,0.08)_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50/80 shadow-[0_24px_90px_-70px_rgba(15,23,42,0.7)] backdrop-blur dark:border-white/10 dark:bg-white/[0.035]">
          <div className="grid gap-6 border-b border-zinc-200 px-6 py-7 dark:border-white/10 md:grid-cols-[1fr_auto] md:items-center md:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-violet-600 dark:text-violet-300">
                Built to fit the tools your team already uses
              </p>
              <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-3xl">
                Modern frontend tools, design systems, and deployment workflows.
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["16+", "brands"],
                ["100+", "components"],
                ["20+", "templates"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-lg font-bold text-zinc-950 dark:text-white">
                    {value}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <CinematicLogoCloud
            clients={STUDENT_LOGO_CLOUD}
            variant="marquee-named"
            eyebrow="Logos and names from the stack students already know"
            className="bg-transparent py-8 dark:bg-transparent md:py-9"
          />
        </div>
      </div>
    </section>
  );
}

function NexusMosaicSection() {
  const reduce = useReducedMotion() === true;
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-white py-20 text-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(24,24,27,0.13)_1px,transparent_1px)] bg-[size:26px_26px] opacity-70 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.13)_1px,transparent_1px)] dark:opacity-45"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-44 mx-auto hidden h-[680px] max-w-7xl bg-[linear-gradient(90deg,transparent_0_8%,rgba(113,113,122,0.16)_8%_8.15%,transparent_8.15%_28%,rgba(113,113,122,0.13)_28%_28.12%,transparent_28.12%_49%,rgba(113,113,122,0.15)_49%_49.13%,transparent_49.13%_72%,rgba(113,113,122,0.13)_72%_72.12%,transparent_72.12%),linear-gradient(0deg,transparent_0_16%,rgba(113,113,122,0.12)_16%_16.12%,transparent_16.12%_43%,rgba(113,113,122,0.13)_43%_43.12%,transparent_43.12%_69%,rgba(113,113,122,0.12)_69%_69.12%,transparent_69.12%)] opacity-60 dark:bg-[linear-gradient(90deg,transparent_0_8%,rgba(255,255,255,0.13)_8%_8.15%,transparent_8.15%_28%,rgba(255,255,255,0.1)_28%_28.12%,transparent_28.12%_49%,rgba(255,255,255,0.12)_49%_49.13%,transparent_49.13%_72%,rgba(255,255,255,0.1)_72%_72.12%,transparent_72.12%),linear-gradient(0deg,transparent_0_16%,rgba(255,255,255,0.1)_16%_16.12%,transparent_16.12%_43%,rgba(255,255,255,0.11)_43%_43.12%,transparent_43.12%_69%,rgba(255,255,255,0.1)_69%_69.12%,transparent_69.12%)] dark:opacity-45 lg:block"
      />
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[30rem] z-20 hidden -translate-x-1/2 lg:block"
          animate={{ x: [-320, 260, 80, -320], y: [0, -26, 214, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        >
          <MousePointer2 className="size-5 fill-violet-600 text-violet-600 drop-shadow-[0_8px_18px_rgba(124,58,237,0.28)]" />
        </motion.div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <ViewportFade className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-6xl">
            Nexus-ui takes idea to website in hours,{" "}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
              not days.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-lg">
            As easy as copy-pasting. Build great looking websites without
            worrying about styling.
          </p>
        </ViewportFade>

        <div className="relative mt-16 grid gap-5 md:grid-cols-6 lg:h-[1120px] lg:grid-cols-12 lg:gap-0">
          <MosaicPanel
            className="md:col-span-3 lg:absolute lg:left-0 lg:top-14 lg:h-[600px] lg:w-[30%]"
            delay={0.02}
          >
            <SignupMini />
          </MosaicPanel>
          <MosaicPanel
            className="md:col-span-3 lg:absolute lg:right-4 lg:top-0 lg:h-[480px] lg:w-[63%]"
            delay={0.08}
            featured
          >
            <BrowserTemplateMini />
          </MosaicPanel>
          <MosaicPanel
            className="md:col-span-3 lg:absolute lg:left-[34%] lg:top-[420px] lg:h-[300px] lg:w-[29%]"
            delay={0.14}
          >
            <GlobeMini />
          </MosaicPanel>
          <MosaicPanel
            className="md:col-span-3 lg:absolute lg:right-[2%] lg:top-[510px] lg:h-[300px] lg:w-[33%]"
            delay={0.2}
          >
            <TestimonialMini />
          </MosaicPanel>
          <MosaicPanel
            className="md:col-span-3 lg:absolute lg:left-[8%] lg:top-[750px] lg:h-[330px] lg:w-[34%]"
            delay={0.26}
            featured
          >
            <WorldMapMini />
          </MosaicPanel>
          <MosaicPanel
            className="md:col-span-3 lg:absolute lg:left-[45%] lg:top-[770px] lg:h-[285px] lg:w-[25%]"
            delay={0.32}
          >
            <InterviewMini />
          </MosaicPanel>
          <MosaicPanel
            className="md:col-span-6 lg:absolute lg:right-0 lg:top-[850px] lg:h-[350px] lg:w-[36%]"
            delay={0.38}
            featured
          >
            <AiImageMini />
          </MosaicPanel>
        </div>
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
        "relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-[0_24px_80px_-48px_rgba(15,23,42,0.75)] dark:border-white/10 dark:bg-zinc-900",
        featured && "shadow-[0_32px_95px_-48px_rgba(79,70,229,0.8)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function SignupMini() {
  return (
    <div className="flex h-full min-h-[560px] flex-col p-6 lg:min-h-0">
      <div>
        <div className="mb-7 flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-white">
          <div className="grid size-8 place-items-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            N
          </div>
          Nexus-ui Studio
        </div>
        <h3 className="text-xl font-bold leading-tight tracking-tight text-zinc-950 dark:text-white">
          Sign up for an account
        </h3>
        <div className="mt-6 space-y-4">
          {["Full name", "Email address", "Password"].map((label, i) => (
            <label key={label} className="block">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {label}
              </span>
              <div className="mt-2 flex h-11 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-500">
                {i === 0
                  ? "Jane Doe"
                  : i === 1
                    ? "jane@nexus-ui.dev"
                    : "••••••••"}
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="mt-auto space-y-4 pt-6">
        <button className="h-11 w-full rounded-lg bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
          Sign Up
        </button>
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <span className="font-medium text-violet-600 dark:text-violet-300">
            Sign in
          </span>
        </p>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
          <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
          Or continue with
          <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
        </div>
        <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
          <Github className="size-4" />
          Github
        </button>
        <p className="text-center text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </p>
      </div>
    </div>
  );
}

function BrowserTemplateMini() {
  const codeLines = [
    "const page = await nexus.generate({",
    "  brand: 'Nexus-ui',",
    "  theme: 'midnight-saas',",
    "  sections: ['hero', 'pricing', 'faq'],",
    "  motion: { preset: 'soft-launch' },",
    "})",
    "",
    "return <LaunchPage {...page} />",
  ];

  return (
    <div className="flex h-full min-h-[360px] flex-col bg-zinc-950 p-5 text-white lg:min-h-0">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[11px] text-zinc-400">
        <span className="font-semibold text-white">Nexus-ui ai</span>
        <div className="hidden gap-5 sm:flex">
          <span>Features</span>
          <span>Pricing</span>
          <span>Blog</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Sign in</span>
          <span className="rounded-md bg-blue-500 px-2 py-1 font-medium text-white">
            Get started
          </span>
        </div>
      </div>
      <div className="grid flex-1 gap-5 pt-8 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h3 className="max-w-sm text-3xl font-bold leading-none tracking-tight md:text-4xl">
            Create the best average product today.
          </h3>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
          Plan, launch, and refine every product surface from one calm workspace
          built for fast-moving Nexus-ui teams.
        </p>
      </div>
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-700 via-fuchsia-500 to-pink-400 p-4 shadow-2xl shadow-fuchsia-950/40">
        <div className="rounded-xl border border-white/15 bg-zinc-950/85 p-4 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="size-2 rounded-full bg-red-400" />
              <span className="size-2 rounded-full bg-yellow-400" />
              <span className="size-2 rounded-full bg-green-400" />
            </div>
            <span className="text-[10px] text-white/45">app/page.tsx</span>
          </div>
          <pre className="overflow-hidden rounded-lg border border-white/10 bg-black/35 p-3 font-mono text-[11px] leading-relaxed text-zinc-300 shadow-inner">
            <code>
              {codeLines.map((line, index) => (
                <span key={`${line}-${index}`} className="block">
                  <span className="mr-3 select-none text-white/25">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {line.includes("const") || line.includes("return") ? (
                    <>
                      <span className="text-fuchsia-300">
                        {line.split(" ")[0]}
                      </span>
                      <span>{line.slice(line.indexOf(" "))}</span>
                    </>
                  ) : line.includes("Nexus-ui") ? (
                    <>
                      <span> brand: </span>
                      <span className="text-emerald-300">{"'Nexus-ui'"}</span>
                      <span>,</span>
                    </>
                  ) : line.includes("midnight") ||
                    line.includes("hero") ||
                    line.includes("soft") ? (
                    <span className="text-sky-300">{line}</span>
                  ) : (
                    <span>{line || " "}</span>
                  )}
                </span>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function ColorGlobeMini({ size = 236 }: { size?: number }) {
  const globeRef = React.useRef<GlobeMethods | undefined>(undefined);
  const [ready, setReady] = React.useState(false);
  const reduce = useReducedMotion() === true;

  const handleReady = React.useCallback(() => {
    const controls = globeRef.current?.controls();
    if (!controls) return;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    globeRef.current?.pointOfView({ lat: 18, lng: -38, altitude: 2.35 }, 0);
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready || reduce) return;

    let lng = -38;
    const id = window.setInterval(() => {
      lng = (lng + 1.6) % 360;
      globeRef.current?.pointOfView({ lat: 18, lng, altitude: 2.35 }, 140);
    }, 120);

    return () => window.clearInterval(id);
  }, [ready, reduce]);

  return (
    <ColorGlobe
      ref={globeRef}
      width={size}
      height={size}
      globeImageUrl="/images/earth-blue-marble.jpg"
      backgroundColor="rgba(0,0,0,0)"
      showAtmosphere
      atmosphereColor="#38bdf8"
      atmosphereAltitude={0.12}
      pointsData={EDGE_GLOBE_PINS}
      pointLat="lat"
      pointLng="lon"
      pointColor={() => "#38bdf8"}
      pointAltitude={0.015}
      pointRadius={0.35}
      pointLabel={() => ""}
      enablePointerInteraction={false}
      onGlobeReady={handleReady}
      animateIn
    />
  );
}

function GlobeMini() {
  const reduce = useReducedMotion() === true;

  return (
    <div className="relative h-full min-h-[290px] overflow-hidden p-6 lg:min-h-0">
      <div className="relative z-10 max-w-[72%]">
        <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
          Hosting over the edge
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          With the Nexus-ui edge network, we host your website by going into
          each city by ourselves.
        </p>
      </div>
      <div className="pointer-events-none absolute -bottom-64 -right-64 h-[34rem] w-[34rem] overflow-hidden rounded-full">
        <div className="absolute inset-0 rounded-full bg-sky-500/10 blur-2xl" />
        <motion.div
          className="absolute left-0 top-0"
          animate={
            reduce
              ? undefined
              : {
                  x: [0, -18, -26, -10, 0],
                  y: [0, 10, 26, 18, 0],
                  rotate: [0, 1.5, 0, -1.5, 0],
                }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ColorGlobeMini size={544} />
        </motion.div>
      </div>
    </div>
  );
}

function TestimonialMini() {
  return (
    <div className="flex h-full min-h-[280px] flex-col bg-zinc-50 p-6 dark:bg-zinc-900 lg:min-h-0">
      <p className="text-5xl leading-none text-violet-200 dark:text-violet-400/35">
        “
      </p>
      <p className="mt-3 flex-1 text-[15px] font-medium leading-7 text-zinc-800 dark:text-zinc-100">
        Nexus-ui gave our product pages a visual language we could maintain. The
        team stopped rebuilding the same sections and started shipping better
        experiments every week.
      </p>
      <div className="mt-5 flex items-center gap-3 border-t border-zinc-200/70 pt-4 dark:border-white/10">
        <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
          AR
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-950 dark:text-white">
            Ariana Reed
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Design Systems Lead
          </p>
        </div>
      </div>
    </div>
  );
}

function WorldMapMini() {
  return (
    <div className="relative h-full min-h-[320px] overflow-hidden bg-zinc-950 p-6 text-white lg:min-h-0">
      <div className="relative z-10 max-w-sm">
        <h3 className="text-xl font-semibold">All over the world</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          A distributed Nexus-ui team building, reviewing, and shipping across
          every time zone.
        </p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
      <div className="absolute -bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 overflow-hidden rounded-full bg-black shadow-[0_30px_100px_-44px_rgba(14,165,233,0.9)] ring-1 ring-sky-400/20">
        <GlobePins3D
          pins={EDGE_GLOBE_PINS}
          connections={EDGE_GLOBE_CONNECTIONS}
          showLabels={false}
          rotationSpeed={0.04}
          dotColor="#7dd3fc"
          dotOpacity={0.68}
          dotSize={0.01}
          pinColor="#38bdf8"
          pinSize={0.026}
          trailColor="#a78bfa"
          maxCanvasSize={320}
          dpr={1.25}
          fpsCap={24}
          className="preview-force-active h-full w-full"
        />
      </div>
      <div className="absolute bottom-5 left-6 right-6 z-20 flex flex-wrap gap-1.5">
        {["London", "New York", "Mumbai", "Tokyo"].map((city) => (
          <span
            key={city}
            className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-zinc-200 shadow-sm backdrop-blur"
          >
            {city}
          </span>
        ))}
      </div>
    </div>
  );
}

function InterviewMini() {
  return (
    <div className="h-full min-h-[280px] bg-white p-6 dark:bg-zinc-900 lg:min-h-0">
      <div className="flex items-center gap-2 text-violet-600">
        <CalendarDays className="size-4" />
        <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
          Schedule interviews seamlessly
        </h3>
      </div>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Ask about DSA or Dev, we don&apos;t care.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          "bg-gradient-to-br from-sky-100 to-violet-100",
          "bg-gradient-to-br from-amber-100 to-rose-100",
        ].map((tone, i) => (
          <div
            key={tone}
            className={cn("relative h-28 overflow-hidden rounded-xl", tone)}
          >
            <Video className="absolute right-3 top-3 size-4 text-zinc-500" />
            <div className="absolute bottom-4 left-1/2 size-14 -translate-x-1/2 rounded-full bg-white/70" />
            <div className="absolute bottom-0 left-1/2 h-12 w-20 -translate-x-1/2 rounded-t-full bg-zinc-900/80" />
            <span className="absolute bottom-2 left-2 rounded bg-zinc-950/75 px-2 py-1 text-[10px] text-white">
              {i === 0 ? "Jane" : "Alex"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
        <div className="grid size-9 place-items-center rounded-full bg-violet-600 text-xs font-bold text-white">
          JS
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-950 dark:text-white">
            Jane Smith
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Data Scientist
          </p>
        </div>
      </div>
    </div>
  );
}

function AiImageMini() {
  return (
    <div className="relative flex h-full min-h-[340px] flex-col overflow-hidden bg-sky-100 p-5 text-zinc-950 lg:min-h-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.95),transparent_22%),radial-gradient(circle_at_70%_35%,rgba(255,255,255,0.8),transparent_20%),linear-gradient(180deg,#dff4ff_0%,#f7e8ff_58%,#ffe7c8_100%)]" />
      <div className="absolute bottom-8 right-8 rotate-12">
        <Rocket className="size-20 text-violet-700 drop-shadow-xl" />
      </div>
      <div className="relative flex items-center justify-between text-[11px]">
        <span className="font-bold">Nexus-ui</span>
        <div className="hidden items-center gap-4 sm:flex">
          <span>Features</span>
          <span>Pricing</span>
          <span>Blog</span>
          <span>Docs</span>
        </div>
        <span className="rounded-full bg-yellow-300 px-3 py-1 font-semibold">
          Try for free
        </span>
      </div>
      <div className="relative mt-auto max-w-md pb-4">
        <h3 className="text-4xl font-bold leading-none tracking-tight">
          Image generation at your fingertips
        </h3>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-600">
          Create dreamy Nexus-ui campaign visuals, product scenes, and launch
          assets from a single prompt.
        </p>
      </div>
      <MapPin className="absolute bottom-20 left-8 size-5 text-fuchsia-500" />
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
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion() === true;
  const activeItem = items?.[activeIndex] ?? null;

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

  return (
    <section className="relative overflow-hidden border-y border-border bg-white py-24 text-zinc-950 dark:bg-zinc-950 dark:text-white md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.12),transparent_34%),radial-gradient(circle_at_8%_72%,rgba(14,165,233,0.10),transparent_30%),radial-gradient(circle,rgba(24,24,27,0.08)_1px,transparent_1px)] bg-[size:auto,auto,28px_28px] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.16),transparent_34%),radial-gradient(circle_at_8%_72%,rgba(34,211,238,0.10),transparent_30%),radial-gradient(circle,rgba(255,255,255,0.09)_1px,transparent_1px)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ViewportFade className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-violet-600 dark:text-violet-300">
            Featured
          </p>
          <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Explore Nexus-ui components like a live design board
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            Preview real React components, scan their tags, and jump straight
            into the implementation when something fits your build.
          </p>
        </ViewportFade>

        <div ref={rootRef} className="relative mt-14 min-h-[620px]">
          {!items || !activeItem ? (
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="h-[520px] animate-pulse rounded-3xl border border-zinc-200 bg-zinc-100/70 dark:border-white/10 dark:bg-white/[0.04]" />
              <div className="h-[520px] animate-pulse rounded-3xl border border-zinc-200 bg-zinc-100/70 dark:border-white/10 dark:bg-white/[0.04]" />
            </div>
          ) : (
            <>
              <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr] lg:items-stretch">
                <motion.div
                  key={activeItem.slug}
                  initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative min-h-[520px] overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-950 p-3 shadow-[0_34px_120px_-70px_rgba(79,70,229,0.85)] dark:border-white/10"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.25),transparent_32%),radial-gradient(circle_at_90%_20%,rgba(34,211,238,0.16),transparent_30%)]" />
                  <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-red-400" />
                      <span className="size-2.5 rounded-full bg-yellow-400" />
                      <span className="size-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span>{activeItem.slug}.tsx</span>
                  </div>
                  <div className="relative mt-3 h-[430px] overflow-hidden rounded-2xl border border-white/10 bg-background dark:bg-zinc-950">
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
                    <div className="origin-top scale-[0.96] transition duration-500 group-hover:scale-100">
                      <activeItem.Preview />
                    </div>
                  </div>
                </motion.div>

                <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/85 p-6 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.65)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="absolute -right-16 -top-16 size-40 rounded-full bg-violet-500/15 blur-3xl" />
                  <Badge
                    variant="outline"
                    className="border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-200"
                  >
                    {activeItem.premium
                      ? "Premium component"
                      : "Free component"}
                  </Badge>
                  <h3 className="relative mt-5 text-3xl font-bold tracking-tight">
                    {activeItem.name}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {activeItem.description}
                  </p>
                  <div className="relative mt-6 flex flex-wrap gap-2">
                    {activeItem.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="relative mt-8 grid gap-3">
                    <Link
                      href={`/components/${activeItem.slug}`}
                      className={cn(
                        buttonVariants(),
                        "h-11 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
                      )}
                    >
                      Open component <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/components"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-11 rounded-full border-zinc-200 bg-white/70 dark:border-white/10 dark:bg-white/5",
                      )}
                    >
                      Browse all components
                    </Link>
                  </div>
                  <div className="relative mt-8 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => moveCarousel(-1)}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "icon" }),
                        "rounded-full border-zinc-200 bg-white/70 dark:border-white/10 dark:bg-white/5",
                      )}
                      aria-label="Previous featured component"
                    >
                      <ArrowRight className="size-4 rotate-180" />
                    </button>
                    <p className="text-xs font-medium text-zinc-400">
                      {String(activeIndex + 1).padStart(2, "0")} /{" "}
                      {String(items.length).padStart(2, "0")}
                    </p>
                    <button
                      type="button"
                      onClick={() => moveCarousel(1)}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "icon" }),
                        "rounded-full border-zinc-200 bg-white/70 dark:border-white/10 dark:bg-white/5",
                      )}
                      aria-label="Next featured component"
                    >
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item, index) => (
                  <div
                    key={item.slug}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveIndex(index)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      setActiveIndex(index);
                    }}
                    className={cn(
                      "group cursor-pointer rounded-2xl border p-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
                      index === activeIndex
                        ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                        : "border-zinc-200 bg-white/75 hover:-translate-y-1 hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-white/20 dark:hover:bg-white/[0.06]",
                    )}
                  >
                    <div
                      className="relative h-24 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-zinc-950"
                      inert
                      aria-hidden="true"
                    >
                      <div className="origin-top-left scale-[0.38] sm:scale-[0.34]">
                        <item.Preview />
                      </div>
                    </div>
                    <p className="mt-3 truncate text-sm font-semibold text-zinc-950 dark:text-white">
                      {item.name}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {item.tags[0] ?? "Component"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
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

// ── Why Nexus UI ───────────────────────────────────────────────────────────────

const WHY_ITEMS = [
  {
    heading: "Copy-paste ownership",
    body: "Every component is delivered as plain TypeScript JSX you paste directly into your project. There is no proprietary runtime, no wrapper API, and no vendor lock-in. You own the code from the moment you copy it, and you can modify every class, prop, and animation timing without fighting an abstraction layer.",
  },
  {
    heading: "Built for Next.js App Router",
    body: "Components are written around Next.js 14+ App Router conventions. Client boundaries are placed only where interactive motion is necessary, so server components stay server components. You get full RSC compatibility, correct streaming behavior, and the smallest possible JavaScript bundle on the client.",
  },
  {
    heading: "Production-grade Framer Motion",
    body: "Animations are authored with Framer Motion and respect the user's reduced-motion preference out of the box. Every transition uses physics-based spring curves instead of hardcoded easing, so interactions feel natural across devices. Performance is prioritized with will-change hints and GPU-accelerated transforms.",
  },
  {
    heading: "shadcn/ui compatible",
    body: "The component design language is built on top of shadcn/ui tokens and Tailwind CSS design primitives. If you already have a shadcn/ui project, you can drop in Nexus UI components without changing your global CSS. Dark mode is handled through the same CSS variable layer you already control.",
  },
  {
    heading: "Full-page Next.js templates",
    body: "Templates go beyond component kits — they are complete, deployable Next.js pages that combine hero sections, pricing blocks, FAQ accordions, testimonial rails, and CTA sections into a cohesive product story. Each template is audited for Core Web Vitals before it ships, so you start with a high Lighthouse score.",
  },
  {
    heading: "Free to start, no card required",
    body: "The free tier gives you access to a growing set of open-source components, full documentation, and the CLI installer. Premium unlocks every animated component, all templates, priority support, and a commercial license for client projects. You can evaluate the entire library before committing to a subscription.",
  },
];

function WhyNexusUI() {
  const reduce = useReducedMotion() === true;
  return (
    <section className="border-t border-border/50 bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ViewportFade className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            Why Nexus UI
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need to ship a polished product
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Nexus UI is a React component library and Next.js template collection
            designed specifically for developers who want production-quality UI
            without spending weeks on design polish. Every piece is built with
            Tailwind CSS, Framer Motion, and TypeScript — the same stack your
            team already uses.
          </p>
        </ViewportFade>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_ITEMS.map((item, i) => (
            <motion.div
              key={item.heading}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-border/60 bg-muted/20 p-7 dark:bg-white/[0.025]"
            >
              <h3 className="text-base font-semibold text-foreground">{item.heading}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </motion.div>
          ))}
        </div>
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
          70+ components · 18 templates · Free to start
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
        <WhyNexusUI />
        <Faq />
        <CtaFooter />
      </div>
    </div>
  );
}
