"use client";

/**
 * Motion Kit previews (set Z): selection copy, API key field, avatar upload, upload queue. Every component ships an `autoplay` mode that
 * demonstrates itself until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { SelectCopy, ApiKeyField } from "@/components/copy-button";
import { AvatarUpload, UploadQueue } from "@/components/upload-dropzone";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewSelectCopy({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <SelectCopy autoplay />
    </Stage>
  );
}

export function PreviewApiKeyField({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <ApiKeyField autoplay />
    </Stage>
  );
}

export function PreviewAvatarUpload({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <AvatarUpload autoplay />
    </Stage>
  );
}

export function PreviewUploadQueue({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <UploadQueue autoplay />
    </Stage>
  );
}
