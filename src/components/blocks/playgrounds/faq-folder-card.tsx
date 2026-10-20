"use client";

import { ChatFaqSection, FaqFolderCard, SearchableFaqSection } from "@/components/blocks/faq-folder-card";
import { InstantSearchFaq } from "@/components/blocks/motion-kit/instant-search-faq";
import type { BlockPlaygrounds } from "./types";

const FAQ_IMPORT = "import { FaqFolderCard } from \"@/components/blocks/faq-folder-card\";";

const playgrounds: BlockPlaygrounds = {
  "faq-folder": {
    Component: FaqFolderCard,
    props: [
      { name: "title", type: "string", defaultValue: '"Questions, answered"', description: "Large heading on the left." },
      { name: "eyebrow", type: "string", defaultValue: '"FAQ"', description: "Small grey label above the heading." },
      {
        name: "description",
        type: "string",
        defaultValue:
          '"The things clients ask before we start. If yours isn\'t here, call or write and a designer will reply the same day."',
        description: "Paragraph under the heading.",
      },
      {
        name: "phone",
        type: "string",
        defaultValue: '"+44 20 7946 0321"',
        description: "Phone number on the first contact pill; spaces are stripped for the tel: link.",
      },
      {
        name: "email",
        type: "string",
        defaultValue: '"studio@northfield.design"',
        description: "Email address on the second contact pill, linked with mailto:.",
      },
      {
        name: "items",
        type: "FaqItem[]",
        description: "Questions and answers ({ question, answer, tag? }). Defaults to four studio questions; the first starts open.",
      },
      { name: "className", type: "string", description: "Extra classes on the outer section." },
    ],
    jsxName: "FaqFolderCard",
    importLine: FAQ_IMPORT,
  },

  "faq-searchable": {
    Component: SearchableFaqSection,
    props: [
      {
        name: "items",
        type: "FaqItem[]",
        description:
          "Questions and answers ({ question, answer, tag? }). Each distinct tag becomes a topic in the segmented control after All. Defaults to six help-centre questions.",
      },
      { name: "className", type: "string", description: "Extra classes on the outer section." },
    ],
    jsxName: "SearchableFaqSection",
    importLine: "import { SearchableFaqSection } from \"@/components/blocks/faq-folder-card\";",
  },

  "faq-chat": {
    Component: ChatFaqSection,
    props: [
      {
        name: "items",
        type: "FaqItem[]",
        description:
          "Questions and answers ({ question, answer }). Each question is a chip; picking one plays it into the chat window. Defaults to six coffee-subscription questions.",
      },
      { name: "className", type: "string", description: "Extra classes on the outer section." },
    ],
    jsxName: "ChatFaqSection",
    importLine: "import { ChatFaqSection } from \"@/components/blocks/faq-folder-card\";",
  },

  "mk-instant-search-faq": {
    Component: InstantSearchFaq,
    baseProps: { autoplay: true },
    props: [
      {
        name: "title",
        type: "string",
        defaultValue: '"Ask us anything. We probably wrote it down."',
        description: "Large heading on the left.",
      },
      {
        name: "accent",
        type: "string",
        defaultValue: '"#0071e3"',
        description: "Accent colour for the eyebrow, focus rings and the Ask the team link. Without it: #0071e3 light, #0a84ff dark.",
      },
      {
        name: "autoplay",
        type: "boolean",
        defaultValue: "true",
        description:
          "Types a few searches by itself until the visitor touches the section. The component's own default is false.",
      },
      { name: "eyebrow", type: "string", defaultValue: '"FAQ"', description: "Small accent label above the heading." },
      {
        name: "description",
        type: "string",
        defaultValue: '"Still stuck? Our team replies in a few minutes, most hours of the day."',
        description: "Paragraph under the heading.",
      },
      {
        name: "faqs",
        type: "InstantSearchFaqItem[]",
        description: "Questions as { q, a, cat }. Each distinct cat becomes a category chip after All. Defaults to seven SaaS questions.",
      },
      {
        name: "onAskTeam",
        type: "(query: string) => void",
        description: "Runs from the Ask the team link shown when nothing matches, with the trimmed search text.",
      },
      { name: "className", type: "string", description: "Extra classes on the outer section." },
    ],
    jsxName: "InstantSearchFaq",
    importLine: "import { InstantSearchFaq } from \"@/components/blocks/motion-kit/instant-search-faq\";",
  },
};

export default playgrounds;
