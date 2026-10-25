"use client";

/**
 * Motion Kit Pro previews (batch 12): Global Deploy, Card Reader Verify, Intelligence Glow, Cloud Sync,
 * Smart Light, Range Calendar and Storage Clean. Each card plays its own demo (a ghost pointer that stops
 * as soon as a real one moves in), so the preview only adds a light stage around it.
 */

import { GlobalDeploy } from "@/components/global-deploy";
import { CardReaderVerify } from "@/components/card-reader-verify";
import { IntelligenceGlow } from "@/components/intelligence-glow";
import { CloudSync } from "@/components/cloud-sync";
import { SmartLight } from "@/components/smart-light";
import { RangeCalendar } from "@/components/range-calendar";
import { StorageClean } from "@/components/storage-clean";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

export function PreviewGlobalDeploy({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[440px]`}>
      <div className={compact ? "w-full max-w-[640px]" : "w-full max-w-[760px]"}>
        <GlobalDeploy autoplay />
      </div>
    </div>
  );
}

export function PreviewCardReaderVerify({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[560px]`}>
      <div className={compact ? "w-full max-w-[400px]" : "w-full max-w-[440px]"}>
        <CardReaderVerify autoplay />
      </div>
    </div>
  );
}

export function PreviewIntelligenceGlow({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[640px]`}>
      <div className={compact ? "w-full max-w-[300px]" : "w-full max-w-[300px]"}>
        <IntelligenceGlow autoplay />
      </div>
    </div>
  );
}

export function PreviewCloudSync({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[480px]`}>
      <div className={compact ? "w-full max-w-[420px]" : "w-full max-w-[480px]"}>
        <CloudSync autoplay />
      </div>
    </div>
  );
}

export function PreviewSmartLight({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[560px]`}>
      <div className={compact ? "w-full max-w-[400px]" : "w-full max-w-[440px]"}>
        <SmartLight autoplay />
      </div>
    </div>
  );
}

export function PreviewRangeCalendar({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[560px]`}>
      <div className={compact ? "w-full max-w-[400px]" : "w-full max-w-[440px]"}>
        <RangeCalendar autoplay />
      </div>
    </div>
  );
}

export function PreviewStorageClean({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} min-h-[500px]`}>
      <div className={compact ? "w-full max-w-[400px]" : "w-full max-w-[440px]"}>
        <StorageClean autoplay />
      </div>
    </div>
  );
}
