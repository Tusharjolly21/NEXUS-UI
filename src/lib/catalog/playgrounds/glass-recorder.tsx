"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GlassRecorder } from "@/components/glass-recorder";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "GlassRecorder",
    importPath: "@/components/glass-recorder",
    defaultFill: "dark",
    snippetBaseProps: ["height={460}"],
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Demo it by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "ink", label: "Icon colour", options: ["white", "dark"], defaultValue: "white" },
      { kind: "select", prop: "listen", label: "Voice", options: ["microphone", "simulate"], defaultValue: "microphone" },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[860px] overflow-hidden rounded-3xl">
        <GlassRecorder
          key={`${v.autoplay}-${v.ink}-${v.listen}`}
          height={460}
          autoplay={v.autoplay as boolean}
          ink={v.ink as "white" | "dark"}
          listen={v.listen as "microphone" | "simulate"}
        />
      </div>
    ),
  };
