"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { FONT_MONO } from "./theme";
import { PillButton, SectionTitle } from "./ui";
type Stream = { y: number; v: number; on: boolean; seed: number };

/**
 * Columns of hex characters raining down behind the call to action, brighter and blue near the pointer, cleared
 * in the middle so the headline stays readable. Only draws while on screen; still with reduced motion.
 */
export function CtaField() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -999, y: -999 });
  const inView = useInView(wrapRef, { amount: 0.1 });
  const reduce = useReducedMotion();
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !wrap || !ctx || !inView) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const COLUMN = 20;
    const ROW = 18;
    const GLYPHS = "0123456789abcdefx$.,_";
    const streams: Stream[] = Array.from({ length: Math.floor(width / COLUMN) }, (_, index) => ({
      y: Math.random() * height,
      v: 0.25 + Math.random() * 0.6,
      on: Math.random() > 0.45,
      seed: index,
    }));
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `12px ${FONT_MONO}`;
      ctx.textAlign = "center";
      streams.forEach((stream, column) => {
        if (!stream.on) return;
        const x = column * COLUMN + COLUMN / 2;
        // a head and an eight-character tail that fades out
        for (let k = 0; k < 9; k++) {
          const y = stream.y - k * ROW;
          if (y < -20 || y > height + 20) continue;
          const near = Math.max(0, 1 - Math.hypot(x - pointer.current.x, y - pointer.current.y) / 140);
          const alpha = (1 - k / 9) * 0.32 + near * 0.6;
          ctx.fillStyle = near > 0.15 || k === 0 ? `rgba(47,107,255,${Math.min(1, alpha + 0.2)})` : `rgba(120,140,190,${alpha})`;
          ctx.fillText(GLYPHS[(column * 7 + k * 3 + Math.floor(stream.y / ROW)) % GLYPHS.length]!, x, y);
        }
        stream.y += stream.v * (reduce ? 0 : 1);
        if (stream.y - 160 > height) {
          stream.y = -20;
          stream.on = Math.random() > 0.4;
        }
      });
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);
  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      onPointerMove={(event) => {
        const box = wrapRef.current!.getBoundingClientRect();
        pointer.current = { x: event.clientX - box.left, y: event.clientY - box.top };
      }}
      onPointerLeave={() => {
        pointer.current = { x: -999, y: -999 };
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden={true}
        className="absolute inset-0 h-full w-full"
        style={{
          WebkitMaskImage: "radial-gradient(70% 70% at 50% 50%, transparent 22%, #000 70%)",
          maskImage: "radial-gradient(70% 70% at 50% 50%, transparent 22%, #000 70%)",
        }}
      />
    </div>
  );
}
export function Cta() {
  return (
    <section id="start" className="relative scroll-mt-20 overflow-hidden">
      <CtaField />
      <div className="pointer-events-none relative flex flex-col items-center px-5 py-36 text-center">
        <div className="pointer-events-auto">
          <SectionTitle center={true} title="Ready when" rest="your product is." />
        </div>
        <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-2.5">
          <PillButton dark={true}>Start building</PillButton>
          <PillButton>Talk to sales</PillButton>
        </div>
      </div>
    </section>
  );
}
