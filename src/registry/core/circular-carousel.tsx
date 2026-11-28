"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { CircularCarousel } from "@/components/circular-carousel";

const CAROUSEL_ITEMS = [
  {
    id: "1",
    title: "Neural Networks",
    description: "Deep learning architectures for complex pattern recognition.",
    tag: "AI",
  },
  {
    id: "2",
    title: "Quantum Computing",
    description:
      "Harness quantum mechanics for unprecedented processing power.",
    tag: "Quantum",
  },
  {
    id: "3",
    title: "Edge Computing",
    description: "Process data closer to the source for real-time insights.",
    tag: "Infrastructure",
  },
  {
    id: "4",
    title: "Blockchains",
    description: "Decentralized trust protocols for transparent transactions.",
    tag: "Web3",
  },
  {
    id: "5",
    title: "Generative AI",
    description: "Create content and solutions with intelligent synthesis.",
    tag: "AI",
  },
  {
    id: "6",
    title: "Autonomous Systems",
    description: "Self-governing machines that adapt and learn continuously.",
    tag: "Robotics",
  },
];

export function PreviewCircularCarousel({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl",
        compact ? "min-h-[280px] max-h-[280px]" : "min-h-[480px]",
      )}
    >
      <CircularCarousel items={CAROUSEL_ITEMS} autoPlay={false} />
    </div>
  );
}
