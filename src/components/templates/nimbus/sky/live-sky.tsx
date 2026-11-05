"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "../hooks";
import type { Condition } from "../weather";
import { SkyRenderer } from "./renderer";

type LiveSkyProps = {
  /** The weather to draw. Changing it eases the sky to the new condition. */
  mode: Condition;
  /** 1 is the full hero sky; small widgets pass less (fewer stars, raindrops and flakes). */
  density?: number;
  /** Rain collects as droplets on glass (the lock screen). */
  glass?: boolean;
  /** Leave out the moon at night (small widgets). */
  moonless?: boolean;
};

/**
 * A canvas that fills its (relatively positioned) parent with a live sky. It only animates while it is on
 * screen, and with reduced motion it draws one still frame per weather change instead of animating.
 */
export function LiveSky({ mode, density = 1, glass = false, moonless = false }: LiveSkyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SkyRenderer | null>(null);
  const modeRef = useRef(mode);
  const inView = useInView(canvasRef, { amount: 0.05 });
  const reduced = !!useReducedMotion();

  // Own one renderer for as long as these options stay the same.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new SkyRenderer(canvas, modeRef.current, { density, glass, moonless, reducedMotion: reduced });
    rendererRef.current = renderer;
    renderer.resize();
    const observer = new ResizeObserver(() => renderer.resize());
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      renderer.stop();
      rendererRef.current = null;
    };
  }, [density, glass, moonless, reduced]);

  // Follow the weather the parent asks for.
  useEffect(() => {
    modeRef.current = mode;
    rendererRef.current?.setMode(mode);
  }, [mode]);

  // Run only while the canvas is on screen.
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !inView) return;
    renderer.start();
    return () => renderer.stop();
  }, [inView, density, glass, moonless, reduced]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
