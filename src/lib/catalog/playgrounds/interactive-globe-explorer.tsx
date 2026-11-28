"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { InteractiveGlobeExplorer } from "@/components/interactive-globe-explorer";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "InteractiveGlobeExplorer",
    importPath: "@/components/interactive-globe-explorer",
    snippetBaseProps: ['className="h-[420px]"'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Heading", options: ["Our offices", "Where we work", "Find us"], defaultValue: "Our offices" },
      // ids from the built-in list: 4 London, 6 Tokyo, 3 New York, 8 Sydney, 11 Mumbai
      { kind: "select", prop: "initialLocationId", label: "First city (id)", options: ["4", "6", "3", "8", "11"], defaultValue: "4" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <InteractiveGlobeExplorer
        key={`${v.initialLocationId}-${v.autoplay}`}
        className="h-[420px] max-w-[720px]"
        title={v.title as string}
        initialLocationId={v.initialLocationId as string}
        autoplay={v.autoplay as boolean}
      />
    ),
  };
