"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TextGenerateEffect } from "@/components/text-generate-effect";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TextGenerateEffect",
    importPath: "@/components/text-generate-effect",
    snippetBaseProps: ['text="Build interfaces that feel alive."'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "mode", label: "Split by", options: ["word", "character", "line"], defaultValue: "word" },
      { kind: "range", prop: "duration", label: "Settle", min: 0.15, max: 1.5, step: 0.01, unit: "s", defaultValue: 0.48 },
      { kind: "range", prop: "stagger", label: "Stagger", min: 0.01, max: 0.3, step: 0.01, unit: "s", defaultValue: 0.06 },
      { kind: "toggle", prop: "blur", label: "Blur in", defaultValue: true },
      { kind: "toggle", prop: "lift", label: "Lift", defaultValue: true },
      { kind: "toggle", prop: "showCaret", label: "Caret", defaultValue: true },
    ],
    render: (v) => (
      <TextGenerateEffect
        key={`${String(v.mode)}-${String(v.duration)}-${String(v.stagger)}-${String(v.blur)}-${String(v.lift)}-${String(v.showCaret)}`}
        as="h2"
        autoplay
        text={"Build elegant interfaces that feel alive,\nreadable, and deeply polished."}
        mode={v.mode as "word"}
        duration={v.duration as number}
        stagger={v.stagger as number}
        blur={v.blur as boolean}
        lift={v.lift as boolean}
        showCaret={v.showCaret as boolean}
        className="max-w-2xl text-center text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
      />
    ),
  };
