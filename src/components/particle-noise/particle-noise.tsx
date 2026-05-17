"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ParticleNoiseSpeed = "slow" | "medium" | "fast" | number;

export interface ParticleNoiseProps {
  positionX?: number;
  positionY?: number;
  zoom?: number;
  spacing?: number;
  inflation?: number;
  particleSize?: number;
  particleCount?: number;
  density?: number;
  animationEnabled?: boolean;
  speed?: ParticleNoiseSpeed;
  backgroundColor?: string;
  dotColor?: string;
  secondaryDotColor?: string;
  opacity?: number;
  blur?: number;
  surfaceBias?: number;
  gridJitter?: number;
  className?: string;
}

type Particle = {
  homeX: number;
  homeY: number;
  seed: number;
};

const TAU = Math.PI * 2;
const SPEED_MAP = {
  slow: 0.00008,
  medium: 0.00016,
  fast: 0.00028,
} satisfies Record<Exclude<ParticleNoiseSpeed, number>, number>;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

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

function gradient(ix: number, iy: number, x: number, y: number) {
  const angle = hash2(ix, iy) * TAU;
  const gx = Math.cos(angle);
  const gy = Math.sin(angle);
  return gx * (x - ix) + gy * (y - iy);
}

function noise2d(x: number, y: number) {
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const y0 = Math.floor(y);
  const y1 = y0 + 1;
  const sx = fade(x - x0);
  const sy = fade(y - y0);

  const n0 = gradient(x0, y0, x, y);
  const n1 = gradient(x1, y0, x, y);
  const ix0 = lerp(n0, n1, sx);
  const n2 = gradient(x0, y1, x, y);
  const n3 = gradient(x1, y1, x, y);
  const ix1 = lerp(n2, n3, sx);

  return lerp(ix0, ix1, sy) * 0.5 + 0.5;
}

function toRgba(color: string, alpha: number) {
  const trimmed = color.trim();
  if (trimmed.startsWith("rgba")) return trimmed;
  if (trimmed.startsWith("rgb")) {
    const values = trimmed.match(/\d+(\.\d+)?/g);
    if (values && values.length >= 3) {
      return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`;
    }
  }
  if (trimmed.startsWith("#")) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) hex = hex.split("").map((char) => char + char).join("");
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    if ([r, g, b].every(Number.isFinite)) return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

function speedValue(speed: ParticleNoiseSpeed) {
  return typeof speed === "number" ? speed : SPEED_MAP[speed];
}

function getReducedMotionQuery() {
  if (typeof window === "undefined") return null;
  return window.matchMedia("(prefers-reduced-motion: reduce)");
}

export function ParticleNoise({
  positionX = 0,
  positionY = 0,
  zoom = 1,
  spacing = 18,
  inflation = 32,
  particleSize = 1.35,
  particleCount,
  density = 1,
  animationEnabled = true,
  speed = "medium",
  backgroundColor = "transparent",
  dotColor = "#7AE1FF",
  secondaryDotColor,
  opacity = 0.72,
  blur = 0,
  surfaceBias = 0.72,
  gridJitter = 0,
  className,
}: ParticleNoiseProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const sizeRef = React.useRef({ width: 0, height: 0, dpr: 1 });
  const visibleRef = React.useRef(false);
  const hiddenRef = React.useRef(false);
  const reducedMotionRef = React.useRef(false);
  const timeRef = React.useRef(0);

  React.useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const rootNode = root;
    const canvasNode = canvas;
    const ctx = context;
    const reducedMotionQuery = getReducedMotionQuery();
    reducedMotionRef.current = reducedMotionQuery?.matches ?? false;
    hiddenRef.current = document.hidden;

    function buildParticles(width: number, height: number) {
      const scaledSpacing = Math.max(6, spacing);
      const mobileMultiplier = width < 640 ? 1.35 : 1;
      const step = scaledSpacing * mobileMultiplier / clamp(density, 0.2, 2.5);
      const gutter = step * 2;
      const columns = Math.ceil((width + gutter * 2) / step);
      const rows = Math.ceil((height + gutter * 2) / step);
      const next: Particle[] = [];
      const maxParticles = particleCount ?? 2600;

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          if (next.length >= maxParticles) break;
          const jitterX = (hash2(x, y) - 0.5) * step * gridJitter;
          const jitterY = (hash2(x + 17.3, y + 41.9) - 0.5) * step * gridJitter;
          next.push({
            homeX: x * step - gutter + jitterX,
            homeY: y * step - gutter + jitterY,
            seed: hash2(x + 8.8, y + 2.2),
          });
        }
      }

      particlesRef.current = next;
    }

    function resize() {
      const rect = rootNode.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

      sizeRef.current = { width, height, dpr };
      canvasNode.width = Math.floor(width * dpr);
      canvasNode.height = Math.floor(height * dpr);
      canvasNode.style.width = `${width}px`;
      canvasNode.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles(width, height);
      draw(performance.now());
    }

    function clear(width: number, height: number) {
      if (backgroundColor === "transparent") {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    function draw(now: number) {
      const { width, height } = sizeRef.current;
      const shouldMove = animationEnabled && !reducedMotionRef.current;
      const flowSpeed = speedValue(speed);
      const t = shouldMove ? now * flowSpeed : timeRef.current || 0.8;
      timeRef.current = t;
      const scale = Math.max(0.08, zoom);
      const noiseScale = 0.0045 / scale;
      const primary = dotColor;
      const secondary = secondaryDotColor ?? dotColor;
      const surface = clamp(surfaceBias, 0, 1);

      clear(width, height);
      ctx.save();
      ctx.globalCompositeOperation = backgroundColor === "transparent" ? "source-over" : "lighter";
      ctx.filter = blur > 0 ? `blur(${blur}px)` : "none";

      for (const particle of particlesRef.current) {
        const nx = (particle.homeX + positionX * 120) * noiseScale;
        const ny = (particle.homeY + positionY * 120) * noiseScale;
        const field = noise2d(nx + t * 1.15 + particle.seed * 0.35, ny - t * 0.55);
        const curl = noise2d(nx * 1.65 - t * 0.42, ny * 1.65 + t * 0.68 + particle.seed);
        const ridge = noise2d(nx * 0.85 + t * 0.35, ny * 1.15 - t * 0.28);
        const angle = (field * 1.55 + curl * 0.45) * TAU;
        const pulse = noise2d(nx * 2.6 + t * 0.72, ny * 2.6 - t * 0.82 + particle.seed);
        const displacement = inflation * (0.22 + pulse * 0.92);
        const flowX = Math.cos(angle) * displacement;
        const flowY = Math.sin(angle) * displacement;
        const surfaceLift = (ridge - 0.5) * inflation * 2.15;
        const x = particle.homeX + lerp(flowX, flowX * 0.34, surface) + positionX * 28;
        const y =
          particle.homeY +
          lerp(flowY, surfaceLift, surface) +
          positionY * 28;
        const mix = noise2d(nx * 2.2 + t, ny * 2.2 - t + particle.seed);
        const ridgeGlow = clamp((ridge - 0.34) / 0.66, 0, 1);
        const alpha = clamp(opacity * (0.16 + pulse * 0.28 + ridgeGlow * 0.9), 0, 1);
        const radius = particleSize * (0.68 + pulse * 0.22 + ridgeGlow * 0.72);

        ctx.beginPath();
        ctx.fillStyle = toRgba(mix > 0.56 ? secondary : primary, alpha);
        ctx.arc(x, y, radius, 0, TAU);
        ctx.fill();
      }

      ctx.restore();
    }

    function stop() {
      if (frameRef.current === null) return;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    function tick(now: number) {
      if (!visibleRef.current || hiddenRef.current || reducedMotionRef.current || !animationEnabled) {
        frameRef.current = null;
        draw(now);
        return;
      }
      draw(now);
      frameRef.current = requestAnimationFrame(tick);
    }

    function start() {
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(tick);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(rootNode);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? false;
        if (visibleRef.current && !hiddenRef.current) start();
        else stop();
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(rootNode);

    const handleVisibility = () => {
      hiddenRef.current = document.hidden;
      if (hiddenRef.current) stop();
      else if (visibleRef.current) start();
    };

    const handleReducedMotion = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) stop();
      else if (visibleRef.current && !hiddenRef.current) start();
      draw(performance.now());
    };

    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotionQuery?.addEventListener("change", handleReducedMotion);
    resize();
    if (animationEnabled && !reducedMotionRef.current) start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotionQuery?.removeEventListener("change", handleReducedMotion);
    };
  }, [
    animationEnabled,
    backgroundColor,
    blur,
    density,
    dotColor,
    inflation,
    opacity,
    particleCount,
    particleSize,
    positionX,
    positionY,
    secondaryDotColor,
    spacing,
    speed,
    surfaceBias,
    gridJitter,
    zoom,
  ]);

  return (
    <div
      ref={rootRef}
      className={cn("pointer-events-none relative h-full min-h-[360px] w-full overflow-hidden", className)}
      style={{ backgroundColor: backgroundColor === "transparent" ? undefined : backgroundColor }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
