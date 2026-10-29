"use client";

/**
 * Motion Kit previews (batch 15, Everyday): nine small interface patterns for forms, search, tables and reading.
 * Each plays its own demo (autoplay) until a real pointer arrives, so the preview only adds the light page.
 */

import { TetheredSubmit } from "@/components/tethered-submit";
import { DependentForm } from "@/components/dependent-form";
import { GlassEdit } from "@/components/glass-edit";
import { LiveSummary } from "@/components/live-summary";
import { ScopedSearch } from "@/components/scoped-search";
import { InkAutosave } from "@/components/ink-autosave";
import { SortStack } from "@/components/sort-stack";
import { ReadingSpine } from "@/components/reading-spine";
import { SkeletonMorphRows } from "@/components/skeleton-morph-rows";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

export function PreviewTetheredSubmit({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[520px]" : "w-full max-w-[520px]"}>
        <TetheredSubmit autoplay />
      </div>
    </div>
  );
}

export function PreviewDependentForm({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[520px]" : "w-full max-w-[520px]"}>
        <DependentForm autoplay />
      </div>
    </div>
  );
}

export function PreviewGlassEdit({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[520px]" : "w-full max-w-[520px]"}>
        <GlassEdit autoplay />
      </div>
    </div>
  );
}

export function PreviewLiveSummary({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[640px]" : "w-full max-w-[900px]"}>
        <LiveSummary autoplay />
      </div>
    </div>
  );
}

export function PreviewScopedSearch({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[640px]" : "w-full max-w-[640px]"}>
        <ScopedSearch autoplay />
      </div>
    </div>
  );
}

export function PreviewInkAutosave({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[520px]" : "w-full max-w-[520px]"}>
        <InkAutosave autoplay />
      </div>
    </div>
  );
}

export function PreviewSortStack({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[640px]" : "w-full max-w-[900px]"}>
        <SortStack autoplay />
      </div>
    </div>
  );
}

export function PreviewReadingSpine({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[640px]" : "w-full max-w-[640px]"}>
        <ReadingSpine autoplay />
      </div>
    </div>
  );
}

export function PreviewSkeletonMorphRows({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[520px]" : "w-full max-w-[520px]"}>
        <SkeletonMorphRows autoplay />
      </div>
    </div>
  );
}
