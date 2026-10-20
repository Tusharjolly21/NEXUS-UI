"use client";

/**
 * Tile previews for the Motion Kit blocks ported in batch "e". Each renders the full section with
 * autoplay on. Both sections pull in a heavy library (GSAP, three.js), so they are loaded lazily
 * and stay out of the shared previews bundle.
 */

import * as React from "react";

const KineticHero = React.lazy(() => import("@/components/blocks/motion-kit/kinetic-hero").then((m) => ({ default: m.KineticHero })));
const DriftGallery = React.lazy(() => import("@/components/blocks/motion-kit/drift-gallery").then((m) => ({ default: m.DriftGallery })));

/** The preview frames clip overflow, so the hero runs as its own scroll box (`contained`) instead of on page scroll. */
export function PreviewBlockVariantMkKineticHero() {
  return (
    <div className="flex min-h-[640px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <React.Suspense fallback={null}>
        <KineticHero contained autoplay />
      </React.Suspense>
    </div>
  );
}

export function PreviewBlockVariantMkDriftGallery() {
  return (
    <div className="flex min-h-[600px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <React.Suspense fallback={null}>
        <DriftGallery autoplay />
      </React.Suspense>
    </div>
  );
}
