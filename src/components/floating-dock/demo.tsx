"use client";

import { BookOpen, DollarSign, Home, LayoutGrid, Layers, Search, User } from "lucide-react";
import { FloatingDock } from "./floating-dock";

const demoItems = [
  { title: "Home", icon: <Home />, href: "/", tint: "linear-gradient(160deg,#5ac8fa,#0071e3)" },
  { title: "Components", icon: <LayoutGrid />, href: "/components", tint: "linear-gradient(160deg,#bf5af2,#5e5ce6)" },
  { title: "Templates", icon: <Layers />, href: "/templates", tint: "linear-gradient(160deg,#ffd60a,#ff9f0a)" },
  { title: "Pricing", icon: <DollarSign />, href: "/pricing", tint: "linear-gradient(160deg,#30d158,#0b8f6a)" },
  { title: "Docs", icon: <BookOpen />, href: "/docs/installation" },
  { title: "Search", icon: <Search />, href: "/search" },
  { title: "Profile", icon: <User />, href: "/login" },
];

export function FloatingDockDemo() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] bg-[#f5f5f7] pb-40 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-16 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0071e3] dark:text-[#0a84ff]">Navigation</p>
        <h2 className="text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.04em]">Floating dock</h2>
        <p className="mx-auto max-w-md text-[15px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">
          Move the pointer along the dock at the bottom of the page. Tiles swell and make room for each other; click one and it bounces like a launching app. On a phone it becomes a single button that springs the tiles up as a stack.
        </p>
      </div>
      <FloatingDock items={demoItems} />
    </div>
  );
}
