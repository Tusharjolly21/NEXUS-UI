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
  "upload-dropzone",
  "hold-to-record",
  "cursor-buddy",
  "dot-sphere",
  "dynamic-island",
  "otp-input",
  "radio-cards",
  "hold-to-confirm",
  "before-after",
  "price-odometer",
  "password-strength",
  "tilt-pass",
  "animated-tabs",
  "shared-element-cards",
  "rotating-headline",
  "stretch-nav",
  "feedback-pill",
  "stagger-menu",
  "ruler-picker",
  "elastic-stepper",
  "todo-list",
  "progress-button",
  "copy-button",
  "animated-icons",
  "folder-peek",
  "magnify-dock",
  "upload-chips",
  "notification-stack",
  "island-morph",
  "lanyard-badge",
  "glass-lens",
  "ascii-wake",
  "liquid-dial",
  "voice-orb",
  "sagging-field",
  "tear-off-ticket",
  "throw-wheel",
  "pixel-select",
  "scrub-inputs",
  "lit-keyboard",
  "ripple-field",
  "dot-globe",
  "component-layers",
  "standing-calendar",
  "money-goo",
  "weather-puck",
  "metal-orbs",
  "bending-rail",
  "layout-switch",
  "fan-deck",
  "receipt-unfold",
  "page-curl",
  "sign-and-seal",
  "streak-counter",
  "capsule-toggles",
  "glass-bubbles",
  "box-spill",
  "curved-reel",
  "squeeze-progress",
  "bolting-sliders",
  "crumple-to-trash",
  "tape-shelf",
  "packet-router",
  "stamp-swirl",
  "bubble-cluster",
  "sticker-toss",
  "context-meter",
  "mood-wheel",
  "swipe-stack",
  "flight-tracker",
  "matrix-loaders",
  "todo-tower",
  "peek-login",
  "heat-field",
  "particle-mark",
  "generate-image",
  "falloff-accordion",
  "magnet-select",
  "aspect-crop",
  "slosh-slider",
  "goo-reorder",
  "hop-labels",
  "step-player",
  "pull-to-refresh",
  "runaway-button",
  "wake-slider",
  "seek-search",
  "fold-note",
  "assign-picker",
  "bend-text",
  "pressure-text",
  "morph-cursor",
  "ink-theme-switch",
  "liquid-gauge",
  "thermo-dial",
  "pull-cord",
  "scratch-reveal",
  "polaroid-develop",
  "wallet-stack",
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
  "upload-dropzone": "mint",
  "hold-to-record": "peach",
  "cursor-buddy": "butter",
  "dot-sphere": "violet",
  "dynamic-island": "pink",
  "otp-input": "sky",
  "radio-cards": "violet",
  "hold-to-confirm": "pink",
  "before-after": "butter",
  "price-odometer": "mint",
  "password-strength": "peach",
  "tilt-pass": "violet",
  "animated-tabs": "mint",
  "shared-element-cards": "peach",
  "rotating-headline": "pink",
  "stretch-nav": "sky",
  "feedback-pill": "violet",
  "stagger-menu": "peach",
  "ruler-picker": "butter",
  "elastic-stepper": "mint",
  "todo-list": "sky",
  "progress-button": "mint",
  "copy-button": "violet",
  "animated-icons": "pink",
  "folder-peek": "butter",
  "magnify-dock": "sky",
  "upload-chips": "mint",
  "notification-stack": "peach",
  "island-morph": "violet",
  "lanyard-badge": "sky",
  "glass-lens": "violet",
  "ascii-wake": "mint",
  "liquid-dial": "peach",
  "voice-orb": "pink",
  "sagging-field": "sky",
  "tear-off-ticket": "peach",
  "throw-wheel": "violet",
  "pixel-select": "pink",
  "scrub-inputs": "mint",
  "lit-keyboard": "peach",
  "ripple-field": "sky",
  "dot-globe": "sky",
  "component-layers": "violet",
  "standing-calendar": "mint",
  "money-goo": "sky",
  "weather-puck": "peach",
  "metal-orbs": "violet",
  "bending-rail": "mint",
  "layout-switch": "butter",
  "fan-deck": "peach",
  "receipt-unfold": "butter",
  "page-curl": "sky",
  "sign-and-seal": "violet",
  "streak-counter": "peach",
  "capsule-toggles": "mint",
  "glass-bubbles": "sky",
  "box-spill": "peach",
  "curved-reel": "violet",
  "squeeze-progress": "butter",
  "bolting-sliders": "sky",
  "crumple-to-trash": "peach",
  "tape-shelf": "butter",
  "packet-router": "violet",
  "stamp-swirl": "peach",
  "bubble-cluster": "sky",
  "sticker-toss": "butter",
  "context-meter": "violet",
  "mood-wheel": "sky",
  "swipe-stack": "mint",
  "flight-tracker": "sky",
  "matrix-loaders": "violet",
  "todo-tower": "mint",
  "peek-login": "sky",
  "heat-field": "peach",
  "particle-mark": "violet",
  "generate-image": "pink",
  "falloff-accordion": "peach",
  "magnet-select": "violet",
  "aspect-crop": "butter",
  "slosh-slider": "sky",
  "goo-reorder": "mint",
  "hop-labels": "sky",
  "step-player": "violet",
  "pull-to-refresh": "mint",
  "runaway-button": "peach",
  "wake-slider": "peach",
  "seek-search": "sky",
  "fold-note": "mint",
  "assign-picker": "violet",
  "bend-text": "sky",
  "pressure-text": "violet",
  "morph-cursor": "mint",
  "ink-theme-switch": "butter",
  "liquid-gauge": "sky",
  "thermo-dial": "peach",
  "pull-cord": "butter",
  "scratch-reveal": "pink",
  "polaroid-develop": "peach",
  "wallet-stack": "butter",
  "avatar-group": "sky",
  "stateful-button": "mint",
  "gooey-search-input": "mint",
  "ask-nexus-input": "sky",
};

/**
 * The Motion Kit components, newest batch first. They lead the components wall in this order, so
 * the latest additions are always on its first page.
 */
export const MOTION_KIT_ORDER: string[] = [
  // seventh batch
  "bend-text",
  "pressure-text",
  "morph-cursor",
  "ink-theme-switch",
  "liquid-gauge",
  "thermo-dial",
  "pull-cord",
  "scratch-reveal",
  "polaroid-develop",
  "wallet-stack",
  "animated-countdown",
  "command-palette",
  "like-burst",
  "emoji-reactions",
  // sixth batch
  "todo-tower",
  "peek-login",
  "heat-field",
  "particle-mark",
  "generate-image",
  "falloff-accordion",
  "magnet-select",
  "aspect-crop",
  "slosh-slider",
  "goo-reorder",
  "hop-labels",
  "step-player",
  "pull-to-refresh",
  "runaway-button",
  "wake-slider",
  "seek-search",
  "fold-note",
  "assign-picker",
  // fifth batch
  "glass-bubbles",
  "box-spill",
  "curved-reel",
  "squeeze-progress",
  "bolting-sliders",
  "crumple-to-trash",
  "tape-shelf",
  "packet-router",
  "stamp-swirl",
  "bubble-cluster",
  "sticker-toss",
  "context-meter",
  "mood-wheel",
  "swipe-stack",
  "flight-tracker",
  "matrix-loaders",
  // fourth batch
  "lanyard-badge",
  "glass-lens",
  "ascii-wake",
  "liquid-dial",
  "voice-orb",
  "sagging-field",
  "tear-off-ticket",
  "throw-wheel",
  "pixel-select",
  "scrub-inputs",
  "lit-keyboard",
  "ripple-field",
  "dot-globe",
  "component-layers",
  "standing-calendar",
  "money-goo",
  "weather-puck",
  "metal-orbs",
  "bending-rail",
  "layout-switch",
  "fan-deck",
  "receipt-unfold",
  "page-curl",
  "sign-and-seal",
  "streak-counter",
  "capsule-toggles",
  // third batch
  "magnify-dock",
  "island-morph",
  "notification-stack",
  "upload-chips",
  // second batch
  "stretch-nav",
  "animated-icons",
  "folder-peek",
  "ruler-picker",
  "stagger-menu",
  "copy-button",
  "elastic-stepper",
  "feedback-pill",
  "progress-button",
  "todo-list",
  // first batch
  "otp-input",
  "hold-to-confirm",
  "price-odometer",
  "tilt-pass",
  "animated-tabs",
  "radio-cards",
  "before-after",
  "password-strength",
  "shared-element-cards",
  "rotating-headline",
];

/** The homepage set, in order: newest interactions first, then the best of the rest. */
export const HOME_PICKS: string[] = [
  "glass-bubbles",
  "curved-reel",
  "swipe-stack",
  "packet-router",
  "stretch-nav",
  "magnify-dock",
  "animated-icons",
  "island-morph",
  "ruler-picker",
  "folder-peek",
  "notification-stack",
  "stagger-menu",
  "copy-button",
  "elastic-stepper",
  "upload-chips",
  "feedback-pill",
  "progress-button",
  "hold-to-confirm",
  "price-odometer",
  "slide-to-confirm",
  "otp-input",
  "tilt-pass",
  "cursor-buddy",
  "tick-slider",
  "toast-stack",
  "dot-sphere",
  "emoji-reactions",
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
    premium: c.premium,
    hasPrompt: KIT_RANK.has(c.slug),
    demo: SELF_DEMO.has(c.slug) ? null : DRAG.has(c.slug) ? "drag" : WANDER.has(c.slug) ? "wander" : null,
  };
}

const KIT_RANK = new Map(MOTION_KIT_ORDER.map((slug, i) => [slug, i] as const));

/** Every Motion Kit component ships a build prompt (content/build-prompts/<slug>.md), a Pro feature. */
export function hasBuildPrompt(slug: string) {
  return KIT_RANK.has(slug);
}

/** Every component as a gallery item: the Motion Kit first (newest batch first), then other new additions, then most popular. */
export function allGalleryItems(): GalleryItem[] {
  return [...libraryComponents]
    .sort((a, b) => {
      const ka = KIT_RANK.get(a.slug) ?? Infinity;
      const kb = KIT_RANK.get(b.slug) ?? Infinity;
      if (ka !== kb) return ka - kb;
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
