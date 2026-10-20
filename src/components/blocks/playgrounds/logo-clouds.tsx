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
    props: [
      {
        name: "title",
        type: "string",
        description: "Headline above the grid.",
        defaultValue: '"The teams behind the products you open every morning."',
      },
      {
        name: "subtitle",
        type: "string",
        description: "Line under the headline. Leave empty to hide it.",
        defaultValue: '"Hover a name to bring it into focus."',
      },
      { name: "count", type: "number", description: "How many marks to show. Defaults to every logo passed.", defaultValue: "12", min: 1, max: 12, step: 1 },
      { name: "restOpacity", type: "number", description: "Opacity of every mark while nothing is hovered.", defaultValue: "0.5", min: 0.1, max: 1, step: 0.05 },
      { name: "recedeOpacity", type: "number", description: "Opacity of the other marks while one is hovered.", defaultValue: "0.2", min: 0, max: 1, step: 0.05 },
      { name: "recedeBlur", type: "number", description: "Blur in px on the other marks while one is hovered.", defaultValue: "2", min: 0, max: 8, step: 0.5 },
      { name: "hoverScale", type: "number", description: "Scale of the hovered mark.", defaultValue: "1.06", min: 1, max: 1.3, step: 0.01 },
      {
        name: "logos",
        type: "Logo[]",
        description: "Marks: { name, Icon, color, wordmark? } from logos.tsx. Defaults to twelve placeholder brand lockups.",
        defaultValue: "LOGOS",
      },
      CLASS_NAME,
    ],
    jsxName: "LogoCloudBlur",
    importLine: 'import LogoCloudBlur from "@/components/blocks/logo-clouds/logo-cloud-blur";',
  },

  "logos-marquee": {
    Component: LogoCloudMarquee,
    props: [
      { name: "eyebrow", type: "string", description: "Small grey label above the headline. Leave empty to hide it.", defaultValue: '"Customers"' },
      {
        name: "title",
        type: "string",
        description: "Headline above the band.",
        defaultValue: '"Running in production at 2,400 teams, from two-person studios to public companies."',
      },
      { name: "speed", type: "number", description: "Drift speed in px per second.", defaultValue: "34", min: 5, max: 200, step: 1 },
      { name: "rows", type: "number", description: "One row, or two rows drifting in opposite directions (the list split in half).", defaultValue: "2", min: 1, max: 2, step: 1 },
      { name: "pauseOnHover", type: "boolean", description: "Pause a row while the pointer is over it.", defaultValue: "true" },
      { name: "fadeEdges", type: "boolean", description: "Fade the band out at both edges with a mask.", defaultValue: "true" },
      {
        name: "logos",
        type: "Logo[]",
        description: "Marks (up to 24): { name, Icon, color, wordmark? } from logos.tsx. Defaults to twelve placeholder brand lockups.",
        defaultValue: "LOGOS",
      },
      CLASS_NAME,
    ],
    jsxName: "LogoCloudMarquee",
    importLine:
      '// npm install react-fast-marquee\nimport LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";',
  },

  "logos-spotlight": {
    Component: LogoCloudSpotlight,
    props: [
      { name: "title", type: "string", description: "Headline above the panel.", defaultValue: '"Twelve partners, one integration standard."' },
      {
        name: "subtitle",
        type: "string",
        description: "Line under the headline. Leave empty to hide it.",
        defaultValue: '"Move across the grid to light up each partner."',
      },
      { name: "spotlightRadius", type: "number", description: "Radius of the circle of light in px.", defaultValue: "240", min: 80, max: 600, step: 10 },
      { name: "dimOpacity", type: "number", description: "Strength of the marks outside the light. Unset keeps the built-in 25% ink.", defaultValue: "0.25", min: 0, max: 1, step: 0.05 },
      { name: "count", type: "number", description: "How many marks to show. Defaults to every logo passed.", defaultValue: "12", min: 1, max: 12, step: 1 },
      {
        name: "logos",
        type: "Logo[]",
        description: "Marks: { name, Icon, color, wordmark? } from logos.tsx. Defaults to twelve placeholder brand lockups.",
        defaultValue: "LOGOS",
      },
      CLASS_NAME,
    ],
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
    props: [
      {
        name: "title",
        type: "string",
        description: "Small grey line above the row. Leave empty to hide it.",
        defaultValue: '"Product teams at these companies plan their week with us."',
      },
      { name: "count", type: "number", description: "How many marks to show, from the start of logos.", defaultValue: "6", min: 1, max: 12, step: 1 },
      { name: "restOpacity", type: "number", description: "Opacity of every mark while nothing is hovered.", defaultValue: "0.55", min: 0.1, max: 1, step: 0.05 },
      { name: "recedeOpacity", type: "number", description: "Opacity of the other marks while one is hovered.", defaultValue: "0.22", min: 0, max: 1, step: 0.01 },
      { name: "lift", type: "number", description: "How far the hovered mark lifts, in px.", defaultValue: "4", min: 0, max: 16, step: 1 },
      { name: "hoverScale", type: "number", description: "Scale of the hovered mark.", defaultValue: "1.06", min: 1, max: 1.3, step: 0.01 },
      {
        name: "logos",
        type: "Logo[]",
        description: "Marks: { name, Icon, color, wordmark? } from logos.tsx. Defaults to twelve placeholder brand lockups.",
        defaultValue: "LOGOS",
      },
      CLASS_NAME,
    ],
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
