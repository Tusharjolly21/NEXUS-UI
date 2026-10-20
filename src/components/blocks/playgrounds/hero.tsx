"use client";

import { SpotlightHero } from "@/components/blocks/motion-kit/spotlight-hero";
import { ParallaxStackHero } from "@/components/blocks/motion-kit/parallax-stack-hero";
import type { BlockPlaygrounds } from "./types";

const playgrounds: BlockPlaygrounds = {
  "mk-spotlight-hero": {
    Component: SpotlightHero,
    props: [
      { name: "lead", type: "string", description: "Fixed first line of the headline. Each word blurs up in turn.", defaultValue: '"The dashboard"' },
      {
        name: "sub",
        type: "string",
        description: "Paragraph under the headline.",
        defaultValue:
          '"Lumen pulls every number your company runs on into one live view. No spreadsheets, no exports, no waiting for Monday."',
      },
      {
        name: "accent",
        type: "string",
        description: "Rotating word, lit dots under the pointer, glow, chart line and primary button.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "accentDark",
        type: "string",
        description: "Accent in dark mode. Without it, the default blue brightens to #0a84ff and any other accent is reused.",
        defaultValue: '"#0a84ff"',
      },
      { name: "autoplay", type: "boolean", description: "Rotates the last line of the headline every 2.4 s.", defaultValue: "true" },
      {
        name: "words",
        type: "string[]",
        description: "Endings that rotate on the second line of the headline.",
        defaultValue: '["for teams.", "for founders.", "for finance.", "for you."]',
      },
      {
        name: "onAction",
        type: '(label: "announcement" | "primary" | "secondary") => void',
        description: "Called with the button that was pressed. Buttons never navigate on their own.",
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "SpotlightHero",
    importLine: 'import { SpotlightHero } from "@/components/blocks/motion-kit/spotlight-hero";',
  },
  "mk-parallax-stack-hero": {
    Component: ParallaxStackHero,
    props: [
      {
        name: "headline",
        type: "string",
        description: "The headline. Each word rises in on its own.",
        defaultValue: '"Run the whole week from one calm inbox."',
      },
      {
        name: "highlight",
        type: "string",
        description: "Word(s) of the headline tinted in the accent, matched ignoring case and punctuation. Empty tints nothing.",
        defaultValue: '"calm"',
      },
      {
        name: "eyebrow",
        type: "string",
        description: "Accent line beside the live dot, above the headline.",
        defaultValue: '"2,400 teams joined this month"',
      },
      {
        name: "description",
        type: "string",
        description: "Paragraph under the headline.",
        defaultValue: '"Messages, meetings and payments land in one place, sorted by what needs you first."',
      },
      {
        name: "ctaLabel",
        type: "string",
        description: "Submit button label.",
        defaultValue: '"Join free"',
      },
      {
        name: "accent",
        type: "string",
        description: "Live dot, the highlighted word, buttons, badges and the background glow.",
        defaultValue: '"#5e5ce6"',
      },
      {
        name: "accentDark",
        type: "string",
        description: "Accent in dark mode. Without it, the default indigo lightens to #7d7aff and any other accent is reused.",
        defaultValue: '"#7d7aff"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Lets the product cards float and the live dot pulse. Pointer parallax works either way.",
        defaultValue: "true",
      },
      {
        name: "note",
        type: "string",
        description: "Hint under the field before anything is submitted.",
        defaultValue: '"Free for 14 days. No card needed."',
      },
      {
        name: "placeholder",
        type: "string",
        description: "Email field placeholder.",
        defaultValue: '"you@company.com"',
      },
      {
        name: "pendingLabel",
        type: "string",
        description: "Button label while onSubmit is pending.",
        defaultValue: '"Joining…"',
      },
      {
        name: "successNote",
        type: "string",
        description: "Hint after a successful submit.",
        defaultValue: "\"You're on the list.\"",
      },
      {
        name: "errorNote",
        type: "string",
        description: "Hint when the email is invalid or onSubmit throws.",
        defaultValue: "\"That email doesn't look right.\"",
      },
      {
        name: "onSubmit",
        type: "(email: string) => void | Promise<void>",
        description: "Receives the trimmed, validated email. Throw or reject to show the error state. Nothing is sent by the block itself.",
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "ParallaxStackHero",
    importLine: 'import { ParallaxStackHero } from "@/components/blocks/motion-kit/parallax-stack-hero";',
  },
};

export default playgrounds;
