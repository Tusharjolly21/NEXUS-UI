"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TickSlider } from "@/components/tick-slider";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TickSlider",
    importPath: "@/components/tick-slider",
    snippetBaseProps: ['label="Volume"', 'unit="%"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "ticks", label: "Ticks", min: 12, max: 48, step: 1, defaultValue: 36 },
      { kind: "range", prop: "step", label: "Step", min: 1, max: 25, step: 1, defaultValue: 1 },
      { kind: "range", prop: "magnify", label: "Wave", min: 0, max: 1.2, step: 0.05, unit: "×", defaultValue: 0.55 },
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff9f0a", "#bf5af2", "#ff3b30"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "showValue", label: "Number", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TickSlider key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        label="Volume"
        unit="%"
        defaultValue={62}
        ticks={v.ticks as number}
        step={v.step as number}
        magnify={v.magnify as number}
        size={v.size as "md"}
        accent={v.accent === "#0071e3" ? undefined : (v.accent as string)}
        showValue={v.showValue as boolean}
      />
    ),
  };
