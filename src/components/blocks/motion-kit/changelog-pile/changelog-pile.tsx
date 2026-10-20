"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Matter from "matter-js";
import { cn } from "@/lib/utils";

export type ChangelogKind = "New" | "Improved" | "Fixed";

export interface ChangelogEntry {
  kind: ChangelogKind;
  version: string;
  date: string;
  title: string;
  /** One line shown on the card. */
  body: string;
  /** Extra detail shown when the card is opened. */
  more: string;
}

export interface ChangelogPileProps {
  /** Release notes, newest first. Pass a stable array (a constant or memoised) so the pile is not rebuilt on every render. */
  entries?: ChangelogEntry[];
  /** Small blue line above the title. */
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Label of the subscribe link beside the view switch. */
  updatesLabel?: string;
  /** Label of the link inside an opened note. */
  docsLabel?: string;
  /** Cycles the filter (New, Improved, Fixed, All) every 3.2 s in Pile view until the visitor touches the section. */
  autoplay?: boolean;
  /** Called when "Get updates" or "Read the docs" is pressed. Links never navigate on their own. */
  onAction?: (action: "updates" | "docs", entry?: ChangelogEntry) => void;
  className?: string;
}

type Filter = "All" | ChangelogKind;
type View = "pile" | "list";
type Item = { body: Matter.Body; w: number; h: number; tx?: number; ty?: number };

const STEP = 1000 / 60;
const TH = 580;
const FLOOR = 0x0002;
const CARD = 0x0001;
const FILTERS: Filter[] = ["All", "New", "Improved", "Fixed"];
const AUTO_ORDER: Filter[] = ["New", "Improved", "Fixed", "All"];

const KIND: Record<ChangelogKind, { bg: string; fg: string; bgDark: string; fgDark: string }> = {
  New: { bg: "#e8f1fd", fg: "#0062c4", bgDark: "rgba(10,132,255,.2)", fgDark: "#64b5ff" },
  Improved: { bg: "#f3eafd", fg: "#8a3fd1", bgDark: "rgba(191,90,242,.22)", fgDark: "#d9a0ff" },
  Fixed: { bg: "#e6f8ec", fg: "#1a7f37", bgDark: "rgba(48,209,88,.18)", fgDark: "#4cd96e" },
};

export const DEFAULT_CHANGELOG_ENTRIES: ChangelogEntry[] = [
  { kind: "New", version: "3.2", date: "Oct 14", title: "Command palette", body: "Press ⌘K anywhere to jump to any page, setting or teammate.", more: "It remembers what you open most and puts it first. Type > to run actions like 'Invite' or 'New project' without leaving the keyboard." },
  { kind: "Improved", version: "3.2", date: "Oct 14", title: "Faster search", body: "Results appear as you type, about four times quicker on big workspaces.", more: "Search now runs on a new index that updates within a second of any change, so fresh edits show up straight away." },
  { kind: "Fixed", version: "3.2", date: "Oct 14", title: "Calendar time zones", body: "Events made while travelling no longer shift by an hour.", more: "Times are now stored with the time zone they were created in and shown in yours." },
  { kind: "New", version: "3.1", date: "Sep 30", title: "Dark mode", body: "Follows your system setting, or set it per device.", more: "Every screen, chart and email preview has a dark version. Find it under Settings → Appearance." },
  { kind: "Improved", version: "3.1", date: "Sep 30", title: "Bulk edit", body: "Change status, owner or due date on up to 500 rows at once.", more: "Shift-click to select a range, then use the bar at the bottom. Undo works for the whole batch." },
  { kind: "Fixed", version: "3.1", date: "Sep 30", title: "CSV export", body: "Long notes are no longer cut off at 255 characters.", more: "Exports also keep line breaks inside notes now, so they open cleanly in spreadsheets." },
  { kind: "New", version: "3.0", date: "Sep 12", title: "Shared views", body: "Save a filter and share it with your team as a link.", more: "Views update live for everyone who has the link, and you can lock one so nobody changes it by accident." },
  { kind: "Improved", version: "3.0", date: "Sep 12", title: "Mobile uploads", body: "Photos upload in the background while you keep working.", more: "Uploads resume if you lose signal, and you'll get a notification when a large batch finishes." },
  { kind: "Fixed", version: "3.0", date: "Sep 12", title: "Notification badges", body: "Badges clear as soon as you read the message.", more: "Read state now syncs across your phone, desktop app and browser within a second." },
];

const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const muted = "text-[#6e6e73] dark:text-[#a1a1a6]";
const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]";

function Badge({ kind, className }: { kind: ChangelogKind; className?: string }) {
  const k = KIND[kind];
  const vars = { "--cl-bg": k.bg, "--cl-fg": k.fg, "--cl-bg-d": k.bgDark, "--cl-fg-d": k.fgDark } as CSSProperties;
  return (
    <span
      style={vars}
      className={cn(
        "rounded-full px-2 py-0.5 font-semibold bg-[var(--cl-bg)] text-[var(--cl-fg)] dark:bg-[var(--cl-bg-d)] dark:text-[var(--cl-fg-d)]",
        className,
      )}
    >
      {kind}
    </span>
  );
}

/**
 * A changelog people actually look at. Release notes land as a pile of real
 * cards: pick them up, throw them, filter by New / Improved / Fixed and the
 * rest drop through the floor. Switch to List and every card glides into a
 * tidy, readable column. Click any card for the full note.
 */
export function ChangelogPile({
  entries = DEFAULT_CHANGELOG_ENTRIES,
  eyebrow = "Changelog",
  title = "What's new",
  description = "Everything we shipped since September. Pick the cards up and throw them, or switch to the list to read.",
  updatesLabel = "Get updates",
  docsLabel = "Read the docs",
  autoplay = false,
  onAction,
  className,
}: ChangelogPileProps) {
  const uid = useId();
  const headingId = `${uid}-title`;
  const reduce = useReducedMotion();

  const tray = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLLIElement | null)[]>([]);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const docsLink = useRef<HTMLAnchorElement>(null);
  const items = useRef<Item[]>([]);
  const engine = useRef<Matter.Engine | null>(null);
  const walls = useRef<{ right: Matter.Body } | null>(null);
  const grab = useRef<{ c: Matter.Constraint | null; i: number; x: number; y: number; moved: boolean } | null>(null);
  const width = useRef(600);
  const listH = useRef(TH);
  const viewRef = useRef<View>("pile");
  const filterRef = useRef<Filter>("All");
  const entriesRef = useRef(entries);
  const reduceRef = useRef(false);
  const visible = useRef(true);
  const touched = useRef(false);
  const decided = useRef(false);
  const openRef = useRef<number | null>(null);

  const [filter, setFilterState] = useState<Filter>("All");
  const [view, setViewState] = useState<View>("pile");
  const [open, setOpenState] = useState<number | null>(null);
  const [cardW, setCardW] = useState(230);
  const [said, setSaid] = useState("");

  const count = entries.length;
  const sig = entries.map((e) => `${e.kind}|${e.title}|${e.body}`).join("\n");

  useLayoutEffect(() => {
    entriesRef.current = entries;
  });
  useEffect(() => {
    reduceRef.current = !!reduce;
  }, [reduce]);

  const changeView = (v: View) => {
    viewRef.current = v;
    setViewState(v);
  };
  const changeFilter = (f: Filter) => {
    filterRef.current = f;
    setFilterState(f);
  };
  const setOpen = (i: number | null) => {
    openRef.current = i;
    setOpenState(i);
  };

  const shown = useEffectEvent((i: number) => {
    const e = entriesRef.current[i];
    return !!e && (filterRef.current === "All" || e.kind === filterRef.current);
  });

  const setTrayHeight = () => {
    const t = tray.current;
    if (t) t.style.height = `${viewRef.current === "list" ? Math.max(TH, listH.current) : TH}px`;
  };

  /** Masonry targets for List view: shortest column first, hidden cards parked below the tray. */
  const layoutList = useEffectEvent((snap: boolean) => {
    const W = width.current;
    const gap = 14;
    const cw = items.current[0]?.w ?? 230;
    const cols = Math.max(1, Math.min(3, Math.floor((W - 32 + gap) / (cw + gap))));
    const left = (W - (cols * cw + (cols - 1) * gap)) / 2;
    const heights = new Array<number>(cols).fill(20);
    items.current.forEach((it, i) => {
      if (!shown(i)) {
        it.tx = it.body.position.x;
        it.ty = Math.max(TH, listH.current) + 300;
      } else {
        const c = heights.indexOf(Math.min(...heights));
        it.tx = left + c * (cw + gap) + cw / 2;
        it.ty = heights[c] + it.h / 2;
        heights[c] += it.h + gap;
      }
      if (snap) {
        Matter.Body.setPosition(it.body, { x: it.tx, y: it.ty });
        Matter.Body.setAngle(it.body, 0);
        Matter.Body.setVelocity(it.body, { x: 0, y: 0 });
      }
    });
    listH.current = Math.max(...heights) + 6;
    setTrayHeight();
  });

  // Track width; a pile needs room, so narrow trays (and reduced motion) start in the readable list.
  const onResize = useEffectEvent((el: HTMLDivElement) => {
    width.current = el.offsetWidth;
    setCardW(el.offsetWidth < 520 ? Math.min(250, el.offsetWidth - 40) : 230);
    if (!decided.current) {
      decided.current = true;
      if (el.offsetWidth < 520 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) changeView("list");
    }
    const w = walls.current;
    if (w) Matter.Body.setPosition(w.right, { x: width.current + 30, y: TH / 2 - 200 });
    if (viewRef.current === "list") layoutList(false);
  });
  useLayoutEffect(() => {
    const el = tray.current;
    if (!el) return;
    width.current = el.offsetWidth;
    const ro = new ResizeObserver(() => onResize(el));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // Build the world once the cards have rendered and can be measured.
  const afterBuild = useEffectEvent(() => {
    if (viewRef.current === "list") layoutList(true);
    else setTrayHeight();
  });
  useEffect(() => {
    const e = Matter.Engine.create({ gravity: { x: 0, y: 1.1 } });
    engine.current = e;
    const W = width.current;
    const wall = { isStatic: true, friction: 0.5, collisionFilter: { category: FLOOR } };
    const floor = Matter.Bodies.rectangle(W / 2, TH + 30, 4000, 60, wall);
    const right = Matter.Bodies.rectangle(W + 30, TH / 2 - 200, 60, TH + 400, wall);
    walls.current = { right };
    Matter.Composite.add(e.world, [floor, right, Matter.Bodies.rectangle(-30, TH / 2 - 200, 60, TH + 400, wall)]);
    items.current = Array.from({ length: count }, (_, i) => {
      const el = els.current[i];
      const w = el?.offsetWidth || cardW;
      const h = el?.offsetHeight || 120;
      const body = Matter.Bodies.rectangle(w / 2 + 10 + ((i * 131) % Math.max(1, W - w - 20)), -120 - i * 90, w, h, {
        chamfer: { radius: 14 },
        restitution: 0.15,
        friction: 0.45,
        frictionAir: 0.015,
        density: 0.0012,
        collisionFilter: { category: CARD, mask: shown(i) ? CARD | FLOOR : 0 },
      });
      Matter.Body.setAngle(body, ((i % 5) - 2) * 0.12);
      return { body, w, h };
    });
    Matter.Composite.add(e.world, items.current.map((it) => it.body));
    afterBuild();

    let raf = 0;
    let acc = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible.current || document.hidden) {
        last = now;
        return;
      }
      acc += Math.min(100, now - last);
      last = now;
      const list = viewRef.current === "list";
      const k = reduceRef.current ? 1 : 0.16;
      const ka = reduceRef.current ? 0 : 0.84;
      for (let n = 0; acc >= STEP && n < 4; n++) {
        if (list) {
          // glide each card to its slot in the list
          for (const it of items.current) {
            if (it.tx === undefined || it.ty === undefined) continue;
            const b = it.body;
            Matter.Body.setPosition(b, { x: b.position.x + (it.tx - b.position.x) * k, y: b.position.y + (it.ty - b.position.y) * k });
            Matter.Body.setAngle(b, b.angle * ka);
          }
        } else Matter.Engine.update(e, STEP);
        acc -= STEP;
      }
      if (acc > STEP) acc = 0;
      items.current.forEach((it, i) => {
        const el = els.current[i];
        if (!el) return;
        const b = it.body;
        el.style.transform = `translate(${b.position.x - it.w / 2}px, ${b.position.y - it.h / 2}px) rotate(${b.angle}rad)`;
        // out-of-filter cards fall away below the tray; park them when they're far gone
        if (!list && !shown(i) && b.position.y > TH + 400) {
          Matter.Body.setVelocity(b, { x: 0, y: 0 });
          Matter.Body.setPosition(b, { x: b.position.x, y: TH + 400 });
        }
      });
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      Matter.Composite.clear(e.world, false, true);
      Matter.Engine.clear(e);
      engine.current = null;
      walls.current = null;
      grab.current = null;
    };
  }, [count, sig, cardW]);

  // Filters: matching cards drop back in from above, the rest fall through the floor.
  const applyFilter = useEffectEvent(() => {
    items.current.forEach((it, i) => {
      const b = it.body;
      const on = shown(i);
      b.collisionFilter.mask = on ? CARD | FLOOR : 0;
      if (on && b.position.y > TH) {
        Matter.Body.setPosition(b, { x: it.w / 2 + 10 + Math.random() * Math.max(1, width.current - it.w - 20), y: -120 - Math.random() * 200 });
        Matter.Body.setVelocity(b, { x: 0, y: 0 });
        Matter.Body.setAngle(b, (Math.random() - 0.5) * 0.6);
      }
      if (!on && viewRef.current === "pile") Matter.Body.setVelocity(b, { x: b.velocity.x, y: Math.max(b.velocity.y, 2) });
    });
    if (viewRef.current === "list") layoutList(false);
  });
  useEffect(() => {
    applyFilter();
  }, [filter]);

  const applyView = useEffectEvent(() => {
    if (viewRef.current === "list") {
      layoutList(false);
      return;
    }
    setTrayHeight();
    items.current.forEach((it, i) => {
      if (!shown(i)) return;
      // anything below the pile's floor drops back in from the top
      if (it.body.position.y > TH - it.h / 2) {
        Matter.Body.setPosition(it.body, { x: it.body.position.x, y: -it.h - Math.random() * 300 });
        Matter.Body.setVelocity(it.body, { x: 0, y: 0 });
      }
      Matter.Body.setAngularVelocity(it.body, (Math.random() - 0.5) * 0.06);
    });
  });
  useEffect(() => {
    applyView();
  }, [view]);

  // Autoplay: cycle the filter in Pile view until someone touches the section.
  const autoStep = useEffectEvent((f: Filter) => changeFilter(f));
  useEffect(() => {
    if (!autoplay || reduce) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      if (!visible.current || document.hidden || viewRef.current !== "pile" || openRef.current !== null) return;
      autoStep(AUTO_ORDER[k++ % AUTO_ORDER.length]);
    }, 3200);
    return () => window.clearInterval(id);
  }, [autoplay, reduce]);

  // Detail panel: focus Close on open, Escape closes, focus goes back to the card.
  const close = () => {
    const i = openRef.current;
    setOpen(null);
    if (i === null) return;
    requestAnimationFrame(() => btns.current[i]?.focus({ preventScroll: viewRef.current === "pile" }));
  };
  const closeNote = useEffectEvent(close);
  useEffect(() => {
    if (open === null) return;
    closeBtn.current?.focus({ preventScroll: viewRef.current === "pile" });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeNote();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const trapTab = (e: ReactKeyboardEvent) => {
    if (e.key !== "Tab") return;
    const list = [closeBtn.current, docsLink.current].filter(Boolean) as HTMLElement[];
    if (!list.length) return;
    const first = list[0];
    const lastEl = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      first.focus();
    }
  };

  const local = (cx: number, cy: number) => {
    const r = tray.current!.getBoundingClientRect();
    return { x: cx - r.left, y: cy - r.top };
  };
  const down = (i: number) => (ev: ReactPointerEvent<HTMLButtonElement>) => {
    touched.current = true;
    if (viewRef.current !== "pile" || !engine.current || ev.button !== 0) return;
    const it = items.current[i];
    if (!it) return;
    ev.preventDefault();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    const p = local(ev.clientX, ev.clientY);
    const b = it.body;
    const c = Matter.Constraint.create({ pointA: p, bodyB: b, pointB: { x: p.x - b.position.x, y: p.y - b.position.y }, stiffness: 0.1, damping: 0.08, length: 0 });
    Matter.Composite.add(engine.current.world, c);
    grab.current = { c, i, x: ev.clientX, y: ev.clientY, moved: false };
  };
  const move = (ev: ReactPointerEvent) => {
    const g = grab.current;
    if (!g) return;
    if (Math.hypot(ev.clientX - g.x, ev.clientY - g.y) > 6) g.moved = true;
    if (g.c) g.c.pointA = local(ev.clientX, ev.clientY);
  };
  const up = () => {
    const g = grab.current;
    if (!g) return;
    if (g.c && engine.current) Matter.Composite.remove(engine.current.world, g.c);
    grab.current = null;
    if (!g.moved) setOpen(g.i);
  };
  // Keyboard activation (detail 0) always opens; in List view a plain click does too.
  const clickCard = (i: number) => (e: ReactMouseEvent) => {
    if (viewRef.current === "list" || e.detail === 0) setOpen(i);
  };
  const press = (action: "updates" | "docs", entry?: ChangelogEntry) => (e: ReactMouseEvent) => {
    e.preventDefault();
    onAction?.(action, entry);
  };

  const counts: Record<Filter, number> = { All: entries.length, New: 0, Improved: 0, Fixed: 0 };
  entries.forEach((e) => counts[e.kind]++);
  const isShown = (e: ChangelogEntry) => filter === "All" || e.kind === filter;
  const note = open !== null ? entries[open] : undefined;
  const pile = view === "pile";

  return (
    <section
      aria-labelledby={headingId}
      className={cn("@container w-full bg-white dark:bg-black", className)}
      onPointerDownCapture={() => {
        touched.current = true;
      }}
      onKeyDownCapture={() => {
        touched.current = true;
      }}
    >
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-6 p-5 @xl:p-8 @4xl:grid-cols-[280px_1fr] @4xl:gap-10 @4xl:p-10">
        <div className="flex flex-col gap-5">
          <div>
            <p className="m-0 text-[13px] font-semibold text-[#0071e3] dark:text-[#0a84ff]">{eyebrow}</p>
            <h2 id={headingId} className={cn("m-0 mt-1 text-[clamp(28px,3.4cqi,38px)] font-semibold leading-[1.05] tracking-[-0.035em]", ink)}>
              {title}
            </h2>
            <p className={cn("m-0 mt-2 text-[15px] leading-[1.45]", muted)}>{description}</p>
          </div>
          <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const on = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    changeFilter(f);
                    setSaid(`Showing ${counts[f]} ${f === "All" ? "" : `${f} `}${counts[f] === 1 ? "entry" : "entries"}`);
                  }}
                  className={cn(
                    "relative flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium",
                    focusRing,
                    on ? "text-white dark:text-black" : cn(ink, "hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1e]"),
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId={`${uid}-filter`}
                      className="absolute inset-0 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }}
                    />
                  )}
                  <span className="relative">{f}</span>
                  <span className={cn("relative tabular-nums", on ? "text-white/60 dark:text-black/60" : muted)}>{counts[f]}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label="View" className="relative flex rounded-full bg-[#f0f0f3] p-[3px] dark:bg-[#1c1c1e]">
              {(["pile", "list"] as const).map((v) => {
                const on = view === v;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      changeView(v);
                      setSaid(v === "list" ? "List view" : "Pile view");
                    }}
                    className={cn(
                      "relative h-8 rounded-full px-4 text-[13px] font-medium",
                      focusRing,
                      on ? ink : "text-[#636366] dark:text-[#a1a1a6]",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId={`${uid}-view`}
                        className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.15)] dark:bg-[#3a3a3c] dark:shadow-none"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }}
                      />
                    )}
                    <span className="relative">{v === "pile" ? "Pile" : "List"}</span>
                  </button>
                );
              })}
            </div>
            <a
              href="#"
              onClick={press("updates")}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#0071e3] hover:bg-[#f5f5f7] dark:text-[#0a84ff] dark:hover:bg-[#1c1c1e]",
                focusRing,
              )}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M5 11a8 8 0 018 8M5 5a14 14 0 0114 14" />
                <circle cx="6" cy="18" r="1.6" fill="currentColor" />
              </svg>
              {updatesLabel}
            </a>
          </div>
          <p className="sr-only" aria-live="polite">
            {said}
          </p>
        </div>

        <div
          ref={tray}
          className={cn(
            "relative h-[580px] w-full overflow-hidden rounded-[24px] bg-[#f5f5f7] shadow-[inset_0_2px_8px_rgba(0,0,0,.06)] dark:bg-[#1c1c1e] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,.6)]",
            pile && "touch-none select-none",
          )}
          style={{ transition: reduce ? undefined : "height .5s cubic-bezier(.2,.8,.2,1)" }}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onScroll={(e) => {
            // focus can scroll an overflow-hidden box; the cards are positioned by transform, so keep it at 0
            e.currentTarget.scrollTop = 0;
            e.currentTarget.scrollLeft = 0;
          }}
        >
          <ul className="m-0 list-none p-0" aria-label={`${title}: ${view === "list" ? "list" : "pile"} of release notes`}>
            {entries.map((e, i) => {
              const on = isShown(e);
              return (
                <li
                  key={`${i}-${e.title}`}
                  ref={(el) => {
                    els.current[i] = el;
                  }}
                  inert={!on}
                  aria-hidden={on ? undefined : true}
                  className="absolute left-0 top-0 will-change-transform"
                  style={{ width: cardW, transform: "translate(-400px,-400px)" }}
                >
                  <button
                    ref={(el) => {
                      btns.current[i] = el;
                    }}
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={`${e.kind}, version ${e.version}, ${e.date}: ${e.title}. ${e.body}`}
                    onPointerDown={down(i)}
                    onClick={clickCard(i)}
                    className={cn(
                      "flex w-full flex-col gap-2 rounded-[16px] bg-white p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,.06),0_10px_24px_-14px_rgba(0,0,0,.35),0_0_0_1px_rgba(0,0,0,.04)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_#3a3a3c,0_10px_24px_-14px_rgba(0,0,0,.9)]",
                      focusRing,
                      pile ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                    )}
                  >
                    <span className="flex items-center gap-2 text-[11px]">
                      <Badge kind={e.kind} />
                      <span className={cn("tabular-nums", muted)}>
                        v{e.version} · {e.date}
                      </span>
                    </span>
                    <span className={cn("text-[15px] font-semibold tracking-[-0.01em]", ink)}>{e.title}</span>
                    <span className={cn("text-[13px] leading-[1.4]", muted)}>{e.body}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <AnimatePresence>
            {note && (
              <motion.div
                key="note"
                className="absolute inset-0 z-10 flex items-center justify-center bg-[#f5f5f7]/70 p-5 backdrop-blur-sm dark:bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: 0.15 } : undefined}
                onClick={close}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`${uid}-note`}
                  className="w-[420px] max-w-full rounded-[22px] bg-white p-6 shadow-[0_30px_60px_-24px_rgba(0,0,0,.4),0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_30px_60px_-24px_rgba(0,0,0,.9),0_0_0_1px_#3a3a3c]"
                  initial={reduce ? { opacity: 0 } : { y: 30, scale: 0.94, rotate: -2 }}
                  animate={reduce ? { opacity: 1 } : { y: 0, scale: 1, rotate: 0 }}
                  exit={reduce ? { opacity: 0 } : { y: 20, scale: 0.96, opacity: 0 }}
                  transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 28 }}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={trapTab}
                >
                  <span className="flex items-center gap-2 text-[12px]">
                    <Badge kind={note.kind} />
                    <span className={cn("tabular-nums", muted)}>
                      Version {note.version} · {note.date}
                    </span>
                  </span>
                  <h3 id={`${uid}-note`} className={cn("m-0 mt-3 text-[24px] font-semibold tracking-[-0.025em]", ink)}>
                    {note.title}
                  </h3>
                  <p className={cn("m-0 mt-2 text-[15px] leading-[1.5]", ink)}>{note.body}</p>
                  <p className={cn("m-0 mt-2 text-[15px] leading-[1.5]", muted)}>{note.more}</p>
                  <div className="mt-5 flex gap-2">
                    <button
                      ref={closeBtn}
                      type="button"
                      onClick={close}
                      className="h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-black dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
                    >
                      Close
                    </button>
                    <a
                      ref={docsLink}
                      href="#"
                      onClick={press("docs", note)}
                      className={cn(
                        "flex h-9 items-center rounded-full px-4 text-[13px] font-medium text-[#0071e3] hover:bg-[#f5f5f7] dark:text-[#0a84ff] dark:hover:bg-[#2c2c2e]",
                        focusRing,
                      )}
                    >
                      {docsLabel}
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
