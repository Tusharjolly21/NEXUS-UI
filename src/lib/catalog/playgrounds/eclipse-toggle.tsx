"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SiteEclipseToggle } from "@/registry/signature/motion-kit-batch-26";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "EclipseToggle",
    importPath: "@/components/eclipse-toggle",
    defaultFill: "light",
    blurb: "This one is wired to the page: flip it and the whole site goes dark at sunset, or light at sunrise.",
    controls: [
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    // wired to this site's theme: flipping it changes the whole page with it
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[380px] justify-center">
        <SiteEclipseToggle enableSound={v.enableSound as boolean} />
      </div>
    ),
  };
