"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FullscreenEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
type FullscreenDoc = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void> | void };

const fullscreenElement = () => document.fullscreenElement ?? (document as FullscreenDoc).webkitFullscreenElement ?? null;

const subscribeNever = () => () => {};

/** How long the controls stay after the pointer or a key last moved, before they fade out of the way. */
const IDLE_MS = 2200;

/**
 * A preview taken full screen: the whole screen, nothing but the piece on the site's own background, with Replay and
 * Close floating at the top right. The controls fade out after a couple of seconds of stillness and come back the
 * moment the pointer moves, the screen is touched or a key is pressed. Where the browser allows it the view goes truly
 * full screen (the browser's own chrome goes away); elsewhere, such as an iPhone, it covers the window. Escape, Close,
 * or leaving the browser's full screen all close it, and focus goes back to the button that opened it.
 *
 *   <FullscreenStage open={full} onClose={() => setFull(false)} title="Eclipse Toggle">{(run) => <Demo key={run} />}</FullscreenStage>
 *
 * `children` gets a number that goes up on every Replay, to use as a key so the piece starts again.
 * `layout`: "center" sits a component in the middle of the screen; "page" lets a section or block fill the width and
 * scroll at its natural height.
 */
export function FullscreenStage({
  open,
  onClose,
  title,
  layout = "center",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  layout?: "center" | "page";
  children: (run: number) => React.ReactNode;
}) {
  // only in the browser: the server has no document.body to portal into
  const mounted = React.useSyncExternalStore(subscribeNever, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open ? (
        <Viewer key="viewer" onClose={onClose} title={title} layout={layout}>
          {children}
        </Viewer>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function Viewer({ onClose, title, layout, children }: { onClose: () => void; title: string; layout: "center" | "page"; children: (run: number) => React.ReactNode }) {
  const reduce = !!useReducedMotion();
  const [idle, setIdle] = React.useState(false);
  const [run, setRun] = React.useState(0);
  const root = React.useRef<HTMLDivElement>(null);
  const closeBtn = React.useRef<HTMLButtonElement>(null);
  const close = React.useRef(onClose);
  React.useEffect(() => {
    close.current = onClose;
  });

  React.useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    let timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    };
    const onKey = (e: KeyboardEvent) => {
      wake();
      if (e.key === "Escape" && !e.defaultPrevented) close.current();
      // keep Tab inside the viewer
      if (e.key === "Tab" && root.current && !root.current.contains(document.activeElement)) {
        e.preventDefault();
        closeBtn.current?.focus();
      }
    };
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("touchstart", wake, { passive: true });
    window.addEventListener("keydown", onKey);
    closeBtn.current?.focus({ preventScroll: true });

    // truly full screen where the browser allows it; leaving it (Escape, a system gesture) closes the viewer too
    const el = root.current as FullscreenEl | null;
    const request = el?.requestFullscreen?.bind(el) ?? el?.webkitRequestFullscreen?.bind(el);
    try {
      void Promise.resolve(request?.()).catch(() => {});
    } catch {
      /* not allowed here: the viewer still covers the window */
    }
    let entered = false;
    const onChange = () => {
      if (fullscreenElement()) entered = true;
      else if (entered) close.current();
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);

    return () => {
      window.clearTimeout(timer);
      html.style.overflow = overflow;
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("touchstart", wake);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      if (fullscreenElement()) {
        const d = document as FullscreenDoc;
        void Promise.resolve((d.exitFullscreen?.bind(d) ?? d.webkitExitFullscreen?.bind(d))?.()).catch(() => {});
      }
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  const pill =
    "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/55 px-3.5 text-[13px] font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,.14)_inset,0_6px_20px_-8px_rgba(0,0,0,.5)] backdrop-blur-md outline-none transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-[#0071e3]";

  return (
    <motion.div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${title}, full screen`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
      transition={{ duration: reduce ? 0.15 : 0.28, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed inset-0 z-[1000] flex h-[100dvh] w-full flex-col overflow-auto bg-background text-foreground"
    >
      {layout === "center" ? (
        <div className="relative flex min-h-full w-full flex-none items-center justify-center overflow-hidden px-4 py-20 sm:px-10">
          <div className="flex w-full justify-center">{children(run)}</div>
        </div>
      ) : (
        // edge to edge at its natural height: centred on the screen when it is shorter, scrolling when it is taller
        <div className="relative flex min-h-full w-full flex-none flex-col justify-center [&>*]:w-full">{children(run)}</div>
      )}

      <div
        className={cn(
          "fixed right-4 top-4 z-[1001] flex items-center gap-2 transition-opacity duration-500 [padding-top:env(safe-area-inset-top)] [padding-right:env(safe-area-inset-right)]",
          idle ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        <button type="button" onClick={() => setRun((n) => n + 1)} className={pill}>
          <RotateCcw className="size-3.5" aria-hidden />
          Replay
        </button>
        <button ref={closeBtn} type="button" onClick={() => close.current()} className={pill}>
          <X className="size-3.5" aria-hidden />
          Close
        </button>
      </div>
    </motion.div>
  );
}
