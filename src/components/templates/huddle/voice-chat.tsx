"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AgentFace } from "./agent-face";
import { Caret } from "./message";
import { COLORS, shade } from "./theme";
import { Icon } from "./ui";
import type { Agent } from "./types";

type VoiceChatProps = {
  agent: Agent;
  /** What the visitor "says": it types itself in while the orb listens. */
  line: string;
  onCancel: () => void;
  onSend: (text: string) => void;
};

/** Talk to an agent: an orb that swells with your voice, a level meter, and your words appearing as you speak. */
export function VoiceChat({ agent, line, onCancel, onSend }: VoiceChatProps) {
  const orbCanvas = useRef<HTMLCanvasElement>(null);
  const barsCanvas = useRef<HTMLCanvasElement>(null);
  const reduce = !!useReducedMotion();
  const [phase, setPhase] = useState(reduce ? "done" : "listening");
  const [typed, setTyped] = useState(reduce ? line.length : 0);
  const level = useRef({
    amp: 0.1,
    phase: "listening",
    typed: 0,
  });
  useEffect(() => {
    level.current.phase = phase;
    level.current.typed = typed;
  }, [phase, typed]);
  const sent = useRef(false);
  const finish = useCallback(() => {
    if (!sent.current) {
      sent.current = true;
      onSend(line);
    }
  }, [line, onSend]);
  useEffect(() => {
    if (reduce) {
      return;
    }
    const timer = setTimeout(() => setPhase("speaking"), 1100);
    return () => clearTimeout(timer);
  }, [reduce]);
  useEffect(() => {
    if (phase !== "speaking") {
      return;
    }
    if (typed >= line.length) {
      const timer = setTimeout(() => setPhase("done"), 350);
      return () => clearTimeout(timer);
    }
    const next = line[typed];
    const timer = setTimeout(
      () => setTyped((prev) => prev + 1),
      next === " " ? 70 : /[,.?]/.test(next) ? 180 : 38 + Math.random() * 30,
    );
    return () => clearTimeout(timer);
  }, [phase, typed, line]);
  useEffect(() => {
    if (phase !== "done") {
      return;
    }
    const timer = setTimeout(finish, 1500);
    return () => clearTimeout(timer);
  }, [phase, finish]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
      if (event.key === "Enter" && level.current.typed > 0) {
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, finish]);
  useEffect(() => {
    const orb = orbCanvas.current;
    const bars = barsCanvas.current;
    if (!orb || !bars) {
      return;
    }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const orbSize = 320;
    const barsW = 280;
    const barsH = 44;
    orb.width = orbSize * dpr;
    orb.height = orbSize * dpr;
    bars.width = barsW * dpr;
    bars.height = barsH * dpr;
    const orbCtx = orb.getContext("2d")!;
    const barsCtx = bars.getContext("2d")!;
    const palette = [shade(agent.color, 0.25), agent.color, shade(agent.color, -0.25), shade(agent.color, 0.6)];
    const levels = Array(48).fill(0.05);
    let raf = 0;
    const start = performance.now();
    let frame = 0;
    const draw = (now: number) => {
      const t = (now - start) / 1e3;
      const lv = level.current;
      const target =
        lv.phase === "speaking"
          ? 0.3 +
            0.7 *
              Math.pow(Math.max(0, Math.sin(t * 10.5 + Math.sin(t * 2.7) * 2.2)), 1.6) *
              (0.7 + 0.3 * Math.sin(t * 1.3))
          : lv.phase === "listening"
            ? 0.12 + 0.05 * Math.sin(t * 2.4)
            : 0.06;
      lv.amp += (target - lv.amp) * (reduce ? 1 : 0.18);
      const amp = lv.amp;
      orbCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      orbCtx.clearRect(0, 0, orbSize, orbSize);
      const glow = orbCtx.createRadialGradient(orbSize / 2, orbSize / 2, 20, orbSize / 2, orbSize / 2, orbSize / 2);
      glow.addColorStop(0, `${agent.color}55`);
      glow.addColorStop(1, `${agent.color}00`);
      orbCtx.fillStyle = glow;
      orbCtx.beginPath();
      orbCtx.arc(orbSize / 2, orbSize / 2, orbSize / 2, 0, Math.PI * 2);
      orbCtx.fill();
      orbCtx.globalCompositeOperation = "screen";
      for (let ring = 0; ring < 3; ring++) {
        const radius = 92 + ring * 6 + amp * 22;
        orbCtx.beginPath();
        for (let step = 0; step <= 96; step++) {
          const angle = (step / 96) * Math.PI * 2;
          const r =
            radius *
            (1 +
              (0.05 + amp * 0.13) * Math.sin(3 * angle + t * (1.1 + ring * 0.4) + ring * 2) +
              (0.03 + amp * 0.08) * Math.sin(5 * angle - t * (1.7 + ring * 0.3) + ring) +
              0.02 * Math.sin(2 * angle + t * 0.6 + ring * 4));
          const px = orbSize / 2 + Math.cos(angle) * r;
          const py = orbSize / 2 + Math.sin(angle) * r;
          if (step) {
            orbCtx.lineTo(px, py);
          } else {
            orbCtx.moveTo(px, py);
          }
        }
        const shine = orbCtx.createRadialGradient(
          orbSize / 2 - 30,
          orbSize / 2 - 40,
          10,
          orbSize / 2,
          orbSize / 2,
          radius * 1.15,
        );
        shine.addColorStop(0, palette[3] + "50");
        shine.addColorStop(0.55, palette[ring] + "48");
        shine.addColorStop(1, palette[2] + "0A");
        orbCtx.fillStyle = shine;
        orbCtx.fill();
      }
      orbCtx.globalCompositeOperation = "source-over";
      if (frame++ % 3 === 0) {
        levels.shift();
        levels.push(amp * (0.6 + Math.random() * 0.4));
      }
      barsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      barsCtx.clearRect(0, 0, barsW, barsH);
      levels.forEach((value, i) => {
        const height = Math.max(3, value * barsH * 0.95);
        const x = i * (barsW / levels.length) + 1.5;
        barsCtx.fillStyle =
          i > levels.length - 6 ? agent.color : `rgba(255,255,255,${0.12 + (i / levels.length) * 0.4})`;
        barsCtx.beginPath();
        barsCtx.roundRect(x, (barsH - height) / 2, 2.6, height, 1.3);
        barsCtx.fill();
      });
      if (!reduce) {
        raf = requestAnimationFrame(draw);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [agent.color, reduce]);
  const label = phase === "listening" ? "Listening" : phase === "speaking" ? "Hearing you" : "Sending";
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Voice mode with ${agent.name}`}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center overflow-hidden px-6"
      style={{
        background: "rgba(10,10,12,.86)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <motion.div
        initial={{
          scale: 0.6,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.8,
          opacity: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
        className="relative grid size-[320px] max-w-[86vw] place-items-center"
        style={{
          maxHeight: "86vw",
        }}
      >
        <canvas ref={orbCanvas} aria-hidden={true} className="absolute inset-0 size-full" />
        <AgentFace
          shape={agent.shape}
          color={agent.color}
          eyes={agent.eyes}
          size={96}
          mood={phase === "speaking" ? "listening" : "idle"}
          seed={agent.id}
          className="relative"
        />
      </motion.div>
      <canvas ref={barsCanvas} aria-hidden={true} className="mt-2 h-[44px] w-[280px]" />
      <div
        className="mt-4 flex items-center gap-2 text-[13px] font-[550]"
        style={{
          color: COLORS.text,
        }}
        aria-live="polite"
      >
        <span className="relative grid size-2 place-items-center">
          <span
            className="absolute size-2 rounded-full"
            style={{
              background: phase === "done" ? COLORS.acc : COLORS.danger,
            }}
          />
        </span>
        <span>
          {label}
          {phase !== "done" && <span className="hd-shimmer">...</span>}
        </span>
      </div>
      <p
        className="mt-3 min-h-[56px] max-w-[460px] text-center text-[19px] font-[500] leading-[1.45] tracking-[-0.01em]"
        style={{
          color: COLORS.ink,
        }}
      >
        {typed ? (
          line.slice(0, typed)
        ) : (
          <span
            style={{
              color: COLORS.soft,
            }}
          >
            {"Go ahead, "}
            {agent.name}
            {" is listening."}
          </span>
        )}
        {phase === "speaking" && <Caret />}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{
            scale: 0.92,
          }}
          onClick={onCancel}
          className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14px] font-[550]"
          style={{
            background: COLORS.raise2,
            color: COLORS.ink,
            boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
          }}
        >
          <Icon name="ph:x" size={15} />
          Cancel
        </motion.button>
        <motion.button
          type="button"
          whileTap={{
            scale: 0.92,
          }}
          disabled={!typed}
          onClick={finish}
          className="relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full px-5 text-[14px] font-[600] disabled:opacity-40"
          style={{
            background: COLORS.acc,
            color: COLORS.accInk,
          }}
        >
          {phase === "done" && (
            <motion.span
              initial={{
                scaleX: 0,
              }}
              animate={{
                scaleX: 1,
              }}
              transition={{
                duration: 1.5,
                ease: "linear",
              }}
              className="absolute inset-0 origin-left"
              style={{
                background: "rgba(0,0,0,.12)",
              }}
            />
          )}
          <span className="relative inline-flex items-center gap-2">
            <Icon name="ph:arrow-up-bold" size={15} />
            Send now
          </span>
        </motion.button>
      </div>
      <p
        className="absolute bottom-4 text-[12px]"
        style={{
          color: COLORS.soft,
        }}
      >
        Simulated voice demo. No microphone is used.
      </p>
    </motion.div>
  );
}
