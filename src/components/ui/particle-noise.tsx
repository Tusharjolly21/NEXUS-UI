"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ParticleNoiseProps = {
  dotColor?: string;
  backgroundColor?: string;
  dotSize?: number;
  dotOpacity?: number;
  particleSpacing?: number;
  noiseZoom?: number;
  inflation?: number;
  speed?: number;
  animate?: boolean;
  interactive?: boolean;
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  seed: number;
};

const TAU = Math.PI * 2;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function hash2(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function noise2d(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = fade(xf);
  const v = fade(yf);

  const aa = hash2(xi, yi);
  const ba = hash2(xi + 1, yi);
  const ab = hash2(xi, yi + 1);
  const bb = hash2(xi + 1, yi + 1);

  return lerp(lerp(aa, ba, u), lerp(ab, bb, u), v);
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ParticleNoise({
  dotColor = "98, 226, 255",
  backgroundColor = "transparent",
  dotSize = 1.15,
  dotOpacity = 0.42,
  particleSpacing = 28,
  noiseZoom = 620,
  inflation = 18,
  speed = 0.00013,
  animate = true,
  interactive = true,
  className,
}: ParticleNoiseProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const sizeRef = React.useRef({ width: 0, height: 0, dpr: 1 });
  const frameRef = React.useRef<number | null>(null);
  const visibleRef = React.useRef(true);
  const reducedRef = React.useRef(false);
  const mouseRef = React.useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    active: false,
  });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasEl = canvas;
    const host = canvasEl.parentElement;
    if (!host) return;
    const container = host;

    const ctx = canvasEl.getContext("2d", { alpha: true });
    if (!ctx) return;
    const context = ctx;

    reducedRef.current = prefersReducedMotion();
    const shouldAnimate = animate && !reducedRef.current;

    function buildParticles(width: number, height: number) {
      const spacing = width < 640 ? particleSpacing * 1.45 : particleSpacing;
      const gutter = spacing * 1.5;
      const cols = Math.ceil((width + gutter * 2) / spacing);
      const rows = Math.ceil((height + gutter * 2) / spacing);
      const particles: Particle[] = [];

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const baseX = x * spacing - gutter;
          const baseY = y * spacing - gutter;
          const jitterX = (hash2(x, y) - 0.5) * spacing * 0.42;
          const jitterY = (hash2(x + 19.7, y + 8.3) - 0.5) * spacing * 0.42;
          particles.push({
            x: baseX + jitterX,
            y: baseY + jitterY,
            seed: hash2(x + 4.2, y + 9.1),
          });
        }
      }

      particlesRef.current = particles;
    }

    function resize() {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      sizeRef.current = { width, height, dpr };
      canvasEl.width = Math.floor(width * dpr);
      canvasEl.height = Math.floor(height * dpr);
      canvasEl.style.width = `${width}px`;
      canvasEl.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles(width, height);
      draw(performance.now());
    }

    function draw(now: number) {
      const { width, height } = sizeRef.current;
      const mouse = mouseRef.current;
      const time = shouldAnimate ? now * speed : 1800 * speed;
      const zoom = Math.max(120, noiseZoom);
      const rgb = dotColor.includes(",") ? dotColor : dotColor.trim().split(/\s+/).join(", ");

      if (backgroundColor === "transparent") {
        context.clearRect(0, 0, width, height);
      } else {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);
      }

      mouse.x = lerp(mouse.x, mouse.tx, 0.075);
      mouse.y = lerp(mouse.y, mouse.ty, 0.075);

      context.save();
      context.globalCompositeOperation = "lighter";

      for (const p of particlesRef.current) {
        const nx = p.x / zoom;
        const ny = p.y / zoom;
        const fieldA = noise2d(nx + time * 5.2 + p.seed, ny - time * 2.1);
        const fieldB = noise2d(nx * 1.8 - time * 1.3, ny * 1.8 + time * 3.9 + p.seed);
        const angle = (fieldA * 2.4 + fieldB * 0.8) * TAU;
        const pulse = noise2d(nx * 3.1 + time * 2, ny * 3.1 - time * 2 + p.seed);
        const drift = inflation * (0.35 + pulse * 0.9);

        let x = p.x + Math.cos(angle) * drift;
        let y = p.y + Math.sin(angle) * drift;
        const sparkle = noise2d(p.seed * 18 + time * 18, p.seed * 31 - time * 14);
        const sparkleAmount = Math.max(0, (sparkle - 0.72) / 0.28);
        let opacity = dotOpacity * (0.48 + pulse * 0.7 + sparkleAmount * 0.45);
        let radius = dotSize * (0.82 + pulse * 0.62 + sparkleAmount * 0.9);

        if (interactive && mouse.active) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.hypot(dx, dy);
          const radiusInfluence = Math.min(width, height) * 0.24;
          if (dist < radiusInfluence && dist > 0.01) {
            const force = (1 - dist / radiusInfluence) ** 2;
            const bend = force * 28;
            x += (dx / dist) * bend;
            y += (dy / dist) * bend;
            opacity += force * 0.22;
            radius += force * 0.65;
          }
        }

        context.beginPath();
        context.fillStyle = `rgba(${rgb}, ${Math.min(opacity, 0.9)})`;
        context.arc(x, y, radius, 0, TAU);
        context.fill();

        if (sparkleAmount > 0.1) {
          context.beginPath();
          context.fillStyle = `rgba(${rgb}, ${Math.min(sparkleAmount * 0.14, 0.22)})`;
          context.arc(x, y, radius * (2.8 + sparkleAmount * 1.8), 0, TAU);
          context.fill();
        }
      }

      context.restore();
    }

    function loop(now: number) {
      if (!visibleRef.current || document.hidden) {
        frameRef.current = null;
        return;
      }
      draw(now);
      frameRef.current = requestAnimationFrame(loop);
    }

    function onPointerMove(event: PointerEvent) {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.tx = event.clientX - rect.left;
      mouseRef.current.ty = event.clientY - rect.top;
      mouseRef.current.active = true;
    }

    function onPointerLeave() {
      mouseRef.current.active = false;
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    function onVisibilityChange() {
      if (!document.hidden && visibleRef.current && frameRef.current === null) {
        frameRef.current = requestAnimationFrame(loop);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
        if (visibleRef.current && !document.hidden && frameRef.current === null) {
          frameRef.current = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(container);

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    resize();

    if (shouldAnimate) {
      frameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [
    animate,
    backgroundColor,
    dotColor,
    dotOpacity,
    dotSize,
    inflation,
    interactive,
    noiseZoom,
    particleSpacing,
    speed,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
}
