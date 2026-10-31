"use client";

/**
 * Motion Kit previews (batch 18): Liquid Send, Folder Tree, Context Menu, Consent Dock, Add to Bag and
 * Liquid Pagination. Each one plays itself (autoplay) until a real pointer arrives, so the previews only
 * add the light page and a little room around the component.
 */

import { AddToBag } from "@/components/add-to-bag";
import { ConsentDock } from "@/components/consent-dock";
import { ContextMenu } from "@/components/context-menu";
import { FolderTree } from "@/components/folder-tree";
import { LiquidPagination } from "@/components/liquid-pagination";
import { LiquidSend } from "@/components/liquid-send";

const STAGE = "flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]";

export function PreviewLiquidSend({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[380px]" : "min-h-[460px]"}`}>
      <div className="w-full max-w-[720px]">
        <LiquidSend autoplay />
      </div>
    </div>
  );
}

export function PreviewFolderTree({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[400px]" : "min-h-[520px]"}`}>
      <div className="w-full max-w-[440px]">
        <FolderTree autoplay />
      </div>
    </div>
  );
}

export function PreviewContextMenu({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[400px]" : "min-h-[500px]"}`}>
      <div className="w-full max-w-[600px]">
        <ContextMenu autoplay />
      </div>
    </div>
  );
}

export function PreviewConsentDock({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[400px]" : "min-h-[500px]"}`}>
      <div className="w-full max-w-[720px]">
        <ConsentDock contained autoplay />
      </div>
    </div>
  );
}

export function PreviewAddToBag({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[460px]" : "min-h-[580px]"}`}>
      <div className="w-full max-w-[380px]">
        <AddToBag autoplay />
      </div>
    </div>
  );
}

export function PreviewLiquidPagination({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`${STAGE} ${compact ? "min-h-[300px]" : "min-h-[380px]"}`}>
      <div className="flex w-full max-w-[640px] flex-col items-center gap-10">
        <LiquidPagination autoplay />
        <LiquidPagination variant="dots" autoplay />
      </div>
    </div>
  );
}
