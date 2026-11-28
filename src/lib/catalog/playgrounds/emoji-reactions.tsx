"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { EmojiReactions } from "@/components/emoji-reactions";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "EmojiReactions",
    importPath: "@/components/emoji-reactions",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#5b8def", "#0071e3", "#ff3b5c", "#10b981", "#f59e0b"], defaultValue: "#5b8def" },
      { kind: "select", prop: "message", label: "Message", options: ["Shipped the new onboarding flow", "Lunch at 1?", "v2 is live"], defaultValue: "Shipped the new onboarding flow" },
    ],
    render: (v) => <EmojiReactions accent={v.accent as string} message={v.message as string} />,
  };
