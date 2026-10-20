"use client";
import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface CapsuleToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  offColor?: string;
  onColor?: string;
}

/**
 * A ball sealed in a glass capsule. Flip it and the ball rolls to the other
 * end, stretching into a pill mid-flight and changing colour as it lands.
 */
export function CapsuleToggle({ checked, onChange, label, offColor = "#c7c7cc", onColor = "#34c759" }: CapsuleToggleProps) {
  const [flying, setFlying] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setFlying(true);
    const t = setTimeout(() => setFlying(false), 260);
    return () => clearTimeout(t);
  }, [checked]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-[38px] w-[74px] flex-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,.65), rgba(235,235,240,.5))",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,.9), inset 0 -2px 4px rgba(0,0,0,.06), inset 0 0 0 1px rgba(0,0,0,.08), 0 6px 14px -8px rgba(0,0,0,.25)",
      }}
    >
      <motion.span
        className="absolute top-[5px] h-[28px] rounded-full"
        initial={false}
        animate={{
          left: checked ? 41 : 5,
          width: flying ? 44 : 28,
          x: flying ? (checked ? -16 : 0) : 0,
          backgroundColor: checked ? onColor : offColor,
          boxShadow: checked ? `0 0 14px 2px ${onColor}88, inset 0 1px 2px rgba(255,255,255,.7)` : "0 0 0 0 rgba(0,0,0,0), inset 0 1px 2px rgba(255,255,255,.7)",
        }}
        transition={{ type: "spring", stiffness: 520, damping: 30, backgroundColor: { duration: 0.35, delay: 0.08 } }}
      />
      {/* glass highlight sits above the ball */}
      <span className="pointer-events-none absolute inset-x-2 top-[3px] h-[11px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,.85),rgba(255,255,255,0))]" />
    </button>
  );
}

const ROWS = [
  { id: "wifi", label: "Wi-Fi", hint: "Home network", color: "#0a84ff", on: true },
  { id: "bt", label: "Bluetooth", hint: "2 devices", color: "#5e5ce6", on: false },
  { id: "focus", label: "Focus", hint: "Until 6 PM", color: "#bf5af2", on: true },
  { id: "low", label: "Low Power", hint: "Battery saver", color: "#ff9f0a", on: false },
];

export default function CapsuleToggleDemo({ autoplay = false }: { autoplay?: boolean }) {
  const id = useId();
  const [state, setState] = useState(() => Object.fromEntries(ROWS.map((r) => [r.id, r.on])) as Record<string, boolean>);
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      const r = ROWS[k++ % ROWS.length];
      setState((s) => ({ ...s, [r.id]: !s[r.id] }));
    }, 900);
    return () => clearInterval(t);
  }, [autoplay]);

  return (
    <div className="w-[320px] overflow-hidden rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]" onPointerDown={() => (touched.current = true)} aria-labelledby={`${id}-h`}>
      <h3 id={`${id}-h`} className="m-0 px-5 pb-1 pt-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#86868b]">Controls</h3>
      <ul className="m-0 list-none divide-y divide-[#f0f0f3] p-0">
        {ROWS.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-5 py-3">
            <motion.span className="h-2.5 w-2.5 rounded-full" animate={{ backgroundColor: state[r.id] ? r.color : "#d2d2d7", scale: state[r.id] ? [1, 1.5, 1] : 1 }} transition={{ duration: 0.35 }} />
            <span className="flex flex-1 flex-col">
              <span className="text-[15px] font-medium text-[#1d1d1f]">{r.label}</span>
              <span className="text-[12px] text-[#86868b]">{state[r.id] ? r.hint : "Off"}</span>
            </span>
            <CapsuleToggle label={r.label} checked={state[r.id]} onColor={r.color} onChange={(v) => setState((s) => ({ ...s, [r.id]: v }))} />
          </li>
        ))}
      </ul>
    </div>
  );
}
