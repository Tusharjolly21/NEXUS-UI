"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GlassLogin } from "@/components/glass-login-stack";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "GlassLogin",
    importPath: "@/components/glass-login-stack",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "brand", label: "Brand", options: ["Halo", "Orbit", "Nexus"], defaultValue: "Halo" },
      { kind: "select", prop: "title", label: "Title", options: ["Welcome back", "Sign in", "Good to see you"], defaultValue: "Welcome back" },
      { kind: "toggle", prop: "backdrop", label: "Aurora backdrop", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex w-full max-w-[720px] justify-center">
        <GlassLogin
          key={String(v.autoplay)}
          brand={v.brand as string}
          title={v.title as string}
          backdrop={v.backdrop as boolean}
          autoplay={v.autoplay as boolean}
          onSignUp={() => {}}
        />
      </div>
    ),
  };
