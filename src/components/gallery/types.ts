/** How a component moves, grouped into the filters people look for. */
export type Interaction = "hover" | "scroll" | "spring" | "glow" | "3d";

export type TileTint = "violet" | "sky" | "peach" | "mint" | "butter" | "pink";

/** Bento footprint, sized to what the component needs. */
export type TileShape = "small" | "wide" | "tall" | "large";

/** Everything the gallery and the detail modal need about one component (plain, serialisable data). */
export type GalleryItem = {
  slug: string;
  name: string;
  description: string;
  categoryLabel: string;
  /** Sidebar section id from the taxonomy, used by the category chips. */
  group: string;
  interactions: Interaction[];
  /** Export name in `@/registry/component-previews`, loaded lazily on the client. */
  exportName: string;
  tint: TileTint;
  shape: TileShape;
  /** Layout width the preview gets before it is scaled into the tile; smaller reads larger. */
  canvas: number;
  /** shadcn registry name: `npx shadcn@latest add @nexus-labs/<install>`. */
  install: string;
};

export const INTERACTION_FILTERS: { value: Interaction | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hover", label: "Hover" },
  { value: "scroll", label: "Scroll" },
  { value: "spring", label: "Spring" },
  { value: "glow", label: "Glow" },
  { value: "3d", label: "3D" },
];

export const SHAPE_CLASSES: Record<TileShape, string> = {
  small: "col-span-1 row-span-1",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
  large: "col-span-2 row-span-2",
};

export const TINT_CLASSES: Record<TileTint, string> = {
  violet: "bg-tint-violet",
  sky: "bg-tint-sky",
  peach: "bg-tint-peach",
  mint: "bg-tint-mint",
  butter: "bg-tint-butter",
  pink: "bg-tint-pink",
};
