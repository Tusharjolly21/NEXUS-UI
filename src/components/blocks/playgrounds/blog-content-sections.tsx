"use client";

import {
  BlogContentCentered,
  BlogContentEditorial,
  BlogContentWithToc,
  BlogHeaderFeaturedPosts,
  BlogHoverImageCard,
  type BlogHoverImageCardProps,
} from "@/components/blocks/blog-content-sections";
import type { PropDoc } from "@/components/library/prop-controls";
import type { BlockPlaygrounds } from "./types";

const IMPORT = (name: string) => `import { ${name} } from "@/components/blocks/blog-content-sections";`;

const CLASS_NAME: PropDoc = {
  name: "className",
  type: "string",
  description: "Extra classes for the outer section (background, padding, height).",
};

/**
 * Long articles scroll inside a fixed-height frame, the way they sit in a page column, so the
 * header animation, the image and the scroll-revealed sections all fit the preview.
 */
const SCROLL_FRAME = "h-[680px] [&>*]:h-full";

/** The page shows the card on the showcase's grey stage; here it is one card, centred. */
function HoverCardStage(props: BlogHoverImageCardProps) {
  return (
    <section className="flex h-full min-h-full w-full items-center justify-center bg-[#f5f5f7] p-6 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]">
      <BlogHoverImageCard {...props} />
    </section>
  );
}

const playgrounds: BlockPlaygrounds = {
  "blog-centered": {
    Component: BlogContentCentered,
    props: [
      {
        name: "title",
        type: "string",
        description: "The article headline.",
        defaultValue: '"The future of artificial intelligence"',
      },
      {
        name: "dek",
        type: "string",
        description: "Standfirst under the headline. Leave empty to hide it.",
        defaultValue:
          '"AI is leaving the demo stage and settling into the quiet parts of everyday work. Here is what that shift asks of the people who design it."',
      },
      {
        name: "category",
        type: "string",
        description: "Small label above the headline, before the date.",
        defaultValue: '"Feature"',
      },
      {
        name: "author",
        type: "string",
        description: "Byline name. Its first two initials fill the grey monogram.",
        defaultValue: '"Ava Sterling"',
      },
      {
        name: "date",
        type: "string",
        description: "Publish date shown next to the category.",
        defaultValue: '"February 14, 2026"',
      },
      {
        name: "readingTime",
        type: "string",
        description: "Line under the author name.",
        defaultValue: '"6 min read"',
      },
      {
        name: "sectionIdPrefix",
        type: "string",
        description: "Prefix for the ids of the body sections (introduction, key-areas, ethics, conclusion), for anchor links.",
        defaultValue: '"blog-centered"',
      },
      {
        name: "heroImage",
        type: "string (image URL)",
        description: "Wide 16:10 image under the header. Defaults to a stock photo.",
      },
      {
        name: "secondaryImage",
        type: "string (image URL)",
        description: "3:2 figure inside the body, above its caption. Defaults to a circuit-board photo.",
      },
      CLASS_NAME,
    ],
    jsxName: "BlogContentCentered",
    importLine: IMPORT("BlogContentCentered"),
    frameClassName: SCROLL_FRAME,
  },

  "blog-toc": {
    Component: BlogContentWithToc,
    props: [CLASS_NAME],
    jsxName: "BlogContentWithToc",
    importLine: IMPORT("BlogContentWithToc"),
    frameClassName: SCROLL_FRAME,
  },

  "blog-editorial": {
    Component: BlogContentEditorial,
    props: [CLASS_NAME],
    jsxName: "BlogContentEditorial",
    importLine: IMPORT("BlogContentEditorial"),
    frameClassName: SCROLL_FRAME,
  },

  "blog-featured-posts": {
    Component: BlogHeaderFeaturedPosts,
    props: [
      {
        name: "title",
        type: "string",
        description: "The page headline.",
        defaultValue: '"Design notes for faster launches"',
      },
      {
        name: "eyebrow",
        type: "string",
        description: "Grey line above the headline.",
        defaultValue: '"The Northfield journal"',
      },
      {
        name: "description",
        type: "string",
        description: "Paragraph under the headline.",
        defaultValue:
          '"Practical writing on component systems, considered motion, frontend craft, and launch-ready product pages."',
      },
      CLASS_NAME,
    ],
    jsxName: "BlogHeaderFeaturedPosts",
    importLine: IMPORT("BlogHeaderFeaturedPosts"),
    frameClassName: SCROLL_FRAME,
  },

  "blog-hover-card": {
    Component: HoverCardStage,
    props: [
      {
        name: "title",
        type: "string",
        description: "Card headline, clamped to two lines. The whole card links through it.",
        defaultValue: '"Designing launch pages with reusable UI systems"',
      },
      {
        name: "author",
        type: "string",
        description: "Grey line above the title; also names the portrait that rises on hover.",
        defaultValue: '"Noah Williams"',
      },
      {
        name: "tag",
        type: "string",
        description: "Topic pill under the title (truncates past 150px).",
        defaultValue: '"Design systems"',
      },
      {
        name: "date",
        type: "string",
        description: "Date next to the pill.",
        defaultValue: "\"23 May '26\"",
      },
      {
        name: "mainImage",
        type: "string (image URL)",
        description: "The card image. Defaults to a landscape photo.",
      },
      {
        name: "hoverImage",
        type: "string (image URL)",
        description: "Author portrait that slides up out of the image corner on hover or keyboard focus.",
      },
      {
        name: "href",
        type: "string (URL)",
        description: "Where the card links to.",
        defaultValue: '"#"',
      },
      {
        name: "tagClassName",
        type: "string",
        description: "Extra classes for the topic pill.",
      },
      {
        name: "arrowClassName",
        type: "string",
        description: "Extra classes for the blue arrow badge that slides in on hover.",
      },
      CLASS_NAME,
    ],
    jsxName: "BlogHoverImageCard",
    importLine: IMPORT("BlogHoverImageCard"),
  },
};

export default playgrounds;
