"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { OtpInput } from "@/components/otp-input";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "OtpInput",
    importPath: "@/components/otp-input",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "length", label: "Digits", min: 4, max: 8, step: 2, defaultValue: 6 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <OtpInput autoplay={v.autoplay ? "48291357".slice(0, v.length as number) : undefined} key={`${v.length}-${v.autoplay}`} accent={v.accent as string} length={v.length as number} verify={(c) => c.startsWith("4829")} />
    ),
  };
