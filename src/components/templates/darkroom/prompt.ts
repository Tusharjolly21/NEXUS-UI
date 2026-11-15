import { pick, type Rand } from "./random";
import type { StyleId } from "./types";

/** The colours a print is made from: a three-stop sky, the sun or moon and its glow, far and near land, water, paper, ink, an accent and a highlight. */
export type Palette = {
  sky: [string, string, string];
  orb: string;
  glow: string;
  far: string;
  near: string;
  water: string;
  paper: string;
  ink: string;
  accent: string;
  light: string;
};

/** What a prompt asks for: the things in it, and a palette and style if it names them. */
export type ParsedPrompt = { subjects: string[]; palette: string | null; style: StyleId | null; words: string[] };

export const PALETTES: Record<string, Palette> = {
  dusk: {
    sky: ["#2A2350", "#B35F7C", "#F5AE72"],
    orb: "#FFE7B5",
    glow: "#FFB27A",
    far: "#C67D8E",
    near: "#26132C",
    water: "#5A3F69",
    paper: "#F2E9DB",
    ink: "#26132C",
    accent: "#EE5F49",
    light: "#FFE9C9",
  },
  dawn: {
    sky: ["#93AED6", "#EFC3C3", "#FBE2BF"],
    orb: "#FFF6E0",
    glow: "#FFD7A8",
    far: "#C6B1CE",
    near: "#463F63",
    water: "#A8B8D8",
    paper: "#F6F0E7",
    ink: "#3A3453",
    accent: "#EF8865",
    light: "#FFFFFF",
  },
  neon: {
    sky: ["#0B0726", "#3B0F5E", "#FF3D8B"],
    orb: "#FFD84A",
    glow: "#FF4FA0",
    far: "#7B2DBA",
    near: "#0A0418",
    water: "#1D0C3B",
    paper: "#130A25",
    ink: "#0A0418",
    accent: "#2CF6E1",
    light: "#FFE9FF",
  },
  pastel: {
    sky: ["#B9D4F1", "#E7D4EF", "#FCE3D6"],
    orb: "#FFF7DA",
    glow: "#FFE6C2",
    far: "#C3D7C6",
    near: "#7088AF",
    water: "#B6D1E6",
    paper: "#FAF5EE",
    ink: "#56648A",
    accent: "#F2A29C",
    light: "#FFFFFF",
  },
  mono: {
    sky: ["#CFCBC3", "#DDD9D1", "#EFECE6"],
    orb: "#FBFAF6",
    glow: "#FFFFFF",
    far: "#A39F97",
    near: "#1B1A18",
    water: "#8C8880",
    paper: "#EFEBE3",
    ink: "#1B1A18",
    accent: "#1B1A18",
    light: "#FFFFFF",
  },
  warm: {
    sky: ["#F3B865", "#F39654", "#F8D7A0"],
    orb: "#FFF4D8",
    glow: "#FFD27E",
    far: "#E2895A",
    near: "#561F13",
    water: "#C46F4A",
    paper: "#F6ECDD",
    ink: "#481C11",
    accent: "#E5452A",
    light: "#FFF4E2",
  },
  cold: {
    sky: ["#0F2B49", "#2F6E9C", "#AAD3E7"],
    orb: "#F4FBFF",
    glow: "#D2ECFF",
    far: "#6E9FC1",
    near: "#0C2136",
    water: "#285A80",
    paper: "#EEF3F5",
    ink: "#0C2136",
    accent: "#4FB3E8",
    light: "#FFFFFF",
  },
  night: {
    sky: ["#04060E", "#0E1931", "#26385F"],
    orb: "#F4EFDA",
    glow: "#A3B9EA",
    far: "#2A3C63",
    near: "#03050B",
    water: "#0B152A",
    paper: "#0B1020",
    ink: "#03050B",
    accent: "#F2C14E",
    light: "#F4EFDA",
  },
  autumn: {
    sky: ["#E9CDA4", "#E3A66E", "#CB6C3E"],
    orb: "#FFF1D4",
    glow: "#FFCF8F",
    far: "#B76F4A",
    near: "#38190F",
    water: "#8B4F33",
    paper: "#F3E7D3",
    ink: "#38190F",
    accent: "#C6412A",
    light: "#FFF1DC",
  },
  verdant: {
    sky: ["#C9E3D4", "#E6EFD3", "#F7F1DC"],
    orb: "#FFFBE8",
    glow: "#FFF1C0",
    far: "#8AB397",
    near: "#123428",
    water: "#5C988A",
    paper: "#F2EFE3",
    ink: "#123428",
    accent: "#E0784D",
    light: "#FFFFF5",
  },
  ocean: {
    sky: ["#113A5C", "#2E7EA2", "#C1E4E3"],
    orb: "#FFF8E6",
    glow: "#FFE2AE",
    far: "#4A8CAC",
    near: "#061F32",
    water: "#1A5677",
    paper: "#EDF2EF",
    ink: "#061F32",
    accent: "#F2A45A",
    light: "#FFFFFF",
  },
};

const SUBJECT_WORDS: [string, string[]][] = [
  [
    "sea",
    [
      "sea",
      "ocean",
      "wave",
      "waves",
      "coast",
      "coastal",
      "beach",
      "shore",
      "bay",
      "harbor",
      "harbour",
      "lake",
      "tide",
      "surf",
      "lagoon",
      "pier",
      "sail",
      "boat",
    ],
  ],
  [
    "mountain",
    [
      "mountain",
      "mountains",
      "peak",
      "peaks",
      "alps",
      "alpine",
      "ridge",
      "ridges",
      "summit",
      "volcano",
      "highlands",
      "range",
    ],
  ],
  ["sun", ["sun", "sunset", "sunrise", "sunlit", "solar"]],
  ["moon", ["moon", "moonlit", "moonrise", "lunar", "crescent"]],
  [
    "city",
    [
      "city",
      "skyline",
      "town",
      "tower",
      "towers",
      "building",
      "buildings",
      "street",
      "rooftops",
      "metropolis",
      "downtown",
    ],
  ],
  ["forest", ["forest", "pine", "pines", "woods", "woodland", "trees", "tree", "grove", "taiga", "jungle", "firs"]],
  [
    "plant",
    [
      "plant",
      "plants",
      "botanical",
      "fern",
      "ferns",
      "leaf",
      "leaves",
      "flower",
      "flowers",
      "bloom",
      "garden",
      "herb",
      "herbs",
      "wildflower",
      "wildflowers",
      "ginkgo",
      "grasses",
      "specimen",
      "seaweed",
      "algae",
      "kelp",
      "feather",
    ],
  ],
  ["desert", ["desert", "dune", "dunes", "cactus", "cacti", "sand", "sands", "canyon", "mesa", "sahara", "arid"]],
  ["night", ["night", "midnight", "stars", "starry", "nocturne", "nocturnal", "galaxy"]],
  [
    "bird",
    ["bird", "birds", "gull", "gulls", "crane", "cranes", "swallow", "swallows", "flock", "heron", "geese", "feather"],
  ],
  ["snow", ["snow", "snowy", "winter", "glacier", "ice", "icy", "frost", "frozen", "arctic"]],
  ["river", ["river", "stream", "valley", "creek", "delta", "fjord"]],
  ["island", ["island", "islands", "atoll", "isle"]],
  ["lighthouse", ["lighthouse", "lighthouses", "beacon"]],
  ["cloud", ["cloud", "clouds", "cloudy", "fog", "foggy", "mist", "misty", "haze"]],
];

const PALETTE_WORDS: [string, string[]][] = [
  ["neon", ["neon", "electric", "cyber", "cyberpunk", "synth", "synthwave", "vapor", "vaporwave", "fluorescent"]],
  ["mono", ["mono", "monochrome", "noir", "grayscale", "greyscale", "black-and-white", "charcoal", "graphite"]],
  ["pastel", ["pastel", "candy", "pale", "soft", "dreamy", "sorbet"]],
  ["night", ["night", "midnight", "starry", "nocturne"]],
  ["dusk", ["dusk", "twilight", "evening", "sunset", "magenta"]],
  ["dawn", ["dawn", "sunrise", "morning", "daybreak"]],
  ["autumn", ["autumn", "fall", "rust", "rusty", "copper", "harvest"]],
  ["warm", ["warm", "amber", "golden", "gold", "orange", "terracotta", "desert", "sand", "summer"]],
  ["cold", ["cold", "icy", "arctic", "winter", "frozen", "glacier", "blue", "steel"]],
  ["verdant", ["green", "lush", "spring", "verdant", "forest", "moss", "jungle", "botanical"]],
  ["ocean", ["ocean", "sea", "coastal", "teal", "marine", "harbour", "harbor", "lagoon"]],
];

const STYLE_WORDS: [StyleId, string[]][] = [
  ["riso", ["riso", "risograph", "zine", "print", "printed"]],
  ["papercut", ["paper", "papercut", "paper-cut", "layered", "cutout", "cut-paper", "diorama"]],
  ["halftone", ["halftone", "poster", "comic", "dots", "screenprint", "screen-print", "pop"]],
  ["bauhaus", ["bauhaus", "swiss", "geometric", "modernist", "shapes", "grid", "constructivist"]],
  ["cyanotype", ["cyanotype", "blueprint", "herbarium", "sunprint", "sun-print", "specimen", "photogram"]],
  ["contour", ["topographic", "topo", "contour", "contours", "map", "elevation", "terrain", "survey"]],
  ["mesh", ["gradient", "mesh", "abstract", "aura", "glow", "blur", "glass", "fluted"]],
  ["pixel", ["pixel", "pixels", "8-bit", "16-bit", "8bit", "16bit", "retro", "dither", "dithered", "arcade"]],
  ["inkwash", ["ink", "sumi", "sumi-e", "brush", "wash", "watercolor", "watercolour", "calligraphic", "shan"]],
];

/** Reads a prompt for subjects (sea, city, snow...), a palette word and a style word. */
export function parsePrompt(prompt: string): ParsedPrompt {
  const text = prompt
    .toLowerCase()
    .replace(/black and white/g, "black-and-white")
    .replace(/paper cut/g, "paper-cut")
    .replace(/sun print/g, "sun-print")
    .replace(/ink wash/g, "wash");
  const words = new Set(text.split(/[^a-z0-9-]+/).filter(Boolean));
  const has = (synonyms: string[]) => synonyms.some((word) => words.has(word));
  const subjects = SUBJECT_WORDS.filter(([, synonyms]) => has(synonyms)).map(([subject]) => subject);
  const palette = PALETTE_WORDS.find(([, synonyms]) => has(synonyms))?.[0] ?? null;
  const style = STYLE_WORDS.find(([, synonyms]) => has(synonyms))?.[0] ?? (words.has("botanical") ? "cyanotype" : null);
  return {
    subjects,
    palette,
    style,
    words: [...words],
  };
}

/** The palette a prompt implies when it names none: night for the moon, cold for snow, and so on. */
export function pickPalette(parsed: ParsedPrompt, rand: Rand) {
  if (parsed.palette) {
    return parsed.palette;
  }
  const subjects = new Set(parsed.subjects);
  return subjects.has("night") || (subjects.has("moon") && !subjects.has("sun"))
    ? "night"
    : subjects.has("desert")
      ? pick(rand, ["warm", "autumn", "dusk"])
      : subjects.has("snow")
        ? "cold"
        : subjects.has("forest") || subjects.has("plant")
          ? pick(rand, ["verdant", "verdant", "autumn", "dawn"])
          : subjects.has("sea") || subjects.has("island")
            ? pick(rand, ["ocean", "dusk", "dawn", "warm"])
            : subjects.has("city")
              ? pick(rand, ["dusk", "neon", "night", "warm"])
              : pick(rand, ["dusk", "dawn", "warm", "verdant", "ocean", "pastel", "autumn"]);
}

/** The style when the prompt names none: cyanotype for plants, otherwise one chosen by the seed. */
export function pickStyle(parsed: ParsedPrompt, seed: number): StyleId {
  if (parsed.style) {
    return parsed.style;
  }
  const subjects = new Set(parsed.subjects);
  if (subjects.has("plant") && !subjects.has("mountain") && !subjects.has("sea")) {
    return "cyanotype";
  }
  const choices: StyleId[] = ["riso", "papercut", "halftone", "pixel", "inkwash", "papercut", "riso"];
  return choices[seed % choices.length];
}
