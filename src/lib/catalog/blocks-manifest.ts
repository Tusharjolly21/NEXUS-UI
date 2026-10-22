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
  | "Navigation"
  | "Gallery sections"
  | "Changelog sections"
  | "Error pages"
  | "Footers"
  | "Signup sections";

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
    variants: ["Radio Plan Selector", "Four Tier Billing Switch", "Advanced Pricing Columns", "Spotlight Pricing Cards", "Seat Ruler Pricing", "Beam Pricing", "Toggle Pricing"],
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
      "Scramble Heading",
      "Scroll-read Manifesto",
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
        text="Release notes people read."
        description="Type out a headline, hold it, and let the summary settle in underneath."
      />
      <TextAnimationTypewriterEffect
        texts={["Preview every branch.", "Roll back in one click.", "Sleep through deploys."]}
      />
      <TextAnimationBlurFadeIn
        text="We built the tool we kept wishing for. It does fewer things than the others."
        once={false}
        repeat
      />
      <TextGenerateTypewriter text="Churn rose 1.8 points, almost entirely from annual plans that renewed in August." />
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
      "Loupe Logo Cloud",
      "Cinematic Logo Cloud",
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
    variants: ["Interactive Dots", "Layered Wave Background", "Particle Noise", "Aurora Wavy Lines", "Halftone Planet"],
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
    variants: ["Mentorship Bento", "ATS Bento Grid", "Upload Flow", "Progress Tracker", "Interview Cards", "Pulse Bento", "Live Demo Bento", "Signal Bento Grid", "Animated Bento Grid", "Bento Grid Skeleton"],
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
    variants: ["Questions & Answers FAQ", "Searchable FAQ", "Chat FAQ", "Instant Search FAQ", "Motion FAQ Disclosure"],
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
    variants: ["Simple Sidebar with Hover", "Collapsible Sidebar", "Grouped Sidebar", "Collapsing Rail", "Workbench Sidebar"],
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
    variants: ["Global Signal", "Centered Intake", "Gradient Proof", "Image Story", "Voice Note Contact", "Split Contact Glass"],
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
    variants: ["Blog Content Centered", "Blog Content With TOC", "Blog Content Editorial", "Blog Header Featured Posts", "Blog Hover Image Card", "Editorial Blog Rail"],
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
  {
    slug: "block-checkout-moments",
    registryCliName: "checkout-moments",
    name: "Checkout Moments",
    description:
      "The three moments around a payment as finished sections: an order summary you pay by sliding, a one-time-code approval step, and a tip-and-rate card after delivery.",
    category: "CTA sections",
    tags: ["checkout", "payment", "slide to pay", "3d secure", "otp", "tip", "rating", "order summary", "framer-motion"],
    premium: true,
    variants: ["Pay & Confirm", "Verify Payment", "Tip & Rate", "Slide to Pay"],
    reactSource: `"use client";

import { PayAndConfirm, TipAndRate, VerifyPayment } from "@/components/blocks/checkout-moments";

async function charge(totalCents: number) {
  await fetch("/api/pay", { method: "POST", body: JSON.stringify({ totalCents }) });
}

export default function CheckoutPage() {
  return (
    <main className="grid min-h-screen place-items-center gap-10 bg-[#f5f5f7] p-6 dark:bg-[#0b0b10]">
      <PayAndConfirm merchant="Studio Supply" onPay={charge} receiptEmail="you@studio.co" />
      <VerifyPayment destination="•••• 42" amount={12840} verify={async (code) => code === "424242"} />
      <TipAndRate courier="Maya Chen" orderTotal={4200} />
    </main>
  );
}`,
  },
  {
    slug: "block-navigation",
    registryCliName: "navigation-blocks",
    name: "Navigation",
    description:
      "Site navigation that moves well: one dropdown panel that resizes and slides between menus, with a caret that follows the item, and a menu button on phones.",
    category: "Navigation",
    tags: ["navigation", "navbar", "mega menu", "dropdown", "header", "motion kit", "framer-motion"],
    premium: true,
    variants: ["Morphing Nav", "Float Glass Navbar"],
    reactSource: `import { MorphingNav } from "@/components/blocks/motion-kit/morphing-nav";

export default function Header() {
  return <MorphingNav />;
}`,
  },
  {
    slug: "block-hero",
    registryCliName: "hero-blocks",
    name: "Hero Sections",
    description:
      "Landing page heroes with real motion: a pointer-lit dot grid with a rotating last word, copy beside product cards that part as you scroll, and a headline you scroll through as its letters tumble in and the last word turns like a drum.",
    category: "Hero blocks",
    tags: ["hero", "landing page", "header section", "above the fold", "motion kit", "framer-motion"],
    premium: true,
    variants: ["Spotlight Hero", "Parallax Stack Hero", "Kinetic Hero", "Aurora Hero Spotlight", "Interactive Dot Grid Hero", "Interactive Starfield Hero", "Shooting Stars Grid"],
    reactSource: `import { SpotlightHero } from "@/components/blocks/motion-kit/spotlight-hero";

export default function Home() {
  return <SpotlightHero />;
}`,
  },
  {
    slug: "block-features",
    registryCliName: "feature-blocks",
    name: "Feature Sections",
    description:
      "Ways to explain a product: tabs that advance on their own with a progress line, a timeline that draws itself in, and an orbit of integrations around your logo.",
    category: "Feature grids",
    tags: ["features", "feature section", "tabs", "timeline", "integrations", "motion kit", "framer-motion"],
    premium: true,
    variants: ["Auto-advancing Tabs", "Drawn Timeline", "Integrations Orbit", "Step Flow", "Lattice Feature Grid"],
    reactSource: `import { AutoAdvancingTabs } from "@/components/blocks/motion-kit/auto-advancing-tabs";

export default function Features() {
  return <AutoAdvancingTabs />;
}`,
  },
  {
    slug: "block-social-proof",
    registryCliName: "social-proof-blocks",
    name: "Social Proof",
    description:
      "Numbers that count up as they arrive and a wall of testimonials that drifts past, for the part of the page where people decide to trust you.",
    category: "Testimonials",
    tags: ["social proof", "testimonials", "stats", "reviews", "wall of love", "motion kit", "framer-motion"],
    premium: true,
    variants: ["Counting Stats", "Wall of Love", "Scrolling Testimonials", "Clothesline"],
    reactSource: `import { WallOfLove } from "@/components/blocks/motion-kit/wall-of-love";

export default function Testimonials() {
  return <WallOfLove />;
}`,
  },
  {
    slug: "block-newsletter",
    registryCliName: "newsletter-blocks",
    name: "Newsletter Signup",
    description:
      "An email signup that catches typos like gmial.com and offers the fix before you submit, then counts you in.",
    category: "CTA sections",
    tags: ["newsletter", "email signup", "waitlist", "cta", "form", "motion kit", "framer-motion"],
    premium: true,
    variants: ["Typo-catching Signup"],
    reactSource: `import { TypoCatchingSignup } from "@/components/blocks/motion-kit/typo-catching-signup";

export default function Newsletter() {
  return <TypoCatchingSignup onSubmit={async (email) => { /* add to your list */ }} />;
}`,
  },
  {
    slug: "block-gallery",
    registryCliName: "gallery-blocks",
    name: "Gallery",
    description:
      "An endless wall of work in 3D that wraps in every direction: drag it and the sheets flex with your speed, click a piece to open it, and leave it alone to drift.",
    category: "Gallery sections",
    tags: ["gallery", "portfolio", "exhibition", "three.js", "react-three-fiber", "webgl", "motion kit"],
    premium: true,
    variants: ["Drift Gallery"],
    reactSource: `import { DriftGallery } from "@/components/blocks/motion-kit/drift-gallery";

export default function Work() {
  return <DriftGallery />;
}`,
  },
  {
    slug: "block-changelog",
    registryCliName: "changelog-blocks",
    name: "Changelog",
    description:
      "Release notes that land as a pile of real cards you can throw, filter by New, Improved or Fixed, or switch to a readable list.",
    category: "Changelog sections",
    tags: ["changelog", "release notes", "product updates", "whats new", "physics", "matter-js", "motion kit"],
    premium: true,
    variants: ["Changelog Pile"],
    reactSource: `import { ChangelogPile } from "@/components/blocks/motion-kit/changelog-pile";

export default function Changelog() {
  return <ChangelogPile />;
}`,
  },
  {
    slug: "block-404",
    registryCliName: "not-found-blocks",
    name: "404 Page",
    description:
      "A not-found page that falls apart: every digit, word, button and link drops under gravity, you bat them about, then put it all back.",
    category: "Error pages",
    tags: ["404", "not found", "error page", "physics", "matter-js", "motion kit"],
    premium: true,
    variants: ["Gravity 404"],
    reactSource: `import { Gravity404 } from "@/components/blocks/motion-kit/gravity-404";

export default function NotFound() {
  return <Gravity404 />;
}`,
  },
  {
    slug: "block-cta",
    registryCliName: "cta-blocks",
    name: "CTA Sections",
    description:
      "The last push before the footer: a call to action on a slow nebula, with a glow that follows the pointer to the button and a press that answers back.",
    category: "CTA sections",
    tags: ["cta", "call to action", "landing page", "signup", "motion kit", "framer-motion"],
    premium: true,
    variants: ["Nebula CTA Glow"],
    reactSource: `import { NebulaCtaGlow } from "@/components/nebula-cta-glow";

export default function Cta() {
  return <NebulaCtaGlow />;
}`,
  },
  {
    slug: "block-footer",
    registryCliName: "footer-blocks",
    name: "Footers",
    description:
      "A site footer with link columns, a newsletter field, a status line and an oversized wordmark that lights up under the pointer.",
    category: "Footers",
    tags: ["footer", "site footer", "newsletter", "links", "motion kit", "framer-motion"],
    premium: false,
    variants: ["Orbit Footer"],
    reactSource: `import { OrbitFooter } from "@/components/orbit-footer";

export default function Footer() {
  return <OrbitFooter />;
}`,
  },
  {
    slug: "block-signup",
    registryCliName: "signup-blocks",
    name: "Sign-up Sections",
    description:
      "A split sign-up page: the pitch and a checklist that ticks itself off on one side, the form with social sign-in and a strength meter on the other.",
    category: "Signup sections",
    tags: ["signup", "sign up", "register", "onboarding", "form", "motion kit", "framer-motion"],
    premium: false,
    variants: ["Split Signup Convert"],
    reactSource: `import { SplitSignup } from "@/components/split-signup-convert";

export default function SignUp() {
  return <SplitSignup />;
}`,
  },
];
