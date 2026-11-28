"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FrostInput } from "@/components/frost-input";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "FrostInput",
    importPath: "@/components/frost-input",
    defaultFill: "dark",
    controls: [
      { kind: "select", prop: "headline", label: "Headline", options: ["Join the cold list.", "Get the first thaw.", "Keep this one cool."], defaultValue: "Join the cold list." },
      { kind: "select", prop: "done", label: "Confirmation", options: ["You’re on the list.", "Frozen in. See you soon.", "Cold storage confirmed."], defaultValue: "You’re on the list." },
      { kind: "range", prop: "height", label: "Height", unit: "px", min: 320, max: 560, step: 10, defaultValue: 420 },
      { kind: "toggle", prop: "autoplay", label: "Ghost demo", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full overflow-hidden rounded-2xl bg-[#081624] p-3">
        <FrostInput
          key={`${v.height}-${v.autoplay}`}
          headline={v.headline as string}
          done={v.done as string}
          height={v.height as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
