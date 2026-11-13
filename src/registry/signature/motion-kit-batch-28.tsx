"use client";

/**
 * Motion Kit previews (batch 28): Order Tracking, Image Galleries (Column Drift, Reflow Mosaic, Focus Rail) and
 * Model Picker. Each plays its own demo until the visitor touches it, so the preview only adds a light stage.
 */

import { OrderTracking } from "@/components/order-tracking";
import { ColumnDriftGallery, FocusRailGallery, ReflowMosaic } from "@/components/image-galleries";
import { ModelPickerSection } from "@/components/model-picker";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] dark:bg-black";

export function PreviewOrderTracking({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[300px]" : "min-h-[560px]"}`}>
      <OrderTracking autoplay className="bg-transparent py-6 sm:py-8 dark:bg-transparent" />
    </div>
  );
}

export function PreviewImageGalleries({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} bg-white ${compact ? "min-h-[300px]" : "min-h-[560px]"}`}>
      <ColumnDriftGallery autoplay className="py-8 sm:py-10" />
    </div>
  );
}

export function PreviewImageGalleriesMosaic({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} bg-white ${compact ? "min-h-[300px]" : "min-h-[560px]"}`}>
      <ReflowMosaic autoplay className="py-8 sm:py-10" />
    </div>
  );
}

export function PreviewImageGalleriesRail({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} bg-white ${compact ? "min-h-[300px]" : "min-h-[560px]"}`}>
      <FocusRailGallery autoplay className="py-8 sm:py-10" />
    </div>
  );
}

export function PreviewModelPicker({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} bg-white ${compact ? "min-h-[300px]" : "min-h-[620px]"}`}>
      {/* The menu starts open so the tile shows what the picker does at a glance */}
      <ModelPickerSection defaultOpen className="py-6 sm:py-8" />
    </div>
  );
}
