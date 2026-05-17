"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InteractiveDotsMode = "dots" | "lines";

export interface InteractiveDotsProps {
  mode?: InteractiveDotsMode;
  dotSize?: number;
  dotSpacing?: number;
  dotColor?: string;
  activeDotColor?: string;
  lineColor?: string;
  backgroundColor?: string;
  interactionRadius?: number;
  repulsionStrength?: number;
  smoothing?: number;
  damping?: number;
  lineDistance?: number;
  lineWidth?: number;
  lineOpacity?: number;
  showToggle?: boolean;
  className?: string;
}

type Dot = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Mouse = {
  x: number;
  y: number;
  active: boolean;
};

const DEFAULT_PROPS = {
  mode: "lines" as InteractiveDotsMode,
  dotSize: 2.4,
  dotSpacing: 30,
  dotColor: "rgba(148, 163, 184, 0.62)",
  activeDotColor: "rgba(125, 211, 252, 0.95)",
  lineColor: "rgba(125, 211, 252, 0.72)",
  backgroundColor: "#05070d",
  interactionRadius: 120,
  repulsionStrength: 44,
  smoothing: 0.12,
  damping: 0.82,
  lineDistance: 68,
  lineWidth: 0.8,
  lineOpacity: 0.36,
  showToggle: true,
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getReducedMotionQuery() {
  if (typeof window === "undefined") return null;
  return window.matchMedia("(prefers-reduced-motion: reduce)");
}

export function InteractiveDots({
  mode = DEFAULT_PROPS.mode,
  dotSize = DEFAULT_PROPS.dotSize,
  dotSpacing = DEFAULT_PROPS.dotSpacing,
  dotColor = DEFAULT_PROPS.dotColor,
  activeDotColor = DEFAULT_PROPS.activeDotColor,
  lineColor = DEFAULT_PROPS.lineColor,
  backgroundColor = DEFAULT_PROPS.backgroundColor,
  interactionRadius = DEFAULT_PROPS.interactionRadius,
  repulsionStrength = DEFAULT_PROPS.repulsionStrength,
  smoothing = DEFAULT_PROPS.smoothing,
  damping = DEFAULT_PROPS.damping,
  lineDistance = DEFAULT_PROPS.lineDistance,
  lineWidth = DEFAULT_PROPS.lineWidth,
  lineOpacity = DEFAULT_PROPS.lineOpacity,
  showToggle = DEFAULT_PROPS.showToggle,
  className,
}: InteractiveDotsProps) {
  const [currentMode, setCurrentMode] = React.useState<InteractiveDotsMode>(mode);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const dotsRef = React.useRef<Dot[]>([]);
  const mouseRef = React.useRef<Mouse>({ x: 0, y: 0, active: false });
  const sizeRef = React.useRef({ width: 0, height: 0, dpr: 1 });
  const isVisibleRef = React.useRef(false);
  const reduceMotionRef = React.useRef(false);
  const modeRef = React.useRef(currentMode);
  const drawRef = React.useRef<(() => void) | null>(null);
  const startRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    modeRef.current = currentMode;
    drawRef.current?.();
    startRef.current?.();
  }, [currentMode]);

  React.useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const rootNode = root;
    const canvasNode = canvas;
    const ctx = context;

    const reducedMotionQuery = getReducedMotionQuery();
    reduceMotionRef.current = reducedMotionQuery?.matches ?? false;

    function rebuildGrid() {
      const rect = rootNode.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);

      sizeRef.current = { width, height, dpr };
      canvasNode.width = Math.round(width * dpr);
      canvasNode.height = Math.round(height * dpr);
      canvasNode.style.width = `${width}px`;
      canvasNode.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const columns = Math.max(2, Math.ceil(width / dotSpacing) + 1);
      const rows = Math.max(2, Math.ceil(height / dotSpacing) + 1);
      const offsetX = (width - (columns - 1) * dotSpacing) / 2;
      const offsetY = (height - (rows - 1) * dotSpacing) / 2;
      const previous = dotsRef.current;
      const next: Dot[] = [];

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const homeX = offsetX + column * dotSpacing;
          const homeY = offsetY + row * dotSpacing;
          const prior = previous[row * columns + column];
          next.push({
            homeX,
            homeY,
            x: prior ? lerp(homeX, prior.x, 0.35) : homeX,
            y: prior ? lerp(homeY, prior.y, 0.35) : homeY,
            vx: prior?.vx ?? 0,
            vy: prior?.vy ?? 0,
          });
        }
      }

      dotsRef.current = next;
      drawFrame();
    }

    function drawBackground() {
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(
        width * 0.5,
        0,
        0,
        width * 0.5,
        0,
        Math.max(width, height) * 0.75,
      );
      glow.addColorStop(0, "rgba(56, 189, 248, 0.13)");
      glow.addColorStop(0.4, "rgba(99, 102, 241, 0.06)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    function updateDots() {
      const dots = dotsRef.current;
      const mouse = mouseRef.current;
      const radius = Math.max(1, interactionRadius);
      const friction = clamp01(damping);
      const spring = Math.max(0.01, smoothing);

      for (const dot of dots) {
        let targetX = dot.homeX;
        let targetY = dot.homeY;

        if (mouse.active) {
          const dx = dot.homeX - mouse.x;
          const dy = dot.homeY - mouse.y;
          const distance = Math.hypot(dx, dy);

          if (distance < radius) {
            const force = (1 - distance / radius) ** 2;
            const angle = Math.atan2(dy, dx);
            targetX += Math.cos(angle) * repulsionStrength * force;
            targetY += Math.sin(angle) * repulsionStrength * force;
          }
        }

        dot.vx = (dot.vx + (targetX - dot.x) * spring) * friction;
        dot.vy = (dot.vy + (targetY - dot.y) * spring) * friction;
        dot.x += dot.vx;
        dot.y += dot.vy;
      }
    }

    function drawLines() {
      if (modeRef.current !== "lines") return;

      const dots = dotsRef.current;
      const maxDistance = Math.max(1, lineDistance);
      const maxDistanceSq = maxDistance * maxDistance;

      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.setLineDash(lineWidth < 1 ? [2, 7] : []);

      for (let i = 0; i < dots.length; i += 1) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j += 1) {
          const b = dots[j];
          const dx = a.x - b.x;
          if (Math.abs(dx) > maxDistance) continue;
          const dy = a.y - b.y;
          if (Math.abs(dy) > maxDistance) continue;
          const distanceSq = dx * dx + dy * dy;
          if (distanceSq > maxDistanceSq) continue;

          const distance = Math.sqrt(distanceSq);
          const alpha = clamp01(1 - distance / maxDistance) * lineOpacity;
          const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          gradient.addColorStop(0, lineColor);
          gradient.addColorStop(1, activeDotColor);

          ctx.globalAlpha = alpha;
          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    function drawDots() {
      const dots = dotsRef.current;

      for (const dot of dots) {
        const displacement = Math.hypot(dot.x - dot.homeX, dot.y - dot.homeY);
        const activity = clamp01(displacement / Math.max(1, repulsionStrength * 0.8));
        const radius = dotSize * (1 + activity * 0.75);

        ctx.globalAlpha = 0.72 + activity * 0.28;
        ctx.fillStyle = activity > 0.05 ? activeDotColor : dotColor;
        ctx.shadowColor = activity > 0.05 ? activeDotColor : "transparent";
        ctx.shadowBlur = activity > 0.05 ? 12 * activity : 0;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    function drawFrame() {
      drawBackground();
      drawLines();
      drawDots();
    }

    function tick() {
      if (!isVisibleRef.current || reduceMotionRef.current) {
        frameRef.current = null;
        drawFrame();
        return;
      }

      updateDots();
      drawFrame();
      frameRef.current = window.requestAnimationFrame(tick);
    }

    function start() {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(tick);
    }

    function stop() {
      if (frameRef.current === null) return;
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    drawRef.current = drawFrame;
    startRef.current = start;

    function handlePointerMove(event: PointerEvent) {
      const rect = canvasNode.getBoundingClientRect();
      mouseRef.current.x = event.clientX - rect.left;
      mouseRef.current.y = event.clientY - rect.top;
      mouseRef.current.active = true;
      start();
    }

    function handlePointerLeave() {
      mouseRef.current.active = false;
      start();
    }

    const resizeObserver = new ResizeObserver(rebuildGrid);
    resizeObserver.observe(rootNode);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0.02 },
    );
    intersectionObserver.observe(rootNode);

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reduceMotionRef.current = event.matches;
      if (event.matches) {
        stop();
        dotsRef.current.forEach((dot) => {
          dot.x = dot.homeX;
          dot.y = dot.homeY;
          dot.vx = 0;
          dot.vy = 0;
        });
        drawFrame();
      } else if (isVisibleRef.current) {
        start();
      }
    };

    reducedMotionQuery?.addEventListener("change", handleReducedMotionChange);
    canvasNode.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvasNode.addEventListener("pointerleave", handlePointerLeave);
    rebuildGrid();

    return () => {
      drawRef.current = null;
      startRef.current = null;
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      reducedMotionQuery?.removeEventListener("change", handleReducedMotionChange);
      canvasNode.removeEventListener("pointermove", handlePointerMove);
      canvasNode.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [
    activeDotColor,
    backgroundColor,
    damping,
    dotColor,
    dotSize,
    dotSpacing,
    interactionRadius,
    lineColor,
    lineDistance,
    lineOpacity,
    lineWidth,
    repulsionStrength,
    smoothing,
  ]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative isolate h-full min-h-[320px] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950",
        className,
      )}
      style={{ backgroundColor }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {showToggle && (
        <button
          type="button"
          onClick={() =>
            setCurrentMode((value) => (value === "dots" ? "lines" : "dots"))
          }
          className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/80 shadow-sm backdrop-blur-md transition hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
        >
          {currentMode === "dots" ? "Dots" : "Dot Lines"}
        </button>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
    </div>
  );
}
