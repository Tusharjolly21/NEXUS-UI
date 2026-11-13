"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { SPECTRUM_STEPS, clamp, seededRandom } from "./theme";

type SpectrumFieldProps = {
  dark?: boolean;
  on?: boolean;
  /** where the field rests when no pointer is near, as fractions of width and height */
  rest?: readonly number[];
  className?: string;
  mask?: string;
  reach?: number;
  track?: "self" | "parent";
  /** an ellipse [cx, cy, rx, ry] (fractions) where the dots fade out behind content */
  hush?: readonly number[];
};

export function SpectrumField({
  dark = false,
  on = true,
  rest = [0.5, 0.56],
  className = "",
  mask,
  reach = 0.44,
  track = "self",
  hush,
}: SpectrumFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const introRef = useRef({
    on,
    at: on ? 0 : -1,
  });
  useEffect(() => {
    if (on && introRef.current.at < 0) {
      introRef.current = {
        on,
        at: performance.now(),
      };
    }
    introRef.current.on = on;
  }, [on]);
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const trackEl = track === "parent" ? (wrap.parentElement ?? wrap) : wrap;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let gap = 21;
    let rows = 0;
    let dashes = new Float32Array(0);
    let count = 0;
    let rafId = 0;
    let visible = false;
    const pointer = {
      x: 0,
      y: 0,
      active: false,
    };
    const focus = {
      x: -1,
      y: -1,
    };
    const start = performance.now();
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width || !height) {
        return;
      }
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gap = width < 640 ? 24 : 21;
      const cols = Math.ceil(width / gap) + 2;
      rows = Math.ceil(height / gap) + 3;
      count = cols * rows;
      const random = seededRandom(7);
      dashes = new Float32Array(count * 3);
      let cursor = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          dashes[cursor++] = (col - 0.5) * gap + (row % 2 ? gap / 2 : 0) + (random() - 0.5) * gap * 0.55;
          dashes[cursor++] = row * gap + (random() - 0.5) * gap * 0.55;
          dashes[cursor++] = random();
        }
      }
      if (focus.x < 0) {
        focus.x = width * rest[0];
        focus.y = height * rest[1];
      }
    };
    const draw = (now: number) => {
      if (!width) {
        return;
      }
      const t = (now - start) / 1e3;
      const intro = introRef.current;
      const introProgress = reduce ? 1 : intro.at < 0 ? 0 : clamp((now - intro.at) / 1600);
      const eased = 1 - Math.pow(1 - introProgress, 3);
      const targetX = pointer.active ? pointer.x : width * rest[0] + Math.sin(t * 0.21) * width * 0.07;
      const targetY = pointer.active ? pointer.y : height * rest[1] + Math.cos(t * 0.29) * height * 0.05;
      focus.x += (targetX - focus.x) * 0.055;
      focus.y += (targetY - focus.y) * 0.055;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      const reachPx = Math.max(width, height) * reach;
      const fieldHeight = rows * gap;
      const drift = reduce ? 0 : t * 11;
      const paths = Array.from(
        {
          length: 49,
        },
        () => new Path2D(),
      );
      for (let i = 0; i < count; i++) {
        const x = dashes[i * 3];
        const seed = dashes[i * 3 + 2];
        const y =
          ((((dashes[i * 3 + 1] - drift * (0.7 + seed * 0.6)) % fieldHeight) + fieldHeight) % fieldHeight) - gap;
        const dx = x - focus.x;
        const dy = y - focus.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const near = clamp(1 - dist / reachPx);
        const pull = near * near * (3 - 2 * near);
        const wave = 0.5 + 0.5 * Math.sin(dist * 0.048 - t * 2.1);
        let strength = pull * (0.3 + 0.7 * wave) * eased;
        if (hush) {
          const hx = (x / width - hush[0]) / hush[2];
          const hy = (y / height - hush[1]) / hush[3];
          const hushDist = Math.sqrt(hx * hx + hy * hy);
          const hushFade = clamp((hushDist - 0.75) / 0.5);
          strength *= 0.16 + 0.84 * hushFade * hushFade * (3 - 2 * hushFade);
        }
        const flowAngle = -Math.PI / 2 + Math.sin(x * 0.011 + t * 0.5) * 0.32;
        const swirlAngle = Math.atan2(dy, dx) + 1.15;
        let ux = (1 - pull) * Math.cos(flowAngle) + pull * Math.cos(swirlAngle);
        let uy = (1 - pull) * Math.sin(flowAngle) + pull * Math.sin(swirlAngle);
        const len = Math.hypot(ux, uy) || 1;
        ux /= len;
        uy /= len;
        if (strength < 0.07) {
          const half = 0.8 + seed * 0.7;
          paths[48].moveTo(x - ux * half, y - uy * half);
          paths[48].lineTo(x + ux * half, y + uy * half);
          continue;
        }
        const halfLen = (1.4 + 8.5 * strength + seed * 1.6) / 2;
        let hue = (Math.atan2(dy, dx) / (Math.PI * 2) + 0.5 + t * 0.025 + dist * 5e-4) % 1;
        hue = 1 - Math.abs(2 * hue - 1);
        const hueIndex = Math.min(11, Math.floor(hue * 12));
        const level = Math.min(3, Math.floor(clamp(0.2 + strength * 1.15) * 4));
        const path = paths[hueIndex * 4 + level];
        path.moveTo(x - ux * halfLen, y - uy * halfLen);
        path.lineTo(x + ux * halfLen, y + uy * halfLen);
      }
      ctx.lineWidth = 1.35;
      ctx.strokeStyle = dark ? "rgba(255,255,255,.2)" : "rgba(120,124,134,.32)";
      ctx.stroke(paths[48]);
      ctx.lineWidth = 2;
      for (let hueIndex = 0; hueIndex < 12; hueIndex++) {
        for (let level = 0; level < 4; level++) {
          ctx.globalAlpha = [0.28, 0.5, 0.75, 1][level];
          ctx.strokeStyle = SPECTRUM_STEPS[hueIndex];
          ctx.stroke(paths[hueIndex * 4 + level]);
        }
      }
      ctx.globalAlpha = 1;
    };
    const loop = (now: number) => {
      draw(now);
      rafId = visible && !reduce ? requestAnimationFrame(loop) : 0;
    };
    const startLoop = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(loop);
      }
    };
    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduce) {
        draw(performance.now());
      }
    });
    resizeObserver.observe(wrap);
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          startLoop();
        }
      },
      {
        rootMargin: "80px",
      },
    );
    intersection.observe(wrap);
    const onPointerMove = (event: PointerEvent) => {
      const rect = trackEl.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      pointer.active = inside && event.pointerType !== "touch";
      if (inside) {
        const wrapRect = wrap.getBoundingClientRect();
        pointer.x = event.clientX - wrapRect.left;
        pointer.y = event.clientY - wrapRect.top;
      }
    };
    const onLeave = () => {
      pointer.active = false;
    };
    window.addEventListener("pointermove", onPointerMove, {
      passive: true,
    });
    document.documentElement.addEventListener("pointerleave", onLeave);
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else {
        if (visible) {
          startLoop();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    if (reduce) {
      draw(performance.now());
    }
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [dark, reduce, reach, rest, track, hush]);
  return (
    <div
      ref={wrapRef}
      aria-hidden={true}
      className={`pointer-events-none ${className}`}
      style={
        mask
          ? {
              WebkitMaskImage: mask,
              maskImage: mask,
            }
          : undefined
      }
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export function SpectrumRibbon({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const host = wrap.parentElement ?? wrap;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let dots = new Float32Array(0);
    let count = 0;
    let rafId = 0;
    let visible = false;
    const pointer = {
      x: -999,
      y: -999,
      s: 0,
    };
    const start = performance.now();
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width) {
        return;
      }
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const gap = width < 640 ? 12 : 11;
      const cols = Math.ceil(width / gap);
      const rows = Math.ceil(height / gap);
      const random = seededRandom(11);
      count = cols * rows;
      dots = new Float32Array(count * 3);
      let cursor = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          dots[cursor++] = (col + 0.5) * gap + (random() - 0.5) * gap * 0.7;
          dots[cursor++] = (row + 0.5) * gap + (random() - 0.5) * gap * 0.7;
          dots[cursor++] = random();
        }
      }
    };
    const draw = (now: number) => {
      if (!width) {
        return;
      }
      const t = (now - start) / 1e3;
      pointer.s += ((pointer.x > -900 ? 1 : 0) - pointer.s) * 0.08;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const wide = width > 760;
      const centers = wide
        ? [
            [width * 0.25, height * 0.5],
            [width * 0.75, height * 0.5],
          ]
        : [
            [width * 0.5, height * 0.27],
            [width * 0.5, height * 0.75],
          ];
      const radius = Math.min(wide ? width / 4 : width / 2, wide ? height / 2 : height / 4) * 0.74;
      const paths = Array.from(
        {
          length: 17,
        },
        () => new Path2D(),
      );
      for (let i = 0; i < count; i++) {
        let x = dots[i * 3];
        let y = dots[i * 3 + 1];
        const seed = dots[i * 3 + 2];
        let nearest = 1e9;
        let which = 0;
        for (let c = 0; c < 2; c++) {
          const dist = Math.hypot(x - centers[c][0], y - centers[c][1]);
          if (dist < nearest) {
            nearest = dist;
            which = c;
          }
        }
        const ring = radius * (1 + (reduce ? 0 : 0.035 * Math.sin(t * 0.9 + which * 2)));
        const band =
          Math.exp(-((nearest - ring) ** 2) / (2 * 12 ** 2)) +
          0.55 * Math.exp(-((nearest - ring * 0.62) ** 2) / (2 * 9 ** 2));
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const pointerDist = Math.hypot(dx, dy);
        const PUSH = 130;
        let push = 0;
        if (pointerDist < PUSH && pointer.s > 0.01) {
          const hue = (1 - pointerDist / PUSH) ** 2 * pointer.s;
          x += (dx / (pointerDist || 1)) * hue * 16;
          y += (dy / (pointerDist || 1)) * hue * 16;
          push = hue;
        }
        if (band < 0.05 && push < 0.05 && seed > 0.55) {
          continue;
        }
        const size = 0.75 + band * 0.9 + push * 1.1;
        if (push > 0.12) {
          let hue = (Math.atan2(dy, dx) / (Math.PI * 2) + 0.5) % 1;
          hue = 1 - Math.abs(2 * hue - 1);
          paths[4 + Math.min(11, Math.floor(hue * 12))].rect(x - size / 2, y - size / 2, size, size);
        } else {
          paths[Math.min(3, Math.floor(clamp(0.15 + band * 0.9) * 4))].rect(x - size / 2, y - size / 2, size, size);
        }
      }
      for (let level = 0; level < 4; level++) {
        ctx.fillStyle = `rgba(18,19,23,${[0.22, 0.4, 0.62, 0.85][level]})`;
        ctx.fill(paths[level]);
      }
      for (let hue = 0; hue < 12; hue++) {
        ctx.fillStyle = SPECTRUM_STEPS[hue];
        ctx.fill(paths[4 + hue]);
      }
    };
    const loop = (now: number) => {
      draw(now);
      rafId = visible && !reduce ? requestAnimationFrame(loop) : 0;
    };
    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    resizeObserver.observe(wrap);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !rafId) {
        rafId = requestAnimationFrame(loop);
      }
    });
    intersection.observe(wrap);
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }
      const rect = wrap.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      if (reduce) {
        draw(performance.now());
      }
    };
    const onLeave = () => {
      pointer.x = -999;
      pointer.y = -999;
    };
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersection.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);
  return (
    <div ref={wrapRef} aria-hidden={true} className={`pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
