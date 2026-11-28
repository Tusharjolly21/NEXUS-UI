"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { ProfileOrbit } from "@/components/profile-orbit/profile-orbit";

export function PreviewProfileOrbit({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div style={{ width: "100%", height: compact ? 480 : 640 }}>
      <ProfileOrbit autoRotateInterval={3000} />
    </div>
  );
}
