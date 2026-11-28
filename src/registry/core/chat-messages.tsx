"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { ChatMessages } from "@/components/chat-messages";

export function PreviewChatMessages({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl",
        compact ? "min-h-[280px] max-h-[280px]" : "min-h-[480px]",
      )}
    >
      <div className="h-full w-full max-w-md">
        <ChatMessages autoPlay showReplay />
      </div>
    </div>
  );
}
