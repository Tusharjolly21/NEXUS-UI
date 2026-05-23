"use client";

import * as React from "react";
import { ExpandableCards } from "./expandable-cards";
import type { CardItem } from "./expandable-cards";

const DEMO_CARDS: CardItem[] = [
  {
    id: "1",
    title: "Motion Design System",
    description: "A collection of animation primitives built for React and Tailwind CSS.",
    fullDescription:
      "This design system brings together a cohesive set of animation primitives, spring physics, and declarative components. Every transition is GPU-accelerated, reduced-motion aware, and designed to feel natural at any speed. Ideal for teams who want polished UI without writing animation logic from scratch.",
    image: "https://picsum.photos/seed/ec-1/800/500",
    category: "Design",
    ctaText: "Explore system",
    ctaLink: "#",
  },
  {
    id: "2",
    title: "Canvas Particle Engine",
    description: "High-performance 60 fps particle system for modern web experiences.",
    fullDescription:
      "Built on requestAnimationFrame with a custom physics solver. Supports gravity, wind, turbulence, and custom emitter shapes. Colour gradients, opacity curves, and particle blending are all configurable. Zero runtime dependencies — under 4 kB gzipped.",
    image: "https://picsum.photos/seed/ec-2/800/500",
    category: "Engineering",
    ctaText: "View docs",
    ctaLink: "#",
  },
  {
    id: "3",
    title: "AI-Powered Layout",
    description: "Semantic layout engine that adapts to content using LLM hints.",
    fullDescription:
      "Combine structured layout primitives with LLM-powered suggestions to automatically choose the best composition for your content type. Learns from user feedback over time. Ideal for dashboards, feeds, and editorial pages that need to adapt without manual intervention.",
    image: "https://picsum.photos/seed/ec-3/800/500",
    category: "AI",
    ctaText: "Try it free",
    ctaLink: "#",
  },
  {
    id: "4",
    title: "Fluid Typography Scale",
    description: "Type system with optical size adjustments and variable font support.",
    fullDescription:
      "A carefully tuned typographic scale that adapts across viewport sizes using CSS clamp(). Supports variable font axes for weight, width, and optical size. Comes with pre-configured presets for editorial, product, and marketing sites — all dark and light mode aware.",
    image: "https://picsum.photos/seed/ec-4/800/500",
    category: "Typography",
    ctaText: "See examples",
    ctaLink: "#",
  },
  {
    id: "5",
    title: "Dark Mode Toolkit",
    description: "Semantic color tokens with automatic dark / light mode switching.",
    fullDescription:
      "Stop writing manual dark: variants. This toolkit provides semantic color tokens that switch automatically based on user preference with smooth crossfade transitions. Built on the oklch color space for perceptual uniformity across the full brightness range.",
    image: "https://picsum.photos/seed/ec-5/800/500",
    category: "Theming",
    ctaText: "Read more",
    ctaLink: "#",
  },
  {
    id: "6",
    title: "Responsive Grid Builder",
    description: "Visual tool for generating custom CSS grid configurations.",
    fullDescription:
      "Generate complex CSS grid layouts visually, then export clean, framework-agnostic code. Supports named areas, auto-placement, and responsive breakpoints. Works with Tailwind, CSS Modules, and vanilla CSS with a single click.",
    image: "https://picsum.photos/seed/ec-6/800/500",
    category: "Tools",
    ctaText: "Open builder",
    ctaLink: "#",
  },
];

const USAGE_CODE = `import { ExpandableCards } from "@/components/expandable-cards";
import type { CardItem } from "@/components/expandable-cards";

const cards: CardItem[] = [
  {
    id: "1",
    title: "Motion Design System",
    description: "A collection of animation primitives for React.",
    fullDescription: "Full description shown when the card is expanded...",
    image: "/images/card-1.jpg",
    category: "Design",
    ctaText: "Explore",
    ctaLink: "/components",
  },
  // ...more cards
];

export default function Page() {
  return <ExpandableCards cards={cards} />;
}`;

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/30 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Usage
        </span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            });
          }}
          className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ExpandableCardsDemo() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Expandable Cards</h2>
        <p className="text-sm text-muted-foreground">
          Click any card to expand it and see the full details.
        </p>
      </div>

      <ExpandableCards cards={DEMO_CARDS} />

      <CodeBlock code={USAGE_CODE} />
    </div>
  );
}
