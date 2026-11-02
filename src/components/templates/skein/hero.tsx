"use client";

import { useMemo, useRef, type CSSProperties, type PointerEvent } from "react";
import { motion, type MotionProps } from "framer-motion";
import { TAU, hslToRgb, seededRandom, useCanvas } from "./canvas";
import { Icon, type IconName } from "./icons";
import { ButtonLink, Section } from "./ui";

/** Number of fibres in the skein, and how many points each one is simulated with. */
const THREAD_COUNT = 170;
const POINTS_PER_THREAD = 70;
/** Ambient pulses of light travelling along the fibres. */
const AMBIENT_PULSE_COUNT = 12;

const STEPS = [
  {
    n: 1,
    title: "Instrument",
    text: "One line of OpenTelemetry. 300+ integrations out of the box.",
  },
  {
    n: 2,
    title: "Thread",
    text: "Skein links every span to the request it belongs to.",
  },
  {
    n: 3,
    title: "Ask",
    text: "Question it in plain language and share the answer.",
  },
] as const;

const CUSTOMER_LOGOS: readonly (readonly [IconName, string])[] = [
  ["hexagon", "Northwind"],
  ["sun_haze_fill", "Lumen"],
  ["asterisk_circle_fill", "Quanta"],
  ["wind", "Halcyon"],
  ["flame_fill", "Corvid"],
  ["compass", "Meridian"],
  ["cloud_fill", "Stratus"],
  ["staroflife_fill", "Polaris"],
  ["drop_fill", "Tidal"],
  ["leaf_arrow_circlepath", "Arbor"],
];

type Fibre = {
  /** Position across the bundle, -1 to 1. */
  lane: number;
  /** Where along the skein the fibre starts and ends (0 to 1). */
  from: number;
  to: number;
  phase: number;
  /** Seconds before the fibre starts drawing itself in. */
  delay: number;
  /** Which of the three stroke weights it belongs to. */
  band: number;
  curl: number;
  /** Index of the point carrying a brighter bead, or -1 for none. */
  bead: number;
};

/** A point of light moving along one fibre. `position` is 0 to 1 along it. */
type Pulse = {
  thread: number;
  position: number;
  speed: number;
  life: number;
};

/** Per-point spring state for every fibre, stored flat as `thread * POINTS_PER_THREAD + point`. */
type FibreSimulation = {
  offsetX: Float32Array;
  offsetY: Float32Array;
  velocityX: Float32Array;
  velocityY: Float32Array;
  heat: Float32Array;
  /** Final drawn position of each point. */
  posX: Float32Array;
  posY: Float32Array;
};

type PointerState = { x: number; y: number; vx: number; vy: number; on: boolean };

function createSimulation(): FibreSimulation {
  const size = THREAD_COUNT * POINTS_PER_THREAD;
  return {
    offsetX: new Float32Array(size),
    offsetY: new Float32Array(size),
    velocityX: new Float32Array(size),
    velocityY: new Float32Array(size),
    heat: new Float32Array(size),
    posX: new Float32Array(size),
    posY: new Float32Array(size),
  };
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Canvas scene of the hero: a twisted bundle of fibres that frays at both ends, pushed around by the pointer. */
function ThreadScene({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fibres = useMemo<Fibre[]>(() => {
    const random = seededRandom("skein-hero");
    return Array.from({ length: THREAD_COUNT }, (_, index) => ({
      lane: (index / (THREAD_COUNT - 1)) * 2 - 1 + (random() - 0.5) * 0.03,
      from: random() * 0.22,
      to: 1 - random() * 0.22,
      phase: random() * TAU,
      delay: 0.15 + random() * 0.9,
      band: Math.floor(random() * 3),
      curl: (random() - 0.5) * 0.5,
      bead: random() < 0.35 ? 8 + Math.floor(random() * 50) : -1,
    }));
  }, []);

  // Created on first use rather than during render, since the draw loop mutates it every frame.
  const simRef = useRef<FibreSimulation | null>(null);

  const ambientPulses = useMemo<Pulse[]>(() => {
    const random = seededRandom("pulses");
    return Array.from({ length: AMBIENT_PULSE_COUNT }, () => ({
      thread: Math.floor(random() * THREAD_COUNT),
      position: random(),
      speed: 0.08 + random() * 0.1,
      life: 1,
    }));
  }, []);

  const clickPulses = useRef<Pulse[]>([]);
  const pointer = useRef<PointerState>({ x: -999, y: -999, vx: 0, vy: 0, on: false });

  // A press sends a fast, coloured pulse down the eight fibres nearest the pointer.
  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const sim = simRef.current;
    if (!sim) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const nearest: [distance: number, thread: number, point: number][] = [];
    for (let thread = 0; thread < THREAD_COUNT; thread++) {
      let best = 1e9;
      let bestPoint = 0;
      for (let point = 0; point < POINTS_PER_THREAD; point += 2) {
        const index = thread * POINTS_PER_THREAD + point;
        const distance = (sim.posX[index] - x) ** 2 + (sim.posY[index] - y) ** 2;
        if (distance < best) {
          best = distance;
          bestPoint = point;
        }
      }
      nearest.push([best, thread, bestPoint]);
    }
    nearest.sort((a, b) => a[0] - b[0]);
    for (const [, thread, point] of nearest.slice(0, 8)) {
      clickPulses.current.push({
        thread,
        position: point / (POINTS_PER_THREAD - 1),
        speed: 0.35 + Math.random() * 0.15,
        life: 1,
      });
    }
  };

  useCanvas(canvasRef, (frame) => {
    const { ctx, w, h, t, reduced } = frame;
    const dt = Math.max(1 / 240, Math.min(1 / 30, frame.dt || 1 / 60));
    const mouse = pointer.current;
    const sim = (simRef.current ??= createSimulation());

    // Track the pointer and a smoothed velocity so a fast sweep pushes harder than a slow one.
    if (frame.mouse.on) {
      if (mouse.on) {
        mouse.vx += ((frame.mouse.x - mouse.x) / dt - mouse.vx) * 0.3;
        mouse.vy += ((frame.mouse.y - mouse.y) / dt - mouse.vy) * 0.3;
      }
      mouse.x = frame.mouse.x;
      mouse.y = frame.mouse.y;
      mouse.on = true;
    } else {
      mouse.on = false;
      mouse.vx *= 0.9;
      mouse.vy *= 0.9;
    }

    // The bundle is laid out along an axis tilted by 0.3 rad, centred a little below the middle.
    const tilt = -0.3;
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    const centreX = w * 0.5;
    const centreY = h * 0.52;
    const halfLength = w * 0.56;
    const spread = Math.min(w, h * 0.9) * 0.36;
    const pushRadius = 120;
    const ink = frame.ink;
    const time = reduced ? 0 : t;

    for (let thread = 0; thread < THREAD_COUNT; thread++) {
      const fibre = fibres[thread];
      for (let point = 0; point < POINTS_PER_THREAD; point++) {
        const index = thread * POINTS_PER_THREAD + point;
        // `along` runs -1 to 1 down the fibre; `edge` is how far from the waist it is.
        const along = (fibre.from + (fibre.to - fibre.from) * (point / (POINTS_PER_THREAD - 1))) * 2 - 1;
        const edge = Math.abs(along);
        const fray = 0.05 + 0.95 * Math.pow(edge, 1.35);
        const twist = ((along + 1) / 2) * Math.PI + time * 0.16;
        const lateral = fibre.lane * fray * Math.cos(twist);
        const wave =
          (0.035 + edge * 0.06) * Math.sin(along * 3.1 - time * 0.75 + fibre.lane * 2.3 + fibre.phase * 0.2) +
          0.02 * Math.sin(time * 0.45 + fibre.phase) * edge;
        const axial = along * halfLength * 0.86;
        const across = (lateral + wave + 0.1 * Math.sin(along * 2.2 + 0.6) + fibre.curl * edge * edge * edge) * spread;
        const restX = centreX + axial * cos - across * sin;
        const restY = centreY + axial * sin + across * cos;

        if (!reduced) {
          // Spring back to rest, plus a push away from the pointer and some heat where it passes.
          let forceX = -70 * sim.offsetX[index] - 8.5 * sim.velocityX[index];
          let forceY = -70 * sim.offsetY[index] - 8.5 * sim.velocityY[index];
          if (mouse.on || Math.abs(mouse.vx) + Math.abs(mouse.vy) > 5) {
            const dx = restX + sim.offsetX[index] - mouse.x;
            const dy = restY + sim.offsetY[index] - mouse.y;
            const distance = Math.hypot(dx, dy) || 1;
            if (distance < pushRadius) {
              const falloff = 1 - distance / pushRadius;
              const push = falloff * falloff * 2600;
              forceX += (dx / distance) * push + mouse.vx * falloff * falloff * 4;
              forceY += (dy / distance) * push + mouse.vy * falloff * falloff * 4;
              const near = Math.max(0, 1 - distance / 64);
              const target = near * near;
              if (target > sim.heat[index]) sim.heat[index] += (target - sim.heat[index]) * Math.min(1, dt * 6);
            }
          }
          sim.velocityX[index] += forceX * dt;
          sim.velocityY[index] += forceY * dt;
          sim.heat[index] *= Math.exp(-dt * 1.5);
        }
        sim.posX[index] = restX;
        sim.posY[index] = restY;
      }

      if (!reduced) {
        const start = thread * POINTS_PER_THREAD;
        // Neighbouring points pull on each other so a push travels along the fibre like a wave.
        for (let point = 1; point < POINTS_PER_THREAD - 1; point++) {
          const index = start + point;
          sim.velocityX[index] += (sim.offsetX[index - 1] + sim.offsetX[index + 1] - 2 * sim.offsetX[index]) * 520 * dt;
          sim.velocityY[index] += (sim.offsetY[index - 1] + sim.offsetY[index + 1] - 2 * sim.offsetY[index]) * 520 * dt;
        }
        for (let point = 0; point < POINTS_PER_THREAD; point++) {
          const index = start + point;
          sim.offsetX[index] += sim.velocityX[index] * dt;
          sim.offsetY[index] += sim.velocityY[index] * dt;
          sim.posX[index] += sim.offsetX[index];
          sim.posY[index] += sim.offsetY[index];
        }
      }
    }

    // How much of a fibre has drawn itself in, 0 to 1, eased.
    const drawn = (fibre: Fibre) =>
      easeOutCubic(reduced ? 1 : Math.min(1, Math.max(0, (t - fibre.delay) / 1.6)));
    const drawnPoints = (fibre: Fibre) => Math.floor(drawn(fibre) * POINTS_PER_THREAD);

    // Base strokes, batched into three weights: flat list of (thread, visible point count) pairs.
    const bands: number[][] = [[], [], []];
    fibres.forEach((fibre, thread) => {
      const progress = drawn(fibre);
      if (progress <= 0) return;
      bands[fibre.band].push(thread, Math.max(2, Math.floor(progress * POINTS_PER_THREAD)));
    });
    const bandAlpha = frame.dark ? [0.08, 0.14, 0.24] : [0.12, 0.2, 0.3];
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    bands.forEach((band, bandIndex) => {
      ctx.strokeStyle = `rgba(${ink},${bandAlpha[bandIndex]})`;
      ctx.lineWidth = 0.5 + bandIndex * 0.15;
      ctx.beginPath();
      for (let i = 0; i < band.length; i += 2) {
        const start = band[i] * POINTS_PER_THREAD;
        const count = band[i + 1];
        ctx.moveTo(sim.posX[start], sim.posY[start]);
        for (let p = 1; p < count - 1; p++) {
          const midX = (sim.posX[start + p] + sim.posX[start + p + 1]) / 2;
          const midY = (sim.posY[start + p] + sim.posY[start + p + 1]) / 2;
          ctx.quadraticCurveTo(sim.posX[start + p], sim.posY[start + p], midX, midY);
        }
        ctx.lineTo(sim.posX[start + count - 1], sim.posY[start + count - 1]);
      }
      ctx.stroke();
    });

    // Heated segments (where the pointer has been) are bucketed by hue and heat level, then stroked once per bucket.
    const hueSteps = 18;
    const heatBuckets: number[][] = Array.from({ length: hueSteps * 3 }, () => []);
    for (let thread = 0; thread < THREAD_COUNT; thread++) {
      const visible = drawnPoints(fibres[thread]);
      for (let point = 0; point < visible - 1; point++) {
        const index = thread * POINTS_PER_THREAD + point;
        const heat = (sim.heat[index] + sim.heat[index + 1]) / 2;
        if (heat < 0.03) continue;
        const hue = (point * 5 + thread * 1.3 + t * 35) % 360;
        const hueStep = Math.floor((hue / 360) * hueSteps);
        const level = heat > 0.5 ? 2 : heat > 0.18 ? 1 : 0;
        heatBuckets[hueStep * 3 + level].push(sim.posX[index], sim.posY[index], sim.posX[index + 1], sim.posY[index + 1]);
      }
    }
    ctx.lineWidth = 1;
    heatBuckets.forEach((segments, bucket) => {
      if (!segments.length) return;
      const hueStep = Math.floor(bucket / 3);
      const level = bucket % 3;
      ctx.strokeStyle = `rgba(${hslToRgb(((hueStep + 0.5) / hueSteps) * 360, 0.78, frame.dark ? 0.68 : 0.48)},${[0.2, 0.45, 0.78][level]})`;
      ctx.beginPath();
      for (let i = 0; i < segments.length; i += 4) {
        ctx.moveTo(segments[i], segments[i + 1]);
        ctx.lineTo(segments[i + 2], segments[i + 3]);
      }
      ctx.stroke();
    });

    // A dot at the growing tip of each fibre, and a brighter bead on some.
    fibres.forEach((fibre, thread) => {
      const visible = drawnPoints(fibre);
      if (visible < 2) return;
      const start = thread * POINTS_PER_THREAD;
      ctx.fillStyle = `rgba(${ink},${frame.dark ? 0.55 : 0.6})`;
      ctx.fillRect(sim.posX[start + visible - 1] - 0.8, sim.posY[start + visible - 1] - 0.8, 1.6, 1.6);
      if (fibre.bead > 0 && fibre.bead < visible) {
        ctx.fillRect(sim.posX[start + fibre.bead] - 1, sim.posY[start + fibre.bead] - 1, 2, 2);
      }
    });

    if (reduced) return;

    // Pulses with a short fading tail. Press-triggered pulses are fast and coloured; ambient ones are ink.
    const pulses = [...ambientPulses.map((pulse) => ({ ...pulse, life: 1 })), ...clickPulses.current];
    ambientPulses.forEach((pulse) => {
      pulse.position += pulse.speed * dt;
      if (pulse.position > 1.05) {
        pulse.position = -0.05;
        pulse.thread = Math.floor(Math.random() * THREAD_COUNT);
      }
    });
    clickPulses.current = clickPulses.current.filter((pulse) => (pulse.position += pulse.speed * dt) < 1.02);

    for (const pulse of pulses) {
      if (drawn(fibres[pulse.thread]) < 1) continue;
      const start = pulse.thread * POINTS_PER_THREAD;
      for (let tail = 10; tail >= 0; tail--) {
        const position = pulse.position - tail * 0.006;
        if (position < 0 || position > 1) continue;
        const exact = position * (POINTS_PER_THREAD - 1);
        const lower = Math.floor(exact);
        const fraction = exact - lower;
        const upper = Math.min(POINTS_PER_THREAD - 1, lower + 1);
        const x = sim.posX[start + lower] + (sim.posX[start + upper] - sim.posX[start + lower]) * fraction;
        const y = sim.posY[start + lower] + (sim.posY[start + upper] - sim.posY[start + lower]) * fraction;
        const coloured = pulse.life === 1 && pulse.speed > 0.3;
        ctx.fillStyle = coloured
          ? `rgba(${hslToRgb((pulse.thread * 11 + t * 90) % 360, 0.9, frame.dark ? 0.7 : 0.5)},${tail === 0 ? 1 : 0.55 * (1 - tail / 11)})`
          : `rgba(${ink},${tail === 0 ? 0.95 : 0.45 * (1 - tail / 11)})`;
        const radius = tail === 0 ? 2.2 : 1.6 * (1 - tail / 12);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, TAU);
        ctx.fill();
      }
    }
  });

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onPointerDown}
      role="img"
      aria-label="A skein of fine fibres twisted through a narrow waist and fraying out at both ends, with points of light travelling along it"
      className={`block h-full w-full touch-pan-y ${className}`}
    />
  );
}

/** Blur-in entrance used by the hero copy, staggered by `delay` seconds. */
const entrance = (delay: number): MotionProps => ({
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] },
});

/** The opening section (announcement, headline, calls to action, thread scene, three steps) and the customer-logo strip beneath it. */
export function Hero() {
  return (
    <>
      <Section id="top" divider={false}>
        <div className="flex items-center gap-3 border-b border-solid border-[rgb(var(--skein-line)/.09)] py-4 sm:mr-[45%]">
          <span className="rounded-full border border-solid border-[rgb(var(--skein-line)/.14)] px-2 py-0.5 text-[11px] font-medium text-[rgb(var(--skein-ink))]">
            New
          </span>
          <Icon name="chevron_right" size={8} className="text-[rgb(var(--skein-faint))]" />
          <a href="#ask" className="truncate text-[13px] text-[rgb(var(--skein-ink)/.9)] no-underline hover:text-[rgb(var(--skein-ink))]">
            Skein Ask: question every trace in plain language
          </a>
        </div>
        <div className="grid grid-cols-1 items-center gap-6 pb-10 pt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pb-16 lg:pt-20">
          <div className="relative z-10">
            <motion.h1
              {...entrance(0.05)}
              className="m-0 skein-display text-[clamp(44px,5.6vw,74px)] font-bold leading-[0.92] tracking-[-0.035em] text-[rgb(var(--skein-ink))]"
            >
              Every request,
              <br />
              one thread
            </motion.h1>
            <motion.p {...entrance(0.18)} className="m-0 mt-6 max-w-[34em] text-[16px] leading-[1.6] text-[rgb(var(--skein-mute))]">
              Skein stitches logs, metrics and traces from every service into a single live thread. Ask what
              broke in plain language and get the answer with the evidence attached.
            </motion.p>
            <motion.div {...entrance(0.3)} className="mt-8 flex flex-wrap gap-2.5">
              <ButtonLink href="#start">Start tracing</ButtonLink>
              <ButtonLink href="#start" kind="secondary">
                Book a demo
              </ButtonLink>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.2 }}
            className="relative -mx-5 h-[380px] sm:-mx-8 sm:h-[480px] lg:mx-0 lg:h-[560px]"
          >
            <ThreadScene />
          </motion.div>
        </div>
        <ol className="m-0 grid max-w-[720px] list-none grid-cols-1 gap-6 p-0 pb-14 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n}>
              <h3 className="m-0 text-[15px] font-medium text-[rgb(var(--skein-ink))]">
                <span className="text-[rgb(var(--skein-faint))]">{step.n}.</span> {step.title}
              </h3>
              <p className="m-0 mt-2 text-[14px] leading-[1.5] text-[rgb(var(--skein-mute))]">{step.text}</p>
            </li>
          ))}
        </ol>
        <span aria-hidden="true" className="absolute bottom-0 left-0 h-px w-[45%] bg-[rgb(var(--skein-line)/.09)]" />
      </Section>
      <Section>
        <p className="m-0 pt-10 text-[14px] font-medium text-[rgb(var(--skein-mute))]">Running in production at 400+ engineering teams</p>
        <div className="relative -mx-5 overflow-hidden py-9 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] sm:-mx-8">
          <ul
            className="skein-marquee-x m-0 flex w-max list-none items-center gap-14 p-0 px-8"
            style={{ "--duration": "45s" } as CSSProperties}
          >
            {/* The list is doubled so the marquee loops seamlessly; the copy is hidden from assistive tech. */}
            {[...CUSTOMER_LOGOS, ...CUSTOMER_LOGOS].map(([icon, name], index) => (
              <li
                key={index}
                aria-hidden={index >= CUSTOMER_LOGOS.length || undefined}
                className="flex items-center gap-2 skein-display text-[22px] font-semibold tracking-[-0.02em] text-[rgb(var(--skein-ink)/.8)]"
              >
                <Icon name={icon} size={22} />
                {name}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
