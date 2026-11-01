Add the "Interactive Terminal" component from Nexus UI to my project.

A macOS-style terminal window that types a script of commands with human timing, shows a spinner while each runs and prints its output. Then the prompt is yours: click in and type help, ls, echo or any scripted command, with history, Tab completion and Ctrl+C.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name and folder. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/typing-sound` and `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
6. Use it like this: `import { Terminal } from "@/components/terminal";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/terminal/index.ts ---

```ts
export type { TerminalTheme, TerminalTone, TerminalLine, TerminalOutput, TerminalCommand, TerminalProps } from "./terminal";
export { Terminal } from "./terminal";
```

--- components/terminal/sprite-audio.ts ---

```ts
/**
 * Plays keyboard sounds from an OGG sprite (`sound.ogg`) with a JSON timing map
 * (`sprite-config.json`). Offsets/durations are in milliseconds from the start of the
 * decoded buffer. All playback routes through a master `GainNode` so toggling sound off
 * immediately silences in-flight sprite slices and fallback clicks (no refresh required).
 * Without a `soundUrl` nothing is fetched and every key plays a short synthesised click.
 */

export type TerminalSpriteTick =
  | { kind: "key"; ch: string; volume?: number }
  | { kind: "enter"; volume?: number };

type SpriteConfigFile = {
  sound?: string;
  defines?: Record<string, [number, number]>;
};

function pickSpriteSlice(
  defines: Record<string, [number, number]>,
  kind: "key" | "enter",
  ch: string,
): [number, number] | null {
  if (kind === "enter") {
    return defines["13"] ?? defines["10"] ?? null;
  }
  const code = ch.charCodeAt(0);
  const direct = defines[String(code)];
  if (direct) return direct;
  if (code >= 97 && code <= 122) {
    const upper = defines[String(code - 32)];
    if (upper) return upper;
  }
  return defines["32"] ?? defines["65"] ?? null;
}

function playSynthFallback(ac: AudioContext, sink: AudioNode, opts: TerminalSpriteTick) {
  const t0 = ac.currentTime;
  const isEnter = opts.kind === "enter";
  const vol = opts.volume ?? (isEnter ? 0.12 : 0.08);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + (isEnter ? 0.08 : 0.04));
  g.connect(sink);
  const o = ac.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(isEnter ? 165 : 245 + Math.random() * 60, t0);
  o.connect(g);
  o.start(t0);
  o.stop(t0 + (isEnter ? 0.08 : 0.04));
}

export function createTerminalSpriteSfx(options?: {
  soundUrl?: string;
  configUrl?: string;
  /** When true, plays the entire soundUrl file on each keypress (no sprite config needed). */
  simpleMode?: boolean;
}) {
  const simpleMode = options?.simpleMode ?? false;
  // No URL means no fetch at all: every key uses the small synthesised click.
  const soundUrl = options?.soundUrl;
  const configUrl = options?.configUrl ?? "/sounds/sprite-config.json";

  let ctx: AudioContext | null = null;
  let destinationSink: GainNode | null = null;
  let outputMuted = false;
  let decoded: AudioBuffer | null = null;
  let defines: Record<string, [number, number]> | null = null;
  let loadState: "idle" | "ready" | "failed" = "idle";
  let loadPromise: Promise<void> | null = null;

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return ctx;
  };

  const getSink = (ac: AudioContext) => {
    if (!destinationSink) {
      destinationSink = ac.createGain();
      destinationSink.gain.value = outputMuted ? 0 : 1;
      destinationSink.connect(ac.destination);
    }
    return destinationSink;
  };

  const setMuted = (muted: boolean) => {
    outputMuted = muted;
    const ac = ctx;
    if (!ac) return;
    const sink = getSink(ac);
    const t = ac.currentTime;
    sink.gain.cancelScheduledValues(t);
    sink.gain.setValueAtTime(muted ? 0 : 1, t);
  };

  const loadOnce = async () => {
    if (!soundUrl) throw new Error("No sound sprite configured");
    const ac = getCtx();
    getSink(ac);
    if (simpleMode) {
      const bRes = await fetch(soundUrl);
      if (!bRes.ok) throw new Error(`Could not load ${soundUrl} (${bRes.status}).`);
      const arr = await bRes.arrayBuffer();
      decoded = await ac.decodeAudioData(arr.slice(0));
      defines = {};
      return;
    }
    const [bRes, cRes] = await Promise.all([fetch(soundUrl), fetch(configUrl)]);
    if (!bRes.ok) {
      throw new Error(
        `Could not load ${soundUrl} (${bRes.status}). Place sound.ogg in public/sounds/ or run npm run sounds:fetch (see public/sounds/README.md).`,
      );
    }
    if (!cRes.ok) {
      throw new Error(`Could not load ${configUrl} (${cRes.status}).`);
    }
    const cfg = (await cRes.json()) as SpriteConfigFile;
    if (!cfg.defines) throw new Error("Sprite config missing defines");
    defines = cfg.defines;
    const arr = await bRes.arrayBuffer();
    decoded = await ac.decodeAudioData(arr.slice(0));
  };

  const ensureLoaded = async () => {
    if (loadState === "ready" && decoded && defines) return;
    if (loadState === "failed") return;
    if (!loadPromise) {
      loadPromise = loadOnce();
    }
    try {
      await loadPromise;
      loadState = "ready";
    } catch {
      loadState = "failed";
      decoded = null;
      defines = null;
      loadPromise = null;
    }
  };

  const resume = async () => {
    const ac = getCtx();
    getSink(ac);
    if (ac.state === "suspended") await ac.resume().catch(() => {});
  };

  const tick = (opts: TerminalSpriteTick) => {
    if (outputMuted) return;
    void (async () => {
      const ac = getCtx();
      const sink = getSink(ac);
      try {
        if (ac.state !== "running") await resume();
        if (outputMuted) return;
        await ensureLoaded();
        if (outputMuted) return;
        if (ac.state !== "running") await resume();
        if (outputMuted) return;

        const ch = opts.kind === "key" ? (opts.ch.length ? opts.ch[0]! : " ") : "\r";
        const vol = opts.volume ?? (opts.kind === "enter" ? 0.52 : 0.4);
        const buf = decoded;
        const def = defines;

        if (loadState === "ready" && buf && def) {
          if (simpleMode) {
            const src = ac.createBufferSource();
            src.buffer = buf;
            const g = ac.createGain();
            g.gain.setValueAtTime(vol, ac.currentTime);
            g.connect(sink);
            src.connect(g);
            src.start(ac.currentTime);
            return;
          }
          const slice = pickSpriteSlice(def, opts.kind, ch);
          if (slice) {
            const [offMs, durMs] = slice;
            const offsetSec = offMs / 1000;
            const durationSec = durMs / 1000;
            if (offsetSec < buf.duration && durationSec > 0) {
              const maxDur = Math.min(durationSec, Math.max(0.02, buf.duration - offsetSec));
              const src = ac.createBufferSource();
              src.buffer = buf;
              const g = ac.createGain();
              g.gain.setValueAtTime(vol, ac.currentTime);
              g.connect(sink);
              src.connect(g);
              src.start(ac.currentTime, offsetSec, maxDur);
              return;
            }
          }
        }
        if (outputMuted) return;
        playSynthFallback(ac, sink, opts);
      } catch {
        if (outputMuted) return;
        try {
          playSynthFallback(getCtx(), getSink(getCtx()), opts);
        } catch {
          /* ignore */
        }
      }
    })();
  };

  return { tick, resume, ensureLoaded, setMuted };
}
```

--- components/terminal/terminal.tsx ---

```tsx
"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";
import { playTypingSound, useTypingSound, useTypingSoundEnabled } from "@/lib/typing-sound";
import { createTerminalSpriteSfx } from "./sprite-audio";
import { cn } from "@/lib/utils";

export type TerminalTheme = "carbon" | "midnight" | "paper";
export type TerminalTone = "muted" | "success" | "warning" | "error" | "info";

export type TerminalLine =
  | { kind: "input"; text: string }
  | { kind: "output"; text: string; tone?: TerminalTone }
  | { kind: "progress"; label: string; value: number; tone?: "info" | "success" }
  | { kind: "spinner"; text: string; tone?: "muted" | "info" };

/** What a command prints: plain strings (muted) or `{ text, tone }`. */
export type TerminalOutput = Array<string | { text: string; tone?: TerminalTone }>;

export type TerminalCommand = {
  /** Command string, without the prompt. */
  input: string;
  /** Lines printed after the command runs. */
  output?: TerminalOutput;
  /** Simulated work time before the output appears, in ms. A spinner shows meanwhile. */
  runDelayMs?: number;
};

export type TerminalProps = {
  /** Script typed and run in order. Visitors can run these again by typing them. */
  commands?: TerminalCommand[];
  /** Prompt symbol before each command. */
  promptSymbol?: string;
  /** Username in the prompt and title bar. */
  username?: string;
  /** Hostname in the prompt and title bar. */
  hostname?: string;
  /** Base typing speed, in ms per character. */
  typingSpeed?: number;
  /** Random extra time per character, in ms, so the typing feels human. */
  typingJitter?: number;
  /** Pause before the script starts, in ms. */
  startupDelay?: number;
  /** Pause after each command finishes, in ms. */
  delayBetweenCommands?: number;
  /** Starts the script when the terminal scrolls into view. */
  autoStart?: boolean;
  /** Repeats the script forever. */
  loop?: boolean;
  /** Pause between loops, in ms. */
  loopDelay?: number;
  /** Loops the script until someone clicks or types in the terminal, then hands them the prompt. */
  autoplay?: boolean;
  /** After the script (or the first click) the prompt takes real typing: help, clear, ls, echo, and the script's own commands. */
  interactive?: boolean;
  /** Answers a command the visitor types. Return lines to print, or nothing to fall back to the built-ins. */
  onCommand?: (input: string) => TerminalOutput | void;
  /** Shows the caret. */
  showCursor?: boolean;
  /** Plays a key click for every character typed. It uses the shared typing sound (recorded key clicks) unless you pass your own sprite. */
  enableSound?: boolean;
  /** OGG sprite for real key sounds. Nothing is fetched unless you set this. */
  soundSpriteUrl?: string;
  /** JSON timing map for the sprite. */
  soundSpriteConfigUrl?: string;
  /** A single audio file played on every key instead of a sprite. */
  simpleSoundUrl?: string;
  /** Shows the sound button in the title bar. */
  showSoundToggle?: boolean;
  /** Shows pause, resume and replay in the title bar. */
  showControls?: boolean;
  /** Window style. `paper` is light on light pages and turns dark with the site. */
  theme?: TerminalTheme;
  /** Let the body fill a parent with a fixed height (`h-[…] flex flex-col`) instead of the default 300px. */
  fillHeight?: boolean;
  /** Line under the window. Pass an empty string to hide it. */
  hint?: string;
  className?: string;
};

const DEFAULT_COMMANDS: TerminalCommand[] = [
  { input: "npm create nexus@latest", runDelayMs: 700, output: [{ text: "Scaffolding project in ./my-app", tone: "info" }, { text: "Done. 214 packages installed in 2.1s", tone: "success" }] },
  { input: "cd my-app && npm run dev", runDelayMs: 500, output: ["  ready in 412 ms", { text: "  Local: http://localhost:3000", tone: "info" }] },
  { input: "git push origin main", runDelayMs: 650, output: ["Enumerating objects: 42, done.", { text: "main -> main", tone: "success" }] },
];

type Phase = "idle" | "running" | "paused" | "ready" | "done";

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const id = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });

const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

type Tok = "cmd" | "flag" | "path" | "string" | "operator" | "var" | "text" | "space";

/** Just enough shell colouring to read well: the command, flags, paths, strings, operators and variables. */
function tokenize(input: string): { text: string; tone: Tok }[] {
  const parts = input.match(/(--?[A-Za-z0-9:_=.-]+|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\|\||&&|\||>|\$\w+|~\/\S*|\.{1,2}\/\S*|\/\S*|\S+|\s+)/g) ?? [input];
  let first = true;
  return parts.map((t) => {
    if (/^\s+$/.test(t)) return { text: t, tone: "space" as const };
    if (t === "&&" || t === "||" || t === "|" || t === ">") {
      first = true;
      return { text: t, tone: "operator" as const };
    }
    const tone: Tok = t.startsWith('"') || t.startsWith("'") ? "string" : /^--?\w/.test(t) ? "flag" : /^(~|\.{1,2}\/|\/)/.test(t) ? "path" : t.startsWith("$") ? "var" : first ? "cmd" : "text";
    first = false;
    return { text: t, tone };
  });
}

type Skin = {
  frame: string;
  bar: string;
  title: string;
  btn: string;
  body: string;
  prompt: string;
  host: string;
  dim: string;
  caret: string;
  tok: Record<Tok, string>;
  tone: Record<TerminalTone, string>;
};

const DARK_TOK: Record<Tok, string> = {
  cmd: "text-[#64d2ff]",
  flag: "text-[#da8fff]",
  path: "text-[#30d158]",
  string: "text-[#ffd60a]",
  operator: "text-[#a1a1a6]",
  var: "text-[#ff9f0a]",
  text: "text-[#f5f5f7]",
  space: "",
};
const DARK_TONE: Record<TerminalTone, string> = {
  muted: "text-[#a1a1a6]",
  success: "text-[#30d158]",
  warning: "text-[#ffd60a]",
  error: "text-[#ff6961]",
  info: "text-[#64d2ff]",
};

const SKINS: Record<TerminalTheme, Skin> = {
  carbon: {
    frame: "bg-[#1c1c1e] shadow-[0_0_0_1px_rgba(255,255,255,.06),0_30px_60px_-30px_rgba(0,0,0,.6)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_30px_60px_-30px_rgba(0,0,0,.95)]",
    bar: "bg-[#2c2c2e]/70 border-b border-white/[0.06]",
    title: "text-[#a1a1a6]",
    btn: "text-[#a1a1a6] hover:bg-white/10 hover:text-[#f5f5f7] focus-visible:ring-[#0a84ff]",
    body: "text-[#f5f5f7]",
    prompt: "text-[#30d158]",
    host: "text-[#64d2ff]",
    dim: "text-[#8e8e93]",
    caret: "bg-[#f5f5f7]",
    tok: DARK_TOK,
    tone: DARK_TONE,
  },
  midnight: {
    frame: "bg-[linear-gradient(180deg,#0f1630,#090d1d)] shadow-[0_0_0_1px_rgba(120,150,255,.14),0_30px_60px_-30px_rgba(10,20,80,.7)] dark:shadow-[0_0_0_1px_rgba(120,150,255,.2),0_30px_60px_-30px_rgba(0,0,0,.95)]",
    bar: "bg-white/[0.03] border-b border-white/[0.07]",
    title: "text-[#a3acd9]",
    btn: "text-[#a3acd9] hover:bg-white/10 hover:text-white focus-visible:ring-[#0a84ff]",
    body: "text-[#eef1ff]",
    prompt: "text-[#bf5af2]",
    host: "text-[#64d2ff]",
    dim: "text-[#8a93bd]",
    caret: "bg-[#64d2ff]",
    tok: { ...DARK_TOK, cmd: "text-[#7aa2ff]", text: "text-[#eef1ff]" },
    tone: { ...DARK_TONE, muted: "text-[#a3acd9]" },
  },
  paper: {
    frame: "bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_30px_60px_-34px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_30px_60px_-30px_rgba(0,0,0,.95)]",
    bar: "bg-[#f5f5f7] border-b border-black/[0.06] dark:bg-[#2c2c2e]/70 dark:border-white/[0.06]",
    title: "text-[#6e6e73] dark:text-[#a1a1a6]",
    btn: "text-[#6e6e73] hover:bg-black/5 hover:text-[#1d1d1f] focus-visible:ring-[#0071e3] dark:text-[#a1a1a6] dark:hover:bg-white/10 dark:hover:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]",
    body: "text-[#1d1d1f] dark:text-[#f5f5f7]",
    prompt: "text-[#248a3d] dark:text-[#30d158]",
    host: "text-[#0071e3] dark:text-[#64d2ff]",
    dim: "text-[#6e6e73] dark:text-[#8e8e93]",
    caret: "bg-[#1d1d1f] dark:bg-[#f5f5f7]",
    tok: {
      cmd: "text-[#0071e3] dark:text-[#64d2ff]",
      flag: "text-[#8e3fbf] dark:text-[#da8fff]",
      path: "text-[#248a3d] dark:text-[#30d158]",
      string: "text-[#a05a00] dark:text-[#ffd60a]",
      operator: "text-[#6e6e73] dark:text-[#a1a1a6]",
      var: "text-[#c93400] dark:text-[#ff9f0a]",
      text: "text-[#1d1d1f] dark:text-[#f5f5f7]",
      space: "",
    },
    tone: {
      muted: "text-[#6e6e73] dark:text-[#a1a1a6]",
      success: "text-[#248a3d] dark:text-[#30d158]",
      warning: "text-[#a05a00] dark:text-[#ffd60a]",
      error: "text-[#d70015] dark:text-[#ff6961]",
      info: "text-[#0060c7] dark:text-[#64d2ff]",
    },
  },
};

const LINE_IN = { type: "spring" as const, stiffness: 520, damping: 34 };

/**
 * The caret stretches with typing speed and squashes back when the typing
 * stops (the signature move), and blinks only while it's waiting.
 */
function Caret({ count, className, hollow }: { count: number; className: string; hollow: boolean }) {
  const n = useMotionValue(count);
  React.useEffect(() => {
    n.set(count);
  }, [count, n]);
  const v = useVelocity(n);
  const target = useTransform(v, (x) => 1 + Math.min(Math.abs(x), 70) / 70);
  const sx = useSpring(target, { stiffness: 420, damping: 18 });
  const sy = useTransform(sx, (s) => 1 / Math.sqrt(s));
  return (
    <motion.span aria-hidden="true" className="relative ml-px inline-block h-[1.2em] w-[0.6em] translate-y-[0.22em] align-baseline" style={{ scaleX: sx, scaleY: sy, originX: 0, originY: 1 }}>
      <motion.span
        key={count}
        className={`absolute inset-0 rounded-[2px] ${hollow ? "border border-current bg-transparent opacity-60" : className}`}
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1.06, times: [0, 0.5, 0.5, 1], repeat: Infinity, delay: 0.5 }}
      />
    </motion.span>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const HELP: TerminalOutput = [
  "Commands: help, clear, ls, pwd, whoami, echo <text>, date, history, replay",
  { text: "Or type any command from the script to run it again.", tone: "info" },
];

/**
 * A macOS-style terminal window. It types a script of commands with human
 * timing, shows a spinner while each one runs and prints its output; then the
 * prompt is yours: click in and type `help`. Up and Down walk your history,
 * Tab completes, Ctrl+C cancels and Ctrl+L clears.
 */
export function Terminal({
  commands = DEFAULT_COMMANDS,
  promptSymbol = "➜",
  username = "you",
  hostname = "nexus",
  typingSpeed = 34,
  typingJitter = 30,
  startupDelay = 450,
  delayBetweenCommands = 750,
  autoStart = true,
  loop = false,
  loopDelay = 1600,
  autoplay = false,
  interactive = true,
  onCommand,
  showCursor = true,
  enableSound = true,
  soundSpriteUrl,
  soundSpriteConfigUrl,
  simpleSoundUrl,
  showSoundToggle = true,
  showControls = true,
  theme = "carbon",
  fillHeight = false,
  hint = "Click in and type help.",
  className = "",
}: TerminalProps) {
  const still = useReducedMotion() === true;
  const skin = SKINS[theme] ?? SKINS.carbon;
  const root = React.useRef<HTMLDivElement>(null);
  const scroller = React.useRef<HTMLDivElement>(null);
  const field = React.useRef<HTMLInputElement>(null);
  const abort = React.useRef<AbortController | null>(null);
  const paused = React.useRef(false);
  const touched = React.useRef(false);
  /** True while the scripted demo (not a command the visitor ran) is playing. */
  const demo = React.useRef(false);
  const soundRef = React.useRef(enableSound);
  const histRef = React.useRef<string[]>([]);
  const histAt = React.useRef(-1);

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [lines, setLines] = React.useState<TerminalLine[]>([]);
  const [typed, setTyped] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  // Without a sprite of your own the terminal uses the shared typing sound and its switch.
  const shared = !soundSpriteUrl && !simpleSoundUrl;
  const typing = useTypingSound(enableSound);
  const [typingOn, setTypingOn] = useTypingSoundEnabled();
  const [ownSoundOn, setOwnSoundOn] = React.useState(enableSound);
  const soundOn = shared ? enableSound && typingOn : ownSoundOn;
  const [inView, setInView] = React.useState(false);
  const [working, setWorking] = React.useState(false);

  const sfx = React.useMemo(
    () =>
      createTerminalSpriteSfx(
        simpleSoundUrl ? { soundUrl: simpleSoundUrl, simpleMode: true } : { soundUrl: soundSpriteUrl, configUrl: soundSpriteConfigUrl },
      ),
    [simpleSoundUrl, soundSpriteUrl, soundSpriteConfigUrl],
  );

  React.useEffect(() => {
    soundRef.current = soundOn;
    sfx.setMuted(!soundOn);
  }, [soundOn, sfx]);

  const click = React.useCallback(
    (kind: "key" | "enter", ch = " ") => {
      if (!soundRef.current || still) return;
      if (shared) {
        // The scripted demo is a self-playing sound; keys the visitor presses always are heard.
        if (demo.current) typing.type(kind === "enter" ? "\n" : ch);
        else playTypingSound(kind === "enter" ? "\n" : ch, { auto: false });
        return;
      }
      try {
        sfx.tick(kind === "enter" ? { kind: "enter" } : { kind: "key", ch });
      } catch {
        /* audio is optional */
      }
    },
    [sfx, still, shared, typing],
  );

  React.useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setInView(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [lines, typed, draft]);

  const print = (out: TerminalOutput | undefined) =>
    (out ?? []).map((o): TerminalLine => (typeof o === "string" ? { kind: "output", text: o, tone: "muted" } : { kind: "output", text: o.text, tone: o.tone ?? "muted" }));

  /** Spinner, then the output lines one by one. */
  const runOutput = async (cmd: TerminalCommand, signal: AbortSignal) => {
    setWorking(true);
    try {
      if (cmd.runDelayMs && cmd.runDelayMs > 0 && !still) {
        setLines((p) => [...p, { kind: "spinner", text: "running", tone: "muted" }]);
        await sleep(cmd.runDelayMs, signal);
        setLines((p) => (p.length && p[p.length - 1].kind === "spinner" ? p.slice(0, -1) : p));
      }
      for (const line of print(cmd.output)) {
        setLines((p) => [...p, line]);
        await sleep(still ? 0 : 90 + Math.random() * 110, signal);
      }
    } finally {
      setWorking(false);
    }
  };

  const script = async (signal: AbortSignal) => {
    setLines([]);
    setTyped("");
    await sleep(startupDelay, signal);
    for (const cmd of commands) {
      while (paused.current) await sleep(120, signal);
      const input = cmd.input ?? "";
      if (still) setTyped(input);
      else {
        if (soundRef.current && !shared) await sfx.ensureLoaded().catch(() => {});
        for (let c = 0; c < input.length; c++) {
          while (paused.current) await sleep(120, signal);
          setTyped(input.slice(0, c + 1));
          click("key", input[c]);
          const ch = input[c];
          await sleep(typingSpeed + Math.random() * typingJitter + (ch === " " ? 22 : ch === "-" || ch === "/" ? 12 : 0), signal);
        }
        await sleep(160, signal);
      }
      setLines((p) => [...p, { kind: "input", text: input }]);
      setTyped("");
      click("enter");
      await runOutput(cmd, signal);
      await sleep(delayBetweenCommands, signal);
    }
  };

  const start = async () => {
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    paused.current = false;
    demo.current = true;
    setPhase("running");
    try {
      do {
        await script(ac.signal);
        if (!(loop || (autoplay && !touched.current))) break;
        await sleep(loopDelay, ac.signal);
      } while (!ac.signal.aborted);
      setPhase(interactive ? "ready" : "done");
    } catch (e) {
      if (!isAbort(e)) setPhase(interactive ? "ready" : "done");
    } finally {
      if (abort.current === ac) demo.current = false;
    }
  };

  React.useEffect(() => {
    if (!(autoStart || autoplay) || !inView) return;
    const t = window.setTimeout(() => void start(), 0);
    return () => {
      window.clearTimeout(t);
      abort.current?.abort();
    };
    // Start once per mount when it scrolls into view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, autoplay, inView]);

  React.useEffect(() => () => abort.current?.abort(), []);

  /** First click or key: stop the demo where it is and hand over the prompt. */
  const takeOver = () => {
    touched.current = true;
    if (!interactive) return;
    if (demo.current) {
      demo.current = false;
      abort.current?.abort();
      abort.current = null;
      paused.current = false;
      setLines((p) => {
        const next = p.filter((l) => l.kind !== "spinner");
        return typed ? [...next, { kind: "input", text: `${typed}^C` }] : next;
      });
      setTyped("");
      setPhase("ready");
    } else if (phase === "idle") setPhase("ready");
  };

  const execute = async (raw: string) => {
    const input = raw.trim();
    setLines((p) => [...p, { kind: "input", text: raw }]);
    click("enter");
    if (!input) return;
    histRef.current = [...histRef.current, input];
    histAt.current = -1;
    const custom = onCommand?.(input);
    if (custom) {
      setLines((p) => [...p, ...print(custom)]);
      return;
    }
    const known = commands.find((c) => c.input.trim() === input);
    if (known) {
      abort.current?.abort();
      demo.current = false;
      const ac = new AbortController();
      abort.current = ac;
      setPhase("running");
      try {
        await runOutput(known, ac.signal);
      } catch {
        /* cancelled */
      }
      if (!ac.signal.aborted) setPhase("ready");
      return;
    }
    const [name, ...rest] = input.split(/\s+/);
    const out: Record<string, () => TerminalOutput | "clear" | "replay"> = {
      help: () => HELP,
      clear: () => "clear",
      replay: () => "replay",
      ls: () => ["app  components  lib  public  package.json  README.md"],
      pwd: () => [`/Users/${username}`],
      whoami: () => [username],
      echo: () => [rest.join(" ")],
      date: () => [new Date().toString()],
      history: () => histRef.current.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`),
    };
    const res = out[name]?.();
    if (res === "clear") setLines([]);
    else if (res === "replay") {
      touched.current = true;
      void start();
    } else if (res) setLines((p) => [...p, ...print(res)]);
    else setLines((p) => [...p, { kind: "output", text: `command not found: ${name}`, tone: "error" }]);
  };

  const names = React.useMemo(() => ["help", "clear", "ls", "pwd", "whoami", "echo", "date", "history", "replay", ...commands.map((c) => c.input)], [commands]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      if (phase === "running") abort.current?.abort();
      setLines((p) => [...p.filter((l) => l.kind !== "spinner"), { kind: "input", text: `${draft}^C` }]);
      setDraft("");
      setPhase("ready");
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setLines([]);
      return;
    }
    if (phase !== "ready") return;
    if (e.key === "Enter") {
      e.preventDefault();
      const v = draft;
      setDraft("");
      void execute(v);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = histRef.current;
      if (!h.length) return;
      const at = histAt.current === -1 ? h.length : histAt.current;
      const next = e.key === "ArrowUp" ? Math.max(0, at - 1) : at + 1;
      histAt.current = next >= h.length ? -1 : next;
      setDraft(next >= h.length ? "" : h[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const hit = names.find((n) => draft && n.startsWith(draft) && n !== draft);
      if (hit) setDraft(hit);
    }
  };

  const Prompt = (
    <span className="mr-[1ch] select-none whitespace-pre">
      <span className={skin.prompt}>{promptSymbol}</span> <span className={skin.host}>{hostname}</span> <span className={skin.dim}>~</span>
    </span>
  );

  const live = phase === "running" || phase === "paused" ? typed : phase === "ready" ? draft : "";
  const showLive = phase !== "done" && !working;

  return (
    <motion.div
      ref={root}
      initial={still ? false : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className={cn(`relative w-full ${fillHeight ? "flex min-h-0 flex-1 flex-col" : ""}`, className)}
      onPointerDown={() => {
        takeOver();
        void sfx.resume().catch(() => {});
      }}
    >
      <div className={`overflow-hidden rounded-[22px] ${fillHeight ? "flex min-h-0 flex-1 flex-col" : ""} ${skin.frame}`}>
        {/* The bar's own buttons shouldn't count as taking over the prompt. */}
        <div className={`relative flex h-11 shrink-0 items-center px-4 ${skin.bar}`} onPointerDown={(e) => e.stopPropagation()}>
          <span className="flex gap-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.2)]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.2)]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.2)]" />
          </span>
          <span className={`pointer-events-none absolute inset-x-24 truncate text-center text-[12px] font-medium ${skin.title}`}>
            {username}@{hostname}: ~
          </span>
          <span className="ml-auto flex items-center gap-1">
            {showControls && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (phase === "running") {
                    touched.current = true;
                    paused.current = true;
                    setPhase("paused");
                  } else if (phase === "paused") {
                    paused.current = false;
                    setPhase("running");
                  } else {
                    touched.current = true;
                    void start();
                  }
                }}
                aria-label={phase === "running" ? "Pause" : phase === "paused" ? "Resume" : "Replay script"}
                className={`grid h-7 w-7 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 ${skin.btn}`}
              >
                {phase === "running" ? <Icon d="M5.5 3.5v9M10.5 3.5v9" /> : phase === "paused" ? <Icon d="M5 3.5l7 4.5-7 4.5z" /> : <Icon d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8" />}
              </button>
            )}
            {showSoundToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (shared) setTypingOn(!soundOn);
                  else {
                    void sfx.resume().catch(() => {});
                    setOwnSoundOn((v) => !v);
                  }
                }}
                aria-label={soundOn ? "Mute key sounds" : "Play key sounds"}
                aria-pressed={soundOn}
                className={`grid h-7 w-7 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 ${skin.btn}`}
              >
                <Icon d={soundOn ? "M2.5 6h2.5l3.5-3v10l-3.5-3H2.5zM11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.6a6 6 0 0 1 0 8.8" : "M2.5 6h2.5l3.5-3v10l-3.5-3H2.5zM11 6l3.5 4M14.5 6L11 10"} />
              </button>
            )}
          </span>
        </div>

        <div
          ref={scroller}
          onClick={() => {
            takeOver();
            if (interactive) field.current?.focus({ preventScroll: true });
          }}
          className={`relative cursor-text overflow-y-auto px-4 py-4 font-mono text-[13px] leading-[1.6] [scrollbar-width:none] sm:px-5 ${fillHeight ? "min-h-0 flex-1" : "h-[300px]"} ${skin.body}`}
        >
          <div role="log" aria-live="polite" aria-label="Terminal output">
            {lines.map((l, i) => {
              if (l.kind === "input")
                return (
                  <motion.div key={i} initial={still ? false : { opacity: 0.4, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={LINE_IN} className="min-w-0 break-all">
                    {Prompt}
                    <span>
                      {tokenize(l.text).map((t, j) => (
                        <span key={j} className={skin.tok[t.tone]}>
                          {t.text}
                        </span>
                      ))}
                    </span>
                  </motion.div>
                );
              if (l.kind === "spinner")
                return (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-2 ${skin.tone[l.tone ?? "muted"]}`}>
                    <motion.span
                      aria-hidden="true"
                      className="inline-block h-3 w-3 rounded-full border-[1.5px] border-current border-t-transparent"
                      animate={still ? undefined : { rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    {l.text}
                  </motion.div>
                );
              if (l.kind === "progress")
                return (
                  <div key={i} className={skin.tone[l.tone ?? "info"]}>
                    {l.label}
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-current/15">
                      <motion.div className="h-full rounded-full bg-current" initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, l.value))}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
                    </div>
                  </div>
                );
              return (
                <motion.div
                  key={i}
                  initial={still ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={LINE_IN}
                  className={`whitespace-pre-wrap break-words ${skin.tone[l.tone ?? "muted"]}`}
                >
                  {l.text}
                </motion.div>
              );
            })}
          </div>
          {showLive && (
            <div className="min-w-0 break-all" aria-hidden="true">
              {Prompt}
              <span>
                {tokenize(live).map((t, j) => (
                  <span key={j} className={skin.tok[t.tone]}>
                    {t.text}
                  </span>
                ))}
              </span>
              {showCursor && <Caret count={live.length} className={skin.caret} hollow={phase === "ready" && !focused} />}
            </div>
          )}
          {interactive && (
            <input
              ref={field}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                click("key", e.target.value.slice(-1) || " ");
              }}
              onKeyDown={(e) => {
                takeOver();
                onKey(e);
              }}
              onFocus={() => {
                setFocused(true);
                takeOver();
              }}
              onBlur={() => setFocused(false)}
              aria-label="Terminal command"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="absolute left-0 top-0 h-px w-px opacity-0"
            />
          )}
        </div>
      </div>
      {hint && <p className="mt-3 text-center text-[13px] text-[#86868b] dark:text-[#a1a1a6]">{hint}</p>}
    </motion.div>
  );
}
```

--- components/terminal.tsx ---

```tsx
/** Re-export shim: some bundlers resolve `@/components/terminal` to this file before the directory. */
export type { TerminalTheme, TerminalTone, TerminalLine, TerminalOutput, TerminalCommand, TerminalProps } from "./terminal/terminal";
export { Terminal } from "./terminal/terminal";
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
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

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
