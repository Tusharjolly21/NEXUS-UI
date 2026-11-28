"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ParticleReveal } from "@/components/particle-reveal";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "ParticleReveal",
    importPath: "@/components/particle-reveal",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "text", label: "Word", options: ["Reveal", "Launch", "Motion", "Nexus"], defaultValue: "Reveal" },
      { kind: "range", prop: "density", label: "Density (lower is denser)", min: 2, max: 8, step: 0.2, defaultValue: 3.2 },
      { kind: "range", prop: "hoverRadius", label: "Push radius", min: 30, max: 160, step: 5, defaultValue: 70 },
      { kind: "toggle", prop: "autoplay", label: "Ghost cursor", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[560px]">
        <ParticleReveal
          key={`${v.text}-${v.density}-${v.autoplay}`}
          text={String(v.text || "Reveal")}
          density={v.density as number}
          hoverRadius={v.hoverRadius as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
