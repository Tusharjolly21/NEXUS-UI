"use client";

/**
 * Tile previews for the Motion Kit blocks ported in batch "f". Both sections run on matter-js, so
 * each is lazy-loaded here: the physics engine stays out of the shared previews bundle and is only
 * fetched when a tile actually renders.
 */

import { lazy, Suspense } from "react";

const ChangelogPile = lazy(() =>
  import("@/components/blocks/motion-kit/changelog-pile").then((m) => ({ default: m.ChangelogPile })),
);
const Gravity404 = lazy(() => import("@/components/blocks/motion-kit/gravity-404").then((m) => ({ default: m.Gravity404 })));

export function PreviewBlockVariantMkChangelogPile() {
  return (
    <div className="flex min-h-[760px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <Suspense fallback={null}>
        <ChangelogPile autoplay />
      </Suspense>
    </div>
  );
}

export function PreviewBlockVariantMkGravity404() {
  return (
    <div className="flex min-h-[680px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <Suspense fallback={null}>
        <Gravity404 autoplay />
      </Suspense>
    </div>
  );
}
