import { libraryComponents, type LibraryComponent } from "@/lib/catalog/library-components";

/**
 * Collections by kind of component (`/components/type/[type]`).
 * The categories in taxonomy.ts are broad ("Inputs & Controls" holds buttons, toggles, pickers
 * and sliders together). People search by the kind of thing they want ("react toggle switch",
 * "react carousel"), so each collection here lists the components of one kind, picked by hand
 * from every category.
 */
export type TypeCollection = {
  slug: string;
  /** <title> — the page template appends " · Nexus UI Labs"; keep this at 44 characters or fewer. */
  title: string;
  description: string;
  heading: string;
  intro: string;
  /** What a visitor is called when they browse the list: "buttons", "toggle switches". */
  noun: string;
  /** Component slugs, in the order they are listed in the server-rendered index. */
  slugs: readonly string[];
};

export const TYPE_COLLECTIONS: readonly TypeCollection[] = [
  {
    slug: "buttons",
    title: "Animated React Button Components",
    noun: "buttons",
    heading: "React Button Components",
    description:
      "Animated React buttons: loading and success states, hold to confirm, slide to confirm, liquid fill, like bursts and glow effects. Framer Motion and Tailwind CSS.",
    intro:
      "Buttons that do more than change colour on hover. Some show their own loading, success and error states, some ask you to hold or slide before a destructive action goes through, and some react to the pointer with light, liquid or physics. Every one is a copy-paste React component built with Framer Motion and Tailwind CSS.",
    slugs: [
      "stateful-button", "glow-button", "slide-to-confirm", "hold-to-confirm", "molten-hold", "progress-button",
      "download-button", "like-burst", "soap-bubble", "led-button", "receipt-button", "fuse-button", "warp-cta",
      "tethered-submit", "cloud-sync", "slingshot-send", "venom-button", "web-sling-button",
    ],
  },
  {
    slug: "toggle-switches",
    title: "React Toggle Switch Components, Free with Tailwind",
    noun: "toggle switches",
    heading: "React Toggle Switch Components",
    description:
      "Animated React toggle switches and dark mode toggles: a mercury knob, a glass capsule, a pull cord, an aeroplane window shade and an ink pour theme switch.",
    intro:
      "Toggle switches and dark mode toggles with a bit of physics: a knob of liquid mercury, a ball sealed in a glass capsule, a light you pull by its cord, a window shade that drops over the sky. Each one is a real on-off control you can drop into a settings page, built with Framer Motion and Tailwind CSS.",
    slugs: [
      "mercury-switch", "capsule-toggles", "pull-cord", "ink-theme-switch", "window-seat-toggle", "eclipse-toggle",
      "bell-toggle",
    ],
  },
  {
    slug: "carousels",
    title: "React Carousel Components",
    noun: "carousels",
    heading: "React Carousel and Gallery Components",
    description:
      "Animated React carousels and image galleries: 3D card carousels, circular and curved reels, fling-able wheels, ribbon and fold galleries. Framer Motion and Tailwind CSS.",
    intro:
      "Carousels and galleries you drag, fling and swipe: 3D card rings, curved poster reels, a gallery that folds like a page turning, one made of drifting sand particles. Each one is a copy-paste React component for Next.js, built with Framer Motion and Tailwind CSS.",
    slugs: [
      "card-carousel-3d", "circular-carousel", "throw-wheel", "curved-reel", "smear-carousel", "ring-gallery",
      "ribbon-gallery", "fold-gallery", "sand-drift-gallery", "image-galleries", "card-stack-rotator",
      "depth-testimonials", "infinite-moving-cards",
    ],
  },
  {
    slug: "cursor-effects",
    title: "React Custom Cursor Effects, Free and Copy-Paste",
    noun: "cursor effects",
    heading: "React Custom Cursor Effects",
    description:
      "React cursor effects: a cursor that morphs into buttons, a character whose eyes follow you, ASCII and image trails, smoke, heat and shared live cursors.",
    intro:
      "Effects that follow the pointer: a custom cursor that melts into whatever you hover, a character whose eyes track you, trails made of characters or photos, smoke and heat that react as you move, and the shared cursors of a collaboration board. Each is a copy-paste React component built with Framer Motion and Tailwind CSS.",
    slugs: [
      "morph-cursor", "cursor-buddy", "ascii-wake", "image-trail", "liquid-smoke", "heat-field", "cursor-text-reveal",
      "mesh-net", "real-time-cursors",
    ],
  },
  {
    slug: "text-effects",
    title: "React Text Animation Components, Free and Copy-Paste",
    noun: "text effects",
    heading: "React Text Animation Components",
    description:
      "React text animations: typewriter, scramble and decode, scroll reveal, morphing words, variable font pressure and particle text. Framer Motion and Tailwind CSS.",
    intro:
      "Text that moves with a purpose: a typewriter, text that scrambles then decodes, words revealed as you scroll, headlines that morph or rotate, type that responds to your pointer, and a headline built from particles. Each is a copy-paste React component built with Framer Motion and Tailwind CSS.",
    slugs: [
      "typewriter-effect", "text-generate-effect", "encrypted-text", "scroll-reveal-text", "rotating-headline",
      "morphing-text", "squiggly-text", "text-reveal-card", "hover-highlight-text", "pressure-text", "bend-text",
      "piano-text", "melt-type", "particle-reveal", "annotate-text", "inspect-text", "glyph-flow", "cursor-text-reveal",
    ],
  },
  {
    slug: "sliders",
    title: "React Slider Components, Free Animated Examples",
    noun: "sliders",
    heading: "React Slider Components",
    description:
      "Animated React sliders: range sliders with a liquid slosh, a bending rail and springy bars, a ruler picker, a thermostat dial and before and after image sliders.",
    intro:
      "Sliders that feel physical: a range slider that sloshes like liquid, a rail that bends toward the knob, a row of springy bars, a ruler you fling, a draggable thermostat ring, and before and after sliders for comparing images. Each is a copy-paste React component built with Framer Motion and Tailwind CSS.",
    slugs: [
      "tick-slider", "slosh-slider", "bending-rail", "wake-slider", "bolting-sliders", "effort-slider", "ruler-picker",
      "thermo-dial", "scrub-inputs", "before-after", "compare", "glass-compare",
    ],
  },
  {
    slug: "file-uploads",
    title: "React File Upload Components with Drag and Drop",
    noun: "file uploads",
    heading: "React File Upload Components",
    description:
      "Animated React file upload components: drag and drop dropzones, upload progress chips, a genie drop animation, a mercury progress bar and a Chladni plate pattern.",
    intro:
      "File upload components for React with drag and drop and a progress state worth watching: dropzones with progress chips, a genie animation that swallows the file, a mercury progress bar and sand that settles into a pattern as the upload advances. Each is a copy-paste component built with Framer Motion and Tailwind CSS.",
    slugs: [
      "upload-dropzone", "file-drop", "upload-chips", "genie-uploader", "mercury-upload", "chladni-upload",
      "upload-morph", "paperclip-attach", "image-press",
    ],
  },
  {
    slug: "progress-bars",
    title: "React Progress Bar Components, Free and Animated",
    noun: "progress indicators",
    heading: "React Progress Bar Components",
    description:
      "Animated React progress bars and meters: scroll and reading progress, a springy pause, a vine that grows, dominoes, liquid gauges and activity rings.",
    intro:
      "Progress indicators for React, from a scroll progress bar to a vine that grows as work completes: springy bars that pause and resume, domino steps, a liquid gauge in a glass orb and fitness-style activity rings. Each is a copy-paste component built with Framer Motion and Tailwind CSS.",
    slugs: [
      "scroll-progress-bar", "reading-spine", "squeeze-progress", "vine-progress", "domino-progress", "marble-progress",
      "liquid-gauge", "activity-rings", "progress-button", "download-button", "mercury-upload", "chladni-upload",
      "upload-morph",
    ],
  },
  {
    slug: "inputs",
    title: "Animated React Input Components",
    noun: "inputs",
    heading: "React Input Components",
    description:
      "Animated React inputs: floating labels, OTP and phone fields, search bars, tag inputs, scrubbable numbers, password strength and AI prompt boxes.",
    intro:
      "Form fields with motion and a clear job: floating labels that hop into the border, OTP and phone number inputs, search bars that expand with suggestions, tag inputs, numbers you scrub by dragging, a password strength meter and the prompt boxes used in AI apps. Each is a copy-paste React component built with Framer Motion and Tailwind CSS.",
    slugs: [
      "hop-labels", "sagging-field", "frost-input", "otp-input", "phone-input", "password-strength", "scrub-inputs",
      "odometer-field", "elastic-stepper", "gooey-search-input", "seek-search", "lens-search", "scoped-search",
      "search-modal", "command-palette", "ghost-autocomplete", "bubble-tags", "tag-pit", "message-composer",
      "ai-composer",
    ],
  },
  {
    slug: "pickers",
    title: "React Date and Time Picker Components",
    noun: "pickers",
    heading: "React Picker Components: Date, Time and More",
    description:
      "React pickers: an iOS-style date wheel, a date range calendar, a clock face time picker, a time scrubber, plus color, status and assignee pickers.",
    intro:
      "Pickers that replace the usual dropdown: a 3D date wheel, a date range calendar, a clock face you drag, a ruler for picking a time, and pickers for colour, status, assignees and AI models. Each is a copy-paste React component built with Framer Motion and Tailwind CSS.",
    slugs: [
      "date-wheels", "range-calendar", "magic-calendar", "clock-picker", "time-scrubber", "ruler-picker",
      "ink-drop-picker", "mood-wheel", "magnet-select", "assign-picker", "elemental-picker", "model-picker",
    ],
  },
];

const bySlug = new Map(libraryComponents.map((c) => [c.slug, c]));

export function getTypeCollection(slug: string): TypeCollection | undefined {
  return TYPE_COLLECTIONS.find((t) => t.slug === slug);
}

/** The components of a collection, in its listed order. A slug that is not in the catalog is skipped. */
export function getTypeComponents(collection: TypeCollection): LibraryComponent[] {
  return collection.slugs.flatMap((s) => {
    const c = bySlug.get(s);
    return c ? [c] : [];
  });
}

export function getTypeHref(slug: string) {
  return `/components/type/${slug}`;
}

/** Same rule as categories: a collection with a single component would only repeat that component's page. */
export const MIN_INDEXABLE_TYPE_SIZE = 3;

export function isIndexableType(collection: TypeCollection) {
  return getTypeComponents(collection).length >= MIN_INDEXABLE_TYPE_SIZE;
}

/** Collections that other pages and the sitemap may link to. */
export function getIndexableTypes() {
  return TYPE_COLLECTIONS.filter(isIndexableType);
}
