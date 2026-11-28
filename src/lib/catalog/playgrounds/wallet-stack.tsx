"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { WalletStack } from "@/components/wallet-stack";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "WalletStack",
    importPath: "@/components/wallet-stack",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "label", label: "Label", options: ["Wallet", "Cards", "Pay"], defaultValue: "Wallet" },
      { kind: "select", prop: "hint", label: "Hint", options: ["Pick a card.", "Tap a card to see the back.", ""], defaultValue: "Pick a card." },
      { kind: "toggle", prop: "autoplay", label: "Browse by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <WalletStack key={String(v.autoplay)} label={v.label as string} hint={v.hint as string} autoplay={v.autoplay as boolean} />,
  };
