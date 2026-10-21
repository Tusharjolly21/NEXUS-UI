/**
 * Facts for the "alternative to" pages. Everything said about another library comes from that
 * library's own website (checked 2026-10-21) and is limited to what the site states. Anything a
 * site did not state is left out rather than guessed. Re-check before changing these.
 */
export type Alternative = {
  slug: string;
  /** Name as the library writes it. */
  name: string;
  /** Other spellings people search for. */
  alsoSpelled?: string;
  url: string;
  host: string;
  /** What it is, in one sentence. */
  summary: string;
  stack: string;
  install: string;
  free: string;
  paid: string;
  /** Reasons someone may pick it over Nexus UI. */
  chooseThem: string[];
};

export const CHECKED_ON = "October 2026";

export const alternatives: Alternative[] = [
  {
    slug: "magic-ui",
    name: "Magic UI",
    url: "https://magicui.design",
    host: "magicui.design",
    summary: "A library of animated React components and effects that it calls a companion for shadcn/ui.",
    stack: "React, TypeScript, Tailwind CSS and Motion.",
    install: "Its homepage does not describe the install method; the source is on GitHub.",
    free: "150+ free, open-source animated components and effects, as it states.",
    paid: "Magic UI Pro adds 50+ blocks and templates, as it states. We did not find a price on its homepage.",
    chooseThem: [
      "You want free, open-source animated effects to sit alongside shadcn/ui.",
      "You mainly need landing-page effects and its Pro blocks and templates fit what you are building.",
    ],
  },
  {
    slug: "react-bits",
    name: "React Bits",
    alsoSpelled: "reactbits",
    url: "https://reactbits.dev",
    host: "reactbits.dev",
    summary: "A library of free, open-source React components for animated text, backgrounds, interactive cards and micro-interactions.",
    stack: "React, with JavaScript or TypeScript and plain CSS or Tailwind variants.",
    install: "Copy the source, or install with its CLI.",
    free: "Free and open source, with components grouped as text animations, animations, components, backgrounds and micro-interactions.",
    paid: "Its navigation lists a Pro section. We did not find details or a price on its homepage.",
    chooseThem: [
      "You want a JavaScript or plain-CSS version of a component, not only TypeScript with Tailwind.",
      "You are looking for individual animated text effects and backgrounds you can copy in.",
    ],
  },
  {
    slug: "aceternity-ui",
    name: "Aceternity UI",
    url: "https://ui.aceternity.com",
    host: "ui.aceternity.com",
    summary: "A library of copy-paste React components, blocks, templates and landing pages.",
    stack: "React, Tailwind CSS and Motion, for Next.js, TanStack Start, Vite and React Router.",
    install: "Copy and paste, or install through the shadcn CLI. It also lists adding blocks through an AI agent connected over MCP.",
    free: "118+ free components, as it states.",
    paid: "Its All-Access pass unlocks the premium components, 182+ blocks and 17 templates it lists, as a one-time payment with lifetime access. We did not find a price on its homepage.",
    chooseThem: [
      "You want the largest set of ready-made blocks and templates it lists, and you are happy with a one-time pass.",
      "You want to add blocks through an AI agent over MCP, which it describes on its homepage.",
    ],
  },
];

export function getAlternative(slug: string) {
  return alternatives.find((a) => a.slug === slug);
}
