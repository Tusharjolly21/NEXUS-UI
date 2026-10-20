"use client";

/**
 * Motion Kit previews (set G): bolting sliders, crumple to trash, tape shelf and packet router.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over,
 * so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { BoltingSliders } from "@/components/bolting-sliders";
import { CrumpleToTrash } from "@/components/crumple-to-trash";
import { TapeShelf } from "@/components/tape-shelf";
import { PacketRouter } from "@/components/packet-router";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewBoltingSliders({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <BoltingSliders autoplay />
    </Stage>
  );
}

export function PreviewCrumpleToTrash({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <CrumpleToTrash autoplay />
    </Stage>
  );
}

export function PreviewTapeShelf({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <TapeShelf autoplay />
    </Stage>
  );
}

export function PreviewPacketRouter({ compact = false }: { compact?: boolean } = {}) {
  if (compact) {
    // The diagram is a fixed 760px wide; shrink it to fit a small tile.
    return (
      <Stage className="p-4">
        <div className="relative h-[210px] w-[480px] max-w-full">
          <div className="absolute left-0 top-0 w-[760px] origin-top-left scale-[0.63]">
            <PacketRouter autoplay />
          </div>
        </div>
      </Stage>
    );
  }
  return (
    <Stage className="px-4">
      <PacketRouter autoplay />
    </Stage>
  );
}
