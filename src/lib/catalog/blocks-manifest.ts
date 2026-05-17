/**
 * Block catalog metadata without live preview components.
 * Import this from marketing / layout code to avoid pulling `@/registry/component-previews` into the initial bundle.
 */

export type BlockCategory =
  | "Hero blocks"
  | "Pricing blocks"
  | "Testimonials"
  | "Feature grids"
  | "Logo clouds"
  | "Stats sections"
  | "CTA sections"
  | "Interactive backgrounds"
  | "FAQ sections"
  | "Blog sections";

export type BlockManifestEntry = {
  slug: string;
  name: string;
  description: string;
  category: BlockCategory;
  tags: string[];
  premium: boolean;
  variants: string[];
  reactSource: string;
};

export const blocksManifest: BlockManifestEntry[] = [
  {
    slug: "block-hero-beam",
    name: "Beam Hero Block",
    description: "Cinematic beam sweep with grid veil for hero anchors.",
    category: "Hero blocks",
    tags: ["ambient", "launch"],
    premium: false,
    variants: ["Default", "Dense grid"],
    reactSource: `export { PreviewBeamSweep as BeamHero } from "@/registry/component-previews";`,
  },
  {
    slug: "block-bento-signals",
    name: "Signal Bento Block",
    description: "Animated bento tiles for KPI storytelling.",
    category: "Feature grids",
    tags: ["metrics"],
    premium: false,
    variants: ["2×2", "3×2"],
    reactSource: `export { PreviewBentoMetrics as BentoSignals } from "@/registry/component-previews";`,
  },
  {
    slug: "block-pricing-toggle",
    name: "Toggle Pricing Block",
    description: "Annual toggle with contextual savings chip.",
    category: "Pricing blocks",
    tags: ["billing"],
    premium: true,
    variants: ["Monthly default", "Annual default"],
    reactSource: `export { PreviewPricingToggle as PricingToggle } from "@/registry/component-previews";`,
  },
  {
    slug: "block-testimonial-depth",
    name: "Depth Testimonials Block",
    description: "Stacked social proof with staggered motion.",
    category: "Testimonials",
    tags: ["social-proof"],
    premium: true,
    variants: ["3 cards", "5 cards"],
    reactSource: `export { PreviewTestimonialStack as DepthTestimonials } from "@/registry/component-previews";`,
  },
  {
    slug: "block-logo-orbit",
    name: "Logo Orbit Row",
    description: "Subtle drifting logo strip placeholder for trust bands.",
    category: "Logo clouds",
    tags: ["trust"],
    premium: false,
    variants: ["Light", "Dark"],
    reactSource: `// Pair with partner SVG marks inside a horizontally scrolling container.`,
  },
  {
    slug: "block-stats-kpi",
    name: "KPI Stats Row",
    description: "Three-up KPI row with micro-interactions.",
    category: "Stats sections",
    tags: ["numbers"],
    premium: false,
    variants: ["3-up", "4-up"],
    reactSource: `export { PreviewDashboardKpi as KpiRow } from "@/registry/component-previews";`,
  },
  {
    slug: "block-cta-nebula",
    name: "Nebula CTA Block",
    description: "Dual glow CTA for closing sections.",
    category: "CTA sections",
    tags: ["conversion"],
    premium: false,
    variants: ["Primary", "Ghost secondary"],
    reactSource: `export { PreviewCtaGlow as NebulaCta } from "@/registry/component-previews";`,
  },
  {
    slug: "block-interactive-dots",
    name: "Interactive Background Card",
    description: "Interactive hero backgrounds with cursor fields, layered waves, particle noise, and premium motion depth.",
    category: "Interactive backgrounds",
    tags: ["background", "cursor", "canvas", "waves", "particles"],
    premium: false,
    variants: ["Interactive Dots", "Layered Wave Background", "Particle Noise"],
    reactSource: `export { InteractiveDots } from "@/components/interactive-dots";`,
  },
  {
    slug: "block-animated-bento",
    name: "Animated Bento Grid",
    description: "Staggered entrance bento tiles with 4 variants, trend badges, and span support for KPI storytelling.",
    category: "Feature grids",
    tags: ["bento", "metrics", "animation", "grid"],
    premium: false,
    variants: ["Default", "Glass", "Gradient Border", "Spotlight"],
    reactSource: `export { AnimatedBentoGrid } from "@/components/animated-bento-grid";`,
  },
  {
    slug: "block-faq-motion",
    name: "Motion FAQ Block",
    description: "Accordion-style FAQ with motion affordances.",
    category: "FAQ sections",
    tags: ["support"],
    premium: false,
    variants: ["Compact", "Relaxed"],
    reactSource: `export { PreviewFaq as MotionFaq } from "@/registry/component-previews";`,
  },
  {
    slug: "block-blog-editorial",
    name: "Editorial Blog Block",
    description: "Featured article with secondary headline stack.",
    category: "Blog sections",
    tags: ["content"],
    premium: false,
    variants: ["Left feature", "Right feature"],
    reactSource: `export { PreviewBlogRail as EditorialRail } from "@/registry/component-previews";`,
  },
];
