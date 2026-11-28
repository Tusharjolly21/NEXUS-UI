"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CardStackRotator } from "@/components/card-stack-rotator";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "CardStackRotator",
    importPath: "@/components/card-stack-rotator",
    snippetBaseProps: ["cards={cards}"],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "stackOffset", label: "Peek", min: 0, max: 30, step: 1, unit: "px", defaultValue: 14 },
      { kind: "range", prop: "maxVisible", label: "Visible", min: 1, max: 4, step: 1, defaultValue: 3 },
      { kind: "select", prop: "direction", label: "Throw", options: ["forward", "backward"], defaultValue: "forward" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <CardStackRotator
        key={String(v.autoplay)}
        cards={[
          { id: "c1", content: "We shipped the new onboarding in **three days**. The stack alone got more replies than the launch email.", name: "Sana Whitfield", designation: "Head of Design", company: "Pebblework" },
          { id: "c2", content: "The motion is **tuned, not decorated**. It feels like the product, not a demo of a library.", name: "Diego Marchetti", designation: "Staff Engineer", company: "Northwake" },
          { id: "c3", content: "Swapped our carousel for this and **time on page doubled**. People flick through every single card.", name: "Hana Ito", designation: "Growth Lead", company: "Tidepool" },
          { id: "c4", content: "Keyboard, screen reader and reduced motion all **just worked** in review. That never happens.", name: "Owen Abara", designation: "Accessibility Lead", company: "Brightfold" },
        ]}
        cardWidth="400px"
        stackOffset={v.stackOffset as number}
        maxVisible={v.maxVisible as number}
        direction={v.direction as "forward"}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
