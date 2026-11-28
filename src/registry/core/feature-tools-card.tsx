"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { FeatureToolsCard } from "@/components/feature-tools-card";

export function PreviewFeatureToolsCard() {
  return (
    <div className="flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-3xl bg-zinc-950 p-8">
      <FeatureToolsCard
        title="Connects with your stack"
        description="Drop-in integrations for the tools your team already uses. No custom connectors required."
      />
    </div>
  );
}
