"use client";

/**
 * Motion Kit previews (set J): todo tower, peek login, heat field, particle mark and generate image.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over,
 * so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { TodoTower } from "@/components/todo-tower";
import { PeekLogin } from "@/components/peek-login";
import { HeatField } from "@/components/heat-field";
import { ParticleMark } from "@/components/particle-mark";
import { GenerateImage } from "@/components/generate-image";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewTodoTower({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <TodoTower autoplay />
    </Stage>
  );
}

export function PreviewPeekLogin({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <PeekLogin autoplay />
    </Stage>
  );
}

export function PreviewHeatField({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className="px-4">
      <HeatField autoplay hint={compact ? "" : undefined} />
    </Stage>
  );
}

export function PreviewParticleMark({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className="px-4">
      <ParticleMark autoplay hint={compact ? "" : undefined} />
    </Stage>
  );
}

export function PreviewGenerateImage({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <GenerateImage autoplay />
    </Stage>
  );
}
