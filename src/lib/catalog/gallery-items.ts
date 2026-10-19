import type { GalleryItem, Interaction, TileTint } from "@/components/gallery/types";
import { getPreviewExportName, libraryComponents, type LibraryComponent } from "@/lib/catalog/library-components";
import { getTileFit } from "@/lib/catalog/tile-fit";
import {
  COMPONENT_SIDEBAR_SECTIONS,
  getComponentCategoryLabel,
  type AnimationKind,
} from "@/lib/catalog/taxonomy";

/** The catalogue's animation kinds, mapped to the interaction verbs people filter by. */
const KIND_TO_INTERACTION: Partial<Record<AnimationKind, Interaction>> = {
  hover: "hover",
  magnetic: "hover",
  scroll: "scroll",
  parallax: "scroll",
  drag: "drag",
  press: "press",
  type: "type",
  "3d": "3d",
};

/**
 * Interactions the catalogue's motion tags don't capture (they describe how a component animates,
 * not how you use it). Presentation-only; keeps the filters honest for older components.
 */
const EXTRA_INTERACTIONS: Record<string, Interaction[]> = {
  "stateful-button": ["press"],
  "toggle-pricing-pro": ["press"],
  "motion-faq-disclosure": ["press"],
  "expandable-cards": ["press"],
  "glow-button": ["press"],
  "nebula-cta-glow": ["press"],
  "mac-keyboard": ["press", "type"],
  "gooey-search-input": ["type"],
  "ask-nexus-input": ["type"],
  "forge-ai-command-bar": ["type"],
  "phone-input": ["type"],
  "command-palette": ["type", "press"],
  "glass-login-stack": ["type"],
  "signup-form": ["type"],
  "split-signup-convert": ["type"],
  "split-contact-glass": ["type"],
  terminal: ["type"],
  "draggable-card-stack": ["drag"],
  compare: ["drag"],
  "card-carousel-3d": ["drag"],
  "circular-carousel": ["drag", "press"],
  "wheel-selector": ["drag", "press"],
  "interactive-globe-explorer": ["drag"],
  "floating-dock": ["press"],
  "three-d-folder": ["hover"],
};

/** Previews that already play their own demo (they render a DemoCursor themselves). */
const SELF_DEMO = new Set([
  "tick-slider",
  "time-scrubber",
  "slide-to-confirm",
  "emoji-reactions",
  "like-burst",
  "toast-stack",
  "one-time-code",
  "upload-dropzone",
  "hold-to-record",
  "cursor-buddy",
  "dot-sphere",
  "dynamic-island",
]);

/** Hover effects that look like nothing until a pointer passes over them. */
const WANDER = new Set([
  "image-trail",
  "cursor-text-reveal",
  "word-magnet",
  "hover-highlight-text",
  "tracing-spotlight-panel",
  "text-reveal-card",
  "three-d-folder",
  "glowing-effect-cards",
  "warp-speed-card",
  "background-boxes",
  "nebula-glass-card",
  "vector-tilt-scene",
  "feature-tools-card",
  "spectra-frame",
  "dot-grid-hero",
  "hero-aurora-spotlight",
  "starfield-hero",
  "link-preview",
  "encrypted-text",
  "avatar-group",
  "floating-dock",
  "images-badge",
  "real-time-cursors",
  "meteors",
  "sparkles",
  "profile-orbit",
]);
const DRAG = new Set(["compare", "draggable-card-stack"]);

const TINTS: TileTint[] = ["violet", "sky", "peach", "mint", "butter", "pink"];

/** Hand-picked tint per component where the hash would clash with the component's own colours. */
const TINT_OF: Record<string, TileTint> = {
  "tick-slider": "butter",
  "time-scrubber": "sky",
  "slide-to-confirm": "mint",
  "emoji-reactions": "violet",
  "like-burst": "pink",
  "toast-stack": "peach",
  "one-time-code": "sky",
  "upload-dropzone": "mint",
  "hold-to-record": "peach",
  "cursor-buddy": "butter",
  "dot-sphere": "violet",
  "dynamic-island": "pink",
  "avatar-group": "sky",
  "stateful-button": "mint",
  "gooey-search-input": "mint",
  "ask-nexus-input": "sky",
};

/** The homepage set, in order: newest interactions first, then the best of the rest. */
export const HOME_PICKS: string[] = [
  "slide-to-confirm",
  "cursor-buddy",
  "tick-slider",
  "toast-stack",
  "dot-sphere",
  "emoji-reactions",
  "one-time-code",
  "like-burst",
  "dynamic-island",
  "time-scrubber",
  "hold-to-record",
  "upload-dropzone",
  "cinematic-card-deck",
  "gooey-search-input",
  "mac-keyboard",
  "floating-dock",
  "wheel-selector",
  "glowing-effect-cards",
  "encrypted-text",
  "avatar-group",
];

const GROUP_OF = new Map<string, string>(
  COMPONENT_SIDEBAR_SECTIONS.flatMap((s) => s.slugs.map((slug) => [slug, s.id] as const)),
);

/** Anything added in the last six weeks of the newest component counts as new. */
const NEWEST = Math.max(...libraryComponents.map((c) => Date.parse(c.createdAt) || 0));
const NEW_WINDOW_MS = 42 * 24 * 60 * 60 * 1000;

function hashIndex(s: string, n: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % n;
}

function interactionsOf(c: LibraryComponent): Interaction[] {
  const set = new Set<Interaction>();
  for (const k of c.animationKinds) {
    const i = KIND_TO_INTERACTION[k];
    if (i) set.add(i);
  }
  for (const i of EXTRA_INTERACTIONS[c.slug] ?? []) set.add(i);
  const triggered = ["hover", "press", "drag", "scroll", "type"].some((i) => set.has(i as Interaction));
  if (!triggered) set.add("loop");
  return [...set];
}

function toItem(c: LibraryComponent): GalleryItem | null {
  const exportName = getPreviewExportName(c.Preview);
  if (!exportName) return null;
  return {
    slug: c.slug,
    name: c.name,
    description: c.description,
    categoryLabel: getComponentCategoryLabel(c.categorySlug),
    group: GROUP_OF.get(c.categorySlug) ?? "effects",
    interactions: interactionsOf(c),
    exportName,
    tint: TINT_OF[c.slug] ?? TINTS[hashIndex(c.slug, TINTS.length)],
    fit: getTileFit(c.slug),
    install: c.registryCliName ?? c.slug,
    isNew: NEWEST - (Date.parse(c.createdAt) || 0) < NEW_WINDOW_MS,
    demo: SELF_DEMO.has(c.slug) ? null : DRAG.has(c.slug) ? "drag" : WANDER.has(c.slug) ? "wander" : null,
  };
}

/** Every component as a gallery item: newest additions first, then most popular. */
export function allGalleryItems(): GalleryItem[] {
  return [...libraryComponents]
    .sort((a, b) => {
      const na = NEWEST - (Date.parse(a.createdAt) || 0) < NEW_WINDOW_MS ? 1 : 0;
      const nb = NEWEST - (Date.parse(b.createdAt) || 0) < NEW_WINDOW_MS ? 1 : 0;
      return nb - na || b.trendingScore - a.trendingScore;
    })
    .map(toItem)
    .filter((i): i is GalleryItem => !!i);
}

/** The homepage set, in its order. */
export function homeGalleryItems(): GalleryItem[] {
  const bySlug = new Map(libraryComponents.map((c) => [c.slug, c]));
  return HOME_PICKS.map((slug) => bySlug.get(slug))
    .filter((c): c is LibraryComponent => !!c)
    .map(toItem)
    .filter((i): i is GalleryItem => !!i);
}

/** Category chips: the taxonomy's sidebar sections that actually have components. */
export function galleryCategories(items: GalleryItem[]) {
  const used = new Set(items.map((i) => i.group));
  return COMPONENT_SIDEBAR_SECTIONS.filter((s) => used.has(s.id)).map((s) => ({ id: s.id, label: s.label }));
}
