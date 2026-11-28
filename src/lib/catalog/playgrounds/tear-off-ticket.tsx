"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TearOffTicket } from "@/components/tear-off-ticket";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TearOffTicket",
    importPath: "@/components/tear-off-ticket",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Event", options: ["Light & Matter", "Night Market", "Modern Forms"], defaultValue: "Light & Matter" },
      { kind: "toggle", prop: "autoplay", label: "Tear by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <TearOffTicket key={String(v.autoplay)} title={v.title as string} autoplay={v.autoplay as boolean} />,
  };
