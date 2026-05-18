"use client";

import * as React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Cinematic3DLetterScatterProps {
  text: string;
  className?: string;
  fontClassName?: string;
  backgroundColor?: string;
  textColor?: string;
  scatterIntensity?: number;
  depthIntensity?: number;
  blurIntensity?: number;
  scrollDepth?: number;
  perspective?: number;
  align?: "left" | "center" | "right";
  characterStagger?: number;
  finalScale?: number;
  initialOpacity?: number;
  // Image options
  imageSrc?: string;
  showImage?: boolean;
  imagePosition?: "left" | "right" | "behind";
  imageScale?: number;
  overlayOpacity?: number;
}

// ── Deterministic scatter seed ────────────────────────────────────────────────
// Gives the same "random" value for the same index on every render.

function rand(seed: number): number {
  const x = Math.sin(seed + 1.6180339) * 43758.5453123;
  return x - Math.floor(x); // 0 → 1
}

function sr(seed: number): number {
  return rand(seed) * 2 - 1; // -1 → +1
}

// ── Per-character scatter offsets ─────────────────────────────────────────────

interface ScatterOffsets {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  initScale: number;
  stagger: number; // normalized 0-1 within the character set
}

function buildOffsets(
  idx: number,
  total: number,
  si: number,   // scatterIntensity
  di: number,   // depthIntensity
  staggerRange: number,
  vpScale: number, // 0-1 based on viewport width
): ScatterOffsets {
  const b = idx * 19 + 5; // unique seed base per character
  const eff = si * vpScale;
  const dep = di * vpScale;

  return {
    // Spread across a wide XY field
    x: sr(b + 1) * 520 * eff,
    y: sr(b + 2) * 320 * eff,
    // Always start behind the viewer (negative Z = farther away)
    z: (rand(b + 3) * -1 - 0.15) * 1600 * dep,
    // Full 3-axis rotation for a chaotic, cinematic feel
    rx: sr(b + 4) * 150 * eff,
    ry: sr(b + 5) * 180 * eff,
    rz: sr(b + 6) * 60 * eff,
    // Start tiny so letters "zoom" in from deep space
    initScale: 0.1 + rand(b + 7) * 0.4,
    // Stagger fraction: first char = 0, last char = 1
    stagger: total > 1 ? idx / (total - 1) * staggerRange : 0,
  };
}

// ── Single animated character ─────────────────────────────────────────────────
// Lives in its own component so it can call useTransform hooks without
// violating the rules-of-hooks (no hooks inside .map()).

function Char({
  char,
  scrollYProgress,
  offsets,
  blurIntensity,
  initialOpacity,
  finalScale,
  reduced,
}: {
  char: string;
  scrollYProgress: MotionValue<number>;
  offsets: ScatterOffsets;
  blurIntensity: number;
  initialOpacity: number;
  finalScale: number;
  reduced: boolean;
}) {
  // Each character animates over its own slice of the scroll range.
  // stagger shifts the start, giving a cascade rather than a simultaneous snap.
  const domainStart = offsets.stagger * 0.38;
  const domainEnd   = Math.min(domainStart + 0.66, 0.98);
  const domain: [number, number] = [domainStart, domainEnd];

  // All transform values — scroll progress drives them from chaos → order
  const x       = useTransform(scrollYProgress, domain, [offsets.x, 0]);
  const y       = useTransform(scrollYProgress, domain, [offsets.y, 0]);
  const z       = useTransform(scrollYProgress, domain, [offsets.z, 0]);
  const rotateX = useTransform(scrollYProgress, domain, [offsets.rx, 0]);
  const rotateY = useTransform(scrollYProgress, domain, [offsets.ry, 0]);
  const rotateZ = useTransform(scrollYProgress, domain, [offsets.rz, 0]);
  const scale   = useTransform(scrollYProgress, domain, [offsets.initScale, finalScale]);
  const opacity = useTransform(scrollYProgress, domain, [initialOpacity, 1]);

  // Depth-of-field: far-away letters are blurred, sharpen as they arrive
  const blurPx = useTransform(scrollYProgress, domain, [blurIntensity, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  // All hooks called — safe to branch for accessibility
  if (reduced) {
    return <span>{char}</span>;
  }

  return (
    <motion.span
      style={{
        display: "inline-block",
        x,
        y,
        z,
        rotateX,
        rotateY,
        rotateZ,
        scale,
        opacity,
        filter,
        willChange: "transform, opacity, filter",
      }}
    >
      {char}
    </motion.span>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function Cinematic3DLetterScatter({
  text = "Cinematic",
  className,
  fontClassName,
  backgroundColor = "#050505",
  textColor = "#ffffff",
  scatterIntensity = 1,
  depthIntensity = 1,
  blurIntensity = 16,
  scrollDepth = 3,
  perspective: perspectivePx = 1000,
  align = "center",
  characterStagger = 0.3,
  finalScale = 1,
  initialOpacity = 0,
  imageSrc,
  showImage = false,
  imagePosition = "behind",
  imageScale = 1.06,
  overlayOpacity = 0.45,
}: Cinematic3DLetterScatterProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  // Scale scatter/depth by viewport width so mobile stays legible.
  // SSR-safe: default to 1, then measure on mount.
  const [vpScale, setVpScale] = React.useState(1);
  React.useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      setVpScale(w < 640 ? 0.22 : w < 1024 ? 0.55 : 1);
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Scroll progress: 0 when sticky section enters viewport top,
  // 1 when the full scrollDepth has been consumed.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Split text into words → chars, giving each non-space char a unique index
  const words = text.split(" ").filter(Boolean);
  const totalNonSpace = [...text].filter((c) => c !== " ").length;
  let charCounter = 0;

  const parsed = words.map((word) => ({
    word,
    chars: [...word].map((ch) => ({ ch, idx: charCounter++ })),
  }));

  const alignClass = {
    left:   "text-left   justify-start",
    center: "text-center justify-center",
    right:  "text-right  justify-end",
  }[align];

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ height: `${scrollDepth * 100}vh` }}
    >
      {/* ── Sticky viewport ── */}
      <div
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ background: backgroundColor }}
      >
        {/* Optional: image layered behind text */}
        {showImage && imageSrc && imagePosition === "behind" && (
          <div className="pointer-events-none absolute inset-0" style={{ opacity: overlayOpacity }}>
            <img
              src={imageSrc}
              alt=""
              className="h-full w-full object-cover"
              style={{ transform: `scale(${imageScale})` }}
            />
            {/* Dark vignette so text stays readable over any image */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
          </div>
        )}

        {/* ── Content row ── */}
        <div className={cn("relative flex w-full max-w-7xl items-center gap-10 px-6 md:px-16", alignClass)}>

          {/* Optional side image — left */}
          {showImage && imageSrc && imagePosition === "left" && (
            <img
              src={imageSrc}
              alt=""
              className="hidden w-[38%] flex-shrink-0 rounded-3xl object-cover opacity-75 shadow-2xl md:block"
              style={{ transform: `scale(${imageScale})` }}
            />
          )}

          {/* ── Perspective text container ──
              perspective on this div projects all descendant translateZ values.
              transform-style: preserve-3d on the inner div + word spans passes
              the 3D context through to each motion.span.
          */}
          <div
            className="flex-1"
            style={{
              perspective: perspectivePx,
              perspectiveOrigin: "50% 50%",
            }}
          >
            <div
              className={cn(
                "select-none text-[clamp(2.8rem,9vw,7.5rem)] font-black leading-[0.92] tracking-[-0.03em]",
                fontClassName,
              )}
              style={{
                color: textColor,
                transformStyle: "preserve-3d",
                textAlign: align,
              }}
            >
              {parsed.map(({ chars }, wi) => (
                <React.Fragment key={wi}>
                  {/* inline-block keeps the word together; preserve-3d passes
                      perspective through to the motion.span characters inside */}
                  <span style={{ display: "inline-block", transformStyle: "preserve-3d" }}>
                    {chars.map(({ ch, idx }) => {
                      const offsets = buildOffsets(
                        idx,
                        totalNonSpace,
                        scatterIntensity,
                        depthIntensity,
                        characterStagger,
                        vpScale,
                      );
                      return (
                        <Char
                          key={idx}
                          char={ch}
                          scrollYProgress={scrollYProgress}
                          offsets={offsets}
                          blurIntensity={blurIntensity}
                          initialOpacity={initialOpacity}
                          finalScale={finalScale}
                          reduced={reduced}
                        />
                      );
                    })}
                  </span>
                  {/* Natural inter-word space — not animated */}
                  {wi < parsed.length - 1 && (
                    <span style={{ display: "inline-block" }}>&thinsp;&thinsp;</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Optional side image — right */}
          {showImage && imageSrc && imagePosition === "right" && (
            <img
              src={imageSrc}
              alt=""
              className="hidden w-[38%] flex-shrink-0 rounded-3xl object-cover opacity-75 shadow-2xl md:block"
              style={{ transform: `scale(${imageScale})` }}
            />
          )}
        </div>

        {/* Subtle vignette — darkens edges for depth */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)",
          }}
        />
      </div>
    </div>
  );
}
