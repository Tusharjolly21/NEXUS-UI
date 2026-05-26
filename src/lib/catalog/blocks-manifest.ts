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
  | "Text Animations"
  | "Interactive backgrounds"
  | "FAQ sections"
  | "Blog sections"
  | "Navigation";

export type BlockManifestEntry = {
  slug: string;
  registryCliName?: string;
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
    slug: "block-pricing-section",
    registryCliName: "pricing-section",
    name: "Pricing Section",
    description:
      "Interactive pricing layouts with radio selection, monthly and yearly billing transitions, animated prices, and dynamic feature comparisons.",
    category: "Pricing blocks",
    tags: ["pricing", "plans", "comparison", "subscription", "framer-motion"],
    premium: false,
    variants: ["Radio Plan Selector", "Four Tier Billing Switch", "Advanced Pricing Columns", "Spotlight Pricing Cards"],
    reactSource: `import { RadioPlanPricing } from "@/components/blocks/pricing-section";

export default function PricingPage() {
  return <RadioPlanPricing />;
}`,
  },
  {
    slug: "block-text-animations",
    registryCliName: "text-animations",
    name: "Text Animations",
    description:
      "Text animation React components built with Tailwind CSS and Framer Motion. Includes flipping words, typewriter text, blur fade reveals, and AI-style generation — copy-paste ready for Next.js.",
    category: "Text Animations",
    tags: ["text animation react", "text animation react component", "text animation react tailwind", "text animation react motion", "typewriter", "blur", "framer-motion", "hero"],
    premium: true,
    variants: [
      "Typewriter Heading",
      "Typewriter Effect",
      "Blur Fade In",
      "Generate Typewriter with Sound",
    ],
    reactSource: `import {
  TextAnimationBlurFadeIn,
  TextAnimationTypewriterEffect,
  TextGenerateTypewriter,
  TypewriterHeading,
} from "@/components/blocks/text-animations";

export default function Page() {
  return (
    <main className="space-y-10 bg-background p-6">
      <TypewriterHeading
        text="Built with Next.js"
        description="Create stunning animations that bring your website to life. Elevate your user experience with smooth transitions and eye-catching effects that captivate visitors and keep them engaged."
      />
      <TextAnimationTypewriterEffect
        texts={["Launch a polished hero.", "Write less styling.", "Ship faster."]}
      />
      <TextAnimationBlurFadeIn
        text="Reusable motion primitives for headings, paragraphs, and product storytelling."
        once={false}
        repeat
      />
      <TextGenerateTypewriter text="Nexus-ui is generating a clean, production-ready landing section with sound." />
    </main>
  );
}`,
  },
  {
    slug: "block-logo-clouds",
    registryCliName: "logo-clouds",
    name: "Brand Logo Animation",
    description:
      "Six production-ready animated logo cloud variants: blur-flip grid, hover-reveal blur, infinite marquee, cursor spotlight, periodic swap, and minimal single row.",
    category: "Logo clouds",
    tags: ["logos", "brands", "marquee", "spotlight", "animation", "framer-motion"],
    premium: false,
    variants: [
      "Blur Flip Grid",
      "Blur Hover Reveal",
      "Infinite Marquee",
      "Cursor Spotlight",
      "Swap Animation",
      "Single Row Lift",
    ],
    reactSource: `import LogosBlurFlip from "@/components/blocks/logo-clouds/logos-blur-flip";
import LogoCloudBlur from "@/components/blocks/logo-clouds/logo-cloud-blur";
import LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";
import LogoCloudSpotlight from "@/components/blocks/logo-clouds/logo-cloud-spotlight";
import LogoCloudSwap from "@/components/blocks/logo-clouds/logo-cloud-swap";
import LogoCloudSingleRow from "@/components/blocks/logo-clouds/logo-cloud-single-row";

export default function Page() {
  return (
    <>
      <LogosBlurFlip />
      <LogoCloudBlur />
      <LogoCloudMarquee />
      <LogoCloudSpotlight />
      <LogoCloudSwap />
      <LogoCloudSingleRow />
    </>
  );
}`,
  },
  {
    slug: "block-interactive-dots",
    registryCliName: "interactive-backgrounds",
    name: "Interactive Background Card",
    description:
      "Background animation components for websites built with React and Framer Motion. CSS background animations including cursor fields, layered waves, particle noise, and aurora effects — drop into any Next.js hero section.",
    category: "Interactive backgrounds",
    tags: ["background animation for website", "background animation css", "background animation react", "interactive background", "cursor", "canvas", "waves", "particles"],
    premium: true,
    variants: ["Interactive Dots", "Layered Wave Background", "Particle Noise", "Aurora Wavy Lines"],
    reactSource: `export { InteractiveDots } from "@/components/interactive-dots";
export { WavyLines } from "@/components/wavy-lines";`,
  },
  {
    slug: "block-why-choose-us",
    registryCliName: "why-choose-us-bento",
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
    registryCliName: "faq-folder-card",
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
    slug: "block-sidebar",
    registryCliName: "sidebar",
    name: "Sidebar",
    description:
      "Sidebar component React Tailwind CSS — animated navigation sidebars for dashboards and product layouts. Includes simple hover sidebar, collapsible icon-only sidebar, and grouped sidebar built with Framer Motion.",
    category: "Navigation",
    tags: ["sidebar component react", "sidebar component react tailwind", "sidebar ui component react", "collapsible sidebar react", "navigation", "dashboard", "framer-motion"],
    premium: false,
    variants: ["Simple Sidebar with Hover", "Collapsible Sidebar", "Grouped Sidebar"],
    reactSource: `import SimpleSidebar from "@/components/blocks/sidebar/simple-sidebar";
import CollapsibleSidebar from "@/components/blocks/sidebar/collapsible-sidebar";
import GroupedSidebar from "@/components/blocks/sidebar/grouped-sidebar";

export default function Page() {
  return (
    <>
      <SimpleSidebar />
      <CollapsibleSidebar />
      <GroupedSidebar />
    </>
  );
}`,
  },
  {
    slug: "block-contact-page",
    registryCliName: "contact-page",
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
  {
    slug: "block-blog-content-sections",
    registryCliName: "blog-content-sections",
    name: "Blog Content Sections",
    description:
      "Content sections for single blog posts with centered articles, sticky table-of-contents layouts, editorial story sections, featured blog indexes, and interactive blog cards.",
    category: "Blog sections",
    tags: ["blog", "article", "content", "toc", "editorial", "featured posts", "blog card", "single post", "seo"],
    premium: false,
    variants: ["Blog Content Centered", "Blog Content With TOC", "Blog Content Editorial", "Blog Header Featured Posts", "Blog Hover Image Card"],
    reactSource: `import {
  BlogContentCentered,
  BlogContentEditorial,
  BlogHeaderFeaturedPosts,
  BlogHoverImageCardShowcase,
  BlogContentWithToc,
} from "@/components/blocks/blog-content-sections";

export default function BlogPage() {
  return (
    <main className="bg-background">
      <BlogContentCentered />
      <BlogContentWithToc />
      <BlogContentEditorial />
      <BlogHeaderFeaturedPosts />
      <BlogHoverImageCardShowcase />
    </main>
  );
}`,
  },
];
