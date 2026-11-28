"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SlingshotSend } from "@/components/slingshot-send";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SlingshotSend",
    importPath: "@/components/slingshot-send",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "name", label: "Contact", options: ["Maya", "Jun", "Priya"], defaultValue: "Maya" },
      { kind: "toggle", prop: "autoReply", label: "Canned replies", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Fire by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SlingshotSend key={String(v.autoplay)} name={v.name as string} autoReply={v.autoReply as boolean} autoplay={v.autoplay as boolean} />,
  };
