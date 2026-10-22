"use client";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound, type SoundName } from "@/lib/ui-sounds";

const S = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const spring = { type: "spring", stiffness: 420, damping: 24 } as const;

export function MenuIcon({ on }: { on: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...S} aria-hidden="true">
      <motion.line x1="4" x2="20" y1="7" y2="7" animate={on ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} transition={spring} />
      <motion.line x1="4" x2="20" y1="12" y2="12" animate={{ opacity: on ? 0 : 1, scaleX: on ? 0 : 1 }} transition={{ duration: 0.15 }} />
      <motion.line x1="4" x2="20" y1="17" y2="17" animate={on ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} transition={spring} />
    </svg>
  );
}

export function PlayIcon({ on }: { on: boolean }) {
  const play = "M7 5 L12.5 8.4 L12.5 15.6 L7 19 Z M12.5 8.4 L18.5 12 L18.5 12 L12.5 15.6 Z";
  const pause = "M6.5 5 L10 5 L10 19 L6.5 19 Z M14 5 L17.5 5 L17.5 19 L14 19 Z";
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <motion.path initial={false} animate={{ d: on ? pause : play }} transition={{ type: "spring", stiffness: 300, damping: 26 }} />
    </svg>
  );
}

const COLORS = ["#ff375f", "#ff9f0a", "#ffd60a", "#30d158", "#0a84ff", "#bf5af2"];

/** Small seeded generator so each burst looks different but renders the same on server and client. */
function seeded(seed: number) {
  let t = seed * 2654435761;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function HeartIcon({ on, burst }: { on: boolean; burst: number }) {
  // A fresh burst every time, so no two likes look the same.
  const parts = useMemo(() => {
    if (!burst) return [];
    const rand = seeded(burst);
    const n = 9 + Math.floor(rand() * 5);
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rand() * 0.6;
      const d = 22 + rand() * 16;
      return { x: Math.cos(a) * d, y: Math.sin(a) * d, c: COLORS[Math.floor(rand() * COLORS.length)], s: 3 + rand() * 4, r: rand() > 0.5 };
    });
  }, [burst]);
  return (
    <span className="relative flex items-center justify-center">
      <AnimatePresence>
        {on &&
          parts.map((p, i) => (
            <motion.span
              key={`${burst}-${i}`}
              className="pointer-events-none absolute"
              style={{ width: p.s, height: p.s, background: p.c, borderRadius: p.r ? 999 : 1.5 }}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: p.x, y: p.y, scale: 0, opacity: 1, rotate: p.r ? 0 : 180 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
      </AnimatePresence>
      <motion.svg key={burst} width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" animate={on && burst ? { scale: [1, 0.7, 1.25, 1] } : { scale: 1 }} transition={{ duration: 0.45 }}>
        <motion.path
          d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={false}
          animate={{ fill: on ? "#ff375f" : "rgba(255,55,95,0)", stroke: on ? "#ff375f" : "currentColor" }}
          transition={{ duration: 0.2 }}
        />
      </motion.svg>
    </span>
  );
}

export function BellIcon({ on }: { on: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...S} aria-hidden="true">
      <motion.g style={{ originX: "50%", originY: "10%" }} animate={on ? { rotate: [0, -20, 16, -11, 7, -3, 0] } : { rotate: 0 }} transition={{ duration: 0.75 }}>
        <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
        <path d="M10 20.5a2 2 0 0 0 4 0" />
      </motion.g>
      <motion.path d="M3 3l18 18" initial={false} animate={{ pathLength: on ? 0 : 1, opacity: on ? 0 : 1 }} transition={{ duration: 0.3 }} />
      <motion.circle cx="18" cy="5.5" r="3" fill="#ff3b30" stroke="none" initial={false} animate={{ scale: on ? 1 : 0 }} transition={{ type: "spring", stiffness: 600, damping: 14, delay: on ? 0.2 : 0 }} />
    </svg>
  );
}

export function ThemeIcon({ on }: { on: boolean }) {
  const id = `theme-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...S} aria-hidden="true">
      <mask id={id}>
        <rect x="0" y="0" width="24" height="24" fill="white" stroke="none" />
        <motion.circle r="7" fill="black" stroke="none" initial={false} animate={on ? { cx: 17, cy: 7 } : { cx: 30, cy: -6 }} transition={spring} />
      </mask>
      <motion.circle cx="12" cy="12" fill="currentColor" stroke="none" mask={`url(#${id})`} initial={false} animate={{ r: on ? 8.5 : 4.5 }} transition={spring} />
      <motion.g style={{ originX: "50%", originY: "50%" }} initial={false} animate={{ rotate: on ? 90 : 0, scale: on ? 0 : 1, opacity: on ? 0 : 1 }} transition={spring}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${a} 12 12)`} />
        ))}
      </motion.g>
    </svg>
  );
}

export function BookmarkIcon({ on }: { on: boolean }) {
  const id = `save-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const d = "M6 4h12v17l-6-4-6 4z";
  return (
    <motion.svg width="26" height="26" viewBox="0 0 24 24" {...S} aria-hidden="true" animate={on ? { y: [0, -4, 0] } : { y: 0 }} transition={{ duration: 0.35 }}>
      <clipPath id={id}>
        <motion.rect x="0" width="24" height="24" initial={false} animate={{ y: on ? 0 : 24 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} />
      </clipPath>
      <path d={d} />
      <path d={d} fill="#0a84ff" stroke="#0a84ff" clipPath={`url(#${id})`} />
    </motion.svg>
  );
}

export function VolumeIcon({ on }: { on: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...S} aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <motion.path d="M15.5 9.2a4 4 0 0 1 0 5.6" initial={false} animate={{ pathLength: on ? 0 : 1, opacity: on ? 0 : 1 }} transition={{ duration: 0.2, delay: on ? 0.12 : 0 }} />
      <motion.path d="M18 6.8a7.5 7.5 0 0 1 0 10.4" initial={false} animate={{ pathLength: on ? 0 : 1, opacity: on ? 0 : 1 }} transition={{ duration: 0.2, delay: on ? 0 : 0.12 }} />
      <motion.path d="M16 9.5l5 5M21 9.5l-5 5" initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.25, delay: on ? 0.2 : 0 }} />
    </svg>
  );
}

export function LockIcon({ on }: { on: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...S} aria-hidden="true">
      <motion.path initial={false} animate={{ d: on ? "M8 11 V5.5 A4 4 0 0 1 16 5.5 V6.5" : "M8 11 V8 A4 4 0 0 1 16 8 V11" }} transition={{ type: "spring", stiffness: 380, damping: 18 }} />
      <motion.rect x="5" y="11" width="14" height="9.5" rx="2.5" initial={false} animate={{ fill: on ? "rgba(52,199,89,1)" : "rgba(52,199,89,0)", stroke: on ? "#34c759" : "currentColor" }} />
    </svg>
  );
}

type Key = "menu" | "play" | "like" | "bell" | "theme" | "save" | "mute" | "lock";
const LIST: { key: Key; label: [string, string] }[] = [
  { key: "menu", label: ["Menu", "Close"] },
  { key: "play", label: ["Play", "Pause"] },
  { key: "like", label: ["Like", "Liked"] },
  { key: "bell", label: ["Alerts off", "Alerts on"] },
  { key: "theme", label: ["Light", "Dark"] },
  { key: "save", label: ["Save", "Saved"] },
  { key: "mute", label: ["Sound", "Muted"] },
  { key: "lock", label: ["Locked", "Unlocked"] },
];

/** Which sound each icon plays when it turns on and when it turns off. */
const CUES: Record<Key, [on: [SoundName, number], off: [SoundName, number]]> = {
  menu: [["on", 1], ["off", 1]],
  play: [["tap", 1], ["tap", 0.8]],
  like: [["pop", 1], ["tick", 0.5]],
  bell: [["ping", 0.8], ["off", 0.8]],
  theme: [["off", 1], ["on", 1]],
  save: [["tick", 0.8], ["tick", 0.4]],
  mute: [["tick", 0.6], ["tick", 0.6]],
  lock: [["off", 1], ["on", 1]],
};

export function AnimatedIcons({ autoplay = false, enableSound = true }: {
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}) {
  const play = useSound(enableSound);
  const playRef = useRef(play);
  const [state, setState] = useState<Record<Key, boolean>>({ menu: false, play: false, like: false, bell: false, theme: false, save: false, mute: false, lock: false });
  const [burst, setBurst] = useState(0);
  const touched = useRef(false);

  const toggle = (k: Key) => {
    setState((s) => {
      if (k === "like" && !s.like) setBurst((b) => b + 1);
      return { ...s, [k]: !s[k] };
    });
  };

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    // The demo is the only thing toggling until a visitor touches it, so it can track each icon itself.
    const was: Partial<Record<Key, boolean>> = {};
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      const key = LIST[k++ % LIST.length].key;
      const wasOn = was[key] ?? false;
      was[key] = !wasOn;
      const [name, volume] = CUES[key][wasOn ? 1 : 0];
      playRef.current.auto(name, volume);
      toggle(key);
    }, 700);
    return () => clearInterval(t);
  }, [autoplay]);

  const icon = (k: Key): ReactNode => {
    const on = state[k];
    switch (k) {
      case "menu": return <MenuIcon on={on} />;
      case "play": return <PlayIcon on={on} />;
      case "like": return <HeartIcon on={on} burst={burst} />;
      case "bell": return <BellIcon on={on} />;
      case "theme": return <ThemeIcon on={on} />;
      case "save": return <BookmarkIcon on={on} />;
      case "mute": return <VolumeIcon on={on} />;
      case "lock": return <LockIcon on={on} />;
    }
  };

  return (
    <div className="grid grid-cols-4 gap-3" onPointerDown={() => (touched.current = true)}>
      {LIST.map(({ key, label }) => (
        <div key={key} className="flex flex-col items-center gap-2">
          <motion.button
            type="button"
            aria-pressed={state[key]}
            aria-label={label[0]}
            onClick={() => {
              const [name, volume] = CUES[key][state[key] ? 1 : 0];
              play(name, volume);
              toggle(key);
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.88 }}
            className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_8px_20px_-12px_rgba(0,0,0,.3)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
          >
            {icon(key)}
          </motion.button>
          <span className="relative h-4 w-[80px] overflow-hidden text-center text-[12px] text-[#86868b] dark:text-[#98989d]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={String(state[key])} className="absolute inset-x-0" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 32 }}>
                {label[state[key] ? 1 : 0]}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      ))}
    </div>
  );
}
