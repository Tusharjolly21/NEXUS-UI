"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SkeletonMorph } from "@/components/skeleton-morph";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "SkeletonMorph",
    importPath: "@/components/skeleton-morph",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "author", label: "Author", options: ["Maya Chen", "Leo Park", "Ines Duarte"], defaultValue: "Maya Chen" },
      { kind: "select", prop: "title", label: "Headline", options: ["Designing for the empty state", "Notes on calm interfaces", "Why loading screens lie"], defaultValue: "Designing for the empty state" },
      { kind: "color", prop: "avatarColor", label: "Avatar", options: ["#ff9f0a", "#0a84ff", "#30d158", "#bf5af2", "#ff453a"], defaultValue: "#ff9f0a" },
      { kind: "toggle", prop: "defaultReady", label: "Start loaded", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <SkeletonMorph key={`${String(v.autoplay)}${String(v.defaultReady)}`} autoplay={v.autoplay as boolean}
        author={v.author as string}
        initials={(v.author as string).split(" ").map((w) => w[0]).join("")}
        title={v.title as string}
        avatarColor={v.avatarColor as string}
        defaultReady={v.defaultReady as boolean}
      />
    ),
  };
