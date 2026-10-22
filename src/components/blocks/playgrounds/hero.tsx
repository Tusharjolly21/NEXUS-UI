"use client";

import { SpotlightHero } from "@/components/blocks/motion-kit/spotlight-hero";
import { ParallaxStackHero } from "@/components/blocks/motion-kit/parallax-stack-hero";
import { KineticHero } from "@/components/blocks/motion-kit/kinetic-hero";
import { CursorCrowdHero } from "@/components/blocks/motion-kit/cursor-crowd-hero";
import { XrayHero } from "@/components/blocks/motion-kit/xray-hero";
import { CircuitHero } from "@/components/blocks/motion-kit/circuit-hero";
import { FlipDotHero } from "@/components/blocks/motion-kit/flip-dot-hero";
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
  "mk-cursor-crowd-hero": {
    Component: CursorCrowdHero,
    props: [
      {
        name: "autoplay",
        type: "boolean",
        description:
          "Runs the teammates: one selects and retypes the last word, one tugs the button, one drops a comment. Stops once the visitor presses or types in the section, and never runs under reduced motion.",
        defaultValue: "false",
      },
      {
        name: "words",
        type: "string[]",
        description: "Words the last word of the headline is retyped through. The first is shown at rest. Use a stable array.",
        defaultValue: '["faster", "together", "tonight", "better"]',
      },
      {
        name: "onAction",
        type: '(label: "primary" | "secondary") => void',
        description: "Called with the button that was pressed. Buttons never navigate on their own.",
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "CursorCrowdHero",
    importLine: 'import { CursorCrowdHero } from "@/components/blocks/motion-kit/cursor-crowd-hero";',
  },
  "mk-xray-hero": {
    Component: XrayHero,
    props: [
      {
        name: "autoplay",
        type: "boolean",
        description:
          "Sweeps the lens across the page every 2 s until the visitor first moves a pointer over it. Never runs under reduced motion.",
        defaultValue: "false",
      },
      {
        name: "onAction",
        type: '(label: "primary" | "secondary") => void',
        description: "Called with the button that was pressed. Buttons never navigate on their own.",
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "XrayHero",
    importLine: 'import { XrayHero } from "@/components/blocks/motion-kit/xray-hero";',
  },
  "mk-circuit-hero": {
    Component: CircuitHero,
    props: [
      {
        name: "autoplay",
        type: "boolean",
        description:
          "Lets a ghost pointer wander over the board, warming and firing traces, until the visitor first moves a pointer over it. Ambient signals run either way and pause off screen.",
        defaultValue: "false",
      },
      {
        name: "onAction",
        type: '(label: "primary" | "secondary") => void',
        description: "Called with the button that was pressed. Buttons never navigate on their own.",
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "CircuitHero",
    importLine: 'import { CircuitHero } from "@/components/blocks/motion-kit/circuit-hero";',
  },
  "mk-flip-dot-hero": {
    Component: FlipDotHero,
    props: [
      {
        name: "autoplay",
        type: "boolean",
        description:
          "Cycles the sign through the words every 2.8 s until the visitor presses the board, types or presses a key. Never runs under reduced motion.",
        defaultValue: "false",
      },
      {
        name: "words",
        type: "string[]",
        description:
          "Words the sign cycles through. Each is upper-cased, cut to the characters the dot font has (A to Z, 0 to 9, space, ! and ?) and capped at 7 characters. Use a stable array.",
        defaultValue: '["HELLO", "BUILD", "SHIP IT", "NEXUS"]',
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    jsxName: "FlipDotHero",
    importLine: 'import { FlipDotHero } from "@/components/blocks/motion-kit/flip-dot-hero";',
  },
  "mk-kinetic-hero": {
    Component: KineticHero,
    props: [
      { name: "lead", type: "string", description: "First line of the headline. Its letters tumble up into place.", defaultValue: '"Build something"' },
      { name: "subject", type: "string", description: "Word before the turning drum on the second line.", defaultValue: '"people"' },
      {
        name: "sub",
        type: "string",
        description: "Paragraph under the headline.",
        defaultValue: '"The component library for interfaces that feel made, not assembled."',
      },
      { name: "primaryLabel", type: "string", description: "Blue button that lands at the end.", defaultValue: '"Start building"' },
      { name: "secondaryLabel", type: "string", description: "Outlined button beside it.", defaultValue: '"Browse components"' },
      {
        name: "autoplay",
        type: "boolean",
        description: "Contained mode only: scrolls the box to the end and back in a loop until the first wheel, touch, click or key.",
        defaultValue: "false",
      },
      { name: "hint", type: "string", description: "Scroll cue at the bottom; fades out as the letters arrive.", defaultValue: '"Scroll"' },
      {
        name: "words",
        type: "string[]",
        description: "Endings the drum turns through, one face each. Screen readers hear the first; the drum stops on the last.",
        defaultValue: '["love", "remember", "share", "pay for"]',
      },
      {
        name: "contained",
        type: "boolean",
        description:
          "Off: a 260vh section scrubbed by page scroll with a sticky stage. On: its own scroll box `height` px tall, for frames that clip overflow (the preview here uses it).",
        defaultValue: "false",
        hidden: true,
      },
      { name: "height", type: "number", description: "Scroll box height in contained mode, in px.", defaultValue: "640", min: 400, max: 1000, step: 20, hidden: true },
      { name: "onAction", type: '(label: "primary" | "secondary") => void', description: "Called with the button that was pressed. Buttons never navigate on their own." },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    baseProps: { contained: true },
    jsxName: "KineticHero",
    importLine: 'import { KineticHero } from "@/components/blocks/motion-kit/kinetic-hero";',
    frameClassName: "bg-[#f5f5f7] dark:bg-black",
  },
};

export default playgrounds;
