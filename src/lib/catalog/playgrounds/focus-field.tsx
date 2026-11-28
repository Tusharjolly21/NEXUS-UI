"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FocusField } from "@/components/focus-field";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "FocusField",
    importPath: "@/components/focus-field",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "palette", label: "Palette", options: ["ember",  "lagoon",  "dusk"], defaultValue: "ember" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[520px] justify-center">
        <FocusField
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          palette={v.palette as "ember" | "lagoon" | "dusk"}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
