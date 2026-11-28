"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PageCurl } from "@/components/page-curl";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PageCurl",
    importPath: "@/components/page-curl",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "width", label: "Width", min: 320, max: 440, step: 10, unit: "px", defaultValue: 400 },
      { kind: "toggle", prop: "autoplay", label: "Peek by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <PageCurl key={`${v.width}-${v.autoplay}`} width={v.width as number} autoplay={v.autoplay as boolean} />,
  };
