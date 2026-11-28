"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { ExpandableCards, type CardItem } from "@/components/expandable-cards";

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
