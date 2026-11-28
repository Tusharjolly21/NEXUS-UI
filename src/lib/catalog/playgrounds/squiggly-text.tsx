"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SquigglyText } from "@/components/squiggly-text";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SquigglyText",
    importPath: "@/components/squiggly-text",
    snippetBaseProps: ['text="a little life"', "underline"],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "underlineColor", label: "Underline", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "stepDuration", label: "Frame time", min: 30, max: 240, step: 10, unit: "ms", defaultValue: 80 },
      { kind: "range", prop: "baseFrequency", label: "Wiggle", min: 0.005, max: 0.06, step: 0.001, defaultValue: 0.02 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <SquigglyText
        key={String(v.autoplay)}
        text="a little life"
        underline
        underlineColor={v.underlineColor === "#0071e3" ? undefined : (v.underlineColor as string)}
        stepDuration={v.stepDuration as number}
        baseFrequency={v.baseFrequency as number}
        autoplay={v.autoplay as boolean}
        className="text-[48px] font-semibold leading-[1.06] tracking-[-0.035em] text-[#1d1d1f] sm:text-[60px] dark:text-[#f5f5f7]"
      />
    ),
  };
