"use client";

import { MorphingNav, type MorphingNavProps } from "@/components/blocks/motion-kit/morphing-nav";
import type { BlockPlaygrounds } from "./types";

/**
 * The nav on its own reads as an empty frame, so the live preview puts a faint page body under it
 * (the same stage the block page uses) and forwards the editable props to the nav.
 */
function MorphingNavPlayground(props: MorphingNavProps) {
  return (
    <div className="flex min-h-[560px] flex-col bg-[#fbfbfd] dark:bg-black">
      <MorphingNav {...props} />
      <div
        className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col items-center gap-4 px-6 pb-16 pt-10 text-center"
        aria-hidden="true"
      >
        <span className="h-3 w-24 rounded-full bg-black/[.06] dark:bg-white/[.08]" />
        <span className="h-10 w-full max-w-[560px] rounded-2xl bg-black/[.05] dark:bg-white/[.07]" />
        <span className="h-10 w-full max-w-[420px] rounded-2xl bg-black/[.05] dark:bg-white/[.07]" />
        <span className="mt-2 h-3 w-full max-w-[480px] rounded-full bg-black/[.04] dark:bg-white/[.06]" />
        <span className="h-3 w-full max-w-[400px] rounded-full bg-black/[.04] dark:bg-white/[.06]" />
      </div>
    </div>
  );
}

const playgrounds: BlockPlaygrounds = {
  "mk-morphing-nav": {
    Component: MorphingNavPlayground,
    props: [
      { name: "brand", type: "string", description: "Wordmark next to the spinning logo tile.", defaultValue: '"Lumen"' },
      {
        name: "accent",
        type: "string",
        description: "Colour of the logo tile, the Get started button, focus rings and the feature card.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "accentDark",
        type: "string",
        description: "Accent in dark mode. Without it, the default blue brightens to #0a84ff and any other accent is reused.",
        defaultValue: '"#0a84ff"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Cycles through the menus every 1.5 s until the visitor hovers, focuses or taps the nav.",
        defaultValue: "true",
      },
      {
        name: "menus",
        type: "MorphingNavMenu[]",
        description: "Top-level items: label, panel width and height, links (title, desc, icon path, colour) and an optional feature card. Items without links render as plain links.",
        defaultValue: "Product, Solutions, Resources, Pricing",
      },
      {
        name: "onNavigate",
        type: "(label: string) => void",
        description: "Called with the label of the link or button that was chosen. Links never navigate on their own.",
      },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    jsxName: "MorphingNav",
    importLine: 'import { MorphingNav } from "@/components/blocks/motion-kit/morphing-nav";',
  },
};

export default playgrounds;
