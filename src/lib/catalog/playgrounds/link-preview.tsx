"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LinkPreview } from "@/components/link-preview";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "LinkPreview",
    importPath: "@/components/link-preview",
    snippetBaseProps: ['href="https://motion.dev/docs/react-transitions"', 'title="Transitions"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "width", label: "Card width", min: 200, max: 380, step: 10, unit: "px", defaultValue: 300 },
      { kind: "range", prop: "height", label: "Picture height", min: 90, max: 220, step: 2, unit: "px", defaultValue: 168 },
      { kind: "range", prop: "delay", label: "Delay", min: 0, max: 0.8, step: 0.02, unit: "s", defaultValue: 0.08 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex h-full min-h-[360px] w-full items-end justify-center pb-16">
        <p className="max-w-[440px] text-center text-[21px] font-medium leading-[1.45] tracking-[-0.02em]">
          Read the{" "}
          <LinkPreview
            key={String(v.autoplay)}
            href="https://motion.dev/docs/react-transitions"
            title="Transitions"
            description="Springs, tweens and inertia, and when to use each."
            width={v.width as number}
            height={v.height as number}
            delay={v.delay as number}
            autoplay={v.autoplay as boolean}
          >
            spring guide
          </LinkPreview>{" "}
          before you tune the motion, then ship it.
        </p>
      </div>
    ),
  };
