/**
 * The video catalogue: fifteen videos, each a React component that is a pure function of time, drawn
 * on a fixed canvas for each shape it supports (9:16, 1:1, 16:9 and more), with its own soundtrack. This file is metadata only (it is safe to import from
 * server code); the animation lives in `src/components/videos/<slug>.tsx`, the prompt and the
 * downloadable source in `content/videos/<slug>/` (served only through the gated route).
 *
 * `defaults` here are the design's own copy. Pages that show numbers or prices call
 * `videoDefaults()` (see `video-defaults.ts`), which swaps in the live catalogue counts and plan
 * prices so a video never advertises a stale "183 components".
 */

export type FormatId = "9:16" | "4:5" | "1:1" | "16:9" | "app" | "21:9";
export type VideoFormat = { id: FormatId; w: number; h: number; label: string; where: string };
export const FORMATS: Record<FormatId, VideoFormat> = {
  "9:16": { id: "9:16", w: 1080, h: 1920, label: "9:16", where: "Reels, TikTok, Shorts" },
  "4:5": { id: "4:5", w: 1080, h: 1350, label: "4:5", where: "LinkedIn, Instagram feed" },
  "1:1": { id: "1:1", w: 1080, h: 1080, label: "1:1", where: "X, LinkedIn" },
  "16:9": { id: "16:9", w: 1920, h: 1080, label: "16:9", where: "YouTube, X, Product Hunt" },
  app: { id: "app", w: 886, h: 1920, label: "App Store", where: "App Store preview (6.9in)" },
  "21:9": { id: "21:9", w: 2520, h: 1080, label: "21:9", where: "Website hero" },
};

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
  /** Where it is meant to be posted, e.g. ["YouTube", "X"]. */
  platforms: string[];
  /** The shapes it renders in; the first is the default. */
  formats: FormatId[];
  /** A seamless loop (a website background): no intro or end card, frame 0 equals the last frame. */
  loop?: boolean;
  /** Has no soundtrack. */
  silent?: boolean;
  /** Its source imports the shared `parts.tsx` (odometer, cursor), shipped with it. */
  parts?: boolean;
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
    "platforms": [
      "Reels",
      "TikTok",
      "Shorts"
    ],
    "formats": [
      "9:16"
    ],
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
    "platforms": [
      "Reels",
      "TikTok",
      "Shorts"
    ],
    "formats": [
      "9:16"
    ],
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
    "slug": "install-seconds",
    "title": "Install in Seconds",
    "purpose": "Developer demo",
    "motion": "Terminal, editor and live preview hand off to each other",
    "app": "Nexus UI",
    "platforms": [
      "X",
      "LinkedIn",
      "YouTube",
      "Shorts"
    ],
    "formats": [
      "1:1",
      "16:9",
      "9:16"
    ],
    "duration": 12,
    "bpm": 120,
    "cuts": [
      1,
      3,
      4.4,
      5,
      7.4,
      8,
      9.6,
      10.4
    ],
    "blurb": "The developer pitch in twelve seconds. The install command types itself, the CLI ticks through its checks, the new file flies into the editor, the import and one line of JSX type in, and the preview shows the component working under a real cursor.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 9.5,
    "defaults": {
      "title": "Add motion in one line.",
      "pkg": "@nexus-labs/slide-to-confirm",
      "file": "components/ui/slide-to-confirm.tsx",
      "name": "SlideToConfirm",
      "label": "Slide to pay $49.99",
      "done": "Payment confirmed",
      "url": "nexus-ui.com",
      "sub": "183 components. One command each."
    },
    "fields": [
      {
        "key": "title",
        "label": "Opening line",
        "type": "text",
        "max": 26
      },
      {
        "key": "pkg",
        "label": "Registry item",
        "type": "text",
        "max": 40
      },
      {
        "key": "file",
        "label": "File it creates",
        "type": "text",
        "max": 44
      },
      {
        "key": "name",
        "label": "Component name",
        "type": "text",
        "max": 22
      },
      {
        "key": "label",
        "label": "Slider label",
        "type": "text",
        "max": 22
      },
      {
        "key": "done",
        "label": "Confirmed text",
        "type": "text",
        "max": 22
      },
      {
        "key": "url",
        "label": "Address",
        "type": "text",
        "max": 22
      },
      {
        "key": "sub",
        "label": "End card line",
        "type": "text",
        "max": 40
      }
    ]
  },
  {
    "slug": "bento-tour",
    "parts": true,
    "title": "Bento Zoom Tour",
    "purpose": "Product overview",
    "motion": "Camera flies into each bento tile and back out",
    "app": "Nexus UI",
    "platforms": [
      "YouTube",
      "Product Hunt",
      "Website",
      "X"
    ],
    "formats": [
      "16:9",
      "1:1",
      "9:16"
    ],
    "duration": 14,
    "bpm": 120,
    "cuts": [
      1,
      2.6,
      3.4,
      5.6,
      8,
      10.4,
      12.6
    ],
    "blurb": "Your whole product as one bento grid, then a camera that dives into each tile until it fills the screen. Inside, every tile is alive: real component shots scroll, a waveform plays, templates shuffle, a terminal types.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 12.4,
    "defaults": {
      "intro": "Everything in Nexus UI.",
      "n1": "183",
      "l1": "animated components",
      "n2": "24",
      "l2": "interface sounds",
      "n3": "22",
      "l3": "complete templates",
      "cmdLine": "One command. It's your code.",
      "pkgs": "price-odometer, slide-to-confirm, gooey-input, dynamic-island",
      "brand": "Nexus UI",
      "url": "nexus-ui.com",
      "pill": "Free to start"
    },
    "fields": [
      {
        "key": "intro",
        "label": "Opening line",
        "type": "text",
        "max": 28
      },
      {
        "key": "n1",
        "label": "Tile 1 number",
        "type": "text",
        "max": 5
      },
      {
        "key": "l1",
        "label": "Tile 1 label",
        "type": "text",
        "max": 22
      },
      {
        "key": "n2",
        "label": "Tile 2 number",
        "type": "text",
        "max": 5
      },
      {
        "key": "l2",
        "label": "Tile 2 label",
        "type": "text",
        "max": 22
      },
      {
        "key": "n3",
        "label": "Tile 3 number",
        "type": "text",
        "max": 5
      },
      {
        "key": "l3",
        "label": "Tile 3 label",
        "type": "text",
        "max": 22
      },
      {
        "key": "cmdLine",
        "label": "Terminal tile line",
        "type": "text",
        "max": 32
      },
      {
        "key": "pkgs",
        "label": "Packages it types (comma separated)",
        "type": "text"
      },
      {
        "key": "brand",
        "label": "Name",
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
        "max": 24
      }
    ]
  },
  {
    "slug": "before-after",
    "parts": true,
    "title": "Before / After",
    "purpose": "Comparison ad",
    "motion": "A wipe that brings the UI to life as it passes",
    "app": "Nexus UI",
    "platforms": [
      "LinkedIn",
      "X",
      "Instagram feed"
    ],
    "formats": [
      "4:5",
      "1:1",
      "16:9"
    ],
    "duration": 10,
    "bpm": 120,
    "cuts": [
      1.5,
      2,
      3.5,
      5,
      6,
      8
    ],
    "blurb": "The same dashboard card twice: a flat static version and the Nexus version. A divider wipes across it and everything it passes wakes up, numbers roll, bars grow, the switch springs on, then it settles on the side that moves.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 3,
    "defaults": {
      "title": "Same UI.",
      "sub": "Different feeling.",
      "metric": "Revenue this month",
      "amount": "48210",
      "delta": "+12.4%",
      "toggle": "Yearly billing",
      "button": "Upgrade plan",
      "after": "Now it moves.",
      "brand": "Nexus UI",
      "url": "nexus-ui.com"
    },
    "fields": [
      {
        "key": "title",
        "label": "Opening line",
        "type": "text",
        "max": 18
      },
      {
        "key": "sub",
        "label": "Second line",
        "type": "text",
        "max": 22
      },
      {
        "key": "metric",
        "label": "Card label",
        "type": "text",
        "max": 22
      },
      {
        "key": "amount",
        "label": "Amount (digits)",
        "type": "text",
        "max": 7
      },
      {
        "key": "delta",
        "label": "Change",
        "type": "text",
        "max": 8
      },
      {
        "key": "toggle",
        "label": "Switch label",
        "type": "text",
        "max": 18
      },
      {
        "key": "button",
        "label": "Button",
        "type": "text",
        "max": 16
      },
      {
        "key": "after",
        "label": "Closing line",
        "type": "text",
        "max": 20
      },
      {
        "key": "brand",
        "label": "Name",
        "type": "text",
        "max": 14
      },
      {
        "key": "url",
        "label": "Address",
        "type": "text",
        "max": 22
      }
    ]
  },
  {
    "slug": "app-store-preview",
    "parts": true,
    "title": "App Store Preview",
    "purpose": "App store listing",
    "motion": "Native iOS pushes, sheets and keypad entry",
    "app": "ClearSplit",
    "platforms": [
      "App Store",
      "Play Store",
      "TikTok"
    ],
    "formats": [
      "app",
      "9:16"
    ],
    "duration": 16,
    "bpm": 110,
    "cuts": [
      2,
      3.9,
      7.7,
      10.6,
      13.4
    ],
    "blurb": "A 16-second app preview that moves like the real thing: a push into the group, a sheet that pushes the screen back, amounts typed on the keypad, avatars toggled into the split, balances rolling, and a settle-up that ends all square.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 8,
    "defaults": {
      "app": "ClearSplit",
      "line": "Split bills with friends.",
      "group": "Goa trip",
      "amount": "3600",
      "what": "Dinner at Thalassa",
      "friend": "Riya",
      "accent": "#12b886",
      "cap1": "Every trip, every flat, every dinner.",
      "cap2": "Add an expense in seconds.",
      "cap3": "Always know who owes what.",
      "cap4": "Settle up in one tap."
    },
    "fields": [
      {
        "key": "app",
        "label": "App name",
        "type": "text",
        "max": 14
      },
      {
        "key": "line",
        "label": "End line",
        "type": "text",
        "max": 30
      },
      {
        "key": "group",
        "label": "Group name",
        "type": "text",
        "max": 14
      },
      {
        "key": "amount",
        "label": "Amount typed (rupees)",
        "type": "text",
        "max": 5
      },
      {
        "key": "what",
        "label": "Expense description",
        "type": "text",
        "max": 22
      },
      {
        "key": "friend",
        "label": "Friend who settles",
        "type": "text",
        "max": 10
      },
      {
        "key": "accent",
        "label": "Accent",
        "type": "color"
      },
      {
        "key": "cap1",
        "label": "Caption 1",
        "type": "text",
        "max": 40
      },
      {
        "key": "cap2",
        "label": "Caption 2",
        "type": "text",
        "max": 40
      },
      {
        "key": "cap3",
        "label": "Caption 3",
        "type": "text",
        "max": 40
      },
      {
        "key": "cap4",
        "label": "Caption 4",
        "type": "text",
        "max": 40
      }
    ]
  },
  {
    "slug": "feature-drop",
    "title": "Feature Drop",
    "purpose": "Feature announcement",
    "motion": "3D carousel re-skins in a wave",
    "app": "MockFrame",
    "platforms": [
      "Reels",
      "TikTok",
      "Shorts"
    ],
    "formats": [
      "9:16"
    ],
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
    "posterAt": 6,
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
    "platforms": [
      "Reels",
      "TikTok",
      "Shorts"
    ],
    "formats": [
      "9:16"
    ],
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
    "posterAt": 7,
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
    "slug": "launch-day",
    "parts": true,
    "title": "Launch Day",
    "purpose": "Launch announcement",
    "motion": "Upvote press bursts into physics confetti",
    "app": "Nexus UI",
    "platforms": [
      "Product Hunt",
      "X",
      "LinkedIn"
    ],
    "formats": [
      "16:9",
      "1:1",
      "9:16"
    ],
    "duration": 10,
    "bpm": 120,
    "cuts": [
      1,
      2,
      3.5,
      5.5,
      8
    ],
    "blurb": "For the morning you launch. The listing card springs in, a cursor presses upvote and the arrow shoots off in a burst of little triangles that fall with real gravity, while your gallery scrolls underneath.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 6,
    "defaults": {
      "where": "Product Hunt",
      "name": "Nexus UI",
      "tagline": "Animated React components you copy and paste",
      "tags": "Design Tools, Developer Tools, Open Source",
      "votes": "",
      "accent": "#ff6154",
      "ask": "We're live on Product Hunt today.",
      "cta": "Search “Nexus UI” on Product Hunt"
    },
    "fields": [
      {
        "key": "where",
        "label": "Where you launched",
        "type": "text",
        "max": 16
      },
      {
        "key": "name",
        "label": "Product name",
        "type": "text",
        "max": 16
      },
      {
        "key": "tagline",
        "label": "Tagline",
        "type": "text",
        "max": 48
      },
      {
        "key": "tags",
        "label": "Topics (comma separated)",
        "type": "text"
      },
      {
        "key": "votes",
        "label": "Upvotes (optional, your real number)",
        "type": "text",
        "max": 5
      },
      {
        "key": "accent",
        "label": "Accent",
        "type": "color"
      },
      {
        "key": "ask",
        "label": "Headline",
        "type": "text",
        "max": 36
      },
      {
        "key": "cta",
        "label": "Call to action",
        "type": "text",
        "max": 40
      }
    ]
  },
  {
    "slug": "price-reveal",
    "title": "Price Reveal",
    "purpose": "Pricing & offers",
    "motion": "Odometer counts into a ledger",
    "app": "Nexus UI",
    "platforms": [
      "Reels",
      "TikTok",
      "Shorts"
    ],
    "formats": [
      "9:16"
    ],
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
    "posterAt": 7,
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
    "platforms": [
      "Reels",
      "TikTok",
      "Shorts"
    ],
    "formats": [
      "9:16"
    ],
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
    "slug": "logo-bumper",
    "title": "Logo Bumper",
    "purpose": "Channel intro & outro",
    "motion": "The mark draws itself, then locks up with the name",
    "app": "Nexus UI",
    "platforms": [
      "YouTube",
      "X",
      "Shorts"
    ],
    "formats": [
      "16:9",
      "1:1",
      "9:16"
    ],
    "duration": 5,
    "bpm": 120,
    "cuts": [
      0.35,
      1.1,
      1.6,
      4.5
    ],
    "blurb": "A five-second sting for the start or end of every video. The centre node lands, three spokes shoot out and their ends pop, the tile grows in behind them, and the name slides out of the mark with a light sweep.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 3.5,
    "defaults": {
      "name": "Nexus UI",
      "tagline": "Motion you can copy and paste.",
      "bg": "#f5f5f7",
      "tile": "#111113",
      "ink": "#f4f1ea",
      "node": "#7d96ff"
    },
    "fields": [
      {
        "key": "name",
        "label": "Name",
        "type": "text",
        "max": 14
      },
      {
        "key": "tagline",
        "label": "Tagline",
        "type": "text",
        "max": 34
      },
      {
        "key": "bg",
        "label": "Background",
        "type": "color"
      },
      {
        "key": "tile",
        "label": "Logo tile",
        "type": "color"
      },
      {
        "key": "ink",
        "label": "Spokes",
        "type": "color"
      },
      {
        "key": "node",
        "label": "Centre node",
        "type": "color"
      }
    ]
  },
  {
    "slug": "hero-loop",
    "title": "Hero Loop",
    "purpose": "Website background",
    "motion": "Seamless 3D wall of your work, alternating columns",
    "app": "Nexus UI",
    "platforms": [
      "Website"
    ],
    "formats": [
      "16:9",
      "21:9",
      "9:16"
    ],
    "loop": true,
    "silent": true,
    "duration": 8,
    "bpm": 120,
    "cuts": [],
    "blurb": "A silent, seamless background for a landing page hero. Your real screenshots ride up and down a tilted 3D wall in alternating columns, a soft light passes over them, and frame 0 matches the last frame exactly, so it loops forever without a seam.",
    "premium": true,
    "dark": false,
    "createdAt": "2026-10-22",
    "posterAt": 2,
    "defaults": {
      "headline": "Make your site",
      "accentWord": "move.",
      "sub": "183 animated components for React.",
      "bg": "#f5f5f7"
    },
    "fields": [
      {
        "key": "headline",
        "label": "Headline (leave empty for a clean background)",
        "type": "text",
        "max": 22
      },
      {
        "key": "accentWord",
        "label": "Gradient word",
        "type": "text",
        "max": 10
      },
      {
        "key": "sub",
        "label": "Sub line",
        "type": "text",
        "max": 40
      },
      {
        "key": "bg",
        "label": "Page background",
        "type": "color"
      }
    ]
  },
  {
    "slug": "teaser",
    "title": "Coming Soon Teaser",
    "purpose": "Waitlist & teasers",
    "motion": "Live multiplayer canvas folds into a logo",
    "app": "DrawDocs",
    "platforms": [
      "Reels",
      "TikTok",
      "Shorts"
    ],
    "formats": [
      "9:16"
    ],
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
    "posterAt": 6,
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
  },
  {
    "slug": "route-story",
    "title": "Route Story",
    "purpose": "Travel & creators",
    "motion": "Route draws with a follow camera",
    "app": "Routecast",
    "platforms": [
      "Reels",
      "TikTok",
      "Shorts"
    ],
    "formats": [
      "9:16"
    ],
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
    "posterAt": 6,
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
  }
];

export const VIDEO_FPS = 30;

export function getVideo(slug: string): VideoEntry | undefined {
  return videos.find((v) => v.slug === slug);
}

/** The shape a video opens in (the first of its formats), or the one asked for if it supports it. */
export function videoFormat(video: Pick<VideoEntry, "formats">, id?: string | null): VideoFormat {
  return FORMATS[(video.formats.find((f) => f === id) ?? video.formats[0]) as FormatId];
}

/** Where the pre-rendered silent loop, the still and the soundtrack live (all under public/). */
export const videoPreviewSrc = (slug: string) => `/videos/previews/${slug}.mp4`;
export const videoPosterSrc = (slug: string) => `/videos/previews/${slug}.jpg`;
export const videoAudioSrc = (slug: string) => `/videos/audio/${slug}.mp3`;

export const VIDEO_PARTS = ["prompt", "source", "kit", "parts", "frame", "render"] as const;
export type VideoPart = (typeof VIDEO_PARTS)[number];
