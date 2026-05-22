"use client";

import dynamic from "next/dynamic";
import * as React from "react";

type PreviewComp = React.ComponentType<{ compact?: boolean }>;

const cache = new Map<string, PreviewComp>();

function loadPreview(exportName: string): PreviewComp {
  if (!cache.has(exportName)) {
    const Comp = dynamic(
      () =>
        import("@/registry/component-previews").then((m) => ({
          default:
            (m as unknown as Record<string, PreviewComp>)[exportName] ??
            (() => null),
        })),
      {
        ssr: false,
        loading: () => (
          <div className="flex h-full min-h-[320px] w-full items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ),
      },
    );
    cache.set(exportName, Comp as PreviewComp);
  }
  return cache.get(exportName)!;
}

export function DynamicPreview({
  exportName,
  compact = false,
}: {
  exportName: string;
  compact?: boolean;
}) {
  if (!exportName) return null;
  const Preview = loadPreview(exportName);
  return <Preview compact={compact} />;
}
