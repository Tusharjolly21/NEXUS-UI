"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface FeatureToolsCardProps {
  title?: string;
  description?: string;
  /** CSS background value for the card surface. Defaults to a dark glass style. */
  cardBg?: string;
  /** Custom icon for slot 1 (smallest). Defaults to GitHub SVG. */
  icon1?: React.ReactNode;
  /** Custom icon for slot 2 (medium). Defaults to Notion SVG. */
  icon2?: React.ReactNode;
  /** Custom icon for slot 3 (largest, centre). Defaults to Gmail SVG. */
  icon3?: React.ReactNode;
  /** Custom icon for slot 4 (medium). Defaults to Slack SVG. */
  icon4?: React.ReactNode;
  /** Custom icon for slot 5 (smallest). Defaults to Google Drive SVG. */
  icon5?: React.ReactNode;
  /** Enable 3-D tilt on mouse move. */
  enableTilt?: boolean;
  /** Tilt rotation degrees. */
  tiltStrength?: number;
  /** Enable magnetic icon attraction toward cursor. */
  enableMagnetic?: boolean;
  /** Magnetic pull multiplier (0 – 1). */
  magneticStrength?: number;
  /** Cursor distance at which magnetic effect starts (px). */
  magneticRadius?: number;
  /** Show conic-gradient orbit ring. */
  enableOrbit?: boolean;
  /** Full rotation duration in seconds. */
  orbitSpeed?: number;
  /** CSS color for the orbit ring sweep. */
  orbitColor?: string;
  className?: string;
}

const ORBIT_KEYFRAMES = `@keyframes ftc-orbit-spin { to { transform: rotate(360deg); } }`;

function GithubIcon() {
  return (
    // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" className="w-full h-full">
    //   <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    // </svg>
    <svg
      width="w-full"
      height="w-full"
      viewBox="-3 0 262 262"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
    >
      <path
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
        fill="#4285F4"
      />
      <path
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
        fill="#34A853"
      />
      <path
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
        fill="#FBBC05"
      />
      <path
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
        fill="#EB4335"
      />
    </svg>
  );
}

function NotionIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#FFFFFF"
      className="w-full h-full"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933l3.222-.187z"
      />
    </svg>
  );
}

function GmailIcon() {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 24 24"
    //   className="w-full h-full"
    // >
    //   <path
    //     d="M3.5 5.5h17A1.5 1.5 0 0 1 22 7v10a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17V7a1.5 1.5 0 0 1 1.5-1.5z"
    //     fill="#FFFFFF"
    //   />
    //   <path d="M22 7v10a1.5 1.5 0 0 1-1.5 1.5h-2V10.66L22 7z" fill="#4285F4" />
    //   <path d="M2 7v10a1.5 1.5 0 0 0 1.5 1.5h2V10.66L2 7z" fill="#34A853" />
    //   <path d="M5.5 18.5V10.66L12 14.5l6.5-3.84v7.84h-13z" fill="#EA4335" />
    //   <path d="M22 7L12 13.5 2 7l1-1.5h18L22 7z" fill="#FBBC04" />
    // </svg>
    <svg
      className="w-full h-full"
      viewBox="0 -3 240 240"
      id="ps_x5F_cc_x5F_app_x5F_RGB.svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{".st0{fill:#2e001e}.st1{fill:#ff2bc2}"}</style>
      <path className="st0" d="M10 10h220v214H10z" />
      <path className="st1" d="M0 0v234h240V0H0zm10 10h220v214H10V10z" />
      <path
        className="st1"
        d="M174.3 98.3c-1.5-.7-3.4-1-5.8-1-12.6 0-21 9.7-21 25.8 0 18.4 8.6 25.8 19.8 25.8 2.4 0 5-.3 6.9-1.1V98.3h.1zm-44.8 25.6c0-23.3 15-41.5 39.6-41.5 2.1 0 3.2 0 5.2.2v-26c0-.6.5-1 1-1h16.1c.8 0 1 .3 1 .8v91.4c0 2.7 0 6.1.5 9.8 0 .7 0 .8-.6 1.1-8.4 4-17.2 5.8-25.6 5.8-21.7 0-37.2-13.4-37.2-40.6zm-34.1-16.2l28 54.3c.5.8.2 1.6-.6 1.6h-17.4c-1.1 0-1.6-.3-2.1-1.3-6.4-13.2-12.9-26.9-19.6-41.1h-.2c-6 13.4-12.6 28-19 41.2-.5.8-1 1.1-1.8 1.1H46.1c-1 0-1.1-.8-.6-1.4l27.4-52.7L46.4 57c-.6-.8 0-1.5.7-1.5h17.2c1 0 1.5.2 1.8 1.1C72.4 69.9 78.8 83 84.8 96.4h.2c5.8-13.2 12.2-26.5 18.3-39.6.5-.8.8-1.3 1.8-1.3h16.1c.8 0 1.1.6.6 1.5l-26.4 50.7z"
      />
    </svg>
  );
}

function SlackIcon() {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 24 24"
    //   className="w-full h-full"
    // >
    //   <path
    //     d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
    //     fill="#E01E5A"
    //   />
    //   <path
    //     d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
    //     fill="#36C5F0"
    //   />
    //   <path
    //     d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
    //     fill="#2EB67D"
    //   />
    //   <path
    //     d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
    //     fill="#ECB22E"
    //   />
    // </svg>
    <svg
      fill="#000000"
      width="w-full"
      height="h-full"
      viewBox="-52.01 0 560.035 560.035"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M380.844 297.529c.787 84.752 74.349 112.955 75.164 113.314-.622 1.988-11.754 40.191-38.756 79.652-23.343 34.117-47.568 68.107-85.731 68.811-37.499.691-49.557-22.236-92.429-22.236-42.859 0-56.256 21.533-91.753 22.928-36.837 1.395-64.889-36.891-88.424-70.883-48.093-69.53-84.846-196.475-35.496-282.165 24.516-42.554 68.328-69.501 115.882-70.192 36.173-.69 70.315 24.336 92.429 24.336 22.1 0 63.59-30.096 107.208-25.676 18.26.76 69.517 7.376 102.429 55.552-2.652 1.644-61.159 35.704-60.523 106.559M310.369 89.418C329.926 65.745 343.089 32.79 339.498 0 311.308 1.133 277.22 18.785 257 42.445c-18.121 20.952-33.991 54.487-29.709 86.628 31.421 2.431 63.52-15.967 83.078-39.655" />
    </svg>
  );
}

function DriveIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-full h-full"
    >
      <path d="M7.71 3.5L1.15 15l3.42 6 6.55-11.5z" fill="#0066DA" />
      <path d="M16.29 3.5H7.71l6.55 11.5h8.59z" fill="#FFC107" />
      <path d="M22.85 15h-8.59l-3.16 5.5h8.31z" fill="#1B872B" />
      <path
        d="M14.26 15l-3.14-5.5L7.71 3.5l3.42 6h.01l3.12 5.5z"
        fill="#EA4335"
      />
      <path d="M22.85 15l-3.14-5.5h-5.45l3.14 5.5z" fill="#188038" />
    </svg>
  );
}

const CIRCLE_BASE =
  "rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-350 ease-spring hover:z-10";

const CIRCLE_SHADOW =
  "shadow-[inset_0px_0px_8px_0px_rgba(248,248,248,0.25),0px_32px_24px_-16px_rgba(0,0,0,0.40)] hover:shadow-[inset_0px_0px_12px_0px_rgba(248,248,248,0.4),0px_32px_32px_-16px_rgba(0,0,0,0.5)]";

export function FeatureToolsCard({
  title = "Feature Block Animated Card",
  description = "A card that showcases a set of tools your platform connects with.",
  cardBg = "rgba(40,40,40,0.70)",
  icon1,
  icon2,
  icon3,
  icon4,
  icon5,
  enableTilt = true,
  tiltStrength = 8,
  enableMagnetic = true,
  magneticStrength = 0.4,
  magneticRadius = 120,
  enableOrbit = true,
  orbitSpeed = 18,
  orbitColor = "rgba(255,255,255,0.18)",
  className,
}: FeatureToolsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const magnetRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    function onMove(e: MouseEvent) {
      const rect = card!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (enableTilt) {
        const rx = ((my - rect.height / 2) / (rect.height / 2)) * -tiltStrength;
        const ry = ((mx - rect.width / 2) / (rect.width / 2)) * tiltStrength;
        card!.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }

      if (enableMagnetic) {
        magnetRefs.current.forEach((m) => {
          if (!m) return;
          const r = m.getBoundingClientRect();
          const cx = r.left + r.width / 2 - rect.left;
          const cy = r.top + r.height / 2 - rect.top;
          const dx = mx - cx;
          const dy = my - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < magneticRadius) {
            const pull = (1 - dist / magneticRadius) * magneticStrength;
            m.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
          } else {
            m.style.transform = "translate(0,0)";
          }
        });
      }
    }

    function onLeave() {
      if (enableTilt)
        card!.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
      if (enableMagnetic) {
        magnetRefs.current.forEach((m) => {
          if (m) m.style.transform = "translate(0,0)";
        });
      }
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    };
  }, [
    enableTilt,
    tiltStrength,
    enableMagnetic,
    magneticStrength,
    magneticRadius,
  ]);

  const setMagnet = (i: number) => (el: HTMLDivElement | null) => {
    magnetRefs.current[i] = el;
  };

  const icons = [
    { node: icon1 ?? <GithubIcon />, size: "w-8 h-8", iconSize: "w-4 h-4" },
    { node: icon2 ?? <NotionIcon />, size: "w-12 h-12", iconSize: "w-6 h-6" },
    { node: icon3 ?? <GmailIcon />, size: "w-16 h-16", iconSize: "w-8 h-8" },
    { node: icon4 ?? <SlackIcon />, size: "w-12 h-12", iconSize: "w-6 h-6" },
    { node: icon5 ?? <DriveIcon />, size: "w-8 h-8", iconSize: "w-4 h-4" },
  ];

  return (
    <div
      ref={cardRef}
      className={cn("w-full max-w-sm rounded-xl p-8 box-border", className)}
      style={{
        background: cardBg,
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "inset 2px 4px 16px 0px rgba(248,248,248,0.06)",
        transformStyle: "preserve-3d",
        transition: "transform 0.2s ease-out",
        willChange: "transform",
      }}
    >
      <style>{ORBIT_KEYFRAMES}</style>

      {/* Stage with orbit ring */}
      <div
        className="relative h-80 rounded-xl overflow-hidden"
        style={{
          background: cardBg,
          WebkitMaskImage:
            "radial-gradient(50% 50% at 50% 50%, white 0%, transparent 100%)",
          maskImage:
            "radial-gradient(50% 50% at 50% 50%, white 0%, transparent 100%)",
        }}
      >
        {/* Orbit ring */}
        {enableOrbit && (
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: 280,
              height: 280,
              marginTop: -140,
              marginLeft: -140,
              background: `conic-gradient(from 0deg, transparent 0%, ${orbitColor} 25%, transparent 50%, ${orbitColor} 75%, transparent 100%)`,
              WebkitMask:
                "radial-gradient(circle, transparent 56%, black 58%, black 80%, transparent 82%)",
              mask: "radial-gradient(circle, transparent 56%, black 58%, black 80%, transparent 82%)",
              animation: `ftc-orbit-spin ${orbitSpeed}s linear infinite`,
              zIndex: 1,
            }}
          />
        )}

        {/* Icon row */}
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="flex flex-row items-center justify-center gap-2">
            {icons.map(({ node, size, iconSize }, i) => (
              <div
                key={i}
                ref={setMagnet(i)}
                className="inline-flex"
                style={{
                  transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                  willChange: "transform",
                }}
              >
                <div
                  className={cn(
                    CIRCLE_BASE,
                    CIRCLE_SHADOW,
                    size,
                    "bg-white/[0.01] hover:scale-110",
                  )}
                >
                  <span className={cn("pointer-events-none", iconSize)}>
                    {node}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="mt-2 pt-2 text-[18px] font-semibold leading-snug tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-white/50">
        {description}
      </p>
    </div>
  );
}
