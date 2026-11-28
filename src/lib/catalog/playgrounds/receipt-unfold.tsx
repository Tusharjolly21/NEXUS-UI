"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ReceiptUnfold } from "@/components/receipt-unfold";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ReceiptUnfold",
    importPath: "@/components/receipt-unfold",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "total", label: "Total", options: ["$49.68", "$120.96", "$8.99"], defaultValue: "$49.68" },
      { kind: "toggle", prop: "autoplay", label: "Unfold by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ReceiptUnfold key={String(v.autoplay)} total={v.total as string} autoplay={v.autoplay as boolean} />,
  };
