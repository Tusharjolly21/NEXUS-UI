"use client";
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface CapsuleToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  /** Accessible name of the switch. */
  label: string;
  /** Ball colour when off. Defaults to a grey that adapts to dark mode. */
  offColor?: string;
  /** Ball colour (and glow) when on. */
  onColor?: string;
}

/**
 * A ball sealed in a glass capsule. Flip it and the ball rolls to the other
 * end, stretching into a pill mid-flight and changing colour as it lands.
 */
export function CapsuleToggle({ checked, onChange, label, offColor, onColor = "#34c759" }: CapsuleToggleProps) {
  const [prev, setPrev] = useState(checked);
  const [flying, setFlying] = useState(false);
  // stretch into a pill whenever `checked` changes, however it changed
  if (prev !== checked) {
    setPrev(checked);
    setFlying(true);
  }
  useEffect(() => {
    if (!flying) return;
    const t = setTimeout(() => setFlying(false), 260);
    return () => clearTimeout(t);
  }, [flying, checked]);

  const spring = { type: "spring", stiffness: 520, damping: 30 } as const;
  const tint = { duration: 0.35, delay: 0.08 };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-[38px] w-[74px] flex-none rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,.65),rgba(235,235,240,.5))] shadow-[inset_0_1px_1px_rgba(255,255,255,.9),inset_0_-2px_4px_rgba(0,0,0,.06),inset_0_0_0_1px_rgba(0,0,0,.08),0_6px_14px_-8px_rgba(0,0,0,.25)] outline-none [--ct-off:#c7c7cc] focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.04))] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,.14),inset_0_-2px_4px_rgba(0,0,0,.3),inset_0_0_0_1px_rgba(255,255,255,.1),0_6px_14px_-8px_rgba(0,0,0,.7)] dark:[--ct-off:#636366] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
    >
      <motion.span
        className="absolute top-[5px] h-[28px] overflow-hidden rounded-full"
        style={{ backgroundColor: offColor ?? "var(--ct-off)" }}
        initial={false}
        animate={{
          left: checked ? 41 : 5,
          width: flying ? 44 : 28,
          x: flying ? (checked ? -16 : 0) : 0,
          boxShadow: checked ? `0 0 14px 2px ${onColor}88, inset 0 1px 2px rgba(255,255,255,.7)` : "0 0 0 0 rgba(0,0,0,0), inset 0 1px 2px rgba(255,255,255,.7)",
        }}
        transition={spring}
      >
        {/* the on colour washes over the off colour as the ball lands */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,.7)]"
          style={{ backgroundColor: onColor }}
          initial={false}
          animate={{ opacity: checked ? 1 : 0 }}
          transition={tint}
        />
      </motion.span>
      {/* glass highlight sits above the ball */}
      <span className="pointer-events-none absolute inset-x-2 top-[3px] h-[11px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,.85),rgba(255,255,255,0))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0))]" />
    </button>
  );
}

export interface CapsuleToggleRow {
  id: string;
  label: string;
  /** Shown under the label while the row is on. */
  hint: string;
  /** The row's colour: the ball and the status dot take it on. */
  color: string;
  /** Initial state. */
  on: boolean;
}

export interface CapsuleTogglesProps {
  rows?: CapsuleToggleRow[];
  /** Small heading above the list. */
  title?: string;
  /** Flips the rows one after another until the user touches the panel. */
  autoplay?: boolean;
}

const ROWS: CapsuleToggleRow[] = [
  { id: "wifi", label: "Wi-Fi", hint: "Home network", color: "#0a84ff", on: true },
  { id: "bt", label: "Bluetooth", hint: "2 devices", color: "#5e5ce6", on: false },
  { id: "focus", label: "Focus", hint: "Until 6 PM", color: "#bf5af2", on: true },
  { id: "low", label: "Low Power", hint: "Battery saver", color: "#ff9f0a", on: false },
];

/** A settings panel of capsule toggles, each row lighting up in its own colour. */
export function CapsuleToggles({ rows = ROWS, title = "Controls", autoplay = false }: CapsuleTogglesProps) {
  const id = useId().replace(/:/g, "");
  const [state, setState] = useState(() => Object.fromEntries(rows.map((r) => [r.id, r.on])) as Record<string, boolean>);
  const touched = useRef(false);
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      const list = rowsRef.current;
      if (list.length === 0) return;
      const r = list[k++ % list.length];
      setState((s) => ({ ...s, [r.id]: !s[r.id] }));
    }, 900);
    return () => clearInterval(t);
  }, [autoplay]);

  return (
    <div
      className="w-[320px] overflow-hidden rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]"
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
      role="group"
      aria-labelledby={`${id}-h`}
    >
      <h3 id={`${id}-h`} className="m-0 px-5 pb-1 pt-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#86868b] dark:text-[#8e8e93]">
        {title}
      </h3>
      <ul className="m-0 list-none divide-y divide-[#f0f0f3] p-0 dark:divide-[#2c2c2e]">
        {rows.map((r) => {
          const on = !!state[r.id];
          return (
            <li key={r.id} className="flex items-center gap-3 px-5 py-3">
              <motion.span
                className="relative h-2.5 w-2.5 overflow-hidden rounded-full bg-[#d2d2d7] dark:bg-[#48484a]"
                animate={{ scale: on ? [1, 1.5, 1] : 1 }}
                transition={{ duration: 0.35 }}
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: r.color }}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={{ duration: 0.35 }}
                />
              </motion.span>
              <span className="flex flex-1 flex-col">
                <span className="text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{r.label}</span>
                <span className="text-[12px] text-[#86868b] dark:text-[#8e8e93]">{on ? r.hint : "Off"}</span>
              </span>
              <CapsuleToggle label={r.label} checked={on} onColor={r.color} onChange={(v) => setState((s) => ({ ...s, [r.id]: v }))} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
