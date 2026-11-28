"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ConsentDock } from "@/components/consent-dock";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "ConsentDock",
    importPath: "@/components/consent-dock",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "corner", label: "Corner", options: ["bl", "br", "tl", "tr"], defaultValue: "bl" },
      { kind: "select", prop: "title", label: "Heading", options: ["Cookies, your call.", "Your privacy, your choice.", "A quick word on cookies."], defaultValue: "Cookies, your call." },
      { kind: "toggle", prop: "autoplay", label: "Choose and throw by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[720px]">
        <ConsentDock key={`${String(v.autoplay)}-${String(v.corner)}`} contained corner={v.corner as "bl"} title={v.title as string} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
