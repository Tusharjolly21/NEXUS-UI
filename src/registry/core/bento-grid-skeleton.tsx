"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { BentoGridSkeleton } from "@/components/bento-grid-skeleton";

const BENTO_SKELETON_CARDS = [
  {
    id: "1",
    title: "Ready-made sections",
    description: "Production-ready page blocks for any product.",
    tag: "Pages",
    span: "2x1" as const,
    skeletonType: "chat" as const,
  },
  {
    id: "2",
    title: "Interactive components",
    description: "Hooks, inputs, and controls that feel alive.",
    tag: "UI",
    span: "1x1" as const,
    skeletonType: "dashboard" as const,
  },
  {
    id: "3",
    title: "Copy-paste blocks",
    description: "Ship faster with drop-in component snippets.",
    tag: "DX",
    span: "1x1" as const,
    skeletonType: "avatar" as const,
  },
  {
    id: "4",
    title: "Premium animations",
    description: "Framer Motion layouts with a refined feel.",
    tag: "Motion",
    span: "1x1" as const,
    skeletonType: "workflow" as const,
  },
  {
    id: "5",
    title: "Responsive design",
    description: "Blocks that adapt cleanly to every viewport.",
    tag: "Mobile",
    span: "1x1" as const,
    skeletonType: "calendar" as const,
  },
  {
    id: "6",
    title: "Clean structure",
    description: "Typed, tree-shakeable, and easy to extend.",
    tag: "Dev",
    span: "1x1" as const,
    skeletonType: "code" as const,
  },
];

export function PreviewBentoGridSkeleton() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-3">
      <div className="lf-grid absolute inset-0 opacity-30" />
      <BentoGridSkeleton cards={BENTO_SKELETON_CARDS} />
    </div>
  );
}
