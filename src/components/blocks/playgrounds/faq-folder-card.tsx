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
      { name: "title", type: "string", defaultValue: '"Help centre"', description: "Card heading." },
      {
        name: "description",
        type: "string",
        defaultValue: '"Answers about your account, billing and security. Search, or pick a topic."',
        description: "Paragraph under the heading.",
      },
      {
        name: "accent",
        type: "string",
        defaultValue: '"#0071e3"',
        description:
          "Accent colour for the open toggle, search focus glow, footer link and focus outlines. Without it: #0071e3, with the link #0066cc light and #2997ff dark.",
      },
      {
        name: "searchPlaceholder",
        type: "string",
        defaultValue: '"Search the help centre"',
        description: "Placeholder of the search field, also its screen-reader label.",
      },
      {
        name: "eyebrow",
        type: "string",
        defaultValue: '""',
        description: "Small accent label above the heading. Empty hides it.",
      },
      { name: "supportTitle", type: "string", defaultValue: '"Still have questions?"', description: "Bold footer line." },
      {
        name: "supportText",
        type: "string",
        defaultValue: '"Our support team replies within four working hours."',
        description: "Smaller footer line under it.",
      },
      { name: "supportLabel", type: "string", defaultValue: '"Message support ›"', description: "Footer link text." },
      { name: "allLabel", type: "string", defaultValue: '"All"', description: "Label of the first topic, which shows every question." },
      {
        name: "emptyLabel",
        type: "string",
        defaultValue: '"No questions match"',
        description: "Start of the empty-state line; the query (or topic) follows in curly quotes.",
      },
      {
        name: "supportHref",
        type: "string",
        defaultValue: '"mailto:hello@example.com"',
        description: "Footer link target.",
        hidden: true,
      },
      {
        name: "items",
        type: "FaqItem[]",
        description:
          "Questions and answers ({ question, answer, tag? }). Each distinct tag becomes a topic in the segmented control after All. Defaults to SEARCHABLE_FAQS, six help-centre questions.",
      },
      { name: "className", type: "string", description: "Extra classes on the outer section." },
    ],
    jsxName: "SearchableFaqSection",
    importLine: "import { SearchableFaqSection } from \"@/components/blocks/faq-folder-card\";",
  },

  "faq-chat": {
    Component: ChatFaqSection,
    props: [
      { name: "title", type: "string", defaultValue: '"Ask before your first box."', description: "Heading on the left." },
      {
        name: "description",
        type: "string",
        defaultValue: '"Tap a question and the roastery answers. Real replies, usually within minutes."',
        description: "Paragraph under the heading.",
      },
      {
        name: "accent",
        type: "string",
        defaultValue: '"#0071e3"',
        description: "Accent colour for the selected chip, the question bubble and focus outlines. Without it: #0071e3.",
      },
      {
        name: "agentName",
        type: "string",
        defaultValue: '"Hearth Roasters"',
        description: "Name in the chat header; its first letter fills the avatar.",
      },
      {
        name: "agentStatus",
        type: "string",
        defaultValue: '"Usually replies in minutes"',
        description: "Grey line under the name.",
      },
      {
        name: "typingSeconds",
        type: "number",
        defaultValue: "0.9",
        min: 0,
        max: 3,
        step: 0.1,
        description: "How long the typing dots show before the answer lands. 0 skips them; reduced motion always does.",
      },
      { name: "timestamp", type: "string", defaultValue: '"Today 10:07"', description: "Centred timestamp above the bubbles." },
      {
        name: "eyebrow",
        type: "string",
        defaultValue: '""',
        description: "Small accent label above the heading. Empty hides it.",
      },
      {
        name: "items",
        type: "FaqItem[]",
        description:
          "Questions and answers ({ question, answer }). Each question is a chip; picking one plays it into the chat window. Defaults to CHAT_FAQS, six coffee-subscription questions.",
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
