"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import * as React from "react";
import { usePhysicalKeyboard, type KeyDef as KbKeyDef, MacKeyboard, MAC_ROWS } from "@/components/keyboard";

const KB_CODE_TO_CHAR: Record<string, string> = Object.fromEntries(
  MAC_ROWS.flat()
    .filter((k) => k.char && k.char !== "\t" && k.char !== "\n")
    .map((k) => [k.code, k.char]),
);

export function PreviewKeyboardSilentDetail({
  compact = true,
}: { compact?: boolean } = {}) {
  const [text, setText] = React.useState("");
  const [showFn, setShowFn] = React.useState(!compact);
  const [virtualKeys, setVirtualKeys] = React.useState<string[]>([]);

  const physicalKeys = usePhysicalKeyboard();

  const activeKeys = React.useMemo(
    () => [...new Set([...physicalKeys, ...virtualKeys])],
    [physicalKeys, virtualKeys],
  );

  React.useEffect(() => {
    function onDown(e: KeyboardEvent) {
      if (e.metaKey && e.key !== "Meta") return;
      if (e.ctrlKey && e.key !== "Control") return;
      setText((prev) => {
        if (e.code === "Backspace") return prev.slice(0, -1);
        const ch = KB_CODE_TO_CHAR[e.code];
        return ch ? prev + ch : prev;
      });
    }
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, []);

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
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-foreground">
          Keyboard 2 — Without Sound
        </p>
        <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          No audio
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
        enableSound={false}
        activeKeys={activeKeys}
        showFunctionRow={showFn}
        theme="auto"
        onKeyPress={handleVirtualKey}
      />
    </div>
  );
}
