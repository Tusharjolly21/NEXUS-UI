"use client";

/* eslint-disable react-hooks/immutability -- `pulse` is a ref shared with the 3D agent, which reads it every frame;
   bumping it from a click is how a click makes the agent hop. */

import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { Agent3D } from "./agent-3d";
import { AgentFace } from "./agent-face";
import { LANGUAGES, VOICES } from "./data";
import { AGENT_COLORS, EXPRESSIONS, SHAPES, SHAPE_BY_KEY } from "./shapes";
import { COLORS, SPRING, clamp, shade } from "./theme";
import { Field, Icon, Menu, Segmented, TextField, Toggle } from "./ui";
import type { Agent, Pulse } from "./types";

type PickerProps = { agent: Agent; onPick: (value: string) => void };

const WHEEL_STEP = 64;

type ShapeWheelItemProps = {
  index: number;
  /** The wheel's position, in shapes: 2.5 is halfway between the third and fourth. */
  pos: MotionValue<number>;
  agent: Agent;
  shape: string;
  selected: boolean;
  onPick: () => void;
};

function ShapeWheelItem({ index, pos, agent, shape, selected, onPick }: ShapeWheelItemProps) {
  const x = useTransform(pos, (at) => (index - at) * WHEEL_STEP);
  const depth = useTransform(pos, (at) => Math.pow(index - at, 2) * 5);
  const scale = useTransform(pos, (pos) => 1 - Math.min(Math.abs(index - pos), 3) * 0.15);
  const opacity = useTransform(pos, (pos) => 1 - Math.min(Math.abs(index - pos), 3.2) * 0.27);
  const rotate = useTransform(pos, (pos) => (index - pos) * 9);
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${SHAPE_BY_KEY[shape].label} shape`}
      tabIndex={-1}
      onClick={onPick}
      className="absolute left-1/2 top-1 -ml-[28px] grid w-[56px] place-items-center"
      style={{
        x,
        y: depth,
        scale,
        opacity,
        rotate,
      }}
    >
      <AgentFace shape={shape} color={agent.color} eyes={agent.eyes} size={44} blink={false} shadow={false} />
      <span
        className="mt-1 text-[11px] font-[550]"
        style={{
          color: selected ? COLORS.ink : COLORS.soft,
        }}
      >
        {SHAPE_BY_KEY[shape].label}
      </span>
    </motion.button>
  );
}

function ShapeWheel({ agent, onPick }: PickerProps) {
  const index = SHAPES.findIndex((shape) => shape.key === agent.shape);
  const pos = useMotionValue(index);
  const start = useRef(0);
  const dragging = useRef(false);
  useEffect(() => {
    if (dragging.current) {
      return;
    }
    const controls = animate(pos, index, {
      type: "spring",
      stiffness: 300,
      damping: 26,
    });
    return () => controls.stop();
  }, [index, pos]);
  const step = (delta: number) => {
    const next = clamp(index + delta, 0, SHAPES.length - 1);
    if (next !== index) {
      onPick(SHAPES[next].key);
    }
  };
  return (
    <div className="relative">
      <motion.div
        role="radiogroup"
        aria-label="Shape"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
          }
        }}
        onPanStart={() => {
          dragging.current = true;
          start.current = pos.get();
        }}
        onPan={(event, info) => pos.set(clamp(start.current - info.offset.x / WHEEL_STEP, -0.4, SHAPES.length - 0.6))}
        onPanEnd={(event, info) => {
          dragging.current = false;
          const target = clamp(Math.round(pos.get() - info.velocity.x / WHEEL_STEP / 8), 0, SHAPES.length - 1);
          if (SHAPES[target].key !== agent.shape) {
            onPick(SHAPES[target].key);
          } else {
            animate(pos, target, {
              type: "spring",
              stiffness: 300,
              damping: 26,
            });
          }
        }}
        className="relative h-[88px] cursor-grab touch-pan-y overflow-hidden rounded-[14px] active:cursor-grabbing"
        style={{
          maskImage: "linear-gradient(90deg,transparent,#000 22%,#000 78%,transparent)",
          WebkitMaskImage: "linear-gradient(90deg,transparent,#000 22%,#000 78%,transparent)",
        }}
      >
        {SHAPES.map((shape, i) => (
          <ShapeWheelItem
            key={shape.key}
            index={i}
            pos={pos}
            agent={agent}
            shape={shape.key}
            selected={shape.key === agent.shape}
            onPick={() => onPick(shape.key)}
          />
        ))}
      </motion.div>
      <span
        aria-hidden={true}
        className="pointer-events-none absolute left-1/2 top-0 -ml-[30px] h-[56px] w-[60px] rounded-[16px]"
        style={{
          boxShadow: `inset 0 0 0 1.5px ${COLORS.acc}`,
          opacity: 0.55,
        }}
      />
      {[-1, 1].map((shape) => (
        <button
          key={shape}
          type="button"
          aria-label={shape < 0 ? "Previous shape" : "Next shape"}
          onClick={() => step(shape)}
          disabled={shape < 0 ? index === 0 : index === SHAPES.length - 1}
          className="absolute top-[22px] grid size-8 place-items-center rounded-full transition-[opacity,transform] hover:scale-105 active:scale-95 disabled:opacity-30"
          style={{
            [shape < 0 ? "left" : "right"]: 0,
            background: COLORS.raise2,
            color: COLORS.ink,
            boxShadow: `inset 0 0 0 1px ${COLORS.line2}, 0 4px 12px rgba(0,0,0,.4)`,
          }}
        >
          <Icon name={shape < 0 ? "ph:caret-left" : "ph:caret-right"} size={14} />
        </button>
      ))}
    </div>
  );
}

function ExpressionPicker({ agent, onPick }: PickerProps) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (event: KeyboardEvent, index: number) => {
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 8,
      ArrowUp: -8,
    };
    if (moves[event.key] != null) {
      event.preventDefault();
      const next = (index + moves[event.key] + EXPRESSIONS.length) % EXPRESSIONS.length;
      buttons.current[next]?.focus();
      onPick(EXPRESSIONS[next].key);
    }
  };
  return (
    <div role="radiogroup" aria-label="Expression" className="grid grid-cols-8 gap-1.5">
      {EXPRESSIONS.map((expression, i) => {
        const on = expression.key === agent.eyes;
        return (
          <motion.button
            key={expression.key}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={expression.label}
            title={expression.label}
            tabIndex={on ? 0 : -1}
            onKeyDown={(event) => onKey(event, i)}
            onClick={() => onPick(expression.key)}
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.9,
            }}
            transition={SPRING}
            className="relative aspect-square rounded-[11px]"
            style={{
              background: COLORS.raise,
            }}
          >
            <span
              className="absolute inset-[3px] overflow-hidden rounded-[8px]"
              style={{
                background: shade(agent.color, -0.1),
              }}
            >
              <AgentFace
                shape={agent.shape}
                color={agent.color}
                eyes={expression.key}
                size={64}
                zoom={true}
                shadow={false}
                blink={false}
                className="absolute left-1/2 top-1/2 size-full -translate-x-1/2 -translate-y-1/2"
              />
            </span>
            {on && (
              <motion.span
                layoutId="expr-ring"
                transition={SPRING}
                className="absolute -inset-[2px] rounded-[13px]"
                style={{
                  boxShadow: `0 0 0 2px ${COLORS.acc}`,
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

function ColorPicker({ agent, onPick }: PickerProps) {
  const custom = !AGENT_COLORS.some((agentColor) => agentColor.hex.toLowerCase() === agent.color.toLowerCase());
  const swatch = (
    <motion.span
      layoutId="swatch-ring"
      transition={SPRING}
      className="absolute -inset-[4px] rounded-full"
      style={{
        boxShadow: `0 0 0 1.5px ${COLORS.ink}`,
      }}
    />
  );
  return (
    <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-[7px]">
      {AGENT_COLORS.map((agentColor) => {
        const on = agentColor.hex.toLowerCase() === agent.color.toLowerCase();
        return (
          <motion.button
            key={agentColor.hex}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={agentColor.name}
            title={agentColor.name}
            onClick={() => onPick(agentColor.hex)}
            whileTap={{
              scale: 0.86,
            }}
            whileHover={{
              scale: 1.1,
            }}
            transition={SPRING}
            className="relative size-[22px] rounded-full"
            style={{
              background: `radial-gradient(circle at 32% 28%, ${shade(agentColor.hex, 0.35)}, ${agentColor.hex} 55%, ${shade(agentColor.hex, -0.2)})`,
              boxShadow: "inset 0 -1px 2px rgba(0,0,0,.25)",
            }}
          >
            {on && swatch}
          </motion.button>
        );
      })}
      <label
        className="relative size-[22px] cursor-pointer rounded-full"
        title="Custom colour"
        style={{
          background: custom
            ? agent.color
            : "conic-gradient(from 0deg,#FF6B8B,#FFC94D,#6EDC8C,#5AA9FF,#8C7CFF,#FF6B8B)",
        }}
      >
        <input
          type="color"
          aria-label="Custom colour"
          value={agent.color}
          onChange={(event) => onPick(event.target.value.toUpperCase())}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
        {custom ? (
          swatch
        ) : (
          <span
            className="absolute inset-[6px] grid place-items-center rounded-full"
            style={{
              background: COLORS.panel,
            }}
          >
            <Icon
              name="ph:plus"
              size={9}
              style={{
                color: COLORS.ink,
              }}
            />
          </span>
        )}
      </label>
    </div>
  );
}

function VoicePicker({ agent, onChange }: { agent: Agent; onChange: (change: Partial<Agent>) => void }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const line = `Hi, I'm ${agent.name || "your agent"}. ${agent.role ? `I'm your ${agent.role.toLowerCase()}.` : ""} Ask me anything.`;
  const duration = 3200 / agent.speed;
  useEffect(() => {
    if (!playing) {
      return;
    }
    const start = performance.now() - progress * duration;
    const tick = (now: number) => {
      const t = (now - start) / duration;
      if (t >= 1) {
        setProgress(0);
        setPlaying(false);
        return;
      }
      setProgress(t);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
    // resumes from wherever the preview was paused, so progress is read once when play starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, duration]);
  const [open, setOpen] = useState(false);
  const menu = useRef(null);
  const bars = 34;
  return (
    <div
      className="rounded-[14px] p-3"
      style={{
        background: COLORS.raise,
        boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <motion.button
          type="button"
          whileTap={{
            scale: 0.9,
          }}
          onClick={() => setPlaying((prev) => !prev)}
          aria-label={playing ? "Pause voice preview" : "Play voice preview"}
          className="grid size-9 shrink-0 place-items-center rounded-full"
          style={{
            background: COLORS.ink,
            color: "#111",
          }}
        >
          <Icon name={playing ? "ph:pause-fill" : "ph:play-fill"} size={14} />
        </motion.button>
        <button
          ref={menu}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-[10px] px-2 py-1 text-left transition-colors hover:bg-white/[.04]"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-[600]">{agent.voice}</span>
            <span
              className="block truncate text-[12px]"
              style={{
                color: COLORS.soft,
              }}
            >
              {VOICES.find((voice) => voice.id === agent.voice)?.note}
            </span>
          </span>
          <Icon
            name="ph:caret-up-down"
            size={14}
            style={{
              color: COLORS.soft,
            }}
          />
        </button>
        <Menu
          open={open}
          onClose={() => setOpen(false)}
          anchor={menu}
          placement="top-end"
          width={230}
          label="Voice"
          items={VOICES.map((voice) => ({
            id: voice.id,
            label: voice.id,
            desc: voice.note,
            icon: "ph:waveform",
            checked: voice.id === agent.voice,
            onSelect: () => {
              onChange({
                voice: voice.id,
              });
              setProgress(0);
              setPlaying(true);
            },
          }))}
        />
      </div>
      <div className="mt-3 flex h-7 items-center gap-[3px]" aria-hidden={true}>
        {Array.from(
          {
            length: bars,
          },
          (_, index) => {
            const height = 0.25 + 0.75 * Math.abs(Math.sin(index * 1.7 + agent.voice.length) * Math.cos(index * 0.45));
            const past = index / bars < progress;
            return (
              <span
                key={index}
                className="flex-1 rounded-full transition-[background,transform] duration-150"
                style={{
                  height: `${height * 100}%`,
                  background: past ? agent.color : "#33333A",
                  transform: playing && Math.abs(index / bars - progress) < 0.06 ? "scaleY(1.25)" : "none",
                }}
              />
            );
          },
        )}
      </div>
      <p
        className="mt-2 min-h-[34px] text-[12.5px] leading-[1.4]"
        style={{
          color: playing ? COLORS.ink : COLORS.soft,
        }}
      >
        {playing ? line.slice(0, Math.ceil(line.length * progress)) : `"${line}"`}
      </p>
      <div className="mt-2.5">
        <Segmented
          id="speed"
          label="Playback speed"
          options={[0.75, 1, 1.25, 1.5]}
          value={agent.speed}
          onChange={(speed) =>
            onChange({
              speed,
            })
          }
          render={(speed) => `${speed}x`}
        />
      </div>
    </div>
  );
}

type AgentEditorProps = {
  agent: Agent;
  onChange: (change: Partial<Agent>) => void;
  onClose: () => void;
  nameRef: RefObject<HTMLInputElement | null>;
  pulse: RefObject<Pulse>;
  mobile: boolean;
};

export function AgentEditor({ agent, onChange, onClose, nameRef, pulse, mobile }: AgentEditorProps) {
  const kick = () => {
    pulse.current = {
      ...pulse.current,
      kick: pulse.current.kick + 1,
    };
  };
  const update = (next: Partial<Agent>, pulseIt = true) => {
    onChange(next);
    if (pulseIt) {
      kick();
    }
  };
  const [advanced, setAdvanced] = useState(false);
  const advancedRef = useRef(null);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 px-4">
        <p className="min-w-0 flex-1 truncate text-[14px] font-[600]">Edit agent</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close editor"
          className="grid size-8 place-items-center rounded-[10px] transition-colors hover:bg-white/[.06]"
          style={{
            color: COLORS.text,
          }}
        >
          <Icon name={mobile ? "ph:x" : "ph:sidebar-simple"} size={17} />
        </button>
      </div>
      <div className="hd-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <div
          className="relative h-[230px] overflow-hidden rounded-[20px]"
          style={{
            background: `radial-gradient(120% 90% at 50% 18%, ${shade(agent.color, -0.55)}55 0%, transparent 60%), linear-gradient(180deg,#17171B 0%,#111114 70%,#0E0E11 100%)`,
            boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
          }}
        >
          <div
            className="absolute inset-x-0 bottom-0 h-[42%]"
            style={{
              background: "radial-gradient(60% 70% at 50% 100%, rgba(255,255,255,.045), transparent 70%)",
            }}
          />
          <Agent3D agent={agent} pulse={pulse} />
          <button
            type="button"
            aria-label={`Boop ${agent.name}`}
            onClick={() => {
              pulse.current = {
                ...pulse.current,
                boop: pulse.current.boop + 1,
              };
            }}
            className="absolute left-1/2 top-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          />
          <div className="pointer-events-none absolute left-3.5 top-3 flex items-center gap-2">
            <span className="text-[13px] font-[600]">{agent.name || "Untitled"}</span>
            <span
              className="rounded-full px-2 py-[2px] text-[11.5px] font-[500]"
              style={{
                background: "rgba(255,255,255,.07)",
                color: COLORS.text,
              }}
            >
              {EXPRESSIONS.find((expression) => expression.key === agent.eyes)?.label}
            </span>
          </div>
        </div>
        <div className="mt-3">
          <ShapeWheel
            agent={agent}
            onPick={(next) =>
              update({
                shape: next,
              })
            }
          />
        </div>
        <div className="mt-5">
          <Field
            aside={
              <span
                className="text-[12px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                {EXPRESSIONS.find((expression) => expression.key === agent.eyes)?.label}
              </span>
            }
          >
            Expression
          </Field>
          <ExpressionPicker
            agent={agent}
            onPick={(next) =>
              update({
                eyes: next,
              })
            }
          />
        </div>
        <div className="mt-5">
          <Field>Colour</Field>
          <ColorPicker
            agent={agent}
            onPick={(next) =>
              update({
                color: next,
              })
            }
          />
        </div>
        <div className="mt-6 space-y-3.5">
          <TextField
            id="ag-name"
            label="Name"
            value={agent.name}
            onChange={(next) =>
              update(
                {
                  name: next.slice(0, 24),
                },
                false,
              )
            }
            inputRef={nameRef}
          />
          <TextField
            id="ag-role"
            label="Label"
            value={agent.role}
            onChange={(next) =>
              update(
                {
                  role: next.slice(0, 40),
                },
                false,
              )
            }
            placeholder="What does this agent do?"
          />
          <TextField
            id="ag-desc"
            label="Description"
            value={agent.desc}
            onChange={(next) =>
              update(
                {
                  desc: next.slice(0, 220),
                },
                false,
              )
            }
            multiline={true}
          />
        </div>
        <div
          className="mt-5 overflow-hidden rounded-[14px]"
          style={{
            background: COLORS.raise,
            boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
          }}
        >
          <div className="flex items-center gap-3 px-3.5 py-3">
            <Icon
              name="ph:translate"
              size={17}
              style={{
                color: COLORS.text,
              }}
            />
            <span className="flex-1 text-[13.5px] font-[500]">Language</span>
            <button
              ref={advancedRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={advanced}
              onClick={() => setAdvanced((next) => !next)}
              className="flex items-center gap-1.5 rounded-[9px] px-2 py-1 text-[13px] transition-colors hover:bg-white/[.05]"
              style={{
                color: COLORS.text,
              }}
            >
              {agent.lang}
              <Icon name="ph:caret-up-down" size={13} />
            </button>
            <Menu
              open={advanced}
              onClose={() => setAdvanced(false)}
              anchor={advancedRef}
              placement="bottom-end"
              width={200}
              label="Language"
              items={LANGUAGES.map((language) => ({
                id: language,
                label: language,
                checked: language === agent.lang,
                onSelect: () =>
                  update(
                    {
                      lang: language,
                    },
                    false,
                  ),
              }))}
            />
          </div>
          <div
            className="mx-3.5 h-px"
            style={{
              background: COLORS.line,
            }}
          />
          <div className="flex items-center gap-3 px-3.5 py-3">
            <Icon
              name="ph:bell-simple"
              size={17}
              style={{
                color: COLORS.text,
              }}
            />
            <span className="flex-1">
              <span className="block text-[13.5px] font-[500]">Notifications</span>
              <span
                className="block text-[12px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                {"When "}
                {agent.name || "it"}
                {" replies while you're away"}
              </span>
            </span>
            <Toggle
              on={agent.notify}
              onChange={(next) =>
                update(
                  {
                    notify: next,
                  },
                  false,
                )
              }
              label="Notifications"
            />
          </div>
        </div>
        <div className="mt-5">
          <Field>Voice</Field>
          <VoicePicker agent={agent} onChange={(next) => update(next, false)} />
        </div>
      </div>
    </div>
  );
}
