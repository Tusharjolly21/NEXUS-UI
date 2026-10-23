"use client";

import LogosBlurFlip from "@/components/blocks/logo-clouds/logos-blur-flip";
import LogoCloudBlur from "@/components/blocks/logo-clouds/logo-cloud-blur";
import LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";
import LogoCloudSpotlight from "@/components/blocks/logo-clouds/logo-cloud-spotlight";
import LogoCloudSwap from "@/components/blocks/logo-clouds/logo-cloud-swap";
import LogoCloudSingleRow from "@/components/blocks/logo-clouds/logo-cloud-single-row";
import LogoCloudShelf from "@/components/blocks/logo-clouds/logo-cloud-shelf";
import { FilterableLogoWall } from "@/components/blocks/motion-kit/filterable-logo-wall";
import { LogoStories } from "@/components/blocks/motion-kit/logo-stories";
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
      { name: "interval", type: "number", description: "Milliseconds between flips. Each of the eight slots follows the one before by 70ms.", defaultValue: "3000", min: 1200, max: 8000, step: 100 },
      {
        name: "logos",
        type: "Logo[]",
        description: "Brands: { name, Icon, color, wordmark? } from logos.tsx. Defaults to twenty invented brands.",
        defaultValue: "LOGOS",
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
      { name: "count", type: "number", description: "How many marks to show, from the start of logos.", defaultValue: "12", min: 1, max: 12, step: 1 },
      { name: "recedeOpacity", type: "number", description: "Opacity of the other marks while one is focused.", defaultValue: "0.25", min: 0, max: 1, step: 0.05 },
      { name: "recedeBlur", type: "number", description: "Blur in px on the other marks while one is focused.", defaultValue: "3", min: 0, max: 8, step: 0.5 },
      { name: "hoverScale", type: "number", description: "Scale of the focused mark.", defaultValue: "1.08", min: 1, max: 1.3, step: 0.01 },
      { name: "autoplay", type: "boolean", description: "Walks the focus along the grid by itself until someone touches it. Pauses off screen and never runs under reduced motion.", defaultValue: "false" },
      {
        name: "logos",
        type: "Logo[]",
        description: "Brands: { name, Icon, color, wordmark? } from logos.tsx. Defaults to twenty invented brands.",
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
        defaultValue: '"Running in production at 2,400 teams."',
      },
      { name: "speed", type: "number", description: "Drift speed of the first row in px per second. The second row is a little slower.", defaultValue: "34", min: 5, max: 200, step: 1 },
      { name: "rows", type: "1 | 2", description: "One row, or two rows drifting in opposite directions (the list split in half).", defaultValue: "2", min: 1, max: 2, step: 1 },
      { name: "pauseOnHover", type: "boolean", description: "Ease a row to a stop while the pointer is over it.", defaultValue: "true" },
      { name: "fadeEdges", type: "boolean", description: "Fade the band out at both edges with a mask.", defaultValue: "true" },
      {
        name: "logos",
        type: "Logo[]",
        description: "Brands: { name, Icon, color, wordmark? } from logos.tsx. Defaults to twenty invented brands.",
        defaultValue: "LOGOS",
      },
      CLASS_NAME,
    ],
    jsxName: "LogoCloudMarquee",
    importLine: 'import LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";',
  },

  "logos-spotlight": {
    Component: LogoCloudSpotlight,
    props: [
      { name: "title", type: "string", description: "Headline above the panel.", defaultValue: '"Twelve partners, one integration standard."' },
      { name: "subtitle", type: "string", description: "Line under the headline. Leave empty to hide it.", defaultValue: '"Move across the grid to light up each partner."' },
      { name: "radius", type: "number", description: "Radius of the light, in px.", defaultValue: "200", min: 80, max: 400, step: 10 },
      { name: "autoplay", type: "boolean", description: "Drifts the light along a figure-eight by itself until someone touches the panel. Pauses off screen and never runs under reduced motion.", defaultValue: "false" },
      {
        name: "logos",
        type: "Logo[]",
        description: "Brands: { name, Icon, color, wordmark? } from logos.tsx. Defaults to twenty invented brands.",
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
      { name: "title", type: "string", description: "Headline above the grid.", defaultValue: '"Chosen by teams who sweat the details"' },
      { name: "subtitle", type: "string", description: "Line under the headline. Leave empty to hide it.", defaultValue: '"Each of these replaced three tools with one."' },
      { name: "interval", type: "number", description: "Milliseconds between page swaps. The rotation holds while the pointer is over the grid.", defaultValue: "3000", min: 1200, max: 8000, step: 100 },
      { name: "stagger", type: "number", description: "Seconds between one slot swapping and the next, left to right.", defaultValue: "0.05", min: 0, max: 0.3, step: 0.01 },
      {
        name: "logos",
        type: "Logo[]",
        description: "Brands: { name, Icon, color, wordmark? } from logos.tsx. Defaults to twenty invented brands.",
        defaultValue: "LOGOS",
      },
      CLASS_NAME,
    ],
    jsxName: "LogoCloudSwap",
    importLine: 'import LogoCloudSwap from "@/components/blocks/logo-clouds/logo-cloud-swap";',
  },

  "logos-single-row": {
    Component: LogoCloudSingleRow,
    props: [
      { name: "title", type: "string", description: "The line on the left. Leave empty to hide it.", defaultValue: '"Product teams at these companies plan their week with us."' },
      { name: "interval", type: "number", description: "Milliseconds between rotations. The row holds while one mark is hovered.", defaultValue: "2600", min: 1600, max: 8000, step: 100 },
      { name: "recedeOpacity", type: "number", description: "Opacity of the other marks while one is hovered.", defaultValue: "0.3", min: 0, max: 1, step: 0.05 },
      { name: "lift", type: "number", description: "How far the hovered mark lifts, in px.", defaultValue: "4", min: 0, max: 16, step: 1 },
      {
        name: "logos",
        type: "Logo[]",
        description: "Brands: { name, Icon, color, wordmark? } from logos.tsx. Defaults to twenty invented brands.",
        defaultValue: "LOGOS",
      },
      CLASS_NAME,
    ],
    jsxName: "LogoCloudSingleRow",
    importLine: 'import LogoCloudSingleRow from "@/components/blocks/logo-clouds/logo-cloud-single-row";',
  },

  "logos-shelf": {
    Component: LogoCloudShelf,
    props: [
      { name: "eyebrow", type: "string", description: "Small blue label above the headline. Leave empty to hide it.", defaultValue: '"Integrations"' },
      { name: "title", type: "string", description: "Headline above the shelves.", defaultValue: '"Works with the tools your team already lives in."' },
      { name: "rows", type: "number", description: "Number of shelves. Odd ones drift left, even ones right.", defaultValue: "3", min: 1, max: 5, step: 1 },
      { name: "speed", type: "number", description: "Drift speed of the first shelf in px per second. Each next shelf is 5 faster.", defaultValue: "22", min: 5, max: 120, step: 1 },
      {
        name: "logos",
        type: "Logo[]",
        description: "Brands: { name, Icon, color, wordmark? } from logos.tsx. Defaults to twenty invented brands.",
        defaultValue: "LOGOS",
      },
      CLASS_NAME,
    ],
    jsxName: "LogoCloudShelf",
    importLine: 'import LogoCloudShelf from "@/components/blocks/logo-clouds/logo-cloud-shelf";',
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
  "mk-logo-stories": {
    Component: LogoStories,
    props: [
      {
        name: "autoplay",
        type: "boolean",
        description:
          "Glides the highlight from logo to logo on a timer until the visitor hovers, focuses or clicks a logo. Pauses while the card is hovered, off screen or in a hidden tab. Never runs under reduced motion.",
        defaultValue: "false",
      },
      {
        name: "heading",
        type: "string",
        description: "Small caps line above the logos.",
        defaultValue: '"Teams shipping with Nexus"',
      },
      {
        name: "stories",
        type: "LogoStory[]",
        description:
          "One per logo: { name, mark (inline SVG, drawn in a 20 x 20 box), metric, what, quote, who }. Eight fit well. Use a stable array.",
        defaultValue: "DEFAULT_LOGO_STORIES",
      },
      {
        name: "dwell",
        type: "number",
        description: "Milliseconds each story stays up while autoplaying.",
        defaultValue: "4500",
        min: 1500,
        max: 10000,
        step: 500,
      },
      { name: "readLabel", type: "string", description: "Label of the link under each quote.", defaultValue: '"Read the story \u2192"' },
      {
        name: "onReadStory",
        type: "(story: LogoStory) => void",
        description: "Called when the visitor presses the read-the-story link. Nothing navigates.",
      },
      CLASS_NAME,
    ],
    jsxName: "LogoStories",
    importLine: 'import { LogoStories } from "@/components/blocks/motion-kit/logo-stories";',
  },
  "mk-filterable-logo-wall": {
    Component: FilterableLogoWall,
    props: [
      {
        name: "autoplay",
        type: "boolean",
        description:
          "Steps through the filters every 2.6 s until the visitor picks one. Pauses off screen and in a hidden tab. Never runs under reduced motion.",
        defaultValue: "false",
      },
      { name: "heading", type: "string", description: "Small line above the count.", defaultValue: '"Customers"' },
      { name: "allLabel", type: "string", description: "Label of the pill that shows everything.", defaultValue: '"All"' },
      {
        name: "logos",
        type: "FilterableLogo[]",
        description:
          "Customers: { name, industry, mark (inline SVG, drawn in a 20 x 20 box) }. The filter pills are built from the distinct industries. Use a stable array.",
        defaultValue: "DEFAULT_FILTERABLE_LOGOS",
      },
      {
        name: "onFilterChange",
        type: "(filter: string) => void",
        description: "Called when the visitor picks a filter pill.",
      },
      CLASS_NAME,
    ],
    jsxName: "FilterableLogoWall",
    importLine: 'import { FilterableLogoWall } from "@/components/blocks/motion-kit/filterable-logo-wall";',
  },
};

export default playgrounds;
