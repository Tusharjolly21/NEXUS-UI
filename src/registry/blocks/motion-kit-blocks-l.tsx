"use client";

/**
 * Tile previews for the Motion Kit blocks in batch "l": the courier tracker, three galleries and the model
 * picker. Each export renders one block with autoplay on, sized to fill a 1280x860 canvas.
 */

import { CourierRouteTracker } from "@/components/blocks/motion-kit/courier-route-tracker";
import { ColumnDriftGallery } from "@/components/blocks/motion-kit/column-drift-gallery";
import { ReflowMosaic } from "@/components/blocks/motion-kit/reflow-mosaic";
import { FocusRailGallery } from "@/components/blocks/motion-kit/focus-rail-gallery";
import { ModelPickerSection } from "@/components/blocks/motion-kit/model-picker";

export function PreviewBlockVariantMkCourierRouteTracker() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-[#f5f5f7] dark:bg-black">
      <CourierRouteTracker autoplay className="w-full" />
    </div>
  );
}

export function PreviewBlockVariantMkColumnDriftGallery() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-white dark:bg-black">
      <ColumnDriftGallery autoplay className="w-full" />
    </div>
  );
}

export function PreviewBlockVariantMkReflowMosaic() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-white dark:bg-black">
      <ReflowMosaic autoplay className="w-full" />
    </div>
  );
}

export function PreviewBlockVariantMkFocusRailGallery() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-white dark:bg-black">
      <FocusRailGallery autoplay className="w-full" />
    </div>
  );
}

export function PreviewBlockVariantMkModelPicker() {
  return (
    <div className="flex min-h-[860px] w-full items-center bg-white dark:bg-black">
      <ModelPickerSection defaultOpen className="w-full" />
    </div>
  );
}
