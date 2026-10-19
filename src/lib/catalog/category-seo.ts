import { libraryComponents } from "@/lib/catalog/library-components";
import {
  COMPONENT_CATEGORIES,
  getComponentCategoryLabel,
  type ComponentCategorySlug,
} from "@/lib/catalog/taxonomy";

/**
 * Category landing pages (`/components/category/[category]`).
 * A category with a single component would only duplicate that component's own page,
 * so it is still reachable but kept out of the index and sitemap until it grows.
 */
export const MIN_INDEXABLE_CATEGORY_SIZE = 2;

type CategoryCopy = {
  /** <title> — the page template appends " · Nexus UI". */
  title: string;
  description: string;
  heading: string;
  intro: string;
};

const CATEGORY_COPY: Partial<Record<ComponentCategorySlug, CategoryCopy>> = {
  "inputs-controls": {
    title: "Interactive React Input & Control Components",
    description:
      "Free interactive React controls — sliders, scrubbers, swipe-to-confirm, reactions, uploads and voice input — built with Tailwind CSS and Framer Motion.",
    heading: "Input & Control Components",
    intro:
      "Small controls with real weight: drag a slider and feel it snap, swipe to confirm, hold to record. Every one works with mouse, touch and keyboard, and respects prefers-reduced-motion.",
  },
  "motion-effects": {
    title: "React Text Animation & Motion Effect Components",
    description:
      "Free animated React text effects and motion components built with Tailwind CSS and Framer Motion — typewriter, encrypted text, scroll reveals, and more for Next.js.",
    heading: "Motion Effect Components",
    intro:
      "Text animations, scroll reveals, cursor effects, and micro-interactions for React and Next.js. Each one respects prefers-reduced-motion and drops into a page with a single copy-paste.",
  },
  cards: {
    title: "Animated React Card Components",
    description:
      "Free animated card components for React and Next.js — 3D tilt, glow, stacked, expandable, and carousel cards built with Tailwind CSS and Framer Motion.",
    heading: "Card Components",
    intro:
      "Interactive cards for product grids, feature highlights, and galleries — tilt, glow, stack, flip, and expand on interaction. Built with Tailwind CSS and Framer Motion, typed in TypeScript.",
  },
  "background-effects": {
    title: "Animated React Background Components",
    description:
      "Free animated backgrounds for React and Next.js — meteors, sparkles, gradients, grids, and beams built with Tailwind CSS and Framer Motion.",
    heading: "Background Effect Components",
    intro:
      "Ambient backgrounds for hero sections and landing pages: meteors, sparkles, animated gradients, interactive grids, and light beams. Lightweight, theme-aware, and ready for the App Router.",
  },
  "feature-sections": {
    title: "React Feature Section Components",
    description:
      "Free feature section components for React and Next.js — animated feature grids and highlight layouts for SaaS landing pages, built with Tailwind CSS.",
    heading: "Feature Section Components",
    intro:
      "Feature grids and highlight layouts that explain what your product does. Animated on scroll, responsive at every width, and easy to restyle with Tailwind CSS.",
  },
  testimonials: {
    title: "Animated React Testimonial Components",
    description:
      "Free testimonial components for React and Next.js — scrolling, stacked, and depth testimonial layouts built with Tailwind CSS and Framer Motion.",
    heading: "Testimonial Components",
    intro:
      "Social proof sections with motion: infinite scrolling walls, stacked quotes, and depth layouts. Drop in your customer quotes and ship.",
  },
  "hero-sections": {
    title: "Animated React Hero Section Components",
    description:
      "Free animated hero sections for React and Next.js landing pages — spotlight, starfield, and grid heroes built with Tailwind CSS and Framer Motion.",
    heading: "Hero Section Components",
    intro:
      "Above-the-fold hero sections for SaaS and product landing pages, with animated backgrounds, spotlights, and staggered headline reveals. Server-render friendly and fully typed.",
  },
  "bento-grids": {
    title: "React Bento Grid Components",
    description:
      "Free animated bento grid components for React and Next.js — responsive feature bentos built with Tailwind CSS grid and Framer Motion.",
    heading: "Bento Grid Components",
    intro:
      "Bento-style feature grids that pack screenshots, stats, and copy into one responsive layout. Built on CSS grid with Tailwind, with tasteful hover and entrance motion.",
  },
  "ai-components": {
    title: "React AI Chat & Prompt Input Components",
    description:
      "Free AI interface components for React and Next.js — prompt inputs, command bars, and chat UI built with Tailwind CSS and Framer Motion.",
    heading: "AI Components",
    intro:
      "Interface pieces for AI products: prompt inputs, command bars, and chat message layouts. Keyboard-friendly, accessible, and styled to match shadcn/ui.",
  },
  "three-d-components": {
    title: "3D React Components for Next.js",
    description:
      "Free 3D React components for Next.js — interactive globes, tilt scenes, and depth effects built with Three.js, Tailwind CSS, and Framer Motion.",
    heading: "3D Components",
    intro:
      "Interactive 3D for the web: globes, tilt scenes, and depth effects that load lazily so they never block first paint.",
  },
  "signup-forms": {
    title: "React Signup Form Components",
    description:
      "Free signup form components for React and Next.js — animated, accessible registration forms built with Tailwind CSS and shadcn/ui.",
    heading: "Signup Form Components",
    intro:
      "Registration forms with validation states, social sign-in slots, and subtle motion. Accessible labels and keyboard flow are built in.",
  },
  navbars: {
    title: "Animated React Navbar Components",
    description:
      "Free navbar components for React and Next.js — floating, glass, and dock-style navigation built with Tailwind CSS and Framer Motion.",
    heading: "Navbar Components",
    intro:
      "Navigation bars for marketing sites and apps: floating glass headers, dock-style menus, and responsive mobile drawers.",
  },
  "cta-sections": {
    title: "React Call-to-Action (CTA) Section Components",
    description:
      "Free CTA section components for React and Next.js — animated call-to-action banners built with Tailwind CSS and Framer Motion.",
    heading: "CTA Section Components",
    intro:
      "Call-to-action sections that close a landing page: glowing banners and focused sign-up prompts with motion that draws the eye without distracting.",
  },
};

export function getCategoryComponents(slug: ComponentCategorySlug) {
  return libraryComponents.filter((c) => c.categorySlug === slug);
}

export function isComponentCategory(slug: string): slug is ComponentCategorySlug {
  return COMPONENT_CATEGORIES.some((c) => c.slug === slug);
}

export function isIndexableCategory(slug: ComponentCategorySlug) {
  return getCategoryComponents(slug).length >= MIN_INDEXABLE_CATEGORY_SIZE;
}

/** Categories that have at least one component — each gets a landing page. */
export function getPopulatedCategories() {
  return COMPONENT_CATEGORIES.filter((c) => getCategoryComponents(c.slug).length > 0);
}

export function getCategoryCopy(slug: ComponentCategorySlug): CategoryCopy {
  const label = getComponentCategoryLabel(slug);
  return (
    CATEGORY_COPY[slug] ?? {
      title: `React ${label} Components`,
      description: `Free ${label.toLowerCase()} components for React and Next.js, built with Tailwind CSS and Framer Motion. Copy-paste TypeScript source.`,
      heading: `${label} Components`,
      intro: `${label} for React and Next.js, built with Tailwind CSS and Framer Motion and installable through the shadcn registry.`,
    }
  );
}
