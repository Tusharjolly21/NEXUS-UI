"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FlightTracker } from "@/components/flight-tracker";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "FlightTracker",
    importPath: "@/components/flight-tracker",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "from", label: "From", options: ["NYC", "SFO", "DEL"], defaultValue: "NYC" },
      { kind: "select", prop: "to", label: "To", options: ["LON", "NRT", "DXB"], defaultValue: "LON" },
      { kind: "toggle", prop: "autoplay", label: "Fly", defaultValue: true },
    ],
    render: (v) => <FlightTracker from={v.from as string} to={v.to as string} autoplay={v.autoplay as boolean} />,
  };
