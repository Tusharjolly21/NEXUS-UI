"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BlackHoleDelete } from "@/components/black-hole-delete";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "BlackHoleDelete",
    importPath: "@/components/black-hole-delete",
    defaultFill: "dark",
    controls: [
      { kind: "select", prop: "count", label: "Messages", options: ["3", "4", "5", "6"], defaultValue: "6" },
      { kind: "range", prop: "height", label: "Height", min: 540, max: 700, step: 10, unit: "px", defaultValue: 540 },
      { kind: "toggle", prop: "autoplay", label: "Ghost pointer", defaultValue: false, startOn: true },
    ],
    render: (v) => {
      const inbox = [
        { title: "Ava Chen", body: "Design review moved to Thursday at 3?", time: "9:41", color: "#5e5ce6" },
        { title: "Build bot", body: "Deploy failed: step 4 of 7 timed out", time: "9:12", color: "#ff9f0a" },
        { title: "Marco", body: "Lunch? Ramen again or somewhere new", time: "8:55", color: "#30d158" },
        { title: "Motion Weekly", body: "Twelve interfaces that move like physics", time: "8:20", color: "#64d2ff" },
        { title: "Sam Rivera", body: "Sent the redlines, one open question on IP", time: "Tue", color: "#ff375f" },
        { title: "Flash sale", body: "48 hours left. Your cart is waiting", time: "Mon", color: "#bf5af2" },
      ];
      return (
        <div className="mx-auto w-full max-w-[720px]">
          <BlackHoleDelete
            messages={inbox.slice(0, Number(v.count) || 6)}
            height={v.height as number}
            autoplay={v.autoplay as boolean}
          />
        </div>
      );
    },
  };
