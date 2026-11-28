"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { InfiniteMovingCards, type InfiniteMovingCardItem } from "@/components/infinite-moving-cards";
import type { Playground } from "../playground-types";

const DEMO_MOVING_CARDS: InfiniteMovingCardItem[] = [
  { id: "a", title: "Launch week, sorted", description: "We rebuilt the landing page in two days and it still feels hand-made.", name: "Ariana Shaw", role: "Product lead, Orbitstack", rating: 5, tags: ["SaaS"] },
  { id: "b", title: "Smooth on every screen", description: "The loop never jumps, even on a 49-inch monitor in the office.", name: "Marcus Lee", role: "Frontend, Sprintops", rating: 5, tags: ["Motion"] },
  { id: "c", title: "People play with it", description: "Visitors grab the reviews and fling them. Time on page went up.", name: "Lena Okafor", role: "Design manager, Cloudframe", rating: 5, tags: ["Growth"] },
  { id: "d", title: "Readable by default", description: "It slows to a stop when you hover, so nobody chases a sentence.", name: "Noah Kimura", role: "Growth designer, Metricly", rating: 4, tags: ["UX"] },
  { id: "e", title: "One less dependency", description: "Replaced two carousel libraries and a custom marquee with this.", name: "Sofia Brandt", role: "Staff engineer, Kitehaus", rating: 5, tags: ["React"] },
];

export const playground: Playground = {
    componentName: "InfiniteMovingCards",
    importPath: "@/components/infinite-moving-cards",
    snippetBaseProps: ["items={items}"],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "direction", label: "Direction", options: ["left", "right"], defaultValue: "left" },
      { kind: "select", prop: "speed", label: "Speed", options: ["slow", "normal", "fast"], defaultValue: "normal" },
      { kind: "range", prop: "gap", label: "Gap", min: 4, max: 40, step: 2, unit: "px", defaultValue: 16 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[720px]">
        <InfiniteMovingCards
          key={String(v.autoplay)}
          items={DEMO_MOVING_CARDS}
          cardClassName="w-[290px]"
          direction={v.direction as "left"}
          speed={v.speed as "normal"}
          gap={v.gap as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
