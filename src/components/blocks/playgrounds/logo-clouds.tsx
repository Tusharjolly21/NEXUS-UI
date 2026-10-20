"use client";

import LogosBlurFlip from "@/components/blocks/logo-clouds/logos-blur-flip";
import LogoCloudBlur from "@/components/blocks/logo-clouds/logo-cloud-blur";
import LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";
import LogoCloudSpotlight from "@/components/blocks/logo-clouds/logo-cloud-spotlight";
import LogoCloudSwap from "@/components/blocks/logo-clouds/logo-cloud-swap";
import LogoCloudSingleRow from "@/components/blocks/logo-clouds/logo-cloud-single-row";
import { LoupeLogoCloud } from "@/components/blocks/motion-kit/loupe-logo-cloud";
import type { PropDoc } from "@/components/library/prop-controls";
import type { BlockPlaygrounds } from "./types";

const CLASS_NAME: PropDoc = {
  name: "className",
  type: "string",
  description: "Extra classes for the outer section (background, padding, height).",
};

const playgrounds: BlockPlaygrounds = {
  "logos-blur-flip": {
    Component: LogosBlurFlip,
    props: [
      {
        name: "title",
        type: "string",
        description: "Headline above the grid.",
        defaultValue: '"Used by teams that ship every week"',
      },
      {
        name: "subtitle",
        type: "string",
        description: "Line under the headline. Leave empty to hide it.",
        defaultValue: '"From two-person studios to platform teams of four hundred."',
      },
      {
        name: "interval",
        type: "number",
        description: "Milliseconds between flips. Each mark rolls over in turn, 50ms apart.",
        defaultValue: "2600",
        min: 1200,
        max: 8000,
        step: 100,
      },
      {
        name: "logos",
        type: "LogoEntry[]",
        description: "Marks in the grid: { icon, name?, id? }. Defaults to twelve placeholder brand lockups.",
      },
      CLASS_NAME,
    ],
    jsxName: "LogosBlurFlip",
    importLine: 'import LogosBlurFlip from "@/components/blocks/logo-clouds/logos-blur-flip";',
  },

  "logos-blur-reveal": {
    Component: LogoCloudBlur,
    props: [CLASS_NAME],
    jsxName: "LogoCloudBlur",
    importLine: 'import LogoCloudBlur from "@/components/blocks/logo-clouds/logo-cloud-blur";',
  },

  "logos-marquee": {
    Component: LogoCloudMarquee,
    props: [CLASS_NAME],
    jsxName: "LogoCloudMarquee",
    importLine:
      '// npm install react-fast-marquee\nimport LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";',
  },

  "logos-spotlight": {
    Component: LogoCloudSpotlight,
    props: [CLASS_NAME],
    jsxName: "LogoCloudSpotlight",
    importLine: 'import LogoCloudSpotlight from "@/components/blocks/logo-clouds/logo-cloud-spotlight";',
  },

  "logos-swap": {
    Component: LogoCloudSwap,
    props: [
      {
        name: "title",
        type: "string",
        description: "Headline above the slots.",
        defaultValue: '"Chosen by teams who sweat the details"',
      },
      {
        name: "subtitle",
        type: "string",
        description: "Line under the headline. Leave empty to hide it.",
        defaultValue: '"Each of these replaced three tools with one."',
      },
      {
        name: "slots",
        type: "number",
        description: "How many marks are on screen at once. The list is paged through in groups of this size.",
        defaultValue: "6",
        min: 1,
        max: 12,
        step: 1,
      },
      {
        name: "interval",
        type: "number",
        description: "Milliseconds between page swaps.",
        defaultValue: "3200",
        min: 1200,
        max: 8000,
        step: 100,
      },
      {
        name: "stagger",
        type: "number",
        description: "Seconds between one slot swapping and the next, left to right.",
        defaultValue: "0.08",
        min: 0,
        max: 0.3,
        step: 0.01,
      },
      {
        name: "logos",
        type: "LogoEntry[]",
        description: "Marks to page through: { icon, name?, id? }. Defaults to twelve placeholder brand lockups.",
      },
      CLASS_NAME,
    ],
    jsxName: "LogoCloudSwap",
    importLine: 'import LogoCloudSwap from "@/components/blocks/logo-clouds/logo-cloud-swap";',
  },

  "logos-single-row": {
    Component: LogoCloudSingleRow,
    props: [CLASS_NAME],
    jsxName: "LogoCloudSingleRow",
    importLine: 'import LogoCloudSingleRow from "@/components/blocks/logo-clouds/logo-cloud-single-row";',
  },

  "mk-loupe-logo-cloud": {
    Component: LoupeLogoCloud,
    props: [
      {
        name: "title",
        type: "string",
        description: "Headline above the strip.",
        defaultValue: '"Used by teams that ship every week"',
      },
      {
        name: "subtitle",
        type: "string",
        description: "Line under the headline. Leave empty to hide it.",
        defaultValue: '"From two-person studios to platform teams of four hundred."',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Drifts the row of logos sideways on a loop.",
        defaultValue: "true",
      },
      {
        name: "brands",
        type: "LoupeLogoCloudBrand[]",
        description:
          "Wordmarks in the strip: { name, cls, color, colorDark?, mark? }. Defaults to eight placeholder brands.",
      },
      CLASS_NAME,
    ],
    jsxName: "LoupeLogoCloud",
    importLine: 'import { LoupeLogoCloud } from "@/components/blocks/motion-kit/loupe-logo-cloud";',
  },
};

export default playgrounds;
