"use client";

import { FloatingDockDesktop } from "./floating-dock-desktop";
import { FloatingDockMobile } from "./floating-dock-mobile";
import type { FloatingDockItem } from "./types";

export type FloatingDockProps = {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
};

export function FloatingDock({ items, desktopClassName, mobileClassName }: FloatingDockProps) {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
}

export type { FloatingDockItem } from "./types";
export { FloatingDockDesktop } from "./floating-dock-desktop";
export { FloatingDockMobile } from "./floating-dock-mobile";
export { IconContainer } from "./icon-container";
