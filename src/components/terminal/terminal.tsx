"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";
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
  /** Plays a key click while typing. Synthesised unless you pass a sprite. */
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
  enableSound = false,
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
  const [soundOn, setSoundOn] = React.useState(enableSound);
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
      try {
        sfx.tick(kind === "enter" ? { kind: "enter" } : { kind: "key", ch });
      } catch {
        /* audio is optional */
      }
    },
    [sfx, still],
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
        if (soundRef.current) await sfx.ensureLoaded().catch(() => {});
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
                  void sfx.resume().catch(() => {});
                  setSoundOn((v) => !v);
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
