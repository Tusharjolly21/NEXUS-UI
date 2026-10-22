/**
 * The video catalogue: eight vertical (1080×1920) videos, each a React component that is a pure
 * function of time, with its own soundtrack. This file is metadata only (it is safe to import from
 * server code); the animation lives in `src/components/videos/<slug>.tsx`, the prompt and the
 * downloadable source in `content/videos/<slug>/` (served only through the gated route).
 *
 * `defaults` here are the design's own copy. Pages that show numbers or prices call
 * `videoDefaults()` (see `video-defaults.ts`), which swaps in the live catalogue counts and plan
 * prices so a video never advertises a stale "183 components".
 */

export type VideoField =
  | { key: string; label: string; type: "text"; max?: number }
  | { key: string; label: string; type: "color" }
  | { key: string; label: string; type: "number"; min: number; max: number; step?: number };

export type VideoEntry = {
  slug: string;
  title: string;
  /** What the video is for, e.g. "Product launch". */
  purpose: string;
  /** The animation idea in a few words. */
  motion: string;
  /** The app it was made for. */
  app: string;
  /** Seconds. */
  duration: number;
  bpm: number;
  /** Seconds where the picture cuts; the soundtrack hits on these. */
  cuts: number[];
  blurb: string;
  /** Pro unlocks the prompt, the source, live editing and the render script. */
  premium: boolean;
  dark: boolean;
  createdAt: string;
  /** The second shown as the still image before it plays. */
  posterAt: number;
  defaults: Record<string, string>;
  fields: VideoField[];
};

export const videos: VideoEntry[] = [
  {
    "slug": "launch-reel",
    "title": "Launch Reel",
    "purpose": "Product launch",
    "motion": "Type match-cut into the live site",
    "app": "Nexus UI",
    "duration": 12,
    "bpm": 120,
    "cuts": [
      2,
      4.5,
      7.5,
      10
    ],
    "blurb": "Big words swap on the beat, then shrink onto your real homepage headline. The site scrolls past, your best pieces cascade in, and it lands on the logo.",
    "premium": false,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 3.2,
    "defaults": {
      "words": "landing page, dashboard, pricing page, portfolio",
      "caption": "Motion, ready to paste.",
      "shelves": "Components. Blocks. Templates.",
      "stat": "183 animated components.",
      "sub": "Each with its own physics.",
      "brand": "Nexus UI",
      "url": "nexus-ui.com",
      "pill": "Free to start · React + Motion"
    },
    "fields": [
      {
        "key": "words",
        "label": "Intro words (comma separated)",
        "type": "text"
      },
      {
        "key": "caption",
        "label": "Caption over the site",
        "type": "text",
        "max": 30
      },
      {
        "key": "shelves",
        "label": "Caption while scrolling",
        "type": "text",
        "max": 32
      },
      {
        "key": "stat",
        "label": "Headline over the tiles",
        "type": "text",
        "max": 28
      },
      {
        "key": "sub",
        "label": "Line under it",
        "type": "text",
        "max": 40
      },
      {
        "key": "brand",
        "label": "Name on the end card",
        "type": "text",
        "max": 14
      },
      {
        "key": "url",
        "label": "Address",
        "type": "text",
        "max": 22
      },
      {
        "key": "pill",
        "label": "End card pill",
        "type": "text",
        "max": 34
      }
    ]
  },
  {
    "slug": "manifesto",
    "title": "Kinetic Manifesto",
    "purpose": "Brand hook",
    "motion": "Kinetic type with live UI inside the words",
    "app": "Nexus UI",
    "duration": 10,
    "bpm": 120,
    "cuts": [
      1,
      1.5,
      2.5,
      3,
      4,
      4.5,
      6.5,
      7,
      7.5,
      8
    ],
    "blurb": "The scroll-stopper. Keynote-black kinetic type where the key word in each line is a real working component: a button that gets pressed, digits that roll, a switch that flips, text that types itself.",
    "premium": false,
    "dark": true,
    "createdAt": "2026-10-22",
    "posterAt": 3.5,
    "defaults": {
      "l1": "Buttons that",
      "btn": "press",
      "l1b": "back.",
      "l2": "Numbers that",
      "num": "128",
      "l2b": "roll.",
      "l3": "Switches that",
      "l3b": "flip.",
      "l4": "Text that",
      "typed": "types itself.",
      "slams": "Copy. Paste. Ship.",
      "url": "nexus-ui.com",
      "sub": "Motion you can copy and paste."
    },
    "fields": [
      {
        "key": "l1",
        "label": "Line 1",
        "type": "text",
        "max": 14
      },
      {
        "key": "btn",
        "label": "Button label",
        "type": "text",
        "max": 7
      },
      {
        "key": "l1b",
        "label": "Line 1 ending",
        "type": "text",
        "max": 8
      },
      {
        "key": "l2",
        "label": "Line 2",
        "type": "text",
        "max": 14
      },
      {
        "key": "num",
        "label": "Rolling number",
        "type": "text",
        "max": 4
      },
      {
        "key": "l2b",
        "label": "Line 2 ending",
        "type": "text",
        "max": 8
      },
      {
        "key": "l3",
        "label": "Line 3",
        "type": "text",
        "max": 14
      },
      {
        "key": "l3b",
        "label": "Line 3 ending",
        "type": "text",
        "max": 8
      },
      {
        "key": "l4",
        "label": "Line 4",
        "type": "text",
        "max": 14
      },
      {
        "key": "typed",
        "label": "Typed words",
        "type": "text",
        "max": 14
      },
      {
        "key": "slams",
        "label": "Three slam words",
        "type": "text",
        "max": 30
      },
      {
        "key": "url",
        "label": "Address",
        "type": "text",
        "max": 18
      },
      {
        "key": "sub",
        "label": "Line under it",
        "type": "text",
        "max": 34
      }
    ]
  },
  {
    "slug": "price-reveal",
    "title": "Price Reveal",
    "purpose": "Pricing & offers",
    "motion": "Odometer counts into a ledger",
    "app": "Nexus UI",
    "duration": 10,
    "bpm": 120,
    "cuts": [
      0.5,
      1.5,
      2.5,
      3.5,
      5.5,
      8
    ],
    "blurb": "Show what people get before you say the price. Each number rolls in like an odometer on the beat and files itself into a ledger, then the price spins into place like a slot reel.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 7.0,
    "defaults": {
      "intro": "Everything in Pro.",
      "items": "183 components, 92 blocks, 22 templates, 24 sounds",
      "extra": "+ everything we release next",
      "price": "$79.99",
      "once": "once, for everything.",
      "alt": "or $49.99 a year",
      "brand": "Nexus UI Pro",
      "url": "nexus-ui.com",
      "pill": "68 components free to try"
    },
    "fields": [
      {
        "key": "intro",
        "label": "Opening line",
        "type": "text",
        "max": 24
      },
      {
        "key": "items",
        "label": "What you get (number + word, comma separated, 4 max)",
        "type": "text"
      },
      {
        "key": "extra",
        "label": "Extra ledger line",
        "type": "text",
        "max": 32
      },
      {
        "key": "price",
        "label": "Price",
        "type": "text",
        "max": 8
      },
      {
        "key": "once",
        "label": "Under the price",
        "type": "text",
        "max": 26
      },
      {
        "key": "alt",
        "label": "Second option",
        "type": "text",
        "max": 24
      },
      {
        "key": "brand",
        "label": "End card name",
        "type": "text",
        "max": 16
      },
      {
        "key": "url",
        "label": "Address",
        "type": "text",
        "max": 22
      },
      {
        "key": "pill",
        "label": "End card pill",
        "type": "text",
        "max": 30
      }
    ]
  },
  {
    "slug": "whats-new",
    "title": "What's New",
    "purpose": "Changelog & updates",
    "motion": "Split-flap month, beam timeline, live mini demos",
    "app": "Nexus UI",
    "duration": 10,
    "bpm": 120,
    "cuts": [
      0.6,
      2,
      3,
      4,
      5,
      6,
      7.75
    ],
    "blurb": "Your monthly update without a wall of text. The month flips like a departures board, a beam draws down a timeline and each release lands on the beat with a tiny live demo of itself.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 6.5,
    "defaults": {
      "kicker": "What's new in Nexus UI",
      "from": "September",
      "to": "October",
      "count": "121",
      "countWord": "new components",
      "item1": "Slide to Confirm | Drag to confirm | Pro",
      "item2": "Cursor Buddy | Follows your pointer | Pro",
      "item3": "Toast Stack | Stacks, then fans out | Free",
      "item4": "Dynamic Island | Morphs with what's on | Pro",
      "more": "+117 more",
      "url": "nexus-ui.com",
      "pill": "Pro gets every release"
    },
    "fields": [
      {
        "key": "kicker",
        "label": "Kicker",
        "type": "text",
        "max": 26
      },
      {
        "key": "from",
        "label": "Last month",
        "type": "text",
        "max": 10
      },
      {
        "key": "to",
        "label": "This month",
        "type": "text",
        "max": 10
      },
      {
        "key": "count",
        "label": "How many",
        "type": "text",
        "max": 4
      },
      {
        "key": "countWord",
        "label": "Of what",
        "type": "text",
        "max": 18
      },
      {
        "key": "item1",
        "label": "Release 1 (name | line | tag)",
        "type": "text"
      },
      {
        "key": "item2",
        "label": "Release 2",
        "type": "text"
      },
      {
        "key": "item3",
        "label": "Release 3",
        "type": "text"
      },
      {
        "key": "item4",
        "label": "Release 4",
        "type": "text"
      },
      {
        "key": "more",
        "label": "More chip",
        "type": "text",
        "max": 12
      },
      {
        "key": "url",
        "label": "Address",
        "type": "text",
        "max": 22
      },
      {
        "key": "pill",
        "label": "End card pill",
        "type": "text",
        "max": 26
      }
    ]
  },
  {
    "slug": "feature-drop",
    "title": "Feature Drop",
    "purpose": "Feature announcement",
    "motion": "3D carousel re-skins in a wave",
    "app": "MockFrame",
    "duration": 10,
    "bpm": 120,
    "cuts": [
      2,
      3.3,
      4.75,
      5.75,
      6.75,
      7.5
    ],
    "blurb": "Announce one feature and show it working. A brand kit slides up, a cursor clicks Apply, and every screenshot in a 3D carousel repaints in a wave, then spins on the beat.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 6.0,
    "defaults": {
      "app": "MockFrame",
      "feature": "Brand kits.",
      "line": "Your brand on every screenshot.",
      "brandName": "Tidepool",
      "c1": "#ff6a3d",
      "c2": "#ffeadb",
      "c3": "#1b1f3b",
      "spinLine": "Every screenshot. One click.",
      "url": "mockframe.app",
      "pill": "New · Brand kits"
    },
    "fields": [
      {
        "key": "app",
        "label": "App name",
        "type": "text",
        "max": 14
      },
      {
        "key": "feature",
        "label": "Feature name",
        "type": "text",
        "max": 16
      },
      {
        "key": "line",
        "label": "One-line benefit",
        "type": "text",
        "max": 34
      },
      {
        "key": "brandName",
        "label": "Sample brand",
        "type": "text",
        "max": 14
      },
      {
        "key": "c1",
        "label": "Brand colour",
        "type": "color"
      },
      {
        "key": "c2",
        "label": "Light colour",
        "type": "color"
      },
      {
        "key": "c3",
        "label": "Ink colour",
        "type": "color"
      },
      {
        "key": "spinLine",
        "label": "Line during the spin",
        "type": "text",
        "max": 32
      },
      {
        "key": "url",
        "label": "Address",
        "type": "text",
        "max": 22
      },
      {
        "key": "pill",
        "label": "End card pill",
        "type": "text",
        "max": 24
      }
    ]
  },
  {
    "slug": "app-walkthrough",
    "title": "App Walkthrough",
    "purpose": "Product demo",
    "motion": "Cursor-driven UI with auto-zoom camera",
    "app": "FormMe",
    "duration": 12,
    "bpm": 120,
    "cuts": [
      1.5,
      2,
      2.5,
      3.8,
      4.5,
      6,
      6.5,
      10
    ],
    "blurb": "A screen-recording look without recording anything. A cursor builds a form while the camera zooms to wherever it's working, publishes it, and the responses start pouring in.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 7.0,
    "defaults": {
      "app": "FormMe",
      "hook": "Forms people\nactually finish.",
      "formTitle": "Launch party RSVP",
      "formDesc": "Friday the 14th · rooftop",
      "label": "Your email",
      "responses": "248",
      "accent": "#5e5ce6",
      "tagline": "Build it, share it, watch it fill.",
      "url": "Link in bio"
    },
    "fields": [
      {
        "key": "app",
        "label": "App name",
        "type": "text",
        "max": 12
      },
      {
        "key": "hook",
        "label": "Opening line (\\n for a break)",
        "type": "text",
        "max": 40
      },
      {
        "key": "formTitle",
        "label": "Form title",
        "type": "text",
        "max": 22
      },
      {
        "key": "formDesc",
        "label": "Form description",
        "type": "text",
        "max": 28
      },
      {
        "key": "label",
        "label": "Typed question",
        "type": "text",
        "max": 16
      },
      {
        "key": "responses",
        "label": "Response count",
        "type": "text",
        "max": 5
      },
      {
        "key": "accent",
        "label": "Accent colour",
        "type": "color"
      },
      {
        "key": "tagline",
        "label": "End card line",
        "type": "text",
        "max": 36
      },
      {
        "key": "url",
        "label": "Address or CTA",
        "type": "text",
        "max": 22
      }
    ]
  },
  {
    "slug": "route-story",
    "title": "Route Story",
    "purpose": "Travel & creators",
    "motion": "Route draws with a follow camera",
    "app": "Routecast",
    "duration": 10,
    "bpm": 100,
    "cuts": [
      1.2,
      3,
      5.4,
      7.2,
      8.4
    ],
    "blurb": "A trip told as one line. The camera rides along as the route draws itself across a soft map, stops pop up with the day, a distance counter rolls, then it pulls back to show the whole journey.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 6.0,
    "defaults": {
      "title": "Tokyo to Osaka.",
      "stop1": "Tokyo",
      "stop2": "Hakone",
      "stop3": "Kyoto",
      "stop4": "Osaka",
      "note2": "Day 2 · Lake Ashi",
      "note3": "Day 3 · Gion at night",
      "note4": "Day 4 · Dotonbori",
      "km": "515",
      "app": "Routecast",
      "line": "Your trip, as a video.",
      "url": "Link in bio",
      "accent": "#0a84ff"
    },
    "fields": [
      {
        "key": "title",
        "label": "Opening title",
        "type": "text",
        "max": 18
      },
      {
        "key": "stop1",
        "label": "Start",
        "type": "text",
        "max": 12
      },
      {
        "key": "stop2",
        "label": "Stop 2",
        "type": "text",
        "max": 12
      },
      {
        "key": "stop3",
        "label": "Stop 3",
        "type": "text",
        "max": 12
      },
      {
        "key": "stop4",
        "label": "End",
        "type": "text",
        "max": 12
      },
      {
        "key": "note2",
        "label": "Stop 2 note",
        "type": "text",
        "max": 22
      },
      {
        "key": "note3",
        "label": "Stop 3 note",
        "type": "text",
        "max": 22
      },
      {
        "key": "note4",
        "label": "End note",
        "type": "text",
        "max": 22
      },
      {
        "key": "km",
        "label": "Total distance (km)",
        "type": "text",
        "max": 5
      },
      {
        "key": "accent",
        "label": "Route colour",
        "type": "color"
      },
      {
        "key": "app",
        "label": "App name",
        "type": "text",
        "max": 12
      },
      {
        "key": "line",
        "label": "End card line",
        "type": "text",
        "max": 26
      },
      {
        "key": "url",
        "label": "Address or CTA",
        "type": "text",
        "max": 22
      }
    ]
  },
  {
    "slug": "teaser",
    "title": "Coming Soon Teaser",
    "purpose": "Waitlist & teasers",
    "motion": "Live multiplayer canvas folds into a logo",
    "app": "DrawDocs",
    "duration": 10,
    "bpm": 120,
    "cuts": [
      0.5,
      1,
      1.5,
      2,
      2.5,
      3,
      4.5,
      5,
      7.5
    ],
    "blurb": "Tease a product by showing how it feels. Three named cursors build a diagram on a dot grid, on the beat, then every node folds into your logo and the name snaps into place letter by letter.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 6.0,
    "defaults": {
      "n1": "Idea",
      "n2": "Sketch",
      "n3": "Diagram",
      "n4": "Doc",
      "n5": "Share",
      "sticky": "ship it?",
      "app": "DrawDocs",
      "line": "Diagrams and docs, together.",
      "soon": "Coming soon",
      "cta": "Join the waitlist · Link in bio",
      "c1": "#ff375f",
      "c2": "#ff9f0a"
    },
    "fields": [
      {
        "key": "n1",
        "label": "Node 1",
        "type": "text",
        "max": 10
      },
      {
        "key": "n2",
        "label": "Node 2",
        "type": "text",
        "max": 10
      },
      {
        "key": "n3",
        "label": "Node 3",
        "type": "text",
        "max": 10
      },
      {
        "key": "n4",
        "label": "Node 4",
        "type": "text",
        "max": 10
      },
      {
        "key": "n5",
        "label": "Node 5",
        "type": "text",
        "max": 10
      },
      {
        "key": "sticky",
        "label": "Sticky note",
        "type": "text",
        "max": 12
      },
      {
        "key": "app",
        "label": "Product name",
        "type": "text",
        "max": 10
      },
      {
        "key": "line",
        "label": "Line under the name",
        "type": "text",
        "max": 32
      },
      {
        "key": "soon",
        "label": "Status chip",
        "type": "text",
        "max": 16
      },
      {
        "key": "cta",
        "label": "Call to action",
        "type": "text",
        "max": 34
      },
      {
        "key": "c1",
        "label": "Brand colour",
        "type": "color"
      },
      {
        "key": "c2",
        "label": "Second colour",
        "type": "color"
      }
    ]
  }
];

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;

export function getVideo(slug: string): VideoEntry | undefined {
  return videos.find((v) => v.slug === slug);
}

/** Where the pre-rendered silent loop, the still and the soundtrack live (all under public/). */
export const videoPreviewSrc = (slug: string) => `/videos/previews/${slug}.mp4`;
export const videoPosterSrc = (slug: string) => `/videos/previews/${slug}.jpg`;
export const videoAudioSrc = (slug: string) => `/videos/audio/${slug}.mp3`;

export const VIDEO_PARTS = ["prompt", "source", "kit", "frame", "render"] as const;
export type VideoPart = (typeof VIDEO_PARTS)[number];
