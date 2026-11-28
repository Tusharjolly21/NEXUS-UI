"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { StatefulButton } from "@/components/stateful-button";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "StatefulButton",
    importPath: "@/components/stateful-button",
    snippetBaseProps: ['loadingText="Publishing"', 'successText="Published"', "onClick={publish}"],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "variant", label: "Variant", options: ["default", "outline", "ghost", "destructive"], defaultValue: "default" },
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "toggle", prop: "showSuccess", label: "Success state", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <StatefulButton
        key={String(v.autoplay)}
        variant={v.variant as "default"}
        size={v.size as "md"}
        showSuccess={v.showSuccess as boolean}
        autoplay={v.autoplay as boolean}
        loadingText="Publishing"
        successText="Published"
        onClick={() => new Promise<void>((resolve) => setTimeout(resolve, 1400))}
      >
        Publish post
      </StatefulButton>
    ),
  };
