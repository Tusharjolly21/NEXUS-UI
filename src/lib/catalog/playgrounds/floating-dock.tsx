"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { FloatingDock } from "@/components/floating-dock";
import { FolderOpen as DockFolderOpen, Compass as DockCompass, MessageCircle as DockMessageCircle, Mail as DockMail, Music as DockMusic, Camera as DockCamera, Calendar as DockCalendar, Settings as DockSettings } from "lucide-react";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "FloatingDock",
    importPath: "@/components/floating-dock",
    snippetBaseProps: ["items={items}", 'position="inline"', "disableLinks"],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "activeHref", label: "Running", options: ["none", "#finder", "#messages", "#music", "#photos"], defaultValue: "none" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="relative flex h-[300px] w-full max-w-[640px] items-end justify-center overflow-hidden rounded-[24px] bg-white pb-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]">
        <div
          aria-hidden
          className="absolute inset-0 rounded-[24px] opacity-90 dark:opacity-60"
          style={{
            background:
              "radial-gradient(70% 60% at 20% 20%, rgba(90,200,250,.45), transparent 70%), radial-gradient(60% 60% at 85% 30%, rgba(191,90,242,.35), transparent 70%), radial-gradient(70% 60% at 50% 100%, rgba(255,159,10,.3), transparent 70%)",
          }}
        />
        <div className="relative">
          <FloatingDock
            key={String(v.autoplay)}
            items={[
              { title: "Finder", icon: <DockFolderOpen />, href: "#finder", tint: "linear-gradient(160deg,#64d2ff,#0071e3)" },
              { title: "Safari", icon: <DockCompass />, href: "#safari", tint: "linear-gradient(160deg,#5ac8fa,#0a84ff)" },
              { title: "Messages", icon: <DockMessageCircle />, href: "#messages", tint: "linear-gradient(160deg,#5ef08a,#30b94d)", badge: 3 },
              { title: "Mail", icon: <DockMail />, href: "#mail", tint: "linear-gradient(160deg,#6ac4ff,#1a73e8)" },
              { title: "Music", icon: <DockMusic />, href: "#music", tint: "linear-gradient(160deg,#ff7a8a,#ff2d55)" },
              { title: "Photos", icon: <DockCamera />, href: "#photos", tint: "linear-gradient(160deg,#ffd60a,#ff9f0a)" },
              { title: "Calendar", icon: <DockCalendar />, href: "#calendar" },
              { title: "Settings", icon: <DockSettings />, href: "#settings", tint: "linear-gradient(160deg,#aeaeb2,#636366)" },
            ]}
            position="inline"
            disableLinks
            activeHref={v.activeHref === "none" ? undefined : (v.activeHref as string)}
            autoplay={v.autoplay as boolean}
          />
        </div>
      </div>
    ),
  };
