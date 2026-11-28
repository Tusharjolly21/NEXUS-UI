"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { StepFlow } from "@/components/step-flow";

export function PreviewStepFlow({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center rounded-3xl border border-border bg-neutral-100 p-4 dark:bg-neutral-950",
        compact ? "min-h-[520px]" : "min-h-[680px] p-6",
      )}
    >
      <StepFlow
        className={cn("shadow-sm", compact ? "max-w-5xl" : "max-w-6xl")}
        highlightColor="rgb(229 229 229)"
        autoPlay={compact}
        autoPlayInterval={2800}
        steps={[
          {
            serial: "01",
            title: "Audit the idea",
            description: "Collect the messy notes, user goals, and brand cues before a single section is built.",
            image:
              "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
          },
          {
            serial: "02",
            title: "Sketch the system",
            description: "Turn the direction into reusable layout rules, component states, and rhythm.",
            image:
              "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=85",
          },
          {
            serial: "03",
            title: "Layer the motion",
            description: "Add transitions that guide attention without making the page feel busy.",
            image:
              "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85",
          },
          {
            serial: "04",
            title: "Ship the page",
            description: "Package a polished, responsive experience your users can copy into production.",
            image:
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
          },
        ]}
      />
    </div>
  );
}
