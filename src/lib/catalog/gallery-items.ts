import type { GalleryItem, Interaction, TileShape, TileTint } from "@/components/gallery/types";
import { getPreviewExportName, libraryComponents, type LibraryComponent } from "@/lib/catalog/library-components";
import {
  COMPONENT_SIDEBAR_SECTIONS,
  getComponentCategoryLabel,
  type AnimationKind,
  type ComponentCategorySlug,
} from "@/lib/catalog/taxonomy";

/** The catalogue's animation kinds, grouped into the filters people actually look for. */
const KIND_TO_INTERACTION: Partial<Record<AnimationKind, Interaction>> = {
  hover: "hover",
  magnetic: "hover",
  scroll: "scroll",
  parallax: "scroll",
  spring: "spring",
  gradient: "glow",
  "3d": "3d",
};

/** Default tile footprint per category; rich scenes get room, inputs and text run wide. */
const CATEGORY_SHAPE: Partial<Record<ComponentCategorySlug, TileShape>> = {
  "hero-sections": "large",
  "three-d-components": "large",
  "bento-grids": "large",
  dashboards: "large",
  "feature-sections": "large",
  "pricing-sections": "large",
  testimonials: "tall",
  cards: "tall",
  "background-effects": "tall",
  shaders: "tall",
  sidebars: "tall",
  timelines: "tall",
  "login-forms": "tall",
  "signup-forms": "tall",
  loaders: "small",
  navbars: "wide",
  footers: "wide",
  "contact-sections": "wide",
  "cta-sections": "wide",
  "faq-sections": "wide",
  "logo-clouds": "wide",
  "blog-components": "wide",
  "ai-components": "wide",
};

const SHAPE_CANVAS: Record<TileShape, number> = { small: 360, wide: 640, tall: 520, large: 900 };
const TINTS: TileTint[] = ["violet", "sky", "peach", "mint", "butter", "pink"];

/**
 * Hand-tuned tiles. The first 13 are the homepage set: in this order they pack the 4-column bento
 * into a full 4×8 rectangle. The rest only appear under a homepage filter.
 */
export const HOME_PICKS: { slug: string; tint: TileTint; shape: TileShape; canvas: number }[] = [
  { slug: "cinematic-card-deck", tint: "peach", shape: "large", canvas: 900 },
  { slug: "gooey-search-input", tint: "mint", shape: "wide", canvas: 560 },
  { slug: "stateful-button", tint: "mint", shape: "small", canvas: 340 },
  { slug: "meteors", tint: "violet", shape: "tall", canvas: 460 },
  { slug: "floating-dock", tint: "butter", shape: "wide", canvas: 620 },
  { slug: "profile-orbit", tint: "pink", shape: "tall", canvas: 520 },
  { slug: "encrypted-text", tint: "sky", shape: "wide", canvas: 620 },
  { slug: "wheel-selector", tint: "butter", shape: "tall", canvas: 560 },
  { slug: "glowing-effect-cards", tint: "violet", shape: "large", canvas: 900 },
  { slug: "avatar-group", tint: "sky", shape: "small", canvas: 360 },
  { slug: "ask-nexus-input", tint: "sky", shape: "wide", canvas: 700 },
  { slug: "card-carousel-3d", tint: "peach", shape: "large", canvas: 900 },
  { slug: "interactive-globe-explorer", tint: "sky", shape: "large", canvas: 900 },
  { slug: "typewriter-effect", tint: "pink", shape: "wide", canvas: 640 },
  { slug: "warp-speed-card", tint: "violet", shape: "tall", canvas: 520 },
  { slug: "word-magnet", tint: "mint", shape: "wide", canvas: 620 },
  { slug: "shader-flow", tint: "peach", shape: "tall", canvas: 520 },
];
const PICKS = new Map(HOME_PICKS.map((p) => [p.slug, p]));

const GROUP_OF = new Map<string, string>(
  COMPONENT_SIDEBAR_SECTIONS.flatMap((s) => s.slugs.map((slug) => [slug, s.id] as const)),
);

function hashIndex(s: string, n: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % n;
}

function toItem(c: LibraryComponent): GalleryItem | null {
  const exportName = getPreviewExportName(c.Preview);
  if (!exportName) return null;
  const pick = PICKS.get(c.slug);
  const textLike = c.categorySlug === "motion-effects" && c.tags.some((t) => /text|type|headline/.test(t));
  const shape = pick?.shape ?? CATEGORY_SHAPE[c.categorySlug] ?? (textLike ? "wide" : "tall");
  return {
    slug: c.slug,
    name: c.name,
    description: c.description,
    categoryLabel: getComponentCategoryLabel(c.categorySlug),
    group: GROUP_OF.get(c.categorySlug) ?? "effects",
    interactions: [...new Set(c.animationKinds.map((k) => KIND_TO_INTERACTION[k]).filter(Boolean))] as Interaction[],
    exportName,
    tint: pick?.tint ?? TINTS[hashIndex(c.slug, TINTS.length)],
    shape,
    canvas: pick?.canvas ?? SHAPE_CANVAS[shape],
    install: c.registryCliName ?? c.slug,
  };
}

/** Every component as a gallery item, most popular first. */
export function allGalleryItems(): GalleryItem[] {
  return [...libraryComponents]
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .map(toItem)
    .filter((i): i is GalleryItem => !!i);
}

/** The homepage set, in its packing order. */
export function homeGalleryItems(): GalleryItem[] {
  const bySlug = new Map(libraryComponents.map((c) => [c.slug, c]));
  return HOME_PICKS.map((p) => bySlug.get(p.slug))
    .filter((c): c is LibraryComponent => !!c)
    .map(toItem)
    .filter((i): i is GalleryItem => !!i);
}

/** Category chips: the taxonomy's sidebar sections that actually have components. */
export function galleryCategories(items: GalleryItem[]) {
  const used = new Set(items.map((i) => i.group));
  return COMPONENT_SIDEBAR_SECTIONS.filter((s) => used.has(s.id)).map((s) => ({ id: s.id, label: s.label }));
}
