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
    slug: "block-why-choose-us",
    name: "Why Choose Us Bento Grid",
    description: "Animated feature bento collection with mentoring cards, ATS scoring, upload flows, interview scheduling, and progress tracking.",
    category: "Feature grids",
    tags: ["bento", "features", "animated", "ats", "upload", "framer-motion"],
    premium: false,
    variants: ["Mentorship Bento", "ATS Bento Grid", "Upload Flow", "Progress Tracker", "Interview Cards"],
    reactSource: `import WhyChooseUsBento from "@/components/blocks/animated-bento-grid";\n\nexport default function Page() {\n  return <WhyChooseUsBento />;\n}`,
  },
];
