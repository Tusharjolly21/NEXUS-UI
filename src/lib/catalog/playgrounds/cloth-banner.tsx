"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ClothBanner } from "@/components/cloth-banner";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ClothBanner",
    importPath: "@/components/cloth-banner",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "from", label: "Cloth", options: ["#0071e3", "#ff375f", "#30b158", "#ff9f0a", "#1d1d1f"], defaultValue: "#0071e3" },
      { kind: "select", prop: "title", label: "Title", options: ["Launch Week", "Now in beta", "50% off"], defaultValue: "Launch Week" },
      { kind: "toggle", prop: "autoplay", label: "Gusts", defaultValue: false, startOn: true },
    ],
    render: (v) => <ClothBanner key={String(v.autoplay)} from={v.from as string} title={v.title as string} autoplay={v.autoplay as boolean} />,
  };
