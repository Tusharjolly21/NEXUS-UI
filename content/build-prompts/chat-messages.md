Add the "Chat Messages" component from Nexus UI to my project.

A chat thread styled like a messaging app, with blue user bubbles, grey replies and a composer. With autoplay the conversation plays itself: user lines type into the composer and pop out, and the assistant's typing dots grow into each reply; visitors can then send their own messages. Also includes Composer Morph Chat, where the text in the composer lifts out of the field and morphs into the sent bubble, then the reply shimmers and streams in word by word. Also includes Chat Head, a chat that lives in a draggable floating head that flings to the nearest edge, peeks new messages, opens into a panel and can be dismissed on a target or with the keyboard.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` and `@/lib/typing-sound` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
6. Use it like this: `import { ChatMessages } from "@/components/chat-messages/chat-messages";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/chat-messages/chat-messages.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useTypedText } from "@/lib/typing-sound";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface ChatMessage {
  /** Stable key for the message. */
  id: string;
  /** Who sent it. User bubbles sit on the right in blue, assistant bubbles on the left in grey. */
  sender: "user" | "assistant";
  /** Message text. */
  content: string;
  /** Optional time shown under the last bubble of a group, e.g. "9:41". */
  timestamp?: string;
}

export interface ChatMessagesProps {
  /** The conversation. With `autoplay` it plays out one message at a time; otherwise it shows in full. */
  messages?: ChatMessage[];
  /** Plays the conversation (typing dots, then each bubble) and loops it until someone touches the chat. */
  autoplay?: boolean;
  /** @deprecated Use `autoplay`. Kept so older code keeps working. */
  autoPlay?: boolean;
  /** Pause after each message during autoplay, in ms. */
  autoPlayDelay?: number;
  /** How long the assistant shows typing dots before a reply, in ms. */
  typingDuration?: number;
  /** Shows a replay button in the header. */
  showReplay?: boolean;
  /** Lets the visitor type and send their own messages. */
  interactive?: boolean;
  /** Produces the assistant's answer to a sent message. Defaults to a few canned replies. */
  reply?: (text: string) => string | Promise<string>;
  /** Called with the text whenever the visitor sends a message. */
  onSend?: (text: string) => void;
  /** Name in the header. */
  title?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the root. Give it a height (e.g. `h-[480px]`) to change the default 440px. */
  className?: string;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: "1", sender: "assistant", content: "Hi, I'm Nexus. What are we building today?" },
  { id: "2", sender: "user", content: "A landing page for my app." },
  { id: "3", sender: "assistant", content: "Nice. Start with a hero, three feature cards and a pricing table. Want me to lay it out?" },
  { id: "4", sender: "user", content: "Yes, and keep it light." },
  { id: "5", sender: "assistant", content: "Done. White cards, one blue accent, soft shadows. Take a look.", timestamp: "9:41" },
];

const CANNED = [
  "Good question. Give me a second and I'll sketch it out.",
  "Got it. I'd keep that to one screen and one clear action.",
  "Sure. Want the short version or the full plan?",
];

type Item = ChatMessage & { via: "static" | "typed" | "sent" };

/** Bubbles pop from their corner with a little overshoot. */
const POP = { type: "spring" as const, stiffness: 520, damping: 24, mass: 0.8 };
/** The typing bubble grows into the reply on this spring: the signature move. */
const MORPH = { type: "spring" as const, stiffness: 380, damping: 30 };

function Dots({ still }: { still: boolean }) {
  return (
    <span className="flex items-center gap-[5px] px-1 py-[3px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-[7px] w-[7px] rounded-full bg-[#8e8e93]"
          animate={still ? undefined : { y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/**
 * A chat thread in the style of a messaging app. With autoplay the
 * conversation plays itself: user lines type into the composer and pop out
 * as blue bubbles, and the assistant's typing dots grow into each reply.
 * Visitors can then send their own messages and get an answer.
 */
export function ChatMessages({
  messages = DEFAULT_MESSAGES,
  autoplay,
  autoPlay,
  autoPlayDelay = 900,
  typingDuration = 1300,
  showReplay = true,
  interactive = true,
  reply,
  onSend,
  title = "Nexus AI",
  enableSound = true,
  className = "",
}: ChatMessagesProps) {
  const play = useSound(enableSound);
  const playRef = useRef(play);
  const uid = useId().replace(/:/g, "");
  const still = useReducedMotion() === true;
  const playing = autoplay ?? autoPlay ?? false;
  const [items, setItems] = useState<Item[]>(() => (playing ? [] : messages.map((m) => ({ ...m, via: "static" as const }))));
  const [typing, setTyping] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [demoDraft, setDemoDraft] = useState("");
  useTypedText(demoDraft, enableSound);
  useTypedText(draft, enableSound);
  const scroller = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const touched = useRef(false);
  const demo = useRef(false);
  const seq = useRef(0);
  const canned = useRef(0);

  const later = (f: () => void, ms: number) => {
    timers.current.push(window.setTimeout(f, ms));
  };
  const clearLater = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    const pending = timers;
    return () => pending.current.forEach((t) => window.clearTimeout(t));
  }, []);

  // Keep the newest bubble in view.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const id = requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: still ? "auto" : "smooth" }));
    return () => cancelAnimationFrame(id);
  }, [items.length, typing, still]);

  const playFrom = (list: ChatMessage[], i: number) => {
    if (i >= list.length) {
      // Loop the demo until someone joins in.
      later(() => {
        if (touched.current) return;
        setItems([]);
        later(() => playFrom(list, 0), 500);
      }, 3200);
      return;
    }
    const m = list[i];
    if (m.sender === "assistant") {
      setTyping(m.id);
      later(() => {
        setTyping(null);
        setItems((p) => [...p, { ...m, via: "typed" }]);
        playRef.current.auto("ping", 0.7);
        later(() => playFrom(list, i + 1), autoPlayDelay);
      }, typingDuration);
      return;
    }
    const step = still ? 0 : 24;
    for (let c = 1; c <= m.content.length; c++) later(() => setDemoDraft(m.content.slice(0, c)), c * step);
    later(() => {
      setDemoDraft("");
      setItems((p) => [...p, { ...m, via: "sent" }]);
      playRef.current.auto("whoosh");
      later(() => playFrom(list, i + 1), autoPlayDelay);
    }, m.content.length * step + 260);
  };

  const key = messages.map((m) => `${m.id}\u0001${m.sender}\u0001${m.content}`).join("\u0000");
  useEffect(() => {
    if (!playing) return;
    demo.current = true;
    const t = window.setTimeout(() => playFrom(messages, 0), 450);
    return () => {
      window.clearTimeout(t);
      demo.current = false;
    };
    // Restart only when the conversation itself changes, not on every new array literal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, key]);

  /** First touch during the demo: stop it and show the whole conversation so the visitor can join in. */
  const takeOver = () => {
    if (touched.current) return;
    touched.current = true;
    if (!demo.current) return;
    demo.current = false;
    clearLater();
    setTyping(null);
    setDemoDraft("");
    setItems(messages.map((m) => ({ ...m, via: "static" as const })));
  };

  const replay = () => {
    touched.current = false;
    demo.current = true;
    clearLater();
    setTyping(null);
    setDemoDraft("");
    setItems([]);
    later(() => playFrom(messages, 0), 350);
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    takeOver();
    const text = draft.trim();
    if (!text || !interactive) return;
    play("whoosh");
    const n = ++seq.current;
    const answerId = `${uid}-a${n}`;
    setDraft("");
    setItems((p) => [...p, { id: `${uid}-u${n}`, sender: "user", content: text, via: "sent" }]);
    onSend?.(text);
    later(() => setTyping(answerId), 350);
    const started = performance.now();
    const answer = reply ? Promise.resolve(reply(text)) : Promise.resolve(CANNED[canned.current++ % CANNED.length]);
    answer
      .then((content) => {
        const wait = Math.max(0, typingDuration + 350 - (performance.now() - started));
        later(() => {
          setTyping((t) => (t === answerId ? null : t));
          setItems((p) => [...p, { id: answerId, sender: "assistant", content, via: "typed" }]);
          play("ping", 0.7);
        }, wait);
      })
      .catch(() => setTyping(null));
  };

  const shownDraft = demoDraft || draft;

  return (
    <div
      className={cn(`flex h-[440px] w-full max-w-[400px] flex-col overflow-hidden rounded-[24px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]`, className)}
      onPointerDown={takeOver}
    >
      <div className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-3 dark:border-white/[0.08]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#0071e3,#bf5af2)] text-white" aria-hidden="true">
          <svg viewBox="0 0 20 20" className="h-4 w-4">
            <path d="M10 2l1.7 4.6a2 2 0 0 0 1.2 1.2L17.5 9.5l-4.6 1.7a2 2 0 0 0-1.2 1.2L10 17l-1.7-4.6a2 2 0 0 0-1.2-1.2L2.5 9.5l4.6-1.7a2 2 0 0 0 1.2-1.2L10 2z" fill="currentColor" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-[-0.01em]">{title}</p>
          <div className="relative h-4 overflow-hidden text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={typing ? "typing" : "online"}
                className="absolute left-0 top-0 flex items-center gap-1.5"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={POP}
              >
                {!typing && <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />}
                {typing ? "typing..." : "Online"}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        {showReplay && (
          <motion.button
            type="button"
            onClick={replay}
            whileTap={{ scale: 0.9, rotate: -40 }}
            aria-label="Replay conversation"
            className="grid h-8 w-8 place-items-center rounded-full text-[#6e6e73] outline-none hover:bg-[#f0f0f3] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#a1a1a6] dark:hover:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
              <path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        )}
      </div>

      <div ref={scroller} role="log" aria-label="Conversation" aria-live="polite" className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 [scrollbar-width:none]">
        <LayoutGroup id={uid}>
          <div className="flex flex-col">
            {items.map((m, i) => {
              const user = m.sender === "user";
              const next = items[i + 1];
              const last = !next || next.sender !== m.sender;
              const first = i === 0 || items[i - 1].sender !== m.sender;
              return (
                <div key={m.id} className={`flex flex-col ${user ? "items-end" : "items-start"} ${first && i > 0 ? "mt-3" : "mt-[3px]"}`}>
                  <motion.div
                    layoutId={`${uid}-b-${m.id}`}
                    initial={m.via === "sent" && !still ? { opacity: 0, scale: 0.5, y: 14 } : false}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={m.via === "typed" ? MORPH : POP}
                    style={{
                      originX: user ? 1 : 0,
                      originY: 1,
                      borderTopLeftRadius: 18,
                      borderTopRightRadius: 18,
                      borderBottomLeftRadius: last && !user ? 6 : 18,
                      borderBottomRightRadius: last && user ? 6 : 18,
                    }}
                    className={`max-w-[78%] px-3.5 py-2 text-[14px] leading-[1.38] ${
                      user ? "bg-[#0071e3] text-white dark:bg-[#0a84ff]" : "bg-[#e9e9eb] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
                    }`}
                  >
                    <motion.span
                      layout="position"
                      className="block break-words"
                      initial={m.via === "typed" && !still ? { opacity: 0 } : false}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, delay: 0.08 }}
                    >
                      {m.content}
                    </motion.span>
                  </motion.div>
                  {last && m.timestamp && <span className="mt-1 px-1 text-[11px] tabular-nums text-[#86868b] dark:text-[#98989d]">{m.timestamp}</span>}
                </div>
              );
            })}
            {typing && (
              <div className={`flex ${items.length && items[items.length - 1].sender === "assistant" ? "mt-[3px]" : "mt-3"}`}>
                <motion.div
                  layoutId={`${uid}-b-${typing}`}
                  initial={still ? false : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={POP}
                  style={{ originX: 0, originY: 1, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 6 }}
                  className="bg-[#e9e9eb] px-3 py-2.5 dark:bg-[#2c2c2e]"
                  role="status"
                  aria-label={`${title} is typing`}
                >
                  <Dots still={still} />
                </motion.div>
              </div>
            )}
          </div>
        </LayoutGroup>
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-black/[0.06] p-3 dark:border-white/[0.08]">
        <label htmlFor={`${uid}-in`} className="sr-only">
          Message
        </label>
        <input
          id={`${uid}-in`}
          value={shownDraft}
          onChange={(e) => {
            takeOver();
            setDraft(e.target.value);
          }}
          onFocus={takeOver}
          readOnly={!interactive}
          placeholder={interactive ? "Message" : "Replay to watch again"}
          autoComplete="off"
          className="h-9 min-w-0 flex-1 rounded-full bg-[#f0f0f3] px-4 text-[14px] outline-none placeholder:text-[#86868b] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 dark:bg-[#2c2c2e] dark:placeholder:text-[#8e8e93] dark:focus-visible:ring-[#0a84ff]/70"
        />
        <motion.button
          type="submit"
          aria-label="Send"
          disabled={!interactive || !draft.trim()}
          animate={{ scale: shownDraft.trim() ? 1 : 0.86, opacity: shownDraft.trim() ? 1 : 0.45 }}
          whileTap={{ scale: 0.82 }}
          transition={POP}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0071e3] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
            <path d="M8 13V3.5M3.5 7.5L8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </form>
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen the first tap anywhere on the page
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  const touch = (navigator.maxTouchPoints ?? 0) > 0 || window.matchMedia?.("(pointer: coarse)").matches;
  if (!touch) return;
  const wake = () => {
    if (ctx && ctx.state === "running") return;
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/typing-sound.ts ---

```ts
import * as React from "react";
import { getSoundsEnabled, setSoundsEnabled, useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

/**
 * Typing sound. One recorded key click per character, played in the same frame the character
 * appears, for every component that types by itself (typewriters, terminals, chat answers). The
 * clicks come from one OGG sprite (public/sounds/sound.ogg) and its timing map
 * (public/sounds/sprite-config.json); without them a short synthesised click plays instead.
 *
 *   const typing = useTypingSound();
 *   typing.type(char);       // a character landed
 *   typing.backspace();      // a character was removed
 *
 * It follows the site-wide sound switch and has a switch of its own (useTypingSoundEnabled), both
 * remembered in this browser. Self-playing demos stay silent until the visitor has used the page once,
 * and inside <AutoplaySound allow={false}>.
 */

const STORE_KEY = "ui-typing-sound";
let chosen: boolean | null = null; // the visitor's saved or runtime choice; typing is on until they say otherwise
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** The typing switch on its own (true until the visitor turns it off). The site-wide sound switch is separate. */
export function getTypingSoundChoice(): boolean {
  load();
  return chosen ?? true;
}

/** Whether typing is audible right now: the typing switch and the site-wide sound switch are both on. */
export function getTypingSoundEnabled(): boolean {
  return getSoundsEnabled() && getTypingSoundChoice();
}

/** Turn the typing sound on or off. The choice is remembered in this browser unless `persist` is false. */
export function setTypingSoundChoice(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The typing switch as React state: `[on, setOn]`. `on` is what the visitor hears (typing choice and
 * the site-wide switch both on). Turning it on also turns the site-wide sound on, because a typing
 * switch that stays silent is no switch; turning it off only silences typing.
 */
export function useTypingSoundEnabled(): [boolean, (on: boolean) => void] {
  const choice = React.useSyncExternalStore(subscribe, getTypingSoundChoice, () => false);
  const [master] = useSoundsEnabled();
  const set = React.useCallback((on: boolean) => {
    if (on) setSoundsEnabled(true);
    setTypingSoundChoice(on);
  }, []);
  return [choice && master, set];
}

// ── The recording ───────────────────────────────────────────────────

/** The key-click sprite and its timing map ({ defines: { keyCode: [offset ms, length ms] } }). */
export const TYPING_SPRITE_URL = "/sounds/sound.ogg";
export const TYPING_SPRITE_CONFIG_URL = "/sounds/sprite-config.json";

type AudioCtor = typeof AudioContext;
let context: AudioContext | null = null;
let sprite: { buffer: AudioBuffer; defines: Record<string, [number, number]> } | null = null;
let loading: Promise<void> | null = null;
let failed = false;

function audioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext ?? null;
}

function liveContext(): AudioContext | null {
  const Ctor = audioCtor();
  if (!Ctor) return null;
  try {
    if (!context || context.state === "closed") context = new Ctor({ latencyHint: "interactive" });
    if (context.state === "suspended") void context.resume().catch(() => {});
    return context;
  } catch {
    return null;
  }
}

/**
 * Downloads and decodes the clicks so the first character is in time. It needs no user gesture
 * (it decodes offline) and does nothing twice. The hooks call it once typing is audible.
 */
export function primeTypingSound(): Promise<void> {
  if (typeof window === "undefined" || sprite || failed) return Promise.resolve();
  if (!loading) {
    loading = (async () => {
      try {
        const [audio, cfg] = await Promise.all([fetch(TYPING_SPRITE_URL), fetch(TYPING_SPRITE_CONFIG_URL)]);
        if (!audio.ok || !cfg.ok) throw new Error("typing sprite missing");
        const defines = ((await cfg.json()) as { defines?: Record<string, [number, number]> }).defines;
        if (!defines) throw new Error("typing sprite config has no defines");
        const Offline = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
        if (!Offline) throw new Error("no offline audio");
        const buffer = await new Offline(2, 1, 44100).decodeAudioData(await audio.arrayBuffer());
        sprite = { buffer, defines };
      } catch {
        failed = true; // the synthesised click covers it
      }
    })();
  }
  return loading;
}

/** The slice for a character: its own key, else the letter in capitals, else the space bar. */
function sliceFor(defines: Record<string, [number, number]>, char: string, kind: "key" | "enter" | "backspace"): [number, number] | null {
  if (kind === "enter") return defines["13"] ?? defines["10"] ?? null;
  if (kind === "backspace") return defines["8"] ?? defines["32"] ?? null;
  const code = char.charCodeAt(0);
  return defines[String(code)] ?? (code >= 97 && code <= 122 ? defines[String(code - 32)] : undefined) ?? defines["32"] ?? defines["65"] ?? null;
}

function synthClick(ctx: AudioContext, volume: number, heavy: boolean) {
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume * 0.3, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (heavy ? 0.08 : 0.04));
  g.connect(ctx.destination);
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(heavy ? 165 : 245 + Math.random() * 60, t);
  o.connect(g);
  o.start(t);
  o.stop(t + (heavy ? 0.08 : 0.04));
}

function playClick(char: string, kind: "key" | "enter" | "backspace", volume: number) {
  const ctx = liveContext();
  if (!ctx || ctx.state !== "running") return false; // never queue clicks that would burst out later
  try {
    const slice = sprite ? sliceFor(sprite.defines, char, kind) : null;
    if (sprite && slice && slice[0] / 1000 < sprite.buffer.duration) {
      const node = ctx.createBufferSource();
      node.buffer = sprite.buffer;
      // A hair of pitch variation so fast typing does not sound like a loop.
      node.playbackRate.value = 0.98 + Math.random() * 0.04;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      node.connect(gain);
      gain.connect(ctx.destination);
      node.start(0, slice[0] / 1000, Math.min(slice[1] / 1000, sprite.buffer.duration - slice[0] / 1000));
    } else {
      synthClick(ctx, volume, kind !== "key");
    }
    return true;
  } catch {
    return false;
  }
}

// ── Playing ─────────────────────────────────────────────────────────

let lastAt = -1e9;

function userHasActed() {
  if (typeof navigator === "undefined") return false;
  const a = (navigator as unknown as { userActivation?: { hasBeenActive: boolean } }).userActivation;
  // Browsers without the API only let audio start after a gesture anyway.
  return a ? a.hasBeenActive : true;
}

/**
 * Plays the key click for a typed character (a "\n" is the Enter key). Set `auto: false` for a key
 * the visitor pressed; a component typing on its own (the default) stays silent until the visitor has
 * used the page once. Returns whether a click was started.
 */
export function playTypingSound(char: string, opts: { auto?: boolean; volume?: number; backspace?: boolean } = {}): boolean {
  if (typeof window === "undefined" || !getTypingSoundEnabled()) return false;
  if (document.hidden) return false;
  if (opts.auto !== false && !userHasActed()) return false;
  // A run of characters landing in one frame (streamed text) is one click, not a buzz.
  const now = performance.now();
  if (now - lastAt < 24) return false;
  lastAt = now;
  void primeTypingSound();
  const kind = opts.backspace ? "backspace" : char === "\n" ? "enter" : "key";
  return playClick(char, kind, opts.volume ?? 0.45);
}

export type TypingSound = {
  /** A character landed. */
  type: (char: string) => void;
  /** A character was removed. */
  backspace: () => void;
};

/**
 * For a component that types by itself. `enabled` is the component's own `sound` option. The sound
 * follows the typing switch and the site-wide sound switch, and stays silent where autoplay sound
 * is not allowed (a grid of previews).
 */
export function useTypingSound(enabled = true): TypingSound {
  const allowed = useAutoplaySoundAllowed();
  const [on] = useTypingSoundEnabled();
  const live = React.useRef(false);
  React.useEffect(() => {
    live.current = enabled && allowed && on;
    // Download and decode the clicks once typing is audible, so the first character is in time.
    if (live.current) {
      void primeTypingSound();
      // Build the audio context now (a page that has been used allows it), so the first character is heard.
      if (userHasActed()) liveContext();
    }
  }, [enabled, allowed, on]);
  return React.useMemo<TypingSound>(
    () => ({
      type: (char) => {
        if (live.current) playTypingSound(char);
      },
      backspace: () => {
        if (live.current) playTypingSound("", { backspace: true });
      },
    }),
    [],
  );
}

/**
 * The simplest way to give a typing animation its sound: pass the text that is on screen right now.
 * A click plays each time it grows by a character, a Backspace each time it shrinks, and nothing when
 * the whole line is swapped or first appears.
 *
 *   useTypedText(visibleText, enableSound);
 */
export function useTypedText(text: string, enabled = true) {
  const typing = useTypingSound(enabled);
  const prev = React.useRef(text);
  React.useEffect(() => {
    const before = prev.current;
    prev.current = text;
    if (text === before) return;
    if (text.length > before.length && text.startsWith(before)) typing.type(text[text.length - 1] ?? "");
    else if (text.length < before.length && before.startsWith(text)) typing.backspace();
  }, [text, typing]);
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

# Composer Morph Chat

Add the "Composer Morph Chat" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` and `@/lib/typing-sound` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
6. Use it like this: `import { ComposerMorphChat } from "@/components/chat-messages/composer-morph-chat";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/chat-messages/composer-morph-chat.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { useTypedText } from "@/lib/typing-sound";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface ComposerMorphChatProps {
  /** Types two scripted questions into the composer and sends them, once, until someone touches the chat. */
  autoplay?: boolean;
  /** Called with the text whenever a message is sent. */
  onSend?: (text: string) => void;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the root. */
  className?: string;
}

type Msg = { id: number; me: boolean; text: string; hidden?: boolean; card?: boolean };

const SCRIPT = [
  { ask: "Make the hero feel less static", reply: "Try a slow drift on the background and let the headline settle in word by word. Here's a starting point:", card: true },
  { ask: "Nice. Shorter copy?", reply: "Ship interfaces that move. Six words, one idea, room for the visual to breathe.", card: false },
];
const REPLIES = ["Good call. I'd keep the spacing generous and let one accent colour do the work.", "Done. I tightened the type scale and gave the buttons a softer press."];
const SNIPPET = `<motion.h1\n  initial={{ opacity: 0, y: 12 }}\n  animate={{ opacity: 1, y: 0 }}\n/>`;
const FLIGHT = { type: "spring", stiffness: 260, damping: 26 } as const;
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

/** A ref that reads true while the element is on screen and the tab is visible. Read it inside timers. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const on = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const update = () => {
      on.current = inView && !document.hidden;
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.1 });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return on;
}

/** Words arrive one at a time, each sharpening out of a blur. */
function Stream({ text, still }: { text: string; still: boolean }) {
  if (still) return <span>{text}</span>;
  const words = text.split(" ");
  return (
    <span>
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, filter: "blur(6px)", y: 3 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ delay: i * 0.055, duration: 0.35, filter: { duration: 0.35 } }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

/** The code card that slides in under the first scripted reply. */
function CodeCard({ delay, still }: { delay: number; still: boolean }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = () => {
    // Clipboard access can be refused; the label only changes when it worked.
    navigator.clipboard
      ?.writeText(SNIPPET)
      .then(() => {
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1400);
      })
      .catch(() => {});
  };
  return (
    <motion.div
      className="mt-3 overflow-hidden rounded-[16px] border border-black/[.07] bg-[#f5f5f7] dark:border-white/10 dark:bg-[#2c2c2e]"
      initial={still ? false : { opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 26 }}
    >
      <div className="flex items-center justify-between border-b border-black/[.06] px-3 py-2 text-[11px] font-medium text-[#6e6e73] dark:border-white/10 dark:text-[#a1a1a6]">
        <span>hero.tsx</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-full bg-white px-2 py-0.5 text-[#0071e3] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#1c1c1e] dark:text-[#0a84ff] dark:focus-visible:outline-[#0a84ff]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="m-0 overflow-hidden px-3 py-2.5 text-[11.5px] leading-[1.55] text-[#1d1d1f] dark:text-[#f5f5f7]" style={{ fontFamily: MONO }}>
        {SNIPPET}
      </pre>
    </motion.div>
  );
}

/**
 * An AI chat where your message doesn't just appear: the text in the composer
 * lifts out of the field and morphs into the sent bubble on its way up the
 * thread. The reply starts as a shimmering "thinking" pill, then streams in
 * word by word, sharpening out of a blur, sometimes with a card attached.
 * The replies are canned demo text; nothing leaves the page.
 */
export function ComposerMorphChat({ autoplay = false, onSend, enableSound = true, className }: ComposerMorphChatProps) {
  const still = useReducedMotion() === true;
  const play = useSound(enableSound);
  const playRef = useRef(play);
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ id: 1, me: false, text: "Hi, I'm Nexus. Ask me anything about your interface." }]);
  const [draft, setDraft] = useState("");
  useTypedText(draft, enableSound);
  const [thinking, setThinking] = useState(false);
  const [flight, setFlight] = useState<{ id: number; text: string; from: DOMRect; to: DOMRect } | null>(null);
  const [live, setLive] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const pending = useRef<{ id: number; text: string; from: DOMRect } | null>(null);
  const nextId = useRef(2);
  const turn = useRef(0);
  const touched = useRef(false);
  const inFlight = useRef(false);
  /** Whether the message now in flight was sent by the visitor (the autoplay demo uses `play.auto`). */
  const flightByUser = useRef(false);
  const timers = useRef<number[]>([]);
  const demoTimers = useRef<number[]>([]);
  const onSendRef = useRef(onSend);
  const onScreen = useOnScreen(root);

  useEffect(() => {
    onSendRef.current = onSend;
    playRef.current = play;
  }, [onSend, play]);

  const later = useCallback((fn: () => void, ms: number, demo = false) => {
    (demo ? demoTimers : timers).current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const a = timers;
    const b = demoTimers;
    return () => {
      a.current.forEach((t) => window.clearTimeout(t));
      b.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  /** Any touch ends the autoplay demo for good. */
  const touch = () => {
    touched.current = true;
    setLive(true);
    demoTimers.current.forEach((t) => window.clearTimeout(t));
    demoTimers.current = [];
  };

  const startReply = useCallback((byUser: boolean) => {
    setThinking(true);
    const k = turn.current++;
    const s = SCRIPT[k % SCRIPT.length];
    later(() => {
      const scripted = k < SCRIPT.length;
      const id = nextId.current++;
      setThinking(false);
      setMsgs((m) => [...m, { id, me: false, text: scripted ? s.reply : REPLIES[k % REPLIES.length], card: scripted && s.card }]);
      if (byUser) playRef.current("ping", 0.7);
      else playRef.current.auto("ping", 0.7);
    }, 1400);
  }, [later]);

  const send = useCallback(
    (raw: string, byUser = false) => {
      const text = raw.trim();
      const rootEl = root.current;
      const fieldEl = field.current;
      if (!text || !rootEl || !fieldEl || inFlight.current) return;
      onSendRef.current?.(text);
      if (byUser) playRef.current("whoosh");
      else playRef.current.auto("whoosh");
      const id = nextId.current++;
      setDraft("");
      if (still) {
        setMsgs((m) => [...m, { id, me: true, text }]);
        startReply(byUser);
        return;
      }
      const rr = rootEl.getBoundingClientRect();
      const fr = fieldEl.getBoundingClientRect();
      pending.current = { id, text, from: new DOMRect(fr.left - rr.left, fr.top - rr.top, fr.width, fr.height) };
      inFlight.current = true;
      flightByUser.current = byUser;
      setMsgs((m) => [...m, { id, me: true, text, hidden: true }]);
    },
    [still, startReply],
  );

  // Once the hidden bubble is laid out, measure where it will sit and fly the composer text there.
  useLayoutEffect(() => {
    const p = pending.current;
    const listEl = list.current;
    const rootEl = root.current;
    if (!p || !listEl || !rootEl) return;
    pending.current = null;
    listEl.scrollTop = listEl.scrollHeight;
    const el = listEl.querySelector<HTMLElement>(`[data-id="${p.id}"]`);
    if (!el) {
      inFlight.current = false;
      setMsgs((m) => m.map((x) => (x.id === p.id ? { ...x, hidden: false } : x)));
      return;
    }
    const rr = rootEl.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setFlight({ id: p.id, text: p.text, from: p.from, to: new DOMRect(er.left - rr.left, er.top - rr.top, er.width, er.height) });
  }, [msgs]);

  const landed = (id: number) => {
    if (!inFlight.current) return;
    inFlight.current = false;
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, hidden: false } : x)));
    setFlight(null);
    startReply(flightByUser.current);
  };

  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [msgs.length, thinking]);

  // Autoplay: wait until the chat is on screen, then type the scripted questions into the composer and send them.
  useEffect(() => {
    if (!autoplay || still) return;
    const typeAsk = (k: number) => {
      const text = SCRIPT[k % SCRIPT.length].ask;
      const step = (i: number) => {
        if (touched.current) return;
        if (i <= text.length) {
          setDraft(text.slice(0, i));
          later(() => step(i + 1), 45, true);
          return;
        }
        later(() => {
          if (!touched.current) send(text);
        }, 400, true);
      };
      step(1);
    };
    const begin = () => {
      if (touched.current) return;
      if (!onScreen.current) {
        later(begin, 400, true);
        return;
      }
      later(() => typeAsk(0), 900, true);
      later(() => typeAsk(1), 6200, true);
    };
    begin();
    const pendingDemo = demoTimers;
    return () => {
      pendingDemo.current.forEach((t) => window.clearTimeout(t));
      pendingDemo.current = [];
    };
  }, [autoplay, still, later, send, onScreen]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    touch();
    send(draft, true);
  };
  const filled = draft.trim().length > 0;

  return (
    <div
      ref={root}
      className={cn(
        "relative flex h-[520px] w-[380px] max-w-full flex-col overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={touch}
      onFocusCapture={touch}
    >
      <style>{`@keyframes nx-cm-shine{from{background-position:100% 0}to{background-position:-100% 0}}.nx-cm-shine{background-image:linear-gradient(90deg,#6e6e73 0%,#6e6e73 35%,#1d1d1f 50%,#6e6e73 65%,#6e6e73 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:nx-cm-shine 1.4s linear infinite}.dark .nx-cm-shine{background-image:linear-gradient(90deg,#a1a1a6 0%,#a1a1a6 35%,#f5f5f7 50%,#a1a1a6 65%,#a1a1a6 100%)}@media (prefers-reduced-motion:reduce){.nx-cm-shine{animation:none}}`}</style>
      <div className="flex items-center gap-3 px-5 py-4">
        <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[conic-gradient(from_200deg,#0a84ff,#bf5af2,#ff375f,#ff9f0a,#0a84ff)]" aria-hidden="true">
          <span className="h-3.5 w-3.5 rounded-full bg-white dark:bg-[#1c1c1e]" />
        </span>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold">Nexus</span>
          <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Design assistant</span>
        </div>
      </div>
      <div ref={list} role="log" aria-label="Conversation" aria-live={live ? "polite" : "off"} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
        {msgs.map((m) => (
          <div
            key={m.id}
            data-id={m.id}
            className={cn(
              "max-w-[82%] text-[15px] leading-[1.45]",
              m.me ? "self-end rounded-[20px] rounded-br-[6px] bg-[#0071e3] px-4 py-2.5 text-white dark:bg-[#0a84ff]" : "self-start text-[#1d1d1f] dark:text-[#f5f5f7]",
            )}
            style={{ opacity: m.hidden ? 0 : 1 }}
          >
            {m.me ? m.text : <Stream text={m.text} still={still} />}
            {m.card && <CodeCard delay={m.text.split(" ").length * 0.055 + 0.1} still={still} />}
          </div>
        ))}
        <AnimatePresence>
          {thinking && (
            <motion.div
              key="t"
              role="status"
              aria-label="Nexus is thinking"
              className="self-start overflow-hidden rounded-full bg-[#f5f5f7] px-4 py-2 text-[13px] font-medium dark:bg-[#2c2c2e]"
              initial={still ? false : { opacity: 0, scale: 0.8, originX: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={still ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            >
              <span className="nx-cm-shine" aria-hidden="true">
                Thinking
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-black/[.05] p-3 dark:border-white/[.08]">
        <input
          ref={field}
          value={draft}
          onChange={(e) => {
            touch();
            setDraft(e.target.value);
          }}
          placeholder="Ask Nexus…"
          aria-label="Message"
          autoComplete="off"
          className="h-11 min-w-0 flex-1 rounded-full bg-[#f5f5f7] px-4 text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93] dark:focus-visible:ring-[#0a84ff]"
        />
        <motion.button
          type="submit"
          whileTap={still ? undefined : { scale: 0.9 }}
          aria-label="Send"
          aria-disabled={!filled}
          animate={{ scale: filled ? 1 : 0.85, opacity: filled ? 1 : 0.4 }}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#0071e3] text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#0a84ff] dark:focus-visible:outline-[#0a84ff]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      </form>

      {flight && (
        <motion.div
          key={flight.id}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-10 overflow-hidden text-[15px] leading-[1.45]"
          initial={{ x: flight.from.x, y: flight.from.y, width: flight.from.width, height: flight.from.height, borderRadius: 22 }}
          animate={{ x: flight.to.x, y: flight.to.y, width: flight.to.width, height: flight.to.height, borderRadius: 20 }}
          transition={FLIGHT}
          onAnimationComplete={() => landed(flight.id)}
        >
          {/* Two layers share the text: the sent look underneath, the composer look fading away on top. */}
          <span className="absolute inset-0 bg-[#0071e3] px-4 pt-2.5 text-white dark:bg-[#0a84ff]">{flight.text}</span>
          <motion.span
            className="absolute inset-0 bg-[#f5f5f7] px-4 pt-2.5 text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={FLIGHT}
          >
            {flight.text}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen the first tap anywhere on the page
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  const touch = (navigator.maxTouchPoints ?? 0) > 0 || window.matchMedia?.("(pointer: coarse)").matches;
  if (!touch) return;
  const wake = () => {
    if (ctx && ctx.state === "running") return;
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/typing-sound.ts ---

```ts
import * as React from "react";
import { getSoundsEnabled, setSoundsEnabled, useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

/**
 * Typing sound. One recorded key click per character, played in the same frame the character
 * appears, for every component that types by itself (typewriters, terminals, chat answers). The
 * clicks come from one OGG sprite (public/sounds/sound.ogg) and its timing map
 * (public/sounds/sprite-config.json); without them a short synthesised click plays instead.
 *
 *   const typing = useTypingSound();
 *   typing.type(char);       // a character landed
 *   typing.backspace();      // a character was removed
 *
 * It follows the site-wide sound switch and has a switch of its own (useTypingSoundEnabled), both
 * remembered in this browser. Self-playing demos stay silent until the visitor has used the page once,
 * and inside <AutoplaySound allow={false}>.
 */

const STORE_KEY = "ui-typing-sound";
let chosen: boolean | null = null; // the visitor's saved or runtime choice; typing is on until they say otherwise
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** The typing switch on its own (true until the visitor turns it off). The site-wide sound switch is separate. */
export function getTypingSoundChoice(): boolean {
  load();
  return chosen ?? true;
}

/** Whether typing is audible right now: the typing switch and the site-wide sound switch are both on. */
export function getTypingSoundEnabled(): boolean {
  return getSoundsEnabled() && getTypingSoundChoice();
}

/** Turn the typing sound on or off. The choice is remembered in this browser unless `persist` is false. */
export function setTypingSoundChoice(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The typing switch as React state: `[on, setOn]`. `on` is what the visitor hears (typing choice and
 * the site-wide switch both on). Turning it on also turns the site-wide sound on, because a typing
 * switch that stays silent is no switch; turning it off only silences typing.
 */
export function useTypingSoundEnabled(): [boolean, (on: boolean) => void] {
  const choice = React.useSyncExternalStore(subscribe, getTypingSoundChoice, () => false);
  const [master] = useSoundsEnabled();
  const set = React.useCallback((on: boolean) => {
    if (on) setSoundsEnabled(true);
    setTypingSoundChoice(on);
  }, []);
  return [choice && master, set];
}

// ── The recording ───────────────────────────────────────────────────

/** The key-click sprite and its timing map ({ defines: { keyCode: [offset ms, length ms] } }). */
export const TYPING_SPRITE_URL = "/sounds/sound.ogg";
export const TYPING_SPRITE_CONFIG_URL = "/sounds/sprite-config.json";

type AudioCtor = typeof AudioContext;
let context: AudioContext | null = null;
let sprite: { buffer: AudioBuffer; defines: Record<string, [number, number]> } | null = null;
let loading: Promise<void> | null = null;
let failed = false;

function audioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext ?? null;
}

function liveContext(): AudioContext | null {
  const Ctor = audioCtor();
  if (!Ctor) return null;
  try {
    if (!context || context.state === "closed") context = new Ctor({ latencyHint: "interactive" });
    if (context.state === "suspended") void context.resume().catch(() => {});
    return context;
  } catch {
    return null;
  }
}

/**
 * Downloads and decodes the clicks so the first character is in time. It needs no user gesture
 * (it decodes offline) and does nothing twice. The hooks call it once typing is audible.
 */
export function primeTypingSound(): Promise<void> {
  if (typeof window === "undefined" || sprite || failed) return Promise.resolve();
  if (!loading) {
    loading = (async () => {
      try {
        const [audio, cfg] = await Promise.all([fetch(TYPING_SPRITE_URL), fetch(TYPING_SPRITE_CONFIG_URL)]);
        if (!audio.ok || !cfg.ok) throw new Error("typing sprite missing");
        const defines = ((await cfg.json()) as { defines?: Record<string, [number, number]> }).defines;
        if (!defines) throw new Error("typing sprite config has no defines");
        const Offline = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
        if (!Offline) throw new Error("no offline audio");
        const buffer = await new Offline(2, 1, 44100).decodeAudioData(await audio.arrayBuffer());
        sprite = { buffer, defines };
      } catch {
        failed = true; // the synthesised click covers it
      }
    })();
  }
  return loading;
}

/** The slice for a character: its own key, else the letter in capitals, else the space bar. */
function sliceFor(defines: Record<string, [number, number]>, char: string, kind: "key" | "enter" | "backspace"): [number, number] | null {
  if (kind === "enter") return defines["13"] ?? defines["10"] ?? null;
  if (kind === "backspace") return defines["8"] ?? defines["32"] ?? null;
  const code = char.charCodeAt(0);
  return defines[String(code)] ?? (code >= 97 && code <= 122 ? defines[String(code - 32)] : undefined) ?? defines["32"] ?? defines["65"] ?? null;
}

function synthClick(ctx: AudioContext, volume: number, heavy: boolean) {
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume * 0.3, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (heavy ? 0.08 : 0.04));
  g.connect(ctx.destination);
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(heavy ? 165 : 245 + Math.random() * 60, t);
  o.connect(g);
  o.start(t);
  o.stop(t + (heavy ? 0.08 : 0.04));
}

function playClick(char: string, kind: "key" | "enter" | "backspace", volume: number) {
  const ctx = liveContext();
  if (!ctx || ctx.state !== "running") return false; // never queue clicks that would burst out later
  try {
    const slice = sprite ? sliceFor(sprite.defines, char, kind) : null;
    if (sprite && slice && slice[0] / 1000 < sprite.buffer.duration) {
      const node = ctx.createBufferSource();
      node.buffer = sprite.buffer;
      // A hair of pitch variation so fast typing does not sound like a loop.
      node.playbackRate.value = 0.98 + Math.random() * 0.04;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      node.connect(gain);
      gain.connect(ctx.destination);
      node.start(0, slice[0] / 1000, Math.min(slice[1] / 1000, sprite.buffer.duration - slice[0] / 1000));
    } else {
      synthClick(ctx, volume, kind !== "key");
    }
    return true;
  } catch {
    return false;
  }
}

// ── Playing ─────────────────────────────────────────────────────────

let lastAt = -1e9;

function userHasActed() {
  if (typeof navigator === "undefined") return false;
  const a = (navigator as unknown as { userActivation?: { hasBeenActive: boolean } }).userActivation;
  // Browsers without the API only let audio start after a gesture anyway.
  return a ? a.hasBeenActive : true;
}

/**
 * Plays the key click for a typed character (a "\n" is the Enter key). Set `auto: false` for a key
 * the visitor pressed; a component typing on its own (the default) stays silent until the visitor has
 * used the page once. Returns whether a click was started.
 */
export function playTypingSound(char: string, opts: { auto?: boolean; volume?: number; backspace?: boolean } = {}): boolean {
  if (typeof window === "undefined" || !getTypingSoundEnabled()) return false;
  if (document.hidden) return false;
  if (opts.auto !== false && !userHasActed()) return false;
  // A run of characters landing in one frame (streamed text) is one click, not a buzz.
  const now = performance.now();
  if (now - lastAt < 24) return false;
  lastAt = now;
  void primeTypingSound();
  const kind = opts.backspace ? "backspace" : char === "\n" ? "enter" : "key";
  return playClick(char, kind, opts.volume ?? 0.45);
}

export type TypingSound = {
  /** A character landed. */
  type: (char: string) => void;
  /** A character was removed. */
  backspace: () => void;
};

/**
 * For a component that types by itself. `enabled` is the component's own `sound` option. The sound
 * follows the typing switch and the site-wide sound switch, and stays silent where autoplay sound
 * is not allowed (a grid of previews).
 */
export function useTypingSound(enabled = true): TypingSound {
  const allowed = useAutoplaySoundAllowed();
  const [on] = useTypingSoundEnabled();
  const live = React.useRef(false);
  React.useEffect(() => {
    live.current = enabled && allowed && on;
    // Download and decode the clicks once typing is audible, so the first character is in time.
    if (live.current) {
      void primeTypingSound();
      // Build the audio context now (a page that has been used allows it), so the first character is heard.
      if (userHasActed()) liveContext();
    }
  }, [enabled, allowed, on]);
  return React.useMemo<TypingSound>(
    () => ({
      type: (char) => {
        if (live.current) playTypingSound(char);
      },
      backspace: () => {
        if (live.current) playTypingSound("", { backspace: true });
      },
    }),
    [],
  );
}

/**
 * The simplest way to give a typing animation its sound: pass the text that is on screen right now.
 * A click plays each time it grows by a character, a Backspace each time it shrinks, and nothing when
 * the whole line is swapped or first appears.
 *
 *   useTypedText(visibleText, enableSound);
 */
export function useTypedText(text: string, enabled = true) {
  const typing = useTypingSound(enabled);
  const prev = React.useRef(text);
  React.useEffect(() => {
    const before = prev.current;
    prev.current = text;
    if (text === before) return;
    if (text.length > before.length && text.startsWith(before)) typing.type(text[text.length - 1] ?? "");
    else if (text.length < before.length && before.startsWith(text)) typing.backspace();
  }, [text, typing]);
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

# Chat Head

Add the "Chat Head" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { ChatHead } from "@/components/chat-messages/chat-head";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/chat-messages/chat-head.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform, type ValueAnimationTransition } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface ChatHeadProps {
  /** Bounces the head, peeks new messages and drifts it between the edges until someone touches the stage. */
  autoplay?: boolean;
  /** Name shown on the head, in the peek and in the panel header. */
  name?: string;
  /** Called with the text of a quick reply when the visitor taps one. */
  onReply?: (text: string) => void;
  /** Called when the head is dropped on the target or dismissed with the Delete key. */
  onDismiss?: () => void;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
  /** Extra classes for the stage. It is 360px wide at most and 540px tall. */
  className?: string;
}

const MAXW = 360;
const H = 540;
const HEAD = 60;
const M = 14;
const INCOMING = ["Lunch at 1?", "Sent you the deck", "Did the build go out?", "Look at this animation", "Free for a quick call?"];
const QUICK = ["On it", "Give me 5", "Yes!"];
const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const INSTANT: ValueAnimationTransition = { duration: 0 };

/** A ref that reads true while the element is on screen and the tab is visible. Read it inside timers. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const on = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const update = () => {
      on.current = inView && !document.hidden;
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.1 });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return on;
}

/**
 * A chat that lives in a floating head, like the bubbles on a phone. Drag it
 * anywhere and it flings to the nearest edge; drop it on the target at the
 * bottom to dismiss it. New messages make it bounce and peek a preview beside
 * it. Tap it and the whole conversation springs out of the bubble. It floats
 * over a stand-in page inside its own bounded stage, so it works in any
 * container. Keyboard: Enter or Space opens and closes, Escape closes, arrow
 * keys move the head, Delete dismisses it.
 */
export function ChatHead({ autoplay = false, name = "Maya", onReply, onDismiss, enableSound = true, className }: ChatHeadProps) {
  const still = useReducedMotion() === true;
  const play = useSound(enableSound);
  const uid = useId();
  const stage = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const wRef = useRef(MAXW);
  const x = useMotionValue(MAXW - HEAD - M);
  const y = useMotionValue(120);
  const bounce = useMotionValue(1);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [overBin, setOverBin] = useState(false);
  const [gone, setGone] = useState(false);
  const [unread, setUnread] = useState(1);
  const [peek, setPeek] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([{ me: false, t: "Hey! Got a sec?" }]);
  const [side, setSide] = useState<"l" | "r">("r");
  const [live, setLive] = useState(false);
  const openRef = useRef(false);
  const goneRef = useRef(false);
  const touched = useRef(false);
  const moved = useRef(false);
  const refocus = useRef(false);
  const timers = useRef<number[]>([]);
  const peekTimer = useRef<number | undefined>(undefined);
  const onScreen = useOnScreen(stage);

  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    goneRef.current = gone;
  }, [gone]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => {
    const t = timers;
    return () => {
      t.current.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(peekTimer.current);
    };
  }, []);

  // The stage can shrink on small screens; keep the head docked to its real edge.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      wRef.current = w;
      if (x.get() > w / 2) x.set(w - HEAD - M);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [x]);

  const spring = useCallback((cfg: ValueAnimationTransition): ValueAnimationTransition => (still ? INSTANT : cfg), [still]);

  const snap = (vx = 0) => {
    const w = wRef.current;
    const cx = x.get() + HEAD / 2 + vx * 0.15;
    const toL = cx < w / 2;
    setSide(toL ? "l" : "r");
    animate(x, toL ? M : w - HEAD - M, spring({ type: "spring", stiffness: 380, damping: 26, velocity: vx }));
    animate(y, Math.max(M + 40, Math.min(H - HEAD - 110, y.get())), spring({ type: "spring", stiffness: 380, damping: 30 }));
  };
  const nearBin = () => Math.hypot(x.get() + HEAD / 2 - wRef.current / 2, y.get() + HEAD / 2 - (H - 70)) < 60;

  const arrive = useCallback(
    (t: string) => {
      setMsgs((m) => [...m, { me: false, t }]);
      if (openRef.current) return;
      setUnread((u) => u + 1);
      if (goneRef.current) return;
      if (!still) animate(bounce, [1, 1.22, 0.92, 1.05, 1], { duration: 0.6 });
      setPeek(t);
      window.clearTimeout(peekTimer.current);
      peekTimer.current = window.setTimeout(() => setPeek(null), 2400);
    },
    [bounce, still],
  );

  // Autoplay: a new message every few ticks and a drift to the other edge, while the stage is on screen.
  useEffect(() => {
    if (!autoplay || still) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      if (!onScreen.current) return;
      k++;
      if (k % 3 === 1) arrive(INCOMING[k % INCOMING.length]);
      if (k % 3 === 2) {
        animate(x, k % 2 ? M : wRef.current - HEAD - M, { type: "spring", stiffness: 160, damping: 18 });
        setSide(k % 2 ? "l" : "r");
        animate(y, 90 + ((k * 70) % 220), { type: "spring", stiffness: 160, damping: 20 });
      }
    }, 1900);
    return () => window.clearInterval(id);
  }, [autoplay, still, arrive, onScreen, x, y]);

  useEffect(() => {
    if (gone) backRef.current?.focus();
    else if (refocus.current) {
      refocus.current = false;
      headRef.current?.focus();
    }
  }, [gone]);

  const touch = () => {
    touched.current = true;
    setLive(true);
  };

  const toggle = () => {
    // A click that ends a drag is not a tap.
    if (moved.current) return;
    const willOpen = !open;
    play(willOpen ? "pop" : "tap", willOpen ? 1 : 0.6);
    setOpen(willOpen);
    setUnread(0);
    setPeek(null);
    if (willOpen) {
      animate(x, wRef.current - HEAD - M, spring({ type: "spring", stiffness: 300, damping: 26 }));
      animate(y, 14, spring({ type: "spring", stiffness: 300, damping: 26 }));
      setSide("r");
    }
  };

  const dismiss = () => {
    play("drop");
    onDismiss?.();
    animate(x, wRef.current / 2 - HEAD / 2, { duration: still ? 0 : 0.2 });
    animate(y, H - 70 - HEAD / 2, { duration: still ? 0 : 0.2 });
    later(() => {
      setGone(true);
      setOpen(false);
    }, still ? 0 : 200);
  };

  const dock = (toL: boolean, ny?: number) => {
    setSide(toL ? "l" : "r");
    animate(x, toL ? M : wRef.current - HEAD - M, spring({ type: "spring", stiffness: 380, damping: 26 }));
    if (ny !== undefined) animate(y, Math.max(M, Math.min(H - HEAD - M, ny)), spring({ type: "spring", stiffness: 380, damping: 30 }));
  };

  const headKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      dock(true);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      dock(false);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      dock(side === "l", y.get() - 48);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      dock(side === "l", y.get() + 48);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      dismiss();
    }
  };

  const stageKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      play("tap", 0.6);
      setOpen(false);
      headRef.current?.focus();
    }
  };

  const binScale = useTransform(y, [H - 260, H - 120], [0.6, 1]);
  const peekXr = useTransform(x, (n) => n - 212);
  const peekXl = useTransform(x, (n) => n + HEAD + 10);
  const originX = useTransform(x, (n) => n + HEAD / 2);
  const originY = useTransform(y, (n) => n + HEAD / 2);
  const panelOrigin = useMotionTemplate`${originX}px ${originY}px`;
  const panelId = `${uid}-panel`;
  const hintId = `${uid}-hint`;

  return (
    <div
      ref={stage}
      className={cn(
        "relative h-[540px] w-[360px] max-w-full overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_50px_-30px_rgba(0,0,0,.35)] dark:bg-black dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={touch}
      onFocusCapture={touch}
      onKeyDown={stageKey}
    >
      {/* a quiet page underneath so the head reads as floating over your site */}
      <div className="absolute inset-x-6 top-6 flex flex-col gap-3" aria-hidden="true">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-3 w-16 rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]" />
          <div className="flex gap-2">
            {[0, 1, 2].map((k) => (
              <div key={k} className="h-2 w-8 rounded-full bg-[#f0f0f3] dark:bg-[#2c2c2e]" />
            ))}
          </div>
        </div>
        <div className="h-5 w-[70%] rounded-full bg-[#ececf0] dark:bg-[#2c2c2e]" />
        <div className="h-5 w-[48%] rounded-full bg-[#ececf0] dark:bg-[#2c2c2e]" />
        <div className="mb-3 h-2.5 w-[80%] rounded-full bg-[#f3f3f5] dark:bg-[#232325]" />
        {[0, 1].map((k) => (
          <div key={k} className="h-24 rounded-[18px] bg-[#f5f5f7] dark:bg-[#1c1c1e]" />
        ))}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((k) => (
            <div key={k} className="h-20 rounded-[18px] bg-[#f5f5f7] dark:bg-[#1c1c1e]" />
          ))}
        </div>
      </div>

      <span id={hintId} className="sr-only">
        Drag to move. Arrow keys move the head. Delete dismisses it.
      </span>
      <span className="sr-only" aria-live={live ? "polite" : "off"}>
        {peek && !open ? `${name}: ${peek}` : ""}
      </span>

      {/* the head */}
      <AnimatePresence>
        {!gone && (
          <motion.button
            ref={headRef}
            key="head"
            type="button"
            aria-label={open ? `Close chat with ${name}` : `Open chat with ${name}${unread ? `, ${unread} unread` : ""}`}
            aria-expanded={open}
            aria-controls={panelId}
            aria-describedby={hintId}
            className={cn("absolute left-0 top-0 z-30 touch-none rounded-full", FOCUS)}
            style={{ x, y, width: HEAD, height: HEAD, scale: bounce }}
            drag
            dragMomentum={false}
            dragElastic={0}
            onPointerDown={() => {
              moved.current = false;
            }}
            onDragStart={() => {
              moved.current = true;
              setDragging(true);
              setPeek(null);
            }}
            onDrag={() => setOverBin(nearBin())}
            onDragEnd={(_, info) => {
              setDragging(false);
              setOverBin(false);
              // The click that follows a drag arrives right after pointer up; clear the flag once it has passed.
              later(() => {
                moved.current = false;
              }, 60);
              if (nearBin()) {
                dismiss();
                return;
              }
              snap(info.velocity.x);
            }}
            onClick={toggle}
            onKeyDown={headKey}
            exit={still ? { opacity: 0, transition: INSTANT } : { scale: 0, opacity: 0, transition: { duration: 0.25 } }}
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff9f0a] to-[#ff375f] shadow-[0_10px_24px_-8px_rgba(255,55,95,.7),inset_0_-3px_6px_rgba(0,0,0,.15)]" />
            <span className="absolute inset-0 flex items-center justify-center text-[22px] font-semibold text-white" aria-hidden="true">
              {name.charAt(0)}
            </span>
            <AnimatePresence>
              {unread > 0 && !open && (
                <motion.span
                  key={unread}
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff3b30] px-1.5 text-[12px] font-bold text-white ring-2 ring-white dark:bg-[#ff453a] dark:ring-black"
                  initial={still ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={spring({ type: "spring", stiffness: 600, damping: 18 })}
                >
                  {unread}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* conversation panel springs out of the head */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            aria-label={`Conversation with ${name}`}
            className="absolute inset-x-3 bottom-3 top-[84px] z-10 flex flex-col overflow-hidden rounded-[26px] bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_20px_50px_-20px_rgba(0,0,0,.9)]"
            style={{ transformOrigin: panelOrigin }}
            initial={still ? { opacity: 0 } : { scale: 0.1, opacity: 0, borderRadius: 60 }}
            animate={still ? { opacity: 1 } : { scale: 1, opacity: 1, borderRadius: 26 }}
            exit={still ? { opacity: 0 } : { scale: 0.1, opacity: 0, borderRadius: 60 }}
            transition={spring({ type: "spring", stiffness: 320, damping: 28 })}
          >
            <div className="flex items-center gap-2.5 border-b border-black/5 px-4 py-3 dark:border-white/10">
              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ff9f0a] to-[#ff375f]" aria-hidden="true" />
              <span className="text-[15px] font-semibold">{name}</span>
            </div>
            <div role="log" aria-live="polite" className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "max-w-[78%] rounded-[18px] px-3.5 py-2 text-[14px]",
                    m.me ? "self-end bg-[#0071e3] text-white dark:bg-[#0a84ff]" : "self-start bg-[#f0f0f3] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]",
                  )}
                  initial={still ? false : { opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={spring({ delay: 0.15 + i * 0.05, type: "spring", stiffness: 420, damping: 28 })}
                >
                  {m.t}
                </motion.div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-black/5 p-3 dark:border-white/10">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    play("whoosh");
                    setMsgs((m) => [...m, { me: true, t: q }]);
                    onReply?.(q);
                  }}
                  className={cn("h-8 rounded-full bg-[#f0f0f3] px-3 text-[12px] font-medium text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]", FOCUS)}
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* dismiss target */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            key="bin"
            aria-hidden="true"
            className="absolute bottom-10 left-1/2 z-0 -ml-8 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-black/55 dark:bg-white/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{ scale: binScale }}
          >
            <motion.span className="absolute inset-0 bg-[#ff3b30] dark:bg-[#ff453a]" initial={false} animate={{ opacity: overBin ? 1 : 0 }} transition={{ duration: 0.15 }} />
            <svg className="relative" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* preview that peeks out beside the head */}
      <AnimatePresence>
        {peek && !open && !gone && (
          <motion.div
            key={peek}
            aria-hidden="true"
            className={cn("pointer-events-none absolute z-20 flex w-[200px]", side === "r" ? "justify-end" : "justify-start")}
            style={{ top: y, left: 0, x: side === "r" ? peekXr : peekXl }}
            initial={still ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={spring({ type: "spring", stiffness: 400, damping: 26 })}
          >
            <span className="max-w-full rounded-[16px] bg-white px-3.5 py-2 text-[13px] text-[#1d1d1f] shadow-[0_10px_30px_-12px_rgba(0,0,0,.4)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_10px_30px_-12px_rgba(0,0,0,.9)]">
              <span className="block text-[11px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]">{name}</span>
              {peek}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {gone && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <button
            ref={backRef}
            type="button"
            onClick={() => {
              refocus.current = true;
              x.set(wRef.current - HEAD - M);
              y.set(120);
              setSide("r");
              setGone(false);
            }}
            className={cn("h-10 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
          >
            Bring {name} back
          </button>
        </div>
      )}
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen the first tap anywhere on the page
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  const touch = (navigator.maxTouchPoints ?? 0) > 0 || window.matchMedia?.("(pointer: coarse)").matches;
  if (!touch) return;
  const wake = () => {
    if (ctx && ctx.state === "running") return;
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
