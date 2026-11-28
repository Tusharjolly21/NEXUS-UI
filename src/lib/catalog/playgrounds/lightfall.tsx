"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { Lightfall } from "@/components/lightfall";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "Lightfall",
    importPath: "@/components/lightfall",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "mode", label: "Palette", options: ["dusk", "tide", "ember"], defaultValue: "dusk" },
      { kind: "range", prop: "speed", label: "Speed", min: 0.2, max: 3, step: 0.05, unit: "×", defaultValue: 1 },
      { kind: "range", prop: "height", label: "Height", min: 300, max: 700, step: 10, unit: "px", defaultValue: 500 },
      { kind: "toggle", prop: "showModes", label: "Palette switcher", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: true },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
      { kind: "range", prop: "volume", label: "Volume", min: 0, max: 1, step: 0.05, unit: "", defaultValue: 0.7 },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[1000px]">
        <Lightfall
          key={String(v.autoplay)}
          enableSound={v.enableSound as boolean}
          volume={v.volume as number}
          autoplay={v.autoplay as boolean}
          mode={v.mode as "dusk"}
          speed={v.speed as number}
          height={v.height as number}
          showModes={v.showModes as boolean}
        />
      </div>
    ),
  };
