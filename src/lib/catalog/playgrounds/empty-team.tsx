"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { EmptyTeam } from "@/components/empty-team";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "EmptyTeam",
    importPath: "@/components/empty-team",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "seats", label: "Seats", min: 3, max: 8, step: 1, defaultValue: 6 },
      { kind: "select", prop: "domain", label: "Domain", options: ["orbitly.com", "fernhill.io", "vela.app"], defaultValue: "orbitly.com" },
      { kind: "select", prop: "placeholder", label: "Placeholder", options: ["name@company.com", "teammate@company.com", "Invite by email"], defaultValue: "name@company.com" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <EmptyTeam key={`${String(v.autoplay)}-${String(v.domain)}-${String(v.placeholder)}-${String(v.seats)}`} autoplay={v.autoplay as boolean}
        seats={v.seats as number}
        domain={v.domain as string}
        placeholder={v.placeholder as string}
      />
    ),
  };
