"use client";

import { UploadDropzone } from "@/components/upload-dropzone";

export function PreviewUploadDropzoneRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <UploadDropzone
        title="Drop your files"
        hint="Up to 5 MB each"
        initialFiles={compact ? undefined : [{ name: "Moodboard.png", size: 1_240_000, type: "image/png", progress: 1 }]}
        autoplay
      />
    </div>
  );
}
