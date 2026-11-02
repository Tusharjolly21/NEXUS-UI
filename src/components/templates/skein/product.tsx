"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { TAU, glyphDots, hslToRgb, seededRandom, useCanvas } from "./canvas";
import { Icon, type IconName } from "./icons";
import { Badge, Reveal, Section, StatusDot, TextLink, type Tone } from "./ui";

const GLYPH_DOT_COUNT = 1100;

/** Cubic ease-in-out, used to stagger each dot's trip from one glyph to the next. */
function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

type GlyphDot = {
  /** Head start (as a share of the morph) before this dot leaves its old spot. */
  delay: number;
  phase: number;
  speed: number;
  size: number;
  glow: boolean;
};

/**
 * A field of dots that morphs between the Trace, Ask and Watch glyphs. It follows a scroll progress value
 * (0 to 2), or sits on one glyph when `fixed` is given.
 */
function MorphGlyph({ progress, fixed, className = "" }: { progress?: MotionValue<number>; fixed?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glyphs = glyphDots(GLYPH_DOT_COUNT);
  const dots = useMemo<GlyphDot[]>(() => {
    const random = seededRandom("morph");
    return Array.from({ length: GLYPH_DOT_COUNT }, () => ({
      delay: random() * 0.45,
      phase: random() * TAU,
      speed: 0.6 + random() * 1.4,
      size: random() < 0.08 ? 2 : 1.2,
      glow: random() < 0.05,
    }));
  }, []);

  useCanvas(canvasRef, (frame) => {
    const { ctx, w, h, t } = frame;
    const position = fixed ?? Math.max(0, Math.min(2, progress?.get() ?? 0));
    const fromIndex = Math.min(1, Math.floor(position));
    const mix = position - fromIndex;
    const from = glyphs[fromIndex];
    const to = glyphs[Math.min(2, fromIndex + 1)];
    const scale = Math.min(w, h) * 0.6;
    const centerX = w / 2;
    const centerY = h / 2;
    const ink = frame.ink;
    const sweep = t * 0.9;

    for (let k = 0; k < GLYPH_DOT_COUNT; k++) {
      const dot = dots[k];
      const eased = easeInOutCubic(Math.max(0, Math.min(1, (mix - dot.delay * 0.5) / 0.55)));
      let x = from[k][0] + (to[k][0] - from[k][0]) * eased;
      let y = from[k][1] + (to[k][1] - from[k][1]) * eased;
      // Dots scatter sideways a little mid-flight.
      const scatter = Math.sin(eased * Math.PI) * 0.12;
      x += Math.cos(dot.phase) * scatter;
      y += Math.sin(dot.phase) * scatter;
      const driftX = Math.sin(t * dot.speed + dot.phase) * 0.006;
      const driftY = Math.cos(t * dot.speed * 0.8 + dot.phase) * 0.006;
      const screenX = centerX + (x + driftX) * scale;
      const screenY = centerY + (y + driftY) * scale;
      let alpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * dot.speed * 1.7 + dot.phase));
      // On the Watch glyph a radar sweep lights the dots it passes over.
      if (position > 1.5) {
        const angle = Math.atan2(y, x);
        let distance = Math.abs(((angle - sweep) % TAU) + TAU) % TAU;
        if (distance > Math.PI) distance = TAU - distance;
        if (distance < 0.5) alpha = Math.min(1, alpha + (1 - distance / 0.5) * 0.6 * (position - 1.5) * 2);
      }
      if (dot.glow) {
        ctx.fillStyle = `rgba(${hslToRgb((k * 37 + t * 50) % 360, 0.9, frame.dark ? 0.68 : 0.5)},${alpha})`;
        ctx.fillRect(screenX - 1.1, screenY - 1.1, 2.2, 2.2);
      } else {
        ctx.fillStyle = `rgba(${ink},${alpha * (frame.dark ? 0.85 : 0.9)})`;
        ctx.fillRect(screenX - dot.size / 2, screenY - dot.size / 2, dot.size, dot.size);
      }
    }
  });

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none block h-full w-full ${className}`} />;
}

type Feature = {
  id: string;
  name: string;
  text: string;
  points: readonly (readonly [IconName, string])[];
};

const FEATURES: readonly Feature[] = [
  {
    id: "trace",
    name: "Trace",
    text: "Every span from every service lands in one place and is stitched to the request it belongs to. Follow a slow checkout from the browser to the database row without switching tools.",
    points: [
      ["arrow_branch", "Links spans across queues, cron jobs and retries."],
      ["bolt_fill", "Live in seconds, with no sampling by default."],
      ["square_stack_3d_up", "Service map drawn from real traffic."],
    ],
  },
  {
    id: "ask-feature",
    name: "Ask",
    text: 'Stop writing queries to answer simple questions. Ask "which endpoints got slower this week?" and get the answer with the traces that prove it.',
    points: [
      ["sparkles", "Understands your services and deploys."],
      ["arrow_swap", "Compares any two time ranges."],
      ["square_arrow_up", "Shares answers to Slack or a doc."],
    ],
  },
  {
    id: "watch",
    name: "Watch",
    text: "Not another wall of threshold alerts. Watch learns what normal looks like for each service and only pages when something is genuinely off.",
    points: [
      ["waveform_path_ecg", "Baselines that follow your traffic."],
      ["gauge", "Severity from the requests affected."],
      ["bell_fill", "Pages the team that owns the service."],
    ],
  },
];

type TraceService = {
  name: string;
  stat: string;
  tone: Tone;
  label: string;
};

const TRACE_SERVICES: readonly TraceService[] = [
  { name: "api-gateway", stat: "18,204 spans/s", tone: "live", label: "Live" },
  { name: "checkout-svc", stat: "6,410 spans/s", tone: "live", label: "Live" },
  { name: "payments-api", stat: "2,980 spans/s", tone: "warn", label: "Degraded" },
  { name: "postgres-primary", stat: "41 ms p99", tone: "info", label: "Watching" },
];

const ASK_ACTIONS: readonly (readonly [IconName, string])[] = [
  ["sparkles", "Explain"],
  ["arrow_swap", "Compare"],
  ["eye", "Watch"],
];

/** Trace panel: a stack of services with their live span rates. */
function TracePanel() {
  return (
    <ul className="m-0 grid w-[300px] list-none gap-2 p-0">
      {TRACE_SERVICES.map((service, index) => (
        <motion.li
          key={service.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + index * 0.06 }}
          className="flex items-center justify-between rounded-[10px] border border-solid border-[rgb(var(--skein-line)/.1)] bg-[rgb(var(--skein-panel)/.9)] px-4 py-3 backdrop-blur-md"
        >
          <span>
            <span className="block text-[14px] text-[rgb(var(--skein-ink))]">{service.name}</span>
            <span className="skein-tnum mt-0.5 block font-mono text-[11px] text-[rgb(var(--skein-faint))]">{service.stat}</span>
          </span>
          <StatusDot tone={service.tone} pulse={service.tone === "live"}>
            {service.label}
          </StatusDot>
        </motion.li>
      ))}
    </ul>
  );
}

/** Ask panel: a prompt box with a blinking caret and three quick actions. */
function AskPanel() {
  return (
    <div className="w-[320px]">
      <div className="rounded-[14px] border border-solid border-[rgb(var(--skein-line)/.12)] bg-[rgb(var(--skein-panel)/.9)] p-3 backdrop-blur-md">
        <p className="m-0 px-1 text-[14px] text-[rgb(var(--skein-ink))]">
          Which endpoints got slower this week?
          <span className="ml-px inline-block h-[15px] w-px translate-y-[2px] animate-pulse bg-[rgb(var(--skein-ink))]" />
        </p>
        <div className="mt-6 flex items-center justify-between text-[rgb(var(--skein-faint))]">
          <Icon name="plus" size={12} />
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[rgb(var(--skein-btn))] text-[rgb(var(--skein-btn-ink))]">
            <Icon name="chevron_right" size={9} />
          </span>
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {ASK_ACTIONS.map(([icon, label]) => (
          <span
            key={label}
            className="flex h-7 items-center gap-1.5 rounded-[7px] border border-solid border-[rgb(var(--skein-line)/.1)] bg-[rgb(var(--skein-panel)/.8)] px-2.5 text-[12px] text-[rgb(var(--skein-mute))] backdrop-blur-md"
          >
            <Icon name={icon} size={11} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Watch panel: a critical alert card with a latency sparkline that draws itself. */
function WatchPanel() {
  return (
    <div className="w-[300px] rounded-[14px] border border-solid border-[rgb(var(--skein-line)/.12)] bg-[rgb(var(--skein-panel)/.9)] p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <Badge tone="crit">Critical</Badge>
        <span className="text-[11px] text-[rgb(var(--skein-faint))]">4 min ago</span>
      </div>
      <p className="m-0 mt-3 text-[15px] font-medium text-[rgb(var(--skein-ink))]">p99 on checkout up 340%</p>
      <p className="m-0 mt-1 text-[12px] leading-[1.5] text-[rgb(var(--skein-mute))]">checkout-svc went from 280 ms to 1.2 s after 14:02.</p>
      <svg
        viewBox="0 0 260 70"
        className="mt-3 block w-full"
        role="img"
        aria-label="Latency flat at the baseline, then a sharp spike"
      >
        <line
          x1="0"
          x2="260"
          y1="46"
          y2="46"
          stroke="rgb(var(--skein-line))"
          strokeOpacity=".25"
          strokeDasharray="3 4"
        />
        <text x="258" y="40" textAnchor="end" className="fill-[rgb(var(--skein-faint))] text-[9px]">
          Baseline
        </text>
        <motion.path
          d="M0,48 C20,46 30,50 50,47 S80,44 100,48 S140,50 160,46 S185,47 196,49 L214,12 L226,30"
          fill="none"
          stroke="rgb(var(--skein-ink))"
          strokeOpacity=".55"
          strokeWidth="1.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <motion.circle
          cx="214"
          cy="12"
          r="3.5"
          fill="rgb(var(--skein-crit))"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 1.1,
            type: "spring",
            stiffness: 500,
            damping: 14,
          }}
        />
        <text x="214" y="64" textAnchor="middle" className="fill-[rgb(var(--skein-crit))] text-[9px]">
          Anomaly
        </text>
      </svg>
      <div className="mt-3 flex items-center justify-between border-t border-solid border-[rgb(var(--skein-line)/.08)] pt-3 text-[11px]">
        <span className="flex items-center gap-1.5 text-[rgb(var(--skein-mute))]">
          <Icon name="bell_fill" size={11} />
          Paged @oncall-payments
        </span>
        <span className="text-[rgb(var(--skein-faint))]">Ack 1m ago</span>
      </div>
    </div>
  );
}

/** One panel per feature, in the same order as `FEATURES`. */
const PANELS: readonly ReactNode[] = [<TracePanel key="t" />, <AskPanel key="a" />, <WatchPanel key="w" />];

/** A tick ruler beside the sticky panel with a marker that follows the scroll progress. */
function ProgressRuler({ progress }: { progress: MotionValue<number> }) {
  const markerTop = useTransform(progress, [0, 2], ["0%", "100%"]);
  return (
    <div
      aria-hidden="true"
      className="absolute right-0 top-1/2 hidden h-[260px] w-10 -translate-y-1/2 xl:block"
    >
      <div className="relative h-full">
        {Array.from({ length: 25 }, (_, index) => (
          <span
            key={index}
            className={`absolute right-0 h-px ${index % 12 === 0 ? "w-3 bg-[rgb(var(--skein-line)/.4)]" : "w-1.5 bg-[rgb(var(--skein-line)/.2)]"}`}
            style={{ top: `${(index / 24) * 100}%` }}
          />
        ))}
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="skein-tnum absolute right-5 -translate-y-1/2 font-mono text-[10px] text-[rgb(var(--skein-faint))]"
            style={{ top: `${index * 50}%` }}
          >
            0{index + 1}
          </span>
        ))}
        <motion.span className="absolute right-0 h-px w-5 bg-[rgb(var(--skein-ink))]" style={{ top: markerTop }} />
      </div>
    </div>
  );
}

/**
 * The pinned product story (Trace, Ask, Watch): copy scrolls on the left while a sticky dot glyph and a
 * matching panel on the right change with the scroll position. On small screens each feature carries its own
 * glyph and panel inline.
 */
export function Product() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });
  // Maps the container's scroll progress onto 0..2, one unit per feature, so each feature is centred at 0, 1, 2.
  const featureProgress = useTransform(scrollYProgress, (value) => Math.max(0, Math.min(2, value * 3 - 0.5)));
  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(featureProgress, "change", (value) => setActiveIndex(Math.round(value)));

  return (
    <Section id="product" inner="px-0 sm:px-0">
      <div ref={containerRef} className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          {FEATURES.map((feature, index) => (
            <article
              key={feature.id}
              id={feature.id}
              className={`flex scroll-mt-20 flex-col justify-center px-5 py-16 sm:px-8 lg:min-h-[86vh] lg:py-24 ${index ? "border-t border-solid border-[rgb(var(--skein-line)/.09)] lg:mr-8" : ""}`}
            >
              <Reveal
                as="h2"
                className="m-0 skein-display text-[clamp(30px,3vw,38px)] font-bold tracking-[-0.025em] text-[rgb(var(--skein-ink))]"
              >
                {feature.name}
              </Reveal>
              <p className="m-0 mt-4 max-w-[34em] text-[15px] leading-[1.6] text-[rgb(var(--skein-mute))]">{feature.text}</p>
              <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-3">
                {feature.points.map(([icon, text]) => (
                  <li key={text} className="text-[13px] leading-[1.45] text-[rgb(var(--skein-ink))]">
                    <Icon name={icon} size={15} className="mb-2 block text-[rgb(var(--skein-ink)/.8)]" />
                    {text}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <TextLink href={`#${feature.id}`}>Explore {feature.name}</TextLink>
              </div>
              <div className="relative mt-10 grid h-[380px] place-items-center lg:hidden">
                <div className="absolute inset-0">
                  <MorphGlyph fixed={index} />
                </div>
                <div className="relative">{PANELS[index]}</div>
              </div>
            </article>
          ))}
        </div>
        <div className="relative hidden lg:block">
          <div className="sticky top-[calc(50vh-300px)] h-[600px]">
            <div className="absolute inset-0 right-12">
              <MorphGlyph progress={featureProgress} />
            </div>
            <div className="absolute inset-0 right-12 grid place-items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                  transition={{ duration: 0.35 }}
                >
                  {PANELS[activeIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
            <ProgressRuler progress={featureProgress} />
          </div>
        </div>
      </div>
    </Section>
  );
}
