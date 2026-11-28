"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LanyardBadge } from "@/components/lanyard-badge";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "LanyardBadge",
    importPath: "@/components/lanyard-badge",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "strap", label: "Strap", options: ["#0071e3", "#ff375f", "#30d158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "select", prop: "tag", label: "Tag", options: ["Speaker", "Attendee", "Staff", "Press"], defaultValue: "Speaker" },
      { kind: "toggle", prop: "autoplay", label: "Nudge by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <LanyardBadge key={String(v.autoplay)} strap={v.strap as string} tag={v.tag as string} autoplay={v.autoplay as boolean} />,
  };
