"use client";

import * as React from "react";
import { DEFAULT_KEY_SOUND_SRC, fetchKeySound, playKeySound, primeKeySound, unlockKeySound } from "./key-sound";

export interface UseKeySoundOptions {
  /** Turns the clicks on or off. */
  enabled?: boolean;
  /** The recorded clicks. An empty string means "no recording". */
  src?: string;
  /** 0 to 1. */
  volume?: number;
}

/**
 * Recorded key clicks for an on-screen keyboard. The file downloads quietly after mount
 * and is decoded on the first hover or focus, so the first press already plays in time.
 */
export function useKeySound({ enabled = true, src = DEFAULT_KEY_SOUND_SRC, volume = 0.6 }: UseKeySoundOptions = {}) {
  const opts = React.useRef({ enabled, src, volume });
  React.useEffect(() => {
    opts.current = { enabled, src, volume };
  });

  React.useEffect(() => {
    if (!enabled || !src) return;
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const t = idle ? idle(() => void fetchKeySound(src)) : window.setTimeout(() => void fetchKeySound(src), 1200);
    return () => {
      const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (idle && cancel) cancel(t);
      else window.clearTimeout(t);
    };
  }, [enabled, src]);

  /** Call on hover or focus: decodes the clicks ahead of the first press. */
  const prime = React.useCallback(() => {
    const o = opts.current;
    if (o.enabled && o.src) void primeKeySound(o.src);
  }, []);

  /** Plays the click for a KeyboardEvent.code. False means nothing recorded played. */
  const play = React.useCallback((code: string) => {
    const o = opts.current;
    if (!o.enabled || !o.src) return false;
    return playKeySound(code, { src: o.src, volume: o.volume });
  }, []);

  /** Call on pointerup: lets touch screens start audio. */
  const unlock = React.useCallback(() => {
    if (opts.current.enabled) unlockKeySound();
  }, []);

  return { play, prime, unlock };
}
