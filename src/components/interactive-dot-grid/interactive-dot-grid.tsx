"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DotGridMode = "spotlight" | "repel" | "attract" | "wave" | "static";

export interface InteractiveDotGridProps {
  /** Foreground content rendered above the dot grid. */
  children?: React.ReactNode;
  /** Space between dot centres in px. @default 40 */
  dotSpacing?: number;
  /** Dot radius in px. @default 1.5 */
  dotSize?: number;
  /** Base colour of dots. @default "#6b7280" */
  dotColor?: string;
  /** Colour of dots near the cursor. @default "#818cf8" */
  activeDotColor?: string;
  /** Container background. @default "transparent" */
  background?: string;
  /** Radius around cursor that influences dots (px). @default 160 */
  interactionRadius?: number;
  /** How strongly dots are affected (0–1). @default 0.5 */
  interactionStrength?: number;
  /** Interaction mode. @default "spotlight" */
  mode?: DotGridMode;
  /** Apply radial fade at edges. @default true */
  fadeEdges?: boolean;
  /** Show subtle gradient overlay behind content. @default true */
  showGradientOverlay?: boolean;
  /** Disable all cursor interactions. @default false */
  disabled?: boolean;
  /** Additional container classes. */
  className?: string;
  /** Hero title text. */
  title?: string;
  /** Hero subtitle text. */
  subtitle?: string;
  /** Primary CTA button label. */
  primaryCTALabel?: string;
  /** Primary CTA button href. */
  primaryCTAHref?: string;
  /** Secondary CTA button label. */
  secondaryCTALabel?: string;
  /** Secondary CTA button href. */
  secondaryCTAHref?: string;
}

// ── Canvas dot grid engine ─────────────────────────────────────────────────────

interface Dot {
  x: number;
  y: number;
  ox: number;
  oy: number;
  baseAlpha: number;
  baseScale: number;
}

interface GridEngine {
  dots: Dot[];
  cols: number;
  rows: number;
}

function buildGrid(
  width: number,
  height: number,
  spacing: number,
  dotSize: number,
): GridEngine {
  const jitter = spacing * 0.15;
  const cols = Math.max(1, Math.floor(width / spacing));
  const rows = Math.max(1, Math.floor(height / spacing));
  const startX = (width - (cols - 1) * spacing) / 2;
  const startY = (height - (rows - 1) * spacing) / 2;

  const dots: Dot[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({
        x: startX + c * spacing + (Math.random() - 0.5) * jitter,
        y: startY + r * spacing + (Math.random() - 0.5) * jitter,
        ox: startX + c * spacing,
        oy: startY + r * spacing,
        baseAlpha: 0.25 + Math.random() * 0.2,
        baseScale: 0.85 + Math.random() * 0.3,
      });
    }
  }
  return { dots, cols, rows };
}

// ── Canvas renderer ─────────────────────────────────────────────────────────────

interface CanvasRendererProps {
  width: number;
  height: number;
  engine: GridEngine;
  dotSize: number;
  dotColor: string;
  activeDotColor: string;
  interactionRadius: number;
  interactionStrength: number;
  mode: DotGridMode;
  fadeEdges: boolean;
  mouseX: number;
  mouseY: number;
  mouseActive: boolean;
  reduceMotion: boolean;
}

function renderCanvas({
  width,
  height,
  engine,
  dotSize,
  dotColor,
  activeDotColor,
  interactionRadius,
  interactionStrength,
  mode,
  fadeEdges,
  mouseX,
  mouseY,
  mouseActive,
  reduceMotion,
}: CanvasRendererProps): void {
  const { ctx, canvas } = engine as unknown as { ctx: CanvasRenderingContext2D; canvas: HTMLCanvasElement };
  if (!ctx || !canvas) return;

  const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const r = interactionRadius;
  const r2 = r * r;

  for (const dot of engine.dots) {
    const dx = dot.x - mouseX;
    const dy = dot.y - mouseY;
    const dist2 = dx * dx + dy * dy;
    const dist = Math.sqrt(dist2);

    let alpha = dot.baseAlpha;
    let scale = dot.baseScale;
    let color = dotColor;
    let offsetX = 0;
    let offsetY = 0;

    if (mouseActive && !reduceMotion && dist2 < r2 && mode !== "static") {
      const influence = Math.max(0, 1 - dist / r) ** 2 * interactionStrength;

      if (mode === "spotlight") {
        alpha = dot.baseAlpha + influence * 0.65;
        scale = dot.baseScale + influence * 1.2;
        const t = Math.max(0, 1 - dist / r);
        color = lerpColor(dotColor, activeDotColor, t * influence);
      } else if (mode === "repel") {
        alpha = dot.baseAlpha + influence * 0.4;
        scale = dot.baseScale + influence * 0.5;
        const repelStrength = influence * 14;
        offsetX = dist > 0.1 ? (-dx / dist) * repelStrength : 0;
        offsetY = dist > 0.1 ? (-dy / dist) * repelStrength : 0;
      } else if (mode === "attract") {
        alpha = dot.baseAlpha + influence * 0.5;
        scale = dot.baseScale + influence * 0.8;
        const attractStrength = influence * 8;
        offsetX = dist > 0.1 ? (dx / dist) * attractStrength : 0;
        offsetY = dist > 0.1 ? (dy / dist) * attractStrength : 0;
      } else if (mode === "wave") {
        const wave = Math.sin(dist / 18 - Date.now() / 400) * 0.5 + 0.5;
        alpha = dot.baseAlpha + wave * influence * 0.6;
        scale = dot.baseScale + wave * influence * 0.9;
      }

      // Smooth lerp back to home
      dot.x += (dot.ox + offsetX - dot.x) * 0.1;
      dot.y += (dot.oy + offsetY - dot.y) * 0.1;
    } else {
      dot.x += (dot.ox - dot.x) * 0.12;
      dot.y += (dot.oy - dot.y) * 0.12;
    }

    const drawX = dot.x;
    const drawY = dot.y;
    const drawR = dotSize * scale;

    ctx.globalAlpha = Math.min(1, alpha);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(drawX, drawY, drawR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Edge fade mask
  if (fadeEdges) {
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.max(width, height) * 0.75,
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

function lerpColor(a: string, b: string, t: number): string {
  const ah = a.replace("#", "");
  const bh = b.replace("#", "");
  const ar = parseInt(ah.slice(0, 2), 16);
  const ag = parseInt(ah.slice(2, 4), 16);
  const ab = parseInt(ah.slice(4, 6), 16);
  const br = parseInt(bh.slice(0, 2), 16);
  const bg = parseInt(bh.slice(2, 4), 16);
  const bb = parseInt(bh.slice(4, 6), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const blue = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${blue})`;
}

// ── Main component ─────────────────────────────────────────────────────────────

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0  },
};
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function InteractiveDotGrid({
  children,
  dotSpacing = 40,
  dotSize = 1.5,
  dotColor = "#6b7280",
  activeDotColor = "#818cf8",
  background = "transparent",
  interactionRadius = 160,
  interactionStrength = 0.5,
  mode = "spotlight",
  fadeEdges = true,
  showGradientOverlay = true,
  disabled = false,
  className,
  title,
  subtitle,
  primaryCTALabel,
  primaryCTAHref = "#",
  secondaryCTALabel,
  secondaryCTAHref = "#",
}: InteractiveDotGridProps) {
  const reduceMotion = useReducedMotion() === true;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const mouseRef = React.useRef({ x: -9999, y: -9999, active: false });
  const engineRef = React.useRef<GridEngine | null>(null);
  const rafRef = React.useRef<number>(0);

  // ── Mouse tracking ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (disabled) return;
    const update = (cx: number, cy: number) => {
      const r = containerRef.current?.getBoundingClientRect();
      if (!r) return;
      mouseRef.current = { x: cx - r.left, y: cy - r.top, active: true };
    };
    const onMove = (e: MouseEvent) => update(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => { if (e.touches[0]) update(e.touches[0].clientX, e.touches[0].clientY); };
    const onLeave = () => { mouseRef.current.active = false; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchend", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchend", onLeave);
    };
  }, [disabled]);

  // ── Resize + render loop ────────────────────────────────────────────────────
  React.useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const w = containerRef.current?.offsetWidth ?? 0;
      const h = containerRef.current?.offsetHeight ?? 0;
      if (w === 0 || h === 0) return;
      engineRef.current = buildGrid(w, h, dotSpacing, dotSize);
      // Attach ctx to engine for render fn
      (engineRef.current as unknown as { ctx: CanvasRenderingContext2D; canvas: HTMLCanvasElement }).ctx = ctx!;
      (engineRef.current as unknown as { canvas: HTMLCanvasElement }).canvas = canvas!;
    }

    function draw() {
      const w = containerRef.current?.offsetWidth ?? 0;
      const h = containerRef.current?.offsetHeight ?? 0;
      if (!engineRef.current || w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }
      renderCanvas({
        width: w,
        height: h,
        engine: engineRef.current,
        dotSize,
        dotColor,
        activeDotColor,
        interactionRadius,
        interactionStrength,
        mode,
        fadeEdges,
        mouseX: mouseRef.current.x,
        mouseY: mouseRef.current.y,
        mouseActive: mouseRef.current.active,
        reduceMotion: reduceMotion ?? false,
      });
      rafRef.current = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => {
      resize();
    });
    if (containerRef.current) ro.observe(containerRef.current);
    resize();
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [disabled, dotSpacing, dotSize, dotColor, activeDotColor, interactionRadius, interactionStrength, mode, fadeEdges, reduceMotion]);

  const showHero = !children && (title || subtitle);

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{ background }}
    >
      {/* ── Canvas dot grid (decorative) ── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{ pointerEvents: "none" }}
      />

      {/* ── Gradient overlay ── */}
      {showGradientOverlay && !disabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 30%, rgba(0,0,0,0.25) 100%)",
          }}
        />
      )}

      {/* ── Foreground content ── */}
      {children ? (
        <div className="relative z-10 h-full w-full">{children}</div>
      ) : showHero ? (
        <motion.div
          className="relative z-10 mx-auto max-w-3xl px-6 text-center"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          {title && (
            <motion.h1
              variants={FADE_UP}
              transition={{ duration: 0.7, ease: EASE }}
              className="text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              {title}
            </motion.h1>
          )}
          {subtitle && (
            <motion.p
              variants={FADE_UP}
              transition={{ duration: 0.6, ease: EASE }}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70"
            >
              {subtitle}
            </motion.p>
          )}
          {(primaryCTALabel || secondaryCTALabel) && (
            <motion.div
              variants={FADE_UP}
              transition={{ duration: 0.55, ease: EASE }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              {primaryCTALabel && (
                <a
                  href={primaryCTAHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg transition-all hover:gap-3 hover:opacity-90"
                >
                  {primaryCTALabel}
                  <span aria-hidden>→</span>
                </a>
              )}
              {secondaryCTALabel && (
                <a
                  href={secondaryCTAHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-2.5 text-sm font-medium text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/12"
                >
                  {secondaryCTALabel}
                </a>
              )}
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </section>
  );
}