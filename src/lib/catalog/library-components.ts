import type { ComponentType } from "react";
import type { AnimationKind, ComponentCategorySlug } from "@/lib/catalog/taxonomy";
import * as Previews from "@/registry/component-previews";

export type LibraryComponent = {
  slug: string;
  name: string;
  description: string;
  categorySlug: ComponentCategorySlug;
  tags: string[];
  premium: boolean;
  trendingScore: number;
  createdAt: string;
  animationKinds: AnimationKind[];
  dependencies: string[];
  /** `compact` is honored by previews that support an embedded mode (e.g. terminal sound off in grids). */
  Preview: ComponentType<{ compact?: boolean }>;
  /** Optional: render each preview in its own mac card on detail page. */
  detailPreviews?: ComponentType<{ compact?: boolean }>[];
  /** Preview shell style on component detail pages. */
  previewShell?: "mac" | "plain";
  /** Required unless previewSections is provided (which supplies per-section code instead). */
  reactSource?: string;
  /** Optional multiple React snippets for components with more than one canonical variant/example. */
  reactExamples?: Array<{ title: string; code: string }>;
  /**
   * When present, the detail page renders each entry as its own independent
   * Preview / Code tab block instead of the shared single-tab layout.
   */
  previewSections?: Array<{
    title?: string;
    Preview: ComponentType<{ compact?: boolean }>;
    reactSource: string;
  }>;
  tailwindSource: string;
  /** shadcn `add @scope/<name>` uses this basename; defaults to `slug` (e.g. gooey-search-input → gooey-input). */
  registryCliName?: string;
  /** Shown under the hero (reference docs, downloads, etc.). */
  resourceLinks?: Array<{ label: string; href: string }>;
  /** Optional prop docs shown on component detail pages. */
  props?: Array<{ name: string; type: string; description: string; defaultValue?: string }>;
};

const tw = `Use Tailwind utility composition with rounded-3xl, border-white/10, bg-zinc-950, backdrop-blur-xl, and gradient overlays. Prefer oklch-based neutrals and cyan/fuchsia accents for luminous contrast.`;

export const libraryComponents: LibraryComponent[] = [
  {
    slug: "scroll-progress-bar",
    name: "Scroll Progress Bar",
    registryCliName: "scroll-progress-bar",
    description:
      "A minimal vertical progress rail that fills smoothly as a target section moves through the viewport or a scrollable container.",
    categorySlug: "motion-effects",
    tags: ["scroll", "progress", "indicator", "section", "framer-motion", "navigation"],
    premium: false,
    trendingScore: 154,
    createdAt: "2026-05-27",
    animationKinds: ["scroll", "spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewScrollProgressBar,
    previewShell: "plain",
    reactSource: `"use client";

import * as React from "react";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";

export function StorySection() {
  const sectionRef = React.useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative flex gap-10 py-24">
      <aside className="sticky top-24 h-fit">
        <ScrollProgressBar
          targetRef={sectionRef}
          fillColor="#770bf4"
          backgroundColor="#dddddd"
          height={206}
          markerCount={4}
        />
      </aside>
      <div className="max-w-xl space-y-24">
        <h2 className="text-5xl font-semibold">A guided product story.</h2>
        <p className="text-lg text-neutral-500">
          Add long-form feature content here. The progress bar fills while
          this section travels through the viewport.
        </p>
        <p className="text-lg text-neutral-500">
          Keep scrolling to connect each chapter with a quiet visual cue.
        </p>
      </div>
    </section>
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "targetRef", type: "React.RefObject<HTMLElement | null>", description: "Section whose viewport progress drives the fill. Omit it to track the page or supplied container." },
      { name: "containerRef", type: "React.RefObject<HTMLElement | null>", description: "Optional scrollable parent when the bar lives inside a panel rather than the document." },
      { name: "progress", type: "MotionValue<number>", description: "Optional custom normalized progress value that overrides scroll tracking." },
      { name: "fillColor", type: "string", defaultValue: '"#770bf4"', description: "Active filler color." },
      { name: "backgroundColor", type: "string", defaultValue: '"#dddddd"', description: "Inactive rail color." },
      { name: "height", type: "number | string", defaultValue: "206", description: "Height of the progress rail." },
      { name: "width", type: "number | string", defaultValue: "2", description: "Width of the progress rail." },
      { name: "markerCount", type: "number", defaultValue: "4", description: "Number of milestone circles rendered along the rail." },
      { name: "markerSize", type: "number", defaultValue: "10", description: "Circle diameter in pixels." },
      { name: "showMarkers", type: "boolean", defaultValue: "true", description: "Show or hide milestone circles on the rail." },
      { name: "stiffness", type: "number", defaultValue: "150", description: "Spring stiffness used to smooth scroll progress." },
      { name: "damping", type: "number", defaultValue: "26", description: "Spring damping used to settle the filler movement." },
      { name: "className", type: "string", description: "Additional classes on the rail wrapper." },
    ],
  },
  {
    slug: "wheel-selector",
    name: "Wheel Selector",
    registryCliName: "wheel-selector",
    description:
      "An interactive radial navigation dial for services, features, or portfolio items with drag, wheel, and click input plus a responsive mobile arch.",
    categorySlug: "feature-sections",
    tags: ["wheel", "radial", "navigation", "services", "portfolio", "drag", "responsive", "framer-motion"],
    premium: false,
    trendingScore: 152,
    createdAt: "2026-05-26",
    animationKinds: ["hover", "spring", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewWheelSelector,
    previewShell: "plain",
    reactSource: `"use client";

import { WheelSelector, type WheelItem } from "@/components/wheel-selector";

const services: WheelItem[] = [
  {
    id: "strategy",
    label: "Strategy",
    subtitle: "Direction",
    title: "Product Strategy",
    description: "Position products with a clear story and roadmap.",
    icon: "compass",
    accentColor: "#38bdf8",
    ctaHref: "#strategy",
  },
  {
    id: "design",
    label: "Design",
    subtitle: "Craft",
    title: "Experience Design",
    description: "Create interfaces people understand immediately.",
    icon: "pen",
    accentColor: "#f97316",
    ctaHref: "#design",
  },
  {
    id: "research",
    label: "Insights",
    subtitle: "Learn",
    title: "User Research",
    description: "Turn user signals into confident product decisions.",
    icon: "analytics",
    accentColor: "#8b5cf6",
    ctaHref: "#research",
  },
];

export function ServicesWheel() {
  return (
    <WheelSelector
      items={services}
      theme="obsidian"
      contentMode="detailed"
      showTicks
      showCounter
      autoRotate
      autoRotateInterval={4500}
    />
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "items", type: "WheelItem[]", description: "Content entries with title, subtitle, description, accent, icon or uploaded icon URL, image, and CTA values." },
      { name: "theme", type: "\"obsidian\" | \"midnight\" | \"arctic\" | \"ember\" | \"custom\"", defaultValue: "\"obsidian\"", description: "Curated color treatment or fully overridden custom colors." },
      { name: "variant", type: "\"responsive\" | \"desktop\" | \"mobile\"", defaultValue: "\"responsive\"", description: "Responsive ring-to-arch behavior or a forced presentation variant." },
      { name: "contentMode", type: "\"minimal\" | \"detailed\" | \"hidden\"", defaultValue: "\"detailed\"", description: "Amount of supporting content shown beside the dial." },
      { name: "ringRadius", type: "number", defaultValue: "186", description: "Desktop ring radius in pixels, clamped between 100 and 400." },
      { name: "tickCount", type: "number", defaultValue: "48", description: "Number of dial perimeter tick marks, clamped from 10 to 80." },
      { name: "showTicks", type: "boolean", defaultValue: "true", description: "Display the animated perimeter tick marks." },
      { name: "showCounter", type: "boolean", defaultValue: "true", description: "Display the animated selection counter in the hub or arch." },
      { name: "showCTA", type: "boolean", defaultValue: "false", description: "Enable per-item call-to-action links globally." },
      { name: "autoRotate", type: "boolean", defaultValue: "false", description: "Advance selection automatically until a user interacts." },
      { name: "autoRotateInterval", type: "number", defaultValue: "4500", description: "Automatic advancement interval in milliseconds, from 1000 to 15000." },
      { name: "animationSpeed", type: "\"slow\" | \"medium\" | \"fast\"", defaultValue: "\"medium\"", description: "Transition pace for wheel positions and content changes." },
      { name: "backgroundColor", type: "string", description: "Override the component background color." },
      { name: "accentColor", type: "string", description: "Default accent when an item does not provide its own accentColor." },
      { name: "textColor", type: "string", description: "Override title and primary text color." },
      { name: "mutedTextColor", type: "string", description: "Override secondary copy color." },
      { name: "cardColor", type: "string", description: "Override dial node and center hub color." },
      { name: "ringStrokeColor", type: "string", description: "Override ring, border, and inactive tick color." },
      { name: "ctaBackgroundColor", type: "string", description: "Custom CTA background color." },
      { name: "ctaTextColor", type: "string", description: "Custom CTA text color." },
      { name: "ctaBorderColor", type: "string", description: "Custom CTA border color." },
      { name: "titleFontFamily", type: "string", description: "Independent typeface for selected item titles." },
      { name: "bodyFontFamily", type: "string", description: "Independent typeface for description copy." },
      { name: "labelFontFamily", type: "string", description: "Independent typeface for labels, CTA, and counters." },
      { name: "fontFamily", type: "string", description: "Base typeface fallback for the entire component." },
      { name: "activeIndex", type: "number", description: "Optional controlled selected index." },
      { name: "onActiveChange", type: "(index: number) => void", description: "Called whenever wheel, drag, or click navigation changes selection." },
      { name: "className", type: "string", description: "Extra classes on the component shell." },
    ],
  },
  {
    slug: "cinematic-card-deck",
    name: "Cinematic Card Deck",
    registryCliName: "cinematic-card-deck",
    description:
      "A scroll-linked 3D card stack with depth, ambient glow, progress dots, cursor parallax, and optional image-backed cards.",
    categorySlug: "cards",
    tags: ["cards", "scroll", "3d", "stack", "framer-motion", "parallax"],
    premium: false,
    trendingScore: 148,
    createdAt: "2026-05-22",
    animationKinds: ["scroll", "3d", "parallax", "spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCinematicCardDeck,
    reactSource: `"use client";

import { CinematicCardDeck } from "@/components/cinematic-card-deck";

const cards = [
  {
    title: "Launch Systems",
    description:
      "Ship cohesive landing pages with reusable sections, shared spacing rules, and motion that feels designed from the first scroll.",
    tag: "Foundation",
    cardColor: "#0A0A0A",
    accentColor: "#FF6B4A",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Motion Stories",
    description:
      "Layer cards, depth, and scroll-linked perspective to turn feature explanations into a cinematic product narrative.",
    tag: "Animation",
    cardColor: "#1A1235",
    accentColor: "#A78BFF",
    imageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Fast Interfaces",
    description:
      "GPU-friendly transforms keep the deck smooth while content stays readable, responsive, and ready for production pages.",
    tag: "Engineering",
    cardColor: "#0C2340",
    accentColor: "#4ADBFF",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
];

export function CinematicCardDeckDemo() {
  return (
    <CinematicCardDeck
      cards={cards}
      intensity="cinematic"
      sectionHeight={360}
      cardWidth={520}
      cardHeight={360}
    />
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "cards", type: "CinematicDeckCard[]", description: "Cards to render in the scroll-linked deck." },
      { name: "intensity", type: '"subtle" | "standard" | "cinematic"', defaultValue: '"standard"', description: "Controls depth, rotation, blur, and exit drama." },
      { name: "exitDirection", type: '"up" | "down"', defaultValue: '"up"', description: "Direction cards fly away while scrolling." },
      { name: "cardWidth", type: "number", defaultValue: "520", description: "Card width in pixels." },
      { name: "cardHeight", type: "number", defaultValue: "360", description: "Card height in pixels." },
      { name: "sectionHeight", type: "number", defaultValue: "400", description: "Scroll distance in viewport heights." },
      { name: "smoothing", type: "number", defaultValue: "0.7", description: "Spring smoothing for scroll progress." },
      { name: "showProgress", type: "boolean", defaultValue: "true", description: "Show side progress dots." },
      { name: "showAmbientGlow", type: "boolean", defaultValue: "true", description: "Show accent-colored glow behind the active card." },
    ],
  },
  {
    slug: "cursor-text-reveal",
    name: "Cursor Text Reveal",
    registryCliName: "cursor-text-reveal",
    resourceLinks: [{ label: "Live demo", href: "/demos/cursor-text-reveal" }],
    description:
      "An immersive cursor-following spotlight that reveals alternate text, gradients, or imagery beneath perfectly aligned headline layers.",
    categorySlug: "motion-effects",
    tags: ["cursor", "text", "reveal", "spotlight", "mask", "hero", "framer-motion"],
    premium: false,
    trendingScore: 142,
    createdAt: "2026-05-22",
    animationKinds: ["hover", "spring", "magnetic"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCursorTextReveal,
    previewSections: [
      {
        title: "Text Reveal",
        Preview: Previews.PreviewCursorTextReveal,
        reactSource: `"use client";

import { CursorTextReveal } from "@/components/cursor-text-reveal";

export function TextRevealExample() {
  return (
    <CursorTextReveal
      baseText="The first rule of motion is clarity."
      revealText="The second rule is feeling."
      maskSize={310}
      smoothness={0.16}
      enableGlow={false}
      showAmbient={false}
      showGrid={false}
      revealBackgroundClassName="bg-black"
      baseTextClassName="text-zinc-950"
      revealTextClassName="text-white"
      containerClassName="border-zinc-200 bg-white text-zinc-950 shadow-sm"
    />
  );
}`,
      },
      {
        title: "Image Reveal",
        Preview: Previews.PreviewCursorTextRevealImage,
        reactSource: `"use client";

import { CursorTextReveal } from "@/components/cursor-text-reveal";

export function ImageRevealExample() {
  return (
    <CursorTextReveal
      baseText="We chase moments in time to feel alive."
      revealText="We keep the moments we usually ignore."
      backgroundImage="https://images.unsplash.com/photo-1730874829217-f7f666e94822?auto=format&fit=crop&w=1800&q=85"
      backgroundPosition="42% center"
      mode="image"
      revealImage="https://images.unsplash.com/photo-1649787652660-df5ac7c91532?auto=format&fit=crop&w=1800&q=85"
      revealImagePosition="center"
      maskSize={340}
      smoothness={0.2}
      enableGlow={false}
      showAmbient={false}
      showGrid={false}
      baseTextClassName="text-white/45"
      revealTextClassName="text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.45)]"
    />
  );
}`,
      },
    ],
    reactSource: `"use client";

import { CursorTextReveal } from "@/components/cursor-text-reveal";

export function CursorTextRevealExample() {
  return (
    <CursorTextReveal
      baseText="The first rule of motion is clarity."
      revealText="The second rule is feeling."
      maskSize={310}
      smoothness={0.16}
      enableGlow={false}
      showAmbient={false}
      showGrid={false}
      revealBackgroundClassName="bg-black"
      baseTextClassName="text-zinc-950"
      revealTextClassName="text-white"
      containerClassName="border-zinc-200 bg-white text-zinc-950 shadow-sm"
    />
  );
}`,
    reactExamples: [
      {
        title: "Image reveal",
        code: `"use client";

import { CursorTextReveal } from "@/components/cursor-text-reveal";

export function ImageRevealExample() {
  return (
    <CursorTextReveal
      baseText="We chase moments in time to feel alive."
      revealText="We keep the moments we usually ignore."
      backgroundImage="https://images.unsplash.com/photo-1730874829217-f7f666e94822?auto=format&fit=crop&w=1800&q=85"
      backgroundPosition="42% center"
      mode="image"
      revealImage="https://images.unsplash.com/photo-1649787652660-df5ac7c91532?auto=format&fit=crop&w=1800&q=85"
      revealImagePosition="center"
      maskSize={340}
      smoothness={0.2}
      enableGlow={false}
      showAmbient={false}
      showGrid={false}
      baseTextClassName="text-white/45"
      revealTextClassName="text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.45)]"
    />
  );
}`,
      },
    ],
    tailwindSource: `"use client";

import { CursorTextReveal } from "@/components/cursor-text-reveal";

export function CursorTextRevealExample() {
  return (
    <CursorTextReveal
      baseText="The first rule of motion is clarity."
      revealText="The second rule is feeling."
      maskSize={310}
      smoothness={0.16}
      enableGlow={false}
      showAmbient={false}
      showGrid={false}
      revealBackgroundClassName="bg-black"
      baseTextClassName="text-zinc-950"
      revealTextClassName="text-white"
      containerClassName="border-zinc-200 bg-white text-zinc-950 shadow-sm"
    />
  );
}`,
    props: [
      { name: "baseText", type: "string", description: "Primary text layer visible by default." },
      { name: "revealText", type: "string", description: "Secondary text revealed inside the circular cursor mask." },
      { name: "backgroundImage", type: "string", description: "Optional full-card background image for cinematic image reveals." },
      { name: "backgroundPosition", type: "string", defaultValue: '"center"', description: "CSS background-position for the full-card background image." },
      { name: "revealImage", type: "string", description: "Image URL used in image reveal mode." },
      { name: "revealImagePosition", type: "string", defaultValue: '"center"', description: "CSS background-position for the image revealed inside the cursor mask." },
      { name: "mode", type: '"text" | "image"', defaultValue: '"text"', description: "Reveal text or an image/texture layer beneath the base text." },
      { name: "maskSize", type: "number", defaultValue: "240", description: "Expanded circular spotlight radius in pixels." },
      { name: "initialMaskSize", type: "number", defaultValue: "0", description: "Resting mask size before hover or after leave." },
      { name: "smoothness", type: "number", defaultValue: "0.18", description: "Spring response for cursor tracking. Lower values feel snappier." },
      { name: "fontSize", type: "string", defaultValue: '"clamp(2.75rem, 8vw, 8rem)"', description: "CSS font-size applied to both aligned text layers." },
      { name: "align", type: '"left" | "center" | "right"', defaultValue: '"center"', description: "Text alignment and horizontal placement." },
      { name: "enableGlow", type: "boolean", defaultValue: "true", description: "Show a soft circular glow around the spotlight edge." },
      { name: "showAmbient", type: "boolean", defaultValue: "true", description: "Render the built-in radial color wash behind the text." },
      { name: "showGrid", type: "boolean", defaultValue: "true", description: "Render the built-in subtle grid overlay." },
      { name: "revealBackgroundClassName", type: "string", description: "ClassName for a masked reveal backdrop, useful for solid black spotlight circles." },
      { name: "baseTextClassName", type: "string", description: "ClassName applied to the default text layer." },
      { name: "revealTextClassName", type: "string", description: "ClassName applied to the revealed text layer." },
      { name: "containerClassName", type: "string", description: "ClassName for the outer section." },
      { name: "className", type: "string", description: "ClassName for the inner content wrapper." },
    ],
  },
  {
    slug: "cinematic-logo-cloud",
    name: "Cinematic Logo Cloud",
    description: "A staggered blur-fade entrance animation for brand logos. Uses framer-motion and fully semantic responsive layouts.",
    categorySlug: "logo-clouds",
    tags: ["logos", "brand", "marquee", "social proof", "framer-motion", "blur"],
    premium: false,
    trendingScore: 92,
    createdAt: "2024-05-15T00:00:00.000Z",
    animationKinds: ["spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCinematicLogoCloud,
    previewSections: [
      {
        Preview: Previews.PreviewCinematicLogoCloudGrid,
        reactSource: `"use client";
import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";

const clients = [
  { name: "OpenAI",       text: true, className: "font-sans font-semibold tracking-tight" },
  { name: "Bloomberg",    text: true, className: "font-sans font-black tracking-tighter" },
  { name: "NETFLIX",      slug: "netflix" },
  { name: "Spotify",      slug: "spotify" },
  { name: "Raycast",      slug: "raycast" },
  { name: "Vercel",       slug: "vercel",  invertDark: true },
  { name: "Stripe",       slug: "stripe" },
  { name: "Linear",       slug: "linear",  invertDark: true },
  { name: "GitHub",       slug: "github",  invertDark: true },
  { name: "Notion",       slug: "notion",  invertDark: true },
];

export function GridLogoCloud() {
  return (
    <CinematicLogoCloud
      clients={clients}
      eyebrow="Trusted by teams building the future of AI."
      description="From prototype to production, autonomously."
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewCinematicLogoCloudMarquee,
        reactSource: `"use client";
import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";

const clients = [
  { name: "Stripe",    slug: "stripe" },
  { name: "Figma",     slug: "figma",     invertDark: true },
  { name: "Framer",    slug: "framer" },
  { name: "Linear",    slug: "linear",    invertDark: true },
  { name: "Vercel",    slug: "vercel",    invertDark: true },
  { name: "GitHub",    slug: "github",    invertDark: true },
  { name: "Notion",    slug: "notion",    invertDark: true },
  { name: "Raycast",   slug: "raycast" },
  { name: "Loom",      slug: "loom" },
  { name: "Intercom",  slug: "intercom" },
  { name: "Twitch",    slug: "twitch" },
];

export function MarqueeLogoCloud() {
  return (
    <CinematicLogoCloud
      clients={clients}
      variant="marquee"
      eyebrow="Integrates with your entire stack."
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewCinematicLogoCloudNamed,
        reactSource: `"use client";
import { CinematicLogoCloud } from "@/components/cinematic-logo-cloud";

const clients = [
  { name: "Stripe",   slug: "stripe",   nameClassName: "font-sans font-semibold tracking-tight" },
  { name: "Figma",    slug: "figma",    invertDark: true, nameClassName: "font-sans font-semibold tracking-tight" },
  { name: "Framer",   slug: "framer",   nameClassName: "font-sans font-medium" },
  { name: "Linear",   slug: "linear",   invertDark: true, nameClassName: "font-sans font-medium tracking-tight" },
  { name: "Vercel",   slug: "vercel",   invertDark: true, nameClassName: "font-sans font-bold tracking-tight" },
  { name: "GitHub",   slug: "github",   invertDark: true, nameClassName: "font-sans font-semibold" },
  { name: "Notion",   slug: "notion",   invertDark: true, nameClassName: "font-sans font-medium" },
  { name: "Raycast",  slug: "raycast",  nameClassName: "font-sans font-semibold tracking-tight" },
  { name: "Loom",     slug: "loom",     nameClassName: "font-sans font-bold tracking-tight" },
  { name: "Intercom", slug: "intercom", nameClassName: "font-sans font-bold" },
  { name: "Twitch",   slug: "twitch",   nameClassName: "font-sans font-black tracking-tight" },
  { name: "Spotify",  slug: "spotify",  nameClassName: "font-sans font-black tracking-tight" },
];

export function NamedMarqueeLogoCloud() {
  return (
    <CinematicLogoCloud
      clients={clients}
      variant="marquee-named"
      eyebrow="Used by teams at the world's best companies."
    />
  );
}`,
      },
    ],
    reactSource: `"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

export type LogoCloudClient = {
  name: string;
  slug?: string;
  text?: boolean;
  className?: string;
  invertDark?: boolean;
};

export interface CinematicLogoCloudProps {
  clients: LogoCloudClient[];
  variant?: "grid" | "marquee";
  className?: string;
  eyebrow?: string;
  description?: string;
}

export function CinematicLogoCloud({
  clients,
  variant = "grid",
  className,
  eyebrow = "Trusted by teams building the future of AI.",
  description,
}: CinematicLogoCloudProps) {
  const renderClient = (client: LogoCloudClient, size: "lg" | "sm" = "lg") => {
    if (client.text) {
      return (
        <span className={cn(size === "lg" ? "text-xl font-bold text-zinc-900 dark:text-white" : "text-sm font-semibold text-zinc-700 dark:text-zinc-300", client.className)}>
          {client.name}
        </span>
      );
    }
    return (
      <img
        src={\`https://cdn.simpleicons.org/\${client.slug}\`}
        alt={client.name}
        className={cn(size === "lg" ? "h-6 w-auto" : "h-5 w-auto", client.invertDark && "dark:invert")}
        loading="lazy"
      />
    );
  };

  if (variant === "marquee") {
    return (
      <div className={cn("w-full bg-zinc-50/50 py-12 md:py-16 dark:bg-zinc-950", className)}>
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">{eyebrow}</p>
        <Marquee speed={35}>
          {clients.map((brand) => (
            <div key={brand.name} className="flex shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-white px-5 py-3 shadow-sm dark:border-white/8 dark:bg-zinc-900">
              {renderClient(brand, "sm")}
            </div>
          ))}
        </Marquee>
      </div>
    );
  }

  return (
    <div className={cn("w-full bg-zinc-50/50 py-12 md:py-16 dark:bg-zinc-950", className)}>
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{eyebrow}</p>
        {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6"
        >
          {clients.map((brand) => (
            <motion.div
              key={brand.name}
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="flex min-w-25 items-center justify-center px-2 sm:min-w-30"
            >
              {renderClient(brand)}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}`,
    tailwindSource: "",
    registryCliName: "cinematic-logo-cloud",
    props: [
      { name: "clients",     type: "LogoCloudClient[]",       description: "Array of brand objects — each needs name plus either slug (simpleicons) or text: true with optional className." },
      { name: "variant",     type: '"grid" | "marquee"',       description: "grid renders a staggered blur-fade entrance; marquee renders a continuously scrolling pill row.", defaultValue: '"grid"' },
      { name: "eyebrow",     type: "string",                   description: "Small uppercase label above the logos.", defaultValue: '"Trusted by teams building the future of AI."' },
      { name: "description", type: "string",                   description: "Optional supporting line shown below the eyebrow in grid variant." },
      { name: "className",   type: "string",                   description: "Extra classes on the section wrapper." },
    ]
  },
  {
    slug: "step-flow",
    name: "Step Flow",
    registryCliName: "step-flow",
    description:
      "A responsive four-step process section with a sliding highlight, animated image swaps, and hover or click step selection.",
    categorySlug: "feature-sections",
    tags: ["steps", "process", "feature", "hover", "motion", "framer-motion"],
    premium: false,
    trendingScore: 96,
    createdAt: "2026-05-23",
    animationKinds: ["hover", "spring", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewStepFlow,
    reactSource: `"use client";

import { StepFlow } from "@/components/step-flow";

const steps = [
  {
    serial: "01",
    title: "Audit the idea",
    description: "Collect the messy notes, user goals, and brand cues before a single section is built.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
  },
  {
    serial: "02",
    title: "Sketch the system",
    description: "Turn the direction into reusable layout rules, component states, and rhythm.",
    image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    serial: "03",
    title: "Layer the motion",
    description: "Add transitions that guide attention without making the page feel busy.",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85",
  },
  {
    serial: "04",
    title: "Ship the page",
    description: "Package a polished, responsive experience your users can copy into production.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
  },
];

export function StepFlowDemo() {
  return (
    <StepFlow
      steps={steps}
      highlightColor="rgb(229 229 229)"
      className="mx-auto max-w-6xl"
    />
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "steps", type: "StepFlowItem[]", description: "Process steps with serial number, title, optional description, and image URL." },
      { name: "defaultStep", type: "number", defaultValue: "0", description: "Initial active step index." },
      { name: "highlightColor", type: "string", defaultValue: '"rgb(229 229 229)"', description: "Color used by the moving active step panel." },
      { name: "autoPlay", type: "boolean", defaultValue: "false", description: "Automatically advance through steps." },
      { name: "autoPlayInterval", type: "number", defaultValue: "3500", description: "Delay between auto-play step changes in milliseconds." },
      { name: "className", type: "string", description: "ClassName for the outer section." },
      { name: "textClassName", type: "string", description: "ClassName for the step list column." },
      { name: "imageClassName", type: "string", description: "ClassName for the image preview column." },
    ],
  },
  {
    slug: "phone-input",
    name: "Phone Input",
    description: "A modern animated phone number input with country selector and validation.",
    categorySlug: "cards",
    tags: ["form", "phone", "country", "input", "validation", "framer-motion"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-05-16",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewPhoneInput,
    reactSource: `"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Country {
  iso: string;
  name: string;
  code: string;
  max: number;
}

export const COUNTRIES: Country[] = [
  { iso: "US", name: "United States", code: "+1", max: 10 },
  { iso: "CA", name: "Canada", code: "+1", max: 10 },
  { iso: "MX", name: "Mexico", code: "+52", max: 10 },
  { iso: "GB", name: "United Kingdom", code: "+44", max: 10 },
  { iso: "FR", name: "France", code: "+33", max: 9 },
  { iso: "DE", name: "Germany", code: "+49", max: 11 },
  { iso: "IT", name: "Italy", code: "+39", max: 10 },
  { iso: "ES", name: "Spain", code: "+34", max: 9 },
  { iso: "NL", name: "Netherlands", code: "+31", max: 9 },
  { iso: "SE", name: "Sweden", code: "+46", max: 9 },
  { iso: "IE", name: "Ireland", code: "+353", max: 9 },
  { iso: "PT", name: "Portugal", code: "+351", max: 9 },
  { iso: "IN", name: "India", code: "+91", max: 10 },
  { iso: "CN", name: "China", code: "+86", max: 11 },
  { iso: "JP", name: "Japan", code: "+81", max: 10 },
  { iso: "KR", name: "South Korea", code: "+82", max: 10 },
  { iso: "SG", name: "Singapore", code: "+65", max: 8 },
  { iso: "HK", name: "Hong Kong", code: "+852", max: 8 },
  { iso: "AU", name: "Australia", code: "+61", max: 9 },
  { iso: "NZ", name: "New Zealand", code: "+64", max: 9 },
  { iso: "BR", name: "Brazil", code: "+55", max: 11 },
  { iso: "AR", name: "Argentina", code: "+54", max: 10 },
  { iso: "AE", name: "United Arab Emirates", code: "+971", max: 9 },
  { iso: "SA", name: "Saudi Arabia", code: "+966", max: 9 },
  { iso: "IL", name: "Israel", code: "+972", max: 9 },
  { iso: "EG", name: "Egypt", code: "+20", max: 10 },
  { iso: "ZA", name: "South Africa", code: "+27", max: 9 },
  { iso: "TR", name: "Turkey", code: "+90", max: 10 },
  { iso: "RU", name: "Russia", code: "+7", max: 10 },
];

function flagFromIso(iso: string): string {
  return iso
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

function formatDigits(digits: string): string {
  if (!digits) return "";
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 3) {
    groups.push(digits.slice(i, i + 3));
  }
  return groups.join(" ");
}

export interface PhoneInputValue {
  iso: string;
  code: string;
  number: string;
  isValid: boolean;
}

export interface PhoneInputProps {
  defaultCountry?: string;
  placeholder?: string;
  label?: string;
  minDigits?: number;
  onChange?: (value: PhoneInputValue) => void;
  className?: string;
}

export function PhoneInput({
  defaultCountry = "US",
  placeholder = "Phone number",
  label,
  minDigits = 7,
  onChange,
  className,
}: PhoneInputProps) {
  const [selectedIso, setSelectedIso] = useState(defaultCountry);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [digits, setDigits] = useState("");
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.iso === selectedIso) ?? COUNTRIES[0],
    [selectedIso],
  );

  const isValid = digits.length >= minDigits;
  const hasError = touched && !focused && digits.length > 0 && !isValid;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [search]);

  useEffect(() => {
    onChange?.({
      iso: selected.iso,
      code: selected.code,
      number: digits,
      isValid,
    });
  }, [selected.iso, selected.code, digits, isValid, onChange]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => searchInputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const handleDigitsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\\D/g, "");
      setDigits(raw.slice(0, selected.max));
    },
    [selected.max],
  );

  const handleSelect = useCallback((iso: string) => {
    setSelectedIso(iso);
    setOpen(false);
    setSearch("");
    requestAnimationFrame(() => phoneInputRef.current?.focus());
  }, []);

  const handleTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const ringColor = focused
    ? "rgb(99,102,241)"
    : hasError
      ? "rgb(239,68,68)"
      : "rgb(229,231,235)";
  const ringShadow = focused
    ? "0 0 0 4px rgba(99,102,241,0.14), 0 1px 2px rgba(0,0,0,0.03)"
    : hasError
      ? "0 0 0 4px rgba(239,68,68,0.10)"
      : "0 1px 2px rgba(0,0,0,0.03)";
  const surfaceBg = focused ? "rgb(255,255,255)" : "rgb(250,250,250)";

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-md", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      )}

      <motion.div
        animate={{
          borderColor: ringColor,
          boxShadow: ringShadow,
          backgroundColor: surfaceBg,
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-stretch overflow-hidden rounded-xl border"
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          onKeyDown={handleTriggerKey}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={\`Country: \${selected.name}\`}
          className="flex shrink-0 items-center gap-2 border-r border-gray-200 px-3 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
        >
          <span className="text-lg leading-none" aria-hidden>
            {flagFromIso(selected.iso)}
          </span>
          <span className="text-sm font-medium text-gray-900">{selected.code}</span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-gray-400"
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </button>

        <div className="relative flex-1">
          <input
            ref={phoneInputRef}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={formatDigits(digits)}
            onChange={handleDigitsChange}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setTouched(true);
            }}
            placeholder={placeholder}
            aria-label={label ?? "Phone number"}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? "phone-input-error" : undefined}
            className="h-12 w-full bg-transparent px-3 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />

          <AnimatePresence>
            {isValid && !focused && (
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                aria-hidden
              >
                <Check className="size-4" strokeWidth={2.5} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {hasError && (
          <motion.p
            id="phone-input-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500"
          >
            <AlertCircle className="size-3.5" />
            That number looks too short — please add the remaining digits.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top center" }}
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18),0_4px_8px_-2px_rgba(15,23,42,0.06)]"
            role="listbox"
            aria-label="Country list"
          >
            <div className="border-b border-gray-100 p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or code"
                  aria-label="Search countries"
                  className="h-9 w-full rounded-md bg-gray-50 pl-8 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:bg-gray-100"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-gray-400">
                  No countries match &ldquo;{search}&rdquo;
                </div>
              ) : (
                filtered.map((c) => {
                  const isSelected = c.iso === selected.iso;
                  return (
                    <button
                      key={c.iso}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(c.iso)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-indigo-50 text-indigo-900"
                          : "text-gray-900 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none",
                      )}
                    >
                      <span className="text-base leading-none" aria-hidden>
                        {flagFromIso(c.iso)}
                      </span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          isSelected ? "text-indigo-500" : "text-gray-400",
                        )}
                      >
                        {c.code}
                      </span>
                      {isSelected && (
                        <Check className="size-4 text-indigo-500" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}`,
    tailwindSource: tw,
    registryCliName: "phone-input",
    props: [
      { name: "defaultCountry", type: "string", description: "ISO 3166-1 alpha-2 code for the initially selected country.", defaultValue: "US" },
      { name: "placeholder", type: "string", description: "Placeholder text shown in the phone number input.", defaultValue: "Phone number" },
      { name: "label", type: "string", description: "Optional label text displayed above the input." },
      { name: "minDigits", type: "number", description: "Minimum digits required for validation.", defaultValue: "7" },
      { name: "onChange", type: "(value: PhoneInputValue) => void", description: "Callback fired when the phone number or country changes." },
      { name: "className", type: "string", description: "Optional CSS classes to override wrapper styling." }
    ]
  },
  {
    slug: "hero-aurora-spotlight",
    name: "Aurora Hero Spotlight",
    description:
      "A launch hero on a slow aurora: a soft spotlight follows the pointer, the headline catches the light, and a glass product card rises underneath.",
    categorySlug: "hero-sections",
    tags: ["marketing", "gradient", "pointer"],
    premium: false,
    trendingScore: 98,
    createdAt: "2026-04-02",
    animationKinds: ["hover", "gradient"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewHeroAurora,
    previewShell: "plain",
    props: [
      { name: "eyebrow", type: "string", description: "Pill text above the headline." },
      { name: "title", type: "ReactNode", description: "Headline." },
      { name: "subtitle", type: "string", description: "Supporting line." },
      { name: "primary", type: "{ label: string; href: string }", description: "Primary call to action." },
      { name: "secondary", type: "{ label: string; href: string }", description: "Secondary call to action." },
      { name: "spotlight", type: "string", defaultValue: "\"rgba(56,189,248,0.22)\"", description: "Colour of the pointer spotlight." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    reactSource: `"use client";

import { HeroAurora } from "@/components/hero-aurora-spotlight";

export function Hero() {
  return (
    <HeroAurora
      eyebrow="Now with realtime sync"
      title="The workspace that keeps up with you"
      subtitle="Docs, tasks and decisions in one fast, keyboard-first place."
      primary={{ label: "Get started free", href: "/signup" }}
      secondary={{ label: "See it in action", href: "/demo" }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "bento-signal-grid",
    name: "Signal Bento Grid",
    description:
      "A monitoring bento: a live latency chart, 30 days of uptime bars, a request counter that counts up in view, and edge-region health.",
    categorySlug: "bento-grids",
    tags: ["dashboard", "metrics"],
    premium: false,
    trendingScore: 91,
    createdAt: "2026-03-18",
    animationKinds: ["scroll", "gradient"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewBentoMetrics,
    previewShell: "plain",
    props: [
      { name: "latency", type: "number", defaultValue: "42", description: "Latency in ms the live chart hovers around." },
      { name: "uptime", type: "string", defaultValue: "\"99.98%\"", description: "Uptime shown on the uptime tile." },
      { name: "days", type: "(\"ok\" | \"degraded\" | \"down\")[]", description: "Daily status for the uptime bars, oldest first." },
      { name: "requests", type: "number", description: "Requests served, counted up in view." },
      { name: "regions", type: "{ name: string; ms: number; status?: \"ok\" | \"degraded\" }[]", description: "Edge regions and their latency." },
      { name: "live", type: "boolean", defaultValue: "true", description: "Keep the latency chart ticking." },
      { name: "className", type: "string", description: "Extra classes on the grid." },
    ],
    reactSource: `"use client";

import { BentoSignals } from "@/components/bento-signal-grid";

export function StatusGrid() {
  return (
    <BentoSignals
      latency={38}
      uptime="99.99%"
      requests={8_204_119}
      regions={[
        { name: "Dublin", ms: 16 },
        { name: "Oregon", ms: 29 },
        { name: "Tokyo", ms: 54, status: "degraded" },
        { name: "Sydney", ms: 47 },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "nebula-glass-card",
    name: "Nebula Glass Card",
    description: "3D tilt card with spring physics and luminous edge lighting.",
    categorySlug: "cards",
    tags: ["product", "depth"],
    premium: false,
    trendingScore: 104,
    createdAt: "2026-04-28",
    animationKinds: ["3d", "spring", "hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCardTilt,
    reactSource: `"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function NebulaCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-40, 40], [8, -8]), { stiffness: 260, damping: 20 });
  const ry = useSpring(useTransform(x, [-40, 40], [-8, 8]), { stiffness: 260, damping: 20 });

  return (
    <motion.div style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }} onMouseMove={(e) => {
      const r = e.currentTarget.getBoundingClientRect();
      x.set(e.clientX - r.left - r.width / 2);
      y.set(e.clientY - r.top - r.height / 2);
    }} onMouseLeave={() => { x.set(0); y.set(0); }} className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
      <p className="text-white">Tilt depth</p>
    </motion.div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "float-glass-navbar",
    name: "Float Glass Navbar",
    description: "Glass navigation rail with spring entrance and CTA emphasis.",
    categorySlug: "navbars",
    tags: ["layout", "glass"],
    premium: false,
    trendingScore: 87,
    createdAt: "2026-02-10",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewNavbarFloating,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function FloatingNav() {
  return (
    <motion.header initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
      <span className="text-sm font-semibold text-white">Brand</span>
      <motion.button whileHover={{ scale: 1.03 }} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900">Start</motion.button>
    </motion.header>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "orbit-footer",
    name: "Orbit Footer",
    description:
      "A complete site footer: brand and newsletter signup, link columns with badges, a live status pill and a giant ghost wordmark that rises into view.",
    categorySlug: "footers",
    tags: ["layout"],
    premium: false,
    trendingScore: 62,
    createdAt: "2026-01-22",
    animationKinds: ["hover"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewFooterMini,
    previewShell: "plain",
    props: [
      { name: "brand", type: "string", defaultValue: "\"Orbit\"", description: "Wordmark shown top-left and as the ghost word." },
      { name: "tagline", type: "string", description: "Line under the brand." },
      { name: "columns", type: "{ title: string; links: { label: string; href: string; badge?: string }[] }[]", description: "Link columns." },
      { name: "status", type: "string | null", defaultValue: "\"All systems normal\"", description: "Status pill text; null hides it." },
      { name: "statusHref", type: "string", defaultValue: "\"#\"", description: "Where the status pill links." },
      { name: "onSubscribe", type: "(email: string) => Promise<void> | void", description: "Newsletter handler; a promise shows the pending state." },
      { name: "showNewsletter", type: "boolean", defaultValue: "true", description: "Show the newsletter field." },
      { name: "showWordmark", type: "boolean", defaultValue: "true", description: "Draw the giant ghost wordmark." },
      { name: "className", type: "string", description: "Extra classes on the footer." },
    ],
    reactSource: `"use client";

import { OrbitFooter } from "@/components/orbit-footer";

export function SiteFooter() {
  return (
    <OrbitFooter
      brand="Orbit"
      tagline="Interfaces that move, shipped as code you own."
      status="All systems normal"
      onSubscribe={async (email) => {
        await fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email }) });
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "depth-testimonials",
    name: "Depth Testimonials",
    description:
      "Testimonials stacked in depth: the front card reads clearly, the next wait behind it, and cycling sends the front card to the back. Auto-advances and pauses on hover.",
    categorySlug: "testimonials",
    tags: ["social-proof"],
    premium: false,
    trendingScore: 76,
    createdAt: "2026-04-12",
    animationKinds: ["scroll", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewTestimonialStack,
    previewShell: "plain",
    props: [
      { name: "items", type: "{ quote: string; name: string; role?: string; tone?: [string, string] }[]", description: "Testimonials with bylines." },
      { name: "quotes", type: "string[]", description: "Plain quotes (older API); used when items is not given." },
      { name: "interval", type: "number", defaultValue: "4800", description: "Auto-advance interval in ms; 0 turns it off." },
      { name: "heading", type: "string", defaultValue: "\"Loved by people who ship\"", description: "Section heading." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    reactSource: `"use client";

import { DepthTestimonials } from "@/components/depth-testimonials";

export function Testimonials() {
  return (
    <DepthTestimonials
      heading="Loved by people who ship"
      interval={5000}
      items={[
        { quote: "We rebuilt our pricing page in an afternoon.", name: "Priya Raman", role: "Design lead, Fieldnote" },
        { quote: "Accessibility review took ten minutes.", name: "Tomás Reyes", role: "Frontend engineer, Harbor" },
        { quote: "It feels like Linear met a motion lab.", name: "Mei Tanaka", role: "Founder, Quietly" },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "toggle-pricing-pro",
    name: "Toggle Pricing",
    description: "Annual/monthly toggle with spring knob and contextual savings callout.",
    categorySlug: "pricing-sections",
    tags: ["billing", "motion"],
    premium: false,
    trendingScore: 112,
    createdAt: "2026-05-01",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion", "react"],
    Preview: Previews.PreviewPricingToggle,
    reactSource: `"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function PricingToggle() {
  const [annual, setAnnual] = useState(true);
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <button type="button" onClick={() => setAnnual((v) => !v)} className="relative h-8 w-16 rounded-full border border-white/10 bg-white/5">
        <motion.span className="absolute top-1 left-1 h-6 w-6 rounded-full bg-cyan-300" animate={{ x: annual ? 0 : 32 }} transition={{ type: "spring", stiffness: 500, damping: 35 }} />
      </button>
      <p className="mt-4 text-4xl font-semibold text-white">\${annual ? 29 : 39}</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "beam-sweep-field",
    name: "Beam Sweep Field",
    description:
      "A cinematic dark backdrop where light columns sweep across a fine grid over a horizon glow, with a ready-made hero you can replace with any content.",
    categorySlug: "background-effects",
    tags: ["ambient"],
    premium: false,
    trendingScore: 84,
    createdAt: "2026-03-30",
    animationKinds: ["gradient", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewBeamSweep,
    previewShell: "plain",
    props: [
      { name: "children", type: "ReactNode", description: "Content over the field; defaults to a short hero." },
      { name: "beams", type: "number", defaultValue: "3", description: "Number of sweeping light columns." },
      { name: "color", type: "string", defaultValue: "\"#67e8f9\"", description: "Beam colour." },
      { name: "speed", type: "number", defaultValue: "11", description: "Seconds for one sweep." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    reactSource: `"use client";

import { BeamField } from "@/components/beam-sweep-field";

export function LaunchHero() {
  return (
    <BeamField beams={4} color="#a78bfa" speed={14}>
      <h1 className="text-5xl font-semibold tracking-tight text-white">Your launch, lit properly.</h1>
    </BeamField>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "vector-tilt-scene",
    name: "Vector Tilt Scene",
    description: "High depth glass panel for hero cards and feature highlights.",
    categorySlug: "three-d-components",
    tags: ["depth", "product"],
    premium: false,
    trendingScore: 96,
    createdAt: "2026-04-20",
    animationKinds: ["3d", "spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCardTilt,
    reactSource: `"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function VectorTiltScene() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-60, 60], [12, -12]), {
    stiffness: 240,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-60, 60], [-12, 12]), {
    stiffness: 240,
    damping: 22,
  });

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - bounds.left - bounds.width / 2);
        y.set(event.clientY - bounds.top - bounds.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 shadow-2xl"
    >
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Scene depth</p>
      <h3 className="mt-4 text-2xl font-semibold text-white">Vector Tilt Scene</h3>
      <p className="mt-2 text-sm text-zinc-400">
        A spring-driven glass panel for dimensional product highlights.
      </p>
    </motion.div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "glass-login-stack",
    name: "Glass Login Stack",
    description:
      "A frosted login card on a slow aurora with ghost cards stacked behind for depth: passkey first, then email and password, with a remember switch and a pending-to-welcome button.",
    categorySlug: "login-forms",
    tags: ["auth"],
    premium: false,
    trendingScore: 73,
    createdAt: "2026-02-02",
    animationKinds: ["spring"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewLoginGlass,
    previewShell: "plain",
    props: [
      { name: "brand", type: "string", defaultValue: "\"Halo\"", description: "Brand initial and name." },
      { name: "title", type: "string", defaultValue: "\"Welcome back\"", description: "Card heading." },
      { name: "subtitle", type: "string", description: "Line under the heading." },
      { name: "onSubmit", type: "(values: { email: string; password: string; remember: boolean }) => Promise<void> | void", description: "Called on sign in; throw to show the error state." },
      { name: "onPasskey", type: "() => void", description: "Called by the passkey button." },
      { name: "backdrop", type: "boolean", defaultValue: "true", description: "Draw the aurora backdrop behind the card." },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    reactSource: `"use client";

import { GlassLogin } from "@/components/glass-login-stack";

export function LoginPage() {
  return (
    <GlassLogin
      brand="Halo"
      onPasskey={() => console.log("passkey")}
      onSubmit={async ({ email, password }) => {
        const res = await fetch("/api/login", { method: "POST", body: JSON.stringify({ email, password }) });
        if (!res.ok) throw new Error("Invalid credentials");
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "split-signup-convert",
    name: "Split Signup Convert",
    description:
      "A two-panel signup: the product's value on a lit aurora panel, and a short form with SSO, a live password-strength meter and a pending-to-done button.",
    categorySlug: "signup-forms",
    tags: ["auth", "conversion"],
    premium: false,
    trendingScore: 69,
    createdAt: "2026-03-08",
    animationKinds: ["hover"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewSignupSplit,
    previewShell: "plain",
    props: [
      { name: "headline", type: "string", description: "Headline on the value panel." },
      { name: "subhead", type: "string", description: "Line under the headline." },
      { name: "benefits", type: "string[]", description: "Checked benefits on the value panel." },
      { name: "submitLabel", type: "string", defaultValue: "\"Create workspace\"", description: "Submit button label." },
      { name: "onSubmit", type: "(values: { email: string; password: string }) => Promise<void> | void", description: "Called on submit; a promise shows the pending state, a throw returns to idle." },
      { name: "showSso", type: "boolean", defaultValue: "true", description: "Show Google and GitHub buttons." },
      { name: "onSso", type: "(provider: \"google\" | \"github\") => void", description: "Called by the SSO buttons." },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    reactSource: `"use client";

import { SplitSignup } from "@/components/split-signup-convert";

export function SignupSection() {
  return (
    <SplitSignup
      headline="Ship interfaces your team is proud of"
      benefits={["Every component, live and editable", "One-line installs", "Light and dark"]}
      onSubmit={async ({ email, password }) => {
        await fetch("/api/signup", { method: "POST", body: JSON.stringify({ email, password }) });
      }}
      onSso={(provider) => console.log("sso", provider)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "signup-form",
    name: "Signup Form",
    registryCliName: "signup-form",
    resourceLinks: [{ label: "Live demo", href: "/demos/signup-form" }],
    description:
      "Customizable signup form built on shadcn input + label with subtle framer-motion transitions and async submit states.",
    categorySlug: "signup-forms",
    tags: ["auth", "forms", "signup", "shadcn"],
    premium: false,
    trendingScore: 107,
    createdAt: "2026-05-14",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react"],
    previewShell: "plain",
    props: [
      { name: "title", type: "string", defaultValue: "\"Create your account\"", description: "Main heading displayed at the top." },
      { name: "subtitle", type: "string", defaultValue: "\"Start building polished interfaces with motion-first components.\"", description: "Supporting text below the title." },
      { name: "submitLabel", type: "string", defaultValue: "\"Create account\"", description: "Button label in idle state." },
      { name: "loadingLabel", type: "string", defaultValue: "\"Creating account...\"", description: "Button label while submit is pending." },
      { name: "successLabel", type: "string", defaultValue: "\"Account created\"", description: "Button label after successful submit." },
      { name: "className", type: "string", description: "Optional class names for wrapper styling." },
      { name: "showNameField", type: "boolean", defaultValue: "true", description: "Shows or hides the full-name input." },
      { name: "showConfirmPasswordField", type: "boolean", defaultValue: "true", description: "Shows or hides the confirm-password input." },
      { name: "minPasswordLength", type: "number", defaultValue: "8", description: "Minimum password length enforced by validation." },
      { name: "defaultValues", type: "Partial<SignupFormValues>", description: "Initial values for prefilled form state." },
      { name: "onSubmit", type: "(values: SignupFormValues) => Promise<void> | void", description: "Submit handler called after validation passes." },
      { name: "showSocialLogins", type: "boolean", defaultValue: "true", description: "Shows GitHub/Apple/Google buttons under submit." },
      { name: "onSocialLogin", type: "(provider: \"github\" | \"apple\" | \"google\") => void", description: "Called when a social provider button is clicked." },
    ],
    Preview: Previews.PreviewSignupForm,
    previewSections: [
      {
        title: "Signup Form",
        Preview: Previews.PreviewSignupForm,
        reactSource: `"use client";

import { SignupForm, type SignupFormValues } from "@/components/signup-form";

export function AuthSignupCard() {
  async function createAccount(values: SignupFormValues) {
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
  }

  return <SignupForm onSubmit={createAccount} />;
}`,
      },
      {
        title: "Login Form",
        Preview: Previews.PreviewLoginForm,
        reactSource: `"use client";

import { LoginForm, type LoginFormValues } from "@/components/signup-form/login-form";

export function AuthLoginCard() {
  async function signIn(values: LoginFormValues) {
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
  }

  return (
    <LoginForm
      onSubmit={signIn}
      onForgotPassword={() => console.log("forgot password")}
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "workbench-sidebar",
    name: "Workbench Sidebar",
    description:
      "A product sidebar with a workspace switcher, search, a spring-sliding active highlight, projects, a usage meter and the signed-in user — collapses to an icon rail.",
    categorySlug: "sidebars",
    tags: ["app-shell"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-04-05",
    animationKinds: ["hover", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewSidebarShell,
    previewShell: "plain",
    props: [
      { name: "workspace", type: "{ name: string; plan?: string }", description: "Workspace shown in the switcher." },
      { name: "items", type: "{ id: string; label: string; icon: LucideIcon; count?: number }[]", description: "Main navigation." },
      { name: "projects", type: "{ id: string; label: string; color: string }[]", description: "Projects list." },
      { name: "user", type: "{ name: string; email: string }", description: "Signed-in user." },
      { name: "usage", type: "number | null", defaultValue: "0.68", description: "Usage meter value 0–1; null hides the card." },
      { name: "activeId", type: "string", description: "Controlled active item." },
      { name: "defaultActiveId", type: "string", defaultValue: "\"overview\"", description: "Initial active item when uncontrolled." },
      { name: "onNavigate", type: "(id: string) => void", description: "Called when an item is chosen." },
      { name: "defaultCollapsed", type: "boolean", defaultValue: "false", description: "Start as an icon rail." },
      { name: "className", type: "string", description: "Extra classes on the aside." },
    ],
    reactSource: `"use client";

import { usePathname, useRouter } from "next/navigation";
import { WorkbenchSidebar } from "@/components/workbench-sidebar";

export function AppSidebar() {
  const router = useRouter();
  const active = usePathname().split("/")[1] || "overview";
  return (
    <div className="h-dvh p-2">
      <WorkbenchSidebar
        workspace={{ name: "Northwind", plan: "Pro plan" }}
        user={{ name: "Ada Park", email: "ada@northwind.co" }}
        usage={0.68}
        activeId={active}
        onNavigate={(id) => router.push(\`/\${id}\`)}
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "pulse-dashboard-kpis",
    name: "Pulse Dashboard KPIs",
    description:
      "A KPI strip with a 7d/30d/90d switcher: each metric gets a delta chip that knows when lower is better, and a sparkline that redraws as you change period.",
    categorySlug: "dashboards",
    tags: ["analytics"],
    premium: false,
    trendingScore: 101,
    createdAt: "2026-04-16",
    animationKinds: ["hover", "scroll"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewDashboardKpi,
    previewShell: "plain",
    props: [
      { name: "kpis", type: "Kpi[]", description: "Metrics to show: label, value, delta, lowerIsBetter, trend." },
      { name: "periods", type: "Record<string, Kpi[]>", description: "Named periods with their own metrics; adds a period switcher. Used by default when kpis is not passed." },
      { name: "defaultPeriod", type: "string", description: "Period selected first." },
      { name: "title", type: "string", defaultValue: "\"This week at a glance\"", description: "Heading above the strip." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    reactSource: `"use client";

import { KpiStrip } from "@/components/pulse-dashboard-kpis";

export function Overview() {
  return (
    <KpiStrip
      title="Revenue at a glance"
      kpis={[
        { label: "MRR", value: "$48.2k", delta: "+8.1%", trend: [32, 35, 34, 38, 41, 44, 48] },
        { label: "Churn", value: "1.9%", delta: "-0.4%", lowerIsBetter: true, trend: [3, 2.8, 2.6, 2.4, 2.1, 2, 1.9] },
        { label: "Active seats", value: "3,214", delta: "+212", trend: [2.6, 2.7, 2.8, 2.9, 3, 3.1, 3.2] },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "orbital-loader",
    name: "Orbital Loader",
    description:
      "A loader with presence: counter-rotating orbits, a glowing dot circling the ring, an arc that sweeps or fills to progress, and rotating status lines.",
    categorySlug: "loaders",
    tags: ["feedback"],
    premium: false,
    trendingScore: 80,
    createdAt: "2026-01-30",
    animationKinds: ["layout", "gradient"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewLoaderOrbit,
    previewShell: "plain",
    props: [
      { name: "size", type: "number", defaultValue: "112", description: "Diameter in px." },
      { name: "progress", type: "number", description: "0–1 for a determinate ring; omit for an indeterminate sweep." },
      { name: "messages", type: "string[]", description: "Status lines cycled under the loader; [] hides them." },
      { name: "color", type: "string", defaultValue: "\"#6366f1\"", description: "Accent colour of the arc and dot." },
      { name: "className", type: "string", description: "Extra classes on the wrapper." },
    ],
    reactSource: `"use client";

import { OrbitalLoader } from "@/components/orbital-loader";

export function Uploading({ progress }: { progress: number }) {
  return <OrbitalLoader progress={progress} messages={["Uploading your files"]} color="#10b981" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "milestone-timeline",
    name: "Milestone Timeline",
    description:
      "A roadmap timeline: dates on the left, a rail that fills to the milestone in progress, and nodes that read done, current (pulsing) or upcoming at a glance.",
    categorySlug: "timelines",
    tags: ["roadmap"],
    premium: false,
    trendingScore: 71,
    createdAt: "2026-02-18",
    animationKinds: ["scroll"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewTimeline,
    previewShell: "plain",
    props: [
      { name: "milestones", type: "{ title: string; date?: string; description?: string; status?: \"done\" | \"current\" | \"upcoming\"; tag?: string }[]", description: "Roadmap milestones." },
      { name: "steps", type: "string[]", description: "Plain titles (older API); all but the last count as done." },
      { name: "heading", type: "string", defaultValue: "\"Roadmap\"", description: "Heading." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    reactSource: `"use client";

import { MilestoneTimeline } from "@/components/milestone-timeline";

export function Roadmap() {
  return (
    <MilestoneTimeline
      heading="Roadmap"
      milestones={[
        { title: "Research", date: "Jan 2026", description: "Twenty customer interviews.", status: "done" },
        { title: "Private beta", date: "Jun 2026", description: "312 teams onboarded.", status: "current", tag: "In progress" },
        { title: "Public launch", date: "Sep 2026", status: "upcoming" },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "lattice-feature-grid",
    name: "Lattice Feature Grid",
    description:
      "A four-up feature grid on a hairline lattice, where each tile carries a small live illustration of the feature it describes.",
    categorySlug: "feature-sections",
    tags: ["marketing"],
    premium: false,
    trendingScore: 90,
    createdAt: "2026-03-12",
    animationKinds: ["scroll"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewFeatureGrid,
    previewShell: "plain",
    props: [
      { name: "items", type: "{ title: string; body: string; icon?: LucideIcon; visual?: ReactNode }[]", description: "Feature tiles; defaults include illustrated tiles." },
      { name: "eyebrow", type: "string", defaultValue: "\"Why teams switch\"", description: "Small label above the heading." },
      { name: "heading", type: "string", description: "Section heading; empty hides the header." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    reactSource: `"use client";

import { Lock, Zap } from "lucide-react";
import { LatticeFeatures } from "@/components/lattice-feature-grid";

export function Features() {
  return (
    <LatticeFeatures
      eyebrow="Platform"
      heading="Built for teams that ship every day"
      items={[
        { title: "Instant previews", body: "Every branch gets a URL in seconds.", icon: Zap },
        { title: "Secure by default", body: "SSO, audit logs and scoped tokens out of the box.", icon: Lock },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "motion-faq-disclosure",
    name: "Motion FAQ Disclosure",
    description:
      "A two-column FAQ: heading and a support card on the left, a spring-animated accessible accordion on the right.",
    categorySlug: "faq-sections",
    tags: ["support"],
    premium: false,
    trendingScore: 66,
    createdAt: "2026-01-12",
    animationKinds: ["layout"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewFaq,
    previewShell: "plain",
    props: [
      { name: "items", type: "{ q: string; a: string }[]", description: "Questions and answers." },
      { name: "heading", type: "string", defaultValue: "\"Questions, answered\"", description: "Heading on the left." },
      { name: "intro", type: "string", description: "Line under the heading." },
      { name: "defaultOpen", type: "number", defaultValue: "0", description: "Index open on first render; -1 for none." },
      { name: "multiple", type: "boolean", defaultValue: "false", description: "Allow several answers open at once." },
      { name: "contact", type: "{ label: string; href: string } | null", description: "Support card; null hides it." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    reactSource: `"use client";

import { MotionFaq } from "@/components/motion-faq-disclosure";

export function Faq() {
  return (
    <MotionFaq
      heading="Questions, answered"
      contact={{ label: "Talk to a human", href: "/contact" }}
      items={[
        { q: "Can I use this commercially?", a: "Yes — in personal and client work." },
        { q: "Does it work with the App Router?", a: "Every component is a typed client component built for it." },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "nebula-cta-glow",
    name: "Nebula CTA Glow",
    description: "Pulsing dual nebula glow behind a high-contrast CTA.",
    categorySlug: "cta-sections",
    tags: ["conversion"],
    premium: false,
    trendingScore: 93,
    createdAt: "2026-04-08",
    animationKinds: ["gradient", "hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCtaGlow,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function NebulaCta() {
  return (
    <div className="relative flex items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 px-10 py-16">
      <motion.div className="absolute size-40 rounded-full bg-cyan-400/25 blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.65, 0.35] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.button whileHover={{ scale: 1.03 }} className="relative rounded-full bg-white px-6 py-2 text-sm font-semibold text-zinc-950">Start building</motion.button>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "glow-button",
    name: "Glow Button",
    description:
      "Framer-style glowing CTA button with expanding shadow, radial border sweep, glass edge, and animated arrow.",
    categorySlug: "cta-sections",
    tags: ["button", "cta", "glow", "framer-motion", "hover"],
    premium: false,
    trendingScore: 96,
    createdAt: "2026-05-18",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewGlowButton,
    reactSource: `"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GlowButtonProps = {
  children?: React.ReactNode;
  href?: string;
  className?: string;
  innerClassName?: string;
  background?: string;
  textColor?: string;
  arrowColor?: string;
  radius?: number;
  glow?: string;
  borderColor?: string;
  openInNewTab?: boolean;
} & Omit<React.ComponentPropsWithoutRef<typeof motion.a>, "children" | "href" | "color">;

export function GlowButton({
  children = "Get Started Now",
  href = "#",
  className,
  innerClassName,
  background = "rgb(0, 0, 0)",
  textColor = "rgb(255, 255, 255)",
  arrowColor = "rgb(255, 255, 255)",
  radius = 8,
  glow = "0px 20px 50px 4px rgba(255, 255, 255, 0.25)",
  borderColor = "rgba(255, 255, 255, 0.25)",
  openInNewTab = false,
  ...props
}: GlowButtonProps) {
  const rounded = \`\${radius}px\`;
  const target = openInNewTab ? "_blank" : undefined;
  const rel = openInNewTab ? "noreferrer noopener" : undefined;

  return (
    <motion.a
      href={href}
      target={target}
      rel={rel}
      initial="rest"
      animate="rest"
      whileHover="hover"
      className={cn("relative inline-flex cursor-pointer items-center justify-center overflow-visible no-underline", className)}
      {...props}
    >
      <motion.span
        aria-hidden
        variants={{
          rest: { scale: 0.4, boxShadow: glow },
          hover: { scale: 1, boxShadow: "0px 7px 20px 0px rgba(255, 255, 255, 0.25)" },
        }}
        transition={{ type: "spring", duration: 1, bounce: 0 }}
        className="absolute inset-0 z-0 origin-bottom"
        style={{ borderRadius: rounded, backgroundColor: "transparent" }}
      />

      <span className="relative z-10 inline-flex items-center justify-center overflow-hidden p-px" style={{ borderRadius: rounded, backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
        <motion.span
          aria-hidden
          variants={{
            rest: { left: "30%", width: "40%" },
            hover: { left: "0%", width: "100%" },
          }}
          transition={{ type: "spring", duration: 1, bounce: 0 }}
          className="absolute bottom-0 z-10 h-1/2"
          style={{
            borderRadius: rounded,
            background: "radial-gradient(50% 200% at 50% 50%, rgba(255,255,255,0.1) 0%, rgb(255,255,255) 52%, rgba(255,255,255,0.1) 100%)",
          }}
        />
        <span
          aria-hidden
          className="absolute inset-0 z-0 backdrop-blur-[10px]"
          style={{
            borderRadius: rounded,
            background: "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.47) 0%, rgba(171,171,171,0.4) 100%)",
          }}
        />
        <span aria-hidden className="pointer-events-none absolute inset-0 z-10" style={{ borderRadius: rounded, border: \`1px solid \${borderColor}\` }} />
        <span className={cn("relative z-20 inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm leading-none", innerClassName)} style={{ borderRadius: rounded, background, color: textColor }}>
          <span>{children}</span>
          <span className="grid size-5 place-items-center overflow-hidden">
            <motion.span variants={{ rest: { x: 0 }, hover: { x: [0, 4, 0] } }} transition={{ duration: 0.8, ease: "easeInOut" }}>
              <ArrowRight className="size-5" style={{ color: arrowColor, strokeWidth: 1.5 }} />
            </motion.span>
          </span>
        </span>
      </span>
    </motion.a>
  );
}`,
    tailwindSource: tw,
    registryCliName: "glow-button",
    props: [
      { name: "children", type: "React.ReactNode", defaultValue: "\"Get Started Now\"", description: "Button label or inline content." },
      { name: "href", type: "string", defaultValue: "\"#\"", description: "Destination link for the CTA." },
      { name: "background", type: "string", defaultValue: "\"rgb(0, 0, 0)\"", description: "Inner button background color." },
      { name: "textColor", type: "string", defaultValue: "\"rgb(255, 255, 255)\"", description: "Button text color." },
      { name: "arrowColor", type: "string", defaultValue: "\"rgb(255, 255, 255)\"", description: "Arrow icon color." },
      { name: "radius", type: "number", defaultValue: "8", description: "Corner radius in pixels." },
      { name: "glow", type: "string", description: "CSS box-shadow used for the resting outer glow." },
      { name: "borderColor", type: "string", description: "Subtle glass border color." },
      { name: "openInNewTab", type: "boolean", defaultValue: "false", description: "Opens the link in a new browser tab." },
    ],
  },
  {
    slug: "word-magnet",
    name: "Word Magnet",
    description:
      "Cursor-reactive text where whole words gently repel from the pointer and spring back without splitting letters.",
    categorySlug: "motion-effects",
    tags: ["text", "cursor", "magnetic", "hover", "spring", "framer-motion"],
    premium: false,
    trendingScore: 91,
    createdAt: "2026-05-18",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewWordMagnet,
    reactSource: `"use client";

import { WordMagnet } from "@/components/word-magnet";

export function MagneticHeadline() {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-zinc-50 px-6 dark:bg-zinc-950">
      <WordMagnet
        text="Move your cursor through this magnetic headline and watch every word gently drift aside before snapping back into a clean readable rhythm"
        radius={130}
        force={0.45}
        damping={28}
        returnDelay={360}
        className="max-w-5xl text-5xl font-semibold tracking-[-0.03em] text-zinc-950 dark:text-white"
      />
    </div>
  );
}`,
    tailwindSource: tw,
    registryCliName: "word-magnet",
    props: [
      { name: "text", type: "string", defaultValue: "\"Magnetic words react to your cursor and snap back into place\"", description: "Text split into magnetic word tokens." },
      { name: "radius", type: "number", defaultValue: "130", description: "Pointer influence radius in pixels." },
      { name: "force", type: "number", defaultValue: "0.45", description: "Repulsion strength applied to nearby words." },
      { name: "damping", type: "number", defaultValue: "28", description: "Spring damping for the return motion." },
      { name: "returnDelay", type: "number", defaultValue: "360", description: "Delay before a word springs back after being pushed." },
      { name: "disableOnMobile", type: "boolean", defaultValue: "true", description: "Disables pointer motion on touch and small screens." },
      { name: "overflow", type: "CSSProperties['overflow']", defaultValue: "\"visible\"", description: "Controls whether moving words can leave the text box." },
      { name: "className", type: "string", description: "Classes for the wrapping text container." },
      { name: "wordClassName", type: "string", description: "Classes applied to each individual word." },
    ],
  },
  {
    slug: "three-d-folder",
    name: "3D Folder Card",
    description:
      "Interactive folder card that opens on hover, fans project cards upward, and includes a lightbox gallery for visual collections.",
    categorySlug: "cards",
    tags: ["folder", "portfolio", "gallery", "hover", "3d", "framer-motion"],
    premium: false,
    trendingScore: 90,
    createdAt: "2026-05-18",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewThreeDFolder,
    previewSections: [
      {
        Preview: Previews.PreviewThreeDFolder,
        reactSource: `"use client";

import { ThreeDFolder } from "@/components/three-d-folder";

export function FolderShowcase() {
  return (
    <div className="grid min-h-[520px] items-center gap-8 rounded-3xl bg-zinc-50 p-8 md:grid-cols-2 dark:bg-zinc-950">
      <ThreeDFolder
        title="Launch Assets"
        folderBackColor="#fb7185"
        folderFrontColor="#facc15"
        folderTabColor="#f97316"
      />

      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-rose-500">Portfolio folder</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          Hover the folder to reveal stacked project previews.
        </h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Use it for case studies, campaign assets, product shots, or any compact visual archive.
        </p>
      </div>
    </div>
  );
}`,
      },
      {
        Preview: Previews.PreviewThreeDFolderMini,
        reactSource: `"use client";

import { ThreeDFolder } from "@/components/three-d-folder";

export function FolderShowcaseMini() {
  return (
    <div className="grid min-h-[520px] items-center gap-8 rounded-3xl bg-zinc-50 p-8 md:grid-cols-2 dark:bg-zinc-950">
      <ThreeDFolder
        title="Launch Assets"
        size="sm"
        folderBackColor="#fb7185"
        folderFrontColor="#facc15"
        folderTabColor="#f97316"
      />

      <div>
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-rose-500">Portfolio folder</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          Hover the folder to reveal stacked project previews.
        </h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Use size="sm" for a compact folder — great for sidebars, dashboards, or anywhere space is tight.
        </p>
      </div>
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
    registryCliName: "three-d-folder",
    props: [
      { name: "title", type: "string", defaultValue: "\"Design Archive\"", description: "Folder label displayed below the 3D folder." },
      { name: "projects", type: "FolderProject[]", description: "Gallery items with id, title, image URL, and optional href." },
      { name: "folderBackColor", type: "string", defaultValue: "\"#fb7185\"", description: "Back panel color." },
      { name: "folderFrontColor", type: "string", defaultValue: "\"#fbbf24\"", description: "Front panel color." },
      { name: "folderTabColor", type: "string", defaultValue: "\"#f97316\"", description: "Folder tab color." },
      { name: "size", type: "\"sm\" | \"md\"", defaultValue: "\"md\"", description: "Folder scale — sm renders at 60% for dense grid layouts." },
      { name: "className", type: "string", description: "Optional classes for the card wrapper." },
    ],
  },
  {
    slug: "draggable-card-stack",
    name: "Draggable Card Stack",
    description:
      "Shuffled deck of portrait cards on a dark surface. Drag or fling the top card to send it to the back; press ← to pull the bottom card to the front. Supports images and videos, hover overlay, auto-play, and fully configurable stack geometry.",
    categorySlug: "cards",
    tags: ["drag", "cards", "stack", "framer-motion", "interactive", "gesture", "spring", "3d"],
    premium: false,
    trendingScore: 115,
    createdAt: "2026-05-19",
    animationKinds: ["spring", "hover", "gesture" as AnimationKind],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewDraggableCardStack,
    reactSource: `"use client";

import { DraggableCardStack } from "@/components/draggable-card-stack";

export function CardStackDemo() {
  return <DraggableCardStack />;
}`,
    tailwindSource: tw,
    registryCliName: "draggable-card-stack",
    props: [
      { name: "cards",              type: "StackCard[]", description: "Array of cards. Each card has id, optional title/subtitle, a media URL, and an optional type (\"image\" | \"video\")." },
      { name: "cardWidth",          type: "number",  defaultValue: "300",   description: "Card width in px." },
      { name: "cardHeight",         type: "number",  defaultValue: "420",   description: "Card height in px." },
      { name: "borderRadius",       type: "number",  defaultValue: "24",    description: "Card corner radius in px." },
      { name: "shadowStrength",     type: "number",  defaultValue: "1",     description: "Drop-shadow intensity from 0 (none) to 1 (full)." },
      { name: "stackOffset",        type: "number",  defaultValue: "0",     description: "Vertical Y offset in px per depth level — fans out the stack." },
      { name: "maxRotation",        type: "number",  defaultValue: "14",    description: "Maximum resting rotation in degrees for stack cards." },
      { name: "depthScale",         type: "number",  defaultValue: "0.04",  description: "Scale reduction per depth level (e.g. 0.04 = 4% smaller per card behind)." },
      { name: "showOverlay",        type: "boolean", defaultValue: "true",  description: "Show a gradient overlay with title and subtitle on hover over the top card." },
      { name: "hoverScale",         type: "number",  defaultValue: "1.03",  description: "Scale applied to the top card on hover." },
      { name: "transitionDuration", type: "number",  defaultValue: "0.25",  description: "Duration in seconds for the overlay fade and hover scale transitions." },
      { name: "autoPlay",           type: "boolean", defaultValue: "false", description: "Automatically cycle cards at the given interval." },
      { name: "autoInterval",       type: "number",  defaultValue: "3000",  description: "Auto-play interval in milliseconds." },
      { name: "className",          type: "string",  description: "Optional classes for the outer wrapper." },
    ],
  },
  {
    slug: "card-carousel-3d",
    name: "3D Card Carousel",
    description:
      "Cylindrical 3D card carousel — cards arranged in a circle on the Z axis, rotating continuously or on scroll. Radius, perspective, item size, speed, and direction are all configurable.",
    categorySlug: "cards",
    tags: ["3d", "carousel", "scroll", "framer-motion", "interactive", "cards", "animation"],
    premium: false,
    trendingScore: 112,
    createdAt: "2026-05-19",
    animationKinds: ["scroll", "spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCardCarousel3D,
    reactSource: `"use client";

import { CardCarousel3D } from "@/components/card-carousel-3d";

export function CarouselDemo() {
  return (
    <CardCarousel3D
      radius={500}
      itemWidth={280}
      itemHeight={380}
      perspective={1000}
      autoRotate
      autoSpeed={1}
      scrollSpeed={1}
      direction="cw"
    />
  );
}`,
    tailwindSource: tw,
    registryCliName: "card-carousel-3d",
    props: [
      { name: "cards", type: "CarouselCard[]", description: "Array of cards with id, name, price, and image URL." },
      { name: "radius", type: "number", defaultValue: "380", description: "Carousel cylinder radius in px (200–1000)." },
      { name: "itemWidth", type: "number", defaultValue: "280", description: "Card width in px (200–800)." },
      { name: "itemHeight", type: "number", defaultValue: "380", description: "Card height in px (200–800)." },
      { name: "perspective", type: "number", defaultValue: "1000", description: "CSS perspective depth in px (500–3000)." },
      { name: "autoRotate", type: "boolean", defaultValue: "true", description: "Enable continuous auto-rotation." },
      { name: "autoSpeed", type: "number", defaultValue: "1", description: "Auto-rotation speed multiplier (0.1–5)." },
      { name: "scrollSpeed", type: "number", defaultValue: "1", description: "Wheel/drag speed multiplier (0.1–5)." },
      { name: "direction", type: "\"cw\" | \"ccw\"", defaultValue: "\"cw\"", description: "Rotation direction — clockwise or counterclockwise." },
      { name: "className", type: "string", description: "Optional classes for the outer wrapper." },
    ],
  },
  {
    slug: "real-time-cursors",
    name: "Real-Time Cursors",
    description:
      "Collaborative workspace preview with animated teammate cursors, code review cards, and simulated live presence trails.",
    categorySlug: "motion-effects",
    tags: ["cursor", "collaboration", "code", "presence", "framer-motion", "workspace"],
    premium: false,
    trendingScore: 92,
    createdAt: "2026-05-18",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewRealTimeCursors,
    reactSource: `"use client";

import { RealTimeCursors } from "@/components/real-time-cursors";

export function CollaborativeReview() {
  return (
    <RealTimeCursors
      cursors={[
        {
          name: "Ava",
          color: "#2563eb",
          note: "checking props",
          path: [
            { x: 16, y: 26 },
            { x: 72, y: 21 },
            { x: 64, y: 58 },
            { x: 20, y: 68 },
          ],
        },
        {
          name: "Noah",
          color: "#7c3aed",
          note: "left a comment",
          path: [
            { x: 78, y: 74 },
            { x: 36, y: 54 },
            { x: 52, y: 30 },
            { x: 84, y: 42 },
          ],
        },
      ]}
      className="min-h-[520px]"
    />
  );
}`,
    tailwindSource: tw,
    registryCliName: "real-time-cursors",
    props: [
      { name: "cursors", type: "LiveCursor[]", description: "Presence cursor definitions with name, color, note, and percentage-based path points." },
      { name: "showCodePanel", type: "boolean", defaultValue: "true", description: "Shows or hides the built-in code review surface behind the cursors." },
      { name: "className", type: "string", description: "Optional classes for the outer workspace container." },
    ],
  },
  {
    slug: "editorial-blog-rail",
    name: "Editorial Blog Rail",
    description:
      "A magazine-style blog rail: one featured story with generated cover art beside a numbered list of recent posts.",
    categorySlug: "blog-components",
    tags: ["content"],
    premium: false,
    trendingScore: 58,
    createdAt: "2026-02-26",
    animationKinds: ["scroll"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewBlogRail,
    previewShell: "plain",
    props: [
      { name: "heading", type: "string", defaultValue: "\"From the journal\"", description: "Section heading." },
      { name: "allHref", type: "string", defaultValue: "\"#\"", description: "Link for View all." },
      { name: "featured", type: "EditorialPost", description: "The featured story (title, category, date, readTime, excerpt, author, cover colours, href)." },
      { name: "posts", type: "EditorialPost[]", description: "Stories in the numbered rail." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    reactSource: `"use client";

import { EditorialRail } from "@/components/editorial-blog-rail";

export function JournalSection() {
  return (
    <EditorialRail
      heading="From the journal"
      featured={{
        title: "Designing scroll choreography that people actually feel",
        category: "Guide",
        date: "Oct 14",
        readTime: "12 min read",
        author: { name: "Mara Okafor" },
        cover: ["#6366f1", "#f472b6"],
        href: "/blog/scroll-choreography",
      }}
      posts={[
        { title: "Springs, not curves", category: "Craft", date: "Oct 09", readTime: "7 min", href: "/blog/springs" },
        { title: "Shipping a design system in six weeks", category: "Case study", date: "Oct 02", readTime: "9 min" },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "split-contact-glass",
    name: "Split Contact Glass",
    description:
      "A contact section in two panes: a lit glass panel with how to reach the team and their live local time, and a form with topic chips, a counted message and a send button that confirms.",
    categorySlug: "contact-sections",
    tags: ["lead"],
    premium: false,
    trendingScore: 64,
    createdAt: "2026-03-02",
    animationKinds: ["hover"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewContactSplit,
    previewShell: "plain",
    props: [
      { name: "heading", type: "string", description: "Heading on the glass panel." },
      { name: "intro", type: "string", description: "Line under the heading." },
      { name: "email", type: "string", defaultValue: "\"hello@studio.dev\"", description: "Contact email." },
      { name: "location", type: "string", description: "Studio location." },
      { name: "timeZone", type: "string", defaultValue: "\"Europe/Lisbon\"", description: "IANA zone for the live local time." },
      { name: "replyTime", type: "string", description: "Response-time note." },
      { name: "topics", type: "string[]", description: "Topic chips." },
      { name: "onSubmit", type: "(values: { name: string; email: string; topic: string; message: string }) => Promise<void> | void", description: "Called on send; a promise shows the sending state." },
      { name: "maxLength", type: "number", defaultValue: "500", description: "Message character limit." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    reactSource: `"use client";

import { SplitContact } from "@/components/split-contact-glass";

export function ContactSection() {
  return (
    <SplitContact
      email="hello@studio.dev"
      location="Lisbon, Portugal"
      timeZone="Europe/Lisbon"
      topics={["Custom work", "Partnership", "Support"]}
      onSubmit={async (values) => {
        await fetch("/api/contact", { method: "POST", body: JSON.stringify(values) });
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "svg-noise-shader",
    name: "SVG Noise Shader",
    description: "FeTurbulence-driven noise field for textured sci-fi surfaces.",
    categorySlug: "shaders",
    tags: ["texture"],
    premium: false,
    trendingScore: 77,
    createdAt: "2026-04-22",
    animationKinds: ["gradient", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewShaderNoise,
    reactSource: `"use client";

import { motion } from "framer-motion";

const NOISE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";

export function SvgNoise() {
  return (
    <div className="relative h-80 overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.45),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.35),transparent_50%)]" />
      <motion.div
        aria-hidden
        className="absolute -inset-8 opacity-30 mix-blend-overlay"
        style={{ backgroundImage: 'url("' + NOISE + '")' }}
        animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <p className="absolute bottom-8 left-8 text-sm font-medium text-white/80">SVG turbulence noise field</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tracing-spotlight-panel",
    name: "Tracing Spotlight Panel",
    description: "Cursor-traced highlight for feature callouts and pricing tiers.",
    categorySlug: "motion-effects",
    tags: ["pointer"],
    premium: false,
    trendingScore: 107,
    createdAt: "2026-05-06",
    animationKinds: ["hover", "gradient"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewSpotlightPanel,
    reactSource: `"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export function TracingSpotlight() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const bg = useMotionTemplate\`radial-gradient(240px circle at \${x}px \${y}px, rgba(244,114,182,.35), transparent 60%)\`;
  return (
    <div onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - r.left); y.set(e.clientY - r.top); }} className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-8">
      <motion.div className="absolute inset-0" style={{ backgroundImage: bg }} />
      <div className="relative text-white">Spotlight content</div>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "forge-ai-command-bar",
    name: "Forge AI Command Bar",
    description: "Command surface for AI copilots with motion layout container.",
    categorySlug: "ai-components",
    tags: ["copilot"],
    premium: false,
    trendingScore: 118,
    createdAt: "2026-05-09",
    animationKinds: ["layout", "spring"],
    dependencies: ["framer-motion", "react"],
    Preview: Previews.PreviewAiBar,
    reactSource: `"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function AiCommandBar() {
  const [value, setValue] = useState("");
  return (
    <motion.div layout className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <input value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Describe the UI you need…" />
    </motion.div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "gooey-search-input",
    name: "Gooey Search Input",
    registryCliName: "gooey-input",
    resourceLinks: [
      { label: "Live demo", href: "/demos/gooey-input" },
    ],
    description:
      "Expandable pill search with a detached icon bubble merged through an SVG goo filter and spring layout.",
    categorySlug: "motion-effects",
    tags: ["search", "svg", "spring", "forms"],
    premium: false,
    trendingScore: 112,
    createdAt: "2026-05-13",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "placeholder", type: "string", defaultValue: "\"Type to search...\"", description: "Input placeholder text." },
      { name: "collapsedWidth", type: "number", defaultValue: "115", description: "Width (px) when collapsed." },
      { name: "expandedWidth", type: "number", defaultValue: "200", description: "Width (px) when expanded." },
      { name: "expandedOffset", type: "number", defaultValue: "56", description: "Left offset (px) applied when expanded." },
      { name: "gooeyBlur", type: "number", defaultValue: "5", description: "SVG blur strength for gooey merge effect." },
      { name: "value", type: "string", description: "Controlled value." },
      { name: "defaultValue", type: "string", defaultValue: "\"\"", description: "Initial value for uncontrolled mode." },
      { name: "onValueChange", type: "(value: string) => void", description: "Called when value changes." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when expanded/collapsed state changes." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables interactions and input." },
    ],
    Preview: Previews.PreviewGooeySearch,
    reactSource: `"use client";

import { GooeyInput } from "@/components/gooey-input";

export function CatalogSearch() {
  return (
    <GooeyInput
      placeholder="Search…"
      collapsedWidth={115}
      expandedWidth={200}
      expandedOffset={56}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "terminal",
    name: "Interactive Terminal",
    registryCliName: "terminal",
    resourceLinks: [
      { label: "Live demo", href: "/demos/terminal" },
      { label: "Download sound sprite (sound.ogg)", href: "/sounds/sound.ogg" },
      { label: "Sprite timing map (config.json)", href: "/sounds/config.json" },
    ],
    description:
      "macOS-style terminal window with typewriter commands, cursor blink, output sequencing, and optional sound.",
    categorySlug: "motion-effects",
    tags: ["terminal", "cli", "typewriter", "sound", "shell"],
    premium: false,
    trendingScore: 110,
    createdAt: "2026-05-13",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "commands", type: "TerminalCommand[]", description: "Command script typed and executed in sequence." },
      { name: "promptSymbol", type: "string", defaultValue: "\"➜\"", description: "Prompt symbol shown before each command." },
      { name: "username", type: "string", defaultValue: "\"user\"", description: "Username displayed in prompt/header." },
      { name: "hostname", type: "string", defaultValue: "\"nexus\"", description: "Hostname displayed in prompt/header." },
      { name: "typingSpeed", type: "number", defaultValue: "28", description: "Base typing speed in ms/character." },
      { name: "typingJitter", type: "number", defaultValue: "28", description: "Random typing cadence variation (ms)." },
      { name: "startupDelay", type: "number", defaultValue: "450", description: "Delay before script starts (ms)." },
      { name: "delayBetweenCommands", type: "number", defaultValue: "850", description: "Pause between commands (ms)." },
      { name: "autoStart", type: "boolean", defaultValue: "true", description: "Auto-run when component enters viewport." },
      { name: "loop", type: "boolean", defaultValue: "false", description: "Repeats the full script forever." },
      { name: "loopDelay", type: "number", defaultValue: "1400", description: "Pause between loops (ms)." },
      { name: "showCursor", type: "boolean", defaultValue: "true", description: "Displays blinking cursor during typing." },
      { name: "enableSound", type: "boolean", defaultValue: "true", description: "Enables keyboard and enter sounds." },
      { name: "showSoundToggle", type: "boolean", defaultValue: "true", description: "Renders sound toggle control in header." },
      { name: "showControls", type: "boolean", defaultValue: "true", description: "Renders pause/resume/replay controls." },
      { name: "theme", type: "\"carbon\" | \"midnight\" | \"paper\"", defaultValue: "\"carbon\"", description: "Terminal visual theme." },
      { name: "fillHeight", type: "boolean", defaultValue: "false", description: "Makes body scroll inside fixed parent height." },
      { name: "className", type: "string", description: "Optional class names for layout/styling." },
    ],
    Preview: Previews.PreviewTerminal,
    reactSource: `"use client";

import { Terminal } from "@/components/terminal";

export function TerminalExample() {
  return (
    <Terminal
      fillHeight
      className="h-[420px]"
      username="tushar"
      hostname="Nexus-Macbook"
      theme="carbon"
      commands={[
        { input: "npm install", runDelayMs: 900, output: ["added packages", { text: "done", tone: "success" }] },
        { input: "pnpm dev", runDelayMs: 650, output: [{ text: "ready - http://localhost:3000", tone: "success" }] },
        { input: "git push origin main", runDelayMs: 700, output: [{ text: "main -> main", tone: "success" }] },
        { input: "deploy --prod", runDelayMs: 800, output: [{ text: "live on nexus-ui.com", tone: "success" }] },
        { input: "npx shadcn@latest add @nexus-labs/gooey-input", runDelayMs: 600, output: [{ text: "✔ component added", tone: "success" }] },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "squiggly-text",
    name: "RippleLine squiggly text",
    registryCliName: "squiggly-text",
    resourceLinks: [
      { label: "Live demo", href: "/demos/squiggly-text" },
      { label: "SVG filters (MDN)", href: "https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence" },
    ],
    description:
      "A hero headline that wobbles like hand-drawn ink: an SVG turbulence and displacement filter steps through frames, with a still fallback when reduced motion is on.",
    categorySlug: "motion-effects",
    tags: ["typography", "svg", "motion", "hero", "underline", "filters"],
    premium: false,
    trendingScore: 108,
    createdAt: "2026-05-13",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "React.ReactNode", description: "Custom content for the squiggly text wrapper." },
      { name: "text", type: "string", description: "Convenience text content (when children not provided)." },
      { name: "steps", type: "number", defaultValue: "5", description: "Number of turbulence/displacement frames." },
      { name: "stepDuration", type: "number", defaultValue: "80", description: "Duration per frame in ms." },
      { name: "scale", type: "number | readonly [number, number]", defaultValue: "[6, 8]", description: "Displacement intensity per frame." },
      { name: "baseFrequency", type: "number", defaultValue: "0.02", description: "Turbulence base frequency." },
      { name: "numOctaves", type: "number", defaultValue: "3", description: "Number of turbulence octaves." },
      { name: "as", type: "\"span\" | \"div\"", defaultValue: "\"span\"", description: "Root tag for SquigglyText." },
      { name: "className", type: "string", description: "Root wrapper class names." },
      { name: "textClassName", type: "string", description: "Class names applied to animated text node." },
    ],
    Preview: Previews.PreviewSquigglyText,
    reactSource: `"use client";

import { SquigglyDrinksHeadline, SquigglyText } from "@/components/squiggly-text";

export function HeroLine() {
  return (
    <SquigglyText as="div" steps={5} stepDuration={80} scale={[6, 8]} baseFrequency={0.02} numOctaves={3}>
      <span className="block">How many drinks</span>
      <span className="block">are too many drinks?</span>
    </SquigglyText>
  );
}

export function DrinksDemo() {
  return <SquigglyDrinksHeadline />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "floating-dock",
    name: "Nexus floating dock",
    registryCliName: "floating-dock",
    resourceLinks: [
      { label: "Live demo", href: "/demos/floating-dock" },
      { label: "Magnified dock pattern (Build UI)", href: "https://buildui.com/recipes/magnified-dock" },
    ],
    description:
      "Bottom-centered macOS-style dock with pointer-driven magnification, neighbor scaling, glass pill chrome, tooltips, and a touch-friendly expandable mobile menu.",
    categorySlug: "navbars",
    tags: ["navigation", "motion", "dock", "glass", "tooltip"],
    premium: false,
    trendingScore: 105,
    createdAt: "2026-05-13",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "items", type: "FloatingDockItem[]", description: "Dock entries: title, icon, and href." },
      { name: "desktopClassName", type: "string", description: "Extra class names for desktop dock wrapper." },
      { name: "mobileClassName", type: "string", description: "Extra class names for mobile dock wrapper." },
    ],
    Preview: Previews.PreviewFloatingDock,
    reactSource: `"use client";

import { FloatingDock } from "@/components/floating-dock";
import { Home, LayoutGrid } from "lucide-react";

const items = [
  { title: "Home", icon: <Home />, href: "/" },
  { title: "Components", icon: <LayoutGrid />, href: "/components" },
];

export function NavbarDock() {
  return <FloatingDock items={items} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "stateful-button",
    name: "Stateful message button",
    registryCliName: "stateful-button",
    resourceLinks: [
      { label: "Live demo", href: "/demos/stateful-button" },
      { label: "Live demo", href: "/demos/stateful-button" },
    ],
    description:
      "Animated async button with idle → loading → success transitions, built-in click guarding, and smooth icon/text motion.",
    categorySlug: "motion-effects",
    tags: ["button", "forms", "async", "loading", "success"],
    premium: false,
    trendingScore: 104,
    createdAt: "2026-05-13",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "children", type: "React.ReactNode", description: "Idle button label/content." },
      { name: "loadingText", type: "string", defaultValue: "\"Loading...\"", description: "Label shown in loading phase." },
      { name: "successText", type: "string", defaultValue: "\"Success\"", description: "Label shown in success phase." },
      { name: "errorText", type: "string", defaultValue: "\"Something went wrong\"", description: "Label shown in error phase." },
      { name: "onClick", type: "() => Promise<void> | void", description: "Async/sync action invoked on click." },
      { name: "resetDelay", type: "number", defaultValue: "1800", description: "Auto-reset delay after success/error (ms)." },
      { name: "showSuccess", type: "boolean", defaultValue: "true", description: "If false, returns to idle after action completes." },
      { name: "variant", type: "\"default\" | \"outline\" | \"ghost\" | \"destructive\"", defaultValue: "\"default\"", description: "Visual style variant." },
      { name: "size", type: "\"sm\" | \"md\" | \"lg\"", defaultValue: "\"md\"", description: "Button size preset." },
      { name: "icon", type: "React.ReactNode", description: "Optional icon shown in idle state." },
      { name: "successIcon", type: "React.ReactNode", description: "Optional icon shown in success state." },
      { name: "errorIcon", type: "React.ReactNode", description: "Optional icon shown in error state." },
      { name: "disabled", type: "boolean", description: "Disables interaction (in addition to loading lock)." },
      { name: "className", type: "string", description: "Optional class names for custom styling." },
    ],
    Preview: Previews.PreviewStatefulButton,
    reactSource: `"use client";

import { CheckCircle2 } from "lucide-react";
import { StatefulButton } from "@/components/stateful-button";

async function sendMessage() {
  await new Promise<void>((resolve) => setTimeout(resolve, 1300));
}

export function MessageButton() {
  return (
    <StatefulButton
      onClick={sendMessage}
      loadingText="Send message"
      successText="Send message"
      successIcon={<CheckCircle2 className="size-4" />}
      className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 font-medium text-white ring-offset-2 transition duration-200 hover:ring-2 hover:ring-green-500 dark:ring-offset-black"
    >
      Send message
    </StatefulButton>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "sparkles",
    name: "Sparkles field",
    registryCliName: "sparkles",
    resourceLinks: [
      { label: "Live demo", href: "/demos/sparkles" },
      { label: "Live demo", href: "/demos/sparkles" },
    ],
    description:
      "Configurable animated particle field for hero highlights, card backgrounds, and decorative UI layers with optional pointer interaction.",
    categorySlug: "motion-effects",
    tags: ["particles", "sparkles", "background", "hero", "decorative"],
    premium: false,
    trendingScore: 103,
    createdAt: "2026-05-14",
    animationKinds: ["gradient", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "count", type: "number", defaultValue: "36", description: "Base number of particles before density scaling." },
      { name: "color", type: "string", defaultValue: "\"#e5f4ff\"", description: "Particle and glow color." },
      { name: "minSize", type: "number", defaultValue: "0.9", description: "Minimum particle size in pixels." },
      { name: "maxSize", type: "number", defaultValue: "2.8", description: "Maximum particle size in pixels." },
      { name: "speed", type: "number", defaultValue: "1", description: "Overall animation speed multiplier." },
      { name: "opacity", type: "number", defaultValue: "0.9", description: "Global opacity multiplier for particles." },
      { name: "className", type: "string", description: "Optional class names for layout/positioning." },
      { name: "background", type: "boolean", defaultValue: "false", description: "If true, mounts as a full-layer absolute background." },
      { name: "density", type: "\"low\" | \"medium\" | \"high\"", defaultValue: "\"medium\"", description: "Density preset that scales particle count." },
      { name: "direction", type: "\"up\" | \"down\" | \"random\"", defaultValue: "\"random\"", description: "Primary movement direction for particle drift." },
      { name: "enableGlow", type: "boolean", defaultValue: "true", description: "Adds soft bloom/glow to each particle." },
      { name: "interactive", type: "boolean", defaultValue: "false", description: "Enables pointer glow, hover sparkles, and click bursts." },
    ],
    Preview: Previews.PreviewSparkles,
    detailPreviews: [Previews.PreviewSparklesLine, Previews.PreviewSparklesStarfield],
    reactExamples: [
      {
        title: "Code 1 — First Component",
        code: `"use client";

import { Sparkles } from "@/components/sparkles";

export function SparklesLineHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8">
      <div className="relative z-[2] mx-auto max-w-2xl space-y-4 text-center">
        <h2 className="text-5xl font-semibold tracking-tight text-white">NEXUS-UI</h2>
        <div className="relative mx-auto w-fit">
          <div className="h-px w-72 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-full h-16 w-[19rem] -translate-x-1/2 -mt-px overflow-hidden">
            <Sparkles
              className="h-full w-full"
              count={240}
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
        </div>
      </div>
    </section>
  );
}`,
      },
      {
        title: "Code 2 — Second Component",
        code: `"use client";

import { Sparkles } from "@/components/sparkles";

export function SparklesStarfieldCard() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8">
      <Sparkles
        background
        count={130}
        density="high"
        color="#e6f3ff"
        minSize={0.8}
        maxSize={2.4}
        speed={0.95}
        opacity={1}
        direction="random"
        enableGlow
      />
      <div className="relative text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-white">Build great products</h2>
      </div>
    </section>
  );
}`,
      },
    ],
    reactSource: `"use client";

import { Sparkles } from "@/components/sparkles";

export function SparklesLineHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8">
      <div className="relative z-[2] mx-auto max-w-2xl space-y-4 text-center">
        <h2 className="text-5xl font-semibold tracking-tight text-white">NEXUS-UI</h2>
        <div className="relative mx-auto w-fit">
          <div className="h-px w-72 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-full h-16 w-[19rem] -translate-x-1/2 -mt-px overflow-hidden">
            <Sparkles
              className="h-full w-full"
              count={240}
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
        </div>
      </div>
    </section>
  );
}

export function SparklesStarfieldCard() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8">
      <Sparkles
        background
        count={130}
        density="high"
        color="#e6f3ff"
        minSize={0.8}
        maxSize={2.4}
        speed={0.95}
        opacity={1}
        direction="random"
        enableGlow
      />
      <div className="relative text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-white">Build great products</h2>
      </div>
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "text-generate-effect",
    name: "Text Generate Effect",
    registryCliName: "text-generate-effect",
    resourceLinks: [
      { label: "Live demo", href: "/demos/text-generate-effect" },
      { label: "Live demo", href: "/demos/text-generate-effect" },
    ],
    description:
      "Animated text reveal that fades words, characters, or lines into view with optional blur and upward motion.",
    categorySlug: "motion-effects",
    tags: ["typography", "hero", "stagger", "reveal", "motion"],
    premium: false,
    trendingScore: 102,
    createdAt: "2026-05-14",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", description: "Text content to animate." },
      { name: "mode", type: "\"word\" | \"character\" | \"line\"", defaultValue: "\"word\"", description: "Animation segmentation mode." },
      { name: "delay", type: "number", defaultValue: "0", description: "Initial delay before first segment appears." },
      { name: "duration", type: "number", defaultValue: "0.48", description: "Per-segment animation duration in seconds." },
      { name: "stagger", type: "number", defaultValue: "0.06", description: "Delay between segment animations in seconds." },
      { name: "blur", type: "boolean", defaultValue: "true", description: "Applies blur-to-clear transition." },
      { name: "once", type: "boolean", defaultValue: "true", description: "With viewport trigger, animate only once." },
      { name: "className", type: "string", description: "Optional class names for text wrapper." },
      { name: "as", type: "\"p\" | \"h1\" | \"h2\" | \"span\" | \"div\"", defaultValue: "\"p\"", description: "Semantic element used as root." },
      { name: "lift", type: "boolean", defaultValue: "true", description: "Adds subtle upward motion while revealing." },
      { name: "trigger", type: "\"mount\" | \"viewport\"", defaultValue: "\"mount\"", description: "Animation trigger strategy." },
      { name: "replayKey", type: "string | number", description: "Changing this value replays the reveal sequence." },
    ],
    Preview: Previews.PreviewTextGenerateEffect,
    reactSource: `"use client";

import { TextGenerateEffect } from "@/components/text-generate-effect";

export function HeroTextReveal() {
  return (
    <TextGenerateEffect
      as="h2"
      text="Ship product stories with motion-first typography that reveals ideas with clarity, rhythm, and cinematic polish."
      mode="word"
      className="text-4xl font-semibold tracking-tight sm:text-5xl"
      duration={0.4}
      stagger={0.07}
      blur
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "background-gradient",
    name: "Background Gradient",
    registryCliName: "background-gradient",
    resourceLinks: [{ label: "Live demo", href: "/demos/background-gradient" }],
    description:
      "Animated gradient wrapper with soft glow and blur for cards, buttons, and hero sections.",
    categorySlug: "background-effects",
    tags: ["gradient", "glow", "wrapper", "interactive", "background"],
    premium: false,
    trendingScore: 101,
    createdAt: "2026-05-14",
    animationKinds: ["gradient", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "React.ReactNode", description: "Content rendered above the animated gradient layers." },
      { name: "className", type: "string", description: "Class names for the outer animated wrapper." },
      { name: "containerClassName", type: "string", description: "Class names for the inner content container." },
      { name: "surfaceClassName", type: "string", description: "Optional class names for the inner surface layer (inside gradient shell)." },
      { name: "colors", type: "string[]", defaultValue: "[\"#22d3ee\", \"#818cf8\", \"#a855f7\", \"#ec4899\"]", description: "Gradient palette used for animated layers." },
      { name: "animationSpeed", type: "number", defaultValue: "1", description: "Speed multiplier for looping gradient motion." },
      { name: "blur", type: "number", defaultValue: "24", description: "Blur intensity in pixels for glow softness." },
      { name: "borderRadius", type: "string", defaultValue: "\"1rem\"", description: "Wrapper border radius (e.g. \"1rem\", \"24px\")." },
      { name: "as", type: "\"div\" | \"button\" | \"section\"", defaultValue: "\"div\"", description: "Semantic root element variant." },
      { name: "interactive", type: "boolean", defaultValue: "true", description: "Enables hover boost and cursor-follow glow." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables press interaction when used as button." },
    ],
    Preview: Previews.PreviewBackgroundGradient,
    reactSource: `"use client";

import { BackgroundGradient } from "@/components/background-gradient";

export function GradientCard() {
  return (
    <BackgroundGradient
      as="section"
      className="w-full max-w-xl"
      containerClassName="rounded-[inherit] p-6"
      colors={["#22d3ee", "#818cf8", "#a855f7", "#ec4899"]}
      animationSpeed={1}
      blur={24}
      interactive
    >
      <h3 className="text-2xl font-semibold tracking-tight">Animated gradient card</h3>
      <p className="mt-2 text-sm text-muted-foreground">Use this wrapper behind any content.</p>
    </BackgroundGradient>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "typewriter-effect",
    name: "Typewriter Effect",
    registryCliName: "typewriter-effect",
    resourceLinks: [
      { label: "Live demo", href: "/demos/typewriter-effect" },
      { label: "Live demo", href: "/demos/typewriter-effect" },
    ],
    description:
      "Character-by-character typewriter text animation with blinking cursor, optional deleting, looping, and semantic heading support.",
    categorySlug: "motion-effects",
    tags: ["typing", "cursor", "hero", "loop", "text"],
    premium: false,
    trendingScore: 104,
    createdAt: "2026-05-14",
    animationKinds: ["layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string | string[]", description: "Single text or rotating text list to type." },
      { name: "typingSpeed", type: "number", defaultValue: "65", description: "Delay in ms between typed characters." },
      { name: "deletingSpeed", type: "number", defaultValue: "42", description: "Delay in ms between deleted characters." },
      { name: "delay", type: "number", defaultValue: "0", description: "Initial delay in ms before typing starts." },
      { name: "pauseDuration", type: "number", defaultValue: "1200", description: "Pause in ms after a full phrase is typed." },
      { name: "loop", type: "boolean", defaultValue: "false", description: "Loops phrases continuously after completion." },
      { name: "showCursor", type: "boolean", defaultValue: "true", description: "Shows blinking typewriter cursor." },
      { name: "cursorClassName", type: "string", description: "Optional class names for cursor styling." },
      { name: "className", type: "string", description: "Optional class names for text wrapper." },
      { name: "as", type: "\"h1\" | \"h2\" | \"p\" | \"span\" | \"div\"", defaultValue: "\"span\"", description: "Semantic element used as root." },
      { name: "onComplete", type: "() => void", description: "Callback fired when one full phrase set completes." },
    ],
    Preview: Previews.PreviewTypewriterEffect,
    reactSource: `"use client";

import { TypewriterEffect } from "@/components/typewriter-effect";

export function HeroTypewriterHeading() {
  return (
    <TypewriterEffect
      as="h1"
      text="Build polished SaaS surfaces with cinematic motion."
      typingSpeed={45}
      pauseDuration={1500}
      className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
    />
  );
}`,
    reactExamples: [
      {
        title: "Hero heading example",
        code: `"use client";

import { TypewriterEffect } from "@/components/typewriter-effect";

export function HeroTypewriterHeading() {
  return (
    <TypewriterEffect
      as="h1"
      text="Build polished SaaS surfaces with cinematic motion."
      typingSpeed={45}
      pauseDuration={1500}
      className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
    />
  );
}`,
      },
      {
        title: "Multiple rotating words example",
        code: `"use client";

import { TypewriterEffect } from "@/components/typewriter-effect";

export function RotatingTypewriterWords() {
  return (
    <TypewriterEffect
      as="h2"
      text={["Ship faster.", "Polish every interaction.", "Convert visitors into customers."]}
      typingSpeed={52}
      deletingSpeed={36}
      pauseDuration={1200}
      loop
      className="text-2xl font-medium tracking-tight text-muted-foreground sm:text-3xl"
      cursorClassName="bg-primary"
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "text-reveal-card",
    name: "Text Reveal Card",
    registryCliName: "text-reveal-card",
    resourceLinks: [
      { label: "Live demo", href: "/demos/text-reveal-card" },
      { label: "Live demo", href: "/demos/text-reveal-card" },
    ],
    description:
      "Interactive spotlight card with mouse-follow glow and bottom reveal content for features, case studies, and portfolio sections.",
    categorySlug: "cards",
    tags: ["card", "reveal", "hover", "spotlight", "portfolio"],
    premium: false,
    trendingScore: 105,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "gradient", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", description: "Main card heading displayed in the content area." },
      { name: "description", type: "string", description: "Default bottom content shown when revealContent is not provided." },
      { name: "icon", type: "React.ReactNode", description: "Optional icon shown next to the title." },
      { name: "image", type: "string", description: "Optional top image URL rendered as card media." },
      { name: "children", type: "React.ReactNode", description: "Optional custom overlay/content rendered inside the media area." },
      { name: "revealContent", type: "React.ReactNode", description: "Custom content rendered in the reveal section at the bottom." },
      { name: "className", type: "string", description: "Optional class names for card wrapper styling." },
      { name: "revealClassName", type: "string", description: "Optional class names for the reveal content container." },
      { name: "intensity", type: "number", defaultValue: "1", description: "Controls spotlight/reveal intensity. Clamped between 0.5 and 2.2." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables interactive reveal and hover elevation." },
    ],
    Preview: Previews.PreviewTextRevealCard,
    reactSource: `"use client";

import { Sparkles } from "lucide-react";
import { TextRevealCard } from "@/components/text-reveal-card";

export function FeatureRevealCard() {
  return (
    <TextRevealCard
      title="Feature Signal Card"
      description="Reveal launch-ready messaging as users scrub across the card."
      icon={<Sparkles className="size-4 text-primary" />}
      image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
      intensity={1.1}
      className="max-w-md"
    />
  );
}`,
    reactExamples: [
      {
        title: "Feature card example",
        code: `"use client";

import { Rocket } from "lucide-react";
import { TextRevealCard } from "@/components/text-reveal-card";

export function FeatureRevealCard() {
  return (
    <TextRevealCard
      title="Feature Signal Card"
      description="Progressively reveal polished copy while preserving baseline readability."
      icon={<Rocket className="size-4 text-primary" />}
      image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
      intensity={1.05}
      className="max-w-md"
    />
  );
}`,
      },
      {
        title: "Portfolio card example",
        code: `"use client";

import { BriefcaseBusiness } from "lucide-react";
import { TextRevealCard } from "@/components/text-reveal-card";

export function PortfolioRevealCard() {
  return (
    <TextRevealCard
      title="Portfolio Proof Card"
      description="Show outcomes progressively without overloading the initial view."
      icon={<BriefcaseBusiness className="size-4 text-primary" />}
      image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
      revealContent={
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Workspace analytics relaunch</p>
          <p className="text-sm text-muted-foreground">+31% activation after simplifying onboarding copy and interaction cues.</p>
        </div>
      }
      className="max-w-md"
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "glowing-effect-cards",
    name: "Glowing Effect Cards",
    registryCliName: "glowing-effect-cards",
    resourceLinks: [{ label: "Live demo", href: "/demos/glowing-effect-cards" }],
    description:
      "Cursor-reactive glowing border cards with a responsive 2-1-2 layout for refined SaaS sections and dashboards.",
    categorySlug: "cards",
    tags: ["glow", "cards", "cursor", "interactive", "layout"],
    premium: false,
    trendingScore: 111,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "gradient", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "children", type: "React.ReactNode", description: "Content rendered inside `GlowingEffect`." },
      { name: "className", type: "string", description: "Class names for `GlowingEffect` or `GlowingCard` wrapper." },
      { name: "borderRadius", type: "string", defaultValue: "\"1rem\"", description: "Border radius applied to the glowing container." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables pointer-reactive glow behavior." },
      { name: "intensity", type: "number", defaultValue: "1", description: "Glow spread/intensity multiplier." },
      { name: "blur", type: "number", defaultValue: "18", description: "Ambient glow blur amount in pixels." },
      { name: "title", type: "string", description: "`GlowingCard` heading text." },
      { name: "description", type: "string", description: "`GlowingCard` supporting copy." },
      { name: "icon", type: "React.ReactNode", description: "Optional icon for `GlowingCard`." },
      { name: "tall", type: "boolean", defaultValue: "false", description: "Makes `GlowingCard` span a tall middle-column presentation." },
    ],
    Preview: Previews.PreviewGlowingEffectCards,
    reactSource: `"use client";

import { GlowingCardsLayout } from "@/components/glowing-effect-cards";

export function CursorGlowCardsSection() {
  return <GlowingCardsLayout className="max-w-6xl" />;
}`,
    reactExamples: [
      {
        title: "2-1-2 layout example",
        code: `"use client";

import { GlowingCardsLayout } from "@/components/glowing-effect-cards";

export function CursorGlowCardsSection() {
  return <GlowingCardsLayout className="max-w-6xl" />;
}`,
      },
      {
        title: "Single glowing card example",
        code: `"use client";

import { Sparkles } from "lucide-react";
import { GlowingCard } from "@/components/glowing-effect-cards";

export function FeatureGlowCard() {
  return (
    <GlowingCard
      title="Cursor-reactive border"
      description="Glow follows mouse movement and fades smoothly on leave."
      icon={<Sparkles className="size-4" />}
      cta="Open details"
      className="max-w-md"
    />
  );
}`,
      },
      {
        title: "Custom effect wrapper",
        code: `"use client";

import { GlowingEffect } from "@/components/glowing-effect-cards";

export function CustomGlowContainer() {
  return (
    <GlowingEffect glowColor="#7dd3fc" intensity={1.2} blur={22} className="rounded-2xl">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Custom glow theme</h3>
        <p className="mt-2 text-sm text-muted-foreground">Use on any container, not just cards.</p>
      </div>
    </GlowingEffect>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "infinite-moving-cards",
    name: "Infinite Moving Cards",
    registryCliName: "infinite-moving-cards",
    resourceLinks: [{ label: "Live demo", href: "/demos/infinite-moving-cards" }],
    description:
      "Customizable infinite marquee of cards with seamless looping, direction controls, hover pause, and optional custom rendering.",
    categorySlug: "motion-effects",
    tags: ["carousel", "marquee", "testimonials", "logos", "cards"],
    premium: false,
    trendingScore: 109,
    createdAt: "2026-05-14",
    animationKinds: ["layout", "hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "InfiniteMovingCardItem[]", description: "Card data array used to render the moving list." },
      { name: "direction", type: "\"left\" | \"right\"", defaultValue: "\"left\"", description: "Scroll direction of the marquee track." },
      { name: "speed", type: "\"slow\" | \"normal\" | \"fast\"", defaultValue: "\"normal\"", description: "Velocity preset for card movement." },
      { name: "pauseOnHover", type: "boolean", defaultValue: "true", description: "Pauses track animation while hovered." },
      { name: "className", type: "string", description: "Class names for the root wrapper." },
      { name: "cardClassName", type: "string", description: "Class names applied to each card container." },
      { name: "gap", type: "number", defaultValue: "16", description: "Spacing in pixels between cards." },
      { name: "loop", type: "boolean", defaultValue: "true", description: "Enables seamless infinite looping via duplicated items." },
      { name: "showGradientMask", type: "boolean", defaultValue: "true", description: "Shows edge fade masks for polished marquee framing." },
      { name: "renderItem", type: "(item, index) => React.ReactNode", description: "Custom renderer for complete card UI control." },
    ],
    Preview: Previews.PreviewInfiniteMovingCards,
    reactSource: `"use client";

import { InfiniteMovingCards } from "@/components/infinite-moving-cards";

const testimonials = [
  {
    title: "Launch velocity increased",
    description: "We shipped our redesign in half the usual time.",
    name: "Ariana Shaw",
    role: "Product Lead",
    rating: 5,
    tags: ["SaaS"],
  },
  {
    title: "No visual jump",
    description: "The loop feels smooth and polished on every screen size.",
    name: "Marcus Lee",
    role: "Frontend Engineer",
    rating: 5,
    tags: ["Motion"],
  },
];

export function TestimonialsRail() {
  return <InfiniteMovingCards items={testimonials} direction="left" speed="normal" pauseOnHover />;
}`,
    reactExamples: [
      {
        title: "Testimonials example",
        code: `"use client";

import { InfiniteMovingCards } from "@/components/infinite-moving-cards";

const testimonials = [
  { title: "Launch velocity increased", description: "Shipped in half the time.", name: "Ariana", role: "Product Lead", rating: 5, tags: ["SaaS"] },
  { title: "Production-ready defaults", description: "Smooth, readable, responsive.", name: "Marcus", role: "Frontend Engineer", rating: 5, tags: ["React"] },
  { title: "No visual jump", description: "Seamless loop even on large screens.", name: "Lena", role: "Design Manager", rating: 4, tags: ["UX"] },
];

export function TestimonialsRail() {
  return <InfiniteMovingCards items={testimonials} direction="left" speed="normal" pauseOnHover />;
}`,
      },
      {
        title: "Logo/cards example",
        code: `"use client";

import { InfiniteMovingCards } from "@/components/infinite-moving-cards";

const tools = [
  { id: "1", title: "Nexus", tags: ["UI"] },
  { id: "2", title: "Orbit", tags: ["Analytics"] },
  { id: "3", title: "Flux", tags: ["Ops"] },
  { id: "4", title: "Pulse", tags: ["Growth"] },
];

export function ToolsRail() {
  return (
    <InfiniteMovingCards
      items={tools}
      direction="right"
      speed="fast"
      cardClassName="min-w-[180px] max-w-[180px]"
      renderItem={(item) => (
        <div className="flex h-[110px] w-[180px] flex-col items-center justify-center rounded-2xl border border-border/70 bg-card">
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-[11px] text-muted-foreground">{item.tags?.[0]}</p>
        </div>
      )}
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "meteors",
    name: "Meteor Effect",
    registryCliName: "meteors",
    resourceLinks: [{ label: "Live demo", href: "/demos/meteors" }],
    description:
      "Animated diagonal meteor beams with glow heads and trailing streaks, designed as a reusable background layer for cards and hero sections.",
    categorySlug: "background-effects",
    tags: ["meteors", "background", "hero", "glow", "motion"],
    premium: false,
    trendingScore: 106,
    createdAt: "2026-05-14",
    animationKinds: ["gradient", "hover", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "number", type: "number", defaultValue: "18", description: "Base number of meteor beams before intensity scaling." },
      { name: "className", type: "string", description: "Class names for the root wrapper." },
      { name: "meteorClassName", type: "string", description: "Class names applied to each meteor beam element." },
      { name: "minDelay", type: "number", defaultValue: "0.12", description: "Minimum start delay between meteor loops (seconds)." },
      { name: "maxDelay", type: "number", defaultValue: "2.4", description: "Maximum start delay between meteor loops (seconds)." },
      { name: "minDuration", type: "number", defaultValue: "3.2", description: "Minimum meteor travel duration (seconds)." },
      { name: "maxDuration", type: "number", defaultValue: "7.2", description: "Maximum meteor travel duration (seconds)." },
      { name: "angle", type: "number", defaultValue: "215", description: "Travel direction angle in degrees." },
      { name: "glow", type: "boolean", defaultValue: "true", description: "Adds glow bloom around meteor heads." },
      { name: "color", type: "string", defaultValue: "\"hsl(var(--primary) / 0.95)\"", description: "Beam/head color value." },
      { name: "intensity", type: "\"low\" | \"medium\" | \"high\"", defaultValue: "\"medium\"", description: "Meteor density multiplier preset." },
      { name: "hoverOnly", type: "boolean", defaultValue: "false", description: "Runs animation only while hovering the container." },
      { name: "children", type: "React.ReactNode", description: "Foreground content rendered above the meteor layer." },
    ],
    Preview: Previews.PreviewMeteors,
    reactSource: `"use client";

import { Meteors } from "@/components/meteors";

export function HeroMeteors() {
  return (
    <Meteors
      number={26}
      minDuration={2.8}
      maxDuration={5.8}
      minDelay={0.06}
      maxDelay={1.8}
      angle={212}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#050911] px-8 py-16 text-white"
      intensity="high"
      glow
    >
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">Launch cinematic product surfaces</h2>
      </div>
    </Meteors>
  );
}`,
    reactExamples: [
      {
        title: "Card background example",
        code: `"use client";

import { Meteors } from "@/components/meteors";

export function PricingMeteorCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#050911] p-6 text-white">
      <Meteors number={18} minDuration={3} maxDuration={6} angle={218} className="absolute inset-0" />
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-200/80">Team plan</p>
        <h3 className="mt-2 text-2xl font-semibold">$49/mo</h3>
      </div>
    </div>
  );
}`,
      },
      {
        title: "Hero background example",
        code: `"use client";

import { Meteors } from "@/components/meteors";

export function HeroMeteors() {
  return (
    <Meteors
      number={30}
      minDelay={0.05}
      maxDelay={1.8}
      minDuration={2.8}
      maxDuration={5.8}
      angle={212}
      intensity="high"
      glow
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#030712] px-8 py-16 text-white"
    >
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Build launch pages with subtle motion depth
        </h2>
      </div>
    </Meteors>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "background-boxes",
    name: "Background Boxes",
    registryCliName: "background-boxes",
    resourceLinks: [{ label: "Live demo", href: "/demos/background-boxes" }],
    description:
      "Animated isometric grid background with hover color effects and cross markers. Fully configurable skew, scale, box dimensions, and colors.",
    categorySlug: "background-effects",
    tags: ["grid", "hover", "background", "isometric", "animated", "interactive"],
    premium: false,
    trendingScore: 103,
    createdAt: "2026-05-14",
    animationKinds: ["hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "rows", type: "number", defaultValue: "150", description: "Number of columns in the grid layout." },
      { name: "cols", type: "number", defaultValue: "100", description: "Number of rows in each column." },
      { name: "boxWidth", type: "number", defaultValue: "64", description: "Width of each box in px." },
      { name: "boxHeight", type: "number", defaultValue: "32", description: "Height of each box in px." },
      { name: "borderColor", type: "string", defaultValue: "\"#374151\"", description: "Border color for each box." },
      { name: "borderWidth", type: "number", defaultValue: "1", description: "Border width in px." },
      { name: "showCrosses", type: "boolean", defaultValue: "true", description: "Show SVG cross markers at even row/column intersections." },
      { name: "crossColor", type: "string", defaultValue: "\"#374151\"", description: "Color of the cross markers." },
      { name: "hoverColors", type: "string[]", defaultValue: "9 pastel colors", description: "Array of colors randomly applied on cell hover." },
      { name: "skewX", type: "number", defaultValue: "-48", description: "SkewX transform in degrees for the isometric effect." },
      { name: "skewY", type: "number", defaultValue: "14", description: "SkewY transform in degrees for the isometric effect." },
      { name: "scale", type: "number", defaultValue: "0.675", description: "Scale transform applied to the grid." },
      { name: "rotation", type: "number", defaultValue: "0", description: "Rotation in degrees." },
      { name: "translateX", type: "number", defaultValue: "-40", description: "Horizontal offset in percent." },
      { name: "translateY", type: "number", defaultValue: "-60", description: "Vertical offset in percent." },
      { name: "className", type: "string", description: "Class names for the root wrapper." },
    ],
    Preview: Previews.PreviewBackgroundBoxes,
    reactSource: `"use client";

import { BackgroundBoxes } from "@/components/background-boxes";

export function HeroBackgroundBoxes() {
  return (
    <div className="h-[400px] w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
      <BackgroundBoxes
        rows={40}
        cols={30}
        boxWidth={64}
        boxHeight={32}
        borderColor="#374151"
        showCrosses
        crossColor="#374151"
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "encrypted-text",
    name: "Encrypted Text",
    registryCliName: "encrypted-text",
    resourceLinks: [{ label: "Live demo", href: "/demos/encrypted-text" }],
    description:
      "Characters shuffle through gibberish before locking into the final string — a futuristic cyber decoding reveal for hero headings, buttons, badges, and nav links.",
    categorySlug: "motion-effects",
    tags: ["animation", "text", "cyber", "reveal", "typewriter", "hacker", "decode"],
    premium: false,
    trendingScore: 91,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "scroll"],
    dependencies: ["framer-motion"],
    previewShell: "plain",
    props: [
      { name: "text", type: "string", description: "The final string that gets revealed." },
      { name: "trigger", type: '"load" | "hover" | "viewport" | "click"', defaultValue: '"load"', description: "What event starts the animation." },
      { name: "speed", type: "number", defaultValue: "50", description: "Milliseconds between each character locking in." },
      { name: "shuffleSpeed", type: "number", defaultValue: "35", description: "Milliseconds between gibberish shuffle ticks." },
      { name: "iterations", type: "number", defaultValue: "8", description: "Shuffle cycles that run before the first character locks." },
      { name: "revealDelay", type: "number", defaultValue: "0", description: "Milliseconds before the animation begins." },
      { name: "characters", type: "string", description: "Character set used for the gibberish phase." },
      { name: "loop", type: "boolean", defaultValue: "false", description: "Replay the animation after completion." },
      { name: "loopDelay", type: "number", defaultValue: "2000", description: "Milliseconds between loop cycles." },
      { name: "as", type: '"span" | "p" | "h1" | "h2" | "h3" | "div"', defaultValue: '"span"', description: "Rendered HTML element." },
      { name: "onComplete", type: "() => void", description: "Callback fired when every character has locked in." },
      { name: "className", type: "string", description: "Additional Tailwind classes merged onto the root element." },
    ],
    Preview: Previews.PreviewEncryptedText,
    reactSource: `"use client";

import { EncryptedText } from "@/components/encrypted-text";

/* Load trigger — plays once on mount */
export function HeroHeading() {
  return (
    <EncryptedText
      text="INITIALIZING SYSTEM"
      trigger="load"
      speed={55}
      shuffleSpeed={30}
      iterations={10}
      className="text-5xl font-bold tracking-[0.12em] text-foreground"
    />
  );
}

/* Hover trigger — replays on each mouse-enter */
export function HoverButton() {
  return (
    <button className="rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary">
      <EncryptedText text="Get started" trigger="hover" speed={35} shuffleSpeed={20} iterations={4} />
    </button>
  );
}

/* Looping badge */
export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      <EncryptedText text="ONLINE" trigger="load" loop loopDelay={3000} speed={80} iterations={3} />
    </span>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "mac-keyboard",
    name: "Mac Keyboard",
    registryCliName: "mac-keyboard",
    resourceLinks: [{ label: "Live demo", href: "/demos/keyboard" }],
    description:
      "Fully interactive Mac-style keyboard with Web Audio synthesised click sounds, Framer Motion keycap animations, and real-time physical keyboard highlighting.",
    categorySlug: "motion-effects",
    tags: ["keyboard", "interactive", "sound", "animation", "mac", "input", "audio"],
    premium: false,
    trendingScore: 95,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    previewShell: "plain",
    props: [
      { name: "layout",          type: '"mac" | "compact"',               defaultValue: '"mac"',         description: "Full layout or compact (no Fn row)." },
      { name: "theme",           type: '"dark" | "light" | "auto"',       defaultValue: '"auto"',        description: "Visual theme; auto tracks the document dark class." },
      { name: "enableSound",     type: "boolean",                         defaultValue: "true",          description: "Toggle synthesised click sounds." },
      { name: "soundType",       type: '"mechanical" | "soft" | "clicky"', defaultValue: '"mechanical"', description: "Timbre of the synthesised key sound." },
      { name: "volume",          type: "number",                          defaultValue: "0.6",           description: "Master volume (0 – 1)." },
      { name: "showFunctionRow", type: "boolean",                         defaultValue: "true",          description: "Show or hide the Esc + F-key row." },
      { name: "activeKeys",      type: "string[]",                        defaultValue: "[]",            description: "KeyboardEvent.code values to highlight as pressed." },
      { name: "onKeyPress",      type: "(key: KeyDef) => void",           description: "Fires when a virtual key is clicked." },
      { name: "className",       type: "string",                          description: "Extra classes on the keyboard body." },
      { name: "keyClassName",    type: "string",                          description: "Extra classes on every keycap." },
    ],
    Preview: Previews.PreviewKeyboard,
    previewSections: [
      {
        Preview: Previews.PreviewKeyboardWithSoundDetail,
        reactSource: `"use client";
import { MacKeyboard, usePhysicalKeyboard } from "@/components/keyboard";

export function KeyboardWithSound() {
  const active = usePhysicalKeyboard();

  return (
    <MacKeyboard
      layout="mac"
      theme="auto"
      enableSound={true}
      soundType="mechanical"
      volume={0.65}
      activeKeys={active}
      showFunctionRow={true}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewKeyboardSilentDetail,
        reactSource: `"use client";
import { MacKeyboard, usePhysicalKeyboard } from "@/components/keyboard";

export function KeyboardSilent() {
  const active = usePhysicalKeyboard();

  return (
    <MacKeyboard
      layout="mac"
      theme="auto"
      enableSound={false}
      activeKeys={active}
      showFunctionRow={true}
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "images-badge",
    name: "Images Badge",
    registryCliName: "images-badge",
    description:
      "Stacked avatar/image pill that fans open on hover — ideal for team badges, social proof, avatar groups, and template galleries.",
    categorySlug: "motion-effects",
    tags: ["avatar", "badge", "social-proof", "hover", "stack", "team", "animation"],
    premium: false,
    trendingScore: 91,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    previewShell: "plain",
    props: [
      { name: "images",         type: "BadgeImage[]",         description: "Array of { src, alt } objects to display." },
      { name: "maxVisible",     type: "number",               defaultValue: "3",       description: "Images shown in the collapsed state." },
      { name: "revealCount",    type: "number",               defaultValue: "2",       description: "Extra images revealed on hover." },
      { name: "label",          type: "string",               description: "Optional text label after the stack." },
      { name: "size",           type: '"sm" | "md" | "lg"',                  defaultValue: '"md"',       description: "Controls image diameter and pill height." },
      { name: "shape",          type: '"circle" | "rounded" | "square"',   defaultValue: '"rounded"',  description: "Clipping shape applied to each image." },
      { name: "className",      type: "string",               description: "Extra classes on the pill container." },
      { name: "imageClassName", type: "string",               description: "Extra classes on every image wrapper." },
      { name: "onClick",        type: "() => void",           description: "Makes the badge interactive (button role + keyboard)." },
    ],
    Preview: Previews.PreviewImagesBadge,
    previewSections: [
      {
        Preview: Previews.PreviewImagesBadgeDefault,
        reactSource: `"use client";
import { ImagesBadge } from "@/components/images-badge";

const TEAM = [
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4", alt: "Felix" },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede", alt: "Aneka" },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Milo&backgroundColor=d1d4f9",  alt: "Milo"  },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe&backgroundColor=ffd5dc",   alt: "Zoe"   },
  { src: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kai&backgroundColor=ffdfbf",   alt: "Kai"   },
];

export function DefaultBadge() {
  return (
    <ImagesBadge
      images={TEAM}
      maxVisible={3}
      revealCount={2}
      label="Trusted by our team"
      size="md"
      direction="right"
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewImagesBadgeLarge,
        reactSource: `"use client";
import { ImagesBadge } from "@/components/images-badge";

export function LargeBadge() {
  return (
    <ImagesBadge
      images={TEAM}           // 7 images
      maxVisible={4}
      revealCount={3}
      label="12,000+ developers"
      size="lg"
      direction="right"
      onClick={() => window.location.href = "/community"}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewImagesBadgeCompact,
        reactSource: `"use client";
import { ImagesBadge } from "@/components/images-badge";

export function CompactBadge() {
  return (
    <div className="flex items-center gap-3">
      <ImagesBadge
        images={TEAM}
        maxVisible={2}
        revealCount={2}
        size="sm"
      />
      <span className="text-sm text-muted-foreground">
        Felix, Aneka + 3 others liked this
      </span>
    </div>
  );
}`,
      },
      {
        Preview: Previews.PreviewImagesBadgeWide,
        reactSource: `"use client";
import { ImagesBadge } from "@/components/images-badge";

const TEMPLATES = [
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=alpha&backgroundColor=1e293b",   alt: "Dashboard"  },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=beta&backgroundColor=0f172a",    alt: "Landing"    },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=gamma&backgroundColor=172554",   alt: "Portfolio"  },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=delta&backgroundColor=1c1917",   alt: "SaaS"       },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=epsilon&backgroundColor=14532d", alt: "Store"      },
  { src: "https://api.dicebear.com/9.x/shapes/svg?seed=zeta&backgroundColor=450a0a",    alt: "Blog"       },
];

export function WideSpreadBadge() {
  return (
    <ImagesBadge
      images={TEMPLATES}
      maxVisible={2}
      revealCount={4}
      label="6 templates included"
      size="md"
      direction="left"
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "dot-grid-hero",
    name: "Interactive Dot Grid Hero",
    registryCliName: "dot-grid-hero",
    description:
      "Cinematic hero section with a Canvas-rendered dot grid that reacts to cursor proximity — dots scale, brighten, and return to rest with a smooth radial glow spotlight.",
    categorySlug: "hero-sections",
    tags: ["hero", "canvas", "interactive", "particles", "cursor", "spotlight", "animation", "background"],
    premium: false,
    trendingScore: 97,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "gradient"],
    dependencies: ["framer-motion", "lucide-react"],
    previewShell: "plain",
    props: [
      { name: "title",             type: "string",   defaultValue: '"Build interfaces\\nthat ship."', description: "Hero heading. Use \\n for line breaks." },
      { name: "subtitle",          type: "string",   description: "Supporting paragraph below the title." },
      { name: "primaryCTA",        type: "CTAButton", description: "{ label, href?, onClick? } — main action button." },
      { name: "secondaryCTA",      type: "CTAButton", description: "{ label, href?, onClick? } — ghost action button." },
      { name: "dotSize",           type: "number",   defaultValue: "1.2",       description: "Base dot radius in px." },
      { name: "dotGap",            type: "number",   defaultValue: "22",        description: "Gap between dot centres in px." },
      { name: "glowColor",         type: "string",   defaultValue: '"#6366f1"', description: "Cursor spotlight colour (hex)." },
      { name: "interactionRadius", type: "number",   defaultValue: "130",       description: "Radius in px where dots react to the cursor." },
      { name: "dotColor",          type: "string",   defaultValue: '"#334155"', description: "Resting dot colour (hex)." },
      { name: "activeDotColor",    type: "string",   defaultValue: '"#e2e8f0"', description: "Fully-activated dot colour (hex)." },
      { name: "className",         type: "string",   description: "Extra classes on the section element." },
    ],
    Preview: Previews.PreviewDotGridHero,
    previewSections: [
      {
        Preview: Previews.PreviewDotGridHeroDefault,
        reactSource: `"use client";
import { DotGridHero } from "@/components/dot-grid-hero";

export function DefaultHero() {
  return (
    <DotGridHero
      title={"Build interfaces\\nthat ship."}
      subtitle="A motion-native component library for React.
Animated, accessible, and production-ready."
      primaryCTA={{ label: "Get started",         href: "/components" }}
      secondaryCTA={{ label: "Browse components", href: "/components" }}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewDotGridHeroDense,
        reactSource: `"use client";
import { DotGridHero } from "@/components/dot-grid-hero";

export function DenseHero() {
  return (
    <DotGridHero
      title={"Design systems\\nmade simple."}
      subtitle="Everything you need to build fast,
beautiful products at scale."
      primaryCTA={{ label: "Start for free", href: "#" }}
      secondaryCTA={{ label: "View docs",    href: "#" }}
      dotGap={14}
      dotSize={1.0}
      glowColor="#06b6d4"
      activeDotColor="#cffafe"
      interactionRadius={150}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewDotGridHeroAmber,
        reactSource: `"use client";
import { DotGridHero } from "@/components/dot-grid-hero";

export function AmberHero() {
  return (
    <DotGridHero
      title={"Ship 10× faster\\nwith AI."}
      subtitle="AI-powered tooling that writes, tests,
and deploys your code automatically."
      primaryCTA={{ label: "Try it free",  href: "#" }}
      secondaryCTA={{ label: "Watch demo", href: "#" }}
      dotGap={26}
      dotSize={1.4}
      glowColor="#f59e0b"
      activeDotColor="#fef3c7"
      dotColor="#292524"
      interactionRadius={200}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewDotGridHeroRose,
        reactSource: `"use client";
import { DotGridHero } from "@/components/dot-grid-hero";

export function RoseHero() {
  return (
    <DotGridHero
      title={"Beautiful UX\\nstarts here."}
      subtitle="Craft interfaces your users will love.
Polished components, zero compromise."
      primaryCTA={{ label: "Explore now",  href: "#" }}
      secondaryCTA={{ label: "See pricing", href: "#" }}
      dotGap={30}
      dotSize={2.0}
      glowColor="#f43f5e"
      activeDotColor="#ffe4e6"
      dotColor="#3f1f27"
      interactionRadius={160}
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "starfield-hero",
    name: "Interactive Starfield Hero",
    registryCliName: "starfield-hero",
    description:
      "Dark hero section with a cursor-reactive starfield. Hundreds of glowing particles stretch, brighten, and rotate toward the cursor — built on Canvas + requestAnimationFrame at 60 fps.",
    categorySlug: "hero-sections",
    tags: ["hero", "canvas", "interactive", "particles", "cursor", "starfield", "animation", "dark", "background"],
    premium: false,
    trendingScore: 98,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion", "lucide-react"],
    previewShell: "plain",
    props: [
      { name: "title",             type: "string",    defaultValue: '"Ship faster.\\nBuild better."', description: "Hero heading — use \\n for line breaks." },
      { name: "subtitle",          type: "string",    description: "Supporting paragraph below the title." },
      { name: "primaryCTA",        type: "CTAConfig", description: "{ label, href?, onClick? } — main action button." },
      { name: "secondaryCTA",      type: "CTAConfig", description: "{ label, href?, onClick? } — ghost action button." },
      { name: "particleCount",     type: "number",    defaultValue: "300",       description: "Total number of particles." },
      { name: "interactionRadius", type: "number",    defaultValue: "140",       description: "Cursor influence radius in px." },
      { name: "particleColor",     type: "string",    defaultValue: '"#60a5fa"', description: "Base particle colour (hex)." },
      { name: "activeColor",       type: "string",    defaultValue: '"#ffffff"', description: "Particle colour at full activation (hex)." },
      { name: "speed",             type: "number",    defaultValue: "0.5",       description: "Return speed: 0.1 (dreamlike) → 1.0 (snappy)." },
      { name: "children",          type: "ReactNode", description: "Override default hero content entirely." },
      { name: "className",         type: "string",    description: "Extra classes on the section element." },
    ],
    Preview: Previews.PreviewStarfieldHero,
    previewSections: [
      {
        Preview: Previews.PreviewStarfieldHeroDefault,
        reactSource: `"use client";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function DefaultHero() {
  return (
    <InteractiveStarfieldHero
      title={"Ship faster.\\nBuild better."}
      subtitle="A motion-native component library for React — animated, accessible, and production-ready."
      primaryCTA={{ label: "Get started",      href: "/components" }}
      secondaryCTA={{ label: "View components", href: "/components" }}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewStarfieldHeroDeepSpace,
        reactSource: `"use client";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function DeepSpaceHero() {
  return (
    <InteractiveStarfieldHero
      title={"Design systems\\nmade simple."}
      subtitle="Everything you need to build beautiful products at scale."
      primaryCTA={{ label: "Start for free", href: "#" }}
      secondaryCTA={{ label: "View docs",    href: "#" }}
      particleCount={400}
      particleColor="#a78bfa"
      activeColor="#f0abfc"
      interactionRadius={180}
      speed={0.4}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewStarfieldHeroOcean,
        reactSource: `"use client";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function OceanNightHero() {
  return (
    <InteractiveStarfieldHero
      title={"Ship 10× faster\\nwith AI."}
      subtitle="AI-powered tooling that writes, tests, and deploys your code automatically."
      primaryCTA={{ label: "Try it free",  href: "#" }}
      secondaryCTA={{ label: "Watch demo", href: "#" }}
      particleColor="#22d3ee"
      activeColor="#ecfeff"
      interactionRadius={120}
      speed={0.8}
    />
  );
}`,
      },
      {
        Preview: Previews.PreviewStarfieldHeroEmber,
        reactSource: `"use client";
import { InteractiveStarfieldHero } from "@/components/starfield-hero";

export function EmberStormHero() {
  return (
    <InteractiveStarfieldHero
      title={"Beautiful UX\\nstarts here."}
      subtitle="Craft interfaces your users will love. Polished components, zero compromise."
      primaryCTA={{ label: "Explore now",  href: "#" }}
      secondaryCTA={{ label: "See pricing", href: "#" }}
      particleCount={180}
      particleColor="#f59e0b"
      activeColor="#fef9c3"
      interactionRadius={160}
      speed={0.15}
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "compare",
    name: "Before / After Compare",
    registryCliName: "compare",
    description:
      "Compare two images side by side: the divider follows the mouse on desktop and drags on touch screens. Optional labels, custom start position, and any aspect ratio.",
    categorySlug: "motion-effects",
    tags: ["compare", "slider", "before-after", "image", "interactive", "drag", "cursor"],
    premium: false,
    trendingScore: 92,
    createdAt: "2026-05-14",
    animationKinds: ["hover"],
    dependencies: ["lucide-react"],
    previewShell: "plain",
    props: [
      { name: "beforeImage",     type: "string", description: "src URL for the before (left) image." },
      { name: "afterImage",      type: "string", description: "src URL for the after (right) image." },
      { name: "beforeLabel",     type: "string", description: "Optional text label on the left side." },
      { name: "afterLabel",      type: "string", description: "Optional text label on the right side." },
      { name: "initialPosition", type: "number", defaultValue: "50",  description: "Starting slider position as 0–100%." },
      { name: "className",       type: "string", description: "Extra Tailwind classes — set aspect ratio here." },
    ],
    Preview: Previews.PreviewCompare,
    previewSections: [
      {
        Preview: Previews.PreviewCompareDefault,
        reactSource: `"use client";
import { Compare } from "@/components/compare";

export function CompareDemo() {
  return (
    <Compare
      beforeImage="/images/before.jpg"
      afterImage="/images/after.jpg"
      beforeLabel="Before"
      afterLabel="After"
      className="aspect-video w-full"
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "expandable-cards",
    name: "Expandable Cards",
    registryCliName: "expandable-cards",
    description:
      "Responsive card grid where clicking a card smoothly expands it into a full-detail overlay with image, description, and a CTA button.",
    categorySlug: "cards",
    tags: ["cards", "grid", "expandable", "modal", "interactive", "framer-motion", "animation"],
    premium: false,
    trendingScore: 94,
    createdAt: "2026-05-14",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react"],
    previewShell: "plain",
    props: [
      { name: "cards",     type: "CardItem[]", description: "Array of card data objects." },
      { name: "className", type: "string",     description: "Extra classes on the grid container." },
    ],
    Preview: Previews.PreviewExpandableCards,
    previewSections: [
      {
        Preview: Previews.PreviewExpandableCards,
        reactSource: `"use client";
import { ExpandableCards } from "@/components/expandable-cards";
import type { CardItem } from "@/components/expandable-cards";

const cards: CardItem[] = [
  {
    id: "1",
    title: "Motion Design System",
    description: "Animation primitives built for React and Tailwind CSS.",
    fullDescription: "Full description shown when expanded...",
    image: "/images/card-1.jpg",
    category: "Design",
    ctaText: "Explore",
    ctaLink: "/components",
  },
];

export default function Page() {
  return <ExpandableCards cards={cards} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "animated-select-headline",
    name: "Animated Select Headline",
    description: "A cycling word headline where each active word is highlighted with a Figma-style selection rectangle — thin border with corner handles — using blur-fade transitions.",
    categorySlug: "motion-effects",
    tags: ["headline", "text", "animation", "cycling", "selection", "framer-motion", "hero", "blur"],
    premium: false,
    trendingScore: 188,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewAnimatedSelectHeadline,
    reactSource: `"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedSelectHeadlineProps {
  words?: string[];
  prefix?: string;
  suffix?: string;
  interval?: number;
  className?: string;
  headingClassName?: string;
}

const ACCENT_GRADIENTS = [
  "bg-gradient-to-r from-cyan-400 to-emerald-500 bg-clip-text text-transparent",
  "bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent",
];

export function AnimatedSelectHeadline({
  words = ["warp speed", "record time", "pure flow", "light speed"],
  prefix = "Build amazing websites at",
  suffix,
  interval = 2500,
  className,
  headingClassName,
}: AnimatedSelectHeadlineProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  const accentStart = Math.max(words.length - 2, 0);
  const isAccent = index >= accentStart;
  const accentClass = isAccent ? ACCENT_GRADIENTS[index - accentStart] : undefined;

  return (
    <div className={cn("text-center", className)}>
      <h2
        className={cn(
          "text-4xl font-bold leading-tight tracking-tight text-gray-950 sm:text-5xl",
          headingClassName,
        )}
      >
        {prefix && <>{prefix} </>}
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, filter: "blur(8px)", y: 8 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(8px)", y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn("relative inline-block font-bold", accentClass)}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
        {suffix && <> {suffix}</>}
      </h2>
    </div>
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "words", type: "string[]", description: "Array of words or phrases to cycle through", defaultValue: '["warp speed", "record time", "pure flow", "light speed"]' },
      { name: "prefix", type: "string", description: "Static text displayed before the animated word", defaultValue: '"Build amazing websites at"' },
      { name: "suffix", type: "string | undefined", description: "Optional static text displayed after the animated word" },
      { name: "interval", type: "number", description: "Milliseconds between each word transition", defaultValue: "2500" },
      { name: "className", type: "string | undefined", description: "Additional classes applied to the wrapper div" },
      { name: "headingClassName", type: "string | undefined", description: "Additional classes applied to the h2 heading element" },
    ],
  },
  {
    slug: "warp-speed-card",
    name: "Warp Speed Card",
    description: "A focused warp-speed effect — hover a single phrase to reveal a dark space scene with streaking beams confined to the text's bounding box. The text itself stays static; the effect lives entirely behind it.",
    categorySlug: "motion-effects",
    tags: ["hover", "reveal", "beams", "space", "warp", "framer-motion", "card", "background", "text"],
    premium: false,
    trendingScore: 210,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewWarpSpeedCard,
    reactSource: `"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BEAMS = [
  { y: "8%",  length: 60,  thickness: 1, opacity: 0.9,  delay: 0,    duration: 0.46 },
  { y: "20%", length: 95,  thickness: 1, opacity: 0.55, delay: 0.1,  duration: 0.7  },
  { y: "30%", length: 45,  thickness: 1, opacity: 1.0,  delay: 0.04, duration: 0.4  },
  { y: "42%", length: 115, thickness: 2, opacity: 0.42, delay: 0.18, duration: 0.86 },
  { y: "55%", length: 65,  thickness: 1, opacity: 0.85, delay: 0.08, duration: 0.48 },
  { y: "66%", length: 100, thickness: 1, opacity: 0.5,  delay: 0.22, duration: 0.78 },
  { y: "78%", length: 50,  thickness: 1, opacity: 0.92, delay: 0.12, duration: 0.44 },
  { y: "90%", length: 85,  thickness: 2, opacity: 0.6,  delay: 0.06, duration: 0.66 },
] as const;

const STARS = [
  { x: 14, y: 22, r: 1,   delay: 0.1 },
  { x: 36, y: 62, r: 1,   delay: 0.4 },
  { x: 58, y: 16, r: 1.5, delay: 0.7 },
  { x: 76, y: 76, r: 1,   delay: 0.2 },
  { x: 50, y: 45, r: 1,   delay: 0.55 },
  { x: 88, y: 38, r: 1,   delay: 0.35 },
] as const;

export interface WarpSpeedCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function WarpSpeedCard({ children, className, contentClassName }: WarpSpeedCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-white", className)}>
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  );
}

export interface WarpTextTriggerProps {
  children: React.ReactNode;
  className?: string;
  beamColor?: string;
}

export function WarpTextTrigger({
  children,
  className,
  beamColor = "255,255,255",
}: WarpTextTriggerProps) {
  const [hovered, setHovered] = useState(false);
  const handleBorder = hovered ? "rgba(148,163,184,0.8)" : "rgb(59,130,246)";
  const handleFill = hovered ? "rgb(24,24,27)" : "white";
  const boxBorder = hovered ? "rgba(148,163,184,0.5)" : "rgba(59,130,246,0.5)";

  return (
    <span
      className={cn("relative inline-block cursor-default select-none align-baseline", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Confined warp scene — clipped to the text box */}
      <span className="pointer-events-none absolute -inset-1 overflow-hidden" aria-hidden>
        <motion.span
          className="absolute inset-0 block bg-zinc-950"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
        {STARS.map((s, i) => (
          <motion.span
            key={\`s-\${i}\`}
            className="absolute block rounded-full bg-white"
            style={{ left: \`\${s.x}%\`, top: \`\${s.y}%\`, width: s.r, height: s.r }}
            animate={hovered ? { opacity: [0, 1, 0.3, 1, 0] } : { opacity: 0 }}
            transition={hovered ? { duration: 2.6, delay: s.delay, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
          />
        ))}
        {BEAMS.map((beam, i) => (
          <motion.span
            key={\`b-\${i}\`}
            className="absolute block"
            style={{
              left: 0,
              top: beam.y,
              height: beam.thickness,
              width: beam.length,
              background: \`linear-gradient(90deg, transparent 0%, rgba(\${beamColor},0.75) 38%, rgba(\${beamColor},1) 50%, rgba(\${beamColor},0.75) 62%, transparent 100%)\`,
            }}
            initial={{ x: -160, opacity: 0 }}
            animate={hovered ? { x: [-160, 700], opacity: [0, beam.opacity, beam.opacity, 0] } : { x: -160, opacity: 0 }}
            transition={hovered ? {
              duration: beam.duration, delay: beam.delay, repeat: Infinity,
              ease: [0.18, 0.52, 0.82, 1], times: [0, 0.08, 0.92, 1],
            } : { duration: 0.2 }}
          />
        ))}
      </span>

      {/* Static text — color flips on hover so it stays legible on dark bg */}
      <motion.span
        className="relative inline-block px-0.5"
        animate={{ color: hovered ? "rgb(255,255,255)" : "rgb(17,24,39)" }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.span>

      {/* Figma-style selection handles */}
      <span className="pointer-events-none absolute -inset-1" aria-hidden>
        <span className="absolute inset-0 border" style={{ borderColor: boxBorder }} />
        <span className="absolute -top-0.75 -left-0.75 size-1.5 border" style={{ borderColor: handleBorder, backgroundColor: handleFill }} />
        <span className="absolute -top-0.75 -right-0.75 size-1.5 border" style={{ borderColor: handleBorder, backgroundColor: handleFill }} />
        <span className="absolute -bottom-0.75 -left-0.75 size-1.5 border" style={{ borderColor: handleBorder, backgroundColor: handleFill }} />
        <span className="absolute -bottom-0.75 -right-0.75 size-1.5 border" style={{ borderColor: handleBorder, backgroundColor: handleFill }} />
      </span>
    </span>
  );
}

// Usage example
export default function Demo() {
  return (
    <WarpSpeedCard className="border border-gray-200 shadow-sm">
      <div className="px-10 py-14 text-center">
        <h2 className="text-5xl font-bold leading-tight tracking-tight text-gray-950">
          Build amazing websites
          <br />
          at <WarpTextTrigger>warp speed</WarpTextTrigger>
        </h2>
      </div>
    </WarpSpeedCard>
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "children", type: "ReactNode", description: "Card content. Place a <WarpTextTrigger>phrase</WarpTextTrigger> inside to enable the inline warp effect on hover." },
      { name: "className", type: "string | undefined", description: "Additional classes applied to the card root element" },
      { name: "contentClassName", type: "string | undefined", description: "Additional classes applied to the inner content wrapper" },
    ],
  },
  {
    slug: "circular-carousel",
    name: "Circular Carousel",
    description: "An animated orbital carousel with smooth active-card transitions.",
    categorySlug: "cards",
    tags: ["carousel", "circular", "orbital", "cards", "framer-motion", "animation"],
    premium: false,
    trendingScore: 85,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewCircularCarousel,
    reactSource: `"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
}

export interface CircularCarouselProps {
  items: CarouselItem[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const VISIBLE_COUNT = 5;
const RADIUS_X = 220;
const RADIUS_Y = 100;

function getItemPosition(index: number, activeIndex: number, total: number) {
  const offset = index - activeIndex;
  const half = Math.floor(VISIBLE_COUNT / 2);
  let adjustedOffset = offset;

  if (offset > half) adjustedOffset = offset - total;
  if (offset < -half) adjustedOffset = offset + total;

  if (Math.abs(adjustedOffset) > half * 2) return null;

  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI;
  const x = Math.sin(angle) * RADIUS_X;
  const y = -Math.cos(angle) * RADIUS_Y;

  const distance = Math.abs(adjustedOffset);
  const maxDistance = half + 1;
  const scale = Math.max(0, 1 - (distance / maxDistance) * 0.3);
  const opacity = Math.max(0.3, 1 - (distance / maxDistance) * 0.7);
  const zIndex = VISIBLE_COUNT - distance;

  return { x, y, scale, opacity, zIndex, adjustedOffset };
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = true,
  autoPlayInterval = 4000,
  className,
}: CircularCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeIndex = controlledIndex ?? internalIndex;
  const total = items.length;

  const goTo = useCallback(
    (index: number) => {
      const newIndex = ((index % total) + total) % total;
      if (controlledIndex === undefined) {
        setInternalIndex(newIndex);
      }
      onActiveChange?.(newIndex);
    },
    [total, controlledIndex, onActiveChange],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!autoPlay || isHovered || isFocused) return;
    intervalRef.current = setInterval(next, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, autoPlayInterval, isHovered, isFocused, next]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, [next, prev]);

  const activeItem = items[activeIndex];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Circular carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative flex flex-col items-center justify-center gap-8 outline-none",
        className,
      )}
    >
      {/* Circular track */}
      <div className="relative h-[280px] w-full max-w-lg">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const pos = getItemPosition(i, activeIndex, total);
            if (!pos) return null;

            const isActive = i === activeIndex;

            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  x: pos.x,
                  y: pos.y,
                  scale: pos.scale,
                  opacity: pos.opacity,
                  zIndex: pos.zIndex,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => goTo(i)}
                aria-label={item.title}
                aria-selected={isActive}
                role="option"
                className={cn(
                  "absolute left-1/2 top-1/2 flex h-32 w-48 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-start justify-between rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 p-4 backdrop-blur-sm transition-shadow duration-300",
                  isActive
                    ? "shadow-[0_20px_60px_-12px_rgba(0,0,0,0.5)]"
                    : "shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.4)]",
                )}
                style={{ transformOrigin: "center center" }}
              >
                {item.tag && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70">
                    {item.tag}
                  </span>
                )}
                <div className="w-full">
                  <h3 className={cn(
                    "font-semibold leading-tight transition-colors duration-300",
                    isActive ? "text-white text-base" : "text-white/80 text-sm"
                  )}>
                    {item.title}
                  </h3>
                  <p className={cn(
                    "mt-1 line-clamp-2 text-xs leading-relaxed transition-colors duration-300",
                    isActive ? "text-white/60" : "text-white/40"
                  )}>
                    {item.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Center content */}
      <motion.div
        key={activeItem.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
      >
        <span className="text-5xl font-bold tracking-tight text-white/90">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        <span className="mt-1 text-xs text-white/40">
          of {String(total).padStart(2, "0")}
        </span>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={prev}
          aria-label="Previous item"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <ChevronLeft className="size-5" />
        </motion.button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5" role="tablist">
          {items.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-6 bg-white/80"
                  : "w-1.5 bg-white/20 hover:bg-white/40",
              )}
              aria-label={\`Go to item \${i + 1}\`}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={next}
          aria-label="Next item"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <ChevronRight className="size-5" />
        </motion.button>
      </div>
    </div>
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "items", type: "CarouselItem[]", description: "Array of carousel items with id, title, description, and optional tag." },
      { name: "activeIndex", type: "number | undefined", description: "Controlled active item index." },
      { name: "onActiveChange", type: "(index: number) => void", description: "Callback fired when the active item changes." },
      { name: "autoPlay", type: "boolean", description: "Enable automatic rotation.", defaultValue: "true" },
      { name: "autoPlayInterval", type: "number", description: "Milliseconds between auto-rotation.", defaultValue: "4000" },
      { name: "className", type: "string | undefined", description: "Additional classes applied to the outer wrapper." },
    ],
  },
  {
    slug: "chat-messages",
    name: "Chat Messages",
    description: "Animated chat message bubbles with typing indicators and sequential reveal.",
    categorySlug: "ai-components",
    tags: ["chat", "messages", "ai", "conversation", "typing", "animation", "framer-motion"],
    premium: false,
    trendingScore: 92,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewChatMessages,
    reactSource: `"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatMessagesProps {
  messages?: ChatMessage[];
  autoPlay?: boolean;
  autoPlayDelay?: number;
  typingDuration?: number;
  showReplay?: boolean;
  interactive?: boolean;
  className?: string;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: "1", sender: "assistant", content: "Hello! I'm your Nexus AI assistant. How can I help you build something amazing today?" },
  { id: "2", sender: "user", content: "I want to create a beautiful landing page for my SaaS product." },
  { id: "3", sender: "assistant", content: "Great choice! Nexus UI has everything you need — animated components, polished styling, and easy integration. What feature would you like to showcase first?" },
  { id: "4", sender: "user", content: "I need something that will impress investors during pitch meetings." },
  { id: "5", sender: "assistant", content: "Perfect. I'd recommend our Hero Aurora Spotlight combined with the Cinematic Logo Cloud. They create a stunning first impression that showcases both innovation and credibility." },
  { id: "6", sender: "user", content: "Can I see how they look together?" },
  { id: "7", sender: "assistant", content: "Absolutely. Click any component in the sidebar to preview it live, then copy the code directly into your project. No complex setup required." },
];

function TypingIndicator({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl rounded-tl-md border border-white/10 bg-zinc-800/90 px-4 py-3 backdrop-blur-sm",
        className,
      )}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-white/60"
          animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

function MessageBubble({
  message,
  isLast,
}: {
  message: ChatMessage;
  isLast?: boolean;
}) {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div className={cn("flex items-end gap-2", isUser && "flex-row-reverse")}>
        {!isUser && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="size-4 text-white" />
          </div>
        )}
        <motion.div
          layout
          className={cn(
            "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_8px_24px_-4px_rgba(99,102,241,0.4)]"
              : "rounded-tl-md border border-white/10 bg-zinc-800/90 text-zinc-100 backdrop-blur-sm shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)]",
          )}
          whileHover={{ scale: 1.01, y: -1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {message.content}
        </motion.div>
      </div>
    </motion.div>
  );
}

export function ChatMessages({
  messages = DEFAULT_MESSAGES,
  autoPlay = true,
  autoPlayDelay = 1800,
  typingDuration = 1400,
  showReplay = true,
  interactive = false,
  className,
}: ChatMessagesProps) {
  const [visibleCount, setVisibleCount] = useState(autoPlay ? 0 : messages.length);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(messages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAutoPlaying = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const revealNext = useCallback(
    async (index: number) => {
      if (index >= chatMessages.length) {
        isAutoPlaying.current = false;
        return;
      }

      const message = chatMessages[index];

      if (message.sender === "assistant") {
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, typingDuration));
        setIsTyping(false);
      }

      setVisibleCount(index + 1);
      await new Promise((r) => setTimeout(r, 100));
      scrollToBottom();

      await new Promise((r) => setTimeout(r, autoPlayDelay - (message.sender === "assistant" ? typingDuration : 0) - 100));

      if (isAutoPlaying.current) {
        revealNext(index + 1);
      }
    },
    [chatMessages, autoPlayDelay, typingDuration, scrollToBottom],
  );

  const replay = useCallback(() => {
    setVisibleCount(0);
    setChatMessages(messages);
    isAutoPlaying.current = true;
    setTimeout(() => revealNext(0), 100);
  }, [messages, revealNext]);

  useEffect(() => {
    setChatMessages(messages);
    if (autoPlay) {
      setVisibleCount(0);
      isAutoPlaying.current = true;
      const timer = setTimeout(() => revealNext(0), 500);
      return () => {
        clearTimeout(timer);
        isAutoPlaying.current = false;
      };
    } else {
      setVisibleCount(messages.length);
    }
  }, [messages, autoPlay, revealNext]);

  useEffect(() => {
    scrollToBottom();
  }, [visibleCount, isTyping, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || !interactive) return;

    const newMessage: ChatMessage = {
      id: \`user-\${Date.now()}\`,
      sender: "user",
      content: inputValue.trim(),
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setVisibleCount((prev) => prev + 1);

    setTimeout(() => {
      const assistantReply: ChatMessage = {
        id: \`assistant-\${Date.now()}\`,
        sender: "assistant",
        content: "That's a great question! Let me help you explore the best options for your use case.",
      };
      setChatMessages((prev) => [...prev, assistantReply]);
      setVisibleCount((prev) => prev + 1);
    }, typingDuration + 500);
  }, [inputValue, interactive, typingDuration]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Nexus AI</h3>
            <p className="text-xs text-white/40">Always here to help</p>
          </div>
        </div>
        {showReplay && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={replay}
            aria-label="Replay conversation"
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="size-3.5" />
            Replay
          </motion.button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {chatMessages.slice(0, visibleCount).map((message, i) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLast={i === visibleCount - 1}
          />
        ))}

        <AnimatePresence>
          {isTyping && <TypingIndicator />}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2 backdrop-blur-sm focus-within:border-white/20 focus-within:bg-zinc-800/70">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!interactive}
            placeholder={interactive ? "Ask Nexus AI..." : "Demo mode - replay to watch again"}
            aria-label={interactive ? "Type your message" : "Chat input (demo mode)"}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30 disabled:cursor-not-allowed"
          />
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!interactive || !inputValue.trim()}
            aria-label="Send message"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              interactive && inputValue.trim()
                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                : "bg-white/5 text-white/30",
            )}
          >
            <Send className="size-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "messages", type: "ChatMessage[]", description: "Array of chat messages with id, sender, content, and optional timestamp.", defaultValue: "7 built-in messages" },
      { name: "autoPlay", type: "boolean", description: "Automatically play the conversation on mount.", defaultValue: "true" },
      { name: "autoPlayDelay", type: "number", description: "Delay between messages in milliseconds.", defaultValue: "1800" },
      { name: "typingDuration", type: "number", description: "How long the typing indicator shows before assistant replies.", defaultValue: "1400" },
      { name: "showReplay", type: "boolean", description: "Show the replay button to restart the animation.", defaultValue: "true" },
      { name: "interactive", type: "boolean", description: "Allow user to type and send messages.", defaultValue: "false" },
      { name: "className", type: "string | undefined", description: "Additional classes applied to the outer wrapper." },
    ],
  },
  {
    slug: "shader-flow",
    name: "Shader Flow",
    description: "A soft, shader-style background: blurred gradient blobs drifting with Framer Motion, no WebGL needed.",
    categorySlug: "background-effects",
    tags: ["background", "shader", "gradient", "animation", "flowing", "blobs", "framer-motion"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["gradient", "hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewShaderFlow,
    reactSource: `"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ShaderFlowProps {
  children?: ReactNode;
  className?: string;
  showContent?: boolean;
  cursorReactive?: boolean;
  intensity?: "low" | "medium" | "high";
}

const blobVariants = {
  animate: {
    x: ["-10%", "10%", "-10%"],
    y: ["0%", "8%", "0%"],
    scale: [1, 1.15, 1],
    opacity: [0.45, 0.7, 0.45],
    transition: {
      duration: 14,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const blob2Variants = {
  animate: {
    x: ["12%", "-8%", "12%"],
    y: ["10%", "-6%", "10%"],
    scale: [1.1, 0.95, 1.1],
    opacity: [0.35, 0.6, 0.35],
    transition: {
      duration: 16,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const blob3Variants = {
  animate: {
    rotate: [0, 8, 0],
    scale: [1, 1.08, 1],
    opacity: [0.3, 0.5, 0.3],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const waveVariants = {
  animate: {
    x: ["-5%", "5%", "-5%"],
    y: ["-3%", "3%", "-3%"],
    scale: [1, 1.05, 1],
    opacity: [0.25, 0.4, 0.25],
    transition: {
      duration: 22,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

function NoiseOverlay({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 opacity-[0.015] pointer-events-none",
        "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]",
        className,
      )}
      aria-hidden
    />
  );
}

function BlobLayer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      variants={blobVariants}
      animate="animate"
      className={cn(
        "absolute rounded-full bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-fuchsia-500/30 blur-[100px]",
        className,
      )}
      style={style}
      aria-hidden
    />
  );
}

function Blob2Layer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      variants={blob2Variants}
      animate="animate"
      className={cn(
        "absolute rounded-full bg-gradient-to-tr from-cyan-500/25 via-blue-500/20 to-indigo-500/25 blur-[80px]",
        className,
      )}
      style={style}
      aria-hidden
    />
  );
}

function Blob3Layer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      variants={blob3Variants}
      animate="animate"
      className={cn(
        "absolute rounded-full bg-gradient-to-bl from-amber-500/20 via-orange-500/15 to-pink-500/20 blur-[90px]",
        className,
      )}
      style={style}
      aria-hidden
    />
  );
}

function WaveLayer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      variants={waveVariants}
      animate="animate"
      className={cn(
        "absolute rounded-full bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 blur-[120px]",
        className,
      )}
      style={style}
      aria-hidden
    />
  );
}

function ShaderBackground({
  cursorReactive,
  intensity = "medium",
}: {
  cursorReactive?: boolean;
  intensity?: "low" | "medium" | "high";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cursorReactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const intensityScale = intensity === "low" ? 0.6 : intensity === "high" ? 1.2 : 1;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />

      {!reduceMotion && (
        <>
          <BlobLayer
            className="h-[600px] w-[600px] -top-48 -left-48"
            style={{
              transform: cursorReactive
                ? \`translate(\${mousePosition.x * 30 * intensityScale}px, \${mousePosition.y * 20 * intensityScale}px)\`
                : undefined,
            }}
          />
          <Blob2Layer
            className="h-[500px] w-[500px] -top-24 -right-24"
            style={{
              transform: cursorReactive
                ? \`translate(\${mousePosition.x * -25 * intensityScale}px, \${mousePosition.y * 15 * intensityScale}px)\`
                : undefined,
            }}
          />
          <Blob3Layer
            className="h-[450px] w-[450px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: cursorReactive
                ? \`translate(\${mousePosition.x * 20 * intensityScale}px, \${mousePosition.y * -20 * intensityScale}px)\`
                : undefined,
            }}
          />
          <WaveLayer
            className="h-[700px] w-[700px] -bottom-64 -left-32"
            style={{
              transform: cursorReactive
                ? \`translate(\${mousePosition.x * -15 * intensityScale}px, \${mousePosition.y * 25 * intensityScale}px)\`
                : undefined,
            }}
          />
          <WaveLayer
            className="h-[550px] w-[550px] top-0 right-0"
            style={{
              transform: cursorReactive
                ? \`translate(\${mousePosition.x * 20 * intensityScale}px, \${mousePosition.y * -15 * intensityScale}px)\`
                : undefined,
            }}
          />
        </>
      )}

      {reduceMotion && (
        <>
          <div className="absolute h-[600px] w-[600px] -top-48 -left-48 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-fuchsia-500/20 blur-[100px]" />
          <div className="absolute h-[500px] w-[500px] -top-24 -right-24 rounded-full bg-gradient-to-tr from-cyan-500/15 via-blue-500/15 to-indigo-500/15 blur-[80px]" />
          <div className="absolute h-[450px] w-[450px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-pink-500/15 blur-[90px]" />
        </>
      )}

      <NoiseOverlay />
    </div>
  );
}

function ForegroundContent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-10 flex flex-col items-center justify-center text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          New component available
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
      >
        Build stunning interfaces with{" "}
        <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Nexus UI
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 max-w-lg text-base text-white/60 sm:text-lg"
      >
        Polished animated components built with Framer Motion and Tailwind CSS.
        Copy, paste, and ship beautiful interfaces in minutes.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-medium text-white shadow-[0_8px_32px_-8px_rgba(99,102,241,0.5)] transition-shadow hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.6)]"
        >
          Browse components
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
        >
          View documentation
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function ShaderFlow({
  children,
  className,
  showContent = true,
  cursorReactive = true,
  intensity = "medium",
}: ShaderFlowProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-2xl border border-white/10",
        className,
      )}
    >
      <ShaderBackground cursorReactive={cursorReactive} intensity={intensity} />

      {showContent ? (
        children ?? <ForegroundContent />
      ) : (
        children
      )}
    </div>
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "children", type: "ReactNode", description: "Custom foreground content to display over the shader background.", defaultValue: "Built-in demo content" },
      { name: "showContent", type: "boolean", description: "Show the default built-in foreground content.", defaultValue: "true" },
      { name: "cursorReactive", type: "boolean", description: "Enable subtle cursor-reactive movement of background blobs.", defaultValue: "true" },
      { name: "intensity", type: "\"low\" | \"medium\" | \"high\"", description: "Control the intensity of cursor-reactive movement.", defaultValue: "\"medium\"" },
      { name: "className", type: "string | undefined", description: "Additional classes applied to the outer wrapper." },
    ],
  },
  {
    slug: "ask-nexus-input",
    name: "Ask Nexus Input",
    description: "A bold \"Ask anything\" headline paired with a pill-shaped search input. Placeholders rotate while idle, and on submit the text disintegrates right-to-left into drifting particles — a Thanos-snap dust effect rendered on canvas, finished off with framer-motion polish.",
    categorySlug: "ai-components",
    tags: ["ai", "input", "search", "disintegrate", "particles", "thanos", "snap", "canvas", "framer-motion", "placeholder"],
    premium: false,
    trendingScore: 260,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["spring"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewAskNexusInput,
    reactSource: `"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AskNexusInputProps {
  title?: string;
  placeholders?: string[];
  placeholderInterval?: number;
  defaultValue?: string;
  onSubmit?: (value: string) => void;
  className?: string;
}

type Phase = "idle" | "disintegrating";

const INPUT_FONT_PX = 14;
const PARTICLE_RGB = "17,24,39";

const DEFAULT_PLACEHOLDERS = [
  "Who is Tyler Durden?",
  "Explain quantum entanglement like I'm five",
  "Write a haiku about the ocean at midnight",
  "What's the best stack for a 2026 startup?",
  "How do I become a 10x designer?",
];

export function AskNexusInput({
  title = "Ask Nexus UI Anything",
  placeholders = DEFAULT_PLACEHOLDERS,
  placeholderInterval = 2800,
  defaultValue = "",
  onSubmit,
  className,
}: AskNexusInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [phase, setPhase] = useState<Phase>("idle");
  const [snapshot, setSnapshot] = useState("");
  const [phIndex, setPhIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const activePlaceholder = placeholders[phIndex] ?? "";

  useEffect(() => {
    if (phase !== "idle" || value || placeholders.length <= 1) return;
    const id = setInterval(
      () => setPhIndex((i) => (i + 1) % placeholders.length),
      placeholderInterval,
    );
    return () => clearInterval(id);
  }, [phase, value, placeholders.length, placeholderInterval]);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (phase !== "idle") return;
    const submitted = value.trim() || activePlaceholder.trim();
    if (!submitted) return;
    onSubmit?.(submitted);
    setSnapshot(submitted);
    setPhase("disintegrating");
  };

  const handleComplete = useCallback(() => {
    setSnapshot("");
    setValue("");
    setPhase("idle");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const showPlaceholder = phase === "idle" && !value;

  return (
    <div className={cn("flex w-full flex-col items-center gap-10 py-12", className)}>
      <motion.h1
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl md:text-5xl"
      >
        {title}
      </motion.h1>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="w-full max-w-xl"
      >
        <motion.div
          animate={phase === "disintegrating" ? { scale: [1, 0.985, 1] } : { scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-within:border-gray-300"
        >
          <div className="relative h-6 flex-1">
            <div className="absolute inset-0 overflow-hidden">
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={phase !== "idle"}
                spellCheck={false}
                className={cn(
                  "absolute inset-0 w-full bg-transparent text-sm text-gray-900 outline-none transition-opacity duration-300",
                  phase === "disintegrating" && "opacity-0",
                )}
              />
              <AnimatePresence mode="wait">
                {showPlaceholder && (
                  <motion.span
                    key={phIndex}
                    initial={{ y: 10, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -10, opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 truncate text-sm text-gray-400"
                  >
                    {activePlaceholder}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            {phase === "disintegrating" && (
              <DisintegratingText text={snapshot} onComplete={handleComplete} />
            )}
          </div>

          <motion.button
            type="submit"
            aria-label="Ask"
            disabled={phase !== "idle"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 disabled:opacity-60"
          >
            <ArrowRight className="size-4" strokeWidth={2.25} />
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
}

type Particle = {
  ox: number; oy: number;
  vx: number; vy: number;
  delay: number; life: number; size: number;
};

const RIGHT_OVERHANG_PX = 90;
const CHAR_STEP_MS = 50;
const CHAR_JITTER_MS = 22;

function DisintegratingText({ text, onComplete }: { text: string; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const baseW = Math.max(parent.clientWidth, 1);
    const H = Math.max(parent.clientHeight, 1);
    const W = baseW + RIGHT_OVERHANG_PX;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = \`\${W}px\`;
    canvas.style.height = \`\${H}px\`;
    ctx.scale(dpr, dpr);

    ctx.font = \`\${INPUT_FONT_PX}px ui-sans-serif, system-ui, -apple-system, sans-serif\`;
    ctx.fillStyle = \`rgb(\${PARTICLE_RGB})\`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(text, 0, H / 2);

    // Map x-ranges to character indexes so the wave can snap one character at a time.
    const chars = Array.from(text);
    const charBounds: { start: number; end: number }[] = [];
    let cursor = 0;
    for (const ch of chars) {
      const w = ctx.measureText(ch).width;
      charBounds.push({ start: cursor, end: cursor + w });
      cursor += w;
    }
    const totalChars = chars.length;
    const charDelay = (charIdx: number) => {
      const fromRight = totalChars - 1 - charIdx;
      return fromRight * CHAR_STEP_MS + Math.random() * CHAR_JITTER_MS;
    };
    const findCharIdx = (lx: number) => {
      let lo = 0, hi = charBounds.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const b = charBounds[mid];
        if (lx < b.start) hi = mid - 1;
        else if (lx >= b.end) lo = mid + 1;
        else return mid;
      }
      return Math.min(Math.max(lo, 0), charBounds.length - 1);
    };

    const sampleW = baseW * dpr;
    const img = ctx.getImageData(0, 0, sampleW, H * dpr);
    const particles: Particle[] = [];
    const stride = dpr;

    for (let y = 0; y < H * dpr; y += stride) {
      for (let x = 0; x < sampleW; x += stride) {
        const i = (y * sampleW + x) * 4;
        if (img.data[i + 3] > 110) {
          const lx = x / dpr;
          const ly = y / dpr;
          const charIdx = findCharIdx(lx);

          const angle = (Math.random() - 0.5) * Math.PI * 0.6;
          const speed = 0.18 + Math.random() * 0.55;
          const vx = Math.cos(angle) * speed + 0.12;
          const vy = Math.sin(angle) * speed * 0.55;

          const sizeRoll = Math.random();
          const size = sizeRoll < 0.65 ? 1 : sizeRoll < 0.92 ? 1.4 : 1.8;

          particles.push({
            ox: lx, oy: ly,
            vx, vy,
            delay: charDelay(charIdx),
            life: 480 + Math.random() * 320,
            size,
          });
        }
      }
    }
    ctx.clearRect(0, 0, W, H);

    let rafId = 0;
    let start = 0;
    let cancelled = false;

    const frame = (now: number) => {
      if (cancelled) return;
      if (!start) start = now;
      const elapsed = now - start;
      ctx.clearRect(0, 0, W, H);
      let aliveCount = 0;

      for (const p of particles) {
        if (elapsed < p.delay) {
          const ttd = p.delay - elapsed;
          if (ttd < 80) {
            const tension = 1 - ttd / 80;
            const jx = (Math.random() - 0.5) * 0.5 * tension;
            const jy = (Math.random() - 0.5) * 0.5 * tension;
            ctx.fillStyle = \`rgb(\${PARTICLE_RGB})\`;
            ctx.fillRect(p.ox + jx, p.oy + jy, p.size, p.size);
          } else {
            ctx.fillStyle = \`rgb(\${PARTICLE_RGB})\`;
            ctx.fillRect(p.ox, p.oy, p.size, p.size);
          }
          aliveCount++;
          continue;
        }
        const t = elapsed - p.delay;
        if (t > p.life) continue;
        aliveCount++;

        const norm = t / p.life;
        const motionT = t / 16;
        const wobble = Math.sin((p.ox + motionT) * 0.22) * 0.4;
        const x = p.ox + p.vx * motionT + wobble * norm;
        const y = p.oy + p.vy * motionT;
        const opacity = Math.cos((norm * Math.PI) / 2);
        ctx.fillStyle = \`rgba(\${PARTICLE_RGB},\${opacity.toFixed(3)})\`;
        ctx.fillRect(x, y, p.size, p.size);
      }

      if (aliveCount === 0) {
        onCompleteRef.current();
        return;
      }
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => { cancelled = true; cancelAnimationFrame(rafId); };
  }, [text]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute left-0 top-0" aria-hidden />;
}

// Usage
export default function Demo() {
  return (
    <div className="flex min-h-[480px] w-full items-center justify-center bg-white px-8">
      <AskNexusInput />
    </div>
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "title", type: "string", description: "Main headline shown above the input", defaultValue: '"Ask Nexus UI Anything"' },
      { name: "placeholders", type: "string[]", description: "Rotating placeholder suggestions shown while the input is empty and idle", defaultValue: "5 built-in prompts" },
      { name: "placeholderInterval", type: "number", description: "Milliseconds between placeholder rotations", defaultValue: "2800" },
      { name: "defaultValue", type: "string", description: "Initial value of the input", defaultValue: '""' },
      { name: "onSubmit", type: "(value: string) => void", description: "Fired with the trimmed query (or the current placeholder if the input is empty) the instant the user submits — runs before the disintegration animation starts" },
      { name: "className", type: "string | undefined", description: "Additional classes applied to the outer wrapper" },
    ],
  },
  {
    slug: "interactive-globe-explorer",
    name: "Interactive Globe Explorer",
    description:
      "Scrollable office/location explorer with a live React Globe, synchronized city list, clickable map pins, responsive details popover, and one-click address/email copy actions.",
    categorySlug: "three-d-components",
    tags: [
      "globe",
      "map",
      "3d",
      "location",
      "scroll",
      "interactive",
      "copy",
      "tooltip",
      "webgl",
    ],
    premium: false,
    trendingScore: 225,
    createdAt: "2026-05-20T00:00:00.000Z",
    animationKinds: ["3d", "scroll", "hover"],
    dependencies: ["react-globe.gl", "three", "lucide-react"],
    Preview: Previews.PreviewInteractiveGlobeExplorer,
    previewShell: "plain",
    registryCliName: "interactive-globe-explorer",
    reactSource: `"use client";

import { InteractiveGlobeExplorer } from "@/components/interactive-globe-explorer";

export function InteractiveGlobeExplorerDemo() {
  return (
    <InteractiveGlobeExplorer className="h-[680px]" />
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "locations", type: "GlobeLocation[]", description: "Locations with id, name, lat, lng, address, and email. Defaults to 20 global office locations." },
      { name: "initialLocationId", type: "string", description: "Optional id of the city focused when the globe initializes.", defaultValue: "\"4\" (London)" },
      { name: "globeTextureUrl", type: "string", description: "Path to the globe texture image used by react-globe.gl.", defaultValue: "\"/images/earth-blue-marble.jpg\"" },
      { name: "className", type: "string", description: "Extra classes on the rounded component shell." },
    ],
  },
  {
    slug: "code-block",
    name: "Code Block",
    description: "A syntax-highlighted code block with header, line numbers, copy button, and fade gradient. Supports dark/light themes and multiple languages.",
    categorySlug: "feature-sections",
    tags: ["code", "syntax", "highlight", "copy", "snippet", "dark", "light"],
    premium: false,
    trendingScore: 0,
    createdAt: "2026-05-17T00:00:00.000Z",
    animationKinds: ["hover"] as const,
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCodeBlock,
    tailwindSource: tw,
    previewSections: [
      {
        Preview: Previews.PreviewCodeBlockDefault,
        reactSource: `"use client";

import { CodeBlock } from "@/components/code-block/code-block";

const code = \`import React, { useState } from 'react';

export default function PricingCard() {
  const [isYearly, setIsYearly] = useState(false);
  return <div>...</div>;
}\`;

export function CodeBlockDefault() {
  return (
    <div style={{ height: 420 }}>
      <CodeBlock code={code} language="jsx" theme="dark" className="w-full h-full" />
    </div>
  );
}`,
      },
      {
        Preview: Previews.PreviewCodeBlockLight,
        reactSource: `"use client";

import { CodeBlock } from "@/components/code-block/code-block";

const code = \`const x = 42;\`;

export function CodeBlockLight() {
  return (
    <div style={{ height: 420 }}>
      <CodeBlock code={code} language="ts" theme="light" className="w-full h-full" />
    </div>
  );
}`,
      },
      {
        Preview: Previews.PreviewCodeBlockJson,
        reactSource: `"use client";

import { CodeBlock } from "@/components/code-block/code-block";

const json = \`{ "name": "nexus-labs", "version": "1.0.0" }\`;

export function CodeBlockJson() {
  return (
    <div style={{ height: 420 }}>
      <CodeBlock code={json} language="json" theme="dark" className="w-full h-full" />
    </div>
  );
}`,
      },
    ],
    reactSource: `"use client";

import { CodeBlock } from "@/components/code-block/code-block";

const code = \`import React from 'react';

export default function App() {
  return <h1>Hello, world!</h1>;
}\`;

export function CodeBlockExample() {
  return (
    <div style={{ height: 420 }}>
      <CodeBlock
        code={code}
        language="jsx"
        theme="dark"
        className="w-full h-full"
      />
    </div>
  );
}`,
    props: [
      { name: "code", type: "string", description: "The code string to display.", defaultValue: "DEFAULT_CODE (PricingCard example)" },
      { name: "language", type: "CodeLanguage", description: "Syntax language for tokenization.", defaultValue: "\"jsx\"" },
      { name: "theme", type: "\"dark\" | \"light\" | \"custom\"", description: "Color theme preset.", defaultValue: "\"dark\"" },
      { name: "header", type: "HeaderProps", description: "Header bar configuration: show/hide, window dots, title, copy button.", defaultValue: "{ enabled: true, showDots: true, title: \"Example\", ... }" },
      { name: "codeArea", type: "CodeAreaProps", description: "Code area: line numbers, wrap, padding, background, text color.", defaultValue: "{ showLineNumbers: true, wrap: true, padding: 16, ... }" },
      { name: "border", type: "BorderProps", description: "Border: color, width, border-radius.", defaultValue: "{ color: \"#1A1A1A\", width: 1, radius: \"12px\" }" },
      { name: "className", type: "string | undefined", description: "CSS classes on the container." },
      { name: "style", type: "React.CSSProperties | undefined", description: "Inline styles on the container." },
    ],
  },
  {
    slug: "card-stack-rotator",
    name: "Card Stack Rotator",
    description: "A polished stacked card carousel with smooth spring animations, auto-rotation, and inline **highlight** text support.",
    categorySlug: "testimonials",
    tags: ["testimonials", "carousel", "cards", "motion", "stack"],
    premium: false,
    trendingScore: 0,
    createdAt: "2026-05-17",
    animationKinds: ["spring", "layout"] as const,
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewCardStackRotator,
    tailwindSource: `"use client";

import { CardStackRotator } from "@/components/card-stack-rotator/card-stack-rotator";

export function CardStackRotatorDemo() {
  const cards = [
    { id: "1", content: "This product is **absolutely incredible** for our team.", name: "Sarah Chen", designation: "Head of Design", company: "Vercel", initials: "SC" },
    { id: "2", content: "The **developer experience** is unmatched.", name: "Marcus Rodriguez", designation: "Senior Engineer", company: "Linear", initials: "MR" },
    { id: "3", content: "Component quality is **genuinely impressive**.", name: "Aisha Patel", designation: "Design Systems Lead", company: "Stripe", initials: "AP" },
  ];
  return (
    <div className="flex items-center justify-center p-8">
      <CardStackRotator cards={cards} rotationInterval={3000} maxVisible={3} stackOffset={14} scaleStep={0.04} cardWidth="420px" cardHeight="260px" cardBackground="#111113" cardBorderColor="rgba(255,255,255,0.07)" textColor="#fafafa" mutedColor="rgba(250,250,250,0.45)" highlightBackground="rgba(129,140,248,0.15)" highlightTextColor="#a5b4fc" borderRadius="16px" shadowIntensity={0.55} pauseOnHover />
    </div>
  );
}`
    ,
    props: [
      { name: "cards", type: "CardData[]", description: "Array of card objects to display." },
      { name: "rotationInterval", type: "number", description: "Time between rotations in ms.", defaultValue: "3000" },
      { name: "maxVisible", type: "number", description: "Maximum number of visible cards in the stack.", defaultValue: "4" },
      { name: "stackOffset", type: "number", description: "Vertical offset per card in px.", defaultValue: "16" },
      { name: "scaleStep", type: "number", description: "Scale reduction per card.", defaultValue: "0.04" },
      { name: "cardWidth", type: "string", description: "CSS width of each card.", defaultValue: "\"420px\"" },
      { name: "cardHeight", type: "string", description: "CSS height of each card.", defaultValue: "\"auto\"" },
      { name: "cardBackground", type: "string", description: "Card background color.", defaultValue: "\"#0f0f0f\"" },
      { name: "cardBorderColor", type: "string", description: "Card border color.", defaultValue: "\"rgba(255,255,255,0.08)\"" },
      { name: "textColor", type: "string", description: "Primary text color.", defaultValue: "\"#fafafa\"" },
      { name: "mutedColor", type: "string", description: "Muted/secondary text color.", defaultValue: "\"rgba(250,250,250,0.5)\"" },
      { name: "highlightTextColor", type: "string", description: "Text color for **bold** highlights.", defaultValue: "\"#a5b4fc\"" },
      { name: "contentFontSize", type: "string", description: "Font size of card content.", defaultValue: "\"15px\"" },
      { name: "nameFontSize", type: "string", description: "Font size of card author name.", defaultValue: "\"15px\"" },
      { name: "designationFontSize", type: "string", description: "Font size of author role.", defaultValue: "\"12px\"" },
      { name: "borderRadius", type: "string", description: "Card border radius.", defaultValue: "\"16px\"" },
      { name: "shadowIntensity", type: "number", description: "Shadow intensity 0–1.", defaultValue: "0.5" },
      { name: "pauseOnHover", type: "boolean", description: "Pause rotation on mouse hover.", defaultValue: "true" },
      { name: "direction", type: "\"forward\" | \"backward\"", description: "Rotation direction.", defaultValue: "\"forward\"" },
    ],
  },
  {
    slug: "scroll-reveal-text",
    name: "Scroll Reveal Text",
    description:
      "Scroll-linked text reveal where words, characters, or lines emerge from muted gray to bright white with optional blur dissolve and staggered cascade.",
    categorySlug: "motion-effects",
    tags: ["scroll", "text", "reveal", "animation", "typography", "blur", "framer-motion", "storytelling"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-05-18",
    animationKinds: ["scroll"],
    dependencies: ["framer-motion"],
    previewShell: "plain",
    Preview: Previews.PreviewScrollRevealText,
    reactSource: `"use client";

import ScrollRevealText from "@/components/blocks/scroll-reveal-text";

/* Word reveal — hero heading */
export function WordRevealDemo() {
  return (
    <section className="min-h-[60vh] flex items-center px-8 py-24 bg-zinc-950">
      <ScrollRevealText
        text="We design tools that engineers actually want to use every single day."
        mode="word"
        stagger={0.7}
        blurAmount={8}
        fontSize="clamp(2rem, 5vw, 4.5rem)"
        align="left"
      />
    </section>
  );
}

/* Character reveal — punchy short line */
export function CharRevealDemo() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-8 py-24 bg-zinc-950">
      <ScrollRevealText
        text="Ship faster."
        mode="character"
        stagger={0.85}
        blurAmount={10}
        mutedColor="#27272a"
        activeColor="#ffffff"
        fontSize="clamp(3.5rem, 9vw, 8rem)"
        align="center"
      />
    </section>
  );
}

/* Line reveal — multi-line manifesto */
export function LineRevealDemo() {
  return (
    <section className="min-h-[80vh] flex items-center px-8 py-24 bg-zinc-950">
      <ScrollRevealText
        text={"Built for speed.\\nDesigned to last.\\nShips on Friday."}
        mode="line"
        stagger={1}
        blurAmount={4}
        startOffset={0.1}
        endOffset={0.8}
        fontSize="clamp(2.5rem, 6vw, 5.5rem)"
        align="left"
      />
    </section>
  );
}`,
    tailwindSource: tw,
    props: [
      { name: "text", type: "string", description: "The text to reveal. Use \\n as line separators in line mode." },
      { name: "mode", type: '"word" | "character" | "line"', defaultValue: '"word"', description: "Granularity of the reveal unit." },
      { name: "mutedColor", type: "string", defaultValue: '"#52525b"', description: "Color of unrevealed units (start state)." },
      { name: "activeColor", type: "string", defaultValue: '"#fafafa"', description: "Color of fully revealed units (end state)." },
      { name: "startOffset", type: "number", defaultValue: "0.05", description: "Scroll progress (0–1) when the reveal begins." },
      { name: "endOffset", type: "number", defaultValue: "0.75", description: "Scroll progress (0–1) when the reveal finishes." },
      { name: "blurAmount", type: "number", defaultValue: "6", description: "Starting blur in px. Set 0 to disable blur dissolve." },
      { name: "stagger", type: "number", defaultValue: "0.65", description: "0 = all units reveal simultaneously · 1 = fully sequential cascade." },
      { name: "fontSize", type: "string", defaultValue: '"clamp(1.75rem, 4.5vw, 3.75rem)"', description: "CSS font-size (supports clamp)." },
      { name: "align", type: '"left" | "center" | "right"', defaultValue: '"left"', description: "Text alignment." },
      { name: "className", type: "string", description: "Additional classes merged onto the root element." },
    ],
  },
  {
    slug: "animated-countdown",
    name: "Animated Countdown",
    description: "Flip-style countdown timer with four variants — modern, digital, minimal, and classic. Smooth number transitions powered by Framer Motion. Also includes the Motion Kit Split-Flap Board variant.",
    categorySlug: "motion-effects",
    tags: ["motion kit", "countdown", "timer", "flip", "launch", "framer-motion"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-04-10",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewAnimatedCountdown,
    props: [
      { name: "SplitFlapBoard.to", type: "Date | number", defaultValue: "mount + 2d 14:37:09", description: "Moment to count down to, as a Date or epoch milliseconds." },
      { name: "SplitFlapBoard.label", type: "string", defaultValue: "\"Launch \u00b7 MK 4.0\"", description: "Heading in the top-left corner." },
      { name: "SplitFlapBoard.liveLabel", type: "string", defaultValue: "\"Live\"", description: "Text next to the pulsing dot in the top-right corner." },
      { name: "SplitFlapBoard.statusLabel", type: "string", defaultValue: "\"Status\"", description: "Caption above the status row." },
      { name: "SplitFlapBoard.statuses", type: "string[]", defaultValue: "[\"BOARDING\", \"ON TIME\", \"GATE B12\", \"FINAL CALL\"]", description: "Status lines; the first is shown and autoplay rotates through them. Up to 10 characters fit." },
      { name: "SplitFlapBoard.status", type: "string", description: "Shows this status instead of the statuses list (controlled)." },
      { name: "SplitFlapBoard.onComplete", type: "() => void", description: "Called once when the countdown reaches zero." },
      { name: "SplitFlapBoard.autoplay", type: "boolean", defaultValue: "false", description: "Rotates the status line every 4.2s until someone presses the board. The countdown always runs." },
      { name: "SplitFlapBoard.className", type: "string", description: "Extra classes for the board." },
    ],
    previewSections: [
      {
        title: "Animated Countdown",
        Preview: Previews.PreviewAnimatedCountdown,
        reactSource: `"use client";

import { AnimatedCountdown } from "@/components/animated-countdown";

export function LaunchCountdown() {
  return (
    <AnimatedCountdown
      targetDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
      variant="modern"
      size="md"
    />
  );
}`,
      },
      {
        title: "Split-Flap Board",
        Preview: Previews.PreviewSplitFlapBoard,
        reactSource: `"use client";

import { SplitFlapBoard } from "@/components/animated-countdown";

const LAUNCH = new Date("2026-12-01T17:00:00Z");

export function LaunchBoard() {
  return (
    <SplitFlapBoard
      to={LAUNCH}
      label="Launch · v2.0"
      statuses={["ON TIME", "GATE OPEN", "FINAL CALL"]}
      autoplay
      onComplete={() => console.log("we have lift-off")}
    />
  );
}`,
      },
    ],
    detailPreviews: [
      Previews.PreviewAnimatedCountdownModern,
      Previews.PreviewAnimatedCountdownDigital,
      Previews.PreviewAnimatedCountdownMinimal,
    ],
    reactSource: `"use client";

import { AnimatedCountdown } from "@/components/animated-countdown";

export function LaunchCountdown() {
  return (
    <AnimatedCountdown
      targetDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
      variant="modern"
      size="md"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "shooting-stars-grid",
    name: "Shooting Stars Grid",
    description: "Animated dot grid with diagonal shooting star streaks and glowing nodes. A dramatic yet subtle background for hero sections and feature blocks.",
    categorySlug: "background-effects",
    tags: ["grid", "stars", "background", "hero", "ambient", "framer-motion"],
    premium: false,
    trendingScore: 85,
    createdAt: "2026-04-05",
    animationKinds: ["gradient", "scroll"],
    dependencies: ["framer-motion", "lucide-react"],
    Preview: Previews.PreviewShootingStarsGrid,
    detailPreviews: [Previews.PreviewShootingStarsGridHero],
    reactSource: `"use client";

import { ShootingStarsGrid } from "@/components/shooting-stars-grid";

export function HeroSection() {
  return (
    <ShootingStarsGrid
      starCount={54}
      shootingStarCount={7}
      className="min-h-[560px] rounded-3xl"
    >
      <h1 className="text-4xl font-semibold tracking-tight">
        Build interfaces that feel alive
      </h1>
    </ShootingStarsGrid>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "hover-highlight-text",
    name: "Hover Highlight Text",
    description: "Cursor-tracked SVG spotlight that reveals outlined text beneath a base layer. Smooth spring physics follow the mouse for a cinematic hover effect.",
    categorySlug: "motion-effects",
    tags: ["hover", "text", "spotlight", "cursor", "svg", "spring", "framer-motion"],
    premium: false,
    trendingScore: 90,
    createdAt: "2026-04-18",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewHoverHighlightText,
    detailPreviews: [Previews.PreviewHoverHighlightTextHero, Previews.PreviewHoverHighlightTextBanner],
    reactSource: `"use client";

import { HoverHighlightText } from "@/components/hover-highlight-text";

export function Hero() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6">
      <HoverHighlightText
        text="Build beautiful interfaces that users remember."
        as="h1"
        spotlightRadius={130}
        baseClassName="max-w-5xl text-6xl font-semibold leading-tight text-white/15"
        highlightClassName="max-w-5xl text-6xl font-semibold leading-tight text-transparent"
        strokeColor="rgba(255,255,255,0.72)"
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "motion-layer-scroller",
    name: "Motion Layer Scroller",
    description: "Scroll-driven parallax depth engine — each layer moves at an independent speed and axis as the user scrolls. Compose scenes with overlapping planes.",
    categorySlug: "motion-effects",
    tags: ["parallax", "scroll", "depth", "layers", "framer-motion"],
    premium: false,
    trendingScore: 83,
    createdAt: "2026-03-28",
    animationKinds: ["scroll", "parallax"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewMotionLayerScroller,
    reactSource: `"use client";

import { MotionLayerScroller } from "@/components/motion-layer-scroller";

function BackgroundLayer() {
  return <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#1e3a8a,transparent_60%)]" />;
}

function MidLayer() {
  return <div className="absolute left-1/4 top-1/3 size-40 rounded-full bg-sky-400/30 blur-2xl" />;
}

function ForegroundLayer() {
  return (
    <div className="absolute inset-x-0 bottom-10 text-center text-2xl font-semibold text-white">
      Depth on scroll
    </div>
  );
}

export function ParallaxScene() {
  return (
    <MotionLayerScroller
      scrollHeight={600}
      layers={[
        { id: "bg", yRange: [0, -60], content: <BackgroundLayer /> },
        { id: "mid", yRange: [0, -30], content: <MidLayer /> },
        { id: "fg", yRange: [0, 20], content: <ForegroundLayer /> },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "animated-bento-grid",
    name: "Animated Bento Grid",
    description: "Feature showcase bento grid with entrance animations and configurable column spans. Each tile supports custom content, tags, and motion entrance delays.",
    categorySlug: "bento-grids",
    tags: ["bento", "grid", "features", "showcase", "framer-motion", "layout"],
    premium: false,
    trendingScore: 94,
    createdAt: "2026-04-20",
    animationKinds: ["scroll", "spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewAnimatedBentoGrid,
    reactSource: `"use client";

import { AnimatedBentoGrid } from "@/components/animated-bento-grid";

const items = [
  { id: "1", title: "Ship faster", description: "Production components, zero setup.", tag: "DX", span: "2x1" },
  { id: "2", title: "Motion-native", description: "Framer Motion built in.", tag: "Anim", span: "1x1" },
];

export function FeatureGrid() {
  return <AnimatedBentoGrid items={items} columns={3} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "bento-grid-skeleton",
    name: "Bento Grid Skeleton",
    description: "Bento grid with animated skeleton placeholder tiles — chat, dashboard, avatar, workflow, calendar, and code variants. Perfect for loading states.",
    categorySlug: "bento-grids",
    tags: ["bento", "skeleton", "loading", "placeholder", "framer-motion"],
    premium: false,
    trendingScore: 80,
    createdAt: "2026-03-15",
    animationKinds: ["layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewBentoGridSkeleton,
    reactSource: `"use client";

import { BentoGridSkeleton, type BentoSkeletonCard } from "@/components/bento-grid-skeleton";

const cards: BentoSkeletonCard[] = [
  {
    id: "1",
    title: "Chat activity",
    description: "Live conversations streaming in while the data loads.",
    tag: "Live",
    span: "2x1",
    skeletonType: "chat",
  },
  {
    id: "2",
    title: "Dashboard",
    description: "Stats and charts sketched in before the numbers arrive.",
    tag: "Stats",
    span: "1x1",
    skeletonType: "dashboard",
  },
];

export function SkeletonGrid() {
  return <BentoGridSkeleton cards={cards} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "scrolling-testimonials",
    name: "Scrolling Testimonials",
    description: "Infinite vertical scroll testimonial wall with multi-column layout, independent column speeds, reverse direction support, gradient fade masks, and avatar initials fallback.",
    categorySlug: "testimonials",
    tags: ["testimonials", "social proof", "marquee", "infinite scroll", "vertical", "cards", "reviews"],
    premium: false,
    trendingScore: 96,
    createdAt: "2026-05-18",
    animationKinds: ["scroll"],
    dependencies: [],
    Preview: Previews.PreviewScrollingTestimonials,
    reactSource: `"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
};

export interface ScrollingTestimonialsProps {
  testimonials: Testimonial[];
  columns?: 1 | 2 | 3;
  speed?: number;
  columnSpeeds?: number[];
  reverseColumns?: boolean[];
  pauseOnHover?: boolean;
  showHeader?: boolean;
  badge?: string;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  cardBackground?: string;
  borderColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  avatarSize?: number;
  showStars?: boolean;
  fadeMask?: boolean;
  className?: string;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function nameInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0] ?? "").join("").toUpperCase();
}

function nameHue(name: string): number {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="size-3.5" viewBox="0 0 16 16" aria-hidden>
          <path
            d="M8 1.5 9.8 5.2l4.1.6-2.96 2.88.7 4.07L8 10.68l-3.64 1.07.7-4.07L2.1 5.8l4.1-.6z"
            fill={i < rating ? "#f59e0b" : "none"}
            stroke={i < rating ? "#f59e0b" : "rgba(148,163,184,0.35)"}
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

function AvatarEl({ src, name, size }: { src?: string; name: string; size: number }) {
  if (src) {
    return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }
  const hue = nameHue(name);
  return (
    <div aria-hidden style={{ width: size, height: size, borderRadius: "50%", background: \`oklch(0.46 0.13 \${hue})\`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.36), fontWeight: 600, color: "#fff", flexShrink: 0, letterSpacing: "-0.02em", userSelect: "none" }}>
      {nameInitials(name)}
    </div>
  );
}

function TestimonialCard({ item, cardBackground, borderColor, textColor, mutedTextColor, avatarSize, showStars }: { item: Testimonial; cardBackground?: string; borderColor?: string; textColor?: string; mutedTextColor?: string; avatarSize: number; showStars: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl p-4 sm:p-5" style={{ background: cardBackground ?? "var(--card, rgba(255,255,255,0.04))", border: \`1px solid \${borderColor ?? "rgba(255,255,255,0.08)"}\`, boxShadow: "0 1px 10px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.03) inset" }}>
      {showStars && typeof item.rating === "number" && <StarRating rating={item.rating} />}
      <p className="text-sm leading-relaxed sm:text-[15px]" style={{ color: textColor ?? "var(--foreground)" }}>
        &ldquo;{item.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-0.5">
        <AvatarEl src={item.avatar} name={item.name} size={avatarSize} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-snug" style={{ color: textColor ?? "var(--foreground)" }}>{item.name}</p>
          <p className="truncate text-xs leading-snug" style={{ color: mutedTextColor ?? "var(--muted-foreground, rgba(255,255,255,0.45))" }}>{item.role}{item.company ? \` · \${item.company}\` : ""}</p>
        </div>
      </div>
    </div>
  );
}

function ScrollColumn({ items, duration, reverse, pauseOnHover, cardBackground, borderColor, textColor, mutedTextColor, avatarSize, showStars }: { items: Testimonial[]; duration: number; reverse: boolean; pauseOnHover: boolean; cardBackground?: string; borderColor?: string; textColor?: string; mutedTextColor?: string; avatarSize: number; showStars: boolean }) {
  const [hovered, setHovered] = React.useState(false);
  const reduced = usePrefersReducedMotion();
  const doubled = React.useMemo(() => [...items, ...items], [items]);
  return (
    <div className="h-full overflow-hidden" onMouseEnter={() => pauseOnHover && setHovered(true)} onMouseLeave={() => pauseOnHover && setHovered(false)}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: reduced ? "none" : \`\${reverse ? "nexus-st-rev" : "nexus-st-fwd"} \${duration}ms linear infinite\`, animationPlayState: hovered ? "paused" : "running", willChange: "transform" }}>
        {doubled.map((item, i) => (
          <TestimonialCard key={\`\${item.id}-\${i}\`} item={item} cardBackground={cardBackground} borderColor={borderColor} textColor={textColor} mutedTextColor={mutedTextColor} avatarSize={avatarSize} showStars={showStars} />
        ))}
      </div>
    </div>
  );
}

export function ScrollingTestimonials({ testimonials, columns = 3, speed = 35000, columnSpeeds, reverseColumns = [], pauseOnHover = true, showHeader = true, badge = "Testimonials", title = "Loved by teams worldwide", subtitle = "Join thousands of teams shipping beautiful products faster.", backgroundColor, cardBackground, borderColor, textColor, mutedTextColor, avatarSize = 40, showStars = true, fadeMask = true, className }: ScrollingTestimonialsProps) {
  const cols = React.useMemo<Testimonial[][]>(() => {
    const buckets: Testimonial[][] = Array.from({ length: columns }, () => []);
    testimonials.forEach((t, i) => buckets[i % columns].push(t));
    return buckets;
  }, [testimonials, columns]);
  const bg = backgroundColor ?? "var(--background)";
  return (
    <>
      <style>{\`@keyframes nexus-st-fwd { from { transform: translateY(0); } to { transform: translateY(-50%); } } @keyframes nexus-st-rev { from { transform: translateY(-50%); } to { transform: translateY(0); } }\`}</style>
      <section className={cn("relative w-full overflow-hidden py-20", className)} style={{ background: bg }}>
        {showHeader && (
          <div className="relative z-10 mx-auto mb-14 max-w-2xl px-4 text-center">
            {badge && <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary">{badge}</span>}
            {title && <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: textColor }}>{title}</h2>}
            {subtitle && <p className="mt-4 text-balance text-base leading-relaxed" style={{ color: mutedTextColor ?? "var(--muted-foreground)" }}>{subtitle}</p>}
          </div>
        )}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {fadeMask && (
            <>
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28" style={{ background: \`linear-gradient(to bottom, \${bg} 0%, transparent 100%)\` }} />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28" style={{ background: \`linear-gradient(to top, \${bg} 0%, transparent 100%)\` }} />
            </>
          )}
          <div className={cn("grid gap-4 overflow-hidden", columns === 1 && "grid-cols-1", columns === 2 && "grid-cols-1 md:grid-cols-2", columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")} style={{ height: 680 }}>
            {cols.map((items, i) => (
              <div key={i} className={cn("h-full", i === 1 && "hidden md:block", i === 2 && "hidden lg:block")}>
                <ScrollColumn items={items} duration={columnSpeeds?.[i] ?? speed * (1 + i * 0.22)} reverse={reverseColumns[i] ?? false} pauseOnHover={pauseOnHover} cardBackground={cardBackground} borderColor={borderColor} textColor={textColor} mutedTextColor={mutedTextColor} avatarSize={avatarSize} showStars={showStars} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}`,
    tailwindSource: `"use client";

import { ScrollingTestimonials } from "@/components/scrolling-testimonials/scrolling-testimonials";

const TESTIMONIALS = [
  { id: "1", quote: "Shipped our entire landing page in a weekend. The animation quality is genuinely best-in-class.", name: "Sarah Chen", role: "Head of Design", company: "Vercel", rating: 5 },
  { id: "2", quote: "Finally a component library that respects the craft. Motion feels intentional, never gimmicky.", name: "Marcus Rodriguez", role: "Senior Engineer", company: "Linear", rating: 5 },
  { id: "3", quote: "Copy-paste components that actually look polished out of the box. Our conversion rate went up 18%.", name: "Aisha Patel", role: "Design Systems Lead", company: "Stripe", rating: 5 },
  { id: "4", quote: "The attention to detail in every component is remarkable. Accessibility is built in from the start.", name: "James Kim", role: "Engineering Manager", company: "Notion", rating: 5 },
  { id: "5", quote: "We replaced three different component libraries with Nexus UI. Cleaner code, better performance.", name: "Elena Vasquez", role: "CTO", company: "Raycast", rating: 5 },
  { id: "6", quote: "Dark mode, responsive, and animated right out of the box. This saved our team two weeks.", name: "David Park", role: "Founder", company: "Resend", rating: 5 },
  { id: "7", quote: "Our design-to-code handoff is basically gone now. Devs just grab components and ship.", name: "Priya Nair", role: "Product Designer", company: "Planetscale", rating: 5 },
  { id: "8", quote: "I've evaluated 12 UI libraries this year. This is the first one I actually wanted to use.", name: "Tom Hanley", role: "Frontend Lead", company: "Loom", rating: 5 },
  { id: "9", quote: "The Framer Motion integration is handled perfectly. No more wrestling with animation configs.", name: "Yuki Tanaka", role: "UI Engineer", company: "Figma", rating: 5 },
];

export function ScrollingTestimonialsDemo() {
  return (
    <ScrollingTestimonials
      testimonials={TESTIMONIALS}
      columns={3}
      speed={35000}
      reverseColumns={[false, true, false]}
      pauseOnHover
      badge="Social proof"
      title="Loved by teams worldwide"
      subtitle="Join thousands of teams shipping beautiful products faster."
      showStars
      fadeMask
    />
  );
}`,
    props: [
      { name: "testimonials", type: "Testimonial[]", description: "Array of testimonial objects to display." },
      { name: "columns", type: "1 | 2 | 3", description: "Number of columns (responsive — clamped by breakpoint).", defaultValue: "3" },
      { name: "speed", type: "number", description: "Base animation duration in ms for column 0.", defaultValue: "35000" },
      { name: "columnSpeeds", type: "number[]", description: "Per-column override durations. Overrides `speed` when provided." },
      { name: "reverseColumns", type: "boolean[]", description: "Per-column reverse direction flags.", defaultValue: "[]" },
      { name: "pauseOnHover", type: "boolean", description: "Pause a column's animation on hover.", defaultValue: "true" },
      { name: "showHeader", type: "boolean", description: "Render the badge / title / subtitle header.", defaultValue: "true" },
      { name: "badge", type: "string", description: "Small pill badge text above the heading.", defaultValue: "\"Testimonials\"" },
      { name: "title", type: "string", description: "Section heading.", defaultValue: "\"Loved by teams worldwide\"" },
      { name: "subtitle", type: "string", description: "Section subheading.", defaultValue: "\"Join thousands of teams...\"" },
      { name: "backgroundColor", type: "string", description: "Section background. Defaults to `var(--background)`." },
      { name: "cardBackground", type: "string", description: "Card background color." },
      { name: "borderColor", type: "string", description: "Card border color." },
      { name: "textColor", type: "string", description: "Primary text color." },
      { name: "mutedTextColor", type: "string", description: "Muted / secondary text color." },
      { name: "avatarSize", type: "number", description: "Avatar diameter in px.", defaultValue: "40" },
      { name: "showStars", type: "boolean", description: "Render star ratings when `rating` is set.", defaultValue: "true" },
      { name: "fadeMask", type: "boolean", description: "Show gradient top/bottom fade masks.", defaultValue: "true" },
      { name: "className", type: "string", description: "Extra className on the section wrapper." },
    ],
  },
  {
    slug: "spectra-frame",
    name: "Spectra Frame",
    description: "Zero-dependency interactive image grid — photos start in black & white and burst into full color on hover with adaptive scale. Built-in responsive columns, scoped CSS injection, and picsum placeholder defaults.",
    categorySlug: "cards",
    tags: ["gallery", "grid", "images", "grayscale", "hover", "color", "photo", "portfolio", "css-animation", "responsive"],
    premium: false,
    trendingScore: 102,
    createdAt: "2026-05-18",
    animationKinds: ["hover"],
    dependencies: [],
    Preview: Previews.PreviewSpectraFrame,
    reactSource: `"use client";

import * as React from "react";

export interface SpectraImage {
  src: string;
  alt: string;
}

export interface SpectraFrameProps {
  images?: SpectraImage[];
  imageCount?: number;
  gap?: number;
  columns?: number;
  aspectRatio?: string;
  transitionSpeed?: number;
  scaleAmount?: number;
  colorRevealTiming?: string;
  backgroundColor?: string;
  grayscaleIntensity?: number;
  borderRadius?: number;
  className?: string;
}

const PLACEHOLDERS: SpectraImage[] = Array.from({ length: 12 }, (_, i) => ({
  src: \`https://picsum.photos/seed/sf\${i + 1}/800/600\`,
  alt: \`Photo \${i + 1}\`,
}));

export function SpectraFrame({
  images             = PLACEHOLDERS,
  imageCount         = 12,
  gap                = 10,
  columns            = 4,
  aspectRatio        = "4/3",
  transitionSpeed    = 480,
  scaleAmount        = 1.08,
  colorRevealTiming  = "cubic-bezier(0.4, 0, 0.2, 1)",
  backgroundColor    = "#09090b",
  grayscaleIntensity = 100,
  borderRadius       = 14,
  className,
}: SpectraFrameProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const rawId = React.useId();
  const uid   = "sf" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  const items        = images.slice(0, imageCount);
  const isAnyHovered = hoveredIndex !== null;
  const imgTransition = [
    \`filter    \${transitionSpeed}ms \${colorRevealTiming}\`,
    \`transform \${transitionSpeed}ms \${colorRevealTiming}\`,
    \`opacity   \${Math.round(transitionSpeed * 0.7)}ms \${colorRevealTiming}\`,
  ].join(", ");

  return (
    <>
      <style>{\`
        #\${uid} { --sf-cols: \${columns}; box-sizing: border-box; width: 100%; background: \${backgroundColor}; padding: \${gap}px; }
        @media (max-width: 900px) { #\${uid} { --sf-cols: 3; } }
        @media (max-width: 600px) { #\${uid} { --sf-cols: 2; } }
        #\${uid} .sf-grid { display: grid; grid-template-columns: repeat(var(--sf-cols), 1fr); gap: \${gap}px; }
        #\${uid} .sf-cell { border-radius: \${borderRadius}px; overflow: hidden; aspect-ratio: \${aspectRatio}; cursor: pointer; position: relative; transform: translateZ(0); isolation: isolate; }
        #\${uid} .sf-cell img { width: 100%; height: 100%; display: block; object-fit: cover; transform-origin: center center; will-change: filter, transform, opacity; backface-visibility: hidden; }
      \`}</style>
      <div id={uid} className={className}>
        <div className="sf-grid">
          {items.map((img, index) => {
            const isActive = hoveredIndex === index;
            const isDimmed = isAnyHovered && !isActive;
            const grayPct    = isActive ? 0              : grayscaleIntensity;
            const brightness = isActive ? 1.06            : isDimmed ? 0.62 : 1;
            const scale      = isActive ? scaleAmount      : isDimmed ? 0.96 : 1;
            const opacity    = isActive ? 1                : isDimmed ? 0.72 : 1;
            return (
              <div key={index} className="sf-cell" onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                <img src={img.src} alt={img.alt} style={{ filter: \`grayscale(\${grayPct}%) brightness(\${brightness})\`, transform: \`scale(\${scale}) translateZ(0)\`, opacity, transition: imgTransition }} />
                <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius, boxShadow: "0 0 0 2px rgba(255,255,255,0.20) inset", opacity: isActive ? 1 : 0, transition: \`opacity \${Math.round(transitionSpeed * 0.5)}ms \${colorRevealTiming}\`, pointerEvents: "none" }} />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default SpectraFrame;`,
    tailwindSource: `import { SpectraFrame } from "@/components/spectra-frame/spectra-frame";

export function SpectraFrameDemo() {
  return (
    <SpectraFrame
      imageCount={12}
      columns={4}
      gap={10}
      aspectRatio="4/3"
      transitionSpeed={480}
      scaleAmount={1.08}
      backgroundColor="#09090b"
      grayscaleIntensity={100}
      borderRadius={14}
    />
  );
}`,
    props: [
      { name: "images", type: "SpectraImage[]", description: "Array of { src, alt } objects. Defaults to 12 picsum placeholders." },
      { name: "imageCount", type: "number", description: "Number of images to render (slices the array).", defaultValue: "12" },
      { name: "gap", type: "number", description: "Grid gap in px.", defaultValue: "10" },
      { name: "columns", type: "number", description: "Column count on desktop (≥901px). Auto-reduces to 3 on tablet, 2 on mobile.", defaultValue: "4" },
      { name: "aspectRatio", type: "string", description: "CSS aspect-ratio per cell.", defaultValue: "\"4/3\"" },
      { name: "transitionSpeed", type: "number", description: "Transition duration in ms.", defaultValue: "480" },
      { name: "scaleAmount", type: "number", description: "Scale multiplier on the hovered image.", defaultValue: "1.08" },
      { name: "colorRevealTiming", type: "string", description: "CSS easing for all transitions.", defaultValue: "\"cubic-bezier(0.4,0,0.2,1)\"" },
      { name: "backgroundColor", type: "string", description: "Grid background color.", defaultValue: "\"#09090b\"" },
      { name: "grayscaleIntensity", type: "number", description: "Grayscale % on idle images (0–100).", defaultValue: "100" },
      { name: "borderRadius", type: "number", description: "Cell corner radius in px.", defaultValue: "14" },
      { name: "className", type: "string", description: "Extra className on the root element." },
    ],
  },
  {
    slug: "profile-orbit",
    name: "Profile Orbit",
    description: "An interactive profile carousel where five floating avatars orbit a central card. Clicking any avatar, the nav arrows, or the keyboard cycles through people with a smooth fade + spring animation.",
    categorySlug: "cards",
    tags: ["profile", "carousel", "avatar", "orbit", "social", "team", "hover", "animation", "navigation"],
    premium: false,
    trendingScore: 108,
    createdAt: "2026-05-18",
    animationKinds: ["hover", "spring"],
    dependencies: [],
    Preview: Previews.PreviewProfileOrbit,
    reactSource: `"use client";

import * as React from "react";

export type ProfilePerson = { seed: number; name: string; role: string; email: string; };

export interface ProfileOrbitProps {
  people?: ProfilePerson[];
  autoRotateInterval?: number;
  className?: string;
}

const DEFAULT_PEOPLE: ProfilePerson[] = [
  { seed: 10, name: "Jordan Lee",   role: "Head of Product",  email: "jordan@example.com"  },
  { seed: 20, name: "Alex Chen",    role: "Lead Designer",    email: "alex@example.com"    },
  { seed: 30, name: "Maya Patel",   role: "Engineering Lead", email: "maya@example.com"    },
  { seed: 40, name: "Sam Rivera",   role: "Marketing Dir.",   email: "sam@example.com"     },
  { seed: 50, name: "Chris Morgan", role: "Head of Sales",    email: "chris@example.com"   },
];

const ORBIT: { top: string; left: string }[] = [
  { top: "17%", left: "50%" },
  { top: "40%", left: "71%" },
  { top: "77%", left: "68%" },
  { top: "77%", left: "32%" },
  { top: "40%", left: "29%" },
];

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function ArrowButton({ onClick, direction, ariaLabel }: { onClick: () => void; direction: "left" | "right"; ariaLabel: string }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button aria-label={ariaLabel} onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ width: 36, height: 36, borderRadius: "50%", background: hovered ? "#e0e0e0" : "#f0f0f0", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#111", transition: "background 0.2s ease", userSelect: "none" }}>
      {direction === "left" ? "←" : "→"}
    </button>
  );
}

function ConnectButton() {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ flex: 1, margin: "0 10px", background: hovered ? "#333" : "#111", color: "white", borderRadius: 100, padding: "10px 0", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", transition: "background 0.2s ease" }}>
      Connect
    </button>
  );
}

export function ProfileOrbit({ people = DEFAULT_PEOPLE, autoRotateInterval = 3000, className }: ProfileOrbitProps) {
  const [activeIndex, setActiveIndex]   = React.useState(0);
  const [displayIndex, setDisplayIndex] = React.useState(0);
  const cardInnerRef = React.useRef<HTMLDivElement>(null);
  const timerRef     = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef    = React.useRef(false);
  const count = people.length;

  React.useEffect(() => {
    const el = cardInnerRef.current;
    if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(6px)";
    const t = setTimeout(() => { setDisplayIndex(activeIndex); el.style.opacity = "1"; el.style.transform = "translateY(0)"; }, 200);
    return () => clearTimeout(t);
  }, [activeIndex]);

  React.useEffect(() => {
    timerRef.current = setInterval(() => { if (!pausedRef.current) setActiveIndex((i) => (i + 1) % count); }, autoRotateInterval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRotateInterval, count]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setActiveIndex((i) => (i - 1 + count) % count);
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  const pause  = () => { pausedRef.current = true;  };
  const resume = () => { pausedRef.current = false; };
  const prev   = () => setActiveIndex((i) => (i - 1 + count) % count);
  const next   = () => setActiveIndex((i) => (i + 1) % count);
  const person = people[displayIndex];

  return (
    <div className={className} style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#0a0e1a", backgroundImage: ["radial-gradient(ellipse 60% 50% at 70% 40%, rgba(100,40,180,0.5) 0%, transparent 70%)", "radial-gradient(ellipse 50% 60% at 20% 60%, rgba(20,80,160,0.4) 0%, transparent 70%)"].join(", ") }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

      {people.map((p, i) => {
        const isActive  = i === activeIndex;
        const slotIndex = (i - activeIndex + count) % count;
        const slot      = ORBIT[slotIndex];
        return (
          <button key={p.seed} aria-label={\`View \${p.name}\`} onClick={() => setActiveIndex(i)} onMouseEnter={pause} onMouseLeave={resume}
            style={{ position: "absolute", top: slot.top, left: slot.left, transform: "translate(-50%, -50%)", width: isActive ? 72 : 64, height: isActive ? 72 : 64, borderRadius: "50%", border: \`3px solid \${isActive ? "white" : "rgba(255,255,255,0.3)"}\`, boxShadow: isActive ? "0 0 0 4px rgba(255,255,255,0.15)" : "none", padding: 0, background: "none", cursor: "pointer", overflow: "hidden", zIndex: isActive ? 3 : 2, transition: \`top 0.55s \${SPRING}, left 0.55s \${SPRING}, width 0.4s ease, height 0.4s ease, box-shadow 0.4s ease, border 0.4s ease\` }}>
            <img src={\`https://picsum.photos/seed/\${p.seed}/300/300\`} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block", pointerEvents: "none" }} />
          </button>
        );
      })}

      <div onMouseEnter={pause} onMouseLeave={resume} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 48, zIndex: 4 }}>
        <div style={{ width: 280, background: "white", borderRadius: 20, padding: "0 24px 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div ref={cardInnerRef} style={{ transition: "opacity 0.25s ease, transform 0.25s ease" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img src={\`https://picsum.photos/seed/\${person.seed}/300/300\`} alt={person.name} style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid white", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", marginTop: -48, display: "block" }} />
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#111", marginTop: 12, textAlign: "center", lineHeight: 1.3, margin: "12px 0 0" }}>{person.name}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 6, fontSize: 13, color: "#666" }}><span aria-hidden>💼</span><span>{person.role}</span></div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4, fontSize: 13, color: "#666" }}><span aria-hidden>✉️</span><span>{person.email}</span></div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <ArrowButton onClick={prev} direction="left"  ariaLabel="Previous profile" />
              <ConnectButton />
              <ArrowButton onClick={next} direction="right" ariaLabel="Next profile" />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 8, alignItems: "center" }}>
          {people.map((_, i) => {
            const isActive = i === activeIndex;
            return <button key={i} aria-label={\`Go to profile \${i + 1}\`} onClick={() => setActiveIndex(i)} style={{ width: isActive ? 24 : 8, height: 8, borderRadius: isActive ? 4 : "50%", background: isActive ? "white" : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease" }} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default ProfileOrbit;`,
    tailwindSource: `"use client";

import { ProfileOrbit } from "@/components/profile-orbit/profile-orbit";

export function ProfileOrbitDemo() {
  return (
    <div className="w-full h-screen">
      <ProfileOrbit />
    </div>
  );
}`,
    props: [
      { name: "people", type: "ProfilePerson[]", description: "Array of 5 people. Each needs: seed (picsum image seed), name, role, email." },
      { name: "autoRotateInterval", type: "number", description: "Auto-rotation interval in ms.", defaultValue: "3000" },
      { name: "className", type: "string", description: "Extra className on the root element." },
    ],
  },
  {
    slug: "command-palette",
    name: "Command Palette",
    description: "Animated command palette that opens with ⌘K: a dimmed overlay, a search field that filters a list of commands, and Framer Motion enter and exit transitions. Also includes the Motion Kit Command Morph variant.",
    categorySlug: "motion-effects",
    tags: ["motion kit", "command", "search", "keyboard", "modal", "framer-motion", "shadcn"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-05-18",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react", "cmdk", "@radix-ui/react-dialog"],
    Preview: Previews.PreviewCommandPalette,
    previewSections: [
      {
        title: "Command Palette",
        Preview: Previews.PreviewCommandPalette,
        reactSource: `"use client";

import { CommandPalette } from "@/components/command-palette";

export function CommandPaletteDemo() {
  return <CommandPalette />;
}`,
      },
      {
        title: "Command Morph",
        Preview: Previews.PreviewCommandMorph,
        reactSource: `"use client";

import { CommandMorph, type CommandItem } from "@/components/command-palette";

const commands: CommandItem[] = [
  { id: "search", label: "Search docs", hint: "/", icon: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" },
  {
    id: "goto",
    label: "Go to page",
    crumb: "pages",
    icon: "M3 7h6l2 2h10v10H3z",
    children: [
      { id: "home", label: "Home", icon: "M3 11l9-8 9 8v10H3z" },
      { id: "billing", label: "Billing", icon: "M2 6h20v12H2zM2 10h20" },
    ],
  },
  { id: "logout", label: "Log out", icon: "M9 21H5V3h4M16 17l5-5-5-5M21 12H9" },
];

export function AppCommands() {
  return (
    <CommandMorph
      commands={commands}
      hotkey
      onSelect={(cmd, path) => console.log([...path.map((p) => p.id), cmd.id].join("/"))}
    />
  );
}`,
      },
    ],
    tailwindSource: `"use client";

import { CommandPalette } from "@/components/command-palette";

export function CommandPaletteDemo() {
  return <CommandPalette />;
}`,
    reactSource: `"use client";

import { CommandPalette } from "@/components/command-palette";

export function CommandPaletteDemo() {
  return <CommandPalette />;
}`,
    props: [
      { name: "className", type: "string", description: "Optional className for the root wrapper." },
      { name: "CommandMorph.commands", type: "CommandItem[]", defaultValue: "DEFAULT_COMMANDS", description: "Commands on the first page, each { id, label, icon, hint?, crumb?, children? }. Items with children open a nested page." },
      { name: "CommandMorph.placeholder", type: "string", defaultValue: "\"Type a command\u2026\"", description: "Search field placeholder on the first page. Nested pages show \"Search\u2026\"." },
      { name: "CommandMorph.onSelect", type: "(command: CommandItem, path: CommandItem[]) => void", description: "Called when the user runs a command without children, with the groups that led to it." },
      { name: "CommandMorph.hotkey", type: "boolean", defaultValue: "false", description: "Opt-in: Cmd/Ctrl+K anywhere on the page focuses the search field. Off by default." },
      { name: "CommandMorph.autoplay", type: "boolean", defaultValue: "false", description: "Walks through the palette by itself until someone touches it." },
      { name: "CommandMorph.className", type: "string", description: "Extra classes for the outer box." },
    ],
  },
  {
    slug: "image-trail",
    name: "Image Trail",
    registryCliName: "image-trail",
    resourceLinks: [{ label: "Live demo", href: "/demos/image-trail" }],
    description:
      "A cursor trail that cycles through a configurable image array as you move, with fade-blur transitions and an optional magnetic repulsion effect.",
    categorySlug: "motion-effects",
    tags: ["cursor", "trail", "images", "magnetic", "motion", "interactive"],
    premium: false,
    trendingScore: 118,
    createdAt: "2026-05-21",
    animationKinds: ["hover", "magnetic", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "images", type: "ImageTrailImage[]", description: "Array of { src, alt? } objects cycled through as the trail." },
      { name: "spacing", type: "number", defaultValue: "40", description: "Minimum cursor travel (px) before spawning the next image." },
      { name: "duration", type: "number", defaultValue: "1000", description: "How long (ms) each image stays visible before fading out." },
      { name: "imageSize", type: "number", defaultValue: "120", description: "Width and height of each trail image (px)." },
      { name: "cornerRadius", type: "number", defaultValue: "8", description: "Border radius of each trail image (px)." },
      { name: "fadeInDuration", type: "number", defaultValue: "0.3", description: "Fade-in animation duration (seconds)." },
      { name: "fadeOutDuration", type: "number", defaultValue: "0.5", description: "Fade-out animation duration (seconds)." },
      { name: "fadeInBlur", type: "number", defaultValue: "0", description: "Blur applied to each image on entry (px)." },
      { name: "fadeOutBlur", type: "number", defaultValue: "6", description: "Blur applied to each image on exit (px)." },
      { name: "smoothness", type: "number", defaultValue: "0.7", description: "Lerp factor (0–1) — lower values produce silkier entry animation." },
      { name: "magneticEffect", type: "boolean", defaultValue: "false", description: "Enable magnetic repulsion — trail images push toward the cursor." },
      { name: "magneticRadius", type: "number", defaultValue: "100", description: "Max distance (px) at which the magnetic force acts." },
      { name: "magneticStrength", type: "number", defaultValue: "0.3", description: "Strength multiplier of the magnetic force (0–1)." },
      { name: "className", type: "string", description: "className for the root container (set width, height, background here)." },
      { name: "children", type: "React.ReactNode", description: "Optional foreground content rendered above the trail layer." },
    ],
    Preview: Previews.PreviewImageTrail,
    reactSource: `"use client";

import { ImageTrail } from "@/components/image-trail";

const IMAGES = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", alt: "Mountains" },
  { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80", alt: "Forest" },
  { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=80", alt: "Valley" },
  { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&q=80", alt: "Autumn" },
];

export function ImageTrailExample() {
  return (
    <ImageTrail
      images={IMAGES}
      spacing={36}
      duration={900}
      imageSize={120}
      cornerRadius={10}
      fadeOutBlur={6}
      className="h-96 w-full rounded-2xl border border-border bg-muted/20"
    >
      <div className="pointer-events-none flex h-full items-center justify-center">
        <p className="select-none text-sm text-muted-foreground/50">Move cursor here</p>
      </div>
    </ImageTrail>
  );
}`,
    reactExamples: [
      {
        title: "With magnetic effect",
        code: `"use client";

import { ImageTrail } from "@/components/image-trail";

const IMAGES = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", alt: "Mountains" },
  { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80", alt: "Forest" },
  { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=80", alt: "Valley" },
];

export function MagneticTrailExample() {
  return (
    <ImageTrail
      images={IMAGES}
      spacing={28}
      duration={1100}
      imageSize={100}
      cornerRadius={50}
      fadeOutBlur={8}
      magneticEffect
      magneticStrength={0.35}
      magneticRadius={120}
      className="h-96 w-full rounded-2xl border border-border bg-muted/20"
    />
  );
}`,
      },
    ],
    tailwindSource: `"use client";

import { ImageTrail } from "@/components/image-trail";

const IMAGES = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", alt: "Mountains" },
  { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80", alt: "Forest" },
  { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=80", alt: "Valley" },
  { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&q=80", alt: "Autumn" },
];

export function ImageTrailExample() {
  return (
    <ImageTrail
      images={IMAGES}
      spacing={36}
      duration={900}
      imageSize={120}
      cornerRadius={10}
      fadeOutBlur={6}
      className="h-96 w-full rounded-2xl border border-border bg-muted/20"
    >
      <div className="pointer-events-none flex h-full items-center justify-center">
        <p className="select-none text-sm text-muted-foreground/50">Move cursor here</p>
      </div>
    </ImageTrail>
  );
}`,
  },
  {
    slug: "avatar-group",
    name: "Avatar Group",
    description: "Overlapping avatar stack with per-avatar entrance animations (flip, slide, scale, bounce), four hover styles, name tooltips, and automatic color-coded fallback initials when no image is supplied.",
    categorySlug: "motion-effects",
    tags: ["avatar", "group", "users", "social proof", "tooltip", "framer-motion", "spring", "overlap"],
    premium: false,
    trendingScore: 115,
    createdAt: "2026-05-21T00:00:00.000Z",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewAvatarGroup,
    props: [
      { name: "size", type: "number", description: "Avatar diameter in px.", defaultValue: "40" },
      { name: "overlap", type: "number", description: "Pixel overlap between adjacent avatars.", defaultValue: "10" },
      { name: "showTooltips", type: "boolean", description: "Show name tooltip on hover.", defaultValue: "true" },
      { name: "hoverAnimation", type: '"scale" | "lift" | "rotate" | "up" | "none"', description: "Animation applied to the avatar under the cursor.", defaultValue: '"lift"' },
      { name: "hoverScale", type: "number", description: "Scale multiplier applied on hover.", defaultValue: "1.1" },
      { name: "entranceAnimation", type: '"none" | "fade" | "flip" | "slide" | "scale" | "bounce"', description: "Entrance animation for each avatar on mount.", defaultValue: '"scale"' },
      { name: "entranceStagger", type: "number", description: "Delay in seconds between each avatar's entrance.", defaultValue: "0.05" },
    ],
    reactSource: `"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AvatarData {
  src?: string;
  alt?: string;
  fallback: string;
  tooltip?: string;
  bgColor?: string;
}

export interface AvatarGroupProps {
  avatars: AvatarData[];
  size?: number;
  overlap?: number;
  borderWidth?: number;
  borderColor?: string;
  showTooltips?: boolean;
  hoverAnimation?: "scale" | "lift" | "rotate" | "up" | "none";
  hoverScale?: number;
  entranceAnimation?: "none" | "fade" | "flip" | "slide" | "scale" | "bounce";
  entranceStagger?: number;
  className?: string;
}

const SPRING = { type: "spring" as const, stiffness: 400, damping: 18, mass: 0.8 };

const DEFAULT_COLOURS = [
  "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b",
  "#d946ef", "#0ea5e9", "#f43f5e", "#14b8a6",
];

function entranceInitial(type: AvatarGroupProps["entranceAnimation"]) {
  switch (type) {
    case "flip":   return { rotateY: -90, scale: 0.8, opacity: 0 };
    case "slide":  return { x: 16, opacity: 0 };
    case "scale":  return { scale: 0.8, opacity: 0 };
    case "bounce": return { scale: 0.8, y: 16, opacity: 0 };
    case "fade":   return { opacity: 0 };
    default:       return false as const;
  }
}

function entranceFinal(type: AvatarGroupProps["entranceAnimation"]) {
  switch (type) {
    case "flip":   return { rotateY: 0, scale: 1, opacity: 1 };
    case "slide":  return { x: 0, opacity: 1 };
    case "scale":  return { scale: 1, opacity: 1 };
    case "bounce": return { scale: 1, y: 0, opacity: 1 };
    case "fade":   return { opacity: 1 };
    default:       return {};
  }
}

function hoverTarget(type: AvatarGroupProps["hoverAnimation"], scale: number) {
  switch (type) {
    case "scale":  return { scale };
    case "lift":   return { y: -4, scale };
    case "rotate": return { rotate: 5, scale };
    case "up":     return { y: -8 };
    default:       return undefined;
  }
}

export function AvatarGroup({
  avatars,
  size = 40,
  overlap = 10,
  borderWidth = 2,
  borderColor,
  showTooltips = true,
  hoverAnimation = "lift",
  hoverScale = 1.1,
  entranceAnimation = "scale",
  entranceStagger = 0.05,
  className,
}: AvatarGroupProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const step = size - overlap;
  const totalWidth = avatars.length > 0
    ? avatars.length * size - (avatars.length - 1) * overlap
    : 0;

  const initial = reduce ? false : entranceInitial(entranceAnimation);
  const finalState = entranceFinal(entranceAnimation);
  const hoverAnim = reduce ? undefined : hoverTarget(hoverAnimation, hoverScale);

  return (
    <div
      className={cn("relative", className)}
      style={{ width: totalWidth, height: size }}
    >
      {avatars.map((avatar, index) => {
        const bgColor = avatar.bgColor ?? DEFAULT_COLOURS[index % DEFAULT_COLOURS.length];
        return (
          <motion.div
            key={index}
            className="absolute top-0 select-none"
            style={{
              left: index * step,
              width: size,
              height: size,
              zIndex: hoveredIndex === index ? avatars.length + 10 : avatars.length - index,
            }}
            initial={initial}
            animate={finalState}
            transition={{ ...SPRING, delay: reduce ? 0 : entranceStagger * index }}
            whileHover={hoverAnim}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-full overflow-hidden cursor-pointer",
                !borderColor && "ring-2 ring-background dark:ring-zinc-900",
              )}
              style={{
                width: size,
                height: size,
                backgroundColor: bgColor,
                ...(borderColor ? { boxShadow: \`0 0 0 \${borderWidth}px \${borderColor}\` } : {}),
              }}
            >
              {avatar.src ? (
                <img src={avatar.src} alt={avatar.alt ?? avatar.tooltip ?? avatar.fallback}
                  width={size} height={size} className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (sib) sib.style.display = "flex";
                  }}
                />
              ) : null}
              <span className="flex items-center justify-center w-full h-full font-semibold text-white"
                style={{ fontSize: size * 0.35, display: avatar.src ? "none" : "flex" }}>
                {avatar.fallback}
              </span>
            </div>

            {showTooltips && avatar.tooltip && (
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div key="tip"
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}
                    className="pointer-events-none absolute z-50"
                    style={{ bottom: size + 6, left: "50%", transform: "translateX(-50%)" }}
                  >
                    <div className="rounded bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white whitespace-nowrap dark:bg-zinc-700">
                      {avatar.tooltip}
                    </div>
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Usage example ─────────────────────────────────────────────────────────────
export function SocialProofAvatars() {
  return (
    <AvatarGroup
      avatars={[
        { fallback: "PS", tooltip: "Priya Sharma",   bgColor: "#06b6d4" },
        { fallback: "JK", tooltip: "James Kowalski", bgColor: "#8b5cf6" },
        { fallback: "SC", tooltip: "Sofia Chen",     bgColor: "#10b981" },
        { fallback: "MR", tooltip: "Marcus Reid",    bgColor: "#f59e0b" },
        { fallback: "AN", tooltip: "Aisha Nkosi",    bgColor: "#d946ef" },
      ]}
      size={40}
      overlap={10}
      hoverAnimation="lift"
      entranceAnimation="scale"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "feature-tools-card",
    name: "Feature Tools Card",
    description: "A dark glass card with five magnetic icon slots, a rotating conic-gradient orbit ring, and 3-D tilt physics. Swap the default integration icons for any SVG or image.",
    categorySlug: "cards",
    tags: ["card", "icons", "integrations", "tilt", "3d", "magnetic", "orbit", "glassmorphism"],
    premium: false,
    trendingScore: 130,
    createdAt: "2026-05-21T00:00:00.000Z",
    animationKinds: ["3d", "hover", "spring"],
    dependencies: [],
    Preview: Previews.PreviewFeatureToolsCard,
    props: [
      { name: "title", type: "string", description: "Card heading text.", defaultValue: '"Feature Block Animated Card"' },
      { name: "description", type: "string", description: "Supporting description below the heading.", defaultValue: '"A card that showcases a set of tools your platform connects with."' },
      { name: "cardBg", type: "string", description: "CSS background value for the card surface.", defaultValue: '"rgba(40,40,40,0.70)"' },
      { name: "enableTilt", type: "boolean", description: "Enable 3-D perspective tilt on mouse move.", defaultValue: "true" },
      { name: "tiltStrength", type: "number", description: "Max tilt rotation in degrees.", defaultValue: "8" },
      { name: "enableMagnetic", type: "boolean", description: "Enable magnetic icon attraction toward cursor.", defaultValue: "true" },
      { name: "magneticStrength", type: "number", description: "Magnetic pull multiplier (0–1).", defaultValue: "0.4" },
      { name: "magneticRadius", type: "number", description: "Cursor distance in px at which magnetic pull begins.", defaultValue: "120" },
      { name: "enableOrbit", type: "boolean", description: "Show the conic-gradient orbit ring.", defaultValue: "true" },
      { name: "orbitSpeed", type: "number", description: "Orbit ring full-rotation duration in seconds.", defaultValue: "18" },
      { name: "orbitColor", type: "string", description: "CSS color for the orbit sweep segments.", defaultValue: '"rgba(255,255,255,0.18)"' },
    ],
    reactSource: `"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const ORBIT_KEYFRAMES = \`@keyframes ftc-orbit-spin { to { transform: rotate(360deg); } }\`;

// ── default icons ──────────────────────────────────────────────────────────────
function GithubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" className="w-full h-full">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function NotionIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" className="w-full h-full">
      <path fillRule="evenodd" clipRule="evenodd" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933l3.222-.187z" />
    </svg>
  );
}

function GmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
      <path d="M3.5 5.5h17A1.5 1.5 0 0 1 22 7v10a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17V7a1.5 1.5 0 0 1 1.5-1.5z" fill="#FFFFFF" />
      <path d="M22 7v10a1.5 1.5 0 0 1-1.5 1.5h-2V10.66L22 7z" fill="#4285F4" />
      <path d="M2 7v10a1.5 1.5 0 0 0 1.5 1.5h2V10.66L2 7z" fill="#34A853" />
      <path d="M5.5 18.5V10.66L12 14.5l6.5-3.84v7.84h-13z" fill="#EA4335" />
      <path d="M22 7L12 13.5 2 7l1-1.5h18L22 7z" fill="#FBBC04" />
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E" />
    </svg>
  );
}

function DriveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
      <path d="M7.71 3.5L1.15 15l3.42 6 6.55-11.5z" fill="#0066DA" />
      <path d="M16.29 3.5H7.71l6.55 11.5h8.59z" fill="#FFC107" />
      <path d="M22.85 15h-8.59l-3.16 5.5h8.31z" fill="#1B872B" />
      <path d="M14.26 15l-3.14-5.5L7.71 3.5l3.42 6h.01l3.12 5.5z" fill="#EA4335" />
      <path d="M22.85 15l-3.14-5.5h-5.45l3.14 5.5z" fill="#188038" />
    </svg>
  );
}

export interface FeatureToolsCardProps {
  title?: string;
  description?: string;
  cardBg?: string;
  icon1?: React.ReactNode;
  icon2?: React.ReactNode;
  icon3?: React.ReactNode;
  icon4?: React.ReactNode;
  icon5?: React.ReactNode;
  enableTilt?: boolean;
  tiltStrength?: number;
  enableMagnetic?: boolean;
  magneticStrength?: number;
  magneticRadius?: number;
  enableOrbit?: boolean;
  orbitSpeed?: number;
  orbitColor?: string;
  className?: string;
}

export function FeatureToolsCard({
  title = "Feature Block Animated Card",
  description = "A card that showcases a set of tools your platform connects with.",
  cardBg = "rgba(40,40,40,0.70)",
  icon1, icon2, icon3, icon4, icon5,
  enableTilt = true,
  tiltStrength = 8,
  enableMagnetic = true,
  magneticStrength = 0.4,
  magneticRadius = 120,
  enableOrbit = true,
  orbitSpeed = 18,
  orbitColor = "rgba(255,255,255,0.18)",
  className,
}: FeatureToolsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const magnetRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    function onMove(e: MouseEvent) {
      const rect = card!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (enableTilt) {
        const rx = ((my - rect.height / 2) / (rect.height / 2)) * -tiltStrength;
        const ry = ((mx - rect.width / 2) / (rect.width / 2)) * tiltStrength;
        card!.style.transform = \`perspective(900px) rotateX(\${rx}deg) rotateY(\${ry}deg)\`;
      }
      if (enableMagnetic) {
        magnetRefs.current.forEach((m) => {
          if (!m) return;
          const r = m.getBoundingClientRect();
          const cx = r.left + r.width / 2 - rect.left;
          const cy = r.top + r.height / 2 - rect.top;
          const dx = mx - cx;
          const dy = my - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < magneticRadius) {
            const pull = (1 - dist / magneticRadius) * magneticStrength;
            m.style.transform = \`translate(\${dx * pull}px, \${dy * pull}px)\`;
          } else {
            m.style.transform = "translate(0,0)";
          }
        });
      }
    }
    function onLeave() {
      if (enableTilt) card!.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
      if (enableMagnetic) magnetRefs.current.forEach((m) => { if (m) m.style.transform = "translate(0,0)"; });
    }
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => { card.removeEventListener("mousemove", onMove); card.removeEventListener("mouseleave", onLeave); };
  }, [enableTilt, tiltStrength, enableMagnetic, magneticStrength, magneticRadius]);

  const icons = [
    { node: icon1 ?? <GithubIcon />, size: "w-8 h-8",  iconSize: "w-4 h-4" },
    { node: icon2 ?? <NotionIcon />, size: "w-12 h-12", iconSize: "w-6 h-6" },
    { node: icon3 ?? <GmailIcon />,  size: "w-16 h-16", iconSize: "w-8 h-8" },
    { node: icon4 ?? <SlackIcon />,  size: "w-12 h-12", iconSize: "w-6 h-6" },
    { node: icon5 ?? <DriveIcon />,  size: "w-8 h-8",  iconSize: "w-4 h-4" },
  ];

  return (
    <div
      ref={cardRef}
      className={cn("w-full max-w-sm rounded-xl p-8", className)}
      style={{
        background: cardBg,
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "inset 2px 4px 16px 0px rgba(248,248,248,0.06)",
        transformStyle: "preserve-3d",
        transition: "transform 0.2s ease-out",
        willChange: "transform",
      }}
    >
      <style>{ORBIT_KEYFRAMES}</style>
      <div
        className="relative h-80 rounded-xl overflow-hidden"
        style={{
          background: cardBg,
          WebkitMaskImage: "radial-gradient(50% 50% at 50% 50%, white 0%, transparent 100%)",
          maskImage: "radial-gradient(50% 50% at 50% 50%, white 0%, transparent 100%)",
        }}
      >
        {enableOrbit && (
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: 280, height: 280, marginTop: -140, marginLeft: -140,
              background: \`conic-gradient(from 0deg, transparent 0%, \${orbitColor} 25%, transparent 50%, \${orbitColor} 75%, transparent 100%)\`,
              WebkitMask: "radial-gradient(circle, transparent 56%, black 58%, black 80%, transparent 82%)",
              mask: "radial-gradient(circle, transparent 56%, black 58%, black 80%, transparent 82%)",
              animation: \`ftc-orbit-spin \${orbitSpeed}s linear infinite\`,
              zIndex: 1,
            }}
          />
        )}
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="flex flex-row items-center justify-center gap-2">
            {icons.map(({ node, size, iconSize }, i) => (
              <div
                key={i}
                ref={(el) => { magnetRefs.current[i] = el; }}
                className="inline-flex"
                style={{ transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)", willChange: "transform" }}
              >
                <div className={cn("rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-350 hover:scale-110", size)}
                  style={{ background: "rgba(248,248,248,0.01)", boxShadow: "inset 0px 0px 8px 0px rgba(248,248,248,0.25), 0px 32px 24px -16px rgba(0,0,0,0.40)" }}
                >
                  <span className={cn("pointer-events-none", iconSize)}>{node}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <h3 className="mt-2 pt-2 text-lg font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-white/50">{description}</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "link-preview",
    name: "Link Preview",
    description:
      "Hover-triggered image tooltip that transforms inline text links into cinematic visual previews. Spring-animated entrance with blur, scale, mouse-tracking tilt, and a soft floating glide — perfect for blogs, portfolios, and product pages.",
    categorySlug: "motion-effects",
    tags: ["tooltip", "hover", "link", "preview", "framer-motion", "blog", "animation"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-05-21T00:00:00.000Z",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewLinkPreview,
    previewShell: "plain",
    props: [
      { name: "href", type: "string", description: "Destination URL — internal path or external https:// link." },
      { name: "image", type: "string", description: "Image URL to display inside the preview card." },
      { name: "title", type: "string", description: "Optional label shown beneath the card alongside the hostname.", defaultValue: "undefined" },
      { name: "children", type: "React.ReactNode", description: "The visible link text rendered inline." },
      { name: "width", type: "number", description: "Preview card width in px.", defaultValue: "320" },
      { name: "height", type: "number", description: "Preview card height in px.", defaultValue: "200" },
      { name: "delay", type: "number", description: "Entrance animation delay in seconds.", defaultValue: "0.08" },
      { name: "className", type: "string", description: "Extra className applied to the anchor element.", defaultValue: "undefined" },
      { name: "previewClassName", type: "string", description: "Extra className applied to the tooltip wrapper.", defaultValue: "undefined" },
      { name: "openInNewTab", type: "boolean", description: "Opens the link in a new tab when true.", defaultValue: "true" },
    ],
    reactSource: `"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useSpring,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type LinkPreviewProps = {
  href: string;
  image: string;
  title?: string;
  children: React.ReactNode;
  width?: number;
  height?: number;
  delay?: number;
  className?: string;
  previewClassName?: string;
  openInNewTab?: boolean;
};

function getHostname(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\\./, "");
  } catch {
    return "";
  }
}

export function LinkPreview({
  href,
  image,
  title,
  children,
  width = 320,
  height = 200,
  delay = 0.08,
  className,
  previewClassName,
  openInNewTab = true,
}: LinkPreviewProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [anchorPos, setAnchorPos] = React.useState({ top: 0, left: 0 });

  const anchorRef = React.useRef<HTMLAnchorElement>(null);

  const mouseXRaw = useMotionValue(0);
  const springX = useSpring(mouseXRaw, { stiffness: 90, damping: 16, mass: 0.6 });
  const rotateZ = useTransform(springX, [-1, 1], [-5, 5]);
  const shiftX = useTransform(springX, [-1, 1], [-12, 12]);

  React.useEffect(() => {
    setMounted(true);
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  React.useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [image]);

  function captureAnchorPos() {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setAnchorPos({ top: rect.top, left: rect.left + rect.width / 2 });
  }

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = anchorRef.current;
    if (!el) return;
    const { left, width: w } = el.getBoundingClientRect();
    mouseXRaw.set(((e.clientX - left) / w) * 2 - 1);
  }

  function handleMouseEnter() { captureAnchorPos(); setIsVisible(true); }
  function handleMouseLeave() { setIsVisible(false); mouseXRaw.set(0); }
  function handleTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    captureAnchorPos();
    setIsVisible((v) => !v);
  }

  const hostname = getHostname(href);
  const tooltipTop = anchorPos.top - height - 56;

  const tooltip = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={\`link-preview-\${href}\`}
          initial={{ opacity: 0, y: 14, scale: 0.92, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 10, scale: 0.94, filter: "blur(6px)", transition: { duration: 0.15, ease: "easeIn" } }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 22,
            mass: 0.65,
            delay,
            filter: { type: "tween", duration: 0.2, ease: "easeOut", delay },
            opacity: { type: "tween", duration: 0.18, ease: "easeOut", delay },
          }}
          style={{
            position: "fixed",
            top: tooltipTop,
            left: anchorPos.left,
            marginLeft: -(width / 2),
            x: shiftX,
            rotateZ,
            width,
            transformOrigin: "bottom center",
            zIndex: 9999,
          }}
          className={cn("pointer-events-none", previewClassName)}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-white",
                "border-neutral-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]",
                "dark:border-white/[0.10] dark:bg-neutral-900",
                "dark:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)]",
              )}
              style={{ width, height }}
            >
              {!imageError ? (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-neutral-100 dark:bg-neutral-800" />
                  )}
                  <img
                    src={image}
                    alt={title ?? "Link preview"}
                    width={width}
                    height={height}
                    draggable={false}
                    className={cn(
                      "h-full w-full object-cover transition-opacity duration-300",
                      imageLoaded ? "opacity-100" : "opacity-0",
                    )}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/[0.07] dark:ring-white/[0.07]" />
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-100 px-6 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-purple-950/40">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 shadow-lg shadow-violet-400/30" />
                  <div className="space-y-2.5 text-center">
                    <div className="mx-auto h-3 w-32 rounded-full bg-violet-200/80 dark:bg-violet-700/50" />
                    <div className="mx-auto h-2 w-24 rounded-full bg-indigo-200/60 dark:bg-indigo-800/40" />
                    <div className="mx-auto h-2 w-16 rounded-full bg-purple-100/80 dark:bg-purple-800/30" />
                  </div>
                  {hostname && (
                    <span className="font-mono text-[11px] text-violet-400/80 dark:text-violet-500/70">
                      {hostname}
                    </span>
                  )}
                </div>
              )}
            </div>

            {(title || hostname) && (
              <div className="mt-2.5 flex items-center gap-2 px-0.5">
                {title && (
                  <span className="flex-1 truncate text-[11px] font-semibold leading-none text-neutral-700 dark:text-neutral-300">
                    {title}
                  </span>
                )}
                {hostname && (
                  <span className="shrink-0 font-mono text-[10px] text-neutral-400 dark:text-neutral-600">
                    {hostname}
                  </span>
                )}
              </div>
            )}

            <div className="absolute -bottom-[7px] left-1/2 size-3.5 -translate-x-1/2 rotate-45 rounded-sm border-b border-r border-neutral-200/80 bg-white dark:border-white/[0.10] dark:bg-neutral-900" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Link
        ref={anchorRef}
        href={href}
        {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onMouseEnter={isTouchDevice ? undefined : handleMouseEnter}
        onMouseLeave={isTouchDevice ? undefined : handleMouseLeave}
        onMouseMove={isTouchDevice ? undefined : handleMouseMove}
        onTouchStart={isTouchDevice ? handleTouchStart : undefined}
        className={cn(
          "relative inline font-semibold",
          "text-neutral-800 dark:text-neutral-100",
          "underline decoration-violet-400/60 decoration-[1.5px] underline-offset-[3px]",
          "transition-colors duration-150",
          "hover:text-violet-600 hover:decoration-violet-500",
          "dark:hover:text-violet-400 dark:hover:decoration-violet-400",
          className,
        )}
      >
        {children}
      </Link>
      {mounted && createPortal(tooltip, document.body)}
    </>
  );
}

export default LinkPreview;`,
    tailwindSource: tw,
  },
  {
    slug: "tick-slider",
    name: "Tick Slider",
    registryCliName: "tick-slider",
    description:
      "A value slider drawn as a row of fine tick marks that fill as you drag, swell into a soft wave under the pointer and read out a rolling number.",
    categorySlug: "inputs-controls",
    tags: ["slider", "range", "input", "ticks", "volume", "drag", "rolling number", "framer-motion"],
    premium: false,
    trendingScore: 168,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "value", type: "number", description: "Controlled value." },
      { name: "defaultValue", type: "number", defaultValue: "50", description: "Starting value when uncontrolled." },
      { name: "onChange", type: "(value: number) => void", description: "Called with the snapped value while dragging and on key presses." },
      { name: "onCommit", type: "(value: number) => void", description: "Called once when a drag or key press settles." },
      { name: "min", type: "number", defaultValue: "0", description: "Lowest value." },
      { name: "max", type: "number", defaultValue: "100", description: "Highest value." },
      { name: "step", type: "number", defaultValue: "1", description: "Values snap to multiples of this." },
      { name: "ticks", type: "number", defaultValue: "36", description: "How many tick marks the track is drawn with." },
      { name: "label", type: "string", description: "Visible label above the track, also used as the accessible name." },
      { name: "accent", type: "string", description: "Colour of the filled ticks and the number. Defaults to the text colour." },
      { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Tick height and number size." },
      { name: "showValue", type: "boolean", defaultValue: "true", description: "Show the rolling number beside the track." },
      { name: "unit", type: "string", description: 'Suffix after the number, e.g. "%".' },
      { name: "magnify", type: "number", defaultValue: "0.55", description: "How much ticks near the pointer grow. 0 turns the wave off." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables dragging and keys." },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    Preview: Previews.PreviewTickSlider,
    previewShell: "plain",
    reactSource: `"use client";

import * as React from "react";
import { TickSlider } from "@/components/tick-slider";

export function VolumeControl() {
  const [volume, setVolume] = React.useState(64);

  return (
    <TickSlider
      label="Volume"
      value={volume}
      onChange={setVolume}
      unit="%"
      ticks={40}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "time-scrubber",
    name: "Time Scrubber",
    registryCliName: "time-scrubber",
    description:
      "A time picker card where you drag, flick or scroll a ruler of minute ticks under a fixed needle, with momentum, snapping and a rolling clock readout.",
    categorySlug: "inputs-controls",
    tags: ["time picker", "scrubber", "ruler", "slider", "booking", "schedule", "drag", "momentum", "framer-motion"],
    premium: false,
    trendingScore: 163,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "value", type: "number", description: "Controlled time in minutes since midnight (0–1439)." },
      { name: "defaultValue", type: "number", defaultValue: "570", description: "Starting time when uncontrolled (570 = 9:30 AM)." },
      { name: "onChange", type: "(minutes: number) => void", description: "Called with the snapped time whenever it changes." },
      { name: "onCommit", type: "(minutes: number) => void", description: "Called once the ruler comes to rest." },
      { name: "interval", type: "number", defaultValue: "15", description: "Minutes the ruler snaps to (5, 10, 15 or 30 read best)." },
      { name: "format", type: '"12h" | "24h"', defaultValue: '"12h"', description: "Clock format for the readout and hour labels." },
      { name: "accent", type: "string", defaultValue: '"#ef4444"', description: "Colour of the centre needle." },
      { name: "density", type: "number", defaultValue: "1.6", description: "Pixels per minute on the ruler; larger spreads the hours out." },
      { name: "label", type: "string", description: 'Caption above the time, e.g. "Pickup".' },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables dragging, wheel and keys." },
      { name: "className", type: "string", description: "Extra classes on the card." },
    ],
    Preview: Previews.PreviewTimeScrubber,
    previewShell: "plain",
    reactSource: `"use client";

import * as React from "react";
import { TimeScrubber } from "@/components/time-scrubber";

export function PickupTime() {
  // minutes since midnight: 9:30 AM
  const [time, setTime] = React.useState(9 * 60 + 30);

  return (
    <TimeScrubber
      label="Pickup"
      value={time}
      onChange={setTime}
      interval={15}
      format="12h"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "slide-to-confirm",
    name: "Slide to Confirm",
    registryCliName: "slide-to-confirm",
    description:
      "A swipe-to-confirm pill: drag the knob across with rubber-band resistance, and it snaps home early or locks in, waits on your async action and morphs into a success state.",
    categorySlug: "inputs-controls",
    tags: ["slide to confirm", "swipe", "payment", "checkout", "confirm", "button", "drag", "async", "framer-motion"],
    premium: false,
    trendingScore: 172,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring", "press"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "label", type: "string", defaultValue: '"Slide to confirm"', description: "Text inside the track before confirming; also the accessible name." },
      { name: "successLabel", type: "string", defaultValue: '"Confirmed"', description: "Text shown once confirmed." },
      { name: "pendingLabel", type: "string", defaultValue: '"Confirming"', description: "Text shown while onConfirm is pending." },
      { name: "onConfirm", type: "() => void | Promise<unknown>", description: "Runs when the knob reaches the end. Return a promise to show a pending spinner; a rejected promise shakes the knob and slides it back." },
      { name: "threshold", type: "number", defaultValue: "0.9", description: "How far (0–1) the knob must travel before letting go confirms." },
      { name: "resetAfter", type: "number", defaultValue: "2200", description: "Return to the start this many ms after success. 0 keeps the success state." },
      { name: "accent", type: "string", description: "Knob colour. Defaults to ink in light mode and white in dark mode." },
      { name: "successColor", type: "string", defaultValue: '"#16a34a"', description: "Track colour once confirmed." },
      { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Track height, knob size and text size." },
      { name: "width", type: "number", description: "Track width in px. Defaults to 260 / 300 / 340 by size." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Locks the knob." },
      { name: "className", type: "string", description: "Extra classes on the track." },
    ],
    Preview: Previews.PreviewSlideToConfirm,
    previewShell: "plain",
    reactSource: `"use client";

import { SlideToConfirm } from "@/components/slide-to-confirm";

async function payInvoice() {
  const res = await fetch("/api/pay", { method: "POST" });
  if (!res.ok) throw new Error("Payment failed");
}

export function PayButton() {
  return (
    <SlideToConfirm
      label="Slide to pay $24"
      pendingLabel="Paying"
      successLabel="Paid"
      onConfirm={payInvoice}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "emoji-reactions",
    name: "Emoji Reactions",
    registryCliName: "emoji-reactions",
    description:
      "A message with reaction chips that pop and roll their counts when tapped, plus a spring picker that adds new reactions with a layout animation. Also includes the Motion Kit Spark Reactions variant.",
    categorySlug: "inputs-controls",
    tags: ["motion kit", "reactions", "emoji", "chat", "message", "picker", "counter", "social", "framer-motion"],
    premium: false,
    trendingScore: 166,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "message", type: "React.ReactNode", defaultValue: '"Shipped the new onboarding flow"', description: "Text in the message bubble. Pass null to show only the reactions." },
      { name: "reactions", type: "{ emoji: string; count: number; reacted?: boolean }[]", defaultValue: "[🚀 3, 🔥 2]", description: "Starting reactions." },
      { name: "emojis", type: "string[]", defaultValue: '["👍", "❤️", "😂", "🎉", "🔥", "🚀", "👀", "🙏"]', description: "Emojis offered in the picker." },
      { name: "onChange", type: "(reactions: Reaction[]) => void", description: "Called whenever the reaction list changes." },
      { name: "accent", type: "string", defaultValue: '"#5b8def"', description: "Ring and tint colour for reactions you've added." },
      { name: "className", type: "string", description: "Extra classes on the wrapper." },
      { name: "SparkReactions.message", type: "string", defaultValue: "\"Shipped the new onboarding flow\"", description: "The message the reactions belong to." },
      { name: "SparkReactions.reactions", type: "SparkReaction[]", defaultValue: "DEFAULT_SPARK_REACTIONS", description: "Starting row, each { id, count, mine } (rocket 3 and fire 2 by default)." },
      { name: "SparkReactions.options", type: "SparkReactionOption[]", defaultValue: "DEFAULT_SPARK_OPTIONS", description: "Reactions in the picker, each { id, label, d, color, darkColor? }; also the icons for reactions." },
      { name: "SparkReactions.onChange", type: "(reactions: SparkReaction[]) => void", description: "Called with the new row after the user adds or removes a reaction." },
      { name: "SparkReactions.autoplay", type: "boolean", defaultValue: "false", description: "Reacts, opens the picker and un-reacts on a loop until someone touches it." },
      { name: "SparkReactions.className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewEmojiReactions,
    previewSections: [
      {
        title: "Emoji Reactions",
        Preview: Previews.PreviewEmojiReactions,
        reactSource: `"use client";

import { EmojiReactions, type Reaction } from "@/components/emoji-reactions";

const initial: Reaction[] = [
  { emoji: "🚀", count: 3 },
  { emoji: "🔥", count: 2, reacted: true },
];

export function ReleaseNote() {
  return (
    <EmojiReactions
      message="Shipped the new onboarding flow"
      reactions={initial}
      emojis={["👍", "❤️", "😂", "🎉", "🔥", "🚀", "👀", "🙏"]}
      accent="#5b8def"
      onChange={(reactions) => console.log(reactions)}
    />
  );
}`,
      },
      {
        title: "Spark Reactions",
        Preview: Previews.PreviewSparkReactions,
        reactSource: `"use client";

import { SparkReactions } from "@/components/emoji-reactions";

export function ReleaseNoteReactions() {
  return (
    <SparkReactions
      message="v2.4 is live for everyone"
      reactions={[
        { id: "party", count: 8, mine: true },
        { id: "rocket", count: 5, mine: false },
      ]}
      onChange={(row) => console.log("reactions", row)}
    />
  );
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `"use client";

import { EmojiReactions, type Reaction } from "@/components/emoji-reactions";

const initial: Reaction[] = [
  { emoji: "🚀", count: 3 },
  { emoji: "🔥", count: 2, reacted: true },
];

export function ReleaseNote() {
  return (
    <EmojiReactions
      message="Shipped the new onboarding flow"
      reactions={initial}
      emojis={["👍", "❤️", "😂", "🎉", "🔥", "🚀", "👀", "🙏"]}
      accent="#5b8def"
      onChange={(reactions) => console.log(reactions)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "like-burst",
    name: "Like Burst",
    registryCliName: "like-burst",
    description:
      "A like button whose heart squashes and fills with a ring shockwave and a particle burst, while the count rolls digit by digit. Also includes the Motion Kit Confetti Like variant.",
    categorySlug: "inputs-controls",
    tags: ["motion kit", "like", "heart", "button", "counter", "burst", "particles", "micro-interaction", "framer-motion"],
    premium: false,
    trendingScore: 168,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "count", type: "number", description: "Controlled like count." },
      { name: "defaultCount", type: "number", defaultValue: "1299", description: "Starting count when uncontrolled." },
      { name: "liked", type: "boolean", description: "Controlled liked state." },
      { name: "defaultLiked", type: "boolean", defaultValue: "false", description: "Starting liked state when uncontrolled." },
      { name: "onChange", type: "(liked: boolean, count: number) => void", description: "Called with the next liked state and count." },
      { name: "color", type: "string", defaultValue: '"#ff3b5c"', description: "Heart, ring and particle colour." },
      { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Button size." },
      { name: "burst", type: "number", defaultValue: "10", description: "Particles in the burst; 0 turns it off." },
      { name: "label", type: "string", defaultValue: '"Like"', description: "Accessible label; the count is appended." },
      { name: "className", type: "string", description: "Extra classes on the button." },
      { name: "ConfettiLike.count", type: "number", defaultValue: "1300", description: "Like count without yours; liking adds one." },
      { name: "ConfettiLike.defaultLiked", type: "boolean", defaultValue: "false", description: "Whether it starts liked." },
      { name: "ConfettiLike.accent", type: "string", defaultValue: "\"#ff375f\"", description: "Heart and ring colour, as a hex value." },
      { name: "ConfettiLike.colors", type: "string[]", defaultValue: "DEFAULT_CONFETTI_COLORS", description: "Confetti colours, used in turn around the burst." },
      { name: "ConfettiLike.onChange", type: "(liked: boolean, count: number) => void", description: "Called with the new state and displayed count when the user toggles it." },
      { name: "ConfettiLike.autoplay", type: "boolean", defaultValue: "false", description: "Likes and unlikes itself every 1.5s until someone presses it." },
      { name: "ConfettiLike.className", type: "string", description: "Extra classes for the button." },
    ],
    Preview: Previews.PreviewLikeBurst,
    previewSections: [
      {
        title: "Like Burst",
        Preview: Previews.PreviewLikeBurst,
        reactSource: `"use client";

import * as React from "react";
import { LikeBurst } from "@/components/like-burst";

export function PostActions({ postId, likes, likedByMe }: { postId: string; likes: number; likedByMe: boolean }) {
  return (
    <LikeBurst
      defaultCount={likes}
      defaultLiked={likedByMe}
      color="#ff3b5c"
      onChange={(liked) => {
        void fetch(\`/api/posts/\${postId}/like\`, { method: liked ? "POST" : "DELETE" });
      }}
    />
  );
}`,
      },
      {
        title: "Confetti Like",
        Preview: Previews.PreviewConfettiLike,
        reactSource: `"use client";

import { ConfettiLike } from "@/components/like-burst";

export function PostLike() {
  return (
    <ConfettiLike
      count={2481}
      accent="#ff375f"
      onChange={(liked, count) => console.log(liked ? "liked" : "unliked", count)}
    />
  );
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `"use client";

import * as React from "react";
import { LikeBurst } from "@/components/like-burst";

export function PostActions({ postId, likes, likedByMe }: { postId: string; likes: number; likedByMe: boolean }) {
  return (
    <LikeBurst
      defaultCount={likes}
      defaultLiked={likedByMe}
      color="#ff3b5c"
      onChange={(liked) => {
        void fetch(\`/api/posts/\${postId}/like\`, { method: liked ? "POST" : "DELETE" });
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "toast-stack",
    name: "Toast Stack",
    registryCliName: "toast-stack",
    description:
      "Notifications that rest in a tidy stack, fan out into a list on hover or focus, and can be swiped away, with optional action buttons.",
    categorySlug: "cards",
    tags: ["toast", "notification", "snackbar", "stack", "swipe", "dismiss", "feedback", "framer-motion"],
    premium: false,
    trendingScore: 171,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "drag", "spring", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "toasts", type: "ToastItem[]", description: "Toasts in arrival order; the last sits at the front. Each has id, title, description?, type? (success | error | info) and action? ({ label })." },
      { name: "onDismiss", type: "(id: string) => void", description: "Called when a toast is swiped away, closed, or dismissed with Escape." },
      { name: "onAction", type: "(toast: ToastItem) => void", description: "Called when a toast's action button is pressed." },
      { name: "position", type: '"top" | "bottom"', defaultValue: '"bottom"', description: "Which edge the stack grows from." },
      { name: "expand", type: '"hover" | "always"', defaultValue: '"hover"', description: "Fan out on hover/focus, or stay fanned out." },
      { name: "max", type: "number", defaultValue: "3", description: "How many toasts are drawn at once." },
      { name: "width", type: "number", defaultValue: "340", description: "Toast width in px." },
      { name: "className", type: "string", description: "Extra classes on the stack." },
    ],
    Preview: Previews.PreviewToastStack,
    previewShell: "plain",
    reactSource: `"use client";

import { ToastStack, useToastStack } from "@/components/toast-stack";

export function CheckoutNotifications() {
  const { toasts, push, dismiss } = useToastStack();

  async function pay() {
    const ok = await fetch("/api/pay", { method: "POST" }).then((r) => r.ok);
    push(
      ok
        ? { type: "success", title: "Payment received", description: "Receipt sent to your inbox." }
        : { type: "error", title: "Payment declined", description: "Try another card.", action: { label: "Retry" } },
    );
  }

  return (
    <>
      <button onClick={pay}>Pay now</button>
      <div className="fixed bottom-6 right-6 z-50">
        <ToastStack
          toasts={toasts}
          onDismiss={dismiss}
          onAction={(toast) => {
            dismiss(toast.id);
            void pay();
          }}
        />
      </div>
    </>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "upload-dropzone",
    name: "Upload Dropzone",
    registryCliName: "upload-dropzone",
    description:
      "A drag-and-drop upload card that lifts and marches its dashed edge while a file hovers, then lists each file with a type badge and a progress ring.",
    categorySlug: "inputs-controls",
    tags: ["upload", "dropzone", "drag and drop", "file input", "progress", "attachments", "framer-motion"],
    premium: false,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "accept", type: "string", description: 'Same syntax as the file input accept attribute, e.g. "image/*,.pdf".' },
      { name: "maxSize", type: "number", defaultValue: "5242880", description: "Largest file accepted, in bytes. Bigger files are listed as errors and the card shakes." },
      { name: "multiple", type: "boolean", defaultValue: "true", description: "Accept several files at once." },
      { name: "onFiles", type: "(files: File[]) => void", description: "Called with every batch of accepted files." },
      { name: "onUpload", type: "(file: File, setProgress: (p: number) => void) => Promise<void>", description: "Upload one file and report progress from 0 to 1. Without it, uploads are simulated." },
      { name: "initialFiles", type: "{ name: string; size: number; type?: string; progress?: number }[]", description: "Files shown on first render, such as ones already uploaded." },
      { name: "title", type: "string", defaultValue: '"Drag a file here"', description: "Main line of the card." },
      { name: "hint", type: "string", description: "Secondary line. Defaults to the size limit." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Tint and dashed edge colour while a file is dragged over." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Ignore drops and clicks." },
      { name: "className", type: "string", description: "Extra classes on the wrapper." },
    ],
    Preview: Previews.PreviewUploadDropzone,
    previewShell: "plain",
    reactSource: `"use client";

import { UploadDropzone } from "@/components/upload-dropzone";

async function upload(file: File, setProgress: (p: number) => void) {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => setProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject());
    xhr.onerror = () => reject();
    const body = new FormData();
    body.append("file", file);
    xhr.send(body);
  });
}

export function Attachments() {
  return (
    <UploadDropzone
      accept="image/*,video/*,.pdf"
      maxSize={5 * 1024 * 1024}
      onUpload={upload}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "hold-to-record",
    name: "Hold to Record",
    registryCliName: "hold-to-record",
    description:
      "A press-and-hold voice button that grows into a live waveform with a timer, cancels when you slide away, and settles into a playable voice note.",
    categorySlug: "inputs-controls",
    tags: ["voice note", "record", "audio", "microphone", "press and hold", "waveform", "chat", "framer-motion"],
    premium: false,
    trendingScore: 162,
    createdAt: "2026-10-19",
    animationKinds: ["press", "drag", "spring"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "onRecorded", type: "(result: { durationMs: number; levels: number[] }) => void", description: "Called when a recording is kept. levels holds loudness samples from 0 to 1." },
      { name: "onCancel", type: "() => void", description: "Called when a recording is cancelled by sliding left or pressing Escape." },
      { name: "onDelete", type: "() => void", description: "Called when the kept voice note is deleted." },
      { name: "maxDuration", type: "number", defaultValue: "60000", description: "Recording stops by itself after this many milliseconds." },
      { name: "minDuration", type: "number", defaultValue: "400", description: "Holds shorter than this are ignored." },
      { name: "useMicrophone", type: "boolean", defaultValue: "false", description: "Drive the waveform from the real microphone (asks for permission). Simulated otherwise." },
      { name: "cancelDistance", type: "number", defaultValue: "90", description: "How far to slide left, in pixels, before releasing cancels." },
      { name: "label", type: "string", defaultValue: '"Hold to record"', description: "Button label." },
      { name: "accent", type: "string", defaultValue: '"#ef4444"', description: "Colour of the recording dot and the live waveform." },
      { name: "className", type: "string", description: "Extra classes on the wrapper." },
    ],
    Preview: Previews.PreviewHoldToRecord,
    previewShell: "plain",
    reactSource: `"use client";

import { HoldToRecord } from "@/components/hold-to-record";

export function ChatComposer() {
  return (
    <div className="flex items-center justify-center p-8">
      <HoldToRecord
        useMicrophone
        maxDuration={120_000}
        onRecorded={({ durationMs }) => {
          console.log("Voice note", Math.round(durationMs / 1000), "s");
        }}
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "cursor-buddy",
    name: "Cursor Buddy",
    registryCliName: "cursor-buddy",
    description:
      "A soft little character whose eyes follow the pointer across the page, sliding round its curved face, blinking now and then, flinching when you come close and dozing off when left alone.",
    categorySlug: "motion-effects",
    tags: ["eyes", "cursor", "follow", "mascot", "character", "playful", "empty state", "framer-motion"],
    premium: false,
    trendingScore: 172,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "spring", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "shape", type: '"squircle" | "pill" | "circle"', defaultValue: '"squircle"', description: "Silhouette of the character." },
      { name: "fill", type: '"light" | "dark" | string', defaultValue: '"light"', description: "Body colour: the light or dark preset, or any CSS colour." },
      { name: "eyes", type: '"dots" | "slits" | "squares"', defaultValue: '"dots"', description: "Eye style." },
      { name: "size", type: "number", defaultValue: "120", description: "Height of the body in px. The pill is wider than it is tall." },
      { name: "follow", type: "number", defaultValue: "60", description: "How far the head turns towards the pointer, 0–100." },
      { name: "sleepAfter", type: "number", defaultValue: "9000", description: "Fall asleep after this many ms without pointer movement. 0 keeps it awake." },
      { name: "eyeColor", type: "string", description: "Eye colour. Defaults to ink on light bodies and white on dark ones." },
      { name: "className", type: "string", description: "Classes for the outer wrapper." },
    ],
    Preview: Previews.PreviewCursorBuddy,
    previewShell: "plain",
    reactSource: `"use client";

import { CursorBuddy } from "@/components/cursor-buddy";

export function EmptyInbox() {
  return (
    <div className="flex flex-col items-center gap-5 py-16 text-center">
      <CursorBuddy shape="squircle" eyes="dots" size={96} follow={70} />
      <div>
        <p className="text-base font-medium text-neutral-900 dark:text-white">Nothing here yet</p>
        <p className="text-sm text-neutral-500">New messages will land right here.</p>
      </div>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "dot-sphere",
    name: "Dot Sphere",
    registryCliName: "dot-sphere",
    description:
      "A slowly turning sphere of dots drawn on canvas: move the pointer across it and the dots part and spring back, drag it to spin and let go to watch it coast.",
    categorySlug: "motion-effects",
    tags: ["canvas", "sphere", "dots", "globe", "particles", "repel", "drag", "interactive", "hero visual"],
    premium: false,
    trendingScore: 168,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "drag", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "dots", type: "number", defaultValue: "420", description: "Number of dots spread over the sphere." },
      { name: "radius", type: "number", defaultValue: "130", description: "Sphere radius in px. The canvas adds room around it for dots pushed outwards." },
      { name: "color", type: "string", description: "Dot colour. Defaults to the current text colour, so it follows your theme." },
      { name: "repel", type: "number", defaultValue: "55", description: "How hard the pointer pushes dots away, 0–100." },
      { name: "speed", type: "number", defaultValue: "30", description: "Idle spin speed, 0–100." },
      { name: "interactive", type: "boolean", defaultValue: "true", description: "Let the pointer push dots and drag to spin the sphere." },
      { name: "dotSize", type: "number", defaultValue: "3.4", description: "Base dot diameter in px; front dots draw larger, back dots smaller." },
      { name: "className", type: "string", description: "Classes for the canvas element." },
    ],
    Preview: Previews.PreviewDotSphere,
    previewShell: "plain",
    reactSource: `"use client";

import { DotSphere } from "@/components/dot-sphere";

export function GlobalHero() {
  return (
    <section className="grid items-center gap-10 py-20 md:grid-cols-2">
      <div>
        <h1 className="text-5xl font-semibold tracking-tight">Everywhere at once.</h1>
        <p className="mt-4 max-w-md text-lg text-neutral-500">
          Edge regions on every continent, one deploy away.
        </p>
      </div>
      <div className="flex justify-center text-neutral-900 dark:text-white">
        <DotSphere radius={160} dots={600} repel={60} speed={25} />
      </div>
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "dynamic-island",
    name: "Dynamic Island",
    registryCliName: "dynamic-island",
    description:
      "A black pill that morphs on a spring into whatever is happening, a running timer, the track that is playing or an incoming call, and opens into live controls when tapped.",
    categorySlug: "cards",
    tags: ["dynamic island", "pill", "morph", "timer", "music player", "notification", "call", "layout animation", "framer-motion"],
    premium: false,
    trendingScore: 170,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "state", type: '"idle" | "timer" | "music" | "call"', description: "Controlled activity shown in the island." },
      { name: "defaultState", type: '"idle" | "timer" | "music" | "call"', defaultValue: '"timer"', description: "Starting activity when uncontrolled." },
      { name: "onStateChange", type: "(state: IslandState) => void", description: "Called when the island changes activity (stop, decline, or a cycle step)." },
      { name: "timerSeconds", type: "number", defaultValue: "300", description: "Length of the countdown in seconds. It really ticks." },
      { name: "accent", type: "string", defaultValue: '"#ff9f0a"', description: "Accent colour for the timer and the music bars." },
      { name: "cycle", type: "number", defaultValue: "0", description: "Uncontrolled only: step through `states` every this many ms. 0 stays put." },
      { name: "states", type: "IslandState[]", defaultValue: '["timer", "music", "call"]', description: "Activities visited by `cycle`." },
      { name: "track", type: "{ title: string; artist: string }", defaultValue: '{ title: "Midnight Drive", artist: "Neon Harbor" }', description: "Track shown in the music state." },
      { name: "caller", type: "string", defaultValue: '"Ava Lin"', description: "Name shown in the call state." },
      { name: "className", type: "string", description: "Classes for the outer wrapper." },
    ],
    Preview: Previews.PreviewDynamicIsland,
    previewShell: "plain",
    reactSource: `"use client";

import * as React from "react";
import { DynamicIsland, type IslandState } from "@/components/dynamic-island";

export function AppTopBar() {
  const [activity, setActivity] = React.useState<IslandState>("timer");

  return (
    <header className="flex justify-center pt-3">
      <DynamicIsland
        state={activity}
        onStateChange={setActivity}
        timerSeconds={25 * 60}
        accent="#ff9f0a"
        track={{ title: "Midnight Drive", artist: "Neon Harbor" }}
      />
    </header>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "otp-input",
    name: "OTP Input",
    registryCliName: "otp-input",
    description:
      "A six-box one-time-code field: digits spring in as you type, the boxes ripple while the code is checked, shake on a wrong code, and fold into a Verified pill on success.",
    categorySlug: "inputs-controls",
    tags: ["otp", "one-time code", "verification", "2fa", "pin", "input", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 168,
    createdAt: "2026-10-19",
    animationKinds: ["type", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "length", type: "number", defaultValue: "6", description: "Number of digits. The boxes split into two groups at the middle." },
      { name: "verify", type: "(code: string) => boolean | Promise<boolean>", description: "Return true when the code is valid. Runs once every box is filled." },
      { name: "onVerified", type: "(code: string) => void", description: "Called after a code verifies." },
      { name: "onResend", type: "() => void", description: "Called when “Resend code” is pressed." },
      { name: "autoplay", type: "string", description: "Types this code by itself, on a loop, until someone clicks in." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Focus ring, caret and success colour." },
    ],
    Preview: Previews.PreviewOtpInput,
    previewShell: "plain",
    reactSource: `"use client";

import { OtpInput } from "@/components/otp-input";

export function VerifyPhone() {
  return (
    <OtpInput
      verify={async (code) => {
        const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ code }) });
        return res.ok;
      }}
      onVerified={() => (window.location.href = "/welcome")}
      onResend={() => fetch("/api/verify/resend", { method: "POST" })}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "radio-cards",
    name: "Radio Cards",
    registryCliName: "radio-cards",
    description:
      "A plan picker built on real radio inputs: the selection ring glides between cards, the chosen card opens to show its features, and the button label rolls to the new plan.",
    categorySlug: "inputs-controls",
    tags: ["radio", "radio group", "plan picker", "pricing", "select", "cards", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "options", type: "RadioOption[]", description: "Each option has id, title, description, and optional meta (shown on the right) and features (chips shown when selected)." },
      { name: "defaultValue", type: "string", description: "Id of the option selected at first. Defaults to the second option." },
      { name: "onChange", type: "(id: string) => void", description: "Called when the selection changes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles through the options until someone interacts." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Ring, dot and button colour." },
    ],
    Preview: Previews.PreviewRadioCards,
    previewShell: "plain",
    reactSource: `"use client";

import { RadioCards } from "@/components/radio-cards";

export function ChoosePlan() {
  return (
    <RadioCards
      defaultValue="pro"
      onChange={(id) => console.log("plan", id)}
      options={[
        { id: "starter", title: "Starter", description: "For side projects", meta: "Free", features: ["3 sites", "Community support"] },
        { id: "pro", title: "Pro", description: "For growing products", meta: "$20/mo", features: ["Unlimited sites", "Analytics", "Custom domains"] },
        { id: "scale", title: "Scale", description: "For whole teams", meta: "$60/mo", features: ["Everything in Pro", "SSO", "Audit log"] },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "hold-to-confirm",
    name: "Hold to Confirm",
    registryCliName: "hold-to-confirm",
    description:
      "A destructive button you have to press and hold: the fill sweeps across, letting go early springs it back, and finishing bursts into a tick with an undo toast that counts down.",
    categorySlug: "inputs-controls",
    tags: ["hold", "press and hold", "delete", "destructive", "confirm", "undo", "button", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 166,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "onConfirm", type: "() => void", description: "Called once the hold completes." },
      { name: "onUndo", type: "() => void", description: "Called when Undo is pressed before the countdown runs out." },
      { name: "holdMs", type: "number", defaultValue: "1500", description: "How long the button must be held, in ms." },
      { name: "label", type: "string", defaultValue: '"Hold to Delete"', description: "Resting label." },
      { name: "holdingLabel", type: "string", defaultValue: '"Keep holding…"', description: "Label revealed by the fill." },
      { name: "doneLabel", type: "string", defaultValue: '"Project deleted"', description: "Toast text after confirming." },
      { name: "color", type: "string", defaultValue: '"#ff3b30"', description: "Fill and text colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Shows a short hold-and-release tease until someone interacts." },
    ],
    Preview: Previews.PreviewHoldToConfirm,
    previewShell: "plain",
    reactSource: `"use client";

import { HoldToConfirm } from "@/components/hold-to-confirm";

export function DangerZone({ projectId }: { projectId: string }) {
  return (
    <HoldToConfirm
      holdMs={1800}
      onConfirm={() => fetch(\`/api/projects/\${projectId}\`, { method: "DELETE" })}
      onUndo={() => fetch(\`/api/projects/\${projectId}/restore\`, { method: "POST" })}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "before-after",
    name: "Before / After",
    registryCliName: "before-after",
    description:
      "An image comparison slider with a springy handle, fading corner labels, arrow-key control and a segmented Before / Split / After jump.",
    categorySlug: "motion-effects",
    tags: ["before after", "compare", "image comparison", "slider", "photo", "drag", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 160,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "before", type: "ReactNode", description: "What shows on the left of the handle, usually an <img>." },
      { name: "after", type: "ReactNode", description: "What shows on the right of the handle." },
      { name: "beforeLabel", type: "string", defaultValue: '"Before"', description: "Top-left label." },
      { name: "afterLabel", type: "string", defaultValue: '"After"', description: "Top-right label." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps the handle every few seconds until touched." },
      { name: "className", type: "string", description: "Extra classes on the wrapper." },
    ],
    Preview: Previews.PreviewBeforeAfter,
    previewShell: "plain",
    reactSource: `"use client";

import { BeforeAfter } from "@/components/before-after";

export function GradeComparison() {
  return (
    <div className="mx-auto max-w-2xl">
      <BeforeAfter
        before={<img src="/shots/raw.jpg" alt="Unedited photo" className="h-full w-full object-cover" />}
        after={<img src="/shots/graded.jpg" alt="Colour-graded photo" className="h-full w-full object-cover" />}
        beforeLabel="Raw"
        afterLabel="Graded"
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "price-odometer",
    name: "Price Odometer",
    registryCliName: "price-odometer",
    description:
      "A seat-based pricing card whose total rolls like an odometer: each digit spins on its own spring, columns slide in as the number grows, and a Save badge pops in for yearly billing.",
    categorySlug: "pricing-sections",
    tags: ["pricing", "odometer", "rolling number", "counter", "seats", "billing toggle", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 164,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "monthlyRate", type: "number", defaultValue: "15", description: "Price per seat when billed monthly." },
      { name: "yearlyRate", type: "number", defaultValue: "12", description: "Price per seat when billed yearly. The Save badge is worked out from the two rates." },
      { name: "maxSeats", type: "number", defaultValue: "100", description: "Top of the seats slider." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Slider fill and badge colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Changes seats and billing by itself until someone interacts." },
    ],
    Preview: Previews.PreviewPriceOdometer,
    previewShell: "plain",
    reactSource: `"use client";

import { PriceOdometer, RollingNumber } from "@/components/price-odometer";

export function TeamPricing() {
  return <PriceOdometer monthlyRate={20} yearlyRate={16} maxSeats={250} />;
}

// RollingNumber works on its own too:
export function LiveCount({ value }: { value: number }) {
  return (
    <span className="text-5xl font-semibold tabular-nums">
      <RollingNumber value={value} />
    </span>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "password-strength",
    name: "Password Strength",
    registryCliName: "password-strength",
    description:
      "A password field with a four-segment meter that fills and recolours as you type, a rolling strength label, rules that tick themselves off, and an eye toggle that draws its own slash.",
    categorySlug: "signup-forms",
    tags: ["password", "strength meter", "validation", "signup", "form", "input", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 157,
    createdAt: "2026-10-19",
    animationKinds: ["type", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "onChange", type: "(value: string, score: number) => void", description: "Called on every keystroke with the password and its score from 0 to 4." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the ticked rules and the focus ring." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a sample password until someone clicks in." },
    ],
    Preview: Previews.PreviewPasswordStrength,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { PasswordStrength } from "@/components/password-strength";

export function CreatePassword() {
  const [ok, setOk] = useState(false);
  return (
    <form className="flex flex-col gap-6">
      <PasswordStrength onChange={(_, score) => setOk(score >= 3)} />
      <button disabled={!ok} className="h-12 rounded-full bg-black text-white disabled:opacity-40">
        Create account
      </button>
    </form>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tilt-pass",
    name: "Tilt Pass",
    registryCliName: "tilt-pass",
    description:
      "A membership pass that tilts towards the pointer with a moving glare and holographic sheen, casts a shadow that shifts with it, and flips over to a scannable back on click.",
    categorySlug: "three-d-components",
    tags: ["tilt", "3d card", "pass", "ticket", "membership", "holographic", "flip", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 163,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Founders Pass"', description: "Pass name on the front." },
      { name: "name", type: "string", defaultValue: '"Alex Rivera"', description: "Holder's name, front and back." },
      { name: "number", type: "string", defaultValue: '"No. 0042"', description: "Membership number." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Floats gently on its own while the pointer is away." },
    ],
    Preview: Previews.PreviewTiltPass,
    previewShell: "plain",
    reactSource: `"use client";

import { TiltPass } from "@/components/tilt-pass";

export function MemberWelcome() {
  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <TiltPass title="Backstage" name="Sam Okafor" number="No. 0318" autoplay />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "animated-tabs",
    name: "Animated Tabs",
    registryCliName: "animated-tabs",
    description:
      "A settings panel with a sliding segmented control: rows slide in from the side you moved towards, the panel resizes to fit, and each row has an iOS-style switch whose knob stretches while pressed.",
    categorySlug: "inputs-controls",
    tags: ["tabs", "segmented control", "switch", "toggle", "settings", "ios", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#34c759"', description: "Colour of a switch that is on." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Flips switches and changes tabs until someone interacts." },
    ],
    Preview: Previews.PreviewAnimatedTabs,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { AnimatedTabs, Switch } from "@/components/animated-tabs";

export function SettingsPage() {
  return <AnimatedTabs />;
}

// The switch is exported on its own as well:
export function WifiRow() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center justify-between">
      <span>Wi-Fi</span>
      <Switch label="Wi-Fi" checked={on} onChange={setOn} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "shared-element-cards",
    name: "Shared Element Cards",
    registryCliName: "shared-element-cards",
    description:
      "Story cards that open into a sheet with a shared-element transition: the artwork, eyebrow and title travel from the card into place, then the body fades in. Closes with Escape or a click outside.",
    categorySlug: "cards",
    tags: ["shared element", "layoutId", "expand", "modal", "sheet", "cards", "app store", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 155,
    createdAt: "2026-10-19",
    animationKinds: ["press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "StoryCard[]", description: "Each card has id, eyebrow, title, art (any CSS background) and body paragraphs." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and closes the cards by itself until someone interacts." },
    ],
    Preview: Previews.PreviewSharedElementCards,
    previewShell: "plain",
    reactSource: `"use client";

import { SharedElementCards } from "@/components/shared-element-cards";

export function Stories() {
  return (
    <SharedElementCards
      cards={[
        {
          id: "launch",
          eyebrow: "New",
          title: "Launch week",
          art: "linear-gradient(135deg,#ffd1e0,#c7d7ff)",
          body: ["Five days, five releases.", "Follow along as each one ships."],
        },
        {
          id: "night",
          eyebrow: "Tonight",
          title: "Quiet hours",
          art: "linear-gradient(135deg,#1c1c3a,#5e5ce6)",
          body: ["Notifications pause from 10pm to 7am."],
        },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "rotating-headline",
    name: "Rotating Headline",
    registryCliName: "rotating-headline",
    description:
      "A hero headline whose words arrive one by one out of a blur, ending on a word that keeps rolling to the next, with a subline that follows word by word and a replay button.",
    categorySlug: "motion-effects",
    tags: ["headline", "text rotate", "word swap", "hero", "blur in", "typography", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 154,
    createdAt: "2026-10-19",
    animationKinds: ["layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "lead", type: "string", defaultValue: '"Built to"', description: "The words that stay put." },
      { name: "words", type: "string[]", defaultValue: '["move.", "delight.", "last.", "ship."]', description: "Words that take turns at the end." },
      { name: "sub", type: "string", description: "Subline under the headline." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the rotating word." },
      { name: "interval", type: "number", defaultValue: "2000", description: "Milliseconds between word changes." },
    ],
    Preview: Previews.PreviewRotatingHeadline,
    previewShell: "plain",
    reactSource: `"use client";

import { RotatingHeadline } from "@/components/rotating-headline";

export function Hero() {
  return (
    <section className="py-24">
      <RotatingHeadline lead="Made for" words={["founders.", "designers.", "teams."]} sub="One kit, every launch." accent="#ff375f" />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "stretch-nav",
    name: "Stretch Nav",
    registryCliName: "stretch-nav",
    description:
      "A pill navigation whose active capsule moves its leading edge first and lets the trailing edge catch up, so it stretches towards the next item and snaps back to size, with a soft hover pill that follows the pointer.",
    categorySlug: "navbars",
    tags: ["navigation", "nav", "tabs", "pill", "stretch", "segmented", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "string[]", defaultValue: '["Home", "Work", "Writing", "About", "Contact"]', description: "Item labels, left to right." },
      { name: "defaultIndex", type: "number", defaultValue: "0", description: "Item active at first." },
      { name: "onChange", type: "(index: number) => void", description: "Called when an item is picked." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Moves between items by itself until someone interacts." },
    ],
    Preview: Previews.PreviewStretchNav,
    previewShell: "plain",
    reactSource: `"use client";

import { usePathname, useRouter } from "next/navigation";
import { StretchNav } from "@/components/stretch-nav";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/writing" },
  { label: "About", href: "/about" },
];

export function SiteNav() {
  const router = useRouter();
  const path = usePathname();
  const current = Math.max(0, LINKS.findIndex((l) => l.href === path));
  return <StretchNav items={LINKS.map((l) => l.label)} defaultIndex={current} onChange={(i) => router.push(LINKS[i].href)} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "feedback-pill",
    name: "Feedback Pill",
    registryCliName: "feedback-pill",
    description:
      "A small Feedback pill that morphs into a note form, shows a spinner in the Send button while it posts, then shrinks into a thank-you before folding back into the pill.",
    categorySlug: "inputs-controls",
    tags: ["feedback", "form", "morph", "popover", "textarea", "widget", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-19",
    animationKinds: ["press", "type", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "onSend", type: "(message: string) => void | Promise<void>", description: "Called with the message. The spinner shows until it resolves." },
      { name: "label", type: "string", defaultValue: '"Feedback"', description: "Pill label and form title." },
      { name: "placeholder", type: "string", defaultValue: '"What would make this better?"', description: "Textarea placeholder." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Send button and focus colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens, types and sends a sample message until someone interacts." },
    ],
    Preview: Previews.PreviewFeedbackPill,
    previewShell: "plain",
    reactSource: `"use client";

import { FeedbackPill } from "@/components/feedback-pill";

export function FeedbackCorner() {
  return (
    <div className="fixed bottom-6 right-6">
      <FeedbackPill
        onSend={(message) =>
          fetch("/api/feedback", { method: "POST", body: JSON.stringify({ message, page: location.pathname }) }).then(() => undefined)
        }
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "stagger-menu",
    name: "Stagger Menu",
    registryCliName: "stagger-menu",
    description:
      "A share menu that unfolds from its button with the items arriving one after another, a highlight that glides between rows, arrow-key navigation, and a button label that rolls to confirm what you picked.",
    categorySlug: "inputs-controls",
    tags: ["menu", "dropdown", "share", "context menu", "stagger", "keyboard", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-19",
    animationKinds: ["press", "hover", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "MenuItem[]", description: "Each item has id, label, icon, and optional danger (red, after a divider) and done (the confirmation shown in the button)." },
      { name: "onSelect", type: "(id: string) => void", description: "Called with the id of the picked item." },
      { name: "label", type: "string", defaultValue: '"Share"', description: "Button label." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and browses the menu by itself until someone interacts." },
    ],
    Preview: Previews.PreviewStaggerMenu,
    previewShell: "plain",
    reactSource: `"use client";

import { StaggerMenu } from "@/components/stagger-menu";

export function ShareButton({ url }: { url: string }) {
  return (
    <StaggerMenu
      onSelect={(id) => {
        if (id === "link") navigator.clipboard.writeText(url);
        if (id === "email") window.location.href = \`mailto:?body=\${encodeURIComponent(url)}\`;
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ruler-picker",
    name: "Ruler Picker",
    registryCliName: "ruler-picker",
    description:
      "A duration picker you fling like a ruler: it glides with momentum and snaps to whole units, the big number rolls in the direction you moved, and presets spring the ruler into place.",
    categorySlug: "inputs-controls",
    tags: ["ruler", "picker", "slider", "duration", "timer", "momentum", "drag", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 155,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "min", type: "number", defaultValue: "0", description: "Smallest value." },
      { name: "max", type: "number", defaultValue: "90", description: "Largest value." },
      { name: "defaultValue", type: "number", defaultValue: "25", description: "Starting value." },
      { name: "unit", type: "string", defaultValue: '"min"', description: "Unit shown after the number. Values of 60 and up show as hours." },
      { name: "presets", type: "number[]", defaultValue: "[5, 15, 30, 60]", description: "Quick-pick buttons under the ruler." },
      { name: "accent", type: "string", defaultValue: '"#ff9f0a"', description: "Needle and selected preset colour." },
      { name: "onChange", type: "(value: number) => void", description: "Called as the value changes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Glides between presets until someone interacts." },
    ],
    Preview: Previews.PreviewRulerPicker,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { RulerPicker } from "@/components/ruler-picker";

export function FocusTimer() {
  const [minutes, setMinutes] = useState(25);
  return (
    <div className="flex flex-col items-center gap-6">
      <RulerPicker defaultValue={minutes} onChange={setMinutes} />
      <button className="h-11 rounded-full bg-[#0071e3] px-6 text-white">Start {minutes} min focus</button>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "elastic-stepper",
    name: "Elastic Stepper",
    registryCliName: "elastic-stepper",
    description:
      "A plus / minus stepper whose number rolls up or down, with a dot track that stretches to the current value and a rubber-band bounce when you push past either limit.",
    categorySlug: "inputs-controls",
    tags: ["stepper", "counter", "quantity", "number input", "guests", "rubber band", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 150,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: '"Guests"', description: "What is being counted; also used for the button labels." },
      { name: "min", type: "number", defaultValue: "1", description: "Lowest value." },
      { name: "max", type: "number", defaultValue: "8", description: "Highest value." },
      { name: "defaultValue", type: "number", defaultValue: "2", description: "Starting value." },
      { name: "onChange", type: "(value: number) => void", description: "Called when the value changes." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Dot track colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Counts up and down by itself until someone interacts." },
    ],
    Preview: Previews.PreviewElasticStepper,
    previewShell: "plain",
    reactSource: `"use client";

import { ElasticStepper } from "@/components/elastic-stepper";

export function TableBooking() {
  return <ElasticStepper label="Guests" min={1} max={12} defaultValue={2} onChange={(n) => console.log(n)} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "todo-list",
    name: "Todo List",
    registryCliName: "todo-list",
    description:
      "A task list where ticking a task draws a check, strikes the text through and drops it out of the list into a Completed drawer with a counter that pops, plus quick add and undo.",
    categorySlug: "cards",
    tags: ["todo", "tasks", "checklist", "checkbox", "list", "productivity", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-19",
    animationKinds: ["press", "type", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "initial", type: "string[]", description: "Tasks shown at first." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Check and counter colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Ticks tasks off by itself until someone interacts." },
    ],
    Preview: Previews.PreviewTodoList,
    previewShell: "plain",
    reactSource: `"use client";

import { TodoList } from "@/components/todo-list";

export function LaunchChecklist() {
  return <TodoList initial={["Write release notes", "Record the demo", "Update pricing page", "Email beta users"]} accent="#34c759" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "progress-button",
    name: "Progress Button",
    registryCliName: "progress-button",
    description:
      "A button that becomes its own progress bar: it stretches, fills as the work runs with a live percentage, then turns green with a drawn check and a new label.",
    categorySlug: "inputs-controls",
    tags: ["button", "progress", "download", "loading", "upload", "state", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "task", type: "(onProgress: (p: number) => void) => Promise<void>", description: "Run the work and report progress from 0 to 1. Simulated if left out." },
      { name: "label", type: "string", defaultValue: '"Download"', description: "Resting label." },
      { name: "doneLabel", type: "string", defaultValue: '"Open file"', description: "Label once finished." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Button and fill colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Runs itself on a loop until someone interacts." },
    ],
    Preview: Previews.PreviewProgressButton,
    previewShell: "plain",
    reactSource: `"use client";

import { ProgressButton } from "@/components/progress-button";

export function ExportButton() {
  return (
    <ProgressButton
      label="Export video"
      doneLabel="Show in folder"
      task={async (onProgress) => {
        const job = await fetch("/api/export", { method: "POST" }).then((r) => r.json());
        for (let p = 0; p < 1; ) {
          p = await fetch(\`/api/export/\${job.id}\`).then((r) => r.json()).then((j) => j.progress);
          onProgress(p);
          await new Promise((r) => setTimeout(r, 400));
        }
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "copy-button",
    name: "Copy Button",
    registryCliName: "copy-button",
    description:
      "Two copy controls: an ID chip whose icon morphs into a check under a ripple and a Copied tooltip, and a command line whose button rolls from Copy to Copied.",
    categorySlug: "inputs-controls",
    tags: ["copy", "clipboard", "copy to clipboard", "api key", "command", "chip", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "value", type: "string", description: "CopyChip: the text written to the clipboard." },
      { name: "display", type: "string", description: "CopyChip: what the chip shows, such as a shortened ID. Defaults to value." },
      { name: "label", type: "string", defaultValue: '"Copy"', description: "CopyChip: start of the accessible label." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "CopyChip: ripple and check colour." },
      { name: "command", type: "string", description: "CopyCommand: the shell command shown and copied." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Both: copy by themselves every few seconds until someone interacts." },
    ],
    Preview: Previews.PreviewCopyButton,
    previewShell: "plain",
    reactSource: `"use client";

import { CopyChip, CopyCommand } from "@/components/copy-button";

export function ApiKeyRow({ keyId }: { keyId: string }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <CopyChip value={keyId} display={\`\${keyId.slice(0, 7)}…\${keyId.slice(-4)}\`} />
      <CopyCommand command="npx shadcn@latest add @nexus-labs/copy-button" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "animated-icons",
    name: "Animated Icons",
    registryCliName: "animated-icons",
    description:
      "Eight toggle icons with their own small stories: menu to close, play morphing into pause, a heart that bursts, a bell that rings, sun turning to moon, a bookmark that fills, sound muting and a lock that springs open.",
    categorySlug: "motion-effects",
    tags: ["icons", "animated icons", "toggle", "svg", "morph", "micro-interactions", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["press", "hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "on", type: "boolean", description: "Each icon (MenuIcon, PlayIcon, HeartIcon, BellIcon, ThemeIcon, BookmarkIcon, VolumeIcon, LockIcon) takes its state as on." },
      { name: "burst", type: "number", description: "HeartIcon only: increase it to play a new burst." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "AnimatedIcons grid only: toggles the icons in turn until someone interacts." },
    ],
    Preview: Previews.PreviewAnimatedIcons,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { MenuIcon, ThemeIcon } from "@/components/animated-icons";

export function HeaderControls() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  return (
    <div className="flex gap-2">
      <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <MenuIcon on={open} />
      </button>
      <button aria-label="Toggle dark mode" aria-pressed={dark} onClick={() => setDark((d) => !d)}>
        <ThemeIcon on={dark} />
      </button>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "folder-peek",
    name: "Folder Peek",
    registryCliName: "folder-peek",
    description:
      "A folder that tips its front panel back on hover or focus while a document, a photo and a chart fan out of it, then tuck back in when you leave.",
    categorySlug: "cards",
    tags: ["folder", "files", "hover", "3d", "fan out", "documents", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Brand assets"', description: "Folder name." },
      { name: "meta", type: "string", defaultValue: '"24 files · Updated today"', description: "Line under the name." },
      { name: "color", type: "string", defaultValue: '"#0071e3"', description: "Folder colour; the back panel is drawn a shade darker." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and closes by itself until someone hovers it." },
    ],
    Preview: Previews.PreviewFolderPeek,
    previewShell: "plain",
    reactSource: `"use client";

import { FolderPeek } from "@/components/folder-peek";

export function ProjectFolders() {
  return (
    <div className="grid grid-cols-2 gap-10 pt-16">
      <FolderPeek title="Launch kit" meta="12 files · Edited 2h ago" color="#34c759" />
      <FolderPeek title="Brand assets" meta="24 files · Updated today" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "magnify-dock",
    name: "Magnify Dock",
    registryCliName: "magnify-dock",
    description:
      "A macOS-style app dock: icons swell as the pointer passes over them, show a label above, bounce when launched and keep a running dot underneath.",
    categorySlug: "navbars",
    tags: ["dock", "macos", "magnify", "app icons", "launcher", "toolbar", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 157,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "press", "spring", "magnetic"],
    dependencies: ["framer-motion"],
    props: [
      { name: "apps", type: "DockApp[]", description: "Each app has id, label, bg (any CSS background) and glyph (an icon)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps an invisible pointer across the dock until someone hovers it." },
    ],
    Preview: Previews.PreviewMagnifyDock,
    previewShell: "plain",
    reactSource: `"use client";

import { MagnifyDock } from "@/components/magnify-dock";

export function AppDock() {
  return (
    <div className="fixed inset-x-0 bottom-4 flex justify-center">
      <MagnifyDock />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "upload-chips",
    name: "Upload Chips",
    registryCliName: "upload-chips",
    description:
      "A drop zone that lifts and tints while you drag over it, then turns every file into a chip with a filling progress bar, a progress ring and a check when it lands.",
    categorySlug: "inputs-controls",
    tags: ["upload", "file upload", "dropzone", "progress", "drag and drop", "attachments", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "press", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "upload", type: "(file: File | { name: string; size: number }, onProgress: (p: number) => void) => Promise<void>", description: "Upload one file and report progress from 0 to 1. Simulated if left out." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Drag highlight, progress and check colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Drops sample files in by itself until someone interacts." },
    ],
    Preview: Previews.PreviewUploadChips,
    previewShell: "plain",
    reactSource: `"use client";

import { UploadChips } from "@/components/upload-chips";

export function Attachments() {
  return (
    <UploadChips
      upload={(file, onProgress) =>
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => onProgress(e.loaded / e.total);
          xhr.onload = () => resolve();
          xhr.onerror = reject;
          xhr.open("POST", "/api/upload");
          xhr.send(file as File);
        })
      }
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "notification-stack",
    name: "Notification Stack",
    registryCliName: "notification-stack",
    description:
      "Toasts that pile into a neat stack, spread out while hovered (pausing their timers), swipe away sideways, and turn a loading toast into a success when the work finishes.",
    categorySlug: "cards",
    tags: ["toast", "notifications", "stack", "swipe", "promise", "sonner", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 150,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Pushes sample toasts by itself until someone presses a trigger." },
    ],
    Preview: Previews.PreviewNotificationStack,
    previewShell: "plain",
    reactSource: `"use client";

import { NotificationStack } from "@/components/notification-stack";

export function NotificationsDemo() {
  return (
    <div className="mx-auto max-w-md py-10">
      <NotificationStack />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "island-morph",
    name: "Island Morph",
    registryCliName: "island-morph",
    description:
      "A black pill that morphs between a timer, an incoming call and a full music player, with each state's content blurring in once the shape lands.",
    categorySlug: "motion-effects",
    tags: ["dynamic island", "morph", "live activity", "music player", "call", "timer", "ios", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-19",
    animationKinds: ["press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles through idle, timer, call and music until a control is pressed." },
    ],
    Preview: Previews.PreviewIslandMorph,
    previewShell: "plain",
    reactSource: `"use client";

import { IslandMorph } from "@/components/island-morph";

export function PhoneMockupTop() {
  return (
    <div className="flex justify-center pt-4">
      <IslandMorph autoplay />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "lanyard-badge",
    name: "Lanyard Badge",
    registryCliName: "lanyard-badge",
    description:
      "A conference badge hanging from a strap. Grab it and throw it around; it swings back as a damped pendulum and twists with its sideways speed.",
    categorySlug: "cards",
    tags: ["badge", "lanyard", "pendulum", "physics", "drag", "conference", "id card", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "name", type: "string", defaultValue: '"Alex Rivera"', description: "Attendee name; the avatar shows its initials." },
      { name: "role", type: "string", defaultValue: '"Design Engineer"', description: "Line under the name." },
      { name: "event", type: "string", defaultValue: '"Motion Summit"', description: "Event name printed at the top (followed by 2026)." },
      { name: "tag", type: "string", defaultValue: '"Speaker"', description: "Label on the coloured band at the bottom of the badge." },
      { name: "strap", type: "string", defaultValue: '"#0071e3"', description: "Strap, band and avatar colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Gives the badge a nudge every few seconds until someone grabs it." },
    ],
    Preview: Previews.PreviewLanyardBadge,
    previewShell: "plain",
    reactSource: `"use client";

import { LanyardBadge } from "@/components/lanyard-badge";

export function SpeakerBadge() {
  return (
    <div className="flex justify-center">
      <LanyardBadge name="Priya Sharma" role="Staff Engineer" event="Motion Summit" tag="Speaker" strap="#ff375f" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "glass-lens",
    name: "Glass Lens",
    registryCliName: "glass-lens",
    description:
      "A glass puck you drag over content. It magnifies the centre and splits colour toward the rim, built from three offset copies of the content instead of a shader.",
    categorySlug: "motion-effects",
    tags: ["magnifier", "lens", "glass", "chromatic aberration", "zoom", "drag", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "size", type: "number", defaultValue: "150", description: "Lens diameter in px." },
      { name: "zoom", type: "number", defaultValue: "1.45", description: "Magnification at the centre of the lens." },
      { name: "width", type: "number", defaultValue: "520", description: "Width of the content surface in px." },
      { name: "height", type: "number", defaultValue: "300", description: "Height of the content surface in px." },
      { name: "children", type: "ReactNode", defaultValue: "Field notes text", description: "Content under the glass. It is rendered four times (page plus three lens layers), so keep it static." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Drifts across the content by itself until the user drags it." },
    ],
    Preview: Previews.PreviewGlassLens,
    previewShell: "plain",
    reactSource: `"use client";

import { GlassLens } from "@/components/glass-lens";

export function FinePrint() {
  return (
    <GlassLens size={140} zoom={1.6} width={480} height={280}>
      <div className="flex h-full flex-col justify-center gap-2 px-8">
        <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">Terms</p>
        <p className="m-0 text-[14px] leading-[1.5] text-[#1d1d1f] dark:text-[#f5f5f7]">
          Cancel any time before the trial ends and you will not be charged. Plans renew monthly.
        </p>
      </div>
    </GlassLens>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ascii-wake",
    name: "ASCII Wake",
    registryCliName: "ascii-wake",
    description:
      "Your pointer leaves a trail of characters that thickens where you linger and thins as it ages. Switch the glyph set, or let the glyphs follow the direction you moved.",
    categorySlug: "background-effects",
    tags: ["ascii", "canvas", "pointer trail", "glyphs", "cursor", "generative", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "height", type: "number", defaultValue: "300", description: "Height of the field in px; it fills the available width." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the glyphs right under the pointer." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Draws a looping path by itself while the pointer is away." },
    ],
    Preview: Previews.PreviewAsciiWake,
    previewShell: "plain",
    reactSource: `"use client";

import { AsciiWake } from "@/components/ascii-wake";

export function TerminalHero() {
  return (
    <section className="mx-auto w-full max-w-[640px]">
      <AsciiWake height={260} accent="#30d158" autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "liquid-dial",
    name: "Liquid Dial",
    registryCliName: "liquid-dial",
    description:
      "A floating action button whose actions bud out of it like liquid. The highlight is two blobs on different springs, so it pulls into a thread before wrapping the next action.",
    categorySlug: "inputs-controls",
    tags: ["fab", "action menu", "speed dial", "gooey", "svg filter", "radial menu", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 157,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "actions", type: "LiquidDialAction[]", defaultValue: "Photo, Note, Voice memo, Link", description: "Up to four actions ({ id, label, d }) laid out on an arc; d is SVG path data in a 24×24 box." },
      { name: "color", type: "string", defaultValue: '"#1d1d1f"', description: "Blob colour. Left unset it is near-black, or #3a3a3c in dark mode." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Highlight blob and focus ring colour. Left unset it is #0071e3, or #0a84ff in dark mode." },
      { name: "onSelect", type: "(id: string) => void", defaultValue: "undefined", description: "Called with the action id when an action is picked." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and browses by itself until the user interacts." },
    ],
    Preview: Previews.PreviewLiquidDial,
    previewShell: "plain",
    reactSource: `"use client";

import { LiquidDial } from "@/components/liquid-dial";

export function ComposeButton() {
  return (
    <LiquidDial
      accent="#ff375f"
      onSelect={(id) => console.log("create", id)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "voice-orb",
    name: "Voice Orb",
    registryCliName: "voice-orb",
    description:
      "One shape for an assistant's four states. Hold it to talk: a dotted ring becomes a glow, a dark thinking sphere, then a churning voice.",
    categorySlug: "ai-components",
    tags: ["voice", "assistant", "orb", "ai", "push to talk", "blob", "states", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 159,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the glow and the middle of the listening/speaking gradient." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Walks through listening, thinking and speaking by itself until pressed." },
    ],
    Preview: Previews.PreviewVoiceOrb,
    previewShell: "plain",
    reactSource: `"use client";

import { VoiceOrb } from "@/components/voice-orb";

export function AssistantPanel() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <p className="m-0 text-[15px] text-[#6e6e73]">How can I help?</p>
      <VoiceOrb accent="#bf5af2" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "sagging-field",
    name: "Sagging Field",
    registryCliName: "sagging-field",
    description:
      "A text field that bends under the weight of what you type. Letters ride the curve on springs, anything that runs past the end falls off, and Let it go drops the whole lot.",
    categorySlug: "inputs-controls",
    tags: ["input", "text field", "playful", "physics", "letters", "typing", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-19",
    animationKinds: ["type", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: '"What\'s weighing on you?"', description: "Heading shown above the field and used as its label." },
      { name: "width", type: "number", defaultValue: "400", description: "Field width in pixels." },
      { name: "maxChars", type: "number", defaultValue: "34", description: "How many characters it takes to reach the full sag." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Focus outline and caret colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a heavy sentence and lets it go by itself until someone clicks in." },
    ],
    Preview: Previews.PreviewSaggingField,
    previewShell: "plain",
    reactSource: `"use client";

import { SaggingField } from "@/components/sagging-field";

export function WorryJournal() {
  return (
    <section className="flex flex-col items-center py-16">
      <SaggingField label="What's on your mind today?" maxChars={40} accent="#ff375f" />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tear-off-ticket",
    name: "Tear-off Ticket",
    registryCliName: "tear-off-ticket",
    description:
      "An event ticket whose stub you pull away along the perforation. Let go early and it snaps back; pull through and it hangs on the last tooth, swings, then drops.",
    categorySlug: "cards",
    tags: ["ticket", "event", "stub", "drag", "tear", "pass", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Light & Matter"', description: "Event name." },
      { name: "venue", type: "string", defaultValue: '"Hall 3 · North Gallery"', description: "First detail line." },
      { name: "date", type: "string", defaultValue: '"Sat 14 Nov · 11:00"', description: "Second detail line." },
      { name: "seat", type: "string", defaultValue: '"Row C · Seat 12"', description: "Seat shown on the stub." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Tugs, tears and resets on a loop until someone grabs the stub." },
    ],
    Preview: Previews.PreviewTearOffTicket,
    previewShell: "plain",
    reactSource: `"use client";

import { TearOffTicket } from "@/components/tear-off-ticket";

export function CheckInTicket() {
  return (
    <div className="flex justify-center py-16">
      <TearOffTicket title="Night Market" venue="Pier 9 · Lower Deck" date="Fri 20 Nov · 19:30" seat="General admission" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "throw-wheel",
    name: "Throw Wheel",
    registryCliName: "throw-wheel",
    description:
      "Cards on a 3D drum you can fling. While it spins every card turns edge-on and blurs with speed, then they straighten one by one as the wheel snaps a card to the front.",
    categorySlug: "three-d-components",
    tags: ["carousel", "3d", "wheel", "cards", "inertia", "drag", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "WheelCard[]", description: "Each card has title, sub and art (any CSS background). Ten travel destinations by default." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Throws the wheel every few seconds until someone grabs it." },
    ],
    Preview: Previews.PreviewThrowWheel,
    previewShell: "plain",
    reactSource: `"use client";

import { ThrowWheel, type WheelCard } from "@/components/throw-wheel";

const collections: WheelCard[] = [
  { title: "Ceramics", sub: "42 pieces", art: "linear-gradient(160deg,#ffd6e7,#c49bff 60%,#5e5ce6)" },
  { title: "Textiles", sub: "18 pieces", art: "linear-gradient(160deg,#ffe58a,#ffcc00 50%,#ff9f0a)" },
  { title: "Glass", sub: "27 pieces", art: "linear-gradient(160deg,#c6f1ff,#64d2ff 50%,#0a84ff)" },
  { title: "Prints", sub: "65 pieces", art: "linear-gradient(160deg,#b7f7c5,#30d158 55%,#0b8f6a)" },
  { title: "Lighting", sub: "11 pieces", art: "linear-gradient(160deg,#ffc9a3,#ff9f0a 50%,#d1495b)" },
  { title: "Furniture", sub: "33 pieces", art: "linear-gradient(160deg,#dbe9ff,#8fb5ff 50%,#30486e)" },
  { title: "Jewellery", sub: "54 pieces", art: "linear-gradient(160deg,#ffb3c7,#ff6482 60%,#bf5af2)" },
  { title: "Books", sub: "90 pieces", art: "linear-gradient(160deg,#ffe2b8,#ffb36b 50%,#5ac8fa)" },
];

export function CollectionPicker() {
  return <ThrowWheel cards={collections} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "pixel-select",
    name: "Pixel Select",
    registryCliName: "pixel-select",
    description:
      "A dropdown that builds itself out of a grid of pixels tinted with the chosen colour, then dissolves into a falling shower of them when you pick an option.",
    categorySlug: "inputs-controls",
    tags: ["select", "dropdown", "listbox", "pixels", "mood", "menu", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-19",
    animationKinds: ["press", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "options", type: "Mood[]", description: "Each option has id, label and color; the pixels take the selected option's colour. Six moods by default." },
      { name: "onChange", type: "(id: string) => void", description: "Called with the option id when the user picks one." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and picks options by itself until someone interacts." },
    ],
    Preview: Previews.PreviewPixelSelect,
    previewShell: "plain",
    reactSource: `"use client";

import { PixelSelect, type Mood } from "@/components/pixel-select";

const themes: Mood[] = [
  { id: "ocean", label: "Ocean", color: "#0a84ff" },
  { id: "forest", label: "Forest", color: "#30d158" },
  { id: "sunset", label: "Sunset", color: "#ff9f0a" },
  { id: "berry", label: "Berry", color: "#ff375f" },
];

export function ThemePicker({ onTheme }: { onTheme: (id: string) => void }) {
  return <PixelSelect options={themes} onChange={onTheme} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "scrub-inputs",
    name: "Scrub Inputs",
    registryCliName: "scrub-inputs",
    description:
      "Design-tool number fields: drag a label sideways to change the value, with Shift for big steps and Alt for fine ones. A badge shows how far you have moved, then reports the change when you let go.",
    categorySlug: "inputs-controls",
    tags: ["number input", "scrub", "drag", "inspector", "design tool", "slider", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 150,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", description: "ScrubInput: field name; dragging it changes the value." },
      { name: "value", type: "number", description: "ScrubInput: the current value (controlled)." },
      { name: "onChange", type: "(v: number) => void", description: "ScrubInput: called with each new value while dragging, typing or using the arrow keys." },
      { name: "min", type: "number", description: "ScrubInput: lowest allowed value." },
      { name: "max", type: "number", description: "ScrubInput: highest allowed value." },
      { name: "step", type: "number", defaultValue: "1", description: "ScrubInput: change per two pixels of drag and per arrow key press." },
      { name: "unit", type: "string", defaultValue: '""', description: "ScrubInput: suffix shown after the number and in the change badge." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Both: badge colour while dragging; ScrubInputs also starts its sample shape's gradient with it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "ScrubInputs: changes the three sample fields by itself until someone touches them." },
    ],
    Preview: Previews.PreviewScrubInputs,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { ScrubInput } from "@/components/scrub-inputs";

export function LayerInspector() {
  const [opacity, setOpacity] = useState(100);
  const [blur, setBlur] = useState(0);

  return (
    <div className="flex w-[240px] flex-col gap-2.5">
      <ScrubInput label="Opacity" value={opacity} onChange={setOpacity} min={0} max={100} unit="%" />
      <ScrubInput label="Blur" value={blur} onChange={setBlur} min={0} max={40} step={0.5} unit="px" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "lit-keyboard",
    name: "Lit Keyboard",
    registryCliName: "lit-keyboard",
    description:
      "A tilted keyboard that lights up under your typing and fades with a slow afterglow. Record a run and replay it with the original timing.",
    categorySlug: "motion-effects",
    tags: ["keyboard", "typing", "keys", "glow", "record", "replay", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-19",
    animationKinds: ["type", "press", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "glow", type: "string", defaultValue: '"#ff9f0a"', description: "Colour a key flashes to when pressed. Use a hex colour; the glow adds alpha to it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a sample phrase by itself every few seconds until someone types." },
    ],
    Preview: Previews.PreviewLitKeyboard,
    previewShell: "plain",
    reactSource: `"use client";

import { LitKeyboard } from "@/components/lit-keyboard";

export function TypingHero() {
  return (
    <section className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-8 py-16">
      <h2 className="text-3xl font-semibold tracking-tight">Shortcuts for everything</h2>
      <LitKeyboard glow="#0a84ff" autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ripple-field",
    name: "Ripple Field",
    registryCliName: "ripple-field",
    description:
      "A quiet grid of dots: click anywhere and a ring travels outward. Every dot it crosses bursts into colour, gets kicked away from the centre and springs back home.",
    categorySlug: "background-effects",
    tags: ["dots", "ripple", "canvas", "grid", "click effect", "springs", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 150,
    createdAt: "2026-10-19",
    animationKinds: ["press", "hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "height", type: "number", defaultValue: "300", description: "Height of the field in px; it fills the available width." },
      { name: "gap", type: "number", defaultValue: "18", description: "Distance between dots in px." },
      { name: "colors", type: "string[]", defaultValue: "RIPPLE_FIELD_PALETTE", description: "Colours a dot can burst into; one is picked at random each time a ring hits it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Drops rings at random spots until someone clicks." },
    ],
    Preview: Previews.PreviewRippleField,
    previewShell: "plain",
    reactSource: `"use client";

import { RippleField } from "@/components/ripple-field";

export function LaunchBanner() {
  return (
    <section className="mx-auto w-full max-w-[720px]">
      <RippleField height={260} gap={16} colors={["#0a84ff", "#64d2ff", "#bf5af2"]} autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "dot-globe",
    name: "Dot Globe",
    registryCliName: "dot-globe",
    description:
      "A dotted globe with flight arcs drawing themselves along great circles. Drag to spin it and it coasts to a stop; pick a city and it springs round to face you.",
    categorySlug: "three-d-components",
    tags: ["globe", "map", "canvas", "flights", "arcs", "world", "inertia", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "size", type: "number", defaultValue: "340", description: "Width and height of the globe canvas in px." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the arcs, pins and the selected city chip." },
      { name: "cities", type: "DotGlobeCity[]", defaultValue: "DOT_GLOBE_CITIES", description: "Cities to pin and list as chips. Each has id, name, lat and lon." },
      { name: "routes", type: "[string, string][]", defaultValue: "DOT_GLOBE_ROUTES", description: "Flight arcs as pairs of city ids; pairs with an unknown id are skipped." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Turns slowly and tours the cities until someone drags or picks one." },
    ],
    Preview: Previews.PreviewDotGlobe,
    previewShell: "plain",
    reactSource: `"use client";

import { DotGlobe, type DotGlobeCity } from "@/components/dot-globe";

const offices: DotGlobeCity[] = [
  { id: "ber", name: "Berlin", lat: 52.52, lon: 13.4 },
  { id: "nyc", name: "New York", lat: 40.71, lon: -74.01 },
  { id: "sgp", name: "Singapore", lat: 1.35, lon: 103.82 },
];

export function OfficesMap() {
  return (
    <DotGlobe
      size={360}
      accent="#30d158"
      cities={offices}
      routes={[["ber", "nyc"], ["ber", "sgp"]]}
      autoplay
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "component-layers",
    name: "Component Layers",
    registryCliName: "component-layers",
    description:
      "A finished music player card tips into an isometric view and peels apart into its surface, spacing, layout and content layers, each with a leader-line label.",
    categorySlug: "three-d-components",
    tags: ["exploded view", "isometric", "layers", "design system", "anatomy", "3d", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-19",
    animationKinds: ["3d", "spring", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Used in the cover art and for the hovered layer's outline and leader line." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Explodes and assembles on a loop until someone uses the toggle." },
    ],
    Preview: Previews.PreviewComponentLayers,
    previewShell: "plain",
    reactSource: `"use client";

import { ComponentLayers } from "@/components/component-layers";

export function AnatomySection() {
  return (
    <section className="flex flex-col items-center gap-6 py-20">
      <h2 className="text-3xl font-semibold tracking-tight">Built from four layers</h2>
      <ComponentLayers accent="#bf5af2" autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "standing-calendar",
    name: "Standing Calendar",
    registryCliName: "standing-calendar",
    description:
      "A contribution grid that stands up into a 3D field of columns. Each day becomes a box as tall as its count, rising in a wave across the weeks; hover a day to read its value.",
    categorySlug: "dashboards",
    tags: ["contribution graph", "heatmap", "calendar", "activity", "3d", "isometric", "chart", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["3d", "spring", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "weeks", type: "number", defaultValue: "30", description: "How many weeks of sample data to draw. Ignored when data is passed." },
      { name: "data", type: "number[][]", description: "Your own counts: one array of 7 numbers (Mon to Sun) per week. Sample data is generated if left out." },
      { name: "levels", type: "string[]", defaultValue: "STANDING_CALENDAR_LEVELS", description: "Five colours from no activity to busiest. The default empty colour follows light and dark mode." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Stands up and lies down on a loop until someone interacts." },
    ],
    Preview: Previews.PreviewStandingCalendar,
    previewShell: "plain",
    reactSource: `"use client";

import { StandingCalendar } from "@/components/standing-calendar";

export function ActivityCard({ weeks }: { weeks: number[][] }) {
  return (
    <div className="mx-auto w-full max-w-[680px] rounded-3xl p-6">
      <StandingCalendar
        data={weeks}
        levels={["#ebedf0", "#c7f0d2", "#7ee2a1", "#30d158", "#1a8f3c"]}
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "money-goo",
    name: "Money Goo",
    registryCliName: "money-goo",
    description:
      "A peer-to-peer payment you drag out of your avatar: a liquid neck stretches, thins and snaps, and dropping the amount on a friend pours it in while both balances roll.",
    categorySlug: "motion-effects",
    tags: ["payment", "send money", "drag and drop", "gooey", "metaball", "fintech", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "amount", type: "number", defaultValue: "40", description: "Amount carried by the draggable blob on each send." },
      { name: "from", type: "MoneyGooPerson", defaultValue: '{ name: "You", initials: "ME", balance: 248 }', description: "Sender: name, initials and starting balance." },
      { name: "to", type: "MoneyGooPerson", defaultValue: '{ name: "Maya", initials: "MK", balance: 112 }', description: "Recipient: name, initials shown in the avatar, and starting balance." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the goo, the blob and the drop-target ring." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sends money by itself on a loop until someone drags." },
    ],
    Preview: Previews.PreviewMoneyGoo,
    previewShell: "plain",
    reactSource: `"use client";

import { MoneyGoo } from "@/components/money-goo";

export function SplitBill() {
  return (
    <MoneyGoo
      amount={25}
      from={{ name: "You", initials: "ME", balance: 180 }}
      to={{ name: "Leo", initials: "LO", balance: 64 }}
      accent="#34c759"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "weather-puck",
    name: "Weather Puck",
    registryCliName: "weather-puck",
    description:
      "Drag a glowing puck across a field of dots to set the time of day. Nearby dots lift and warm, and the landscape above relights from dawn to night with the hour name and clock rolling along.",
    categorySlug: "inputs-controls",
    tags: ["time of day", "slider", "weather", "sky", "canvas", "dot grid", "colour interpolation", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps the light across the day until someone drags it." },
    ],
    Preview: Previews.PreviewWeatherPuck,
    previewShell: "plain",
    reactSource: `"use client";

import { WeatherPuck } from "@/components/weather-puck";

export function TimeOfDayCard() {
  return (
    <section className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold">Pick your golden hour</h2>
      <WeatherPuck />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "metal-orbs",
    name: "Metal Orbs",
    registryCliName: "metal-orbs",
    description:
      "Two liquid-metal metaballs shaded per pixel with a fake chrome reflection on a 2D canvas. They bulge toward each other and pool when they meet; switch between joined, apart and orbit, or drag the cool orb around.",
    categorySlug: "shaders",
    tags: ["metaballs", "liquid metal", "chrome", "canvas", "blob", "no webgl", "segmented control", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "width", type: "number", defaultValue: "440", description: "Canvas width in px." },
      { name: "height", type: "number", defaultValue: "280", description: "Canvas height in px." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles joined, orbit and apart by itself until someone interacts." },
    ],
    Preview: Previews.PreviewMetalOrbs,
    previewShell: "plain",
    reactSource: `"use client";

import { MetalOrbs } from "@/components/metal-orbs";

export function HeroOrbs() {
  return (
    <div className="flex justify-center py-16">
      <MetalOrbs width={520} height={300} autoplay />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "bending-rail",
    name: "Bending Rail",
    registryCliName: "bending-rail",
    description:
      "A slider whose rail follows the knob. Pull the knob off the groove and the rail bends toward it while a ghost knob keeps the value; let go and it twangs straight on a spring.",
    categorySlug: "inputs-controls",
    tags: ["slider", "range", "elastic", "rubber band", "spring", "svg", "volume", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: '"Volume"', description: "Label shown above the rail and used as the slider's accessible name." },
      { name: "min", type: "number", defaultValue: "0", description: "Lowest value." },
      { name: "max", type: "number", defaultValue: "100", description: "Highest value." },
      { name: "defaultValue", type: "number", defaultValue: "40", description: "Starting value." },
      { name: "unit", type: "string", defaultValue: '"%"', description: "Suffix shown after the value." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the filled run, the tether and the ghost knob." },
      { name: "onChange", type: "(v: number) => void", description: "Called whenever the rounded value changes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Tugs the knob around by itself until someone grabs it." },
    ],
    Preview: Previews.PreviewBendingRail,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { BendingRail } from "@/components/bending-rail";

export function BrightnessControl() {
  const [brightness, setBrightness] = useState(70);
  return (
    <div className="flex flex-col items-center gap-2">
      <BendingRail label="Brightness" defaultValue={brightness} accent="#ff9f0a" onChange={setBrightness} />
      <p className="text-sm text-neutral-500">Screen at {brightness}%</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "layout-switch",
    name: "Layout Switch",
    registryCliName: "layout-switch",
    description:
      "A photo set that glides between grid, row, feature and pile arrangements on springs, with nothing fading or cutting. Click a photo and it grows to fill the frame; click again or press Escape to put it back.",
    categorySlug: "motion-effects",
    tags: ["gallery", "photos", "layout", "grid", "pile", "segmented control", "lightbox", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 155,
    createdAt: "2026-10-19",
    animationKinds: ["layout", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Changes layouts by itself until someone interacts." },
    ],
    Preview: Previews.PreviewLayoutSwitch,
    previewShell: "plain",
    reactSource: `"use client";

import { LayoutSwitch } from "@/components/layout-switch";

export function TripGallery() {
  return (
    <section className="mx-auto flex max-w-[680px] flex-col gap-6 px-4 py-12">
      <h2 className="text-2xl font-semibold tracking-tight">Last summer</h2>
      <LayoutSwitch />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "fan-deck",
    name: "Fan Deck",
    registryCliName: "fan-deck",
    description:
      "A paint-chip deck that tips onto its side and fans out into a colour-graded half circle around its rivet. Hover lifts a chip and clicking one copies its hex code.",
    categorySlug: "motion-effects",
    tags: ["color palette", "paint chips", "fan out", "swatches", "copy hex", "spring", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-19",
    animationKinds: ["spring", "hover", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "chips", type: "FanDeckChip[]", defaultValue: "12 chips, Ember to Rosewood", description: "The swatches as { name, hex }, in the order they fan out from left to right." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Fans out and closes by itself until someone interacts." },
    ],
    Preview: Previews.PreviewFanDeck,
    previewShell: "plain",
    reactSource: `"use client";

import { FanDeck } from "@/components/fan-deck";

const brand = [
  { name: "Night", hex: "#1D1D1F" },
  { name: "Slate", hex: "#5B6475" },
  { name: "Sky", hex: "#3DB9CF" },
  { name: "Cobalt", hex: "#0071E3" },
  { name: "Iris", hex: "#5B5BD6" },
  { name: "Sun", hex: "#F5A524" },
  { name: "Coral", hex: "#F76B4B" },
];

export function BrandPalette() {
  return <FanDeck chips={brand} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "receipt-unfold",
    name: "Receipt Unfold",
    registryCliName: "receipt-unfold",
    description:
      "Press Get invoice and a folded paper slip rises out of the row, unfolds panel by panel on 3D hinges, and the total gets circled by hand.",
    categorySlug: "cards",
    tags: ["invoice", "receipt", "unfold", "3d", "paper", "billing", "path drawing", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-19",
    animationKinds: ["3d", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "lines", type: "ReceiptLine[]", defaultValue: "4 sample line items", description: "Line items as { label, amount } shown on the middle panel." },
      { name: "total", type: "string", defaultValue: '"$49.68"', description: "Total on the bottom panel; it gets circled once the slip is fully open." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and folds by itself until someone presses the row." },
    ],
    Preview: Previews.PreviewReceiptUnfold,
    previewShell: "plain",
    reactSource: `"use client";

import { ReceiptUnfold } from "@/components/receipt-unfold";

export function BillingRow() {
  return (
    <ReceiptUnfold
      lines={[
        { label: "Team plan · November", amount: "$96.00" },
        { label: "Extra seats × 2", amount: "$16.00" },
        { label: "Tax", amount: "$8.96" },
      ]}
      total="$120.96"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "page-curl",
    name: "Page Curl",
    registryCliName: "page-curl",
    description:
      "Grab the corner of a page and peel it back. The fold is computed live from your pointer, the flap shows the paper's back, and whatever you put underneath is revealed.",
    categorySlug: "cards",
    tags: ["page curl", "peel", "fold", "reveal", "paper", "drag", "clip-path", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "width", type: "number", defaultValue: "400", description: "Page width in px." },
      { name: "height", type: "number", defaultValue: "260", description: "Page height in px." },
      { name: "front", type: "ReactNode", defaultValue: "sample letter", description: "Content of the page you peel." },
      { name: "back", type: "ReactNode", defaultValue: "hidden discount card", description: "What is revealed underneath the page." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Peeks the corner by itself until someone grabs it." },
    ],
    Preview: Previews.PreviewPageCurl,
    previewShell: "plain",
    reactSource: `"use client";

import { PageCurl } from "@/components/page-curl";

export function SecretOffer() {
  return (
    <PageCurl
      width={360}
      height={220}
      front={
        <div className="flex h-full flex-col justify-center gap-2 p-7">
          <p className="text-[24px] font-semibold tracking-tight">There is more here.</p>
          <p className="text-[14px] text-neutral-500">Drag the bottom-right corner.</p>
        </div>
      }
      back={
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-200 to-rose-300 text-[22px] font-semibold">
          Free shipping: SHIPFREE
        </div>
      }
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "sign-and-seal",
    name: "Sign & Seal",
    registryCliName: "sign-and-seal",
    description:
      "A membership card you sign with your pointer on a canvas. Pause for a moment and a clear plastic sleeve slides down over it with a glint running across.",
    categorySlug: "inputs-controls",
    tags: ["signature", "signature pad", "canvas", "draw", "card", "sleeve", "idle detection", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "name", type: "string", defaultValue: '"Alex Rivera"', description: "Name printed on the card." },
      { name: "title", type: "string", defaultValue: '"Founding member"', description: "Small label above the name." },
      { name: "ink", type: "string", defaultValue: "theme ink", description: "Ink colour. Defaults to near-black, or near-white in dark mode." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Signs itself on a loop until someone draws." },
    ],
    Preview: Previews.PreviewSignAndSeal,
    previewShell: "plain",
    reactSource: `"use client";

import { SignAndSeal } from "@/components/sign-and-seal";

export function MemberCard() {
  return <SignAndSeal name="Jordan Lee" title="Early supporter" ink="#0071e3" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "streak-counter",
    name: "Streak Counter",
    registryCliName: "streak-counter",
    description:
      "Log a day and the number rolls up, the week strip slides along to make room for today, and the flame bursts into embers that fall back in, burning hotter with each day.",
    categorySlug: "cards",
    tags: ["streak", "habit", "counter", "flame", "particles", "gamification", "week strip", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "start", type: "number", defaultValue: "11", description: "Streak length to start from; the flame heats up over the next eight logged days." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Logs a day by itself every couple of seconds until someone presses." },
    ],
    Preview: Previews.PreviewStreakCounter,
    previewShell: "plain",
    reactSource: `"use client";

import { StreakCounter } from "@/components/streak-counter";

export function HabitCard() {
  return <StreakCounter start={27} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "capsule-toggles",
    name: "Capsule Toggles",
    registryCliName: "capsule-toggles",
    description:
      "Switches built as a ball sealed in a glass capsule. Flip one and the ball stretches into a pill mid-flight, then takes on the row's colour and glows as it lands.",
    categorySlug: "inputs-controls",
    tags: ["toggle", "switch", "settings", "glass", "spring", "control center", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "rows", type: "CapsuleToggleRow[]", defaultValue: "Wi-Fi, Bluetooth, Focus, Low Power", description: "CapsuleToggles: rows as { id, label, hint, color, on }." },
      { name: "title", type: "string", defaultValue: '"Controls"', description: "CapsuleToggles: small heading above the list." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "CapsuleToggles: flips the rows one after another until someone touches the panel." },
      { name: "checked", type: "boolean", defaultValue: "required", description: "CapsuleToggle: whether the switch is on." },
      { name: "onChange", type: "(v: boolean) => void", defaultValue: "required", description: "CapsuleToggle: called with the new value when pressed." },
      { name: "label", type: "string", defaultValue: "required", description: "CapsuleToggle: accessible name of the switch." },
      { name: "onColor", type: "string", defaultValue: '"#34c759"', description: "CapsuleToggle: ball colour and glow when on." },
      { name: "offColor", type: "string", defaultValue: "theme grey", description: "CapsuleToggle: ball colour when off; defaults to a grey that adapts to dark mode." },
    ],
    Preview: Previews.PreviewCapsuleToggles,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { CapsuleToggle } from "@/components/capsule-toggles";

export function NotificationsSetting() {
  const [on, setOn] = useState(true);
  return (
    <label className="flex items-center justify-between gap-6">
      <span className="text-[15px] font-medium">Notifications</span>
      <CapsuleToggle label="Notifications" checked={on} onChange={setOn} onColor="#0a84ff" />
    </label>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "glass-bubbles",
    name: "Glass Bubbles",
    registryCliName: "glass-bubbles",
    description:
      "Four glass orbs hang on threads from the top of a panel. Sweep the pointer through them and they swing, knock into each other and spin their icons before settling back under their anchors.",
    categorySlug: "motion-effects",
    tags: ["bubbles", "glass", "pendulum", "physics", "verlet", "collisions", "pointer", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Nudges a random bubble every 2.6 seconds until someone moves the pointer through them (skipped with reduced motion)." },
    ],
    Preview: Previews.PreviewGlassBubbles,
    previewShell: "plain",
    reactSource: `"use client";

import { GlassBubbles } from "@/components/glass-bubbles";

export function PlayfulEmptyState() {
  return (
    <section className="flex flex-col items-center gap-6 py-16 text-center">
      <GlassBubbles autoplay />
      <p className="text-[15px] text-neutral-500">Nothing here yet. Give the bubbles a push.</p>
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "box-spill",
    name: "Box Spill",
    registryCliName: "box-spill",
    description:
      "A cardboard box on a canvas. Open it and the flaps spring back as its contents burst out, bounce off each other and pile up on the floor; pack it up and they all fly home.",
    categorySlug: "motion-effects",
    tags: ["box", "unboxing", "canvas", "physics", "particles", "confetti", "celebration", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "count", type: "number", defaultValue: "30", description: "How many pieces burst out of the box; every third one is a round face with eyes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and packs the box every 3.6 seconds until someone presses the button." },
    ],
    Preview: Previews.PreviewBoxSpill,
    previewShell: "plain",
    reactSource: `"use client";

import { BoxSpill } from "@/components/box-spill";

export function OrderDelivered() {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <h2 className="text-2xl font-semibold tracking-tight">Your order has arrived</h2>
      <BoxSpill count={40} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "curved-reel",
    name: "Curved Reel",
    registryCliName: "curved-reel",
    description:
      "An endless reel of posters bent around the inside of a curve: the centre cards sit back and pinch in while the edge cards swing round and come forward. It drifts on its own, and you can drag it or fling it to coast.",
    categorySlug: "three-d-components",
    tags: ["carousel", "reel", "posters", "3d", "curve", "infinite", "drag", "inertia", "gallery", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "posters", type: "ReelPoster[]", description: "Each poster has bg, fg, big (the large glyph), small (caption) and an optional serif flag. Defaults to ten type posters." },
      { name: "autoplay", type: "boolean", defaultValue: "true", description: "Drifts the reel at 38px per second; it pauses for 2.5 seconds after a drag or key press." },
    ],
    Preview: Previews.PreviewCurvedReel,
    previewShell: "plain",
    reactSource: `"use client";

import { CurvedReel, type ReelPoster } from "@/components/curved-reel";

const issues: ReelPoster[] = [
  { bg: "#0040ff", fg: "#fff", big: "01", small: "Launch issue" },
  { bg: "#f2efe6", fg: "#1d1d1f", big: "Type", small: "Specimens", serif: true },
  { bg: "#ff4f00", fg: "#1d1d1f", big: "02", small: "Motion" },
  { bg: "#1d1d1f", fg: "#f5f5f7", big: "Ω", small: "Studio notes", serif: true },
  { bg: "#c8f560", fg: "#1d1d1f", big: "03", small: "Growth" },
  { bg: "#5e5ce6", fg: "#fff", big: "Iso", small: "Grids" },
  { bg: "#ffd60a", fg: "#1d1d1f", big: "04", small: "Colour" },
  { bg: "#0b8f6a", fg: "#e9fff6", big: "Fern", small: "Field notes", serif: true },
];

export function MagazineArchive() {
  return <CurvedReel posters={issues} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "squeeze-progress",
    name: "Squeeze Progress",
    registryCliName: "squeeze-progress",
    description:
      "A full-panel progress line with a big percentage. Pause it and the tip bunches into a springy squiggle while the panel warms from blue to orange; resume and it stretches back out and carries on.",
    categorySlug: "loaders",
    tags: ["progress", "loader", "pause", "resume", "export", "squiggle", "spring", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 146,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Panel colour while running." },
      { name: "paused", type: "string", defaultValue: '"#c2410c"', description: "Panel colour while paused; the panel blends between the two on the same spring as the squiggle." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Toggles pause and resume every 2.2 seconds until someone presses the button." },
    ],
    Preview: Previews.PreviewSqueezeProgress,
    previewShell: "plain",
    reactSource: `"use client";

import { SqueezeProgress } from "@/components/squeeze-progress";

export function ExportPanel() {
  return (
    <div className="flex justify-center py-12">
      <SqueezeProgress accent="#1d1d1f" paused="#ff375f" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "bolting-sliders",
    name: "Bolting Sliders",
    registryCliName: "bolting-sliders",
    description:
      "A panel of settings sliders where clicking a track makes the knob leap there in an arc, leaving a fading dotted trail and reading out its value mid-air, then landing with a squash. Dragging and arrow keys work as usual.",
    categorySlug: "inputs-controls",
    tags: ["slider", "range", "settings", "knob", "arc", "trail", "squash", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["press", "drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "settings", type: "BoltSetting[]", defaultValue: "DEFAULT_BOLT_SETTINGS", description: "The sliders: each has id, label, min, max, unit (appended to the read-out) and a starting value." },
      { name: "title", type: "string", defaultValue: '"Render settings"', description: "Small caps heading above the sliders." },
      { name: "hint", type: "string", defaultValue: '"Click a track and watch the knob jump."', description: "Hint line under the sliders." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the filled track, the trail dots and the focus ring." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Throws one knob after another to random values every 1.1s until someone touches the panel." },
    ],
    Preview: Previews.PreviewBoltingSliders,
    previewShell: "plain",
    reactSource: `"use client";

import { BoltingSliders } from "@/components/bolting-sliders";

export function AudioPanel() {
  return (
    <BoltingSliders
      title="Mixer"
      accent="#ff375f"
      settings={[
        { id: "gain", label: "Gain", min: -12, max: 12, unit: " dB", value: 0 },
        { id: "reverb", label: "Reverb", min: 0, max: 100, unit: "%", value: 20 },
        { id: "pan", label: "Pan", min: -50, max: 50, unit: "", value: 0 },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "crumple-to-trash",
    name: "Crumple to Trash",
    registryCliName: "crumple-to-trash",
    description:
      "A literal Move to trash: the page scrunches into a paper ball, arcs into a bin whose lid flips open and snaps shut, and Undo throws it back out and smooths it flat. Also includes the Motion Kit Shatter Delete variant.",
    categorySlug: "motion-effects",
    tags: ["delete", "trash", "undo", "crumple", "paper", "svg filter", "bin", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Draft · Q4 notes"', description: "Heading printed on the page." },
      { name: "onTrash", type: "() => void", description: "Called once the ball has landed in the bin." },
      { name: "onRestore", type: "() => void", description: "Called once Undo has smoothed the page flat again." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Throws the page away and brings it back every 3s until someone clicks the button." },
      { name: "ShatterDelete.fileName", type: "string", defaultValue: "\"Q3-board-report.pdf\"", description: "File name on the card." },
      { name: "ShatterDelete.meta", type: "string", defaultValue: "\"2.4 MB \u00b7 edited 2 days ago\"", description: "Secondary line under the name." },
      { name: "ShatterDelete.badge", type: "string", defaultValue: "\"PDF\"", description: "Text on the file-type badge." },
      { name: "ShatterDelete.badgeColor", type: "string", defaultValue: "\"#ff3b30\"", description: "Colour of the file-type badge." },
      { name: "ShatterDelete.onDelete", type: "() => void", description: "Called when the user presses Delete; the component only plays the effect." },
      { name: "ShatterDelete.onUndo", type: "() => void", description: "Called when the user presses Undo and the shards fly back together." },
      { name: "ShatterDelete.autoplay", type: "boolean", defaultValue: "false", description: "Shatters and mends the card every 2.3s until someone touches it." },
    ],
    Preview: Previews.PreviewCrumpleToTrash,
    previewSections: [
      {
        title: "Crumple to Trash",
        Preview: Previews.PreviewCrumpleToTrash,
        reactSource: `"use client";

import { CrumpleToTrash } from "@/components/crumple-to-trash";

export function DeleteDraft({ onDelete, onRestore }: { onDelete: () => void; onRestore: () => void }) {
  return <CrumpleToTrash title="Launch checklist" onTrash={onDelete} onRestore={onRestore} />;
}`,
      },
      {
        title: "Shatter Delete",
        Preview: Previews.PreviewShatterDelete,
        reactSource: `"use client";

import { ShatterDelete } from "@/components/crumple-to-trash";

export function DeleteFile() {
  return (
    <ShatterDelete
      fileName="brand-guidelines.fig"
      meta="18 MB · edited today"
      badge="FIG"
      badgeColor="#a259ff"
      onDelete={() => console.log("deleted")}
      onUndo={() => console.log("restored")}
    />
  );
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `"use client";

import { CrumpleToTrash } from "@/components/crumple-to-trash";

export function DeleteDraft({ onDelete, onRestore }: { onDelete: () => void; onRestore: () => void }) {
  return <CrumpleToTrash title="Launch checklist" onTrash={onDelete} onRestore={onRestore} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "tape-shelf",
    name: "Tape Shelf",
    registryCliName: "tape-shelf",
    description:
      "Cassette cases stand spine-out on a tilted 3D shelf. Hovering slides one up; picking one swings it round to show its cover with the reels turning, while the rest of the shelf steps aside and dims.",
    categorySlug: "three-d-components",
    tags: ["cassette", "tape", "shelf", "music", "3d", "picker", "album", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "tapes", type: "ShelfTape[]", defaultValue: "DEFAULT_TAPES", description: "Cases on the shelf, left to right: title, artist, color (spine and label) and ink (text colour on them)." },
      { name: "onPick", type: "(index: number | null) => void", description: "Called with the picked index when someone picks a tape, or null when it goes back." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Pulls out the 3rd, 6th and 1st tapes in turn, putting each back, every 1.8s until someone touches the shelf." },
    ],
    Preview: Previews.PreviewTapeShelf,
    previewShell: "plain",
    reactSource: `"use client";

import { TapeShelf } from "@/components/tape-shelf";

const mixtapes = [
  { title: "Summer '98", artist: "Side A", color: "#ff9f0a", ink: "#1d1d1f" },
  { title: "Road Trip", artist: "Dad's picks", color: "#0a84ff", ink: "#fff" },
  { title: "Late Shift", artist: "Lo-fi", color: "#5e5ce6", ink: "#fff" },
  { title: "Gym", artist: "Fast ones", color: "#ff375f", ink: "#fff" },
  { title: "Rainy Day", artist: "Acoustic", color: "#30d158", ink: "#0b2814" },
];

export function Mixtapes() {
  return <TapeShelf tapes={mixtapes} onPick={(i) => console.log("playing", i)} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "packet-router",
    name: "Packet Router",
    registryCliName: "packet-router",
    description:
      "A live diagram of requests flowing from a router to four AI models along curved paths. Switch between Cost, Balanced and Quality and the traffic re-balances while each model's share and the blended price roll to their new values.",
    categorySlug: "ai-components",
    tags: ["ai", "llm", "router", "model routing", "traffic", "canvas", "pricing", "diagram", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-20",
    animationKinds: ["press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "defaultStrategy", type: '"Cost" | "Balanced" | "Quality"', defaultValue: '"Balanced"', description: "Strategy selected on mount." },
      { name: "onStrategyChange", type: "(strategy: RouterStrategy) => void", description: "Called when someone picks a strategy." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles Cost, Quality, Balanced every 2.8s until someone touches it." },
    ],
    Preview: Previews.PreviewPacketRouter,
    previewShell: "plain",
    reactSource: `"use client";

import { PacketRouter } from "@/components/packet-router";

export function RoutingSettings() {
  return (
    <section className="mx-auto max-w-[800px]">
      <PacketRouter defaultStrategy="Cost" onStrategyChange={(s) => console.log("strategy", s)} />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "stamp-swirl",
    name: "Stamp Swirl",
    registryCliName: "stamp-swirl",
    description:
      "A row of perforated postage stamps whose artwork slowly swirls like wet ink. Hover or focus one and it lifts out of the row, swirls harder, and its name and year slide in underneath.",
    categorySlug: "cards",
    tags: ["stamps", "postage", "svg filter", "turbulence", "hover", "gallery", "collectible", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "stamps", type: "SwirlStamp[]", defaultValue: "Tidepool, Ember Fields, Night Bloom, Moss & Stone", description: "Stamps as { name, date, value, art }; art is any CSS background (layered gradients work best)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Lifts the stamps one after another until the pointer enters." },
    ],
    Preview: Previews.PreviewStampSwirl,
    previewShell: "plain",
    reactSource: `"use client";

import { StampSwirl, type SwirlStamp } from "@/components/stamp-swirl";

const stamps: SwirlStamp[] = [
  { name: "Harbour Light", date: "1972", value: "15c", art: "radial-gradient(50% 50% at 30% 30%, #fff4d6, rgba(255,244,214,0) 60%), linear-gradient(160deg, #7fb7ff, #1c3f94)" },
  { name: "Desert Rose", date: "1985", value: "22c", art: "radial-gradient(55% 50% at 70% 30%, #ffe0e6, rgba(255,224,230,0) 60%), linear-gradient(170deg, #ffb199, #a83279)" },
  { name: "Pine Ridge", date: "1993", value: "29c", art: "radial-gradient(50% 50% at 40% 35%, #e6f7d9, rgba(230,247,217,0) 60%), linear-gradient(160deg, #8fc490, #1f4d3a)" },
];

export function StampCollection() {
  return <StampSwirl stamps={stamps} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "bubble-cluster",
    name: "Bubble Cluster",
    registryCliName: "bubble-cluster",
    description:
      "Contacts packed into one cluster of avatar bubbles sized by how close they are, sitting on a liquid backdrop. Switch groups and everyone springs to new places and sizes while people outside the group shrink away.",
    categorySlug: "motion-effects",
    tags: ["contacts", "avatars", "circle packing", "gooey", "segmented control", "groups", "people", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["spring", "layout", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "people", type: "ClusterPerson[]", defaultValue: "12 sample contacts", description: "Everyone who can appear, as { id, name, hue }; hue (0-360) tints the avatar gradient." },
      { name: "groups", type: "Record<string, Record<string, number>>", defaultValue: "Family, Close friends, Work", description: "Group name to { person id: closeness 1-5 }. Closeness sets bubble size; people left out of a group hide in it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Steps through the groups every 2.4s until someone presses the cluster or the switcher." },
    ],
    Preview: Previews.PreviewBubbleCluster,
    previewShell: "plain",
    reactSource: `"use client";

import { BubbleCluster, type ClusterPerson } from "@/components/bubble-cluster";

const team: ClusterPerson[] = [
  { id: "an", name: "Ana", hue: 200 },
  { id: "ben", name: "Ben", hue: 20 },
  { id: "cy", name: "Cy", hue: 140 },
  { id: "dee", name: "Dee", hue: 300 },
  { id: "eli", name: "Eli", hue: 50 },
];

export function TeamCircles() {
  return (
    <BubbleCluster
      people={team}
      groups={{
        Design: { an: 5, dee: 4, eli: 2 },
        Engineering: { ben: 5, cy: 4, an: 2 },
        Launch: { eli: 5, ben: 3, cy: 3, dee: 2 },
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "sticker-toss",
    name: "Sticker Toss",
    registryCliName: "sticker-toss",
    description:
      "A round logo sticker you can peel off a page header and throw. In flight it stretches along its direction of travel and its ring of text spins faster, then it springs back into its spot with a wobble.",
    categorySlug: "motion-effects",
    tags: ["sticker", "logo", "drag", "throw", "squash and stretch", "velocity", "playful", "header", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 155,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", defaultValue: '"NEXUS UI · MADE TO MOVE · "', description: "Text that runs around the ring; end it with a separator so the loop reads cleanly." },
      { name: "color", type: "string", defaultValue: "theme ink", description: "Sticker colour. Unset, it is #1d1d1f with white text (#f5f5f7 with dark text in dark mode); set, the ring text is white." },
      { name: "accent", type: "string", defaultValue: '"#c8f560"', description: "Colour of the dot in the middle." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Tosses the sticker every 3.2s until someone grabs it." },
    ],
    Preview: Previews.PreviewStickerToss,
    previewShell: "plain",
    reactSource: `"use client";

import { StickerToss } from "@/components/sticker-toss";

export function StudioHeader() {
  return <StickerToss text="NORTHWIND · EST. 2026 · " color="#ff375f" accent="#ffd60a" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "context-meter",
    name: "Context Meter",
    registryCliName: "context-meter",
    description:
      "A context-window token meter drawn as a 40 by 5 dot grid. Hover a category to light only its dots; the conversation keeps growing, and Compact chat drops its dots out of the grid while everything after them reflows to close the gap.",
    categorySlug: "ai-components",
    tags: ["tokens", "context window", "llm", "usage meter", "dot grid", "ai chat", "layout", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-20",
    animationKinds: ["layout", "hover", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "categories", type: "ContextCategory[]", defaultValue: "System prompt, Tools, Files, Conversation, Memory", description: "Starting categories as { id, label, color, tokens } with tokens in thousands; read once on mount." },
      { name: "limit", type: "number", defaultValue: "200", description: "Window size in thousands of tokens; the grid always has 200 dots." },
      { name: "growId", type: "string", defaultValue: '"conv"', description: "Category that grows by 2.2K every 380ms and is cut back to 6.2K by Compact chat." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles the highlight and compacts when the window passes 90%, until someone touches the card." },
    ],
    Preview: Previews.PreviewContextMeter,
    previewShell: "plain",
    reactSource: `"use client";

import { ContextMeter, type ContextCategory } from "@/components/context-meter";

const usage: ContextCategory[] = [
  { id: "sys", label: "Instructions", color: "#8e8e93", tokens: 6 },
  { id: "docs", label: "Attached docs", color: "#ff9f0a", tokens: 31.5 },
  { id: "chat", label: "Chat history", color: "#0071e3", tokens: 22 },
];

export function ChatSidebarUsage() {
  return <ContextMeter categories={usage} limit={128} growId="chat" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "mood-wheel",
    name: "Mood Wheel",
    registryCliName: "mood-wheel",
    description:
      "Feelings laid along the rim of a wheel that you drag, scroll or arrow through. The word at the centre gets bracketed, fills the sentence below and the orb beside it melts into that mood's colours.",
    categorySlug: "inputs-controls",
    tags: ["mood", "picker", "wheel", "slider", "inertia", "snap", "journal", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "moods", type: "Mood[]", defaultValue: "DEFAULT_MOODS", description: "Words on the wheel, each as { word, a, b } where a is the main orb colour and b the light one. Ten moods from Calm to Grateful by default." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Spins to a random mood every 2 s until someone drags, scrolls or uses the keys." },
    ],
    Preview: Previews.PreviewMoodWheel,
    previewShell: "plain",
    reactSource: `"use client";

import { MoodWheel, type Mood } from "@/components/mood-wheel";

const moods: Mood[] = [
  { word: "Calm", a: "#8ec5ff", b: "#d7f0ff" },
  { word: "Hopeful", a: "#ffd36e", b: "#fff4d1" },
  { word: "Restless", a: "#ff7a6b", b: "#ffe0db" },
  { word: "Tired", a: "#a7a3d9", b: "#ebe9ff" },
  { word: "Grateful", a: "#9fd36b", b: "#eefcd9" },
];

export function DailyCheckIn() {
  return (
    <section className="flex flex-col items-center gap-6 py-12">
      <h2 className="text-[22px] font-semibold tracking-[-0.02em]">How are you today?</h2>
      <MoodWheel moods={moods} />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "swipe-stack",
    name: "Swipe Stack",
    registryCliName: "swipe-stack",
    description:
      "Payments to review as a deck of cards. Drag the top card right to approve or left to flag: it tilts as you pull, a stamp fades in, and once thrown the next card rises from the deck. Also includes the Motion Kit Swipe Rows variant.",
    categorySlug: "cards",
    tags: ["swipe", "tinder", "deck", "cards", "approve", "review", "payments", "drag", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "payments", type: "SwipePayment[]", defaultValue: "DEFAULT_PAYMENTS", description: "Cards to review, top first: { amount, from, to, note, when, hue }. \"Load more\" deals the same list again." },
      { name: "onDecide", type: "(payment: SwipePayment, approved: boolean) => void", defaultValue: "undefined", description: "Called after a card is thrown; approved is true for right / approve and false for left / flag." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Throws a card every 1.7 s (mostly approvals) and reloads when empty, until someone touches it." },
      { name: "SwipeRows.items", type: "SwipeRowItem[]", defaultValue: "DEFAULT_SWIPE_MAIL", description: "Rows to show, each { id, from, subject, time, color }." },
      { name: "SwipeRows.title", type: "string", defaultValue: "\"Inbox\"", description: "Heading at the top of the list." },
      { name: "SwipeRows.onArchive", type: "(item: SwipeRowItem) => void", description: "Called when the user archives a row (swipe right or the right arrow key)." },
      { name: "SwipeRows.onDelete", type: "(item: SwipeRowItem) => void", description: "Called when the user deletes a row (long swipe left, the Delete button, or Delete/Backspace)." },
      { name: "SwipeRows.onFlag", type: "(item: SwipeRowItem) => void", description: "Called when the user taps Flag on a half-open row." },
      { name: "SwipeRows.onUndo", type: "(item: SwipeRowItem, action: \"archive\" | \"delete\") => void", description: "Called when the user undoes the last archive or delete." },
      { name: "SwipeRows.autoplay", type: "boolean", defaultValue: "false", description: "Archives and deletes rows by itself, refilling the list, until someone touches it." },
    ],
    Preview: Previews.PreviewSwipeStack,
    previewSections: [
      {
        title: "Swipe Stack",
        Preview: Previews.PreviewSwipeStack,
        reactSource: `"use client";

import { SwipeStack, type SwipePayment } from "@/components/swipe-stack";

const queue: SwipePayment[] = [
  { amount: "$1,240", from: "Acme Inc", to: "you", note: "March retainer", when: "2h", hue: 200 },
  { amount: "$86.10", from: "you", to: "Lena", note: "dinner split", when: "6h", hue: 20 },
  { amount: "$540", from: "Orbit Labs", to: "you", note: "invoice #204", when: "1d", hue: 140 },
];

export function ReviewQueue() {
  return (
    <SwipeStack
      payments={queue}
      onDecide={(payment, approved) => console.log(approved ? "approved" : "flagged", payment.amount)}
    />
  );
}`,
      },
      {
        title: "Swipe Rows",
        Preview: Previews.PreviewSwipeRows,
        reactSource: `"use client";

import { SwipeRows, type SwipeRowItem } from "@/components/swipe-stack";

const mail: SwipeRowItem[] = [
  { id: "a1", from: "Priya Shah", subject: "Contract signed", time: "10:12", color: "#0a84ff" },
  { id: "a2", from: "GitHub", subject: "3 new pull request reviews", time: "9:30", color: "#5e5ce6" },
  { id: "a3", from: "Noah Kim", subject: "Lunch on Thursday?", time: "Yesterday", color: "#30d158" },
];

export function Inbox() {
  return (
    <SwipeRows
      title="Inbox"
      items={mail}
      onArchive={(m) => console.log("archive", m.id)}
      onDelete={(m) => console.log("delete", m.id)}
      onFlag={(m) => console.log("flag", m.id)}
      onUndo={(m, action) => console.log("undo", action, m.id)}
    />
  );
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `"use client";

import { SwipeStack, type SwipePayment } from "@/components/swipe-stack";

const queue: SwipePayment[] = [
  { amount: "$1,240", from: "Acme Inc", to: "you", note: "March retainer", when: "2h", hue: 200 },
  { amount: "$86.10", from: "you", to: "Lena", note: "dinner split", when: "6h", hue: 20 },
  { amount: "$540", from: "Orbit Labs", to: "you", note: "invoice #204", when: "1d", hue: 140 },
];

export function ReviewQueue() {
  return (
    <SwipeStack
      payments={queue}
      onDecide={(payment, approved) => console.log(approved ? "approved" : "flagged", payment.amount)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "flight-tracker",
    name: "Flight Tracker",
    registryCliName: "flight-tracker",
    description:
      "A live flight card: a plane banks along a dotted arc while the flown part fills in behind it, and the status line counts down to landing. Expand it for altitude, speed and distance left.",
    categorySlug: "cards",
    tags: ["flight", "travel", "tracker", "status", "svg path", "progress", "expand", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "from", type: "string", defaultValue: '"NYC"', description: "Departure airport code." },
      { name: "to", type: "string", defaultValue: '"LON"', description: "Arrival airport code." },
      { name: "flight", type: "string", defaultValue: '"MK 214"', description: "Flight number in the top-right corner." },
      { name: "departs", type: "string", defaultValue: '"8:30 PM"', description: "Departure time under the origin code." },
      { name: "arrives", type: "string", defaultValue: '"8:40 AM"', description: "Arrival time under the destination code." },
      { name: "minutes", type: "number", defaultValue: "410", description: "Total flight time; drives the \"Landing in N min\" countdown." },
      { name: "miles", type: "number", defaultValue: "3459", description: "Route length; drives the remaining distance in the details." },
      { name: "autoplay", type: "boolean", defaultValue: "true", description: "Flies the plane along the arc on a loop (about 22 s per flight). When false it stays at 35% of the route." },
    ],
    Preview: Previews.PreviewFlightTracker,
    previewShell: "plain",
    reactSource: `"use client";

import { FlightTracker } from "@/components/flight-tracker";

export function TripSidebar() {
  return (
    <aside className="flex flex-col gap-4">
      <FlightTracker from="SFO" to="NRT" flight="NH 7" departs="11:25 AM" arrives="3:10 PM" minutes={665} miles={5130} />
    </aside>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "matrix-loaders",
    name: "Matrix Loaders",
    registryCliName: "matrix-loaders",
    description:
      "Six 5×5 dot-matrix loaders driven by one shared pulse. Only the phase offset per dot changes, which turns the same grid into a wave, ripple, spiral, rain, sweep or checkerboard.",
    categorySlug: "loaders",
    tags: ["loader", "spinner", "dot matrix", "grid", "pulse", "status", "loading", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 145,
    createdAt: "2026-10-20",
    animationKinds: ["layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "size", type: "number", defaultValue: "64", description: "Grid size of each loader in px; tiles are size + 68 px square." },
      { name: "color", type: "string", defaultValue: "undefined", description: "One dot colour for every loader. Defaults to each pattern's own colour." },
      { name: "showLabels", type: "boolean", defaultValue: "true", description: "Show the pulsing label (\"Indexing…\", \"Thinking…\") under each loader." },
      { name: "MatrixLoader.pattern", type: '"wave" | "ripple" | "spiral" | "rain" | "halogen" | "checker" | number', defaultValue: "0", description: "Standalone MatrixLoader: which pattern to play, by name or index." },
      { name: "MatrixLoader.size", type: "number", defaultValue: "64", description: "Standalone MatrixLoader: grid size in px." },
      { name: "MatrixLoader.color", type: "string", defaultValue: "undefined", description: "Standalone MatrixLoader: dot colour; defaults to the pattern's colour." },
      { name: "MatrixLoader.label", type: "string", defaultValue: "undefined", description: "Standalone MatrixLoader: accessible label; defaults to the pattern's label." },
    ],
    Preview: Previews.PreviewMatrixLoaders,
    previewShell: "plain",
    reactSource: `"use client";

import { MatrixLoader } from "@/components/matrix-loaders";

export function GeneratingState() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-[#1c1c1e]">
      <MatrixLoader pattern="ripple" size={28} label="Generating answer" />
      <span className="text-[14px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Thinking…</span>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "todo-tower",
    name: "Todo Tower",
    registryCliName: "todo-tower",
    description:
      "A to-do list stacked like bricks. Tick a task or drag it out sideways and the pile drops into the gap with a bounce; any brick left hanging too far over the one below tips off the edge.",
    categorySlug: "cards",
    tags: ["todo", "tasks", "stack", "bricks", "physics", "drag", "checklist", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "tasks", type: "TodoTowerTask[]", defaultValue: "TODO_TOWER_TASKS", description: "Starting pile, top to bottom. Each task has text and x, its sideways offset in px." },
      { name: "moreTasks", type: "string[]", defaultValue: "TODO_TOWER_MORE", description: "Labels the Add a task button drops onto the top of the pile, in turn." },
      { name: "overhang", type: "number", defaultValue: "24", description: "How far (px) a brick may hang past the one beneath it before it tips off." },
      { name: "maxBricks", type: "number", defaultValue: "8", description: "Most bricks the pile holds; adding does nothing past this." },
      { name: "onComplete", type: "(text: string) => void", description: "Called with a task's label when it is ticked off." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Ticks tasks off and adds new ones by itself until someone touches the pile." },
    ],
    Preview: Previews.PreviewTodoTower,
    previewShell: "plain",
    reactSource: `"use client";

import { TodoTower } from "@/components/todo-tower";

export function TodayPile() {
  return (
    <TodoTower
      tasks={[
        { text: "Draft the proposal", x: -12 },
        { text: "Review pull requests", x: 8 },
        { text: "Plan the sprint", x: 20 },
        { text: "Answer support tickets", x: 0 },
      ]}
      moreTasks={["Update the changelog", "Book a design review"]}
      onComplete={(task) => console.log("done:", task)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "peek-login",
    name: "Peek Login",
    registryCliName: "peek-login",
    description:
      "A sign-in card with a little face whose eyes follow the pointer and read along as you type your email. It covers its eyes with its paws while you type a password and peeks when you show it.",
    categorySlug: "login-forms",
    tags: ["login", "sign in", "form", "mascot", "eyes", "password", "playful", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "type", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the face, the focus rings and the Show/Hide button." },
      { name: "onSubmit", type: "(values: PeekLoginValues) => void", description: "Called with { email, password } on submit. The component sends nothing itself; it only plays a short local signing-in state." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a sample email and password and peeks at it, on a loop, until someone interacts." },
    ],
    Preview: Previews.PreviewPeekLogin,
    previewShell: "plain",
    reactSource: `"use client";

import { PeekLogin } from "@/components/peek-login";

export function SignInPage() {
  return (
    <main className="flex min-h-[560px] items-center justify-center">
      <PeekLogin
        accent="#5e5ce6"
        onSubmit={({ email }) => {
          // Hand the values to your own auth call here.
          console.log("sign in", email);
        }}
      />
    </main>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "heat-field",
    name: "Heat Field",
    registryCliName: "heat-field",
    description:
      "A field of grey dots that melts into a heat map under the cursor, swelling and blending from yellow through red to violet. Press and hold to leave heat behind that slowly cools.",
    categorySlug: "background-effects",
    tags: ["heat map", "dots", "canvas", "goo", "cursor", "interactive", "grid", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 147,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "radius", type: "number", defaultValue: "46", description: "Spread of the heat around the pointer in px; held heat spreads a little wider." },
      { name: "hint", type: "string", defaultValue: '"Move across the dots. Press and hold to leave heat behind."', description: "Line under the field. Pass an empty string to hide it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "An invisible hand wanders across the field, now and then pressing, until someone points at it." },
    ],
    Preview: Previews.PreviewHeatField,
    previewShell: "plain",
    reactSource: `"use client";

import { HeatField } from "@/components/heat-field";

export function ActivityHero() {
  return (
    <section className="flex flex-col items-center gap-6 py-16">
      <h2 className="text-3xl font-semibold tracking-tight">Where people click</h2>
      <HeatField radius={56} hint="" autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "particle-mark",
    name: "Particle Mark",
    registryCliName: "particle-mark",
    description:
      "A word drawn as a few hundred dots that scatter away from the pointer and spring home, warming to the accent colour the further they are pushed. Click anywhere for a shockwave.",
    categorySlug: "motion-effects",
    tags: ["particles", "text", "logo", "canvas", "dots", "shockwave", "springs", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 155,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "spring", "magnetic"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", defaultValue: '"motion"', description: "The word drawn in dots; long words are shrunk to fit." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Hex colour the dots warm to as they are pushed away from home." },
      { name: "hint", type: "string", defaultValue: '"Brush through the dots. Click for a shockwave."', description: "Line under the canvas. Pass an empty string to hide it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "An invisible pointer loops through the word, with a shockwave every few seconds, until someone points at it." },
    ],
    Preview: Previews.PreviewParticleMark,
    previewShell: "plain",
    reactSource: `"use client";

import { ParticleMark } from "@/components/particle-mark";

export function BrandIntro() {
  return (
    <section className="flex justify-center py-20">
      <ParticleMark text="hello" accent="#ff375f" hint="" />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "generate-image",
    name: "Generate Image",
    registryCliName: "generate-image",
    description:
      "An image-generation card: press Generate and the picture arrives coarse to fine with the noise easing off, under a sheet of glass with light sweeping across it and a denoising counter.",
    categorySlug: "ai-components",
    tags: ["ai", "image generation", "prompt", "progressive", "loading", "canvas", "glass", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["press", "type", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "prompt", type: "string", defaultValue: '"Pink dusk over soft hills"', description: "Prompt the field starts with." },
      { name: "onGenerate", type: "(prompt: string) => void", description: "Called with the prompt each time Generate is pressed." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Generates a new scene every few seconds, cycling the sample prompts, until someone interacts." },
    ],
    Preview: Previews.PreviewGenerateImage,
    previewShell: "plain",
    reactSource: `"use client";

import { GenerateImage } from "@/components/generate-image";

export function PromptPlayground() {
  return (
    <div className="flex justify-center py-12">
      <GenerateImage
        prompt="Moonlit ridge, deep teal"
        onGenerate={(prompt) => console.log("generate:", prompt)}
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "falloff-accordion",
    name: "Falloff Accordion",
    registryCliName: "falloff-accordion",
    description:
      "A row of photo strips where the one you point at opens and its neighbours give way on a smooth Gaussian falloff, so the whole row leans toward the pointer while a caption rises on the open strip.",
    categorySlug: "cards",
    tags: ["accordion", "gallery", "photo strips", "hover", "falloff", "expand", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "strips", type: "FalloffStrip[]", defaultValue: "DEFAULT_FALLOFF_STRIPS", description: "Each strip has a unique title, a meta line and art (any CSS background, e.g. a gradient or url(...) center / cover)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens every other strip in turn until someone points at the row." },
    ],
    Preview: Previews.PreviewFalloffAccordion,
    previewShell: "plain",
    reactSource: `"use client";

import { FalloffAccordion } from "@/components/falloff-accordion";

const places = [
  { title: "Glacier", meta: "Iceland", art: "url(/photos/glacier.jpg) center / cover" },
  { title: "Dune", meta: "Morocco", art: "url(/photos/dune.jpg) center / cover" },
  { title: "Fern", meta: "New Zealand", art: "linear-gradient(170deg,#e4f7c7,#8fd16a 40%,#2f7d4a 75%,#123a26)" },
  { title: "Lagoon", meta: "Maldives", art: "linear-gradient(170deg,#e0fffb,#6fe3d6 40%,#1695a3 78%,#0b3c55)" },
];

export function Destinations() {
  return <FalloffAccordion strips={places} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "magnet-select",
    name: "Magnet Select",
    registryCliName: "magnet-select",
    description:
      "A status picker where the selection is a liquid orb: a bead reaches toward the option you point at, and picking it sends the orb sliding over with a stretching liquid tail, nudging the options it passes out of the way.",
    categorySlug: "inputs-controls",
    tags: ["select", "status", "radio", "goo", "liquid", "picker", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "spring", "magnetic"],
    dependencies: ["framer-motion"],
    props: [
      { name: "options", type: "MagnetOption[]", defaultValue: "DEFAULT_MAGNET_OPTIONS", description: "Each option has id, label and d (SVG path for a 24×24 stroked icon). The last one sits in the centre, the rest on a ring." },
      { name: "defaultValue", type: "string", description: "id of the option selected at first. Defaults to the last (centre) option." },
      { name: "onChange", type: "(id: string) => void", description: "Called with the option id when the user picks one." },
      { name: "label", type: "string", defaultValue: '"Status"', description: "Accessible name of the radio group." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Points at and picks options by itself until someone touches it." },
    ],
    Preview: Previews.PreviewMagnetSelect,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { MagnetSelect } from "@/components/magnet-select";

export function StatusPicker() {
  const [status, setStatus] = useState("here");
  return (
    <div className="flex flex-col items-center gap-4">
      <MagnetSelect defaultValue={status} onChange={setStatus} />
      <p className="text-sm text-neutral-500">Saved as: {status}</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "aspect-crop",
    name: "Aspect Crop",
    registryCliName: "aspect-crop",
    description:
      "An aspect-ratio picker whose crop frame keeps the same area at every ratio, so switching reads as re-cropping the same photo. The frame springs to its new shape and rule-of-thirds lines flash while it moves.",
    categorySlug: "inputs-controls",
    tags: ["crop", "aspect ratio", "image editor", "segmented control", "photo", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 147,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "ratios", type: "AspectRatioOption[]", defaultValue: "DEFAULT_ASPECT_RATIOS", description: "Ratios to offer, each { id, w, h } (4:3, 1:1, 3:4 and 9:16 by default)." },
      { name: "src", type: "string", description: "Photo to crop. Without it a drawn sunset illustration is shown." },
      { name: "alt", type: "string", defaultValue: '""', description: "Alt text for src." },
      { name: "onChange", type: "(id: string) => void", description: "Called with the ratio id when the user picks one." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles through the ratios until someone touches it." },
    ],
    Preview: Previews.PreviewAspectCrop,
    previewShell: "plain",
    reactSource: `"use client";

import { AspectCrop } from "@/components/aspect-crop";

export function CoverCrop() {
  return (
    <AspectCrop
      src="/images/cover.jpg"
      alt="Album cover"
      ratios={[
        { id: "1:1", w: 1, h: 1 },
        { id: "4:5", w: 4, h: 5 },
        { id: "16:9", w: 16, h: 9 },
      ]}
      onChange={(ratio) => console.log("crop to", ratio)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "slosh-slider",
    name: "Slosh Slider",
    registryCliName: "slosh-slider",
    description:
      "A slider whose value has mass: the rigid handle stays under your finger while the liquid fill lags behind, leans with the speed you drag at and sloshes back and forth before it settles.",
    categorySlug: "inputs-controls",
    tags: ["slider", "range", "liquid", "volume", "velocity", "physics", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: '"Volume"', description: "Label above the track; also the slider's accessible name." },
      { name: "defaultValue", type: "number", defaultValue: "55", description: "Starting value, 0 to 100." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Liquid colour and focus ring." },
      { name: "onChange", type: "(value: number) => void", description: "Called with the rounded value (0 to 100) whenever it changes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Throws the handle to a series of values until someone touches it." },
    ],
    Preview: Previews.PreviewSloshSlider,
    previewShell: "plain",
    reactSource: `"use client";

import { SloshSlider } from "@/components/slosh-slider";

export function MixerPanel() {
  return (
    <div className="flex flex-col gap-8">
      <SloshSlider label="Volume" defaultValue={55} />
      <SloshSlider label="Bass" defaultValue={30} accent="#ff9f0a" onChange={(v) => console.log("bass", v)} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "goo-reorder",
    name: "Goo Reorder",
    registryCliName: "goo-reorder",
    description:
      "A drag-to-reorder list made of ink: rows stay joined to their neighbours by a liquid neck that stretches as one leaves and pinches off as it lands, while the text stays sharp on top.",
    categorySlug: "inputs-controls",
    tags: ["reorder", "sortable", "drag and drop", "list", "goo", "liquid", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "GooReorderItem[]", defaultValue: "DEFAULT_GOO_ITEMS", description: "Starting rows, each { id, label, color } where color tints the numbered badge." },
      { name: "onReorder", type: "(items: GooReorderItem[]) => void", description: "Called with the new order after the user drags a row or moves it with the arrow keys." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Swaps two random rows every 1.6s until someone touches the list." },
    ],
    Preview: Previews.PreviewGooReorder,
    previewShell: "plain",
    reactSource: `"use client";

import { GooReorder } from "@/components/goo-reorder";

const steps = [
  { id: "plan", label: "Plan the sprint", color: "#ff9f0a" },
  { id: "build", label: "Build the feature", color: "#5ac8fa" },
  { id: "test", label: "Test on devices", color: "#30d158" },
  { id: "ship", label: "Ship it", color: "#ff375f" },
];

export function ReleaseSteps() {
  return <GooReorder items={steps} onReorder={(next) => console.log(next.map((s) => s.id))} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "hop-labels",
    name: "Hop Labels",
    registryCliName: "hop-labels",
    description:
      "Outlined text fields whose label sits inside like a placeholder, then lifts into the border on focus with a hop running along its letters while the outline parts to make room. The email field checks itself on blur with a shake or a tick.",
    categorySlug: "inputs-controls",
    tags: ["input", "text field", "floating label", "outlined", "form", "validation", "material", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["type", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Outline and label colour while a field is focused." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a name and an email into the form by itself, until someone touches it." },
    ],
    Preview: Previews.PreviewHopLabels,
    previewShell: "plain",
    reactSource: `"use client";

import { HopField } from "@/components/hop-labels";

export function SignupForm() {
  return (
    <form className="flex w-[320px] flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <HopField label="Full name" accent="#5e5ce6" />
      <HopField
        label="Work email"
        type="email"
        accent="#5e5ce6"
        validate={(v) => /^\\S+@\\S+\\.\\S+$/.test(v)}
        errorMessage="Use your work email."
      />
      <HopField label="Password" type="password" accent="#5e5ce6" validate={(v) => v.length >= 8} errorMessage="At least 8 characters." />
    </form>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "step-player",
    name: "Step Player",
    registryCliName: "step-player",
    description:
      "An onboarding player: the current step's dot stretches into a bar that fills while it plays, then eases over to the next dot as a small wave runs through the ones ahead. Play, pause, or tap a dot to jump to a step.",
    categorySlug: "inputs-controls",
    tags: ["onboarding", "stepper", "progress", "dots", "pagination", "carousel", "tour", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-20",
    animationKinds: ["spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the filling bar, finished dots and the \"Step n of m\" line." },
      { name: "steps", type: "StepPlayerStep[]", defaultValue: "DEFAULT_STEPS", description: "Steps to play through, each { t: title, b: one-line body }." },
      { name: "stepDuration", type: "number", defaultValue: "3.2", description: "Seconds each step plays before moving on." },
      { name: "autoplay", type: "boolean", defaultValue: "true", description: "Starts playing on mount. Set to false to start paused; the play button still works." },
    ],
    Preview: Previews.PreviewStepPlayer,
    previewShell: "plain",
    reactSource: `"use client";

import { StepPlayer, type StepPlayerStep } from "@/components/step-player";

const tour: StepPlayerStep[] = [
  { t: "Import your tracks", b: "Drag a folder in, we sort the rest." },
  { t: "Make a playlist", b: "Hold a song to add it anywhere." },
  { t: "Share it", b: "Friends can listen without an account." },
];

export function WelcomeTour() {
  return <StepPlayer steps={tour} accent="#ff375f" stepDuration={4} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "pull-to-refresh",
    name: "Pull to Refresh",
    registryCliName: "pull-to-refresh",
    description:
      "A balance card you pull down to refresh: it rubber-bands and stretches while a ring draws itself, closes the ring past the line, holds while it spins, then springs back with a little overshoot as the digits roll and the chart redraws.",
    categorySlug: "loaders",
    tags: ["pull to refresh", "refresh", "drag", "elastic", "rubber band", "balance", "finance", "spinner", "mobile", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "initialBalance", type: "number", defaultValue: "58834.75", description: "Balance shown before the first refresh." },
      { name: "onRefresh", type: "(balance: number, delta: number) => void", defaultValue: "undefined", description: "Called each time a pull commits, with the new balance and the change." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Pulls the card down and refreshes every 4.2 s, until someone drags it or uses the keyboard." },
    ],
    Preview: Previews.PreviewPullToRefresh,
    previewShell: "plain",
    reactSource: `"use client";

import { PullToRefresh } from "@/components/pull-to-refresh";

export function WalletScreen() {
  return (
    <PullToRefresh
      initialBalance={12480.5}
      onRefresh={(balance, delta) => console.log("New balance", balance, "change", delta)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "runaway-button",
    name: "Runaway Button",
    registryCliName: "runaway-button",
    description:
      "A cancel-subscription dialog whose cancel button slips away from the pointer, getting less sure of itself each time, then gives up after a few tries and lets you click it. Keyboard users get a normal button that never moves while focused.",
    categorySlug: "inputs-controls",
    tags: ["button", "playful", "dialog", "cancel", "dark pattern", "easter egg", "pointer", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 157,
    createdAt: "2026-10-20",
    animationKinds: ["magnetic", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "onCancel", type: "() => void", defaultValue: "undefined", description: "Called when the cancel button is finally clicked or activated from the keyboard." },
      { name: "onKeep", type: "() => void", defaultValue: "undefined", description: "Called when \"Keep my plan\" is clicked." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Hops the cancel button around the dialog every 1.1 s, until someone points at it, focuses it or presses a key." },
    ],
    Preview: Previews.PreviewRunawayButton,
    previewShell: "plain",
    reactSource: `"use client";

import { RunawayButton } from "@/components/runaway-button";

export function CancelPlan() {
  return (
    <RunawayButton
      onKeep={() => console.log("Stayed on the plan")}
      onCancel={() => fetch("/api/subscription", { method: "DELETE" })}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "wake-slider",
    name: "Wake Slider",
    registryCliName: "wake-slider",
    description:
      "A thumbless range made of 56 thin bars. Drag across it and the bars you pass spring up in a wake behind the pointer, taller the faster you move, then ripple back down; the value is wherever the colour ends.",
    categorySlug: "inputs-controls",
    tags: ["slider", "range", "bars", "spring", "ripple", "drag", "volume", "brightness", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: '"Brightness"', description: "Label above the bars; also the slider's accessible name." },
      { name: "defaultValue", type: "number", defaultValue: "40", description: "Starting value, 0 to 100." },
      { name: "accent", type: "string", defaultValue: '"#ff9f0a"', description: "Colour of the bars up to the current value." },
      { name: "onValueChange", type: "(value: number) => void", defaultValue: "undefined", description: "Called with the rounded value whenever it changes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps back and forth by itself until the user drags or presses a key." },
    ],
    Preview: Previews.PreviewWakeSlider,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { WakeSlider } from "@/components/wake-slider";

export function DisplaySettings() {
  const [volume, setVolume] = useState(60);
  return (
    <div className="flex flex-col gap-8">
      <WakeSlider label="Brightness" defaultValue={40} />
      <WakeSlider label="Volume" defaultValue={volume} accent="#0a84ff" onValueChange={setVolume} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "seek-search",
    name: "Seek Search",
    registryCliName: "seek-search",
    description:
      "A round search button that opens into a field as one object: the pill springs wider while the magnifier turns, and a list of local suggestions drops in underneath and filters as you type. Escape, or leaving it empty, folds it back.",
    categorySlug: "inputs-controls",
    tags: ["search", "input", "expand", "suggestions", "autocomplete", "command", "popLayout", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["spring", "layout", "type"],
    dependencies: ["framer-motion"],
    props: [
      { name: "suggestions", type: "string[]", defaultValue: '["Quarterly report", "Design review notes", …]', description: "Local suggestions shown under the field and filtered as you type. Nothing is fetched." },
      { name: "placeholder", type: "string", defaultValue: '"Search files"', description: "Placeholder and accessible name of the field." },
      { name: "maxLength", type: "number", defaultValue: "64", description: "Longest query the field accepts; the query is trimmed before filtering." },
      { name: "onSelect", type: "(suggestion: string) => void", defaultValue: "undefined", description: "Called with a suggestion when it is clicked." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens, types a word, clears and folds back on a loop until the user interacts." },
    ],
    Preview: Previews.PreviewSeekSearch,
    previewShell: "plain",
    reactSource: `"use client";

import { useRouter } from "next/navigation";
import { SeekSearch } from "@/components/seek-search";

const DOCS = ["Getting started", "Billing and invoices", "Team permissions", "API keys", "Webhooks"];

export function DocsSearch() {
  const router = useRouter();
  return (
    <SeekSearch
      suggestions={DOCS}
      placeholder="Search docs"
      onSelect={(title) => router.push(\`/docs?q=\${encodeURIComponent(title)}\`)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "fold-note",
    name: "Fold Note",
    registryCliName: "fold-note",
    description:
      "A printed credit note you fold on its centre crease. Drag the right half over and it turns in 3D, shading as it goes and showing its patterned back; past halfway it snaps shut with a bounce, and a tap opens it again.",
    categorySlug: "cards",
    tags: ["fold", "note", "voucher", "gift card", "3d", "rotateY", "pan", "paper", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 147,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Store Credit"', description: "Small caps heading printed top left." },
      { name: "amount", type: "string", defaultValue: '"50"', description: "Denomination printed top right and, smaller, bottom right." },
      { name: "serial", type: "string", defaultValue: '"NOT LEGAL TENDER · SC 000042"', description: "Fine print along the bottom edge." },
      { name: "backLabel", type: "string", defaultValue: '"Thanks"', description: "Word printed on the back of the folding half." },
      { name: "onFoldChange", type: "(folded: boolean) => void", defaultValue: "undefined", description: "Called with true when the note snaps shut and false when it opens." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Folds and unfolds every two seconds until the user grabs or taps it." },
    ],
    Preview: Previews.PreviewFoldNote,
    previewShell: "plain",
    reactSource: `"use client";

import { FoldNote } from "@/components/fold-note";

export function RewardCard() {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[15px] text-neutral-500">You earned a reward. Fold it to keep it.</p>
      <FoldNote title="Reward" amount="25" serial="VALID UNTIL 31 DEC · RW 001284" backLabel="Saved" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "assign-picker",
    name: "Assign Picker",
    registryCliName: "assign-picker",
    description:
      "An assignee pill with a multi-select menu. Tick people and each avatar flies from its row into the pill, which grows to hold them and stacks them with a count past three; the label reads one name, two names or a number.",
    categorySlug: "inputs-controls",
    tags: ["assign", "assignee", "avatar", "multi-select", "people", "picker", "layout", "dropdown", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-20",
    animationKinds: ["layout", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "people", type: "AssignPerson[]", defaultValue: "five sample people", description: "People in the menu: { id, name, role, colors: [from, to] }. Avatars are gradient circles with initials." },
      { name: "defaultValue", type: "string[]", defaultValue: "[]", description: "Ids selected on first render." },
      { name: "onChange", type: "(ids: string[]) => void", defaultValue: "undefined", description: "Called with the selected ids, in the order they were picked." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens the menu, ticks four people, closes and clears, on a loop until the user clicks." },
    ],
    Preview: Previews.PreviewAssignPicker,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { AssignPicker, type AssignPerson } from "@/components/assign-picker";

const TEAM: AssignPerson[] = [
  { id: "ln", name: "Lena Novak", role: "Design", colors: ["#ff6fd8", "#ff9f0a"] },
  { id: "ok", name: "Omar Khan", role: "Engineering", colors: ["#5ac8fa", "#5e5ce6"] },
  { id: "sf", name: "Sofia Ferreira", role: "Product", colors: ["#30d158", "#0b8f6a"] },
];

export function TaskAssignees() {
  const [ids, setIds] = useState<string[]>(["ok"]);
  return (
    <div className="flex flex-col gap-2">
      <AssignPicker people={TEAM} defaultValue={ids} onChange={setIds} />
      <p className="text-[13px] text-neutral-500">{ids.length} assigned</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "bend-text",
    name: "Bend Text",
    registryCliName: "bend-text",
    description:
      "A line of type running along a string that you can grab and pull, with the words flowing round the bend. Let go and an underdamped spring twangs it back, overshooting a few times before it lies flat.",
    categorySlug: "motion-effects",
    tags: ["text", "textPath", "svg", "string", "pluck", "typography", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", defaultValue: '"PLUCK THE LINE · MAKE IT SING · "', description: "One repeat of the text on the string; it is repeated four times so the line stays full." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the grab point and the focus ring." },
      { name: "hint", type: "string", defaultValue: '"Grab the line, pull, and let go."', description: "Caption under the stage. An empty string hides it." },
      { name: "onPluck", type: "(pull: number) => void", description: "Called on release with how far the string was pulled from rest, in stage units." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plucks the string every 2.6s until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the root element." },
    ],
    Preview: Previews.PreviewBendText,
    previewShell: "plain",
    reactSource: `"use client";

import { BendText } from "@/components/bend-text";

export function PluckHeadline() {
  return (
    <BendText
      text="NEW SEASON · NEW SOUNDS · "
      accent="#ff375f"
      hint="Pull the string."
      onPluck={(pull) => {
        if (pull > 80) console.log("big pluck");
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "pressure-text",
    name: "Pressure Text",
    registryCliName: "pressure-text",
    description:
      "A headline that bulges where you hover: letters near the pointer swell taller and heavier on a variable font's weight axis and take the accent colour. Each letter has its own spring, so the swell falls away smoothly on either side.",
    categorySlug: "motion-effects",
    tags: ["text", "typography", "variable font", "font weight", "hover", "headline", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", defaultValue: '"Feel every word"', description: "The headline. Each character gets its own spring." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour the letters take near the pointer." },
      { name: "hint", type: "string", defaultValue: '"Move along the word."', description: "Caption under the headline. An empty string hides it." },
      { name: "spread", type: "number", defaultValue: "0.18", description: "Share of the word's width a letter can be from the pointer and still swell." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps a bulge back and forth along the word until someone hovers it." },
      { name: "className", type: "string", description: "Extra classes for the root element." },
    ],
    Preview: Previews.PreviewPressureText,
    previewShell: "plain",
    reactSource: `"use client";

import { PressureText } from "@/components/pressure-text";

export function HeroHeadline() {
  return <PressureText text="Made to be touched" accent="#5e5ce6" spread={0.25} hint="" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "morph-cursor",
    name: "Morph Cursor",
    registryCliName: "morph-cursor",
    description:
      "An iPad-style pointer for a panel: a soft dot that melts into the shape of whatever you can press, sits behind it as a highlight while the element leans toward you, and turns into a caret over text. The system cursor is hidden only inside the panel.",
    categorySlug: "motion-effects",
    tags: ["cursor", "pointer", "ipad", "hover", "highlight", "magnetic", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "magnetic", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "icons", type: "MorphCursorIcon[]", defaultValue: "DEFAULT_MORPH_ICONS", description: "Icon buttons in the top row, each { id, label, path } with a 24×24 path." },
      { name: "buttonLabel", type: "string", defaultValue: '"Start a project"', description: "Label of the pill button." },
      { name: "inputLabel", type: "string", defaultValue: '"Project name"', description: "Accessible name of the text field." },
      { name: "defaultInputValue", type: "string", defaultValue: '"Spring launch, website and email"', description: "Starting text in the field." },
      { name: "cards", type: "MorphCursorCard[]", defaultValue: "DEFAULT_MORPH_CARDS", description: "Tiles under the field, each { id, label, gradient }." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the caret over the field and of the focus rings." },
      { name: "onAction", type: "(id: string) => void", description: "Called with an icon id, \"button\" for the pill, or a card id when one is pressed." },
      { name: "hint", type: "string", defaultValue: '"Move the pointer around."', description: "Caption at the bottom of the panel. An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Tours the pointer over every target until someone moves over the panel." },
      { name: "className", type: "string", description: "Extra classes for the panel." },
    ],
    Preview: Previews.PreviewMorphCursor,
    previewShell: "plain",
    reactSource: `"use client";

import { MorphCursor } from "@/components/morph-cursor";

export function ToolbarPanel() {
  return (
    <MorphCursor
      buttonLabel="New board"
      inputLabel="Board name"
      defaultInputValue="Q4 roadmap"
      cards={[
        { id: "notes", label: "Notes", gradient: "linear-gradient(135deg,#ffd60a,#ff9f0a)" },
        { id: "tasks", label: "Tasks", gradient: "linear-gradient(135deg,#30d158,#0a7d3b)" },
      ]}
      onAction={(id) => console.log("pressed", id)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ink-theme-switch",
    name: "Ink Theme Switch",
    registryCliName: "ink-theme-switch",
    description:
      "A dark-mode toggle where the dark version of a settings panel pours out of the switch as a growing ink circle and drains back in when you switch off. The sun pulls in its rays and turns into a crescent moon, and only the component's own panel is themed.",
    categorySlug: "inputs-controls",
    tags: ["theme toggle", "dark mode", "switch", "clip-path", "settings", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "defaultDark", type: "boolean", defaultValue: "false", description: "Start with the panel dark. Only the component's own panel is themed; the page theme is never touched." },
      { name: "onChange", type: "(dark: boolean) => void", description: "Called with the new value when the user flips the switch." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Flips between light and dark every 2.2s until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the panel." },
    ],
    Preview: Previews.PreviewInkThemeSwitch,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { InkThemeSwitch } from "@/components/ink-theme-switch";

export function AppearanceSetting() {
  const [dark, setDark] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <InkThemeSwitch defaultDark={dark} onChange={setDark} />
      <p className="text-sm text-neutral-500">Preview is {dark ? "dark" : "light"}</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "liquid-gauge",
    name: "Liquid Gauge",
    registryCliName: "liquid-gauge",
    description:
      "A storage meter drawn as liquid in a glass orb, with two rolling wave layers, rising bubbles and a surface that leans toward the pointer. The percentage is drawn twice so the part under the liquid turns white, and changing the level sloshes it.",
    categorySlug: "dashboards",
    tags: ["gauge", "storage", "meter", "progress", "liquid", "wave", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "total", type: "number", defaultValue: "200", description: "Capacity of the store, in units." },
      { name: "defaultUsed", type: "number", defaultValue: "136", description: "Amount used on first render, clamped to 0..total." },
      { name: "accent", type: "string", defaultValue: '"#0a84ff"', description: "Liquid colour while usage is below warnAt." },
      { name: "warnAt", type: "number", defaultValue: "85", description: "Percentage at which the liquid turns orange and the caption warns." },
      { name: "unit", type: "string", defaultValue: '"GB"', description: "Unit shown in the caption." },
      { name: "onChange", type: "(used: number) => void", description: "Called with the new amount after Clean up (-40) or Add files (+30)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sloshes through a few fill levels until someone presses a button." },
    ],
    Preview: Previews.PreviewLiquidGauge,
    previewShell: "plain",
    reactSource: `"use client";

import { LiquidGauge } from "@/components/liquid-gauge";

export function StorageCard() {
  return (
    <LiquidGauge
      total={512}
      defaultUsed={301}
      accent="#30d158"
      warnAt={90}
      onChange={(used) => console.log("now using", used, "GB")}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "thermo-dial",
    name: "Thermo Dial",
    registryCliName: "thermo-dial",
    description:
      "A thermostat ring you drag round or step with the arrow keys. Ticks light up to the set point, the glow shifts from cool blue to warm orange, the number rolls and the label says whether it is heating or cooling toward the room temperature.",
    categorySlug: "inputs-controls",
    tags: ["thermostat", "dial", "knob", "slider", "temperature", "smart home", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "room", type: "number", defaultValue: "19.5", description: "Current room temperature; marks a tick and decides Heating, Cooling or Holding." },
      { name: "defaultValue", type: "number", defaultValue: "21", description: "Target temperature the dial starts at." },
      { name: "min", type: "number", defaultValue: "10", description: "Lowest settable temperature (start of the arc)." },
      { name: "max", type: "number", defaultValue: "30", description: "Highest settable temperature (end of the arc)." },
      { name: "step", type: "number", defaultValue: "0.5", description: "Increment for dragging and the arrow keys." },
      { name: "onChange", type: "(value: number) => void", description: "Called with the new target when the user drags or uses the keyboard." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Turns the dial to a few set points until someone touches it." },
    ],
    Preview: Previews.PreviewThermoDial,
    previewShell: "plain",
    reactSource: `"use client";

import { ThermoDial } from "@/components/thermo-dial";

export function LivingRoomThermostat() {
  return (
    <ThermoDial
      room={68}
      defaultValue={70}
      min={50}
      max={86}
      step={1}
      onChange={(target) => console.log("set to", target, "°F")}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "pull-cord",
    name: "Pull Cord",
    registryCliName: "pull-cord",
    description:
      "A light switch on a cord: a small verlet rope you grab by its bead, pull past its slack and let go to toggle the light. The panel lights up or goes dark and the cord swings and settles; Enter or Space tugs it from the keyboard.",
    categorySlug: "inputs-controls",
    tags: ["switch", "toggle", "light", "rope", "physics", "verlet", "dark mode", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "defaultOn", type: "boolean", defaultValue: "false", description: "Whether the light starts on." },
      { name: "onChange", type: "(on: boolean) => void", description: "Called with the new state when the user pulls the cord or presses Enter/Space on it." },
      { name: "onText", type: "string", defaultValue: '"Lights on."', description: "Headline while the light is on." },
      { name: "offText", type: "string", defaultValue: '"Lights off."', description: "Headline while the light is off." },
      { name: "hint", type: "string", defaultValue: '"Pull the cord."', description: "Small line under the headline." },
      { name: "className", type: "string", description: "Extra classes for the 320px-wide outer wrapper." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Tugs the cord every 2.6s until someone grabs it." },
    ],
    Preview: Previews.PreviewPullCord,
    previewShell: "plain",
    reactSource: `"use client";

import { useState } from "react";
import { PullCord } from "@/components/pull-cord";

export function FocusLamp() {
  const [focus, setFocus] = useState(false);
  return (
    <PullCord
      defaultOn={focus}
      onText="Focus mode on."
      offText="Focus mode off."
      hint="Pull to toggle notifications."
      onChange={setFocus}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "scratch-reveal",
    name: "Scratch Reveal",
    registryCliName: "scratch-reveal",
    description:
      "A reward scratch card: rub the silver foil and it wears through where you scratch, shedding dust that falls out of the card. Once enough is gone the rest lifts away with a burst of confetti and the code can be copied to the clipboard.",
    categorySlug: "cards",
    tags: ["scratch card", "reward", "coupon", "promo code", "canvas", "reveal", "copy", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "code", type: "string", defaultValue: '"MOTION20"', description: "The code under the foil; the Copy button writes it to the clipboard." },
      { name: "headline", type: "string", defaultValue: '"20% off Pro"', description: "Prize line above the code." },
      { name: "eyebrow", type: "string", defaultValue: '"You won"', description: "Small uppercase line above the headline." },
      { name: "accent", type: "string", defaultValue: '"#bf5af2"', description: "Colour of the eyebrow." },
      { name: "threshold", type: "number", defaultValue: "0.55", description: "Share of the foil (0 to 1) that must be scratched before the rest lifts away." },
      { name: "onReveal", type: "() => void", description: "Called each time the foil comes off." },
      { name: "onCopy", type: "(code: string) => void", description: "Called with the code after it has been copied." },
      { name: "className", type: "string", description: "Extra classes for the outer wrapper." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Scratches the card, reveals it and starts over until someone touches it." },
    ],
    Preview: Previews.PreviewScratchReveal,
    previewShell: "plain",
    reactSource: `"use client";

import { ScratchReveal } from "@/components/scratch-reveal";

export function WelcomeGift() {
  return (
    <ScratchReveal
      eyebrow="Welcome gift"
      headline="Free month"
      code="HELLO-30"
      accent="#ff375f"
      onReveal={() => console.log("revealed")}
      onCopy={(code) => console.log("copied", code)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "polaroid-develop",
    name: "Polaroid Develop",
    registryCliName: "polaroid-develop",
    description:
      "An instant photo you develop by dragging and shaking it: the faster it moves, the quicker the grey haze clears and the colour comes through. It swings with the drag velocity, develops slowly on its own, and writes a handwritten caption once it is done.",
    categorySlug: "cards",
    tags: ["polaroid", "photo", "instant camera", "drag", "velocity", "shake", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "src", type: "string", description: "Photo to develop. Without it the drawn scenes are shown." },
      { name: "alt", type: "string", defaultValue: '""', description: "Alt text for src." },
      { name: "caption", type: "string", description: "Handwritten caption for src once developed. Drawn scenes carry their own." },
      { name: "scenes", type: "PolaroidScene[]", defaultValue: "DEFAULT_POLAROID_SCENES", description: "Drawn scenes cycled by New photo, each { sky, sea, sun, land, caption }." },
      { name: "onDeveloped", type: "(caption: string) => void", description: "Called when the photo finishes developing, with its caption (or alt)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Shakes the photo by itself and swaps to a new one until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewPolaroidDevelop,
    previewShell: "plain",
    reactSource: `"use client";

import { PolaroidDevelop } from "@/components/polaroid-develop";

export function TripSnapshot() {
  return (
    <PolaroidDevelop
      src="/images/porto.jpg"
      alt="Rooftops in Porto"
      caption="Porto, last light"
      onDeveloped={(caption) => console.log("developed", caption)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "wallet-stack",
    name: "Wallet Stack",
    registryCliName: "wallet-stack",
    description:
      "Payment cards tucked into a leather wallet, each peeking out a little higher than the one in front. Picking a card slides it out while the others sink, then turns it over in 3D to show the back; picking it again puts it away.",
    categorySlug: "cards",
    tags: ["wallet", "credit card", "payment", "card stack", "flip", "3d", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "spring", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "WalletCard[]", defaultValue: "DEFAULT_WALLET_CARDS", description: "Cards from back to front, each { id, name, last, bg, ink, brand, expires? }. Four fit best." },
      { name: "label", type: "string", defaultValue: '"Wallet"', description: "Word stamped on the wallet; also the group's accessible name." },
      { name: "hint", type: "string", defaultValue: '"Pick a card."', description: "Hint under the wallet. An empty string hides it." },
      { name: "onSelect", type: "(id: string | null) => void", description: "Called with the card id when one slides out, and null when it is put back." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Takes each card out, flips it and puts it back in turn until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewWalletStack,
    previewShell: "plain",
    reactSource: `"use client";

import { WalletStack } from "@/components/wallet-stack";

const cards = [
  { id: "main", name: "Main", last: "5521", bg: "linear-gradient(135deg,#2c2c2e,#0b0b0c)", ink: "#f5f5f7", brand: "Acme Bank" },
  { id: "trip", name: "Travel", last: "0937", bg: "linear-gradient(135deg,#5ac8fa,#0a4fd6)", ink: "#ffffff", brand: "Wayfare", expires: "11/29" },
  { id: "team", name: "Team", last: "7340", bg: "linear-gradient(135deg,#ffb38a,#ff375f)", ink: "#ffffff", brand: "Acme Bank" },
];

export function PaymentMethods() {
  return <WalletStack cards={cards} label="Cards" onSelect={(id) => console.log("selected", id)} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "traffic-bars",
    name: "Traffic Bars",
    registryCliName: "traffic-bars",
    description:
      "A stacked bar chart of daily visits by source: the column under your pointer is ringed, the others dim and a tooltip glides beside it with the breakdown. Switch Day to Week and every day's slices fly over and pile into their week.",
    categorySlug: "dashboards",
    tags: ["chart", "bar chart", "stacked bars", "analytics", "traffic", "tooltip", "data visualization", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "theme", type: '"auto" | "light" | "dark"', defaultValue: '"auto"', description: "\"auto\" follows the page's .dark class; \"light\" or \"dark\" pins the card's palette." },
      { name: "colors", type: "string[]", defaultValue: '["#0071e3", "#64d2ff", "#bf5af2"]', description: "Fill for the Direct, Search and Referral slices, bottom to top." },
      { name: "radius", type: "number", defaultValue: "2", description: "Corner radius of each slice, in SVG units." },
      { name: "stagger", type: "number", defaultValue: "12", description: "Delay between neighbouring days when the slices regroup, in ms." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Scrubs along the columns and flips Day/Week until someone interacts." },
    ],
    Preview: Previews.PreviewTrafficBars,
    previewShell: "plain",
    reactSource: `"use client";

import { TrafficBars } from "@/components/traffic-bars";

export function AnalyticsOverview() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <TrafficBars />
      <TrafficBars colors={["#ff9f0a", "#ffd60a", "#ff375f"]} radius={3} stagger={18} />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "stock-line",
    name: "Stock Line",
    registryCliName: "stock-line",
    description:
      "A trading-app price chart: scrub along it and a dot rides the line while the price rolls digit by digit and the change turns green or red. Switching range morphs the line into its new shape, and on 1D the last price keeps ticking live.",
    categorySlug: "dashboards",
    tags: ["chart", "line chart", "stock", "price", "finance", "trading", "rolling digits", "data visualization", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "theme", type: '"auto" | "light" | "dark"', defaultValue: '"auto"', description: "\"auto\" follows the page's .dark class; \"light\" or \"dark\" pins the card's palette." },
      { name: "symbol", type: "string", defaultValue: '"NXUS"', description: "Ticker shown in the corner and read out in the chart's label." },
      { name: "smooth", type: "boolean", defaultValue: "true", description: "Draw the line as smooth curves instead of straight segments." },
      { name: "fill", type: "boolean", defaultValue: "true", description: "Fade a gradient area under the line." },
      { name: "up", type: "string", defaultValue: '"#30d158"', description: "Line and change colour while the price is at or above the range's open." },
      { name: "down", type: "string", defaultValue: '"#ff453a"', description: "Line and change colour while the price is below the range's open." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles through the ranges and sweeps the dot along each one until someone interacts." },
    ],
    Preview: Previews.PreviewStockLine,
    previewShell: "plain",
    reactSource: `"use client";

import { StockLine } from "@/components/stock-line";

export function Watchlist() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <StockLine symbol="NXUS" />
      <StockLine symbol="ACME" smooth={false} up="#0a84ff" down="#ff9f0a" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "pulse-monitor",
    name: "Pulse Monitor",
    registryCliName: "pulse-monitor",
    description:
      "A heart-rate card with a bedside-monitor ECG trace that sweeps and erases as it goes, a heart that beats on every spike and 24 hourly range bars you can scrub. Start a workout and the rate climbs, the beats close up and the colour warms.",
    categorySlug: "dashboards",
    tags: ["heart rate", "ecg", "health", "fitness", "canvas", "range bars", "chart", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "spring", "drag"],
    dependencies: ["framer-motion"],
    props: [
      { name: "bpm", type: "number", defaultValue: "68", description: "Resting heart rate. Also seeds the day's hourly ranges; a workout climbs to max(bpm + 50, 120)." },
      { name: "color", type: "string", defaultValue: '"#ff375f"', description: "Colour of the trace, heart and range bars at rest." },
      { name: "workoutColor", type: "string", defaultValue: '"#ff9f0a"', description: "Colour everything warms to, and the button fills with, during a workout." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Toggles a workout every ~10s and sweeps the hour readout along the bars until someone interacts." },
    ],
    Preview: Previews.PreviewPulseMonitor,
    previewShell: "plain",
    reactSource: `"use client";

import { PulseMonitor } from "@/components/pulse-monitor";

export function HealthSummary() {
  return (
    <section className="grid gap-6 sm:grid-cols-2">
      <PulseMonitor bpm={62} />
      <PulseMonitor bpm={74} color="#bf5af2" workoutColor="#30d158" />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "spend-donut",
    name: "Spend Donut",
    registryCliName: "spend-donut",
    description:
      "A monthly budget donut: the slice you point at slides out of the ring and thickens while the centre rolls to its amount. Switch month and every slice re-measures itself in one continuous spring sweep.",
    categorySlug: "dashboards",
    tags: ["donut chart", "pie chart", "budget", "spending", "finance", "chart", "legend", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "thickness", type: "number", defaultValue: "18", description: "Ring thickness in px (220px viewBox). The pointed-at slice grows by 6." },
      { name: "gap", type: "number", defaultValue: "4", description: "Clear space between slices in px; the round caps are accounted for." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Points at each category in turn and changes month every ~8s until someone interacts." },
    ],
    Preview: Previews.PreviewSpendDonut,
    previewShell: "plain",
    reactSource: `"use client";

import { SpendDonut } from "@/components/spend-donut";

export function BudgetPanel() {
  return (
    <aside className="flex justify-center p-6">
      <SpendDonut thickness={22} gap={6} />
    </aside>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tag-pit",
    name: "Tag Pit",
    registryCliName: "tag-pit",
    description:
      "An interests picker where every tag is a physical pill dropped into a tray. Grab and throw the pills, shake the tray, and tap one to pick it so it hops up and lights; Continue unlocks once enough are picked.",
    categorySlug: "inputs-controls",
    tags: ["tags", "interests", "picker", "onboarding", "chips", "physics", "throw", "matter-js", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "press", "spring", "layout"],
    dependencies: ["framer-motion", "matter-js"],
    props: [
      { name: "tags", type: "string[]", defaultValue: '["Design", "Motion", "Typography", "3D", "Photography", "AI", "Music", "Startups", "Travel", "Coffee", "Gaming", "Writing", "Code", "Film", "Architecture", "Fitness"]', description: "The interests to pick from. Each one becomes a physical pill sized to its label." },
      { name: "min", type: "number", defaultValue: "3", description: "How many picks unlock the Continue button." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of picked pills, the picked chips and the Continue button (6-digit hex)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Picks a few tags and shakes the tray by itself until someone touches it." },
    ],
    Preview: Previews.PreviewTagPit,
    previewShell: "plain",
    reactSource: `"use client";

import { TagPit } from "@/components/tag-pit";

const INTERESTS = ["Design", "Motion", "AI", "Music", "Travel", "Coffee", "Code", "Film", "Fitness", "Writing"];

export function OnboardingInterests() {
  return (
    <div className="flex min-h-[520px] items-center justify-center">
      <TagPit tags={INTERESTS} min={3} accent="#0071e3" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "usage-stack",
    name: "Usage Stack",
    registryCliName: "usage-stack",
    description:
      "Usage-based pricing you can see: every 10,000 requests is a block that drops into a bin, coloured by the tier it falls in. Slide the volume up and blocks rain in, slide it down and the newest pop, while the monthly price rolls with it and the blocks can be grabbed and thrown.",
    categorySlug: "pricing-sections",
    tags: ["pricing", "usage based", "metered billing", "slider", "tiers", "calculator", "matter-js", "physics", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring", "press"],
    dependencies: ["framer-motion", "matter-js"],
    props: [
      { name: "defaultValue", type: "number", defaultValue: "120000", description: "Requests per month to start from, rounded to the nearest 10,000 (0 to 600,000)." },
      { name: "onChange", type: "(requests: number, price: number) => void", description: "Called whenever the volume changes, with the request count and the monthly price in dollars." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Steps the volume through a few sample values every 2.6s until someone touches the slider or the bin. Off when reduced motion is preferred." },
    ],
    Preview: Previews.PreviewUsageStack,
    previewShell: "plain",
    reactSource: `"use client";

import { UsageStack } from "@/components/usage-stack";

export function PricingCalculator() {
  return (
    <section className="flex flex-col items-center gap-6 py-16">
      <h2 className="text-3xl font-semibold tracking-tight">Pay for what you use</h2>
      <UsageStack
        defaultValue={200_000}
        onChange={(requests, price) => console.log(requests, price)}
      />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "marble-progress",
    name: "Marble Progress",
    registryCliName: "marble-progress",
    description:
      "An onboarding checklist that keeps score with marbles: tick a step and a marble of its colour rolls down three ramps into a jar, untick it and that marble pops. When every step is done the jar glows.",
    categorySlug: "cards",
    tags: ["onboarding", "checklist", "progress", "marbles", "jar", "physics", "canvas", "matter-js", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion", "matter-js"],
    props: [
      { name: "steps", type: "MarbleStep[]", defaultValue: "5 setup steps", description: "Each step has a label (unique) and a color (6-digit hex) used for its checkbox and marble." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Ticks the steps one by one, then clears them, until someone clicks a step. Off under reduced motion." },
    ],
    Preview: Previews.PreviewMarbleProgress,
    previewShell: "plain",
    reactSource: `"use client";

import { MarbleProgress } from "@/components/marble-progress";

const STEPS = [
  { label: "Add a payment method", color: "#0071e3" },
  { label: "Import your contacts", color: "#30d158" },
  { label: "Send your first invoice", color: "#ff9f0a" },
];

export function SetupChecklist() {
  return <MarbleProgress steps={STEPS} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "cloth-banner",
    name: "Cloth Banner",
    registryCliName: "cloth-banner",
    description:
      "An announcement printed on cloth and pinned to a rail by five pins. It sways in the breeze and drapes under your hand; yank it down hard and the pins pop one by one until it drops away, or press Dismiss to let it fall.",
    categorySlug: "cta-sections",
    tags: ["announcement", "banner", "dismissible", "cloth", "verlet", "canvas", "launch", "physics", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Launch Week"', description: "Big line printed on the cloth." },
      { name: "subtitle", type: "string", defaultValue: '"Oct 27–31 · five drops, one a day"', description: "Smaller line printed under the title." },
      { name: "from", type: "string", defaultValue: '"#0071e3"', description: "Gradient start colour of the cloth (top left)." },
      { name: "to", type: "string", defaultValue: '"#5e5ce6"', description: "Gradient end colour of the cloth (bottom right)." },
      { name: "onDismiss", type: "() => void", description: "Called once the banner has dropped away, whether it was yanked down or dismissed with the button." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sends a gust of wind every 2.2s until someone grabs the cloth or presses a button. Off when reduced motion is preferred." },
    ],
    Preview: Previews.PreviewClothBanner,
    previewShell: "plain",
    reactSource: `"use client";

import { ClothBanner } from "@/components/cloth-banner";

export function LaunchAnnouncement() {
  return (
    <div className="flex justify-center py-10">
      <ClothBanner
        title="Launch Week"
        subtitle="Oct 27–31 · five drops, one a day"
        onDismiss={() => localStorage.setItem("launch-week-dismissed", "1")}
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
];

export function getLibraryComponent(slugOrRegistryName: string) {
  return (
    libraryComponents.find(
      (component) =>
        component.slug === slugOrRegistryName ||
        component.registryCliName === slugOrRegistryName,
    ) ?? null
  );
}

/** Server-only: resolve a Preview ComponentType to its export name in component-previews.tsx */
export function getPreviewExportName(
  preview: ComponentType<{ compact?: boolean }> | null | undefined,
): string {
  if (!preview) return "";
  for (const [key, val] of Object.entries(Previews)) {
    if (val === preview) return key;
  }
  return "";
}
