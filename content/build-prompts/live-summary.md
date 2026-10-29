# Live Summary

Add the "Live Summary" component from Nexus UI to my project.

A booking form that writes its own receipt. Every choice sends a line across to the summary, flying from the control you touched; change a number and only the digits that change roll. Press Reserve and the receipt folds itself into the confirmation.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { LiveSummary } from "@/components/live-summary";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/live-summary/index.ts ---

```ts
import type { ComponentProps } from "react";
import { LiveSummary } from "./live-summary";

export { LiveSummary };
export type LiveSummaryProps = ComponentProps<typeof LiveSummary>;
```

--- components/live-summary/live-summary.tsx ---

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject, type CSSProperties } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";

interface Room { id: string; name: string; note: string; price: number; tone: [string, string] }
const ROOMS: Room[] = [
  { id: "garden", name: "Garden room", note: "Queen bed, opens onto the lawn", price: 180, tone: ["#5fd97a", "#28b14c"] },
  { id: "loft", name: "Loft", note: "King bed under the eaves", price: 220, tone: ["#ffb648", "#f58a07"] },
  { id: "lake", name: "Lake suite", note: "King bed, balcony on the water", price: 260, tone: ["#4aa3ff", "#0a6fe0"] },
];
const BREAKFAST = 24; // per guest per night
const LATE = 40;
const TAX = 0.12;
const SPRING = { type: "spring", stiffness: 480, damping: 36 } as const;
const FLY = { type: "spring", stiffness: 240, damping: 28 } as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
type Src = "room" | "nights" | "guests" | "breakfast" | "late";

/**
 * LiveSummary: a booking form that writes its own receipt as you go. Every choice you make sends a line across to the
 * summary beside it, flying from the control you touched; change a number and only the digits that change roll. The
 * total is always the real total. Press Reserve and the receipt folds itself up into the confirmation.
 *
 * `onReserve` receives the booking. `autoplay` books a stay on its own until the first real interaction.
 */
export function LiveSummary({ autoplay = false, onReserve }: { autoplay?: boolean; onReserve?: (b: { room: string; nights: number; guests: number; breakfast: boolean; late: boolean; total: number }) => void }) {
  const reduce = useReducedMotion();
  const [room, setRoom] = useState<string | null>(null);
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [breakfast, setBreakfast] = useState(false);
  const [late, setLate] = useState(false);
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const src = useRef<Partial<Record<Src, HTMLElement | null>>>({});
  const touched = useRef(false);

  const r = ROOMS.find((x) => x.id === room);
  const lines: { key: string; from: Src; label: string; detail: string; amount: number }[] = [];
  if (r) lines.push({ key: "room", from: "room", label: r.name, detail: `${nights} ${nights === 1 ? "night" : "nights"} at $${r.price}`, amount: r.price * nights });
  if (r && breakfast) lines.push({ key: "breakfast", from: "breakfast", label: "Breakfast", detail: `${guests} ${guests === 1 ? "guest" : "guests"}, ${nights} ${nights === 1 ? "morning" : "mornings"}`, amount: BREAKFAST * guests * nights });
  if (r && late) lines.push({ key: "late", from: "late", label: "Late checkout", detail: "Until 2pm", amount: LATE });
  const sub = lines.reduce((s, l) => s + l.amount, 0);
  const tax = Math.round(sub * TAX);
  const total = sub + tax;

  const reserve = async () => {
    if (!r) return;
    setDone(true);
    onReserve?.({ room: r.name, nights, guests, breakfast, late, total });
  };
  const reset = () => { setDone(false); setRoom(null); setNights(2); setGuests(2); setBreakfast(false); setLate(false); };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const go = async (fn: () => unknown, ms: number) => { if (!live || touched.current) return false; fn(); await sleep(ms); return live && !touched.current; };
    (async () => {
      await sleep(1000);
      while (live && !touched.current) {
        if (!(await go(() => setRoom("loft"), 1300))) break;
        if (!(await go(() => setRoom("lake"), 1300))) break;
        if (!(await go(() => setNights(3), 1100))) break;
        if (!(await go(() => setBreakfast(true), 1300))) break;
        if (!(await go(() => setGuests(3), 1100))) break;
        if (!(await go(() => setLate(true), 1500))) break;
        if (!(await go(() => setDone(true), 3200))) break;
        if (!(await go(() => reset(), 1200))) break;
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const take = () => { touched.current = true; };

  return (
    <div
      ref={root}
      onPointerDownCapture={take}
      onKeyDownCapture={take}
      className="grid w-full max-w-[760px] grid-cols-1 gap-3 rounded-[24px] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] md:grid-cols-[1fr_280px]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}
    >
      {/* the choices */}
      <div className="px-4 pb-3 pt-4">
        <h3 className="m-0 text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Book a stay</h3>
        <p className="m-0 mt-1 text-[14px] text-[#6e6e73]">Lakeside House, 12 to 15 November</p>

        <div ref={(el) => { src.current.room = el; }} role="radiogroup" aria-label="Room" className="mt-5 flex flex-col gap-2">
          {ROOMS.map((x) => {
            const on = room === x.id;
            return (
              <button key={x.id} type="button" role="radio" aria-checked={on} disabled={done} onClick={() => setRoom(x.id)} className="relative flex items-center gap-3 rounded-[14px] p-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">
                <motion.span className="absolute inset-0 rounded-[14px]" animate={{ boxShadow: on ? "0 0 0 2px #0071e3" : "0 0 0 1px #e5e5ea", backgroundColor: on ? "rgba(0,113,227,.04)" : "rgba(255,255,255,1)" }} transition={SPRING} />
                <RoomIcon id={x.id} tone={x.tone} />
                <span className="relative min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-[#1d1d1f]">{x.name}</span>
                  <span className="block truncate text-[12.5px] text-[#86868b]">{x.note}</span>
                </span>
                <span className="relative text-[14px] font-medium tabular-nums text-[#1d1d1f]">${x.price}<span className="text-[12px] font-normal text-[#86868b]"> /night</span></span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stepper refCb={(el) => { src.current.nights = el; }} label="Nights" value={nights} min={1} max={7} disabled={done} onChange={setNights} />
          <Stepper refCb={(el) => { src.current.guests = el; }} label="Guests" value={guests} min={1} max={4} disabled={done} onChange={setGuests} />
        </div>
        <div className="mt-2 flex flex-col">
          <Toggle refCb={(el) => { src.current.breakfast = el; }} label="Breakfast" note={`$${BREAKFAST} a guest each morning`} on={breakfast} disabled={done || !r} onChange={setBreakfast} />
          <Toggle refCb={(el) => { src.current.late = el; }} label="Late checkout" note={`Until 2pm, $${LATE}`} on={late} disabled={done || !r} onChange={setLate} />
        </div>
      </div>

      {/* the receipt */}
      <div className="relative flex min-h-[340px] flex-col rounded-[18px] bg-[#f5f5f7] p-5" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {!done ? (
            <motion.div key="sum" className="flex flex-1 flex-col" exit={{ opacity: 0, scaleY: 0.2, y: -40, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }} style={{ transformOrigin: "50% 0%" }}>
              <p className="m-0 text-[13px] font-medium text-[#6e6e73]">Your stay</p>
              <div className="mt-3 flex flex-col">
                <AnimatePresence initial={false}>
                  {lines.map((l) => (
                    <Line key={l.key} from={src} src={l.from} root={root} reduce={!!reduce}>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-medium text-[#1d1d1f]">{l.label}</span>
                        <span className="block text-[12.5px] text-[#86868b]">{l.detail}</span>
                      </span>
                      <Money value={l.amount} className="text-[14px] text-[#1d1d1f]" />
                    </Line>
                  ))}
                </AnimatePresence>
                {!r && <p className="m-0 mt-1 text-[13.5px] leading-snug text-[#86868b]">Choose a room and your stay will build itself here.</p>}
              </div>
              <div className="mt-auto pt-4">
                <motion.div layout="position" transition={SPRING} className="flex justify-between border-t border-[#e0e0e5] pt-3 text-[13px] text-[#86868b]">
                  <span>Taxes and fees</span>
                  <Money value={tax} className="text-[13px] text-[#86868b]" />
                </motion.div>
                <motion.div layout="position" transition={SPRING} className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-[15px] font-semibold text-[#1d1d1f]">Total</span>
                  <Money value={total} className="text-[24px] font-semibold tracking-[-0.02em] text-[#1d1d1f]" />
                </motion.div>
                <motion.button
                  type="button"
                  onClick={() => void reserve()}
                  aria-disabled={!r}
                  animate={{ backgroundColor: r ? "#0071e3" : "#e3e3e8", color: r ? "#ffffff" : "#86868b" }}
                  whileTap={r ? { scale: 0.97 } : undefined}
                  transition={SPRING}
                  className="mt-4 h-11 w-full rounded-full text-[15px] font-medium outline-none focus-visible:ring-4 focus-visible:ring-[#0071e3]/30"
                >
                  Reserve
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="ok" className="flex flex-1 flex-col items-center justify-center text-center" initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...SPRING, delay: 0.25 }}>
              <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
                <motion.circle cx="28" cy="28" r="26" fill="none" stroke="#30a14e" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} />
                <motion.path d="M18 29l7 7 13-15" fill="none" stroke="#30a14e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.85 }} />
              </svg>
              <p className="m-0 mt-4 text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">You are booked</p>
              <p className="m-0 mt-1 text-[13.5px] leading-snug text-[#6e6e73]">{r?.name}, {nights} nights. Total ${total.toLocaleString("en-US")}.</p>
              <p className="m-0 mt-3 rounded-full bg-white px-3 py-1 text-[12.5px] font-medium tabular-nums text-[#1d1d1f] shadow-[0_0_0_.5px_rgba(0,0,0,.08)]">Confirmation LH-4821</p>
              <button type="button" onClick={reset} className="mt-5 text-[14px] font-medium text-[#0071e3] outline-none focus-visible:underline">Book another</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ room icons, drawn like iOS settings tiles: one white glyph on a coloured squircle */
function RoomIcon({ id, tone }: { id: string; tone: [string, string] }) {
  return (
    <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-[10px] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.08)]" style={{ background: `linear-gradient(180deg, ${tone[0]}, ${tone[1]})` }} aria-hidden="true">
      <Glyph d={id === "garden" ? ICON.tree : id === "loft" ? ICON.bed_double_fill : ICON.sunrise_fill} size={27} className="text-white" />
    </span>
  );
}

/* ------------------------------------------------------------------ a receipt line, flown in from the control that made it */
function Line({ from, src, root, reduce, children }: { from: RefObject<Partial<Record<Src, HTMLElement | null>>>; src: Src; root: RefObject<HTMLDivElement | null>; reduce: boolean; children: ReactNode }) {
  const el = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useLayoutEffect(() => {
    const s = from.current?.[src], e = el.current;
    if (!s || !e || reduce) return;
    const S = s.getBoundingClientRect(), E = e.getBoundingClientRect();
    // rects are in screen pixels; x and y are in the line's own, which differ inside a scaled preview
    const k = e.offsetWidth ? E.width / e.offsetWidth : 1;
    x.set((S.left + Math.min(S.width, 200) / 2 - (E.left + E.width / 2)) / k);
    y.set((S.top + S.height / 2 - (E.top + E.height / 2)) / k);
    animate(x, 0, FLY);
    animate(y, 0, FLY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  void root;
  return (
    <motion.div ref={el} layout="position" initial={{ opacity: 0, height: 0, scale: 0.9 }} animate={{ opacity: 1, height: "auto", scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.9 }} transition={SPRING} style={{ x, y }} className="relative z-10">
      <div className="flex items-start justify-between gap-3 py-2">{children}</div>
    </motion.div>
  );
}

/** A dollar amount whose digits roll individually, so only what changed moves. */
function Money({ value, className }: { value: number; className?: string }) {
  const s = `$${value.toLocaleString("en-US")}`;
  return (
    <span className={`inline-flex tabular-nums ${className ?? ""}`} aria-label={s}>
      {s.split("").map((ch, i) => {
        const k = s.length - i; // keyed from the right, so units stay units
        return /\d/.test(ch) ? (
          <span key={`d${k}`} className="relative inline-block h-[1.2em] overflow-hidden" aria-hidden="true">
            <span className="invisible">0</span>
            <motion.span className="absolute left-0 top-0 flex flex-col" initial={false} animate={{ y: `${-Number(ch) * 1.2}em` }} transition={SPRING}>
              {"0123456789".split("").map((n) => <span key={n} className="block h-[1.2em] leading-[1.2em]">{n}</span>)}
            </motion.span>
          </span>
        ) : (
          <span key={`c${k}${ch}`} aria-hidden="true" className="leading-[1.2em]">{ch}</span>
        );
      })}
    </span>
  );
}

function Stepper({ label, value, min, max, onChange, disabled, refCb }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void; disabled?: boolean; refCb: (el: HTMLElement | null) => void }) {
  const btn = "grid h-8 w-8 place-items-center rounded-full bg-white text-[#1d1d1f] shadow-[0_0_0_.5px_rgba(0,0,0,.1),0_1px_2px_rgba(0,0,0,.08)] outline-none disabled:opacity-35 focus-visible:ring-2 focus-visible:ring-[#0071e3]";
  return (
    <div ref={refCb} className="flex items-center justify-between rounded-[14px] bg-[#f5f5f7] py-2 pl-3.5 pr-2">
      <span className="text-[14px] text-[#1d1d1f]">{label}</span>
      <span className="flex items-center gap-2">
        <motion.button type="button" whileTap={{ scale: 0.9 }} aria-label={`Fewer ${label.toLowerCase()}`} disabled={disabled || value <= min} onClick={() => onChange(value - 1)} className={btn}>
          <Glyph d={ICON.minus} size={13} />
        </motion.button>
        <span className="relative w-4 overflow-hidden text-center text-[15px] font-medium tabular-nums text-[#1d1d1f]" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={value} className="block" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={SPRING}>{value}</motion.span>
          </AnimatePresence>
        </span>
        <motion.button type="button" whileTap={{ scale: 0.9 }} aria-label={`More ${label.toLowerCase()}`} disabled={disabled || value >= max} onClick={() => onChange(value + 1)} className={btn}>
          <Glyph d={ICON.plus} size={13} />
        </motion.button>
      </span>
    </div>
  );
}

function Toggle({ label, note, on, onChange, disabled, refCb }: { label: string; note: string; on: boolean; onChange: (b: boolean) => void; disabled?: boolean; refCb: (el: HTMLElement | null) => void }) {
  return (
    <div ref={refCb} className="flex items-center justify-between gap-3 border-b border-[#f0f0f2] px-1 py-2.5 last:border-0">
      <span>
        <span className="block text-[14px] text-[#1d1d1f]">{label}</span>
        <span className="block text-[12.5px] text-[#86868b]">{note}</span>
      </span>
      <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)} className="relative h-[30px] w-[50px] shrink-0 rounded-full outline-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2">
        <motion.span className="absolute inset-0 rounded-full" animate={{ backgroundColor: on ? "#30d158" : "#e5e5ea" }} transition={{ duration: 0.2 }} />
        <motion.span className="absolute top-[2px] h-[26px] w-[26px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.2)]" animate={{ left: on ? 22 : 2 }} transition={SPRING} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ icons: Framework7 Icons (MIT), via Iconify */
const ICON = {
  tree: "M31.8 36.237q-1.376 5.14-.074 8.574c1.595 4.208 7.2 5.419 7.464 6.522S31.726 53 27.358 53c-4.367 0-9.724-.833-9.724-1.667c0-.833 5.084-1.939 6.629-6.6q1.35-4.076-.296-9.361a2.8 2.8 0 0 1-.845.128c-1.191 0-2.183-.73-2.397-1.694c-.822.54-1.852.86-2.969.86c-2.41 0-4.411-1.492-4.807-3.454a4.5 4.5 0 0 1-1.047.121C9.747 31.333 8 29.841 8 28c0-1.243.796-2.327 1.977-2.9c-.607-.379-1.001-.992-1.001-1.683q.002-.362.135-.686C8.442 22.434 8 21.92 8 21.333c0-.727.682-1.345 1.632-1.573C8.637 19.15 8 18.214 8 17.167c0-1.663 1.603-3.04 3.699-3.293a3.37 3.37 0 0 1-.772-2.124c0-2.071 1.965-3.75 4.39-3.75q.366 0 .718.05c.585-1.483 2.227-2.55 4.16-2.55c.537 0 1.051.082 1.527.233C22.052 4.179 23.646 3 25.56 3c1.958 0 3.58 1.232 3.86 2.837c.715-.716 1.78-1.17 2.97-1.17c2.155 0 3.902 1.492 3.902 3.333c0 .62-.199 1.201-.544 1.699q.266-.032.544-.032c2.006 0 3.66 1.293 3.878 2.958a4.4 4.4 0 0 1 1.975-.458c2.156 0 3.903 1.492 3.903 3.333c0 1.255-.812 2.348-2.012 2.917c1.2.568 2.012 1.661 2.012 2.916c0 1.09-.613 2.059-1.56 2.667c.366.418.584.937.584 1.5q-.001.325-.092.624c1.8.853 3.019 2.493 3.019 4.376c0 2.761-2.62 5-5.854 5a6.7 6.7 0 0 1-2.362-.424c-.886.776-2.123 1.257-3.491 1.257a5.4 5.4 0 0 1-2.955-.85c-.42.357-.948.621-1.538.754",
  bed_double_fill: "M5.29 21.994h5.613v-3.179c0-2.064 1.16-3.178 3.248-3.178h8.235c2.088 0 3.248 1.114 3.248 3.178v3.178h5.01v-3.178c0-2.064 1.16-3.178 3.364-3.178h7.725c2.204 0 3.364 1.114 3.364 3.178v3.178h5.614V15.66c0-4.106-2.18-6.193-6.17-6.193H11.46c-3.967 0-6.17 2.087-6.17 6.193ZM0 44.867c0 1.137.742 1.856 1.902 1.856h1.3c1.136 0 1.878-.72 1.878-1.856v-3.294c.255.07.998.116 1.531.116h42.8c.534 0 1.254-.047 1.509-.116v3.294c0 1.137.742 1.856 1.879 1.856h1.322c1.137 0 1.879-.72 1.879-1.856v-13.2c0-4.199-2.343-6.495-6.588-6.495H6.588C2.343 25.172 0 27.468 0 31.667Z",
  sunrise_fill: "M28.01 24.222c.962 0 1.77-.874 1.77-1.945v-8.171l-.262-3.3l1.617 1.858l2.732 2.753c.327.306.742.502 1.18.502c.873 0 1.485-.59 1.485-1.464c0-.459-.153-.808-.524-1.158L29.19 6.961c-.46-.415-.787-.568-1.18-.568c-.415 0-.721.153-1.18.568l-6.817 6.336c-.371.35-.524.7-.524 1.158c0 .874.611 1.464 1.485 1.464c.415 0 .852-.197 1.158-.502l2.95-2.972l1.398-1.639l-.262 3.3v8.171c0 1.07.83 1.945 1.792 1.945m11.253 5.986c.7.678 1.858.678 2.666-.109l3.801-3.802c.809-.808.787-1.944.088-2.621c-.655-.7-1.813-.721-2.622.087l-3.802 3.802c-.786.808-.808 1.988-.13 2.643m-25.17-.109c.808.787 1.966.809 2.644.11c.677-.678.677-1.836-.131-2.644l-3.802-3.802c-.809-.808-1.923-.765-2.622-.087c-.7.655-.7 1.813.109 2.622ZM1.9 51.992h52.198c1.049 0 1.901-.786 1.901-1.77c0-.96-.852-1.747-1.9-1.747H37.471c1.485-1.967 2.381-4.392 2.381-7.014c0-6.467-5.375-11.864-11.842-11.864S16.169 34.994 16.169 41.46c0 2.622.895 5.047 2.36 7.014H1.9c-1.026.001-1.9.786-1.9 1.749c0 .983.874 1.77 1.9 1.77m2.84-9.286h5.375c1.136 0 1.989-.808 1.967-1.77c-.022-.983-.83-1.791-1.967-1.791H4.741c-1.136 0-1.944.808-1.944 1.792c0 .961.808 1.77 1.944 1.77m41.164 0h5.376c1.114 0 1.944-.808 1.944-1.77c0-.983-.83-1.791-1.944-1.791h-5.376c-1.136 0-1.988.808-1.966 1.792c.022.961.83 1.77 1.966 1.77",
  minus: "M10.762 30.098h34.476c1.125 0 2.11-.961 2.11-2.11c0-1.148-.985-2.086-2.11-2.086H10.762c-1.125 0-2.11.938-2.11 2.086c0 1.149.985 2.11 2.11 2.11",
  plus: "M27.988 47.734c1.149 0 2.11-.914 2.11-2.039V30.11h15.14c1.125 0 2.11-.96 2.11-2.109c0-1.148-.985-2.086-2.11-2.086h-15.14v-15.61c0-1.124-.961-2.038-2.11-2.038c-1.148 0-2.086.914-2.086 2.039v15.61h-15.14c-1.125 0-2.11.937-2.11 2.085s.985 2.11 2.11 2.11h15.14v15.585c0 1.125.938 2.04 2.086 2.04",
};
function Glyph({ d, size = 16, className, style }: { d: string; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="currentColor" aria-hidden="true" className={className} style={style}>
      <path d={d} />
    </svg>
  );
}
```
