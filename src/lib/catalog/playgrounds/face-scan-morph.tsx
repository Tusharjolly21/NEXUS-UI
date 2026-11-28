"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FaceScanMorph } from "@/components/face-scan-morph";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "FaceScanMorph",
    importPath: "@/components/face-scan-morph",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "amount", label: "Amount", options: ["$24.00", "$8.50", "$129.00"], defaultValue: "$24.00" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[340px] justify-center">
        <FaceScanMorph
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          amount={v.amount as string}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
