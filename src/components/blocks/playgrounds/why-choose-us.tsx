"use client";

import WhyChooseUsBento from "@/components/blocks/animated-bento-grid";
import { AtsBentoGrid } from "@/components/blocks/ats-bento-grid";
import SpotlightBentoGrid from "@/components/blocks/spotlight-bento-grid";
import { LiveDemoBento } from "@/components/blocks/motion-kit/live-demo-bento";
import { PulseBento } from "@/components/blocks/motion-kit/pulse-bento";
import type { PropDoc } from "@/components/library/prop-controls";
import type { BlockPlaygrounds } from "./types";

const CLASS_NAME: PropDoc = {
  name: "className",
  type: "string",
  description: "Extra classes for the outer section (background, padding, height).",
};

const playgrounds: BlockPlaygrounds = {
  "bento-mentorship": {
    Component: WhyChooseUsBento,
    props: [
      {
        name: "title",
        type: "string",
        description: "Section headline on the left.",
        defaultValue: '"Interview prep goes faster with people in your corner."',
      },
      {
        name: "description",
        type: "string",
        description: "Supporting line beside the headline (below it on phones).",
        defaultValue:
          '"Daily practice, a cohort at your level, and engineers who have sat on the other side of the table."',
      },
      {
        name: "accent",
        type: "string",
        description:
          "Hex colour for the \"You\" monogram, sent bubbles, today's bar and the speaker ring. Left at #0071e3, today's value keeps its #2997ff dark-mode tint.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "mentorCount",
        type: "number",
        description: "Figure the mentors tile counts up to.",
        defaultValue: "140",
        min: 0,
        max: 9999,
        step: 1,
      },
      {
        name: "solvedCount",
        type: "number",
        description: "Figure the progress tile counts up to.",
        defaultValue: "38",
        min: 0,
        max: 9999,
        step: 1,
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Lets the help chat type itself and the live room rotate speakers. Off, both sit still.",
        defaultValue: "true",
      },
      {
        name: "mentors",
        type: "BentoMentor[]",
        description: "Rows of the mentor list ({ name, role, slot }); the first 6 are shown.",
        defaultValue: "WHY_CHOOSE_US_MENTORS",
      },
      CLASS_NAME,
    ],
    jsxName: "WhyChooseUsBento",
    importLine: 'import WhyChooseUsBento from "@/components/blocks/animated-bento-grid";',
    frameClassName: "bg-[#f5f5f7] dark:bg-black",
  },

  "bento-ats": {
    Component: AtsBentoGrid,
    props: [
      {
        name: "title",
        type: "string",
        description: "Section headline on the left.",
        defaultValue: '"Hire on evidence, not instinct."',
      },
      {
        name: "description",
        type: "string",
        description: "Supporting line on the right of the headline (below it on phones).",
        defaultValue:
          '"Screen applicants against the skills a role needs, keep every stage moving, and give your panel the same picture of each candidate."',
      },
      CLASS_NAME,
    ],
    jsxName: "AtsBentoGrid",
    importLine: 'import { AtsBentoGrid } from "@/components/blocks/ats-bento-grid";',
    frameClassName: "bg-[#f5f5f7] dark:bg-black",
  },

  "bento-spotlight": {
    Component: SpotlightBentoGrid,
    props: [
      {
        name: "title",
        type: "string",
        description: "Section headline. Leave it empty to hide the whole header.",
        defaultValue: '"Find the one that fits."',
      },
      {
        name: "description",
        type: "string",
        description: "Line under the headline. Leave it empty to hide it.",
        defaultValue: '"Four devices, one family. Hover a tile to bring it forward."',
      },
      CLASS_NAME,
    ],
    jsxName: "SpotlightBentoGrid",
    importLine: 'import SpotlightBentoGrid from "@/components/blocks/spotlight-bento-grid";',
    frameClassName: "bg-[#f5f5f7] dark:bg-black",
  },

  "mk-pulse-bento": {
    Component: PulseBento,
    props: [
      {
        name: "title",
        type: "string",
        description: "Section headline.",
        defaultValue: '"Your product\'s pulse, at a glance."',
      },
      {
        name: "eyebrow",
        type: "string",
        description: "Small accent-coloured line above the headline.",
        defaultValue: '"Live everywhere"',
      },
      {
        name: "accent",
        type: "string",
        description: "Eyebrow, focus ring and picked-reaction outline. Omit it for Apple blue that brightens in dark mode.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Keeps the heart-rate tile beating and its trace scrolling while it is on screen.",
        defaultValue: "true",
      },
      CLASS_NAME,
    ],
    jsxName: "PulseBento",
    importLine: 'import { PulseBento } from "@/components/blocks/motion-kit/pulse-bento";',
  },

  "mk-live-demo-bento": {
    Component: LiveDemoBento,
    props: [
      {
        name: "title",
        type: "string",
        description: "Section headline.",
        defaultValue: '"Built for the way your team actually works."',
      },
      {
        name: "eyebrow",
        type: "string",
        description: "Small accent-coloured line above the headline.",
        defaultValue: '"Everything in one place"',
      },
      {
        name: "accent",
        type: "string",
        description: "Colour of the eyebrow, chart, caret, workflow and shield. Omit it for Apple blue that brightens in dark mode.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Runs the typing, chart readout, cursors, workflow and scan demos on a loop while on screen.",
        defaultValue: "true",
      },
      CLASS_NAME,
    ],
    jsxName: "LiveDemoBento",
    importLine: 'import { LiveDemoBento } from "@/components/blocks/motion-kit/live-demo-bento";',
  },
};

export default playgrounds;
