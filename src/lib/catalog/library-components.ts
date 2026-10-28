import type { ComponentType } from "react";
import type { AnimationKind, ComponentCategorySlug } from "@/lib/catalog/taxonomy";
import * as Previews from "@/registry/component-previews";
import { COMPONENT_SOUNDS, ENABLE_SOUND_PROP } from "@/lib/catalog/component-sounds";

export type LibraryComponent = {
  slug: string;
  name: string;
  description: string;
  categorySlug: ComponentCategorySlug;
  tags: string[];
  premium: boolean;
  trendingScore: number;
  createdAt: string;
  animationKinds: AnimationKind[];
  dependencies: string[];
  /** `compact` is honored by previews that support an embedded mode (e.g. terminal sound off in grids). */
  Preview: ComponentType<{ compact?: boolean }>;
  /** Optional: render each preview in its own mac card on detail page. */
  detailPreviews?: ComponentType<{ compact?: boolean }>[];
  /** Preview shell style on component detail pages. */
  previewShell?: "mac" | "plain";
  /** Required unless previewSections is provided (which supplies per-section code instead). */
  reactSource?: string;
  /** Optional multiple React snippets for components with more than one canonical variant/example. */
  reactExamples?: Array<{ title: string; code: string }>;
  /**
   * When present, the detail page renders each entry as its own independent
   * Preview / Code tab block instead of the shared single-tab layout.
   */
  previewSections?: Array<{
    title?: string;
    Preview: ComponentType<{ compact?: boolean }>;
    reactSource: string;
  }>;
  tailwindSource: string;
  /** shadcn `add @scope/<name>` uses this basename; defaults to `slug` (e.g. gooey-search-input → gooey-input). */
  registryCliName?: string;
  /** Shown under the hero (reference docs, downloads, etc.). */
  resourceLinks?: Array<{ label: string; href: string }>;
  /** Optional prop docs shown on component detail pages. */
  props?: Array<{ name: string; type: string; description: string; defaultValue?: string }>;
};

const tw = `Use Tailwind utility composition with rounded-3xl, border-white/10, bg-zinc-950, backdrop-blur-xl, and gradient overlays. Prefer oklch-based neutrals and cyan/fuchsia accents for luminous contrast.`;

const baseLibraryComponents: LibraryComponent[] = [
  {
    slug: "scroll-progress-bar",
    name: "Scroll Progress Bar",
    registryCliName: "scroll-progress-bar",
    description: "A progress rail for long reads: the fill springs after your scroll, a bead rides its tip and stretches with your speed, and each milestone dot pops in as you pass it. It tracks the page, a section or a scrollable panel, runs vertical or horizontal, and optional chapter labels jump to their part of the page.",
    categorySlug: "motion-effects",
    tags: ["scroll", "progress", "reading progress", "indicator", "table of contents", "navigation", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 154,
    createdAt: "2026-05-27",
    animationKinds: ["scroll", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "targetRef", type: "RefObject<HTMLElement | null>", description: "Section whose trip through the viewport drives the fill. Omit it to track the page or containerRef." },
      { name: "containerRef", type: "RefObject<HTMLElement | null>", description: "Scrollable parent, when the bar tracks a panel rather than the document." },
      { name: "progress", type: "MotionValue<number>", description: "Your own 0..1 progress. Overrides scroll tracking." },
      { name: "orientation", type: "\"vertical\" | \"horizontal\"", defaultValue: "\"vertical\"", description: "Rail direction." },
      { name: "height", type: "number | string", defaultValue: "206 (vertical) / 4 (horizontal)", description: "Vertical: rail length. Horizontal: rail thickness." },
      { name: "width", type: "number | string", defaultValue: "4 (vertical) / \"100%\" (horizontal)", description: "Vertical: rail thickness. Horizontal: rail length." },
      { name: "fillColor", type: "string", defaultValue: "#0071e3 (#0a84ff dark)", description: "Fill, bead and marker colour." },
      { name: "backgroundColor", type: "string", defaultValue: "#e8e8ed (#3a3a3c dark)", description: "Track colour." },
      { name: "markerCount", type: "number", defaultValue: "4", description: "Milestone dots spread evenly along the rail, ends included." },
      { name: "markerSize", type: "number", defaultValue: "10", description: "Milestone dot diameter in px." },
      { name: "showMarkers", type: "boolean", defaultValue: "true", description: "Show the milestone dots." },
      { name: "labels", type: "string[]", description: "One label per milestone. Labels become buttons that scroll to their chapter." },
      { name: "showHead", type: "boolean", defaultValue: "true", description: "Draw the bead that rides the tip of the fill." },
      { name: "stiffness", type: "number", defaultValue: "150", description: "Spring stiffness for the fill." },
      { name: "damping", type: "number", defaultValue: "26", description: "Spring damping for the fill." },
      { name: "onSeek", type: "(progress: number) => void", description: "Called with the target progress when a label is clicked, before it scrolls there." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Gently scrolls containerRef (or plays the fill by itself) until someone scrolls, clicks or presses a key." },
      { name: "ariaLabel", type: "string", defaultValue: "\"Section scroll progress\"", description: "Accessible name of the progressbar." },
      { name: "className", type: "string", description: "Extra classes on the wrapper." },
    ],
    Preview: Previews.PreviewScrollProgressBarRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useRef } from "react";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";

const chapters = ["Why", "How it works", "Pricing", "FAQ"];

export default function Page() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative flex gap-10 py-24">
      <aside className="sticky top-24 h-fit">
        <ScrollProgressBar targetRef={sectionRef} height={240} labels={chapters} />
      </aside>
      <div className="max-w-xl space-y-24">
        {chapters.map((title) => (
          <article key={title}>
            <h2 className="text-4xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-4 text-lg text-neutral-500">Long-form content for this chapter.</p>
          </article>
        ))}
      </div>
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "wheel-selector",
    name: "Wheel Selector",
    registryCliName: "wheel-selector",
    description: "A radial selector: a ring of icon nodes you drag round, fling, scroll or step with the arrow keys. It coasts, snaps to the nearest stop with a little overshoot, and the node at the top swells and fills with its colour while the hub counter rolls and the side panel swaps to that item.",
    categorySlug: "feature-sections",
    tags: ["wheel", "dial", "radial", "selector", "carousel", "services", "drag", "fling", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 152,
    createdAt: "2026-05-26",
    animationKinds: ["drag", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "WheelItem[]", description: "Entries: id, label, title, optional subtitle, description, accentColor, icon (16 built-in names) or iconImageUrl, image, ctaHref and ctaLabel." },
      { name: "activeIndex", type: "number", description: "Controlled selection; the dial turns the short way to it." },
      { name: "onActiveChange", type: "(index: number) => void", description: "Called when the dial settles on a new item." },
      { name: "variant", type: "\"responsive\" | \"desktop\" | \"mobile\"", defaultValue: "\"responsive\"", description: "Panel beside the dial when there is room, always beside it, or always stacked." },
      { name: "contentMode", type: "\"minimal\" | \"detailed\" | \"hidden\"", defaultValue: "\"detailed\"", description: "Title only, title with description and image, or no panel." },
      { name: "ringRadius", type: "number", defaultValue: "112", description: "Radius of the ring of nodes in px, 80 to 220." },
      { name: "tickCount", type: "number", defaultValue: "60", description: "Ticks round the rim, 12 to 120." },
      { name: "showTicks", type: "boolean", defaultValue: "true", description: "Show the rotating rim ticks." },
      { name: "showCounter", type: "boolean", defaultValue: "true", description: "Show the rolling 02 / 06 counter in the hub." },
      { name: "showCTA", type: "boolean", defaultValue: "false", description: "Show each item's CTA link in the panel." },
      { name: "animationSpeed", type: "\"slow\" | \"medium\" | \"fast\"", defaultValue: "\"medium\"", description: "How snappy the snap spring is." },
      { name: "accentColor", type: "string", defaultValue: "\"#0071e3\"", description: "Accent for items without their own accentColor." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Turns the wheel one stop at a time until someone touches it." },
      { name: "autoRotate", type: "boolean", defaultValue: "false", description: "Older name for autoplay." },
      { name: "autoRotateInterval", type: "number", defaultValue: "3000", description: "Milliseconds between autoplay turns (1200 to 15000)." },
      { name: "className", type: "string", description: "Extra classes for the section." },
    ],
    Preview: Previews.PreviewWheelSelectorRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { WheelSelector, type WheelItem } from "@/components/wheel-selector";

const services: WheelItem[] = [
  { id: "strategy", label: "Strategy", subtitle: "Direction", title: "Product strategy", description: "Position products with a clear story and roadmap.", icon: "compass", accentColor: "#0071e3", ctaHref: "#strategy" },
  { id: "design", label: "Design", subtitle: "Craft", title: "Experience design", description: "Interfaces people understand immediately.", icon: "pen", accentColor: "#ff9f0a", ctaHref: "#design" },
  { id: "build", label: "Build", subtitle: "Engineering", title: "Digital platforms", description: "Fast, reliable front ends on scalable systems.", icon: "code", accentColor: "#30d158", ctaHref: "#build" },
  { id: "research", label: "Insights", subtitle: "Learn", title: "User research", description: "Turn user signals into confident decisions.", icon: "analytics", accentColor: "#bf5af2", ctaHref: "#research" },
];

export default function Page() {
  const [index, setIndex] = useState(0);
  return (
    <WheelSelector
      items={services}
      activeIndex={index}
      onActiveChange={setIndex}
      contentMode="detailed"
      showCTA
      ringRadius={120}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "cinematic-card-deck",
    name: "Cinematic Card Deck",
    registryCliName: "cinematic-card-deck",
    description: "A deck of poster cards in 3D: the front card peels away on its bottom edge while the cards behind rise to take its place, leaning back as the deck moves and springing upright when it stops. Swipe or fling it, scroll the wheel over it, use the arrow keys or the progress pills, or set scrollLinked to deal it from page scroll.",
    categorySlug: "cards",
    tags: ["cards", "deck", "stack", "3d", "scroll", "swipe", "carousel", "parallax", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 148,
    createdAt: "2026-05-22",
    animationKinds: ["drag", "scroll", "3d", "spring", "parallax"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "CinematicDeckCard[]", defaultValue: "4 sample cards", description: "Cards from front to back, each { title, description, tag?, cardColor?, accentColor?, imageUrl? }." },
      { name: "intensity", type: "\"subtle\" | \"standard\" | \"cinematic\"", defaultValue: "\"standard\"", description: "How far the back cards recede and how hard the front card peels away." },
      { name: "exitDirection", type: "\"up\" | \"down\"", defaultValue: "\"up\"", description: "Which way a finished card peels off (and which way to swipe)." },
      { name: "cardWidth", type: "number", defaultValue: "340", description: "Card width in px; the deck shrinks to fit narrower parents." },
      { name: "cardHeight", type: "number", defaultValue: "220", description: "Card height in px, kept as an aspect ratio when the deck shrinks." },
      { name: "borderRadius", type: "string", defaultValue: "\"24px\"", description: "Card corner radius." },
      { name: "smoothing", type: "number", defaultValue: "0.6", description: "0 is snappy, 1 is floaty: sets the spring that follows the target card." },
      { name: "showProgress", type: "boolean", defaultValue: "true", description: "Progress pills that show and pick the front card." },
      { name: "progressPosition", type: "\"bottom\" | \"left\" | \"right\"", defaultValue: "\"bottom\"", description: "Where the pills sit." },
      { name: "showAccent", type: "boolean", defaultValue: "true", description: "Accent bar on the front card." },
      { name: "showAmbientGlow", type: "boolean", defaultValue: "true", description: "Soft light in the front card's accent colour behind the deck." },
      { name: "glowIntensity", type: "number", defaultValue: "0.35", description: "Opacity of the ambient light, 0 to 1." },
      { name: "scrollLinked", type: "boolean", defaultValue: "false", description: "Drive the deck from page scroll: the root becomes sectionHeight vh tall with a sticky stage." },
      { name: "sectionHeight", type: "number", defaultValue: "300", description: "Scroll distance in viewport heights when scrollLinked." },
      { name: "scrollContainerRef", type: "RefObject<HTMLElement | null>", description: "Scrolling element to track when scrollLinked (defaults to the window)." },
      { name: "onChange", type: "(index: number) => void", description: "Called with the new front card index." },
      { name: "hint", type: "string", defaultValue: "\"Swipe, scroll or use the arrow keys.\"", description: "Caption under the deck. An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Deals through the deck every 2.4s until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewCinematicCardDeckRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { CinematicCardDeck } from "@/components/cinematic-card-deck";

const cards = [
  { title: "Plan", description: "Map the launch in one shared board.", tag: "Week 1", cardColor: "#16161a", accentColor: "#ff9f0a" },
  { title: "Build", description: "Ship sections from a shared system.", tag: "Week 2", cardColor: "#0c2340", accentColor: "#64d2ff" },
  { title: "Launch", description: "Go live with motion that feels made, not added.", tag: "Week 3", cardColor: "#1d1438", accentColor: "#bf5af2" },
];

export default function Page() {
  return (
    <CinematicCardDeck
      cards={cards}
      intensity="cinematic"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "cursor-text-reveal",
    name: "Cursor Text Reveal",
    registryCliName: "cursor-text-reveal",
    description: "An ink lens follows the pointer across a card and shows a second sentence through it, dragging a tail of droplets on looser and looser springs so fast moves stretch into a drip. Press and hold (or Space) to flood the whole card with the reveal; it lets go with an overshoot.",
    categorySlug: "motion-effects",
    tags: ["cursor", "text", "reveal", "lens", "mask", "hero", "spring", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 142,
    createdAt: "2026-05-22",
    animationKinds: ["hover", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "baseText", type: "string", description: "Text everyone sees." },
      { name: "revealText", type: "string", description: "Text shown inside the lens. Defaults to baseText." },
      { name: "mode", type: "\"text\" | \"image\"", defaultValue: "\"text\"", description: "Lens backdrop: solid ink, or an image / built-in gradient." },
      { name: "revealImage", type: "string", description: "Image URL inside the lens in image mode. Nothing is fetched unless you pass one." },
      { name: "revealImagePosition", type: "string", defaultValue: "\"center\"", description: "CSS background-position for revealImage." },
      { name: "backgroundImage", type: "string", description: "Optional image URL behind the base text." },
      { name: "backgroundPosition", type: "string", defaultValue: "\"center\"", description: "CSS background-position for backgroundImage." },
      { name: "maskSize", type: "number", defaultValue: "120", description: "Lens radius in px while the pointer is over the card." },
      { name: "initialMaskSize", type: "number", defaultValue: "0", description: "Lens radius at rest; 0 hides it." },
      { name: "smoothness", type: "number", defaultValue: "0.18", description: "0.04 to 0.6. Lower is snappier, higher drifts behind the pointer." },
      { name: "fontSize", type: "string", defaultValue: "\"clamp(2rem, 5.2vw, 3.6rem)\"", description: "Font size for both text layers." },
      { name: "align", type: "\"left\" | \"center\" | \"right\"", defaultValue: "\"center\"", description: "Text alignment." },
      { name: "enableGlow", type: "boolean", defaultValue: "true", description: "Thin ring around the lens edge." },
      { name: "revealBackgroundClassName", type: "string", description: "Classes for the lens backdrop; replaces the default ink fill." },
      { name: "baseTextClassName", type: "string", description: "Classes for the base text." },
      { name: "revealTextClassName", type: "string", description: "Classes for the revealed text." },
      { name: "containerClassName", type: "string", description: "Classes for the card." },
      { name: "className", type: "string", description: "Classes for both text wrappers." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Moves the lens along a slow figure-eight until a real pointer arrives." },
    ],
    Preview: Previews.PreviewCursorTextRevealRedesign,
    previewShell: "plain",
    previewSections: [
      {
        title: "Ink lens",
        Preview: Previews.PreviewCursorTextRevealRedesign,
        reactSource: `// src/app/page.tsx

import { CursorTextReveal } from "@/components/cursor-text-reveal";

export default function Page() {
  return (
    <CursorTextReveal
      baseText="The first rule of motion is clarity."
      revealText="The second rule is feeling."
      maskSize={110}
    />
  );
}`,
      },
      {
        title: "Image lens",
        Preview: Previews.PreviewCursorTextRevealImageRedesign,
        reactSource: `// src/app/page.tsx

import { CursorTextReveal } from "@/components/cursor-text-reveal";

export default function Page() {
  return (
    <CursorTextReveal
      mode="image"
      revealImage="/images/harbour.jpg"
      baseText="We chase moments to feel alive."
      revealText="We keep the ones we usually miss."
      maskSize={130}
    />
  );
}`,
      },
    ],
    reactSource: `// src/app/page.tsx

import { CursorTextReveal } from "@/components/cursor-text-reveal";

export default function Page() {
  return (
    <CursorTextReveal
      baseText="The first rule of motion is clarity."
      revealText="The second rule is feeling."
      maskSize={110}
    />
  );
}`,
    tailwindSource: `"use client";

import { CursorTextReveal } from "@/components/cursor-text-reveal";

export function CursorTextRevealExample() {
  return (
    <CursorTextReveal
      baseText="The first rule of motion is clarity."
      revealText="The second rule is feeling."
      maskSize={310}
      smoothness={0.16}
      enableGlow={false}
      showAmbient={false}
      showGrid={false}
      revealBackgroundClassName="bg-black"
      baseTextClassName="text-zinc-950"
      revealTextClassName="text-white"
      containerClassName="border-zinc-200 bg-white text-zinc-950 shadow-sm"
    />
  );
}`,
    resourceLinks: [{ label: "Live demo", href: "/demos/cursor-text-reveal" }],
  },
  {
    slug: "phone-input",
    name: "Phone Input",
    registryCliName: "phone-input",
    description: "A phone number field with a searchable country picker that formats the number in each country's own pattern. Digits drop into place with a small overshoot, a hairline fills toward a complete number, a check draws itself when it's valid and the country chip flips over when you change country.",
    categorySlug: "cards",
    tags: ["phone", "input", "form", "country picker", "validation", "mask", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-05-16",
    animationKinds: ["type", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "defaultCountry", type: "string", defaultValue: "\"US\"", description: "ISO 3166-1 alpha-2 code of the country selected at first." },
      { name: "label", type: "string", description: "Visible label above the field; also its accessible name." },
      { name: "placeholder", type: "string", description: "Placeholder for the number. Defaults to an example in the country's format." },
      { name: "minDigits", type: "number", description: "Digits needed before the number counts as valid. Defaults to the country's full length." },
      { name: "countries", type: "Country[]", defaultValue: "COUNTRIES", description: "The countries to offer: iso, name, code, max digits and an optional # mask." },
      { name: "onChange", type: "(value: PhoneInputValue) => void", description: "Called with { iso, code, number, isValid } when the user types or picks a country." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a few example numbers, switching country between them, until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the 340px-wide wrapper." },
    ],
    Preview: Previews.PreviewPhoneInputRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { PhoneInput, type PhoneInputValue } from "@/components/phone-input";

export default function Page() {
  const [phone, setPhone] = useState<PhoneInputValue | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (phone?.isValid) console.log("send code to", phone.code + phone.number);
      }}
      className="flex w-full max-w-[340px] flex-col gap-4"
    >
      <PhoneInput label="Mobile number" defaultCountry="GB" onChange={setPhone} />
      <button
        type="submit"
        disabled={!phone?.isValid}
        className="h-11 rounded-full bg-[#0071e3] text-[15px] font-semibold text-white disabled:opacity-40"
      >
        Send code
      </button>
    </form>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "nebula-glass-card",
    name: "Nebula Glass Card",
    description: "A frosted glass card floating over a slowly drifting nebula. It tilts toward the pointer on springs with its layers at different depths, a rim light runs round the edge on the pointer's side, and a press dips the card in and flashes the rim before it springs back.",
    categorySlug: "cards",
    tags: ["card", "glass", "glassmorphism", "tilt", "3d", "pricing", "product", "hover", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 104,
    createdAt: "2026-04-28",
    animationKinds: ["hover", "press", "3d", "spring", "parallax"],
    dependencies: ["framer-motion"],
    props: [
      { name: "eyebrow", type: "string", defaultValue: "\"Nebula Pro\"", description: "Small label above the title." },
      { name: "title", type: "string", defaultValue: "\"Render anywhere\"", description: "Card heading." },
      { name: "description", type: "string", description: "One or two lines under the heading." },
      { name: "stats", type: "{ label: string; value: string }[]", defaultValue: "3 sample stats", description: "Up to three figures along the bottom. An empty array hides the row." },
      { name: "cta", type: "string", defaultValue: "\"Upgrade\"", description: "Button label. An empty string hides the button." },
      { name: "onAction", type: "() => void", description: "Called when the button is pressed." },
      { name: "hues", type: "[string, string, string]", defaultValue: "[\"#bf5af2\", \"#0a84ff\", \"#ff6482\"]", description: "Colours for the nebula behind the glass and the rim light." },
      { name: "tiltStrength", type: "number", defaultValue: "12", description: "Maximum tilt in degrees." },
      { name: "children", type: "ReactNode", description: "Replaces the default body (eyebrow, title, description, stats)." },
      { name: "hint", type: "string", defaultValue: "\"Move over the glass, then press it.\"", description: "Caption under the card. An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps a virtual pointer across the card, pressing now and then, until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewNebulaGlassCardRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { NebulaGlassCard } from "@/components/nebula-glass-card";

export default function Page() {
  return (
    <NebulaGlassCard
      eyebrow="Team plan"
      title="Ship previews faster"
      description="Unlimited preview builds, shared environments and priority support."
      stats={[
        { label: "Seats", value: "25" },
        { label: "Builds", value: "Unlimited" },
        { label: "Support", value: "24/7" },
      ]}
      cta="Start free trial"
      hues={["#30d158", "#0a84ff", "#bf5af2"]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "depth-testimonials",
    name: "Depth Testimonials",
    description: "Testimonials stacked down a corridor: the front card reads clearly and the rest wait behind it, softer and further away. Next flies the front card past you while the deck surges forward and overshoots, and you can drag the deck to pull it through by hand.",
    categorySlug: "testimonials",
    tags: ["testimonials", "social proof", "carousel", "3d", "depth", "drag", "quotes", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 76,
    createdAt: "2026-04-12",
    animationKinds: ["drag", "spring", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "DepthTestimonial[]", defaultValue: "DEFAULT_DEPTH_TESTIMONIALS", description: "Testimonials, front first: { quote, name, role?, tone?: [string, string] }. tone is the avatar gradient." },
      { name: "quotes", type: "string[]", description: "Plain quotes without bylines (older API); used when items is not given." },
      { name: "heading", type: "string", defaultValue: "\"Loved by people who ship\"", description: "Heading above the deck. An empty string hides the header." },
      { name: "eyebrow", type: "string", defaultValue: "\"Testimonials\"", description: "Small caption above the heading." },
      { name: "hint", type: "string", defaultValue: "\"Drag the deck, or use the arrows.\"", description: "Hint under the controls. An empty string hides it." },
      { name: "interval", type: "number", defaultValue: "0", description: "Auto-advance every this many ms, paused on hover and focus. 0 turns it off." },
      { name: "onChange", type: "(index: number) => void", description: "Called with the index of the testimonial that comes to the front." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Pulls the deck and flies cards past every 2.8s until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the section." },
    ],
    Preview: Previews.PreviewDepthTestimonialsRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { DepthTestimonials } from "@/components/depth-testimonials";

export default function Page() {
  return (
    <section className="flex justify-center py-24">
      <DepthTestimonials
        heading="Teams ship faster with it"
        items={[
          { quote: "We rebuilt our pricing page in an afternoon.", name: "Priya Raman", role: "Design lead, Fieldnote" },
          { quote: "Accessibility review took ten minutes, not a week.", name: "Tomas Reyes", role: "Frontend engineer, Harborline" },
          { quote: "Launch week sign-ups were up a third.", name: "Mei Tanaka", role: "Founder, Quietly", tone: ["#7ee0a1", "#1fa463"] },
        ]}
      />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "beam-sweep-field",
    name: "Beam Sweep Field",
    description: "A dark hero backdrop where columns of light sweep across a fine grid and light up the lines they pass. Move over it and the nearest beam swings onto the pointer, leans into the move and overshoots before drifting back into its sweep.",
    categorySlug: "background-effects",
    tags: ["background", "hero", "beams", "grid", "light", "dark", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 84,
    createdAt: "2026-03-30",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "ReactNode", description: "Content over the field. Defaults to a short launch hero." },
      { name: "beams", type: "number", defaultValue: "3", description: "Number of sweeping light columns, 1 to 5." },
      { name: "color", type: "string", defaultValue: "\"#67e8f9\"", description: "Beam and lit-grid colour. Any CSS colour." },
      { name: "speed", type: "number", defaultValue: "11", description: "Seconds for one sweep across the field." },
      { name: "hint", type: "string", defaultValue: "\"Move across the field. The nearest beam follows.\"", description: "Caption at the bottom edge. Pass an empty string to hide it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Swings a beam onto a few points until someone moves over the field." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    Preview: Previews.PreviewBeamSweepFieldRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { BeamField } from "@/components/beam-sweep-field";

export default function Page() {
  return (
    <BeamField beams={3} color="#67e8f9" speed={11} hint="" className="min-h-[520px]">
      <div className="relative max-w-xl text-center">
        <h1 className="text-5xl font-semibold tracking-[-0.045em] text-white">Every request, traced.</h1>
        <p className="mt-4 text-[15px] text-white/65">Find the slow line of code behind any page in seconds.</p>
        <a href="/signup" className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#1d1d1f]">
          Start tracing
        </a>
      </div>
    </BeamField>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "vector-tilt-scene",
    name: "Vector Tilt Scene",
    description: "A card that is really a little diorama: point at it and it tilts toward you while its paper-cut layers spring apart in depth, overshoot and settle. The layers then drift against the pointer for real parallax, and a sheen follows the pointer across the glass label.",
    categorySlug: "three-d-components",
    tags: ["3d", "tilt", "parallax", "depth", "card", "hero card", "layers", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 96,
    createdAt: "2026-04-20",
    animationKinds: ["hover", "3d", "parallax", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "eyebrow", type: "string", defaultValue: "\"Scene depth\"", description: "Small caption on the glass label." },
      { name: "title", type: "string", defaultValue: "\"Vector Tilt Scene\"", description: "Title on the glass label, also used in the accessible name." },
      { name: "description", type: "string", defaultValue: "\"Layers that open up as you look closer.\"", description: "One line under the title." },
      { name: "children", type: "ReactNode", description: "Replaces the glass label with your own content, floating on the top layer." },
      { name: "maxTilt", type: "number", defaultValue: "14", description: "Largest tilt in degrees." },
      { name: "depth", type: "number", defaultValue: "26", description: "Gap between layers when the scene pops open, in px." },
      { name: "glare", type: "boolean", defaultValue: "true", description: "Sheen that follows the pointer." },
      { name: "hint", type: "string", defaultValue: "\"Point at the card.\"", description: "Hint under the card. An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Pops the scene open and tilts it in a slow figure of eight until someone touches it." },
      { name: "className", type: "string", description: "Classes for the root." },
    ],
    Preview: Previews.PreviewVectorTiltSceneRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { VectorTiltScene } from "@/components/vector-tilt-scene";

export default function Page() {
  return (
    <div className="flex justify-center py-16">
      <VectorTiltScene
        eyebrow="New in 4.0"
        title="Spaces"
        description="Every project gets its own room."
        maxTilt={12}
        depth={30}
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "glass-login-stack",
    name: "Glass Login Stack",
    description: "A frosted login card stacked on two ghost cards over a slow aurora: the stack tilts toward the pointer and the ghosts follow a beat late, so the layers peel apart in depth. Passkey first, then email and password with a remember switch; bad input shakes the card, and success swaps it for a drawn-check welcome.",
    categorySlug: "login-forms",
    tags: ["login", "sign in", "auth", "form", "passkey", "glass", "3d", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 73,
    createdAt: "2026-02-02",
    animationKinds: ["hover", "press", "spring", "3d", "parallax", "type"],
    dependencies: ["framer-motion"],
    props: [
      { name: "brand", type: "string", defaultValue: "\"Halo\"", description: "Brand initial and name." },
      { name: "title", type: "string", defaultValue: "\"Welcome back\"", description: "Card heading." },
      { name: "subtitle", type: "string", defaultValue: "\"Sign in to pick up where you left off.\"", description: "Line under the heading." },
      { name: "onSubmit", type: "(values: { email: string; password: string; remember: boolean }) => Promise<void> | void", description: "Called after local validation. A promise shows the pending state; throw an Error to show its message. Without it the form simulates success." },
      { name: "onPasskey", type: "() => Promise<void> | void", description: "Called by the passkey button; the scan animation runs until the promise settles." },
      { name: "onForgotPassword", type: "() => void", description: "Called by Forgot password?." },
      { name: "onSignUp", type: "() => void", description: "Shows a Create an account link under the button when set." },
      { name: "backdrop", type: "boolean", defaultValue: "true", description: "Draw the aurora backdrop. Turn off to place the card on your own background." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a demo sign-in and plays it through on a loop until someone touches the form." },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    Preview: Previews.PreviewGlassLoginStackRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { GlassLogin } from "@/components/glass-login-stack";

async function signIn(email: string, password: string) {
  // Call your auth provider here and throw on failure.
  if (password.length < 8) throw new Error("Those details didn't match. Try again.");
}

export default function Page() {
  const router = useRouter();
  return (
    <GlassLogin
      brand="Halo"
      onSubmit={async ({ email, password }) => {
        await signIn(email, password);
        router.push("/app");
      }}
      onForgotPassword={() => router.push("/reset")}
      onSignUp={() => router.push("/signup")}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "signup-form",
    name: "Signup Form",
    registryCliName: "signup-form",
    description: "A signup card with floating labels that spring up as you type, password rules that tick green as they are met, and inline errors that shake the field that needs fixing. Submitting squeezes the button into a spinner and swells it back out in green; a matching LoginForm ships alongside it.",
    categorySlug: "signup-forms",
    tags: ["signup", "sign up", "login", "auth", "form", "floating label", "validation", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 107,
    createdAt: "2026-05-14",
    animationKinds: ["spring", "press", "layout", "type"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: "\"Create your account\"", description: "Heading." },
      { name: "subtitle", type: "string", defaultValue: "\"Start building polished interfaces with motion-first components.\"", description: "Line under the heading; empty string hides it." },
      { name: "submitLabel", type: "string", defaultValue: "\"Create account\"", description: "Button label when idle." },
      { name: "loadingLabel", type: "string", defaultValue: "\"Creating account...\"", description: "Accessible label while the button is a spinner." },
      { name: "successLabel", type: "string", defaultValue: "\"Account created\"", description: "Button label after success." },
      { name: "showNameField", type: "boolean", defaultValue: "true", description: "Show first and last name." },
      { name: "showConfirmPasswordField", type: "boolean", defaultValue: "true", description: "Show the confirm-password field." },
      { name: "minPasswordLength", type: "number", defaultValue: "8", description: "Minimum password length (at least 6)." },
      { name: "defaultValues", type: "Partial<SignupFormValues>", description: "Initial values." },
      { name: "onSubmit", type: "(values: SignupFormValues) => Promise<void> | void", description: "Called after validation. A promise shows the spinner; throw an Error to show its message. Without it the form simulates success." },
      { name: "showSocialLogins", type: "boolean", defaultValue: "true", description: "Show the GitHub, Apple and Google buttons." },
      { name: "onSocialLogin", type: "(provider: \"github\" | \"apple\" | \"google\") => void", description: "Called by a social button." },
      { name: "onSignIn", type: "() => void", description: "Shows an Already have an account? link when set." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a demo signup on a loop until someone touches the form." },
      { name: "className", type: "string", description: "Extra classes on the card." },
    ],
    Preview: Previews.PreviewSignupFormRedesign,
    previewShell: "plain",
    previewSections: [
      {
        title: "Signup Form",
        Preview: Previews.PreviewSignupFormRedesign,
        reactSource: `// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { SignupForm, type SignupFormValues } from "@/components/signup-form";

async function createAccount(values: SignupFormValues) {
  // Call your auth provider here. Throw an Error to show its message on the form.
  console.log("create account for", values.email);
}

export default function Page() {
  const router = useRouter();
  return (
    <SignupForm
      showConfirmPasswordField={false}
      onSubmit={createAccount}
      onSignIn={() => router.push("/login")}
    />
  );
}`,
      },
      {
        title: "Login Form",
        Preview: Previews.PreviewSignupFormLoginRedesign,
        reactSource: `// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { LoginForm, type LoginFormValues } from "@/components/signup-form";

async function signIn(values: LoginFormValues) {
  // Call your auth provider here. Throw an Error to show its message on the form.
  if (values.password !== "correct horse") throw new Error("Wrong email or password.");
}

export default function Page() {
  const router = useRouter();
  return (
    <LoginForm
      onSubmit={signIn}
      onForgotPassword={() => router.push("/reset")}
      onSignUp={() => router.push("/signup")}
    />
  );
}`,
      },
    ],
    reactSource: `// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { SignupForm, type SignupFormValues } from "@/components/signup-form";

async function createAccount(values: SignupFormValues) {
  // Call your auth provider here. Throw an Error to show its message on the form.
  console.log("create account for", values.email);
}

export default function Page() {
  const router = useRouter();
  return (
    <SignupForm
      showConfirmPasswordField={false}
      onSubmit={createAccount}
      onSignIn={() => router.push("/login")}
    />
  );
}`,
    tailwindSource: tw,
    resourceLinks: [{ label: "Live demo", href: "/demos/signup-form" }],
  },
  {
    slug: "pulse-dashboard-kpis",
    name: "Pulse Dashboard KPIs",
    description: "A row of KPI cards with a period switcher. Switching period morphs every sparkline into its new shape on a spring, rolls each figure to its new value and flips the delta chips, which know when a drop is good news.",
    categorySlug: "dashboards",
    tags: ["dashboard", "kpi", "metrics", "analytics", "sparkline", "stats", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 101,
    createdAt: "2026-04-16",
    animationKinds: ["spring", "layout", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "kpis", type: "Kpi[]", description: "Metrics to show: label, value, delta, lowerIsBetter, trend." },
      { name: "periods", type: "Record<string, Kpi[]>", description: "Named periods with their own metrics; adds a period switcher. Used by default when kpis is not passed." },
      { name: "defaultPeriod", type: "string", description: "Period selected first." },
      { name: "onPeriodChange", type: "(period: string) => void", description: "Called when the user switches period." },
      { name: "title", type: "string", defaultValue: "\"This week at a glance\"", description: "Heading above the strip." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles through the periods every 2.8s until someone touches the strip." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    Preview: Previews.PreviewPulseDashboardKpisRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { KpiStrip, type Kpi } from "@/components/pulse-dashboard-kpis";

const periods: Record<string, Kpi[]> = {
  Week: [
    { label: "MRR", value: "$48.2k", delta: "+8.1%", trend: [32, 35, 34, 38, 41, 44, 48] },
    { label: "Churn", value: "1.9%", delta: "-0.4%", lowerIsBetter: true, trend: [3, 2.8, 2.6, 2.4, 2.1, 2, 1.9] },
    { label: "Active seats", value: "3,214", delta: "+212", trend: [2.6, 2.7, 2.8, 2.9, 3, 3.1, 3.2] },
  ],
  Month: [
    { label: "MRR", value: "$186.4k", delta: "+14.0%", trend: [140, 150, 148, 160, 171, 178, 186] },
    { label: "Churn", value: "2.3%", delta: "+0.2%", lowerIsBetter: true, trend: [2.1, 2.2, 2.0, 2.4, 2.3, 2.2, 2.3] },
    { label: "Active seats", value: "3,180", delta: "+540", trend: [2.4, 2.5, 2.7, 2.8, 3, 3.1, 3.18] },
  ],
};

export default function Page() {
  return (
    <KpiStrip
      title="Revenue at a glance"
      periods={periods}
      defaultPeriod="Week"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "orbital-loader",
    name: "Orbital Loader",
    description: "A loader with a comet that laps the ring, speeding up and easing off each lap, its tail stretching with the speed and shrinking as it slows. Give it progress and the arc fills behind the comet; at 100% the ring pops, turns green and draws a tick. Also includes Step Loader: For long jobs: the current step sits centred, finished ones roll up with a tick, a ring shows progress, Cancel is always there, and it ends on the result.",
    categorySlug: "loaders",
    tags: ["loader", "spinner", "progress", "ring", "upload", "status", "motion kit", "framer-motion", "step loader"],
    premium: false,
    trendingScore: 80,
    createdAt: "2026-01-30",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "progress", type: "number", description: "0–1 for a ring that fills to progress; leave out for an endless orbit. At 1 it ticks." },
      { name: "size", type: "number", defaultValue: "112", description: "Diameter in px." },
      { name: "messages", type: "string[]", defaultValue: "[\"Warming up the build\", ...]", description: "Status lines cycled under the loader. One line stays fixed; [] hides them." },
      { name: "doneMessage", type: "string", defaultValue: "\"Done\"", description: "Line shown once progress reaches 1." },
      { name: "color", type: "string", description: "Accent colour of the arc and comet. Defaults to system blue." },
      { name: "onComplete", type: "() => void", description: "Called once when progress reaches 1." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Runs a pretend upload from 0 to 100%, ticks, and starts again, until someone clicks the loader." },
      { name: "className", type: "string", description: "Classes for the root." },
      { name: "StepLoader.steps", type: "string[]", defaultValue: "STEP_LOADER_STEPS", description: "The steps of the job, in order. The last one shows briefly as done before the result appears." },
      { name: "StepLoader.stepMs", type: "number", defaultValue: "1050", description: "How long each step stays current, in ms. Under 800 the finish tick plays on every second step instead of every step." },
      { name: "StepLoader.title", type: "string", defaultValue: "\"Set up your workspace\"", description: "Heading shown before the job starts." },
      { name: "StepLoader.idleText", type: "string", defaultValue: "\"This takes about six seconds.\"", description: "Line under the heading before the job starts." },
      { name: "StepLoader.startLabel", type: "string", defaultValue: "\"Start setup\"", description: "Label of the button that starts the job." },
      { name: "StepLoader.doneTitle", type: "string", defaultValue: "\"Your workspace is ready\"", description: "Heading of the result once every step has finished." },
      { name: "StepLoader.doneText", type: "string", defaultValue: "\"248 customers imported, dashboard built, 3 invites sent.\"", description: "Line under the result heading." },
      { name: "StepLoader.actionLabel", type: "string", defaultValue: "\"Open workspace\"", description: "Label of the button on the result." },
      { name: "StepLoader.onComplete", type: "() => void", description: "Called once when every step has finished." },
      { name: "StepLoader.onCancel", type: "() => void", description: "Called when Cancel is pressed." },
      { name: "StepLoader.onAction", type: "() => void", description: "Called when the button on the result is pressed." },
      { name: "StepLoader.autoplay", type: "boolean", defaultValue: "false", description: "Starts the job by itself, shows the result, and starts again, until someone touches the card. Pauses off screen and never runs under reduced motion." },
      { name: "StepLoader.enableSound", type: "boolean", defaultValue: "true", description: "Ticks as steps finish, plays a done sound at the end and a soft off on Cancel. Follows the site-wide sound switch; autoplay makes the same sounds once the visitor has used the page." },
      { name: "StepLoader.className", type: "string", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewOrbitalLoaderRedesign,
    previewShell: "plain",
    previewSections: [
      {
        title: "Progress",
        Preview: Previews.PreviewOrbitalLoaderRedesign,
        reactSource: `// src/app/page.tsx

import { OrbitalLoader } from "@/components/orbital-loader";

// progress runs from 0 to 100. Pass your real upload percentage instead of 64.
export default function Page() {
  return <OrbitalLoader progress={64} messages={["Uploading your files"]} doneMessage="All files uploaded" />;
}`,
      },
      {
        title: "Endless",
        Preview: Previews.PreviewOrbitalLoaderEndless,
        reactSource: `// src/app/page.tsx

import { OrbitalLoader } from "@/components/orbital-loader";

export default function Page() {
  return <OrbitalLoader size={120} />;
}`,
      },
      {
        title: "Step Loader",
        Preview: Previews.PreviewStepLoader,
        reactSource: `// src/app/page.tsx

import { StepLoader } from "@/components/orbital-loader";

export default function Page() {
  return (
    <StepLoader
      steps={["Creating your workspace", "Importing customers", "Building your dashboard", "Ready"]}
      stepMs={1200}
    />
  );
}`,
      },
    ],
    reactSource: `// src/app/page.tsx

import { OrbitalLoader } from "@/components/orbital-loader";

// progress runs from 0 to 100. Pass your real upload percentage instead of 64.
export default function Page() {
  return (
    <OrbitalLoader
      progress={64}
      messages={["Uploading your files", "Making thumbnails"]}
      doneMessage="All files uploaded"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "milestone-timeline",
    name: "Milestone Timeline",
    description: "A roadmap timeline. When it scrolls into view a glowing bead runs down the rail, drawing each finished milestone's check as it passes, overshoots the milestone in progress slightly and settles on it; clicking a milestone or using the arrow keys slides a raised card to it and opens its notes. Also includes Roadmap Scrubber, an edit-style timeline where you drag a playhead and every bar fills to that day. Also includes Commit Graph Roadmap, a roadmap drawn as git log --graph with release tags, branch lanes and a pulsing HEAD.",
    categorySlug: "timelines",
    tags: ["timeline", "roadmap", "milestones", "progress", "changelog", "motion kit", "framer-motion", "roadmap scrubber", "gantt timeline", "commit graph roadmap", "git graph timeline"],
    premium: false,
    trendingScore: 71,
    createdAt: "2026-02-18",
    animationKinds: ["scroll", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "milestones", type: "{ title: string; date?: string; description?: string; status?: \"done\" | \"current\" | \"upcoming\"; tag?: string }[]", description: "Roadmap milestones." },
      { name: "steps", type: "string[]", description: "Plain titles (older API); all but the last count as done." },
      { name: "heading", type: "string", defaultValue: "\"Roadmap\"", description: "Heading." },
      { name: "defaultOpen", type: "number", description: "Milestone opened first; defaults to the current one." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens each milestone in turn until someone touches the timeline." },
      { name: "className", type: "string", description: "Extra classes on the section." },
      { name: "RoadmapScrubber.tracks", type: "RoadmapScrubberTrack[]", defaultValue: "Design, Engineering and Launch sample for 2026", description: "Tracks to draw. Each has a name, bars with start and end dates, and milestone marks with a date. Dates are YYYY-MM-DD." },
      { name: "RoadmapScrubber.year", type: "number", defaultValue: "2026", description: "The calendar year the chart spans, January to December. Dates outside it clamp to the edges." },
      { name: "RoadmapScrubber.today", type: "string", defaultValue: "\"2026-06-15\"", description: "The date marked as today and the end point of the opening sweep. The component never reads the real clock, so it renders the same everywhere." },
      { name: "RoadmapScrubber.title", type: "string", defaultValue: "\"Roadmap <year>\"", description: "Heading of the card." },
      { name: "RoadmapScrubber.autoplay", type: "boolean", defaultValue: "false", description: "After the opening sweep, glides the playhead through the year and back to today until someone touches the chart." },
      { name: "RoadmapScrubber.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the card." },
      { name: "CommitGraphRoadmap.commits", type: "RoadmapCommit[]", defaultValue: "8-commit sample roadmap", description: "Commits, newest first. Each has a lane (0 main, 1 feature, 2 lab), a title, a meta line, a body, a state (done, head or next) and an optional release tag." },
      { name: "CommitGraphRoadmap.branches", type: "RoadmapBranch[]", defaultValue: "feature and lab lanes of the sample", description: "Branch lanes that fork from main at row from and merge back at row to. Row 0 is the top." },
      { name: "CommitGraphRoadmap.defaultOpen", type: "number", defaultValue: "the HEAD row", description: "Row whose commit message is open first." },
      { name: "CommitGraphRoadmap.autoplay", type: "boolean", defaultValue: "false", description: "Opens each commit in turn once the graph is on screen, until someone touches it." },
      { name: "CommitGraphRoadmap.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewMilestoneTimelineRedesign,
    previewSections: [
      {
        title: "Milestone Timeline",
        Preview: Previews.PreviewMilestoneTimelineRedesign,
        reactSource: `// src/app/page.tsx

import { MilestoneTimeline } from "@/components/milestone-timeline";

export default function Page() {
  return (
    <MilestoneTimeline
      heading="Roadmap"
      milestones={[
        { title: "Research", date: "Jan 2026", description: "Twenty customer interviews.", status: "done" },
        { title: "Design system v1", date: "Mar 2026", description: "Tokens, type and 40 components.", status: "done" },
        { title: "Private beta", date: "Jun 2026", description: "312 teams onboarded.", status: "current", tag: "In progress" },
        { title: "Public launch", date: "Sep 2026", description: "Pricing, docs and the launch film.", status: "upcoming" },
      ]}
    />
  );
}`,
      },
      {
        title: "Roadmap Scrubber",
        Preview: Previews.PreviewRoadmapScrubber,
        reactSource: `// src/app/page.tsx

import { RoadmapScrubber, type RoadmapScrubberTrack } from "@/components/milestone-timeline";

const TRACKS: RoadmapScrubberTrack[] = [
  {
    name: "Design",
    bars: [{ label: "Design system", start: "2026-01-01", end: "2026-03-26" }],
  },
  {
    name: "Launch",
    bars: [{ label: "Private beta", start: "2026-05-17", end: "2026-08-17" }],
    marks: [{ label: "Public launch", date: "2026-09-16" }],
  },
];

export default function Page() {
  return <RoadmapScrubber tracks={TRACKS} year={2026} today="2026-06-15" title="Roadmap 2026" />;
}
`,
      },
      {
        title: "Commit Graph Roadmap",
        Preview: Previews.PreviewCommitGraphRoadmap,
        reactSource: `// src/app/page.tsx

import { CommitGraphRoadmap, type RoadmapBranch, type RoadmapCommit } from "@/components/milestone-timeline";

const COMMITS: RoadmapCommit[] = [
  { lane: 0, tag: "v2.0", title: "Public launch", meta: "Planned · Q3", body: "Pricing, docs and the launch film.", state: "next" },
  { lane: 1, title: "Charts", meta: "In progress", body: "Animated charts that build as they enter.", state: "head" },
  { lane: 0, tag: "v1.0", title: "Core library", meta: "Shipped · Jan", body: "The first forty components.", state: "done" },
];
const BRANCHES: RoadmapBranch[] = [{ lane: 1, from: 2, to: 0, color: "#bf5af2" }];

export default function Page() {
  return <CommitGraphRoadmap commits={COMMITS} branches={BRANCHES} />;
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MilestoneTimeline } from "@/components/milestone-timeline";

export default function Page() {
  return (
    <MilestoneTimeline
      heading="Roadmap"
      milestones={[
        { title: "Research", date: "Jan 2026", description: "Twenty customer interviews.", status: "done" },
        { title: "Design system v1", date: "Mar 2026", description: "Tokens, type and 40 components.", status: "done" },
        { title: "Private beta", date: "Jun 2026", description: "312 teams onboarded.", status: "current", tag: "In progress" },
        { title: "Public launch", date: "Sep 2026", description: "Pricing, docs and the launch film.", status: "upcoming" },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "glow-button",
    name: "Glow Button",
    registryCliName: "glow-button",
    description: "A call-to-action link with a coloured light that lives on its rim. The brightest arc turns to face the pointer and the glow behind the button leans the same way, the button drifts a few pixels toward the cursor and the arrow springs ahead on hover. Also includes Magnetic Button: Leans toward your pointer with the label leaning further, ink floods in from where you enter and drains toward where you leave, and it squashes on press.",
    categorySlug: "cta-sections",
    tags: ["button", "cta", "glow", "gradient", "magnetic", "link", "hero", "motion kit", "framer-motion", "magnetic button"],
    premium: false,
    trendingScore: 96,
    createdAt: "2026-05-18",
    animationKinds: ["hover", "magnetic", "gradient", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "React.ReactNode", defaultValue: "\"Get Started Now\"", description: "Label." },
      { name: "href", type: "string", defaultValue: "\"#\"", description: "Link target." },
      { name: "colors", type: "string[]", defaultValue: "[\"#0a84ff\", \"#bf5af2\", \"#ff9f0a\", \"#30d158\"]", description: "Colours of the light on the rim and the glow behind." },
      { name: "background", type: "string", description: "Inner pill fill. Defaults to ink in light mode and near-white in dark mode." },
      { name: "textColor", type: "string", description: "Label colour. Defaults to ink or white, whichever reads better on the fill." },
      { name: "arrowColor", type: "string", description: "Arrow colour. Defaults to the label colour." },
      { name: "radius", type: "number", defaultValue: "28", description: "Corner radius in px." },
      { name: "borderColor", type: "string", description: "Colour of the resting rim." },
      { name: "glow", type: "string", description: "Extra box-shadow under the button." },
      { name: "openInNewTab", type: "boolean", defaultValue: "false", description: "Open the link in a new tab." },
      { name: "innerClassName", type: "string", description: "Extra classes for the inner pill (padding, font size)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Orbits the light round the rim until someone points at the button." },
      { name: "MagneticButton.children", type: "React.ReactNode", defaultValue: "\"Get started\" with an arrow", description: "Magnetic Button: the label. It leans further toward the pointer than the button itself." },
      { name: "MagneticButton.variant", type: "\"solid\" | \"outline\"", defaultValue: "\"solid\"", description: "Magnetic Button: a solid ink pill that floods blue, or a white outlined pill that floods ink. Both have a dark mode twin." },
      { name: "MagneticButton.strength", type: "number", defaultValue: "0.35", description: "Magnetic Button: how far the button leans toward the pointer, as a fraction of the distance from its centre." },
      { name: "MagneticButton.onClick", type: "() => void", description: "Magnetic Button: called when the button is pressed." },
      { name: "MagneticButton.aria-label", type: "string", description: "Magnetic Button: accessible name, when the label alone is not enough." },
      { name: "MagneticButton.autoplay", type: "boolean", defaultValue: "false", description: "Magnetic Button: a ghost pointer leans in, floods ink, presses and drains out on a loop until someone touches the button." },
      { name: "MagneticButton.enableSound", type: "boolean", defaultValue: "true", description: "Magnetic Button: plays a soft tap on press. Follows the site-wide sound switch." },
      { name: "MagneticButton.className", type: "string", description: "Magnetic Button: extra classes for the button." },
    ],
    Preview: Previews.PreviewGlowButtonRedesign,
    previewSections: [
      {
        title: "Glow Button",
        Preview: Previews.PreviewGlowButtonRedesign,
        reactSource: `// src/app/page.tsx

import { GlowButton } from "@/components/glow-button";

export default function Page() {
  return (
    <div className="flex items-center gap-4">
      <GlowButton href="/signup">Start free trial</GlowButton>
      <GlowButton href="/pricing" colors={["#30d158", "#64d2ff"]} radius={14}>
        See pricing
      </GlowButton>
    </div>
  );
}`,
      },
      {
        title: "Magnetic Button",
        Preview: Previews.PreviewMagneticButton,
        reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { MagneticButton } from "@/components/glow-button";

export default function Page() {
  const [pressed, setPressed] = useState(0);

  return (
    <div className="flex flex-wrap items-center justify-center">
      <MagneticButton onClick={() => setPressed((n) => n + 1)}>Start building</MagneticButton>
      <MagneticButton variant="outline" strength={0.25}>
        Talk to sales
      </MagneticButton>
      <span className="sr-only" role="status">
        {pressed ? \`Pressed \${pressed} times\` : ""}
      </span>
    </div>
  );
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { GlowButton } from "@/components/glow-button";

export default function Page() {
  return (
    <div className="flex items-center gap-4">
      <GlowButton href="/signup">Start free trial</GlowButton>
      <GlowButton href="/pricing" colors={["#30d158", "#64d2ff"]} radius={14}>
        See pricing
      </GlowButton>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "word-magnet",
    name: "Word Magnet",
    registryCliName: "word-magnet",
    description: "A headline whose words behave like fridge magnets: the pointer pushes nearby words away, each one tilts in the direction it was shoved, holds for a beat, then springs home with a wobble. Whole words move, letters never split, and it works with touch as well as a mouse.",
    categorySlug: "motion-effects",
    tags: ["text", "cursor", "magnetic", "repel", "physics", "headline", "spring", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 91,
    createdAt: "2026-05-18",
    animationKinds: ["hover", "magnetic", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", defaultValue: "\"Magnetic words react to your cursor and snap back into place\"", description: "Text split into magnetic words." },
      { name: "radius", type: "number", defaultValue: "130", description: "Pointer influence radius in px." },
      { name: "force", type: "number", defaultValue: "0.45", description: "Push strength, 0 to 1." },
      { name: "damping", type: "number", defaultValue: "28", description: "Return-spring damping. Lower wobbles longer, higher settles flat." },
      { name: "returnDelay", type: "number", defaultValue: "360", description: "Milliseconds a pushed word holds before springing back." },
      { name: "disableOnMobile", type: "boolean", defaultValue: "false", description: "Turns the effect off on touch screens and viewports under 768px." },
      { name: "overflow", type: "CSSProperties['overflow']", defaultValue: "\"visible\"", description: "Whether pushed words may spill out of the text box." },
      { name: "className", type: "string", description: "Classes for the text container." },
      { name: "wordClassName", type: "string", description: "Classes for every word." },
      { name: "style", type: "CSSProperties", description: "Inline styles for the container." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "A ghost pointer drifts through the words until a real pointer arrives." },
    ],
    Preview: Previews.PreviewWordMagnetRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { WordMagnet } from "@/components/word-magnet";

export default function Page() {
  return (
    <section className="flex min-h-[420px] items-center justify-center px-6">
      <WordMagnet
        text="Push these words around and watch them wobble back into place"
        radius={140}
        force={0.5}
        damping={22}
        className="max-w-3xl text-5xl"
      />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "three-d-folder",
    name: "3D Folder Card",
    registryCliName: "three-d-folder",
    description: "A folder card that swings open when you hover, focus or tap it: the front flap falls forward on a spring and up to three papers fan up out of it, each settling with a wobble. Picking a paper grows its cover into a preview dialog you can page through with the arrow keys and close with Escape.",
    categorySlug: "cards",
    tags: ["folder", "portfolio", "gallery", "lightbox", "cards", "3d", "hover", "shared layout", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 90,
    createdAt: "2026-05-18",
    animationKinds: ["hover", "press", "spring", "3d", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: "\"Design Archive\"", description: "Label under the folder, also printed on the flap." },
      { name: "projects", type: "FolderProject[]", defaultValue: "3 sample projects", description: "Each { id, title, image?, bg?, meta?, href? }. The first three show as papers; the preview pages through all of them. Without image, the drawn cover in bg is used." },
      { name: "folderBackColor", type: "string", defaultValue: "\"#3d9cf0\"", description: "Back panel colour." },
      { name: "folderFrontColor", type: "string", defaultValue: "\"#6cb8f6\"", description: "Front flap colour." },
      { name: "folderTabColor", type: "string", description: "Tab colour. Defaults to the back colour." },
      { name: "size", type: "\"sm\" | \"md\"", defaultValue: "\"md\"", description: "\"sm\" draws the folder at about 60% for dense grids." },
      { name: "onOpenProject", type: "(id: string | null) => void", description: "Called with the project id when a preview opens, and null when it closes." },
      { name: "hint", type: "string", defaultValue: "\"Hover or tap the folder.\"", description: "Caption under the count (md only). An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and closes the folder by itself until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewThreeDFolderRedesign,
    previewShell: "plain",
    previewSections: [
      {
        title: "Single folder",
        Preview: Previews.PreviewThreeDFolderRedesign,
        reactSource: `// src/app/page.tsx

import { ThreeDFolder } from "@/components/three-d-folder";

const projects = [
  { id: "atlas", title: "Atlas", meta: "Brand system, 2026", bg: "linear-gradient(160deg,#64d2ff,#0a84ff 55%,#0040dd)", href: "/work/atlas" },
  { id: "prism", title: "Prism", meta: "Launch film, 2026", image: "/work/prism-cover.jpg", href: "/work/prism" },
  { id: "signal", title: "Signal", meta: "Campaign, 2025", bg: "linear-gradient(160deg,#ffd60a,#ff9f0a 50%,#ff453a)" },
];

export default function Page() {
  return (
    <ThreeDFolder
      title="Selected work"
      projects={projects}
      folderBackColor="#3d9cf0"
      folderFrontColor="#6cb8f6"
    />
  );
}`,
      },
      {
        title: "Compact grid",
        Preview: Previews.PreviewThreeDFolderGridRedesign,
        reactSource: `// src/app/page.tsx

import { ThreeDFolder } from "@/components/three-d-folder";

const folders = [
  { title: "Brand", back: "#3d9cf0", front: "#6cb8f6" },
  { title: "Photos", back: "#ff9f0a", front: "#ffbf4d" },
  { title: "Product", back: "#30b65a", front: "#5fd47f" },
];

export default function Page() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {folders.map((f) => (
        <ThreeDFolder key={f.title} size="sm" title={f.title} folderBackColor={f.back} folderFrontColor={f.front} />
      ))}
    </div>
  );
}`,
      },
    ],
    reactSource: `// src/app/page.tsx

import { ThreeDFolder } from "@/components/three-d-folder";

const projects = [
  { id: "atlas", title: "Atlas", meta: "Brand system, 2026", bg: "linear-gradient(160deg,#64d2ff,#0a84ff 55%,#0040dd)", href: "/work/atlas" },
  { id: "prism", title: "Prism", meta: "Launch film, 2026", image: "/work/prism-cover.jpg", href: "/work/prism" },
  { id: "signal", title: "Signal", meta: "Campaign, 2025", bg: "linear-gradient(160deg,#ffd60a,#ff9f0a 50%,#ff453a)" },
];

export default function Page() {
  return (
    <ThreeDFolder
      title="Selected work"
      projects={projects}
      folderBackColor="#3d9cf0"
      folderFrontColor="#6cb8f6"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "draggable-card-stack",
    name: "Draggable Card Stack",
    registryCliName: "draggable-card-stack",
    description: "A pile of photo cards you can fling: grab the top card and throw it any direction and it leans into the throw, flies off, then tucks back under the pile while the next card pops up with a little overshoot. The right arrow sends the top card away and the left arrow pulls the bottom card back; images, videos or drawn scenes all work. Also includes Spread Deck, a photo pile that deals itself into a grid, then flies one photo to the front while the rest gather in the corner. Also includes Riffle Stack, a feature deck you shuffle like real cards: riffle bows two halves apart and falls them back in clumps, cut slides the top half under.",
    categorySlug: "cards",
    tags: ["cards", "stack", "deck", "drag", "swipe", "fling", "gallery", "gesture", "motion kit", "framer-motion", "spread deck", "photo grid", "layout morph", "riffle stack", "card shuffle"],
    premium: false,
    trendingScore: 115,
    createdAt: "2026-05-19",
    animationKinds: ["drag", "hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "StackCard[]", defaultValue: "5 drawn scenes", description: "Cards from top to bottom, each { id, title?, subtitle?, media?, type?: \"image\" | \"video\", bg? }. Without media a drawn scene (or bg) is shown." },
      { name: "cardWidth", type: "number", defaultValue: "220", description: "Card width in px." },
      { name: "cardHeight", type: "number", defaultValue: "296", description: "Card height in px." },
      { name: "borderRadius", type: "number", defaultValue: "22", description: "Corner radius in px." },
      { name: "shadowStrength", type: "number", defaultValue: "1", description: "Drop-shadow strength from 0 to 1." },
      { name: "stackOffset", type: "number", defaultValue: "0", description: "Extra downward offset per card in the pile, in px." },
      { name: "maxRotation", type: "number", defaultValue: "9", description: "Largest resting tilt of the cards underneath, in degrees." },
      { name: "depthScale", type: "number", defaultValue: "0.045", description: "How much smaller each card underneath is (0.045 = 4.5%)." },
      { name: "showOverlay", type: "boolean", defaultValue: "true", description: "Title and subtitle over the top card." },
      { name: "hoverScale", type: "number", defaultValue: "1.03", description: "Scale of the top card under the pointer." },
      { name: "onChange", type: "(id: string) => void", description: "Called with the id of the new top card." },
      { name: "hint", type: "string", defaultValue: "\"Fling the top card. Arrow keys work too.\"", description: "Caption under the stack. An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Flings the top card left and right in turn until someone touches the stack." },
      { name: "autoInterval", type: "number", defaultValue: "2400", description: "Time between autoplay flings, in ms." },
      { name: "className", type: "string", description: "Extra classes for the root." },
      { name: "SpreadDeck.photos", type: "SpreadDeckPhoto[]", defaultValue: "six demo places", description: "The photos, drawn as gradient landscapes so nothing is downloaded. Each has a title, a sub line and sky, sun and hill colours." },
      { name: "SpreadDeck.autoplay", type: "boolean", defaultValue: "false", description: "Walks through pile, grid and focus by itself every 2.2 seconds until someone touches the deck. Pauses off screen and never runs under reduced motion." },
      { name: "SpreadDeck.className", type: "string", defaultValue: "undefined", description: "Extra classes for the root, which fills its container up to 600px." },
      { name: "RiffleStack.cards", type: "RiffleCard[]", defaultValue: "eight feature cards", description: "The deck, with an even number of cards. Each has a title, a line, two gradient colours and an SVG icon path." },
      { name: "RiffleStack.autoplay", type: "boolean", defaultValue: "false", description: "Riffles and cuts the deck by itself every 2.8 seconds until someone presses a button. Pauses off screen and never runs under reduced motion." },
      { name: "RiffleStack.onShuffle", type: "(top: string) => void", defaultValue: "undefined", description: "Called with the title of the card that lands on top after each riffle or cut." },
      { name: "RiffleStack.className", type: "string", defaultValue: "undefined", description: "Extra classes for the root, which is 440px wide at most and scales down to fit narrow containers." },
    ],
    Preview: Previews.PreviewDraggableCardStackRedesign,
    previewSections: [
      {
        title: "Draggable Card Stack",
        Preview: Previews.PreviewDraggableCardStackRedesign,
        reactSource: `// src/app/page.tsx

import { DraggableCardStack } from "@/components/draggable-card-stack";

const cards = [
  { id: "sur", title: "Big Sur", subtitle: "Coast road at dusk", media: "/photos/big-sur.jpg" },
  { id: "lofoten", title: "Lofoten", subtitle: "Blue hour over the bay", media: "/photos/lofoten.jpg" },
  { id: "kyoto", title: "Kyoto", subtitle: "Lanterns after rain", media: "/clips/kyoto.mp4", type: "video" as const },
  { id: "rum", title: "Wadi Rum", subtitle: "Sand at first light", bg: "linear-gradient(180deg,#fddb92,#f6a04d)" },
];

export default function Page() {
  return <DraggableCardStack cards={cards} cardWidth={240} cardHeight={320} />;
}`,
      },
      {
        title: "Spread Deck",
        Preview: Previews.PreviewSpreadDeck,
        reactSource: `// src/app/page.tsx

import { SpreadDeck } from "@/components/draggable-card-stack";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[600px]">
      <SpreadDeck />
    </div>
  );
}
`,
      },
      {
        title: "Riffle Stack",
        Preview: Previews.PreviewRiffleStack,
        reactSource: `// src/app/page.tsx

import { RiffleStack } from "@/components/draggable-card-stack";

export default function Page() {
  return <RiffleStack />;
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { DraggableCardStack } from "@/components/draggable-card-stack";

const cards = [
  { id: "sur", title: "Big Sur", subtitle: "Coast road at dusk", media: "/photos/big-sur.jpg" },
  { id: "lofoten", title: "Lofoten", subtitle: "Blue hour over the bay", media: "/photos/lofoten.jpg" },
  { id: "kyoto", title: "Kyoto", subtitle: "Lanterns after rain", media: "/clips/kyoto.mp4", type: "video" as const },
  { id: "rum", title: "Wadi Rum", subtitle: "Sand at first light", bg: "linear-gradient(180deg,#fddb92,#f6a04d)" },
];

export default function Page() {
  return <DraggableCardStack cards={cards} cardWidth={240} cardHeight={320} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "card-carousel-3d",
    name: "3D Card Carousel",
    registryCliName: "card-carousel-3d",
    description: "Product cards standing round a 3D cylinder. Drag or fling it and it coasts, then clicks into place with the nearest card facing you; spin it fast and the cards swing outward and settle back in as it slows, with wheel, arrow keys, dots and a tap on any card also working.",
    categorySlug: "cards",
    tags: ["3d", "carousel", "cylinder", "products", "drag", "inertia", "cards", "shop", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 112,
    createdAt: "2026-05-19",
    animationKinds: ["drag", "scroll", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "CarouselCard[]", defaultValue: "DEFAULT_CARDS", description: "Each { id, name, price, image?, color? }. Without image a phone is drawn in color." },
      { name: "radius", type: "number", description: "Cylinder radius in px. Defaults to one that fits the cards edge to edge." },
      { name: "itemWidth", type: "number", defaultValue: "168", description: "Card width in px." },
      { name: "itemHeight", type: "number", defaultValue: "220", description: "Card height in px." },
      { name: "perspective", type: "number", defaultValue: "1100", description: "CSS perspective in px." },
      { name: "autoRotate", type: "boolean", defaultValue: "false", description: "Drift continuously; pauses under the pointer and for a moment after any interaction." },
      { name: "autoSpeed", type: "number", defaultValue: "1", description: "Drift speed multiplier." },
      { name: "scrollSpeed", type: "number", defaultValue: "1", description: "Drag and wheel speed multiplier." },
      { name: "direction", type: "\"cw\" | \"ccw\"", defaultValue: "\"cw\"", description: "Direction for drift and autoplay." },
      { name: "onChange", type: "(index: number) => void", description: "Called with the index of the card that settles in front." },
      { name: "hint", type: "string", defaultValue: "\"Drag, scroll or use the arrow keys.\"", description: "Caption under the dots. An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Steps to the next card every 2.4s until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewCardCarousel3DRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { CardCarousel3D } from "@/components/card-carousel-3d";

const cards = [
  { id: "studio", name: "Studio Headphones", price: "$349", image: "/products/studio.png" },
  { id: "buds", name: "Buds Pro", price: "$249", image: "/products/buds.png" },
  { id: "speaker", name: "Home Speaker", price: "$299", image: "/products/speaker.png" },
  { id: "mini", name: "Mini Speaker", price: "$99", color: "#f2a7c3" },
  { id: "pro", name: "Lumen Pro", price: "From $999", color: "#3a3a3c" },
];

export default function Page() {
  return (
    <CardCarousel3D
      cards={cards}
      itemWidth={180}
      itemHeight={236}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "real-time-cursors",
    name: "Real-Time Cursors",
    registryCliName: "real-time-cursors",
    description: "A shared design board with teammates' cursors moving over it live: arrows glide between spots and lean with their speed, name tags trail behind and swing when they stop, stops land as clicks and now and then someone drops a comment. Your own pointer gets a You tag when it comes over the board.",
    categorySlug: "motion-effects",
    tags: ["cursor", "multiplayer", "collaboration", "presence", "live", "figma", "board", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 92,
    createdAt: "2026-05-18",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cursors", type: "LiveCursor[]", defaultValue: "3 teammates", description: "Teammates: { name, color, textColor?, path: {x, y}[] in % of the board, duration?, delay?, note? }." },
      { name: "title", type: "string", defaultValue: "\"Launch board\"", description: "Board name in the header." },
      { name: "showYou", type: "boolean", defaultValue: "true", description: "Shows a You tag that follows the visitor's pointer over the board." },
      { name: "youColor", type: "string", defaultValue: "\"#30d158\"", description: "Colour of the visitor's tag." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Moves a demo You cursor round the board until the visitor's pointer comes over it." },
      { name: "className", type: "string", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewRealTimeCursorsRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { RealTimeCursors } from "@/components/real-time-cursors";

export default function Page() {
  return (
    <RealTimeCursors
      title="Q3 roadmap"
      cursors={[
        { name: "Ava", color: "#0071e3", note: "Move this up?", path: [{ x: 18, y: 30 }, { x: 44, y: 24 }, { x: 30, y: 60 }] },
        { name: "Noah", color: "#bf5af2", path: [{ x: 80, y: 70 }, { x: 60, y: 40 }, { x: 86, y: 28 }], delay: 0.6 },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "svg-noise-shader",
    name: "SVG Noise Shader",
    description: "A grainy gradient surface built from SVG feTurbulence: film grain that flickers over soft pools of colour leaning toward the pointer. Press and hold (or hold Space) and the surface melts through a displacement map; let go and it snaps back like jelly, overshooting before it settles.",
    categorySlug: "shaders",
    tags: ["texture", "noise", "grain", "svg filter", "feTurbulence", "gradient", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 77,
    createdAt: "2026-04-22",
    animationKinds: ["press", "hover", "spring", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "colors", type: "string[]", defaultValue: "[\"#5e5ce6\", \"#ff375f\", \"#0a84ff\", \"#ff9f0a\"]", description: "Up to four colours for the glowing pools under the grain." },
      { name: "grain", type: "number", defaultValue: "0.35", description: "Strength of the film grain, 0 to 1." },
      { name: "distortion", type: "number", defaultValue: "90", description: "How far the surface melts while held, in px of displacement." },
      { name: "speed", type: "number", defaultValue: "1", description: "Speed multiplier for the flowing turbulence." },
      { name: "children", type: "ReactNode", description: "Content over the surface. Defaults to a title." },
      { name: "hint", type: "string", defaultValue: "\"Press and hold to melt it.\"", description: "Caption under the default title. Pass an empty string to hide it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Holds and releases the surface every few seconds until someone touches it." },
      { name: "className", type: "string", description: "Extra classes (the surface is 340px tall and up to 520px wide by default)." },
    ],
    Preview: Previews.PreviewSvgNoiseShaderRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SvgNoise } from "@/components/svg-noise-shader";

export default function Page() {
  return (
    <SvgNoise colors={["#ff375f", "#ff9f0a", "#bf5af2", "#0a84ff"]} grain={0.45} className="h-[380px] max-w-[560px]">
      <div className="pointer-events-none text-center text-white">
        <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-white/75">Summer drop</p>
        <h2 className="mt-2 text-6xl font-semibold tracking-[-0.05em]">Heatwave.</h2>
      </div>
    </SvgNoise>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tracing-spotlight-panel",
    name: "Tracing Spotlight Panel",
    description: "A panel with a light in it: point inside and a soft spotlight trails the pointer on a spring while the border glows wherever the light is closest. Leave and the light slides out to the edge and keeps running laps around the border, tracing the outline until you come back.",
    categorySlug: "motion-effects",
    tags: ["spotlight", "pointer", "glow", "border", "pricing", "card", "hover", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 107,
    createdAt: "2026-05-06",
    animationKinds: ["hover", "spring", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "ReactNode", description: "Panel content. Leave out for the built-in pricing tier." },
      { name: "color", type: "string", description: "Colour of the light. Defaults to system blue." },
      { name: "size", type: "number", defaultValue: "260", description: "Radius of the spotlight inside the panel, in px." },
      { name: "trace", type: "boolean", defaultValue: "true", description: "While nobody is pointing at it, the light runs laps around the border." },
      { name: "lap", type: "number", defaultValue: "5", description: "Seconds for one lap of the border." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps the spotlight through the panel now and then until someone points at it." },
      { name: "className", type: "string", description: "Classes for the root (it is 340px wide at most)." },
    ],
    Preview: Previews.PreviewTracingSpotlightPanelRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TracingSpotlightPanel } from "@/components/tracing-spotlight-panel";

export default function Page() {
  return (
    <TracingSpotlightPanel color="#bf5af2" lap={6}>
      <p className="text-sm font-semibold">Team</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight">$49</p>
      <p className="mt-1 text-sm text-neutral-500">per seat, billed yearly</p>
      <button className="mt-6 h-10 w-full rounded-full bg-neutral-900 text-sm font-medium text-white">Choose Team</button>
    </TracingSpotlightPanel>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "forge-ai-command-bar",
    name: "Forge AI Command Bar",
    description: "A command bar for an AI copilot: pick Ask, Edit or Build, type a prompt or tap a suggestion and send it. The bar grows a panel where the prompt lands as a heading and each step ticks off while a light runs round the edge; Cmd/Ctrl+K focuses it and Esc stops a run.",
    categorySlug: "ai-components",
    tags: ["ai", "copilot", "command bar", "prompt", "input", "chat", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 118,
    createdAt: "2026-05-09",
    animationKinds: ["type", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "placeholder", type: "string", defaultValue: "\"Describe what you need...\"", description: "Placeholder while the field is empty." },
      { name: "suggestions", type: "string[]", defaultValue: "3 prompts", description: "One-tap prompts shown under the field while it is empty (up to three)." },
      { name: "defaultMode", type: "\"ask\" | \"edit\" | \"build\"", defaultValue: "\"build\"", description: "Mode the switcher starts on." },
      { name: "onSubmit", type: "(prompt: string, mode: AiCommandMode) => void", description: "Called with the prompt and mode when the user sends it." },
      { name: "steps", type: "(prompt: string, mode: AiCommandMode) => string[]", description: "Builds the progress steps shown while the copilot works. Defaults to four generic steps." },
      { name: "hotkey", type: "string", defaultValue: "\"k\"", description: "Key that focuses the bar with Cmd or Ctrl. Empty string turns the shortcut off." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types and runs the suggestions in turn until someone touches the bar." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewForgeAiCommandBarRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { AiCommandBar } from "@/components/forge-ai-command-bar";

export default function Page() {
  return (
    <AiCommandBar
      placeholder="Ask the copilot..."
      suggestions={["Add a pricing table", "Make the hero animate in", "Write the FAQ"]}
      steps={(prompt) => ["Reading the project", \`Planning: \${prompt}\`, "Writing 2 files", "Done"]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "gooey-search-input",
    name: "Gooey Search Input",
    registryCliName: "gooey-input",
    description: "A search pill whose icon pinches off into its own bubble through an SVG goo filter when you open it, while the field grows with a springy overshoot. Pass suggestions and the matches drip out of the underside of the field through the same goo, with arrow-key navigation.",
    categorySlug: "motion-effects",
    tags: ["search", "input", "gooey", "svg filter", "autocomplete", "spring", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 112,
    createdAt: "2026-05-13",
    animationKinds: ["spring", "type", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "placeholder", type: "string", defaultValue: "\"Type to search...\"", description: "Placeholder of the open field." },
      { name: "collapsedLabel", type: "string", defaultValue: "\"Search\"", description: "Label on the collapsed pill." },
      { name: "collapsedWidth", type: "number", defaultValue: "115", description: "Width of the pill while collapsed, in px." },
      { name: "expandedWidth", type: "number", defaultValue: "200", description: "Width of the open field, in px." },
      { name: "expandedOffset", type: "number", defaultValue: "56", description: "Room left of the open field for the icon bubble, in px." },
      { name: "gooeyBlur", type: "number", defaultValue: "5", description: "Blur of the goo filter; higher melts the shapes together more." },
      { name: "suggestions", type: "string[]", description: "Words to suggest; up to four matches drip out below while typing." },
      { name: "onSelect", type: "(value: string) => void", description: "Called when a suggestion is picked with a click or Enter." },
      { name: "value", type: "string", description: "Controlled value." },
      { name: "defaultValue", type: "string", defaultValue: "\"\"", description: "Initial value when uncontrolled." },
      { name: "onValueChange", type: "(value: string) => void", description: "Called when the text changes (and with \"\" when the field closes)." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the field opens or closes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens, types a query and closes on a loop until someone touches it." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Dims the pill and ignores input." },
    ],
    Preview: Previews.PreviewGooeySearchInputRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { GooeyInput } from "@/components/gooey-input";

const PAGES = ["Pricing", "Changelog", "Components", "Templates", "Docs", "Blog"];

export default function Page() {
  const router = useRouter();

  return (
    <GooeyInput
      placeholder="Search the site"
      collapsedWidth={120}
      expandedWidth={240}
      suggestions={PAGES}
      onSelect={(page) => router.push(\`/\${page.toLowerCase()}\`)}
    />
  );
}`,
    tailwindSource: tw,
    resourceLinks: [
      { label: "Live demo", href: "/demos/gooey-input" },
    ],
  },
  {
    slug: "terminal",
    name: "Interactive Terminal",
    registryCliName: "terminal",
    description: "A macOS-style terminal window that types a script of commands with human timing, shows a spinner while each runs and prints its output. Then the prompt is yours: click in and type help, ls, echo or any scripted command, with history, Tab completion and Ctrl+C.",
    categorySlug: "motion-effects",
    tags: ["terminal", "cli", "shell", "typewriter", "command line", "interactive", "sound", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 110,
    createdAt: "2026-05-13",
    animationKinds: ["type", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "commands", type: "TerminalCommand[]", defaultValue: "3-command demo", description: "Script typed and run in order: { input, output?, runDelayMs? }. Visitors can run these again by typing them." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Loops the script until someone clicks or types in the terminal, then hands them the prompt." },
      { name: "interactive", type: "boolean", defaultValue: "true", description: "Lets visitors type real commands after the script or their first click." },
      { name: "onCommand", type: "(input: string) => TerminalOutput | void", description: "Answers a typed command. Return lines to print, or nothing to fall back to the built-ins." },
      { name: "theme", type: "\"carbon\" | \"midnight\" | \"paper\"", defaultValue: "\"carbon\"", description: "Window style. Paper is light on light pages and turns dark with the site." },
      { name: "username", type: "string", defaultValue: "\"you\"", description: "Username in the title bar and for whoami." },
      { name: "hostname", type: "string", defaultValue: "\"nexus\"", description: "Hostname in the prompt and title bar." },
      { name: "promptSymbol", type: "string", defaultValue: "\"➜\"", description: "Prompt symbol before each command." },
      { name: "typingSpeed", type: "number", defaultValue: "34", description: "Base typing speed in ms per character." },
      { name: "typingJitter", type: "number", defaultValue: "30", description: "Random extra ms per character." },
      { name: "startupDelay", type: "number", defaultValue: "450", description: "Pause before the script starts, in ms." },
      { name: "delayBetweenCommands", type: "number", defaultValue: "750", description: "Pause after each command, in ms." },
      { name: "autoStart", type: "boolean", defaultValue: "true", description: "Runs the script once when it scrolls into view." },
      { name: "loop", type: "boolean", defaultValue: "false", description: "Repeats the script forever." },
      { name: "loopDelay", type: "number", defaultValue: "1600", description: "Pause between loops, in ms." },
      { name: "showCursor", type: "boolean", defaultValue: "true", description: "Shows the caret." },
      { name: "enableSound", type: "boolean", defaultValue: "true", description: "Plays a key click for every character typed, in sync. It follows the typing sound switch and the site sound switch, so it is silent until a visitor turns sound on. Pass false to silence this terminal." },
      { name: "soundSpriteUrl", type: "string", description: "Your own OGG sprite for the key sounds. Without it the terminal uses the shared typing sound." },
      { name: "soundSpriteConfigUrl", type: "string", description: "JSON timing map for the sprite." },
      { name: "simpleSoundUrl", type: "string", description: "One audio file played on every key instead of a sprite." },
      { name: "showSoundToggle", type: "boolean", defaultValue: "true", description: "Shows the sound button in the title bar." },
      { name: "showControls", type: "boolean", defaultValue: "true", description: "Shows pause, resume and replay in the title bar." },
      { name: "fillHeight", type: "boolean", defaultValue: "false", description: "Fills a parent with a fixed height instead of the default 300px body." },
      { name: "hint", type: "string", defaultValue: "\"Click in and type help.\"", description: "Line under the window. Empty string hides it." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewTerminalRedesign,
    previewShell: "plain",
    previewSections: [
      {
        title: "Carbon",
        Preview: Previews.PreviewTerminalRedesign,
        reactSource: `// src/app/page.tsx

import { Terminal } from "@/components/terminal";

export default function Page() {
  return (
    <Terminal
      autoplay
      commands={[
        { input: "npx shadcn@latest add @nexus-labs/terminal", runDelayMs: 800, output: [{ text: "wrote components/terminal/terminal.tsx", tone: "success" }] },
        { input: "npm run dev", runDelayMs: 600, output: [{ text: "Local: http://localhost:3000", tone: "info" }] },
      ]}
    />
  );
}`,
      },
      {
        title: "Paper",
        Preview: Previews.PreviewTerminalPaperRedesign,
        reactSource: `// src/app/page.tsx

import { Terminal } from "@/components/terminal";

export default function Page() {
  return (
    <Terminal
      theme="paper"
      hint=""
      commands={[{ input: "git push origin main", runDelayMs: 700, output: [{ text: "main -> main", tone: "success" }] }]}
    />
  );
}`,
      },
    ],
    reactSource: `// src/app/page.tsx
"use client";

import { Terminal } from "@/components/terminal";

export default function Page() {
  return (
    <div className="flex h-[420px] flex-col">
      <Terminal
        fillHeight
        className="min-h-0 flex-1"
        username="tushar"
        hostname="nexus"
        commands={[
          { input: "npm install", runDelayMs: 900, output: ["added 182 packages in 3s", { text: "found 0 vulnerabilities", tone: "success" }] },
          { input: "npm run dev", runDelayMs: 600, output: [{ text: "ready on http://localhost:3000", tone: "info" }] },
        ]}
        onCommand={(input) => (input === "deploy" ? [{ text: "live on nexus-ui.com", tone: "success" }] : undefined)}
      />
    </div>
  );
}`,
    tailwindSource: tw,
    resourceLinks: [
      { label: "Live demo", href: "/demos/terminal" },
      { label: "Download sound sprite (sound.ogg)", href: "/sounds/sound.ogg" },
      { label: "Sprite timing map (config.json)", href: "/sounds/config.json" },
    ],
  },
  {
    slug: "squiggly-text",
    name: "RippleLine squiggly text",
    registryCliName: "squiggly-text",
    description: "Text that boils like a stop-motion pencil drawing: an SVG turbulence filter re-rolls its noise every few frames, and an optional hand-drawn underline draws itself in. Sweeping the pointer across it stirs the ink, which jumps with pointer speed and settles back on a spring.",
    categorySlug: "motion-effects",
    tags: ["typography", "svg", "filter", "hand-drawn", "hero", "underline", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 108,
    createdAt: "2026-05-13",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "React.ReactNode", description: "Content to boil. Takes priority over text." },
      { name: "text", type: "string", description: "Convenience text when no children are given." },
      { name: "steps", type: "number", defaultValue: "5", description: "How many noise frames the boil cycles through." },
      { name: "stepDuration", type: "number", defaultValue: "80", description: "Milliseconds each frame is held." },
      { name: "scale", type: "number | readonly [number, number]", defaultValue: "[6, 8]", description: "Resting displacement in px; a pair alternates frame by frame." },
      { name: "baseFrequency", type: "number", defaultValue: "0.02", description: "Noise frequency. Higher gives tighter wiggles." },
      { name: "numOctaves", type: "number", defaultValue: "3", description: "Noise detail, 1 to 5." },
      { name: "stir", type: "number", defaultValue: "0.06", description: "How hard pointer speed stirs the ink. 0 turns it off." },
      { name: "underline", type: "boolean", defaultValue: "false", description: "Adds a hand-drawn squiggle underline that redraws when the pointer enters." },
      { name: "underlineColor", type: "string", description: "Underline colour. Defaults to the accent blue." },
      { name: "as", type: "\"span\" | \"div\"", defaultValue: "\"span\"", description: "Root element of SquigglyText." },
      { name: "className", type: "string", description: "Classes for the root element." },
      { name: "textClassName", type: "string", description: "Classes for the boiling text node." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Stirs the ink and redraws the underline every 2.8s until someone points at it." },
    ],
    Preview: Previews.PreviewSquigglyTextRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SquigglyText, SquigglyWord } from "@/components/squiggly-text";

function HandDrawnHero() {
  return (
    <h1 className="text-center text-5xl font-semibold tracking-tight">
      Interfaces with{" "}
      <SquigglyWord underline scale={[3, 4.5]} className="text-[#0071e3]">
        a little life
      </SquigglyWord>{" "}
      in every line.
    </h1>
  );
}

export default function Page() {
  return (
    <SquigglyText
      text="Sketched, not printed."
      steps={4}
      stepDuration={140}
      scale={[2, 3]}
      textClassName="text-2xl font-semibold"
    />
  );
}`,
    tailwindSource: tw,
    resourceLinks: [
      { label: "Live demo", href: "/demos/squiggly-text" },
      { label: "SVG filters (MDN)", href: "https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence" },
    ],
  },
  {
    slug: "floating-dock",
    name: "Nexus floating dock",
    registryCliName: "floating-dock",
    description: "A macOS-style dock: tiles swell under the pointer and push their neighbours aside on springs, a tooltip names each one, and a click bounces the tile like a launching app before a running dot slides under it. Below md it turns into one glass button that springs the tiles up as a stack.",
    categorySlug: "navbars",
    tags: ["dock", "navigation", "macos", "magnify", "glass", "tooltip", "navbar", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 105,
    createdAt: "2026-05-13",
    animationKinds: ["hover", "press", "spring", "magnetic", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "items", type: "FloatingDockItem[]", description: "Tiles: { title, icon, href, tint?, badge? }. tint is any CSS colour or gradient; with it the icon turns white." },
      { name: "position", type: "\"fixed\" | \"inline\"", defaultValue: "\"fixed\"", description: "fixed pins the dock to the bottom of the viewport; inline renders it where you place it. Both switch to the compact menu below md." },
      { name: "activeHref", type: "string", description: "Href of the item that gets the running dot. Defaults to matching the current pathname." },
      { name: "onSelect", type: "(item: FloatingDockItem) => void", description: "Called with the item when a tile is clicked." },
      { name: "disableLinks", type: "boolean", defaultValue: "false", description: "Render tiles as buttons instead of links, for in-app actions." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps an invisible pointer across the dock and bounces a tile until someone points at it." },
      { name: "desktopClassName", type: "string", description: "Extra classes on the desktop dock wrapper." },
      { name: "mobileClassName", type: "string", description: "Extra classes on the mobile menu wrapper." },
    ],
    Preview: Previews.PreviewFloatingDockRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { BookOpen, Home, LayoutGrid, Search, Settings } from "lucide-react";
import { FloatingDock } from "@/components/floating-dock";

const items = [
  { title: "Home", icon: <Home />, href: "/", tint: "linear-gradient(160deg,#5ac8fa,#0071e3)" },
  { title: "Components", icon: <LayoutGrid />, href: "/components", tint: "linear-gradient(160deg,#bf5af2,#5e5ce6)", badge: 2 },
  { title: "Docs", icon: <BookOpen />, href: "/docs", tint: "linear-gradient(160deg,#ffd60a,#ff9f0a)" },
  { title: "Search", icon: <Search />, href: "/search" },
  { title: "Settings", icon: <Settings />, href: "/settings" },
];

export default function Page() {
  return <FloatingDock items={items} />;
}`,
    tailwindSource: tw,
    resourceLinks: [
      { label: "Live demo", href: "/demos/floating-dock" },
      { label: "Magnified dock pattern (Build UI)", href: "https://buildui.com/recipes/magnified-dock" },
    ],
  },
  {
    slug: "stateful-button",
    name: "Stateful message button",
    registryCliName: "stateful-button",
    description: "A button that shows its own async work: idle, loading, success and error. Pressed it squashes, a light sweeps across while the promise runs and the label rolls with the width springing to fit; success turns it green with a small overshoot pop and a drawn check, failure turns it red and shakes.",
    categorySlug: "motion-effects",
    tags: ["button", "async", "loading", "success", "error", "submit", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 104,
    createdAt: "2026-05-13",
    animationKinds: ["press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "React.ReactNode", description: "Idle label." },
      { name: "onClick", type: "() => Promise<void> | void", description: "Runs on click. Return a promise to show the loading state until it settles; throw to show the error state." },
      { name: "loadingText", type: "string", defaultValue: "\"Loading\"", description: "Label while onClick is pending." },
      { name: "successText", type: "string", defaultValue: "\"Done\"", description: "Label after onClick resolves." },
      { name: "errorText", type: "string", defaultValue: "\"Something went wrong\"", description: "Label after onClick rejects." },
      { name: "resetDelay", type: "number", defaultValue: "1800", description: "How long success or error stays before the button resets, in ms." },
      { name: "showSuccess", type: "boolean", defaultValue: "true", description: "Show the success state; otherwise go straight back to idle." },
      { name: "variant", type: "\"default\" | \"outline\" | \"ghost\" | \"destructive\"", defaultValue: "\"default\"", description: "Visual style of the idle and loading states." },
      { name: "size", type: "\"sm\" | \"md\" | \"lg\"", defaultValue: "\"md\"", description: "Height, padding and text size." },
      { name: "icon", type: "React.ReactNode", description: "Icon before the idle label." },
      { name: "successIcon", type: "React.ReactNode", description: "Replaces the drawn check." },
      { name: "errorIcon", type: "React.ReactNode", description: "Replaces the drawn alert." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Loops through loading and success (without calling onClick) until someone presses it." },
    ],
    Preview: Previews.PreviewStatefulButtonRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { StatefulButton } from "@/components/stateful-button";

async function publish() {
  const res = await fetch("/api/posts/42/publish", { method: "POST" });
  if (!res.ok) throw new Error("Publish failed");
}

export default function Page() {
  return (
    <StatefulButton onClick={publish} loadingText="Publishing" successText="Published" errorText="Try again">
      Publish post
    </StatefulButton>
  );
}`,
    tailwindSource: tw,
    resourceLinks: [
      { label: "Live demo", href: "/demos/stateful-button" },
      { label: "Live demo", href: "/demos/stateful-button" },
    ],
  },
  {
    slug: "sparkles",
    name: "Sparkles field",
    registryCliName: "sparkles",
    description: "A canvas layer of sparkles that pop in with a small overshoot, turn as they shine, drift and fade, then reappear elsewhere. With interactive on, the pointer leaves a sparkling trail and a click throws a burst that arcs down under gravity.",
    categorySlug: "motion-effects",
    tags: ["sparkles", "particles", "canvas", "stars", "glitter", "background", "motion kit"],
    premium: false,
    trendingScore: 103,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "count", type: "number", defaultValue: "36", description: "Base number of sparkles, before density scales it." },
      { name: "color", type: "string", description: "Sparkle colour. Defaults to blue on light, ice white on dark." },
      { name: "minSize", type: "number", defaultValue: "0.9", description: "Smallest sparkle radius in px." },
      { name: "maxSize", type: "number", defaultValue: "2.8", description: "Largest sparkle radius in px. The biggest fifth are drawn as four-point stars." },
      { name: "speed", type: "number", defaultValue: "1", description: "Speed multiplier for twinkling and drift." },
      { name: "opacity", type: "number", defaultValue: "0.9", description: "Overall opacity, 0.1 to 1." },
      { name: "className", type: "string", description: "Classes for layout and masking." },
      { name: "background", type: "boolean", defaultValue: "false", description: "Mount as an absolute layer filling the parent." },
      { name: "density", type: "\"low\" | \"medium\" | \"high\"", defaultValue: "\"medium\"", description: "Density preset that scales count." },
      { name: "direction", type: "\"up\" | \"down\" | \"random\"", defaultValue: "\"random\"", description: "Which way sparkles drift while they shine." },
      { name: "enableGlow", type: "boolean", defaultValue: "true", description: "Soft bloom round each sparkle." },
      { name: "interactive", type: "boolean", defaultValue: "false", description: "Pointer trail and click bursts." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Throws a few bursts until someone touches the layer." },
    ],
    Preview: Previews.PreviewSparklesRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { Sparkles } from "@/components/sparkles";

export default function Page() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white px-6 py-16 text-center dark:bg-[#1c1c1e]">
      <h2 className="text-6xl font-semibold tracking-[-0.05em] text-[#1d1d1f] dark:text-[#f5f5f7]">Nexus</h2>
      <div className="relative mx-auto mt-4 h-28 max-w-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0a84ff] to-transparent" />
        <Sparkles
          background
          count={120}
          density="high"
          maxSize={1.8}
          direction="down"
          className="[mask-image:radial-gradient(60%_90%_at_50%_0%,#000,transparent)]"
        />
      </div>
    </div>
  );
}`,
    tailwindSource: tw,
    resourceLinks: [
      { label: "Live demo", href: "/demos/sparkles" },
      { label: "Live demo", href: "/demos/sparkles" },
    ],
  },
  {
    slug: "text-generate-effect",
    name: "Text Generate Effect",
    registryCliName: "text-generate-effect",
    description: "Text that streams in like a model writing it: each word, character or line springs up out of a blur on its own beat and overshoots a hair before settling. A glowing caret rides on the newest token while it generates.",
    categorySlug: "motion-effects",
    tags: ["text", "reveal", "ai", "streaming", "blur", "stagger", "typography", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 102,
    createdAt: "2026-05-14",
    animationKinds: ["spring", "scroll"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", description: "The text to stream in. Use \\n for line breaks (and as the separator in line mode)." },
      { name: "mode", type: "\"word\" | \"character\" | \"line\"", defaultValue: "\"word\"", description: "What arrives on each beat. Character mode never breaks inside a word." },
      { name: "delay", type: "number", defaultValue: "0", description: "Seconds before the first token arrives." },
      { name: "duration", type: "number", defaultValue: "0.48", description: "Seconds each token takes to settle; sets the spring's speed." },
      { name: "stagger", type: "number", defaultValue: "0.06", description: "Seconds between tokens." },
      { name: "blur", type: "boolean", defaultValue: "true", description: "Tokens arrive out of a blur." },
      { name: "lift", type: "boolean", defaultValue: "true", description: "Tokens rise into place with a small overshoot." },
      { name: "showCaret", type: "boolean", defaultValue: "true", description: "Glowing caret that rides on the newest token while text streams in." },
      { name: "trigger", type: "\"mount\" | \"viewport\"", defaultValue: "\"mount\"", description: "Start on mount, or when the text scrolls into view." },
      { name: "once", type: "boolean", defaultValue: "true", description: "With the viewport trigger, play once or every time it enters view." },
      { name: "replayKey", type: "string | number", description: "Change it to replay the effect." },
      { name: "as", type: "\"p\" | \"h1\" | \"h2\" | \"span\" | \"div\"", defaultValue: "\"p\"", description: "Root element." },
      { name: "className", type: "string", description: "Classes for the root element." },
      { name: "onComplete", type: "() => void", description: "Called when the last token has arrived." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Dissolves and regenerates every few seconds until someone clicks or taps the text." },
    ],
    Preview: Previews.PreviewTextGenerateEffectRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TextGenerateEffect } from "@/components/text-generate-effect";

function AnswerCard({ answer }: { answer: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <TextGenerateEffect
        key={answer}
        text={answer}
        stagger={0.05}
        className="text-xl font-semibold leading-snug tracking-tight"
      />
    </div>
  );
}

export default function Page() {
  return (
    <TextGenerateEffect
      as="h1"
      mode="character"
      stagger={0.02}
      trigger="viewport"
      text="Build interfaces that feel alive."
      className="text-5xl font-semibold tracking-tight"
    />
  );
}`,
    tailwindSource: tw,
    resourceLinks: [
      { label: "Live demo", href: "/demos/text-generate-effect" },
      { label: "Live demo", href: "/demos/text-generate-effect" },
    ],
  },
  {
    slug: "background-gradient",
    name: "Background Gradient",
    registryCliName: "background-gradient",
    description: "Wraps a card or button in a slowly turning conic-gradient ring with a soft glow underneath. Hover and the ring spins up while its centre leans toward the pointer; press and the card squashes, springs back past its size and the glow flashes.",
    categorySlug: "background-effects",
    tags: ["gradient", "border", "glow", "card", "button", "conic", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 101,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "press", "spring", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "ReactNode", description: "Content inside the ring." },
      { name: "className", type: "string", description: "Classes for the outer wrapper (width, layout)." },
      { name: "containerClassName", type: "string", description: "Classes for the content wrapper; put padding here." },
      { name: "surfaceClassName", type: "string", description: "Classes for the inner surface. White, or #1c1c1e in dark mode, by default." },
      { name: "colors", type: "string[]", defaultValue: "[\"#0a84ff\", \"#5e5ce6\", \"#bf5af2\", \"#ff375f\", \"#ff9f0a\"]", description: "Ring colours in order round the edge. Two or more." },
      { name: "animationSpeed", type: "number", defaultValue: "1", description: "Spin speed multiplier, 0.2 to 3." },
      { name: "blur", type: "number", defaultValue: "24", description: "Blur of the glow under the card, in px." },
      { name: "borderRadius", type: "string", defaultValue: "\"24px\"", description: "Corner radius of the wrapper." },
      { name: "ringWidth", type: "number", defaultValue: "1.5", description: "Thickness of the gradient ring, in px." },
      { name: "as", type: "\"div\" | \"button\" | \"section\"", defaultValue: "\"div\"", description: "Root element. \"button\" adds keyboard focus and press feedback." },
      { name: "interactive", type: "boolean", defaultValue: "true", description: "Spin up and lean toward the pointer on hover, squash on press." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Disables the button variant." },
      { name: "onClick", type: "() => void", description: "Click handler for the button variant." },
      { name: "aria-label", type: "string", description: "Accessible name for the button variant when its content is not plain text." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Circles a pretend pointer round the card until someone hovers it." },
    ],
    Preview: Previews.PreviewBackgroundGradientRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { BackgroundGradient } from "@/components/background-gradient";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-6">
      <BackgroundGradient className="w-full max-w-[320px]" containerClassName="p-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6e6e73] dark:text-[#a1a1a6]">Pro</p>
        <p className="mt-2 text-4xl font-semibold tracking-[-0.045em] tabular-nums">$18 / month</p>
        <p className="mt-3 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Unlimited projects, team seats and priority builds.</p>
      </BackgroundGradient>
      <BackgroundGradient as="button" borderRadius="999px" containerClassName="px-6 py-3 text-[15px] font-semibold">
        Upgrade now
      </BackgroundGradient>
    </div>
  );
}`,
    tailwindSource: tw,
    resourceLinks: [{ label: "Live demo", href: "/demos/background-gradient" }],
  },
  {
    slug: "typewriter-effect",
    name: "Typewriter Effect",
    registryCliName: "typewriter-effect",
    description: "A typewriter with a physical caret: each new character drops in and settles on a spring, the caret stretches on every keystroke and squashes on every delete, and it only blinks while it waits. Type one phrase, rotate through a list, or loop forever.",
    categorySlug: "motion-effects",
    tags: ["typing", "typewriter", "cursor", "caret", "hero", "loop", "text", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 104,
    createdAt: "2026-05-14",
    animationKinds: ["type", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string | string[]", description: "One phrase, or a list typed one after another." },
      { name: "typingSpeed", type: "number", defaultValue: "65", description: "Milliseconds per typed character, with a little human jitter." },
      { name: "deletingSpeed", type: "number", defaultValue: "42", description: "Milliseconds per deleted character. 0 swaps straight to the next phrase." },
      { name: "delay", type: "number", defaultValue: "0", description: "Milliseconds before the first character." },
      { name: "pauseDuration", type: "number", defaultValue: "1200", description: "Milliseconds a finished phrase is held." },
      { name: "loop", type: "boolean", defaultValue: "false", description: "Starts again from the first phrase after the last one." },
      { name: "showCursor", type: "boolean", defaultValue: "true", description: "Shows the caret." },
      { name: "cursorClassName", type: "string", description: "Classes for the caret; it uses the text colour by default." },
      { name: "as", type: "\"h1\" | \"h2\" | \"p\" | \"span\" | \"div\"", defaultValue: "\"span\"", description: "Root element." },
      { name: "className", type: "string", description: "Classes for the root element." },
      { name: "onComplete", type: "() => void", description: "Called each time the last phrase finishes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Loops until someone clicks or taps the text, then stops after the current phrase." },
    ],
    Preview: Previews.PreviewTypewriterEffectRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TypewriterEffect } from "@/components/typewriter-effect";

function Hero() {
  return (
    <h1 className="text-5xl font-semibold tracking-tight">
      Made for{" "}
      <TypewriterEffect
        text={["designers.", "engineers.", "founders.", "everyone."]}
        loop
        pauseDuration={1300}
        className="text-[#0071e3]"
      />
    </h1>
  );
}

export default function Page() {
  return (
    <label className="flex h-12 items-center gap-2 rounded-full bg-white px-4 shadow-sm">
      <span className="text-zinc-500">
        Search <TypewriterEffect text={["quarterly report", "flights to Lisbon"]} loop deletingSpeed={26} />
      </span>
    </label>
  );
}`,
    tailwindSource: tw,
    resourceLinks: [
      { label: "Live demo", href: "/demos/typewriter-effect" },
      { label: "Live demo", href: "/demos/typewriter-effect" },
    ],
  },
  {
    slug: "text-reveal-card",
    name: "Text Reveal Card",
    registryCliName: "text-reveal-card",
    description: "A card where you scrub a divider across one sentence to swap it for another. The divider follows the pointer on a spring, leans into the direction you move and swings upright when you stop, sheds sparks from the seam, and bounces home when you leave.",
    categorySlug: "cards",
    tags: ["card", "reveal", "scrub", "hover", "text", "sparkles", "portfolio", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 105,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", defaultValue: "\"Most teams ship on a hunch.\"", description: "The sentence you see before scrubbing." },
      { name: "revealContent", type: "React.ReactNode", defaultValue: "\"Yours will ship on proof.\"", description: "What the scrub reveals. A string gets the blue-to-purple gradient." },
      { name: "title", type: "string", description: "Small heading above the reveal area." },
      { name: "description", type: "string", defaultValue: "\"Drag across the line, or use the arrow keys.\"", description: "One-line hint under the reveal area." },
      { name: "icon", type: "React.ReactNode", description: "Icon next to the title." },
      { name: "image", type: "string", description: "Optional image URL above the card body. Nothing is fetched unless you pass one." },
      { name: "children", type: "React.ReactNode", description: "Extra content at the bottom of the card." },
      { name: "intensity", type: "number", defaultValue: "1", description: "Spark amount, 0.5 to 2.2." },
      { name: "className", type: "string", description: "Classes for the card." },
      { name: "revealClassName", type: "string", description: "Classes for the reveal area." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Shows the revealed sentence and turns the interaction off." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps the divider across and back every few seconds until someone touches the card." },
    ],
    Preview: Previews.PreviewTextRevealCardRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TextRevealCard } from "@/components/text-reveal-card";

export default function Page() {
  return (
    <TextRevealCard
      title="Launch review"
      text="Most teams ship on a hunch."
      revealContent="Yours will ship on proof."
      intensity={1.3}
    />
  );
}`,
    tailwindSource: tw,
    resourceLinks: [
      { label: "Live demo", href: "/demos/text-reveal-card" },
      { label: "Live demo", href: "/demos/text-reveal-card" },
    ],
  },
  {
    slug: "glowing-effect-cards",
    name: "Glowing Effect Cards",
    registryCliName: "glowing-effect-cards",
    description: "Cards wrapped in a hairline rim that lights up on the side nearest the pointer: the lit arc chases the pointer round the edge on a spring, neighbouring cards catch the light as the pointer nears them, and a press flares it. Ships as GlowingEffect (wrap anything), GlowingCard (icon, title, line, call to action) and GlowingCardsLayout (a 2-1-2 grid that stacks by container width). Also includes Lit Border: A wrapper for any element: <LitBorder> draws a thin border whose light band turns to face the pointer and brightens as it gets closer. Put several inside <LightGroup> and they share one light, shown here on pricing cards and a search field.",
    categorySlug: "cards",
    tags: ["glow", "cards", "cursor", "border", "bento", "feature grid", "hover", "container queries", "motion kit", "framer-motion", "lit border"],
    premium: false,
    trendingScore: 111,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "press", "spring", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "GlowingCardProps[]", defaultValue: "DEFAULT_GLOW_CARDS", description: "GlowingCardsLayout: five cards, two left, one tall centre, two right." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "GlowingCardsLayout: sweeps a light across the cards until someone moves over them." },
      { name: "hint", type: "string", defaultValue: "\"Move across the cards.\"", description: "GlowingCardsLayout: caption above the grid. An empty string hides it." },
      { name: "title / description", type: "string", description: "GlowingCard: heading and one line of copy." },
      { name: "icon", type: "ReactNode", description: "GlowingCard: icon in the tinted tile." },
      { name: "accent", type: "string", defaultValue: "\"#0071e3\"", description: "GlowingCard: tint for the icon tile and call to action." },
      { name: "cta / href", type: "string", description: "GlowingCard: call-to-action label, and a link that makes the whole card clickable." },
      { name: "tall", type: "boolean", defaultValue: "false", description: "GlowingCard: spreads the content for a tall card." },
      { name: "colors", type: "string[]", defaultValue: "[\"#5ac8fa\", \"#0a84ff\", \"#bf5af2\", \"#ff375f\", \"#ff9f0a\"]", description: "GlowingEffect: colours along the lit arc, tail to head (glowColor sets just the first)." },
      { name: "spread", type: "number", defaultValue: "90", description: "GlowingEffect: width of the lit arc in degrees." },
      { name: "proximity", type: "number", defaultValue: "72", description: "GlowingEffect: how far outside the card the pointer still lights it, in px." },
      { name: "intensity", type: "number", defaultValue: "1", description: "GlowingEffect: rim thickness and brightness (0.5 to 2)." },
      { name: "blur", type: "number", defaultValue: "18", description: "GlowingEffect: blur of the bloom outside the rim, in px." },
      { name: "borderRadius", type: "string", defaultValue: "\"22px\"", description: "GlowingEffect: corner radius." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "GlowingEffect: turns the light off." },
      { name: "LitBorder.children", type: "React.ReactNode", description: "Lit Border: the element to wrap. A card, an input, a button, anything." },
      { name: "LitBorder.radius", type: "number", defaultValue: "24", description: "Lit Border: outer corner radius in px. Use 999 for pills." },
      { name: "LitBorder.width", type: "number", defaultValue: "1.5", description: "Lit Border: border thickness in px." },
      { name: "LitBorder.colors", type: "[string, string, string]", defaultValue: "[\"0,113,227\", \"94,92,230\", \"48,209,88\"]", description: "Lit Border: three RGB triplets for the lit arc, head, middle and tail." },
      { name: "LitBorder.className", type: "string", description: "Lit Border: extra classes for the outer frame, for example h-full in a grid." },
      { name: "LightGroup.children", type: "React.ReactNode", description: "Light Group: the elements that share one light, usually several LitBorders." },
      { name: "LightGroup.autoplay", type: "boolean", defaultValue: "false", description: "Light Group: the light circles the group on its own until the first real pointer arrives. Never runs under reduced motion." },
      { name: "LightGroup.className", type: "string", description: "Light Group: extra classes for the wrapper." },
    ],
    Preview: Previews.PreviewGlowingEffectCardsRedesign,
    previewShell: "plain",
    previewSections: [
      {
        title: "2-1-2 layout",
        Preview: Previews.PreviewGlowingEffectCardsRedesign,
        reactSource: `// src/app/page.tsx

import { GlowingCardsLayout } from "@/components/glowing-effect-cards";

export default function Page() {
  return (
    <GlowingCardsLayout
      cards={[
        { title: "Instant deploys", description: "Push and it is live.", accent: "#0071e3", cta: "Docs", href: "/docs" },
        { title: "Analytics", description: "Every visit, no cookies.", accent: "#bf5af2", cta: "Explore" },
        { title: "Edge network", description: "Served from 28 regions, close to every visitor.", accent: "#ff9f0a", cta: "See regions" },
        { title: "Access control", description: "Roles and SSO built in.", accent: "#30b65a", cta: "Security" },
        { title: "Integrations", description: "Connect the tools you use.", accent: "#ff375f", cta: "Browse" },
      ]}
    />
  );
}`,
      },
      {
        title: "Single card and custom wrapper",
        Preview: Previews.PreviewGlowingCardSingleRedesign,
        reactSource: `// src/app/page.tsx

import { GlowingCard, GlowingEffect } from "@/components/glowing-effect-cards";

export default function Page() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <GlowingCard
        title="Cursor-reactive rim"
        description="The light follows your pointer round the edge and flares when you press."
        accent="#bf5af2"
        cta="Open details"
        glow={{ colors: ["#64d2ff", "#bf5af2", "#ff375f"], spread: 120, intensity: 1.4 }}
      />
      <GlowingEffect colors={["#30d158", "#64d2ff"]} borderRadius="16px">
        <div className="p-6">
          <h3 className="text-[16px] font-semibold">Any content</h3>
          <p className="mt-1 text-[13px] text-[#6e6e73]">Wrap your own markup in GlowingEffect.</p>
        </div>
      </GlowingEffect>
    </div>
  );
}`,
      },
      {
        title: "Lit Border",
        Preview: Previews.PreviewLitBorder,
        reactSource: `// src/app/page.tsx

import { LightGroup, LitBorder } from "@/components/glowing-effect-cards";

const plans = [
  { name: "Starter", price: "$0" },
  { name: "Studio", price: "$19" },
  { name: "Scale", price: "$49" },
];

export default function Page() {
  return (
    <LightGroup autoplay className="flex w-full max-w-[720px] flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {plans.map((plan) => (
          <LitBorder key={plan.name} className="h-full">
            <div className="p-5">
              <h3 className="m-0 text-[15px] font-semibold">{plan.name}</h3>
              <p className="m-0 mt-2 text-[32px] font-semibold">{plan.price}</p>
            </div>
          </LitBorder>
        ))}
      </div>
      <LitBorder radius={999}>
        <input aria-label="Search plans" placeholder="Search plans" className="h-12 w-full rounded-full bg-transparent px-5 outline-none" />
      </LitBorder>
    </LightGroup>
  );
}`,
      },
    ],
    reactSource: `// src/app/page.tsx

import { GlowingCardsLayout } from "@/components/glowing-effect-cards";

export default function Page() {
  return (
    <GlowingCardsLayout
      cards={[
        { title: "Instant deploys", description: "Push and it is live.", accent: "#0071e3", cta: "Docs", href: "/docs" },
        { title: "Analytics", description: "Every visit, no cookies.", accent: "#bf5af2", cta: "Explore" },
        { title: "Edge network", description: "Served from 28 regions, close to every visitor.", accent: "#ff9f0a", cta: "See regions" },
        { title: "Access control", description: "Roles and SSO built in.", accent: "#30b65a", cta: "Security" },
        { title: "Integrations", description: "Connect the tools you use.", accent: "#ff375f", cta: "Browse" },
      ]}
    />
  );
}`,
    tailwindSource: tw,
    resourceLinks: [{ label: "Live demo", href: "/demos/glowing-effect-cards" }],
  },
  {
    slug: "infinite-moving-cards",
    name: "Infinite Moving Cards",
    registryCliName: "infinite-moving-cards",
    description: "A belt of cards that cruises sideways forever and fades out at the edges. Hover and it eases to a stop; grab it and fling, and it coasts on your throw, leaning into the speed, before it settles back to cruising.",
    categorySlug: "motion-effects",
    tags: ["marquee", "carousel", "testimonials", "logos", "cards", "drag", "fling", "infinite", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 109,
    createdAt: "2026-05-14",
    animationKinds: ["drag", "hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "InfiniteMovingCardItem[]", description: "Cards: { id?, title?, description?, image?, avatar?, name?, role?, rating?, tags? }." },
      { name: "direction", type: "\"left\" | \"right\"", defaultValue: "\"left\"", description: "Which way the belt cruises." },
      { name: "speed", type: "\"slow\" | \"normal\" | \"fast\"", defaultValue: "\"normal\"", description: "Cruise speed preset." },
      { name: "pauseOnHover", type: "boolean", defaultValue: "true", description: "Ease to a stop while hovered or focused." },
      { name: "draggable", type: "boolean", defaultValue: "true", description: "Let people grab the belt and fling it." },
      { name: "gap", type: "number", defaultValue: "16", description: "Space between cards in px." },
      { name: "loop", type: "boolean", defaultValue: "true", description: "Repeat the items so the belt never runs out." },
      { name: "showGradientMask", type: "boolean", defaultValue: "true", description: "Fade the cards out at the left and right edges (a mask, so it works on any background)." },
      { name: "renderItem", type: "(item, index) => ReactNode", description: "Draw your own card." },
      { name: "cardClassName", type: "string", description: "Classes for each card's wrapper, e.g. a width." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Flings the belt back and forth every few seconds until someone touches it." },
      { name: "className", type: "string", description: "Classes for the root." },
    ],
    Preview: Previews.PreviewInfiniteMovingCardsRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { InfiniteMovingCards } from "@/components/infinite-moving-cards";

const reviews = [
  { id: 1, title: "Launch week, sorted", description: "We rebuilt the landing page in two days.", name: "Ariana Shaw", role: "Product lead, Orbitstack", rating: 5 },
  { id: 2, title: "Smooth on every screen", description: "The loop never jumps, even on huge monitors.", name: "Marcus Lee", role: "Frontend, Sprintops", rating: 5 },
  { id: 3, title: "People play with it", description: "Visitors fling the reviews. Time on page went up.", name: "Lena Okafor", role: "Design manager, Cloudframe", rating: 5 },
];

export default function Page() {
  return (
    <div className="space-y-4 py-16">
      <InfiniteMovingCards items={reviews} speed="slow" />
      <InfiniteMovingCards items={reviews} direction="right" cardClassName="w-72" />
    </div>
  );
}`,
    tailwindSource: tw,
    resourceLinks: [{ label: "Live demo", href: "/demos/infinite-moving-cards" }],
  },
  {
    slug: "meteors",
    name: "Meteor Effect",
    registryCliName: "meteors",
    description: "A canvas layer of meteors that burn in, pick up speed and leave tapering trails across whatever sits behind it. The pointer bends passing meteors toward it, and a click calls one down to strike that spot in a ring of sparks.",
    categorySlug: "background-effects",
    tags: ["background", "meteors", "night sky", "canvas", "particles", "shooting stars", "motion kit"],
    premium: false,
    trendingScore: 106,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "number", type: "number", defaultValue: "18", description: "Base number of meteors in the air, before intensity scales it." },
      { name: "className", type: "string", description: "Classes for the root. Use \"absolute inset-0\" to lay it behind content." },
      { name: "meteorClassName", type: "string", description: "Classes for the canvas the meteors are drawn on." },
      { name: "minDelay", type: "number", defaultValue: "0.12", description: "Shortest wait before a meteor reappears, in seconds." },
      { name: "maxDelay", type: "number", defaultValue: "2.4", description: "Longest wait before a meteor reappears, in seconds." },
      { name: "minDuration", type: "number", defaultValue: "3.2", description: "Fastest crossing, in seconds." },
      { name: "maxDuration", type: "number", defaultValue: "7.2", description: "Slowest crossing, in seconds." },
      { name: "angle", type: "number", defaultValue: "215", description: "Direction of travel in degrees, counter-clockwise from pointing right. 215 heads down and to the left." },
      { name: "glow", type: "boolean", defaultValue: "true", description: "Bloom round the heads and the impact flash." },
      { name: "color", type: "string", defaultValue: "\"#cfe6ff\"", description: "Meteor colour. Any CSS colour, including CSS variables." },
      { name: "intensity", type: "\"low\" | \"medium\" | \"high\"", defaultValue: "\"medium\"", description: "Density preset that scales number." },
      { name: "hoverOnly", type: "boolean", defaultValue: "false", description: "Only spawn meteors while the pointer is over the container." },
      { name: "interactive", type: "boolean", defaultValue: "true", description: "Pointer gravity bends passing meteors; a click calls one down." },
      { name: "stars", type: "number", defaultValue: "0", description: "Faint twinkling background stars drawn behind the meteors." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Calls meteors down on a few spots until someone clicks." },
      { name: "children", type: "ReactNode", description: "Content drawn above the sky." },
    ],
    Preview: Previews.PreviewMeteorsRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { Meteors } from "@/components/meteors";

export default function Page() {
  return (
    <Meteors
      number={22}
      stars={70}
      className="flex h-[360px] items-center justify-center rounded-3xl bg-[radial-gradient(120%_90%_at_50%_0%,#13204a,#060a18_55%,#03050c)]"
    >
      <div className="pointer-events-none text-center text-white">
        <h2 className="text-4xl font-semibold tracking-[-0.045em]">Make a wish.</h2>
        <p className="mt-3 text-[13px] text-white/65">Click the sky to call one down.</p>
      </div>
    </Meteors>
  );
}`,
    tailwindSource: tw,
    resourceLinks: [{ label: "Live demo", href: "/demos/meteors" }],
  },
  {
    slug: "background-boxes",
    name: "Background Boxes",
    registryCliName: "background-boxes",
    description: "An isometric grid drawn on canvas, set at any skew, scale and rotation. The cell under the pointer pops up like a key in one of the hover colours, overshoots and settles, while a ripple nudges the cells around it.",
    categorySlug: "background-effects",
    tags: ["background", "grid", "isometric", "boxes", "canvas", "3d", "hover", "motion kit"],
    premium: false,
    trendingScore: 103,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "spring", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "rows", type: "number", defaultValue: "60", description: "Number of rows in the grid." },
      { name: "cols", type: "number", defaultValue: "60", description: "Number of columns in the grid." },
      { name: "boxWidth", type: "number", defaultValue: "64", description: "Width of one cell before the transform, in px." },
      { name: "boxHeight", type: "number", defaultValue: "32", description: "Height of one cell before the transform, in px." },
      { name: "borderColor", type: "string", description: "Grid line colour. Defaults to a hairline that suits the theme." },
      { name: "borderWidth", type: "number", defaultValue: "1", description: "Grid line width in px." },
      { name: "showCrosses", type: "boolean", defaultValue: "true", description: "Small plus marks at every other intersection." },
      { name: "crossColor", type: "string", description: "Colour of the plus marks. Defaults to a theme-aware grey." },
      { name: "hoverColors", type: "string[]", defaultValue: "7 system colours", description: "Colours a cell can light up in when it pops." },
      { name: "skewX", type: "number", defaultValue: "-48", description: "CSS-style skewX of the grid, in degrees." },
      { name: "skewY", type: "number", defaultValue: "14", description: "CSS-style skewY of the grid, in degrees." },
      { name: "scale", type: "number", defaultValue: "0.675", description: "Scale of the grid." },
      { name: "rotation", type: "number", defaultValue: "0", description: "Rotation of the grid, in degrees." },
      { name: "translateX", type: "number", defaultValue: "0", description: "Pans the grid sideways by a percentage of the container width." },
      { name: "translateY", type: "number", defaultValue: "0", description: "Pans the grid vertically by a percentage of the container height." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Runs a pretend pointer across the grid until someone moves over it." },
      { name: "children", type: "ReactNode", description: "Content drawn above the grid." },
      { name: "className", type: "string", description: "Classes for the root (size, background, radius)." },
    ],
    Preview: Previews.PreviewBackgroundBoxesRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { BackgroundBoxes } from "@/components/background-boxes";

export default function Page() {
  return (
    <BackgroundBoxes className="h-[520px] w-full rounded-3xl bg-white dark:bg-[#0b0b0d]">
      <div className="pointer-events-none flex h-full flex-col items-center justify-center text-center">
        <h1 className="text-5xl font-semibold tracking-[-0.045em] text-[#1d1d1f] dark:text-[#f5f5f7]">Every cell is a key.</h1>
        <p className="mt-3 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Run the pointer across the grid.</p>
      </div>
    </BackgroundBoxes>
  );
}`,
    tailwindSource: tw,
    resourceLinks: [{ label: "Live demo", href: "/demos/background-boxes" }],
  },
  {
    slug: "encrypted-text",
    name: "Encrypted Text",
    registryCliName: "encrypted-text",
    description: "Text that decodes itself: every character shuffles through a charset in a fixed-width cell so the line never jitters, then a lock wave runs left to right and each character drops into place with a spring pop. Start it on load, on hover, on click or when it scrolls into view, and loop it if you like.",
    categorySlug: "motion-effects",
    tags: ["text", "decode", "scramble", "reveal", "cyber", "hacker", "hover", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 91,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "press", "scroll", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", description: "The string that ends up on screen." },
      { name: "trigger", type: "\"load\" | \"hover\" | \"viewport\" | \"click\"", defaultValue: "\"load\"", description: "What starts the decode. Load and viewport start scrambled." },
      { name: "speed", type: "number", defaultValue: "50", description: "Milliseconds between one character locking and the next." },
      { name: "shuffleSpeed", type: "number", defaultValue: "35", description: "Milliseconds between scramble ticks." },
      { name: "iterations", type: "number", defaultValue: "8", description: "Scramble ticks before the first character locks." },
      { name: "revealDelay", type: "number", defaultValue: "0", description: "Milliseconds before the decode starts." },
      { name: "characters", type: "string", description: "Characters used while scrambling." },
      { name: "loop", type: "boolean", defaultValue: "false", description: "Scrambles and decodes again after loopDelay." },
      { name: "loopDelay", type: "number", defaultValue: "2000", description: "Milliseconds between loops." },
      { name: "scrambleClassName", type: "string", description: "Classes for the scrambling glyphs. Defaults to the accent blue." },
      { name: "as", type: "\"span\" | \"p\" | \"h1\" | \"h2\" | \"h3\" | \"div\"", defaultValue: "\"span\"", description: "Root element." },
      { name: "onComplete", type: "() => void", description: "Called each time every character has locked in." },
      { name: "className", type: "string", description: "Classes for the root element. It is monospaced by default; pass font-sans to change that." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Replays the decode every loopDelay ms until someone hovers, focuses or clicks it." },
    ],
    Preview: Previews.PreviewEncryptedTextRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { EncryptedText } from "@/components/encrypted-text";

function VaultTitle() {
  return (
    <EncryptedText
      as="h2"
      text="ACCESS GRANTED"
      trigger="viewport"
      speed={55}
      iterations={9}
      className="text-4xl font-semibold tracking-wide"
    />
  );
}

export default function Page() {
  return (
    <button className="rounded-full bg-[#1d1d1f] px-5 py-2.5 text-sm font-medium text-white">
      <EncryptedText text="Get started" trigger="hover" speed={35} iterations={4} className="font-sans" scrambleClassName="text-white/60" />
    </button>
  );
}`,
    tailwindSource: tw,
    resourceLinks: [{ label: "Live demo", href: "/demos/encrypted-text" }],
  },
  {
    slug: "mac-keyboard",
    name: "Mac Keyboard",
    registryCliName: "mac-keyboard",
    description: "A Mac keyboard drawn in HTML, in silver or space grey. Press a key and it sinks, squashes and springs back while a ring of backlight spreads out from it through the gaps; it can listen to the real keyboard, plays a recorded mechanical click for each key the instant it goes down, and shows what you type in a strip above.",
    categorySlug: "motion-effects",
    tags: ["keyboard", "mac", "keys", "typing", "sound", "key click", "mechanical keyboard", "web audio", "interactive", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 95,
    createdAt: "2026-05-14",
    animationKinds: ["press", "spring", "type"],
    dependencies: ["framer-motion"],
    props: [
      { name: "layout", type: "\"mac\" | \"compact\"", defaultValue: "\"mac\"", description: "Full layout with the Esc and F-key row, or compact without it." },
      { name: "theme", type: "\"dark\" | \"light\" | \"auto\"", defaultValue: "\"auto\"", description: "Space grey, silver, or follow the page's dark class." },
      { name: "listen", type: "boolean", defaultValue: "false", description: "Reacts to the real keyboard: keys sink, ripple, click and type. With several listening keyboards on a page, only one answers: the last one pressed or hovered, else the one nearest the middle of the screen." },
      { name: "showOutput", type: "boolean", defaultValue: "true", description: "Shows a strip above the keys with what has been typed. Return clears it." },
      { name: "placeholder", type: "string", defaultValue: "\"Start typing...\"", description: "Text in the strip before anything is typed." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types autoplayText on the keys again and again until someone presses a key." },
      { name: "autoplayText", type: "string", defaultValue: "\"hello, nexus\"", description: "What the demo types." },
      { name: "accent", type: "string", defaultValue: "\"#0a84ff\"", description: "Colour of the backlight ripple." },
      { name: "enableSound", type: "boolean", defaultValue: "true", description: "Plays a key click the moment a key goes down (not during autoplay)." },
      { name: "soundSrc", type: "string", defaultValue: "\"/sounds/keys.ogg\"", description: "Recorded Cherry MX clicks, one per key. Put keys.ogg in public/sounds; until it loads, or if it is missing, the synthesised click plays. Pass \"\" to always synthesise." },
      { name: "soundType", type: "\"mechanical\" | \"soft\" | \"clicky\"", defaultValue: "\"mechanical\"", description: "Timbre of the synthesised click (used when there is no recording)." },
      { name: "volume", type: "number", defaultValue: "0.6", description: "Click volume, 0 to 1." },
      { name: "showFunctionRow", type: "boolean", defaultValue: "true", description: "Shows the Esc and F-key row (mac layout)." },
      { name: "activeKeys", type: "string[]", defaultValue: "[]", description: "KeyboardEvent.code values to show as held, e.g. from usePhysicalKeyboard()." },
      { name: "onKeyPress", type: "(key: KeyDef) => void", description: "Fires when a key on screen is pressed." },
      { name: "className", type: "string", description: "Extra classes on the keyboard body." },
      { name: "keyClassName", type: "string", description: "Extra classes on every keycap." },
    ],
    Preview: Previews.PreviewMacKeyboardRedesign,
    previewShell: "plain",
    previewSections: [
      {
        title: "Silver, typing on its own",
        Preview: Previews.PreviewMacKeyboardRedesign,
        reactSource: `// src/app/page.tsx

import { MacKeyboard } from "@/components/keyboard";

export default function Page() {
  return <MacKeyboard autoplay listen autoplayText="hello, nexus" />;
}`,
      },
      {
        title: "Space grey, listening to your keyboard",
        Preview: Previews.PreviewMacKeyboardListenRedesign,
        reactSource: `// src/app/page.tsx

import { MacKeyboard } from "@/components/keyboard";

export default function Page() {
  return <MacKeyboard listen theme="dark" accent="#bf5af2" placeholder="Type on your keyboard..." />;
}`,
      },
    ],
    reactSource: `// src/app/page.tsx

import { MacKeyboard } from "@/components/keyboard";

export default function Page() {
  return (
    <MacKeyboard
      listen
      theme="auto"
      soundType="clicky"
      volume={0.5}
    />
  );
}`,
    tailwindSource: tw,
    resourceLinks: [{ label: "Live demo", href: "/demos/keyboard" }],
  },
  {
    slug: "images-badge",
    name: "Images Badge",
    registryCliName: "images-badge",
    description: "A pill of overlapping avatars that fans open along a gentle arc on hover or focus, each face springing into place a beat after the last while the +N count rolls down. A name tag glides from face to face under the pointer or the arrow keys, and faces without a picture show initials.",
    categorySlug: "motion-effects",
    tags: ["avatar", "avatar group", "badge", "social proof", "team", "stack", "presence", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 91,
    createdAt: "2026-05-14",
    animationKinds: ["hover", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "images", type: "BadgeImage[]", defaultValue: "7 people", description: "People in the stack, front first: { src?, alt, color? }. Without src the face shows initials." },
      { name: "maxVisible", type: "number", defaultValue: "3", description: "How many show while the stack is closed." },
      { name: "revealCount", type: "number", defaultValue: "2", description: "How many more fan out when it opens. The rest are counted in the +N chip." },
      { name: "label", type: "string", description: "Text after the stack." },
      { name: "size", type: "\"sm\" | \"md\" | \"lg\"", defaultValue: "\"md\"", description: "Face size and pill height." },
      { name: "shape", type: "\"circle\" | \"rounded\" | \"square\"", defaultValue: "\"circle\"", description: "Shape of each face." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens the stack and walks the name tag along it until someone hovers or focuses it." },
      { name: "onClick", type: "() => void", description: "Makes the whole badge a button." },
      { name: "className", type: "string", description: "Extra classes on the pill." },
      { name: "imageClassName", type: "string", description: "Extra classes on every face." },
    ],
    Preview: Previews.PreviewImagesBadgeRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ImagesBadge } from "@/components/images-badge";

const TEAM = [
  { src: "/avatars/ava.jpg", alt: "Ava Chen" },
  { src: "/avatars/noah.jpg", alt: "Noah Park" },
  { alt: "Mira Shah", color: "#bf5af2" },
  { alt: "Leo Grant" },
  { alt: "Zoe Ito" },
  { alt: "Kai Moss" },
];

export default function Page() {
  return (
    <ImagesBadge
      images={TEAM}
      maxVisible={3}
      revealCount={2}
      label="Editing now"
      size="md"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "compare",
    name: "Before / After Compare",
    registryCliName: "compare",
    description: "A before and after comparison for images or any two pieces of content. Press or drag anywhere and the divider springs to your finger with a little follow-through, the handle stretches in the direction it travels and each label fades as the divider reaches it; arrow keys move it too.",
    categorySlug: "motion-effects",
    tags: ["compare", "before after", "slider", "image", "photo", "diff", "drag", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 92,
    createdAt: "2026-05-14",
    animationKinds: ["drag", "hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "beforeImage", type: "string", description: "Image for the left (before) side." },
      { name: "afterImage", type: "string", description: "Image for the right (after) side." },
      { name: "beforeAlt", type: "string", defaultValue: "\"Before\"", description: "Alt text for beforeImage." },
      { name: "afterAlt", type: "string", defaultValue: "\"After\"", description: "Alt text for afterImage." },
      { name: "beforeContent", type: "React.ReactNode", description: "Any content for the before side; overrides beforeImage." },
      { name: "afterContent", type: "React.ReactNode", description: "Any content for the after side; overrides afterImage." },
      { name: "beforeLabel", type: "string", description: "Label chip on the left." },
      { name: "afterLabel", type: "string", description: "Label chip on the right." },
      { name: "initialPosition", type: "number", defaultValue: "50", description: "Starting divider position, 0-100." },
      { name: "mode", type: "\"drag\" | \"hover\"", defaultValue: "\"drag\"", description: "Drag: press or drag anywhere. Hover: the divider follows the pointer and returns on leave." },
      { name: "onChange", type: "(position: number) => void", description: "Called with the divider position when the user moves it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps the divider back and forth until someone touches it." },
      { name: "className", type: "string", description: "Extra classes; set the aspect ratio and max width here (defaults to 4:3, 480px)." },
    ],
    Preview: Previews.PreviewCompareRedesign,
    previewShell: "plain",
    previewSections: [
      {
        title: "Photo",
        Preview: Previews.PreviewCompareRedesign,
        reactSource: `// src/app/page.tsx

import { Compare } from "@/components/compare";

export default function Page() {
  return (
    <Compare
      beforeImage="/images/lake-flat.jpg"
      afterImage="/images/lake-graded.jpg"
      beforeLabel="Original"
      afterLabel="Graded"
    />
  );
}`,
      },
      {
        title: "Any content",
        Preview: Previews.PreviewCompareCodeRedesign,
        reactSource: `// src/app/page.tsx

import { Compare } from "@/components/compare";

export default function Page() {
  return (
    <Compare
      beforeLabel="Before"
      afterLabel="After"
      className="aspect-[16/10] max-w-[440px]"
      beforeContent={<pre className="absolute inset-0 bg-white p-5 font-mono text-sm">{"for (let i = 0; i < items.length; i++) {...}"}</pre>}
      afterContent={<pre className="absolute inset-0 bg-[#1d1d1f] p-5 font-mono text-sm text-white">{"items.reduce((sum, i) => sum + i.price, 0)"}</pre>}
    />
  );
}`,
      },
    ],
    reactSource: `// src/app/page.tsx

import { Compare } from "@/components/compare";

export default function Page() {
  return (
    <Compare
      beforeImage="/images/portrait-raw.jpg"
      afterImage="/images/portrait-retouched.jpg"
      beforeAlt="Unedited portrait"
      afterAlt="Retouched portrait"
      beforeLabel="Raw"
      afterLabel="Retouched"
      initialPosition={40}
      className="aspect-[3/4] max-w-sm"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "expandable-cards",
    name: "Expandable Cards",
    registryCliName: "expandable-cards",
    description: "A grid of story cards where picking one grows it, in one continuous spring, into a full card with the long description and a call to action while the rest of the grid sinks back; closing shrinks it home into its slot. It can open over the grid itself or in a centred dialog over the page, and the columns follow the container's width.",
    categorySlug: "cards",
    tags: ["cards", "grid", "expandable", "shared layout", "app store", "modal", "dialog", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 94,
    createdAt: "2026-05-14",
    animationKinds: ["press", "hover", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "CardItem[]", defaultValue: "6 sample cards", description: "Each { id, title, description, fullDescription, category, image?, bg?, ctaText?, ctaLink? }. Without image the drawn cover in bg is used." },
      { name: "expandInto", type: "\"grid\" | \"viewport\"", defaultValue: "\"grid\"", description: "\"grid\" opens a card over the grid itself; \"viewport\" opens it in a centred dialog over the page and locks scroll." },
      { name: "onOpenChange", type: "(id: string | null) => void", description: "Called with the card id when one opens, and null when it closes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and closes each card in turn until someone touches the grid." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewExpandableCardsRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ExpandableCards, type CardItem } from "@/components/expandable-cards";

const cards: CardItem[] = [
  {
    id: "motion",
    category: "Design",
    title: "Motion system",
    description: "Spring presets for every surface.",
    fullDescription: "One set of springs for buttons, sheets and lists, tuned to feel the same at every size.",
    image: "/covers/motion.jpg",
    ctaText: "Explore system",
    ctaLink: "/components",
  },
  {
    id: "type",
    category: "Typography",
    title: "Fluid type",
    description: "A scale that breathes with the screen.",
    fullDescription: "A type scale built on clamp(), with tight tracking on display sizes.",
    bg: "linear-gradient(150deg,#ffd60a,#ff9f0a)",
    ctaText: "See examples",
    ctaLink: "/type",
  },
];

export default function Page() {
  return <ExpandableCards cards={cards} expandInto="viewport" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "animated-select-headline",
    name: "Animated Select Headline",
    description: "A headline where one word sits inside a design-tool selection box, and every few seconds a different collaborator selects the next word. The box springs to the new width with an elastic overshoot, the size badge counts the pixels live, and the collaborator's cursor trails the corner on a softer spring.",
    categorySlug: "motion-effects",
    tags: ["headline", "text", "cycling", "selection", "figma", "multiplayer", "cursor", "hero", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 188,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["spring", "layout", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "words", type: "string[]", defaultValue: "[\"warp speed\", \"record time\", \"pure flow\", \"light speed\"]", description: "Words or short phrases to cycle through." },
      { name: "prefix", type: "string", defaultValue: "\"Build amazing websites at\"", description: "Text before the selected word." },
      { name: "suffix", type: "string", description: "Text after the selected word." },
      { name: "interval", type: "number", defaultValue: "2500", description: "Milliseconds between words. 0 stops the cycling; click and arrow keys still step. Pauses while hovered or focused." },
      { name: "collaborators", type: "{ name: string; color: string }[]", defaultValue: "Maya, Leo, Ari, Sam", description: "People whose cursors take turns selecting each word." },
      { name: "showCursor", type: "boolean", defaultValue: "true", description: "Shows the collaborator's cursor and name tag." },
      { name: "showSize", type: "boolean", defaultValue: "true", description: "Shows the live width × height badge under the selection." },
      { name: "onChange", type: "(index: number) => void", description: "Called with the index of the newly selected word." },
      { name: "className", type: "string", description: "Classes for the wrapper." },
      { name: "headingClassName", type: "string", description: "Classes for the h2." },
    ],
    Preview: Previews.PreviewAnimatedSelectHeadlineRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { AnimatedSelectHeadline } from "@/components/animated-select-headline";

export default function Page() {
  return (
    <AnimatedSelectHeadline
      prefix="Build websites at"
      words={["warp speed", "record time", "pure flow", "light speed"]}
      collaborators={[
        { name: "Maya", color: "#0071e3" },
        { name: "Leo", color: "#bf5af2" },
        { name: "Ari", color: "#ff9f0a" },
      ]}
      interval={2400}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "warp-speed-card",
    name: "Warp Speed Card",
    description: "Wrap a phrase in a headline to give it a hyperdrive: hover, focus or tap it and a starfield inside its box spools up on a spring, stretching stars into streaks as speed builds. The phrase squashes and stretches on the kick and drops out of warp with a jolt when you let go.",
    categorySlug: "motion-effects",
    tags: ["hover", "warp", "starfield", "space", "headline", "text", "canvas", "card", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 210,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["hover", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "WarpTextTrigger.children", type: "React.ReactNode", description: "The phrase that jumps to warp." },
      { name: "WarpTextTrigger.beamColor", type: "string", defaultValue: "\"255,255,255\"", description: "Star colour as an \"r,g,b\" triplet." },
      { name: "WarpTextTrigger.onWarpChange", type: "(warping: boolean) => void", description: "Called when the jump starts and when it drops out." },
      { name: "WarpTextTrigger.autoplay", type: "boolean", defaultValue: "false", description: "Makes a jump every few seconds until someone hovers, focuses or taps the phrase." },
      { name: "WarpTextTrigger.className", type: "string", description: "Classes for the phrase box." },
      { name: "WarpSpeedCard.children", type: "React.ReactNode", description: "Card content, usually a heading containing a WarpTextTrigger." },
      { name: "WarpSpeedCard.className", type: "string", description: "Classes for the card." },
      { name: "WarpSpeedCard.contentClassName", type: "string", description: "Classes for the inner content wrapper." },
    ],
    Preview: Previews.PreviewWarpSpeedCardRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { WarpSpeedCard, WarpTextTrigger } from "@/components/warp-speed-card";

export default function Page() {
  return (
    <WarpSpeedCard className="mx-auto max-w-xl">
      <div className="px-8 py-14 text-center">
        <h2 className="text-5xl font-semibold tracking-tight">
          Build amazing websites
          <br />
          at <WarpTextTrigger>warp speed</WarpTextTrigger>
        </h2>
      </div>
    </WarpSpeedCard>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "circular-carousel",
    name: "Circular Carousel",
    description: "Cards hung round the rim of a wheel, with the active card at the top and its neighbours tipping away down each side. Drag or fling the wheel and it coasts to the nearest card while the cards swing on their pins and settle, and the counter in the middle rolls to the new number; arrows, dots and keys work too.",
    categorySlug: "cards",
    tags: ["carousel", "circular", "wheel", "orbital", "cards", "drag", "inertia", "counter", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 85,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["drag", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "CarouselItem[]", defaultValue: "6 sample steps", description: "Each { id, title, description, tag?, accent? }." },
      { name: "activeIndex", type: "number", description: "Controlled active card; the wheel turns the short way round to it." },
      { name: "onActiveChange", type: "(index: number) => void", description: "Called with the new active index." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Steps to the next card every autoPlayInterval ms until someone touches it." },
      { name: "autoPlayInterval", type: "number", defaultValue: "2600", description: "Time between autoplay steps, in ms." },
      { name: "hint", type: "string", defaultValue: "\"Drag the wheel, or use the arrow keys.\"", description: "Caption under the controls. An empty string hides it." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewCircularCarouselRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { CircularCarousel } from "@/components/circular-carousel";

const steps = [
  { id: "plan", tag: "Plan", title: "Shape the brief", description: "Goals, audience and the one thing to get right." },
  { id: "build", tag: "Build", title: "Make it real", description: "Components, data and motion wired together." },
  { id: "test", tag: "Test", title: "Watch people use it", description: "Five sessions find most of the rough edges.", accent: "#30b65a" },
  { id: "ship", tag: "Ship", title: "Put it out", description: "Release, measure and write down what you learned." },
  { id: "learn", tag: "Learn", title: "Loop back", description: "Feed what you saw into the next brief." },
];

export default function Page() {
  const [step, setStep] = useState(0);
  return <CircularCarousel items={steps} activeIndex={step} onActiveChange={setStep} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "chat-messages",
    name: "Chat Messages",
    description: "A chat thread styled like a messaging app, with blue user bubbles, grey replies and a composer. With autoplay the conversation plays itself: user lines type into the composer and pop out, and the assistant's typing dots grow into each reply; visitors can then send their own messages. Also includes Composer Morph Chat, where the text in the composer lifts out of the field and morphs into the sent bubble, then the reply shimmers and streams in word by word. Also includes Chat Head, a chat that lives in a draggable floating head that flings to the nearest edge, peeks new messages, opens into a panel and can be dismissed on a target or with the keyboard.",
    categorySlug: "ai-components",
    tags: ["chat", "messages", "ai", "assistant", "bubbles", "typing indicator", "conversation", "motion kit", "framer-motion", "composer morph chat", "ai chat", "message morph", "streaming reply", "chat head", "floating chat", "draggable bubble", "support widget"],
    premium: false,
    trendingScore: 92,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["layout", "spring", "type"],
    dependencies: ["framer-motion"],
    props: [
      { name: "messages", type: "ChatMessage[]", defaultValue: "5-message demo", description: "The conversation: { id, sender: \"user\" | \"assistant\", content, timestamp? }." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays the conversation and loops it until someone touches the chat. `autoPlay` still works." },
      { name: "autoPlayDelay", type: "number", defaultValue: "900", description: "Pause after each message during autoplay, in ms." },
      { name: "typingDuration", type: "number", defaultValue: "1300", description: "How long the typing dots show before a reply, in ms." },
      { name: "showReplay", type: "boolean", defaultValue: "true", description: "Shows a replay button in the header." },
      { name: "interactive", type: "boolean", defaultValue: "true", description: "Lets visitors type and send their own messages." },
      { name: "reply", type: "(text: string) => string | Promise<string>", description: "Produces the assistant's answer to a sent message. Defaults to canned replies." },
      { name: "onSend", type: "(text: string) => void", description: "Called with the text whenever the visitor sends a message." },
      { name: "title", type: "string", defaultValue: "\"Nexus AI\"", description: "Name in the header." },
      { name: "className", type: "string", description: "Extra classes for the root. Give it a height to change the default 440px." },
      { name: "ComposerMorphChat.autoplay", type: "boolean", defaultValue: "false", description: "Types two scripted questions into the composer and sends them, once, until someone touches the chat. Waits until the chat is on screen and never runs under reduced motion." },
      { name: "ComposerMorphChat.onSend", type: "(text: string) => void", defaultValue: "undefined", description: "Called with the text of every message the visitor sends. Replies are canned demo text and nothing is sent over the network." },
      { name: "ComposerMorphChat.className", type: "string", defaultValue: "undefined", description: "Extra classes for the chat card, which is 380px wide at most and 520px tall." },
      { name: "ChatHead.autoplay", type: "boolean", defaultValue: "false", description: "Bounces the head, peeks new messages and drifts it between the edges until someone touches the stage. Pauses off screen and never runs under reduced motion." },
      { name: "ChatHead.name", type: "string", defaultValue: "\"Maya\"", description: "Name shown on the head, in the message peek and in the panel header." },
      { name: "ChatHead.onReply", type: "(text: string) => void", defaultValue: "undefined", description: "Called with the text of a quick reply when the visitor taps one." },
      { name: "ChatHead.onDismiss", type: "() => void", defaultValue: "undefined", description: "Called when the head is dropped on the target or dismissed with the Delete key." },
      { name: "ChatHead.className", type: "string", defaultValue: "undefined", description: "Extra classes for the stage. The stage is its own bounded box, 360px wide at most and 540px tall, and the head never leaves it." },
    ],
    Preview: Previews.PreviewChatMessagesRedesign,
    previewSections: [
      {
        title: "Chat Messages",
        Preview: Previews.PreviewChatMessagesRedesign,
        reactSource: `// src/app/page.tsx
"use client";

import { ChatMessages } from "@/components/chat-messages";

export default function Page() {
  return (
    <ChatMessages
      title="Support"
      className="h-[480px]"
      messages={[
        { id: "1", sender: "assistant", content: "Hi! How can I help?" },
        { id: "2", sender: "user", content: "Where is my order?" },
        { id: "3", sender: "assistant", content: "It left the warehouse this morning.", timestamp: "9:41" },
      ]}
      reply={async (text) => {
        const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ text }) });
        return (await res.json()).answer;
      }}
    />
  );
}`,
      },
      {
        title: "Composer Morph Chat",
        Preview: Previews.PreviewComposerMorphChat,
        reactSource: `// src/app/page.tsx

import { ComposerMorphChat } from "@/components/chat-messages";

export default function Page() {
  return (
    <ComposerMorphChat
      className="mx-auto"
    />
  );
}
`,
      },
      {
        title: "Chat Head",
        Preview: Previews.PreviewChatHead,
        reactSource: `// src/app/page.tsx

import { ChatHead } from "@/components/chat-messages";

export default function Page() {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <ChatHead
        name="Maya"
      />
    </div>
  );
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { ChatMessages } from "@/components/chat-messages";

export default function Page() {
  return (
    <ChatMessages
      title="Support"
      className="h-[480px]"
      messages={[
        { id: "1", sender: "assistant", content: "Hi! How can I help?" },
        { id: "2", sender: "user", content: "Where is my order?" },
        { id: "3", sender: "assistant", content: "It left the warehouse this morning.", timestamp: "9:41" },
      ]}
      reply={async (text) => {
        const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ text }) });
        return (await res.json()).answer;
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "shader-flow",
    name: "Shader Flow",
    description: "A real WebGL fragment shader of domain-warped noise that drifts like ink in water, with a static gradient fallback where WebGL is missing. Move the pointer and the flow swirls behind it on a lagging spring; stop and the swirl swings into a small counter-twist before it calms.",
    categorySlug: "background-effects",
    tags: ["background", "shader", "webgl", "gradient", "noise", "fluid", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 88,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["hover", "spring", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "children", type: "ReactNode", description: "Content over the flow. Replaces the default title card." },
      { name: "className", type: "string", description: "Extra classes on the panel (size, radius)." },
      { name: "showContent", type: "boolean", defaultValue: "true", description: "Show the default title card when no children are passed." },
      { name: "cursorReactive", type: "boolean", defaultValue: "true", description: "Let the pointer stir the flow." },
      { name: "intensity", type: "\"low\" | \"medium\" | \"high\"", defaultValue: "\"medium\"", description: "Strength of the colour and warping." },
      { name: "colors", type: "[string, string, string, string]", defaultValue: "[\"#05060d\", \"#1d39d6\", \"#bf5af2\", \"#ff9f6a\"]", description: "Four hex colours: base, body, accent, highlight." },
      { name: "speed", type: "number", defaultValue: "1", description: "Speed multiplier for the drift." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Stirs the flow with a pretend pointer until someone moves over it." },
    ],
    Preview: Previews.PreviewShaderFlowRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ShaderFlow } from "@/components/shader-flow";

export default function Page() {
  return (
    <ShaderFlow className="min-h-[520px]" intensity="high" colors={["#05060d", "#0a5bd6", "#5e5ce6", "#64d2ff"]}>
      <div className="relative px-6 text-center text-white">
        <h1 className="text-5xl font-semibold tracking-[-0.045em]">Design in motion.</h1>
        <p className="mt-4 text-[15px] text-white/70">Move to stir the colour.</p>
      </div>
    </ShaderFlow>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ask-nexus-input",
    name: "Ask Nexus Input",
    description: "A headline over a pill-shaped question field whose placeholder questions roll past while it is empty. Send a question and the words break into dust that blows off to the right, letter by letter from the end, before the field resets.",
    categorySlug: "ai-components",
    tags: ["ai", "input", "search", "ask", "disintegrate", "particles", "canvas", "placeholder", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 260,
    createdAt: "2026-05-16T00:00:00.000Z",
    animationKinds: ["type", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: "\"Ask Nexus UI anything\"", description: "Headline above the field." },
      { name: "placeholders", type: "string[]", defaultValue: "5 questions", description: "Questions that roll through the placeholder. Sending an empty field asks the one showing." },
      { name: "placeholderInterval", type: "number", defaultValue: "2800", description: "Time each placeholder stays up, in ms." },
      { name: "defaultValue", type: "string", defaultValue: "\"\"", description: "Text the field starts with." },
      { name: "onSubmit", type: "(value: string) => void", description: "Called with the trimmed question the moment it is sent." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types and sends the placeholders in turn until someone touches the field." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewAskNexusInputRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { AskNexusInput } from "@/components/ask-nexus-input";

export default function Page() {
  return (
    <AskNexusInput
      title="How can we help?"
      placeholders={["How do I reset my password?", "Can I change my plan?", "Where are my invoices?"]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "interactive-globe-explorer",
    name: "Interactive Globe Explorer",
    registryCliName: "interactive-globe-explorer",
    description: "An office finder: a dotted globe drawn on canvas beside a list of cities, with the address and email of the selected one ready to copy. Pick a city or its pin and the globe swings round on a spring, overshoots a touch and settles with the city in the middle, where its pin drops in with a bounce and sends out a ripple.",
    categorySlug: "three-d-components",
    tags: ["globe", "map", "locations", "offices", "canvas", "3d", "drag", "copy", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 225,
    createdAt: "2026-05-20T00:00:00.000Z",
    animationKinds: ["drag", "spring", "3d", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "locations", type: "GlobeLocation[]", defaultValue: "20 cities", description: "Places to pin: { id, name, lat, lng, address, email }." },
      { name: "initialLocationId", type: "string", defaultValue: "\"4\" (London)", description: "Id of the location selected first." },
      { name: "onSelect", type: "(location: GlobeLocation) => void", description: "Called whenever a location is selected." },
      { name: "title", type: "string", defaultValue: "\"Our offices\"", description: "Heading above the list." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Flies from city to city every few seconds until someone touches the explorer." },
      { name: "className", type: "string", description: "Classes for the card. Give it a height for the side-by-side layout; below 500px wide it stacks." },
    ],
    Preview: Previews.PreviewInteractiveGlobeExplorerRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { InteractiveGlobeExplorer, type GlobeLocation } from "@/components/interactive-globe-explorer";

const offices: GlobeLocation[] = [
  { id: "lis", name: "Lisbon", lat: 38.72, lng: -9.14, address: "Rua Augusta 24, 1100-053 Lisbon, PT", email: "lisbon@yourco.com" },
  { id: "nyc", name: "New York", lat: 40.71, lng: -74.0, address: "89 Greene St, New York NY 10012, US", email: "nyc@yourco.com" },
  { id: "tyo", name: "Tokyo", lat: 35.68, lng: 139.65, address: "2-1 Marunouchi, Tokyo 100-0005, JP", email: "tokyo@yourco.com" },
  { id: "syd", name: "Sydney", lat: -33.87, lng: 151.21, address: "40 Bridge St, Sydney NSW 2000, AU", email: "sydney@yourco.com" },
];

export default function Page() {
  return <InteractiveGlobeExplorer locations={offices} initialLocationId="lis" className="h-[480px]" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "code-block",
    name: "Code Block",
    description: "A syntax-highlighted code block with a title bar, language badge, line numbers and a copy button. A soft bar glides between lines as the pointer moves, highlightLines marks lines with an accent bar, and copying turns the icon into a tick that draws itself.",
    categorySlug: "feature-sections",
    tags: ["code", "syntax", "highlight", "copy", "snippet", "docs", "line numbers", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 0,
    createdAt: "2026-05-17T00:00:00.000Z",
    animationKinds: ["hover", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "code", type: "string", description: "The source to show." },
      { name: "language", type: "\"plain\" | \"js\" | \"ts\" | \"jsx\" | \"tsx\" | \"css\" | \"json\" | \"html\"", defaultValue: "\"tsx\"", description: "Highlighting rules and the badge in the title bar." },
      { name: "theme", type: "\"dark\" | \"light\" | \"auto\" | \"custom\"", defaultValue: "\"dark\"", description: "Built-in palettes; auto follows the page's dark class; custom reads colours from header, codeArea and border." },
      { name: "header", type: "HeaderProps", defaultValue: "{ enabled, showDots, title, copy }", description: "Title bar: enabled, showDots, title, font, and copy { enabled, label, copiedLabel, copiedDurationMs }." },
      { name: "codeArea", type: "CodeAreaProps", defaultValue: "{ showLineNumbers: true, wrap: false, padding: 18 }", description: "Line numbers, wrapping, padding, font and custom colours." },
      { name: "border", type: "BorderProps", defaultValue: "{ width: 0, radius: \"22px\" }", description: "Border colour, width and radius." },
      { name: "highlightLines", type: "number[]", description: "1-based lines to mark with an accent bar." },
      { name: "hoverHighlight", type: "boolean", defaultValue: "true", description: "A soft bar glides to the line under the pointer." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Walks the glide bar through highlightLines (or every line) until the pointer comes over the code." },
      { name: "className", type: "string", description: "Extra classes for the root." },
      { name: "style", type: "React.CSSProperties", description: "Inline styles for the root." },
    ],
    Preview: Previews.PreviewCodeBlockRedesign,
    previewShell: "plain",
    previewSections: [
      {
        title: "Dark with marked lines",
        Preview: Previews.PreviewCodeBlockRedesign,
        reactSource: `// src/app/page.tsx

import { CodeBlock } from "@/components/code-block";

const code = \`export function Badge({ count }: { count: number }) {
  return <span>{count > 99 ? "99+" : count}</span>;
}\`;

export default function Page() {
  return (
    <div className="h-[200px]">
      <CodeBlock code={code} language="tsx" theme="dark" highlightLines={[2]} header={{ enabled: true, showDots: true, title: "badge.tsx", copy: { enabled: true } }} />
    </div>
  );
}`,
      },
      {
        title: "Follows the page theme",
        Preview: Previews.PreviewCodeBlockAutoRedesign,
        reactSource: `// src/app/page.tsx

import { CodeBlock } from "@/components/code-block";

const code = 'export function Badge() { return <span className="rounded-full px-2 text-xs">New</span>; }';

export default function Page() {
  return (
    <div className="h-[320px]">
      <CodeBlock code={code} language="tsx" theme="auto" header={{ enabled: true, title: "badge.tsx", copy: { enabled: true } }} />
    </div>
  );
}`,
      },
    ],
    reactSource: `// src/app/page.tsx

import { CodeBlock } from "@/components/code-block";

const code = \`export function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}</p>;
}\`;

export default function Page() {
  return (
    <div className="h-[220px]">
      <CodeBlock
        code={code}
        language="tsx"
        theme="auto"
        highlightLines={[2]}
        header={{ enabled: true, showDots: true, title: "greeting.tsx", copy: { enabled: true } }}
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "card-stack-rotator",
    name: "Card Stack Rotator",
    description: "A stack of testimonial cards: flick the top card away and it flies out, drops behind the pile and slides home into the back slot with a wobble. The next card rises and its **highlighted** words get a fresh highlighter stroke. Also includes Rolodex Testimonials, quotes on a 3D rolodex drum that clicks to the next one, spins when dragged, coasts when flicked and always lands square on a card.",
    categorySlug: "testimonials",
    tags: ["testimonials", "card stack", "swipe", "carousel", "highlight", "quotes", "motion kit", "framer-motion", "rolodex testimonials", "3d drum", "testimonial carousel"],
    premium: false,
    trendingScore: 0,
    createdAt: "2026-05-17",
    animationKinds: ["drag", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "CardData[]", description: "Cards, front first: { id, content, name, designation, company?, initials?, avatarUrl? }. Wrap words in **double asterisks** to highlight them." },
      { name: "rotationInterval", type: "number", defaultValue: "0", description: "Throw the front card to the back every this many ms, paused on hover. 0 turns it off." },
      { name: "maxVisible", type: "number", defaultValue: "3", description: "How many cards are drawn in the stack." },
      { name: "stackOffset", type: "number", defaultValue: "14", description: "How far each card behind peeks out below, in px." },
      { name: "scaleStep", type: "number", defaultValue: "0.05", description: "How much smaller each card behind is." },
      { name: "cardWidth", type: "string", defaultValue: "\"420px\"", description: "CSS width of the stack; it never grows past its container." },
      { name: "cardHeight", type: "string", defaultValue: "\"auto\"", description: "CSS height of each card. auto sizes to the tallest card." },
      { name: "direction", type: "\"forward\" | \"backward\"", defaultValue: "\"forward\"", description: "Which way cards are thrown: forward flicks left, backward flicks right." },
      { name: "hint", type: "string", defaultValue: "\"Flick the top card away.\"", description: "Hint under the stack. An empty string hides it." },
      { name: "onChange", type: "(id: string) => void", description: "Called with the id of the card that comes to the front." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Flicks the top card away every 2.6s until someone touches the stack." },
      { name: "cardBackground / textColor / mutedColor", type: "string", description: "Optional colour overrides; by default the cards follow light and dark mode." },
      { name: "highlightBackground / highlightTextColor", type: "string", description: "Optional colours for the highlighter stroke and highlighted words." },
      { name: "pauseOnHover", type: "boolean", defaultValue: "true", description: "Pause rotationInterval while the pointer is over the stack." },
      { name: "className", type: "string", description: "Extra classes for the root." },
      { name: "RolodexTestimonials.cards", type: "RolodexCard[]", defaultValue: "ten demo quotes", description: "The testimonials in drum order. Each has a quote, a name, a role and a two-colour hue for the avatar." },
      { name: "RolodexTestimonials.autoplay", type: "boolean", defaultValue: "false", description: "Clicks the drum round to the next quote every 2.6 seconds until someone touches it. Pauses off screen and never runs under reduced motion." },
      { name: "RolodexTestimonials.onChange", type: "(index: number) => void", defaultValue: "undefined", description: "Called with the index of the card that comes square to the front." },
      { name: "RolodexTestimonials.className", type: "string", defaultValue: "undefined", description: "Extra classes for the root, which is 380px wide at most." },
    ],
    Preview: Previews.PreviewCardStackRotatorRedesign,
    previewSections: [
      {
        title: "Card Stack Rotator",
        Preview: Previews.PreviewCardStackRotatorRedesign,
        reactSource: `// src/app/page.tsx

import { CardStackRotator } from "@/components/card-stack-rotator";

const cards = [
  { id: "1", content: "We shipped onboarding in **three days**.", name: "Sana Whitfield", designation: "Head of Design", company: "Pebblework" },
  { id: "2", content: "The motion is **tuned, not decorated**.", name: "Diego Marchetti", designation: "Staff Engineer", company: "Northwake" },
  { id: "3", content: "Swapped our carousel and **time on page doubled**.", name: "Hana Ito", designation: "Growth Lead", company: "Tidepool" },
];

export default function Page() {
  return <CardStackRotator cards={cards} cardWidth="400px" rotationInterval={6000} />;
}`,
      },
      {
        title: "Rolodex Testimonials",
        Preview: Previews.PreviewRolodexTestimonials,
        reactSource: `// src/app/page.tsx

import { RolodexTestimonials } from "@/components/card-stack-rotator";

const quotes = [
  { quote: "We rebuilt onboarding in a weekend.", name: "Maya Chen", role: "Design lead, Loop", hue: ["#ff9f0a", "#ff375f"] as [string, string] },
  { quote: "Copy, paste, ship.", name: "Tom Becker", role: "Engineer, Relay", hue: ["#64d2ff", "#30d158"] as [string, string] },
  { quote: "It feels expensive. It wasn't.", name: "Dev Patel", role: "Indie maker", hue: ["#ffd60a", "#ff9f0a"] as [string, string] },
];

export default function Page() {
  return <RolodexTestimonials cards={quotes} />;
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { CardStackRotator } from "@/components/card-stack-rotator";

const cards = [
  { id: "1", content: "We shipped onboarding in **three days**.", name: "Sana Whitfield", designation: "Head of Design", company: "Pebblework" },
  { id: "2", content: "The motion is **tuned, not decorated**.", name: "Diego Marchetti", designation: "Staff Engineer", company: "Northwake" },
  { id: "3", content: "Swapped our carousel and **time on page doubled**.", name: "Hana Ito", designation: "Growth Lead", company: "Tidepool" },
];

export default function Page() {
  return <CardStackRotator cards={cards} cardWidth="400px" rotationInterval={6000} />;
}`,
    tailwindSource: `"use client";

import { CardStackRotator } from "@/components/card-stack-rotator/card-stack-rotator";

export function CardStackRotatorDemo() {
  const cards = [
    { id: "1", content: "This product is **absolutely incredible** for our team.", name: "Sarah Chen", designation: "Head of Design", company: "Vercel", initials: "SC" },
    { id: "2", content: "The **developer experience** is unmatched.", name: "Marcus Rodriguez", designation: "Senior Engineer", company: "Linear", initials: "MR" },
    { id: "3", content: "Component quality is **genuinely impressive**.", name: "Aisha Patel", designation: "Design Systems Lead", company: "Stripe", initials: "AP" },
  ];
  return (
    <div className="flex items-center justify-center p-8">
      <CardStackRotator cards={cards} rotationInterval={3000} maxVisible={3} stackOffset={14} scaleStep={0.04} cardWidth="420px" cardHeight="260px" cardBackground="#111113" cardBorderColor="rgba(255,255,255,0.07)" textColor="#fafafa" mutedColor="rgba(250,250,250,0.45)" highlightBackground="rgba(129,140,248,0.15)" highlightTextColor="#a5b4fc" borderRadius="16px" shadowIntensity={0.55} pauseOnHover />
    </div>
  );
}`,
  },
  {
    slug: "scroll-reveal-text",
    name: "Scroll Reveal Text",
    description: "A paragraph that reads itself as you scroll: each word, character or line rises out of a blur and passes through the accent colour on its way from grey to ink, so a bright reading wave travels through the text. Scroll progress is smoothed by a spring, and it can track the page or any scrollable container.",
    categorySlug: "motion-effects",
    tags: ["scroll", "text", "reveal", "reading", "typography", "blur", "storytelling", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-05-18",
    animationKinds: ["scroll", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", description: "The text to reveal. In line mode, \\n separates lines." },
      { name: "mode", type: "\"word\" | \"character\" | \"line\"", defaultValue: "\"word\"", description: "Granularity of each reveal step." },
      { name: "as", type: "\"p\" | \"h2\" | \"h3\" | \"div\"", defaultValue: "\"p\"", description: "Root element." },
      { name: "mutedColor", type: "string", description: "Colour of unread text. Defaults to #d2d2d7 (#3a3a3c in dark mode)." },
      { name: "accentColor", type: "string", description: "Colour text passes through while revealing. Defaults to #0071e3 (#0a84ff in dark mode)." },
      { name: "activeColor", type: "string", description: "Colour of revealed text. Defaults to #1d1d1f (#f5f5f7 in dark mode)." },
      { name: "startOffset", type: "number", defaultValue: "0.05", description: "Scroll progress (0 entering, 1 leaving) where the reveal begins." },
      { name: "endOffset", type: "number", defaultValue: "0.75", description: "Scroll progress where the reveal is complete." },
      { name: "blurAmount", type: "number", defaultValue: "6", description: "Starting blur in px. 0 turns it off." },
      { name: "stagger", type: "number", defaultValue: "0.65", description: "0 reveals everything together, 1 strictly one unit after another." },
      { name: "fontSize", type: "string", defaultValue: "\"clamp(1.75rem, 4.5vw, 3.75rem)\"", description: "CSS font-size." },
      { name: "align", type: "\"left\" | \"center\" | \"right\"", defaultValue: "\"left\"", description: "Text alignment." },
      { name: "container", type: "RefObject<HTMLElement | null>", description: "Scrollable ancestor to track instead of the page. Give it position: relative." },
      { name: "className", type: "string", description: "Classes for the root element." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays the reveal on a loop until someone scrolls. With a container it scrolls the container itself, so handing over is seamless." },
    ],
    Preview: Previews.PreviewScrollRevealTextRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ScrollRevealText } from "@/components/scroll-reveal-text";

function Manifesto() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-[40vh]">
      <ScrollRevealText
        text="We design tools that people actually want to open every single morning."
        stagger={0.7}
        blurAmount={8}
      />
    </section>
  );
}

export default function Page() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-[40vh]">
      <ScrollRevealText
        mode="line"
        text={"Built for speed.\\nDesigned to last.\\nShips on Friday."}
        startOffset={0.1}
        endOffset={0.6}
        fontSize="clamp(2.5rem, 6vw, 5rem)"
      />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "animated-countdown",
    name: "Animated Countdown",
    description: "Flip-style countdown timer with four variants — modern, digital, minimal, and classic. Smooth number transitions powered by Framer Motion. Also includes the Motion Kit Split-Flap Board variant. Also includes Watch Countdown, where days, hours, minutes and seconds empty around four concentric rings with glowing heads and rolling digits. Also includes Fuse Countdown, where a spark burns along a rope fuse at the pace of the clock and sets off a rocket and fireworks at zero.",
    categorySlug: "motion-effects",
    tags: ["motion kit", "countdown", "timer", "flip", "launch", "framer-motion", "watch countdown", "ring countdown", "fuse countdown", "rocket launch countdown"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-04-10",
    animationKinds: ["spring", "layout"],
    dependencies: ["framer-motion"],
    Preview: Previews.PreviewAnimatedCountdown,
    props: [
      { name: "SplitFlapBoard.to", type: "Date | number", defaultValue: "mount + 2d 14:37:09", description: "Moment to count down to, as a Date or epoch milliseconds." },
      { name: "SplitFlapBoard.label", type: "string", defaultValue: "\"Launch \u00b7 MK 4.0\"", description: "Heading in the top-left corner." },
      { name: "SplitFlapBoard.liveLabel", type: "string", defaultValue: "\"Live\"", description: "Text next to the pulsing dot in the top-right corner." },
      { name: "SplitFlapBoard.statusLabel", type: "string", defaultValue: "\"Status\"", description: "Caption above the status row." },
      { name: "SplitFlapBoard.statuses", type: "string[]", defaultValue: "[\"BOARDING\", \"ON TIME\", \"GATE B12\", \"FINAL CALL\"]", description: "Status lines; the first is shown and autoplay rotates through them. Up to 10 characters fit." },
      { name: "SplitFlapBoard.status", type: "string", description: "Shows this status instead of the statuses list (controlled)." },
      { name: "SplitFlapBoard.onComplete", type: "() => void", description: "Called once when the countdown reaches zero." },
      { name: "SplitFlapBoard.autoplay", type: "boolean", defaultValue: "false", description: "Rotates the status line every 4.2s until someone presses the board. The countdown always runs." },
      { name: "SplitFlapBoard.className", type: "string", description: "Extra classes for the board." },
      { name: "WatchCountdown.to", type: "Date | number", defaultValue: "12 days 7:43:21 after the clock starts", description: "Moment to count down to, as a Date or epoch milliseconds. Without it the card counts down from a fixed offset taken at the first client clock reading." },
      { name: "WatchCountdown.title", type: "string", defaultValue: "\"Nexus 3.0 ships in\"", description: "Small caption above the rings." },
      { name: "WatchCountdown.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the card." },
      { name: "FuseCountdown.seconds", type: "number", defaultValue: "24", description: "How long the fuse burns, in seconds." },
      { name: "FuseCountdown.title", type: "string", defaultValue: "\"Doors open in\"", description: "Caption shown while the fuse burns." },
      { name: "FuseCountdown.launchMessage", type: "string", defaultValue: "\"Nexus 3.0 is out. Go look.\"", description: "Message shown once the rocket has gone up." },
      { name: "FuseCountdown.onLaunch", type: "() => void", defaultValue: "undefined", description: "Called once each time the fuse reaches the rocket." },
      { name: "FuseCountdown.autoplay", type: "boolean", defaultValue: "false", description: "After each launch, relights the fuse by itself until someone presses the card or the button." },
      { name: "FuseCountdown.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the card." },
    ],
    previewSections: [
      {
        title: "Animated Countdown",
        Preview: Previews.PreviewAnimatedCountdown,
        reactSource: `// src/app/page.tsx

import { AnimatedCountdown } from "@/components/animated-countdown";

export default function Page() {
  return (
    <AnimatedCountdown
      targetDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
      variant="modern"
      size="md"
    />
  );
}`,
      },
      {
        title: "Split-Flap Board",
        Preview: Previews.PreviewSplitFlapBoard,
        reactSource: `// src/app/page.tsx

import { SplitFlapBoard } from "@/components/animated-countdown";

const LAUNCH = new Date("2026-12-01T17:00:00Z");

export default function Page() {
  return (
    <SplitFlapBoard
      to={LAUNCH}
      label="Launch · v2.0"
      statuses={["ON TIME", "GATE OPEN", "FINAL CALL"]}
      autoplay
    />
  );
}`,
      },
      {
        title: "Watch Countdown",
        Preview: Previews.PreviewWatchCountdown,
        reactSource: `// src/app/page.tsx

import { WatchCountdown } from "@/components/animated-countdown";

const LAUNCH = new Date("2026-12-01T09:00:00Z");

export default function Page() {
  return <WatchCountdown to={LAUNCH} title="Nexus 3.0 ships in" />;
}
`,
      },
      {
        title: "Fuse Countdown",
        Preview: Previews.PreviewFuseCountdown,
        reactSource: `// src/app/page.tsx

import { FuseCountdown } from "@/components/animated-countdown";

export default function Page() {
  return (
    <FuseCountdown
      seconds={30}
      title="Doors open in"
      launchMessage="We are live."
    />
  );
}
`,
      },
    ],
    detailPreviews: [
      Previews.PreviewAnimatedCountdownModern,
      Previews.PreviewAnimatedCountdownDigital,
      Previews.PreviewAnimatedCountdownMinimal,
    ],
    reactSource: `// src/app/page.tsx

import { AnimatedCountdown } from "@/components/animated-countdown";

export default function Page() {
  return (
    <AnimatedCountdown
      targetDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
      variant="modern"
      size="md"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "hover-highlight-text",
    name: "Hover Highlight Text",
    description: "A headline you read with a highlighter: words near the pointer turn from grey to ink and a marker stroke swipes in under each one with a small overshoot. As the pointer moves on, the strokes linger and retract one after another like a comet tail. Also includes Marker Annotations: Hand-drawn marks play over your copy in reading order as it scrolls in: a highlighter pass across line breaks, a scribbled underline, a loose circle and a strike-through.",
    categorySlug: "motion-effects",
    tags: ["hover", "text", "highlight", "marker", "cursor", "headline", "spring", "motion kit", "framer-motion", "marker annotations"],
    premium: false,
    trendingScore: 90,
    createdAt: "2026-04-18",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", description: "The sentence to highlight." },
      { name: "as", type: "\"h1\" | \"h2\" | \"p\" | \"span\"", defaultValue: "\"h2\"", description: "Element used for the text." },
      { name: "reach", type: "number", defaultValue: "40", description: "How far from the pointer, in px, a word still gets highlighted." },
      { name: "linger", type: "number", defaultValue: "0.9", description: "Seconds a stroke takes to retract after the pointer moves on." },
      { name: "markerColor", type: "string", description: "Marker colour. Defaults to a highlighter yellow, softer in dark mode." },
      { name: "baseColor", type: "string", description: "Colour of words that are not highlighted. Defaults to #86868b (#6e6e73 in dark mode)." },
      { name: "highlightColor", type: "string", description: "Colour of highlighted words. Defaults to the ink colour." },
      { name: "springConfig", type: "SpringOptions", defaultValue: "{ stiffness: 320, damping: 17, mass: 0.7 }", description: "Spring for the marker stroke; the default overshoots a little." },
      { name: "baseClassName", type: "string", description: "Classes for the text element (size, weight, width)." },
      { name: "highlightClassName", type: "string", description: "Classes for every marker stroke. A bg-* class replaces markerColor." },
      { name: "containerClassName", type: "string", description: "Classes for the wrapper that listens to the pointer." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Shows plain text with no effect." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps a highlighter across the words, line by line, until a real pointer arrives." },
      { name: "MarkerAnnotations.segments", type: "MarkerSegment[]", defaultValue: "MARKER_SEGMENTS", description: "Marker Annotations: the paragraph as plain strings with { text, kind, color?, darkColor?, delay? } objects between them. kind is highlight, underline, circle or strike." },
      { name: "MarkerAnnotations.showReplay", type: "boolean", defaultValue: "true", description: "Marker Annotations: shows the Draw again button under the paragraph." },
      { name: "MarkerAnnotations.replayLabel", type: "string", defaultValue: "\"Draw again\"", description: "Marker Annotations: label of the replay button." },
      { name: "MarkerAnnotations.autoplay", type: "boolean", defaultValue: "false", description: "Marker Annotations: replays the marks every few seconds while on screen, until someone presses a button or touches the text. Never runs under reduced motion." },
      { name: "MarkerAnnotations.className", type: "string", description: "Marker Annotations: extra classes for the paragraph (size, weight, colour)." },
    ],
    Preview: Previews.PreviewHoverHighlightTextRedesign,
    previewSections: [
      {
        title: "Hover Highlight Text",
        Preview: Previews.PreviewHoverHighlightTextRedesign,
        reactSource: `// src/app/page.tsx

import { HoverHighlightText } from "@/components/hover-highlight-text";

function Hero() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-6">
      <HoverHighlightText
        as="h1"
        text="Build interfaces people remember long after they close the tab."
        reach={44}
        linger={1.1}
        baseClassName="max-w-[15ch] text-6xl"
      />
    </section>
  );
}

export default function Page() {
  return (
    <HoverHighlightText
      text="Highlight what matters."
      markerColor="rgba(0,113,227,0.18)"
      baseClassName="text-4xl"
    />
  );
}`,
      },
      {
        title: "Marker Annotations",
        Preview: Previews.PreviewMarkerAnnotations,
        reactSource: `// src/app/page.tsx

import { MarkerAnnotations, type MarkerSegment } from "@/components/hover-highlight-text";

const segments: MarkerSegment[] = [
  "Ship ",
  { text: "faster", kind: "highlight", delay: 0.3 },
  " with fewer ",
  { text: "meetings", kind: "strike", delay: 0.9 },
  ", and keep the ",
  { text: "good parts", kind: "circle", delay: 1.4 },
  " of ",
  { text: "slow software", kind: "underline", delay: 2 },
  ".",
];

export default function Page() {
  return <MarkerAnnotations segments={segments} showReplay={false} />;
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { HoverHighlightText } from "@/components/hover-highlight-text";

function Hero() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-6">
      <HoverHighlightText
        as="h1"
        text="Build interfaces people remember long after they close the tab."
        reach={44}
        linger={1.1}
        baseClassName="max-w-[15ch] text-6xl"
      />
    </section>
  );
}

export default function Page() {
  return (
    <HoverHighlightText
      text="Highlight what matters."
      markerColor="rgba(0,113,227,0.18)"
      baseClassName="text-4xl"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "motion-layer-scroller",
    name: "Motion Layer Scroller",
    description: "A landscape built from paper-cut layers inside its own scroll frame: scroll through it and each ridge rises at its own speed while the sun sinks behind them. When you stop, the layers settle on a soft spring with a small overshoot; pass your own layers to build any parallax scene.",
    categorySlug: "motion-effects",
    tags: ["parallax", "scroll", "depth", "layers", "landscape", "hero", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 83,
    createdAt: "2026-03-28",
    animationKinds: ["scroll", "parallax", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "layers", type: "LayerConfig[]", description: "Your own layers: { id, content, xRange?, yRange?, scaleRange?, rotateRange?, opacityRange?, blurRange?, className? }, mapped from the start to the end of the scroll. Leave out for the landscape; [] shows just the heading." },
      { name: "direction", type: "\"vertical\" | \"horizontal\"", defaultValue: "\"vertical\"", description: "Which way the scene scrolls." },
      { name: "scrollHeight", type: "number", defaultValue: "420", description: "Height of the scene in px." },
      { name: "distance", type: "number", defaultValue: "1.6", description: "How far there is to scroll, in scene heights." },
      { name: "heading", type: "string", defaultValue: "\"Motion that moves people\"", description: "Heading that drifts up and fades as you scroll." },
      { name: "description", type: "string", defaultValue: "\"Every layer travels at its own speed.\"", description: "Line under the heading." },
      { name: "hint", type: "string", defaultValue: "\"Scroll inside the scene.\"", description: "Hint shown until the scene is scrolled. An empty string hides it." },
      { name: "backgroundColor", type: "string", description: "Overrides the sky colour." },
      { name: "showGrid", type: "boolean", defaultValue: "false", description: "Draw a faint grid over the sky." },
      { name: "showGlow", type: "boolean", defaultValue: "true", description: "Draw the sun (the moon in dark mode) and its glow." },
      { name: "perspective", type: "number", defaultValue: "1200", description: "Perspective for custom layers, in px." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Scrolls the scene down and back up every few seconds until someone touches it." },
      { name: "className", type: "string", description: "Classes for the frame." },
    ],
    Preview: Previews.PreviewMotionLayerScrollerRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MotionLayerScroller } from "@/components/motion-layer-scroller";

export default function Page() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <MotionLayerScroller
        scrollHeight={520}
        heading="Built in layers"
        description="Scroll the scene to pull it apart."
      />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "spectra-frame",
    name: "Spectra Frame",
    description: "A photo grid that rests in black and white. Pointing at a photo blooms colour out from where the pointer came in while the photo widens, its row grows and the rest dim; moving off drains the colour back to where the pointer left.",
    categorySlug: "cards",
    tags: ["gallery", "grid", "photos", "grayscale", "color reveal", "hover", "portfolio", "clip-path", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 102,
    createdAt: "2026-05-18",
    animationKinds: ["hover", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "images", type: "SpectraImage[]", defaultValue: "8 drawn scenes", description: "Photos in reading order, each { src?, alt }. Without src a drawn scene is used. alt is the caption and accessible name." },
      { name: "imageCount", type: "number", defaultValue: "8", description: "How many images to show (slices images)." },
      { name: "columns", type: "number", defaultValue: "4", description: "Photos per row." },
      { name: "gap", type: "number", defaultValue: "8", description: "Gap between photos, in px." },
      { name: "borderRadius", type: "number", defaultValue: "16", description: "Corner radius of each photo, in px." },
      { name: "padding", type: "number", defaultValue: "0", description: "Padding round the grid, in px." },
      { name: "backgroundColor", type: "string", defaultValue: "\"transparent\"", description: "Background behind the grid." },
      { name: "grayscaleIntensity", type: "number", defaultValue: "100", description: "How grey the resting photos are, 0 to 100." },
      { name: "scaleAmount", type: "number", defaultValue: "1.06", description: "Zoom of the open photo." },
      { name: "cellMinHeight", type: "number", defaultValue: "128", description: "Resting row height, in px." },
      { name: "hoveredMinHeight", type: "number", defaultValue: "176", description: "Height of the row holding the open photo, in px (the grid keeps its total height)." },
      { name: "expandedFlex", type: "number", defaultValue: "2.2", description: "How much wider the open photo grows than its neighbours." },
      { name: "onSelect", type: "(index: number) => void", description: "Called with the index when a photo is clicked or activated with the keyboard." },
      { name: "hint", type: "string", defaultValue: "\"Point at a photo.\"", description: "Caption under the grid. An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens each photo in turn until someone touches the grid." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewSpectraFrameRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SpectraFrame } from "@/components/spectra-frame";

const photos = [
  { src: "/gallery/01.jpg", alt: "Harbour at dawn" },
  { src: "/gallery/02.jpg", alt: "Market street" },
  { src: "/gallery/03.jpg", alt: "Glasshouse" },
  { src: "/gallery/04.jpg", alt: "Salt flats" },
  { src: "/gallery/05.jpg", alt: "Night ferry" },
  { src: "/gallery/06.jpg", alt: "Old library" },
];

export default function Page() {
  return (
    <SpectraFrame
      images={photos}
      imageCount={6}
      columns={3}
      cellMinHeight={150}
      hoveredMinHeight={210}
    />
  );
}`,
    tailwindSource: `import { SpectraFrame } from "@/components/spectra-frame/spectra-frame";

export function SpectraFrameDemo() {
  return (
    <SpectraFrame
      imageCount={12}
      columns={4}
      gap={10}
      aspectRatio="4/3"
      transitionSpeed={480}
      scaleAmount={1.08}
      backgroundColor="#09090b"
      grayscaleIntensity={100}
      borderRadius={14}
    />
  );
}`,
  },
  {
    slug: "profile-orbit",
    name: "Profile Orbit",
    description: "A profile card with the whole team orbiting it on a tilted ring. Dragging the ring, using the arrows or tapping a face spins that person round to the front, the card slides over to them and their avatar drops in with a bounce, while people at the back of the ring pass under the card.",
    categorySlug: "cards",
    tags: ["profile", "team", "avatar", "orbit", "carousel", "contact", "social", "drag", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 108,
    createdAt: "2026-05-18",
    animationKinds: ["drag", "press", "spring", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "people", type: "ProfilePerson[]", defaultValue: "6 sample people", description: "Each { seed, name, role, email, avatar? }. Without avatar a coloured monogram is drawn; seed is the key and picks the colour." },
      { name: "onConnect", type: "(person: ProfilePerson, connected: boolean) => void", description: "Called when the Connect button is toggled." },
      { name: "onChange", type: "(index: number) => void", description: "Called with the index of the person now in the card." },
      { name: "autoRotateInterval", type: "number", defaultValue: "2800", description: "Time between autoplay steps, in ms." },
      { name: "hint", type: "string", defaultValue: "\"Drag the ring or tap a face.\"", description: "Caption under the orbit. An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Turns the ring to the next person until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewProfileOrbitRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ProfileOrbit } from "@/components/profile-orbit";

const team = [
  { seed: 1, name: "Priya Shah", role: "Founder", email: "priya@acme.dev", avatar: "/team/priya.jpg" },
  { seed: 2, name: "Leo Martin", role: "Design", email: "leo@acme.dev" },
  { seed: 3, name: "Ana Costa", role: "Engineering", email: "ana@acme.dev" },
  { seed: 4, name: "Kenji Ito", role: "Growth", email: "kenji@acme.dev" },
  { seed: 5, name: "Sara Holm", role: "Support", email: "sara@acme.dev" },
];

export default function Page() {
  return (
    <ProfileOrbit
      people={team}
    />
  );
}`,
    tailwindSource: `"use client";

import { ProfileOrbit } from "@/components/profile-orbit/profile-orbit";

export function ProfileOrbitDemo() {
  return (
    <div className="w-full h-screen">
      <ProfileOrbit />
    </div>
  );
}`,
  },
  {
    slug: "command-palette",
    name: "Command Palette",
    description: "Animated command palette that opens with ⌘K: a dimmed overlay, a search field that filters a list of commands, and Framer Motion enter and exit transitions. Also includes the Motion Kit Command Morph variant.",
    categorySlug: "motion-effects",
    tags: ["motion kit", "command", "search", "keyboard", "modal", "framer-motion", "shadcn"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-05-18",
    animationKinds: ["spring", "hover"],
    dependencies: ["framer-motion", "lucide-react", "cmdk", "@radix-ui/react-dialog"],
    Preview: Previews.PreviewCommandPalette,
    previewSections: [
      {
        title: "Command Palette",
        Preview: Previews.PreviewCommandPalette,
        reactSource: `// src/app/page.tsx

import { CommandPalette } from "@/components/command-palette";

export default function Page() {
  return <CommandPalette />;
}`,
      },
      {
        title: "Command Morph",
        Preview: Previews.PreviewCommandMorph,
        reactSource: `// src/app/page.tsx

import { CommandMorph, type CommandItem } from "@/components/command-palette";

const commands: CommandItem[] = [
  { id: "search", label: "Search docs", hint: "/", icon: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" },
  {
    id: "goto",
    label: "Go to page",
    crumb: "pages",
    icon: "M3 7h6l2 2h10v10H3z",
    children: [
      { id: "home", label: "Home", icon: "M3 11l9-8 9 8v10H3z" },
      { id: "billing", label: "Billing", icon: "M2 6h20v12H2zM2 10h20" },
    ],
  },
  { id: "logout", label: "Log out", icon: "M9 21H5V3h4M16 17l5-5-5-5M21 12H9" },
];

export default function Page() {
  return (
    <CommandMorph
      commands={commands}
      hotkey
    />
  );
}`,
      },
    ],
    tailwindSource: `"use client";

import { CommandPalette } from "@/components/command-palette";

export function CommandPaletteDemo() {
  return <CommandPalette />;
}`,
    reactSource: `// src/app/page.tsx

import { CommandPalette } from "@/components/command-palette";

export default function Page() {
  return <CommandPalette />;
}`,
    props: [
      { name: "className", type: "string", description: "Optional className for the root wrapper." },
      { name: "CommandMorph.commands", type: "CommandItem[]", defaultValue: "DEFAULT_COMMANDS", description: "Commands on the first page, each { id, label, icon, hint?, crumb?, children? }. Items with children open a nested page." },
      { name: "CommandMorph.placeholder", type: "string", defaultValue: "\"Type a command\u2026\"", description: "Search field placeholder on the first page. Nested pages show \"Search\u2026\"." },
      { name: "CommandMorph.onSelect", type: "(command: CommandItem, path: CommandItem[]) => void", description: "Called when the user runs a command without children, with the groups that led to it." },
      { name: "CommandMorph.hotkey", type: "boolean", defaultValue: "false", description: "Opt-in: Cmd/Ctrl+K anywhere on the page focuses the search field. Off by default." },
      { name: "CommandMorph.autoplay", type: "boolean", defaultValue: "false", description: "Walks through the palette by itself until someone touches it." },
      { name: "CommandMorph.className", type: "string", description: "Extra classes for the outer box." },
    ],
  },
  {
    slug: "image-trail",
    name: "Image Trail",
    registryCliName: "image-trail",
    description: "Move across the area and it deals out photos along your path: each lands with a small overshoot, tilted the way you were heading, carries a bit of your speed, then drops away under gravity, blurring as it fades. Turn on the magnetic effect and the pointer shoves the photos that are still lying there.",
    categorySlug: "motion-effects",
    tags: ["cursor", "trail", "images", "photos", "pointer", "magnetic", "hero", "motion kit"],
    premium: false,
    trendingScore: 118,
    createdAt: "2026-05-21",
    animationKinds: ["hover", "magnetic", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "images", type: "ImageTrailImage[]", defaultValue: "DEFAULT_TRAIL_IMAGES", description: "Images dealt out in turn: { src, alt? }. Defaults to six drawn postcards, so nothing is fetched." },
      { name: "spacing", type: "number", defaultValue: "48", description: "Pointer travel in px between one image and the next." },
      { name: "duration", type: "number", defaultValue: "1000", description: "How long each image stays, in ms, before it falls away." },
      { name: "imageSize", type: "number", defaultValue: "112", description: "Width and height of each image in px." },
      { name: "cornerRadius", type: "number", defaultValue: "14", description: "Corner radius of each image in px." },
      { name: "smoothness", type: "number", defaultValue: "0.7", description: "0–1. Higher lets each image glide in from the last one." },
      { name: "fadeInDuration / fadeOutDuration", type: "number", defaultValue: "0.25 / 0.5", description: "Fade times in seconds." },
      { name: "fadeInBlur / fadeOutBlur", type: "number", defaultValue: "0 / 6", description: "Blur in px on the way in and out." },
      { name: "magneticEffect", type: "boolean", defaultValue: "false", description: "Let the pointer shove images that are already down." },
      { name: "magneticRadius / magneticStrength", type: "number", defaultValue: "110 / 0.3", description: "Reach in px and strength (0–1) of the shove." },
      { name: "maxTrailImages", type: "number", defaultValue: "16", description: "Most images on screen at once." },
      { name: "staticPreview", type: "boolean", defaultValue: "false", description: "Lay out a fixed fan of images and ignore the pointer." },
      { name: "hint", type: "string", defaultValue: "\"Move across the canvas.\"", description: "Hint shown when there are no children. An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "A ghost pointer draws loops across the area until someone moves over it." },
      { name: "children", type: "ReactNode", description: "Content drawn above the trail, e.g. a headline." },
      { name: "className", type: "string", description: "Classes for the root; set its size here (defaults to h-80 w-full)." },
    ],
    Preview: Previews.PreviewImageTrailRedesign,
    previewShell: "plain",
    previewSections: [
      {
        title: "Trail",
        Preview: Previews.PreviewImageTrailRedesign,
        reactSource: `// src/app/page.tsx

import { ImageTrail } from "@/components/image-trail";

export default function Page() {
  return <ImageTrail className="h-96 w-full" />;
}`,
      },
      {
        title: "Magnetic, with a headline",
        Preview: Previews.PreviewImageTrailMagnetic,
        reactSource: `// src/app/page.tsx

import { ImageTrail } from "@/components/image-trail";

export default function Page() {
  return (
    <ImageTrail magneticEffect magneticStrength={0.5} spacing={36} duration={1600} cornerRadius={48} className="h-96 w-full">
      <div className="pointer-events-none flex h-full items-center justify-center">
        <h2 className="text-3xl font-semibold tracking-tight">Summer, collected.</h2>
      </div>
    </ImageTrail>
  );
}`,
      },
    ],
    reactSource: `// src/app/page.tsx

import { ImageTrail } from "@/components/image-trail";

const photos = [
  { src: "/photos/coast.jpg", alt: "Coast" },
  { src: "/photos/market.jpg", alt: "Market" },
  { src: "/photos/peaks.jpg", alt: "Peaks" },
  { src: "/photos/harbour.jpg", alt: "Harbour" },
];

export default function Page() {
  return (
    <ImageTrail images={photos} imageSize={140} spacing={56} className="h-[520px] w-full">
      <div className="pointer-events-none flex h-full items-center justify-center">
        <h1 className="text-6xl font-semibold tracking-tight">Go somewhere.</h1>
      </div>
    </ImageTrail>
  );
}`,
    tailwindSource: `"use client";

import { ImageTrail } from "@/components/image-trail";

const IMAGES = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", alt: "Mountains" },
  { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80", alt: "Forest" },
  { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=80", alt: "Valley" },
  { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&q=80", alt: "Autumn" },
];

export function ImageTrailExample() {
  return (
    <ImageTrail
      images={IMAGES}
      spacing={36}
      duration={900}
      imageSize={120}
      cornerRadius={10}
      fadeOutBlur={6}
      className="h-96 w-full rounded-2xl border border-border bg-muted/20"
    >
      <div className="pointer-events-none flex h-full items-center justify-center">
        <p className="select-none text-sm text-muted-foreground/50">Move cursor here</p>
      </div>
    </ImageTrail>
  );
}`,
    resourceLinks: [{ label: "Live demo", href: "/demos/image-trail" }],
  },
  {
    slug: "avatar-group",
    name: "Avatar Group",
    description: "An overlapping stack of avatars that behaves like a dock: the face under the pointer swells and rises, its neighbours lean out of the way and a single name pill glides from face to face. Past a maximum a +N chip opens the rest, and every avatar is focusable from the keyboard.",
    categorySlug: "motion-effects",
    tags: ["avatar", "avatar stack", "team", "people", "tooltip", "dock", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 115,
    createdAt: "2026-05-21T00:00:00.000Z",
    animationKinds: ["hover", "spring", "magnetic"],
    dependencies: ["framer-motion"],
    props: [
      { name: "avatars", type: "AvatarData[]", description: "People to show: { src?, alt?, fallback, tooltip?, bgColor? }. Defaults to an example team." },
      { name: "size", type: "number", defaultValue: "40", description: "Avatar diameter in px." },
      { name: "overlap", type: "number", defaultValue: "10", description: "Pixel overlap between neighbours." },
      { name: "max", type: "number", description: "Show at most this many, then a +N chip that expands the rest." },
      { name: "hoverAnimation", type: "\"lift\" | \"scale\" | \"rotate\" | \"up\" | \"none\"", defaultValue: "\"lift\"", description: "How faces near the pointer react: lift swells, rises and spreads; scale only swells; rotate fans; up only rises." },
      { name: "hoverScale", type: "number", defaultValue: "1.3", description: "Largest scale a face reaches right under the pointer." },
      { name: "showTooltips", type: "boolean", defaultValue: "true", description: "Show the gliding name pill." },
      { name: "borderWidth", type: "number", defaultValue: "2", description: "Width of the ring around each face, in px." },
      { name: "borderColor", type: "string", description: "Ring colour. Defaults to white, or the dark surface colour in dark mode." },
      { name: "entranceAnimation", type: "\"none\" | \"fade\" | \"flip\" | \"slide\" | \"scale\" | \"bounce\"", defaultValue: "\"scale\"", description: "How faces appear on mount." },
      { name: "entranceStagger", type: "number", defaultValue: "0.05", description: "Seconds between each face's entrance." },
      { name: "onSelect", type: "(avatar: AvatarData, index: number) => void", description: "Called when a face is clicked or activated with the keyboard." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps a virtual pointer across the stack until someone points at it." },
    ],
    Preview: Previews.PreviewAvatarGroupRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { AvatarGroup, type AvatarData } from "@/components/avatar-group";

const team: AvatarData[] = [
  { src: "/avatars/aiko.jpg", fallback: "AK", tooltip: "Aiko Kimura" },
  { src: "/avatars/mateo.jpg", fallback: "MR", tooltip: "Mateo Ruiz" },
  { fallback: "SN", tooltip: "Sofia Novak" },
  { fallback: "JO", tooltip: "James Okafor" },
  { fallback: "LP", tooltip: "Lena Park" },
  { fallback: "DV", tooltip: "Dev Varma" },
  { fallback: "EB", tooltip: "Elsa Berg" },
];

export default function Page() {
  return <AvatarGroup avatars={team} size={44} overlap={12} max={5} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "feature-tools-card",
    name: "Feature Tools Card",
    description: "An integrations card: five tool icons ride a slow ring round your app's hub, each wired to it by a line that carries small packets inward. Bring the pointer near and the tools lean toward it like magnets, their line lights up and they snap back with a wobble when it moves away, while the whole card tilts toward the pointer.",
    categorySlug: "cards",
    tags: ["card", "integrations", "icons", "magnetic", "orbit", "tilt", "3d", "feature", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 130,
    createdAt: "2026-05-21T00:00:00.000Z",
    animationKinds: ["hover", "magnetic", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: "\"Connects with your stack\"", description: "Card heading." },
      { name: "description", type: "string", description: "Line under the heading." },
      { name: "icon1 ... icon5", type: "ReactNode", description: "Replace the drawn mail, chat, calendar, docs and cloud glyphs (shown on a white tile)." },
      { name: "hubIcon", type: "ReactNode", description: "Logo in the hub the tools connect to." },
      { name: "cardBg", type: "string", description: "CSS background for the card. Defaults to white, dark grey in dark mode." },
      { name: "enableTilt", type: "boolean", defaultValue: "true", description: "3D tilt toward the pointer." },
      { name: "tiltStrength", type: "number", defaultValue: "8", description: "Maximum tilt in degrees." },
      { name: "enableMagnetic", type: "boolean", defaultValue: "true", description: "Icons lean toward the pointer." },
      { name: "magneticStrength", type: "number", defaultValue: "0.4", description: "Share of the distance an icon travels toward the pointer, 0 to 1." },
      { name: "magneticRadius", type: "number", defaultValue: "120", description: "Distance at which an icon starts to feel the pointer, in px." },
      { name: "enableOrbit", type: "boolean", defaultValue: "true", description: "Icons ride slowly round the ring." },
      { name: "orbitSpeed", type: "number", defaultValue: "36", description: "Seconds per full turn of the ring." },
      { name: "orbitColor", type: "string", description: "Colour of the dashed ring." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps a virtual pointer round the ring until someone touches the card." },
      { name: "className", type: "string", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewFeatureToolsCardRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { FeatureToolsCard } from "@/components/feature-tools-card";

export default function Page() {
  return (
    <FeatureToolsCard
      title="Works with your tools"
      description="Connect mail, chat and storage in a couple of clicks."
      icon1={<img src="/logos/mail.svg" alt="" />}
      icon2={<img src="/logos/chat.svg" alt="" />}
      hubIcon={<img src="/logo.svg" alt="" className="size-7" />}
      magneticStrength={0.5}
      orbitSpeed={30}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "link-preview",
    name: "Link Preview",
    description: "An inline link that lifts a preview card out of the text on hover or keyboard focus. The card rises with a stretch and settles, leans and slides as the pointer moves along the link, and draws its own cover from the title and site when no image is given. Also includes Cursor Card: A preview card trails your cursor through a project list, leans into your movement and swaps content row to row without disappearing.",
    categorySlug: "motion-effects",
    tags: ["link", "tooltip", "hover card", "preview", "blog", "inline", "motion kit", "framer-motion", "cursor card"],
    premium: false,
    trendingScore: 88,
    createdAt: "2026-05-21T00:00:00.000Z",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "href", type: "string", description: "Destination: an internal path or a full URL." },
      { name: "children", type: "React.ReactNode", description: "The link text." },
      { name: "image", type: "string", description: "Picture for the card. Without one the card draws a cover from the title and site name." },
      { name: "title", type: "string", description: "Card heading." },
      { name: "description", type: "string", description: "One or two lines under the heading." },
      { name: "width", type: "number", defaultValue: "300", description: "Card width in px." },
      { name: "height", type: "number", defaultValue: "168", description: "Height of the picture area in px." },
      { name: "delay", type: "number", defaultValue: "0.08", description: "Wait before the card rises, in seconds." },
      { name: "open", type: "boolean", description: "Controls the card from outside. Leave unset to open on hover and focus." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and closes the card on its own until someone hovers or focuses the link." },
      { name: "openInNewTab", type: "boolean", defaultValue: "true", description: "Opens the link in a new tab." },
      { name: "className", type: "string", description: "Extra classes for the link." },
      { name: "previewClassName", type: "string", description: "Extra classes for the floating card." },
      { name: "CursorCard.items", type: "CursorCardItem[]", defaultValue: "CURSOR_CARD_ITEMS", description: "Cursor Card: the rows of the list, each { title, kind, year, colors: [from, to], href? }. Rows without an href only drive the card." },
      { name: "CursorCard.ctaLabel", type: "string", defaultValue: "\"View case study\"", description: "Cursor Card: text of the call to action at the foot of the card." },
      { name: "CursorCard.autoplay", type: "boolean", defaultValue: "false", description: "Cursor Card: the card visits each row in turn until someone points at the list or focuses a row. Never runs under reduced motion." },
      { name: "CursorCard.className", type: "string", description: "Cursor Card: extra classes for the wrapper." },
    ],
    Preview: Previews.PreviewLinkPreviewRedesign,
    previewSections: [
      {
        title: "Link Preview",
        Preview: Previews.PreviewLinkPreviewRedesign,
        reactSource: `// src/app/page.tsx

import { LinkPreview } from "@/components/link-preview";

export default function Page() {
  return (
    <p className="max-w-prose text-lg leading-relaxed">
      We rebuilt the editor on top of{" "}
      <LinkPreview href="https://react.dev" title="React" description="The library for web and native user interfaces." image="/og/react.png">
        React
      </LinkPreview>{" "}
      and wrote up{" "}
      <LinkPreview href="/blog/framer-motion-nextjs-animations" title="Animating Next.js with Framer Motion" description="A complete guide to motion in a Next.js app." openInNewTab={false}>
        how we handle the animation
      </LinkPreview>
      .
    </p>
  );
}`,
      },
      {
        title: "Cursor Card",
        Preview: Previews.PreviewCursorCard,
        reactSource: `// src/app/page.tsx

import { CursorCard, type CursorCardItem } from "@/components/link-preview";

const work: CursorCardItem[] = [
  { title: "Harbor Lights", kind: "Brand and site", year: "2026", colors: ["#0a84ff", "#5e5ce6"], href: "/work/harbor-lights" },
  { title: "Fernwick", kind: "Booking app", year: "2025", colors: ["#ff9f0a", "#ff375f"], href: "/work/fernwick" },
  { title: "Moorgate", kind: "Dashboard", year: "2024", colors: ["#64d2ff", "#30d158"], href: "/work/moorgate" },
];

export default function Page() {
  return <CursorCard items={work} ctaLabel="Read the story" />;
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { LinkPreview } from "@/components/link-preview";

export default function Page() {
  return (
    <p className="max-w-prose text-lg leading-relaxed">
      We rebuilt the editor on top of{" "}
      <LinkPreview href="https://react.dev" title="React" description="The library for web and native user interfaces." image="/og/react.png">
        React
      </LinkPreview>{" "}
      and wrote up{" "}
      <LinkPreview href="/blog/framer-motion-nextjs-animations" title="Animating Next.js with Framer Motion" description="A complete guide to motion in a Next.js app." openInNewTab={false}>
        how we handle the animation
      </LinkPreview>
      .
    </p>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tick-slider",
    name: "Tick Slider",
    registryCliName: "tick-slider",
    description: "A slider drawn as a row of ticks that fill with colour up to the value. Ticks swell in a wave around the pointer and the needle, the needle leans into the direction it moves and swings upright when it stops, and the number above rolls digit by digit.",
    categorySlug: "inputs-controls",
    tags: ["slider", "range", "ticks", "input", "volume", "rolling number", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 168,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "value", type: "number", description: "Controlled value." },
      { name: "defaultValue", type: "number", defaultValue: "50", description: "Starting value when uncontrolled." },
      { name: "onChange", type: "(value: number) => void", description: "Called with the snapped value while dragging and on key presses." },
      { name: "onCommit", type: "(value: number) => void", description: "Called once when a drag or key press settles." },
      { name: "min", type: "number", defaultValue: "0", description: "Lowest value." },
      { name: "max", type: "number", defaultValue: "100", description: "Highest value." },
      { name: "step", type: "number", defaultValue: "1", description: "Values snap to multiples of this." },
      { name: "ticks", type: "number", defaultValue: "36", description: "How many tick marks the track is drawn with." },
      { name: "label", type: "string", description: "Visible label above the track; also the accessible name." },
      { name: "unit", type: "string", description: "Suffix after the number, e.g. \"%\"." },
      { name: "accent", type: "string", description: "Colour of the filled ticks and the needle. Defaults to system blue." },
      { name: "size", type: "\"sm\" | \"md\" | \"lg\"", defaultValue: "\"md\"", description: "Tick height and number size." },
      { name: "showValue", type: "boolean", defaultValue: "true", description: "Show the rolling number above the track." },
      { name: "magnify", type: "number", defaultValue: "0.55", description: "How much ticks near the pointer and needle grow; 0 turns the wave off." },
      { name: "hint", type: "string", defaultValue: "\"Drag across the ticks, or use the arrow keys.\"", description: "One-line caption under the track; an empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps the needle to a few values until someone touches it." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Dims the slider and ignores input." },
    ],
    Preview: Previews.PreviewTickSliderRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { TickSlider } from "@/components/tick-slider";

export default function Page() {
  const [size, setSize] = useState(24);

  return (
    <TickSlider
      label="Brush size"
      value={size}
      onChange={setSize}
      min={1}
      max={64}
      unit="px"
      ticks={32}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "time-scrubber",
    name: "Time Scrubber",
    registryCliName: "time-scrubber",
    description: "A time picker drawn as a ruler you drag or fling under a fixed needle. The ruler coasts and lands exactly on a snap point, the needle ticks at every interval it crosses and bounces when the ruler lands, the digits roll and a small sky chip shifts from night to dawn to day.",
    categorySlug: "inputs-controls",
    tags: ["time picker", "ruler", "scrubber", "input", "inertia", "rolling number", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 163,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "value", type: "number", description: "Controlled value in minutes since midnight (0-1439)." },
      { name: "defaultValue", type: "number", defaultValue: "570", description: "Starting value when uncontrolled (9:30)." },
      { name: "onChange", type: "(minutes: number) => void", description: "Called with the snapped time whenever the user changes it." },
      { name: "onCommit", type: "(minutes: number) => void", description: "Called once the ruler comes to rest after a user change." },
      { name: "interval", type: "number", defaultValue: "15", description: "Minutes the ruler snaps to." },
      { name: "format", type: "\"12h\" | \"24h\"", defaultValue: "\"12h\"", description: "Clock format for the readout and hour labels." },
      { name: "density", type: "number", defaultValue: "1.6", description: "Pixels per minute on the ruler; larger spreads the hours out." },
      { name: "accent", type: "string", description: "Needle colour. Defaults to system blue." },
      { name: "label", type: "string", description: "Caption above the time, e.g. \"Pickup\"." },
      { name: "hint", type: "string", defaultValue: "\"Drag the ruler, or fling it.\"", description: "One-line hint under the ruler; an empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Flings the ruler to a few times of day until someone touches it." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Dims the picker and ignores input." },
    ],
    Preview: Previews.PreviewTimeScrubberRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { TimeScrubber } from "@/components/time-scrubber";

export default function Page() {
  const [minutes, setMinutes] = useState(18 * 60);

  return (
    <TimeScrubber
      label="Pickup"
      value={minutes}
      onChange={setMinutes}
      interval={10}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "slide-to-confirm",
    name: "Slide to Confirm",
    registryCliName: "slide-to-confirm",
    description: "A slide-to-confirm track for payments and other deliberate actions. The knob stretches along the track in proportion to how fast you drag it and squashes back when it stops, the label shimmers and fades as you pull, and past the threshold the track floods with the success colour while a check draws itself.",
    categorySlug: "inputs-controls",
    tags: ["slider", "confirm", "swipe", "payment", "button", "squash and stretch", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 172,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: "\"Slide to confirm\"", description: "Text inside the track before confirming." },
      { name: "successLabel", type: "string", defaultValue: "\"Confirmed\"", description: "Text shown once confirmed." },
      { name: "pendingLabel", type: "string", defaultValue: "\"Confirming\"", description: "Text shown while onConfirm is pending." },
      { name: "onConfirm", type: "() => void | Promise<unknown>", description: "Runs when the knob reaches the end. Return a promise to show a pending state; reject to bounce back." },
      { name: "threshold", type: "number", defaultValue: "0.9", description: "How far (0-1) the knob must travel before letting go confirms." },
      { name: "resetAfter", type: "number", defaultValue: "2200", description: "Return to the start this many ms after success; 0 keeps the success state." },
      { name: "accent", type: "string", description: "Colour of the trail and the arrow. Defaults to system blue." },
      { name: "successColor", type: "string", defaultValue: "\"#248a3d\"", description: "Track colour once confirmed." },
      { name: "size", type: "\"sm\" | \"md\" | \"lg\"", defaultValue: "\"md\"", description: "Track height and default width." },
      { name: "width", type: "number", description: "Track width in px. Defaults per size (260, 300, 340)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Slides itself across and confirms (without calling onConfirm) until someone touches it." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Dims the track and ignores input." },
    ],
    Preview: Previews.PreviewSlideToConfirmRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { SlideToConfirm } from "@/components/slide-to-confirm";

async function pay() {
  const res = await fetch("/api/pay", { method: "POST" });
  if (!res.ok) throw new Error("Payment failed");
}

export default function Page() {
  return (
    <SlideToConfirm
      label="Slide to pay $24.00"
      pendingLabel="Paying"
      successLabel="Paid"
      onConfirm={pay}
      resetAfter={0}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "emoji-reactions",
    name: "Emoji Reactions",
    registryCliName: "emoji-reactions",
    description:
      "A message with reaction chips that pop and roll their counts when tapped, plus a spring picker that adds new reactions with a layout animation. Also includes the Motion Kit Spark Reactions variant.",
    categorySlug: "inputs-controls",
    tags: ["motion kit", "reactions", "emoji", "chat", "message", "picker", "counter", "social", "framer-motion"],
    premium: true,
    trendingScore: 166,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "message", type: "React.ReactNode", defaultValue: '"Shipped the new onboarding flow"', description: "Text in the message bubble. Pass null to show only the reactions." },
      { name: "reactions", type: "{ emoji: string; count: number; reacted?: boolean }[]", defaultValue: "[🚀 3, 🔥 2]", description: "Starting reactions." },
      { name: "emojis", type: "string[]", defaultValue: '["👍", "❤️", "😂", "🎉", "🔥", "🚀", "👀", "🙏"]', description: "Emojis offered in the picker." },
      { name: "onChange", type: "(reactions: Reaction[]) => void", description: "Called whenever the reaction list changes." },
      { name: "accent", type: "string", defaultValue: '"#5b8def"', description: "Ring and tint colour for reactions you've added." },
      { name: "className", type: "string", description: "Extra classes on the wrapper." },
      { name: "SparkReactions.message", type: "string", defaultValue: "\"Shipped the new onboarding flow\"", description: "The message the reactions belong to." },
      { name: "SparkReactions.reactions", type: "SparkReaction[]", defaultValue: "DEFAULT_SPARK_REACTIONS", description: "Starting row, each { id, count, mine } (rocket 3 and fire 2 by default)." },
      { name: "SparkReactions.options", type: "SparkReactionOption[]", defaultValue: "DEFAULT_SPARK_OPTIONS", description: "Reactions in the picker, each { id, label, d, color, darkColor? }; also the icons for reactions." },
      { name: "SparkReactions.onChange", type: "(reactions: SparkReaction[]) => void", description: "Called with the new row after the user adds or removes a reaction." },
      { name: "SparkReactions.autoplay", type: "boolean", defaultValue: "false", description: "Reacts, opens the picker and un-reacts on a loop until someone touches it." },
      { name: "SparkReactions.className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewEmojiReactions,
    previewSections: [
      {
        title: "Emoji Reactions",
        Preview: Previews.PreviewEmojiReactions,
        reactSource: `// src/app/page.tsx

import { EmojiReactions, type Reaction } from "@/components/emoji-reactions";

const initial: Reaction[] = [
  { emoji: "🚀", count: 3 },
  { emoji: "🔥", count: 2, reacted: true },
];

export default function Page() {
  return (
    <EmojiReactions
      message="Shipped the new onboarding flow"
      reactions={initial}
      emojis={["👍", "❤️", "😂", "🎉", "🔥", "🚀", "👀", "🙏"]}
      accent="#5b8def"
    />
  );
}`,
      },
      {
        title: "Spark Reactions",
        Preview: Previews.PreviewSparkReactions,
        reactSource: `// src/app/page.tsx

import { SparkReactions } from "@/components/emoji-reactions";

export default function Page() {
  return (
    <SparkReactions
      message="v2.4 is live for everyone"
      reactions={[
        { id: "party", count: 8, mine: true },
        { id: "rocket", count: 5, mine: false },
      ]}
    />
  );
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { EmojiReactions, type Reaction } from "@/components/emoji-reactions";

const initial: Reaction[] = [
  { emoji: "🚀", count: 3 },
  { emoji: "🔥", count: 2, reacted: true },
];

export default function Page() {
  return (
    <EmojiReactions
      message="Shipped the new onboarding flow"
      reactions={initial}
      emojis={["👍", "❤️", "😂", "🎉", "🔥", "🚀", "👀", "🙏"]}
      accent="#5b8def"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "like-burst",
    name: "Like Burst",
    registryCliName: "like-burst",
    description:
      "A like button whose heart squashes and fills with a ring shockwave and a particle burst, while the count rolls digit by digit. Also includes the Motion Kit Confetti Like variant.",
    categorySlug: "inputs-controls",
    tags: ["motion kit", "like", "heart", "button", "counter", "burst", "particles", "micro-interaction", "framer-motion"],
    premium: true,
    trendingScore: 168,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion", "lucide-react"],
    props: [
      { name: "count", type: "number", description: "Controlled like count." },
      { name: "defaultCount", type: "number", defaultValue: "1299", description: "Starting count when uncontrolled." },
      { name: "liked", type: "boolean", description: "Controlled liked state." },
      { name: "defaultLiked", type: "boolean", defaultValue: "false", description: "Starting liked state when uncontrolled." },
      { name: "onChange", type: "(liked: boolean, count: number) => void", description: "Called with the next liked state and count." },
      { name: "color", type: "string", defaultValue: '"#ff3b5c"', description: "Heart, ring and particle colour." },
      { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Button size." },
      { name: "burst", type: "number", defaultValue: "10", description: "Particles in the burst; 0 turns it off." },
      { name: "label", type: "string", defaultValue: '"Like"', description: "Accessible label; the count is appended." },
      { name: "className", type: "string", description: "Extra classes on the button." },
      { name: "ConfettiLike.count", type: "number", defaultValue: "1300", description: "Like count without yours; liking adds one." },
      { name: "ConfettiLike.defaultLiked", type: "boolean", defaultValue: "false", description: "Whether it starts liked." },
      { name: "ConfettiLike.accent", type: "string", defaultValue: "\"#ff375f\"", description: "Heart and ring colour, as a hex value." },
      { name: "ConfettiLike.colors", type: "string[]", defaultValue: "DEFAULT_CONFETTI_COLORS", description: "Confetti colours, used in turn around the burst." },
      { name: "ConfettiLike.onChange", type: "(liked: boolean, count: number) => void", description: "Called with the new state and displayed count when the user toggles it." },
      { name: "ConfettiLike.autoplay", type: "boolean", defaultValue: "false", description: "Likes and unlikes itself every 1.5s until someone presses it." },
      { name: "ConfettiLike.className", type: "string", description: "Extra classes for the button." },
    ],
    Preview: Previews.PreviewLikeBurst,
    previewSections: [
      {
        title: "Like Burst",
        Preview: Previews.PreviewLikeBurst,
        reactSource: `// src/app/page.tsx
"use client"; // onChange is a function, which a server page cannot hand to a client component

import { LikeBurst } from "@/components/like-burst";

export default function Page() {
  return (
    <LikeBurst
      defaultCount={128}
      defaultLiked={false}
      color="#ff3b5c"
      onChange={(liked) => {
        // Replace with your own request.
        void fetch("/api/posts/42/like", { method: liked ? "POST" : "DELETE" });
      }}
    />
  );
}`,
      },
      {
        title: "Confetti Like",
        Preview: Previews.PreviewConfettiLike,
        reactSource: `// src/app/page.tsx

import { ConfettiLike } from "@/components/like-burst";

export default function Page() {
  return (
    <ConfettiLike
      count={2481}
      accent="#ff375f"
    />
  );
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client"; // onChange is a function, which a server page cannot hand to a client component

import { LikeBurst } from "@/components/like-burst";

export default function Page() {
  return (
    <LikeBurst
      defaultCount={128}
      defaultLiked={false}
      color="#ff3b5c"
      onChange={(liked) => {
        // Replace with your own request.
        void fetch("/api/posts/42/like", { method: liked ? "POST" : "DELETE" });
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "toast-stack",
    name: "Toast Stack",
    registryCliName: "toast-stack",
    description: "Notifications that rest in a tidy stack: a new toast drops onto the pile squashed and springs into shape, and hover or focus fans the stack into a list. Fling a toast sideways and it tilts and skids off; with a duration set, the front toast counts down along its bottom edge and waits while the stack is open. Also includes Undo Toast, where an archived row shrinks into the toast, a ring counts down around Undo, and undo drops the row back in place. Also includes Promise Toast, a pill that follows a deploy step by step with progress filling behind the words and lands on a live link or an error with a way to the logs.",
    categorySlug: "cards",
    tags: ["toast", "notification", "snackbar", "stack", "swipe", "dismiss", "feedback", "motion kit", "framer-motion", "undo toast", "archive undo", "countdown ring", "promise toast", "progress toast", "deploy"],
    premium: false,
    trendingScore: 171,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "drag", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "toasts", type: "ToastItem[]", description: "Toasts in arrival order; the last sits at the front. Each has id, title, description?, type? (success | error | info | warning) and action? ({ label })." },
      { name: "onDismiss", type: "(id: string) => void", description: "Called when a toast is swiped away, closed, times out, or dismissed with Escape." },
      { name: "onAction", type: "(toast: ToastItem) => void", description: "Called when a toast's action button is pressed." },
      { name: "position", type: "\"top\" | \"bottom\"", defaultValue: "\"bottom\"", description: "Which edge the stack grows from." },
      { name: "expand", type: "\"hover\" | \"always\"", defaultValue: "\"hover\"", description: "Fan out on hover/focus, or stay fanned out." },
      { name: "max", type: "number", defaultValue: "3", description: "How many toasts are drawn at once." },
      { name: "width", type: "number", defaultValue: "340", description: "Toast width in px; shrinks to fit narrow containers." },
      { name: "duration", type: "number", defaultValue: "0", description: "Dismiss the front toast after this many ms, paused while the stack is open. 0 keeps toasts until closed." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Fans the stack open and swipes the front toast away every few seconds until someone touches it." },
      { name: "className", type: "string", description: "Extra classes on the stack." },
      { name: "UndoToast.mails", type: "UndoToastMail[]", defaultValue: "four demo messages", description: "The rows in the list: id, from, subject, time and an avatar colour (hue)." },
      { name: "UndoToast.holdMs", type: "number", defaultValue: "5000", description: "How long the toast waits for an Undo. Hovering or focusing the toast pauses the countdown." },
      { name: "UndoToast.onArchive", type: "(mail: UndoToastMail) => void", defaultValue: "undefined", description: "Called when a row is archived." },
      { name: "UndoToast.onUndo", type: "(mails: UndoToastMail[]) => void", defaultValue: "undefined", description: "Called with the archived rows when Undo is pressed." },
      { name: "UndoToast.autoplay", type: "boolean", defaultValue: "false", description: "Archives a row and undoes it on a loop until someone touches the component. Never runs under reduced motion and pauses when off screen." },
      { name: "UndoToast.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the card." },
      { name: "PromiseToast.onVisit", type: "() => void", defaultValue: "undefined", description: "Called when Visit is pressed on the success toast. Nothing navigates by itself." },
      { name: "PromiseToast.onViewLogs", type: "() => void", defaultValue: "undefined", description: "Called when View logs is pressed on the failure toast." },
      { name: "PromiseToast.autoplay", type: "boolean", defaultValue: "false", description: "Runs a good deploy and then a failing one on a loop until someone touches the component. Never runs under reduced motion and pauses when off screen." },
      { name: "PromiseToast.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the wrapper." },
    ],
    Preview: Previews.PreviewToastStackRedesign,
    previewSections: [
      {
        title: "Toast Stack",
        Preview: Previews.PreviewToastStackRedesign,
        reactSource: `// src/app/page.tsx
"use client";

import { ToastStack, useToastStack } from "@/components/toast-stack";

export default function Page() {
  const { toasts, push, dismiss } = useToastStack();

  async function pay() {
    const ok = await fetch("/api/pay", { method: "POST" }).then((r) => r.ok);
    push(
      ok
        ? { type: "success", title: "Payment received", description: "Receipt sent to your inbox." }
        : { type: "error", title: "Payment declined", description: "Try another card.", action: { label: "Retry" } },
    );
  }

  return (
    <>
      <button onClick={pay}>Pay now</button>
      <div className="fixed bottom-6 right-6 z-50">
        <ToastStack
          toasts={toasts}
          onDismiss={dismiss}
          duration={5000}
          onAction={(toast) => {
            dismiss(toast.id);
            void pay();
          }}
        />
      </div>
    </>
  );
}`,
      },
      {
        title: "Undo Toast",
        Preview: Previews.PreviewUndoToast,
        reactSource: `// src/app/page.tsx

import { UndoToast } from "@/components/toast-stack";

export default function Page() {
  return (
    <UndoToast
    />
  );
}
`,
      },
      {
        title: "Promise Toast",
        Preview: Previews.PreviewPromiseToast,
        reactSource: `// src/app/page.tsx

import { PromiseToast } from "@/components/toast-stack";

export default function Page() {
  return (
    <PromiseToast
    />
  );
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { ToastStack, useToastStack } from "@/components/toast-stack";

export default function Page() {
  const { toasts, push, dismiss } = useToastStack();

  async function pay() {
    const ok = await fetch("/api/pay", { method: "POST" }).then((r) => r.ok);
    push(
      ok
        ? { type: "success", title: "Payment received", description: "Receipt sent to your inbox." }
        : { type: "error", title: "Payment declined", description: "Try another card.", action: { label: "Retry" } },
    );
  }

  return (
    <>
      <button onClick={pay}>Pay now</button>
      <div className="fixed bottom-6 right-6 z-50">
        <ToastStack
          toasts={toasts}
          onDismiss={dismiss}
          duration={5000}
          onAction={(toast) => {
            dismiss(toast.id);
            void pay();
          }}
        />
      </div>
    </>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "upload-dropzone",
    name: "Upload Dropzone",
    registryCliName: "upload-dropzone",
    description: "A file drop target with a list of uploads. While a file hovers, a little stack of sheets fans out over a tray and the dashed edge marches; when files land the tray squashes as it swallows them, each row fills a progress ring that turns into a drawn check, and rejected files shake the zone. Also includes Avatar Upload, a profile photo picker where you drag and zoom inside a circle and a ring draws itself around the avatar as it saves. Also includes Upload Queue, a list where each row is its own progress bar with pause, cancel and a whole-card drop target that counts the files. Also includes Empty Table: Ghost columns show the shape of the data. Drop a CSV or take the sample and a scan line reads down the table as cells fill in order, columns label their types and the count rolls up.",
    categorySlug: "inputs-controls",
    tags: ["upload", "dropzone", "file", "drag and drop", "progress", "form", "motion kit", "framer-motion", "avatar upload", "profile photo", "image crop", "upload queue", "upload progress", "file list", "empty table"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accept", type: "string", description: "Same syntax as the input accept attribute, e.g. \"image/*,.pdf\"." },
      { name: "maxSize", type: "number", defaultValue: "5242880", description: "Largest file accepted, in bytes (5 MB)." },
      { name: "multiple", type: "boolean", defaultValue: "true", description: "Accept several files at once." },
      { name: "onFiles", type: "(files: File[]) => void", description: "Called with every batch of accepted files." },
      { name: "onUpload", type: "(file: File, setProgress: (p: number) => void) => Promise<void>", description: "Upload one file and report progress 0-1; reject to mark it failed. Simulated when omitted." },
      { name: "initialFiles", type: "{ name: string; size: number; type?: string; progress?: number }[]", description: "Files shown on first render; unfinished ones keep uploading." },
      { name: "title", type: "string", defaultValue: "\"Drag a file here\"", description: "Main line inside the zone." },
      { name: "hint", type: "string", description: "Secondary line. Defaults to the size limit." },
      { name: "accent", type: "string", description: "Tray, marching edge and drag tint colour. Defaults to system blue." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Drops a few example files in by itself until someone touches it." },
      { name: "disabled", type: "boolean", defaultValue: "false", description: "Dims the zone and ignores drops and clicks." },
      { name: "className", type: "string", description: "Extra classes for the 340px-wide wrapper." },
      { name: "AvatarUpload.onUpload", type: "(result: { file: File | null; src: string; zoom: number; x: number; y: number }) => void", defaultValue: "undefined", description: "Called when the simulated upload finishes, with the chosen file and framing. Nothing is sent anywhere, and src is an object URL revoked on unmount." },
      { name: "AvatarUpload.onRemove", type: "() => void", defaultValue: "undefined", description: "Called after the photo is removed or the crop is cancelled." },
      { name: "AvatarUpload.autoplay", type: "boolean", defaultValue: "false", description: "Runs a demo with a drawn photo (reach, frame, zoom, save) until someone touches the card." },
      { name: "AvatarUpload.className", type: "string", defaultValue: "undefined", description: "Extra classes for the card." },
      { name: "UploadQueue.onFiles", type: "(files: File[]) => void", defaultValue: "undefined", description: "Called with the files that were dropped or chosen. They are listed only; contents are never read or sent." },
      { name: "UploadQueue.onComplete", type: "(name: string) => void", defaultValue: "undefined", description: "Called once per row when its simulated transfer ends." },
      { name: "UploadQueue.onCancel", type: "(name: string) => void", defaultValue: "undefined", description: "Called when a row is cancelled." },
      { name: "UploadQueue.autoplay", type: "boolean", defaultValue: "false", description: "Drops in three sample files, pauses one and resumes it, in a loop, until someone touches the card." },
      { name: "UploadQueue.className", type: "string", defaultValue: "undefined", description: "Extra classes for the card." },
      { name: "EmptyTable.title", type: "string", defaultValue: "\"Customers\"", description: "Heading of the table card." },
      { name: "EmptyTable.sample", type: "EmptyTableData", defaultValue: "a small customers file", description: "The table Use sample data loads and the columns the ghost header shows: file, cols, kinds, rows and total." },
      { name: "EmptyTable.onImport", type: "(table: EmptyTableData) => void", defaultValue: "undefined", description: "Called with the parsed table after a CSV is dropped or chosen, or the sample is loaded by hand. The file is read in the browser and never sent anywhere." },
      { name: "EmptyTable.autoplay", type: "boolean", defaultValue: "false", description: "Drops the sample file in, shows the import, clears it and repeats until someone touches the component. Never runs under reduced motion and pauses when off screen." },
      { name: "EmptyTable.className", type: "string", defaultValue: "undefined", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewUploadDropzoneRedesign,
    previewSections: [
      {
        title: "Upload Dropzone",
        Preview: Previews.PreviewUploadDropzoneRedesign,
        reactSource: `// src/app/page.tsx
"use client";

import { UploadDropzone } from "@/components/upload-dropzone";

function upload(file: File, setProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => setProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(xhr.statusText)));
    xhr.onerror = () => reject(new Error("Network error"));
    const body = new FormData();
    body.append("file", file);
    xhr.send(body);
  });
}

export default function Page() {
  return (
    <UploadDropzone
      title="Drop your files"
      accept="image/*,.pdf"
      maxSize={10 * 1024 * 1024}
      onUpload={upload}
    />
  );
}`,
      },
      {
        title: "Avatar Upload",
        Preview: Previews.PreviewAvatarUpload,
        reactSource: `// src/app/page.tsx

import { AvatarUpload } from "@/components/upload-dropzone";

export default function Page() {
  return (
    <AvatarUpload
    />
  );
}
`,
      },
      {
        title: "Upload Queue",
        Preview: Previews.PreviewUploadQueue,
        reactSource: `// src/app/page.tsx

import { UploadQueue } from "@/components/upload-dropzone";

export default function Page() {
  return (
    <UploadQueue
    />
  );
}
`,
      },
      {
        title: "Empty Table",
        Preview: Previews.PreviewEmptyTable,
        reactSource: `// src/app/page.tsx

import { EmptyTable } from "@/components/upload-dropzone";

export default function Page() {
  return (
    <EmptyTable
      title="Customers"
    />
  );
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { UploadDropzone } from "@/components/upload-dropzone";

function upload(file: File, setProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => setProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(xhr.statusText)));
    xhr.onerror = () => reject(new Error("Network error"));
    const body = new FormData();
    body.append("file", file);
    xhr.send(body);
  });
}

export default function Page() {
  return (
    <UploadDropzone
      title="Drop your files"
      accept="image/*,.pdf"
      maxSize={10 * 1024 * 1024}
      onUpload={upload}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "hold-to-record",
    name: "Hold to Record",
    registryCliName: "hold-to-record",
    description: "Press and hold to record a voice note, release to keep it. A soft halo behind the record dot swells with your voice, the live waveform scrolls in from the right, and sliding left morphs the dot into a bin whose lid opens; let go there to throw the note away. Kept notes become a small player. Also includes Voice Dictation: Bars move with your voice, words arrive faint while they're guesses and firm up when sure, and corrections like “for” to “4” visibly swap in place.",
    categorySlug: "inputs-controls",
    tags: ["voice note", "record", "audio", "microphone", "hold", "waveform", "chat", "motion kit", "framer-motion", "voice dictation"],
    premium: true,
    trendingScore: 162,
    createdAt: "2026-10-19",
    animationKinds: ["press", "drag", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "onRecorded", type: "(result: { durationMs: number; levels: number[] }) => void", description: "Called when a recording is kept." },
      { name: "onCancel", type: "() => void", description: "Called when a recording is cancelled by sliding left or pressing Escape." },
      { name: "onDelete", type: "() => void", description: "Called when the kept note is deleted." },
      { name: "maxDuration", type: "number", defaultValue: "60000", description: "Recording stops by itself after this many ms." },
      { name: "minDuration", type: "number", defaultValue: "400", description: "Holds shorter than this are ignored, in ms." },
      { name: "useMicrophone", type: "boolean", defaultValue: "false", description: "Drive the waveform from the real microphone (asks for permission). Simulated otherwise." },
      { name: "cancelDistance", type: "number", defaultValue: "90", description: "How far to slide left, in px, before releasing cancels." },
      { name: "label", type: "string", defaultValue: "\"Hold to record\"", description: "Button label." },
      { name: "accent", type: "string", defaultValue: "\"#ff3b30\"", description: "Colour of the record button, the halo and the live waveform." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Records, plays and deletes a demo note on a loop (no callbacks fire) until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the wrapper." },
      { name: "VoiceDictation.script", type: "VoiceDictationWord[]", defaultValue: "a short reminder", description: "The words the demo hears, in order. Each has w, an optional fix (the word it becomes once there is more context) and an optional pause in ms before it arrives." },
      { name: "VoiceDictation.title", type: "string", defaultValue: "\"New reminder\"", description: "Label at the top left of the card." },
      { name: "VoiceDictation.onSave", type: "(text: string) => void", defaultValue: "undefined", description: "Called with the finished text when Save is pressed. The card then goes back to its start. No microphone is used." },
      { name: "VoiceDictation.autoplay", type: "boolean", defaultValue: "false", description: "Starts a dictation, lets it finish and repeats until someone touches the component. Never runs under reduced motion and pauses when off screen." },
      { name: "VoiceDictation.className", type: "string", defaultValue: "undefined", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewHoldToRecordRedesign,
    previewSections: [
      {
        title: "Hold to Record",
        Preview: Previews.PreviewHoldToRecordRedesign,
        reactSource: `// src/app/page.tsx

import { HoldToRecord } from "@/components/hold-to-record";

export default function Page() {
  return (
    <HoldToRecord
      useMicrophone
      maxDuration={30_000}
    />
  );
}`,
      },
      {
        title: "Voice Dictation",
        Preview: Previews.PreviewVoiceDictation,
        reactSource: `// src/app/page.tsx

import { VoiceDictation } from "@/components/hold-to-record";

export default function Page() {
  return (
    <VoiceDictation
      title="New reminder"
    />
  );
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { HoldToRecord } from "@/components/hold-to-record";

export default function Page() {
  return (
    <HoldToRecord
      useMicrophone
      maxDuration={30_000}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "cursor-buddy",
    name: "Cursor Buddy",
    registryCliName: "cursor-buddy",
    description: "A soft little character whose eyes follow the pointer anywhere on the page, sliding round its curved face and narrowing near the edge. It blinks, flinches when you come close, dozes off when left alone, and hops with a squash and stretch when you click it or press Enter.",
    categorySlug: "motion-effects",
    tags: ["eyes", "cursor", "follow", "mascot", "character", "playful", "empty state", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 172,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "press", "spring", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "shape", type: "\"squircle\" | \"pill\" | \"circle\"", defaultValue: "\"squircle\"", description: "Silhouette of the character." },
      { name: "fill", type: "\"light\" | \"dark\" | string", defaultValue: "\"light\"", description: "Body colour: the light or dark preset, or any CSS colour." },
      { name: "eyes", type: "\"dots\" | \"slits\" | \"squares\"", defaultValue: "\"dots\"", description: "Eye style." },
      { name: "size", type: "number", defaultValue: "120", description: "Height of the body in px. The pill is wider than it is tall." },
      { name: "follow", type: "number", defaultValue: "60", description: "How far the head turns towards the pointer, 0 to 100." },
      { name: "sleepAfter", type: "number", defaultValue: "9000", description: "Falls asleep after this many ms without pointer movement. 0 keeps it awake." },
      { name: "eyeColor", type: "string", description: "Eye colour. Defaults to ink on light bodies and white on dark ones." },
      { name: "poke", type: "boolean", defaultValue: "true", description: "Click, tap, Enter or Space makes it hop. Turn off for a purely decorative buddy." },
      { name: "onPoke", type: "() => void", description: "Called after each poke." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Looks around and hops now and then until the pointer first moves." },
      { name: "className", type: "string", description: "Classes for the outer wrapper." },
    ],
    Preview: Previews.PreviewCursorBuddyRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { CursorBuddy } from "@/components/cursor-buddy";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-5 py-16 text-center">
      <CursorBuddy shape="squircle" eyes="dots" size={96} follow={70} />
      <div>
        <p className="text-base font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Nothing here yet</p>
        <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">New messages will land right here.</p>
      </div>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "dot-sphere",
    name: "Dot Sphere",
    registryCliName: "dot-sphere",
    description: "A turning sphere of dots drawn on canvas: the pointer parts the dots as it passes, and dragging spins it in any direction before it coasts back to its idle turn. Tap it and a ripple rolls out from that spot, swelling the dots and lighting them in the accent colour as it wraps round the far side.",
    categorySlug: "motion-effects",
    tags: ["canvas", "sphere", "globe", "dots", "particles", "ripple", "drag", "hero visual", "motion kit"],
    premium: true,
    trendingScore: 168,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "drag", "press", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "dots", type: "number", defaultValue: "420", description: "Number of dots spread over the sphere." },
      { name: "radius", type: "number", defaultValue: "130", description: "Sphere radius in px. The canvas adds room for dots pushed outwards; it scales down in narrow containers." },
      { name: "color", type: "string", description: "Dot colour. Defaults to near-black, or near-white in dark mode." },
      { name: "accent", type: "string", description: "Ripple colour. Defaults to system blue." },
      { name: "repel", type: "number", defaultValue: "55", description: "How hard the pointer pushes dots away, 0–100." },
      { name: "speed", type: "number", defaultValue: "30", description: "Idle spin speed, 0–100." },
      { name: "dotSize", type: "number", defaultValue: "3.4", description: "Base dot diameter in px; front dots draw larger, back dots smaller." },
      { name: "interactive", type: "boolean", defaultValue: "true", description: "Let the pointer push dots, drag to spin and tap for ripples." },
      { name: "hint", type: "string", defaultValue: "\"Drag to spin. Tap for a ripple.\"", description: "Hint under the sphere. An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sends ripples from different points and flicks the sphere round until someone touches it." },
      { name: "className", type: "string", description: "Classes for the root." },
    ],
    Preview: Previews.PreviewDotSphereRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { DotSphere } from "@/components/dot-sphere";

export default function Page() {
  return (
    <section className="grid items-center gap-10 py-20 md:grid-cols-2">
      <div>
        <h1 className="text-5xl font-semibold tracking-tight">Everywhere at once.</h1>
        <p className="mt-4 max-w-md text-lg text-neutral-500">Edge regions on every continent, one deploy away.</p>
      </div>
      <div className="flex justify-center">
        <DotSphere radius={160} dots={600} accent="#30d158" hint="" />
      </div>
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "dynamic-island",
    name: "Dynamic Island",
    registryCliName: "dynamic-island",
    description: "A black pill that grows into whatever is happening: a running timer, the song that is playing or an incoming call. Each change stretches it, the width shooting out first and the height catching up on a looser spring, and tapping it opens live controls.",
    categorySlug: "cards",
    tags: ["dynamic island", "pill", "morph", "timer", "music player", "call", "notification", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 170,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "state", type: "\"idle\" | \"timer\" | \"music\" | \"call\"", description: "Controlled activity shown in the island." },
      { name: "defaultState", type: "\"idle\" | \"timer\" | \"music\" | \"call\"", defaultValue: "\"timer\"", description: "Starting activity when uncontrolled." },
      { name: "onStateChange", type: "(state: IslandState) => void", description: "Called when the island changes activity (stop, decline, or a cycle step)." },
      { name: "timerSeconds", type: "number", defaultValue: "300", description: "Length of the countdown in seconds. It really ticks." },
      { name: "accent", type: "string", defaultValue: "\"#ff9f0a\"", description: "Accent colour for the timer and the music bars." },
      { name: "cycle", type: "number", defaultValue: "0", description: "Uncontrolled only: step through states every this many ms. 0 stays put." },
      { name: "states", type: "IslandState[]", defaultValue: "[\"timer\", \"music\", \"call\"]", description: "Activities visited by cycle and autoplay." },
      { name: "track", type: "{ title: string; artist: string }", defaultValue: "{ title: \"Midnight Drive\", artist: \"Harbor Lights\" }", description: "Track shown in the music activity." },
      { name: "caller", type: "string", defaultValue: "\"Ava Lin\"", description: "Name shown in the call activity." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Uncontrolled only: morphs through the activities and opens each one until someone touches it." },
      { name: "className", type: "string", description: "Classes for the outer wrapper." },
    ],
    Preview: Previews.PreviewDynamicIslandRedesign,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import * as React from "react";
import { DynamicIsland, type IslandState } from "@/components/dynamic-island";

export default function Page() {
  const [activity, setActivity] = React.useState<IslandState>("timer");

  return (
    <header className="flex justify-center pt-3">
      <DynamicIsland
        state={activity}
        onStateChange={setActivity}
        timerSeconds={25 * 60}
        accent="#ff9f0a"
        track={{ title: "Midnight Drive", artist: "Harbor Lights" }}
      />
    </header>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "otp-input",
    name: "OTP Input",
    registryCliName: "otp-input",
    description:
      "A six-box one-time-code field: digits spring in as you type, the boxes ripple while the code is checked, shake on a wrong code, and fold into a Verified pill on success.",
    categorySlug: "inputs-controls",
    tags: ["otp", "one-time code", "verification", "2fa", "pin", "input", "motion kit", "framer-motion", "otp autofill", "sms code", "one-time code autofill", "underline otp", "authenticator code", "boxless otp"],
    premium: false,
    trendingScore: 168,
    createdAt: "2026-10-19",
    animationKinds: ["type", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "length", type: "number", defaultValue: "6", description: "Number of digits. The boxes split into two groups at the middle." },
      { name: "verify", type: "(code: string) => boolean | Promise<boolean>", description: "Return true when the code is valid. Runs once every box is filled." },
      { name: "onVerified", type: "(code: string) => void", description: "Called after a code verifies." },
      { name: "onResend", type: "() => void", description: "Called when “Resend code” is pressed." },
      { name: "autoplay", type: "string", description: "Types this code by itself, on a loop, until someone clicks in." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Focus ring, caret and success colour." },
      { name: "OtpAutofill.code", type: "string", defaultValue: "\"482913\"", description: "The six digit code carried by the pretend text message and the only code that verifies. Anything that is not six digits falls back to the default." },
      { name: "OtpAutofill.autoplay", type: "boolean", defaultValue: "false", description: "Plays the message, Fill, verify and start over on a loop until someone interacts. Stays off under reduced motion and pauses off screen or in a hidden tab." },
      { name: "OtpAutofill.onVerified", type: "(code: string) => void", defaultValue: "undefined", description: "Called once the code verifies." },
      { name: "OtpAutofill.onResend", type: "() => void", defaultValue: "undefined", description: "Called when Resend code is pressed." },
      { name: "OtpAutofill.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the card." },
      { name: "OtpLine.code", type: "string", defaultValue: "\"905172\"", description: "The six digit code that verifies. Anything that is not six digits falls back to the default." },
      { name: "OtpLine.autoplay", type: "boolean", defaultValue: "false", description: "Types a wrong code and then the right one on a loop until someone interacts. Stays off under reduced motion and pauses off screen or in a hidden tab." },
      { name: "OtpLine.onVerified", type: "(code: string) => void", defaultValue: "undefined", description: "Called once the right code is entered." },
      { name: "OtpLine.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewOtpInput,
    previewSections: [
      {
        title: "OTP Input",
        Preview: Previews.PreviewOtpInput,
        reactSource: `// src/app/page.tsx
"use client";

import { OtpInput } from "@/components/otp-input";

export default function Page() {
  return (
    <OtpInput
      verify={async (code) => {
        const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ code }) });
        return res.ok;
      }}
      onVerified={() => (window.location.href = "/welcome")}
      onResend={() => fetch("/api/verify/resend", { method: "POST" })}
    />
  );
}`,
      },
      {
        title: "OTP Autofill",
        Preview: Previews.PreviewOtpAutofill,
        reactSource: `// src/app/page.tsx

import { OtpAutofill } from "@/components/otp-input";

export default function Page() {
  return (
    <OtpAutofill
    />
  );
}
`,
      },
      {
        title: "Underline OTP",
        Preview: Previews.PreviewOtpLine,
        reactSource: `// src/app/page.tsx

import { OtpLine } from "@/components/otp-input";

export default function Page() {
  return <OtpLine code="905172" />;
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { OtpInput } from "@/components/otp-input";

export default function Page() {
  return (
    <OtpInput
      verify={async (code) => {
        const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ code }) });
        return res.ok;
      }}
      onVerified={() => (window.location.href = "/welcome")}
      onResend={() => fetch("/api/verify/resend", { method: "POST" })}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "radio-cards",
    name: "Radio Cards",
    registryCliName: "radio-cards",
    description:
      "A plan picker built on real radio inputs: the selection ring glides between cards, the chosen card opens to show its features, and the button label rolls to the new plan.",
    categorySlug: "inputs-controls",
    tags: ["radio", "radio group", "plan picker", "pricing", "select", "cards", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "options", type: "RadioOption[]", description: "Each option has id, title, description, and optional meta (shown on the right) and features (chips shown when selected)." },
      { name: "defaultValue", type: "string", description: "Id of the option selected at first. Defaults to the second option." },
      { name: "onChange", type: "(id: string) => void", description: "Called when the selection changes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles through the options until someone interacts." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Ring, dot and button colour." },
    ],
    Preview: Previews.PreviewRadioCards,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { RadioCards } from "@/components/radio-cards";

export default function Page() {
  return (
    <RadioCards
      defaultValue="pro"
      options={[
        { id: "starter", title: "Starter", description: "For side projects", meta: "Free", features: ["3 sites", "Community support"] },
        { id: "pro", title: "Pro", description: "For growing products", meta: "$20/mo", features: ["Unlimited sites", "Analytics", "Custom domains"] },
        { id: "scale", title: "Scale", description: "For whole teams", meta: "$60/mo", features: ["Everything in Pro", "SSO", "Audit log"] },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "hold-to-confirm",
    name: "Hold to Confirm",
    registryCliName: "hold-to-confirm",
    description:
      "A destructive button you have to press and hold: the fill sweeps across, letting go early springs it back, and finishing bursts into a tick with an undo toast that counts down.",
    categorySlug: "inputs-controls",
    tags: ["hold", "press and hold", "delete", "destructive", "confirm", "undo", "button", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 166,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "onConfirm", type: "() => void", description: "Called once the hold completes." },
      { name: "onUndo", type: "() => void", description: "Called when Undo is pressed before the countdown runs out." },
      { name: "holdMs", type: "number", defaultValue: "1500", description: "How long the button must be held, in ms." },
      { name: "label", type: "string", defaultValue: '"Hold to Delete"', description: "Resting label." },
      { name: "holdingLabel", type: "string", defaultValue: '"Keep holding…"', description: "Label revealed by the fill." },
      { name: "doneLabel", type: "string", defaultValue: '"Project deleted"', description: "Toast text after confirming." },
      { name: "color", type: "string", defaultValue: '"#ff3b30"', description: "Fill and text colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Shows a short hold-and-release tease until someone interacts." },
    ],
    Preview: Previews.PreviewHoldToConfirm,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client"; // the handlers are functions, which a server page cannot hand to a client component

import { HoldToConfirm } from "@/components/hold-to-confirm";

export default function Page() {
  return (
    <HoldToConfirm
      holdMs={1800}
      onConfirm={() => fetch("/api/projects/42", { method: "DELETE" })}
      onUndo={() => fetch("/api/projects/42/restore", { method: "POST" })}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "before-after",
    name: "Before / After",
    registryCliName: "before-after",
    description:
      "An image comparison slider with a springy handle, fading corner labels, arrow-key control and a segmented Before / Split / After jump.",
    categorySlug: "motion-effects",
    tags: ["before after", "compare", "image comparison", "slider", "photo", "drag", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 160,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "before", type: "ReactNode", description: "What shows on the left of the handle, usually an <img>." },
      { name: "after", type: "ReactNode", description: "What shows on the right of the handle." },
      { name: "beforeLabel", type: "string", defaultValue: '"Before"', description: "Top-left label." },
      { name: "afterLabel", type: "string", defaultValue: '"After"', description: "Top-right label." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps the handle every few seconds until touched." },
      { name: "className", type: "string", description: "Extra classes on the wrapper." },
    ],
    Preview: Previews.PreviewBeforeAfter,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { BeforeAfter } from "@/components/before-after";

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl">
      <BeforeAfter
        before={<img src="/shots/raw.jpg" alt="Unedited photo" className="h-full w-full object-cover" />}
        after={<img src="/shots/graded.jpg" alt="Colour-graded photo" className="h-full w-full object-cover" />}
        beforeLabel="Raw"
        afterLabel="Graded"
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "price-odometer",
    name: "Price Odometer",
    registryCliName: "price-odometer",
    description:
      "A seat-based pricing card whose total rolls like an odometer: each digit spins on its own spring, columns slide in as the number grows, and a Save badge pops in for yearly billing.",
    categorySlug: "pricing-sections",
    tags: ["pricing", "odometer", "rolling number", "counter", "seats", "billing toggle", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 164,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "monthlyRate", type: "number", defaultValue: "15", description: "Price per seat when billed monthly." },
      { name: "yearlyRate", type: "number", defaultValue: "12", description: "Price per seat when billed yearly. The Save badge is worked out from the two rates." },
      { name: "maxSeats", type: "number", defaultValue: "100", description: "Top of the seats slider." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Slider fill and badge colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Changes seats and billing by itself until someone interacts." },
    ],
    Preview: Previews.PreviewPriceOdometer,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { PriceOdometer, RollingNumber } from "@/components/price-odometer";

export default function Page() {
  return (
    <div className="grid gap-10">
      <PriceOdometer monthlyRate={20} yearlyRate={16} maxSeats={250} />

      {/* RollingNumber works on its own too */}
      <span className="text-5xl font-semibold tabular-nums">
        <RollingNumber value={1284} />
      </span>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "password-strength",
    name: "Password Strength",
    registryCliName: "password-strength",
    description:
      "A password field with a four-segment meter that fills and recolours as you type, a rolling strength label, rules that tick themselves off, and an eye toggle that draws its own slash.",
    categorySlug: "signup-forms",
    tags: ["password", "strength meter", "validation", "signup", "form", "input", "motion kit", "framer-motion", "crack time", "password meter", "log scale", "crack-time meter", "suggested password", "password generator", "sign up"],
    premium: false,
    trendingScore: 157,
    createdAt: "2026-10-19",
    animationKinds: ["type", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "onChange", type: "(value: string, score: number) => void", description: "Called on every keystroke with the password and its score from 0 to 4." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the ticked rules and the focus ring." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a sample password until someone clicks in." },
      { name: "CrackTimePassword.autoplay", type: "boolean", defaultValue: "false", description: "Types a few sample passwords by itself, on a loop, until the field is focused. Stays off under reduced motion and pauses off screen or in a hidden tab." },
      { name: "CrackTimePassword.onChange", type: "(value: string, crackSeconds: number) => void", defaultValue: "undefined", description: "Called on every keystroke with the password and the estimated seconds a fast guessing rig needs to crack it." },
      { name: "CrackTimePassword.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the card." },
      { name: "SuggestPassword.email", type: "string", defaultValue: "\"maya@orbitly.com\"", description: "Email shown in the read-only field above the password." },
      { name: "SuggestPassword.autoplay", type: "boolean", defaultValue: "false", description: "Plays the offer, taking it, choosing your own and typing on a loop until the field is focused. Stays off under reduced motion and pauses off screen or in a hidden tab." },
      { name: "SuggestPassword.onChange", type: "(password: string) => void", defaultValue: "undefined", description: "Called with the new password when the visitor types or takes the suggestion." },
      { name: "SuggestPassword.onUse", type: "(password: string) => void", defaultValue: "undefined", description: "Called when the suggested password is taken." },
      { name: "SuggestPassword.onSubmit", type: "(password: string) => void", defaultValue: "undefined", description: "Called with the current password when Create account is pressed. The component sends nothing anywhere." },
      { name: "SuggestPassword.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewPasswordStrength,
    previewSections: [
      {
        title: "Password Strength",
        Preview: Previews.PreviewPasswordStrength,
        reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { PasswordStrength } from "@/components/password-strength";

export default function Page() {
  const [ok, setOk] = useState(false);
  return (
    <form className="flex flex-col gap-6">
      <PasswordStrength onChange={(_, score) => setOk(score >= 3)} />
      <button disabled={!ok} className="h-12 rounded-full bg-black text-white disabled:opacity-40">
        Create account
      </button>
    </form>
  );
}`,
      },
      {
        title: "Crack-time Meter",
        Preview: Previews.PreviewCrackTimePassword,
        reactSource: `// src/app/page.tsx

import { CrackTimePassword } from "@/components/password-strength";

export default function Page() {
  return (
    <CrackTimePassword
    />
  );
}
`,
      },
      {
        title: "Suggested Password",
        Preview: Previews.PreviewSuggestPassword,
        reactSource: `// src/app/page.tsx

import { SuggestPassword } from "@/components/password-strength";

export default function Page() {
  return (
    <SuggestPassword
      email="maya@orbitly.com"
    />
  );
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { PasswordStrength } from "@/components/password-strength";

export default function Page() {
  const [ok, setOk] = useState(false);
  return (
    <form className="flex flex-col gap-6">
      <PasswordStrength onChange={(_, score) => setOk(score >= 3)} />
      <button disabled={!ok} className="h-12 rounded-full bg-black text-white disabled:opacity-40">
        Create account
      </button>
    </form>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tilt-pass",
    name: "Tilt Pass",
    registryCliName: "tilt-pass",
    description:
      "A membership pass that tilts towards the pointer with a moving glare and holographic sheen, casts a shadow that shifts with it, and flips over to a scannable back on click.",
    categorySlug: "three-d-components",
    tags: ["tilt", "3d card", "pass", "ticket", "membership", "holographic", "flip", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 163,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Founders Pass"', description: "Pass name on the front." },
      { name: "name", type: "string", defaultValue: '"Alex Rivera"', description: "Holder's name, front and back." },
      { name: "number", type: "string", defaultValue: '"No. 0042"', description: "Membership number." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Floats gently on its own while the pointer is away." },
    ],
    Preview: Previews.PreviewTiltPass,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TiltPass } from "@/components/tilt-pass";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <TiltPass title="Backstage" name="Sam Okafor" number="No. 0318" autoplay />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "animated-tabs",
    name: "Animated Tabs",
    registryCliName: "animated-tabs",
    description:
      "A settings panel with a sliding segmented control: rows slide in from the side you moved towards, the panel resizes to fit, and each row has an iOS-style switch whose knob stretches while pressed.",
    categorySlug: "inputs-controls",
    tags: ["tabs", "segmented control", "switch", "toggle", "settings", "ios", "motion kit", "framer-motion", "elastic tabs", "stretchy pill", "tab bar", "document tabs", "reorder tabs", "editor tabs"],
    premium: false,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#34c759"', description: "Colour of a switch that is on." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Flips switches and changes tabs until someone interacts." },
      { name: "ElasticTabs.tabs", type: "ElasticTabItem[]", defaultValue: "four dashboard tabs", description: "The tabs: an id, a label and the content shown in the panel." },
      { name: "ElasticTabs.label", type: "string", defaultValue: "\"Dashboard\"", description: "Accessible name for the tab list." },
      { name: "ElasticTabs.onChange", type: "(id: string) => void", defaultValue: "undefined", description: "Called with the tab id whenever the selected tab changes." },
      { name: "ElasticTabs.autoplay", type: "boolean", defaultValue: "false", description: "Steps through the tabs every 2.4s until someone touches the component. Never runs under reduced motion and pauses when off screen." },
      { name: "ElasticTabs.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the card." },
      { name: "DocumentTabs.initialTabs", type: "DocumentTab[]", defaultValue: "three demo tabs", description: "The tabs it starts with (id, title, url, color, letter). Closing the last tab brings these back." },
      { name: "DocumentTabs.onActiveChange", type: "(id: number) => void", defaultValue: "undefined", description: "Called with the tab id when the active tab changes." },
      { name: "DocumentTabs.autoplay", type: "boolean", defaultValue: "false", description: "Opens, switches, reorders and closes tabs on a loop until someone touches the component. Never runs under reduced motion and pauses when off screen." },
      { name: "DocumentTabs.className", type: "string", defaultValue: "\"\"", description: "Extra classes for the window." },
    ],
    Preview: Previews.PreviewAnimatedTabs,
    previewSections: [
      {
        title: "Animated Tabs",
        Preview: Previews.PreviewAnimatedTabs,
        reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { AnimatedTabs, Switch } from "@/components/animated-tabs";

function SettingsPage() {
  return <AnimatedTabs />;
}

// The switch is exported on its own as well:
export default function Page() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center justify-between">
      <span>Wi-Fi</span>
      <Switch label="Wi-Fi" checked={on} onChange={setOn} />
    </div>
  );
}`,
      },
      {
        title: "Elastic Tabs",
        Preview: Previews.PreviewElasticTabs,
        reactSource: `// src/app/page.tsx

import { ElasticTabs } from "@/components/animated-tabs";

const tabs = [
  { id: "one", label: "Overview", content: <p>Overview content</p> },
  { id: "two", label: "Traffic", content: <p>Traffic content</p> },
  { id: "three", label: "Reports", content: <p>Reports content</p> },
];

export default function Page() {
  return <ElasticTabs tabs={tabs} label="Dashboard" />;
}
`,
      },
      {
        title: "Document Tabs",
        Preview: Previews.PreviewDocumentTabs,
        reactSource: `// src/app/page.tsx

import { DocumentTabs } from "@/components/animated-tabs";

const tabs = [
  { id: 1, title: "Roadmap", url: "example.app/roadmap", color: "#0a84ff", letter: "R" },
  { id: 2, title: "Notes", url: "example.app/notes", color: "#30d158", letter: "N" },
];

export default function Page() {
  return <DocumentTabs initialTabs={tabs} />;
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { AnimatedTabs, Switch } from "@/components/animated-tabs";

function SettingsPage() {
  return <AnimatedTabs />;
}

// The switch is exported on its own as well:
export default function Page() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center justify-between">
      <span>Wi-Fi</span>
      <Switch label="Wi-Fi" checked={on} onChange={setOn} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "shared-element-cards",
    name: "Shared Element Cards",
    registryCliName: "shared-element-cards",
    description:
      "Story cards that open into a sheet with a shared-element transition: the artwork, eyebrow and title travel from the card into place, then the body fades in. Closes with Escape or a click outside.",
    categorySlug: "cards",
    tags: ["shared element", "layoutId", "expand", "modal", "sheet", "cards", "app store", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 155,
    createdAt: "2026-10-19",
    animationKinds: ["press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "StoryCard[]", description: "Each card has id, eyebrow, title, art (any CSS background) and body paragraphs." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and closes the cards by itself until someone interacts." },
      { name: "stiffness", type: "number", defaultValue: "300", description: "How firmly the spring pulls a card open and shut, 80 to 800. Higher is faster and snappier." },
      { name: "damping", type: "number", defaultValue: "32", description: "How quickly the spring settles, 8 to 60. Lower overshoots and wobbles, higher stops dead." },
      { name: "height", type: "number", defaultValue: "340", description: "Height of the whole stage in px, 280 to 460." },
      { name: "radius", type: "number", defaultValue: "24", description: "Corner radius of the cards in px, 0 to 44. The open sheet is 4px rounder." },
      { name: "gap", type: "number", defaultValue: "12", description: "Space between the two cards in px, 0 to 32." },
    ],
    Preview: Previews.PreviewSharedElementCards,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SharedElementCards } from "@/components/shared-element-cards";

export default function Page() {
  return (
    <SharedElementCards
      cards={[
        {
          id: "launch",
          eyebrow: "New",
          title: "Launch week",
          art: "linear-gradient(135deg,#ffd1e0,#c7d7ff)",
          body: ["Five days, five releases.", "Follow along as each one ships."],
        },
        {
          id: "night",
          eyebrow: "Tonight",
          title: "Quiet hours",
          art: "linear-gradient(135deg,#1c1c3a,#5e5ce6)",
          body: ["Notifications pause from 10pm to 7am."],
        },
      ]}
    />
  );
}`,
    reactExamples: [
      {
        title: "Tune the feel",
        code: `// src/app/page.tsx

import { SharedElementCards } from "@/components/shared-element-cards";

// Softer, rounder cards that open with a slow, bouncy spring.
export default function Page() {
  return <SharedElementCards stiffness={180} damping={16} radius={36} gap={16} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "rotating-headline",
    name: "Rotating Headline",
    registryCliName: "rotating-headline",
    description:
      "A hero headline whose words arrive one by one out of a blur, ending on a word that keeps rolling to the next, with a subline that follows word by word and a replay button.",
    categorySlug: "motion-effects",
    tags: ["headline", "text rotate", "word swap", "hero", "blur in", "typography", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 154,
    createdAt: "2026-10-19",
    animationKinds: ["layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "lead", type: "string", defaultValue: '"Built to"', description: "The words that stay put." },
      { name: "words", type: "string[]", defaultValue: '["move.", "delight.", "last.", "ship."]', description: "Words that take turns at the end." },
      { name: "sub", type: "string", description: "Subline under the headline." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the rotating word." },
      { name: "interval", type: "number", defaultValue: "2000", description: "Milliseconds between word changes." },
    ],
    Preview: Previews.PreviewRotatingHeadline,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { RotatingHeadline } from "@/components/rotating-headline";

export default function Page() {
  return (
    <section className="py-24">
      <RotatingHeadline lead="Made for" words={["founders.", "designers.", "teams."]} sub="One kit, every launch." accent="#ff375f" />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "stretch-nav",
    name: "Stretch Nav",
    registryCliName: "stretch-nav",
    description:
      "A pill navigation whose active capsule moves its leading edge first and lets the trailing edge catch up, so it stretches towards the next item and snaps back to size, with a soft hover pill that follows the pointer.",
    categorySlug: "navbars",
    tags: ["navigation", "nav", "tabs", "pill", "stretch", "segmented", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "string[]", defaultValue: '["Home", "Work", "Writing", "About", "Contact"]', description: "Item labels, left to right." },
      { name: "defaultIndex", type: "number", defaultValue: "0", description: "Item active at first." },
      { name: "onChange", type: "(index: number) => void", description: "Called when an item is picked." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Moves between items by itself until someone interacts." },
    ],
    Preview: Previews.PreviewStretchNav,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { StretchNav } from "@/components/stretch-nav";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Writing", href: "/writing" },
  { label: "About", href: "/about" },
];

export default function Page() {
  const router = useRouter();
  const path = usePathname();
  const current = Math.max(0, LINKS.findIndex((l) => l.href === path));
  return <StretchNav items={LINKS.map((l) => l.label)} defaultIndex={current} onChange={(i) => router.push(LINKS[i].href)} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "feedback-pill",
    name: "Feedback Pill",
    registryCliName: "feedback-pill",
    description:
      "A small Feedback pill that morphs into a note form, shows a spinner in the Send button while it posts, then shrinks into a thank-you before folding back into the pill.",
    categorySlug: "inputs-controls",
    tags: ["feedback", "form", "morph", "popover", "textarea", "widget", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 152,
    createdAt: "2026-10-19",
    animationKinds: ["press", "type", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "onSend", type: "(message: string) => void | Promise<void>", description: "Called with the message. The spinner shows until it resolves." },
      { name: "label", type: "string", defaultValue: '"Feedback"', description: "Pill label and form title." },
      { name: "placeholder", type: "string", defaultValue: '"What would make this better?"', description: "Textarea placeholder." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Send button and focus colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens, types and sends a sample message until someone interacts." },
    ],
    Preview: Previews.PreviewFeedbackPill,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { FeedbackPill } from "@/components/feedback-pill";

export default function Page() {
  return (
    <div className="fixed bottom-6 right-6">
      <FeedbackPill
        onSend={(message) =>
          fetch("/api/feedback", { method: "POST", body: JSON.stringify({ message, page: location.pathname }) }).then(() => undefined)
        }
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "stagger-menu",
    name: "Stagger Menu",
    registryCliName: "stagger-menu",
    description:
      "A share menu that unfolds from its button with the items arriving one after another, a highlight that glides between rows, arrow-key navigation, and a button label that rolls to confirm what you picked.",
    categorySlug: "inputs-controls",
    tags: ["menu", "dropdown", "share", "context menu", "stagger", "keyboard", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 151,
    createdAt: "2026-10-19",
    animationKinds: ["press", "hover", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "MenuItem[]", description: "Each item has id, label, icon, and optional danger (red, after a divider) and done (the confirmation shown in the button)." },
      { name: "onSelect", type: "(id: string) => void", description: "Called with the id of the picked item." },
      { name: "label", type: "string", defaultValue: '"Share"', description: "Button label." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and browses the menu by itself until someone interacts." },
    ],
    Preview: Previews.PreviewStaggerMenu,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client"; // onSelect is a function, which a server page cannot hand to a client component

import { StaggerMenu } from "@/components/stagger-menu";

const url = "https://example.com/post/42";

export default function Page() {
  return (
    <StaggerMenu
      onSelect={(id) => {
        if (id === "link") navigator.clipboard.writeText(url);
        if (id === "email") window.location.href = "mailto:?body=" + encodeURIComponent(url);
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ruler-picker",
    name: "Ruler Picker",
    registryCliName: "ruler-picker",
    description:
      "A duration picker you fling like a ruler: it glides with momentum and snaps to whole units, the big number rolls in the direction you moved, and presets spring the ruler into place.",
    categorySlug: "inputs-controls",
    tags: ["ruler", "picker", "slider", "duration", "timer", "momentum", "drag", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 155,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "min", type: "number", defaultValue: "0", description: "Smallest value." },
      { name: "max", type: "number", defaultValue: "90", description: "Largest value." },
      { name: "defaultValue", type: "number", defaultValue: "25", description: "Starting value." },
      { name: "unit", type: "string", defaultValue: '"min"', description: "Unit shown after the number. Values of 60 and up show as hours." },
      { name: "presets", type: "number[]", defaultValue: "[5, 15, 30, 60]", description: "Quick-pick buttons under the ruler." },
      { name: "accent", type: "string", defaultValue: '"#ff9f0a"', description: "Needle and selected preset colour." },
      { name: "onChange", type: "(value: number) => void", description: "Called as the value changes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Glides between presets until someone interacts." },
    ],
    Preview: Previews.PreviewRulerPicker,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { RulerPicker } from "@/components/ruler-picker";

export default function Page() {
  const [minutes, setMinutes] = useState(25);
  return (
    <div className="flex flex-col items-center gap-6">
      <RulerPicker defaultValue={minutes} onChange={setMinutes} />
      <button className="h-11 rounded-full bg-[#0071e3] px-6 text-white">Start {minutes} min focus</button>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "elastic-stepper",
    name: "Elastic Stepper",
    registryCliName: "elastic-stepper",
    description:
      "A plus / minus stepper whose number rolls up or down, with a dot track that stretches to the current value and a rubber-band bounce when you push past either limit.",
    categorySlug: "inputs-controls",
    tags: ["stepper", "counter", "quantity", "number input", "guests", "rubber band", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 150,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: '"Guests"', description: "What is being counted; also used for the button labels." },
      { name: "min", type: "number", defaultValue: "1", description: "Lowest value." },
      { name: "max", type: "number", defaultValue: "8", description: "Highest value." },
      { name: "defaultValue", type: "number", defaultValue: "2", description: "Starting value." },
      { name: "onChange", type: "(value: number) => void", description: "Called when the value changes." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Dot track colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Counts up and down by itself until someone interacts." },
    ],
    Preview: Previews.PreviewElasticStepper,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ElasticStepper } from "@/components/elastic-stepper";

export default function Page() {
  return <ElasticStepper label="Guests" min={1} max={12} defaultValue={2} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "todo-list",
    name: "Todo List",
    registryCliName: "todo-list",
    description:
      "A task list where ticking a task draws a check, strikes the text through and drops it out of the list into a Completed drawer with a counter that pops, plus quick add and undo. Also includes All Caught Up: Tick tasks and they strike through and fold away while the header ring fills. Finish the last and that ring travels to the middle, closes into a check and tomorrow lines up below.",
    categorySlug: "cards",
    tags: ["todo", "tasks", "checklist", "checkbox", "list", "productivity", "motion kit", "framer-motion", "all caught up"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-19",
    animationKinds: ["press", "type", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "initial", type: "string[]", description: "Tasks shown at first." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Check and counter colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Ticks tasks off by itself until someone interacts." },
      { name: "AllCaughtUp.tasks", type: "AllCaughtUpTask[]", defaultValue: "four demo tasks", description: "The tasks to tick off: id, title and a small tag shown on the right of the row." },
      { name: "AllCaughtUp.tomorrow", type: "string[]", defaultValue: "three demo items", description: "What comes next, shown as chips once everything is done." },
      { name: "AllCaughtUp.heading", type: "string", defaultValue: "\"Today\"", description: "Heading of the list." },
      { name: "AllCaughtUp.onTick", type: "(task: AllCaughtUpTask) => void", defaultValue: "undefined", description: "Called with the task each time one is ticked by hand." },
      { name: "AllCaughtUp.onComplete", type: "() => void", defaultValue: "undefined", description: "Called once the last task is ticked by hand." },
      { name: "AllCaughtUp.autoplay", type: "boolean", defaultValue: "false", description: "Ticks the tasks off one by one and starts over until someone touches the component. Never runs under reduced motion and pauses when off screen." },
      { name: "AllCaughtUp.className", type: "string", defaultValue: "undefined", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewTodoList,
    previewSections: [
      {
        title: "Todo List",
        Preview: Previews.PreviewTodoList,
        reactSource: `// src/app/page.tsx

import { TodoList } from "@/components/todo-list";

export default function Page() {
  return <TodoList initial={["Write release notes", "Record the demo", "Update pricing page", "Email beta users"]} accent="#34c759" />;
}`,
      },
      {
        title: "All Caught Up",
        Preview: Previews.PreviewAllCaughtUp,
        reactSource: `// src/app/page.tsx

import { AllCaughtUp } from "@/components/todo-list";

export default function Page() {
  return (
    <AllCaughtUp
      heading="Today"
      tomorrow={["Q4 planning", "1:1 with Leo", "Invoice run"]}
    />
  );
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TodoList } from "@/components/todo-list";

export default function Page() {
  return <TodoList initial={["Write release notes", "Record the demo", "Update pricing page", "Email beta users"]} accent="#34c759" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "progress-button",
    name: "Progress Button",
    registryCliName: "progress-button",
    description:
      "A button that becomes its own progress bar: it stretches, fills as the work runs with a live percentage, then turns green with a drawn check and a new label.",
    categorySlug: "inputs-controls",
    tags: ["button", "progress", "download", "loading", "upload", "state", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 154,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "task", type: "(onProgress: (p: number) => void) => Promise<void>", description: "Run the work and report progress from 0 to 1. Simulated if left out." },
      { name: "label", type: "string", defaultValue: '"Download"', description: "Resting label." },
      { name: "doneLabel", type: "string", defaultValue: '"Open file"', description: "Label once finished." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Button and fill colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Runs itself on a loop until someone interacts." },
    ],
    Preview: Previews.PreviewProgressButton,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { ProgressButton } from "@/components/progress-button";

export default function Page() {
  return (
    <ProgressButton
      label="Export video"
      doneLabel="Show in folder"
      task={async (onProgress) => {
        const job = await fetch("/api/export", { method: "POST" }).then((r) => r.json());
        for (let p = 0; p < 1; ) {
          p = await fetch(\`/api/export/\${job.id}\`).then((r) => r.json()).then((j) => j.progress);
          onProgress(p);
          await new Promise((r) => setTimeout(r, 400));
        }
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "copy-button",
    name: "Copy Button",
    registryCliName: "copy-button",
    description:
      "Two copy controls: an ID chip whose icon morphs into a check under a ripple and a Copied tooltip, and a command line whose button rolls from Copy to Copied.",
    categorySlug: "inputs-controls",
    tags: ["copy", "clipboard", "copy to clipboard", "api key", "command", "chip", "motion kit", "framer-motion", "selection copy", "select and copy", "copy field", "secret key", "reveal key", "rotate key", "api key field"],
    premium: false,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "value", type: "string", description: "CopyChip: the text written to the clipboard." },
      { name: "display", type: "string", description: "CopyChip: what the chip shows, such as a shortened ID. Defaults to value." },
      { name: "label", type: "string", defaultValue: '"Copy"', description: "CopyChip: start of the accessible label." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "CopyChip: ripple and check colour." },
      { name: "command", type: "string", description: "CopyCommand: the shell command shown and copied." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Both: copy by themselves every few seconds until someone interacts." },
      { name: "SelectCopy.fields", type: "{ label: string; value: string; mono?: boolean; prefix?: string }[]", defaultValue: "share link and install command", description: "The fields to render, one row each. The prefix is shown but never copied." },
      { name: "SelectCopy.onCopy", type: "(value: string) => void", defaultValue: "undefined", description: "Called with the copied text after a real press. The autoplay demo never calls it." },
      { name: "SelectCopy.autoplay", type: "boolean", defaultValue: "false", description: "Plays a visual-only copy on each field in turn until someone touches the card. Pauses off screen and in hidden tabs, and is off under reduced motion." },
      { name: "SelectCopy.className", type: "string", defaultValue: "undefined", description: "Extra classes for the card." },
      { name: "ApiKeyField.onCopy", type: "(key: string) => void", defaultValue: "undefined", description: "Called with the demo key after a real press of the copy button." },
      { name: "ApiKeyField.onRotate", type: "(key: string) => void", defaultValue: "undefined", description: "Called with the new demo key after the user confirms a rotation." },
      { name: "ApiKeyField.autoplay", type: "boolean", defaultValue: "false", description: "Reveals, copies and rotates by itself in a loop until someone touches the card. Never touches the clipboard." },
      { name: "ApiKeyField.className", type: "string", defaultValue: "undefined", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewCopyButton,
    previewSections: [
      {
        title: "Copy Button",
        Preview: Previews.PreviewCopyButton,
        reactSource: `// src/app/page.tsx

import { CopyChip, CopyCommand } from "@/components/copy-button";

const keyId = "nxs_8f3a91c2d4e5";

export default function Page() {
  return (
    <div className="flex flex-col items-start gap-4">
      <CopyChip value={keyId} display={keyId.slice(0, 7) + "…" + keyId.slice(-4)} />
      <CopyCommand command="npx shadcn@latest add @nexus-labs/copy-button" />
    </div>
  );
}`,
      },
      {
        title: "Selection Copy",
        Preview: Previews.PreviewSelectCopy,
        reactSource: `// src/app/page.tsx

import { SelectCopy } from "@/components/copy-button";

export default function Page() {
  return (
    <SelectCopy
      fields={[
        { label: "Share link", value: "nexus-ui.com/s/8fK2-motion-kit", mono: false },
        { label: "Install", value: "npm i @nexus/motion", prefix: "$" },
      ]}
    />
  );
}
`,
      },
      {
        title: "API Key Field",
        Preview: Previews.PreviewApiKeyField,
        reactSource: `// src/app/page.tsx

import { ApiKeyField } from "@/components/copy-button";

export default function Page() {
  return (
    <ApiKeyField
    />
  );
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { CopyChip, CopyCommand } from "@/components/copy-button";

const keyId = "nxs_8f3a91c2d4e5";

export default function Page() {
  return (
    <div className="flex flex-col items-start gap-4">
      <CopyChip value={keyId} display={keyId.slice(0, 7) + "…" + keyId.slice(-4)} />
      <CopyCommand command="npx shadcn@latest add @nexus-labs/copy-button" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "animated-icons",
    name: "Animated Icons",
    registryCliName: "animated-icons",
    description:
      "Eight toggle icons with their own small stories: menu to close, play morphing into pause, a heart that bursts, a bell that rings, sun turning to moon, a bookmark that fills, sound muting and a lock that springs open.",
    categorySlug: "motion-effects",
    tags: ["icons", "animated icons", "toggle", "svg", "morph", "micro-interactions", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["press", "hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "on", type: "boolean", description: "Each icon (MenuIcon, PlayIcon, HeartIcon, BellIcon, ThemeIcon, BookmarkIcon, VolumeIcon, LockIcon) takes its state as on." },
      { name: "burst", type: "number", description: "HeartIcon only: increase it to play a new burst." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "AnimatedIcons grid only: toggles the icons in turn until someone interacts." },
      { name: "speed", type: "number", defaultValue: "1", description: "How fast the animation plays, 0.25 to 4. Higher is quicker. Every icon takes it, and so does the grid." },
      { name: "size", type: "number", defaultValue: "26", description: "Each icon only: width and height in px." },
      { name: "iconSize", type: "number", defaultValue: "26", description: "AnimatedIcons grid only: size of each icon in px, 14 to 48." },
      { name: "tileSize", type: "number", defaultValue: "72", description: "AnimatedIcons grid only: width and height of each button tile in px, 48 to 96." },
      { name: "tileRadius", type: "number", defaultValue: "20", description: "AnimatedIcons grid only: corner radius of the tiles in px. Half the tile size makes a circle." },
    ],
    Preview: Previews.PreviewAnimatedIcons,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { MenuIcon, ThemeIcon } from "@/components/animated-icons";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  return (
    <div className="flex gap-2">
      <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <MenuIcon on={open} />
      </button>
      <button aria-label="Toggle dark mode" aria-pressed={dark} onClick={() => setDark((d) => !d)}>
        <ThemeIcon on={dark} />
      </button>
    </div>
  );
}`,
    reactExamples: [
      {
        title: "Round, bigger tiles",
        code: `// src/app/page.tsx

import { AnimatedIcons } from "@/components/animated-icons";

// Circular tiles with larger icons that animate a little faster.
export default function Page() {
  return <AnimatedIcons tileSize={84} tileRadius={42} iconSize={34} speed={1.4} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "folder-peek",
    name: "Folder Peek",
    registryCliName: "folder-peek",
    description:
      "A folder that tips its front panel back on hover or focus while a document, a photo and a chart fan out of it, then tuck back in when you leave.",
    categorySlug: "cards",
    tags: ["folder", "files", "hover", "3d", "fan out", "documents", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Brand assets"', description: "Folder name." },
      { name: "meta", type: "string", defaultValue: '"24 files · Updated today"', description: "Line under the name." },
      { name: "color", type: "string", defaultValue: '"#0071e3"', description: "Folder colour; the back panel is drawn a shade darker." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and closes by itself until someone hovers it." },
    ],
    Preview: Previews.PreviewFolderPeek,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { FolderPeek } from "@/components/folder-peek";

export default function Page() {
  return (
    <div className="grid grid-cols-2 gap-10 pt-16">
      <FolderPeek title="Launch kit" meta="12 files · Edited 2h ago" color="#34c759" />
      <FolderPeek title="Brand assets" meta="24 files · Updated today" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "magnify-dock",
    name: "Magnify Dock",
    registryCliName: "magnify-dock",
    description:
      "A macOS-style app dock: icons swell as the pointer passes over them, show a label above, bounce when launched and keep a running dot underneath.",
    categorySlug: "navbars",
    tags: ["dock", "macos", "magnify", "app icons", "launcher", "toolbar", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 157,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "press", "spring", "magnetic"],
    dependencies: ["framer-motion"],
    props: [
      { name: "apps", type: "DockApp[]", defaultValue: "Apple Intelligence, Maps, Music, TV, Claude, Chrome", description: "Each app has id, label, icon (an image URL of the finished app icon), and bg (any CSS background) and glyph (an icon) for the tile that shows when there is no icon or it fails to load." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps an invisible pointer across the dock until someone hovers it." },
      { name: "baseSize", type: "number", defaultValue: "46", description: "Resting size of every icon in px, 32 to 64." },
      { name: "maxSize", type: "number", defaultValue: "76", description: "Size of the icon right under the pointer in px, up to 104. It never goes below baseSize." },
      { name: "reach", type: "number", defaultValue: "150", description: "How far from the pointer, in px, icons still swell, 40 to 320. A small reach magnifies one icon, a large one lifts a whole group." },
      { name: "gap", type: "number", defaultValue: "10", description: "Space between icons in px, 0 to 28." },
      { name: "stiffness", type: "number", defaultValue: "320", description: "How firmly icons spring to their new size, 100 to 800. Higher is snappier." },
      { name: "showLabels", type: "boolean", defaultValue: "true", description: "Shows the app's name above it while it is hovered or focused." },
    ],
    Preview: Previews.PreviewMagnifyDock,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MagnifyDock } from "@/components/magnify-dock";

export default function Page() {
  return (
    <div className="fixed inset-x-0 bottom-4 flex justify-center">
      <MagnifyDock />
    </div>
  );
}`,
    reactExamples: [
      {
        title: "Big swell",
        code: `// src/app/page.tsx

import { MagnifyDock } from "@/components/magnify-dock";

// Small resting icons that swell a long way, with a wide reach and no labels.
export default function Page() {
  return <MagnifyDock baseSize={36} maxSize={96} reach={220} showLabels={false} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "upload-chips",
    name: "Upload Chips",
    registryCliName: "upload-chips",
    description:
      "A drop zone that lifts and tints while you drag over it, then turns every file into a chip with a filling progress bar, a progress ring and a check when it lands.",
    categorySlug: "inputs-controls",
    tags: ["upload", "file upload", "dropzone", "progress", "drag and drop", "attachments", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "press", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "upload", type: "(file: File | { name: string; size: number }, onProgress: (p: number) => void) => Promise<void>", description: "Upload one file and report progress from 0 to 1. Simulated if left out." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Drag highlight, progress and check colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Drops sample files in by itself until someone interacts." },
    ],
    Preview: Previews.PreviewUploadChips,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { UploadChips } from "@/components/upload-chips";

export default function Page() {
  return (
    <UploadChips
      upload={(file, onProgress) =>
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => onProgress(e.loaded / e.total);
          xhr.onload = () => resolve();
          xhr.onerror = reject;
          xhr.open("POST", "/api/upload");
          xhr.send(file as File);
        })
      }
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "notification-stack",
    name: "Notification Stack",
    registryCliName: "notification-stack",
    description:
      "Toasts that pile into a neat stack, spread out while hovered (pausing their timers), swipe away sideways, and turn a loading toast into a success when the work finishes.",
    categorySlug: "cards",
    tags: ["toast", "notifications", "stack", "swipe", "promise", "sonner", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 150,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Pushes sample toasts by itself until someone presses a trigger." },
      { name: "duration", type: "number", defaultValue: "4200", description: "How long a toast stays before it dismisses itself, in ms, 1000 to 12000." },
      { name: "visible", type: "number", defaultValue: "3", description: "How many toasts show while the stack is folded, 1 to 5. The rest wait out of sight behind them." },
      { name: "peek", type: "number", defaultValue: "13", description: "How much of each toast behind the front one peeks out, in px, while folded, 4 to 30." },
      { name: "gap", type: "number", defaultValue: "10", description: "Space between toasts in px while the stack is spread out, 0 to 20." },
      { name: "stiffness", type: "number", defaultValue: "380", description: "How firmly toasts spring into place, 150 to 800. Higher is snappier." },
      { name: "direction", type: "\"up\" | \"down\"", defaultValue: "\"up\"", description: "Which way the stack grows: up from the bottom, or down from the top." },
    ],
    Preview: Previews.PreviewNotificationStack,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { NotificationStack } from "@/components/notification-stack";

export default function Page() {
  return (
    <div className="mx-auto max-w-md py-10">
      <NotificationStack />
    </div>
  );
}`,
    reactExamples: [
      {
        title: "Top-down, quick to leave",
        code: `// src/app/page.tsx

import { NotificationStack } from "@/components/notification-stack";

// Toasts drop in from the top, show five when folded, and clear after two seconds.
export default function Page() {
  return <NotificationStack direction="down" visible={5} duration={2000} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "island-morph",
    name: "Island Morph",
    registryCliName: "island-morph",
    description:
      "A black pill that morphs between a timer, an incoming call and a full music player, with each state's content blurring in once the shape lands.",
    categorySlug: "motion-effects",
    tags: ["dynamic island", "morph", "live activity", "music player", "call", "timer", "ios", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-19",
    animationKinds: ["press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles through idle, timer, call and music until a control is pressed." },
      { name: "stiffness", type: "number", defaultValue: "380", description: "How firmly the pill springs to its next shape, 120 to 800. Higher is snappier." },
      { name: "damping", type: "number", defaultValue: "30", description: "How quickly the pill settles, 10 to 60. Lower overshoots and wobbles, higher stops dead." },
      { name: "blur", type: "number", defaultValue: "10", description: "How blurry the content is as it fades in and out, in px, 0 to 24. 0 is a plain fade." },
      { name: "contentDelay", type: "number", defaultValue: "0.08", description: "Seconds the content waits for the shape to land before it appears, 0 to 0.6." },
      { name: "surface", type: "string", defaultValue: "\"#000000\"", description: "Colour of the pill. Any CSS colour; keep it dark so the white content stays readable." },
      { name: "timerColor", type: "string", defaultValue: "\"#ff9f0a\"", description: "Colour of the timer's clock icon and numbers. Any CSS colour." },
    ],
    Preview: Previews.PreviewIslandMorph,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { IslandMorph } from "@/components/island-morph";

export default function Page() {
  return (
    <div className="flex justify-center pt-4">
      <IslandMorph autoplay />
    </div>
  );
}`,
    reactExamples: [
      {
        title: "Bouncy and tinted",
        code: `// src/app/page.tsx

import { IslandMorph } from "@/components/island-morph";

// A loose, wobbly spring on a midnight-blue pill with a green timer.
export default function Page() {
  return <IslandMorph stiffness={260} damping={16} surface="#1c1c3a" timerColor="#30d158" />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "lanyard-badge",
    name: "Lanyard Badge",
    registryCliName: "lanyard-badge",
    description:
      "A conference badge hanging from a strap. Grab it and throw it around; it swings back as a damped pendulum and twists with its sideways speed.",
    categorySlug: "cards",
    tags: ["badge", "lanyard", "pendulum", "physics", "drag", "conference", "id card", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "name", type: "string", defaultValue: '"Alex Rivera"', description: "Attendee name; the avatar shows its initials." },
      { name: "role", type: "string", defaultValue: '"Design Engineer"', description: "Line under the name." },
      { name: "event", type: "string", defaultValue: '"Motion Summit"', description: "Event name printed at the top (followed by 2026)." },
      { name: "tag", type: "string", defaultValue: '"Speaker"', description: "Label on the coloured band at the bottom of the badge." },
      { name: "strap", type: "string", defaultValue: '"#0071e3"', description: "Strap, band and avatar colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Gives the badge a nudge every few seconds until someone grabs it." },
    ],
    Preview: Previews.PreviewLanyardBadge,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { LanyardBadge } from "@/components/lanyard-badge";

export default function Page() {
  return (
    <div className="flex justify-center">
      <LanyardBadge name="Priya Sharma" role="Staff Engineer" event="Motion Summit" tag="Speaker" strap="#ff375f" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "glass-lens",
    name: "Glass Lens",
    registryCliName: "glass-lens",
    description:
      "A glass puck you drag over content. It magnifies the centre and splits colour toward the rim, built from three offset copies of the content instead of a shader. Also includes Zoom Lens: A magnifier that springs after your pointer and shows full detail, so tiny map labels become readable. Scroll or use the slider to zoom.",
    categorySlug: "motion-effects",
    tags: ["magnifier", "lens", "glass", "chromatic aberration", "zoom", "drag", "motion kit", "framer-motion", "zoom lens"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "size", type: "number", defaultValue: "150", description: "Lens diameter in px." },
      { name: "zoom", type: "number", defaultValue: "1.45", description: "Magnification at the centre of the lens." },
      { name: "width", type: "number", defaultValue: "520", description: "Width of the content surface in px." },
      { name: "height", type: "number", defaultValue: "300", description: "Height of the content surface in px." },
      { name: "children", type: "ReactNode", defaultValue: "Field notes text", description: "Content under the glass. It is rendered four times (page plus three lens layers), so keep it static." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Drifts across the content by itself until the user drags it." },
      { name: "ZoomLens.image", type: "string", description: "Zoom Lens: picture to magnify, as a URL or data URI. Defaults to a drawn map of an invented harbour district with tiny street names." },
      { name: "ZoomLens.darkImage", type: "string", description: "Zoom Lens: picture to use in dark mode. Defaults to a dark version of the demo map, or to image when you pass your own." },
      { name: "ZoomLens.aspectRatio", type: "number", defaultValue: "1800 / 1100", description: "Zoom Lens: width divided by height of the picture." },
      { name: "ZoomLens.label", type: "string", defaultValue: "\"Map of the harbour district. Use the lens to read street names.\"", description: "Zoom Lens: accessible description of the picture." },
      { name: "ZoomLens.defaultZoom", type: "number", defaultValue: "2.6", description: "Zoom Lens: starting magnification." },
      { name: "ZoomLens.minZoom", type: "number", defaultValue: "1.5", description: "Zoom Lens: smallest magnification." },
      { name: "ZoomLens.maxZoom", type: "number", defaultValue: "4", description: "Zoom Lens: largest magnification." },
      { name: "ZoomLens.lensSize", type: "number", defaultValue: "164", description: "Zoom Lens: lens diameter in px." },
      { name: "ZoomLens.showControl", type: "boolean", defaultValue: "true", description: "Zoom Lens: shows the zoom slider under the picture. The wheel and the plus and minus keys still work without it." },
      { name: "ZoomLens.autoplay", type: "boolean", defaultValue: "false", description: "Zoom Lens: the lens wanders over the picture until someone points at it or presses a key. Never runs under reduced motion." },
      { name: "ZoomLens.className", type: "string", description: "Zoom Lens: extra classes for the wrapper." },
    ],
    Preview: Previews.PreviewGlassLens,
    previewSections: [
      {
        title: "Glass Lens",
        Preview: Previews.PreviewGlassLens,
        reactSource: `// src/app/page.tsx

import { GlassLens } from "@/components/glass-lens";

export default function Page() {
  return (
    <GlassLens size={140} zoom={1.6} width={480} height={280}>
      <div className="flex h-full flex-col justify-center gap-2 px-8">
        <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">Terms</p>
        <p className="m-0 text-[14px] leading-[1.5] text-[#1d1d1f] dark:text-[#f5f5f7]">
          Cancel any time before the trial ends and you will not be charged. Plans renew monthly.
        </p>
      </div>
    </GlassLens>
  );
}`,
      },
      {
        title: "Zoom Lens",
        Preview: Previews.PreviewZoomLens,
        reactSource: `// src/app/page.tsx

import { ZoomLens } from "@/components/glass-lens";

export default function Page() {
  return (
    <ZoomLens
      image="/plans/level-2.png"
      darkImage="/plans/level-2-dark.png"
      aspectRatio={16 / 10}
      label="Floor plan of level two. Use the lens to read the room numbers."
      defaultZoom={2.4}
      maxZoom={5}
    />
  );
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { GlassLens } from "@/components/glass-lens";

export default function Page() {
  return (
    <GlassLens size={140} zoom={1.6} width={480} height={280}>
      <div className="flex h-full flex-col justify-center gap-2 px-8">
        <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">Terms</p>
        <p className="m-0 text-[14px] leading-[1.5] text-[#1d1d1f] dark:text-[#f5f5f7]">
          Cancel any time before the trial ends and you will not be charged. Plans renew monthly.
        </p>
      </div>
    </GlassLens>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ascii-wake",
    name: "ASCII Wake",
    registryCliName: "ascii-wake",
    description:
      "Your pointer leaves a trail of characters that thickens where you linger and thins as it ages. Switch the glyph set, or let the glyphs follow the direction you moved.",
    categorySlug: "background-effects",
    tags: ["ascii", "canvas", "pointer trail", "glyphs", "cursor", "generative", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-19",
    animationKinds: ["hover", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "height", type: "number", defaultValue: "300", description: "Height of the field in px; it fills the available width." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the glyphs right under the pointer." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Draws a looping path by itself while the pointer is away." },
    ],
    Preview: Previews.PreviewAsciiWake,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { AsciiWake } from "@/components/ascii-wake";

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-[640px]">
      <AsciiWake height={260} accent="#30d158" autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "liquid-dial",
    name: "Liquid Dial",
    registryCliName: "liquid-dial",
    description:
      "A floating action button whose actions bud out of it like liquid. The highlight is two blobs on different springs, so it pulls into a thread before wrapping the next action.",
    categorySlug: "inputs-controls",
    tags: ["fab", "action menu", "speed dial", "gooey", "svg filter", "radial menu", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 157,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "actions", type: "LiquidDialAction[]", defaultValue: "Photo, Note, Voice memo, Link", description: "Up to four actions ({ id, label, d }) laid out on an arc; d is SVG path data in a 24×24 box." },
      { name: "color", type: "string", defaultValue: '"#1d1d1f"', description: "Blob colour. Left unset it is near-black, or #3a3a3c in dark mode." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Highlight blob and focus ring colour. Left unset it is #0071e3, or #0a84ff in dark mode." },
      { name: "onSelect", type: "(id: string) => void", defaultValue: "undefined", description: "Called with the action id when an action is picked." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and browses by itself until the user interacts." },
    ],
    Preview: Previews.PreviewLiquidDial,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { LiquidDial } from "@/components/liquid-dial";

export default function Page() {
  return (
    <LiquidDial
      accent="#ff375f"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "voice-orb",
    name: "Voice Orb",
    registryCliName: "voice-orb",
    description:
      "One shape for an assistant's four states. Hold it to talk: a dotted ring becomes a glow, a dark thinking sphere, then a churning voice.",
    categorySlug: "ai-components",
    tags: ["voice", "assistant", "orb", "ai", "push to talk", "blob", "states", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 159,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the glow and the middle of the listening/speaking gradient." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Walks through listening, thinking and speaking by itself until pressed." },
    ],
    Preview: Previews.PreviewVoiceOrb,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { VoiceOrb } from "@/components/voice-orb";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <p className="m-0 text-[15px] text-[#6e6e73]">How can I help?</p>
      <VoiceOrb accent="#bf5af2" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "sagging-field",
    name: "Sagging Field",
    registryCliName: "sagging-field",
    description:
      "A text field that bends under the weight of what you type. Letters ride the curve on springs, anything that runs past the end falls off, and Let it go drops the whole lot.",
    categorySlug: "inputs-controls",
    tags: ["input", "text field", "playful", "physics", "letters", "typing", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-19",
    animationKinds: ["type", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: '"What\'s weighing on you?"', description: "Heading shown above the field and used as its label." },
      { name: "width", type: "number", defaultValue: "400", description: "Field width in pixels." },
      { name: "maxChars", type: "number", defaultValue: "34", description: "How many characters it takes to reach the full sag." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Focus outline and caret colour." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a heavy sentence and lets it go by itself until someone clicks in." },
    ],
    Preview: Previews.PreviewSaggingField,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SaggingField } from "@/components/sagging-field";

export default function Page() {
  return (
    <section className="flex flex-col items-center py-16">
      <SaggingField label="What's on your mind today?" maxChars={40} accent="#ff375f" />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tear-off-ticket",
    name: "Tear-off Ticket",
    registryCliName: "tear-off-ticket",
    description:
      "An event ticket whose stub you pull away along the perforation. Let go early and it snaps back; pull through and it hangs on the last tooth, swings, then drops.",
    categorySlug: "cards",
    tags: ["ticket", "event", "stub", "drag", "tear", "pass", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Light & Matter"', description: "Event name." },
      { name: "venue", type: "string", defaultValue: '"Hall 3 · North Gallery"', description: "First detail line." },
      { name: "date", type: "string", defaultValue: '"Sat 14 Nov · 11:00"', description: "Second detail line." },
      { name: "seat", type: "string", defaultValue: '"Row C · Seat 12"', description: "Seat shown on the stub." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Tugs, tears and resets on a loop until someone grabs the stub." },
    ],
    Preview: Previews.PreviewTearOffTicket,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TearOffTicket } from "@/components/tear-off-ticket";

export default function Page() {
  return (
    <div className="flex justify-center py-16">
      <TearOffTicket title="Night Market" venue="Pier 9 · Lower Deck" date="Fri 20 Nov · 19:30" seat="General admission" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "throw-wheel",
    name: "Throw Wheel",
    registryCliName: "throw-wheel",
    description:
      "Cards on a 3D drum you can fling. While it spins every card turns edge-on and blurs with speed, then they straighten one by one as the wheel snaps a card to the front.",
    categorySlug: "three-d-components",
    tags: ["carousel", "3d", "wheel", "cards", "inertia", "drag", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "WheelCard[]", description: "Each card has title, sub and art (any CSS background). Ten travel destinations by default." },
      { name: "count", type: "number", description: "How many cards go on the wheel, 3 up to the number of cards you pass. Defaults to all of them." },
      { name: "cardSize", type: "number", defaultValue: "1", description: "Size of every card, 0.6 to 1.2. The wheel grows or shrinks with the cards." },
      { name: "glide", type: "number", defaultValue: "1", description: "How far the wheel keeps gliding after a throw, 0.3 to 3. Higher glides further before it snaps to a card." },
      { name: "tilt", type: "number", defaultValue: "1", description: "How far cards turn edge-on while the wheel spins, 0 to 2. 0 keeps every card flat." },
      { name: "blur", type: "number", defaultValue: "1", description: "How much cards blur with speed, 0 to 2. 0 keeps them sharp." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Throws the wheel every few seconds until someone grabs it." },
    ],
    Preview: Previews.PreviewThrowWheel,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ThrowWheel, type WheelCard } from "@/components/throw-wheel";

const collections: WheelCard[] = [
  { title: "Ceramics", sub: "42 pieces", art: "linear-gradient(160deg,#ffd6e7,#c49bff 60%,#5e5ce6)" },
  { title: "Textiles", sub: "18 pieces", art: "linear-gradient(160deg,#ffe58a,#ffcc00 50%,#ff9f0a)" },
  { title: "Glass", sub: "27 pieces", art: "linear-gradient(160deg,#c6f1ff,#64d2ff 50%,#0a84ff)" },
  { title: "Prints", sub: "65 pieces", art: "linear-gradient(160deg,#b7f7c5,#30d158 55%,#0b8f6a)" },
  { title: "Lighting", sub: "11 pieces", art: "linear-gradient(160deg,#ffc9a3,#ff9f0a 50%,#d1495b)" },
  { title: "Furniture", sub: "33 pieces", art: "linear-gradient(160deg,#dbe9ff,#8fb5ff 50%,#30486e)" },
  { title: "Jewellery", sub: "54 pieces", art: "linear-gradient(160deg,#ffb3c7,#ff6482 60%,#bf5af2)" },
  { title: "Books", sub: "90 pieces", art: "linear-gradient(160deg,#ffe2b8,#ffb36b 50%,#5ac8fa)" },
];

export default function Page() {
  return <ThrowWheel cards={collections} />;
}`,
    reactExamples: [
      {
        title: "Tune the feel",
        code: `// src/app/page.tsx

import { ThrowWheel } from "@/components/throw-wheel";

// Smaller cards on a short wheel that glides a long way, stays flat and keeps every card sharp.
export default function Page() {
  return <ThrowWheel count={7} cardSize={0.8} glide={2} tilt={0} blur={0} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "pixel-select",
    name: "Pixel Select",
    registryCliName: "pixel-select",
    description:
      "A dropdown that builds itself out of a grid of pixels tinted with the chosen colour, then dissolves into a falling shower of them when you pick an option.",
    categorySlug: "inputs-controls",
    tags: ["select", "dropdown", "listbox", "pixels", "mood", "menu", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-19",
    animationKinds: ["press", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "options", type: "Mood[]", description: "Each option has id, label and color; the pixels take the selected option's colour. Six moods by default." },
      { name: "onChange", type: "(id: string) => void", description: "Called with the option id when the user picks one." },
      { name: "pixelSize", type: "number", defaultValue: "12", description: "Width and height of each pixel in px, 10 to 24. Smaller pixels look finer but draw more of them." },
      { name: "speed", type: "number", defaultValue: "1", description: "Speed of the build and the dissolve, 0.5 to 2. Higher is quicker." },
      { name: "stagger", type: "number", defaultValue: "1", description: "How much the build ripples across the menu, 0 to 2. 0 makes every pixel appear together." },
      { name: "scatter", type: "number", defaultValue: "1", description: "How far the pixels fly as the menu dissolves, 0 to 2. 0 makes them fade where they are." },
      { name: "origin", type: "\"top-left\" | \"top-right\" | \"bottom-left\" | \"bottom-right\" | \"center\"", defaultValue: "\"top-left\"", description: "Where the menu starts building from." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and picks options by itself until someone interacts." },
    ],
    Preview: Previews.PreviewPixelSelect,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client"; // onChange is a function, which a server page cannot hand to a client component

import { PixelSelect, type Mood } from "@/components/pixel-select";

const themes: Mood[] = [
  { id: "ocean", label: "Ocean", color: "#0a84ff" },
  { id: "forest", label: "Forest", color: "#30d158" },
  { id: "sunset", label: "Sunset", color: "#ff9f0a" },
  { id: "berry", label: "Berry", color: "#ff375f" },
];

export default function Page() {
  // id is the theme the visitor picked: save it or apply it here.
  return <PixelSelect options={themes} onChange={(id) => console.log(id)} />;
}`,
    reactExamples: [
      {
        title: "Tune the dissolve",
        code: `// src/app/page.tsx

import { PixelSelect } from "@/components/pixel-select";

// Finer pixels that build from the middle, then burst outwards and fall further when the menu closes.
export default function Page() {
  return <PixelSelect pixelSize={10} origin="center" scatter={1.6} speed={1.3} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "scrub-inputs",
    name: "Scrub Inputs",
    registryCliName: "scrub-inputs",
    description:
      "Design-tool number fields: drag a label sideways to change the value, with Shift for big steps and Alt for fine ones. A badge shows how far you have moved, then reports the change when you let go.",
    categorySlug: "inputs-controls",
    tags: ["number input", "scrub", "drag", "inspector", "design tool", "slider", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 150,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", description: "ScrubInput: field name; dragging it changes the value." },
      { name: "value", type: "number", description: "ScrubInput: the current value (controlled)." },
      { name: "onChange", type: "(v: number) => void", description: "ScrubInput: called with each new value while dragging, typing or using the arrow keys." },
      { name: "min", type: "number", description: "ScrubInput: lowest allowed value." },
      { name: "max", type: "number", description: "ScrubInput: highest allowed value." },
      { name: "step", type: "number", defaultValue: "1", description: "ScrubInput: change per two pixels of drag and per arrow key press." },
      { name: "unit", type: "string", defaultValue: '""', description: "ScrubInput: suffix shown after the number and in the change badge." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Both: badge colour while dragging; ScrubInputs also starts its sample shape's gradient with it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "ScrubInputs: changes the three sample fields by itself until someone touches them." },
    ],
    Preview: Previews.PreviewScrubInputs,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { ScrubInput } from "@/components/scrub-inputs";

export default function Page() {
  const [opacity, setOpacity] = useState(100);
  const [blur, setBlur] = useState(0);

  return (
    <div className="flex w-[240px] flex-col gap-2.5">
      <ScrubInput label="Opacity" value={opacity} onChange={setOpacity} min={0} max={100} unit="%" />
      <ScrubInput label="Blur" value={blur} onChange={setBlur} min={0} max={40} step={0.5} unit="px" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "lit-keyboard",
    name: "Lit Keyboard",
    registryCliName: "lit-keyboard",
    description:
      "A tilted keyboard that lights up under your typing or clicks and fades with a slow afterglow, with a recorded mechanical click on every key. Record a run and replay it with the original timing and sound.",
    categorySlug: "motion-effects",
    tags: ["keyboard", "typing", "keys", "glow", "record", "replay", "sound", "key click", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-19",
    animationKinds: ["type", "press", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "glow", type: "string", defaultValue: '"#ff9f0a"', description: "Colour a key flashes to when pressed. Use a hex colour; the glow adds alpha to it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a sample phrase by itself every few seconds until someone types. The demo stays silent." },
      { name: "enableSound", type: "boolean", defaultValue: "true", description: "Plays a key click with every press, click and replayed key. Follows the site-wide sound switch and stays silent in autoplay." },
      { name: "soundSrc", type: "string", defaultValue: '"/sounds/keys.ogg"', description: "Recorded Cherry MX clicks, one per key. Put keys.ogg in public/sounds; until it loads, or if it is missing, a short synthesised tick plays." },
      { name: "volume", type: "number", defaultValue: "0.6", description: "Click volume, 0 to 1." },
    ],
    Preview: Previews.PreviewLitKeyboard,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { LitKeyboard } from "@/components/lit-keyboard";

export default function Page() {
  return (
    <section className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-8 py-16">
      <h2 className="text-3xl font-semibold tracking-tight">Shortcuts for everything</h2>
      <LitKeyboard glow="#0a84ff" autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ripple-field",
    name: "Ripple Field",
    registryCliName: "ripple-field",
    description:
      "A quiet grid of dots: click anywhere and a ring travels outward. Every dot it crosses bursts into colour, gets kicked away from the centre and springs back home.",
    categorySlug: "background-effects",
    tags: ["dots", "ripple", "canvas", "grid", "click effect", "springs", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 150,
    createdAt: "2026-10-19",
    animationKinds: ["press", "hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "height", type: "number", defaultValue: "300", description: "Height of the field in px; it fills the available width." },
      { name: "gap", type: "number", defaultValue: "18", description: "Distance between dots in px." },
      { name: "colors", type: "string[]", defaultValue: "RIPPLE_FIELD_PALETTE", description: "Colours a dot can burst into; one is picked at random each time a ring hits it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Drops rings at random spots until someone clicks." },
    ],
    Preview: Previews.PreviewRippleField,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { RippleField } from "@/components/ripple-field";

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-[720px]">
      <RippleField height={260} gap={16} colors={["#0a84ff", "#64d2ff", "#bf5af2"]} autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "dot-globe",
    name: "Dot Globe",
    registryCliName: "dot-globe",
    description:
      "A dotted globe with flight arcs drawing themselves along great circles. Drag to spin it and it coasts to a stop; pick a city and it springs round to face you.",
    categorySlug: "three-d-components",
    tags: ["globe", "map", "canvas", "flights", "arcs", "world", "inertia", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "size", type: "number", defaultValue: "340", description: "Width and height of the globe canvas in px." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the arcs, pins and the selected city chip." },
      { name: "cities", type: "DotGlobeCity[]", defaultValue: "DOT_GLOBE_CITIES", description: "Cities to pin and list as chips. Each has id, name, lat and lon." },
      { name: "routes", type: "[string, string][]", defaultValue: "DOT_GLOBE_ROUTES", description: "Flight arcs as pairs of city ids; pairs with an unknown id are skipped." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Turns slowly and tours the cities until someone drags or picks one." },
    ],
    Preview: Previews.PreviewDotGlobe,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { DotGlobe, type DotGlobeCity } from "@/components/dot-globe";

const offices: DotGlobeCity[] = [
  { id: "ber", name: "Berlin", lat: 52.52, lon: 13.4 },
  { id: "nyc", name: "New York", lat: 40.71, lon: -74.01 },
  { id: "sgp", name: "Singapore", lat: 1.35, lon: 103.82 },
];

export default function Page() {
  return (
    <DotGlobe
      size={360}
      accent="#30d158"
      cities={offices}
      routes={[["ber", "nyc"], ["ber", "sgp"]]}
      autoplay
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "component-layers",
    name: "Component Layers",
    registryCliName: "component-layers",
    description:
      "A finished music player card tips into an isometric view and peels apart into its surface, spacing, layout and content layers, each with a leader-line label.",
    categorySlug: "three-d-components",
    tags: ["exploded view", "isometric", "layers", "design system", "anatomy", "3d", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-19",
    animationKinds: ["3d", "spring", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Used in the cover art and for the hovered layer's outline and leader line." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Explodes and assembles on a loop until someone uses the toggle." },
    ],
    Preview: Previews.PreviewComponentLayers,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ComponentLayers } from "@/components/component-layers";

export default function Page() {
  return (
    <section className="flex flex-col items-center gap-6 py-20">
      <h2 className="text-3xl font-semibold tracking-tight">Built from four layers</h2>
      <ComponentLayers accent="#bf5af2" autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "standing-calendar",
    name: "Standing Calendar",
    registryCliName: "standing-calendar",
    description:
      "A contribution grid that stands up into a 3D field of columns. Each day becomes a box as tall as its count, rising in a wave across the weeks; hover a day to read its value.",
    categorySlug: "dashboards",
    tags: ["contribution graph", "heatmap", "calendar", "activity", "3d", "isometric", "chart", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["3d", "spring", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "weeks", type: "number", defaultValue: "30", description: "How many weeks of sample data to draw. Ignored when data is passed." },
      { name: "data", type: "number[][]", description: "Your own counts: one array of 7 numbers (Mon to Sun) per week. Sample data is generated if left out." },
      { name: "levels", type: "string[]", defaultValue: "STANDING_CALENDAR_LEVELS", description: "Five colours from no activity to busiest. The default empty colour follows light and dark mode." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Stands up and lies down on a loop until someone interacts." },
    ],
    Preview: Previews.PreviewStandingCalendar,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { StandingCalendar } from "@/components/standing-calendar";

// Your own counts: one array of 7 numbers (Mon to Sun) per week. 0 is the first colour, 1-2 the second, 3-5 the third, 6-8 the fourth and 9 or more the fifth.
const weeks = Array.from({ length: 20 }, (_, w) => Array.from({ length: 7 }, (_, d) => (w * 3 + d * 5) % 12));

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[680px] rounded-3xl p-6">
      <StandingCalendar
        data={weeks}
        levels={["#ebedf0", "#c7f0d2", "#7ee2a1", "#30d158", "#1a8f3c"]}
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "money-goo",
    name: "Money Goo",
    registryCliName: "money-goo",
    description:
      "A peer-to-peer payment you drag out of your avatar: a liquid neck stretches, thins and snaps, and dropping the amount on a friend pours it in while both balances roll.",
    categorySlug: "motion-effects",
    tags: ["payment", "send money", "drag and drop", "gooey", "metaball", "fintech", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "amount", type: "number", defaultValue: "40", description: "Amount carried by the draggable blob on each send." },
      { name: "from", type: "MoneyGooPerson", defaultValue: '{ name: "You", initials: "ME", balance: 248 }', description: "Sender: name, initials and starting balance." },
      { name: "to", type: "MoneyGooPerson", defaultValue: '{ name: "Maya", initials: "MK", balance: 112 }', description: "Recipient: name, initials shown in the avatar, and starting balance." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the goo, the blob and the drop-target ring." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sends money by itself on a loop until someone drags." },
    ],
    Preview: Previews.PreviewMoneyGoo,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MoneyGoo } from "@/components/money-goo";

export default function Page() {
  return (
    <MoneyGoo
      amount={25}
      from={{ name: "You", initials: "ME", balance: 180 }}
      to={{ name: "Leo", initials: "LO", balance: 64 }}
      accent="#34c759"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "weather-puck",
    name: "Weather Puck",
    registryCliName: "weather-puck",
    description:
      "Drag a glowing puck across a field of dots to set the time of day. Nearby dots lift and warm, and the landscape above relights from dawn to night with the hour name and clock rolling along.",
    categorySlug: "inputs-controls",
    tags: ["time of day", "slider", "weather", "sky", "canvas", "dot grid", "colour interpolation", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "spacing", type: "number", defaultValue: "14", description: "Gap between the dots in px, 8 to 24. Smaller packs more dots in." },
      { name: "dotSize", type: "number", defaultValue: "1", description: "Size of the dots, 0.6 to 1.8." },
      { name: "reach", type: "number", defaultValue: "1", description: "How far the light reaches across the dots, 0.5 to 2. Higher lights up more of them." },
      { name: "lift", type: "number", defaultValue: "1", description: "How high nearby dots rise, 0 to 2. 0 keeps them flat." },
      { name: "showClock", type: "boolean", defaultValue: "true", description: "Shows the clock under the name of the hour. Set false to show only the name." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps the light across the day until someone drags it." },
    ],
    Preview: Previews.PreviewWeatherPuck,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { WeatherPuck } from "@/components/weather-puck";

export default function Page() {
  return (
    <section className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold">Pick your golden hour</h2>
      <WeatherPuck />
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Tune the dots",
        code: `// src/app/page.tsx

import { WeatherPuck } from "@/components/weather-puck";

// Tight, small dots that the light lifts high, with the name of the hour but no clock.
export default function Page() {
  return <WeatherPuck spacing={10} dotSize={0.8} lift={1.6} showClock={false} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "metal-orbs",
    name: "Metal Orbs",
    registryCliName: "metal-orbs",
    description:
      "Two liquid-metal metaballs shaded per pixel with a fake chrome reflection on a 2D canvas. They bulge toward each other and pool when they meet; switch between joined, apart and orbit, or drag the cool orb around.",
    categorySlug: "shaders",
    tags: ["metaballs", "liquid metal", "chrome", "canvas", "blob", "no webgl", "segmented control", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "width", type: "number", defaultValue: "440", description: "Canvas width in px." },
      { name: "height", type: "number", defaultValue: "280", description: "Canvas height in px." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles joined, orbit and apart by itself until someone interacts." },
    ],
    Preview: Previews.PreviewMetalOrbs,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MetalOrbs } from "@/components/metal-orbs";

export default function Page() {
  return (
    <div className="flex justify-center py-16">
      <MetalOrbs width={520} height={300} autoplay />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "bending-rail",
    name: "Bending Rail",
    registryCliName: "bending-rail",
    description:
      "A slider whose rail follows the knob. Pull the knob off the groove and the rail bends toward it while a ghost knob keeps the value; let go and it twangs straight on a spring.",
    categorySlug: "inputs-controls",
    tags: ["slider", "range", "elastic", "rubber band", "spring", "svg", "volume", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: '"Volume"', description: "Label shown above the rail and used as the slider's accessible name." },
      { name: "min", type: "number", defaultValue: "0", description: "Lowest value." },
      { name: "max", type: "number", defaultValue: "100", description: "Highest value." },
      { name: "defaultValue", type: "number", defaultValue: "40", description: "Starting value." },
      { name: "unit", type: "string", defaultValue: '"%"', description: "Suffix shown after the value." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the filled run, the tether and the ghost knob." },
      { name: "onChange", type: "(v: number) => void", description: "Called whenever the rounded value changes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Tugs the knob around by itself until someone grabs it." },
    ],
    Preview: Previews.PreviewBendingRail,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { BendingRail } from "@/components/bending-rail";

export default function Page() {
  const [brightness, setBrightness] = useState(70);
  return (
    <div className="flex flex-col items-center gap-2">
      <BendingRail label="Brightness" defaultValue={brightness} accent="#ff9f0a" onChange={setBrightness} />
      <p className="text-sm text-neutral-500">Screen at {brightness}%</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "layout-switch",
    name: "Layout Switch",
    registryCliName: "layout-switch",
    description:
      "A photo set that glides between grid, row, feature and pile arrangements on springs, with nothing fading or cutting. Click a photo and it grows to fill the frame; click again or press Escape to put it back.",
    categorySlug: "motion-effects",
    tags: ["gallery", "photos", "layout", "grid", "pile", "segmented control", "lightbox", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 155,
    createdAt: "2026-10-19",
    animationKinds: ["layout", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "count", type: "number", defaultValue: "6", description: "How many photos to show, 3 to 6." },
      { name: "gap", type: "number", defaultValue: "10", description: "Space between photos in px, 0 to 24." },
      { name: "radius", type: "number", defaultValue: "16", description: "Roundness of the photo corners in px, 0 to 32. A photo opened full size is 8px rounder." },
      { name: "stiffness", type: "number", defaultValue: "220", description: "How strongly photos spring toward their new place, 100 to 500. Higher moves faster." },
      { name: "damping", type: "number", defaultValue: "26", description: "How quickly the spring settles, 12 to 40. Lower overshoots and bounces more." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Changes layouts by itself until someone interacts." },
    ],
    Preview: Previews.PreviewLayoutSwitch,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { LayoutSwitch } from "@/components/layout-switch";

export default function Page() {
  return (
    <section className="mx-auto flex max-w-[680px] flex-col gap-6 px-4 py-12">
      <h2 className="text-2xl font-semibold tracking-tight">Last summer</h2>
      <LayoutSwitch />
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Tune the feel",
        code: `// src/app/page.tsx

import { LayoutSwitch } from "@/components/layout-switch";

// Four photos with tight gaps and square corners on a loose, bouncy spring.
export default function Page() {
  return <LayoutSwitch count={4} gap={4} radius={0} stiffness={160} damping={16} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "fan-deck",
    name: "Fan Deck",
    registryCliName: "fan-deck",
    description:
      "A paint-chip deck that tips onto its side and fans out into a colour-graded half circle around its rivet. Hover lifts a chip and clicking one copies its hex code.",
    categorySlug: "motion-effects",
    tags: ["color palette", "paint chips", "fan out", "swatches", "copy hex", "spring", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-19",
    animationKinds: ["spring", "hover", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "chips", type: "FanDeckChip[]", defaultValue: "12 chips, Ember to Rosewood", description: "The swatches as { name, hex }, in the order they fan out from left to right." },
      { name: "count", type: "number", defaultValue: "all chips", description: "How many chips go in the deck, 2 up to the number you pass." },
      { name: "spread", type: "number", defaultValue: "180", description: "How wide the fan opens in degrees, 60 to 180. 180 is a half circle." },
      { name: "chipSize", type: "number", defaultValue: "1", description: "Size of the chips, 0.7 to 1.15." },
      { name: "lift", type: "number", defaultValue: "16", description: "How far a chip rises when hovered, in px, 0 to 32." },
      { name: "stagger", type: "number", defaultValue: "1", description: "How long each chip waits for the one before it when the deck opens, 0 to 2. 0 opens every chip together." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Fans out and closes by itself until someone interacts." },
    ],
    Preview: Previews.PreviewFanDeck,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { FanDeck } from "@/components/fan-deck";

const brand = [
  { name: "Night", hex: "#1D1D1F" },
  { name: "Slate", hex: "#5B6475" },
  { name: "Sky", hex: "#3DB9CF" },
  { name: "Cobalt", hex: "#0071E3" },
  { name: "Iris", hex: "#5B5BD6" },
  { name: "Sun", hex: "#F5A524" },
  { name: "Coral", hex: "#F76B4B" },
];

export default function Page() {
  return <FanDeck chips={brand} />;
}`,
    reactExamples: [
      {
        title: "Tune the fan",
        code: `// src/app/page.tsx

import { FanDeck } from "@/components/fan-deck";

// A narrower fan of eight chips that opens all at once and lifts high when hovered.
export default function Page() {
  return <FanDeck count={8} spread={120} stagger={0} lift={24} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "receipt-unfold",
    name: "Receipt Unfold",
    registryCliName: "receipt-unfold",
    description:
      "Press Get invoice and a folded paper slip rises out of the row, unfolds panel by panel on 3D hinges, and the total gets circled by hand.",
    categorySlug: "cards",
    tags: ["invoice", "receipt", "unfold", "3d", "paper", "billing", "path drawing", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-19",
    animationKinds: ["3d", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "lines", type: "ReceiptLine[]", defaultValue: "4 sample line items", description: "Line items as { label, amount } shown on the middle panel." },
      { name: "total", type: "string", defaultValue: '"$49.68"', description: "Total on the bottom panel; it gets circled once the slip is fully open." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and folds by itself until someone presses the row." },
    ],
    Preview: Previews.PreviewReceiptUnfold,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ReceiptUnfold } from "@/components/receipt-unfold";

export default function Page() {
  return (
    <ReceiptUnfold
      lines={[
        { label: "Team plan · November", amount: "$96.00" },
        { label: "Extra seats × 2", amount: "$16.00" },
        { label: "Tax", amount: "$8.96" },
      ]}
      total="$120.96"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "page-curl",
    name: "Page Curl",
    registryCliName: "page-curl",
    description:
      "Grab the corner of a page and peel it back. The fold is computed live from your pointer, the flap shows the paper's back, and whatever you put underneath is revealed.",
    categorySlug: "cards",
    tags: ["page curl", "peel", "fold", "reveal", "paper", "drag", "clip-path", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "width", type: "number", defaultValue: "400", description: "Page width in px." },
      { name: "height", type: "number", defaultValue: "260", description: "Page height in px." },
      { name: "front", type: "ReactNode", defaultValue: "sample letter", description: "Content of the page you peel." },
      { name: "back", type: "ReactNode", defaultValue: "hidden discount card", description: "What is revealed underneath the page." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Peeks the corner by itself until someone grabs it." },
    ],
    Preview: Previews.PreviewPageCurl,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { PageCurl } from "@/components/page-curl";

export default function Page() {
  return (
    <PageCurl
      width={360}
      height={220}
      front={
        <div className="flex h-full flex-col justify-center gap-2 p-7">
          <p className="text-[24px] font-semibold tracking-tight">There is more here.</p>
          <p className="text-[14px] text-neutral-500">Drag the bottom-right corner.</p>
        </div>
      }
      back={
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-200 to-rose-300 text-[22px] font-semibold">
          Free shipping: SHIPFREE
        </div>
      }
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "sign-and-seal",
    name: "Sign & Seal",
    registryCliName: "sign-and-seal",
    description:
      "A membership card you sign with your pointer on a canvas. Pause for a moment and a clear plastic sleeve slides down over it with a glint running across.",
    categorySlug: "inputs-controls",
    tags: ["signature", "signature pad", "canvas", "draw", "card", "sleeve", "idle detection", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-19",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "name", type: "string", defaultValue: '"Alex Rivera"', description: "Name printed on the card." },
      { name: "title", type: "string", defaultValue: '"Founding member"', description: "Small label above the name." },
      { name: "ink", type: "string", defaultValue: "theme ink", description: "Ink colour. Defaults to near-black, or near-white in dark mode." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Signs itself on a loop until someone draws." },
    ],
    Preview: Previews.PreviewSignAndSeal,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SignAndSeal } from "@/components/sign-and-seal";

export default function Page() {
  return <SignAndSeal name="Jordan Lee" title="Early supporter" ink="#0071e3" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "streak-counter",
    name: "Streak Counter",
    registryCliName: "streak-counter",
    description:
      "Log a day and the number rolls up, the week strip slides along to make room for today, and the flame bursts into embers that fall back in, burning hotter with each day.",
    categorySlug: "cards",
    tags: ["streak", "habit", "counter", "flame", "particles", "gamification", "week strip", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "start", type: "number", defaultValue: "11", description: "Streak length to start from; the flame heats up over the next eight logged days." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Logs a day by itself every couple of seconds until someone presses." },
    ],
    Preview: Previews.PreviewStreakCounter,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { StreakCounter } from "@/components/streak-counter";

export default function Page() {
  return <StreakCounter start={27} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "capsule-toggles",
    name: "Capsule Toggles",
    registryCliName: "capsule-toggles",
    description:
      "Switches built as a ball sealed in a glass capsule. Flip one and the ball stretches into a pill mid-flight, then takes on the row's colour and glows as it lands.",
    categorySlug: "inputs-controls",
    tags: ["toggle", "switch", "settings", "glass", "spring", "control center", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 156,
    createdAt: "2026-10-19",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "rows", type: "CapsuleToggleRow[]", defaultValue: "Wi-Fi, Bluetooth, Focus, Low Power", description: "CapsuleToggles: rows as { id, label, hint, color, on }." },
      { name: "title", type: "string", defaultValue: '"Controls"', description: "CapsuleToggles: small heading above the list." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "CapsuleToggles: flips the rows one after another until someone touches the panel." },
      { name: "checked", type: "boolean", defaultValue: "required", description: "CapsuleToggle: whether the switch is on." },
      { name: "onChange", type: "(v: boolean) => void", defaultValue: "required", description: "CapsuleToggle: called with the new value when pressed." },
      { name: "label", type: "string", defaultValue: "required", description: "CapsuleToggle: accessible name of the switch." },
      { name: "onColor", type: "string", defaultValue: '"#34c759"', description: "CapsuleToggle: ball colour and glow when on." },
      { name: "offColor", type: "string", defaultValue: "theme grey", description: "CapsuleToggle: ball colour when off; defaults to a grey that adapts to dark mode." },
    ],
    Preview: Previews.PreviewCapsuleToggles,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { CapsuleToggle } from "@/components/capsule-toggles";

export default function Page() {
  const [on, setOn] = useState(true);
  return (
    <label className="flex items-center justify-between gap-6">
      <span className="text-[15px] font-medium">Notifications</span>
      <CapsuleToggle label="Notifications" checked={on} onChange={setOn} onColor="#0a84ff" />
    </label>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "glass-bubbles",
    name: "Glass Bubbles",
    registryCliName: "glass-bubbles",
    description:
      "Four glass orbs hang on threads from the top of a panel. Sweep the pointer through them and they swing, knock into each other and spin their icons before settling back under their anchors.",
    categorySlug: "motion-effects",
    tags: ["bubbles", "glass", "pendulum", "physics", "verlet", "collisions", "pointer", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "size", type: "number", defaultValue: "1", description: "Size of every orb, 0.6 to 1.3. Bigger orbs knock into each other sooner." },
      { name: "threadLength", type: "number", defaultValue: "1", description: "Length of every thread, 0.5 to 1.3. Longer threads swing wider and slower." },
      { name: "gravity", type: "number", defaultValue: "1", description: "How hard the orbs are pulled down, 0.2 to 3. Lower floats, higher snaps back faster." },
      { name: "drag", type: "number", defaultValue: "1", description: "How quickly swinging dies away, 0.25 to 4. Lower keeps swinging, higher settles fast." },
      { name: "push", type: "number", defaultValue: "1", description: "How hard the pointer shoves an orb, 0.2 to 3." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Nudges a random bubble every 2.6 seconds until someone moves the pointer through them (skipped with reduced motion)." },
    ],
    Preview: Previews.PreviewGlassBubbles,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { GlassBubbles } from "@/components/glass-bubbles";

export default function Page() {
  return (
    <section className="flex flex-col items-center gap-6 py-16 text-center">
      <GlassBubbles autoplay />
      <p className="text-[15px] text-neutral-500">Nothing here yet. Give the bubbles a push.</p>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Heavy and slow",
        code: `// src/app/page.tsx

import { GlassBubbles } from "@/components/glass-bubbles";

// Bigger orbs on longer threads, with more drag so a push dies away gently.
export default function Page() {
  return <GlassBubbles size={1.2} threadLength={1.2} gravity={0.6} drag={2} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "box-spill",
    name: "Box Spill",
    registryCliName: "box-spill",
    description:
      "A cardboard box on a canvas. Open it and the flaps spring back as its contents burst out, bounce off each other and pile up on the floor; pack it up and they all fly home.",
    categorySlug: "motion-effects",
    tags: ["box", "unboxing", "canvas", "physics", "particles", "confetti", "celebration", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "count", type: "number", defaultValue: "30", description: "How many pieces burst out of the box; every third one is a round face with eyes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens and packs the box every 3.6 seconds until someone presses the button." },
    ],
    Preview: Previews.PreviewBoxSpill,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { BoxSpill } from "@/components/box-spill";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <h2 className="text-2xl font-semibold tracking-tight">Your order has arrived</h2>
      <BoxSpill count={40} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "curved-reel",
    name: "Curved Reel",
    registryCliName: "curved-reel",
    description:
      "An endless reel of posters bent around the inside of a curve: the centre cards sit back and pinch in while the edge cards swing round and come forward. It drifts on its own, and you can drag it or fling it to coast.",
    categorySlug: "three-d-components",
    tags: ["carousel", "reel", "posters", "3d", "curve", "infinite", "drag", "inertia", "gallery", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "posters", type: "ReelPoster[]", description: "Each poster has bg, fg, big (the large glyph), small (caption) and an optional serif flag. Defaults to ten type posters." },
      { name: "cardSize", type: "number", defaultValue: "1", description: "Size of each poster, 0.7 to 1.3. The reel gets taller with it." },
      { name: "gap", type: "number", defaultValue: "16", description: "Space between posters in pixels, 0 to 48." },
      { name: "curve", type: "number", defaultValue: "1", description: "How much the reel bends, 0 to 1.6. 0 lays it flat; higher swings the edge posters round and pushes the centre back." },
      { name: "speed", type: "number", defaultValue: "38", description: "How fast the reel drifts when autoplay is on, in pixels per second, 10 to 120." },
      { name: "glide", type: "number", defaultValue: "1", description: "How far the reel coasts after a fling, 0.3 to 3. Higher glides further." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Drifts the reel at 38px per second; it pauses for 2.5 seconds after a drag or key press. Off by default: the reel moves when you drag it." },
    ],
    Preview: Previews.PreviewCurvedReel,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { CurvedReel, type ReelPoster } from "@/components/curved-reel";

const issues: ReelPoster[] = [
  { bg: "#0040ff", fg: "#fff", big: "01", small: "Launch issue" },
  { bg: "#f2efe6", fg: "#1d1d1f", big: "Type", small: "Specimens", serif: true },
  { bg: "#ff4f00", fg: "#1d1d1f", big: "02", small: "Motion" },
  { bg: "#1d1d1f", fg: "#f5f5f7", big: "Ω", small: "Studio notes", serif: true },
  { bg: "#c8f560", fg: "#1d1d1f", big: "03", small: "Growth" },
  { bg: "#5e5ce6", fg: "#fff", big: "Iso", small: "Grids" },
  { bg: "#ffd60a", fg: "#1d1d1f", big: "04", small: "Colour" },
  { bg: "#0b8f6a", fg: "#e9fff6", big: "Fern", small: "Field notes", serif: true },
];

export default function Page() {
  return <CurvedReel posters={issues} />;
}`,
    reactExamples: [
      {
        title: "Tune the curve",
        code: `// src/app/page.tsx

import { CurvedReel } from "@/components/curved-reel";

// A deeper bend with tighter, smaller posters that drift slowly and coast a long way after a fling.
export default function Page() {
  return <CurvedReel curve={1.4} cardSize={0.85} gap={8} glide={2} autoplay speed={24} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "squeeze-progress",
    name: "Squeeze Progress",
    registryCliName: "squeeze-progress",
    description:
      "A full-panel progress line with a big percentage. Pause it and the tip bunches into a springy squiggle while the panel warms from blue to orange; resume and it stretches back out and carries on.",
    categorySlug: "loaders",
    tags: ["progress", "loader", "pause", "resume", "export", "squiggle", "spring", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 146,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Panel colour while running." },
      { name: "paused", type: "string", defaultValue: '"#c2410c"', description: "Panel colour while paused; the panel blends between the two on the same spring as the squiggle." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Toggles pause and resume every 2.2 seconds until someone presses the button." },
    ],
    Preview: Previews.PreviewSqueezeProgress,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SqueezeProgress } from "@/components/squeeze-progress";

export default function Page() {
  return (
    <div className="flex justify-center py-12">
      <SqueezeProgress accent="#1d1d1f" paused="#ff375f" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "bolting-sliders",
    name: "Bolting Sliders",
    registryCliName: "bolting-sliders",
    description:
      "A panel of settings sliders where clicking a track makes the knob leap there in an arc, leaving a fading dotted trail and reading out its value mid-air, then landing with a squash. Dragging and arrow keys work as usual.",
    categorySlug: "inputs-controls",
    tags: ["slider", "range", "settings", "knob", "arc", "trail", "squash", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["press", "drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "settings", type: "BoltSetting[]", defaultValue: "DEFAULT_BOLT_SETTINGS", description: "The sliders: each has id, label, min, max, unit (appended to the read-out) and a starting value." },
      { name: "title", type: "string", defaultValue: '"Render settings"', description: "Small caps heading above the sliders." },
      { name: "hint", type: "string", defaultValue: '"Click a track and watch the knob jump."', description: "Hint line under the sliders." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the filled track, the trail dots and the focus ring." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Throws one knob after another to random values every 1.1s until someone touches the panel." },
    ],
    Preview: Previews.PreviewBoltingSliders,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { BoltingSliders } from "@/components/bolting-sliders";

export default function Page() {
  return (
    <BoltingSliders
      title="Mixer"
      accent="#ff375f"
      settings={[
        { id: "gain", label: "Gain", min: -12, max: 12, unit: " dB", value: 0 },
        { id: "reverb", label: "Reverb", min: 0, max: 100, unit: "%", value: 20 },
        { id: "pan", label: "Pan", min: -50, max: 50, unit: "", value: 0 },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "crumple-to-trash",
    name: "Crumple to Trash",
    registryCliName: "crumple-to-trash",
    description:
      "A literal Move to trash: the page scrunches into a paper ball, arcs into a bin whose lid flips open and snaps shut, and Undo throws it back out and smooths it flat. Also includes the Motion Kit Shatter Delete variant.",
    categorySlug: "motion-effects",
    tags: ["delete", "trash", "undo", "crumple", "paper", "svg filter", "bin", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Draft · Q4 notes"', description: "Heading printed on the page." },
      { name: "onTrash", type: "() => void", description: "Called once the ball has landed in the bin." },
      { name: "onRestore", type: "() => void", description: "Called once Undo has smoothed the page flat again." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Throws the page away and brings it back every 3s until someone clicks the button." },
      { name: "ShatterDelete.fileName", type: "string", defaultValue: "\"Q3-board-report.pdf\"", description: "File name on the card." },
      { name: "ShatterDelete.meta", type: "string", defaultValue: "\"2.4 MB \u00b7 edited 2 days ago\"", description: "Secondary line under the name." },
      { name: "ShatterDelete.badge", type: "string", defaultValue: "\"PDF\"", description: "Text on the file-type badge." },
      { name: "ShatterDelete.badgeColor", type: "string", defaultValue: "\"#ff3b30\"", description: "Colour of the file-type badge." },
      { name: "ShatterDelete.onDelete", type: "() => void", description: "Called when the user presses Delete; the component only plays the effect." },
      { name: "ShatterDelete.onUndo", type: "() => void", description: "Called when the user presses Undo and the shards fly back together." },
      { name: "ShatterDelete.autoplay", type: "boolean", defaultValue: "false", description: "Shatters and mends the card every 2.3s until someone touches it." },
    ],
    Preview: Previews.PreviewCrumpleToTrash,
    previewSections: [
      {
        title: "Crumple to Trash",
        Preview: Previews.PreviewCrumpleToTrash,
        reactSource: `// src/app/page.tsx
"use client"; // the handlers are functions, which a server page cannot hand to a client component

import { CrumpleToTrash } from "@/components/crumple-to-trash";

export default function Page() {
  return (
    <CrumpleToTrash
      title="Launch checklist"
      onTrash={() => {
        // Delete the draft on your server.
      }}
      onRestore={() => {
        // Bring it back.
      }}
    />
  );
}`,
      },
      {
        title: "Shatter Delete",
        Preview: Previews.PreviewShatterDelete,
        reactSource: `// src/app/page.tsx

import { ShatterDelete } from "@/components/crumple-to-trash";

export default function Page() {
  return (
    <ShatterDelete
      fileName="brand-guidelines.fig"
      meta="18 MB · edited today"
      badge="FIG"
      badgeColor="#a259ff"
    />
  );
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client"; // the handlers are functions, which a server page cannot hand to a client component

import { CrumpleToTrash } from "@/components/crumple-to-trash";

export default function Page() {
  return (
    <CrumpleToTrash
      title="Launch checklist"
      onTrash={() => {
        // Delete the draft on your server.
      }}
      onRestore={() => {
        // Bring it back.
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tape-shelf",
    name: "Tape Shelf",
    registryCliName: "tape-shelf",
    description:
      "Cassette cases stand spine-out on a tilted 3D shelf. Hovering slides one up; picking one swings it round to show its cover with the reels turning, while the rest of the shelf steps aside and dims.",
    categorySlug: "three-d-components",
    tags: ["cassette", "tape", "shelf", "music", "3d", "picker", "album", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "tapes", type: "ShelfTape[]", defaultValue: "DEFAULT_TAPES", description: "Cases on the shelf, left to right: title, artist, color (spine and label) and ink (text colour on them)." },
      { name: "onPick", type: "(index: number | null) => void", description: "Called with the picked index when someone picks a tape, or null when it goes back." },
      { name: "size", type: "number", defaultValue: "1", description: "Size of the cases, 0.8 to 1.3. The shelf gets taller with it." },
      { name: "spacing", type: "number", defaultValue: "6", description: "Space between the cases in pixels, 0 to 20." },
      { name: "tilt", type: "number", defaultValue: "1", description: "How far the shelf is turned away from you, 0 to 1.6. 0 shows the spines straight on." },
      { name: "lift", type: "number", defaultValue: "1", description: "How far a hovered case slides up, 0 to 2." },
      { name: "snap", type: "number", defaultValue: "1", description: "How quickly the cases spring into place, 0.5 to 2.5. Lower is slow and soft, higher is snappy." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Pulls out the 3rd, 6th and 1st tapes in turn, putting each back, every 1.8s until someone touches the shelf." },
    ],
    Preview: Previews.PreviewTapeShelf,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TapeShelf } from "@/components/tape-shelf";

const mixtapes = [
  { title: "Summer '98", artist: "Side A", color: "#ff9f0a", ink: "#1d1d1f" },
  { title: "Road Trip", artist: "Dad's picks", color: "#0a84ff", ink: "#fff" },
  { title: "Late Shift", artist: "Lo-fi", color: "#5e5ce6", ink: "#fff" },
  { title: "Gym", artist: "Fast ones", color: "#ff375f", ink: "#fff" },
  { title: "Rainy Day", artist: "Acoustic", color: "#30d158", ink: "#0b2814" },
];

export default function Page() {
  return <TapeShelf tapes={mixtapes} />;
}`,
    reactExamples: [
      {
        title: "Looser shelf",
        code: `// src/app/page.tsx

import { TapeShelf } from "@/components/tape-shelf";

// Bigger cases with room between them, turned further away, that spring softly.
export default function Page() {
  return <TapeShelf size={1.15} spacing={12} tilt={1.4} lift={1.5} snap={0.7} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "packet-router",
    name: "Packet Router",
    registryCliName: "packet-router",
    description:
      "A live diagram of requests flowing from a router to four AI models along curved paths. Switch between Cost, Balanced and Quality and the traffic re-balances while each model's share and the blended price roll to their new values.",
    categorySlug: "ai-components",
    tags: ["ai", "llm", "router", "model routing", "traffic", "canvas", "pricing", "diagram", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-20",
    animationKinds: ["press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "defaultStrategy", type: '"Cost" | "Balanced" | "Quality"', defaultValue: '"Balanced"', description: "Strategy selected on mount." },
      { name: "onStrategyChange", type: "(strategy: RouterStrategy) => void", description: "Called when someone picks a strategy." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles Cost, Quality, Balanced every 2.8s until someone touches it." },
    ],
    Preview: Previews.PreviewPacketRouter,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { PacketRouter } from "@/components/packet-router";

export default function Page() {
  return (
    <section className="mx-auto max-w-[800px]">
      <PacketRouter defaultStrategy="Cost" />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "stamp-swirl",
    name: "Stamp Swirl",
    registryCliName: "stamp-swirl",
    description:
      "A row of perforated postage stamps whose artwork slowly swirls like wet ink. Hover or focus one and it lifts out of the row, swirls harder, and its name and year slide in underneath.",
    categorySlug: "cards",
    tags: ["stamps", "postage", "svg filter", "turbulence", "hover", "gallery", "collectible", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "stamps", type: "SwirlStamp[]", defaultValue: "Tidepool, Ember Fields, Night Bloom, Moss & Stone", description: "Stamps as { name, date, value, art }; art is any CSS background (layered gradients work best)." },
      { name: "size", type: "number", defaultValue: "1", description: "Size of each stamp, 0.7 to 1.2." },
      { name: "spacing", type: "number", defaultValue: "16", description: "Space between the stamps in pixels, 4 to 28." },
      { name: "swirl", type: "number", defaultValue: "1", description: "How strongly the artwork swirls, 0 to 2. 0 keeps it still and sharp." },
      { name: "speed", type: "number", defaultValue: "1", description: "How fast the ink flows, 0.2 to 3." },
      { name: "hoverScale", type: "number", defaultValue: "1.45", description: "How much a hovered stamp grows, 1.1 to 1.8." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Lifts the stamps one after another until the pointer enters." },
    ],
    Preview: Previews.PreviewStampSwirl,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { StampSwirl, type SwirlStamp } from "@/components/stamp-swirl";

const stamps: SwirlStamp[] = [
  { name: "Harbour Light", date: "1972", value: "15c", art: "radial-gradient(50% 50% at 30% 30%, #fff4d6, rgba(255,244,214,0) 60%), linear-gradient(160deg, #7fb7ff, #1c3f94)" },
  { name: "Desert Rose", date: "1985", value: "22c", art: "radial-gradient(55% 50% at 70% 30%, #ffe0e6, rgba(255,224,230,0) 60%), linear-gradient(170deg, #ffb199, #a83279)" },
  { name: "Pine Ridge", date: "1993", value: "29c", art: "radial-gradient(50% 50% at 40% 35%, #e6f7d9, rgba(230,247,217,0) 60%), linear-gradient(160deg, #8fc490, #1f4d3a)" },
];

export default function Page() {
  return <StampSwirl stamps={stamps} />;
}`,
    reactExamples: [
      {
        title: "Wet ink",
        code: `// src/app/page.tsx

import { StampSwirl } from "@/components/stamp-swirl";

// A stronger, slower swirl, with stamps that grow less on hover.
export default function Page() {
  return <StampSwirl swirl={1.6} speed={0.6} hoverScale={1.25} spacing={22} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "bubble-cluster",
    name: "Bubble Cluster",
    registryCliName: "bubble-cluster",
    description:
      "Contacts packed into one cluster of soft, tinted bubbles sized by how close they are, over a faint liquid backdrop. Switch groups and everyone springs to new places and sizes while people outside the group shrink away. Hover a bubble to read how close that person is.",
    categorySlug: "motion-effects",
    tags: ["contacts", "avatars", "circle packing", "gooey", "segmented control", "groups", "people", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["spring", "layout", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "people", type: "ClusterPerson[]", defaultValue: "12 sample contacts", description: "Everyone who can appear, as { id, name, hue }; hue (0-360) tints the bubble." },
      { name: "groups", type: "Record<string, Record<string, number>>", defaultValue: "Family, Close friends, Work", description: "Group name to { person id: closeness 1-5 }. Closeness sets bubble size; people left out of a group hide in it." },
      { name: "gap", type: "number", defaultValue: "5", description: "Space between bubbles, 0 to 24." },
      { name: "sizeContrast", type: "number", defaultValue: "1", description: "How much closeness changes size, 0 to 2. 0 makes every bubble the same size; higher makes the closest people much bigger." },
      { name: "bounce", type: "number", defaultValue: "1", description: "How bouncy the bubbles are when they move, 0.5 to 2.5. Lower is smooth and settled, higher wobbles." },
      { name: "liquid", type: "number", defaultValue: "1", description: "Strength of the faint liquid backdrop, 0 to 4. 0 hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Steps through the groups every 2.6s until someone presses the cluster or the switcher." },
    ],
    Preview: Previews.PreviewBubbleCluster,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { BubbleCluster, type ClusterPerson } from "@/components/bubble-cluster";

const team: ClusterPerson[] = [
  { id: "an", name: "Ana", hue: 200 },
  { id: "ben", name: "Ben", hue: 20 },
  { id: "cy", name: "Cy", hue: 140 },
  { id: "dee", name: "Dee", hue: 300 },
  { id: "eli", name: "Eli", hue: 50 },
];

export default function Page() {
  return (
    <BubbleCluster
      people={team}
      groups={{
        Design: { an: 5, dee: 4, eli: 2 },
        Engineering: { ben: 5, cy: 4, an: 2 },
        Launch: { eli: 5, ben: 3, cy: 3, dee: 2 },
      }}
    />
  );
}`,
    reactExamples: [
      {
        title: "Tune the cluster",
        code: `// src/app/page.tsx

import { BubbleCluster } from "@/components/bubble-cluster";

// Closeness matters more, bubbles sit tighter and wobble more, and the backdrop is stronger.
export default function Page() {
  return <BubbleCluster sizeContrast={1.5} gap={2} bounce={1.6} liquid={2} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "sticker-toss",
    name: "Sticker Toss",
    registryCliName: "sticker-toss",
    description:
      "A round logo sticker you can peel off a page header and throw. In flight it stretches along its direction of travel and its ring of text spins faster, then it springs back into its spot with a wobble.",
    categorySlug: "motion-effects",
    tags: ["sticker", "logo", "drag", "throw", "squash and stretch", "velocity", "playful", "header", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 155,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", defaultValue: '"NEXUS UI · MADE TO MOVE · "', description: "Text that runs around the ring; end it with a separator so the loop reads cleanly." },
      { name: "color", type: "string", defaultValue: "theme ink", description: "Sticker colour. Unset, it is #1d1d1f with white text (#f5f5f7 with dark text in dark mode); set, the ring text is white." },
      { name: "accent", type: "string", defaultValue: '"#c8f560"', description: "Colour of the dot in the middle." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Tosses the sticker every 3.2s until someone grabs it." },
    ],
    Preview: Previews.PreviewStickerToss,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { StickerToss } from "@/components/sticker-toss";

export default function Page() {
  return <StickerToss text="NORTHWIND · EST. 2026 · " color="#ff375f" accent="#ffd60a" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "context-meter",
    name: "Context Meter",
    registryCliName: "context-meter",
    description:
      "A context-window token meter drawn as a 40 by 5 dot grid. Hover a category to light only its dots; the conversation keeps growing, and Compact chat drops its dots out of the grid while everything after them reflows to close the gap.",
    categorySlug: "ai-components",
    tags: ["tokens", "context window", "llm", "usage meter", "dot grid", "ai chat", "layout", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-20",
    animationKinds: ["layout", "hover", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "categories", type: "ContextCategory[]", defaultValue: "System prompt, Tools, Files, Conversation, Memory", description: "Starting categories as { id, label, color, tokens } with tokens in thousands; read once on mount." },
      { name: "limit", type: "number", defaultValue: "200", description: "Window size in thousands of tokens; the grid always has 200 dots." },
      { name: "growId", type: "string", defaultValue: '"conv"', description: "Category that grows by 2.2K every 380ms and is cut back to 6.2K by Compact chat." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles the highlight and compacts when the window passes 90%, until someone touches the card." },
    ],
    Preview: Previews.PreviewContextMeter,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ContextMeter, type ContextCategory } from "@/components/context-meter";

const usage: ContextCategory[] = [
  { id: "sys", label: "Instructions", color: "#8e8e93", tokens: 6 },
  { id: "docs", label: "Attached docs", color: "#ff9f0a", tokens: 31.5 },
  { id: "chat", label: "Chat history", color: "#0071e3", tokens: 22 },
];

export default function Page() {
  return <ContextMeter categories={usage} limit={128} growId="chat" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "mood-wheel",
    name: "Mood Wheel",
    registryCliName: "mood-wheel",
    description:
      "Feelings laid along the rim of a wheel that you drag, scroll or arrow through. The word at the centre gets bracketed, fills the sentence below and the orb beside it melts into that mood's colours.",
    categorySlug: "inputs-controls",
    tags: ["mood", "picker", "wheel", "slider", "inertia", "snap", "journal", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "moods", type: "Mood[]", defaultValue: "DEFAULT_MOODS", description: "Words on the wheel, each as { word, a, b } where a is the main orb colour and b the light one. Ten moods from Calm to Grateful by default." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Spins to a random mood every 2 s until someone drags, scrolls or uses the keys." },
    ],
    Preview: Previews.PreviewMoodWheel,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MoodWheel, type Mood } from "@/components/mood-wheel";

const moods: Mood[] = [
  { word: "Calm", a: "#8ec5ff", b: "#d7f0ff" },
  { word: "Hopeful", a: "#ffd36e", b: "#fff4d1" },
  { word: "Restless", a: "#ff7a6b", b: "#ffe0db" },
  { word: "Tired", a: "#a7a3d9", b: "#ebe9ff" },
  { word: "Grateful", a: "#9fd36b", b: "#eefcd9" },
];

export default function Page() {
  return (
    <section className="flex flex-col items-center gap-6 py-12">
      <h2 className="text-[22px] font-semibold tracking-[-0.02em]">How are you today?</h2>
      <MoodWheel moods={moods} />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "swipe-stack",
    name: "Swipe Stack",
    registryCliName: "swipe-stack",
    description:
      "Payments to review as a deck of cards. Drag the top card right to approve or left to flag: it tilts as you pull, a stamp fades in, and once thrown the next card rises from the deck. Also includes the Motion Kit Swipe Rows variant.",
    categorySlug: "cards",
    tags: ["swipe", "tinder", "deck", "cards", "approve", "review", "payments", "drag", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "payments", type: "SwipePayment[]", defaultValue: "DEFAULT_PAYMENTS", description: "Cards to review, top first: { amount, from, to, note, when, hue }. \"Load more\" deals the same list again." },
      { name: "onDecide", type: "(payment: SwipePayment, approved: boolean) => void", defaultValue: "undefined", description: "Called after a card is thrown; approved is true for right / approve and false for left / flag." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Throws a card every 1.7 s (mostly approvals) and reloads when empty, until someone touches it." },
      { name: "SwipeRows.items", type: "SwipeRowItem[]", defaultValue: "DEFAULT_SWIPE_MAIL", description: "Rows to show, each { id, from, subject, time, color }." },
      { name: "SwipeRows.title", type: "string", defaultValue: "\"Inbox\"", description: "Heading at the top of the list." },
      { name: "SwipeRows.onArchive", type: "(item: SwipeRowItem) => void", description: "Called when the user archives a row (swipe right or the right arrow key)." },
      { name: "SwipeRows.onDelete", type: "(item: SwipeRowItem) => void", description: "Called when the user deletes a row (long swipe left, the Delete button, or Delete/Backspace)." },
      { name: "SwipeRows.onFlag", type: "(item: SwipeRowItem) => void", description: "Called when the user taps Flag on a half-open row." },
      { name: "SwipeRows.onUndo", type: "(item: SwipeRowItem, action: \"archive\" | \"delete\") => void", description: "Called when the user undoes the last archive or delete." },
      { name: "SwipeRows.autoplay", type: "boolean", defaultValue: "false", description: "Archives and deletes rows by itself, refilling the list, until someone touches it." },
    ],
    Preview: Previews.PreviewSwipeStack,
    previewSections: [
      {
        title: "Swipe Stack",
        Preview: Previews.PreviewSwipeStack,
        reactSource: `// src/app/page.tsx

import { SwipeStack, type SwipePayment } from "@/components/swipe-stack";

const queue: SwipePayment[] = [
  { amount: "$1,240", from: "Acme Inc", to: "you", note: "March retainer", when: "2h", hue: 200 },
  { amount: "$86.10", from: "you", to: "Lena", note: "dinner split", when: "6h", hue: 20 },
  { amount: "$540", from: "Orbit Labs", to: "you", note: "invoice #204", when: "1d", hue: 140 },
];

export default function Page() {
  return (
    <SwipeStack
      payments={queue}
    />
  );
}`,
      },
      {
        title: "Swipe Rows",
        Preview: Previews.PreviewSwipeRows,
        reactSource: `// src/app/page.tsx

import { SwipeRows, type SwipeRowItem } from "@/components/swipe-stack";

const mail: SwipeRowItem[] = [
  { id: "a1", from: "Priya Shah", subject: "Contract signed", time: "10:12", color: "#0a84ff" },
  { id: "a2", from: "GitHub", subject: "3 new pull request reviews", time: "9:30", color: "#5e5ce6" },
  { id: "a3", from: "Noah Kim", subject: "Lunch on Thursday?", time: "Yesterday", color: "#30d158" },
];

export default function Page() {
  return (
    <SwipeRows
      title="Inbox"
      items={mail}
    />
  );
}`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SwipeStack, type SwipePayment } from "@/components/swipe-stack";

const queue: SwipePayment[] = [
  { amount: "$1,240", from: "Acme Inc", to: "you", note: "March retainer", when: "2h", hue: 200 },
  { amount: "$86.10", from: "you", to: "Lena", note: "dinner split", when: "6h", hue: 20 },
  { amount: "$540", from: "Orbit Labs", to: "you", note: "invoice #204", when: "1d", hue: 140 },
];

export default function Page() {
  return (
    <SwipeStack
      payments={queue}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "flight-tracker",
    name: "Flight Tracker",
    registryCliName: "flight-tracker",
    description:
      "A live flight card: a plane banks along a dotted arc while the flown part fills in behind it, and the status line counts down to landing. Expand it for altitude, speed and distance left.",
    categorySlug: "cards",
    tags: ["flight", "travel", "tracker", "status", "svg path", "progress", "expand", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "from", type: "string", defaultValue: '"NYC"', description: "Departure airport code." },
      { name: "to", type: "string", defaultValue: '"LON"', description: "Arrival airport code." },
      { name: "flight", type: "string", defaultValue: '"MK 214"', description: "Flight number in the top-right corner." },
      { name: "departs", type: "string", defaultValue: '"8:30 PM"', description: "Departure time under the origin code." },
      { name: "arrives", type: "string", defaultValue: '"8:40 AM"', description: "Arrival time under the destination code." },
      { name: "minutes", type: "number", defaultValue: "410", description: "Total flight time; drives the \"Landing in N min\" countdown." },
      { name: "miles", type: "number", defaultValue: "3459", description: "Route length; drives the remaining distance in the details." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Flies the plane along the arc on a loop (about 22 s per flight). Off by default: the plane stays at 35% of the route." },
    ],
    Preview: Previews.PreviewFlightTracker,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { FlightTracker } from "@/components/flight-tracker";

export default function Page() {
  return (
    <aside className="flex flex-col gap-4">
      <FlightTracker from="SFO" to="NRT" flight="NH 7" departs="11:25 AM" arrives="3:10 PM" minutes={665} miles={5130} />
    </aside>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "matrix-loaders",
    name: "Matrix Loaders",
    registryCliName: "matrix-loaders",
    description:
      "Six 5×5 dot-matrix loaders driven by one shared pulse. Only the phase offset per dot changes, which turns the same grid into a wave, ripple, spiral, rain, sweep or checkerboard.",
    categorySlug: "loaders",
    tags: ["loader", "spinner", "dot matrix", "grid", "pulse", "status", "loading", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 145,
    createdAt: "2026-10-20",
    animationKinds: ["layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "size", type: "number", defaultValue: "64", description: "Grid size of each loader in px; tiles are size + 68 px square." },
      { name: "color", type: "string", defaultValue: "undefined", description: "One dot colour for every loader. Defaults to each pattern's own colour." },
      { name: "showLabels", type: "boolean", defaultValue: "true", description: "Show the pulsing label (\"Indexing…\", \"Thinking…\") under each loader." },
      { name: "MatrixLoader.pattern", type: '"wave" | "ripple" | "spiral" | "rain" | "halogen" | "checker" | number', defaultValue: "0", description: "Standalone MatrixLoader: which pattern to play, by name or index." },
      { name: "MatrixLoader.size", type: "number", defaultValue: "64", description: "Standalone MatrixLoader: grid size in px." },
      { name: "MatrixLoader.color", type: "string", defaultValue: "undefined", description: "Standalone MatrixLoader: dot colour; defaults to the pattern's colour." },
      { name: "MatrixLoader.label", type: "string", defaultValue: "undefined", description: "Standalone MatrixLoader: accessible label; defaults to the pattern's label." },
    ],
    Preview: Previews.PreviewMatrixLoaders,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MatrixLoader } from "@/components/matrix-loaders";

export default function Page() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-[#1c1c1e]">
      <MatrixLoader pattern="ripple" size={28} label="Generating answer" />
      <span className="text-[14px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Thinking…</span>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "todo-tower",
    name: "Todo Tower",
    registryCliName: "todo-tower",
    description:
      "A to-do list stacked like bricks. Tick a task or drag it out sideways and the pile drops into the gap with a bounce; any brick left hanging too far over the one below tips off the edge.",
    categorySlug: "cards",
    tags: ["todo", "tasks", "stack", "bricks", "physics", "drag", "checklist", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "press", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "tasks", type: "TodoTowerTask[]", defaultValue: "TODO_TOWER_TASKS", description: "Starting pile, top to bottom. Each task has text and x, its sideways offset in px." },
      { name: "moreTasks", type: "string[]", defaultValue: "TODO_TOWER_MORE", description: "Labels the Add a task button drops onto the top of the pile, in turn." },
      { name: "overhang", type: "number", defaultValue: "24", description: "How far (px) a brick may hang past the one beneath it before it tips off." },
      { name: "maxBricks", type: "number", defaultValue: "8", description: "Most bricks the pile holds; adding does nothing past this." },
      { name: "onComplete", type: "(text: string) => void", description: "Called with a task's label when it is ticked off." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Ticks tasks off and adds new ones by itself until someone touches the pile." },
    ],
    Preview: Previews.PreviewTodoTower,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TodoTower } from "@/components/todo-tower";

export default function Page() {
  return (
    <TodoTower
      tasks={[
        { text: "Draft the proposal", x: -12 },
        { text: "Review pull requests", x: 8 },
        { text: "Plan the sprint", x: 20 },
        { text: "Answer support tickets", x: 0 },
      ]}
      moreTasks={["Update the changelog", "Book a design review"]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "peek-login",
    name: "Peek Login",
    registryCliName: "peek-login",
    description:
      "A sign-in card with a little face whose eyes follow the pointer and read along as you type your email. It covers its eyes with its paws while you type a password and peeks when you show it.",
    categorySlug: "login-forms",
    tags: ["login", "sign in", "form", "mascot", "eyes", "password", "playful", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "type", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the face, the focus rings and the Show/Hide button." },
      { name: "onSubmit", type: "(values: PeekLoginValues) => void", description: "Called with { email, password } on submit. The component sends nothing itself; it only plays a short local signing-in state." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a sample email and password and peeks at it, on a loop, until someone interacts." },
    ],
    Preview: Previews.PreviewPeekLogin,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { PeekLogin } from "@/components/peek-login";

export default function Page() {
  return (
    <main className="flex min-h-[560px] items-center justify-center">
      <PeekLogin
        accent="#5e5ce6"
        onSubmit={({ email }) => {
          // Hand the values to your own auth call here.
          console.log("sign in", email);
        }}
      />
    </main>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "heat-field",
    name: "Heat Field",
    registryCliName: "heat-field",
    description:
      "A field of grey dots that melts into a heat map under the cursor, swelling and blending from yellow through red to violet. Press and hold to leave heat behind that slowly cools.",
    categorySlug: "background-effects",
    tags: ["heat map", "dots", "canvas", "goo", "cursor", "interactive", "grid", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 147,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "radius", type: "number", defaultValue: "46", description: "Spread of the heat around the pointer in px; held heat spreads a little wider." },
      { name: "hint", type: "string", defaultValue: '"Move across the dots. Press and hold to leave heat behind."', description: "Line under the field. Pass an empty string to hide it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "An invisible hand wanders across the field, now and then pressing, until someone points at it." },
    ],
    Preview: Previews.PreviewHeatField,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { HeatField } from "@/components/heat-field";

export default function Page() {
  return (
    <section className="flex flex-col items-center gap-6 py-16">
      <h2 className="text-3xl font-semibold tracking-tight">Where people click</h2>
      <HeatField radius={56} hint="" autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "particle-mark",
    name: "Particle Mark",
    registryCliName: "particle-mark",
    description:
      "A word drawn as a few hundred dots that scatter away from the pointer and spring home, warming to the accent colour the further they are pushed. Click anywhere for a shockwave.",
    categorySlug: "motion-effects",
    tags: ["particles", "text", "logo", "canvas", "dots", "shockwave", "springs", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 155,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "spring", "magnetic"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", defaultValue: '"motion"', description: "The word drawn in dots; long words are shrunk to fit." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Hex colour the dots warm to as they are pushed away from home." },
      { name: "hint", type: "string", defaultValue: '"Brush through the dots. Click for a shockwave."', description: "Line under the canvas. Pass an empty string to hide it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "An invisible pointer loops through the word, with a shockwave every few seconds, until someone points at it." },
    ],
    Preview: Previews.PreviewParticleMark,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ParticleMark } from "@/components/particle-mark";

export default function Page() {
  return (
    <section className="flex justify-center py-20">
      <ParticleMark text="hello" accent="#ff375f" hint="" />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "generate-image",
    name: "Generate Image",
    registryCliName: "generate-image",
    description:
      "An image-generation card: press Generate and the picture arrives coarse to fine with the noise easing off, under a sheet of glass with light sweeping across it and a denoising counter. Also includes Image Generating: The image actually forms: static, then a blurry blocky guess, then sharper steps as the noise fades, with the step count under the prompt and actions once it lands.",
    categorySlug: "ai-components",
    tags: ["ai", "image generation", "prompt", "progressive", "loading", "canvas", "glass", "motion kit", "framer-motion", "image generating"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["press", "type", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "prompt", type: "string", defaultValue: '"Pink dusk over soft hills"', description: "Prompt the field starts with." },
      { name: "onGenerate", type: "(prompt: string) => void", description: "Called with the prompt each time Generate is pressed." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Generates a new scene every few seconds, cycling the sample prompts, until someone interacts." },
      { name: "ImageGenerating.prompts", type: "string[]", defaultValue: "two demo prompts", description: "Prompts shown in turn, one per run." },
      { name: "ImageGenerating.steps", type: "number", defaultValue: "30", description: "How many denoising steps a run takes, about one every 105ms." },
      { name: "ImageGenerating.onAction", type: "(action: \"Variations\" | \"Upscale\" | \"Download\", prompt: string) => void", defaultValue: "undefined", description: "Called when one of the actions under the picture is pressed. Variations also starts the next run." },
      { name: "ImageGenerating.autoplay", type: "boolean", defaultValue: "false", description: "Starts a new run every few seconds until someone touches the component. Never runs under reduced motion and pauses when off screen." },
      { name: "ImageGenerating.className", type: "string", defaultValue: "undefined", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewGenerateImage,
    previewSections: [
      {
        title: "Generate Image",
        Preview: Previews.PreviewGenerateImage,
        reactSource: `// src/app/page.tsx

import { GenerateImage } from "@/components/generate-image";

export default function Page() {
  return (
    <div className="flex justify-center py-12">
      <GenerateImage
        prompt="Moonlit ridge, deep teal"
      />
    </div>
  );
}`,
      },
      {
        title: "Image Generating",
        Preview: Previews.PreviewImageGenerating,
        reactSource: `// src/app/page.tsx

import { ImageGenerating } from "@/components/generate-image";

export default function Page() {
  return (
    <ImageGenerating
      prompts={["A quiet harbour at dusk, soft film grain", "Desert dunes under a pale morning moon"]}
    />
  );
}
`,
      },
    ],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { GenerateImage } from "@/components/generate-image";

export default function Page() {
  return (
    <div className="flex justify-center py-12">
      <GenerateImage
        prompt="Moonlit ridge, deep teal"
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "falloff-accordion",
    name: "Falloff Accordion",
    registryCliName: "falloff-accordion",
    description:
      "A row of photo strips where the one you point at opens and its neighbours give way on a smooth Gaussian falloff, so the whole row leans toward the pointer while a caption rises on the open strip.",
    categorySlug: "cards",
    tags: ["accordion", "gallery", "photo strips", "hover", "falloff", "expand", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "strips", type: "FalloffStrip[]", defaultValue: "DEFAULT_FALLOFF_STRIPS", description: "Each strip has a unique title, a meta line and art (any CSS background, e.g. a gradient or url(...) center / cover)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens every other strip in turn until someone points at the row." },
    ],
    Preview: Previews.PreviewFalloffAccordion,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { FalloffAccordion } from "@/components/falloff-accordion";

const places = [
  { title: "Glacier", meta: "Iceland", art: "url(/photos/glacier.jpg) center / cover" },
  { title: "Dune", meta: "Morocco", art: "url(/photos/dune.jpg) center / cover" },
  { title: "Fern", meta: "New Zealand", art: "linear-gradient(170deg,#e4f7c7,#8fd16a 40%,#2f7d4a 75%,#123a26)" },
  { title: "Lagoon", meta: "Maldives", art: "linear-gradient(170deg,#e0fffb,#6fe3d6 40%,#1695a3 78%,#0b3c55)" },
];

export default function Page() {
  return <FalloffAccordion strips={places} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "magnet-select",
    name: "Magnet Select",
    registryCliName: "magnet-select",
    description:
      "A status picker where the selection is a liquid orb: a bead reaches toward the option you point at, and picking it sends the orb sliding over with a stretching liquid tail, nudging the options it passes out of the way.",
    categorySlug: "inputs-controls",
    tags: ["select", "status", "radio", "goo", "liquid", "picker", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "spring", "magnetic"],
    dependencies: ["framer-motion"],
    props: [
      { name: "options", type: "MagnetOption[]", defaultValue: "DEFAULT_MAGNET_OPTIONS", description: "Each option has id, label and d (SVG path for a 24×24 stroked icon). The last one sits in the centre, the rest on a ring." },
      { name: "defaultValue", type: "string", description: "id of the option selected at first. Defaults to the last (centre) option." },
      { name: "onChange", type: "(id: string) => void", description: "Called with the option id when the user picks one." },
      { name: "label", type: "string", defaultValue: '"Status"', description: "Accessible name of the radio group." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Points at and picks options by itself until someone touches it." },
    ],
    Preview: Previews.PreviewMagnetSelect,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { MagnetSelect } from "@/components/magnet-select";

export default function Page() {
  const [status, setStatus] = useState("here");
  return (
    <div className="flex flex-col items-center gap-4">
      <MagnetSelect defaultValue={status} onChange={setStatus} />
      <p className="text-sm text-neutral-500">Saved as: {status}</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "aspect-crop",
    name: "Aspect Crop",
    registryCliName: "aspect-crop",
    description:
      "An aspect-ratio picker whose crop frame keeps the same area at every ratio, so switching reads as re-cropping the same photo. The frame springs to its new shape and rule-of-thirds lines flash while it moves.",
    categorySlug: "inputs-controls",
    tags: ["crop", "aspect ratio", "image editor", "segmented control", "photo", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 147,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "ratios", type: "AspectRatioOption[]", defaultValue: "DEFAULT_ASPECT_RATIOS", description: "Ratios to offer, each { id, w, h } (4:3, 1:1, 3:4 and 9:16 by default)." },
      { name: "src", type: "string", description: "Photo to crop. Without it a drawn sunset illustration is shown." },
      { name: "alt", type: "string", defaultValue: '""', description: "Alt text for src." },
      { name: "onChange", type: "(id: string) => void", description: "Called with the ratio id when the user picks one." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles through the ratios until someone touches it." },
    ],
    Preview: Previews.PreviewAspectCrop,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { AspectCrop } from "@/components/aspect-crop";

export default function Page() {
  return (
    <AspectCrop
      src="/images/cover.jpg"
      alt="Album cover"
      ratios={[
        { id: "1:1", w: 1, h: 1 },
        { id: "4:5", w: 4, h: 5 },
        { id: "16:9", w: 16, h: 9 },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "slosh-slider",
    name: "Slosh Slider",
    registryCliName: "slosh-slider",
    description:
      "A slider whose value has mass: the rigid handle stays under your finger while the liquid fill lags behind, leans with the speed you drag at and sloshes back and forth before it settles.",
    categorySlug: "inputs-controls",
    tags: ["slider", "range", "liquid", "volume", "velocity", "physics", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: '"Volume"', description: "Label above the track; also the slider's accessible name." },
      { name: "defaultValue", type: "number", defaultValue: "55", description: "Starting value, 0 to 100." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Liquid colour and focus ring." },
      { name: "onChange", type: "(value: number) => void", description: "Called with the rounded value (0 to 100) whenever it changes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Throws the handle to a series of values until someone touches it." },
    ],
    Preview: Previews.PreviewSloshSlider,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SloshSlider } from "@/components/slosh-slider";

export default function Page() {
  return (
    <div className="flex flex-col gap-8">
      <SloshSlider label="Volume" defaultValue={55} />
      <SloshSlider label="Bass" defaultValue={30} accent="#ff9f0a" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "goo-reorder",
    name: "Goo Reorder",
    registryCliName: "goo-reorder",
    description:
      "A drag-to-reorder list made of ink: rows stay joined to their neighbours by a liquid neck that stretches as one leaves and pinches off as it lands, while the text stays sharp on top.",
    categorySlug: "inputs-controls",
    tags: ["reorder", "sortable", "drag and drop", "list", "goo", "liquid", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "GooReorderItem[]", defaultValue: "DEFAULT_GOO_ITEMS", description: "Starting rows, each { id, label, color } where color tints the numbered badge." },
      { name: "onReorder", type: "(items: GooReorderItem[]) => void", description: "Called with the new order after the user drags a row or moves it with the arrow keys." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Swaps two random rows every 1.6s until someone touches the list." },
    ],
    Preview: Previews.PreviewGooReorder,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { GooReorder } from "@/components/goo-reorder";

const steps = [
  { id: "plan", label: "Plan the sprint", color: "#ff9f0a" },
  { id: "build", label: "Build the feature", color: "#5ac8fa" },
  { id: "test", label: "Test on devices", color: "#30d158" },
  { id: "ship", label: "Ship it", color: "#ff375f" },
];

export default function Page() {
  return <GooReorder items={steps} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "hop-labels",
    name: "Hop Labels",
    registryCliName: "hop-labels",
    description:
      "Outlined text fields whose label sits inside like a placeholder, then lifts into the border on focus with a hop running along its letters while the outline parts to make room. The email field checks itself on blur with a shake or a tick.",
    categorySlug: "inputs-controls",
    tags: ["input", "text field", "floating label", "outlined", "form", "validation", "material", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["type", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Outline and label colour while a field is focused." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a name and an email into the form by itself, until someone touches it." },
    ],
    Preview: Previews.PreviewHopLabels,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { HopField } from "@/components/hop-labels";

export default function Page() {
  return (
    <form className="flex w-[320px] flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <HopField label="Full name" accent="#5e5ce6" />
      <HopField
        label="Work email"
        type="email"
        accent="#5e5ce6"
        validate={(v) => /^\\S+@\\S+\\.\\S+$/.test(v)}
        errorMessage="Use your work email."
      />
      <HopField label="Password" type="password" accent="#5e5ce6" validate={(v) => v.length >= 8} errorMessage="At least 8 characters." />
    </form>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "step-player",
    name: "Step Player",
    registryCliName: "step-player",
    description:
      "An onboarding player: the current step's dot stretches into a bar that fills while it plays, then eases over to the next dot as a small wave runs through the ones ahead. Play, pause, or tap a dot to jump to a step.",
    categorySlug: "inputs-controls",
    tags: ["onboarding", "stepper", "progress", "dots", "pagination", "carousel", "tour", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-20",
    animationKinds: ["spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the filling bar, finished dots and the \"Step n of m\" line." },
      { name: "steps", type: "StepPlayerStep[]", defaultValue: "DEFAULT_STEPS", description: "Steps to play through, each { t: title, b: one-line body }." },
      { name: "stepDuration", type: "number", defaultValue: "3.2", description: "Seconds each step plays before moving on." },
      { name: "autoplay", type: "boolean", defaultValue: "true", description: "Starts playing on mount. Set to false to start paused; the play button still works." },
    ],
    Preview: Previews.PreviewStepPlayer,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { StepPlayer, type StepPlayerStep } from "@/components/step-player";

const tour: StepPlayerStep[] = [
  { t: "Import your tracks", b: "Drag a folder in, we sort the rest." },
  { t: "Make a playlist", b: "Hold a song to add it anywhere." },
  { t: "Share it", b: "Friends can listen without an account." },
];

export default function Page() {
  return <StepPlayer steps={tour} accent="#ff375f" stepDuration={4} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "pull-to-refresh",
    name: "Pull to Refresh",
    registryCliName: "pull-to-refresh",
    description:
      "A balance card you pull down to refresh: it rubber-bands and stretches while a ring draws itself, closes the ring past the line, holds while it spins, then springs back with a little overshoot as the digits roll and the chart redraws.",
    categorySlug: "loaders",
    tags: ["pull to refresh", "refresh", "drag", "elastic", "rubber band", "balance", "finance", "spinner", "mobile", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "initialBalance", type: "number", defaultValue: "58834.75", description: "Balance shown before the first refresh." },
      { name: "onRefresh", type: "(balance: number, delta: number) => void", defaultValue: "undefined", description: "Called each time a pull commits, with the new balance and the change." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Pulls the card down and refreshes every 4.2 s, until someone drags it or uses the keyboard." },
    ],
    Preview: Previews.PreviewPullToRefresh,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { PullToRefresh } from "@/components/pull-to-refresh";

export default function Page() {
  return (
    <PullToRefresh
      initialBalance={12480.5}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "runaway-button",
    name: "Runaway Button",
    registryCliName: "runaway-button",
    description:
      "A cancel-subscription dialog whose cancel button slips away from the pointer, getting less sure of itself each time, then gives up after a few tries and lets you click it. Keyboard users get a normal button that never moves while focused.",
    categorySlug: "inputs-controls",
    tags: ["button", "playful", "dialog", "cancel", "dark pattern", "easter egg", "pointer", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 157,
    createdAt: "2026-10-20",
    animationKinds: ["magnetic", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "onCancel", type: "() => void", defaultValue: "undefined", description: "Called when the cancel button is finally clicked or activated from the keyboard." },
      { name: "onKeep", type: "() => void", defaultValue: "undefined", description: "Called when \"Keep my plan\" is clicked." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Hops the cancel button around the dialog every 1.1 s, until someone points at it, focuses it or presses a key." },
    ],
    Preview: Previews.PreviewRunawayButton,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { RunawayButton } from "@/components/runaway-button";

export default function Page() {
  return (
    <RunawayButton
      onCancel={() => fetch("/api/subscription", { method: "DELETE" })}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "wake-slider",
    name: "Wake Slider",
    registryCliName: "wake-slider",
    description:
      "A thumbless range made of 56 thin bars. Drag across it and the bars you pass spring up in a wake behind the pointer, taller the faster you move, then ripple back down; the value is wherever the colour ends.",
    categorySlug: "inputs-controls",
    tags: ["slider", "range", "bars", "spring", "ripple", "drag", "volume", "brightness", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: '"Brightness"', description: "Label above the bars; also the slider's accessible name." },
      { name: "defaultValue", type: "number", defaultValue: "40", description: "Starting value, 0 to 100." },
      { name: "accent", type: "string", defaultValue: '"#ff9f0a"', description: "Colour of the bars up to the current value." },
      { name: "onValueChange", type: "(value: number) => void", defaultValue: "undefined", description: "Called with the rounded value whenever it changes." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps back and forth by itself until the user drags or presses a key." },
    ],
    Preview: Previews.PreviewWakeSlider,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { WakeSlider } from "@/components/wake-slider";

export default function Page() {
  const [volume, setVolume] = useState(60);
  return (
    <div className="flex flex-col gap-8">
      <WakeSlider label="Brightness" defaultValue={40} />
      <WakeSlider label="Volume" defaultValue={volume} accent="#0a84ff" onValueChange={setVolume} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "seek-search",
    name: "Seek Search",
    registryCliName: "seek-search",
    description:
      "A round search button that opens into a field as one object: the pill springs wider while the magnifier turns, and a list of local suggestions drops in underneath and filters as you type. Escape, or leaving it empty, folds it back.",
    categorySlug: "inputs-controls",
    tags: ["search", "input", "expand", "suggestions", "autocomplete", "command", "popLayout", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["spring", "layout", "type"],
    dependencies: ["framer-motion"],
    props: [
      { name: "suggestions", type: "string[]", defaultValue: '["Quarterly report", "Design review notes", …]', description: "Local suggestions shown under the field and filtered as you type. Nothing is fetched." },
      { name: "placeholder", type: "string", defaultValue: '"Search files"', description: "Placeholder and accessible name of the field." },
      { name: "maxLength", type: "number", defaultValue: "64", description: "Longest query the field accepts; the query is trimmed before filtering." },
      { name: "onSelect", type: "(suggestion: string) => void", defaultValue: "undefined", description: "Called with a suggestion when it is clicked." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens, types a word, clears and folds back on a loop until the user interacts." },
    ],
    Preview: Previews.PreviewSeekSearch,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { SeekSearch } from "@/components/seek-search";

const DOCS = ["Getting started", "Billing and invoices", "Team permissions", "API keys", "Webhooks"];

export default function Page() {
  const router = useRouter();
  return (
    <SeekSearch
      suggestions={DOCS}
      placeholder="Search docs"
      onSelect={(title) => router.push(\`/docs?q=\${encodeURIComponent(title)}\`)}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "fold-note",
    name: "Fold Note",
    registryCliName: "fold-note",
    description:
      "A printed credit note you fold on its centre crease. Drag the right half over and it turns in 3D, shading as it goes and showing its patterned back; past halfway it snaps shut with a bounce, and a tap opens it again.",
    categorySlug: "cards",
    tags: ["fold", "note", "voucher", "gift card", "3d", "rotateY", "pan", "paper", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 147,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "3d", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Store Credit"', description: "Small caps heading printed top left." },
      { name: "amount", type: "string", defaultValue: '"50"', description: "Denomination printed top right and, smaller, bottom right." },
      { name: "serial", type: "string", defaultValue: '"NOT LEGAL TENDER · SC 000042"', description: "Fine print along the bottom edge." },
      { name: "backLabel", type: "string", defaultValue: '"Thanks"', description: "Word printed on the back of the folding half." },
      { name: "onFoldChange", type: "(folded: boolean) => void", defaultValue: "undefined", description: "Called with true when the note snaps shut and false when it opens." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Folds and unfolds every two seconds until the user grabs or taps it." },
    ],
    Preview: Previews.PreviewFoldNote,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { FoldNote } from "@/components/fold-note";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[15px] text-neutral-500">You earned a reward. Fold it to keep it.</p>
      <FoldNote title="Reward" amount="25" serial="VALID UNTIL 31 DEC · RW 001284" backLabel="Saved" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "assign-picker",
    name: "Assign Picker",
    registryCliName: "assign-picker",
    description:
      "An assignee pill with a multi-select menu. Tick people and each avatar flies from its row into the pill, which grows to hold them and stacks them with a count past three; the label reads one name, two names or a number.",
    categorySlug: "inputs-controls",
    tags: ["assign", "assignee", "avatar", "multi-select", "people", "picker", "layout", "dropdown", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-20",
    animationKinds: ["layout", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "people", type: "AssignPerson[]", defaultValue: "five sample people", description: "People in the menu: { id, name, role, colors: [from, to] }. Avatars are gradient circles with initials." },
      { name: "defaultValue", type: "string[]", defaultValue: "[]", description: "Ids selected on first render." },
      { name: "onChange", type: "(ids: string[]) => void", defaultValue: "undefined", description: "Called with the selected ids, in the order they were picked." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens the menu, ticks four people, closes and clears, on a loop until the user clicks." },
    ],
    Preview: Previews.PreviewAssignPicker,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { AssignPicker, type AssignPerson } from "@/components/assign-picker";

const TEAM: AssignPerson[] = [
  { id: "ln", name: "Lena Novak", role: "Design", colors: ["#ff6fd8", "#ff9f0a"] },
  { id: "ok", name: "Omar Khan", role: "Engineering", colors: ["#5ac8fa", "#5e5ce6"] },
  { id: "sf", name: "Sofia Ferreira", role: "Product", colors: ["#30d158", "#0b8f6a"] },
];

export default function Page() {
  const [ids, setIds] = useState<string[]>(["ok"]);
  return (
    <div className="flex flex-col gap-2">
      <AssignPicker people={TEAM} defaultValue={ids} onChange={setIds} />
      <p className="text-[13px] text-neutral-500">{ids.length} assigned</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "bend-text",
    name: "Bend Text",
    registryCliName: "bend-text",
    description:
      "A line of type running along a string that you can grab and pull, with the words flowing round the bend. Let go and an underdamped spring twangs it back, overshooting a few times before it lies flat.",
    categorySlug: "motion-effects",
    tags: ["text", "textPath", "svg", "string", "pluck", "typography", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", defaultValue: '"PLUCK THE LINE · MAKE IT SING · "', description: "One repeat of the text on the string; it is repeated four times so the line stays full." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the grab point and the focus ring." },
      { name: "hint", type: "string", defaultValue: '"Grab the line, pull, and let go."', description: "Caption under the stage. An empty string hides it." },
      { name: "onPluck", type: "(pull: number) => void", description: "Called on release with how far the string was pulled from rest, in stage units." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plucks the string every 2.6s until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the root element." },
    ],
    Preview: Previews.PreviewBendText,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { BendText } from "@/components/bend-text";

export default function Page() {
  return (
    <BendText
      text="NEW SEASON · NEW SOUNDS · "
      accent="#ff375f"
      hint="Pull the string."
      onPluck={(pull) => {
        if (pull > 80) console.log("big pluck");
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "pressure-text",
    name: "Pressure Text",
    registryCliName: "pressure-text",
    description:
      "A headline that bulges where you hover: letters near the pointer swell taller and heavier on a variable font's weight axis and take the accent colour. Each letter has its own spring, so the swell falls away smoothly on either side.",
    categorySlug: "motion-effects",
    tags: ["text", "typography", "variable font", "font weight", "hover", "headline", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", defaultValue: '"Feel every word"', description: "The headline. Each character gets its own spring." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour the letters take near the pointer." },
      { name: "hint", type: "string", defaultValue: '"Move along the word."', description: "Caption under the headline. An empty string hides it." },
      { name: "spread", type: "number", defaultValue: "0.18", description: "Share of the word's width a letter can be from the pointer and still swell." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sweeps a bulge back and forth along the word until someone hovers it." },
      { name: "className", type: "string", description: "Extra classes for the root element." },
    ],
    Preview: Previews.PreviewPressureText,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { PressureText } from "@/components/pressure-text";

export default function Page() {
  return <PressureText text="Made to be touched" accent="#5e5ce6" spread={0.25} hint="" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "morph-cursor",
    name: "Morph Cursor",
    registryCliName: "morph-cursor",
    description:
      "An iPad-style pointer for a panel: a soft dot that melts into the shape of whatever you can press, sits behind it as a highlight while the element leans toward you, and turns into a caret over text. The system cursor is hidden only inside the panel.",
    categorySlug: "motion-effects",
    tags: ["cursor", "pointer", "ipad", "hover", "highlight", "magnetic", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "magnetic", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "icons", type: "MorphCursorIcon[]", defaultValue: "DEFAULT_MORPH_ICONS", description: "Icon buttons in the top row, each { id, label, path } with a 24×24 path." },
      { name: "buttonLabel", type: "string", defaultValue: '"Start a project"', description: "Label of the pill button." },
      { name: "inputLabel", type: "string", defaultValue: '"Project name"', description: "Accessible name of the text field." },
      { name: "defaultInputValue", type: "string", defaultValue: '"Spring launch, website and email"', description: "Starting text in the field." },
      { name: "cards", type: "MorphCursorCard[]", defaultValue: "DEFAULT_MORPH_CARDS", description: "Tiles under the field, each { id, label, gradient }." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of the caret over the field and of the focus rings." },
      { name: "onAction", type: "(id: string) => void", description: "Called with an icon id, \"button\" for the pill, or a card id when one is pressed." },
      { name: "hint", type: "string", defaultValue: '"Move the pointer around."', description: "Caption at the bottom of the panel. An empty string hides it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Tours the pointer over every target until someone moves over the panel." },
      { name: "className", type: "string", description: "Extra classes for the panel." },
    ],
    Preview: Previews.PreviewMorphCursor,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MorphCursor } from "@/components/morph-cursor";

export default function Page() {
  return (
    <MorphCursor
      buttonLabel="New board"
      inputLabel="Board name"
      defaultInputValue="Q4 roadmap"
      cards={[
        { id: "notes", label: "Notes", gradient: "linear-gradient(135deg,#ffd60a,#ff9f0a)" },
        { id: "tasks", label: "Tasks", gradient: "linear-gradient(135deg,#30d158,#0a7d3b)" },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ink-theme-switch",
    name: "Ink Theme Switch",
    registryCliName: "ink-theme-switch",
    description:
      "A dark-mode toggle where the dark version of a settings panel pours out of the switch as a growing ink circle and drains back in when you switch off. The sun pulls in its rays and turns into a crescent moon, and only the component's own panel is themed.",
    categorySlug: "inputs-controls",
    tags: ["theme toggle", "dark mode", "switch", "clip-path", "settings", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "defaultDark", type: "boolean", defaultValue: "false", description: "Start with the panel dark. Only the component's own panel is themed; the page theme is never touched." },
      { name: "onChange", type: "(dark: boolean) => void", description: "Called with the new value when the user flips the switch." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Flips between light and dark every 2.2s until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the panel." },
    ],
    Preview: Previews.PreviewInkThemeSwitch,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { InkThemeSwitch } from "@/components/ink-theme-switch";

export default function Page() {
  const [dark, setDark] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <InkThemeSwitch defaultDark={dark} onChange={setDark} />
      <p className="text-sm text-neutral-500">Preview is {dark ? "dark" : "light"}</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "liquid-gauge",
    name: "Liquid Gauge",
    registryCliName: "liquid-gauge",
    description:
      "A storage meter drawn as liquid in a glass orb, with two rolling wave layers, rising bubbles and a surface that leans toward the pointer. The percentage is drawn twice so the part under the liquid turns white, and changing the level sloshes it.",
    categorySlug: "dashboards",
    tags: ["gauge", "storage", "meter", "progress", "liquid", "wave", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "total", type: "number", defaultValue: "200", description: "Capacity of the store, in units." },
      { name: "defaultUsed", type: "number", defaultValue: "136", description: "Amount used on first render, clamped to 0..total." },
      { name: "accent", type: "string", defaultValue: '"#0a84ff"', description: "Liquid colour while usage is below warnAt." },
      { name: "warnAt", type: "number", defaultValue: "85", description: "Percentage at which the liquid turns orange and the caption warns." },
      { name: "unit", type: "string", defaultValue: '"GB"', description: "Unit shown in the caption." },
      { name: "onChange", type: "(used: number) => void", description: "Called with the new amount after Clean up (-40) or Add files (+30)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sloshes through a few fill levels until someone presses a button." },
    ],
    Preview: Previews.PreviewLiquidGauge,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { LiquidGauge } from "@/components/liquid-gauge";

export default function Page() {
  return (
    <LiquidGauge
      total={512}
      defaultUsed={301}
      accent="#30d158"
      warnAt={90}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "thermo-dial",
    name: "Thermo Dial",
    registryCliName: "thermo-dial",
    description:
      "A thermostat ring you drag round or step with the arrow keys. Ticks light up to the set point, the glow shifts from cool blue to warm orange, the number rolls and the label says whether it is heating or cooling toward the room temperature.",
    categorySlug: "inputs-controls",
    tags: ["thermostat", "dial", "knob", "slider", "temperature", "smart home", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "room", type: "number", defaultValue: "19.5", description: "Current room temperature; marks a tick and decides Heating, Cooling or Holding." },
      { name: "defaultValue", type: "number", defaultValue: "21", description: "Target temperature the dial starts at." },
      { name: "min", type: "number", defaultValue: "10", description: "Lowest settable temperature (start of the arc)." },
      { name: "max", type: "number", defaultValue: "30", description: "Highest settable temperature (end of the arc)." },
      { name: "step", type: "number", defaultValue: "0.5", description: "Increment for dragging and the arrow keys." },
      { name: "onChange", type: "(value: number) => void", description: "Called with the new target when the user drags or uses the keyboard." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Turns the dial to a few set points until someone touches it." },
    ],
    Preview: Previews.PreviewThermoDial,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ThermoDial } from "@/components/thermo-dial";

export default function Page() {
  return (
    <ThermoDial
      room={68}
      defaultValue={70}
      min={50}
      max={86}
      step={1}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "pull-cord",
    name: "Pull Cord",
    registryCliName: "pull-cord",
    description:
      "A light switch on a cord: a small verlet rope you grab by its bead, pull past its slack and let go to toggle the light. The panel lights up or goes dark and the cord swings and settles; Enter or Space tugs it from the keyboard.",
    categorySlug: "inputs-controls",
    tags: ["switch", "toggle", "light", "rope", "physics", "verlet", "dark mode", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "defaultOn", type: "boolean", defaultValue: "false", description: "Whether the light starts on." },
      { name: "onChange", type: "(on: boolean) => void", description: "Called with the new state when the user pulls the cord or presses Enter/Space on it." },
      { name: "onText", type: "string", defaultValue: '"Lights on."', description: "Headline while the light is on." },
      { name: "offText", type: "string", defaultValue: '"Lights off."', description: "Headline while the light is off." },
      { name: "hint", type: "string", defaultValue: '"Pull the cord."', description: "Small line under the headline." },
      { name: "className", type: "string", description: "Extra classes for the 320px-wide outer wrapper." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Tugs the cord every 2.6s until someone grabs it." },
    ],
    Preview: Previews.PreviewPullCord,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { PullCord } from "@/components/pull-cord";

export default function Page() {
  const [focus, setFocus] = useState(false);
  return (
    <PullCord
      defaultOn={focus}
      onText="Focus mode on."
      offText="Focus mode off."
      hint="Pull to toggle notifications."
      onChange={setFocus}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "scratch-reveal",
    name: "Scratch Reveal",
    registryCliName: "scratch-reveal",
    description:
      "A reward scratch card: rub the silver foil and it wears through where you scratch, shedding dust that falls out of the card. Once enough is gone the rest lifts away with a burst of confetti and the code can be copied to the clipboard.",
    categorySlug: "cards",
    tags: ["scratch card", "reward", "coupon", "promo code", "canvas", "reveal", "copy", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "code", type: "string", defaultValue: '"MOTION20"', description: "The code under the foil; the Copy button writes it to the clipboard." },
      { name: "headline", type: "string", defaultValue: '"20% off Pro"', description: "Prize line above the code." },
      { name: "eyebrow", type: "string", defaultValue: '"You won"', description: "Small uppercase line above the headline." },
      { name: "accent", type: "string", defaultValue: '"#bf5af2"', description: "Colour of the eyebrow." },
      { name: "threshold", type: "number", defaultValue: "0.55", description: "Share of the foil (0 to 1) that must be scratched before the rest lifts away." },
      { name: "onReveal", type: "() => void", description: "Called each time the foil comes off." },
      { name: "onCopy", type: "(code: string) => void", description: "Called with the code after it has been copied." },
      { name: "className", type: "string", description: "Extra classes for the outer wrapper." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Scratches the card, reveals it and starts over until someone touches it." },
    ],
    Preview: Previews.PreviewScratchReveal,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ScratchReveal } from "@/components/scratch-reveal";

export default function Page() {
  return (
    <ScratchReveal
      eyebrow="Welcome gift"
      headline="Free month"
      code="HELLO-30"
      accent="#ff375f"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "polaroid-develop",
    name: "Polaroid Develop",
    registryCliName: "polaroid-develop",
    description:
      "An instant photo you develop by dragging and shaking it: the faster it moves, the quicker the grey haze clears and the colour comes through. It swings with the drag velocity, develops slowly on its own, and writes a handwritten caption once it is done.",
    categorySlug: "cards",
    tags: ["polaroid", "photo", "instant camera", "drag", "velocity", "shake", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "src", type: "string", description: "Photo to develop. Without it the drawn scenes are shown." },
      { name: "alt", type: "string", defaultValue: '""', description: "Alt text for src." },
      { name: "caption", type: "string", description: "Handwritten caption for src once developed. Drawn scenes carry their own." },
      { name: "scenes", type: "PolaroidScene[]", defaultValue: "DEFAULT_POLAROID_SCENES", description: "Drawn scenes cycled by New photo, each { sky, sea, sun, land, caption }." },
      { name: "onDeveloped", type: "(caption: string) => void", description: "Called when the photo finishes developing, with its caption (or alt)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Shakes the photo by itself and swaps to a new one until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewPolaroidDevelop,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { PolaroidDevelop } from "@/components/polaroid-develop";

export default function Page() {
  return (
    <PolaroidDevelop
      src="/images/porto.jpg"
      alt="Rooftops in Porto"
      caption="Porto, last light"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "wallet-stack",
    name: "Wallet Stack",
    registryCliName: "wallet-stack",
    description:
      "Payment cards tucked into a leather wallet, each peeking out a little higher than the one in front. Picking a card slides it out while the others sink, then turns it over in 3D to show the back; picking it again puts it away.",
    categorySlug: "cards",
    tags: ["wallet", "credit card", "payment", "card stack", "flip", "3d", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "spring", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "cards", type: "WalletCard[]", defaultValue: "DEFAULT_WALLET_CARDS", description: "Cards from back to front, each { id, name, last, bg, ink, brand, expires? }. Four fit best." },
      { name: "label", type: "string", defaultValue: '"Wallet"', description: "Word stamped on the wallet; also the group's accessible name." },
      { name: "hint", type: "string", defaultValue: '"Pick a card."', description: "Hint under the wallet. An empty string hides it." },
      { name: "onSelect", type: "(id: string | null) => void", description: "Called with the card id when one slides out, and null when it is put back." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Takes each card out, flips it and puts it back in turn until someone touches it." },
      { name: "className", type: "string", description: "Extra classes for the root." },
    ],
    Preview: Previews.PreviewWalletStack,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { WalletStack } from "@/components/wallet-stack";

const cards = [
  { id: "main", name: "Main", last: "5521", bg: "linear-gradient(135deg,#2c2c2e,#0b0b0c)", ink: "#f5f5f7", brand: "Acme Bank" },
  { id: "trip", name: "Travel", last: "0937", bg: "linear-gradient(135deg,#5ac8fa,#0a4fd6)", ink: "#ffffff", brand: "Wayfare", expires: "11/29" },
  { id: "team", name: "Team", last: "7340", bg: "linear-gradient(135deg,#ffb38a,#ff375f)", ink: "#ffffff", brand: "Acme Bank" },
];

export default function Page() {
  return <WalletStack cards={cards} label="Cards" />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "traffic-bars",
    name: "Traffic Bars",
    registryCliName: "traffic-bars",
    description:
      "A stacked bar chart of daily visits by source: the column under your pointer is ringed, the others dim and a tooltip glides beside it with the breakdown. Switch Day to Week and every day's slices fly over and pile into their week.",
    categorySlug: "dashboards",
    tags: ["chart", "bar chart", "stacked bars", "analytics", "traffic", "tooltip", "data visualization", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "theme", type: '"auto" | "light" | "dark"', defaultValue: '"auto"', description: "\"auto\" follows the page's .dark class; \"light\" or \"dark\" pins the card's palette." },
      { name: "colors", type: "string[]", defaultValue: '["#0071e3", "#64d2ff", "#bf5af2"]', description: "Fill for the Direct, Search and Referral slices, bottom to top." },
      { name: "radius", type: "number", defaultValue: "2", description: "Corner radius of each slice, in SVG units." },
      { name: "stagger", type: "number", defaultValue: "12", description: "Delay between neighbouring days when the slices regroup, in ms." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Scrubs along the columns and flips Day/Week until someone interacts." },
    ],
    Preview: Previews.PreviewTrafficBars,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TrafficBars } from "@/components/traffic-bars";

export default function Page() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <TrafficBars />
      <TrafficBars colors={["#ff9f0a", "#ffd60a", "#ff375f"]} radius={3} stagger={18} />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "stock-line",
    name: "Stock Line",
    registryCliName: "stock-line",
    description:
      "A trading-app price chart: scrub along it and a dot rides the line while the price rolls digit by digit and the change turns green or red. Switching range morphs the line into its new shape, and on 1D the last price keeps ticking live.",
    categorySlug: "dashboards",
    tags: ["chart", "line chart", "stock", "price", "finance", "trading", "rolling digits", "data visualization", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "theme", type: '"auto" | "light" | "dark"', defaultValue: '"auto"', description: "\"auto\" follows the page's .dark class; \"light\" or \"dark\" pins the card's palette." },
      { name: "symbol", type: "string", defaultValue: '"NXUS"', description: "Ticker shown in the corner and read out in the chart's label." },
      { name: "smooth", type: "boolean", defaultValue: "true", description: "Draw the line as smooth curves instead of straight segments." },
      { name: "fill", type: "boolean", defaultValue: "true", description: "Fade a gradient area under the line." },
      { name: "up", type: "string", defaultValue: '"#30d158"', description: "Line and change colour while the price is at or above the range's open." },
      { name: "down", type: "string", defaultValue: '"#ff453a"', description: "Line and change colour while the price is below the range's open." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles through the ranges and sweeps the dot along each one until someone interacts." },
    ],
    Preview: Previews.PreviewStockLine,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { StockLine } from "@/components/stock-line";

export default function Page() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <StockLine symbol="NXUS" />
      <StockLine symbol="ACME" smooth={false} up="#0a84ff" down="#ff9f0a" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "pulse-monitor",
    name: "Pulse Monitor",
    registryCliName: "pulse-monitor",
    description:
      "A heart-rate card with a bedside-monitor ECG trace that sweeps and erases as it goes, a heart that beats on every spike and 24 hourly range bars you can scrub. Start a workout and the rate climbs, the beats close up and the colour warms.",
    categorySlug: "dashboards",
    tags: ["heart rate", "ecg", "health", "fitness", "canvas", "range bars", "chart", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 151,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "press", "spring", "drag"],
    dependencies: ["framer-motion"],
    props: [
      { name: "bpm", type: "number", defaultValue: "68", description: "Resting heart rate. Also seeds the day's hourly ranges; a workout climbs to max(bpm + 50, 120)." },
      { name: "color", type: "string", defaultValue: '"#ff375f"', description: "Colour of the trace, heart and range bars at rest." },
      { name: "workoutColor", type: "string", defaultValue: '"#ff9f0a"', description: "Colour everything warms to, and the button fills with, during a workout." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Toggles a workout every ~10s and sweeps the hour readout along the bars until someone interacts." },
    ],
    Preview: Previews.PreviewPulseMonitor,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { PulseMonitor } from "@/components/pulse-monitor";

export default function Page() {
  return (
    <section className="grid gap-6 sm:grid-cols-2">
      <PulseMonitor bpm={62} />
      <PulseMonitor bpm={74} color="#bf5af2" workoutColor="#30d158" />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "spend-donut",
    name: "Spend Donut",
    registryCliName: "spend-donut",
    description:
      "A monthly budget donut: the slice you point at slides out of the ring and thickens while the centre rolls to its amount. Switch month and every slice re-measures itself in one continuous spring sweep.",
    categorySlug: "dashboards",
    tags: ["donut chart", "pie chart", "budget", "spending", "finance", "chart", "legend", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-20",
    animationKinds: ["hover", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "thickness", type: "number", defaultValue: "18", description: "Ring thickness in px (220px viewBox). The pointed-at slice grows by 6." },
      { name: "gap", type: "number", defaultValue: "4", description: "Clear space between slices in px; the round caps are accounted for." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Points at each category in turn and changes month every ~8s until someone interacts." },
    ],
    Preview: Previews.PreviewSpendDonut,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SpendDonut } from "@/components/spend-donut";

export default function Page() {
  return (
    <aside className="flex justify-center p-6">
      <SpendDonut thickness={22} gap={6} />
    </aside>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tag-pit",
    name: "Tag Pit",
    registryCliName: "tag-pit",
    description:
      "An interests picker where every tag is a physical pill dropped into a tray. Grab and throw the pills, shake the tray, and tap one to pick it so it hops up and lights; Continue unlocks once enough are picked.",
    categorySlug: "inputs-controls",
    tags: ["tags", "interests", "picker", "onboarding", "chips", "physics", "throw", "matter-js", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 154,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "press", "spring", "layout"],
    dependencies: ["framer-motion", "matter-js"],
    props: [
      { name: "tags", type: "string[]", defaultValue: '["Design", "Motion", "Typography", "3D", "Photography", "AI", "Music", "Startups", "Travel", "Coffee", "Gaming", "Writing", "Code", "Film", "Architecture", "Fitness"]', description: "The interests to pick from. Each one becomes a physical pill sized to its label." },
      { name: "min", type: "number", defaultValue: "3", description: "How many picks unlock the Continue button." },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: "Colour of picked pills, the picked chips and the Continue button (6-digit hex)." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Picks a few tags and shakes the tray by itself until someone touches it." },
    ],
    Preview: Previews.PreviewTagPit,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TagPit } from "@/components/tag-pit";

const INTERESTS = ["Design", "Motion", "AI", "Music", "Travel", "Coffee", "Code", "Film", "Fitness", "Writing"];

export default function Page() {
  return (
    <div className="flex min-h-[520px] items-center justify-center">
      <TagPit tags={INTERESTS} min={3} accent="#0071e3" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "usage-stack",
    name: "Usage Stack",
    registryCliName: "usage-stack",
    description:
      "Usage-based pricing you can see: every 10,000 requests is a block that drops into a bin, coloured by the tier it falls in. Slide the volume up and blocks rain in, slide it down and the newest pop, while the monthly price rolls with it and the blocks can be grabbed and thrown.",
    categorySlug: "pricing-sections",
    tags: ["pricing", "usage based", "metered billing", "slider", "tiers", "calculator", "matter-js", "physics", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "spring", "press"],
    dependencies: ["framer-motion", "matter-js"],
    props: [
      { name: "defaultValue", type: "number", defaultValue: "120000", description: "Requests per month to start from, rounded to the nearest 10,000 (0 to 600,000)." },
      { name: "onChange", type: "(requests: number, price: number) => void", description: "Called whenever the volume changes, with the request count and the monthly price in dollars." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Steps the volume through a few sample values every 2.6s until someone touches the slider or the bin. Off when reduced motion is preferred." },
    ],
    Preview: Previews.PreviewUsageStack,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { UsageStack } from "@/components/usage-stack";

export default function Page() {
  return (
    <section className="flex flex-col items-center gap-6 py-16">
      <h2 className="text-3xl font-semibold tracking-tight">Pay for what you use</h2>
      <UsageStack
        defaultValue={200_000}
      />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "marble-progress",
    name: "Marble Progress",
    registryCliName: "marble-progress",
    description:
      "An onboarding checklist that keeps score with marbles: tick a step and a marble of its colour rolls down three ramps into a jar, untick it and that marble pops. When every step is done the jar glows.",
    categorySlug: "cards",
    tags: ["onboarding", "checklist", "progress", "marbles", "jar", "physics", "canvas", "matter-js", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-20",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion", "matter-js"],
    props: [
      { name: "steps", type: "MarbleStep[]", defaultValue: "5 setup steps", description: "Each step has a label (unique) and a color (6-digit hex) used for its checkbox and marble." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Ticks the steps one by one, then clears them, until someone clicks a step. Off under reduced motion." },
    ],
    Preview: Previews.PreviewMarbleProgress,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MarbleProgress } from "@/components/marble-progress";

const STEPS = [
  { label: "Add a payment method", color: "#0071e3" },
  { label: "Import your contacts", color: "#30d158" },
  { label: "Send your first invoice", color: "#ff9f0a" },
];

export default function Page() {
  return <MarbleProgress steps={STEPS} />;
}`,
    tailwindSource: tw,
  },
  {
    slug: "cloth-banner",
    name: "Cloth Banner",
    registryCliName: "cloth-banner",
    description:
      "An announcement printed on cloth and pinned to a rail by five pins. It sways in the breeze and drapes under your hand; yank it down hard and the pins pop one by one until it drops away, or press Dismiss to let it fall.",
    categorySlug: "cta-sections",
    tags: ["announcement", "banner", "dismissible", "cloth", "verlet", "canvas", "launch", "physics", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 153,
    createdAt: "2026-10-20",
    animationKinds: ["drag", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "title", type: "string", defaultValue: '"Launch Week"', description: "Big line printed on the cloth." },
      { name: "subtitle", type: "string", defaultValue: '"Oct 27–31 · five drops, one a day"', description: "Smaller line printed under the title." },
      { name: "from", type: "string", defaultValue: '"#0071e3"', description: "Gradient start colour of the cloth (top left)." },
      { name: "to", type: "string", defaultValue: '"#5e5ce6"', description: "Gradient end colour of the cloth (bottom right)." },
      { name: "onDismiss", type: "() => void", description: "Called once the banner has dropped away, whether it was yanked down or dismissed with the button." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sends a gust of wind every 2.2s until someone grabs the cloth or presses a button. Off when reduced motion is preferred." },
    ],
    Preview: Previews.PreviewClothBanner,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { ClothBanner } from "@/components/cloth-banner";

export default function Page() {
  return (
    <div className="flex justify-center py-10">
      <ClothBanner
        title="Launch Week"
        subtitle="Oct 27–31 · five drops, one a day"
        onDismiss={() => localStorage.setItem("launch-week-dismissed", "1")}
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "vinyl-player",
    name: "Vinyl Player",
    registryCliName: "vinyl-player",
    description:
      "A music player you play like a turntable: press play and the tonearm swings on while the platter spins up, grab the record to scrub exactly as far as you turn it, or fling it to coast. Skipping slides a new record onto the platter.",
    categorySlug: "cards",
    tags: ["music player", "vinyl", "turntable", "record", "scrub", "audio ui", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 155,
    createdAt: "2026-10-22",
    animationKinds: ["drag", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "tracks", type: "VinylTrack[]", description: "Records on the shelf. Each has title, artist, length (seconds) and label, two CSS colours for the centre label. Defaults to three sample tracks." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Starts the record, scratches now and then and changes records until someone touches the player." },
    ],
    Preview: Previews.PreviewVinylPlayer,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { VinylPlayer } from "@/components/vinyl-player";

export default function Page() {
  return (
    <VinylPlayer
      tracks={[
        { title: "Slow Hours", artist: "Mira Lune", length: 214, label: ["#ff9f0a", "#ff375f"] },
        { title: "Paper Boats", artist: "The Quiet Fleet", length: 187, label: ["#64d2ff", "#0071e3"] },
      ]}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ferrofluid-record",
    name: "Ferrofluid Record",
    registryCliName: "ferrofluid-record",
    description:
      "A record button drawn as a drop of ferrofluid on a canvas. It grows spikes towards your cursor like a magnet, bristles in time with a simulated voice while recording, and melts back to a smooth bead when you stop.",
    categorySlug: "inputs-controls",
    tags: ["record button", "ferrofluid", "canvas", "voice note", "magnet", "audio ui", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-22",
    animationKinds: ["hover", "press", "magnetic", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Moves a pretend magnet around the drop and records a few short notes until someone touches it. Skipped when the user prefers reduced motion." },
    ],
    Preview: Previews.PreviewFerrofluidRecord,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { FerrofluidRecord } from "@/components/ferrofluid-record";

export default function Page() {
  return (
    <div className="flex justify-center py-10">
      <FerrofluidRecord />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "sand-timer",
    name: "Sand Timer",
    registryCliName: "sand-timer",
    description:
      "A session timer drawn as a real hourglass: every grain is simulated on a canvas, piling, sliding and funneling through the neck at exactly the rate the time runs out. Pressing the button turns the glass over.",
    categorySlug: "loaders",
    tags: ["hourglass", "timer", "countdown", "sand", "canvas", "simulation", "session", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 147,
    createdAt: "2026-10-22",
    animationKinds: ["spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "seconds", type: "number", defaultValue: "30", description: "How long a full glass takes to run out, in seconds. The readout counts down from the same value." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Turns the glass over by itself when the top is nearly empty, until someone presses the button." },
    ],
    Preview: Previews.PreviewSandTimer,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SandTimer } from "@/components/sand-timer";

export default function Page() {
  return (
    <div className="grid place-items-center py-16">
      <SandTimer seconds={120} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "zipper-reveal",
    name: "Zipper Reveal",
    registryCliName: "zipper-reveal",
    description:
      "A fabric pouch you unzip to reveal an invite code. The teeth part into a V above the slider, the fabric pulls back with a shadow beneath it, and the pull tab swings as you drag.",
    categorySlug: "cards",
    tags: ["zipper", "reveal", "invite", "drag", "svg", "pouch", "unlock", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 149,
    createdAt: "2026-10-22",
    animationKinds: ["drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "code", type: "string", defaultValue: '"NXS-8F2Q-PRO"', description: "Invite code shown inside the pouch and copied by the button." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Zips itself open and shut until someone grabs the pull." },
    ],
    Preview: Previews.PreviewZipperReveal,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ZipperReveal } from "@/components/zipper-reveal";

export default function Page() {
  return (
    <div className="grid place-items-center py-12">
      <ZipperReveal code="LAUNCH-7K4M" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "slingshot-send",
    name: "Slingshot Send",
    registryCliName: "slingshot-send",
    description:
      "A chat composer whose send button is a slingshot: pull the stone back to stretch the bands and let go, and your message flies along an arc and lands in the thread with a squash. Enter in the field, or Enter or Space on the focused stone, still sends it.",
    categorySlug: "inputs-controls",
    tags: ["send button", "chat", "composer", "slingshot", "drag", "messaging", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-22",
    animationKinds: ["drag", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "name", type: "string", defaultValue: '"Maya"', description: "Name in the thread header; its first letter is the avatar." },
      { name: "onSend", type: "(text: string) => void", description: "Called with the trimmed text when a message is fired. Nothing is ever sent over the network by the component." },
      { name: "autoReply", type: "boolean", defaultValue: "true", description: "Adds a canned reply from the other person about a second after each message lands." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types, pulls back and fires messages by itself until someone touches the component." },
    ],
    Preview: Previews.PreviewSlingshotSend,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { SlingshotSend } from "@/components/slingshot-send";

export default function Page() {
  return (
    <SlingshotSend
      name="Maya"
      onSend={(text) => {
        // hand the message to your own API, store or socket here
        console.log("fired:", text);
      }}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "domino-select",
    name: "Domino Select",
    registryCliName: "domino-select",
    description:
      "A mail list with a select-all box that topples the rows like dominoes: each row tips onto the next in a chain, then springs back up ticked. Unticking runs the chain from the bottom, and single rows toggle with a small nod.",
    categorySlug: "inputs-controls",
    tags: ["select all", "checkbox", "list", "email", "dominoes", "3d", "bulk actions", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-22",
    animationKinds: ["3d", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "messages", type: "DominoMessage[]", description: "Rows to list; each has from, subject, time and color (avatar colour). Defaults to seven sample emails. Changing the row count resets the selection." },
      { name: "onSelectionChange", type: "(selected: number[]) => void", description: "Called with the indexes of the ticked rows whenever the selection changes; during a chain it fires once per row." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Ticks and unticks the master box by itself until someone interacts." },
    ],
    Preview: Previews.PreviewDominoSelect,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { useState } from "react";
import { DominoSelect } from "@/components/domino-select";

export default function Page() {
  const [selected, setSelected] = useState<number[]>([]);

  return (
    <div className="grid gap-3">
      <DominoSelect onSelectionChange={setSelected} />
      <p className="text-sm text-neutral-500">{selected.length} rows ticked</p>
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "lenticular-pass",
    name: "Lenticular Pass",
    registryCliName: "lenticular-pass",
    description:
      "An event pass printed lenticular. Tilt it with the pointer, or drag it on a touch screen, and the day pass turns into the night pass strip by strip while light runs along the ridges.",
    categorySlug: "cards",
    tags: ["lenticular", "ticket", "event pass", "tilt", "3d", "hover", "holographic", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 148,
    createdAt: "2026-10-22",
    animationKinds: ["hover", "3d", "spring", "drag"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Rocks the card back and forth by itself until someone touches it. Skipped when the visitor prefers reduced motion." },
    ],
    Preview: Previews.PreviewLenticularPass,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { LenticularPass } from "@/components/lenticular-pass";

export default function Page() {
  return (
    <div className="flex justify-center py-12">
      <LenticularPass />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "origami-pricing",
    name: "Origami Pricing",
    registryCliName: "origami-pricing",
    description:
      "A pricing card folded like a paper map. Tap it and it opens in two folds: the features panel swings out, then the quote and call-to-action drop down, with creases darkening mid-turn.",
    categorySlug: "pricing-sections",
    tags: ["pricing", "origami", "fold", "paper", "3d", "card", "plan", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 144,
    createdAt: "2026-10-22",
    animationKinds: ["3d", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "planName", type: "string", defaultValue: '"Nexus Pro"', description: "Plan name on the cover; its first letter becomes the logo tile." },
      { name: "price", type: "string", defaultValue: '"$9"', description: "Price on the cover, including the currency symbol." },
      { name: "period", type: "string", defaultValue: '"/mo"', description: "Small unit after the price." },
      { name: "features", type: "string[]", defaultValue: '["All components", "All templates", "Source + Figma", "Requests first"]', description: "Lines in the features panel." },
      { name: "quote", type: "string", defaultValue: '"Paid for itself in the first week."', description: "Customer quote on the lower-left panel." },
      { name: "author", type: "string", defaultValue: '"Maya, Loop"', description: "Who said it." },
      { name: "ctaLabel", type: "string", defaultValue: '"Start free trial"', description: "Label of the button on the last panel." },
      { name: "note", type: "string", defaultValue: '"14 days · cancel anytime"', description: "Small line under the button." },
      { name: "onCtaClick", type: "() => void", description: "Called when the button is pressed. The card never navigates or takes payment on its own." },
      { name: "caption", type: "string", defaultValue: '"Two folds: out, then down."', description: "Line under the card; pass an empty string to hide it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Folds and unfolds by itself until someone taps the card. Skipped when the visitor prefers reduced motion." },
    ],
    Preview: Previews.PreviewOrigamiPricing,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { OrigamiPricing } from "@/components/origami-pricing";

export default function Page() {
  return (
    <div className="flex justify-center py-12">
      <OrigamiPricing
        planName="Studio"
        price="$19"
        features={["Unlimited projects", "Custom domains", "Team seats", "Priority support"]}
        ctaLabel="Start free trial"
      />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "empty-projects",
    name: "Empty Projects",
    registryCliName: "empty-projects",
    description:
      "An empty projects screen with three starter templates in a loose stack that fans out when you point at it. Picking a template flies that exact card into the grid as your first project.",
    categorySlug: "cards",
    tags: ["empty state", "projects", "templates", "onboarding", "shared layout", "fan", "dashboard", "cards", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-22",
    animationKinds: ["hover", "layout", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "templates", type: "EmptyProjectsTemplate[]", defaultValue: "EMPTY_PROJECTS_TEMPLATES", description: "The starter templates in the stack, each { id, name, tint: [background, accent] }. The ids landing, dashboard and docs draw their own little page; three works best." },
      { name: "title", type: "string", defaultValue: '"Projects"', description: "Heading above the grid." },
      { name: "emptyTitle", type: "string", defaultValue: '"No projects yet"', description: "Headline of the empty state." },
      { name: "emptyDescription", type: "string", defaultValue: '"Pick a starting point. You can change everything later."', description: "Line under the headline." },
      { name: "onCreate", type: "(template: EmptyProjectsTemplate) => void", defaultValue: "undefined", description: "Called when a template, or the blank project, is picked. The autoplay demo never calls it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Fans the stack, picks a template and starts over on a loop until someone touches it. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", defaultValue: '""', description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewEmptyProjects,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { EmptyProjects } from "@/components/empty-projects";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-[560px] flex-col gap-6 px-4 py-16">
      <EmptyProjects
        title="Workspaces"
        emptyTitle="No workspaces yet"
        autoplay
      />
    </main>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "no-results",
    name: "No Results",
    registryCliName: "no-results",
    description:
      "A no-results state that says why nothing matched and fixes it in one tap. The missing letter slides into the search box, the filter chips peel away one by one and the matching rows drop back in.",
    categorySlug: "cards",
    tags: ["empty state", "search", "no results", "filters", "typo", "keyed letters", "layout", "list", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 155,
    createdAt: "2026-10-22",
    animationKinds: ["layout", "type", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "rows", type: "NoResultsRow[]", defaultValue: "NO_RESULTS_ROWS", description: "The rows the list shows once nothing hides them, each { id, who, amount, status, age }. Defaults to four demo invoices." },
      { name: "filters", type: "NoResultsFilter[]", defaultValue: "NO_RESULTS_FILTERS", description: "The filter chips applied at the start, each { label, test(row) }. A row stays only if every filter keeps it." },
      { name: "query", type: "string", defaultValue: '"invoce march"', description: "The text in the search box at the start." },
      { name: "typo", type: "{ wrong: string[]; right: string }", defaultValue: "NO_RESULTS_TYPO", description: "The misspellings the empty state looks for and the word the fix button puts in their place." },
      { name: "noun", type: "string", defaultValue: '"invoices"', description: "What the rows are called, used in the headline and the input label." },
      { name: "maxRows", type: "number", defaultValue: "6", description: "Most rows the list shows once nothing is hiding them." },
      { name: "onFixTypo", type: "(query: string) => void", defaultValue: "undefined", description: "Called with the corrected query when the fix button is pressed. The autoplay demo never calls it." },
      { name: "onClearFilters", type: "() => void", defaultValue: "undefined", description: "Called when Clear filters is pressed. The autoplay demo never calls it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Fixes the typo, clears the filters and starts over on a loop until someone touches it. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", defaultValue: '""', description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewNoResults,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { NoResults } from "@/components/no-results";

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-[560px] px-4 py-16">
      <NoResults
        noun="invoices"
        query="invoce march"
        autoplay
      />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "empty-chart",
    name: "Empty Chart",
    registryCliName: "empty-chart",
    description:
      "A chart with no data yet, drawn as a dashed placeholder line that breathes on the grid. Connect a source and the same line bends into the real numbers while the area fills in and the total counts up.",
    categorySlug: "dashboards",
    tags: ["empty state", "chart", "line chart", "path morph", "connect", "integration", "dashboard", "analytics", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 160,
    createdAt: "2026-10-22",
    animationKinds: ["hover", "spring", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "data", type: "number[]", defaultValue: "EMPTY_CHART_DATA", description: "One value per point, oldest first, at least two. The total counts these up. Defaults to twelve months of revenue in thousands." },
      { name: "labels", type: "string[]", defaultValue: "EMPTY_CHART_MONTHS", description: "A label per point, used for the axis (every second one) and the hover readout." },
      { name: "sources", type: "string[]", defaultValue: '["Payments", "Spreadsheet", "Database"]', description: "The sources offered while the chart is empty." },
      { name: "title", type: "string", defaultValue: '"Revenue, last 12 months"', description: "Caption above the total." },
      { name: "prefix", type: "string", defaultValue: '"$"', description: "Put before the total and the hover values." },
      { name: "suffix", type: "string", defaultValue: '"k"', description: "Put after the total and the hover values." },
      { name: "onConnect", type: "(source: string) => void", defaultValue: "undefined", description: "Called with the source name when one is connected. The autoplay demo never calls it." },
      { name: "onDisconnect", type: "() => void", defaultValue: "undefined", description: "Called when Disconnect is pressed." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Connects a source, reads a month and disconnects on a loop until someone touches it. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", defaultValue: '""', description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewEmptyChart,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { EmptyChart } from "@/components/empty-chart";

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-[560px] px-4 py-16">
      <EmptyChart
        title="Revenue, last 12 months"
        sources={["Payments", "Spreadsheet"]}
        autoplay
      />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "empty-team",
    name: "Empty Team",
    registryCliName: "empty-team",
    description:
      "An empty team page with dotted seats beside yours and an invite field below. Type an email or tap a suggested teammate and the avatar lifts out of the field and lands in the next free seat, marked pending.",
    categorySlug: "cards",
    tags: ["empty state", "team", "invite", "avatars", "seats", "onboarding", "measured flight", "form", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-22",
    animationKinds: ["spring", "layout", "type"],
    dependencies: ["framer-motion"],
    props: [
      { name: "seats", type: "number", defaultValue: "6", description: "Total seats, including yours." },
      { name: "suggestions", type: "string[]", defaultValue: "3 people on domain", description: "Teammates offered as one-tap chips under the field. Defaults to three people on domain." },
      { name: "domain", type: "string", defaultValue: '"orbitly.com"', description: "The domain shown in the From line above the chips, also used for the default suggestions." },
      { name: "placeholder", type: "string", defaultValue: '"name@company.com"', description: "Placeholder of the email field." },
      { name: "onAdd", type: "(email: string) => void", defaultValue: "undefined", description: "Called with the email when an avatar lands in a seat. The autoplay demo never calls it." },
      { name: "onSend", type: "(emails: string[]) => void", defaultValue: "undefined", description: "Called with every pending email when Send invites is pressed. The autoplay demo never calls it." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types an email, adds three people, sends the invites and starts over on a loop until someone touches it. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", defaultValue: '""', description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewEmptyTeam,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { EmptyTeam } from "@/components/empty-team";

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-[520px] px-4 py-16">
      <EmptyTeam
        seats={5}
        domain="fernhill.io"
        suggestions={["jo.reyes@fernhill.io", "sam@fernhill.io"]}
        autoplay
      />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "streaming-answer",
    name: "Streaming Answer",
    registryCliName: "streaming-answer",
    description:
      "An AI answer card that shows its thinking steps ticking off, folds them into a one-line summary, slides in sources and streams the answer word by word. Citation chips pop in where they belong and light up the source they came from when you point at them.",
    categorySlug: "ai-components",
    tags: ["ai", "chat", "streaming", "answer", "citations", "sources", "thinking", "reasoning", "loading state", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 162,
    createdAt: "2026-10-22",
    animationKinds: ["type", "spring", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "question", type: "string", defaultValue: "STREAMING_ANSWER_QUESTION", description: "The user's message, shown in the bubble above the answer." },
      { name: "steps", type: "string[]", defaultValue: "STREAMING_ANSWER_STEPS", description: "Thinking steps, ticked off one by one before the answer streams." },
      { name: "sources", type: "StreamingAnswerSource[]", defaultValue: "STREAMING_ANSWER_SOURCES", description: "Source cards that slide in once thinking is done: { n, title, where, c, ink?, href? }. Up to three fit the grid." },
      { name: "answer", type: "string", defaultValue: "STREAMING_ANSWER_TEXT", description: "The answer text. Write {1}, {2} straight after a word to drop a citation chip for that source number." },
      { name: "thoughtSeconds", type: "number", defaultValue: "4", description: "The number in the folded summary line, \"Thought for 4s\"." },
      { name: "width", type: "number", defaultValue: "520", description: "Width of the card in px. It never grows past its container." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays the whole run again every 13 seconds until someone touches the card. Only runs while the card is on screen and never under reduced motion." },
      { name: "className", type: "string", defaultValue: '""', description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewStreamingAnswer,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { StreamingAnswer } from "@/components/streaming-answer";

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-[560px] py-12">
      <StreamingAnswer
        question="Which plan do most teams pick?"
        steps={["Searching 2 sources", "Reading Plan usage, Q3"]}
        sources={[
          { n: 1, title: "Plan usage, Q3", where: "Analytics", c: "#0a84ff" },
          { n: 2, title: "Sales calls, Oct", where: "Docs", c: "#30d158", ink: "#1d1d1f" },
        ]}
        answer="Teams of five to fifteen choose the middle plan {1}, mostly for shared dashboards {2}."
        autoplay
      />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "diff-review",
    name: "Diff Review",
    registryCliName: "diff-review",
    description:
      "An inline review of AI edits to a paragraph, with removals struck through in red and additions typed in green. Accept all folds the old words away, Reject folds the new ones away, and clicking a single change takes just that one.",
    categorySlug: "ai-components",
    tags: ["ai", "diff", "review", "accept", "reject", "suggestions", "rewrite", "editor", "inline edits", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-22",
    animationKinds: ["layout", "press", "type"],
    dependencies: ["framer-motion"],
    props: [
      { name: "parts", type: "DiffPart[]", defaultValue: "DIFF_REVIEW_PARTS", description: "The paragraph as [kind, text] runs, where kind is \"same\", \"del\" or \"ins\". A del followed by an ins is one replacement; a lone del is a removal." },
      { name: "title", type: "string", defaultValue: '"Homepage · Hero copy"', description: "Small label above the text box." },
      { name: "width", type: "number", defaultValue: "520", description: "Width of the card in px. It never grows past its container." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Improves the writing, accepts every edit and returns to the draft on a loop until someone touches the card. Only runs while the card is on screen and never under reduced motion." },
      { name: "className", type: "string", defaultValue: '""', description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewDiffReview,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { DiffReview, type DiffPart } from "@/components/diff-review";

const PARTS: DiffPart[] = [
  ["same", "We "],
  ["del", "are happy to announce"],
  ["ins", "just shipped"],
  ["same", " a new export tool. "],
  ["del", "It is really quick."],
  ["ins", "Exports finish in seconds."],
];

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-[560px] py-12">
      <DiffReview title="Changelog · Export" parts={PARTS} autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "agent-run",
    name: "Agent Run",
    registryCliName: "agent-run",
    description:
      "A live view of an AI agent working through a task, where each step shows what it is doing and folds into a ticked line when it moves on. A clock runs in the corner, Stop is always there, and the run ends on a short report with the change to review.",
    categorySlug: "ai-components",
    tags: ["ai", "agent", "steps", "progress", "tool use", "terminal output", "run log", "stop button", "timeline", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 158,
    createdAt: "2026-10-22",
    animationKinds: ["spring", "layout", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "task", type: "string", defaultValue: '"Fix the failing checkout test"', description: "The task the agent was given, shown at the top." },
      { name: "steps", type: "AgentRunStep[]", defaultValue: "AGENT_RUN_STEPS", description: "The steps of the run: { label, ms, body(t) }. body gets the ms elapsed inside the step so it can reveal lines or files as it goes." },
      { name: "report", type: "AgentRunReport", defaultValue: "AGENT_RUN_REPORT", description: "The report card shown at the end: { title, body, files, added, removed }." },
      { name: "onReview", type: "() => void", defaultValue: "undefined", description: "Called when Review change is pressed." },
      { name: "width", type: "number", defaultValue: "520", description: "Width of the card in px. It never grows past its container." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Runs the whole task again 4.5 seconds after it finishes until someone touches the card. Only runs while the card is on screen and never under reduced motion." },
      { name: "className", type: "string", defaultValue: '""', description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewAgentRun,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client";

import { AgentRun, type AgentRunStep } from "@/components/agent-run";

const STEPS: AgentRunStep[] = [
  { label: "Reading the config", ms: 1200, body: (t) => <p className="m-0 text-xs">{t > 600 ? "app.config.ts, env.ts" : "app.config.ts"}</p> },
  { label: "Updating the timeout", ms: 1400, body: () => <p className="m-0 font-mono text-xs">+ timeoutMs: 8000</p> },
];

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-[560px] py-12">
      <AgentRun
        task="Raise the request timeout"
        steps={STEPS}
        report={{ title: "Done: timeout raised", body: "Requests now wait up to 8 seconds.", files: 1, added: 1, removed: 0 }}
        autoplay
      />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ghost-autocomplete",
    name: "Ghost Autocomplete",
    registryCliName: "ghost-autocomplete",
    description:
      "Inline AI autocomplete for a text box, where a grey suggestion fades in after your cursor when you pause. Tab inks it in from left to right, typing the same words makes it follow you, and typing something else drops the ghost letters away.",
    categorySlug: "ai-components",
    tags: ["ai", "autocomplete", "suggestion", "ghost text", "textarea", "inline", "email", "writing assistant", "tab to accept", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 160,
    createdAt: "2026-10-22",
    animationKinds: ["type", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "rules", type: "GhostRule[]", defaultValue: "GHOST_AUTOCOMPLETE_RULES", description: "Pairs of [pattern, suggestion]. When the text ends with the pattern (use a $-anchored regex), the suggestion is offered after a short pause." },
      { name: "defaultValue", type: "string", defaultValue: "GHOST_AUTOCOMPLETE_START", description: "What the box starts with." },
      { name: "to", type: "string", defaultValue: '"leo@fieldnotes.example"', description: "The recipient line above the box." },
      { name: "onAccept", type: "(suggestion: string) => void", defaultValue: "undefined", description: "Called with the suggestion text when Tab accepts it." },
      { name: "width", type: "number", defaultValue: "480", description: "Width of the card in px. It never grows past its container." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Types a short script by itself, accepting one suggestion, following another and dropping a third, until someone touches the box. The script is written for the default rules and text. Only runs while on screen and never under reduced motion." },
      { name: "className", type: "string", defaultValue: '""', description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewGhostAutocomplete,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client"; // the rules contain regular expressions, which a server page cannot hand to a client component

import { GhostAutocomplete, type GhostRule } from "@/components/ghost-autocomplete";

const RULES: GhostRule[] = [
  [/Hope you're $/i, "doing well."],
  [/Looking forward to $/i, "hearing from you."],
];

export default function Page() {
  return (
    <section className="mx-auto w-full max-w-[520px] py-12">
      <GhostAutocomplete to="nina@fieldnotes.example" defaultValue={"Hi Nina,\\n\\nHope you're "} rules={RULES} />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "skeleton-morph",
    name: "Skeleton Morph",
    registryCliName: "skeleton-morph",
    description:
      "A card whose loading skeletons are cut to the exact shape of the content that replaces them, with one light sweeping across every block. When the data arrives each block dissolves into its real content in reading order, and nothing shifts.",
    categorySlug: "loaders",
    tags: ["skeleton", "loading", "placeholder", "shimmer", "crossfade", "card", "content loading", "perceived performance", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 152,
    createdAt: "2026-10-22",
    animationKinds: ["layout", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "ready", type: "boolean", description: "Controlled: true shows the content, false the skeletons. Leave it out to use the built-in toggle button and defaultReady." },
      { name: "defaultReady", type: "boolean", defaultValue: "false", description: "Starting state when ready is not controlled." },
      { name: "onReadyChange", type: "(ready: boolean) => void", description: "Called when the toggle button, or autoplay, changes the state." },
      { name: "author", type: "string", defaultValue: "\"Maya Chen\"", description: "Author name shown beside the avatar." },
      { name: "initials", type: "string", defaultValue: "\"MC\"", description: "Initials in the avatar." },
      { name: "avatarColor", type: "string", defaultValue: "\"#ff9f0a\"", description: "Avatar colour." },
      { name: "meta", type: "string", defaultValue: "\"4 min read\"", description: "Reading time line under the author." },
      { name: "title", type: "string", defaultValue: "\"Designing for the empty state\"", description: "Headline of the card." },
      { name: "lines", type: "string[]", defaultValue: "SKELETON_MORPH_LINES", description: "Lines of body copy, one skeleton each." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Flips between skeleton and content on a loop until someone touches the card. Pauses off screen, never runs under reduced motion, and works when ready is not controlled." },
      { name: "className", type: "string", description: "Extra classes for the wrapper." },
    ],
    Preview: Previews.PreviewSkeletonMorph,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client"; // it keeps loading state, so this page runs in the browser

import { useEffect, useState } from "react";
import { SkeletonMorph } from "@/components/skeleton-morph";

export default function Page() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 1200); // swap for your own fetch
    return () => window.clearTimeout(id);
  }, []);

  return (
    <SkeletonMorph
      ready={ready}
      author="Leo Park"
      initials="LP"
      avatarColor="#0a84ff"
      title="Notes on calm interfaces"
      meta="6 min read"
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "morphing-dialog",
    name: "Morphing Dialog",
    registryCliName: "morphing-dialog",
    description:
      "Dialogs that grow out of the button that opened them and shrink back into it on close, so you always see where they came from. Share opens a link panel, and Delete asks for the project name to be typed before the red button wakes up.",
    categorySlug: "cards",
    tags: ["dialog", "modal", "morph", "shared element", "confirm", "delete", "share", "layout animation", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 160,
    createdAt: "2026-10-22",
    animationKinds: ["layout", "spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "projectName", type: "string", defaultValue: "\"orbitly-site\"", description: "Name of the demo project. The delete dialog asks for it to be typed before the red button wakes up." },
      { name: "pageCount", type: "number", defaultValue: "14", description: "Number of pages the delete dialog says will be removed." },
      { name: "shareBase", type: "string", defaultValue: "\"nexus.app/p\"", description: "Host and path the share link is built from, followed by the project name." },
      { name: "onDelete", type: "() => void", description: "Called when the delete is confirmed." },
      { name: "onRestore", type: "() => void", description: "Called when a deleted project is restored." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Opens Share and closes it, then opens Delete, types the name, confirms and restores, on a loop until someone touches the component. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the frame." },
    ],
    Preview: Previews.PreviewMorphingDialog,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MorphingDialog } from "@/components/morphing-dialog";

export default function Page() {
  return (
    <MorphingDialog
      projectName="launch-notes"
      pageCount={9}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "travelling-tooltip",
    name: "Travelling Tooltip",
    registryCliName: "travelling-tooltip",
    description:
      "One tooltip for a whole toolbar. The first hover waits a beat, then it glides from button to button with no delay, resizing to each label and showing the shortcut.",
    categorySlug: "motion-effects",
    tags: ["tooltip", "toolbar", "hover", "shortcut", "keyboard", "glide", "shared tooltip", "editor", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 156,
    createdAt: "2026-10-22",
    animationKinds: ["hover", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "tools", type: "TravellingTooltipTool[]", defaultValue: "TRAVELLING_TOOLTIP_TOOLS", description: "The toolbar buttons: id, label, keys (the shortcut shown as a keycap) and d (SVG path data for a 24 x 24 stroke icon). Defaults to a six-button text formatting bar." },
      { name: "label", type: "string", defaultValue: "\"Formatting\"", description: "Accessible name of the toolbar." },
      { name: "openDelay", type: "number", defaultValue: "450", description: "How long the first hover waits before the tooltip appears, in ms. After that it travels with no delay." },
      { name: "warmMs", type: "number", defaultValue: "600", description: "How long the tooltip stays warm after the pointer leaves the bar, in ms. Re-enter within this time and it appears at once." },
      { name: "hint", type: "string", defaultValue: "\"Hover one button, then slide along the bar\"", description: "Caption under the toolbar. Pass an empty string to hide it." },
      { name: "onSelect", type: "(tool: TravellingTooltipTool) => void", description: "Called when a button is pressed." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Walks the tooltip along the bar by itself until someone points at or focuses the bar. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the wrapper." },
    ],
    Preview: Previews.PreviewTravellingTooltip,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx
"use client"; // TRAVELLING_TOOLTIP_TOOLS is a value imported from a client file, so it can only be used in a client page

import { TravellingTooltip, TRAVELLING_TOOLTIP_TOOLS } from "@/components/travelling-tooltip";

export default function Page() {
  return (
    <TravellingTooltip
      tools={TRAVELLING_TOOLTIP_TOOLS.slice(0, 4)}
      label="Text formatting"
      openDelay={300}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "sound-mark",
    name: "Sound Mark",
    registryCliName: "sound-mark",
    description:
      "A brand mark under a tray of water with a vibrating rod in it. The rod drives a standing ripple that bends the mark like light through water. Press and hold to turn the note up, tap to drop a ripple, drag the rod to move the source, and pick a pitch to tighten or loosen the rings.",
    categorySlug: "motion-effects",
    tags: ["logo", "brand", "water", "ripple", "shader", "webgl", "sound", "audio", "web audio", "wordmark", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 166,
    createdAt: "2026-10-23",
    animationKinds: ["press", "spring", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "word", type: "string", defaultValue: "\"sound\"", description: "The word set beside the mark. It is drawn into the water, so keep it short." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Swells, drops ripples and cycles the colours and pitch by itself until someone touches it. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the wrapper." },
    ],
    Preview: Previews.PreviewSoundMark,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SoundMark } from "@/components/sound-mark";

export default function Page() {
  return (
    <section className="mx-auto flex w-full max-w-[880px] justify-center py-16">
      <SoundMark word="studio" />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ripple-now-playing",
    name: "Ripple Now Playing",
    registryCliName: "ripple-now-playing",
    description:
      "A player card whose cover sits under water. Every beat of the track drops a ring that spreads through the artwork, so the cover pulses in time. Pause and the water goes still, scrub the bar and a ring follows your finger, skip and the new cover slides in.",
    categorySlug: "cards",
    tags: ["music", "player", "now playing", "cover art", "ripple", "displacement", "svg filter", "audio", "spotify", "scrub", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 163,
    createdAt: "2026-10-23",
    animationKinds: ["press", "drag", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "tracks", type: "RippleNowPlayingTrack[]", defaultValue: "three demo tracks", description: "The playlist: title, artist, bpm (the ripples follow it), length in seconds, three gradient colours (a, b, c) and the ink colour of the title." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Starts playing by itself and skips to the next track every seven seconds until someone touches the card. Pauses off screen and never runs under reduced motion. Without it the card waits, paused, until you press play." },
      { name: "className", type: "string", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewRippleNowPlaying,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { RippleNowPlaying } from "@/components/ripple-now-playing";

export default function Page() {
  return (
    <aside className="mx-auto w-full max-w-[360px] py-10">
      <RippleNowPlaying />
    </aside>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "chladni-upload",
    name: "Chladni Upload",
    registryCliName: "chladni-upload",
    description:
      "An upload progress indicator made of sand on a vibrating plate. Each stage of the upload plays a higher note, the sand jumps off the moving parts and settles on the new quiet lines so the pattern gets finer as the file goes up, and at 100% it gathers into a check mark.",
    categorySlug: "loaders",
    tags: ["upload", "progress", "chladni", "sand", "particles", "canvas", "file", "loader", "progress bar", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 161,
    createdAt: "2026-10-23",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "fileName", type: "string", defaultValue: "\"mix-final.wav\"", description: "The file name shown under the plate." },
      { name: "fileSize", type: "number", defaultValue: "24.6", description: "Size in MB. The \"x of y MB\" line counts up to it." },
      { name: "duration", type: "number", defaultValue: "7", description: "How long a full upload takes, in seconds." },
      { name: "onComplete", type: "() => void", description: "Called once each time an upload reaches 100%." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Uploads, holds the check, resets and goes again until someone presses the button. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewChladniUpload,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ChladniUpload } from "@/components/chladni-upload";

export default function Page() {
  return (
    <ChladniUpload
      fileName="album-master.wav"
      fileSize={48.2}
    />
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "tank-recorder",
    name: "Tank Recorder",
    registryCliName: "tank-recorder",
    description:
      "A voice memo button over a glass tank seen from the side. While you hold to record, your simulated voice shakes a pin in the water and the surface carries it as real waves that bounce off the glass. The timer sits behind the water, so the part below the line wobbles with the voice. Let go and the memo drops into a list with its waveform.",
    categorySlug: "inputs-controls",
    tags: ["recorder", "voice", "audio", "record", "timer", "liquid", "water", "svg", "level meter", "voice memo", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 159,
    createdAt: "2026-10-23",
    animationKinds: ["press", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Records a short simulated take, saves it, and goes again until someone touches the button. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewTankRecorder,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TankRecorder } from "@/components/tank-recorder";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[360px] py-10">
      <TankRecorder />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "ripple-toast",
    name: "Ripple Toast",
    registryCliName: "ripple-toast",
    description:
      "Notifications that arrive like a drop hitting water. Each toast falls in as a small bead, splashes flat into a pill with an overshoot, sends out a ring, and its text resolves out of the ripples. Up to three stack, and dismissed ones lift away as a drop.",
    categorySlug: "motion-effects",
    tags: ["toast", "notification", "snackbar", "alert", "water", "ripple", "svg filter", "displacement", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 157,
    createdAt: "2026-10-23",
    animationKinds: ["spring", "layout", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Sends a notification every couple of seconds and dismisses one now and then, until someone presses a button. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the wrapper." },
    ],
    Preview: Previews.PreviewRippleToast,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { RippleToast } from "@/components/ripple-toast";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[380px] py-10">
      <RippleToast />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "cubes-grid",
    name: "Cubes Grid",
    registryCliName: "cubes-grid",
    description:
      "A field of 3D cubes that ripples under the cursor. Moving the pointer lifts cubes into a travelling wave that spreads, bounces off the edges and settles on its own. Pick a flat light isometric floor with soft crest highlights, or a dark tilted grid fading into fog with glowing crests. One canvas and one animation loop, no re-renders.",
    categorySlug: "background-effects",
    tags: ["cubes", "grid", "3d", "isometric", "canvas", "ripple", "wave", "background", "hover", "pointer", "hero", "motion kit"],
    premium: true,
    trendingScore: 163,
    createdAt: "2026-10-23",
    animationKinds: ["hover"],
    dependencies: [],
    props: [
      { name: "variant", type: "\"isometric\" | \"perspective\"", defaultValue: "\"isometric\"", description: "The flat light isometric floor, or the dark tilted 3D grid." },
      { name: "autoplay", type: "boolean", description: "Drops random ripples while the pointer is idle so the grid demos itself. Same as idleRipples, and wins over it when set." },
      { name: "idleRipples", type: "boolean", defaultValue: "true", description: "Drops random ripples when the pointer stops." },
      { name: "idleDelay", type: "number", defaultValue: "1.5", description: "Seconds the grid stays still before random ripples start." },
      { name: "amplitude", type: "number", description: "Wave height. Isometric: in tiles (0.7). Perspective: in cube sizes (0.9)." },
      { name: "glow", type: "number", description: "Strength of the light on the wave crests (0.5 isometric, 0.9 perspective). 0 turns it off." },
      { name: "speed", type: "number", description: "Wave speed, in cubes per second (7 isometric, 9 perspective)." },
      { name: "damping", type: "number", description: "Wave energy kept per second, 0 to 1 (0.08 isometric, 0.1 perspective). Lower settles faster." },
      { name: "gap", type: "number", description: "Seam between cubes. Isometric: a fraction of a tile (0.025). Perspective: world units (0.16)." },
      { name: "cellSize", type: "number", defaultValue: "150", description: "Isometric only. On-screen width of one tile, in px." },
      { name: "topColor", type: "string", defaultValue: "\"#fafaf9\"", description: "Isometric only. Top face colour." },
      { name: "leftColor", type: "string", defaultValue: "\"#e7e5e4\"", description: "Isometric only. Left face colour." },
      { name: "rightColor", type: "string", defaultValue: "\"#d6d3d1\"", description: "Isometric only. Right face colour." },
      { name: "glowColor", type: "string", defaultValue: "\"#a8a29e\"", description: "Isometric only. Colour of the light that follows the ripple." },
      { name: "gridSize", type: "number", defaultValue: "40", description: "Perspective only. Number of cubes per side." },
      { name: "baseColor", type: "string", defaultValue: "\"#2a2a30\"", description: "Perspective only. Cube colour at rest." },
      { name: "waveColor", type: "string", defaultValue: "\"#ff6a2b\"", description: "Perspective only. Colour of the wave crests." },
      { name: "backgroundColor", type: "string", defaultValue: "\"#0b0b0d\"", description: "Perspective only. Scene background and fog colour." },
      { name: "tilt", type: "number", defaultValue: "0.7", description: "Perspective only. Camera tilt away from top-down, in radians." },
      { name: "className", type: "string", description: "Extra classes for the canvas wrapper." },
    ],
    Preview: Previews.PreviewCubesGrid,
    detailPreviews: [Previews.PreviewCubesGrid, Previews.PreviewCubesGridPerspective],
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { CubesGrid } from "@/components/cubes-grid";

// The grid fills its nearest positioned parent, so give it a relative box.
export default function Page() {
  return (
    <section className="relative h-[560px] overflow-hidden bg-[#f5f5f4]">
      <CubesGrid variant="isometric" />
      <div className="pointer-events-none relative z-10 flex h-full items-center justify-center">
        <h1 className="text-5xl font-semibold tracking-tight">Move across the floor</h1>
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Dark perspective grid",
        code: `// src/app/page.tsx

import { CubesGrid } from "@/components/cubes-grid";

export default function Page() {
  return (
    <section className="relative h-[560px] overflow-hidden bg-[#0b0b0d]">
      <CubesGrid variant="perspective" waveColor="#ff6a2b" gridSize={44} />
    </section>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "venom-button",
    name: "Venom Button",
    registryCliName: "venom-button",
    description:
      "A glossy black pill that hunts for a host. Come near and pseudopods ooze out and feel toward the cursor; get close and they lunge, each one wrapping a finger of a cartoon glove. Pull away and they stretch, snap and melt back into the button, which wobbles and throws up a few spikes.",
    categorySlug: "for-fun",
    tags: ["button", "cta", "webgl", "shader", "metaball", "liquid", "goo", "cursor", "hover", "lacquer", "motion kit"],
    premium: false,
    trendingScore: 172,
    createdAt: "2026-10-23",
    animationKinds: ["hover", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "label", type: "string", defaultValue: "\"let’s collaborate\"", description: "Text on the button." },
      { name: "onClick", type: "() => void", description: "Click handler. It is a real button, so it is focusable and works from the keyboard." },
      { name: "strands", type: "number", defaultValue: "7", description: "Thick strands, 2 to 7. About as many fine hairs are added between them." },
      { name: "sense", type: "number", defaultValue: "290", description: "Distance from the edge, in px, at which the goo notices the cursor and starts reaching for it." },
      { name: "reach", type: "number", defaultValue: "140", description: "Distance from the edge, in px, at which the strands lunge and grab the fingers." },
      { name: "release", type: "number", defaultValue: "215", description: "Distance from the edge, in px, at which they snap. Keep it above reach." },
      { name: "cursor", type: "\"glove\" | \"native\"", defaultValue: "\"glove\"", description: "\"glove\" draws a cartoon hand inside the stage; \"native\" keeps the system pointer." },
      { name: "height", type: "number", defaultValue: "420", description: "Stage height in px." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "A ghost glove plays with the button until a real pointer arrives. Off by default, so it only reacts to the visitor's own cursor or finger. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the stage." },
    ],
    Preview: Previews.PreviewVenomButton,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { VenomButton } from "@/components/venom-button";

// The button comes with its own light stage; set height to give the goo room to reach.
export default function Page() {
  return (
    <div className="mx-auto max-w-[720px]">
      <VenomButton label="let’s collaborate" />
    </div>
  );
}`,
    reactExamples: [
      {
        title: "Shorter reach, system cursor",
        code: `// src/app/page.tsx

import { VenomButton } from "@/components/venom-button";

export default function Page() {
  return (
    <VenomButton
      label="Book a call"
      cursor="native"
      strands={4}
      sense={220}
      reach={110}
      release={170}
      height={320}
    />
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "web-sling-button",
    name: "Web Sling Button",
    registryCliName: "web-sling-button",
    description:
      "A red call-to-action button on a light stage where the cursor is a web-shooter. Click anywhere and a line of silk splats onto the button in a burst of flung fibres and glue; hold and pull and it drags and tilts the button on stretching silk beaded with glue knots. Let go and the line dangles and swings, and pull too far and it snaps and frays. A web fluid meter drains with every shot and refills slowly, and a counter keeps score of shots fired.",
    categorySlug: "for-fun",
    tags: ["button", "cta", "web", "silk", "verlet", "rope", "webgl", "physics", "drag", "cursor", "playful", "light", "motion kit"],
    premium: false,
    trendingScore: 171,
    createdAt: "2026-10-23",
    animationKinds: ["press", "drag", "spring"],
    dependencies: [],
    props: [
      { name: "label", type: "string", defaultValue: "\"Get started\"", description: "Text on the button." },
      { name: "onClick", type: "() => void", description: "Called when the button itself is clicked." },
      { name: "height", type: "number", defaultValue: "460", description: "Height of the stage, in px." },
      { name: "snapAt", type: "number", defaultValue: "2.3", description: "How far a line can be stretched, as a multiple of its length, before it snaps." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "A ghost shoots, pulls and snaps lines in a loop until a real pointer arrives. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the stage." },
    ],
    Preview: Previews.PreviewWebSlingButton,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { WebSlingButton } from "@/components/web-sling-button";

// The stage is a dark, rounded box that fills its parent's width. Clicks on the button itself
// still reach onClick; clicks anywhere else on the stage shoot a web.
export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <WebSlingButton label="Get started" />
    </div>
  );
}`,
    reactExamples: [
      {
        title: "Easier to snap, shorter stage",
        code: `// src/app/page.tsx

import { WebSlingButton } from "@/components/web-sling-button";

export default function Page() {
  return <WebSlingButton label="Join the swarm" snapAt={1.6} height={340} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "frost-input",
    name: "Frost Input",
    registryCliName: "frost-input",
    description:
      "A sign-up field that freezes. Focus it and six-fold frost crystals grow across the glass, every key you type drives a crack through the ice from the caret, and sending it shatters the field from the point of impact into falling shards before it freezes back together. It is a real form field with a label, Enter to submit and an onSubmit callback.",
    categorySlug: "for-fun",
    tags: ["input", "email", "sign up", "newsletter", "frost", "ice", "crystal", "shatter", "canvas", "focus", "typing", "form", "motion kit"],
    premium: true,
    trendingScore: 170,
    createdAt: "2026-10-23",
    animationKinds: ["type", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "placeholder", type: "string", defaultValue: "\"you@studio.com\"", description: "Placeholder text inside the empty field." },
      { name: "headline", type: "string", defaultValue: "\"Join the cold list.\"", description: "Headline above the field." },
      { name: "done", type: "string", defaultValue: "\"You’re on the list.\"", description: "Message shown after the field shatters." },
      { name: "onSubmit", type: "(value: string) => void", description: "Called with the trimmed value when the form is sent." },
      { name: "height", type: "number", defaultValue: "420", description: "Height of the stage, in px." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "A ghost clicks in, types an address and sends it, in a loop, until a real pointer or key arrives. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the stage." },
    ],
    Preview: Previews.PreviewFrostInput,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { FrostInput } from "@/components/frost-input";

// The stage has its own dark blue background, so it works on any page. Set its height with the height prop.
export default function Page() {
  return (
    <FrostInput
      headline="Join the cold list."
      done="You’re on the list."
    />
  );
}`,
    reactExamples: [
      {
        title: "Taller stage with your own copy",
        code: `// src/app/page.tsx
"use client";

import { FrostInput } from "@/components/frost-input";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <FrostInput
        height={480}
        headline="Get the first thaw."
        placeholder="name@company.com"
        done="Frozen in. See you soon."
        onSubmit={async (email) => {
          await fetch("/api/waitlist", { method: "POST", body: JSON.stringify({ email }) });
        }}
      />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "black-hole-delete",
    name: "Black Hole Delete",
    registryCliName: "black-hole-delete",
    description:
      "An inbox where deleting is a cosmic event. Swipe a message away, or press its close button, and a black hole opens beside it: the list bends around it like a lens, the message is stretched thin and spirals in, and a shockwave ripples through the rest. Restore runs it backwards with a white hole.",
    categorySlug: "for-fun",
    tags: ["delete", "swipe", "inbox", "list", "webgl", "shader", "lens", "black hole", "gesture", "dark", "motion kit"],
    premium: true,
    trendingScore: 168,
    createdAt: "2026-10-23",
    animationKinds: ["drag", "press", "spring"],
    dependencies: [],
    props: [
      { name: "messages", type: "BlackHoleMessage[]", defaultValue: "six sample messages", description: "The inbox: title, body, time and avatar colour for each message. Each one also gets a real delete button for keyboard and screen reader users." },
      { name: "height", type: "number", defaultValue: "540", description: "Height of the stage, in px. About 76 + 69 per message + 40 fits the list and the hint line." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "A ghost pointer swipes a few messages away and restores them, until a real pointer arrives. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the stage." },
    ],
    Preview: Previews.PreviewBlackHoleDelete,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { BlackHoleDelete } from "@/components/black-hole-delete";

// The stage is dark and sets its own height. Swipe a message away or press its close button.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <BlackHoleDelete />
    </div>
  );
}`,
    reactExamples: [
      {
        title: "Your own messages",
        code: `// src/app/page.tsx

import { BlackHoleDelete, type BlackHoleMessage } from "@/components/black-hole-delete";

const messages: BlackHoleMessage[] = [
  { title: "Ava Chen", body: "Design review moved to Thursday at 3?", time: "9:41", color: "#5e5ce6" },
  { title: "Build bot", body: "Deploy failed: step 4 of 7 timed out", time: "9:12", color: "#ff9f0a" },
  { title: "Marco", body: "Lunch? Ramen again or somewhere new", time: "8:55", color: "#30d158" },
  { title: "Sam Rivera", body: "Sent the redlines, one open question on IP", time: "Tue", color: "#ff375f" },
];

export default function Page() {
  return <BlackHoleDelete messages={messages} height={420} />;
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "portal-card",
    name: "Portal Card",
    registryCliName: "portal-card",
    description:
      "Hold and draw a circle on a dark card and a ring of molten sparks tears open where you drew it. Through it you see another world that shifts against the pointer like a view through a window. Click in to step through, click out and it collapses in embers. The other side is plain DOM, so any content can wait behind it.",
    categorySlug: "for-fun",
    tags: ["portal", "card", "webgl", "particles", "sparks", "gesture", "draw", "reveal", "transition", "reveal card", "motion kit"],
    premium: true,
    trendingScore: 169,
    createdAt: "2026-10-23",
    animationKinds: ["press", "parallax"],
    dependencies: [],
    props: [
      { name: "children", type: "ReactNode", description: "What waits on the other side. Defaults to a dusk valley." },
      { name: "height", type: "number", defaultValue: "460", description: "Height of the card, in px. It is always as wide as its parent." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "A ghost hand draws a circle, opens the portal, steps through and returns, until a real pointer arrives. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the card." },
    ],
    Preview: Previews.PreviewPortalCard,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { PortalCard } from "@/components/portal-card";

// Draw a circle on the card to open the portal. With no children it shows a dusk valley.
export default function Page() {
  return (
    <div className="mx-auto max-w-[720px]">
      <PortalCard height={440} />
    </div>
  );
}`,
    reactExamples: [
      {
        title: "Your own content on the other side",
        code: `// src/app/page.tsx

import { PortalCard } from "@/components/portal-card";

export default function Page() {
  return (
    <div className="mx-auto max-w-[720px]">
      <PortalCard height={420}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b1f3a] px-6 text-center">
          <p className="m-0 text-4xl font-semibold tracking-tight text-white">Welcome to the team.</p>
          <a href="/signup" className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-medium text-[#0b1f3a]">
            Start free
          </a>
        </div>
      </PortalCard>
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "mesh-net",
    name: "Mesh Net",
    registryCliName: "mesh-net",
    description:
      "A distorted triangle net that hides in the dark until the cursor comes near. Nodes are shoved outward on springs, overshoot a little as they settle, and the edges light up like a torch passing over them, then fade out again with distance.",
    categorySlug: "background-effects",
    tags: ["net", "mesh", "triangles", "canvas", "spring", "cursor", "reveal", "background", "hero", "dark", "motion kit"],
    premium: true,
    trendingScore: 166,
    createdAt: "2026-10-23",
    animationKinds: ["hover", "spring"],
    dependencies: [],
    props: [
      { name: "color", type: "string", defaultValue: "\"#5b4fe0\"", description: "Colour of the lit edges, as a 6-digit hex." },
      { name: "background", type: "string", defaultValue: "\"#000000\"", description: "Colour the canvas is cleared to." },
      { name: "gridSize", type: "number", defaultValue: "64", description: "Spacing between nodes, in px." },
      { name: "distortion", type: "number", defaultValue: "0.5", description: "Random offset of each node, as a fraction of the spacing (0 to 0.5)." },
      { name: "revealRadius", type: "number", defaultValue: "230", description: "Radius around the pointer where the net shows and reacts, in px." },
      { name: "push", type: "number", defaultValue: "30", description: "How far nodes are shoved away from the pointer, in px." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "A ghost pointer drifts in a slow loop until a real pointer arrives. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the wrapper." },
      { name: "children", type: "ReactNode", description: "Content layered above the net." },
    ],
    Preview: Previews.PreviewMeshNet,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MeshNet } from "@/components/mesh-net";

// The net fills its box, so give it a height. Content goes on top as children.
export default function Page() {
  return (
    <section className="h-[560px]">
      <MeshNet color="#5b4fe0">
        <div className="pointer-events-none flex h-full items-center justify-center">
          <h1 className="text-5xl font-semibold tracking-tight text-white">Every node, one move away.</h1>
        </div>
      </MeshNet>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Tighter, warmer net",
        code: `// src/app/page.tsx

import { MeshNet } from "@/components/mesh-net";

export default function Page() {
  return (
    <div className="h-[480px]">
      <MeshNet color="#ff6a2b" background="#0b0b0d" gridSize={44} revealRadius={180} push={22} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "particle-reveal",
    name: "Particle Reveal",
    registryCliName: "particle-reveal",
    description:
      "A headline made of thousands of dots that gather out of a scatter on springs, each with its own slight delay, like dust settling. The cursor pushes nearby dots aside and combs them into streaks, they flow back when it leaves, and a click blows the word apart again.",
    categorySlug: "motion-effects",
    tags: ["text", "particles", "dots", "canvas", "headline", "reveal", "spring", "cursor", "hero", "motion kit"],
    premium: true,
    trendingScore: 165,
    createdAt: "2026-10-23",
    animationKinds: ["hover", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "text", type: "string", defaultValue: "\"Reveal\"", description: "The word to draw. Short words read best." },
      { name: "color", type: "string", defaultValue: "\"#3a3a3c\"", description: "Colour of the dots." },
      { name: "particleSize", type: "number", defaultValue: "1", description: "Radius of each dot in px." },
      { name: "density", type: "number", defaultValue: "3.2", description: "Sampling step in px. Lower is denser (2 to 8)." },
      { name: "dispersion", type: "number", defaultValue: "1", description: "How far the dots start from the letters, as a fraction of the stage (0 to 1.5)." },
      { name: "hoverRadius", type: "number", defaultValue: "70", description: "Radius around the cursor that pushes dots away, in px." },
      { name: "hoverForce", type: "number", defaultValue: "1", description: "Strength of the push." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "A ghost cursor combs through the word and the word bursts and re-forms every few seconds, until a real pointer arrives. Pauses off screen and never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the wrapper." },
    ],
    Preview: Previews.PreviewParticleReveal,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ParticleReveal } from "@/components/particle-reveal";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[640px] py-10">
      <ParticleReveal text="Launch" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "morphing-text",
    name: "Morphing Text",
    registryCliName: "morphing-text",
    description:
      "A keyword that melts into the next one. Two blurred copies meet under an SVG alpha threshold, so the letters flow into new letters instead of cross-fading. The threshold is only on during the morph, so resting text stays crisp, and a pause button stops the cycle.",
    categorySlug: "motion-effects",
    tags: ["text", "morph", "gooey", "blur", "svg filter", "headline", "keyword", "rotating text", "hero", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 164,
    createdAt: "2026-10-23",
    animationKinds: ["spring", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "lead", type: "string", defaultValue: "\"Interfaces that feel\"", description: "Static line above the morphing word. An empty string hides it." },
      { name: "words", type: "string[]", defaultValue: "[\"alive.\", \"tactile.\", \"physical.\", \"inevitable.\", \"yours.\"]", description: "The words to cycle through." },
      { name: "morphTime", type: "number", defaultValue: "1.1", description: "Seconds each morph takes." },
      { name: "holdTime", type: "number", defaultValue: "1.6", description: "Seconds each word rests before the next morph." },
      { name: "align", type: "\"left\" | \"center\" | \"right\"", defaultValue: "\"center\"", description: "Alignment of the lead line and the word." },
      { name: "color", type: "string", description: "Colour of the morphing word. Leave it out for the house blue, which reads on light and dark fills, or pass \"currentColor\" to inherit. The lead line and Pause button take the text colour of the parent." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Cycles through the words on its own. Off, it rests on the first word until Play is pressed. Pauses off screen, and reduced motion swaps words with a plain fade." },
      { name: "className", type: "string", description: "Extra classes for the wrapper." },
    ],
    Preview: Previews.PreviewMorphingText,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { MorphingText } from "@/components/morphing-text";

export default function Page() {
  return (
    <section className="px-6 py-24">
      <MorphingText lead="Interfaces that feel" words={["alive.", "tactile.", "yours."]} autoplay />
    </section>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "code-snippet",
    name: "Code Snippet",
    registryCliName: "code-snippet",
    description:
      "A code block for developer pages. A macOS-style header with the language in quiet monospace (click it to switch) and a small Copy button that morphs into a tick. Real token-level highlighting for JS, TS, Python, Bash and JSON with no highlighter library, dark and light themes, optional line numbers, and lines that roll in one after another.",
    categorySlug: "cards",
    tags: ["code", "snippet", "syntax highlighting", "developer", "docs", "copy", "tabs", "dark", "light", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 163,
    createdAt: "2026-10-23",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "initial", type: "\"js\" | \"ts\" | \"python\" | \"bash\" | \"json\"", defaultValue: "\"js\"", description: "Language shown first." },
      { name: "theme", type: "\"dark\" | \"light\"", defaultValue: "\"dark\"", description: "Colour theme of the block." },
      { name: "lineNumbers", type: "boolean", defaultValue: "true", description: "Shows line numbers." },
      { name: "controls", type: "boolean", defaultValue: "true", description: "Shows the chip row for language, theme and line numbers under the block." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Tours the languages every few seconds until someone touches it. Pauses off screen." },
      { name: "className", type: "string", description: "Extra classes for the wrapper." },
    ],
    Preview: Previews.PreviewCodeSnippet,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { CodeSnippet } from "@/components/code-snippet";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[520px] py-10">
      <CodeSnippet initial="ts" theme="dark" controls={false} />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "workflow-network",
    name: "Workflow Network",
    registryCliName: "workflow-network",
    description:
      "One trigger fans out to its targets along curved wires on a dark dotted canvas. Light runs out of the source along every wire at once, fills each one up to its target, holds, then drains and starts again, with an optional dot riding the front of each beam. Hover or focus a target to light only its route. Wires are measured from the real cards, so they stay attached at any width.",
    categorySlug: "ai-components",
    tags: ["workflow", "automation", "nodes", "wires", "beam", "diagram", "fan out", "trigger", "canvas", "svg", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 162,
    createdAt: "2026-10-23",
    animationKinds: ["hover", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "source", type: "FlowNode", defaultValue: "an Error Trigger node", description: "The node the wires start from: title, sub, colour and an icon." },
      { name: "targets", type: "FlowNode[]", defaultValue: "three demo targets", description: "The nodes the wires end at. Each takes a title, sub, colour and icon (an inline SVG or an img of a logo)." },
      { name: "beamColor", type: "string", defaultValue: "\"#3b6cf6\"", description: "Colour of the light and the dot." },
      { name: "cycle", type: "number", defaultValue: "2.6", description: "Seconds for one fill, hold and drain." },
      { name: "dots", type: "boolean", defaultValue: "true", description: "Rides a dot on the front of each beam." },
      { name: "mode", type: "\"loop\" | \"once\"", defaultValue: "\"loop\"", description: "Loop forever, or fill once and stay lit." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Runs the beams. Off, the wires rest filled. Pauses off screen." },
      { name: "className", type: "string", description: "Extra classes for the canvas." },
    ],
    Preview: Previews.PreviewWorkflowNetwork,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { WorkflowNetwork } from "@/components/workflow-network";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[720px] py-10">
      <WorkflowNetwork autoplay beamColor="#3b6cf6" />
    </div>
  );
}`,
    tailwindSource: tw,
  },
  {
    slug: "testimonial-wall",
    name: "Testimonial Wall",
    registryCliName: "testimonial-wall",
    description:
      "An endless wall of reviews in columns that drift in opposite directions at slightly different speeds. Cards swell as they pass the middle and recede toward the edges, like reading through a lens. Hover a column and it eases to a stop while the others slow down; drag the wall to scrub it and let go to fling it. Cards can highlight a phrase or turn into a big-number card, and a Pause button stops everything.",
    categorySlug: "testimonials",
    tags: ["testimonials", "social proof", "reviews", "wall", "marquee", "columns", "infinite scroll", "drag", "fling", "lens", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 172,
    createdAt: "2026-10-24",
    animationKinds: ["scroll", "drag", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "WallTestimonial[]", defaultValue: "DEFAULT_WALL_TESTIMONIALS", description: "The reviews: { name, role, quote, hue, mark?, metric?: { value, label } }. mark is a phrase in the quote to highlight; metric turns the card into a big-number card; hue colours the avatar and highlight." },
      { name: "height", type: "number", defaultValue: "560", description: "Height of the wall, in px." },
      { name: "speed", type: "number", defaultValue: "30", description: "Base drift in px per second. Each column drifts at its own multiple of this." },
      { name: "autoplay", type: "boolean", defaultValue: "true", description: "The wall drifts by itself. When false it starts paused and the visitor can press Play. Reduced motion always starts it paused." },
      { name: "title", type: "string", defaultValue: "\"Loved by teams who ship\"", description: "Heading above the wall." },
      { name: "className", type: "string", description: "Extra classes for the outer wrapper." },
    ],
    Preview: Previews.PreviewTestimonialWall,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { TestimonialWall } from "@/components/testimonial-wall";

const reviews = [
  { name: "Maya Chen", role: "Design lead, Lumora", quote: "We rebuilt our whole onboarding in an afternoon.", mark: "in an afternoon", hue: 212 },
  { name: "Daniel Okafor", role: "CTO, fieldnote", quote: "Every component is one file with no surprises.", mark: "one file", hue: 152 },
  { name: "Sofia Marquez", role: "Founder, Parcel & Pine", quote: "Checkout conversion went up the week we swapped in the new buttons.", metric: { value: "+18%", label: "checkout conversion in week one" }, hue: 28 },
  { name: "Arjun Mehta", role: "Staff engineer, Quillstack", quote: "The springs are tuned better than anything I would have had time to tune myself.", hue: 268 },
];

// The wall uses its own width to pick 1, 2 or 3 columns. Give it a light background.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto max-w-[1040px]">
        <TestimonialWall items={reviews} title="Loved by teams who ship" />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Slower, shorter, starts paused",
        code: `// src/app/page.tsx

import { TestimonialWall } from "@/components/testimonial-wall";

export default function Page() {
  return (
    <div className="bg-[#f5f5f7] px-4 py-12">
      <TestimonialWall height={440} speed={18} autoplay={false} title="What people are saying" />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "shredder-delete",
    name: "Shredder Delete",
    registryCliName: "shredder-delete",
    description:
      "Delete files by feeding them to an office shredder. Drag a document onto the machine, or press Delete on a focused row: it becomes a printed sheet, the cutters pull it down through the throat and it comes out as thin curling strips that flutter into a smoked bin and pile up. Undo within five seconds runs the machine in reverse. It sounds like one too: the motor, the cutters and the strips rustling are driven by the machine itself, so what you hear is what you see. An Auto switch in the card plays the whole thing by itself.",
    categorySlug: "for-fun",
    tags: ["delete", "shredder", "files", "list", "undo", "drag", "canvas", "physics", "paper", "sound", "autoplay", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 174,
    createdAt: "2026-10-25",
    animationKinds: ["drag", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Shreds a file by itself, undoes it, then shreds another, until the visitor touches the card. The Auto switch in the card turns it back on or off. Never runs under reduced motion and pauses while the card is off screen." },
      { name: "volume", type: "number", defaultValue: "0.7", description: "How loud the shredder is, 0 to 1." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewShredderDelete,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { ShredderDelete } from "@/components/shredder-delete";

// A white card with a list of documents and the shredder under it. Drag a row onto the machine,
// press its bin button, or focus it and press Delete. Undo appears for five seconds.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[440px]">
        <ShredderDelete />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself, quietly",
        code: `// src/app/page.tsx

import { ShredderDelete } from "@/components/shredder-delete";

// autoplay shreds and restores a file until the visitor touches the card; the Auto switch brings it back.
// The sound follows the site-wide switch and stays silent until the visitor has clicked or pressed a key once.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px] bg-[#f5f5f7] p-6">
      <ShredderDelete autoplay volume={0.4} />
    </div>
  );
}`,
      },
      {
        title: "Silent",
        code: `// src/app/page.tsx

import { ShredderDelete } from "@/components/shredder-delete";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <ShredderDelete enableSound={false} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "dart-rating",
    name: "Dart Rating",
    registryCliName: "dart-rating",
    description:
      "Rate something from 1 to 10 by throwing a dart. Press and hold on the board to aim: the reticle wobbles more the longer you hold while a power meter fills, and letting go throws. The ring the dart lands in is the rating, a score and a word appear under the board, and throwing again pulls the old dart out. Number and arrow keys throw a perfect dart straight to that ring, and the board is a real slider for screen readers.",
    categorySlug: "inputs-controls",
    tags: ["rating", "dart", "slider", "feedback", "score", "input", "game", "press", "spring", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 179,
    createdAt: "2026-10-25",
    animationKinds: ["press", "spring", "drag"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays itself with a ghost pointer until the visitor touches the card. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewDartRating,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { DartRating } from "@/components/dart-rating";

// Press and hold on the board to aim, release to throw. Number keys 1 to 9 and 0 throw a perfect dart at that ring.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[440px]">
        <DartRating />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { DartRating } from "@/components/dart-rating";

// autoplay throws a 6, then a 9, then clears the board, until the visitor touches it.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px] bg-[#f5f5f7] p-6">
      <DartRating autoplay />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "domino-progress",
    name: "Domino Progress",
    registryCliName: "domino-progress",
    description:
      "A deploy pipeline drawn as a line of standing dominoes. Each completed step tips the current tile onto the next, which wobbles from the hit and lights up as the active step. Pause opens a gap so the falling tile lands flat on the table, Resume slides the next tile in and the chain carries on to Live, and Reset ripples every tile back upright. Buttons, status text and a live region keep it usable without the animation.",
    categorySlug: "loaders",
    tags: ["progress", "stepper", "pipeline", "deploy", "dominoes", "loader", "3d", "physics", "steps", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 178,
    createdAt: "2026-10-25",
    animationKinds: ["3d", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays itself with a ghost pointer until the visitor touches the card. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewDominoProgress,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { DominoProgress } from "@/components/domino-progress";

// Next tips the chain one step. Pause opens a gap, Resume closes it, Reset stands everything back up.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[560px]">
        <DominoProgress />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { DominoProgress } from "@/components/domino-progress";

// autoplay runs two steps, pauses at step three, resumes, finishes and ripples back, until the visitor touches it.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[560px] bg-[#f5f5f7] p-6">
      <DominoProgress autoplay />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "pumpkin-reveal",
    name: "Pumpkin Reveal",
    registryCliName: "pumpkin-reveal",
    description:
      "Trick or treat with a real 3D jack-o'-lantern hanging from a dead branch. It turns on its rope, every hit grows glowing cracks where you struck it, and the third splits it along its ribs into curved shell pieces. Then whatever was inside gets out: sheet ghosts with cut-out faces fly out and keep circling the night, bats burst out, and black widows scuttle across the card while one drops on a thread from the branch. Then the offer flies out on a torn, bloodied slip with a cobweb and its spider, and lands ready to copy. The sounds are synthesised, off until the visitor switches them on, and an optional track can play as it bursts.",
    categorySlug: "for-fun",
    tags: ["pumpkin", "halloween", "reveal", "coupon", "promo", "spiders", "ghosts", "bats", "spooky", "3d", "canvas", "physics", "sound", "autoplay", "fun", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 177,
    createdAt: "2026-10-25",
    animationKinds: ["3d", "press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays itself with a ghost pointer until the visitor touches the card. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "music", type: "string", description: "URL of an mp3 to play when the pumpkin bursts, with the moonlight pulsing to it. Without one, the ghosts wail instead." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewPumpkinReveal,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { PumpkinReveal } from "@/components/pumpkin-reveal";

// Hit the pumpkin three times (tap it, or focus it and press Space). It splits open, what was inside
// crawls and flies out, and then the coupon lands. The speaker button turns the sounds on.
export default function Page() {
  return (
    <section className="bg-[#0e0a17] px-4 py-16">
      <div className="mx-auto w-full max-w-[440px]">
        <PumpkinReveal />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { PumpkinReveal } from "@/components/pumpkin-reveal";

// autoplay hits it three times, lets the ghosts, bats and spiders out, shows the offer and hangs a new one, until the visitor touches it.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px] p-6">
      <PumpkinReveal autoplay />
    </div>
  );
}`,
      },
      {
        title: "With your own track",
        code: `// src/app/page.tsx

import { PumpkinReveal } from "@/components/pumpkin-reveal";

// The track starts as the pumpkin bursts and the moonlight pulses with it. The burst is timed to the demo track
// (download it next to the build prompt and save it as public/audio/pumpkin-burst.mp3); any mp3 works too.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px] p-6">
      <PumpkinReveal music="/audio/pumpkin-burst.mp3" />
    </div>
  );
}`,
      },
      {
        title: "Silent",
        code: `// src/app/page.tsx

import { PumpkinReveal } from "@/components/pumpkin-reveal";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px] p-6">
      <PumpkinReveal enableSound={false} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "catch-undo",
    name: "Catch Undo",
    registryCliName: "catch-undo",
    description:
      "An Undo that catches. Delete a file and the row comes loose, drops out of the list and time slows as it falls into the dark. Hit Undo and a web shoots from the button: a twisted rope of silk fibres that frays open into a hand as it flies, wraps the row, stretches to slow it down gently and reels it back into its slot. Miss it and the row is simply gone. A slow-hand switch gives you more time, and an onCue callback exposes each stage for your own sound layer.",
    categorySlug: "for-fun",
    tags: ["undo", "delete", "files", "web", "catch", "webgl", "canvas", "physics", "slow motion", "fun", "motion kit", "framer-motion"],
    premium: false,
    trendingScore: 176,
    createdAt: "2026-10-25",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays itself with a ghost pointer until the visitor touches the card. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "height", type: "number", defaultValue: "560", description: "Height of the stage in pixels." },
      { name: "slowHand", type: "boolean", defaultValue: "false", description: "Starts with the slow hand on: the web takes about two and a half times longer to open its hand." },
      { name: "onCue", type: "(cue: CatchCue) => void", description: "Called at each stage (delete, slowmo, shoot, catch, reel, restored, missed) so you can attach your own sound or haptics." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewCatchUndo,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { CatchUndo } from "@/components/catch-undo";

// Delete a file with its bin button, then press Undo (Cmd or Ctrl Z) before it is gone.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[720px]">
        <CatchUndo />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { CatchUndo } from "@/components/catch-undo";

// autoplay deletes a file and catches it, then deletes another and misses it, until a real pointer moves in.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[720px] bg-[#f5f5f7] p-6">
      <CatchUndo autoplay />
    </div>
  );
}`,
      },
      {
        title: "With cues",
        code: `// src/app/page.tsx
"use client";

import { CatchUndo, type CatchCue } from "@/components/catch-undo";

// onCue fires at every stage, so a sound or haptic layer can follow the scene.
export default function Page() {
  const onCue = (cue: CatchCue) => console.log(cue);
  return (
    <div className="mx-auto w-full max-w-[720px] bg-[#f5f5f7] p-6">
      <CatchUndo slowHand onCue={onCue} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "global-deploy",
    name: "Global Deploy",
    registryCliName: "global-deploy",
    description:
      "A deploy map drawn on real coastlines. Press Deploy, or click anywhere to ship from the nearest region: the release leaves as glowing blue arcs that spread from region to region until every one is live, and hovering a region shows its latency. Canvas arcs on a dotted world, with keyboard control, a live region that announces progress and no dependencies beyond Framer Motion.",
    categorySlug: "dashboards",
    tags: ["deploy", "map", "world", "regions", "arcs", "latency", "canvas", "dashboard", "devops", "sound", "autoplay", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 185,
    createdAt: "2026-10-25",
    animationKinds: ["press", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewGlobalDeploy,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { GlobalDeploy } from "@/components/global-deploy";

// Press Deploy, or click anywhere on the map to ship from the nearest region. Hover a region to see its latency.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[760px]">
        <GlobalDeploy />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { GlobalDeploy } from "@/components/global-deploy";

// autoplay ships a release, lets the arcs reach every region, then resets, until the visitor touches the map.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[760px] bg-[#f5f5f7] p-6">
      <GlobalDeploy autoplay />
    </div>
  );
}`,
      },
      {
        title: "Silent",
        code: `// src/app/page.tsx

import { GlobalDeploy } from "@/components/global-deploy";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[760px]">
      <GlobalDeploy enableSound={false} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "card-reader-verify",
    name: "Card Reader Verify",
    registryCliName: "card-reader-verify",
    description:
      "An ID check you do by hand. Drag the card into the reader: the light strip sweeps, the display runs each check, and the card springs back out with a Verified stamp. Insert it flipped and the reader shakes and rejects it. Drag with a mouse or finger, or use the keyboard buttons, in a 3D canvas card that needs only Framer Motion.",
    categorySlug: "inputs-controls",
    tags: ["card", "reader", "verify", "identity", "kyc", "drag", "3d", "canvas", "stamp", "sound", "autoplay", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 184,
    createdAt: "2026-10-25",
    animationKinds: ["drag", "spring", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewCardReaderVerify,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { CardReaderVerify } from "@/components/card-reader-verify";

// Drag the card into the reader. Insert it face up to verify it, or flipped to see it rejected.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[440px]">
        <CardReaderVerify />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { CardReaderVerify } from "@/components/card-reader-verify";

// autoplay inserts the card, runs the checks and shows the Verified stamp, until the visitor touches it.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px] bg-[#f5f5f7] p-6">
      <CardReaderVerify autoplay />
    </div>
  );
}`,
      },
      {
        title: "Silent",
        code: `// src/app/page.tsx

import { CardReaderVerify } from "@/components/card-reader-verify";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <CardReaderVerify enableSound={false} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "intelligence-glow",
    name: "Intelligence Glow",
    registryCliName: "intelligence-glow",
    description:
      "Press and hold the screen to call the assistant. Light ripples out from your finger and flows around the edge of a phone, a Writing Tools panel rises, and the draft shimmers and rewrites itself word by word. Built from layered conic gradients on a canvas, with hold-to-call by pointer or keyboard.",
    categorySlug: "ai-components",
    tags: ["ai", "assistant", "glow", "gradient", "writing tools", "hold", "phone", "canvas", "siri", "sound", "autoplay", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 183,
    createdAt: "2026-10-25",
    animationKinds: ["press", "gradient"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewIntelligenceGlow,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { IntelligenceGlow } from "@/components/intelligence-glow";

// Press and hold the screen (or hold Space) to call the assistant, then pick a rewrite.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[300px]">
        <IntelligenceGlow />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { IntelligenceGlow } from "@/components/intelligence-glow";

// autoplay holds the screen, picks a rewrite and lets the draft rewrite itself, until the visitor touches the phone.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[300px] bg-[#f5f5f7] p-6">
      <IntelligenceGlow autoplay />
    </div>
  );
}`,
      },
      {
        title: "Silent",
        code: `// src/app/page.tsx

import { IntelligenceGlow } from "@/components/intelligence-glow";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <IntelligenceGlow enableSound={false} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "cloud-sync",
    name: "Cloud Sync",
    registryCliName: "cloud-sync",
    description:
      "A backup button shaped like a glass cloud. Press it and the apps leave their orbit one by one and sink into the cloud, which wobbles with each one as a level of coloured light rises inside. A soft-body canvas with a 3D orbit, a progress readout and keyboard support.",
    categorySlug: "loaders",
    tags: ["sync", "backup", "cloud", "button", "progress", "glass", "soft body", "canvas", "3d", "sound", "autoplay", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 182,
    createdAt: "2026-10-25",
    animationKinds: ["press", "spring", "3d"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewCloudSync,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { CloudSync } from "@/components/cloud-sync";

// Press the cloud to start the backup. Press it again when it finishes to run it once more.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[480px]">
        <CloudSync />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { CloudSync } from "@/components/cloud-sync";

// autoplay runs the backup and restarts it, until the visitor touches the cloud.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[480px] bg-[#f5f5f7] p-6">
      <CloudSync autoplay />
    </div>
  );
}`,
      },
      {
        title: "Silent",
        code: `// src/app/page.tsx

import { CloudSync } from "@/components/cloud-sync";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[480px]">
      <CloudSync enableSound={false} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "smart-light",
    name: "Smart Light",
    registryCliName: "smart-light",
    description:
      "A light control with a real room behind it. Drag the pill to dim the glass pendant, slide from amber to cool white, or tap a scene: the bulb, the wall falloff and the shadows all respond, and the lamp sways. Canvas lighting with pointer and keyboard control.",
    categorySlug: "inputs-controls",
    tags: ["light", "lamp", "dimmer", "smart home", "slider", "scenes", "canvas", "lighting", "sound", "autoplay", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 181,
    createdAt: "2026-10-25",
    animationKinds: ["drag", "press"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewSmartLight,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { SmartLight } from "@/components/smart-light";

// Drag the pill to dim, slide the colour from amber to cool white, or tap a scene.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[440px]">
        <SmartLight />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { SmartLight } from "@/components/smart-light";

// autoplay dims the light, shifts its colour and cycles the scenes, until the visitor touches it.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px] bg-[#f5f5f7] p-6">
      <SmartLight autoplay />
    </div>
  );
}`,
      },
      {
        title: "Silent",
        code: `// src/app/page.tsx

import { SmartLight } from "@/components/smart-light";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <SmartLight enableSound={false} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "range-calendar",
    name: "Range Calendar",
    registryCliName: "range-calendar",
    description:
      "A trip date picker whose selection is one liquid ribbon. Drag and it stretches to your finger, snapping day by day and wrapping across rows; the nights count rolls like an odometer and months turn like the faces of a cube. SVG ribbon with spring physics and full keyboard control.",
    categorySlug: "inputs-controls",
    tags: ["calendar", "date range", "picker", "ribbon", "dates", "booking", "svg", "spring", "drag", "sound", "autoplay", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 180,
    createdAt: "2026-10-25",
    animationKinds: ["drag", "spring", "layout"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewRangeCalendar,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { RangeCalendar } from "@/components/range-calendar";

// Drag across the days to stretch the ribbon, or use the arrow keys. Use the arrows to turn the month.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[440px]">
        <RangeCalendar />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { RangeCalendar } from "@/components/range-calendar";

// autoplay drags out a trip, changes it and turns the month, until the visitor touches the calendar.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px] bg-[#f5f5f7] p-6">
      <RangeCalendar autoplay />
    </div>
  );
}`,
      },
      {
        title: "Silent",
        code: `// src/app/page.tsx

import { RangeCalendar } from "@/components/range-calendar";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <RangeCalendar enableSound={false} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "storage-clean",
    name: "Storage Clean",
    registryCliName: "storage-clean",
    description:
      "A storage panel you can clean. Press a recommendation and that slice of the bar crumbles into particles that stream into the trash can; the bar springs shut, the number rolls down, and Undo pours the particles back. Canvas particles synced to a spring-driven bar.",
    categorySlug: "dashboards",
    tags: ["storage", "clean", "disk", "particles", "trash", "undo", "dashboard", "canvas", "sound", "autoplay", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 179,
    createdAt: "2026-10-25",
    animationKinds: ["press", "spring"],
    dependencies: ["framer-motion"],
    props: [
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewStorageClean,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { StorageClean } from "@/components/storage-clean";

// Press a recommendation to clean it up. Undo pours the particles back.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[440px]">
        <StorageClean />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { StorageClean } from "@/components/storage-clean";

// autoplay cleans a slice, undoes it and cleans another, until the visitor touches the panel.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px] bg-[#f5f5f7] p-6">
      <StorageClean autoplay />
    </div>
  );
}`,
      },
      {
        title: "Silent",
        code: `// src/app/page.tsx

import { StorageClean } from "@/components/storage-clean";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <StorageClean enableSound={false} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
  {
    slug: "ring-gallery",
    name: "Ring Gallery",
    registryCliName: "ring-gallery",
    description:
      "A ring of photos standing on edge like the leaves of a turbine. Scroll, swipe or drag and it spins, glides and settles; move around it and the camera tilts and swings with your hand. Hover a photo and it rises out of the ring into the corner with its title, click it and that photo grows into a full entry page with links to the previous and next entry. Pure CSS 3D with spring-eased motion, keyboard control, and sounds that follow the ring: a tick per card, a thud as it settles, a whoosh as it spins in.",
    categorySlug: "three-d-components",
    tags: ["gallery", "photo", "ring", "carousel", "3d", "turbine", "scroll", "drag", "parallax", "portfolio", "sound", "autoplay", "motion kit", "framer-motion"],
    premium: true,
    trendingScore: 186,
    createdAt: "2026-10-28",
    animationKinds: ["scroll", "drag", "3d", "spring", "hover"],
    dependencies: ["framer-motion"],
    props: [
      { name: "items", type: "RingItem[]", description: "The photos: { src, title, date?, summary?, sections? }. src can be a URL or a data: URI. A card without a src draws a soft gradient plate, so the default works with no image files." },
      { name: "count", type: "number", description: "Cards in the ring, 12 to 120. Defaults to your photos repeated to about 60." },
      { name: "radius", type: "number", defaultValue: "1", description: "Size of the ring, 0.4 to 1.3. Smaller pulls the cards in, larger spreads them out." },
      { name: "cardSize", type: "number", defaultValue: "1", description: "Size of each card, 0.4 to 2. Bigger cards overlap more." },
      { name: "speed", type: "number", defaultValue: "1", description: "How far the ring turns for each scroll or drag, 0.2 to 4." },
      { name: "glide", type: "number", defaultValue: "1", description: "How long the ring keeps gliding after you let go, 0.25 to 4. Higher glides further." },
      { name: "tilt", type: "number", defaultValue: "1", description: "How far the camera follows the pointer, 0 to 3. 0 keeps the camera still." },
      { name: "enableSound", type: "boolean", defaultValue: "true", description: "Plays the ring's sounds: ticks, a thud when it settles, whooshes. They follow the visitor's sound switch, which is off until switched on." },
      { name: "autoplay", type: "boolean", defaultValue: "false", description: "Drifts the camera on its own until the visitor touches it. Off by default, so a copied component reacts only to the visitor. Never runs under reduced motion." },
      { name: "intro", type: "boolean", defaultValue: "true", description: "Spins in with two turns the first time the ring scrolls into view." },
      { name: "captureWheel", type: "boolean", defaultValue: "true", description: "Scrolling over the ring turns it and keeps the page still. Set false to turn it and still scroll the page." },
      { name: "detail", type: "boolean", defaultValue: "true", description: "Opens the built-in entry page when a photo is clicked. Set false to handle onSelect yourself." },
      { name: "onSelect", type: "(item: RingItem, index: number) => void", description: "Called when a photo is clicked or opened with Enter." },
      { name: "className", type: "string", description: "Extra classes for the outer card." },
    ],
    Preview: Previews.PreviewRingGallery,
    previewShell: "plain",
    reactSource: `// src/app/page.tsx

import { RingGallery } from "@/components/ring-gallery";

// Scroll, swipe or drag to turn the ring. Move around it to tilt, click a photo to open it.
export default function Page() {
  return (
    <section className="bg-[#f5f5f7] px-4 py-16">
      <div className="mx-auto w-full max-w-[820px]">
        <RingGallery />
      </div>
    </section>
  );
}`,
    reactExamples: [
      {
        title: "Your own photos",
        code: `// src/app/page.tsx

import { RingGallery, type RingItem } from "@/components/ring-gallery";

const photos: RingItem[] = [
  { src: "/photos/bay.jpg", title: "Bays at Dusk", date: "Oct 24, 2026", summary: "Warm light drains out of a ridge of bare hills." },
  { src: "/photos/glacier.jpg", title: "Glacier in Cloud", date: "Oct 19, 2026", summary: "A tongue of blue ice between black rock walls." },
  { src: "/photos/shore.jpg", title: "Shoreline from Above", date: "Oct 11, 2026", summary: "Green water meets wet sand in a line of foam." },
];

// Eight or more photos fill the ring best. They repeat around it until it holds about 60 cards.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[820px] bg-[#f5f5f7] p-6">
      <RingGallery items={photos} />
    </div>
  );
}`,
      },
      {
        title: "Tune the feel",
        code: `// src/app/page.tsx

import { RingGallery } from "@/components/ring-gallery";

// A tighter ring of bigger cards that turns quickly, glides a long way and keeps the camera still.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[820px] bg-[#f5f5f7] p-6">
      <RingGallery radius={0.8} cardSize={1.3} speed={1.5} glide={2} tilt={0} count={36} />
    </div>
  );
}`,
      },
      {
        title: "Plays by itself",
        code: `// src/app/page.tsx

import { RingGallery } from "@/components/ring-gallery";

// autoplay drifts the camera round the ring until the visitor touches it.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[820px] bg-[#f5f5f7] p-6">
      <RingGallery autoplay />
    </div>
  );
}`,
      },
      {
        title: "Handle the click yourself",
        code: `// src/app/page.tsx
"use client";

import { RingGallery } from "@/components/ring-gallery";

// detail={false} skips the built-in entry page; onSelect tells you which photo was picked.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <RingGallery detail={false} onSelect={(item, index) => console.log(index, item.title)} />
    </div>
  );
}`,
      },
      {
        title: "Silent",
        code: `// src/app/page.tsx

import { RingGallery } from "@/components/ring-gallery";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <RingGallery enableSound={false} />
    </div>
  );
}`,
      },
    ],
    tailwindSource: tw,
  },
];

/** Components that make sound get the `enableSound` prop documented, so every page stays true to its source. */
export const libraryComponents: LibraryComponent[] = baseLibraryComponents.map((c) =>
  COMPONENT_SOUNDS[c.slug] && !c.props?.some((p) => p.name === ENABLE_SOUND_PROP.name)
    ? { ...c, props: [...(c.props ?? []), { ...ENABLE_SOUND_PROP }] }
    : c,
);

export function getLibraryComponent(slugOrRegistryName: string) {
  return (
    libraryComponents.find(
      (component) =>
        component.slug === slugOrRegistryName ||
        component.registryCliName === slugOrRegistryName,
    ) ?? null
  );
}

/** Server-only: resolve a Preview ComponentType to its export name in component-previews.tsx */
export function getPreviewExportName(
  preview: ComponentType<{ compact?: boolean }> | null | undefined,
): string {
  if (!preview) return "";
  for (const [key, val] of Object.entries(Previews)) {
    if (val === preview) return key;
  }
  return "";
}
