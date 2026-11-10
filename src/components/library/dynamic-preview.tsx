"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { RotateCcw } from "lucide-react";

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

/**
 * Keeps one preview's failure inside its own frame. Without it, a single preview that throws (a phone out of
 * WebGL contexts, a chunk that failed to download after a new deploy, a component tripping over itself while it
 * is taken off the page) takes the whole page down to the "This page couldn't load" screen. Here the frame shows
 * a small "Try again" instead and the rest of the page keeps working. Trying again drops the cached loader, so a
 * failed download is fetched afresh.
 *
 * An error thrown while a component is being removed goes to the nearest boundary that is staying, so the guard
 * has to sit outside whatever mounts and unmounts the preview (see FitPreview). `resetKey` clears a failure when
 * it changes, so a preview that failed on its way out starts clean when it comes back.
 */
export class PreviewGuard extends React.Component<
  { name: string; resetKey?: unknown; children: React.ReactNode },
  { failed: boolean; attempt: number }
> {
  state = { failed: false, attempt: 0 };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn(`[preview] ${this.props.name} failed`, error);
  }

  componentDidUpdate(prev: { resetKey?: unknown }) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  retry = () => {
    cache.delete(this.props.name);
    this.setState((s) => ({ failed: false, attempt: s.attempt + 1 }));
  };

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-[14px] font-medium text-[#6e6e73]">This preview didn&apos;t load.</p>
          <button
            type="button"
            onClick={this.retry}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-[#1d1d1f] shadow-[0_0_0_1px_rgba(23,23,28,0.1)] transition-colors hover:bg-[#f5f5f7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Try again
          </button>
        </div>
      );
    }
    return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
  }
}

function Loaded({ exportName, compact }: { exportName: string; compact: boolean }) {
  const Preview = loadPreview(exportName);
  // Not a new component per render: loadPreview hands back the same one for a name every time (module-level cache).
  // eslint-disable-next-line react-hooks/static-components
  return <Preview compact={compact} />;
}

export function DynamicPreview({
  exportName,
  compact = false,
}: {
  exportName: string;
  compact?: boolean;
}) {
  if (!exportName) return null;
  return (
    <PreviewGuard name={exportName}>
      <Loaded exportName={exportName} compact={compact} />
    </PreviewGuard>
  );
}
