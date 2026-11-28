"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SignupForm } from "@/components/signup-form";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SignupForm",
    importPath: "@/components/signup-form",
    snippetBaseProps: ['subtitle="Start free. No card needed."'],
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "showNameField", label: "Name fields", defaultValue: true },
      { kind: "toggle", prop: "showConfirmPasswordField", label: "Confirm password", defaultValue: true },
      { kind: "toggle", prop: "showSocialLogins", label: "Social buttons", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex w-full max-w-[420px] justify-center">
        <SignupForm
          key={`${v.autoplay}-${v.showNameField}-${v.showConfirmPasswordField}`}
          subtitle="Start free. No card needed."
          showNameField={v.showNameField as boolean}
          showConfirmPasswordField={v.showConfirmPasswordField as boolean}
          showSocialLogins={v.showSocialLogins as boolean}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
