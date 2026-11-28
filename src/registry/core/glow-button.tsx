"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { GlowButton } from "@/components/glow-button";

export function PreviewGlowButton() {
  return (
    <div className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.09),transparent_34%),#050505]">
      <GlowButton href="#preview">Get Started Now</GlowButton>
    </div>
  );
}
