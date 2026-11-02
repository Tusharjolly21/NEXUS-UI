import type { GalleryItem, Interaction, TileTint } from "@/components/gallery/types";
import { getPreviewExportName, libraryComponents, type LibraryComponent } from "@/lib/catalog/library-components";
import { getTileFit } from "@/lib/catalog/tile-fit";
import { soundFor, typesFor } from "@/lib/catalog/component-sounds";
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
  "expandable-cards": ["press"],
  "glow-button": ["press"],
  "mac-keyboard": ["press", "type"],
  "gooey-search-input": ["type"],
  "ask-nexus-input": ["type"],
  "forge-ai-command-bar": ["type"],
  "phone-input": ["type"],
  "command-palette": ["type", "press"],
  "glass-login-stack": ["type"],
  "signup-form": ["type"],
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
  "liquid-smoke",
  "lightfall",
  "pluck-frame",
  "dust-snap",
  "glass-drop",
  "status-morph",
  "ai-composer",
  "molten-hold",
  "mercury-switch",
  "mercury-upload",
  "mercury-tabs",
  "liquid-send",
  "folder-tree",
  "context-menu",
  "consent-dock",
  "add-to-bag",
  "liquid-pagination",
  "tethered-submit",
  "dependent-form",
  "glass-edit",
  "live-summary",
  "scoped-search",
  "ink-autosave",
  "sort-stack",
  "reading-spine",
  "skeleton-morph-rows",

  "ring-gallery",
  "global-deploy",
  "card-reader-verify",
  "intelligence-glow",
  "cloud-sync",
  "smart-light",
  "range-calendar",
  "storage-clean",
  "dart-rating",
  "domino-progress",
  "pumpkin-reveal",
  "catch-undo",
  "shredder-delete",
  "testimonial-wall",
  "portal-card",
  "black-hole-delete",
  "frost-input",
  "web-sling-button",
  "venom-button",
  "cubes-grid",
  "mesh-net",
  "particle-reveal",
  "morphing-text",
  "code-snippet",
  "workflow-network",
  "empty-projects",
  "no-results",
  "empty-chart",
  "empty-team",
  "streaming-answer",
  "diff-review",
  "agent-run",
  "ghost-autocomplete",
  "skeleton-morph",
  "morphing-dialog",
  "travelling-tooltip",
  "sound-mark",
  "ripple-now-playing",
  "chladni-upload",
  "tank-recorder",
  "ripple-toast",
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
  "traffic-bars",
  "stock-line",
  "pulse-monitor",
  "spend-donut",
  "vinyl-player",
  "ferrofluid-record",
  "sand-timer",
  "zipper-reveal",
  "slingshot-send",
  "domino-select",
  "lenticular-pass",
  "origami-pricing",
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
  "tag-pit": "sky",
  "usage-stack": "sky",
  "marble-progress": "mint",
  "cloth-banner": "violet",
  "traffic-bars": "sky",
  "stock-line": "mint",
  "pulse-monitor": "pink",
  "spend-donut": "sky",
  "avatar-group": "sky",
  "stateful-button": "mint",
  "gooey-search-input": "mint",
  "ask-nexus-input": "sky",
  "vinyl-player": "peach",
  "ferrofluid-record": "mint",
  "sand-timer": "butter",
  "zipper-reveal": "sky",
  "slingshot-send": "sky",
  "domino-select": "mint",
  "lenticular-pass": "sky",
  "origami-pricing": "peach",
};

/**
 * The Motion Kit components, in the order they lead the components wall. The older, most colourful
 * and polished ones keep the top; the newest additions are spread among them on purpose, and they
 * are all gathered, newest first, under the wall's New tab (see NEW_TAB_DAYS).
 */
export const MOTION_KIT_ORDER: string[] = [
  // twenty-fourth batch (Motion Kit Pro: Liquid Smoke)
  "liquid-smoke",
  // twenty-third batch (Motion Kit Pro: Molten Hold, Mercury Switch, Mercury Upload)
  "molten-hold",
  "mercury-switch",
  "mercury-upload",
  // twenty-second batch (Motion Kit Pro: Mercury Tabs)
  "mercury-tabs",
  // twenty-first batch (Motion Kit Pro: Liquid Send, Folder Tree, Context Menu, Consent Dock, Add to Bag, Liquid Pagination)
  "liquid-send",
  "folder-tree",
  "context-menu",
  "consent-dock",
  "add-to-bag",
  "liquid-pagination",
  // twentieth batch (Motion Kit Pro: Ring Gallery)
  "ring-gallery",
  // nineteenth batch (Motion Kit Pro: Global Deploy, Card Reader Verify, Intelligence Glow, Cloud Sync, Smart Light, Range Calendar, Storage Clean)
  "global-deploy",
  "card-reader-verify",
  "intelligence-glow",
  "lightfall", // newest batch, placed among the older ones on purpose
  "cloud-sync",
  "smart-light",
  "pluck-frame", // newest batch, placed among the older ones on purpose
  "dust-snap", // newest batch, placed among the older ones on purpose
  "glass-drop", // newest batch, placed among the older ones on purpose
  "status-morph", // newest batch, placed among the older ones on purpose
  "ai-composer",
  "range-calendar",
  "storage-clean",
  // eighteenth batch (Dart Rating, Domino Progress, Pumpkin Reveal, Catch Undo)
  "live-summary", // newest batch, placed among the older ones on purpose
  "dart-rating",
  "domino-progress",
  "pumpkin-reveal",
  "catch-undo",
  // seventeenth batch (Shredder Delete)
  "shredder-delete",
  // sixteenth batch (Testimonial Wall)
  "glass-edit", // newest batch, placed among the older ones on purpose
  "testimonial-wall",
  // fifteenth batch (Venom Button, Web Sling Button, Frost Input, Black Hole Delete, Portal Card)
  "venom-button",
  "web-sling-button",
  "frost-input",
  "black-hole-delete",
  "reading-spine", // newest batch, placed among the older ones on purpose
  "portal-card",
  // fourteenth batch (Mesh Net, Particle Reveal, Morphing Text, Code Snippet, Workflow Network)
  "mesh-net",
  "particle-reveal",
  "morphing-text",
  "code-snippet",
  "scoped-search", // newest batch, placed among the older ones on purpose
  "workflow-network",
  // thirteenth batch (Cubes Grid)
  "cubes-grid",
  // twelfth batch (Made by sound)
  "sound-mark",
  "ripple-now-playing",
  "chladni-upload",
  "tethered-submit", // newest batch, placed among the older ones on purpose
  "tank-recorder",
  "ripple-toast",
  // eleventh batch (States and Essentials)
  "empty-projects",
  "no-results",
  "empty-chart",
  "sort-stack", // newest batch, placed among the older ones on purpose
  "empty-team",
  "streaming-answer",
  "diff-review",
  "agent-run",
  "ghost-autocomplete",
  "dependent-form", // newest batch, placed among the older ones on purpose
  "skeleton-morph",
  "morphing-dialog",
  "travelling-tooltip",
  // tenth batch (Rare)
  "vinyl-player",
  "ferrofluid-record",
  "ink-autosave", // newest batch, placed among the older ones on purpose
  "sand-timer",
  "zipper-reveal",
  "slingshot-send",
  "domino-select",
  "lenticular-pass",
  "skeleton-morph-rows", // newest batch, placed among the older ones on purpose
  "origami-pricing",
  // ninth batch (Depth)
  "tag-pit",
  "usage-stack",
  "marble-progress",
  "cloth-banner",
  // eighth batch
  "traffic-bars",
  "stock-line",
  "pulse-monitor",
  "spend-donut",
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
  "liquid-smoke",
  "molten-hold",
  "mercury-switch",
  "mercury-upload",
  "mercury-tabs",
  "liquid-send",
  "folder-tree",
  "context-menu",
  "consent-dock",
  "add-to-bag",
  "liquid-pagination",
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
/** The wall's New tab lists what was added in the last week of additions (counted back from the newest one). */
const NEW_TAB_DAYS = 7;

/** Components listed under every category, as well as their own. */
const PINNED_EVERYWHERE = new Set(["lightfall"]);

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
  if (soundFor(c.slug) || typesFor(c.slug)) set.add("sound");
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
    isRecent: NEWEST - (Date.parse(c.createdAt) || 0) <= NEW_TAB_DAYS * 24 * 60 * 60 * 1000,
    addedAt: Date.parse(c.createdAt) || 0,
    pinned: PINNED_EVERYWHERE.has(c.slug) || undefined,
    premium: c.premium,
    hasPrompt: hasBuildPrompt(c.slug),
    sound: soundFor(c.slug),
    typing: typesFor(c.slug) || undefined,
    variants: c.previewSections && c.previewSections.length > 1 ? c.previewSections.length : undefined,
    demo: SELF_DEMO.has(c.slug) ? null : DRAG.has(c.slug) ? "drag" : WANDER.has(c.slug) ? "wander" : null,
  };
}

/**
 * Components that are not themselves in the Motion Kit order but have a build prompt: the ones that
 * carry Motion Kit variants, and pages whose variants are examples of one component. Kept out of MOTION_KIT_ORDER so they do not jump to the front of the wall.
 */
const PROMPT_PARENTS = new Set([
  "toast-stack",
  "upload-dropzone",
  "milestone-timeline",
  "chat-messages",
  "card-stack-rotator",
  "draggable-card-stack",
  // pages with several usage examples of one component: one brief for the component
  "signup-form",
  "orbital-loader",
  "three-d-folder",
  "compare",
  "code-block",
  "glow-button",
  "glowing-effect-cards",
  "hold-to-record",
  "hover-highlight-text",
  "link-preview",
]);

const KIT_RANK = new Map(MOTION_KIT_ORDER.map((slug, i) => [slug, i] as const));

/** Every Motion Kit component ships a build prompt (content/build-prompts/<slug>.md), a Pro feature. */
export function hasBuildPrompt(slug: string) {
  return KIT_RANK.has(slug) || PROMPT_PARENTS.has(slug);
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
