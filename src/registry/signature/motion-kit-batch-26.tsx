"use client";

/**
 * Motion Kit previews (batch 26): Bubble Tags, Eclipse Toggle, Neon Star Rating, Lens Search, Peel Delete,
 * Upload Morph, Voice Morph and Face Scan Morph. Each card plays its own demo until the visitor touches it, so the
 * preview only adds a light stage around it.
 */

import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { applyThemeToDom } from "@/lib/theme";
import { BubbleTags } from "@/components/bubble-tags";
import { EclipseToggle } from "@/components/eclipse-toggle";
import { NeonStarRating } from "@/components/neon-star-rating";
import { LensSearch } from "@/components/lens-search";
import { PeelDelete } from "@/components/peel-delete";
import { UploadMorph } from "@/components/upload-morph";
import { VoiceMorph } from "@/components/voice-morph";
import { FaceScanMorph } from "@/components/face-scan-morph";

function Stage({ compact, width = 380, children }: { compact: boolean; width?: number; children: ReactNode }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 ${compact ? "min-h-[300px]" : "min-h-[420px]"}`}>
      <div className="w-full [&>div]:mx-auto" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}

export function PreviewBubbleTags({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={400}>
      <BubbleTags autoplay />
    </Stage>
  );
}

/**
 * The Eclipse Toggle wired to this site's own theme: flip it and the whole page goes dark (or light) inside an
 * eclipse that spills out of the switch. The site's own theme buttons move the moon too. Autoplay never touches the page.
 */
export function SiteEclipseToggle({ autoplay = false, enableSound }: { autoplay?: boolean; enableSound?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the saved theme is only known in the browser
    setMounted(true);
  }, []);
  if (!mounted) return <div className="h-[200px]" aria-hidden />;
  return (
    <EclipseToggle
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      autoplay={autoplay}
      enableSound={enableSound}
      pageTransition
      onThemeChange={(t, { fromUser }) => {
        if (!fromUser) return;
        // straight onto the page, so the eclipse reveals the new theme, then remembered like the site's own switch
        applyThemeToDom(t);
        setTheme(t);
      }}
    />
  );
}

export function PreviewEclipseToggle({ compact = false }: { compact?: boolean } = {}) {
  if (compact) {
    return (
      <Stage compact width={360}>
        <EclipseToggle autoplay />
      </Stage>
    );
  }
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#0b0c10]">
      <div className="w-full max-w-[360px] [&>div]:mx-auto">
        <SiteEclipseToggle />
      </div>
    </div>
  );
}

export function PreviewNeonStarRating({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={400}>
      <NeonStarRating autoplay />
    </Stage>
  );
}

export function PreviewLensSearch({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={400}>
      <LensSearch autoplay />
    </Stage>
  );
}

export function PreviewPeelDelete({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={400}>
      <PeelDelete autoplay />
    </Stage>
  );
}

export function PreviewUploadMorph({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={340}>
      <UploadMorph autoplay />
    </Stage>
  );
}

export function PreviewVoiceMorph({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={380}>
      <VoiceMorph autoplay />
    </Stage>
  );
}

export function PreviewFaceScanMorph({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={340}>
      <FaceScanMorph autoplay />
    </Stage>
  );
}
