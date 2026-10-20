"use client";

import { InfiniteMovingCards, type InfiniteMovingCardItem } from "@/components/infinite-moving-cards";

const ITEMS: InfiniteMovingCardItem[] = [
  { id: "a", title: "Launch week, sorted", description: "We rebuilt the landing page in two days and it still feels hand-made.", name: "Ariana Shaw", role: "Product lead, Orbitstack", rating: 5, tags: ["SaaS"] },
  { id: "b", title: "Smooth on every screen", description: "The loop never jumps, even on a 49-inch monitor in the office.", name: "Marcus Lee", role: "Frontend, Sprintops", rating: 5, tags: ["Motion"] },
  { id: "c", title: "People play with it", description: "Visitors grab the reviews and fling them. Time on page went up.", name: "Lena Okafor", role: "Design manager, Cloudframe", rating: 5, tags: ["Growth"] },
  { id: "d", title: "Readable by default", description: "It slows to a stop when you hover, so nobody chases a sentence.", name: "Noah Kimura", role: "Growth designer, Metricly", rating: 4, tags: ["UX"] },
  { id: "e", title: "One less dependency", description: "Replaced two carousel libraries and a custom marquee with this.", name: "Sofia Brandt", role: "Staff engineer, Kitehaus", rating: 5, tags: ["React"] },
];

export function PreviewInfiniteMovingCardsRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-3 p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="w-full max-w-[720px]">
        <InfiniteMovingCards items={ITEMS} autoplay cardClassName={compact ? "w-[260px]" : "w-[290px]"} />
      </div>
      <p className="m-0 text-[12px] text-[#86868b] dark:text-[#a1a1a6]">Grab the belt and fling it.</p>
    </div>
  );
}
