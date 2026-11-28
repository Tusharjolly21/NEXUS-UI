"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SignAndSeal } from "@/components/sign-and-seal";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SignAndSeal",
    importPath: "@/components/sign-and-seal",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "ink", label: "Ink", options: ["#1d1d1f", "#0071e3", "#5e5ce6", "#ff375f", "#30b158"], defaultValue: "#1d1d1f" },
      { kind: "select", prop: "name", label: "Name", options: ["Alex Rivera", "Jordan Lee", "Sam Okafor"], defaultValue: "Alex Rivera" },
      { kind: "toggle", prop: "autoplay", label: "Sign by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SignAndSeal key={String(v.autoplay)} ink={v.ink as string} name={v.name as string} autoplay={v.autoplay as boolean} />,
  };
