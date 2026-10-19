export const COMPONENT_CATEGORIES = [
  { slug: "hero-sections", label: "Hero Sections" },
  { slug: "bento-grids", label: "Bento Grids" },
  { slug: "cards", label: "Cards" },
  { slug: "navbars", label: "Navbars" },
  { slug: "footers", label: "Footers" },
  { slug: "testimonials", label: "Testimonials" },
  { slug: "pricing-sections", label: "Pricing Sections" },
  { slug: "background-effects", label: "Background Effects" },
  { slug: "three-d-components", label: "3D Components" },
  { slug: "login-forms", label: "Login Forms" },
  { slug: "signup-forms", label: "Signup Forms" },
  { slug: "sidebars", label: "Sidebars" },
  { slug: "dashboards", label: "Dashboards" },
  { slug: "loaders", label: "Loaders" },
  { slug: "timelines", label: "Timelines" },
  { slug: "feature-sections", label: "Feature Sections" },
  { slug: "faq-sections", label: "FAQ Sections" },
  { slug: "cta-sections", label: "CTA Sections" },
  { slug: "blog-components", label: "Blog Components" },
  { slug: "contact-sections", label: "Contact Sections" },
  { slug: "shaders", label: "Shaders" },
  { slug: "motion-effects", label: "Motion Effects" },
  { slug: "ai-components", label: "AI Components" },
  { slug: "logo-clouds", label: "Logo Clouds" },
] as const;

export type ComponentCategorySlug = (typeof COMPONENT_CATEGORIES)[number]["slug"];

/** Grouped navigation for the components library sidebar (Nexus-UI layout). */
export const COMPONENT_SIDEBAR_SECTIONS: {
  id: string;
  label: string;
  slugs: readonly ComponentCategorySlug[];
}[] = [
  {
    id: "marketing",
    label: "Marketing sections",
    slugs: [
      "hero-sections",
      "feature-sections",
      "cta-sections",
      "faq-sections",
      "testimonials",
      "pricing-sections",
      "logo-clouds",
    ],
  },
  {
    id: "layout",
    label: "Layout & grids",
    slugs: ["bento-grids", "sidebars", "dashboards"],
  },
  {
    id: "navigation",
    label: "Navigation",
    slugs: ["navbars", "footers"],
  },
  {
    id: "cards",
    label: "Cards & feedback",
    slugs: ["cards", "loaders"],
  },
  {
    id: "data",
    label: "Data & timeline",
    slugs: ["timelines"],
  },
  {
    id: "forms",
    label: "Forms & auth",
    slugs: ["login-forms", "signup-forms", "contact-sections"],
  },
  {
    id: "content",
    label: "Content",
    slugs: ["blog-components"],
  },
  {
    id: "effects",
    label: "Effects & 3D",
    slugs: [
      "background-effects",
      "three-d-components",
      "shaders",
      "motion-effects",
      "ai-components",
    ],
  },
] as const;

export function getComponentCategoryLabel(slug: ComponentCategorySlug): string {
  const row = COMPONENT_CATEGORIES.find((c) => c.slug === slug);
  return row?.label ?? slug;
}

/** Crawlable landing page for a component category (replaces `/components?cat=`). */
export function getComponentCategoryHref(slug: string): string {
  return `/components/category/${slug}`;
}

export type AnimationKind =
  | "parallax"
  | "hover"
  | "scroll"
  | "spring"
  | "layout"
  | "3d"
  | "gradient"
  | "magnetic";

export type CatalogSort = "trending" | "newest";

export type BookmarkKind = "component" | "template" | "block";
