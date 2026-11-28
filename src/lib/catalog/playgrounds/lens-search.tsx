"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LensSearch } from "@/components/lens-search";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "LensSearch",
    importPath: "@/components/lens-search",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "placeholder", label: "Placeholder", options: ["Search settings", "Search", "Find a setting"], defaultValue: "Search settings" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[420px] justify-center">
        <LensSearch
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          placeholder={v.placeholder as string}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
