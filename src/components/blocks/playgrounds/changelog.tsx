"use client";

import { ChangelogPile, DEFAULT_CHANGELOG_ENTRIES } from "@/components/blocks/motion-kit/changelog-pile";
import type { BlockPlaygrounds } from "./types";

const playgrounds: BlockPlaygrounds = {
  "mk-changelog-pile": {
    Component: ChangelogPile,
    props: [
      { name: "title", type: "string", description: "Main heading.", defaultValue: "\"What's new\"" },
      { name: "eyebrow", type: "string", description: "Small blue label above the heading.", defaultValue: '"Changelog"' },
      {
        name: "description",
        type: "string",
        description: "Paragraph under the heading.",
        defaultValue: '"Everything we shipped since September. Pick the cards up and throw them, or switch to the list to read."',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Cycles the filter (New, Improved, Fixed, All) every 3.2 s in Pile view until the section is touched. Off under reduced motion.",
        defaultValue: "false",
      },
      { name: "updatesLabel", type: "string", description: "Subscribe link beside the Pile / List switch.", defaultValue: '"Get updates"' },
      { name: "docsLabel", type: "string", description: "Link inside an opened note.", defaultValue: '"Read the docs"' },
      {
        name: "entries",
        type: "ChangelogEntry[]",
        description:
          'Release notes, newest first: kind ("New" | "Improved" | "Fixed"), version, date, title, body (on the card) and more (in the opened note). Pass a stable array.',
        defaultValue: "DEFAULT_CHANGELOG_ENTRIES",
      },
      {
        name: "onAction",
        type: '(action: "updates" | "docs", entry?: ChangelogEntry) => void',
        description: 'Called when "Get updates" or "Read the docs" is pressed (with the open entry for "docs"). Links never navigate on their own.',
      },
      { name: "className", type: "string", description: "Extra classes on the section." },
    ],
    baseProps: { entries: DEFAULT_CHANGELOG_ENTRIES },
    jsxName: "ChangelogPile",
    importLine: 'import { ChangelogPile } from "@/components/blocks/motion-kit/changelog-pile";',
    frameClassName: "bg-white dark:bg-black",
  },
};

export default playgrounds;
