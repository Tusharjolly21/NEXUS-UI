"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { FaqFolderCard } from "@/components/blocks/faq-folder-card";

export function PreviewFaqFolderCard() {
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-white">
      <div data-tile-focus className="w-[940px] shrink-0">
        <FaqFolderCard className="p-0" />
      </div>
    </div>
  );
}
