"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { RealTimeCursors } from "@/components/real-time-cursors";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "RealTimeCursors",
    importPath: "@/components/real-time-cursors",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "youColor", label: "Your colour", options: ["#30d158", "#0071e3", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#30d158" },
      { kind: "select", prop: "title", label: "Board", options: ["Launch board", "Sprint 42", "Brand refresh"], defaultValue: "Launch board" },
      { kind: "toggle", prop: "showYou", label: "Show you", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <RealTimeCursors
        key={String(v.autoplay)}
        youColor={v.youColor as string}
        title={v.title as string}
        showYou={v.showYou as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
