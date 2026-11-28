"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ScrollRevealText } from "@/components/scroll-reveal-text";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ScrollRevealText",
    importPath: "@/components/scroll-reveal-text",
    snippetBaseProps: ['text="We design tools that people actually want to open every single morning."', 'fontSize="30px"'],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accentColor", label: "Accent", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "mode", label: "Reveal by", options: ["word", "character", "line"], defaultValue: "word" },
      { kind: "range", prop: "blurAmount", label: "Blur", min: 0, max: 16, step: 1, unit: "px", defaultValue: 6 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[460px]">
        <ScrollRevealText
          key={`${v.autoplay}-${v.mode}`}
          text="We design tools that people actually want to open every single morning."
          fontSize="30px"
          accentColor={v.accentColor === "#0071e3" ? undefined : (v.accentColor as string)}
          mode={v.mode as "word"}
          blurAmount={v.blurAmount as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
