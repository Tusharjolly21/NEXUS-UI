"use client";

import * as React from "react";
import type { SoundVariant } from "./keyboard-layout";

export type SoundType = "mechanical" | "soft" | "clicky";

// Per-variant parameters tuned for each key type
type VParams = {
  // Click layer: the switch mechanism actuating (~first few ms)
  ckHz:  number; ckQ:  number; ckDcy: number; ckGn: number;
  // Thud layer: keycap bottom-out impact (~slightly delayed)
  tdHz:  number; tdQ:  number; tdDcy: number; tdGn: number;
  tdOff: number; // seconds after the click
  // Body-resonance tone
  bodyHz: number; bodyGn: number;
};

const VARIANT: Record<SoundVariant, VParams> = {
  normal:   { ckHz:5400, ckQ:4.2, ckDcy:0.0042, ckGn:0.50, tdHz:400, tdQ:1.1, tdDcy:0.022, tdGn:0.82, tdOff:0.007, bodyHz:280, bodyGn:0.22 },
  space:    { ckHz:2200, ckQ:2.2, ckDcy:0.010,  ckGn:0.28, tdHz:148, tdQ:0.8, tdDcy:0.048, tdGn:1.05, tdOff:0.012, bodyHz:118, bodyGn:0.30 },
  enter:    { ckHz:3700, ckQ:3.4, ckDcy:0.006,  ckGn:0.43, tdHz:275, tdQ:1.0, tdDcy:0.032, tdGn:0.92, tdOff:0.009, bodyHz:205, bodyGn:0.26 },
  delete:   { ckHz:6100, ckQ:4.8, ckDcy:0.0034, ckGn:0.55, tdHz:510, tdQ:1.3, tdDcy:0.017, tdGn:0.73, tdOff:0.005, bodyHz:345, bodyGn:0.18 },
  modifier: { ckHz:3000, ckQ:2.7, ckDcy:0.005,  ckGn:0.28, tdHz:210, tdQ:0.9, tdDcy:0.019, tdGn:0.60, tdOff:0.007, bodyHz:158, bodyGn:0.15 },
};

// Per-type multipliers
const TYPE_MULT: Record<SoundType, { ckScale: number; tdScale: number; bodyScale: number; ckQMult: number }> = {
  mechanical: { ckScale: 1.00, tdScale: 1.00, bodyScale: 1.00, ckQMult: 1.0 },
  soft:       { ckScale: 0.28, tdScale: 0.75, bodyScale: 0.60, ckQMult: 0.5 },
  clicky:     { ckScale: 1.55, tdScale: 0.85, bodyScale: 0.55, ckQMult: 1.9 },
};

function synthesise(ctx: AudioContext, variant: SoundVariant, type: SoundType, volume: number) {
  const now = ctx.currentTime;
  const sr  = ctx.sampleRate;
  const vol = Math.max(0, Math.min(1, volume));
  const p   = VARIANT[variant];
  const tm  = TYPE_MULT[type];

  // Slight per-hit randomisation — keeps rapid typing feeling organic
  const jitter = () => 0.92 + Math.random() * 0.16;

  function noiseBurst(t: number, hz: number, q: number, decaySec: number, gain: number) {
    if (gain < 0.001) return;
    const dur = Math.max(decaySec * 6.5, 0.014);
    const len = Math.ceil(sr * dur);
    const buf = ctx.createBuffer(1, len, sr);
    const d   = buf.getChannelData(0);
    const tc  = decaySec * sr;
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / tc);

    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp  = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = hz * jitter(); bp.Q.value = q;
    const gn  = ctx.createGain();
    gn.gain.setValueAtTime(gain * vol, t);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(gn); gn.connect(ctx.destination);
    src.start(t); src.stop(t + dur + 0.01);
  }

  // ── Layer 1: High-frequency click (switch actuation snap) ─────
  noiseBurst(now, p.ckHz, p.ckQ * tm.ckQMult, p.ckDcy, p.ckGn * tm.ckScale);

  // ── Layer 2: Low-frequency thud (bottom-out impact) ───────────
  const t2 = now + p.tdOff;
  noiseBurst(t2, p.tdHz * jitter(), p.tdQ, p.tdDcy, p.tdGn * tm.tdScale);

  // ── Layer 3: Pitched resonance (case / plate ring) ────────────
  const bodyGain = p.bodyGn * tm.bodyScale * vol;
  if (bodyGain > 0.01) {
    const osc = ctx.createOscillator();
    const gn  = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(p.bodyHz * 1.35 * jitter(), t2);
    osc.frequency.exponentialRampToValueAtTime(p.bodyHz * 0.52, t2 + 0.065);
    gn.gain.setValueAtTime(bodyGain, t2);
    gn.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.085);
    osc.connect(gn); gn.connect(ctx.destination);
    osc.start(t2); osc.stop(t2 + 0.1);
  }
}

export function useKeyboardSound(opts: {
  enabled: boolean;
  volume: number;
  soundType: SoundType;
}) {
  const ctxRef    = React.useRef<AudioContext | null>(null);
  const optsRef   = React.useRef(opts);
  optsRef.current = opts;

  const getCtx = React.useCallback((): AudioContext | null => {
    if (!optsRef.current.enabled) return null;
    try {
      if (!ctxRef.current || ctxRef.current.state === "closed")
        ctxRef.current = new AudioContext();
      if (ctxRef.current.state === "suspended")
        void ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  const play = React.useCallback(
    (variant: SoundVariant) => {
      const ctx = getCtx();
      if (!ctx) return;
      try {
        synthesise(ctx, variant, optsRef.current.soundType, optsRef.current.volume);
      } catch {
        // Silently absorb Web Audio errors (policy / SSR)
      }
    },
    [getCtx],
  );

  React.useEffect(() => () => { ctxRef.current?.close().catch(() => {}); }, []);

  return { play };
}
