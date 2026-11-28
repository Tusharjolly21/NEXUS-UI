"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { AvatarGroup } from "@/components/avatar-group";

const PREVIEW_AVATARS = [
  { fallback: "PS", tooltip: "Priya Sharma",   bgColor: "#06b6d4" },
  { fallback: "JK", tooltip: "James Kowalski", bgColor: "#8b5cf6" },
  { fallback: "SC", tooltip: "Sofia Chen",     bgColor: "#10b981" },
  { fallback: "MR", tooltip: "Marcus Reid",    bgColor: "#f59e0b" },
  { fallback: "AN", tooltip: "Aisha Nkosi",    bgColor: "#d946ef" },
  { fallback: "TR", tooltip: "Tomás Reyes",    bgColor: "#0ea5e9" },
  { fallback: "LF", tooltip: "Lena Fischer",   bgColor: "#f43f5e" },
];

export function PreviewAvatarGroup() {
  return (
    <div className="flex min-h-[340px] w-full flex-col items-center justify-center gap-12 rounded-3xl bg-background p-8">
      {/* Default — lift on hover, scale entrance */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Lift + Scale entrance
        </p>
        <AvatarGroup
          avatars={PREVIEW_AVATARS}
          size={44}
          overlap={12}
          hoverAnimation="lift"
          entranceAnimation="scale"
          showTooltips
        />
      </div>
      {/* Bounce entrance, rotate hover */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Bounce entrance + Rotate hover
        </p>
        <AvatarGroup
          avatars={PREVIEW_AVATARS}
          size={44}
          overlap={12}
          hoverAnimation="rotate"
          entranceAnimation="bounce"
          showTooltips
        />
      </div>
    </div>
  );
}
