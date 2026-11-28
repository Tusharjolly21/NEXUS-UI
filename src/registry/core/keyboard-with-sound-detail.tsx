"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import * as React from "react";
import { type SoundType, usePhysicalKeyboard, useKeyboardSound, type KeyDef as KbKeyDef, MacKeyboard, MAC_ROWS } from "@/components/keyboard";
import { cn } from "@/lib/utils";

const KB_CODE_TO_CHAR: Record<string, string> = Object.fromEntries(
  MAC_ROWS.flat()
    .filter((k) => k.char && k.char !== "\t" && k.char !== "\n")
    .map((k) => [k.code, k.char]),
);

const SOUND_OPTS: { v: SoundType; l: string }[] = [
  { v: "mechanical", l: "Mechanical" },
  { v: "clicky", l: "Clicky" },
  { v: "soft", l: "Soft" },
];

export function PreviewKeyboardWithSoundDetail({
  compact = true,
}: { compact?: boolean } = {}) {
  const [text, setText] = React.useState("");
  const [muted, setMuted] = React.useState(false);
  const [soundType, setSoundType] = React.useState<SoundType>("mechanical");
  const [showFn, setShowFn] = React.useState(!compact);
  const [virtualKeys, setVirtualKeys] = React.useState<string[]>([]);

  const physicalKeys = usePhysicalKeyboard();
  const { play } = useKeyboardSound({
    enabled: !muted,
    volume: 0.65,
    soundType,
  });

  const activeKeys = React.useMemo(
    () => [...new Set([...physicalKeys, ...virtualKeys])],
    [physicalKeys, virtualKeys],
  );

  React.useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (e.metaKey && e.key !== "Meta") return;
      if (e.ctrlKey && e.key !== "Control") return;
      const variant =
        e.code === "Space"
          ? "space"
          : e.code === "Enter"
            ? "enter"
            : e.code === "Backspace"
              ? "delete"
              : e.code.startsWith("Shift") ||
                  e.code.startsWith("Meta") ||
                  e.code.startsWith("Alt") ||
                  e.code.startsWith("Control") ||
                  e.code === "CapsLock" ||
                  e.code === "Tab"
                ? "modifier"
                : ("normal" as const);
      play(variant);
      setText((prev) => {
        if (e.code === "Backspace") return prev.slice(0, -1);
        const ch = KB_CODE_TO_CHAR[e.code];
        return ch ? prev + ch : prev;
      });
    }
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [play]);

  const handleVirtualKey = React.useCallback((key: KbKeyDef) => {
    setVirtualKeys((p) => [...p, key.code]);
    setTimeout(
      () => setVirtualKeys((p) => p.filter((c) => c !== key.code)),
      140,
    );
    setText((prev) => {
      if (key.code === "Backspace") return prev.slice(0, -1);
      if (key.char === "\n") return prev;
      if (key.char) return prev + key.char;
      return prev;
    });
  }, []);

  return (
    <div className="w-full space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-foreground">
          Keyboard 1 — With Mechanical Sound
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
            muted
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-primary/35 bg-primary/10 text-primary hover:bg-primary/15",
          )}
        >
          {muted ? "Muted" : "Sound on"}
        </button>
        <div className="flex gap-1">
          {SOUND_OPTS.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setSoundType(o.v)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                soundType === o.v
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border/70 bg-muted/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {o.l}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowFn((f) => !f)}
          className="rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          {showFn ? "Fn row on" : "Fn row off"}
        </button>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
        <p className="min-h-[2rem] break-all font-mono text-sm text-foreground">
          {text || (
            <span className="text-muted-foreground/50">
              Click keys or type…
            </span>
          )}
          <span className="ml-px inline-block h-[1em] w-[2px] animate-pulse bg-primary align-middle" />
        </p>
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            className="mt-1 text-[11px] text-muted-foreground hover:text-destructive"
          >
            Clear
          </button>
        )}
      </div>

      <MacKeyboard
        layout="mac"
        enableSound={!muted}
        volume={0.65}
        soundType={soundType}
        activeKeys={activeKeys}
        showFunctionRow={showFn}
        theme="auto"
        onKeyPress={handleVirtualKey}
      />
    </div>
  );
}
