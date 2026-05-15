"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { KeyboardKey } from "./keyboard-key";
import { useKeyboardSound, type SoundType } from "./use-keyboard-sound";
import { MAC_ROWS, COMPACT_ROWS, CODE_ALIASES, type KeyDef } from "./keyboard-layout";

export interface KeyboardProps {
  layout?: "mac" | "compact";
  enableSound?: boolean;
  volume?: number;
  soundType?: SoundType;
  /** Keys currently held/highlighted — pass KeyboardEvent.code values */
  activeKeys?: string[];
  className?: string;
  keyClassName?: string;
  theme?: "dark" | "light" | "auto";
  showFunctionRow?: boolean;
  onKeyPress?: (key: KeyDef) => void;
}

export function MacKeyboard({
  layout = "mac",
  enableSound = true,
  volume = 0.6,
  soundType = "mechanical",
  activeKeys = [],
  className,
  keyClassName,
  theme = "auto",
  showFunctionRow = true,
  onKeyPress,
}: KeyboardProps) {
  const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">("dark");
  const activeSet = React.useMemo(() => new Set(activeKeys), [activeKeys]);
  const { play } = useKeyboardSound({ enabled: enableSound, volume, soundType });

  // Resolve "auto" theme against the document class
  React.useEffect(() => {
    if (theme !== "auto") { setResolvedTheme(theme); return; }
    const update = () =>
      setResolvedTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [theme]);

  const isDark = resolvedTheme === "dark";

  const rows = React.useMemo(() => {
    const base = layout === "compact" ? COMPACT_ROWS : MAC_ROWS;
    return showFunctionRow ? base : base.slice(layout === "mac" ? 1 : 0);
  }, [layout, showFunctionRow]);

  const handlePress = React.useCallback(
    (key: KeyDef) => {
      play(key.sound);
      onKeyPress?.(key);
    },
    [play, onKeyPress],
  );

  return (
    <div
      role="group"
      aria-label="Mac keyboard"
      className={cn(
        // body shape + material
        "w-full max-w-[780px] mx-auto select-none",
        "rounded-[14px] p-3",
        isDark
          ? "bg-gradient-to-b from-[#242428] to-[#1a1a1e] shadow-[0_12px_40px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "bg-gradient-to-b from-[#d8d8dc] to-[#c8c8cc] shadow-[0_12px_40px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.7)]",
        className,
      )}
    >
      <div className="flex flex-col gap-[5px]">
        {rows.map((row, rowIdx) => {
          const isFnRow = layout === "mac" && showFunctionRow && rowIdx === 0;
          return (
            <div
              key={rowIdx}
              className="flex gap-[4px]"
            >
              {row.map((keyDef) => (
                <React.Fragment key={keyDef.id}>
                  {/* Extra gap for function-key groups */}
                  {keyDef.groupGap && (
                    <div className={isFnRow ? "w-[10px] shrink-0" : undefined} />
                  )}
                  <KeyboardKey
                    keyDef={keyDef}
                    isActive={
                      activeSet.has(keyDef.code) ||
                      (keyDef.code === "MetaLeft"  && activeSet.has("OSLeft")) ||
                      (keyDef.code === "MetaRight" && activeSet.has("OSRight"))
                    }
                    isFnRow={isFnRow}
                    theme={resolvedTheme}
                    keyClassName={keyClassName}
                    onPress={handlePress}
                  />
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Hook: sync physical keyboard presses to activeKeys ──────────
export function usePhysicalKeyboard() {
  const [pressed, setPressed] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    function onDown(e: KeyboardEvent) {
      const code = CODE_ALIASES[e.code] ?? e.code;
      setPressed((p) => { const n = new Set(p); n.add(code); return n; });
    }
    function onUp(e: KeyboardEvent) {
      const code = CODE_ALIASES[e.code] ?? e.code;
      setPressed((p) => { const n = new Set(p); n.delete(code); return n; });
    }
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  return Array.from(pressed);
}
