import type { TileFit } from "@/lib/catalog/tile-fit";

/** How you interact with a component — the verbs people filter by. */
export type Interaction = "hover" | "press" | "drag" | "scroll" | "type" | "3d" | "loop" | "sound";

export type TileTint = "violet" | "sky" | "peach" | "mint" | "butter" | "pink";

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
  /** Where the component draws and how big its tile is at each breakpoint. */
  fit: TileFit;
  /** shadcn registry name: `npx shadcn@latest add @nexus-labs/<install>`. */
  install: string;
  /** Added in the last few weeks. */
  isNew: boolean;
  /** Pro component: previews for everyone, code and controls only with Pro. */
  premium: boolean;
  /** Has a build prompt (the brief to recreate it with an AI agent), free on free components, Pro on Pro ones. */
  hasPrompt?: boolean;
  /** What you hear, in one sentence, for components that make interface sound. */
  sound?: string;
  /** How many designs live on this component's page (the original plus its variants). Only set above 1. */
  variants?: number;
  /**
   * Ghost-cursor demo the tile plays on its own: `wander` glides over hover effects, `drag` pulls a
   * handle across. Null when the preview already demonstrates itself or needs no pointer.
   */
  demo: "wander" | "drag" | null;
};

export const INTERACTION_FILTERS: { value: Interaction | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hover", label: "Hover" },
  { value: "press", label: "Press" },
  { value: "drag", label: "Drag" },
  { value: "scroll", label: "Scroll" },
  { value: "type", label: "Type" },
  { value: "sound", label: "Sound" },
  { value: "3d", label: "3D" },
  { value: "loop", label: "Ambient" },
];

export const TINT_CLASSES: Record<TileTint, string> = {
  violet: "bg-tint-violet",
  sky: "bg-tint-sky",
  peach: "bg-tint-peach",
  mint: "bg-tint-mint",
  butter: "bg-tint-butter",
  pink: "bg-tint-pink",
};
