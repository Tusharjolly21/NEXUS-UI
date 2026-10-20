"use client";

import { DEFAULT_DRIFT_GALLERY_WORKS, DriftGallery } from "@/components/blocks/motion-kit/drift-gallery";
import type { BlockPlaygrounds } from "./types";

const playgrounds: BlockPlaygrounds = {
  "mk-drift-gallery": {
    Component: DriftGallery,
    props: [
      { name: "title", type: "string", description: "Heading in the bottom-left corner.", defaultValue: '"Ten artists, no edges."' },
      { name: "eyebrow", type: "string", description: "Small uppercase line above the heading.", defaultValue: '"Spring exhibition"' },
      {
        name: "autoplay",
        type: "boolean",
        description: "Slow idle drift whenever nobody is dragging. Off under reduced motion; dragging and inertia work either way.",
        defaultValue: "true",
      },
      { name: "hint", type: "string", description: "Pill in the bottom-right corner (wide screens).", defaultValue: '"Drag anywhere · click to open"' },
      { name: "keyboardHint", type: "string", description: "Pill shown instead while the wall has keyboard focus.", defaultValue: '"Arrows to move · Enter to open"' },
      { name: "closeLabel", type: "string", description: "Button that closes an open piece.", defaultValue: '"Back to the wall"' },
      {
        name: "works",
        type: "DriftGalleryWork[]",
        description:
          "Pieces on the wall (repeated to fill 8 × 6 sheets): title, by, year, and either src (an image, cropped to 4:5) or palette + pattern for a locally drawn poster.",
        defaultValue: "DEFAULT_DRIFT_GALLERY_WORKS",
      },
      { name: "onOpen", type: "(work: DriftGalleryWork, index: number) => void", description: "Called when a piece is opened by click, tap or Enter." },
      { name: "className", type: "string", description: "Extra classes on the wall (it is 600px tall; override with an h-* class)." },
    ],
    baseProps: { works: DEFAULT_DRIFT_GALLERY_WORKS },
    jsxName: "DriftGallery",
    importLine: 'import { DriftGallery } from "@/components/blocks/motion-kit/drift-gallery";',
    frameClassName: "bg-[#f5f5f7] dark:bg-black",
  },
};

export default playgrounds;
