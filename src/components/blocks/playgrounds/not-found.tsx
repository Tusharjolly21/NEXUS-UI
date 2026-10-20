"use client";

import { Gravity404 } from "@/components/blocks/motion-kit/gravity-404";
import type { BlockPlaygrounds } from "./types";

const playgrounds: BlockPlaygrounds = {
  "mk-gravity-404": {
    Component: Gravity404,
    props: [
      { name: "headline", type: "string", description: "Headline under the code. Each word falls on its own.", defaultValue: '"This page fell apart."' },
      {
        name: "message",
        type: "string",
        description: "Paragraph under the headline (falls as one piece).",
        defaultValue: '"The link might be old, or the page moved. Pick yourself up and try one of these."',
      },
      { name: "code", type: "string", description: "The big code. Each character falls on its own.", defaultValue: '"404"' },
      {
        name: "autoplay",
        type: "boolean",
        description: "Drops the page and puts it back every 3.6 s until the page is touched. Off under reduced motion.",
        defaultValue: "false",
      },
      { name: "primaryLabel", type: "string", description: "Blue button.", defaultValue: '"Go home"' },
      { name: "secondaryLabel", type: "string", description: "Grey button.", defaultValue: '"Search the docs"' },
      { name: "brand", type: "string", description: "Wordmark at the top left.", defaultValue: '"Nexus"' },
      { name: "fallLabel", type: "string", description: "Toggle label while the page is intact.", defaultValue: '"Let it fall"' },
      { name: "restoreLabel", type: "string", description: "Toggle label once everything has fallen.", defaultValue: '"Put it back"' },
      { name: "hint", type: "string", description: "Hint pill at the top while the pieces are loose.", defaultValue: '"Grab, throw, or swipe through them."' },
      { name: "navLinks", type: "string[]", description: "Nav link labels at the top right.", defaultValue: '["Product", "Pricing", "Docs"]' },
      {
        name: "onAction",
        type: '(action: "primary" | "secondary" | "nav", label: string) => void',
        description: "Called with the button or nav link that was pressed and its label. Nothing navigates on its own.",
      },
      { name: "className", type: "string", description: "Extra classes on the outer element." },
    ],
    jsxName: "Gravity404",
    importLine: 'import { Gravity404 } from "@/components/blocks/motion-kit/gravity-404";',
    frameClassName: "bg-white dark:bg-black",
  },
};

export default playgrounds;
