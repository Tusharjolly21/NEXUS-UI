"use client";

/**
 * Motion Kit batch 8 previews: a net that lights up under the cursor, a headline made of dots, a
 * word that melts into the next, a code block for developer pages and a trigger that fans out along
 * glowing wires. Every component ships an `autoplay` mode that demonstrates itself until someone
 * takes over, so the previews only add the stage around them.
 */

import { MeshNet } from "@/components/mesh-net";
import { ParticleReveal } from "@/components/particle-reveal";
import { MorphingText } from "@/components/morphing-text";
import { CodeSnippet } from "@/components/code-snippet";
import { WorkflowNetwork } from "@/components/workflow-network";

export function PreviewMeshNet({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden bg-black">
      <MeshNet autoplay>
        <div className="pointer-events-none flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#a5a1ff]">Network</p>
          <p className="m-0 mt-2 text-balance text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] text-white">Every node, one move away.</p>
        </div>
      </MeshNet>
    </div>
  );
}

export function PreviewParticleReveal({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-[560px]">
        <ParticleReveal autoplay />
      </div>
    </div>
  );
}

export function PreviewMorphingText({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="flex h-full min-h-[380px] w-full items-center justify-center bg-[#f5f5f7] p-6 sm:p-8 dark:bg-[#f5f5f7]">
      <MorphingText autoplay lead="" words={["Text", "Animation", "Morphing", "Motion", "Kit"]} color="#111111" />
    </div>
  );
}

export function PreviewCodeSnippet({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="flex h-full min-h-[480px] w-full items-center justify-center p-6 sm:p-8">
      <CodeSnippet autoplay />
    </div>
  );
}

export function PreviewWorkflowNetwork({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-[720px]">
        <WorkflowNetwork autoplay />
      </div>
    </div>
  );
}
