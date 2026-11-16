import { parsePrompt } from "./prompt";
import { pick, seededRandom } from "./random";
import { resolveJob } from "./render";
import { hashString } from "./theme";
import type { Aspect, Chat, ModelId, Msg, PrintSpec, Project, StyleId } from "./types";

export type Model = { id: ModelId; name: string; desc: string; ms: number; long: number; cost: number };

export type StyleInfo = { id: StyleId; name: string; desc: string; sample: string; aspect: Aspect };

export const MODELS: Model[] = [
  {
    id: "emulsion",
    name: "Emulsion 2",
    desc: "Balanced. Best for most prompts.",
    ms: 4400,
    long: 768,
    cost: 2,
  },
  {
    id: "swift",
    name: "Emulsion 2 Swift",
    desc: "Develops in under three seconds.",
    ms: 2700,
    long: 768,
    cost: 1,
  },
  {
    id: "silverpoint",
    name: "Silverpoint XL",
    desc: "Larger prints with finer grain.",
    ms: 5600,
    long: 1024,
    cost: 4,
  },
];

export const modelById = (id: string) => MODELS.find((model) => model.id === id) ?? MODELS[0];

export const STYLES: StyleInfo[] = [
  {
    id: "riso",
    name: "Risograph",
    desc: "Two or three inks, overprinted slightly off register.",
    sample: "mountains at dusk with a low sun",
    aspect: "4:5",
  },
  {
    id: "papercut",
    name: "Paper cut",
    desc: "Stacked card layers with soft cast shadows.",
    sample: "snowy pine forest below a peak, dawn",
    aspect: "4:5",
  },
  {
    id: "halftone",
    name: "Halftone poster",
    desc: "Two screens of dots on cream stock.",
    sample: "lake at sunrise with cranes",
    aspect: "4:5",
  },
  {
    id: "bauhaus",
    name: "Bauhaus grid",
    desc: "Primary shapes locked to a modular grid.",
    sample: "sun over the sea, warm",
    aspect: "4:5",
  },
  {
    id: "cyanotype",
    name: "Cyanotype",
    desc: "Botanical sun print on brushed blue.",
    sample: "ferns and wildflowers",
    aspect: "4:5",
  },
  {
    id: "contour",
    name: "Topographic",
    desc: "Contour survey with hillshade and rivers.",
    sample: "alpine range with a river",
    aspect: "4:5",
  },
  {
    id: "mesh",
    name: "Soft mesh",
    desc: "Blurred colour fields, film grain, glass.",
    sample: "pastel aura with a glowing sun",
    aspect: "4:5",
  },
  {
    id: "pixel",
    name: "Pixel",
    desc: "Low-res scene with ordered dithering.",
    sample: "harbour at night under the moon",
    aspect: "4:5",
  },
  {
    id: "inkwash",
    name: "Ink wash",
    desc: "Brush ridges dissolving into mist.",
    sample: "misty mountains with birds",
    aspect: "4:5",
  },
];

export const styleName = (id: string) => {
  return STYLES.find((style) => style.id === id)?.name ?? id;
};

export const PALETTE_NAMES: Record<string, string> = {
  dusk: "Dusk",
  dawn: "Dawn",
  neon: "Neon",
  pastel: "Pastel",
  mono: "Mono",
  warm: "Warm",
  cold: "Cold",
  night: "Night",
  autumn: "Autumn",
  verdant: "Verdant",
  ocean: "Ocean",
};

const SUBJECT_NAMES: Record<string, string> = {
  sea: "water",
  mountain: "mountains",
  sun: "a sun",
  moon: "a moon",
  city: "a skyline",
  forest: "trees",
  plant: "plants",
  desert: "dunes",
  night: "night sky",
  bird: "birds",
  snow: "snow",
  river: "a river",
  island: "an island",
  cloud: "clouds",
  lighthouse: "a lighthouse",
};

export const PROJECTS: Project[] = [
  {
    id: "p-cafe",
    name: "Harbour Cafe",
  },
  {
    id: "p-trail",
    name: "Trail Guide 2027",
  },
  {
    id: "p-home",
    name: "Hallway prints",
  },
];

const MINUTE = 6e4;

const HOUR = 60 * MINUTE;

const DAY = 24 * HOUR;

type StarterPrint = {
  chat: string;
  title: string;
  prompt: string;
  style: StyleId;
  aspect: Aspect;
  ago: number;
  fav?: boolean;
};

export const STARTER_PRINTS: StarterPrint[] = [
  {
    chat: "c-menu",
    title: "Headland",
    prompt: "Coastal cliff with pines over the sea at dusk, halftone poster",
    style: "halftone",
    aspect: "4:5",
    ago: 22 * MINUTE,
    fav: true,
  },
  {
    chat: "c-menu",
    title: "Harbour Lights",
    prompt: "City skyline on the water at sunset, neon, paper cut",
    style: "papercut",
    aspect: "16:9",
    ago: 31 * MINUTE,
  },
  {
    chat: "c-menu",
    title: "Midnight Pier",
    prompt: "Retro pixel city by the sea at night with the moon",
    style: "pixel",
    aspect: "3:2",
    ago: 40 * MINUTE,
  },
  {
    chat: "c-open",
    title: "Ridge Lines at Dusk",
    prompt: "Low sun over layered mountain ridges, dusk, risograph",
    style: "riso",
    aspect: "4:5",
    ago: 3 * HOUR,
    fav: true,
  },
  {
    chat: "c-open",
    title: "First Snow",
    prompt: "Snowy pine forest below a white peak, cold dawn, paper cut",
    style: "papercut",
    aspect: "4:5",
    ago: 3.2 * HOUR,
  },
  {
    chat: "c-open",
    title: "Mist and Birds",
    prompt: "Misty mountains with a red sun and birds, ink wash",
    style: "inkwash",
    aspect: "4:5",
    ago: 3.4 * HOUR,
  },
  {
    chat: "c-board",
    title: "Sea and Sun, Grid",
    prompt: "Sun and sea, geometric bauhaus poster, warm",
    style: "bauhaus",
    aspect: "4:5",
    ago: 26 * HOUR,
  },
  {
    chat: "c-board",
    title: "Copper Dunes",
    prompt: "Desert dunes under a big sun, riso print, autumn",
    style: "riso",
    aspect: "3:2",
    ago: 27 * HOUR,
  },
  {
    chat: "c-maps",
    title: "Valley Survey",
    prompt: "Alpine range with a river valley, topographic survey",
    style: "contour",
    aspect: "4:5",
    ago: 2 * DAY,
  },
  {
    chat: "c-maps",
    title: "Night Chart",
    prompt: "Island in the ocean, topographic map at night",
    style: "contour",
    aspect: "1:1",
    ago: 2.1 * DAY,
  },
  {
    chat: "c-bot",
    title: "Umbel Study",
    prompt: "Wildflowers and ferns, botanical cyanotype",
    style: "cyanotype",
    aspect: "4:5",
    ago: 3 * DAY,
    fav: true,
  },
  {
    chat: "c-bot",
    title: "Tide Pool Specimen",
    prompt: "Kelp and seaweed from the sea, cyanotype specimen",
    style: "cyanotype",
    aspect: "4:5",
    ago: 3.1 * DAY,
  },
  {
    chat: "c-soft",
    title: "Morning Aura",
    prompt: "Soft pastel aura gradient with a glowing sun",
    style: "mesh",
    aspect: "4:5",
    ago: 4 * DAY,
  },
  {
    chat: "c-soft",
    title: "Fluted Neon",
    prompt: "Neon gradient behind fluted glass, abstract",
    style: "mesh",
    aspect: "3:2",
    ago: 4.1 * DAY,
  },
  {
    chat: "c-desert",
    title: "Crane Morning",
    prompt: "Mountain lake at sunrise with cranes, halftone poster",
    style: "halftone",
    aspect: "4:5",
    ago: 6 * DAY,
  },
  {
    chat: "c-desert",
    title: "Mesa Afternoon",
    prompt: "Desert mesas and dunes with a cactus, warm afternoon, pixel",
    style: "pixel",
    aspect: "1:1",
    ago: 6.1 * DAY,
  },
  {
    chat: "c-desert",
    title: "Moon Range",
    prompt: "Mountains under the moon, swiss geometric, cold",
    style: "bauhaus",
    aspect: "1:1",
    ago: 6.2 * DAY,
  },
  {
    chat: "c-desert",
    title: "River Bend",
    prompt: "Forest hills with a winding river, dawn, paper cut",
    style: "papercut",
    aspect: "4:5",
    ago: 6.3 * DAY,
  },
];

const STARTER_CHATS: { id: string; title: string; project: string; ctx: number }[] = [
  {
    id: "c-menu",
    title: "Menu cover, coast at dusk",
    project: "p-cafe",
    ctx: 57,
  },
  {
    id: "c-board",
    title: "Specials board art",
    project: "p-cafe",
    ctx: 24,
  },
  {
    id: "c-open",
    title: "Chapter openers",
    project: "p-trail",
    ctx: 41,
  },
  {
    id: "c-maps",
    title: "Map spreads",
    project: "p-trail",
    ctx: 18,
  },
  {
    id: "c-bot",
    title: "Botanical set",
    project: "p-home",
    ctx: 22,
  },
  {
    id: "c-soft",
    title: "Soft gradients",
    project: "p-home",
    ctx: 15,
  },
  {
    id: "c-desert",
    title: "Warm room set",
    project: "p-home",
    ctx: 36,
  },
];

export const IDEAS: { prompt: string; style: StyleId }[] = [
  {
    prompt: "Lighthouse headland over a dusk sea, risograph",
    style: "riso",
  },
  {
    prompt: "Pine ridges in morning mist with cranes, ink wash",
    style: "inkwash",
  },
  {
    prompt: "Neon city skyline by the water at night",
    style: "pixel",
  },
  {
    prompt: "Ginkgo and fern specimen, cyanotype",
    style: "cyanotype",
  },
];

export function titleFor(prompt: string, seed: number) {
  const parsed = parsePrompt(prompt);
  const rand = seededRandom(seed + 5);
  const subjects = new Set(parsed.subjects);
  const options: [boolean, string[]][] = [
    [subjects.has("city") && subjects.has("sea"), ["Harbour Lights", "Waterfront", "Quay at Dusk"]],
    [subjects.has("island"), ["Outer Isle", "Atoll", "Small Island"]],
    [subjects.has("lighthouse"), ["Keeper's Light", "The Beacon", "Light on the Point"]],
    [subjects.has("sea"), ["Low Tide", "Salt Hour", "Open Water", "Headland"]],
    [subjects.has("snow"), ["First Snow", "White Pass", "Frost Line"]],
    [subjects.has("mountain"), ["Ridge Lines", "High Pass", "North Face", "Far Range"]],
    [subjects.has("desert"), ["Dune Field", "Mesa Light", "Dry Country"]],
    [subjects.has("city"), ["Skyline", "Rooftops", "Downtown"]],
    [subjects.has("forest"), ["Pinewood", "Tree Line", "Under the Firs"]],
    [subjects.has("plant"), ["Specimen", "Field Study", "Pressed Flowers"]],
    [subjects.has("bird"), ["Flight", "Passage", "Flock"]],
    [subjects.has("river"), ["River Bend", "Valley Floor"]],
    [true, ["Quiet Hills", "Study in Light", "Untitled Print", "Soft Field"]],
  ];
  const title = pick(rand, (options.find(([matches]) => matches) ?? options[options.length - 1])[1]);
  const suffix =
    subjects.has("night") || subjects.has("moon")
      ? " at Night"
      : parsed.palette === "dusk"
        ? " at Dusk"
        : parsed.palette === "dawn"
          ? " at Dawn"
          : "";
  return title.includes(" at ") ? title : title + suffix;
}

/** The agent's note under a result: what it read in the prompt and how it chose to print it. */
export function describePrint(
  prompt: string,
  style: StyleId,
  how: string,
  palette: string,
  count: number,
  auto: boolean,
) {
  const parsed = parsePrompt(prompt);
  const subjects = parsed.subjects
    .filter((subject) => subject !== "night" || !parsed.subjects.includes("moon"))
    .map((subject) => SUBJECT_NAMES[subject]);
  const list =
    subjects.length > 1 ? subjects.slice(0, -1).join(", ") + " and " + subjects[subjects.length - 1] : subjects[0];
  const read = list
    ? `I read ${list} in a ${PALETTE_NAMES[palette].toLowerCase()} palette`
    : `Nothing concrete to anchor on, so I built quiet hills in a ${PALETTE_NAMES[palette].toLowerCase()} palette`;
  const made = auto
    ? `chose ${styleName(style).toLowerCase()} for it`
    : `printed it as ${styleName(style).toLowerCase()}`;
  return `${read} and ${made}, ${how}${count > 1 ? `, ${count} takes on different seeds` : ""}.`;
}

const DEVELOP_STEPS: [number, string][] = [
  [0, "Reading prompt"],
  [0.2, "Composing"],
  [0.5, "Developing"],
  [0.76, "Fixing"],
];

export const stepAt = (progress: number) => {
  let label = DEVELOP_STEPS[0][1];
  for (const [at, name] of DEVELOP_STEPS) {
    if (progress >= at) {
      label = name;
    }
  }
  return label;
};

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const ASPECT_KEYS: Aspect[] = ["1:1", "4:5", "3:2", "16:9"];

export const seedId = (index: number) => `s-${index}`;

export function starterChats(now: number): Chat[] {
  return STARTER_CHATS.map((starterChat) => {
    const prints = STARTER_PRINTS.map((starterPrint, i) => ({
      ...starterPrint,
      i,
    }))
      .filter((print) => print.chat === starterChat.id)
      .sort((a, b) => b.ago - a.ago);
    const msgs: Msg[] = [];
    for (const print of prints) {
      const spec: PrintSpec = {
        prompt: print.prompt,
        style: print.style,
        seed: hashString(print.prompt),
        aspect: print.aspect,
      };
      const palette = resolveJob(spec).palette;
      msgs.push({
        id: `u-${print.i}`,
        role: "user",
        text: print.prompt,
        tags: [],
      });
      msgs.push({
        id: `a-${print.i}`,
        role: "art",
        job: {
          id: `j-${print.i}`,
          prompt: print.prompt,
          specs: [spec],
          ids: [seedId(print.i)],
          model: "emulsion",
          mode: "agent",
          status: "done",
          at: 0,
          dur: 0,
          vote: 0,
          note: describePrint(print.prompt, print.style, print.aspect, palette, 1, false),
        },
      });
    }
    return {
      id: starterChat.id,
      title: starterChat.title,
      project: starterChat.project,
      ctx: starterChat.ctx,
      msgs,
      at: now - Math.min(...prints.map((print) => print.ago)),
    };
  });
}

export const fileSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "print";

/** Words a cut-short title should not end on ("Lighthouse on a headland over" reads unfinished). */
const DANGLING = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "on",
  "over",
  "in",
  "at",
  "by",
  "with",
  "under",
  "near",
  "to",
  "from",
  "for",
  "into",
]);

/** A chat title from the first few words of its first prompt. */
export const shortTitle = (prompt: string) => {
  const words = prompt
    .replace(/[,.].*$/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 5);
  while (words.length > 1 && DANGLING.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }
  const title = words.join(" ");
  return title.charAt(0).toUpperCase() + title.slice(1);
};
