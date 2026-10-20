"use client";

import { FloatingDockDesktop } from "./floating-dock-desktop";
import { FloatingDockMobile } from "./floating-dock-mobile";
import type { FloatingDockItem } from "./types";

export type FloatingDockProps = {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
  /** Render tiles as buttons instead of links (previews, in-app actions). */
  disableLinks?: boolean;
  /** Active item's href. Defaults to matching the current pathname. */
  activeHref?: string;
  /** Called with the item when a tile is clicked. */
  onSelect?: (item: FloatingDockItem) => void;
  /** "fixed" (default) pins it to the bottom of the viewport; "inline" renders it in place. Both switch to the compact menu below md. */
  position?: "fixed" | "inline";
  /** Sweeps an invisible pointer across the dock and bounces a tile until someone points at it. */
  autoplay?: boolean;
};

/**
 * A macOS-style dock. Tiles swell under the pointer and push their
 * neighbours aside, a tooltip names each one, and a click bounces the tile
 * like a launching app before a running dot slides under it. Below md it
 * becomes one glass button that springs the tiles up as a stack.
 */
export function FloatingDock({ items, desktopClassName = "", mobileClassName = "", disableLinks, activeHref, onSelect, position = "fixed", autoplay }: FloatingDockProps) {
  const desktop = (
    <FloatingDockDesktop
      items={items}
      className={desktopClassName}
      disableLinks={disableLinks}
      activeHref={activeHref}
      onSelect={onSelect}
      position={position}
      autoplay={autoplay}
    />
  );
  const mobile = (
    <FloatingDockMobile
      items={items}
      className={mobileClassName}
      disableLinks={disableLinks}
      activeHref={activeHref}
      onSelect={onSelect}
      position={position}
    />
  );
  if (position === "fixed") {
    return (
      <>
        {desktop}
        {mobile}
      </>
    );
  }
  return (
    <>
      <div className="hidden md:block">{desktop}</div>
      <div className="md:hidden">{mobile}</div>
    </>
  );
}

export type { FloatingDockItem } from "./types";
export { FloatingDockDesktop } from "./floating-dock-desktop";
export { FloatingDockMobile } from "./floating-dock-mobile";
export { IconContainer } from "./icon-container";
