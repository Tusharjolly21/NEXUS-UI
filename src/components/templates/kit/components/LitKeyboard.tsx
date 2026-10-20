"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

export interface LitKeyboardProps {
  glow?: string;
  /** Plays a recorded phrase by itself until the user types. */
  autoplay?: boolean;
}

interface Hit { key: string; t: number }

function Key({ k, lit, glow, wide }: { k: string; lit: number; glow: string; wide?: boolean }) {
  const on = lit > 0;
  return (
    <motion.span
      aria-hidden="true"
      className="relative flex h-10 items-center justify-center rounded-[9px] text-[13px] font-medium uppercase"
      style={{ width: wide ? 230 : 40 }}
      animate={{
        y: on ? 3 : 0,
        backgroundColor: on ? glow : "#ffffff",
        color: on ? "#ffffff" : "#1d1d1f",
        boxShadow: on
          ? `0 0px 0 #c7c7cc, 0 0 22px 2px ${glow}88, inset 0 1px 0 rgba(255,255,255,.4)`
          : "0 3px 0 #d2d2d7, 0 4px 8px -3px rgba(0,0,0,.18), inset 0 1px 0 #fff",
      }}
      transition={on ? { duration: 0.05 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {wide ? "" : k}
    </motion.span>
  );
}

/**
 * A tilted keyboard that lights up under your typing, with a soft afterglow.
 * Record a run and replay it with the original timing.
 */
export default function LitKeyboard({ glow = "#ff9f0a", autoplay = false }: LitKeyboardProps) {
  const [lit, setLit] = useState<Record<string, number>>({});
  const [text, setText] = useState("");
  const [rec, setRec] = useState<"idle" | "recording" | "playing">("idle");
  const tape = useRef<Hit[]>([]);
  const touched = useRef(false);
  const timers = useRef<number[]>([]);
  const area = useRef<HTMLDivElement>(null);

  const flash = (key: string) => {
    const id = Date.now() + Math.random();
    setLit((l) => ({ ...l, [key]: id }));
    timers.current.push(window.setTimeout(() => setLit((l) => (l[key] === id ? { ...l, [key]: 0 } : l)), 140));
  };

  const press = (raw: string, record = true) => {
    const key = raw === " " ? "space" : raw.toLowerCase();
    if (key !== "space" && !/^[a-z]$/.test(key)) return false;
    flash(key);
    setText((t) => (t + (key === "space" ? " " : key)).slice(-34));
    if (record && rec === "recording") tape.current.push({ key: raw, t: performance.now() });
    return true;
  };

  const play = (hits: Hit[]) => {
    if (!hits.length) return;
    setRec("playing");
    setText("");
    const t0 = hits[0].t;
    hits.forEach((h) => timers.current.push(window.setTimeout(() => press(h.key, false), h.t - t0)));
    timers.current.push(window.setTimeout(() => setRec("idle"), hits[hits.length - 1].t - t0 + 400));
  };

  useEffect(() => {
    if (!autoplay) return;
    const phrase = "motion is a material";
    const demo = () => {
      if (touched.current) return;
      let t = 0;
      play(phrase.split("").map((key) => ({ key, t: (t += 90 + Math.random() * 120) })));
    };
    const a = window.setTimeout(demo, 700);
    const b = window.setInterval(demo, 5200);
    return () => { clearTimeout(a); clearInterval(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div
        ref={area}
        tabIndex={0}
        role="textbox"
        aria-label="Type here to light up the keyboard"
        onPointerDown={() => area.current?.focus()}
        onKeyDown={(e) => {
          if (e.metaKey || e.ctrlKey) return;
          if (!touched.current) { touched.current = true; timers.current.forEach(clearTimeout); setText(""); }
          if (e.key === "Backspace") { setText((t) => t.slice(0, -1)); return; }
          if (press(e.key)) e.preventDefault();
        }}
        className="group flex w-full max-w-[480px] flex-col items-center gap-5 rounded-[24px] outline-none"
      >
        <div className="flex h-10 min-w-[260px] items-center justify-center rounded-full bg-white px-5 text-[17px] font-medium tracking-tight text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] group-focus-visible:shadow-[0_0_0_2px_#0071e3]">
          <AnimatePresence initial={false}>
            {text.split("").map((c, i) => (
              <motion.span key={`${i}-${c}`} initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} className="whitespace-pre">
                {c}
              </motion.span>
            ))}
          </AnimatePresence>
          <motion.span className="ml-0.5 h-5 w-[2px] rounded-full" style={{ background: glow }} animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }} />
          {!text && <span className="text-[14px] font-normal text-[#a1a1a6]">Click here, then type</span>}
        </div>
        <div className="rounded-[22px] bg-[#e8e8ed] p-3 shadow-[inset_0_1px_0_#fff,0_30px_50px_-30px_rgba(0,0,0,.45)]" style={{ transform: "perspective(900px) rotateX(24deg)", transformOrigin: "50% 100%" }}>
          <div className="flex flex-col items-center gap-1.5">
            {ROWS.map((row, r) => (
              <div key={row} className="flex gap-1.5" style={{ paddingLeft: r * 14 }}>
                {row.split("").map((k) => <Key key={k} k={k} lit={lit[k] || 0} glow={glow} />)}
              </div>
            ))}
            <Key k="space" lit={lit.space || 0} glow={glow} wide />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            touched.current = true;
            if (rec === "recording") { setRec("idle"); return; }
            tape.current = [];
            setText("");
            setRec("recording");
            area.current?.focus();
          }}
          className="flex h-9 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]"
        >
          <motion.span className="h-2.5 w-2.5 rounded-full bg-[#ff3b30]" animate={rec === "recording" ? { opacity: [1, 0.2, 1] } : { opacity: 1 }} transition={{ duration: 1, repeat: rec === "recording" ? Infinity : 0 }} />
          {rec === "recording" ? "Stop" : "Record"}
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          disabled={!tape.current.length || rec !== "idle"}
          onClick={() => { touched.current = true; play(tape.current); }}
          className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
        >
          Replay
        </motion.button>
      </div>
    </div>
  );
}
