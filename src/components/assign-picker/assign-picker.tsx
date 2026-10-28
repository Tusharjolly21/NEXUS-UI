"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface AssignPerson {
  id: string;
  name: string;
  role: string;
  /** Two colours for the avatar gradient (initials are drawn on top). */
  colors: [string, string];
}

export interface AssignPickerProps {
  /** People listed in the menu. */
  people?: AssignPerson[];
  /** Ids selected on first render. */
  defaultValue?: string[];
  /** Called with the selected ids, in the order they were picked. */
  onChange?: (ids: string[]) => void;
  /** Opens the menu, ticks four people, closes and clears, on a loop until the user clicks. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Lets several people be ticked. Turn it off and each pick replaces the last and closes the menu. */
  multiple?: boolean;
  /** How many faces the pill shows before the rest collapse into a +N count, 3 by default. Clamped to 1 to 5. */
  maxFaces?: number;
  /** Diameter in px of the faces in the pill, 28 by default. Clamped to 22 to 36. */
  faceSize?: number;
  /** How much the faces overshoot as they land in the pill, 1 is the default. Higher bounces more, lower settles flat. Clamped to 0.5 to 2. */
  bounce?: number;
}

const clamp = (v: number, lo: number, hi: number) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);

const PEOPLE: AssignPerson[] = [
  { id: "am", name: "Adam Marsh", role: "Design", colors: ["#ff6fd8", "#ff9f0a"] },
  { id: "pr", name: "Priya Raman", role: "Research", colors: ["#5ac8fa", "#5e5ce6"] },
  { id: "nw", name: "Nora Wilder", role: "Engineering", colors: ["#30d158", "#0b8f6a"] },
  { id: "mb", name: "Marco Bellini", role: "Product", colors: ["#ff375f", "#bf5af2"] },
  { id: "jk", name: "June Kato", role: "Marketing", colors: ["#ffd60a", "#ff9f0a"] },
];

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const first = (name: string) => name.split(" ")[0];

/** Gradient avatar with initials; no images are loaded. */
export function AssignFace({ person, size = 28 }: { person: AssignPerson; size?: number }) {
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white dark:border-[#1c1c1e]"
      style={{ width: size, height: size, background: `linear-gradient(140deg, ${person.colors[0]}, ${person.colors[1]})` }}
      aria-hidden="true"
    >
      {initials(person.name)}
    </span>
  );
}

/**
 * Assignee picker. Open the pill, tick people, and each face flies from its
 * row into the pill, which grows to hold them; past three they overlap into
 * a stack with a count. The label reads naturally: one name, two names, or
 * a number.
 */
export function AssignPicker({
  people = PEOPLE,
  defaultValue,
  onChange,
  autoplay = false,
  enableSound = true,
  multiple = true,
  maxFaces = 3,
  faceSize = 28,
  bounce = 1,
}: AssignPickerProps) {
  const play = useSound(enableSound);
  const faces = Math.round(clamp(maxFaces, 1, 5));
  const size = Math.round(clamp(faceSize, 22, 36));
  const damping = 22 / clamp(bounce, 0.5, 2);
  // Read when a person is ticked, so the options apply live.
  const opts = useRef({ multiple, faces, size });
  useEffect(() => {
    opts.current = { multiple, faces, size };
  }, [multiple, faces, size]);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<string[]>(() => defaultValue ?? []);
  const [flights, setFlights] = useState<Record<string, { x: number; y: number }>>({});
  const selRef = useRef<string[]>(defaultValue ?? []);
  const pill = useRef<HTMLButtonElement>(null);
  const rows = useRef(new Map<string, HTMLSpanElement | null>());
  const touched = useRef(false);
  const onChangeRef = useRef(onChange);

  const peopleRef = useRef(people);

  useEffect(() => {
    onChangeRef.current = onChange;
    peopleRef.current = people;
  }, [onChange, people]);

  const commit = useCallback((next: string[]) => {
    selRef.current = next;
    setSel(next);
    onChangeRef.current?.(next);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const cur = selRef.current;
      const el = rows.current.get(id);
      const p = pill.current;
      if (el && p && !cur.includes(id)) {
        // where the face starts, relative to the slot it will land in inside the pill
        const a = el.getBoundingClientRect();
        const b = p.getBoundingClientRect();
        const o = opts.current;
        const slot = o.multiple ? Math.min(cur.length, o.faces) : 0;
        const offset = { x: a.left - b.left - 10 - slot * (o.size - 10), y: a.top - b.top - 6 + (o.size - 28) / 2 };
        setFlights((f) => ({ ...f, [id]: offset }));
      }
      if (cur.includes(id)) commit(cur.filter((x) => x !== id));
      else commit(opts.current.multiple ? [...cur, id] : [id]);
    },
    [commit],
  );

  useEffect(() => {
    if (!autoplay) return;
    const pick = [1, 3, 0, 4].map((i) => peopleRef.current[i]?.id).filter((id): id is string => Boolean(id));
    const seq = [() => setOpen(true), ...pick.map((id) => () => {
        if (selRef.current.includes(id)) play.auto("tick", 0.4);
        else play.auto("pop", 0.5);
        toggle(id);
      }), () => setOpen(false), () => commit([])];
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      seq[k++ % seq.length]();
    }, 900);
    return () => clearInterval(t);
  }, [autoplay, toggle, commit, play]);

  const chosen = people.filter((p) => sel.includes(p.id)).sort((a, b) => sel.indexOf(a.id) - sel.indexOf(b.id));
  const label =
    chosen.length === 0
      ? "Assign"
      : chosen.length === 1
        ? first(chosen[0].name)
        : chosen.length === 2
          ? `${first(chosen[0].name)} and ${first(chosen[1].name)}`
          : `${chosen.length} people`;
  const shown = chosen.slice(0, faces);

  return (
    <div
      className="flex h-[330px] w-[300px] flex-col items-start"
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={(e) => {
        touched.current = true;
        if (e.key === "Escape" && open) {
          setOpen(false);
          pill.current?.focus();
        }
      }}
    >
      <motion.button
        ref={pill}
        layout
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={chosen.length ? `Assigned: ${chosen.map((p) => p.name).join(", ")}` : "Assign people"}
        onClick={() => setOpen((o) => !o)}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="relative flex h-11 items-center gap-2 rounded-full bg-white pl-2 pr-3.5 text-[14px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08),0_8px_20px_-12px_rgba(0,0,0,.3)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_8px_20px_-12px_rgba(0,0,0,.8)] dark:focus-visible:ring-[#2997ff]"
      >
        <motion.span layout className="flex items-center -space-x-2.5">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.length === 0 && (
              <motion.span
                key="plus"
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{ width: size, height: size }}
                className="flex items-center justify-center rounded-full border-[1.5px] border-dashed border-[#a1a1a6] text-[#86868b] dark:border-[#636366] dark:text-[#8e8e93]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </motion.span>
            )}
            {shown.map((p, i) => {
              const f = flights[p.id];
              return (
                <motion.span
                  key={p.id}
                  layout
                  initial={f ? { x: f.x, y: f.y, scale: 1.15 } : { scale: 0 }}
                  animate={{ x: 0, y: 0, scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping }}
                  style={{ zIndex: 10 - i }}
                  className="relative"
                >
                  <AssignFace person={p} size={size} />
                </motion.span>
              );
            })}
            {chosen.length > faces && (
              <motion.span
                key="more"
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{ width: size, height: size }}
                className="relative flex items-center justify-center rounded-full border-2 border-white bg-[#1d1d1f] text-[10px] font-semibold text-white dark:border-[#1c1c1e] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
              >
                +{chosen.length - faces}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
        <motion.span layout="position" className="whitespace-nowrap">
          {label}
        </motion.span>
        <motion.svg
          layout="position"
          animate={{ rotate: open ? 180 : 0 }}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-[#86868b] dark:text-[#8e8e93]"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.ul
            key="list"
            role="listbox"
            aria-multiselectable={multiple}
            aria-label="People"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{ transformOrigin: "top left" }}
            className="m-0 mt-2 w-[280px] list-none rounded-[20px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_40px_-24px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_40px_-24px_rgba(0,0,0,.8)]"
          >
            {people.map((p, i) => {
              const on = sel.includes(p.id);
              return (
                <motion.li key={p.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      if (on) play("tick", 0.4);
                      else play("pop", 0.5);
                      toggle(p.id);
                      if (!multiple) setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left outline-none hover:bg-[#f5f5f7] focus-visible:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e] dark:focus-visible:bg-[#2c2c2e]"
                  >
                    <span
                      ref={(el) => {
                        rows.current.set(p.id, el);
                      }}
                      className="flex"
                    >
                      <AssignFace person={p} size={30} />
                    </span>
                    <span className="flex flex-1 flex-col">
                      <span className="text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{p.name}</span>
                      <span className="text-[12px] text-[#86868b] dark:text-[#8e8e93]">{p.role}</span>
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-[6px] transition-[background-color,box-shadow] duration-300 ${
                        on
                          ? "bg-[#1d1d1f] text-white shadow-[inset_0_0_0_1.5px_#1d1d1f] dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:shadow-[inset_0_0_0_1.5px_#f5f5f7]"
                          : "bg-white shadow-[inset_0_0_0_1.5px_#c7c7cc] dark:bg-[#1c1c1e] dark:shadow-[inset_0_0_0_1.5px_#48484a]"
                      }`}
                    >
                      {on && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
                        </svg>
                      )}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
