"use client";

/* eslint-disable react-hooks/refs -- the scene engine lives outside React: it is created in an effect, holds its own animation state, and reports back through these callbacks, so the latest callbacks are kept in a ref on purpose */

import { useEffect, useRef } from "react";
import type { SceneConfig } from "./data";
import { createScene, type SceneApi } from "./scene";

type Callbacks = {
  /** A line such as "Drawn live in 31,416 characters", sent whenever the grid changes. */
  onCount?: (text: string) => void;
  /** The host was resized, or the picture just landed: re-place anything laid over it. */
  onResize?: () => void;
};

/**
 * Runs one Last Light scene on a host element and its canvas. Attach `hostRef` to the element that sizes the scene
 * (it also receives the pointer) and `canvasRef` to a canvas inside it. `api.current` is null until the picture and
 * the font have loaded. The scene is torn down on unmount, so it is safe under React Strict Mode.
 */
export function useAsciiScene<H extends HTMLElement = HTMLDivElement>(cfg: SceneConfig, callbacks: Callbacks = {}) {
  const hostRef = useRef<H>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<SceneApi | null>(null);
  const latest = useRef(callbacks);
  latest.current = callbacks;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const scene = createScene({
      cfg,
      host,
      canvas,
      onCount: (t) => latest.current.onCount?.(t),
      onResize: () => latest.current.onResize?.(),
    });
    api.current = scene;
    return () => {
      scene.destroy();
      api.current = null;
    };
  }, [cfg]);

  return { hostRef, canvasRef, api };
}
