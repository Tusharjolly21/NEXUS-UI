"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { WarpSpeedCard, WarpTextTrigger } from "@/components/warp-speed-card";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "WarpTextTrigger",
    importPath: "@/components/warp-speed-card",
    snippetBaseProps: ['children="warp speed"'],
    defaultFill: "light",
    controls: [
      {
        kind: "select",
        prop: "beamColor",
        label: "Stars (r,g,b)",
        options: ["255,255,255", "0,113,227", "48,177,88", "255,55,95", "191,90,242", "255,159,10"],
        defaultValue: "255,255,255",
      },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex w-full max-w-[480px] flex-col items-center">
        <WarpSpeedCard className="w-full">
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <h2 className="m-0 text-[36px] font-semibold leading-[1.14] tracking-[-0.035em] sm:text-[40px]">
              Build amazing websites
              <br />
              at{" "}
              <WarpTextTrigger key={String(v.autoplay)} beamColor={v.beamColor as string} autoplay={v.autoplay as boolean}>
                warp speed
              </WarpTextTrigger>
            </h2>
          </div>
        </WarpSpeedCard>
      </div>
    ),
  };
