"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  DollarSign,
  Download,
  Home,
  LayoutGrid,
  Layers,
  Search,
  Sparkles,
  User,
  Volume2,
} from "lucide-react";
import { FloatingDockDesktop } from "@/components/floating-dock";
import { BackgroundBoxes } from "@/components/background-boxes";
import { BackgroundGradient } from "@/components/background-gradient";
import { GooeyInput } from "@/components/gooey-input";
import { SignupForm } from "@/components/signup-form";
import { LoginForm } from "@/components/signup-form/login-form";
import { Sparkles as SparklesParticles } from "@/components/sparkles";
import { StatefulButton } from "@/components/stateful-button";
import { TextGenerateEffect } from "@/components/text-generate-effect";
import { TextRevealCard } from "@/components/text-reveal-card";
import { Meteors } from "@/components/meteors";
import { InfiniteMovingCards } from "@/components/infinite-moving-cards";
import { GlowingCardsLayout } from "@/components/glowing-effect-cards";
import { TypewriterEffect } from "@/components/typewriter-effect";
import { cn } from "@/lib/utils";
import { KpiStrip } from "@/components/pulse-dashboard-kpis";
import { LatticeFeatures } from "@/components/lattice-feature-grid";
import { BentoSignals } from "@/components/bento-signal-grid";
import { OrbitalLoader } from "@/components/orbital-loader";
import { BeamField } from "@/components/beam-sweep-field";
import { HeroAurora } from "@/components/hero-aurora-spotlight";
import { OrbitFooter } from "@/components/orbit-footer";
import { EditorialRail } from "@/components/editorial-blog-rail";
import { SplitSignup } from "@/components/split-signup-convert";
import { WorkbenchSidebar } from "@/components/workbench-sidebar";
import { DepthTestimonials } from "@/components/depth-testimonials";
import { MotionFaq } from "@/components/motion-faq-disclosure";
import { SplitContact } from "@/components/split-contact-glass";
import { GlassLogin } from "@/components/glass-login-stack";
import { MilestoneTimeline } from "@/components/milestone-timeline";
import {
  SquigglyDrinksHeadline,
  SquigglyText,
} from "@/components/squiggly-text";
import { Terminal } from "@/components/terminal";
import { EncryptedText } from "@/components/encrypted-text";
import {
  MacKeyboard,
  usePhysicalKeyboard,
  useKeyboardSound,
  MAC_ROWS,
  type SoundType,
  type KeyDef as KbKeyDef,
} from "@/components/keyboard";
import { ImagesBadge } from "@/components/images-badge";
import { DotGridHero } from "@/components/dot-grid-hero";
import { AnimatedBentoGrid } from "@/components/animated-bento-grid";
import { BentoGridSkeleton } from "@/components/bento-grid-skeleton";
import { MotionLayerScroller } from "@/components/motion-layer-scroller";
import { BentoShowcase } from "@/components/registry/bento-showcase";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";
import { Compare } from "@/components/compare";
import { ExpandableCards } from "@/components/expandable-cards";
import type { CardItem } from "@/components/expandable-cards";
import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";
import { AnimatedSelectHeadline } from "@/components/animated-select-headline";
import { WarpSpeedCard, WarpTextTrigger } from "@/components/warp-speed-card";
import { AskNexusInput } from "@/components/ask-nexus-input";
import { PhoneInput } from "@/components/phone-input";
import { CircularCarousel } from "@/components/circular-carousel";
import { ChatMessages } from "@/components/chat-messages";
import { ShaderFlow } from "@/components/shader-flow";
import { AnimatedCountdown } from "@/components/animated-countdown";
import { ShootingStarsGrid } from "@/components/shooting-stars-grid";
import { HoverHighlightText } from "@/components/hover-highlight-text";
import { CardStackRotator } from "@/components/card-stack-rotator/card-stack-rotator";
import { CodeBlock } from "@/components/code-block/code-block";
import { InteractiveDots } from "@/components/interactive-dots";
import { LayeredWaveBackground } from "@/components/layered-wave-background";
import { ScrollingTestimonials } from "@/components/scrolling-testimonials/scrolling-testimonials";
import { SpectraFrame } from "@/components/spectra-frame/spectra-frame";
import { ProfileOrbit } from "@/components/profile-orbit/profile-orbit";
import { GlowButton } from "@/components/glow-button";
import { FaqFolderCard } from "@/components/blocks/faq-folder-card";
import { ContactPageBlockPreview } from "@/components/blocks/contact-page";
import { TextAnimationsBlockPreview } from "@/components/blocks/text-animations";
import { BlogContentSectionsBlockPreview } from "@/components/blocks/blog-content-sections";
import { RadioPlanPricingPreview } from "@/components/blocks/pricing-section";
import { WordMagnet } from "@/components/word-magnet";
import { ThreeDFolder } from "@/components/three-d-folder";
import { CardCarousel3D } from "@/components/card-carousel-3d";
import { DraggableCardStack } from "@/components/draggable-card-stack";
import { RealTimeCursors } from "@/components/real-time-cursors";
import { CommandPalette } from "@/components/command-palette";
import { InteractiveGlobeExplorer } from "@/components/interactive-globe-explorer";
import { ImageTrail } from "@/components/image-trail";
import { CursorTextReveal } from "@/components/cursor-text-reveal";
import { FeatureToolsCard } from "@/components/feature-tools-card";
import { AvatarGroup } from "@/components/avatar-group";
import SimpleSidebar from "@/components/blocks/sidebar/simple-sidebar";
import CollapsibleSidebar from "@/components/blocks/sidebar/collapsible-sidebar";
import GroupedSidebar from "@/components/blocks/sidebar/grouped-sidebar";
import LogosBlurFlip from "@/components/blocks/logo-clouds/logos-blur-flip";
import LogoCloudBlur from "@/components/blocks/logo-clouds/logo-cloud-blur";
import LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";
import LogoCloudSpotlight from "@/components/blocks/logo-clouds/logo-cloud-spotlight";
import LogoCloudSwap from "@/components/blocks/logo-clouds/logo-cloud-swap";
import LogoCloudSingleRow from "@/components/blocks/logo-clouds/logo-cloud-single-row";
import { LinkPreview } from "@/components/link-preview/link-preview";
import { CinematicCardDeck } from "@/components/cinematic-card-deck";
import { StepFlow } from "@/components/step-flow";
import { WheelSelector } from "@/components/wheel-selector";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";

export function PreviewLinkPreview() {
  return (
    <div className="flex h-full min-h-full items-start justify-center overflow-y-auto bg-white px-6 py-16 dark:bg-neutral-950">
      <article className="mx-auto w-full max-w-xl">
        {/* Article header */}
        <header className="mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-500">
            Design &amp; Engineering
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            The modern web development stack
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            A curated overview of the tools that define production-grade React apps in 2025.
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-neutral-400">
            <span>6 min read</span>
            <span>·</span>
            <span>May 2025</span>
          </div>
        </header>

        {/* Article body */}
        <div className="space-y-6 text-base leading-8 text-neutral-600 dark:text-neutral-400">
          <p>
            The React ecosystem has converged on a set of tools that make shipping fast, beautiful web
            experiences feel almost effortless. At the center of it all is{" "}
            <LinkPreview
              href="https://nextjs.org"
              image="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=480&q=80"
              title="Next.js — The React Framework for the Web"
              delay={0.05}
            >
              Next.js
            </LinkPreview>
            , a full-stack framework that handles routing, rendering, and edge deployment with zero
            configuration.
          </p>

          <p>
            Animation has become a first-class concern. Libraries like{" "}
            <LinkPreview
              href="https://framer.com/motion"
              image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&q=80"
              title="Framer Motion — Production-ready animations"
              delay={0.06}
            >
              Framer Motion
            </LinkPreview>{" "}
            expose a declarative API that makes spring physics, layout animations, and gesture-driven
            interactions composable at the component level — no canvas, no imperative loops.
          </p>

          <p>
            Styling at scale is solved by{" "}
            <LinkPreview
              href="https://tailwindcss.com"
              image="https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=480&q=80"
              title="Tailwind CSS — A utility-first framework"
              delay={0.05}
            >
              Tailwind CSS
            </LinkPreview>
            . Its utility-first model and design-token-driven theming eliminate the class-naming overhead
            and cascade unpredictability that made CSS at scale painful for years.
          </p>

          <p>
            For deployment,{" "}
            <LinkPreview
              href="https://vercel.com"
              image="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=480&q=80"
              title="Vercel — Frontend Cloud"
              delay={0.04}
            >
              Vercel
            </LinkPreview>{" "}
            provides global edge infrastructure, instant rollbacks, and built-in analytics — turning a
            git push into a globally distributed release in under a minute. Pair it with{" "}
            <LinkPreview
              href="https://github.com"
              image="https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=480&q=80"
              title="GitHub — Where code lives"
              width={300}
              height={180}
              delay={0.06}
            >
              GitHub
            </LinkPreview>{" "}
            for CI/CD and the entire loop from commit to production takes seconds.
          </p>
        </div>

        {/* Hover instruction hint */}
        <p className="mt-10 text-center text-xs text-neutral-400 dark:text-neutral-600">
          Hover the highlighted links to see previews
        </p>
      </article>
    </div>
  );
}

export function PreviewCinematicCardDeck({ compact = true }: { compact?: boolean } = {}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const frameHeight = compact ? "420px" : "620px";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black",
        compact ? "h-[420px]" : "h-[620px]",
      )}
    >
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto overscroll-contain [scrollbar-color:rgba(255,255,255,0.35)_transparent] [scrollbar-width:thin]"
      >
        <CinematicCardDeck
          sectionHeight={compact ? 720 : 820}
          cardWidth={compact ? 360 : 500}
          cardHeight={compact ? 250 : 350}
          intensity="cinematic"
          smoothing={0.78}
          glowIntensity={0.22}
          scrollContainerRef={scrollRef}
          viewportHeight={frameHeight}
          className="min-h-full"
        />
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur">
        Scroll inside preview
      </div>
    </div>
  );
}

export function PreviewInteractiveGlobeExplorer() {
  return (
    <div className="h-[620px] w-full overflow-hidden rounded-3xl bg-background">
      <InteractiveGlobeExplorer className="h-full rounded-3xl" />
    </div>
  );
}

export function PreviewCommandPalette() {
  return (
    <div className="h-[500px] w-full overflow-hidden rounded-3xl bg-[#111111]">
      <CommandPalette className="h-full" />
    </div>
  );
}

const LOGO_CLOUD_GRID_CLIENTS = [
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

const LOGO_CLOUD_MARQUEE_CLIENTS = [
  { name: "Stripe", slug: "stripe" },
  { name: "Figma", slug: "figma", invertDark: true },
  { name: "Framer", slug: "framer" },
  { name: "Linear", slug: "linear", invertDark: true },
  { name: "Vercel", slug: "vercel", invertDark: true },
  { name: "GitHub", slug: "github", invertDark: true },
  { name: "Notion", slug: "notion", invertDark: true },
  { name: "Raycast", slug: "raycast" },
  { name: "Loom", slug: "loom" },
  { name: "Intercom", slug: "intercom" },
  { name: "Twitch", slug: "twitch" },
];

const LOGO_CLOUD_NAMED_CLIENTS = [
  { name: "Stripe",    slug: "stripe",    nameClassName: "font-sans font-semibold tracking-tight" },
  { name: "Figma",     slug: "figma",     invertDark: true, nameClassName: "font-sans font-semibold tracking-tight" },
  { name: "Framer",    slug: "framer",    nameClassName: "font-sans font-medium" },
  { name: "Linear",    slug: "linear",    invertDark: true, nameClassName: "font-sans font-medium tracking-tight" },
  { name: "Vercel",    slug: "vercel",    invertDark: true, nameClassName: "font-sans font-bold tracking-tight" },
  { name: "GitHub",    slug: "github",    invertDark: true, nameClassName: "font-sans font-semibold" },
  { name: "Notion",    slug: "notion",    invertDark: true, nameClassName: "font-sans font-medium" },
  { name: "Raycast",   slug: "raycast",   nameClassName: "font-sans font-semibold tracking-tight" },
  { name: "Loom",      slug: "loom",      nameClassName: "font-sans font-bold tracking-tight" },
  { name: "Intercom",  slug: "intercom",  nameClassName: "font-sans font-bold" },
  { name: "Twitch",    slug: "twitch",    nameClassName: "font-sans font-black tracking-tight" },
  { name: "Spotify",   slug: "spotify",   nameClassName: "font-sans font-black tracking-tight" },
];

// Card thumbnail — default grid variant
export function PreviewCinematicLogoCloud() {
  return (
    <div className="flex w-full items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950">
      <div className="w-full scale-75 sm:scale-100">
        <CinematicLogoCloud
          clients={LOGO_CLOUD_GRID_CLIENTS}
          className="bg-transparent dark:bg-transparent py-8"
        />
      </div>
    </div>
  );
}

// Section 1 — Cinematic stagger-in grid
export function PreviewCinematicLogoCloudGrid() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950">
      <CinematicLogoCloud
        clients={LOGO_CLOUD_GRID_CLIENTS}
        className="bg-transparent dark:bg-transparent py-10"
      />
    </div>
  );
}

// Section 2 — Scrolling marquee row
export function PreviewCinematicLogoCloudMarquee() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950">
      <CinematicLogoCloud
        clients={LOGO_CLOUD_MARQUEE_CLIENTS}
        variant="marquee"
        eyebrow="Integrates with your entire stack."
        className="bg-transparent dark:bg-transparent py-10"
      />
    </div>
  );
}

// Section 3 — Scrolling marquee with logo + name
export function PreviewCinematicLogoCloudNamed() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950">
      <CinematicLogoCloud
        clients={LOGO_CLOUD_NAMED_CLIENTS}
        variant="marquee-named"
        eyebrow="Used by teams at the world's best companies."
        className="bg-transparent dark:bg-transparent py-10"
      />
    </div>
  );
}

function countdownTarget(days: number, hours = 0, minutes = 0) {
  return new Date(
    Date.now() + ((days * 24 + hours) * 60 + minutes) * 60 * 1000,
  );
}

export function PreviewAnimatedCountdownModern() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.15),transparent_35%),linear-gradient(180deg,var(--background),var(--muted))] p-4 text-center dark:bg-zinc-950">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Launching in
      </p>
      <AnimatedCountdown
        targetDate={countdownTarget(7, 12, 45)}
        variant="modern"
        size="md"
      />
    </div>
  );
}

export function PreviewAnimatedCountdownDigital() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-cyan-400/10 bg-zinc-950 p-4">
      <AnimatedCountdown
        targetDate={countdownTarget(2, 8, 20)}
        variant="digital"
        size="md"
        showSeparators
      />
    </div>
  );
}

export function PreviewAnimatedCountdownMinimal() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-background p-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">Sale ends in</p>
      <AnimatedCountdown
        targetDate={countdownTarget(0, 11, 42)}
        variant="minimal"
        showDays={false}
        size="md"
      />
    </div>
  );
}

export function PreviewAnimatedCountdown({
  compact = true,
}: { compact?: boolean } = {}) {
  return compact ? (
    <PreviewAnimatedCountdownMinimal />
  ) : (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4">
      <PreviewAnimatedCountdownModern />
      <PreviewAnimatedCountdownDigital />
      <PreviewAnimatedCountdownMinimal />
    </div>
  );
}

export function PreviewShootingStarsGridHero() {
  return (
    <ShootingStarsGrid
      className="min-h-[560px] rounded-3xl"
      starCount={54}
      shootingStarCount={7}
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-200">
          Motion background
        </p>
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Build interfaces that feel alive
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          A subtle grid with ambient stars and straight light runners attached
          to the grid.
        </p>
      </div>
    </ShootingStarsGrid>
  );
}

export function PreviewShootingStarsGrid({
  compact = true,
}: { compact?: boolean } = {}) {
  return compact ? (
    <ShootingStarsGrid
      className="min-h-[380px] rounded-2xl"
      contentClassName="px-5 py-5"
      starCount={12}
      shootingStarCount={7}
      gridSize={34}
    >
      <div className="relative h-[260px] w-full max-w-[420px] overflow-hidden rounded-3xl border border-cyan-400/15 bg-white/35 shadow-2xl shadow-cyan-950/10 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/35">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.16)_1px,transparent_1px)] bg-[size:34px_34px] opacity-70 dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)]" />
        <motion.div
          className="absolute left-[34px] top-[68px] h-px w-[280px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_rgba(6,182,212,0.65)]"
          animate={{ x: [-70, 62, -70], opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[204px] top-[34px] h-[204px] w-px bg-gradient-to-b from-transparent via-cyan-300 to-transparent shadow-[0_0_18px_rgba(103,232,249,0.65)]"
          animate={{ y: [54, -30, 54], opacity: [0.2, 0.9, 0.2] }}
          transition={{
            duration: 5.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.35,
          }}
        />
        {[0, 1, 2, 3].map((index) => (
          <motion.span
            key={index}
            className="absolute size-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]"
            style={{
              left: `${68 + index * 68}px`,
              top: `${68 + (index % 2) * 102}px`,
            }}
            animate={{ scale: [0.8, 1.45, 0.8], opacity: [0.45, 1, 0.45] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.35,
            }}
          />
        ))}
        <motion.div
          className="absolute bottom-[34px] left-[68px] grid grid-cols-4 gap-[17px]"
          animate={{ opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className="size-[17px] rounded-md border border-cyan-400/25 bg-cyan-400/10 shadow-[0_0_16px_rgba(6,182,212,0.18)]"
            />
          ))}
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,transparent_0%,transparent_32%,rgba(255,255,255,0.55)_78%)] dark:bg-[radial-gradient(circle_at_50%_46%,transparent_0%,transparent_34%,rgba(7,9,15,0.75)_78%)]" />
      </div>
    </ShootingStarsGrid>
  ) : (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4">
      <PreviewShootingStarsGridHero />
    </div>
  );
}

export function PreviewHoverHighlightTextHero() {
  return (
    <div className="flex min-h-[620px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black px-5 py-14 text-center shadow-2xl shadow-black/40">
      <HoverHighlightText
        text="Build beautiful interfaces that users remember."
        as="h1"
        spotlightRadius={130}
        spotlightSoftness={0.82}
        baseClassName="max-w-5xl text-5xl font-semibold leading-[1.04] text-white/15 sm:text-6xl md:text-7xl"
        highlightClassName="max-w-5xl text-5xl font-semibold leading-[1.04] text-transparent sm:text-6xl md:text-7xl"
        strokeColor="rgba(255,255,255,0.72)"
        strokeWidth={0.9}
      />
    </div>
  );
}

export function PreviewHoverHighlightTextBanner() {
  return (
    <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black px-5 py-12 text-center">
      <HoverHighlightText
        text="Polished motion without the noise."
        as="h2"
        spotlightRadius={112}
        spotlightSoftness={0.82}
        baseClassName="max-w-4xl text-4xl font-semibold leading-tight text-white/15 sm:text-5xl md:text-6xl"
        highlightClassName="max-w-4xl text-4xl font-semibold leading-tight text-transparent sm:text-5xl md:text-6xl"
        strokeColor="rgba(255,255,255,0.72)"
      />
    </div>
  );
}

export function PreviewHoverHighlightText({
  compact = true,
}: { compact?: boolean } = {}) {
  return compact ? (
    <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black px-5 text-center">
      <HoverHighlightText
        text="Hover highlight reveal"
        as="h2"
        spotlightRadius={88}
        spotlightSoftness={0.82}
        baseClassName="text-4xl font-semibold leading-tight text-white/15 sm:text-5xl"
        highlightClassName="text-4xl font-semibold leading-tight text-transparent sm:text-5xl"
        strokeColor="rgba(255,255,255,0.72)"
      />
    </div>
  ) : (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4">
      <PreviewHoverHighlightTextHero />
      <PreviewHoverHighlightTextBanner />
    </div>
  );
}

// Code-to-char map used by detail-page keyboard previews
const KB_CODE_TO_CHAR: Record<string, string> = Object.fromEntries(
  MAC_ROWS.flat()
    .filter((k) => k.char && k.char !== "\t" && k.char !== "\n")
    .map((k) => [k.code, k.char]),
);

export function PreviewHeroAurora() {
  return (
    <div className="flex h-full min-h-[560px] w-full items-center justify-center p-6">
      <HeroAurora className="max-w-[980px]" />
    </div>
  );
}

export function PreviewBentoMetrics() {
  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center p-6">
      <BentoSignals className="max-w-[900px]" />
    </div>
  );
}

export function PreviewCardTilt() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-40, 40], [8, -8]), {
    stiffness: 260,
    damping: 20,
  });
  const ry = useSpring(useTransform(x, [-40, 40], [-8, 8]), {
    stiffness: 260,
    damping: 20,
  });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="flex h-[220px] items-center justify-center rounded-3xl border border-white/10 bg-zinc-950">
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
        className="relative h-44 w-72 rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5 shadow-2xl"
      >
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.25),transparent_55%)]" />
        <p className="text-xs text-foreground/55">Glass panel</p>
        <p className="mt-2 text-lg font-semibold text-white">3D hover depth</p>
        <p className="mt-2 text-sm text-zinc-400">
          Motion springs + perspective for premium product cards.
        </p>
      </motion.div>
    </div>
  );
}

export function PreviewNavbarFloating() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="lf-grid absolute inset-0 opacity-40" />
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto mt-10 flex max-w-xl items-center justify-between gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700" />
          <span className="text-sm font-semibold text-white">Nexus-UI</span>
        </div>
        <div className="hidden items-center gap-4 text-xs text-zinc-300 sm:flex">
          <span>Library</span>
          <span>Templates</span>
          <span>Pricing</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900"
        >
          Get access
        </motion.button>
      </motion.div>
      <p className="absolute bottom-6 left-6 text-xs text-zinc-500">
        Floating glass navigation with spring entrance.
      </p>
    </div>
  );
}

export function PreviewPricingToggle() {
  const [annual, setAnnual] = React.useState(true);
  const price = annual ? 29 : 39;
  return (
    <div className="flex h-[220px] flex-col justify-between rounded-3xl border border-white/10 bg-zinc-950 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-400">
            Premium
          </p>
          <p className="text-lg font-semibold text-white">
            Everything unlocked
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAnnual((v) => !v)}
          className="relative h-8 w-16 rounded-full border border-white/10 bg-white/5"
        >
          <motion.span
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="absolute top-1 left-1 h-6 w-6 rounded-full bg-foreground/20"
            animate={{ x: annual ? 0 : 32 }}
          />
        </button>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-semibold tracking-tight text-white">
            ${price}
          </p>
          <p className="text-xs text-zinc-400">per seat / month</p>
        </div>
        <motion.div
          key={annual ? "a" : "m"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/50 bg-muted/40 px-3 py-2 text-xs text-foreground/80"
        >
          {annual ? "Save 20% annually" : "Flexible monthly"}
        </motion.div>
      </div>
    </div>
  );
}

export function PreviewLoaderOrbit() {
  return (
    <div className="flex h-full min-h-[300px] w-full items-center justify-center p-6">
      <OrbitalLoader />
    </div>
  );
}

export function PreviewSpotlightPanel() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }
  const bg = useMotionTemplate`radial-gradient(240px circle at ${x}px ${y}px, rgba(244,114,182,0.35), transparent 60%)`;

  return (
    <div
      onMouseMove={onMove}
      className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6"
    >
      <motion.div
        style={{ backgroundImage: bg }}
        className="absolute inset-0"
      />
      <div className="relative space-y-2">
        <p className="text-xs text-zinc-400">Motion spotlight</p>
        <p className="text-xl font-semibold text-white">
          Trace the cursor glow
        </p>
        <p className="text-sm text-zinc-400">
          Subtle, performant gradients that follow interaction.
        </p>
      </div>
    </div>
  );
}

export function PreviewAiBar() {
  const [value, setValue] = React.useState("");
  return (
    <div className="flex h-[220px] flex-col justify-end rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 p-4">
      <motion.div
        layout
        className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Sparkles className="size-3 text-foreground/70" />
          Ask Nexus-UI to scaffold a hero…
        </div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-foreground/20"
          placeholder="Describe the interface you want…"
        />
        <div className="mt-2 flex justify-end">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="rounded-full bg-foreground/90 px-3 py-1 text-xs font-semibold text-background"
          >
            Generate layout
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export function PreviewTimeline() {
  return (
    <div className="flex h-full min-h-[520px] w-full items-center justify-center p-6">
      <MilestoneTimeline className="max-w-[720px]" />
    </div>
  );
}

export function PreviewFaq() {
  return (
    <div className="flex h-full min-h-[480px] w-full items-center justify-center p-6">
      <MotionFaq className="max-w-[940px]" />
    </div>
  );
}

export function PreviewTestimonialStack() {
  return (
    <div className="flex h-full min-h-[520px] w-full items-center justify-center p-6">
      <DepthTestimonials className="max-w-[760px]" />
    </div>
  );
}

export function PreviewLoginGlass() {
  return (
    <div className="flex h-full min-h-[560px] w-full items-center justify-center p-6">
      <GlassLogin className="max-w-[880px]" />
    </div>
  );
}

export function PreviewFooterMini() {
  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center p-6">
      <OrbitFooter className="max-w-[980px]" />
    </div>
  );
}

export function PreviewShaderNoise() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        }}
        animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative flex h-full items-center justify-center text-center text-sm text-zinc-200">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-foreground/55">
            Shaders
          </p>
          <p className="mt-2 font-semibold">SVG turbulence noise field</p>
        </div>
      </div>
    </div>
  );
}

export function PreviewSidebarShell() {
  return (
    <div className="flex h-full min-h-[560px] w-full items-center justify-center p-6">
      <div className="flex h-[672px] w-full max-w-[920px] gap-2 rounded-[28px] border border-zinc-200/80 bg-zinc-100 p-2 dark:border-white/10 dark:bg-zinc-900">
        <WorkbenchSidebar />
        <div className="min-w-0 flex-1 rounded-[22px] bg-white p-6 dark:bg-zinc-950">
          <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">Northwind · Overview</p>
          <p className="mt-1 text-[22px] font-semibold tracking-[-0.03em] text-zinc-950 dark:text-white">Good morning, Ada</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { k: "Deploys", v: "128", d: "+12%" },
              { k: "Open issues", v: "23", d: "-4" },
              { k: "Build time", v: "41s", d: "-8s" },
            ].map((c) => (
              <div key={c.k} className="rounded-2xl border border-zinc-200/80 p-4 dark:border-white/10">
                <p className="text-[12px] text-zinc-500 dark:text-zinc-400">{c.k}</p>
                <p className="mt-1 text-[24px] font-semibold tabular-nums tracking-[-0.03em] text-zinc-950 dark:text-white">{c.v}</p>
                <p className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">{c.d} this week</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-2xl border border-zinc-200/80 p-4 dark:border-white/10">
            <p className="text-[13px] font-medium text-zinc-950 dark:text-white">Recent activity</p>
            <ul className="mt-3 space-y-3 text-[13px] text-zinc-600 dark:text-zinc-400">
              {[
                ["Mei merged", "Pricing page v3", "2m"],
                ["Tomás deployed", "api@1.18.0 to production", "18m"],
                ["Jonah opened", "Dark mode for charts", "1h"],
              ].map(([who, what, when]) => (
                <li key={what} className="flex items-center justify-between gap-3">
                  <span className="truncate"><span className="font-medium text-zinc-950 dark:text-white">{who}</span> {what}</span>
                  <span className="shrink-0 tabular-nums text-zinc-400">{when}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3 rounded-2xl border border-zinc-200/80 p-4 dark:border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-zinc-950 dark:text-white">Deploys per day</p>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Last 14 days</p>
            </div>
            <div className="mt-3 flex h-24 items-end gap-1.5">
              {[34, 52, 41, 66, 48, 72, 58, 44, 80, 62, 75, 54, 88, 70].map((v, i) => (
                <span
                  key={i}
                  className={cn("flex-1 rounded-t-[4px]", i === 12 ? "bg-indigo-500" : "bg-zinc-200 dark:bg-white/10")}
                  style={{ height: `${v}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PreviewDashboardKpi() {
  return (
    <div className="flex h-full min-h-[300px] w-full items-center justify-center p-6">
      <KpiStrip className="max-w-[960px]" />
    </div>
  );
}

export function PreviewBlogRail() {
  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center p-6">
      <EditorialRail className="max-w-[980px]" />
    </div>
  );
}

export function PreviewContactSplit() {
  return (
    <div className="flex h-full min-h-[520px] w-full items-center justify-center p-6">
      <SplitContact className="max-w-[940px]" />
    </div>
  );
}

export function PreviewCtaGlow() {
  return (
    <div className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <motion.div
        className="absolute size-40 rounded-full bg-foreground/8 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute size-40 rounded-full bg-foreground/6 blur-3xl"
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="lf-glow relative rounded-full bg-white px-6 py-2 text-sm font-semibold text-zinc-950"
      >
        Start building faster
      </motion.button>
    </div>
  );
}

export function PreviewGlowButton() {
  return (
    <div className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.09),transparent_34%),#050505]">
      <GlowButton href="#preview">Get Started Now</GlowButton>
    </div>
  );
}

export function PreviewWordMagnet() {
  return (
    <div className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-[radial-gradient(circle_at_50%_25%,rgba(34,197,94,.16),transparent_34%),#f8fafc] px-6 dark:border-white/10 dark:bg-[radial-gradient(circle_at_50%_25%,rgba(45,212,191,.14),transparent_34%),#050505]">
      <WordMagnet
        text="Move your cursor through this magnetic headline and watch every word gently drift aside before snapping back into a clean readable rhythm"
        radius={118}
        force={0.42}
        damping={24}
        returnDelay={260}
        disableOnMobile={false}
        className="max-w-2xl text-2xl leading-tight sm:text-3xl"
        wordClassName="rounded-lg px-0.5"
      />
    </div>
  );
}

export function PreviewThreeDFolder() {
  return (
    <div className="grid min-h-[360px] overflow-hidden rounded-3xl border border-zinc-200 bg-[radial-gradient(circle_at_20%_20%,rgba(251,113,133,.18),transparent_32%),#f8fafc] p-5 dark:border-white/10 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(251,113,133,.12),transparent_32%),#050505] md:grid-cols-[0.95fr_1.05fr] md:p-7">
      <div className="flex items-center justify-center">
        <ThreeDFolder
          title="Launch Assets"
          folderBackColor="#fb7185"
          folderFrontColor="#facc15"
          folderTabColor="#f97316"
          className="scale-[0.92]"
        />
      </div>
      <div className="flex flex-col justify-center px-2 py-6 md:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-rose-500/80 dark:text-rose-300/70">
          Portfolio folder
        </p>
        <h3 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          Hover the folder to reveal stacked project previews.
        </h3>
        <p className="mt-4 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          A compact interactive card for project archives, case studies, moodboards,
          product shots, or any visual collection that deserves a little depth.
        </p>
      </div>
    </div>
  );
}

export function PreviewThreeDFolderMini() {
  return (
    <div className="grid min-h-[360px] overflow-hidden rounded-3xl border border-zinc-200 bg-[radial-gradient(circle_at_20%_20%,rgba(251,113,133,.18),transparent_32%),#f8fafc] p-5 dark:border-white/10 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(251,113,133,.12),transparent_32%),#050505] md:grid-cols-[0.95fr_1.05fr] md:p-7">
      <div className="flex items-center justify-center">
        <ThreeDFolder
          title="Launch Assets"
          size="sm"
          folderBackColor="#fb7185"
          folderFrontColor="#facc15"
          folderTabColor="#f97316"
        />
      </div>
      <div className="flex flex-col justify-center px-2 py-6 md:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-rose-500/80 dark:text-rose-300/70">
          Portfolio folder
        </p>
        <h3 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          Hover the folder to reveal stacked project previews.
        </h3>
        <p className="mt-4 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          A compact interactive card for project archives, case studies, moodboards,
          product shots, or any visual collection that deserves a little depth.
        </p>
      </div>
    </div>
  );
}

export function PreviewRealTimeCursors() {
  return (
    <div className="w-full rounded-3xl">
      <RealTimeCursors className="w-full rounded-3xl" />
    </div>
  );
}

export function PreviewFaqFolderCard() {
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-white">
      <div data-tile-focus className="w-[940px] shrink-0">
        <FaqFolderCard className="p-0" />
      </div>
    </div>
  );
}

export function PreviewContactPageBlock() {
  return <ContactPageBlockPreview />;
}

export function PreviewTextAnimationsBlock() {
  return <TextAnimationsBlockPreview />;
}

export function PreviewBlogContentSectionsBlock() {
  return <BlogContentSectionsBlockPreview />;
}

export function PreviewPricingPlanSelector() {
  return <RadioPlanPricingPreview />;
}

export function PreviewSimpleSidebar() {
  // real size; the tall gallery tile frames the left of it (tile-fit.config.json focus): the sidebar and the first cards
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      <div data-tile-focus className="w-[1000px] shrink-0 [&>div]:!h-[800px] [&>div]:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]">
        <SimpleSidebar />
      </div>
    </div>
  );
}

export function PreviewCollapsibleSidebar() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-white dark:bg-neutral-950">
      <div className="absolute left-1/2 top-1/2 w-[820px] -translate-x-1/2 -translate-y-1/2 scale-[0.62]">
        <CollapsibleSidebar />
      </div>
    </div>
  );
}

export function PreviewGroupedSidebar() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-white dark:bg-neutral-950">
      <div className="absolute left-1/2 top-1/2 w-[820px] -translate-x-1/2 -translate-y-1/2 scale-[0.62]">
        <GroupedSidebar />
      </div>
    </div>
  );
}

export function PreviewSignupSplit() {
  return (
    <div className="flex h-full min-h-[480px] w-full items-center justify-center p-6">
      <SplitSignup className="max-w-[920px]" />
    </div>
  );
}

export function PreviewSignupForm({
  compact = true,
}: { compact?: boolean } = {}) {
  if (compact) {
    return (
      <div className="flex h-auto min-h-[440px] w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-background p-4 sm:p-6">
        <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-base font-semibold text-foreground">
            Create your account
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start building for free
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-10 rounded-xl border border-border bg-muted/30" />
            <div className="h-10 rounded-xl border border-border bg-muted/30" />
          </div>
          <div className="mt-3 h-10 rounded-xl border border-border bg-muted/30" />
          <div className="mt-3 h-10 rounded-xl border border-border bg-muted/30" />
          <div className="mt-3 h-10 rounded-xl bg-primary/90" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-3xl border border-border p-3",
        "h-full min-h-[620px]",
      )}
    >
      <div
        className={cn(
          "card bg-base-100 shadow-sm rounded-xl border border-border bg-background",
          "w-full max-w-md",
        )}
      >
        <div className="card-body p-4 md:p-6">
          <h2 className="card-title text-lg font-semibold text-foreground">
            Welcome to Nexus-UI
          </h2>
          <p className="text-sm text-muted-foreground">
            Create your account to save favorites and access premium component
            docs.
          </p>
          <SignupForm
            className="w-full max-w-none border-0 bg-transparent p-0 shadow-none dark:bg-transparent"
            title="Create account"
            subtitle="Join Nexus-UI"
            submitLabel="Sign up"
            loadingLabel="Creating..."
            successLabel="Created"
            minPasswordLength={6}
            onSubmit={async () => {
              await new Promise<void>((resolve) => setTimeout(resolve, 700));
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function PreviewLoginForm({ compact = true }: { compact?: boolean } = {}) {
  if (compact) {
    return (
      <div className="flex h-auto min-h-[440px] w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-background p-4 sm:p-6">
        <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-base font-semibold text-foreground">Welcome back</p>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
          <div className="mt-4 h-10 rounded-xl border border-border bg-muted/30" />
          <div className="mt-3 h-10 rounded-xl border border-border bg-muted/30" />
          <div className="mt-3 h-10 rounded-xl bg-primary/90" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center rounded-3xl border border-border p-3", "h-full min-h-[540px]")}>
      <div className="w-full max-w-md rounded-xl border border-border bg-background">
        <div className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-foreground">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Sign in to your Nexus-UI account.</p>
          <LoginForm
            className="mt-4 w-full max-w-none border-0 bg-transparent p-0 shadow-none dark:bg-transparent"
            title=""
            subtitle=""
            submitLabel="Sign in"
            loadingLabel="Signing in..."
            successLabel="Signed in"
            onSubmit={async () => {
              await new Promise<void>((resolve) => setTimeout(resolve, 700));
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function PreviewFeatureGrid() {
  return (
    <div className="flex h-full min-h-[560px] w-full items-center justify-center p-6">
      <LatticeFeatures className="max-w-[900px]" />
    </div>
  );
}

export function PreviewBeamSweep() {
  return (
    <div className="flex h-full min-h-[440px] w-full items-center justify-center p-6">
      <BeamField className="max-w-[960px]" />
    </div>
  );
}

export function PreviewInteractiveDots() {
  return (
    <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden bg-[#05070d]">
      <InteractiveDots
        mode="lines"
        dotSpacing={30}
        dotSize={2.2}
        interactionRadius={130}
        repulsionStrength={44}
        lineDistance={70}
        lineOpacity={0.32}
        showToggle={false}
        className="!absolute inset-0 h-full min-h-0 rounded-none border-0"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent,rgba(0,0,0,0.55)_80%)]" />
      <div data-tile-focus className="pointer-events-none relative flex h-[820px] w-[560px] shrink-0 flex-col justify-end pb-16">
        <p className="w-fit rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[14px] font-medium text-white/75">
          Fieldwork 2.0 is out
        </p>
        <h2 className="mt-5 text-[52px] font-semibold leading-[1.02] tracking-[-0.04em] text-white">
          See where your users actually look.
        </h2>
        <p className="mt-5 text-[18px] leading-7 text-white/65">
          Attention maps for every page, and which part of the layout is doing the work.
        </p>
        <div className="mt-7 flex gap-3">
          <span className="rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-zinc-950">Start free trial</span>
          <span className="rounded-full border border-white/15 px-5 py-2.5 text-[15px] font-semibold text-white">Watch demo</span>
        </div>
      </div>
    </div>
  );
}

export function PreviewLayeredWaveBackground() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <LayeredWaveBackground
        gradientColors={["#7c3aed", "#06b6d4", "#ec4899"]}
        backgroundColor="#020617"
        waveLayers={5}
        waveWidth={1.2}
        waveHeight={1.06}
        blurIntensity={20}
        opacity={0.72}
        speed="medium"
        className="h-full min-h-0 rounded-3xl"
      >
        <div className="flex h-full items-center px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">
              Animated
            </p>
            <p className="mt-2 max-w-56 text-xl font-semibold leading-tight text-white">
              Layered gradient waves
            </p>
          </div>
        </div>
      </LayeredWaveBackground>
    </div>
  );
}

export function PreviewSquigglyText({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={
        compact
          ? "flex min-h-[180px] w-full min-w-0 flex-col justify-center px-4 py-8"
          : "flex min-h-[260px] w-full min-w-0 flex-col items-center justify-center px-4 py-12 sm:py-16"
      }
    >
      {compact ? (
        <SquigglyText
          as="div"
          text="Motion that sells."
          textClassName="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-2xl"
          steps={5}
          stepDuration={90}
          scale={[5, 7]}
          baseFrequency={0.022}
          numOctaves={3}
        />
      ) : (
        <SquigglyDrinksHeadline />
      )}
    </div>
  );
}

const previewDockItems = [
  { title: "Home", icon: <Home />, href: "/" },
  { title: "Components", icon: <LayoutGrid />, href: "/components" },
  { title: "Templates", icon: <Layers />, href: "/templates" },
  { title: "Pricing", icon: <DollarSign />, href: "/pricing" },
  { title: "Docs", icon: <BookOpen />, href: "/docs/installation" },
  { title: "Search", icon: <Search />, href: "/search" },
  { title: "Profile", icon: <User />, href: "/login" },
];

export function PreviewFloatingDock({
  compact = true,
}: { compact?: boolean } = {}) {
  const items = compact ? previewDockItems.slice(0, 5) : previewDockItems;
  return (
    <div
      className={cn(
        "relative flex w-full items-end justify-center overflow-visible rounded-xl bg-gradient-to-b from-muted/45 to-zinc-950/80 dark:from-zinc-950/85 dark:to-zinc-950/40",
        compact ? "min-h-[440px]" : "min-h-[240px]",
      )}
    >
      <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4">
        <FloatingDockDesktop
          className="relative bottom-auto left-auto flex items-end justify-center rounded-full border border-border/60 bg-background/80 px-4 py-1 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/85"
          items={items}
          disableLinks
        />
      </div>
    </div>
  );
}

export function PreviewStatefulButton() {
  async function fakeAction() {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1300);
    });
  }
  return (
    <div className="flex min-h-[440px] items-center justify-center rounded-xl border border-border bg-muted/35 dark:bg-zinc-950/70">
      <StatefulButton
        onClick={fakeAction}
        loadingText="Send message"
        successText="Send message"
        className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-2.5 font-medium text-white ring-offset-2 transition duration-200 hover:ring-2 hover:ring-green-500 dark:ring-offset-black"
        successIcon={<CheckCircle2 className="size-4" />}
        resetDelay={1600}
      >
        Send message
      </StatefulButton>
    </div>
  );
}

export function PreviewSparklesLine({
  compact = true,
}: { compact?: boolean } = {}) {
  const headingClass = compact
    ? "text-3xl"
    : "md:text-7xl text-3xl lg:text-9xl";
  return (
    <div className={cn("w-full", compact ? "h-[220px]" : "h-[40rem]")}>
      <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black">
        <h1
          className={cn(
            "relative z-20 text-center font-bold text-white",
            headingClass,
          )}
        >
          NEXUS-UI
        </h1>
        <div
          className={cn(
            "relative",
            compact ? "h-28 w-[18rem]" : "h-40 w-[40rem]",
          )}
        >
          <div className="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
          <div className="absolute inset-x-20 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="absolute inset-x-60 top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
          <div className="absolute inset-x-60 top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
          <div className="h-full w-full opacity-100">
            <SparklesParticles
              className="h-full w-full"
              count={compact ? 180 : 260}
              density="high"
              color="#a8d7ff"
              minSize={0.55}
              maxSize={1.45}
              speed={1.15}
              opacity={0.95}
              direction="down"
              enableGlow
            />
          </div>
          <div className="absolute inset-0 h-full w-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]" />
        </div>
      </div>
    </div>
  );
}

export function PreviewSparklesStarfield({
  compact = true,
}: { compact?: boolean } = {}) {
  const headingClass = compact
    ? "text-2xl"
    : "md:text-7xl text-3xl lg:text-8xl";
  return (
    <div className={cn("w-full", compact ? "h-[220px]" : "h-[40rem]")}>
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black">
        <SparklesParticles
          background
          count={compact ? 96 : 145}
          density="high"
          color="#e6f3ff"
          minSize={compact ? 0.7 : 0.85}
          maxSize={compact ? 2 : 2.6}
          speed={0.95}
          opacity={1}
          direction="random"
          enableGlow
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_50%,transparent_0%,rgba(0,0,0,0.28)_100%)]" />
        <p
          className={cn(
            "relative z-20 text-center font-bold text-white",
            headingClass,
          )}
        >
          Build great products
        </p>
      </div>
    </div>
  );
}

export function PreviewSparkles({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "grid w-full gap-3",
        compact ? "grid-rows-2" : "grid-rows-2 gap-4",
      )}
    >
      <PreviewSparklesLine compact={compact} />
      <PreviewSparklesStarfield compact={compact} />
    </div>
  );
}

export function PreviewGooeySearch() {
  return (
    <div className="flex min-h-[380px] items-center justify-center">
      <GooeyInput
        placeholder="Search catalog…"
        collapsedWidth={160}
        expandedWidth={260}
        expandedOffset={80}
      />
    </div>
  );
}

export function PreviewTerminal({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div className="flex w-full flex-col gap-3">
      {!compact && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/30">
          <Volume2 className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
          <div className="flex-1 text-sm text-amber-800 dark:text-amber-300">
            <span className="font-medium">Keyboard sounds require a sound file.</span>{" "}
            Download{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900/50">sound.ogg</code>{" "}
            and place it at{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900/50">public/sounds/sound.ogg</code>.
            Without it the terminal falls back to a synthetic click.
          </div>
          <a
            href="/sounds/sound.ogg"
            download="sound.ogg"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600 active:scale-95"
          >
            <Download className="size-3.5" aria-hidden />
            Download
          </a>
        </div>
      )}
      <div className="flex h-[min(420px,58vh)] min-h-[300px] w-full flex-col">
      <Terminal
        className="min-h-0 flex-1"
        fillHeight
        theme="carbon"
        autoStart
        loop
        startupDelay={350}
        loopDelay={900}
        typingSpeed={22}
        typingJitter={28}
        delayBetweenCommands={650}
        showControls={false}
        showSoundToggle={!compact}
        enableSound={!compact}
        username="user"
        hostname="Nexus-Macbook"
        commands={[
          {
            input: "npm install",
            runDelayMs: 500,
            output: [{ text: "added 182 packages in 3s", tone: "muted" }],
          },
          {
            input: "pnpm dev",
            runDelayMs: 450,
            output: [
              { text: "ready - http://localhost:3000", tone: "success" },
            ],
          },
          {
            input: "git status",
            runDelayMs: 350,
            output: [
              { text: "On branch main — nothing to commit", tone: "muted" },
            ],
          },
          {
            input: "curl -I https://nexus-ui.com",
            runDelayMs: 400,
            output: [{ text: "HTTP/2 200", tone: "success" }],
          },
          {
            input: 'echo "Nexus UI"',
            runDelayMs: 250,
            output: [{ text: "Nexus UI", tone: "info" }],
          },
        ]}
      />
    </div>
    </div>
  );
}

export function PreviewTextGenerateEffect({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 px-5",
        compact ? "min-h-[190px]" : "min-h-[280px] py-10",
      )}
    >
      <div className="max-w-3xl text-center">
        <TextGenerateEffect
          as="h2"
          mode={compact ? "word" : "character"}
          text="Build elegant interfaces that feel alive, readable, and deeply polished from the very first impression."
          className={cn(
            "text-balance font-semibold tracking-tight text-foreground",
            compact ? "text-3xl" : "text-5xl lg:text-6xl",
          )}
          duration={0.4}
          stagger={compact ? 0.065 : 0.02}
          blur
        />
      </div>
    </div>
  );
}

export function PreviewTypewriterEffect({
  compact = true,
}: { compact?: boolean } = {}) {
  const prefixText = "Ship delightful interfaces with ";
  const baseSpeed = compact ? 36 : 44;
  const accentDelay = prefixText.length * baseSpeed;

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 px-5",
        compact ? "min-h-[190px]" : "min-h-[280px] py-10",
      )}
    >
      <div className="flex w-full justify-center text-center">
        <h2
          className={cn(
            "text-balance font-semibold tracking-tight text-foreground",
            compact ? "text-2xl" : "text-5xl lg:text-6xl",
          )}
        >
          <TypewriterEffect
            as="span"
            text={prefixText}
            typingSpeed={baseSpeed}
            deletingSpeed={0}
            pauseDuration={compact ? 900 : 1200}
            loop={false}
            showCursor={false}
          />
          <TypewriterEffect
            as="span"
            text="Nexus-UI"
            typingSpeed={compact ? 44 : 54}
            deletingSpeed={0}
            delay={accentDelay}
            pauseDuration={compact ? 900 : 1200}
            loop={false}
            className="text-primary"
            cursorClassName="bg-primary"
          />
        </h2>
      </div>
    </div>
  );
}

export function PreviewTextRevealCard({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[280px]" : "min-h-[420px] py-10",
      )}
    >
      <TextRevealCard
        title="Ship with confidence, not guesswork."
        description="Hover over the text area to see the magic."
        intensity={compact ? 1.05 : 1.2}
        className={cn(
          "w-full border-white/10 bg-[#070a14] text-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.9)]",
          compact ? "max-w-xl" : "max-w-2xl",
        )}
        revealContent="I ship the final narrative"
        revealClassName={cn(
          "border-white/10 bg-gradient-to-t from-white/5 via-white/[0.02] to-transparent",
          compact
            ? "[&_p]:text-4xl [&_p]:font-semibold [&_p]:tracking-tight"
            : "[&_p]:text-6xl [&_p]:font-semibold [&_p]:tracking-tight",
        )}
      />
    </div>
  );
}

export function PreviewMeteors({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[420px] max-h-[420px]" : "min-h-[500px] py-14",
      )}
    >
      <Meteors
        number={compact ? 32 : 28}
        minDelay={0.06}
        maxDelay={1.9}
        minDuration={2.8}
        maxDuration={5.6}
        angle={214}
        color="#93c5fd"
        intensity={compact ? "medium" : "high"}
        className={cn(
          "w-full overflow-hidden rounded-2xl border border-white/10 bg-[#050911] text-white",
          compact
            ? "max-w-2xl min-h-[260px] px-7 py-16"
            : "max-w-4xl min-h-[360px] px-10 py-24",
        )}
      >
        <div className="relative z-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-200/80">
            Meteor Effect
          </p>
          <h3
            className={cn(
              "mt-2 font-semibold tracking-tight",
              compact ? "text-2xl" : "text-4xl",
            )}
          >
            Diagonal cinematic beams
          </h3>
          <p
            className={cn(
              "mx-auto mt-3 max-w-2xl text-slate-300/85",
              compact ? "text-xs" : "text-sm",
            )}
          >
            Reusable motion background for heroes, cards, and pricing sections.
          </p>
        </div>
      </Meteors>
    </div>
  );
}

export function PreviewInfiniteMovingCards({
  compact = true,
}: { compact?: boolean } = {}) {
  const items = [
    {
      id: "imc-1",
      title: "Motion-ready templates",
      description:
        "Seamless loops that keep content dynamic without visual jumps.",
      name: "Ariana",
      role: "Product lead",
      rating: 5,
      tags: ["Testimonials"],
    },
    {
      id: "imc-2",
      title: "Smooth and performant",
      description:
        "Linear marquee motion with hover pause for better readability.",
      name: "Marcus",
      role: "Frontend engineer",
      rating: 5,
      tags: ["Framer Motion"],
    },
    {
      id: "imc-3",
      title: "Built for launch pages",
      description:
        "Use for logo strips, reviews, case studies, and showcase rails.",
      name: "Lena",
      role: "Design manager",
      rating: 4,
      tags: ["Marketing"],
    },
  ];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[260px]" : "min-h-[360px] py-10",
      )}
    >
      <InfiniteMovingCards
        items={items}
        direction="left"
        speed={compact ? "normal" : "fast"}
        pauseOnHover
        className={cn("w-full", compact ? "max-w-3xl" : "max-w-5xl")}
        cardClassName={
          compact
            ? "min-w-[270px] max-w-[270px]"
            : "min-w-[320px] max-w-[320px]"
        }
      />
    </div>
  );
}

export function PreviewGlowingEffectCards({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[280px] max-h-[280px]" : "min-h-[520px] py-12",
      )}
    >
      <div
        className={cn(
          "w-full",
          compact ? "max-w-5xl scale-[0.78] origin-center" : "max-w-6xl",
        )}
      >
        <GlowingCardsLayout />
      </div>
    </div>
  );
}

export function PreviewBackgroundGradient({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl",
        compact ? "min-h-[280px] max-h-[280px]" : "min-h-[260px] py-8",
      )}
    >
      <BackgroundGradient
        as="section"
        className={cn(
          "w-full rounded-2xl border-2",
          compact ? "max-w-md" : "max-w-sm aspect-[4/5]",
        )}
        containerClassName={cn(
          "rounded-[inherit] space-y-3",
          compact ? "p-4" : "p-7",
        )}
        surfaceClassName="bg-white dark:bg-white"
        colors={["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]}
        animationSpeed={compact ? 1 : 1.25}
        blur={compact ? 20 : 30}
        interactive
      >
        <div className="overflow-hidden rounded-xl border-2 border-border/70">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80"
            alt="Abstract UI gradient"
            className={cn(
              "h-full w-full object-cover transition duration-500",
              compact ? "max-h-32" : "max-h-48",
            )}
            loading="lazy"
          />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Background Gradient
        </p>
        <h3
          className={cn(
            "font-semibold tracking-tight text-foreground",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          Animated glow wrapper for premium cards
        </h3>
        <p
          className={cn(
            "leading-relaxed text-muted-foreground",
            compact ? "text-xs" : "text-sm",
          )}
        >
          Use this component to frame cards, call-to-action blocks, and content
          panels with a soft animated glow while keeping all text highly
          readable on a clean inner surface.
        </p>
      </BackgroundGradient>
    </div>
  );
}

export function PreviewKeyboard({
  compact = true,
}: { compact?: boolean } = {}) {
  const physical = usePhysicalKeyboard();
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl",
        compact ? "p-2 sm:p-4" : "p-6",
      )}
    >
      <MacKeyboard
        layout="mac"
        enableSound
        volume={0.5}
        soundType="mechanical"
        activeKeys={physical}
        showFunctionRow={!compact}
        theme="dark"
      />
    </div>
  );
}

const SOUND_OPTS: { v: SoundType; l: string }[] = [
  { v: "mechanical", l: "Mechanical" },
  { v: "clicky", l: "Clicky" },
  { v: "soft", l: "Soft" },
];

export function PreviewKeyboardWithSoundDetail({
  compact = true,
}: { compact?: boolean } = {}) {
  const [text, setText] = React.useState("");
  const [muted, setMuted] = React.useState(false);
  const [soundType, setSoundType] = React.useState<SoundType>("mechanical");
  const [showFn, setShowFn] = React.useState(!compact);
  const [virtualKeys, setVirtualKeys] = React.useState<string[]>([]);

  const physicalKeys = usePhysicalKeyboard();
  const { play } = useKeyboardSound({
    enabled: !muted,
    volume: 0.65,
    soundType,
  });

  const activeKeys = React.useMemo(
    () => [...new Set([...physicalKeys, ...virtualKeys])],
    [physicalKeys, virtualKeys],
  );

  React.useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (e.metaKey && e.key !== "Meta") return;
      if (e.ctrlKey && e.key !== "Control") return;
      const variant =
        e.code === "Space"
          ? "space"
          : e.code === "Enter"
            ? "enter"
            : e.code === "Backspace"
              ? "delete"
              : e.code.startsWith("Shift") ||
                  e.code.startsWith("Meta") ||
                  e.code.startsWith("Alt") ||
                  e.code.startsWith("Control") ||
                  e.code === "CapsLock" ||
                  e.code === "Tab"
                ? "modifier"
                : ("normal" as const);
      play(variant);
      setText((prev) => {
        if (e.code === "Backspace") return prev.slice(0, -1);
        const ch = KB_CODE_TO_CHAR[e.code];
        return ch ? prev + ch : prev;
      });
    }
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [play]);

  const handleVirtualKey = React.useCallback((key: KbKeyDef) => {
    setVirtualKeys((p) => [...p, key.code]);
    setTimeout(
      () => setVirtualKeys((p) => p.filter((c) => c !== key.code)),
      140,
    );
    setText((prev) => {
      if (key.code === "Backspace") return prev.slice(0, -1);
      if (key.char === "\n") return prev;
      if (key.char) return prev + key.char;
      return prev;
    });
  }, []);

  return (
    <div className="w-full space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-foreground">
          Keyboard 1 — With Mechanical Sound
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            muted
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-primary/35 bg-primary/10 text-primary hover:bg-primary/15",
          )}
        >
          {muted ? "Muted" : "Sound on"}
        </button>
        <div className="flex gap-1">
          {SOUND_OPTS.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setSoundType(o.v)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                soundType === o.v
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border/70 bg-muted/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {o.l}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowFn((f) => !f)}
          className="rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          {showFn ? "Fn row on" : "Fn row off"}
        </button>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
        <p className="min-h-[2rem] break-all font-mono text-sm text-foreground">
          {text || (
            <span className="text-muted-foreground/50">
              Click keys or type…
            </span>
          )}
          <span className="ml-px inline-block h-[1em] w-[2px] animate-pulse bg-primary align-middle" />
        </p>
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            className="mt-1 text-[11px] text-muted-foreground hover:text-destructive"
          >
            Clear
          </button>
        )}
      </div>

      <MacKeyboard
        layout="mac"
        enableSound={!muted}
        volume={0.65}
        soundType={soundType}
        activeKeys={activeKeys}
        showFunctionRow={showFn}
        theme="auto"
        onKeyPress={handleVirtualKey}
      />
    </div>
  );
}

export function PreviewKeyboardSilentDetail({
  compact = true,
}: { compact?: boolean } = {}) {
  const [text, setText] = React.useState("");
  const [showFn, setShowFn] = React.useState(!compact);
  const [virtualKeys, setVirtualKeys] = React.useState<string[]>([]);

  const physicalKeys = usePhysicalKeyboard();

  const activeKeys = React.useMemo(
    () => [...new Set([...physicalKeys, ...virtualKeys])],
    [physicalKeys, virtualKeys],
  );

  React.useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (e.metaKey && e.key !== "Meta") return;
      if (e.ctrlKey && e.key !== "Control") return;
      setText((prev) => {
        if (e.code === "Backspace") return prev.slice(0, -1);
        const ch = KB_CODE_TO_CHAR[e.code];
        return ch ? prev + ch : prev;
      });
    }
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, []);

  const handleVirtualKey = React.useCallback((key: KbKeyDef) => {
    setVirtualKeys((p) => [...p, key.code]);
    setTimeout(
      () => setVirtualKeys((p) => p.filter((c) => c !== key.code)),
      140,
    );
    setText((prev) => {
      if (key.code === "Backspace") return prev.slice(0, -1);
      if (key.char === "\n") return prev;
      if (key.char) return prev + key.char;
      return prev;
    });
  }, []);

  return (
    <div className="w-full space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-foreground">
          Keyboard 2 — Without Sound
        </p>
        <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          No audio
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowFn((f) => !f)}
          className="rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          {showFn ? "Fn row on" : "Fn row off"}
        </button>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
        <p className="min-h-[2rem] break-all font-mono text-sm text-foreground">
          {text || (
            <span className="text-muted-foreground/50">
              Click keys or type…
            </span>
          )}
          <span className="ml-px inline-block h-[1em] w-[2px] animate-pulse bg-primary align-middle" />
        </p>
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            className="mt-1 text-[11px] text-muted-foreground hover:text-destructive"
          >
            Clear
          </button>
        )}
      </div>

      <MacKeyboard
        layout="mac"
        enableSound={false}
        activeKeys={activeKeys}
        showFunctionRow={showFn}
        theme="auto"
        onKeyPress={handleVirtualKey}
      />
    </div>
  );
}

export function PreviewEncryptedText({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 rounded-xl bg-zinc-950 px-6",
        compact ? "min-h-[280px] py-6" : "min-h-[420px] py-14",
      )}
    >
      <EncryptedText
        text="ACCESS GRANTED"
        trigger="load"
        loop
        loopDelay={1800}
        speed={55}
        shuffleSpeed={28}
        iterations={8}
        className={cn(
          "font-bold tracking-[0.18em] text-white",
          compact ? "text-2xl" : "text-4xl",
        )}
      />
      <EncryptedText
        text="DECRYPTING DATA..."
        trigger="load"
        loop
        loopDelay={2400}
        speed={38}
        shuffleSpeed={22}
        iterations={5}
        revealDelay={700}
        className={cn(
          "tracking-[0.22em] text-foreground/60",
          compact ? "text-xs" : "text-sm",
        )}
      />
    </div>
  );
}

export function PreviewBackgroundBoxes({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <BackgroundBoxes
      rows={80}
      cols={60}
      boxWidth={64}
      boxHeight={32}
      borderColor="#374151"
      showCrosses
      crossColor="#374151"
      className={cn(
        "w-full bg-zinc-950",
        compact ? "h-[420px]" : "h-[600px]",
      )}
    />
  );
}

// ── Images Badge previews ─────────────────────────────────────────────────────
const IB_TEAM = [
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
    alt: "Felix",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede",
    alt: "Aneka",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Milo&backgroundColor=d1d4f9",
    alt: "Milo",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe&backgroundColor=ffd5dc",
    alt: "Zoe",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kai&backgroundColor=ffdfbf",
    alt: "Kai",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Luna&backgroundColor=c1f0c8",
    alt: "Luna",
  },
  {
    src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Omar&backgroundColor=b6e3f4",
    alt: "Omar",
  },
];

const IB_PRODUCTS = [
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=alpha&backgroundColor=1e293b",
    alt: "Alpha",
  },
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=beta&backgroundColor=0f172a",
    alt: "Beta",
  },
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=gamma&backgroundColor=172554",
    alt: "Gamma",
  },
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=delta&backgroundColor=1c1917",
    alt: "Delta",
  },
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=epsilon&backgroundColor=14532d",
    alt: "Epsilon",
  },
  {
    src: "https://api.dicebear.com/9.x/shapes/svg?seed=zeta&backgroundColor=450a0a",
    alt: "Zeta",
  },
];

// Grid card preview — folder badge matching Aceternity reference style
export function PreviewImagesBadge({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        compact ? "min-h-[200px]" : "min-h-[260px]",
      )}
    >
      <div className="inline-flex items-center gap-3">
        <span className="text-xl select-none" aria-hidden>
          📁
        </span>
        <ImagesBadge
          images={IB_PRODUCTS}
          maxVisible={3}
          revealCount={2}
          label="Marketing Template"
          size="md"
          shape="rounded"
        />
      </div>
    </div>
  );
}

// Detail page section 1 — folder-badge (exact Aceternity style)
export function PreviewImagesBadgeDefault({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        compact ? "min-h-[220px]" : "min-h-[280px]",
      )}
    >
      <div className="inline-flex items-center gap-3">
        <span className="text-2xl select-none" aria-hidden>
          📁
        </span>
        <ImagesBadge
          images={IB_PRODUCTS}
          maxVisible={3}
          revealCount={2}
          label="Introducing Marketing Template"
          size="md"
          shape="rounded"
        />
      </div>
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "text-[11px]" : "text-xs",
        )}
      >
        hover the images to fan open
      </p>
    </div>
  );
}

// Detail page section 2 — Large social proof
export function PreviewImagesBadgeLarge({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        compact ? "min-h-[220px]" : "min-h-[280px]",
      )}
    >
      <ImagesBadge
        images={IB_TEAM}
        maxVisible={4}
        revealCount={3}
        label="12,000+ developers"
        size="lg"
        shape="circle"
        onClick={() => {}}
      />
    </div>
  );
}

// Detail page section 3 — Compact notification rows
export function PreviewImagesBadgeCompact({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center gap-4 px-6",
        compact ? "min-h-[220px]" : "min-h-[280px]",
      )}
    >
      {[
        {
          text: "Felix, Aneka + 3 others liked your post",
          imgs: IB_TEAM.slice(0, 5),
        },
        { text: "Milo, Zoe + 2 others commented", imgs: IB_TEAM.slice(2, 6) },
        { text: "Kai started following you", imgs: IB_TEAM.slice(4, 7) },
      ].map((row, i) => (
        <div key={i} className="flex items-center gap-3">
          <ImagesBadge
            images={row.imgs}
            maxVisible={2}
            revealCount={2}
            size="sm"
            shape="circle"
          />
          <span
            className={cn(
              "text-muted-foreground",
              compact ? "text-[11px]" : "text-sm",
            )}
          >
            {row.text}
          </span>
        </div>
      ))}
    </div>
  );
}

// Detail page section 4 — Wide spread left direction
export function PreviewImagesBadgeWide({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        compact ? "min-h-[220px]" : "min-h-[280px]",
      )}
    >
      <ImagesBadge
        images={IB_PRODUCTS}
        maxVisible={2}
        revealCount={4}
        label="6 templates included"
        size="md"
        shape="rounded"
      />
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "text-[11px]" : "text-xs",
        )}
      >
        hover to fan all 6 open
      </p>
    </div>
  );
}

// ── Dot Grid Hero previews ────────────────────────────────────────────────────

// Grid card — compact preview (white bg matching reference)
export function PreviewDotGridHero({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[280px]" : "h-[420px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <DotGridHero
        title={"Build interfaces\nthat ship."}
        primaryCTA={{ label: "Get started", href: "#" }}
        secondaryCTA={{ label: "Learn more", href: "#" }}
        className="min-h-0 h-full"
      />
    </div>
  );
}

// Section 1 — Default white bg, multi-colour dashes
export function PreviewDotGridHeroDefault({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[420px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <DotGridHero
        title={"Build interfaces\nthat ship."}
        subtitle="A motion-native component library for React. Animated, accessible, and production-ready out of the box."
        primaryCTA={{ label: "Get started", href: "#" }}
        secondaryCTA={{ label: "Browse components", href: "#" }}
        className="min-h-0 h-full"
      />
    </div>
  );
}

// Section 2 — Dark bg, indigo/purple dashes
export function PreviewDotGridHeroDense({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[420px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <DotGridHero
        title={"Design systems\nmade simple."}
        subtitle="Everything you need to build fast, beautiful products at scale."
        primaryCTA={{ label: "Start for free", href: "#" }}
        secondaryCTA={{ label: "View docs", href: "#" }}
        background="#09090b"
        textColor="#fafafa"
        dotGap={80}
        colors={["#818cf8", "#6366f1", "#a78bfa", "#38bdf8", "#f472b6"]}
        interactionRadius={160}
        repulsionStrength={10}
        springK={0.055}
        damping={0.78}
        className="min-h-0 h-full"
      />
    </div>
  );
}

// Section 3 — Light bg, amber/orange dashes, gentle spring
export function PreviewDotGridHeroAmber({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[420px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <DotGridHero
        title={"Ship 10× faster\nwith AI."}
        subtitle="AI-powered tooling that writes, tests, and deploys automatically."
        primaryCTA={{ label: "Try it free", href: "#" }}
        secondaryCTA={{ label: "Watch demo", href: "#" }}
        background="#fafafa"
        dotGap={52}
        colors={["#f59e0b", "#f97316", "#ef4444", "#dc2626", "#fb923c"]}
        interactionRadius={100}
        repulsionStrength={6}
        springK={0.04}
        damping={0.85}
        className="min-h-0 h-full"
      />
    </div>
  );
}

// Section 4 — Rose bg, explosive repulsion
export function PreviewDotGridHeroRose({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[420px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <DotGridHero
        title={"Beautiful UX\nstarts here."}
        subtitle="Craft interfaces your users will love. Premium components, zero compromise."
        primaryCTA={{ label: "Explore now", href: "#" }}
        secondaryCTA={{ label: "See pricing", href: "#" }}
        background="#fff0f3"
        textColor="#1a0a10"
        dotGap={90}
        colors={["#f43f5e", "#e11d48", "#fb7185", "#fda4af", "#9f1239"]}
        interactionRadius={200}
        repulsionStrength={14}
        springK={0.09}
        damping={0.76}
        className="min-h-0 h-full"
      />
    </div>
  );
}

// ── InteractiveStarfieldHero previews ─────────────────────────────────────────

// Grid card preview
export function PreviewStarfieldHero({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[280px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <InteractiveStarfieldHero
        title={"Ship faster.\nBuild better."}
        subtitle="A motion-native component library for React — animated, accessible, and production-ready."
        primaryCTA={{ label: "Get started", href: "#" }}
        secondaryCTA={{ label: "View components", href: "#" }}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}

// Section 1 — Default: zinc-950, blue/white
export function PreviewStarfieldHeroDefault({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[420px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <InteractiveStarfieldHero
        title={"Ship faster.\nBuild better."}
        subtitle="A motion-native component library for React — animated, accessible, and production-ready."
        primaryCTA={{ label: "Get started", href: "#" }}
        secondaryCTA={{ label: "View components", href: "#" }}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}

// Section 2 — Deep Space: violet/lavender
export function PreviewStarfieldHeroDeepSpace({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[420px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <InteractiveStarfieldHero
        title={"Design systems\nmade simple."}
        subtitle="Everything you need to build beautiful products at scale."
        primaryCTA={{ label: "Start for free", href: "#" }}
        secondaryCTA={{ label: "View docs", href: "#" }}
        particleCount={400}
        particleColor="#a78bfa"
        activeColor="#f0abfc"
        interactionRadius={180}
        speed={0.4}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}

// Section 3 — Ocean Night: cyan, snappy
export function PreviewStarfieldHeroOcean({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[420px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <InteractiveStarfieldHero
        title={"Ship 10× faster\nwith AI."}
        subtitle="AI-powered tooling that writes, tests, and deploys your code automatically."
        primaryCTA={{ label: "Try it free", href: "#" }}
        secondaryCTA={{ label: "Watch demo", href: "#" }}
        particleColor="#22d3ee"
        activeColor="#ecfeff"
        interactionRadius={120}
        speed={0.8}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}

// Section 4 — Ember Storm: amber, dreamy
export function PreviewStarfieldHeroEmber({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        compact ? "h-[420px]" : "h-[560px]",
        "w-full overflow-hidden rounded-xl",
      )}
    >
      <InteractiveStarfieldHero
        title={"Beautiful UX\nstarts here."}
        subtitle="Craft interfaces your users will love. Premium components, zero compromise."
        primaryCTA={{ label: "Explore now", href: "#" }}
        secondaryCTA={{ label: "See pricing", href: "#" }}
        particleCount={180}
        particleColor="#f59e0b"
        activeColor="#fef9c3"
        interactionRadius={160}
        speed={0.15}
        className="min-h-0 h-full rounded-none"
      />
    </div>
  );
}

// ── Compare previews ──────────────────────────────────────────────────────────

const CMP = {
  colorA: "https://picsum.photos/seed/cmp-a/1200/675",
  grayA: "https://picsum.photos/seed/cmp-a/1200/675?grayscale",
  colorB: "https://picsum.photos/seed/cmp-b/1200/675",
  blurB: "https://picsum.photos/seed/cmp-b/1200/675?blur=4",
};

// Grid card preview
export function PreviewCompare() {
  return (
    <div className="flex w-full items-center justify-center p-4">
      <Compare
        beforeImage={CMP.grayA}
        afterImage={CMP.colorA}
        beforeLabel="Before"
        afterLabel="After"
        className="aspect-video w-full max-w-sm"
      />
    </div>
  );
}

// Section 1 — Default (used in catalog previewSections)
export function PreviewCompareDefault() {
  return (
    <div className="p-6">
      <Compare
        beforeImage={CMP.grayA}
        afterImage={CMP.colorA}
        beforeLabel="Before"
        afterLabel="After"
        className="aspect-video w-full"
      />
    </div>
  );
}

// ── ExpandableCards previews ──────────────────────────────────────────────────

const EC_CARDS: CardItem[] = [
  {
    id: "p1",
    title: "Motion Design System",
    description: "Animation primitives built for React and Tailwind CSS.",
    fullDescription:
      "A cohesive set of animation primitives, spring physics, and declarative components. Every transition is GPU-accelerated and reduced-motion aware.",
    image: "https://picsum.photos/seed/ec-1/800/500",
    category: "Design",
    ctaText: "Explore",
    ctaLink: "#",
  },
  {
    id: "p2",
    title: "Canvas Particle Engine",
    description: "High-performance 60 fps particle system for modern web.",
    fullDescription:
      "Built on requestAnimationFrame with a custom physics solver. Supports gravity, wind, turbulence, and custom emitter shapes. Zero dependencies.",
    image: "https://picsum.photos/seed/ec-2/800/500",
    category: "Engineering",
    ctaText: "View docs",
    ctaLink: "#",
  },
  {
    id: "p3",
    title: "AI-Powered Layout",
    description: "Semantic layout engine that adapts to content automatically.",
    fullDescription:
      "Combine layout primitives with LLM-powered suggestions to automatically choose the best composition for your content type.",
    image: "https://picsum.photos/seed/ec-3/800/500",
    category: "AI",
    ctaText: "Try free",
    ctaLink: "#",
  },
];

export function PreviewExpandableCards() {
  return (
    <div className="p-4">
      <ExpandableCards cards={EC_CARDS} />
    </div>
  );
}

export function PreviewAnimatedSelectHeadline() {
  return (
    <div className="flex min-h-[220px] w-full items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-white px-8 py-12 dark:border-white/10 dark:bg-zinc-950">
      <AnimatedSelectHeadline
        words={["warp speed", "record time", "pure flow", "light speed"]}
        prefix="Build amazing websites at"
        headingClassName="dark:text-white"
      />
    </div>
  );
}

export function PreviewWarpSpeedCard() {
  return (
    <WarpSpeedCard className="w-full overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
      <div className="flex h-full min-h-[260px] flex-col items-center justify-center px-8 py-12 text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-950 sm:text-4xl">
          Build amazing websites
          <br />
          at <WarpTextTrigger>warp speed</WarpTextTrigger>
        </h2>
      </div>
    </WarpSpeedCard>
  );
}

export function PreviewAskNexusInput() {
  return (
    <div className="flex min-h-[440px] w-full items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-white px-8 dark:border-white/10">
      <AskNexusInput />
    </div>
  );
}

export function PreviewPhoneInput({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[200px]" : "min-h-[280px] py-8",
      )}
    >
      <PhoneInput placeholder="Phone number" label="Phone number" />
    </div>
  );
}

const CAROUSEL_ITEMS = [
  {
    id: "1",
    title: "Neural Networks",
    description: "Deep learning architectures for complex pattern recognition.",
    tag: "AI",
  },
  {
    id: "2",
    title: "Quantum Computing",
    description:
      "Harness quantum mechanics for unprecedented processing power.",
    tag: "Quantum",
  },
  {
    id: "3",
    title: "Edge Computing",
    description: "Process data closer to the source for real-time insights.",
    tag: "Infrastructure",
  },
  {
    id: "4",
    title: "Blockchains",
    description: "Decentralized trust protocols for transparent transactions.",
    tag: "Web3",
  },
  {
    id: "5",
    title: "Generative AI",
    description: "Create content and solutions with intelligent synthesis.",
    tag: "AI",
  },
  {
    id: "6",
    title: "Autonomous Systems",
    description: "Self-governing machines that adapt and learn continuously.",
    tag: "Robotics",
  },
];

export function PreviewCircularCarousel({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl",
        compact ? "min-h-[280px] max-h-[280px]" : "min-h-[480px]",
      )}
    >
      <CircularCarousel items={CAROUSEL_ITEMS} autoPlay={false} />
    </div>
  );
}

export function PreviewChatMessages({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl",
        compact ? "min-h-[280px] max-h-[280px]" : "min-h-[480px]",
      )}
    >
      <div className="h-full w-full max-w-md">
        <ChatMessages autoPlay showReplay />
      </div>
    </div>
  );
}

export function PreviewShaderFlow({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl",
        compact ? "min-h-[280px] max-h-[280px]" : "min-h-[480px]",
      )}
    >
      <div className="h-full w-full max-w-4xl">
        <ShaderFlow showContent />
      </div>
    </div>
  );
}

export function PreviewCardStackRotator({
  compact = true,
}: { compact?: boolean } = {}) {
  const cards = [
    {
      id: "csr-1",
      content:
        "This product is **absolutely incredible** for our team. Shipped our landing page in **three days**.",
      name: "Sarah Chen",
      designation: "Head of Design",
      company: "Vercel",
      initials: "SC",
    },
    {
      id: "csr-2",
      content:
        "The **developer experience** is unmatched. Animations saved us **two weeks** of work easily.",
      name: "Marcus Rodriguez",
      designation: "Senior Engineer",
      company: "Linear",
      initials: "MR",
    },
    {
      id: "csr-3",
      content:
        "Component quality is **genuinely impressive**. Everything feels intentional and polished.",
      name: "Aisha Patel",
      designation: "Design Systems Lead",
      company: "Stripe",
      initials: "AP",
    },
    {
      id: "csr-4",
      content:
        "**Attention to detail** in every component. Motion is buttery smooth, accessibility built-in.",
      name: "James Kim",
      designation: "Engineering Manager",
      company: "Notion",
      initials: "JK",
    },
    {
      id: "csr-5",
      content:
        "This library **exceeded all expectations**. Code quality and docs are **best-in-class**.",
      name: "Elena Vasquez",
      designation: "CTO",
      company: "Raycast",
      initials: "EV",
    },
  ];
  return (
    <div className="flex items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-[#09090b] p-6 sm:p-10 lg:p-16">
      <CardStackRotator
        cards={cards}
        rotationInterval={compact ? 3500 : 3000}
        maxVisible={compact ? 3 : 4}
        stackOffset={14}
        scaleStep={0.04}
        cardWidth="100%"
        cardHeight={compact ? "360px" : "380px"}
        cardBackground="#111113"
        cardBorderColor="rgba(255,255,255,0.07)"
        textColor="#fafafa"
        mutedColor="rgba(250,250,250,0.45)"
        highlightBackground="rgba(129,140,248,0.15)"
        highlightTextColor="#a5b4fc"
        contentFontSize="16px"
        nameFontSize="16px"
        designationFontSize="13px"
        borderRadius="20px"
        shadowIntensity={0.55}
        pauseOnHover
        direction="forward"
      />
    </div>
  );
}

const SAMPLE_CODE_JS = `import React, { useState } from 'react';

export default function PricingCard() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="pricing-card">
      <h3>Pro Plan</h3>
      <p className="price">
        \${isYearly ? '99' : '12'}
        <span className="duration">
          /{isYearly ? 'year' : 'month'}
        </span>
      </p>

      <button onClick={() => setIsYearly(!isYearly)}>
        Toggle Billing
      </button>

      <ul className="features">
        <li>Unlimited Projects</li>
        <li>Priority Support</li>
      </ul>
    </div>
  );
}`;

const SAMPLE_CODE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My App</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="root"></div>
  <script src="index.js"></script>
</body>
</html>`;

const SAMPLE_CODE_JSON = `{
  "name": "nexus-labs",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "framer-motion": "^11.0.0"
  }
}`;

const SAMPLE_CODE_CSS = `.button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}`;

export function PreviewCodeBlockDefault() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border/60 bg-[#09090b] p-6">
      <div className="w-full h-full min-h-[320px]">
        <CodeBlock
          code={SAMPLE_CODE_JS}
          language="jsx"
          theme="dark"
          className="w-full h-full min-h-[320px]"
        />
      </div>
    </div>
  );
}

export function PreviewCodeBlockLight() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border/60 bg-white p-6">
      <div className="w-full h-full min-h-[320px]">
        <CodeBlock
          code={SAMPLE_CODE_JS}
          language="jsx"
          theme="light"
          className="w-full h-full min-h-[320px]"
        />
      </div>
    </div>
  );
}

export function PreviewCodeBlockHtml() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border/60 bg-[#09090b] p-6">
      <div className="w-full h-full min-h-[320px]">
        <CodeBlock
          code={SAMPLE_CODE_HTML}
          language="html"
          theme="dark"
          className="w-full h-full min-h-[320px]"
        />
      </div>
    </div>
  );
}

export function PreviewCodeBlockJson() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border/60 bg-[#09090b] p-6">
      <div className="w-full h-full min-h-[320px]">
        <CodeBlock
          code={SAMPLE_CODE_JSON}
          language="json"
          theme="dark"
          className="w-full h-full min-h-[320px]"
        />
      </div>
    </div>
  );
}

export function PreviewCodeBlockCss() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border/60 bg-[#09090b] p-6">
      <div className="w-full h-full min-h-[320px]">
        <CodeBlock
          code={SAMPLE_CODE_CSS}
          language="css"
          theme="dark"
          className="w-full h-full min-h-[320px]"
        />
      </div>
    </div>
  );
}

export function PreviewCodeBlock({
  compact = false,
}: { compact?: boolean } = {}) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border/60 bg-[#09090b] p-6">
      <div className="w-full max-w-xl" style={{ height: compact ? 320 : 420 }}>
        <CodeBlock
          code={SAMPLE_CODE_JS}
          language="jsx"
          theme="dark"
          className="w-full h-full min-h-[320px]"
        />
      </div>
    </div>
  );
}

const BENTO_PREVIEW_ITEMS = [
  { id: "1", label: "Latency", value: "42ms", span: "1x1" as const },
  {
    id: "2",
    label: "Uptime",
    value: "99.99%",
    span: "2x1" as const,
    trend: { value: 0.1, label: "vs last month" },
  },
  { id: "3", label: "Signals", value: "1.2M", span: "1x1" as const },
  {
    id: "4",
    label: "Edge",
    value: "12 regions",
    span: "1x1" as const,
    trend: { value: 20, label: "new this quarter" },
  },
];

export function PreviewAnimatedBentoGrid() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-3">
      <div className="lf-grid absolute inset-0 opacity-30" />
      <AnimatedBentoGrid
        items={BENTO_PREVIEW_ITEMS}
        variant="default"
        columns={3}
        className="relative h-full"
        itemClassName="h-full"
      />
    </div>
  );
}

const BENTO_SKELETON_CARDS = [
  {
    id: "1",
    title: "Ready-made sections",
    description: "Production-ready page blocks for any product.",
    tag: "Pages",
    span: "2x1" as const,
    skeletonType: "chat" as const,
  },
  {
    id: "2",
    title: "Interactive components",
    description: "Hooks, inputs, and controls that feel alive.",
    tag: "UI",
    span: "1x1" as const,
    skeletonType: "dashboard" as const,
  },
  {
    id: "3",
    title: "Copy-paste blocks",
    description: "Ship faster with drop-in component snippets.",
    tag: "DX",
    span: "1x1" as const,
    skeletonType: "avatar" as const,
  },
  {
    id: "4",
    title: "Premium animations",
    description: "Framer Motion layouts with a refined feel.",
    tag: "Motion",
    span: "1x1" as const,
    skeletonType: "workflow" as const,
  },
  {
    id: "5",
    title: "Responsive design",
    description: "Blocks that adapt cleanly to every viewport.",
    tag: "Mobile",
    span: "1x1" as const,
    skeletonType: "calendar" as const,
  },
  {
    id: "6",
    title: "Clean structure",
    description: "Typed, tree-shakeable, and easy to extend.",
    tag: "Dev",
    span: "1x1" as const,
    skeletonType: "code" as const,
  },
];

export function PreviewBentoGridSkeleton() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-3">
      <div className="lf-grid absolute inset-0 opacity-30" />
      <BentoGridSkeleton cards={BENTO_SKELETON_CARDS} />
    </div>
  );
}

export function PreviewMotionLayerScroller() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
      <div className="lf-grid absolute inset-0 opacity-30" />
      <MotionLayerScroller scrollHeight={400} showGrid={false} layers={[]} />
    </div>
  );
}

export function PreviewBentoShowcase() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-3">
      <div className="lf-grid absolute inset-0 opacity-30" />
      <BentoShowcase className="h-full" />
    </div>
  );
}

// Lazy import avoids pulling the heavy animated component into the initial bundle
const WhyChooseUsBento = React.lazy(
  () => import("@/components/blocks/animated-bento-grid"),
);

export function PreviewWhyChooseUs() {
  return (
    <div className="relative flex h-[220px] w-full items-start justify-center overflow-hidden bg-white dark:bg-zinc-950">
      <div data-tile-focus className="pointer-events-none mt-6 h-[820px] w-[1180px] shrink-0 overflow-hidden">
        <React.Suspense fallback={null}>
          <WhyChooseUsBento />
        </React.Suspense>
      </div>
    </div>
  );
}

// ── ScrollRevealText preview ────────────────────────────────────────────────

type SRTEffect = "blur" | "scale" | "slideX" | "slideY" | "rotate" | "skew";

interface SRTSection {
  label: string;
  lines: string[]; // each string = one line
  effect: SRTEffect;
  font: string;
  size: string;
  weight: number;
  italic?: boolean;
  tracking?: string;
  lineHeight?: number;
}

const SRT_SECTIONS: SRTSection[] = [
  {
    label: "WORD · BLUR",
    lines: ["Crafted for the", "next generation", "of ambitious", "builders."],
    effect: "blur",
    font: '"Helvetica Neue","Arial",system-ui,sans-serif',
    size: "3.2rem",
    weight: 200,
    tracking: "0em",
    lineHeight: 1.18,
  },
  {
    label: "CHAR · SCALE",
    lines: ["MAKE IT", "BIG, BOLD", "AND LOUD."],
    effect: "scale",
    font: "system-ui,-apple-system,sans-serif",
    size: "3.8rem",
    weight: 900,
    tracking: "-0.04em",
    lineHeight: 1.05,
  },
  {
    label: "WORD · SLIDE X",
    lines: [
      "Every great product",
      "starts with a single",
      "thoughtful decision",
      "made boldly.",
    ],
    effect: "slideX",
    font: '"Segoe UI","Helvetica Neue",system-ui,sans-serif',
    size: "2.4rem",
    weight: 400,
    tracking: "0.01em",
    lineHeight: 1.3,
  },
  {
    label: "WORD · SLIDE Y",
    lines: ["Move faster", "than anyone", "thought was", "possible."],
    effect: "slideY",
    font: "system-ui,sans-serif",
    size: "3.4rem",
    weight: 700,
    italic: true,
    tracking: "-0.03em",
    lineHeight: 1.1,
  },
  {
    label: "WORD · ROTATE",
    lines: [
      "The future of",
      "interfaces starts",
      "with words that",
      "come alive.",
    ],
    effect: "rotate",
    font: '"Trebuchet MS","Gill Sans",system-ui,sans-serif',
    size: "2.8rem",
    weight: 600,
    tracking: "-0.02em",
    lineHeight: 1.15,
  },
  {
    label: "WORD · SKEW",
    lines: ["Ship products", "your users will", "genuinely love", "forever."],
    effect: "skew",
    font: 'system-ui,"Helvetica Neue",sans-serif',
    size: "3.2rem",
    weight: 800,
    tracking: "-0.035em",
    lineHeight: 1.08,
  },
];

const SRT_INIT: Record<SRTEffect, Record<string, unknown>> = {
  blur: { opacity: 0.08, filter: "blur(12px)", y: 10 },
  scale: { opacity: 0.08, scale: 0.5 },
  slideX: { opacity: 0, x: -32 },
  slideY: { opacity: 0, y: 28 },
  rotate: { opacity: 0.08, rotate: -10 },
  skew: { opacity: 0.08, skewX: 14, x: -8 },
};

const SRT_END: Record<SRTEffect, Record<string, unknown>> = {
  blur: { opacity: 1, filter: "blur(0px)", y: 0 },
  scale: { opacity: 1, scale: 1 },
  slideX: { opacity: 1, x: 0 },
  slideY: { opacity: 1, y: 0 },
  rotate: { opacity: 1, rotate: 0 },
  skew: { opacity: 1, skewX: 0, x: 0 },
};

function SRTSection({
  section,
  root,
}: {
  section: SRTSection;
  root: React.RefObject<HTMLElement | null>;
}) {
  let wi = 0;

  return (
    <div
      style={{
        padding: "36px 28px 44px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        fontFamily: section.font,
        fontSize: section.size,
        fontWeight: section.weight,
        fontStyle: section.italic ? "italic" : "normal",
        letterSpacing: section.tracking ?? "-0.02em",
        lineHeight: section.lineHeight ?? 1.15,
        color: "#ffffff",
      }}
    >
      <p
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: "8px",
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: "14px",
          fontStyle: "normal",
        }}
      >
        {section.label}
      </p>
      {section.lines.map((line, li) => {
        const words = line.split(" ").filter(Boolean);
        return (
          <div key={li} style={{ display: "block", overflow: "visible" }}>
            {words.map((word) => {
              const idx = wi++;
              return (
                <React.Fragment key={idx}>
                  <motion.span
                    initial={{
                      ...SRT_INIT[section.effect],
                      color: "rgba(255,255,255,0.08)",
                    }}
                    whileInView={{
                      ...SRT_END[section.effect],
                      color: "#ffffff",
                    }}
                    viewport={{ once: false, root, amount: 0.1 }}
                    transition={{
                      delay: idx * 0.07,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      display: "inline-block",
                      willChange: "opacity, transform, filter",
                    }}
                  >
                    {word}
                  </motion.span>{" "}
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function PreviewScrollRevealText() {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf: number;
    let paused = false;

    const tick = () => {
      if (!paused && el) {
        el.scrollTop += 1.2;
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (el.scrollTop >= maxScroll - 4) {
          paused = true;
          setTimeout(() => {
            el.scrollTop = 0;
            setTimeout(() => {
              paused = false;
            }, 500);
          }, 1400);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    // height: 640px — matches detail page's min-h-[640px] so preview fills it fully.
    // On the /components listing card (max 320px overflow:hidden), it gets clipped to fill that too.
    <div
      ref={scrollRef}
      style={
        {
          width: "100%",
          height: "640px",
          overflowY: "scroll",
          scrollbarWidth: "none",
          background: "#09090b",
        } as React.CSSProperties
      }
    >
      {SRT_SECTIONS.map((section, i) => (
        <SRTSection key={i} section={section} root={scrollRef} />
      ))}
    </div>
  );
}

const ST_TESTIMONIALS = [
  { id: "st-1", quote: "Shipped our entire landing page in a weekend. The animation quality is genuinely best-in-class.", name: "Sarah Chen", role: "Head of Design", company: "Vercel", rating: 5 },
  { id: "st-2", quote: "Finally a component library that respects the craft. Motion feels intentional, never gimmicky.", name: "Marcus Rodriguez", role: "Senior Engineer", company: "Linear", rating: 5 },
  { id: "st-3", quote: "Copy-paste components that actually look premium out of the box. Our conversion rate went up 18%.", name: "Aisha Patel", role: "Design Systems Lead", company: "Stripe", rating: 5 },
  { id: "st-4", quote: "The attention to detail in every component is remarkable. Accessibility is built in from the start.", name: "James Kim", role: "Engineering Manager", company: "Notion", rating: 5 },
  { id: "st-5", quote: "We replaced three different component libraries with Nexus UI. Cleaner code, better performance.", name: "Elena Vasquez", role: "CTO", company: "Raycast", rating: 5 },
  { id: "st-6", quote: "Dark mode, responsive, and animated right out of the box. This saved our team two weeks.", name: "David Park", role: "Founder", company: "Resend", rating: 5 },
  { id: "st-7", quote: "Our design-to-code handoff is basically gone now. Devs just grab components and ship.", name: "Priya Nair", role: "Product Designer", company: "Planetscale", rating: 5 },
  { id: "st-8", quote: "I've evaluated 12 UI libraries this year. This is the first one I actually wanted to use.", name: "Tom Hanley", role: "Frontend Lead", company: "Loom", rating: 5 },
  { id: "st-9", quote: "The Framer Motion integration is handled perfectly. No more wrestling with animation configs.", name: "Yuki Tanaka", role: "UI Engineer", company: "Figma", rating: 5 },
  { id: "st-10", quote: "Every component feels like it belongs. Consistent design language across the whole library.", name: "Clara Russo", role: "Creative Director", company: "Framer", rating: 5 },
  { id: "st-11", quote: "Tailwind-first and fully typed. Exactly what we needed for a fast-moving product team.", name: "Noah Bennett", role: "Staff Engineer", company: "Supabase", rating: 5 },
  { id: "st-12", quote: "The scroll animations alone were worth the price. Clients keep asking how we built it.", name: "Fatima Al-Rashid", role: "Agency Owner", company: "Webflow", rating: 5 },
];

export function PreviewScrollingTestimonials({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="w-full overflow-hidden bg-[#09090b]">
      <ScrollingTestimonials
        testimonials={ST_TESTIMONIALS}
        columns={3}
        speed={28000}
        reverseColumns={[false, true, false]}
        pauseOnHover
        showHeader={!compact}
        badge="Social proof"
        title="Trusted by product teams"
        subtitle="Thousands of designers and engineers ship faster with Nexus UI."
        backgroundColor="#09090b"
        cardBackground="rgba(255,255,255,0.04)"
        borderColor="rgba(255,255,255,0.08)"
        textColor="#f4f4f5"
        mutedTextColor="rgba(244,244,245,0.45)"
        showStars
        fadeMask
      />
    </div>
  );
}


export function PreviewSpectraFrame({ compact = false }: { compact?: boolean } = {}) {
  return (
    <SpectraFrame
      imageCount={14}
      gap={compact ? 6 : 10}
      aspectRatio="4/3"
      transitionSpeed={550}
      scaleAmount={1.04}
      backgroundColor="#0d0d14"
      grayscaleIntensity={100}
      borderRadius={14}
      cellMinHeight={compact ? 100 : 140}
      hoveredMinHeight={compact ? 150 : 200}
    />
  );
}

export function PreviewProfileOrbit({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div style={{ width: "100%", height: compact ? 480 : 640 }}>
      <ProfileOrbit autoRotateInterval={3000} />
    </div>
  );
}

function ControlSlider({
  label, value, min, max, step = 1,
  onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-400">{label}</span>
        <span className="font-mono text-[11px] text-zinc-300">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-600 accent-white"
      />
    </div>
  );
}

export function PreviewCardCarousel3D({ compact = true }: { compact?: boolean } = {}) {
  const [radius, setRadius]           = React.useState(380);
  const [itemWidth, setItemWidth]     = React.useState(280);
  const [itemHeight, setItemHeight]   = React.useState(380);
  const [perspective, setPerspective] = React.useState(1000);
  const [autoRotate, setAutoRotate]   = React.useState(true);
  const [autoSpeed, setAutoSpeed]     = React.useState(1);
  const [scrollSpeed, setScrollSpeed] = React.useState(1);
  const [direction, setDirection]     = React.useState<"cw" | "ccw">("cw");

  if (compact) {
    return (
      <div className="pointer-events-none h-[420px] overflow-hidden">
        <CardCarousel3D radius={400} itemWidth={220} itemHeight={300} perspective={900} autoRotate autoSpeed={0.8} />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      {/* Carousel fills remaining space */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <CardCarousel3D
          radius={radius}
          itemWidth={itemWidth}
          itemHeight={itemHeight}
          perspective={perspective}
          autoRotate={autoRotate}
          autoSpeed={autoSpeed}
          scrollSpeed={scrollSpeed}
          direction={direction}
        />
      </div>

      {/* Control panel pinned to bottom */}
      <div className="shrink-0 border-t border-zinc-700/60 bg-zinc-900 px-6 py-4">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          {/* 3D Layout */}
          <div className="col-span-2 sm:col-span-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              3D Layout
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              <ControlSlider label="Radius" value={radius} min={200} max={1000} step={10} onChange={setRadius} />
              <ControlSlider label="Item Width" value={itemWidth} min={160} max={500} step={10} onChange={setItemWidth} />
              <ControlSlider label="Item Height" value={itemHeight} min={200} max={600} step={10} onChange={setItemHeight} />
              <ControlSlider label="Perspective" value={perspective} min={500} max={3000} step={50} onChange={setPerspective} />
            </div>
          </div>

          {/* Rotation */}
          <div className="col-span-2 sm:col-span-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Rotation
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              {/* Auto Rotate toggle */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-zinc-400">Auto Rotate</span>
                <button
                  type="button"
                  onClick={() => setAutoRotate((v) => !v)}
                  className={cn(
                    "mt-0.5 flex h-6 w-11 items-center rounded-full px-0.5 transition-colors",
                    autoRotate ? "bg-white" : "bg-zinc-600",
                  )}
                >
                  <span
                    className={cn(
                      "size-5 rounded-full bg-zinc-900 shadow transition-transform",
                      autoRotate ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </div>

              <ControlSlider label="Auto Speed" value={autoSpeed} min={0.1} max={5} step={0.1} onChange={setAutoSpeed} />
              <ControlSlider label="Scroll Speed" value={scrollSpeed} min={0.1} max={5} step={0.1} onChange={setScrollSpeed} />

              {/* Direction */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-zinc-400">Direction</span>
                <div className="mt-0.5 flex overflow-hidden rounded-lg border border-zinc-600">
                  {(["cw", "ccw"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDirection(d)}
                      className={cn(
                        "flex-1 py-1 text-[11px] font-semibold transition-colors",
                        direction === d
                          ? "bg-white text-zinc-900"
                          : "text-zinc-400 hover:text-zinc-200",
                      )}
                    >
                      {d === "cw" ? "↻ CW" : "↺ CCW"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export function PreviewDraggableCardStack({ compact = true }: { compact?: boolean } = {}) {
  const [cardWidth, setCardWidth]               = React.useState(300);
  const [cardHeight, setCardHeight]             = React.useState(420);
  const [borderRadius, setBorderRadius]         = React.useState(24);
  const [shadowStrength, setShadowStrength]     = React.useState(1);
  const [stackOffset, setStackOffset]           = React.useState(0);
  const [maxRotation, setMaxRotation]           = React.useState(14);
  const [depthScale, setDepthScale]             = React.useState(0.04);
  const [showOverlay, setShowOverlay]           = React.useState(true);
  const [hoverScale, setHoverScale]             = React.useState(1.03);
  const [transitionDuration, setTransitionDuration] = React.useState(0.25);
  const [autoPlay, setAutoPlay]                 = React.useState(false);
  const [autoInterval, setAutoInterval]         = React.useState(3000);

  if (compact) {
    return (
      <div className="pointer-events-none h-[480px] overflow-hidden">
        <DraggableCardStack />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      {/* Stack fills remaining space */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <DraggableCardStack
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          borderRadius={borderRadius}
          shadowStrength={shadowStrength}
          stackOffset={stackOffset}
          maxRotation={maxRotation}
          depthScale={depthScale}
          showOverlay={showOverlay}
          hoverScale={hoverScale}
          transitionDuration={transitionDuration}
          autoPlay={autoPlay}
          autoInterval={autoInterval}
        />
      </div>

      {/* Control panel */}
      <div className="shrink-0 border-t border-zinc-700/60 bg-zinc-900 px-6 py-4">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">

          {/* Card Size */}
          <div className="col-span-2 sm:col-span-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Card Size</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              <ControlSlider label="Width"         value={cardWidth}      min={160} max={500} step={10}  onChange={setCardWidth} />
              <ControlSlider label="Height"        value={cardHeight}     min={200} max={700} step={10}  onChange={setCardHeight} />
              <ControlSlider label="Radius"        value={borderRadius}   min={0}   max={48}  step={1}   onChange={setBorderRadius} />
              <ControlSlider label="Shadow"        value={shadowStrength} min={0}   max={1}   step={0.05} onChange={setShadowStrength} />
            </div>
          </div>

          {/* Stack */}
          <div className="col-span-2 sm:col-span-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Stack</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
              <ControlSlider label="Offset (px)"   value={stackOffset}   min={0}    max={30}  step={1}    onChange={setStackOffset} />
              <ControlSlider label="Max Rotation"  value={maxRotation}   min={0}    max={30}  step={1}    onChange={setMaxRotation} />
              <ControlSlider label="Depth Scale"   value={depthScale}    min={0.01} max={0.12} step={0.01} onChange={setDepthScale} />
            </div>
          </div>

          {/* Hover */}
          <div className="col-span-2 sm:col-span-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Hover & Overlay</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              {/* Show Overlay toggle */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-zinc-400">Show Overlay</span>
                <button
                  type="button"
                  onClick={() => setShowOverlay((v) => !v)}
                  className={cn(
                    "mt-0.5 flex h-6 w-11 items-center rounded-full px-0.5 transition-colors",
                    showOverlay ? "bg-white" : "bg-zinc-600",
                  )}
                >
                  <span className={cn("size-5 rounded-full bg-zinc-900 shadow transition-transform", showOverlay ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
              <ControlSlider label="Hover Scale"  value={hoverScale}         min={1}   max={1.2}  step={0.01} onChange={setHoverScale} />
              <ControlSlider label="Transition s" value={transitionDuration} min={0.05} max={1}   step={0.05} onChange={setTransitionDuration} />

              {/* Auto-play toggle */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-zinc-400">Auto Play</span>
                <button
                  type="button"
                  onClick={() => setAutoPlay((v) => !v)}
                  className={cn(
                    "mt-0.5 flex h-6 w-11 items-center rounded-full px-0.5 transition-colors",
                    autoPlay ? "bg-white" : "bg-zinc-600",
                  )}
                >
                  <span className={cn("size-5 rounded-full bg-zinc-900 shadow transition-transform", autoPlay ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
            </div>
            {autoPlay && (
              <div className="mt-3 max-w-[160px]">
                <ControlSlider label="Interval ms" value={autoInterval} min={500} max={8000} step={500} onChange={setAutoInterval} />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const TRAIL_IMAGES = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", alt: "Mountains" },
  { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80", alt: "Forest" },
  { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=80", alt: "Valley" },
  { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&q=80", alt: "Autumn" },
  { src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=300&q=80", alt: "Lake" },
];

const PREVIEW_AVATARS = [
  { fallback: "PS", tooltip: "Priya Sharma",   bgColor: "#06b6d4" },
  { fallback: "JK", tooltip: "James Kowalski", bgColor: "#8b5cf6" },
  { fallback: "SC", tooltip: "Sofia Chen",     bgColor: "#10b981" },
  { fallback: "MR", tooltip: "Marcus Reid",    bgColor: "#f59e0b" },
  { fallback: "AN", tooltip: "Aisha Nkosi",    bgColor: "#d946ef" },
  { fallback: "TR", tooltip: "Tomás Reyes",    bgColor: "#0ea5e9" },
  { fallback: "LF", tooltip: "Lena Fischer",   bgColor: "#f43f5e" },
];

export function PreviewAvatarGroup() {
  return (
    <div className="flex min-h-[340px] w-full flex-col items-center justify-center gap-12 rounded-3xl bg-background p-8">
      {/* Default — lift on hover, scale entrance */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Lift + Scale entrance
        </p>
        <AvatarGroup
          avatars={PREVIEW_AVATARS}
          size={44}
          overlap={12}
          hoverAnimation="lift"
          entranceAnimation="scale"
          showTooltips
        />
      </div>
      {/* Bounce entrance, rotate hover */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Bounce entrance + Rotate hover
        </p>
        <AvatarGroup
          avatars={PREVIEW_AVATARS}
          size={44}
          overlap={12}
          hoverAnimation="rotate"
          entranceAnimation="bounce"
          showTooltips
        />
      </div>
    </div>
  );
}

export function PreviewFeatureToolsCard() {
  return (
    <div className="flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-3xl bg-zinc-950 p-8">
      <FeatureToolsCard
        title="Connects with your stack"
        description="Drop-in integrations for the tools your team already uses. No custom connectors required."
      />
    </div>
  );
}

export function PreviewStepFlow({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center rounded-3xl border border-border bg-neutral-100 p-4 dark:bg-neutral-950",
        compact ? "min-h-[520px]" : "min-h-[680px] p-6",
      )}
    >
      <StepFlow
        className={cn("shadow-sm", compact ? "max-w-5xl" : "max-w-6xl")}
        highlightColor="rgb(229 229 229)"
        autoPlay={compact}
        autoPlayInterval={2800}
        steps={[
          {
            serial: "01",
            title: "Audit the idea",
            description: "Collect the messy notes, user goals, and brand cues before a single section is built.",
            image:
              "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
          },
          {
            serial: "02",
            title: "Sketch the system",
            description: "Turn the direction into reusable layout rules, component states, and rhythm.",
            image:
              "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=85",
          },
          {
            serial: "03",
            title: "Layer the motion",
            description: "Add transitions that guide attention without making the page feel busy.",
            image:
              "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85",
          },
          {
            serial: "04",
            title: "Ship the page",
            description: "Package a polished, responsive experience your users can copy into production.",
            image:
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
          },
        ]}
      />
    </div>
  );
}

export function PreviewWheelSelector({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("w-full bg-[#080809] p-5", compact ? "min-h-[650px]" : "min-h-[730px] p-8")}>
      <WheelSelector
        className="mx-auto max-w-[1260px]"
        theme="obsidian"
        variant={compact ? "desktop" : "responsive"}
        contentMode="detailed"
        ringRadius={compact ? 168 : 186}
        tickCount={compact ? 32 : 48}
        autoRotate={compact}
        autoRotateInterval={3200}
        showCTA={false}
      />
    </div>
  );
}

export function PreviewScrollProgressBar({ compact = true }: { compact?: boolean } = {}) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() === true;

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !compact || reduceMotion) return;

    let frame = 0;
    let pauseUntil = performance.now() + 900;
    let direction = 1;
    const tick = (time: number) => {
      const max = container.scrollHeight - container.clientHeight;
      if (time >= pauseUntil && max > 0) {
        container.scrollTop += direction * 0.72;
        if (container.scrollTop >= max - 1 || container.scrollTop <= 1) {
          direction *= -1;
          pauseUntil = time + 850;
        }
      }
      frame = window.requestAnimationFrame(tick);
    };

    container.scrollTop = 80;
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [compact, reduceMotion]);

  return (
    <div
      className={cn(
        "w-full overflow-hidden bg-[#0d0d10] text-white",
        compact ? "h-[760px]" : "h-[720px] rounded-3xl",
      )}
    >
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <section
          className="mx-auto grid min-h-[1160px] max-w-[900px] grid-cols-[38px_minmax(0,1fr)] gap-10 px-12 py-20 sm:px-20"
        >
          <aside className="sticky top-24 h-fit">
            <ScrollProgressBar
              containerRef={scrollContainerRef}
              height={240}
              width={3}
              markerCount={4}
              markerSize={12}
              backgroundColor="#282832"
              fillColor="#8758ff"
            />
          </aside>
          <div className="space-y-24">
            <header>
              <p className="text-xs font-semibold uppercase text-violet-400">
                Product Story
              </p>
              <h2 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.05]">
                Follow the work as it takes shape.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-8 text-white/50">
                A quiet progress rail keeps long sections oriented without
                competing with the content.
              </p>
            </header>
            {[
              ["01 / Discover", "Clarify the audience and find the moments that matter."],
              ["02 / Compose", "Arrange the interface into a story people can scan."],
              ["03 / Refine", "Tune detail and motion until each interaction feels intentional."],
              ["04 / Launch", "Deliver a system ready for real users and real content."],
            ].map(([label, body]) => (
              <article key={label} className="border-t border-white/10 pt-8">
                <p className="text-sm font-medium text-violet-300">{label}</p>
                <p className="mt-4 max-w-lg text-2xl leading-snug text-white/80">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function PreviewImageTrail({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[420px] max-h-[420px]" : "min-h-[500px]",
      )}
    >
      <ImageTrail
        images={TRAIL_IMAGES}
        spacing={32}
        duration={950}
        imageSize={compact ? 100 : 130}
        cornerRadius={10}
        fadeOutBlur={6}
        className={cn(
          "w-full rounded-2xl border border-border bg-muted/20",
          compact ? "h-80" : "h-96",
        )}
      >
        <div className="pointer-events-none flex h-full items-center justify-center">
          <p className={cn("select-none text-muted-foreground/50", compact ? "text-xs" : "text-sm")}>
            Move cursor here
          </p>
        </div>
      </ImageTrail>
    </div>
  );
}

export function PreviewCursorTextReveal({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("w-full", compact ? "h-[420px]" : "h-[560px]")}>
      <CursorTextReveal
        baseText="The first rule of motion is clarity."
        revealText="The second rule is feeling."
        maskSize={compact ? 190 : 310}
        initialMaskSize={compact ? 92 : 0}
        smoothness={0.16}
        enableGlow={false}
        showAmbient={false}
        showGrid={false}
        fontSize={compact ? "clamp(2rem, 7vw, 4.8rem)" : "clamp(3rem, 7vw, 7rem)"}
        revealBackgroundClassName="bg-black"
        baseTextClassName="text-zinc-950"
        revealTextClassName="text-white"
        containerClassName="h-full min-h-0 rounded-3xl border-zinc-200 bg-white text-zinc-950 shadow-sm"
      />
    </div>
  );
}

export function PreviewCursorTextRevealImage({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("w-full", compact ? "h-[420px]" : "h-[560px]")}>
      <CursorTextReveal
        baseText="We chase moments in time to feel alive."
        revealText="We keep the moments we usually ignore."
        backgroundImage="https://images.unsplash.com/photo-1730874829217-f7f666e94822?auto=format&fit=crop&w=1800&q=85"
        backgroundPosition="42% center"
        mode="image"
        revealImage="https://images.unsplash.com/photo-1649787652660-df5ac7c91532?auto=format&fit=crop&w=1800&q=85"
        revealImagePosition="center"
        maskSize={compact ? 215 : 340}
        initialMaskSize={compact ? 90 : 0}
        smoothness={0.2}
        enableGlow={false}
        showAmbient={false}
        showGrid={false}
        fontSize={compact ? "clamp(2rem, 7vw, 4.4rem)" : "clamp(3rem, 7vw, 6.5rem)"}
        baseTextClassName="text-white/45"
        revealTextClassName="text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.45)]"
        containerClassName="h-full min-h-0 rounded-3xl border-white/10 bg-zinc-950 shadow-2xl shadow-black/50"
      />
    </div>
  );
}

// ─── Logo Cloud Previews ─────────────────────────────────────────────────────

function LogoCloudPreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-white dark:bg-neutral-950">
      <div className="absolute left-1/2 top-1/2 w-[900px] -translate-x-1/2 -translate-y-1/2 scale-[0.6]">
        {children}
      </div>
    </div>
  );
}

export function PreviewLogoCloudBlurFlip() {
  return (
    <LogoCloudPreviewShell>
      <LogosBlurFlip />
    </LogoCloudPreviewShell>
  );
}

export function PreviewLogoCloudBlur() {
  return (
    <LogoCloudPreviewShell>
      <LogoCloudBlur />
    </LogoCloudPreviewShell>
  );
}

export function PreviewLogoCloudMarquee() {
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      <div data-tile-focus className="w-[1040px] shrink-0">
        <LogoCloudMarquee className="py-8 sm:py-8" />
      </div>
    </div>
  );
}

export function PreviewLogoCloudSpotlight() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-neutral-950">
      <div className="absolute left-1/2 top-1/2 w-[900px] -translate-x-1/2 -translate-y-1/2 scale-[0.6]">
        <LogoCloudSpotlight />
      </div>
    </div>
  );
}

export function PreviewLogoCloudSwap() {
  return (
    <LogoCloudPreviewShell>
      <LogoCloudSwap />
    </LogoCloudPreviewShell>
  );
}

export function PreviewLogoCloudSingleRow() {
  return (
    <LogoCloudPreviewShell>
      <LogoCloudSingleRow />
    </LogoCloudPreviewShell>
  );
}

// Signature interactions (Oct 2026): each preview lives in its own module.
export * from "./signature/tick-slider";
export * from "./signature/time-scrubber";
export * from "./signature/slide-to-confirm";
export * from "./signature/emoji-reactions";
export * from "./signature/like-burst";
export * from "./signature/toast-stack";
export * from "./signature/upload-dropzone";
export * from "./signature/hold-to-record";
export * from "./signature/cursor-buddy";
export * from "./signature/dot-sphere";
export * from "./signature/dynamic-island";
export * from "./signature/checkout-moments";
export * from "./signature/motion-kit";
export * from "./blocks/block-variants";
export * from "./signature/motion-kit-a";
export * from "./signature/motion-kit-b";
export * from "./signature/motion-kit-c";
export * from "./signature/motion-kit-d";
export * from "./signature/motion-kit-e";
export * from "./signature/motion-kit-f";
export * from "./signature/motion-kit-g";
export * from "./signature/motion-kit-h";
export * from "./signature/motion-kit-i";
export * from "./blocks/motion-kit-blocks-a";
export * from "./blocks/motion-kit-blocks-b";
export * from "./blocks/motion-kit-blocks-c";
export * from "./blocks/motion-kit-blocks-d";
export * from "./signature/motion-kit-j";
export * from "./signature/motion-kit-k";
export * from "./signature/motion-kit-l";
export * from "./signature/motion-kit-m";
export * from "./signature/motion-kit-n";
export * from "./signature/motion-kit-o";
export * from "./signature/motion-kit-p";
export * from "./signature/motion-kit-q";
export * from "./signature/motion-kit-r";
export * from "./signature/motion-kit-s";
export * from "./blocks/motion-kit-blocks-e";
export * from "./blocks/motion-kit-blocks-f";
export * from "./redesign/animated-bento-grid";
export * from "./redesign/animated-select-headline";
export * from "./redesign/ask-nexus-input";
export * from "./redesign/avatar-group";
export * from "./redesign/background-boxes";
export * from "./redesign/background-gradient";
export * from "./redesign/beam-sweep-field";
export * from "./redesign/bento-grid-skeleton";
export * from "./redesign/bento-signal-grid";
export * from "./redesign/card-carousel-3d";
export * from "./redesign/card-stack-rotator";
export * from "./redesign/chat-messages";
export * from "./redesign/cinematic-card-deck";
export * from "./redesign/cinematic-logo-cloud";
export * from "./redesign/circular-carousel";
export * from "./redesign/code-block";
export * from "./redesign/compare";
export * from "./redesign/cursor-buddy";
export * from "./redesign/cursor-text-reveal";
export * from "./redesign/depth-testimonials";
export * from "./redesign/dot-grid-hero";
export * from "./redesign/dot-sphere";
export * from "./redesign/draggable-card-stack";
export * from "./redesign/dynamic-island";
export * from "./redesign/editorial-blog-rail";
export * from "./redesign/encrypted-text";
export * from "./redesign/expandable-cards";
export * from "./redesign/feature-tools-card";
export * from "./redesign/float-glass-navbar";
export * from "./redesign/floating-dock";
export * from "./redesign/forge-ai-command-bar";
export * from "./redesign/glass-login-stack";
export * from "./redesign/glow-button";
export * from "./redesign/glowing-effect-cards";
export * from "./redesign/gooey-search-input";
export * from "./redesign/hero-aurora-spotlight";
export * from "./redesign/hold-to-record";
export * from "./redesign/hover-highlight-text";
export * from "./redesign/image-trail";
export * from "./redesign/images-badge";
export * from "./redesign/infinite-moving-cards";
export * from "./redesign/interactive-globe-explorer";
export * from "./redesign/lattice-feature-grid";
export * from "./redesign/link-preview";
export * from "./redesign/mac-keyboard";
export * from "./redesign/meteors";
export * from "./redesign/milestone-timeline";
export * from "./redesign/motion-faq-disclosure";
export * from "./redesign/motion-layer-scroller";
export * from "./redesign/nebula-cta-glow";
export * from "./redesign/nebula-glass-card";
export * from "./redesign/orbit-footer";
export * from "./redesign/orbital-loader";
export * from "./redesign/phone-input";
export * from "./redesign/profile-orbit";
export * from "./redesign/pulse-dashboard-kpis";
export * from "./redesign/real-time-cursors";
export * from "./redesign/scroll-progress-bar";
export * from "./redesign/scroll-reveal-text";
export * from "./redesign/scrolling-testimonials";
export * from "./redesign/shader-flow";
export * from "./redesign/shooting-stars-grid";
export * from "./redesign/signup-form";
export * from "./redesign/slide-to-confirm";
export * from "./redesign/sparkles";
export * from "./redesign/spectra-frame";
export * from "./redesign/split-contact-glass";
export * from "./redesign/split-signup-convert";
export * from "./redesign/squiggly-text";
export * from "./redesign/starfield-hero";
export * from "./redesign/stateful-button";
export * from "./redesign/step-flow";
export * from "./redesign/svg-noise-shader";
export * from "./redesign/terminal";
export * from "./redesign/text-generate-effect";
export * from "./redesign/text-reveal-card";
export * from "./redesign/three-d-folder";
export * from "./redesign/tick-slider";
export * from "./redesign/time-scrubber";
export * from "./redesign/toast-stack";
export * from "./redesign/toggle-pricing-pro";
export * from "./redesign/tracing-spotlight-panel";
export * from "./redesign/typewriter-effect";
export * from "./redesign/upload-dropzone";
export * from "./redesign/vector-tilt-scene";
export * from "./redesign/warp-speed-card";
export * from "./redesign/wheel-selector";
export * from "./redesign/word-magnet";
export * from "./redesign/workbench-sidebar";
export * from "./signature/motion-kit-t";
export * from "./signature/motion-kit-u";
export * from "./signature/motion-kit-v";
export * from "./signature/motion-kit-w";
export * from "./blocks/motion-kit-blocks-g";
export * from "./signature/motion-kit-z";
export * from "./signature/motion-kit-aa";
export * from "./signature/motion-kit-x";
export * from "./signature/motion-kit-y";
export * from "./blocks/motion-kit-blocks-h";
export * from "./blocks/motion-kit-blocks-i";
export * from "./signature/motion-kit-ab";
export * from "./signature/nexus-states-a";
export * from "./signature/nexus-states-b";
export * from "./signature/made-by-sound";
export * from "./signature/cubes-grid";
export * from "./signature/motion-kit-batch-8";
export * from "./signature/motion-kit-batch-9";
export * from "./signature/motion-kit-batch-10";
export * from "./signature/motion-kit-batch-11";
export * from "./signature/motion-kit-batch-12";
export * from "./signature/motion-kit-batch-13";
export * from "./signature/motion-kit-batch-14";
export * from "./signature/motion-kit-batch-15";
export * from "./signature/motion-kit-batch-16";
export * from "./signature/motion-kit-batch-17";
export * from "./signature/motion-kit-batch-18";
export * from "./signature/motion-kit-batch-19";
export * from "./signature/nexus-states-c";
export * from "./signature/nexus-essentials-a";
export * from "./signature/nexus-essentials-b";
export * from "./blocks/nexus-essentials-blocks-a";
export * from "./blocks/nexus-essentials-blocks-b";
export * from "./blocks/nexus-essentials-blocks-c";
