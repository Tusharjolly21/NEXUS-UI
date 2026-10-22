"use client";

/**
 * Motion Kit previews (set AB): composer morph chat, chat head, rolodex testimonials, spread deck, riffle stack. Every component ships an `autoplay` mode that
 * demonstrates itself until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { ChatHead, ComposerMorphChat } from "@/components/chat-messages";
import { RolodexTestimonials } from "@/components/card-stack-rotator";
import { RiffleStack, SpreadDeck } from "@/components/draggable-card-stack";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewComposerMorphChat({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <ComposerMorphChat autoplay />
    </Stage>
  );
}

export function PreviewChatHead({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <ChatHead autoplay />
    </Stage>
  );
}

export function PreviewRolodexTestimonials({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <RolodexTestimonials autoplay />
    </Stage>
  );
}

export function PreviewSpreadDeck({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <SpreadDeck autoplay />
    </Stage>
  );
}

export function PreviewRiffleStack({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <RiffleStack autoplay />
    </Stage>
  );
}
