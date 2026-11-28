"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { InfiniteMovingCards } from "@/components/infinite-moving-cards";

export function PreviewInfiniteMovingCards({
  compact = true,
}: { compact?: boolean } = {}) {
  const items = [
    {
      id: "imc-1",
      title: "Motion-ready templates",
      description:
        "Seamless loops that keep content dynamic without visual jumps.",
      name: "Ariana",
      role: "Product lead",
      rating: 5,
      tags: ["Testimonials"],
    },
    {
      id: "imc-2",
      title: "Smooth and performant",
      description:
        "Linear marquee motion with hover pause for better readability.",
      name: "Marcus",
      role: "Frontend engineer",
      rating: 5,
      tags: ["Framer Motion"],
    },
    {
      id: "imc-3",
      title: "Built for launch pages",
      description:
        "Use for logo strips, reviews, case studies, and showcase rails.",
      name: "Lena",
      role: "Design manager",
      rating: 4,
      tags: ["Marketing"],
    },
  ];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border bg-gradient-to-b from-background to-muted/30 p-4",
        compact ? "min-h-[260px]" : "min-h-[360px] py-10",
      )}
    >
      <InfiniteMovingCards
        items={items}
        direction="left"
        speed={compact ? "normal" : "fast"}
        pauseOnHover
        className={cn("w-full", compact ? "max-w-3xl" : "max-w-5xl")}
        cardClassName={
          compact
            ? "min-w-[270px] max-w-[270px]"
            : "min-w-[320px] max-w-[320px]"
        }
      />
    </div>
  );
}
