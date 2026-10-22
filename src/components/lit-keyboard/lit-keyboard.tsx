"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_KEY_SOUND_SRC, playKeyTick, useKeySound } from "@/components/key-sound";
import { audioAwake, getSoundsEnabled, useAutoplaySoundAllowed } from "@/lib/ui-sounds";

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

export interface LitKeyboardProps {
  /** Colour a key flashes to when it is pressed. Use a hex colour; the glow adds alpha to it. */
  glow?: string;
  /** Plays a recorded phrase by itself until the user types. */
  autoplay?: boolean;
  /**
   * Plays a key click with every press, click and replayed key. Follows the site-wide sound
   * switch (`ui-sounds`). Autoplay clicks too, once the visitor has used the page.
   */
  enableSound?: boolean;
  /**
   * Recorded Cherry MX clicks, one per key. Put keys.ogg in public/sounds or point this at
   * your own copy. Until it loads, or if it is missing, keys play a short synthesised tick.
   */
  soundSrc?: string;
  /** Click volume, 0 to 1. */
  volume?: number;
}

/** One recorded key press: the key and when it happened (performance.now()). */
export interface LitKeyboardHit {
  key: string;
  t: number;
}

const OFF_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function Key({ k, lit, glow, wide, onDown }: { k: string; lit: number; glow: string; wide?: boolean; onDown: (k: string) => void }) {
  const on = lit > 0;
  return (
    <motion.span
      aria-hidden="true"
      onPointerDown={(e) => {
        if (e.button === 0 && e.isTrusted) onDown(k);
      }}
      className="relative flex h-10 cursor-pointer select-none items-center justify-center rounded-[9px] text-[13px] font-medium uppercase"
      style={{
        width: wide ? 230 : 40,
        backgroundColor: on ? glow : "var(--lk-key)",
        color: on ? "#ffffff" : "var(--lk-ink)",
        boxShadow: on
          ? `0 0px 0 var(--lk-edge-on), 0 0 22px 2px ${glow}88, inset 0 1px 0 rgba(255,255,255,.4)`
          : "0 3px 0 var(--lk-edge), 0 4px 8px -3px rgba(0,0,0,.18), inset 0 1px 0 var(--lk-hi)",
        transition: on
          ? "background-color 50ms linear, color 50ms linear, box-shadow 50ms linear"
          : `background-color .9s ${OFF_EASE}, color .9s ${OFF_EASE}, box-shadow .9s ${OFF_EASE}`,
      }}
      initial={false}
      animate={{ y: on ? 3 : 0 }}
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
export function LitKeyboard({ glow = "#ff9f0a", autoplay = false, enableSound = true, soundSrc = DEFAULT_KEY_SOUND_SRC, volume = 0.6 }: LitKeyboardProps) {
  const [lit, setLit] = useState<Record<string, number>>({});
  const [text, setText] = useState("");
  const [rec, setRec] = useState<"idle" | "recording" | "playing">("idle");
  const [hasTape, setHasTape] = useState(false);
  const tape = useRef<LitKeyboardHit[]>([]);
  const touched = useRef(false);
  const timers = useRef<number[]>([]);
  const area = useRef<HTMLDivElement>(null);
  const keySound = useKeySound({ enabled: enableSound, src: soundSrc, volume });
  const autoAllowed = useAutoplaySoundAllowed();

  /** The click for a key, played in the same event as the press so it lands with the light. */
  const click = (key: string, auto = false) => {
    if (!enableSound || !getSoundsEnabled()) return;
    // Autoplay stays silent until the browser lets audio start, while the tab is hidden, and where the site mutes demos.
    if (auto && (!autoAllowed || document.hidden || !audioAwake())) return;
    const code = key === "space" ? "Space" : key === "backspace" ? "Backspace" : `Key${key.toUpperCase()}`;
    if (!keySound.play(code)) playKeyTick(volume);
  };

  /** First real input ends the demo. */
  const begin = () => {
    if (touched.current) return;
    touched.current = true;
    timers.current.forEach(clearTimeout);
    setText("");
  };

  const flash = (key: string) => {
    const id = Date.now() + Math.random();
    setLit((l) => ({ ...l, [key]: id }));
    timers.current.push(window.setTimeout(() => setLit((l) => (l[key] === id ? { ...l, [key]: 0 } : l)), 140));
  };

  const press = (raw: string, record = true, sound: boolean | "auto" = false) => {
    const key = raw === " " ? "space" : raw.toLowerCase();
    if (key !== "space" && !/^[a-z]$/.test(key)) return false;
    if (sound) click(key, sound === "auto");
    flash(key);
    setText((t) => (t + (key === "space" ? " " : key)).slice(-34));
    if (record && rec === "recording") tape.current.push({ key: raw, t: performance.now() });
    return true;
  };

  // `sound` is true for a replay the visitor asked for and "auto" for the autoplay demo. The demo types about
  // seven keys a second, so it clicks only on the first letter and the space of each word, not on every key.
  const play = (hits: LitKeyboardHit[], sound: boolean | "auto" = false) => {
    if (!hits.length) return;
    setRec("playing");
    setText("");
    const t0 = hits[0].t;
    hits.forEach((h, i) => {
      const beat = sound !== "auto" || i === 0 || h.key === " " || hits[i - 1].key === " ";
      timers.current.push(window.setTimeout(() => press(h.key, false, beat && sound), h.t - t0));
    });
    timers.current.push(window.setTimeout(() => setRec("idle"), hits[hits.length - 1].t - t0 + 400));
  };

  useEffect(() => {
    if (!autoplay) return;
    const phrase = "motion is a material";
    const demo = () => {
      if (touched.current) return;
      let t = 0;
      play(phrase.split("").map((key) => ({ key, t: (t += 90 + Math.random() * 120) })), "auto");
    };
    const a = window.setTimeout(demo, 700);
    const b = window.setInterval(demo, 5200);
    return () => { clearTimeout(a); clearInterval(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  /** Clicking a key on screen types it, like pressing it. */
  const tapKey = (k: string) => {
    begin();
    press(k === "space" ? " " : k);
  };

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-5 [--lk-deck:#e8e8ed] [--lk-edge-on:#c7c7cc] [--lk-edge:#d2d2d7] [--lk-hi:#ffffff] [--lk-ink:#1d1d1f] [--lk-key:#ffffff] dark:[--lk-deck:#1c1c1e] dark:[--lk-edge-on:#2c2c2e] dark:[--lk-edge:#0b0b0c] dark:[--lk-hi:rgba(255,255,255,.08)] dark:[--lk-ink:#f5f5f7] dark:[--lk-key:#3a3a3c]">
      <div
        ref={area}
        tabIndex={0}
        role="textbox"
        aria-label="Type here to light up the keyboard"
        onPointerDown={() => area.current?.focus()}
        onPointerEnter={keySound.prime}
        onFocus={keySound.prime}
        onPointerUp={keySound.unlock}
        onKeyDown={(e) => {
          if (e.metaKey || e.ctrlKey) return;
          begin();
          if (e.key === "Backspace") { if (!e.repeat) click("backspace"); setText((t) => t.slice(0, -1)); return; }
          if (press(e.key, true, !e.repeat)) e.preventDefault();
        }}
        className="group flex w-full max-w-[480px] flex-col items-center gap-5 rounded-[24px] outline-none"
      >
        <div className="flex h-10 min-w-[260px] items-center justify-center rounded-full bg-white px-5 text-[17px] font-medium tracking-tight text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] group-focus-visible:shadow-[0_0_0_2px_#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:group-focus-visible:shadow-[0_0_0_2px_#0a84ff]">
          <AnimatePresence initial={false}>
            {text.split("").map((c, i) => (
              <motion.span key={`${i}-${c}`} initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} className="whitespace-pre">
                {c}
              </motion.span>
            ))}
          </AnimatePresence>
          <motion.span className="ml-0.5 h-5 w-[2px] rounded-full" style={{ background: glow }} animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }} />
          {!text && <span className="text-[14px] font-normal text-[#a1a1a6] dark:text-[#8e8e93]">Click here, then type</span>}
        </div>
        <div
          className="rounded-[22px] p-3 shadow-[inset_0_1px_0_#fff,0_30px_50px_-30px_rgba(0,0,0,.45)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_30px_50px_-30px_rgba(0,0,0,.9)]"
          style={{ background: "var(--lk-deck)", transform: "perspective(900px) rotateX(24deg)", transformOrigin: "50% 100%" }}
        >
          <div className="flex flex-col items-center gap-1.5">
            {ROWS.map((row, r) => (
              <div key={row} className="flex gap-1.5" style={{ paddingLeft: r * 14 }}>
                {row.split("").map((k) => <Key key={k} k={k} lit={lit[k] || 0} glow={glow} onDown={tapKey} />)}
              </div>
            ))}
            <Key k="space" lit={lit.space || 0} glow={glow} wide onDown={tapKey} />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            touched.current = true;
            if (rec === "recording") { setRec("idle"); setHasTape(tape.current.length > 0); return; }
            tape.current = [];
            setHasTape(false);
            setText("");
            setRec("recording");
            area.current?.focus();
          }}
          className="flex h-9 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] dark:focus-visible:outline-[#0a84ff]"
        >
          <motion.span className="h-2.5 w-2.5 rounded-full bg-[#ff3b30] dark:bg-[#ff453a]" animate={rec === "recording" ? { opacity: [1, 0.2, 1] } : { opacity: 1 }} transition={{ duration: 1, repeat: rec === "recording" ? Infinity : 0 }} />
          {rec === "recording" ? "Stop" : "Record"}
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          disabled={!hasTape || rec !== "idle"}
          onClick={() => { touched.current = true; play(tape.current); }}
          className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:outline-[#0a84ff]"
        >
          Replay
        </motion.button>
      </div>
    </div>
  );
}
