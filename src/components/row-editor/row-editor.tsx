"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type ExpenseRow = {
  id: string;
  expense: string;
  method: string;
  amount: number;
};
export type RowEditorProps = {
  rows?: ExpenseRow[];
  onChange?: (rows: ExpenseRow[]) => void;
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
  note: "M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h108.69a15.86 15.86 0 0 0 11.31-4.69L219.31 168a15.86 15.86 0 0 0 4.69-11.31V48a16 16 0 0 0-16-16M48 48h160v104h-48a8 8 0 0 0-8 8v48H48Zm148.69 120L168 196.69V168Z",
  stack:
    "M230.91 172a8 8 0 0 1-2.91 10.91l-96 56a8 8 0 0 1-8.06 0l-96-56A8 8 0 0 1 36 169.09l92 53.65l92-53.65a8 8 0 0 1 10.91 2.91M220 121.09l-92 53.65l-92-53.65a8 8 0 0 0-8 13.82l96 56a8 8 0 0 0 8.06 0l96-56a8 8 0 1 0-8.06-13.82M24 80a8 8 0 0 1 4-6.91l96-56a8 8 0 0 1 8.06 0l96 56a8 8 0 0 1 0 13.82l-96 56a8 8 0 0 1-8.06 0l-96-56A8 8 0 0 1 24 80m23.88 0L128 126.74L208.12 80L128 33.26Z",
  dollar:
    "M200 168a48.05 48.05 0 0 1-48 48h-16v16a8 8 0 0 1-16 0v-16h-16a48.05 48.05 0 0 1-48-48a8 8 0 0 1 16 0a32 32 0 0 0 32 32h48a32 32 0 0 0 0-64h-40a48 48 0 0 1 0-96h8V24a8 8 0 0 1 16 0v16h8a48.05 48.05 0 0 1 48 48a8 8 0 0 1-16 0a32 32 0 0 0-32-32h-32a32 32 0 0 0 0 64h40a48.05 48.05 0 0 1 48 48",
  pencil:
    "m227.31 73.37l-44.68-44.69a16 16 0 0 0-22.63 0L36.69 152A15.86 15.86 0 0 0 32 163.31V208a16 16 0 0 0 16 16h44.69a15.86 15.86 0 0 0 11.31-4.69L227.31 96a16 16 0 0 0 0-22.63M92.69 208H48v-44.69l88-88L180.69 120ZM192 108.68L147.31 64l24-24L216 84.68Z",
  x: "M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z",
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

const ROWS: ExpenseRow[] = [
  { id: "r1", expense: "Rent", method: "Bank transfer", amount: 1200 },
  { id: "r2", expense: "Insurance", method: "Credit card", amount: 149 },
  { id: "r3", expense: "Groceries", method: "Cash", amount: 205 },
  { id: "r4", expense: "Utilities", method: "Credit card", amount: 180 },
  { id: "r5", expense: "Phone", method: "Debit card", amount: 39 },
];
const COLS = [
  { key: "expense", label: "Expense", icon: I.note },
  { key: "method", label: "Method", icon: I.stack },
  { key: "amount", label: "Amount", icon: I.dollar },
] as const;
const ROW_H = 46;
const FORM_H = 196;
const SPRING = { type: "spring", stiffness: 420, damping: 38 } as const;
const GRID = "1.1fr 1.2fr 0.8fr 34px";

/**
 * A table you edit in place. Press the pencil on a row and it opens into a small form right where it sits: each
 * column becomes a labelled field, the rows around it fade back, and Done or Enter writes the change in with the
 * edited cell settling into its new value. Cancel or Escape closes it untouched.
 */
export default function RowEditor({
  rows: rowsProp = ROWS,
  onChange,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: RowEditorProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const [rows, setRows] = useState(rowsProp);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    expense: string;
    method: string;
    amount: string;
  }>({ expense: "", method: "", amount: "" });
  const [flash, setFlash] = useState<string | null>(null);
  const touched = useRef(false);
  const first = useRef<HTMLInputElement>(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  useEffect(() => setRows(rowsProp), [rowsProp]);

  const open = (id: string) => {
    const r = rowsRef.current.find((x) => x.id === id);
    if (!r) return;
    setDraft({
      expense: r.expense,
      method: r.method,
      amount: String(r.amount),
    });
    setEditing(id);
    sfx.tick({ freq: 1700, gain: 0.025 });
  };
  const cancel = () => {
    setEditing(null);
    sfx.tick({ freq: 1200, gain: 0.02 });
  };
  const save = (id: string, d = draft) => {
    const amt = Number(d.amount.replace(/[^0-9.]/g, ""));
    const next = rowsRef.current.map((r) =>
      r.id === id
        ? {
            ...r,
            expense: d.expense.trim() || r.expense,
            method: d.method.trim() || r.method,
            amount: Number.isFinite(amt) && amt > 0 ? amt : r.amount,
          }
        : r,
    );
    setRows(next);
    onChange?.(next);
    setEditing(null);
    setFlash(id);
    setTimeout(() => setFlash((f) => (f === id ? null : f)), 1200);
    sfx.note(1046, { dur: 0.14, gain: 0.035 });
  };

  useEffect(() => {
    if (editing) requestAnimationFrame(() => first.current?.focus({ preventScroll: true }));
  }, [editing]);

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      const methods = ["Wallet", "Cash"];
      let n = 0;
      while (ok()) {
        await wait(1300);
        if (!ok()) break;
        const id = "r3";
        open(id);
        await wait(900);
        const r = rowsRef.current.find((x) => x.id === id);
        if (!r || !ok()) break;
        let m = r.method;
        while (m.length && ok()) {
          m = m.slice(0, -1);
          setDraft((d) => ({ ...d, method: m }));
          await wait(60);
        }
        const target = methods[n % 2];
        for (const c of target) {
          if (!ok()) break;
          m += c;
          setDraft((d) => ({ ...d, method: m }));
          sfx.tick({ freq: 2600, gain: 0.012 });
          await wait(95);
        }
        await wait(600);
        if (!ok()) break;
        save(id, { expense: r.expense, method: m, amount: String(r.amount) });
        n++;
        await wait(2400);
      }
    })().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif";
  const total = useMemo(() => rows.reduce((a, r) => a + r.amount, 0), [rows]);
  const field: CSSProperties = {
    width: "100%",
    height: 38,
    borderRadius: 12,
    border: 0,
    boxShadow: "inset 0 0 0 1px #e3e3e8",
    background: "#fff",
    padding: "0 12px",
    fontSize: 14,
    color: "#1d1d1f",
    fontFamily: font,
    outline: "none",
  };

  return (
    <div
      className={`w-full ${className}`}
      style={{ maxWidth: 520, fontFamily: font }}
      onPointerDown={(e) => e.isTrusted && (touched.current = true)}
      onKeyDown={() => (touched.current = true)}
    >
      <div
        style={{
          borderRadius: 28,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 24px 48px -30px rgba(0,0,0,0.35)",
          padding: "18px 22px 14px",
          color: "#1d1d1f",
        }}
      >
        <motion.div
          role="row"
          animate={{
            opacity: editing ? 0.3 : 1,
            filter: editing ? "blur(1.5px)" : "blur(0px)",
          }}
          transition={{ type: "tween", duration: 0.25 }}
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            alignItems: "center",
            height: 38,
            fontSize: 13,
            color: "#86868b",
            borderBottom: "1px solid #f0f0f2",
          }}
        >
          {COLS.map((c) => (
            <span key={c.key} role="columnheader" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span className="max-[460px]:hidden">
                <Ico d={c.icon} size={15} />
              </span>
              {c.label}
            </span>
          ))}
          <span />
        </motion.div>

        <div role="rowgroup">
          {rows.map((r) => {
            const isE = editing === r.id;
            const dim = !!editing && !isE;
            return (
              <motion.div
                key={r.id}
                role="row"
                initial={false}
                animate={{
                  height: isE ? FORM_H : ROW_H,
                  opacity: dim ? 0.3 : 1,
                  filter: dim ? "blur(1.5px)" : "blur(0px)",
                }}
                transition={{
                  ...SPRING,
                  filter: { type: "tween", duration: 0.25 },
                  opacity: { duration: 0.22 },
                }}
                style={{
                  position: "relative",
                  borderBottom: "1px solid #f0f0f2",
                  overflow: "hidden",
                  pointerEvents: dim ? "none" : "auto",
                }}
                aria-hidden={dim}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {!isE ? (
                    <motion.div
                      key="cells"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: 6,
                        transition: { duration: 0.12 },
                      }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: GRID,
                        alignItems: "center",
                        height: ROW_H,
                        fontSize: 14,
                      }}
                    >
                      {(["expense", "method", "amount"] as const).map((k) => (
                        <span
                          key={k}
                          role="cell"
                          className={k === "amount" ? "tabular-nums" : undefined}
                          style={{
                            fontWeight: k === "expense" ? 600 : 400,
                            color: k === "expense" ? "#1d1d1f" : "#3a3a3c",
                            position: "relative",
                          }}
                        >
                          <motion.span
                            key={String(r[k])}
                            initial={flash === r.id ? { opacity: 0, filter: "blur(4px)", y: 4 } : false}
                            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                            transition={{ type: "tween", duration: 0.3 }}
                            style={{ display: "inline-block" }}
                          >
                            {k === "amount" ? (
                              <>
                                <span style={{ color: "#aeaeb2" }}>$</span>
                                {r.amount.toLocaleString("en-US")}
                              </>
                            ) : (
                              r[k]
                            )}
                          </motion.span>
                        </span>
                      ))}
                      <span role="cell" style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          aria-label={`Edit ${r.expense}`}
                          disabled={!!editing}
                          onClick={() => {
                            touched.current = true;
                            open(r.id);
                          }}
                          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] hover:bg-[#f2f2f4]"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 9,
                            border: 0,
                            background: "transparent",
                            color: "#aeaeb2",
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Ico d={I.pencil} size={15} />
                        </button>
                      </span>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        touched.current = true;
                        save(r.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          e.preventDefault();
                          cancel();
                        }
                      }}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.22, delay: 0.06 }}
                      aria-label={`Edit ${r.expense}`}
                      style={{
                        padding: "14px 0 12px",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      {COLS.map((c, i) => (
                        <motion.label
                          key={c.key}
                          htmlFor={`${uid}-${c.key}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 + i * 0.05 }}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(84px, 110px) 1fr",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 7,
                              fontSize: 13,
                              color: "#6e6e73",
                            }}
                          >
                            <Ico d={c.icon} size={15} />
                            {c.label}
                          </span>
                          <span style={{ position: "relative" }}>
                            {c.key === "amount" && (
                              <span
                                style={{
                                  position: "absolute",
                                  left: 12,
                                  top: 10,
                                  fontSize: 14,
                                  color: "#aeaeb2",
                                }}
                              >
                                $
                              </span>
                            )}
                            <input
                              id={`${uid}-${c.key}`}
                              ref={i === 0 ? first : undefined}
                              inputMode={c.key === "amount" ? "decimal" : undefined}
                              value={draft[c.key]}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  [c.key]: e.target.value,
                                }))
                              }
                              className="tabular-nums focus:shadow-[inset_0_0_0_1.5px_#0071e3]"
                              style={{
                                ...field,
                                paddingLeft: c.key === "amount" ? 24 : 12,
                              }}
                            />
                          </span>
                        </motion.label>
                      ))}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 8,
                          marginTop: 4,
                        }}
                      >
                        <button
                          type="button"
                          onClick={cancel}
                          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                          style={{
                            height: 34,
                            borderRadius: 11,
                            border: 0,
                            background: "#f2f2f4",
                            color: "#1d1d1f",
                            fontSize: 13,
                            fontWeight: 500,
                            padding: "0 12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            fontFamily: font,
                          }}
                        >
                          <Ico d={I.x} size={12} />
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                          style={{
                            height: 34,
                            borderRadius: 11,
                            border: 0,
                            background: "#1d1d1f",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 600,
                            padding: "0 14px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            fontFamily: font,
                          }}
                        >
                          <Ico d={I.check} size={12} />
                          Done
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
        <motion.div
          animate={{ opacity: editing ? 0.3 : 1 }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: 40,
            fontSize: 13,
            color: "#86868b",
          }}
        >
          <span>{rows.length} expenses</span>
          <span className="tabular-nums" style={{ color: "#1d1d1f", fontWeight: 600, fontSize: 14 }}>
            ${total.toLocaleString("en-US")}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
