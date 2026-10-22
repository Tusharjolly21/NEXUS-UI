"use client";

import { Clothesline } from "@/components/blocks/motion-kit/clothesline";
import { CountingStats } from "@/components/blocks/motion-kit/counting-stats";
import { WallOfLove } from "@/components/blocks/motion-kit/wall-of-love";
import type { BlockPlaygrounds } from "./types";

const playgrounds: BlockPlaygrounds = {
  "mk-clothesline": {
    Component: Clothesline,
    props: [
      {
        name: "autoplay",
        type: "boolean",
        description: "Plucks the line and sends a gust every 1.8 s until the visitor touches it. Never runs under reduced motion.",
        defaultValue: "false",
      },
      {
        name: "hint",
        type: "string",
        description: "Small line under the washing line.",
        defaultValue: '"Pluck the line, tug a card, or click one to read it."',
      },
      { name: "closeLabel", type: "string", description: "Label of the button inside an opened testimonial.", defaultValue: '"Close"' },
      {
        name: "people",
        type: "ClotheslineTestimonial[]",
        description:
          "Testimonials: name, role, quote, a two-colour gradient hue and the rope point (1 to 28) the peg clips onto. Four fit well; use a stable array.",
        defaultValue: "DEFAULT_CLOTHESLINE_PEOPLE",
      },
      {
        name: "onAction",
        type: '(action: "open" | "close", person: ClotheslineTestimonial) => void',
        description: "Called when a testimonial is opened or closed. Nothing navigates.",
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "Clothesline",
    importLine: 'import { Clothesline } from "@/components/blocks/motion-kit/clothesline";',
  },
  "mk-counting-stats": {
    Component: CountingStats,
    props: [
      { name: "title", type: "string", description: "Heading above the stats.", defaultValue: '"The numbers, in public."' },
      {
        name: "accent",
        type: "string",
        description: "Colour of the top glow and every other sparkline (the rest are sky blue).",
        defaultValue: '"#0a84ff"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Replays the count and sparklines every 7 s while the band is on screen.",
        defaultValue: "false",
      },
      {
        name: "stats",
        type: "CountingStat[]",
        description: "Stats: value, decimals, prefix, suffix, label, a green trend line and sparkline points (oldest first).",
        defaultValue: "DEFAULT_COUNTING_STATS",
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "CountingStats",
    importLine: 'import { CountingStats } from "@/components/blocks/motion-kit/counting-stats";',
  },
  "mk-wall-of-love": {
    Component: WallOfLove,
    props: [
      { name: "title", type: "string", description: "Heading above the wall.", defaultValue: '"Teams switch, then tell their friends."' },
      { name: "eyebrow", type: "string", description: "Small accent line above the heading.", defaultValue: '"Wall of love"' },
      {
        name: "accent",
        type: "string",
        description: "Eyebrow and focus ring colour. Left unset it is Apple blue, brightening in dark mode.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Scrolls the columns. Off, the wall starts paused and the visitor can press play.",
        defaultValue: "true",
      },
      {
        name: "quotes",
        type: "WallOfLoveQuote[]",
        description: "Testimonials: text, name, role and an avatar colour (the avatar shows initials).",
        defaultValue: "DEFAULT_WALL_OF_LOVE_QUOTES",
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "WallOfLove",
    importLine: 'import { WallOfLove } from "@/components/blocks/motion-kit/wall-of-love";',
  },
};

export default playgrounds;
