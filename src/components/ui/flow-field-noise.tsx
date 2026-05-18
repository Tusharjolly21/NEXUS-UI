"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ── Noise helpers ─────────────────────────────────────────────────────────────

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function noise2d(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = smoothstep(xf);
  const v = smoothstep(yf);
  return lerp(
    lerp(hash2(xi, yi), hash2(xi + 1, yi), u),
    lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u),
    v,
  );
}

// Fractional Brownian Motion — stacked octaves for terrain-like detail
function fbm(x: number, y: number, octaves = 5): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += noise2d(x * freq, y * freq) * amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return val;
}

// Curl noise — divergence-free flow from gradient of fbm
// Particles follow terrain contours rather than converging/diverging
function curlNoise(x: number, y: number, t: number, scale: number): [number, number] {
  const eps = 0.0005;
  const tx = t * 0.18;
  const ty = t * 0.12;
  const n1 = fbm(x * scale + eps + tx, y * scale + ty);
  const n2 = fbm(x * scale - eps + tx, y * scale + ty);
  const n3 = fbm(x * scale + tx, y * scale + eps + ty);
  const n4 = fbm(x * scale + tx, y * scale - eps + ty);
  const dfdx = (n1 - n2) / (2 * eps);
  const dfdy = (n3 - n4) / (2 * eps);
  // Perpendicular to gradient → follows contour lines (terrain ridges)
  return [-dfdy, dfdx];
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FlowFieldNoiseProps {
  particleCount?: number;
  speed?: number;
  noiseScale?: number;
  trailOpacity?: number;
  fadeStrength?: number;
  lineWidth?: number;
  dotColor?: string;
  backgroundColor?: string;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  age: number;
  maxAge: number;
  spd: number;
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

function makeParticle(w: number, h: number, spd: number): Particle {
  const x = Math.random() * w;
  const y = Math.random() * h;
  return {
    x, y, px: x, py: y,
    age: Math.random() * 80, // stagger initial ages so they don't all die at once
    maxAge: 100 + Math.random() * 140,
    spd: spd * (0.6 + Math.random() * 0.8),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FlowFieldNoise({
  particleCount = 2000,
  speed = 1.4,
  noiseScale = 0.0018,
  trailOpacity = 0.7,
  fadeStrength = 0.032,
  lineWidth = 1.0,
  dotColor = "#ffffff",
  backgroundColor = "transparent",
  className,
}: FlowFieldNoiseProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const stateRef = React.useRef({
    frame: null as number | null,
    t: 0,
    particles: [] as Particle[],
    w: 0,
    h: 0,
    dpr: 1,
    rgb: hexToRgb(dotColor),
    reduced: false,
  });

  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const s = stateRef.current;
    s.rgb = hexToRgb(dotColor);
    s.reduced = typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

    function resize() {
      const rect = container!.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = w; s.h = h; s.dpr = dpr;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.particles = Array.from({ length: particleCount }, () => makeParticle(w, h, speed));
      ctx!.clearRect(0, 0, w, h);
    }

    function tick() {
      const { w, h, particles, rgb } = s;
      s.t += s.reduced ? 0 : 0.004;
      const t = s.t;

      // Fade trails — destination-out erases existing pixels proportionally
      ctx!.globalCompositeOperation = "destination-out";
      ctx!.globalAlpha = fadeStrength;
      ctx!.fillRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;

      ctx!.lineWidth = lineWidth;
      ctx!.lineCap = "round";

      for (const p of particles) {
        const life = 1 - p.age / p.maxAge;
        // Fade in and out at start/end of life
        const alpha = trailOpacity * Math.min(life * 4, 1) * life;
        if (alpha < 0.005) { p.age++; continue; }

        const [cx, cy] = curlNoise(p.x, p.y, t, noiseScale);
        const len = Math.hypot(cx, cy) || 1;
        const vx = (cx / len) * p.spd;
        const vy = (cy / len) * p.spd;

        ctx!.beginPath();
        ctx!.strokeStyle = `rgba(${rgb},${alpha})`;
        ctx!.moveTo(p.px, p.py);
        ctx!.lineTo(p.x, p.y);
        ctx!.stroke();

        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy;
        p.age++;

        const margin = 4;
        if (
          p.age > p.maxAge ||
          p.x < -margin || p.x > w + margin ||
          p.y < -margin || p.y > h + margin
        ) {
          Object.assign(p, makeParticle(w, h, speed));
        }
      }

      s.frame = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    s.frame = requestAnimationFrame(tick);

    return () => {
      if (s.frame !== null) cancelAnimationFrame(s.frame);
      ro.disconnect();
    };
  }, [particleCount, speed, noiseScale, trailOpacity, fadeStrength, lineWidth, dotColor]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none relative h-full min-h-[360px] w-full overflow-hidden", className)}
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
    </div>
  );
}
