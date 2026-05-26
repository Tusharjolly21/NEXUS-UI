"use client";

import * as React from "react";
import { motion } from "framer-motion";

export interface BackgroundBoxesProps {
  rows?: number;
  cols?: number;
  boxWidth?: number;
  boxHeight?: number;
  borderColor?: string;
  borderWidth?: number;
  showCrosses?: boolean;
  crossColor?: string;
  hoverColors?: string[];
  skewX?: number;
  skewY?: number;
  scale?: number;
  rotation?: number;
  translateX?: number;
  translateY?: number;
  className?: string;
}

const DEFAULT_HOVER_COLORS = [
  "#7DD3FC", "#F9A8D4", "#86EFAC", "#FDE047", "#FCA5A5",
  "#D8B4FE", "#93C5FD", "#A5B4FC", "#C4B5FD",
];

export function BackgroundBoxes({
  rows = 150,
  cols = 100,
  boxWidth = 64,
  boxHeight = 32,
  borderColor = "#374151",
  borderWidth = 1,
  showCrosses = true,
  crossColor = "#374151",
  hoverColors = DEFAULT_HOVER_COLORS,
  skewX = -48,
  skewY = 14,
  scale = 0.675,
  rotation = 0,
  translateX = -40,
  translateY = -60,
  className,
}: BackgroundBoxesProps) {
  const rowsArray = React.useMemo(() => new Array(rows).fill(1), [rows]);
  const colsArray = React.useMemo(() => new Array(cols).fill(1), [cols]);

  const getRandomColor = () =>
    hoverColors[Math.floor(Math.random() * hoverColors.length)];

  const transform = `translate(${translateX}%, ${translateY}%) skewX(${skewX}deg) skewY(${skewY}deg) scale(${scale}) rotate(${rotation}deg) translateZ(0)`;

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          left: "25%",
          top: "-25%",
          display: "flex",
          transform,
          width: "100%",
          height: "100%",
          zIndex: 0,
          padding: "16px",
        }}
      >
        {rowsArray.map((_, i) => (
          <motion.div
            key={`row${i}`}
            style={{
              width: `${boxWidth}px`,
              height: `${boxHeight}px`,
              borderLeft: `${borderWidth}px solid ${borderColor}`,
              position: "relative",
            }}
          >
            {colsArray.map((_, j) => (
              <motion.div
                key={`col${j}`}
                whileHover={{
                  backgroundColor: getRandomColor(),
                  transition: { duration: 0 },
                }}
                animate={{ transition: { duration: 2 } }}
                style={{
                  width: `${boxWidth}px`,
                  height: `${boxHeight}px`,
                  borderRight: `${borderWidth}px solid ${borderColor}`,
                  borderTop: `${borderWidth}px solid ${borderColor}`,
                  position: "relative",
                }}
              >
                {showCrosses && j % 2 === 0 && i % 2 === 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    style={{
                      position: "absolute",
                      height: "24px",
                      width: "40px",
                      top: "-14px",
                      left: "-22px",
                      color: crossColor,
                      strokeWidth: "1px",
                      pointerEvents: "none",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                ) : null}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default BackgroundBoxes;
