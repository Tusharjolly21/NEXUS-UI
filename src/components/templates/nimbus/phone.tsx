"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { PHONE_BODIES, STATUS_ICONS } from "./assets";
import { FONT_STACK } from "./theme";

export type PhoneFinish = "blue" | "silver" | "orange";

/** The three colours, with the label and the swatch shown by the colour picker. */
export const PHONE_FINISHES: readonly { id: PhoneFinish; label: string; swatch: string }[] = [
  { id: "blue", label: "Deep Blue", swatch: "#3d4f6a" },
  { id: "silver", label: "Silver", swatch: "#e3e4df" },
  { id: "orange", label: "Cosmic Orange", swatch: "#d4956a" },
];

/**
 * The phone body render has a transparent screen: these are the screen's position inside the 1350 x 2760
 * image, as percentages, and the width the screen content is laid out at before it is scaled to fit.
 */
const BODY_ASPECT = "1350 / 2760";
const SCREEN = { left: "5.4815%", top: "2.5725%", width: "88.963%", height: "94.8188%", radius: "16.49% / 7.57%" } as const;
const SCREEN_LAYOUT_WIDTH = 320;
const SCREEN_LAYOUT_HEIGHT = Math.round(SCREEN_LAYOUT_WIDTH * ((0.948188 * 2760) / (0.88963 * 1350)));

/** Time and the signal, Wi-Fi and battery icons, placed in percentages of the screen so they scale with it. */
function StatusBar({ light }: { light: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-30" style={{ height: "7.37%" }}>
      <span
        className="absolute top-[56%] font-semibold"
        style={{ left: "13.1%", transform: "translateY(-50%)", fontSize: "4.9cqw", letterSpacing: "-0.01em", color: light ? "#fff" : "#000", fontFamily: FONT_STACK }}
      >
        9:41
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={STATUS_ICONS}
        alt=""
        className="absolute top-[56%]"
        style={{ left: "72.9%", width: "19.4%", transform: "translateY(-50%)", filter: light ? "invert(1)" : "none" }}
      />
    </div>
  );
}

/**
 * A phone: the screen content is laid out at a fixed 320px width, then scaled to whatever width the frame
 * has, so every screen looks identical at any size. All three body colours are stacked and cross-fade when
 * `finish` changes. `light` picks white or black status bar icons.
 */
export function PhoneFrame({
  finish = "blue",
  children,
  className = "",
  style,
  light = true,
  shadow = true,
}: {
  finish?: PhoneFinish;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  light?: boolean;
  shadow?: boolean;
}) {
  const screenRef = useRef<HTMLDivElement>(null);

  // Keep the scale in a CSS variable so resizing never re-renders React.
  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const apply = () => {
      if (screen.clientWidth) screen.style.setProperty("--nb-phone-scale", String(screen.clientWidth / SCREEN_LAYOUT_WIDTH));
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(screen);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: BODY_ASPECT, ...style }}>
      <div
        ref={screenRef}
        className="absolute overflow-hidden bg-black"
        style={{
          left: SCREEN.left,
          top: SCREEN.top,
          width: SCREEN.width,
          height: SCREEN.height,
          borderRadius: SCREEN.radius,
          containerType: "inline-size",
          transform: "translateZ(0)",
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: SCREEN_LAYOUT_WIDTH, height: SCREEN_LAYOUT_HEIGHT, transform: "scale(var(--nb-phone-scale, 1))", containerType: "inline-size" }}
        >
          {children}
        </div>
        <StatusBar light={light} />
      </div>
      {PHONE_FINISHES.map(({ id, label }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={id}
          src={PHONE_BODIES[id]}
          alt={id === finish ? `iPhone 17 Pro in ${label}` : ""}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none transition-opacity duration-500"
          style={{
            opacity: id === finish ? 1 : 0,
            filter: shadow ? "drop-shadow(0 40px 50px rgba(0,0,0,.35)) drop-shadow(0 8px 14px rgba(0,0,0,.2))" : undefined,
          }}
        />
      ))}
    </div>
  );
}
