"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useReducedMotion } from "./hooks";
import { Icon } from "./icons";
import { MAP_CITIES, MAP_HEIGHT, MAP_WIDTH } from "./data/map";
import { LandDots } from "./radar-map";
import { noise, rainColor, rainNoise } from "./radar-field";
import { FONT_STACK } from "./theme";
import { Reveal, SectionTitle } from "./ui";

/** The radar covers 60 minutes back to 120 minutes ahead. The timeline value is minutes from "now". */
const MIN_MINUTES = -60;
const MAX_MINUTES = 120;
/** Minutes of radar time that pass per millisecond of real time while playing: a full loop takes about 15 seconds. */
const PLAY_SPEED = 0.012;
/** "Now" on the clock is 16:05. */
const NOW_MINUTE_OF_DAY = 16 * 60 + 5;

/** The radar image is rendered small (120 x 90) and drawn at double size with a blur, so cells melt together. */
const GRID_WIDTH = 120;
const GRID_HEIGHT = 90;

function clockLabel(minutesFromNow: number) {
  const total = NOW_MINUTE_OF_DAY + minutesFromNow;
  const hours = Math.floor((((total % 1440) + 1440) % 1440) / 60);
  const minutes = ((total % 60) + 60) % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Paints the rain field for `minutes` from now into a small canvas. The field drifts east and a little north over time. */
function paintRain(minutes: number, image: ImageData) {
  const t = minutes / 60;
  const data = image.data;
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      let rain = rainNoise(x / 22 - t * 0.9, y / 22 - t * 0.12);
      rain = Math.max(0, (rain - 0.48) / 0.52);
      rain = Math.pow(rain, 0.85) * (0.75 + 0.25 * noise(x / 9 + t, y / 9));
      const [r, g, b, a] = rainColor(rain);
      const i = (y * GRID_WIDTH + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
}

/**
 * "A radar that looks ahead." A dark map of dotted land with an animated rain field over it, play and pause,
 * and a time slider that scrubs from an hour ago to two hours ahead. The canvas only animates while it is on
 * screen and playing, and not at all with reduced motion (the slider still redraws it).
 */
export function Radar() {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(frameRef, { amount: 0.1 });
  const reduced = !!useReducedMotion();
  /** The playhead in minutes from now. A motion value, so the animation loop can advance it without re-rendering. */
  const time = useMotionValue(0);
  const [playing, setPlaying] = useState(true);
  /** The playhead rounded to 5 minutes: what the slider and the clock show. */
  const [shown, setShown] = useState(0);
  useMotionValueEvent(time, "change", (minutes) => setShown(Math.round(minutes / 5) * 5));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = GRID_WIDTH * 2;
    canvas.height = GRID_HEIGHT * 2;
    const field = document.createElement("canvas");
    field.width = GRID_WIDTH;
    field.height = GRID_HEIGHT;
    const fieldCtx = field.getContext("2d")!;
    const image = fieldCtx.createImageData(GRID_WIDTH, GRID_HEIGHT);

    const draw = () => {
      paintRain(time.get(), image);
      fieldCtx.putImageData(image, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(5px) saturate(1.1)";
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(field, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";
    };

    const animate = inView && playing && !reduced;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      if (now - last < 31) return;
      let next = time.get() + (now - last) * PLAY_SPEED;
      last = now;
      if (next > MAX_MINUTES) next = MIN_MINUTES;
      time.set(next);
      draw();
    };

    draw();
    // When nothing is animating, scrubbing the slider still has to repaint.
    const stopListening = animate ? undefined : time.on("change", draw);
    if (animate) frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      stopListening?.();
    };
  }, [inView, playing, reduced, time]);

  return (
    <section id="radar" className="scroll-mt-12 bg-black px-5 py-28 text-white sm:py-36">
      <div className="mx-auto max-w-[1024px]">
        <Reveal>
          <SectionTitle style={{ color: "#f5f5f7" }}>
            A radar that
            <br />
            looks ahead.
          </SectionTitle>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="m-0 mt-5 max-w-[520px] text-[19px] leading-[1.45]" style={{ color: "#a1a1a6" }}>
            Watch rain cross the map an hour back and two hours ahead, drawn from 5-minute radar and our own short-range model.
          </p>
        </Reveal>
        <Reveal delay={0.15} className="mt-12">
          <div ref={frameRef} className="relative overflow-hidden rounded-[28px]" style={{ background: "#0d1117", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)" }}>
            <div className="relative aspect-[4/5] sm:aspect-[16/10]">
              <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <LandDots radius={0.28} color="rgba(255,255,255,.22)" />
              </svg>
              <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" style={{ mixBlendMode: "screen", opacity: 0.9 }} />
              <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label="Rain radar over western Europe">
                {MAP_CITIES.map((city) => (
                  <g key={city.name}>
                    <circle cx={city.x} cy={city.y} r=".5" fill="#fff" />
                    <text x={city.x + 1.1} y={city.y + 0.55} fontSize="1.6" fill="rgba(255,255,255,.85)" fontFamily={FONT_STACK}>
                      {city.name}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="absolute left-4 top-4 rounded-[12px] px-3 py-2 text-[12px]" style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(12px)" }}>
                <div className="mb-1.5 font-medium">Precipitation</div>
                <div className="h-1.5 w-36 rounded-full" style={{ background: "linear-gradient(90deg,#50b4ff,#34c759,#ffd60a,#ff9f0a,#ff3b30)" }} />
                <div className="mt-1 flex justify-between" style={{ color: "#a1a1a6" }}>
                  <span>Light</span>
                  <span>Heavy</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t px-4 py-4 sm:px-6" style={{ borderColor: "rgba(255,255,255,.08)" }}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setPlaying((p) => !p)}
                disabled={reduced}
                aria-label={playing && !reduced ? "Pause radar" : "Play radar"}
                className="nb-ring grid h-10 w-10 shrink-0 place-items-center rounded-full outline-none disabled:opacity-50"
                style={{ background: "#fff", color: "#000" }}
              >
                <Icon name={playing && !reduced ? "pause-fill" : "play-fill"} size={16} />
              </motion.button>
              <div className="flex-1">
                <input
                  type="range"
                  min={MIN_MINUTES}
                  max={MAX_MINUTES}
                  step={1}
                  value={shown}
                  onChange={(event) => {
                    setPlaying(false);
                    time.set(Number(event.target.value));
                  }}
                  aria-label="Radar time"
                  className="nb-ring w-full accent-white outline-none"
                />
                <div className="mt-1 flex justify-between text-[12px]" style={{ color: "#86868b" }}>
                  <span>−1 h</span>
                  <span>Now</span>
                  <span>+1 h</span>
                  <span>+2 h</span>
                </div>
              </div>
              <div className="w-[64px] text-right">
                <div className="text-[17px] font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {clockLabel(shown)}
                </div>
                <div className="text-[11px]" style={{ color: "#86868b" }}>
                  {shown === 0 ? "Now" : shown < 0 ? "Past" : "Forecast"}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
