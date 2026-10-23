"use client";

import * as React from "react";

/** A video component: draws one frame for time `t` (seconds) plus its editable props. */
export type VideoComponent = React.ComponentType<{ t: number; w?: number; h?: number } & Record<string, unknown>>;

// Each video loads on demand, so a page that shows one never pays for the others.
const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  "launch-reel": () => import("./launch-reel"),
  "feature-drop": () => import("./feature-drop"),
  "price-reveal": () => import("./price-reveal"),
  "whats-new": () => import("./whats-new"),
  "app-walkthrough": () => import("./app-walkthrough"),
  "route-story": () => import("./route-story"),
  teaser: () => import("./teaser"),
  manifesto: () => import("./manifesto"),
  "install-seconds": () => import("./install-seconds"),
  "bento-tour": () => import("./bento-tour"),
  "before-after": () => import("./before-after"),
  "app-store-preview": () => import("./app-store-preview"),
  "launch-day": () => import("./launch-day"),
  "logo-bumper": () => import("./logo-bumper"),
  "hero-loop": () => import("./hero-loop"),
  "glass-orbit": () => import("./glass-orbit"),
  "word-rush": () => import("./word-rush"),
  "keynote-film": () => import("./keynote-film"),
  "brand-film": () => import("./brand-film"),
};

/** One lazy component per video, created once at module level. */
export const VIDEO_COMPONENTS: Record<string, React.LazyExoticComponent<VideoComponent>> = Object.fromEntries(
  Object.entries(loaders).map(([slug, load]) => [slug, React.lazy(load as () => Promise<{ default: VideoComponent }>)]),
);
