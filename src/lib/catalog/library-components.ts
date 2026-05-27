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
    description: "Cursor-reactive spotlight layered over an aurora field for launch heroes.",
    categorySlug: "hero-sections",
    tags: ["marketing", "gradient", "pointer"],
    premium: false,
    trendingScore: 98,
    createdAt: "2026-04-02",
    animationKinds: ["hover", "gradient"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewHeroAurora,
    reactSource: `"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export function HeroAurora() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spotlight = useMotionTemplate\`radial-gradient(420px at \${x}px \${y}px, rgba(56,189,248,.35), transparent 60%)\`;

  return (
    <section onMouseMove={(e) => {
      const r = e.currentTarget.getBoundingClientRect();
      x.set(e.clientX - r.left); y.set(e.clientY - r.top);
    }} className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 p-10">
      <div className="lf-aurora absolute inset-0 opacity-80" />
      <motion.div className="absolute inset-0" style={{ backgroundImage: spotlight }} />
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Ship faster</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Motion-native interfaces</h1>
      </div>
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "bento-signal-grid",
    name: "Signal Bento Grid",
    description: "Animated bento tiles with breathing gradients for product metrics.",
    categorySlug: "bento-grids",
    tags: ["dashboard", "metrics"],
    premium: false,
    trendingScore: 91,
    createdAt: "2026-03-18",
    animationKinds: ["scroll", "gradient"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewBentoMetrics,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function BentoSignals() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {["Latency", "Uptime"].map((label, i) => (
        <motion.div key={label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <p className="text-xs text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{i === 0 ? "42ms" : "99.99%"}</p>
        </motion.div>
      ))}
    </div>
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
    description: "Compact footer with balanced columns and developer-first links.",
    categorySlug: "footers",
    tags: ["layout"],
    premium: false,
    trendingScore: 62,
    createdAt: "2026-01-22",
    animationKinds: ["hover"],
    dependencies: [],
    Preview: Previews.PreviewFooterMini,
    reactSource: `export function OrbitFooter() {
  return (
    <footer className="rounded-3xl border border-white/10 bg-zinc-950 p-6 text-sm text-zinc-400">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-white">Nexus-UI</p>
        <div className="flex gap-4"><a href="#">Docs</a><a href="#">Status</a></div>
      </div>
    </footer>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "depth-testimonials",
    name: "Depth Testimonials",
    description: "Stacked testimonial planes with staggered motion reveals.",
    categorySlug: "testimonials",
    tags: ["social-proof"],
    premium: false,
    trendingScore: 76,
    createdAt: "2026-04-12",
    animationKinds: ["scroll", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewTestimonialStack,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function DepthTestimonials({ quotes }: { quotes: string[] }) {
  return (
    <div className="relative h-64">
      {quotes.map((q, i) => (
        <motion.figure key={q} className="absolute left-0 right-0 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl" style={{ top: 16 + i * 18 }} initial={{ y: 16, opacity: 0 }} whileInView={{ y: 0, opacity: 1 - i * 0.15 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
          <blockquote className="text-sm text-white">“{q}”</blockquote>
        </motion.figure>
      ))}
    </div>
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
    description: "Slow sweeping light column for cinematic section backgrounds.",
    categorySlug: "background-effects",
    tags: ["ambient"],
    premium: false,
    trendingScore: 84,
    createdAt: "2026-03-30",
    animationKinds: ["gradient", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewBeamSweep,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function BeamField() {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950">
      <div className="lf-grid absolute inset-0 opacity-30" />
      <motion.div className="absolute inset-y-10 w-[2px] bg-gradient-to-b from-transparent via-cyan-300 to-transparent" animate={{ left: ["8%", "86%", "30%", "8%"] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
    </div>
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
    description: "Minimal glass authentication panel with crisp focus states.",
    categorySlug: "login-forms",
    tags: ["auth"],
    premium: false,
    trendingScore: 73,
    createdAt: "2026-02-02",
    animationKinds: ["spring"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewLoginGlass,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function GlassLogin() {
  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <input className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Email" />
      <input className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" type="password" placeholder="Password" />
      <button className="w-full rounded-xl bg-cyan-300 py-2 text-sm font-semibold text-zinc-950">Continue</button>
    </motion.form>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "split-signup-convert",
    name: "Split Signup Convert",
    description: "Two-column signup with narrative panel and compact fields.",
    categorySlug: "signup-forms",
    tags: ["auth", "conversion"],
    premium: false,
    trendingScore: 69,
    createdAt: "2026-03-08",
    animationKinds: ["hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewSignupSplit,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function SplitSignup() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 to-fuchsia-500/10 p-6">
        <p className="text-sm font-semibold text-white">Ship interfaces faster</p>
      </div>
      <motion.div whileTap={{ scale: 0.99 }} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        {/* fields */}
      </motion.div>
    </div>
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
    description: "Dense sidebar navigation tuned for dashboards and tools.",
    categorySlug: "sidebars",
    tags: ["app-shell"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-04-05",
    animationKinds: ["hover", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewSidebarShell,
    reactSource: `"use client";

import { motion } from "framer-motion";

const items = ["Overview", "Library", "Billing"];

export function WorkbenchSidebar() {
  return (
    <aside className="w-64 space-y-2 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
      {items.map((t) => (
        <motion.button key={t} whileHover={{ x: 2 }} className="w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-300 hover:bg-white/10 hover:text-white">{t}</motion.button>
      ))}
    </aside>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "pulse-dashboard-kpis",
    name: "Pulse Dashboard KPIs",
    description: "KPI strip with micro-hover lifts and soft chart placeholders.",
    categorySlug: "dashboards",
    tags: ["analytics"],
    premium: false,
    trendingScore: 101,
    createdAt: "2026-04-16",
    animationKinds: ["hover", "scroll"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewDashboardKpi,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function KpiStrip({ kpis }: { kpis: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {kpis.map((k) => (
        <motion.div key={k.label} whileHover={{ y: -2 }} className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-zinc-400">{k.label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{k.value}</p>
        </motion.div>
      ))}
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "orbital-loader",
    name: "Orbital Loader",
    description: "Dual counter-rotating rings with breathing inner glow.",
    categorySlug: "loaders",
    tags: ["feedback"],
    premium: false,
    trendingScore: 80,
    createdAt: "2026-01-30",
    animationKinds: ["layout", "gradient"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewLoaderOrbit,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function OrbitalLoader() {
  return (
    <div className="relative size-28">
      <motion.span className="absolute inset-0 rounded-full border border-white/10" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
      <motion.span className="absolute inset-2 rounded-full border border-cyan-400/40" animate={{ rotate: -360 }} transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "milestone-timeline",
    name: "Milestone Timeline",
    description: "Vertical roadmap timeline with glowing nodes.",
    categorySlug: "timelines",
    tags: ["roadmap"],
    premium: false,
    trendingScore: 71,
    createdAt: "2026-02-18",
    animationKinds: ["scroll"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewTimeline,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function MilestoneTimeline({ steps }: { steps: string[] }) {
  return (
    <div className="relative pl-6">
      <div className="absolute top-1 bottom-1 left-[7px] w-px bg-white/10" />
      {steps.map((s, i) => (
        <motion.div key={s} initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative mb-6">
          <span className="absolute -left-[9px] top-1 size-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.65)]" />
          <p className="text-sm font-semibold text-white">{s}</p>
        </motion.div>
      ))}
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "lattice-feature-grid",
    name: "Lattice Feature Grid",
    description: "Four-up feature grid with scroll reveals and glass tiles.",
    categorySlug: "feature-sections",
    tags: ["marketing"],
    premium: false,
    trendingScore: 90,
    createdAt: "2026-03-12",
    animationKinds: ["scroll"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewFeatureGrid,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function LatticeFeatures({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((it, i) => (
        <motion.div key={it.title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-5">
          <p className="text-sm font-semibold text-white">{it.title}</p>
          <p className="mt-2 text-xs text-zinc-400">{it.body}</p>
        </motion.div>
      ))}
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "motion-faq-disclosure",
    name: "Motion FAQ Disclosure",
    description: "Lightweight FAQ with directional affordance and animated answers.",
    categorySlug: "faq-sections",
    tags: ["support"],
    premium: false,
    trendingScore: 66,
    createdAt: "2026-01-12",
    animationKinds: ["layout"],
    dependencies: ["framer-motion", "react"],
    Preview: Previews.PreviewFaq,
    reactSource: `"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function MotionFaq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <button key={it.q} type="button" onClick={() => setOpen(i)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">{it.q}</p>
            <motion.span animate={{ rotate: open === i ? 90 : 0 }} className="text-xs text-zinc-400">▸</motion.span>
          </div>
          {open === i ? <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 text-xs text-zinc-400">{it.a}</motion.p> : null}
        </button>
      ))}
    </div>
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
    description: "Featured article plus compact secondary headlines for content hubs.",
    categorySlug: "blog-components",
    tags: ["content"],
    premium: false,
    trendingScore: 58,
    createdAt: "2026-02-26",
    animationKinds: ["scroll"],
    dependencies: [],
    Preview: Previews.PreviewBlogRail,
    reactSource: `export function EditorialRail() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs text-cyan-200/80">Featured</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Designing scroll choreography</h2>
      </article>
      <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-black/30 p-4" />
      ))}</div>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "split-contact-glass",
    name: "Split Contact Glass",
    description: "Marketing narrative paired with a compact contact capture form.",
    categorySlug: "contact-sections",
    tags: ["lead"],
    premium: false,
    trendingScore: 64,
    createdAt: "2026-03-02",
    animationKinds: ["hover"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewContactSplit,
    reactSource: `"use client";

import { motion } from "framer-motion";

export function SplitContact() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 to-fuchsia-500/10 p-6">
        <p className="text-sm font-semibold text-white">Talk with us</p>
      </div>
      <motion.form whileTap={{ scale: 0.995 }} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        {/* fields */}
      </motion.form>
    </div>
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

export function SvgNoise() {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950">
      <motion.div aria-hidden className="absolute inset-0 opacity-40 mix-blend-screen" style={{ backgroundImage: "url(\\\"data:image/svg+xml,...feTurbulence...\\\")" }} animate={{ x: [0, -20, 0], y: [0, 10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
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
      "Hero-grade headline with an animated wave underline, turbulence + Gaussian blur + displacement, optional glyph micro-warp, and reduced-motion fallbacks.",
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
      { name: "glowColor", type: "string", defaultValue: "\"hsl(var(--primary) / 0.9)\"", description: "Glow color used by `GlowingEffect`." },
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
      { name: "shape",          type: '"circle" | "rounded" | "square"',   defaultValue: '"circle"',   description: "Clipping shape applied to each image." },
      { name: "direction",      type: '"left" | "right"',                  defaultValue: '"right"',    description: "Direction the stack fans out toward on hover." },
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
      "Drag a vertical handle to compare two images side-by-side. Supports mouse and touch, optional labels, custom start position, and any aspect ratio.",
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
    description: "A soft animated shader-style background with flowing gradient motion.",
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
      ease: "easeInOut",
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
      ease: "easeInOut",
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
      ease: "easeInOut",
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
      ease: "easeInOut",
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
    name: "Code Block",
    slug: "code-block",
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
    name: "Card Stack Rotator",
    slug: "card-stack-rotator",
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
      { name: "highlightBackground", type: "string", description: "Background color for **bold** text highlights.", defaultValue: "\"rgba(129,140,248,0.18)\"" },
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
    description: "Flip-style countdown timer with four variants — modern, digital, minimal, and classic. Smooth number transitions powered by Framer Motion.",
    categorySlug: "motion-effects",
    tags: ["countdown", "timer", "flip", "launch", "framer-motion"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-04-10",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewAnimatedCountdown,
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

import { BentoGridSkeleton } from "@/components/bento-grid-skeleton";

const cards = [
  { id: "1", title: "Chat activity", tag: "Live", span: "2x1", skeletonType: "chat" },
  { id: "2", title: "Dashboard", tag: "Stats", span: "1x1", skeletonType: "dashboard" },
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
    description: "Animated command palette with ⌘K shortcut, grouped navigation/actions/theme commands, backdrop blur overlay, and Framer Motion enter/exit transitions.",
    categorySlug: "motion-effects",
    tags: ["command", "search", "keyboard", "modal", "framer-motion", "shadcn"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-05-18",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react", "cmdk", "@radix-ui/react-dialog"],
    Preview: Previews.PreviewCommandPalette,
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
