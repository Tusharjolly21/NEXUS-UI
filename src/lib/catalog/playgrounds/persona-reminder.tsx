"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PersonaReminder } from "@/components/persona-reminder";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "PersonaReminder",
    importPath: "@/components/persona-reminder",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[440px] justify-center">
        <PersonaReminder
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
