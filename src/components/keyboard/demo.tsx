"use client";

import * as React from "react";
import { Volume2, VolumeX, Keyboard as KeyboardIcon } from "lucide-react";
import { MacKeyboard, usePhysicalKeyboard } from "./keyboard";
import { useKeyboardSound, type SoundType } from "./use-keyboard-sound";
import { MAC_ROWS } from "./keyboard-layout";
import type { KeyDef } from "./keyboard-layout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const SOUND_OPTIONS: { value: SoundType; label: string; desc: string }[] = [
  { value: "mechanical", label: "Mechanical", desc: "Two-stage click + thud"  },
  { value: "clicky",     label: "Clicky",     desc: "Sharp crisp snap"         },
  { value: "soft",       label: "Soft",       desc: "Quiet scissor-switch"     },
];

const CODE_TO_CHAR: Record<string, string> = Object.fromEntries(
  MAC_ROWS.flat()
    .filter((k) => k.char && k.char !== "\t" && k.char !== "\n")
    .map((k) => [k.code, k.char]),
);

// ── Shared text-output box ───────────────────────────────────────
function TextOutput({ text, onClear }: { text: string; onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 dark:bg-white/[0.025]">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Output
      </p>
      <div className="flex min-h-[44px] items-center">
        <p className="break-all font-mono text-base text-foreground">
          {text || (
            <span className="text-muted-foreground/50">
              Click keys or type to begin…
            </span>
          )}
          <span className="ml-px inline-block h-[1.1em] w-[2px] animate-pulse bg-primary align-middle" />
        </p>
      </div>
      {text && (
        <button
          type="button"
          onClick={onClear}
          className="mt-2 text-[11px] text-muted-foreground transition hover:text-destructive"
        >
          Clear
        </button>
      )}
    </div>
  );
}

// ── Code block ──────────────────────────────────────────────────
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <div className="relative rounded-2xl border border-border/70 bg-muted/30 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Code
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Section 1: Keyboard with mechanical sound ────────────────────
function KeyboardWithSound() {
  const [text,        setText]        = React.useState("");
  const [muted,       setMuted]       = React.useState(false);
  const [volume,      setVolume]      = React.useState(0.65);
  const [soundType,   setSoundType]   = React.useState<SoundType>("mechanical");
  const [showFn,      setShowFn]      = React.useState(true);
  const [virtualKeys, setVirtualKeys] = React.useState<string[]>([]);

  const physicalKeys = usePhysicalKeyboard();
  const { play }     = useKeyboardSound({ enabled: !muted, volume, soundType });

  const activeKeys = React.useMemo(
    () => [...new Set([...physicalKeys, ...virtualKeys])],
    [physicalKeys, virtualKeys],
  );

  // Physical key → sound + text
  React.useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (e.metaKey && e.key !== "Meta") return;
      if (e.ctrlKey  && e.key !== "Control") return;
      const variant =
        e.code === "Space"     ? "space"   :
        e.code === "Enter"     ? "enter"   :
        e.code === "Backspace" ? "delete"  :
        e.code.startsWith("Shift") || e.code.startsWith("Meta") ||
        e.code.startsWith("Alt")   || e.code.startsWith("Control") ||
        e.code === "CapsLock"      || e.code === "Tab" ? "modifier"
        : "normal" as const;
      play(variant);

      setText((prev) => {
        if (e.code === "Backspace") return prev.slice(0, -1);
        const ch = CODE_TO_CHAR[e.code];
        return ch ? prev + ch : prev;
      });
    }
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [play]);

  const handleVirtualKey = React.useCallback((key: KeyDef) => {
    const flash = (code: string) => {
      setVirtualKeys((p) => [...p, code]);
      setTimeout(() => setVirtualKeys((p) => p.filter((c) => c !== code)), 140);
    };
    flash(key.code);
    setText((prev) => {
      if (key.code === "Backspace") return prev.slice(0, -1);
      if (key.char === "\n")        return prev;
      if (key.char)                 return prev + key.char;
      return prev;
    });
  }, []);

  const code = `"use client";
import { MacKeyboard, usePhysicalKeyboard } from "@/components/keyboard";

export function KeyboardWithSound() {
  const active = usePhysicalKeyboard();

  return (
    <MacKeyboard
      layout="mac"
      theme="auto"
      enableSound={true}
      soundType="mechanical"
      volume={0.65}
      activeKeys={active}
      showFunctionRow={true}
    />
  );
}`;

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          With Mechanical Sound
        </h2>
        <p className="text-sm text-muted-foreground">
          Two-stage synthesis — a high-frequency click on actuation followed by
          a low-frequency thud on bottom-out, with a pitched case resonance.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-muted/30 px-5 py-4 dark:bg-white/[0.03]">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
            muted
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-primary/35 bg-primary/10 text-primary hover:bg-primary/15",
          )}
        >
          {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
          {muted ? "Muted" : "Sound on"}
        </button>

        <div className="flex gap-1">
          {SOUND_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              title={o.desc}
              onClick={() => setSoundType(o.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                soundType === o.value
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border/70 bg-muted/40 text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Volume2 className="size-3.5 shrink-0" />
          <input
            type="range"
            min={0} max={1} step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
          <span className="w-8 font-mono text-[11px]">{Math.round(volume * 100)}%</span>
        </label>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={showFn} onCheckedChange={setShowFn} id="fn1" className="h-4 w-7" />
          <Label htmlFor="fn1" className="cursor-pointer text-xs">Fn row</Label>
        </label>
      </div>

      <TextOutput text={text} onClear={() => setText("")} />

      <MacKeyboard
        layout="mac"
        enableSound={!muted}
        volume={volume}
        soundType={soundType}
        activeKeys={activeKeys}
        showFunctionRow={showFn}
        theme="auto"
        onKeyPress={handleVirtualKey}
      />

      <CodeBlock code={code} />
    </section>
  );
}

// ── Section 2: Keyboard without sound ────────────────────────────
function KeyboardSilent() {
  const [text,        setText]        = React.useState("");
  const [showFn,      setShowFn]      = React.useState(true);
  const [virtualKeys, setVirtualKeys] = React.useState<string[]>([]);

  const physicalKeys = usePhysicalKeyboard();

  const activeKeys = React.useMemo(
    () => [...new Set([...physicalKeys, ...virtualKeys])],
    [physicalKeys, virtualKeys],
  );

  // Physical key → text only (no sound)
  React.useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (e.metaKey && e.key !== "Meta") return;
      if (e.ctrlKey  && e.key !== "Control") return;
      setText((prev) => {
        if (e.code === "Backspace") return prev.slice(0, -1);
        const ch = CODE_TO_CHAR[e.code];
        return ch ? prev + ch : prev;
      });
    }
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, []);

  const handleVirtualKey = React.useCallback((key: KeyDef) => {
    const flash = (code: string) => {
      setVirtualKeys((p) => [...p, code]);
      setTimeout(() => setVirtualKeys((p) => p.filter((c) => c !== code)), 140);
    };
    flash(key.code);
    setText((prev) => {
      if (key.code === "Backspace") return prev.slice(0, -1);
      if (key.char === "\n")        return prev;
      if (key.char)                 return prev + key.char;
      return prev;
    });
  }, []);

  const code = `"use client";
import { MacKeyboard, usePhysicalKeyboard } from "@/components/keyboard";

export function KeyboardSilent() {
  const active = usePhysicalKeyboard();

  return (
    <MacKeyboard
      layout="mac"
      theme="auto"
      enableSound={false}
      activeKeys={active}
      showFunctionRow={true}
    />
  );
}`;

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Without Sound
        </h2>
        <p className="text-sm text-muted-foreground">
          Purely visual — all animations and key-press highlighting active,
          Web Audio disabled. Useful for display or game-key overlays.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 px-5 py-4 dark:bg-white/[0.03]">
        <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <VolumeX className="size-3.5" />
          No audio
        </span>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={showFn} onCheckedChange={setShowFn} id="fn2" className="h-4 w-7" />
          <Label htmlFor="fn2" className="cursor-pointer text-xs">Fn row</Label>
        </label>
      </div>

      <TextOutput text={text} onClear={() => setText("")} />

      <MacKeyboard
        layout="mac"
        enableSound={false}
        activeKeys={activeKeys}
        showFunctionRow={showFn}
        theme="auto"
        onKeyPress={handleVirtualKey}
      />

      <CodeBlock code={code} />
    </section>
  );
}

// ── Root demo ─────────────────────────────────────────────────────
export function KeyboardDemo() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 px-4 py-14">
      {/* Header */}
      <header className="mx-auto max-w-2xl space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold text-primary ">
          <KeyboardIcon className="size-3.5" />
          Interactive component
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Mac Keyboard
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Click keys or type on your physical keyboard. Spring animations,
          real-time key highlighting, and optional Web Audio synthesis.
        </p>
      </header>

      <div className="h-px bg-border/50" />

      <KeyboardWithSound />

      <div className="h-px bg-border/50" />

      <KeyboardSilent />

      {/* Props table */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Props</h2>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-border/70 bg-muted/30">
              <tr>
                {["Prop", "Type", "Default", "Description"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {[
                ["layout",          '"mac" | "compact"',                '"mac"',        "Full or compact (no fn row) layout"],
                ["theme",           '"dark" | "light" | "auto"',        '"auto"',       "Visual theme; auto follows the document class"],
                ["enableSound",     "boolean",                          "true",         "Enable / disable the synthesised click sounds"],
                ["soundType",       '"mechanical" | "soft" | "clicky"', '"mechanical"', "Timbre of the key sound"],
                ["volume",          "number 0–1",                       "0.6",          "Master volume"],
                ["showFunctionRow", "boolean",                          "true",         "Show/hide the Esc + F1–F12 row"],
                ["activeKeys",      "string[]",                         "[]",           "KeyboardEvent.code values to highlight"],
                ["onKeyPress",      "(key: KeyDef) => void",            "—",            "Callback when a virtual key is clicked"],
                ["className",       "string",                           "—",            "Classes on the keyboard body"],
                ["keyClassName",    "string",                           "—",            "Classes applied to every keycap"],
              ].map(([p, t, d, desc]) => (
                <tr key={p} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono text-[12px] text-foreground">{p}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-primary/80">{t}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{d}</td>
                  <td className="px-4 py-2.5 text-[12px] text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
