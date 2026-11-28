"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { Murmur } from "@/components/murmur";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "Murmur",
    importPath: "@/components/murmur",
    defaultFill: "light",
    snippetBaseProps: ["height={560}"],
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Let the swallows fly", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[1040px] overflow-hidden rounded-3xl">
        <Murmur key={String(v.autoplay)} height={560} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
