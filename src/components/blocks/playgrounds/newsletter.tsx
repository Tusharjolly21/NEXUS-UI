"use client";

import { TypoCatchingSignup } from "@/components/blocks/motion-kit/typo-catching-signup";
import type { BlockPlaygrounds } from "./types";

const playgrounds: BlockPlaygrounds = {
  "mk-typo-catching-signup": {
    Component: TypoCatchingSignup,
    props: [
      { name: "title", type: "string", description: "Heading inside the card.", defaultValue: '"One good email, every Sunday."' },
      {
        name: "description",
        type: "string",
        description: "Paragraph under the heading.",
        defaultValue: '"Five links worth your time and one thing we learned building the product. Nothing else."',
      },
      {
        name: "start",
        type: "number",
        description: "Reader count before the visitor joins. It rolls up by one on subscribe.",
        defaultValue: "12408",
        min: 0,
        max: 999999,
        step: 1,
      },
      {
        name: "accent",
        type: "string",
        description: "Envelope, Subscribe button, focus ring, suggestion and glow. Left unset it is #0071e3, #0a84ff in dark mode.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Types a typo'd address, takes the fix and subscribes on a loop until the visitor touches the card.",
        defaultValue: "false",
      },
      {
        name: "domains",
        type: "string[]",
        description: "Mail domains typos are checked against (edit distance under 3).",
        defaultValue: '["gmail.com", "outlook.com", "icloud.com", "yahoo.com", "hotmail.com", "proton.me"]',
      },
      {
        name: "onSubmit",
        type: "(email: string) => void",
        description: "Runs with the trimmed, validated address. The block never sends anything itself.",
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "TypoCatchingSignup",
    importLine: 'import { TypoCatchingSignup } from "@/components/blocks/motion-kit/typo-catching-signup";',
  },
};

export default playgrounds;
