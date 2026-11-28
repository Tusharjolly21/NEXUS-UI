"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { NoResults } from "@/components/no-results";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "NoResults",
    importPath: "@/components/no-results",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "query", label: "Search", options: ["invoce march", "invioce q3", "invoice march"], defaultValue: "invoce march" },
      { kind: "range", prop: "maxRows", label: "Max rows", min: 1, max: 6, step: 1, defaultValue: 6 },
      { kind: "select", prop: "noun", label: "Noun", options: ["invoices", "bills", "payments"], defaultValue: "invoices" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <NoResults key={`${String(v.autoplay)}-${String(v.query)}`} autoplay={v.autoplay as boolean}
        query={v.query as string}
        noun={v.noun as string}
        maxRows={v.maxRows as number}
      />
    ),
  };
