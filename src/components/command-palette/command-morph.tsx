"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface CommandItem {
  /** Unique within its page. */
  id: string;
  /** Text shown in the row; also what the search field filters on. */
  label: string;
  /** Optional shortcut hint shown on the right, e.g. "⌘N". Display only. */
  hint?: string;
  /** SVG path data for a 24×24 stroked icon. */
  icon: string;
  /** Short name shown in the breadcrumb chip when this group is open. Defaults to `label`. */
  crumb?: string;
  /** Nested commands. A command with children opens a new page instead of running. */
  children?: CommandItem[];
}

export const DEFAULT_COMMANDS: CommandItem[] = [
  {
    id: "theme",
    label: "Change theme",
    crumb: "theme",
    icon: "M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z",
    children: [
      { id: "light", label: "Light", icon: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" },
      { id: "dark", label: "Dark", icon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" },
      { id: "system", label: "Match system", icon: "M3 5h18v12H3zM8 21h8" },
    ],
  },
  { id: "invite", label: "Invite teammates", hint: "⌘I", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" },
  {
    id: "project",
    label: "Open project",
    crumb: "project",
    icon: "M3 7h6l2 2h10v10H3z",
    children: [
      { id: "p1", label: "Website relaunch", icon: "M4 4h16v16H4z" },
      { id: "p2", label: "Mobile app", icon: "M7 2h10v20H7z" },
      { id: "p3", label: "Brand refresh", icon: "M12 2l3 7h7l-6 4 2 7-6-4-6 4 2-7-6-4h7z" },
    ],
  },
  { id: "new", label: "New document", hint: "⌘N", icon: "M6 2h9l5 5v15H6zM14 2v6h6M12 12v6M9 15h6" },
  { id: "logout", label: "Log out", icon: "M9 21H5V3h4M16 17l5-5-5-5M21 12H9" },
];

export interface CommandMorphProps {
  /** The commands on the first page. Items with `children` open a nested page. */
  commands?: CommandItem[];
  /** Placeholder for the search field on the first page. Nested pages show "Search…". */
  placeholder?: string;
  /** Called when the user runs a command that has no children, with the groups that led to it. */
  onSelect?: (command: CommandItem, path: CommandItem[]) => void;
  /** Opt-in: Cmd/Ctrl+K anywhere on the page focuses the search field. Off by default so the page keeps the shortcut. */
  hotkey?: boolean;
  /** Walks through the palette by itself (highlight, open a page, filter, go back) until someone touches it. */
  autoplay?: boolean;
  /** Extra classes for the outer box. */
  className?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

const crumbOf = (c: CommandItem) => c.crumb ?? c.label;

/**
 * A command palette that moves like one object. The highlight slides between
 * rows, the panel grows and shrinks with its results, and opening a group
 * slides its page in with a breadcrumb that tucks into the search field.
 * Arrow keys, Enter, and Backspace on an empty field to go back.
 */
export function CommandMorph({
  commands = DEFAULT_COMMANDS,
  placeholder = "Type a command…",
  onSelect,
  hotkey = false,
  autoplay = false,
  className = "",
  enableSound = true,
}: CommandMorphProps) {
  const play = useSound(enableSound);
  const lastTick = useRef(0);
  const [stack, setStack] = useState<CommandItem[]>([]);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [ran, setRan] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const ranTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const commandsRef = useRef(commands);
  const uid = useId().replace(/:/g, "");

  const page = stack.length ? (stack[stack.length - 1].children ?? []) : commands;
  const list = page.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  const active = Math.max(0, Math.min(i, list.length - 1));
  const optionId = (c: CommandItem) => `cmd-${uid}-${c.id}`;

  useEffect(() => {
    commandsRef.current = commands;
  }, [commands]);

  useEffect(() => () => clearTimeout(ranTimer.current), []);

  const showRan = (label: string, ms: number) => {
    setRan(label);
    clearTimeout(ranTimer.current);
    ranTimer.current = setTimeout(() => setRan(null), ms);
  };

  const run = (c?: CommandItem) => {
    if (!c) return;
    play("tap");
    if (c.children) {
      setDir(1);
      setStack((s) => [...s, c]);
      setQ("");
      setI(0);
      return;
    }
    showRan(c.label, 1400);
    onSelect?.(c, stack);
  };

  const back = () => {
    if (!stack.length) return;
    play("tick", 0.4);
    setDir(-1);
    setStack((s) => s.slice(0, -1));
    setI(0);
  };

  const key = (e: KeyboardEvent<HTMLInputElement>) => {
    touched.current = true;
    const tick = () => {
      if (e.timeStamp - lastTick.current < 40) return;
      lastTick.current = e.timeStamp;
      play("tick", 0.4);
    };
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (active < list.length - 1) tick();
      setI(Math.min(list.length - 1, active + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (active > 0) tick();
      setI(Math.max(0, active - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(list[active]);
    } else if (e.key === "Backspace" && !q) {
      back();
    } else if (e.key === "Escape") {
      if (q) {
        setQ("");
        setI(0);
      } else back();
    }
  };

  // Opt-in global shortcut. Only listens while `hotkey` is true.
  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        touched.current = true;
        play("pop", 0.7);
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey, play]);

  useEffect(() => {
    if (!autoplay) return;
    const groups = commandsRef.current.filter((c) => c.children?.length);
    const a = groups[1] ?? groups[0];
    const b = groups[0];
    const open = (g: CommandItem) => {
      setQ("");
      setDir(1);
      setStack([g]);
      setI(0);
    };
    const home = () => {
      setDir(-1);
      setStack([]);
      setI(0);
    };
    const steps: (() => void)[] = [() => setI(1), () => setI(2)];
    if (a && b) {
      const kids = a.children ?? [];
      const word = (b.label.split(" ").pop() ?? b.label).toLowerCase();
      steps.push(
        () => open(a),
        () => setI(1),
        () => {
          const pick = kids[Math.min(1, kids.length - 1)];
          if (!pick) return;
          setRan(pick.label);
          clearTimeout(ranTimer.current);
          ranTimer.current = setTimeout(() => setRan(null), 1000);
        },
        home,
        () => setQ(word.slice(0, 2)),
        () => setQ(word.slice(0, 4)),
        () => open(b),
        () => setI(1),
        home,
      );
    } else {
      steps.push(() => setI(0));
    }
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      steps[k++ % steps.length]();
    }, 900);
    return () => clearInterval(t);
  }, [autoplay]);

  return (
    <div
      className={`flex h-[340px] w-[330px] max-w-full items-start justify-center pt-2 ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className="w-[320px] max-w-full overflow-hidden rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.07),0_30px_60px_-28px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_60px_-28px_rgba(0,0,0,.9)]"
        role="group"
        aria-label="Command palette"
      >
        <motion.div layout="position" className="flex items-center gap-2 border-b border-black/[.06] px-4 py-3 dark:border-white/[.08]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="flex-none text-[#86868b] dark:text-[#98989d]"
            aria-hidden="true"
          >
            <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" />
          </svg>
          <AnimatePresence initial={false} mode="popLayout">
            {stack.map((s) => (
              <motion.button
                key={s.id}
                type="button"
                onClick={back}
                aria-label={`Back from ${crumbOf(s)}`}
                layout
                initial={{ opacity: 0, scale: 0.6, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="flex-none rounded-md bg-[#f0f0f3] px-2 py-0.5 text-[12px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
              >
                {crumbOf(s)}
              </motion.button>
            ))}
          </AnimatePresence>
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              touched.current = true;
              setQ(e.target.value);
              setI(0);
            }}
            onKeyDown={key}
            placeholder={stack.length ? "Search…" : placeholder}
            role="combobox"
            aria-label="Command"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls={`cmd-${uid}-list`}
            aria-activedescendant={list[active] ? optionId(list[active]) : undefined}
            autoComplete="off"
            spellCheck={false}
            className="h-7 min-w-0 flex-1 bg-transparent text-[15px] text-[#1d1d1f] outline-none placeholder:text-[#a1a1a6] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93]"
          />
          <kbd className="flex-none rounded-md bg-[#f0f0f3] px-1.5 py-0.5 font-sans text-[11px] text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]" aria-hidden="true">
            ⌘K
          </kbd>
        </motion.div>
        <div id={`cmd-${uid}-list`} role="listbox" aria-label="Commands" className="relative">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.ul
              key={stack.map((s) => s.id).join("/") || "root"}
              custom={dir}
              role="none"
              className="m-0 list-none p-1.5"
              variants={{ in: (d: number) => ({ x: d * 60, opacity: 0 }), out: (d: number) => ({ x: d * -60, opacity: 0 }) }}
              initial="in"
              animate={{ x: 0, opacity: 1 }}
              exit="out"
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
            >
              {list.length === 0 && (
                <li role="none" className="px-3 py-6 text-center text-[13px] text-[#86868b] dark:text-[#98989d]">
                  No commands match.
                </li>
              )}
              {list.map((c, k) => (
                <li
                  key={c.id}
                  id={optionId(c)}
                  role="option"
                  aria-selected={k === active}
                  onPointerEnter={() => setI(k)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    touched.current = true;
                    setI(k);
                    run(c);
                  }}
                  className="relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] text-[#1d1d1f] outline-none dark:text-[#f5f5f7]"
                >
                  {k === active && (
                    <motion.span
                      layoutId={`cmd-hl-${uid}`}
                      className="absolute inset-0 rounded-xl bg-[#f0f0f3] dark:bg-[#2c2c2e]"
                      transition={{ type: "spring", stiffness: 520, damping: 38 }}
                    />
                  )}
                  <svg
                    className="relative flex-none text-[#6e6e73] dark:text-[#a1a1a6]"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={c.icon} />
                  </svg>
                  <span className="relative min-w-0 flex-1 truncate">{c.label}</span>
                  {c.hint && <span className="relative flex-none text-[12px] text-[#86868b] dark:text-[#98989d]">{c.hint}</span>}
                  {c.children && (
                    <span className="relative flex-none text-[#86868b] dark:text-[#98989d]" aria-hidden="true">
                      ›
                    </span>
                  )}
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {ran && (
            <motion.div
              key="ran"
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-black/[.06] dark:border-white/[.08]"
              aria-hidden="true"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#248a3d] dark:text-[#30d158]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {ran}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <span role="status" className="sr-only">
          {ran ?? ""}
        </span>
      </motion.div>
    </div>
  );
}
