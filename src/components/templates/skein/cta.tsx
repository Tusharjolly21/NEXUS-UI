"use client";

import { useMemo, useRef } from "react";
import { Reveal, ButtonLink } from "./ui";
import { TAU, hslToRgb, seededRandom, useCanvas } from "./canvas";

const STREAK_COUNT = 560;
/** Each streak is drawn as this many segments, split across four fading bands. */
const SEGMENTS = 16;

type Streak = {
  /** Angle it leaves the centre at. */
  angle: number;
  /** How far out it reaches, as a fraction of the scene radius. */
  length: number;
  /** How much it bends away from a straight line. */
  curl: number;
  /** Where it starts, as a fraction of the scene radius. */
  startRadius: number;
  /** How fast its travelling dot moves. */
  speed: number;
  /** Where along the streak its dot starts. */
  phase: number;
  alpha: number;
};

const LINE_ALPHAS_DARK = [0.2, 0.14, 0.08, 0.035];
const LINE_ALPHAS_LIGHT = [0.22, 0.16, 0.09, 0.04];

/** Hundreds of thin curved lines fanning out from the centre; dots near the pointer light up in colour. */
function LineBurst({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streaks = useMemo<Streak[]>(() => {
    const random = seededRandom("burst");
    return Array.from({ length: STREAK_COUNT }, (_, index) => ({
      angle: (index / STREAK_COUNT) * TAU + (random() - 0.5) * 0.08,
      length: 0.45 + Math.pow(random(), 0.7) * 0.75,
      curl: (random() - 0.5) * 1.7,
      startRadius: 0.07 + Math.pow(random(), 1.5) * 0.26,
      speed: 0.06 + random() * 0.12,
      phase: random(),
      alpha: 0.25 + random() * 0.75,
    }));
  }, []);

  useCanvas(canvasRef, (frame) => {
    const { ctx, w, h, t, mouse } = frame;
    const scale = Math.max(w * 0.5, h * 0.75);
    const centerX = w / 2;
    const centerY = h / 2;
    const ink = frame.ink;
    const bands: number[][][] = [[], [], [], []];

    /** Point at progress `p` (0 to 1) along a streak; the lines sway slowly over time and are squashed vertically. */
    const pointAt = (streak: Streak, p: number): [number, number] => {
      const distance = streak.startRadius + (streak.length - streak.startRadius) * p;
      const angle = streak.angle + streak.curl * p * p + Math.sin(t * 0.22 + streak.angle * 3) * 0.05 * p;
      return [centerX + Math.cos(angle) * distance * scale, centerY + Math.sin(angle) * distance * scale * 0.6];
    };

    for (const streak of streaks) {
      for (let band = 0; band < 4; band++) {
        const coords: number[] = [];
        for (let segment = (band * SEGMENTS) / 4; segment <= ((band + 1) * SEGMENTS) / 4; segment++) {
          const [x, y] = pointAt(streak, segment / SEGMENTS);
          coords.push(x, y);
        }
        bands[band].push(coords);
      }
    }

    const lineAlphas = frame.dark ? LINE_ALPHAS_DARK : LINE_ALPHAS_LIGHT;
    ctx.lineWidth = 0.7;
    bands.forEach((band, bandIndex) => {
      ctx.strokeStyle = `rgba(${ink},${lineAlphas[bandIndex]})`;
      ctx.beginPath();
      for (const coords of band) {
        ctx.moveTo(coords[0], coords[1]);
        for (let i = 2; i < coords.length; i += 2) ctx.lineTo(coords[i], coords[i + 1]);
      }
      ctx.stroke();
    });

    for (const streak of streaks) {
      const progress = (streak.phase + t * streak.speed) % 1;
      const [x, y] = pointAt(streak, progress);
      const near = mouse.on ? Math.max(0, 1 - Math.hypot(x - mouse.x, y - mouse.y) / 160) : 0;
      const alpha = (1 - progress) * streak.alpha * 0.9;
      ctx.fillStyle =
        near > 0
          ? `rgba(${hslToRgb((streak.angle * 57 + t * 60) % 360, 0.9, frame.dark ? 0.68 : 0.5)},${Math.min(1, alpha + near)})`
          : `rgba(${ink},${alpha})`;
      const size = near > 0 ? 2.2 : 1.5;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  });

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none block h-full w-full ${className}`} />;
}

/** The closing band: a pointer-reactive line burst behind a headline and the two calls to action. */
export function Cta() {
  return (
    <section id="start" className="relative scroll-mt-20 overflow-hidden border-b border-solid border-[rgb(var(--skein-line)/.09)]">
      <div className="absolute inset-0">
        <LineBurst />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(38% 34% at 50% 50%, rgb(var(--skein-bg)) 0%, rgb(var(--skein-bg) / .7) 45%, transparent 100%)",
        }}
      />
      <div className="relative mx-auto flex min-h-[620px] max-w-[1140px] flex-col items-center justify-center px-5 py-24 text-center sm:min-h-[700px]">
        <Reveal
          as="h2"
          className="m-0 max-w-[12ch] skein-display text-[clamp(44px,6vw,76px)] font-bold leading-[0.95] tracking-[-0.035em] text-[rgb(var(--skein-ink))]"
        >
          Every request, finally visible
        </Reveal>
        <p className="m-0 mt-5 max-w-[30em] text-[15px] leading-[1.6] text-[rgb(var(--skein-mute))]">
          Free for 50 million spans a month. Set up in the time it takes to deploy.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <ButtonLink href="#start">Start tracing</ButtonLink>
          <ButtonLink href="#start" kind="secondary">
            Book a demo
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
