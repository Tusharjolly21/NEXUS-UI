"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { StandingCalendar } from "@/components/standing-calendar";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "StandingCalendar",
    importPath: "@/components/standing-calendar",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "weeks", label: "Weeks", min: 12, max: 36, step: 1, defaultValue: 30 },
      { kind: "toggle", prop: "autoplay", label: "Stand up by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <StandingCalendar key={String(v.autoplay)} weeks={v.weeks as number} autoplay={v.autoplay as boolean} />,
  };
