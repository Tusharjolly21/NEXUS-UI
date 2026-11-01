"use client";

import * as React from "react";
import { motion, useSpring } from "framer-motion";
import { Pause, Play, RotateCcw, Shuffle, Undo2, Volume2, VolumeX } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { DEFAULT_HEADER } from "@/components/code-block/code-block";
import { Chip } from "@/components/site/chip-rail";
import type { IconMeta } from "@/lib/icons/catalog";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { MATERIALS, SWATCHES, accentFor } from "./icon-grid";
import { hasIconSound, iconSoundLength, playIconSound } from "./icon-sounds";
import { IconMaterial, type IconMaterialName } from "./icon-material";
import { NX_ICONS } from "./registry";

type Trigger = "hover" | "click" | "hold" | "loop";
type Stage = "light" | "dark";
type IconState = "auto" | "idle" | "loading" | "success" | "error";

const TRIGGERS: { id: Trigger; label: string; hint: string }[] = [
  { id: "hover", label: "Hover", hint: "Plays while the pointer is on the stage." },
  { id: "click", label: "Click", hint: "Click or tap the stage to play it once." },
  { id: "hold", label: "Hold", hint: "Plays for as long as you press." },
  { id: "loop", label: "Loop", hint: "Plays, rests, plays again." },
];
const MOODS = [
  { label: "Calm", speed: 0.6 },
  { label: "Natural", speed: 1 },
  { label: "Playful", speed: 1.5 },
  { label: "Snappy", speed: 2.4 },
] as const;

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-[68px] shrink-0 text-[13px] text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-3 text-[13px] text-muted-foreground">
      <span className="w-[68px] shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[var(--foreground)]" />
      <span className="w-10 shrink-0 text-right tabular-nums text-foreground">{value}</span>
    </label>
  );
}

/**
 * The toy box on each icon page: pick how it is triggered, how fast and how it feels, restyle it, hear it, drag it, or
 * press Surprise me. The snippet beside it always matches what is on the stage.
 */
export function IconPlayground({ icon, source }: { icon: IconMeta; source: string }) {
  const Icon = NX_ICONS[icon.slug];
  const isLoop = icon.kind === "loop";

  const [trigger, setTrigger] = React.useState<Trigger>("hover");
  const [speed, setSpeed] = React.useState<number>(1);
  const [material, setMaterial] = React.useState<IconMaterialName>("spark");
  const [color, setColor] = React.useState<string>(SWATCHES[0]);
  const [stage, setStage] = React.useState<Stage>("light");
  const [size, setSize] = React.useState(104);
  const [stroke, setStroke] = React.useState(2);
  const [sound, setSound] = React.useState(false);
  const [state, setState] = React.useState<IconState>("auto");

  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [cycle, setCycle] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const timer = React.useRef<number | null>(null);
  const area = React.useRef<HTMLDivElement>(null);

  // magnetic: the icon leans toward the pointer and settles back when it leaves
  const mx = useSpring(0, { stiffness: 220, damping: 18 });
  const my = useSpring(0, { stiffness: 220, damping: 18 });
  const tilt = useSpring(0, { stiffness: 220, damping: 18 });

  const ping = React.useCallback(() => {
    if (sound) playIconSound(icon.slug, { speed, force: true });
  }, [sound, icon.slug, speed]);
  const pingRef = React.useRef(ping);
  React.useEffect(() => {
    pingRef.current = ping;
  }, [ping]);

  React.useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const reset = () => {
    setTrigger("hover");
    setSpeed(1);
    setMaterial("spark");
    setColor(SWATCHES[0]);
    setStage("light");
    setSize(104);
    setStroke(2);
    setState("auto");
    setPaused(false);
  };

  const replay = React.useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setPreview(false);
    // a tick later, so a second press restarts the animation instead of joining the first
    timer.current = window.setTimeout(() => {
      setPreview(true);
      pingRef.current();
      timer.current = window.setTimeout(() => setPreview(false), 2000);
    }, 40);
  }, []);

  // a loader's sound is one lap long: remount the icon so its first lap starts now, then repeat the sound every lap
  const [epoch, setEpoch] = React.useState(0);
  React.useEffect(() => {
    if (!isLoop || !sound || paused) return;
    const lap = (iconSoundLength(icon.slug) / speed) * 1000;
    let id = 0;
    const start = window.setTimeout(() => {
      setEpoch((e) => e + 1);
      playIconSound(icon.slug, { speed, force: true });
      id = window.setInterval(() => playIconSound(icon.slug, { speed, force: true }), lap);
    }, 0);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [isLoop, sound, paused, speed, icon.slug]);

  // loop trigger: play, rest, play again
  React.useEffect(() => {
    if (trigger !== "loop" || isLoop) return;
    let alive = true;
    let t = 0;
    const tick = (on: boolean) => {
      if (!alive) return;
      setCycle(on);
      if (on) pingRef.current();
      t = window.setTimeout(() => tick(!on), (on ? 1800 : 700) / speed);
    };
    t = window.setTimeout(() => tick(true), 0);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [trigger, isLoop, speed]);

  const play = isLoop ? !paused : preview || (trigger === "hover" ? hover : trigger === "hold" ? pressed : trigger === "loop" ? cycle : false);
  const dark = stage === "dark";
  const ink = dark && color === SWATCHES[0] ? "#f5f5f7" : color === SWATCHES[0] ? undefined : color;
  const accent = accentFor(icon, material);
  const wrap = material === "neon" || material === "aurora" || material === "chrome";

  const surprise = () => {
    const m = pick(MATERIALS);
    setMaterial(m.id);
    setStage(m.dark ? "dark" : pick<Stage>(["light", "light", "dark"]));
    setColor(pick(SWATCHES));
    setSpeed(pick(MOODS).speed);
    setStroke(pick([1.5, 2, 2.5]));
    setSize(pick([88, 104, 128]));
    if (icon.states) setState("auto");
    replay();
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = area.current?.getBoundingClientRect();
    if (!r) return;
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    mx.set(Math.max(-26, Math.min(26, dx * 0.14)));
    my.set(Math.max(-26, Math.min(26, dy * 0.14)));
    tilt.set(Math.max(-9, Math.min(9, dx * 0.03)));
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    tilt.set(0);
    setHover(false);
    setPressed(false);
  };

  // the snippet follows the stage
  const attrs = [
    size !== 24 ? `size={${size}}` : "",
    stroke !== 2 ? `strokeWidth={${stroke}}` : "",
    speed !== 1 ? `speed={${speed}}` : "",
    accent ? `accent="${accent}"` : "",
    color !== SWATCHES[0] ? `className="text-[${color}]"` : "",
    icon.states && state !== "auto" ? `state="${state}"` : "",
  ].filter(Boolean);
  const tag = `<${icon.component}${attrs.length ? " " + attrs.join(" ") : ""} />`;
  const withSound = sound && !isLoop;
  const soundArgs = speed !== 1 ? `, { speed: ${speed} }` : "";
  const inner = withSound ? `<span onPointerEnter={() => playIconSound("${icon.slug}"${soundArgs})}>\n        ${tag}\n      </span>` : tag;
  const body = wrap ? `<IconMaterial material="${material}">\n      ${inner}\n    </IconMaterial>` : inner;
  const usage = [
    `import { ${icon.component} } from "@/components/icons/${icon.slug}";`,
    wrap ? `import { IconMaterial } from "@/components/icons/icon-material";` : "",
    withSound ? `import { playIconSound } from "@/components/icons/icon-sounds";` : "",
    "",
    "export default function Page() {",
    `  return (\n    ${body}\n  );`,
    "}",
  ]
    .filter((l, i, all) => l !== "" || all[i - 1] !== "")
    .join("\n");

  if (!Icon) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      <div className="rounded-[26px] bg-card p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-30px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] sm:p-6">
        {/* the stage */}
        <div
          ref={area}
          onPointerMove={onMove}
          onPointerEnter={() => {
            setHover(true);
            if (trigger === "hover") ping();
          }}
          onPointerLeave={onLeave}
          onPointerDown={() => {
            setPressed(true);
            if (trigger === "hold") ping();
          }}
          onPointerUp={() => setPressed(false)}
          onClick={() => {
            if (trigger === "click" && !isLoop) replay();
          }}
          className={cn(
            "relative grid h-[300px] touch-pan-y select-none place-items-center overflow-hidden rounded-[20px] transition-colors duration-300",
            dark ? "bg-[#0d0d10]" : "bg-foreground/[0.04]",
            !isLoop && trigger === "click" ? "cursor-pointer" : "",
          )}
        >
          <motion.div style={{ x: mx, y: my, rotate: tilt }}>
            <motion.div drag dragSnapToOrigin dragElastic={0.55} whileDrag={{ scale: 1.14 }} whileTap={{ scale: 0.96 }} className="cursor-grab active:cursor-grabbing">
              <IconMaterial material={material} color={ink} className="grid place-items-center">
                <Icon key={epoch} size={size} strokeWidth={stroke} speed={speed} accent={accent} play={play} state={icon.states && state !== "auto" ? (state as "idle") : undefined} />
              </IconMaterial>
            </motion.div>
          </motion.div>
          <div className="absolute left-3 top-3">
            <CopyButton text={source} label="Copy code" className={dark ? "bg-white/10 text-white hover:bg-white/15" : "bg-card shadow-[0_0_0_1px_rgba(0,0,0,.06)] hover:bg-card/80"} />
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              type="button"
              onClick={surprise}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                dark ? "bg-white/10 text-white hover:bg-white/15" : "bg-card text-foreground hover:bg-card/80",
              )}
            >
              <Shuffle className="size-3.5" aria-hidden /> Surprise me
            </button>
            <button
              type="button"
              aria-label="Reset all settings"
              title="Reset all settings"
              onClick={reset}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                dark ? "bg-white/10 text-white hover:bg-white/15" : "bg-card text-foreground hover:bg-card/80",
              )}
            >
              <Undo2 className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={isLoop ? () => setPaused((p) => !p) : replay}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                dark ? "bg-white/10 text-white hover:bg-white/15" : "bg-card text-foreground hover:bg-card/80",
              )}
            >
              {isLoop ? paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden /> : <RotateCcw className="size-3.5" aria-hidden />}
              {isLoop ? (paused ? "Play" : "Pause") : "Replay"}
            </button>
          </div>
          <p className={cn("absolute bottom-3 left-0 right-0 px-4 text-center text-[12.5px]", dark ? "text-white/45" : "text-muted-foreground")}>
            {isLoop ? "Loops on its own. " : `${TRIGGERS.find((t) => t.id === trigger)?.hint} `}Drag it and let go.
          </p>
        </div>

        {/* the controls */}
        <div className="mt-6 grid gap-4">
          {isLoop ? null : (
            <Row label="Trigger">
              {TRIGGERS.map((t) => (
                <Chip key={t.id} active={trigger === t.id} onClick={() => setTrigger(t.id)} className="px-3.5 py-1.5 text-[13px]">
                  {t.label}
                </Chip>
              ))}
            </Row>
          )}
          {icon.states ? (
            <Row label="State">
              {(["auto", ...icon.states] as IconState[]).map((s) => (
                <Chip key={s} active={state === s} onClick={() => setState(s)} className="px-3.5 py-1.5 text-[13px] capitalize">
                  {s}
                </Chip>
              ))}
            </Row>
          ) : null}
          <Row label="Mood">
            {MOODS.map((m) => (
              <Chip key={m.label} active={speed === m.speed} onClick={() => setSpeed(m.speed)} className="px-3.5 py-1.5 text-[13px]">
                {m.label}
              </Chip>
            ))}
          </Row>
          <Row label="Look">
            {MATERIALS.map((m) => (
              <Chip
                key={m.id}
                active={material === m.id}
                onClick={() => {
                  setMaterial(m.id);
                  if (m.dark) setStage("dark");
                }}
                className="px-3.5 py-1.5 text-[13px]"
              >
                {m.label}
              </Chip>
            ))}
          </Row>
          <Row label="Colour">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className="size-7 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.14)] outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card aria-pressed:ring-2 aria-pressed:ring-foreground aria-pressed:ring-offset-2 aria-pressed:ring-offset-card"
                style={{ background: c }}
              />
            ))}
            <label className="relative grid size-7 cursor-pointer place-items-center overflow-hidden rounded-full bg-[conic-gradient(from_0deg,#f43f5e,#f59e0b,#10b981,#3b82f6,#8b5cf6,#f43f5e)] shadow-[inset_0_0_0_1px_rgba(0,0,0,.14)] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card">
              <span className="sr-only">Pick any colour</span>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" />
            </label>
          </Row>
          <Slider label="Size" value={size} min={24} max={160} step={2} onChange={setSize} />
          <Slider label="Line" value={stroke} min={1} max={3} step={0.25} onChange={setStroke} />
          <Row label="Stage">
            <Chip active={stage === "light"} onClick={() => setStage("light")} className="px-3.5 py-1.5 text-[13px]">
              Light
            </Chip>
            <Chip active={stage === "dark"} onClick={() => setStage("dark")} className="px-3.5 py-1.5 text-[13px]">
              Dark
            </Chip>
            {hasIconSound(icon.slug) ? (
              <Chip active={sound} onClick={() => setSound((s) => !s)} className="ml-auto px-3.5 py-1.5 text-[13px]" icon={sound ? <Volume2 className="size-3.5" aria-hidden /> : <VolumeX className="size-3.5" aria-hidden />}>
                {sound ? "Sound on" : "Sound off"}
              </Chip>
            ) : null}
          </Row>
          <p className="flex gap-2.5 rounded-[14px] bg-foreground/[0.04] px-4 py-3 text-[13.5px] leading-relaxed text-muted-foreground">
            <Volume2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="font-medium text-foreground">What you hear. </span>
              {icon.heard} {isLoop ? "One lap of sound for every lap of the animation." : "Every note lands on a beat of the animation."}
            </span>
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <h2 className="text-[17px] font-semibold text-foreground">Use it</h2>
        <p className="mt-1 text-[15px] text-muted-foreground">Copy the file below into your project, then import it. This snippet follows everything you change on the stage.</p>
        <div className="mt-4 min-w-0">
          <CodeBlock code={usage} language="tsx" theme="dark" header={{ ...DEFAULT_HEADER, title: "page.tsx" }} hoverHighlight={false} enableSound={false} />
        </div>
        {material !== "line" ? (
          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
            {material === "spark"
              ? "Spark just sets the accent prop, so the small details of each icon get their own colour."
              : material === "neon"
                ? "Neon wraps the icon in the small IconMaterial helper (its code is further down the page) and uses the accent prop."
                : "This look wraps the icon in the small IconMaterial helper, whose code is further down the page. It paints every stroke with the gradient."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
