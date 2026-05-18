"use client";

import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpectraImage {
  src: string;
  alt: string;
}

export interface SpectraFrameProps {
  /** Array of image objects. Falls back to picsum placeholders. */
  images?: SpectraImage[];
  /** How many images to render (slices the array). */
  imageCount?: number;
  /** Gap between cells in px. */
  gap?: number;
  /** CSS aspect-ratio per cell, e.g. "4/3", "1/1", "16/9". */
  aspectRatio?: string;
  /** Transition duration in ms for filter + flex expansion. */
  transitionSpeed?: number;
  /** Scale multiplier applied to the hovered image. */
  scaleAmount?: number;
  /** CSS easing applied to every animated property. */
  colorRevealTiming?: string;
  /** Grid background color. */
  backgroundColor?: string;
  /** Grayscale intensity on idle images, 0–100. */
  grayscaleIntensity?: number;
  /** Cell corner radius in px. */
  borderRadius?: number;
  /** Container padding in px. */
  padding?: number;
  /** Default cell min-height in px. */
  cellMinHeight?: number;
  /** Hovered cell min-height in px. */
  hoveredMinHeight?: number;
  /** flex-grow value for the hovered cell. */
  expandedFlex?: number;
  /** flex-basis string for the hovered cell, e.g. "calc(36% - 10px)". */
  expandedBasis?: string;
  className?: string;
}

// ─── Default images (picsum placeholders — work immediately, no config) ───────

const PLACEHOLDERS: SpectraImage[] = Array.from({ length: 15 }, (_, i) => ({
  src: `https://picsum.photos/seed/sf${i + 1}/800/600`,
  alt: `Photo ${i + 1}`,
}));

// ─── Component ───────────────────────────────────────────────────────────────

export function SpectraFrame({
  images             = PLACEHOLDERS,
  imageCount         = 14,
  gap                = 10,
  aspectRatio        = "4/3",
  transitionSpeed    = 550,
  scaleAmount        = 1.04,
  colorRevealTiming  = "cubic-bezier(0.4, 0, 0.2, 1)",
  backgroundColor    = "#0d0d14",
  grayscaleIntensity = 100,
  borderRadius       = 14,
  padding            = 16,
  cellMinHeight      = 140,
  hoveredMinHeight   = 200,
  expandedFlex       = 2.8,
  expandedBasis      = "calc(36% - 10px)",
  className,
}: SpectraFrameProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Stable unique ID — scopes injected <style> so multiple instances never collide.
  const rawId = React.useId();
  const uid   = "sf" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  const items       = images.slice(0, imageCount);
  const isAnyHover  = hoveredIndex !== null;
  const ease        = `${transitionSpeed}ms ${colorRevealTiming}`;
  const fastEase    = `${Math.round(transitionSpeed * 0.5)}ms ${colorRevealTiming}`;

  return (
    <>
      {/*
       * Scoped <style> handles:
       *   1. Cell default flex sizing + min-height
       *   2. Image default filter
       *   3. Mobile responsive overrides
       * Per-hover overrides are applied via inline style (avoids class toggling).
       */}
      <style>{`
        #${uid} {
          display: flex;
          flex-wrap: wrap;
          gap: ${gap}px;
          padding: ${padding}px;
          background: ${backgroundColor};
          box-sizing: border-box;
          width: 100%;
        }

        #${uid} .sf-cell {
          flex: 1 1 calc(20% - ${gap}px);
          max-width: calc(25% - ${gap}px);
          min-height: ${cellMinHeight}px;
          border-radius: ${borderRadius}px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transform: translateZ(0);
          transition:
            flex        ${ease},
            min-height  ${ease};
        }

        #${uid} .sf-cell img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          will-change: filter, transform;
          backface-visibility: hidden;
        }

        #${uid} .sf-cell::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: ${borderRadius}px;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.18) inset;
          opacity: 0;
          pointer-events: none;
          transition: opacity ${fastEase};
        }

        @media (max-width: 600px) {
          #${uid} .sf-cell {
            flex: 1 1 calc(50% - ${gap}px);
            min-height: 110px;
          }
        }
      `}</style>

      <div id={uid} className={className}>
        {items.map((img, index) => {
          const isActive = hoveredIndex === index;
          const isDimmed = isAnyHover && !isActive;

          const grayPct    = isActive ? 0               : grayscaleIntensity;
          const brightness = isActive ? 1.05            : isDimmed ? 0.65 : 0.85;
          const scale      = isActive ? scaleAmount     : 1;

          return (
            <div
              key={index}
              className="sf-cell"
              style={{
                ...(isActive && {
                  flex: `${expandedFlex} 1 ${expandedBasis}`,
                  minHeight: hoveredMinHeight,
                  zIndex: 2,
                }),
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                style={{
                  filter: `grayscale(${grayPct}%) brightness(${brightness})`,
                  transform: `scale(${scale}) translateZ(0)`,
                  transition: `filter ${ease}, transform ${ease}`,
                  aspectRatio: aspectRatio,
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

export default SpectraFrame;
