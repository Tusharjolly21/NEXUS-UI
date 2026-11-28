"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { PhoneInput } from "@/components/phone-input";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "PhoneInput",
    importPath: "@/components/phone-input",
    snippetBaseProps: ['label="Mobile number"'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultCountry", label: "Country", options: ["US", "GB", "IN", "JP", "DE", "BR"], defaultValue: "US" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[340px]">
        <PhoneInput
          key={`${v.defaultCountry}-${v.autoplay}`}
          label="Mobile number"
          defaultCountry={v.defaultCountry as string}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
