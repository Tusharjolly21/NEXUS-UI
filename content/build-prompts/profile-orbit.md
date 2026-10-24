Add the "Profile Orbit" component from Nexus UI to my project.

A profile card with the whole team orbiting it on a tilted ring. Dragging the ring, using the arrows or tapping a face spins that person round to the front, the card slides over to them and their avatar drops in with a bounce, while people at the back of the ring pass under the card.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ProfileOrbit } from "@/components/profile-orbit";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/profile-orbit/index.ts ---

```ts
export { ProfileOrbit, default } from "./profile-orbit";
export type { ProfileOrbitProps, ProfilePerson } from "./profile-orbit";
```

--- components/profile-orbit/profile-orbit.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type ProfilePerson = {
  /** Stable key; also picks the avatar colour when there is no photo. */
  seed: number;
  name: string;
  role: string;
  email: string;
  /** Optional photo URL. Without it a coloured monogram is drawn. */
  avatar?: string;
};

export interface ProfileOrbitProps {
  people?: ProfilePerson[];
  /** Time between autoplay steps, in ms. */
  autoRotateInterval?: number;
  /** Called with the person whose Connect button is pressed, and whether they are now connected. */
  onConnect?: (person: ProfilePerson, connected: boolean) => void;
  /** Called with the index of the person in the card. */
  onChange?: (index: number) => void;
  /** Hint under the orbit. Empty string hides it. */
  hint?: string;
  /** Turns the ring to the next person until someone touches it. */
  autoplay?: boolean;
  className?: string;
}

const DEFAULT_PEOPLE: ProfilePerson[] = [
  { seed: 10, name: "Jordan Lee", role: "Head of Product", email: "jordan@example.com" },
  { seed: 20, name: "Alex Chen", role: "Lead Designer", email: "alex@example.com" },
  { seed: 30, name: "Maya Patel", role: "Engineering Lead", email: "maya@example.com" },
  { seed: 40, name: "Sam Rivera", role: "Marketing Director", email: "sam@example.com" },
  { seed: 50, name: "Chris Morgan", role: "Head of Sales", email: "chris@example.com" },
  { seed: 60, name: "Noa Berg", role: "Research Lead", email: "noa@example.com" },
];

const PALETTES = [
  ["#64d2ff", "#0a84ff"],
  ["#ffb3e6", "#bf5af2"],
  ["#ffd60a", "#ff9f0a"],
  ["#7ee3a1", "#30b65a"],
  ["#ff9fb0", "#ff375f"],
  ["#b4b2ff", "#5e5ce6"],
];
const RX = 228;
const RY = 126;
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const wrap = (o: number, n: number) => ((((o + n / 2) % n) + n) % n) - n / 2;
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

function Avatar({ p, size, ring }: { p: ProfilePerson; size: number; ring?: boolean }) {
  const [a, b] = PALETTES[Math.abs(Math.round(p.seed / 10)) % PALETTES.length];
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold text-white ${ring ? "shadow-[0_0_0_3px_#fff,0_8px_18px_-8px_rgba(0,0,0,.45)] dark:shadow-[0_0_0_3px_#1c1c1e,0_8px_18px_-8px_rgba(0,0,0,.9)]" : ""}`}
      style={{ width: size, height: size, background: `linear-gradient(140deg, ${a}, ${b})`, fontSize: size * 0.36, letterSpacing: "-0.02em" }}
    >
      {p.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.avatar} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      ) : (
        initials(p.name)
      )}
    </span>
  );
}

function Satellite({ p, index, n, rot, onPick }: { p: ProfilePerson; index: number; n: number; rot: MotionValue<number>; onPick: () => void }) {
  const off = useTransform(rot, (r) => wrap(index - r, n));
  // Front of the ring is straight down (90deg); people further round sit higher and further back.
  const ang = useTransform(off, (o) => ((90 + (o * 360) / n) * Math.PI) / 180);
  const x = useTransform(ang, (a) => r3(Math.cos(a) * RX));
  const y = useTransform(ang, (a) => r3(Math.sin(a) * RY));
  const depth = useTransform(ang, (a) => Math.sin(a));
  const scale = useTransform(depth, (d) => r3(0.62 + ((d + 1) / 2) * 0.42));
  const opacity = useTransform(depth, (d) => r3(0.55 + ((d + 1) / 2) * 0.45));
  const zIndex = useTransform(depth, (d) => (d > 0.05 ? 30 : 5));
  const ring = useTransform(off, (o) => r3(Math.max(0, 1 - Math.abs(o) * 2)));
  return (
    <motion.div className="absolute left-1/2 top-1/2" style={{ x, y, scale, opacity, zIndex, marginLeft: -26, marginTop: -26 }}>
      <motion.button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onPick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="relative block rounded-full"
      >
        <Avatar p={p} size={52} ring />
        <motion.span className="pointer-events-none absolute -inset-[5px] rounded-full border-2 border-[#0071e3] dark:border-[#0a84ff]" style={{ opacity: ring }} />
      </motion.button>
    </motion.div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/**
 * A profile card with the whole team orbiting it on a tilted ring. Turn the
 * ring (drag, arrows, or tap a face) and it spins the chosen person round to
 * the front, the card swaps to them and their avatar drops in with a little
 * bounce. People behind the ring pass under the card.
 */
export function ProfileOrbit({
  people = DEFAULT_PEOPLE,
  autoRotateInterval = 2800,
  onConnect,
  onChange,
  hint = "Drag the ring or tap a face.",
  autoplay = false,
  className = "",
}: ProfileOrbitProps) {
  const n = Math.max(1, people.length);
  const still = useReducedMotion() === true;
  const rot = useMotionValue(0);
  const run = useRef<AnimationPlaybackControls | undefined>(undefined);
  const touched = useRef(false);
  const from = useRef(0);
  const shown = useRef(0);
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [connected, setConnected] = useState<Record<number, boolean>>({});

  useMotionValueEvent(rot, "change", (r) => {
    const i = ((Math.round(r) % n) + n) % n;
    if (i === shown.current) return;
    setDir(wrap(i - shown.current, n) >= 0 ? 1 : -1);
    shown.current = i;
    setActive(i);
    onChange?.(i);
  });

  const spin = (target: number, velocity = 0) => {
    run.current?.stop();
    run.current = animate(rot, target, still ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 15, velocity });
  };
  const goTo = (i: number) => {
    const r = rot.get();
    spin(Math.round(r + wrap(i - r, n)));
  };
  const step = (d: number) => spin(Math.round(rot.get()) + d);

  useEffect(() => () => run.current?.stop(), []);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      run.current?.stop();
      run.current = animate(rot, Math.round(rot.get()) + 1, { type: "spring", stiffness: 90, damping: 14 });
    }, Math.max(1200, autoRotateInterval));
    return () => clearInterval(t);
  }, [autoplay, autoRotateInterval, rot]);

  const onKey = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else return;
    e.preventDefault();
    touched.current = true;
  };

  const person = people[active];
  const isOn = person ? connected[person.seed] === true : false;

  return (
    <div className={`flex w-full max-w-full flex-col items-center gap-2 overflow-hidden ${className}`}>
      <motion.div
        role="region"
        aria-roledescription="carousel"
        aria-label="Team"
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={() => {
          touched.current = true;
          run.current?.stop();
        }}
        onPanStart={() => {
          from.current = rot.get();
        }}
        onPan={(_, info) => rot.set(from.current - info.offset.x / 90)}
        onPanEnd={(_, info) => {
          run.current = animate(rot, [rot.get()], {
            type: "inertia",
            velocity: -info.velocity.x / 90,
            power: 0.25,
            timeConstant: 220,
            modifyTarget: (v) => Math.round(Math.max(rot.get() - 3, Math.min(rot.get() + 3, v))),
          });
        }}
        className="relative h-[330px] w-full max-w-[560px] touch-pan-y select-none rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
      >
        <svg className="pointer-events-none absolute left-1/2 top-1/2 overflow-visible" width="1" height="1" aria-hidden="true">
          <ellipse cx="0" cy="0" rx={RX} ry={RY} fill="none" strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" className="stroke-[#d2d2d7] dark:stroke-[#3a3a3c]" />
        </svg>

        {people.map((p, i) => (
          <Satellite
            key={p.seed}
            p={p}
            index={i}
            n={n}
            rot={rot}
            onPick={() => {
              touched.current = true;
              goTo(i);
            }}
          />
        ))}

        <span className="sr-only" aria-live="polite">
          {person ? `${person.name}, ${person.role}` : ""}
        </span>
        <div className="absolute left-1/2 top-1/2 z-20 w-[248px] max-w-[calc(100%-32px)]" style={{ transform: "translate(-50%, -50%)" }}>
          <div className="overflow-hidden rounded-[24px] bg-white px-4 pb-4 pt-5 text-center text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-26px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_48px_-26px_rgba(0,0,0,.9)]">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              {person ? (
                <motion.div
                  key={person.seed}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ x: d * 36, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (d: number) => ({ x: d * -36, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                >
                  <motion.div
                    className="mx-auto w-fit"
                    initial={still ? false : { scale: 0.55, y: 18 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 14, delay: still ? 0 : 0.06 }}
                  >
                    <Avatar p={person} size={56} />
                  </motion.div>
                  <p className="mt-2.5 truncate text-[17px] font-semibold leading-tight tracking-[-0.02em]">{person.name}</p>
                  <p className="mt-0.5 truncate text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{person.role}</p>
                  <p className="truncate text-[12px] text-[#86868b] dark:text-[#98989d]">{person.email}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
            <div className="mt-3 flex items-center gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  touched.current = true;
                  step(-1);
                }}
                aria-label="Previous person"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f0f0f3] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]"
              >
                <Chevron dir="left" />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                aria-pressed={isOn}
                onClick={() => {
                  if (!person) return;
                  touched.current = true;
                  setConnected((c) => ({ ...c, [person.seed]: !isOn }));
                  onConnect?.(person, !isOn);
                }}
                className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e] ${isOn ? "bg-[#f0f0f3] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]" : "bg-[#0071e3] text-white dark:bg-[#0a84ff]"}`}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={isOn ? "on" : "off"}
                    className="inline-flex items-center gap-1.5"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {isOn ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    ) : null}
                    {isOn ? "Connected" : "Connect"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  touched.current = true;
                  step(1);
                }}
                aria-label="Next person"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f0f0f3] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]"
              >
                <Chevron dir="right" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      {hint ? <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</span> : null}
    </div>
  );
}

export default ProfileOrbit;
```
