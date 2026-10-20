"use client";

import { ChatMessages } from "@/components/chat-messages";

export function PreviewChatMessagesRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <ChatMessages autoplay className={compact ? "h-[330px]" : "h-[350px]"} />
    </div>
  );
}
