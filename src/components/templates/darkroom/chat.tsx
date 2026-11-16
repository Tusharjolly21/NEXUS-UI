"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IDEAS, easeInOutCubic, stepAt, styleName } from "./data";
import { Placeholder } from "./gallery";
import { makeCanvas } from "./paint-kit";
import { seededRandom } from "./random";
import { ASPECTS, printCache, renderPrint } from "./render";
import { COLORS, EASE, FONT_MONO, SPRING, SPRING_SOFT, clamp, hashString } from "./theme";
import type { ImgMap, Job, PrintActs, StyleId, UserMsg } from "./types";
import { Icon, Logo } from "./ui";

type DevelopingPrintProps = {
  id: string;
  start: number;
  dur: number;
  delay: number;
  light: boolean;
  aspect: number;
};

/**
 * A print developing in the tray: a spiral of grains gathers into a grid, takes on the print's tones and colours,
 * then a soft blurred frame and the finished image fade up through it. Everything runs on one rAF loop.
 */
function DevelopingPrint({ id, start, dur, delay, light, aspect }: DevelopingPrintProps) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLImageElement>(null);
  const lightRef = useRef(light);
  useEffect(() => {
    lightRef.current = light;
  }, [light]);
  useEffect(() => {
    let raf = 0;
    let alive = true;
    const COLS = 30;
    const rows = Math.max(8, Math.round(COLS * aspect));
    const count = COLS * rows;
    const rand = seededRandom(hashString(id));
    const delays = new Float32Array(count);
    for (let index = 0; index < count; index++) {
      delays[index] = rand() * 0.25;
    }
    const distance = (cell: number) =>
      Math.hypot((cell % COLS) + 0.5 - COLS / 2, ((Math.floor(cell / COLS) + 0.5 - rows / 2) * aspect * COLS) / rows);
    const order = Array.from({ length: count }, (_, cell) => cell).sort((a, b) => distance(a) - distance(b));
    let tones: Float32Array | null = null;
    let pixels: Uint8ClampedArray | null = null;
    let ready = false;
    /** Read the finished print (once it is painted) down to one tone and colour per grain. */
    const sample = () => {
      const print = printCache.get(id);
      if (!print) {
        return;
      }
      const [, small] = makeCanvas(COLS, rows);
      small.drawImage(print, 0, 0, COLS, rows);
      const data = small.getImageData(0, 0, COLS, rows).data;
      const lum = new Float32Array(count);
      pixels = data;
      for (let cell = 0; cell < count; cell++) {
        lum[cell] = (0.3 * data[cell * 4] + 0.59 * data[cell * 4 + 1] + 0.11 * data[cell * 4 + 2]) / 255;
      }
      const sorted = [...lum].sort((a, b) => a - b);
      const low = sorted[Math.floor(count * 0.04)];
      const high = sorted[Math.floor(count * 0.96)];
      const range = Math.max(0.15, high - low);
      for (let cell = 0; cell < count; cell++) {
        lum[cell] = clamp((lum[cell] - low) / range) * 0.9 + 0.08;
      }
      tones = lum;
      const [thumb, thumbCtx] = makeCanvas(9, Math.max(4, Math.round(9 * aspect)));
      thumbCtx.drawImage(print, 0, 0, thumb.width, thumb.height);
      if (frame.current) {
        frame.current.style.backgroundImage = `url(${thumb.toDataURL()})`;
      }
      if (reveal.current) {
        reveal.current.src = print.toDataURL("image/jpeg", 0.92);
      }
      ready = true;
    };
    const draw = () => {
      if (!alive) {
        return;
      }
      const target = canvas.current;
      const holder = box.current;
      if (!target || !holder) {
        raf = requestAnimationFrame(draw);
        return;
      }
      if (!ready) {
        sample();
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = holder.clientWidth;
      const h = holder.clientHeight;
      if (target.width !== Math.round(w * dpr)) {
        target.width = Math.round(w * dpr);
        target.height = Math.round(h * dpr);
      }
      const ctx = target.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const now = performance.now();
      const elapsed = clamp((now - start - delay) / dur);
      const time = now / 1e3;
      // Hold at the spiral until the print exists, so grains never settle on the wrong tones.
      const progress = ready ? elapsed : Math.min(elapsed, 0.24);
      const cellW = w / COLS;
      const cellH = h / rows;
      const dark = !lightRef.current;
      const grainsLeft = 1 - clamp((progress - 0.74) / 0.16);
      const colorIn = clamp((progress - 0.42) / 0.3);
      if (grainsLeft > 0) {
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.42;
        for (let rank = 0; rank < count; rank++) {
          const cell = order[rank];
          const homeX = ((cell % COLS) + 0.5) * cellW;
          const homeY = (Math.floor(cell / COLS) + 0.5) * cellH;
          const r = Math.sqrt((rank + 0.5) / count);
          const settle = easeInOutCubic(clamp((progress - 0.12 - (rank / count) * 0.16 - delays[rank] * 0.1) / 0.3));
          const pulse = Math.sin(time * 2.4 - r * 7);
          // Golden-angle spiral, slowly turning.
          const theta = rank * 2.39996 + time * 0.22;
          const spiral = radius * r * (1 + 0.035 * pulse);
          const spiralX = cx + Math.cos(theta) * spiral;
          const spiralY = cy + Math.sin(theta) * spiral;
          const x = spiralX + (homeX - spiralX) * settle;
          const y = spiralY + (homeY - spiralY) * settle;
          const tone = tones ? (dark ? tones[cell] : 1 - tones[cell]) : 0.4;
          const loose = Math.min(cellW, cellH) * (0.1 + 0.11 * (0.5 + 0.5 * pulse)) * (1.15 - 0.45 * r);
          const settled = Math.min(cellW, cellH) * 0.47 * Math.sqrt(tone);
          const size = loose + (settled - loose) * settle;
          if (size < 0.2) {
            continue;
          }
          let rgb = dark ? "243,239,233" : "27,24,21";
          if (pixels && colorIn > 0) {
            const base = dark ? [243, 239, 233] : [27, 24, 21];
            const source = pixels;
            rgb = [0, 1, 2]
              .map((channel) => Math.round(base[channel] + (source[cell * 4 + channel] - base[channel]) * colorIn))
              .join(",");
          }
          const alpha = (0.5 + 0.5 * settle) * grainsLeft * (settle < 0.02 ? 0.55 + 0.45 * (0.5 + 0.5 * pulse) : 1);
          ctx.fillStyle = `rgba(${rgb},${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, 6.2832);
          ctx.fill();
        }
      }
      const frameIn = clamp((progress - 0.48) / 0.12) * (1 - clamp((progress - 0.86) / 0.1));
      if (frame.current) {
        frame.current.style.opacity = String(frameIn);
      }
      const sharpen = clamp((progress - 0.7) / 0.3);
      if (reveal.current) {
        reveal.current.style.opacity = String(clamp((progress - 0.68) / 0.12));
        reveal.current.style.filter = `blur(${(1 - easeInOutCubic(sharpen)) * 12}px) brightness(${1.3 - 0.3 * sharpen}) contrast(${0.72 + 0.28 * sharpen}) saturate(${0.55 + 0.45 * sharpen}) sepia(${(1 - sharpen) * 0.35})`;
      }
      if (elapsed < 1 || !ready) {
        raf = requestAnimationFrame(draw);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [id, start, dur, delay, aspect]);
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden" aria-hidden={true}>
      <div
        ref={frame}
        className="absolute inset-[-8%] bg-cover bg-center opacity-0"
        style={{
          filter: "blur(16px) saturate(1.1)",
        }}
      />
      {/* Filled in from a canvas once the print is painted. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={reveal} alt="" className="absolute inset-0 size-full object-cover opacity-0" />
      <canvas ref={canvas} className="absolute inset-0 size-full" />
    </div>
  );
}

type DevelopProgressProps = { start: number; dur: number; onDone: () => void };

/** The step label, a seconds countdown and a hairline progress bar above a developing job. */
function DevelopProgress({ start, dur, onDone }: DevelopProgressProps) {
  const [progress, setProgress] = useState(0);
  const bar = useRef<HTMLDivElement>(null);
  const latestDone = useRef(onDone);
  useEffect(() => {
    latestDone.current = onDone;
  });
  useEffect(() => {
    let frame = 0;
    let done = false;
    let lastTick = -1;
    const tick = () => {
      const t = clamp((performance.now() - start) / dur);
      if (bar.current) {
        bar.current.style.transform = `scaleX(${t})`;
      }
      const tickIndex = Math.floor(t * 40);
      if (tickIndex !== lastTick) {
        lastTick = tickIndex;
        setProgress(t);
      }
      if (t >= 1) {
        if (!done) {
          done = true;
          setTimeout(() => latestDone.current(), 220);
        }
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, dur]);
  const secondsLeft = Math.max(1, Math.ceil((dur * (1 - progress)) / 1e3));
  return (
    <div className="mb-2.5" role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="relative grid size-4 place-items-center">
          <span
            className="absolute size-2 rounded-full breathe"
            style={{
              background: COLORS.acc,
            }}
          />
          <span
            className="size-1.5 rounded-full"
            style={{
              background: COLORS.acc,
            }}
          />
        </span>
        <span className="font-[500] shimmer">{stepAt(progress)}</span>
        <span
          className="ml-auto tabular-nums"
          style={{
            color: COLORS.soft,
            fontFamily: FONT_MONO,
            fontSize: 12,
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={secondsLeft}
              className="inline-block"
              initial={{
                y: -8,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 8,
                opacity: 0,
              }}
              transition={{
                duration: 0.25,
                ease: EASE,
              }}
            >
              {secondsLeft}s
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
      <div
        className="mt-2 h-px w-full overflow-hidden"
        style={{
          background: COLORS.line2,
        }}
      >
        <div
          ref={bar}
          className="h-full origin-left"
          style={{
            background: COLORS.acc,
            transform: "scaleX(0)",
          }}
        />
      </div>
    </div>
  );
}

export function UserMessage({ m: msg }: { m: UserMsg }) {
  return (
    <motion.div
      layout="position"
      initial={{
        opacity: 0,
        y: 12,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={SPRING_SOFT}
      className="flex flex-col items-end"
    >
      <div
        className="max-w-[min(520px,88%)] rounded-[18px] rounded-br-[6px] px-4 py-2.5 text-[14.5px] leading-[1.5]"
        style={{
          background: COLORS.raise,
          color: COLORS.ink,
          boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
        }}
      >
        {msg.text}
      </div>
      {msg.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap justify-end gap-1">
          {msg.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-[2px] text-[11.5px]"
              style={{
                color: COLORS.soft,
                boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

type PrintActionProps = { icon: string; label: string; onClick: () => void; on?: boolean; onIcon?: string };

function PrintAction({ icon, label, onClick, on, onIcon }: PrintActionProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      data-tip={label}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-[9px] transition-colors hover:bg-[var(--raise)] active:scale-[.92]"
      style={{
        color: on ? COLORS.ink : COLORS.soft,
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={on ? "on" : "off"}
          initial={{
            scale: 0.4,
            opacity: 0,
            rotate: -20,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: 0,
          }}
          exit={{
            scale: 0.4,
            opacity: 0,
          }}
          transition={SPRING}
        >
          <Icon name={on && onIcon ? onIcon : icon} size={16} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

type JobResultProps = { job: Job; imgs: ImgMap; light: boolean; act: PrintActs };

/** The assistant's reply to a prompt: its note, the prints (developing or done) and the actions under them. */
export function JobResult({ job, imgs, light, act }: JobResultProps) {
  const count = job.specs.length;
  const landscape = ASPECTS[job.specs[0].aspect] < 0.9;
  const maxW = count === 1 ? (landscape ? 600 : 420) : count === 2 ? (landscape ? 640 : 520) : landscape ? 640 : 500;
  const developing = job.status === "developing";
  const [copied, setCopied] = useState(false);
  const first = imgs[job.ids[0]];
  return (
    <motion.div
      layout="position"
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={SPRING_SOFT}
      className="flex gap-3"
    >
      <div className="mt-0.5 hidden sm:block">
        <Logo size={24} />
      </div>
      <div className="min-w-0 flex-1">
        {job.mode === "agent" && job.note && (
          <motion.p
            initial={{
              opacity: 0,
              filter: "blur(4px)",
            }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.6,
              delay: 0.15,
            }}
            className="mb-3 max-w-[560px] text-[14.5px] leading-[1.55]"
            style={{
              color: COLORS.text,
            }}
          >
            {job.note}
          </motion.p>
        )}
        <div
          style={{
            maxWidth: maxW,
          }}
        >
          {developing && <DevelopProgress start={job.at} dur={job.dur} onDone={() => act.finish(job.id)} />}
          <div className={`grid gap-1.5 ${count > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {job.specs.map((spec, i) => {
              const id = job.ids[i];
              const img = imgs[id];
              return (
                <div
                  key={id}
                  data-art-id={id}
                  className="group/a relative overflow-hidden rounded-[14px]"
                  style={{
                    aspectRatio: `1 / ${ASPECTS[spec.aspect]}`,
                    background: COLORS.raise,
                    boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
                  }}
                >
                  {developing ? (
                    <DevelopingPrint
                      id={id}
                      start={job.at}
                      dur={job.dur - i * 90}
                      delay={i * 90}
                      light={light}
                      aspect={ASPECTS[spec.aspect]}
                    />
                  ) : (
                    img && (
                      <button
                        type="button"
                        onClick={() => act.open(id)}
                        aria-label={`Open ${img.title}`}
                        className="absolute inset-0 block size-full"
                      >
                        {/* A blob URL rendered from a canvas: next/image cannot optimise it. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.title}
                          draggable={false}
                          className="size-full object-cover transition-transform duration-500 group-hover/a:scale-[1.015]"
                        />
                      </button>
                    )
                  )}
                  {!developing && !img && <Placeholder seed={id} />}
                  {!developing && img && count > 1 && (
                    <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1 opacity-0 transition-opacity duration-200 group-hover/a:opacity-100 group-focus-within/a:opacity-100">
                      {(
                        [
                          ["ph:arrows-out-simple", "Upscale 2x", () => act.upscale(id)],
                          ["ph:download-simple", "Download PNG", () => act.download(id)],
                        ] as const
                      ).map(([icon, label, onClick]) => (
                        <button
                          key={label}
                          type="button"
                          aria-label={label}
                          data-tip={label}
                          onClick={onClick}
                          className="pointer-events-auto grid size-7 place-items-center rounded-[8px] backdrop-blur-md"
                          style={{
                            background: "rgba(12,11,10,.55)",
                            color: "#F3EFE9",
                          }}
                        >
                          <Icon name={icon} size={14} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <AnimatePresence initial={false}>
            {!developing && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                transition={{
                  duration: 0.35,
                  ease: EASE,
                }}
                className="overflow-visible"
              >
                <div className="flex items-center gap-0.5 pt-2">
                  <PrintAction
                    icon="ph:thumbs-up"
                    onIcon="ph:thumbs-up-fill"
                    label="Good result"
                    on={job.vote === 1}
                    onClick={() => act.vote(job.id, 1)}
                  />
                  <PrintAction
                    icon="ph:thumbs-down"
                    onIcon="ph:thumbs-down-fill"
                    label="Not quite"
                    on={job.vote === -1}
                    onClick={() => act.vote(job.id, -1)}
                  />
                  <PrintAction
                    icon="ph:copy"
                    onIcon="ph:check"
                    label={copied ? "Copied" : "Copy prompt"}
                    on={copied}
                    onClick={() => {
                      act.copy(job.prompt);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1400);
                    }}
                  />
                  {count === 1 && (
                    <PrintAction
                      icon="ph:download-simple"
                      label="Download PNG"
                      onClick={() => act.download(job.ids[0])}
                    />
                  )}
                  <span
                    className="mx-1 h-4 w-px"
                    style={{
                      background: COLORS.line2,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => act.variations(job)}
                    className="flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-[12.5px] font-[500] transition-colors hover:bg-[var(--raise)]"
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    <Icon name="ph:shuffle" size={14} />
                    Variations
                  </button>
                  {count === 1 && !job.upscale && (
                    <button
                      type="button"
                      onClick={() => act.upscale(job.ids[0])}
                      className="flex h-8 items-center gap-1.5 rounded-[9px] px-2.5 text-[12.5px] font-[500] transition-colors hover:bg-[var(--raise)]"
                      style={{
                        color: COLORS.text,
                      }}
                    >
                      <Icon name="ph:arrows-out-simple" size={14} />
                      Upscale
                    </button>
                  )}
                  {first && (
                    <span
                      className="ml-auto hidden text-[11.5px] sm:inline"
                      style={{
                        color: COLORS.soft,
                        fontFamily: FONT_MONO,
                      }}
                    >
                      {job.label ?? `${first.w} × ${first.h}`}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

type LandingProps = { onPick: (prompt: string, style: StyleId) => void };

/** The empty chat: a short welcome and four starter prompts, each with a tiny live-rendered preview. */
export function Landing({ onPick }: LandingProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => {
    let alive = true;
    const urls: string[] = [];
    IDEAS.forEach((idea, i) =>
      setTimeout(
        () => {
          if (alive) {
            urls[i] = renderPrint(
              {
                prompt: idea.prompt,
                style: idea.style,
                seed: hashString(idea.prompt),
                aspect: "1:1",
              },
              160,
            ).canvas.toDataURL("image/jpeg", 0.85);
            setPreviews([...urls]);
          }
        },
        60 + i * 50,
      ),
    );
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center px-1 pb-10 pt-6">
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          ease: EASE,
        }}
      >
        <Logo size={30} />
        <h1
          className="mt-5 text-[28px] font-[600] leading-[1.15] tracking-[-0.03em]"
          style={{
            color: COLORS.ink,
          }}
        >
          What should we develop?
        </h1>
        <p
          className="mt-2 text-[15px] leading-[1.55]"
          style={{
            color: COLORS.text,
          }}
        >
          Describe a place, a time of day and a feeling. Darkroom reads subjects and colour from your words, and the
          same prompt always prints the same picture.
        </p>
      </motion.div>
      <div className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {IDEAS.map((idea, i) => (
          <motion.button
            key={idea.prompt}
            type="button"
            onClick={() => onPick(idea.prompt, idea.style)}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              ...SPRING_SOFT,
              delay: 0.08 + i * 0.05,
            }}
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.985,
            }}
            className="flex items-center gap-3 rounded-[14px] p-2 pr-3 text-left"
            style={{
              background: COLORS.panel,
              boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
            }}
          >
            <span
              className="size-12 shrink-0 overflow-hidden rounded-[9px]"
              style={{
                background: COLORS.raise,
              }}
            >
              {previews[i] && (
                <motion.img
                  initial={{
                    opacity: 0,
                    filter: "blur(6px)",
                  }}
                  animate={{
                    opacity: 1,
                    filter: "blur(0px)",
                  }}
                  src={previews[i]}
                  alt=""
                  className="size-full object-cover"
                />
              )}
            </span>
            <span className="min-w-0">
              <span
                className="block text-[13.5px] leading-snug"
                style={{
                  color: COLORS.ink,
                }}
              >
                {idea.prompt}
              </span>
              <span
                className="mt-0.5 block text-[12px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                {styleName(idea.style)}
              </span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
