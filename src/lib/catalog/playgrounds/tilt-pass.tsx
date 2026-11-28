"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TiltPass } from "@/components/tilt-pass";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "TiltPass",
    importPath: "@/components/tilt-pass",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Title", options: ["Founders Pass", "Backstage", "Season Ticket"], defaultValue: "Founders Pass" },
      { kind: "select", prop: "name", label: "Holder", options: ["Alex Rivera", "Sam Okafor", "Mina Park"], defaultValue: "Alex Rivera" },
      { kind: "toggle", prop: "autoplay", label: "Float on its own", defaultValue: false, startOn: true },
    ],
    render: (v) => <TiltPass title={v.title as string} name={v.name as string} autoplay={v.autoplay as boolean} />,
  };
