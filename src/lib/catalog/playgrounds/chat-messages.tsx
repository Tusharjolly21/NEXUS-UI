"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { ChatMessages } from "@/components/chat-messages";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "ChatMessages",
    importPath: "@/components/chat-messages",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Name", options: ["Nexus AI", "Support", "Maya"], defaultValue: "Nexus AI" },
      { kind: "range", prop: "typingDuration", label: "Typing", min: 400, max: 3000, step: 100, unit: "ms", defaultValue: 1300 },
      { kind: "toggle", prop: "showReplay", label: "Replay button", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ChatMessages
        key={String(v.autoplay)}
        title={v.title as string}
        typingDuration={v.typingDuration as number}
        showReplay={v.showReplay as boolean}
        autoplay={v.autoplay as boolean}
        className="h-[350px]"
      />
    ),
  };
