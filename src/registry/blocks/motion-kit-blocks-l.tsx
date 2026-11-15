"use client";

/**
 * Motion Kit block sections added on 15 November: Flow Chart, Stat Cards and Kanban Board (Dashboards),
 * Filter Drawer (Checkout), Prism Flow and Halo Hero (Heroes), Orb Nav (Navigation) and Brain Atlas (Features).
 * Each plays its own demo until the visitor touches it.
 */

import { FlowChart } from "@/components/blocks/motion-kit/flow-chart";
import { StatCards } from "@/components/blocks/motion-kit/stat-cards";
import { KanbanBoard } from "@/components/blocks/motion-kit/kanban-board";
import { FilterDrawer } from "@/components/blocks/motion-kit/filter-drawer";
import { PrismFlow } from "@/components/blocks/motion-kit/prism-flow";
import { HaloHero } from "@/components/halo-hero";
import { OrbNav } from "@/components/orb-nav";
import { BrainAtlas } from "@/components/brain-atlas";

export function PreviewBlockVariantMkFlowChart() {
  return (
    <div className="w-full bg-[#f5f5f7] px-3 py-8 dark:bg-black sm:px-6 sm:py-12">
      <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
        <FlowChart autoplay className="w-full" />
      </div>
    </div>
  );
}

export function PreviewBlockVariantMkStatCards() {
  return (
    <div className="w-full bg-[#f5f5f7] px-3 py-8 dark:bg-black sm:px-6 sm:py-12">
      <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
        <StatCards autoplay className="w-full" />
      </div>
    </div>
  );
}

export function PreviewBlockVariantMkKanbanBoard() {
  return (
    <div className="w-full bg-[#f5f5f7] px-3 py-8 dark:bg-black sm:px-6 sm:py-12">
      <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
        <KanbanBoard autoplay className="w-full" />
      </div>
    </div>
  );
}

export function PreviewBlockVariantMkFilterDrawer() {
  return (
    <div className="w-full bg-[#f5f5f7] px-3 py-8 dark:bg-black sm:px-6 sm:py-12">
      <div className="mx-auto w-full" style={{ maxWidth: 1200 }}>
        <FilterDrawer autoplay className="w-full" />
      </div>
    </div>
  );
}

export function PreviewBlockVariantMkPrismFlow() {
  return (
    <div className="w-full bg-[#f5f5f7] px-3 py-8 dark:bg-black sm:px-6 sm:py-12">
      <div className="mx-auto w-full" style={{ maxWidth: 1400 }}>
        <PrismFlow autoplay className="w-full" />
      </div>
    </div>
  );
}

export function PreviewBlockVariantMkHaloHero() {
  return (
    <div className="w-full bg-[#f5f5f7] px-3 py-8 dark:bg-black sm:px-6 sm:py-12">
      <div className="mx-auto w-full" style={{ maxWidth: 1400 }}>
        <HaloHero autoplay className="w-full" />
      </div>
    </div>
  );
}

export function PreviewBlockVariantMkOrbNav() {
  return (
    <div className="w-full bg-[#f5f5f7] px-3 py-8 dark:bg-black sm:px-6 sm:py-12">
      <div className="mx-auto w-full" style={{ maxWidth: 1400 }}>
        <OrbNav autoplay className="w-full" />
      </div>
    </div>
  );
}

export function PreviewBlockVariantMkBrainAtlas() {
  return (
    <div className="w-full bg-[#f5f5f7] px-3 py-8 dark:bg-black sm:px-6 sm:py-12">
      <div className="mx-auto w-full" style={{ maxWidth: 1400 }}>
        <BrainAtlas autoplay className="w-full" />
      </div>
    </div>
  );
}
