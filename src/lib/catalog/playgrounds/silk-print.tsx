"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SilkPrint } from "@/components/silk-print";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "SilkPrint",
    importPath: "@/components/silk-print",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "defaultColourway", label: "Colourway", options: ["indigo", "saffron", "moss"], defaultValue: "indigo" },
      { kind: "select", prop: "price", label: "Price", options: ["$185", "$120", "$240"], defaultValue: "$185" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[460px] justify-center">
        <SilkPrint
          key={`${String(v.autoplay)}-${String(v.defaultColourway)}`}
          autoplay={v.autoplay as boolean}
          defaultColourway={v.defaultColourway as string}
          price={v.price as string}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
