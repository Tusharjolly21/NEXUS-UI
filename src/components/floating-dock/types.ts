import type * as React from "react";

export type FloatingDockItem = {
  /** Shown in the tooltip and used as the accessible name. */
  title: string;
  /** Usually a lucide icon. It is sized to the tile for you. */
  icon: React.ReactNode;
  href: string;
  /** Tile background, any CSS colour or gradient. With a tint the icon turns white. */
  tint?: string;
  /** Small red counter on the tile. */
  badge?: number | string;
};
