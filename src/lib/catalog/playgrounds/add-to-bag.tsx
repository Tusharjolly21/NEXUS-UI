"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AddToBag } from "@/components/add-to-bag";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "AddToBag",
    importPath: "@/components/add-to-bag",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "max", label: "Most you can add", min: 1, max: 20, step: 1, unit: "", defaultValue: 9 },
      { kind: "select", prop: "currency", label: "Currency", options: ["$", "\u20AC", "\u00A3"], defaultValue: "$" },
      { kind: "toggle", prop: "autoplay", label: "Add and remove by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[380px]">
        <AddToBag key={String(v.autoplay)} max={v.max as number} currency={v.currency as string} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
