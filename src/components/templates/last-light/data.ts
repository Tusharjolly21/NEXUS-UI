/**
 * Last Light: every scene setting and every word of copy lives here, so the page can be reused by editing this file
 * and swapping the three pictures in /public/templates/last-light. Everything is invented sample content: the game,
 * the people and the place do not exist.
 */

/** Compact, centred marks, from a dot to the densest letters. Their real ink is measured and they are sorted by it. */
export const CHARS = " ·-~=+*xocvsezaunmw%#&@MWB8";

/** The first three marks (a dot, a dash, a tilde) are also the dark marks cut into lit tiles in the first scene. */
export const GLYPH = { dot: 1, star: CHARS.indexOf("*") };

/**
 * One scene. Each is read from a picture with its character texture filtered out, so only its colour and shapes are
 * left, and redrawn in characters on the picture's own grid (`cols` across, cells `cell` times as tall as wide).
 * Bright cells turn over into lit tiles with a dark character cut in: `letters` picks full letters for those cuts
 * instead of small marks, and `invT` is how bright a cell must be before it turns over.
 */
export type SceneConfig = {
  id: 0 | 1 | 2;
  /** The picture, in /public. */
  src: string;
  /** The picture's size in pixels. */
  w: number;
  h: number;
  cols: number;
  cell: number;
  /** How tall a capital letter is, as a share of the cell. */
  cap: number;
  /** Where the sun is in the picture (0 to 1) and how big its glow reads. */
  sun: [number, number];
  sunR: number;
  /** The lit tile: width and height as a share of the cell, and how round its corners are. */
  tile: [number, number, number];
  invT: number;
  letters: 0 | 1;
  /** "hero" covers the screen; "cover" fills its band. fx and fy say which part of the picture stays in frame. */
  fit: "hero" | "cover";
  fx?: number;
  fy?: number;
  /** Radius of the pointer's lantern, in CSS pixels. */
  lamp: number;
};

export const SCENES: Record<"top" | "deacon" | "posse", SceneConfig> = {
  top: {
    id: 0, src: "/templates/last-light/scene-top.jpg", w: 724, h: 482, cols: 164, cell: 0.917, cap: 0.8,
    sun: [0.2256, 0.2835], sunR: 0.06, tile: [0.92, 0.84, 0.48], invT: 0.3, letters: 0, fit: "hero", lamp: 160,
  },
  deacon: {
    id: 1, src: "/templates/last-light/scene-deacon.jpg", w: 1024, h: 753, cols: 159, cell: 1.89, cap: 0.62,
    sun: [0.5, 0.8], sunR: 0.26, tile: [1.0, 0.94, 0.16], invT: 0.22, letters: 1, fit: "cover", fx: 0.5, fy: 0.5, lamp: 140,
  },
  posse: {
    id: 2, src: "/templates/last-light/scene-posse.jpg", w: 1448, h: 543, cols: 189, cell: 1.58, cap: 0.62,
    sun: [0.5, 0.3], sunR: 0.45, tile: [1.0, 0.84, 0.16], invT: 0.22, letters: 1, fit: "cover", fx: 0.5, fy: 0.6, lamp: 130,
  },
};

/** A rider is placed on the gang picture by u and v (0 to 1 across and down); `head` is where the name card sits. */
export type Rider = { u: number; v: number; head: number; name: string; role: string };

export const RIDERS: Rider[] = [
  { u: 0.2, v: 0.6, head: 0.36, name: "Wes Tolliver", role: "Scout. Rides ahead and comes back with the weather." },
  { u: 0.293, v: 0.63, head: 0.4, name: "Ada Rook", role: "The best shot in the gang, and the only one who reads contracts." },
  { u: 0.383, v: 0.58, head: 0.32, name: "Hollis Vane", role: "Carries the heavy rifle and most of the arguments." },
  { u: 0.503, v: 0.52, head: 0.16, name: "Eli Haskell", role: "Started the gang with two horses and a stolen survey map. Still has the map." },
  { u: 0.611, v: 0.6, head: 0.33, name: "Amos Grey", role: "Was a real preacher once. Still says grace before every job." },
  { u: 0.718, v: 0.58, head: 0.3, name: "Cass Marlow", role: "Fastest draw in the territory, and keen for everyone to know it." },
  { u: 0.815, v: 0.62, head: 0.34, name: "June Ash", role: "Tracks a horse across bare rock. Joined last winter; nobody knows from where." },
];

export const COPY = {
  brand: "Last Light",
  nav: [
    { label: "Story", href: "story" },
    { label: "The world", href: "world" },
    { label: "The gang", href: "gang" },
  ],
  navCta: { label: "Wishlist", href: "wishlist" },
  hero: {
    titleStart: "Ride out before the ",
    titleSoft: "light",
    titleEnd: " goes.",
    lede: "A slow, open-country western about one rider, one horse and the last summer of the frontier. Coming to PC and consoles in spring 2027.",
    primary: "Add to wishlist",
    /** Where the buttons go. In-page ids (#ll-...) scroll smoothly; replace them with your store and trailer URLs. */
    primaryHref: "#ll-wishlist",
    secondary: "Watch the trailer",
    secondaryHref: "#ll-trailer",
    place: "Pine Ridge, Wyoming Territory · 7:42 pm, sundown",
  },
  /** Shown until the scene reports how many characters it drew. */
  countFallback: "Drawn live in characters",
  story: {
    title: "Wyoming Territory, 1899. The railroad is coming, and the open range has one summer left.",
    paragraphs: [
      "You ride with Eli Haskell's gang: seven people who have stayed ahead of the law by staying out of towns. This summer the Union Pacific is surveying the valley, the ranches are fencing what used to be free, and every job you take is one more reason for someone to come looking.",
      "There is no map to clear. You learn the country the way they did, by riding it, and the country changes as the fences go up.",
    ],
    facts: [
      ["Setting", "Pine Ridge, Wyoming Territory"],
      ["Year", "1899, May to September"],
      ["The range", "41 by 26 miles of open country"],
      ["One sundown", "24 real minutes, every evening"],
    ] as [string, string][],
  },
  world: {
    title: "Silas Crane owns everything the light touches.",
    body: "They call him the Deacon. He buys land ahead of the railroad and pays men to clear whoever is living on it. He has never met Eli Haskell, but he has a price for him.",
    caption: "Silas Crane, called the Deacon. Wanted in three territories, paid by the railroad in all of them.",
  },
  gang: {
    title: "Seven riders. One last summer.",
    body: "Everyone here has a reason to stay and a reason to leave. Point at a rider, or pick a name, to meet them.",
    caption: "The gang at the edge of the Red Desert, an hour before dark.",
  },
  ways: {
    title: "How the summer goes",
    items: [
      ["Ride the range", "Forty-one miles of country with no markers on it. You find water by watching where your horse wants to go, and you find trouble the same way."],
      ["Read the weather", "Storms build over the peaks for an hour before they break. Sundown takes twenty-four minutes, and the light is different in every one of them."],
      ["Keep the gang together", "What you say at the fire decides who is still riding with you in September. Nobody leaves without telling you why."],
      ["Make camp", "Stop where you like. Cook what you caught, mend what tore, and listen to the coyotes come in off the ridge."],
    ] as [string, string][],
  },
  last: {
    title: "The last summer starts in spring 2027.",
    body: "Coming to PC, PlayStation 5 and Xbox Series X|S. Wishlist it now and we will let you know the day the gates open.",
    primary: "Add to wishlist",
    primaryHref: "#ll-wishlist",
    secondary: "Watch the trailer",
    secondaryHref: "#ll-trailer",
  },
  footer: {
    note: "Last Light is a fictional game. Every scene on this page is drawn live in characters.",
    links: [
      { label: "Story", href: "story" },
      { label: "The world", href: "world" },
      { label: "The gang", href: "gang" },
      { label: "Back to top", href: "top" },
    ],
  },
};
