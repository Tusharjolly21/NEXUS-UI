"use client";

import { Calendar, Camera, Compass, FolderOpen, Mail, MessageCircle, Music, Settings } from "lucide-react";
import { FloatingDock, FloatingDockDesktop } from "@/components/floating-dock";

const ITEMS = [
  { title: "Finder", icon: <FolderOpen />, href: "#finder", tint: "linear-gradient(160deg,#64d2ff,#0071e3)" },
  { title: "Safari", icon: <Compass />, href: "#safari", tint: "linear-gradient(160deg,#5ac8fa,#0a84ff)" },
  { title: "Messages", icon: <MessageCircle />, href: "#messages", tint: "linear-gradient(160deg,#5ef08a,#30b94d)", badge: 3 },
  { title: "Mail", icon: <Mail />, href: "#mail", tint: "linear-gradient(160deg,#6ac4ff,#1a73e8)" },
  { title: "Music", icon: <Music />, href: "#music", tint: "linear-gradient(160deg,#ff7a8a,#ff2d55)" },
  { title: "Photos", icon: <Camera />, href: "#photos", tint: "linear-gradient(160deg,#ffd60a,#ff9f0a)" },
  { title: "Calendar", icon: <Calendar />, href: "#calendar" },
  { title: "Settings", icon: <Settings />, href: "#settings", tint: "linear-gradient(160deg,#aeaeb2,#636366)" },
];

function Wallpaper() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 rounded-[24px] opacity-90 dark:opacity-60"
      style={{
        background:
          "radial-gradient(70% 60% at 20% 20%, rgba(90,200,250,.45), transparent 70%), radial-gradient(60% 60% at 85% 30%, rgba(191,90,242,.35), transparent 70%), radial-gradient(70% 60% at 50% 100%, rgba(255,159,10,.3), transparent 70%)",
      }}
    />
  );
}

export function PreviewFloatingDockRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[640px] flex-col items-center gap-3">
        <div className="relative flex h-[330px] w-full items-end sm:h-[260px] justify-center overflow-hidden rounded-[24px] bg-white pb-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]">
          <Wallpaper />
          <div className="relative hidden sm:block">
            <FloatingDockDesktop items={compact ? ITEMS.slice(0, 6) : ITEMS} position="inline" disableLinks autoplay />
          </div>
          <div className="relative sm:hidden">
            <FloatingDock items={ITEMS.slice(0, 4)} position="inline" disableLinks />
          </div>
        </div>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Glide along the dock, then click a tile.</span>
      </div>
    </div>
  );
}
