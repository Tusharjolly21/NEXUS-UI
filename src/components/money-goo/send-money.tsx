"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
/* eslint-disable @next/next/no-img-element -- the sample faces are small remote pictures with fixed sizes; swap in next/image where you use real photos */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import {
  type CSSProperties,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type Payee = { id: string; name: string; avatar: string; tint?: string };
export type SendMoneyProps = {
  payees?: Payee[];
  balance?: number;
  currency?: string;
  onSend?: (payee: Payee, amount: number) => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const I = {
  back: "M216 36H68.53a20.09 20.09 0 0 0-17.15 9.71L5.71 121.83a12 12 0 0 0 0 12.34l45.67 76.12A20.09 20.09 0 0 0 68.53 220H216a20 20 0 0 0 20-20V56a20 20 0 0 0-20-20m-4 160H70.8L30 128l40.8-68H212Zm-108.49-52.49L119 128l-15.52-15.51a12 12 0 0 1 17-17L136 111l15.51-15.52a12 12 0 0 1 17 17L153 128l15.52 15.51a12 12 0 0 1-17 17L136 145l-15.51 15.52a12 12 0 0 1-17-17Z",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
};
const Ico = ({ d, size, style }: { d: string; size: number; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

const DEFAULT_PAYEES: Payee[] = [
  {
    id: "lena",
    name: "Lena",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20red%20hair/Light/3D/woman_red_hair_3d_light.png",
    tint: "#ffe3d6",
  },
  {
    id: "kofi",
    name: "Kofi",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man/Medium-Dark/3D/man_3d_medium-dark.png",
    tint: "#dbe9ff",
  },
  {
    id: "hana",
    name: "Hana",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Light/3D/woman_curly_hair_3d_light.png",
    tint: "#e8f6df",
  },
  {
    id: "mateo",
    name: "Mateo",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Man%20beard/Medium-Light/3D/man_beard_3d_medium-light.png",
    tint: "#f1e4ff",
  },
  {
    id: "priya",
    name: "Priya",
    avatar:
      "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Woman%20curly%20hair/Medium-Dark/3D/woman_curly_hair_3d_medium-dark.png",
    tint: "#fff2cc",
  },
];
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
const KNOB = 48;

const money = (n: number, cur: string, cents = true) =>
  `${cur}${n.toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })}`;

function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  return (
    <span
      aria-label={text}
      style={{
        display: "inline-flex",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch))
          return (
            <span key={`s${key}${ch}`} aria-hidden="true">
              {ch}
            </span>
          );
        return (
          <span
            key={`d${key}`}
            aria-hidden="true"
            style={{
              position: "relative",
              display: "inline-block",
              height: "1.2em",
              overflow: "hidden",
              lineHeight: 1.2,
            }}
          >
            <motion.span
              initial={false}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 160,
                      damping: 20,
                      mass: 0.6 + (key % 3) * 0.15,
                    }
              }
              style={{ display: "flex", flexDirection: "column" }}
            >
              {"0123456789".split("").map((d) => (
                <span key={d} style={{ height: "1.2em" }}>
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * Send money to a friend. Pick who it's for, type the amount on the keypad (each digit rises into place and the
 * thousands separator slides in as the number grows), then slide their face along the track to send. When it lets
 * go, the amount itself flies: every digit lifts off in turn and arcs up into their picture, which swells to catch
 * each one, while your balance rolls down by the same amount and the track turns into a green Sent. Try to send more
 * than you have and the number shakes and turns red. Typing works from the keyboard too, and the slider takes Enter.
 */
export default function SendMoney({
  payees = DEFAULT_PAYEES,
  balance: balance0 = 4820.5,
  currency = "$",
  onSend,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: SendMoneyProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [who, setWho] = useState(0);
  const [amt, setAmt] = useState("120");
  const amtRef = useRef(amt);
  amtRef.current = amt;
  const [balance, setBalance] = useState(balance0);
  const [phase, setPhase] = useState<"edit" | "flying" | "sent">("edit");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [flyers, setFlyers] = useState<
    {
      k: string;
      ch: string;
      x: number;
      y: number;
      tx: number;
      ty: number;
      d: number;
      size: number;
    }[]
  >([]);
  const [catchN, setCatchN] = useState(0);
  const [shakeK, setShakeK] = useState(0);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const amountEl = useRef<HTMLDivElement>(null);
  const faces = useRef<(HTMLButtonElement | null)[]>([]);
  const track = useRef<HTMLDivElement>(null);
  const kx = useMotionValue(0);
  const value = Number(amt || "0");
  const over = value > balance;
  const p = payees[who];

  const formatted = value.toLocaleString("en-US");
  const press = (k: string) => {
    if (phaseRef.current !== "edit") return;
    const cur = amtRef.current;
    if (k === "del") {
      if (!cur) return;
      setAmt(cur.slice(0, -1));
      sfx.tick({ freq: 1500, gain: 0.03 });
      return;
    }
    if (cur.length >= 5 || (cur === "" && k === "0")) {
      setShakeK((n) => n + 1);
      sfx.note(220, { dur: 0.12, gain: 0.03, type: "triangle" });
      return;
    }
    const next = cur + k;
    setAmt(next);
    if (Number(next) > balance) {
      setShakeK((n) => n + 1);
      sfx.note(233, { dur: 0.18, gain: 0.035, type: "triangle" });
    } else sfx.note(740 + Number(k) * 38, { dur: 0.09, gain: 0.025, bell: 0.2 });
  };

  // the slider
  const maxX = () => (track.current ? track.current.clientWidth - KNOB - 8 : 260);
  const drag = useRef<{ x0: number; k0: number } | null>(null);
  const textFade = useTransform(kx, (v) => Math.max(0, 1 - v / 120));
  const fillW = useTransform(kx, (v) => v + KNOB + 8);
  const canSend = value > 0 && !over && phase === "edit";
  const knobDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    if (!canSend) {
      setShakeK((n) => n + 1);
      sfx.note(220, { dur: 0.12, gain: 0.03, type: "triangle" });
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    kx.stop();
    drag.current = { x0: e.clientX, k0: kx.get() };
    sfx.tick({ freq: 1800, gain: 0.03 });
  };
  const lastNotch = useRef(0);
  const knobMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const m = maxX();
    const raw = d.k0 + e.clientX - d.x0;
    const band = (o: number) => Math.sign(o) * (1 - 1 / (Math.abs(o) / 50 + 1)) * 50;
    kx.set(raw < 0 ? band(raw) : raw > m ? m + band(raw - m) : raw);
    // faint clicks as it travels
    const notch = Math.floor((Math.max(0, Math.min(m, raw)) / m) * 8);
    if (notch !== lastNotch.current) {
      lastNotch.current = notch;
      sfx.tick({ freq: 2200 + notch * 160, gain: 0.012 });
    }
  };
  const knobUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    if (kx.get() > maxX() * 0.82) send();
    else animate(kx, 0, { type: "spring", stiffness: 420, damping: 22 });
  };

  const send = () => {
    if (!canSend) return;
    const m = maxX();
    animate(kx, m, { type: "spring", stiffness: 500, damping: 34 });
    setPhase("flying");
    const c = card.current;
    const a = amountEl.current;
    const f = faces.current[who];
    const sent = value;
    const done = () => {
      setBalance((b) => Math.round((b - sent) * 100) / 100);
      setPhase("sent");
      onSend?.(p, sent);
      sfx.note(784, { dur: 0.25, gain: 0.04, bell: 0.5 });
      sfx.note(1175, { at: 0.1, dur: 0.45, gain: 0.04, bell: 0.6 });
    };
    if (!c || !a || !f || reduce) {
      done();
      return;
    }
    const cb = c.getBoundingClientRect();
    const fb = f.getBoundingClientRect();
    const tx = fb.left - cb.left + fb.width / 2;
    const ty = fb.top - cb.top + fb.height / 2;
    const spans = [...a.querySelectorAll("[data-glyph]")] as HTMLElement[];
    const fl = spans.map((s, i) => {
      const r = s.getBoundingClientRect();
      return {
        k: `${Date.now()}-${i}`,
        ch: s.textContent ?? "",
        x: r.left - cb.left,
        y: r.top - cb.top,
        tx,
        ty,
        d: i * 0.07,
        size: parseFloat(getComputedStyle(s).fontSize),
      };
    });
    setFlyers(fl);
    sfx.whoosh(800, 3000, { dur: 0.6, gain: 0.04 });
    fl.forEach((_, i) => {
      window.setTimeout(
        () => {
          setCatchN((n) => n + 1);
          sfx.note(880 + i * 120, { dur: 0.12, gain: 0.03, bell: 0.4 });
        },
        (0.62 + i * 0.07) * 1000,
      );
    });
    window.setTimeout(
      () => {
        setFlyers([]);
        done();
      },
      (0.7 + fl.length * 0.07) * 1000,
    );
  };
  const again = () => {
    setPhase("edit");
    setAmt("");
    animate(kx, 0, { type: "spring", stiffness: 300, damping: 26 });
  };

  // keyboard: digits, Backspace, Enter
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (/^[0-9]$/.test(e.key)) {
      touched.current = true;
      press(e.key);
    } else if (e.key === "Backspace") {
      touched.current = true;
      press("del");
    }
  };

  // autoplay: choose someone, type an amount, slide to send, start again
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const pos = (el: Element | null | undefined) => {
      const c = card.current;
      if (!c || !el) return [0, 0] as const;
      const r = el.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      return [r.left - cb.left + r.width / 2, r.top - cb.top + r.height / 2] as const;
    };
    const go = async (el: Element | null | undefined, ms = 480) => {
      const [x, y] = pos(el);
      setGhost(true);
      await Promise.all([
        animate(gx, x, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
        animate(gy, y, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
      ]);
    };
    const tap = async () => {
      setGhostDown(true);
      await wait(100);
      setGhostDown(false);
    };
    const key = (k: string) => card.current?.querySelector(`[data-key="${k}"]`);
    const run = async () => {
      await wait(1200);
      let n = 0;
      while (ok()) {
        const pick = [1, 3, 0, 4][n % 4];
        await go(faces.current[pick]);
        await tap();
        setWho(pick);
        sfx.tick({ freq: 2400, gain: 0.03 });
        await wait(500);
        if (amtRef.current) {
          for (let i = amtRef.current.length; i > 0 && ok(); i--) {
            await go(key("del"), 260);
            await tap();
            press("del");
          }
        }
        for (const d of ["250", "85", "1200", "40"][n % 4]) {
          if (!ok()) return;
          await go(key(d), 330);
          await tap();
          press(d);
          await wait(140);
        }
        await wait(500);
        if (!ok()) return;
        // slide the face along
        const t = track.current;
        if (!t) return;
        const [kxp, kyp] = pos(t.querySelector("[data-knob]"));
        await Promise.all([animate(gx, kxp, { duration: 0.5 }), animate(gy, kyp, { duration: 0.5 })]);
        setGhostDown(true);
        const m = maxX();
        await animate(0, 1, {
          duration: 0.9,
          ease: [0.5, 0, 0.3, 1],
          onUpdate: (k) => {
            kx.set(m * 0.95 * k);
            gx.set(kxp + m * 0.95 * k);
          },
        });
        setGhostDown(false);
        send();
        setGhost(false);
        await wait(3600);
        if (!ok()) return;
        await go(card.current?.querySelector("[data-again]"));
        await tap();
        again();
        await wait(900);
        n++;
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const glyphs = useMemo(() => [...formatted], [formatted]);
  const flying = phase === "flying";

  return (
    <div
      className={`relative w-full max-w-[380px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        ref={card}
        tabIndex={-1}
        onKeyDown={onKey}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 32,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -34px rgba(0,0,0,0.35)",
          padding: "20px 20px 18px",
          outline: "none",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Send money
          </div>
          <div style={{ fontSize: 12.5, color: "#86868b" }}>
            Balance{" "}
            <Roll text={money(balance, currency)} reduce={reduce} style={{ fontWeight: 650, color: "#1d1d1f" }} />
          </div>
        </div>

        {/* who */}
        <div role="radiogroup" aria-label="Send to" style={{ display: "flex", margin: "16px -4px 0" }}>
          {payees.map((q, i) => {
            const on = i === who;
            return (
              <button
                key={q.id}
                ref={(b) => void (faces.current[i] = b)}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={phase !== "edit"}
                onClick={() => {
                  touched.current = true;
                  setWho(i);
                  sfx.tick({ freq: 2400, gain: 0.03 });
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  border: 0,
                  background: "transparent",
                  padding: "4px 0 2px",
                  borderRadius: 14,
                  cursor: phase === "edit" ? "pointer" : "default",
                }}
              >
                <motion.span
                  animate={{ scale: on ? 1 : 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  style={{
                    position: "relative",
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: q.tint ?? "#f2f2f5",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {/* each arriving digit lands with a ripple */}
                  {on && catchN > 0 && (
                    <motion.span
                      key={catchN}
                      initial={{ scale: 0.9, opacity: 0.7 }}
                      animate={{ scale: 1.55, opacity: 0 }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 24,
                        boxShadow: "0 0 0 3px #0071e3",
                      }}
                    />
                  )}
                  <img
                    src={q.avatar}
                    alt=""
                    width={36}
                    height={36}
                    draggable={false}
                    style={{ width: 36, height: 36 }}
                  />
                  {on && (
                    <motion.span
                      layoutId="send-ring"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 34,
                      }}
                      style={{
                        position: "absolute",
                        inset: -4,
                        borderRadius: 28,
                        boxShadow: "0 0 0 2px #0071e3",
                      }}
                    />
                  )}
                </motion.span>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: on ? 650 : 500,
                    color: on ? "#1d1d1f" : "#86868b",
                  }}
                >
                  {q.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* the amount */}
        <motion.div
          key={shakeK}
          animate={shakeK ? { x: [0, -10, 9, -6, 4, 0] } : undefined}
          transition={{ duration: 0.38 }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            height: 84,
            margin: "20px 0 0",
          }}
        >
          <div
            ref={amountEl}
            aria-live="polite"
            aria-label={`${currency}${formatted}`}
            style={{
              display: "flex",
              alignItems: "flex-start",
              color: over ? "#ff3b30" : value ? "#1d1d1f" : "#c7c7cc",
              transition: "color 0.25s",
            }}
          >
            <span
              style={{
                fontSize: 34,
                fontWeight: 600,
                marginTop: 9,
                marginRight: 3,
                color: over ? "#ff3b30" : "#86868b",
              }}
            >
              {currency}
            </span>
            <AnimatePresence initial={false} mode="popLayout">
              {glyphs.map((ch, i) => (
                <motion.span
                  key={`${glyphs.length - i}-${ch === "," ? "c" : "d"}`}
                  data-glyph
                  layout="position"
                  initial={reduce ? false : { y: 26, opacity: 0, filter: "blur(6px)", scale: 0.85 }}
                  animate={{
                    y: 0,
                    opacity: flying ? 0 : 1,
                    filter: "blur(0px)",
                    scale: 1,
                  }}
                  exit={{
                    y: -22,
                    opacity: 0,
                    filter: "blur(4px)",
                    transition: { duration: 0.16 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 520,
                    damping: 30,
                    opacity: { duration: flying ? 0.05 : 0.2 },
                    filter: { duration: 0.2 },
                  }}
                  style={{
                    display: "inline-block",
                    fontSize: 64,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            height: 18,
            color: over ? "#ff3b30" : "#86868b",
            transition: "color 0.25s",
          }}
        >
          {over
            ? `That's more than your ${money(balance, currency)}`
            : phase === "sent"
              ? `Sent to ${p.name}`
              : `To ${p.name}, arrives instantly`}
        </div>

        {/* keypad */}
        <div
          role="group"
          aria-label="Amount keypad"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
            margin: "14px 0 14px",
          }}
        >
          {KEYS.map((k) =>
            k ? (
              <motion.button
                key={k}
                type="button"
                data-key={k}
                aria-label={k === "del" ? "Delete" : k}
                disabled={phase !== "edit"}
                whileTap={{ scale: 0.9, backgroundColor: "#ececf0" }}
                onClick={() => {
                  touched.current = true;
                  press(k);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                style={{
                  height: 50,
                  border: 0,
                  borderRadius: 16,
                  background: "transparent",
                  fontSize: 24,
                  fontWeight: 500,
                  color: "#1d1d1f",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {k === "del" ? <Ico d={I.back} size={22} /> : k}
              </motion.button>
            ) : (
              <span key="blank" />
            ),
          )}
        </div>

        {/* slide to send */}
        <div
          ref={track}
          style={{
            position: "relative",
            height: 58,
            borderRadius: 29,
            background: "#f2f2f5",
            overflow: "hidden",
          }}
        >
          <motion.div
            aria-hidden="true"
            animate={{
              backgroundColor: phase === "sent" ? "#30d158" : "#0071e3",
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: fillW,
              borderRadius: 29,
              opacity: canSend || phase !== "edit" ? 1 : 0.25,
            }}
          />
          <AnimatePresence mode="wait" initial={false}>
            {phase === "sent" ? (
              <motion.button
                key="sent"
                data-again
                type="button"
                onClick={() => {
                  touched.current = true;
                  again();
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{
                  position: "absolute",
                  inset: 0,
                  border: 0,
                  background: "transparent",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 15.5,
                  fontWeight: 650,
                  cursor: "pointer",
                  zIndex: 2,
                }}
              >
                <motion.span
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 16,
                    delay: 0.1,
                  }}
                  style={{ display: "grid" }}
                >
                  <Ico d={I.check} size={18} />
                </motion.span>
                Sent {money(Number(amt || 0), currency, false)} to {p.name}
              </motion.button>
            ) : (
              <motion.div
                key="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: KNOB,
                  pointerEvents: "none",
                }}
              >
                <motion.span
                  style={{
                    opacity: textFade,
                    fontSize: 15,
                    fontWeight: 600,
                    color: canSend ? "transparent" : "#a1a1a6",
                    backgroundImage: canSend
                      ? "linear-gradient(90deg, #6e6e73 0%, #6e6e73 40%, #ffffff 50%, #6e6e73 60%, #6e6e73 100%)"
                      : undefined,
                    backgroundSize: "250% 100%",
                    WebkitBackgroundClip: canSend ? "text" : undefined,
                    backgroundClip: canSend ? "text" : undefined,
                    animation: canSend && !reduce ? "sendmoney-sheen 2.4s linear infinite" : undefined,
                  }}
                >
                  {canSend
                    ? `Slide to send ${money(value, currency, false)}`
                    : over
                      ? "Not enough in your balance"
                      : "Type an amount"}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
          {phase !== "sent" && (
            <motion.div
              data-knob
              role="slider"
              tabIndex={0}
              aria-label={`Slide to send ${money(value, currency, false)} to ${p.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              onPointerDown={knobDown}
              onPointerMove={knobMove}
              onPointerUp={knobUp}
              onPointerCancel={knobUp}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "ArrowRight") {
                  e.preventDefault();
                  touched.current = true;
                  send();
                }
              }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{
                position: "absolute",
                left: 4,
                top: 5,
                width: KNOB,
                height: KNOB,
                borderRadius: KNOB / 2,
                x: kx,
                background: p.tint ?? "#fff",
                boxShadow: "0 0 0 2px #fff, 0 6px 14px -6px rgba(0,0,0,0.4)",
                display: "grid",
                placeItems: "center",
                cursor: canSend ? "grab" : "not-allowed",
                touchAction: "none",
                zIndex: 3,
              }}
            >
              <img
                src={p.avatar}
                alt=""
                width={34}
                height={34}
                draggable={false}
                style={{ width: 34, height: 34, pointerEvents: "none" }}
              />
            </motion.div>
          )}
        </div>
        <style>
          {"@keyframes sendmoney-sheen { from { background-position: 125% 0 } to { background-position: -125% 0 } }"}
        </style>

        {/* the amount on its way */}
        {flyers.map((f) => (
          <motion.span
            key={f.k}
            aria-hidden="true"
            initial={{ x: f.x, y: f.y, scale: 1, opacity: 1 }}
            animate={{
              x: [f.x, (f.x + f.tx) / 2 + (f.x - f.tx) * 0.15, f.tx - f.size * 0.18],
              y: [f.y, Math.min(f.y, f.ty) - 70, f.ty - f.size * 0.6],
              scale: [1, 0.8, 0.12],
              opacity: [1, 1, 0],
            }}
            transition={{
              x: {
                duration: 0.62,
                delay: f.d,
                times: [0, 0.45, 1],
                ease: "easeInOut",
              },
              y: {
                duration: 0.62,
                delay: f.d,
                times: [0, 0.45, 1],
                ease: ["easeOut", "easeIn"],
              },
              scale: {
                duration: 0.62,
                delay: f.d,
                times: [0, 0.45, 1],
                ease: "easeIn",
              },
              opacity: {
                duration: 0.62,
                delay: f.d,
                times: [0, 0.85, 1],
                ease: "linear",
              },
            }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              fontSize: f.size,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: "#0071e3",
              pointerEvents: "none",
              zIndex: 6,
              originX: 0.5,
              originY: 0.5,
            }}
          >
            {f.ch}
          </motion.span>
        ))}

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -13,
              top: -13,
              x: gx,
              y: gy,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "rgba(29,29,31,0.18)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}
