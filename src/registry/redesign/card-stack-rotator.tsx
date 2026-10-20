"use client";

import { CardStackRotator, type CardData } from "@/components/card-stack-rotator";

const CARDS: CardData[] = [
  {
    id: "c1",
    content: "We shipped the new onboarding in **three days**. The stack alone got more replies than the launch email.",
    name: "Sana Whitfield",
    designation: "Head of Design",
    company: "Pebblework",
  },
  {
    id: "c2",
    content: "The motion is **tuned, not decorated**. It feels like the product, not a demo of a library.",
    name: "Diego Marchetti",
    designation: "Staff Engineer",
    company: "Northwake",
  },
  {
    id: "c3",
    content: "Swapped our carousel for this and **time on page doubled**. People flick through every single card.",
    name: "Hana Ito",
    designation: "Growth Lead",
    company: "Tidepool",
  },
  {
    id: "c4",
    content: "Keyboard, screen reader and reduced motion all **just worked** in review. That never happens.",
    name: "Owen Abara",
    designation: "Accessibility Lead",
    company: "Brightfold",
  },
];

export function PreviewCardStackRotatorRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <CardStackRotator cards={CARDS} autoplay cardWidth={compact ? "340px" : "400px"} />
    </div>
  );
}
