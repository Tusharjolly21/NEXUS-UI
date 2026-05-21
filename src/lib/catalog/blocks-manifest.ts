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
  | "Contact sections"
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
    premium: true,
    variants: ["Interactive Dots", "Layered Wave Background", "Particle Noise", "Aurora Wavy Lines"],
    reactSource: `export { InteractiveDots } from "@/components/interactive-dots";
export { WavyLines } from "@/components/wavy-lines";`,
  },
  {
    slug: "block-why-choose-us",
    name: "Why Choose Us Bento Grid",
    description: "Animated feature bento collection with mentoring cards, ATS scoring, upload flows, interview scheduling, and progress tracking.",
    category: "Feature grids",
    tags: ["bento", "features", "animated", "ats", "upload", "framer-motion"],
    premium: true,
    variants: ["Mentorship Bento", "ATS Bento Grid", "Upload Flow", "Progress Tracker", "Interview Cards"],
    reactSource: `import WhyChooseUsBento from "@/components/blocks/animated-bento-grid";\n\nexport default function Page() {\n  return <WhyChooseUsBento />;\n}`,
  },
  {
    slug: "block-faq-folder-card",
    name: "FAQ Folder Card",
    description:
      "A collection of FAQ sections with editable data, searchable categories, and chat-style animated answers.",
    category: "FAQ sections",
    tags: ["faq", "accordion", "chat", "support", "framer-motion"],
    premium: true,
    variants: ["Questions & Answers FAQ", "Searchable FAQ", "Chat FAQ"],
    reactSource: `import {
  ChatFaqSection,
  FaqFolderCard,
  SearchableFaqSection,
} from "@/components/blocks/faq-folder-card";

const faqs = [
  {
    question: "Can I add more FAQs?",
    answer: "Yes. Add as many objects as you need to the items array.",
    tag: "Content",
  },
  {
    question: "Can I use this with CMS data?",
    answer: "Yes. Pass your CMS questions into the items prop.",
    tag: "CMS",
  },
];

export default function Page() {
  return (
    <>
      <FaqFolderCard items={faqs} />
      <SearchableFaqSection items={faqs} />
      <ChatFaqSection items={faqs} />
    </>
  );
}`,
  },
  {
    slug: "block-contact-page",
    name: "Contact Page",
    description:
      "A polished contact page block with map-led reach, centered intake, testimonial proof, and image-backed launch support layouts.",
    category: "Contact sections",
    tags: ["contact", "forms", "map", "testimonial", "landing page", "framer-motion"],
    premium: false,
    variants: ["Global Signal", "Centered Intake", "Gradient Proof", "Image Story"],
    reactSource: `import ContactPageBlock from "@/components/blocks/contact-page";

export default function Page() {
  return <ContactPageBlock />;
}`,
  },
];
