# Consent Dock

Add the "Consent Dock" component from Nexus UI to my project.

The cookie banner every site needs, without the nag. Choose, and the banner drains into a small button in the corner; customise, and the switches fall in a domino run before it closes. The button is a physical thing: throw it and it flies to whichever corner you aimed at, the way a picture-in-picture video does on iPhone, and it stretches if you pull it off the edge. Tap it to grow the preferences back out of it. Arrow keys move it between corners, and the choice can be saved to localStorage. It records the choice and hands it to onChange; it does not load or block any scripts itself, so wire onChange to your analytics. Until you touch it, it plays through a choice and a few throws on its own.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ConsentDock } from "@/components/consent-dock";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/consent-dock/consent-dock.tsx ---

```tsx
"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICON = {
  hand_raised_fill: "<path fill=\"currentColor\" d=\"M9.121 36.25c0 11.555 6.399 16.734 15.328 16.734c5.672 0 9.89-1.875 13.266-5.414c4.687-4.968 6.234-12.492 7.125-15.445c.703-2.32 2.039-5.297 2.039-6.867c0-1.008-1.336-1.899-2.227-1.899c-2.015 0-2.765.914-3.96 3.446c-1.313 2.789-2.907 7.992-4.172 7.992c-.727 0-.985-1.29-.985-3.75V8.43c0-1.242-.75-2.367-2.344-2.367c-1.57 0-2.343 1.125-2.343 2.367v18.515c-.75-.21-1.617-.375-2.555-.515V5.36c0-1.243-.773-2.344-2.344-2.344s-2.344 1.101-2.344 2.343v20.907c-.867.047-1.71.14-2.554.28V7.165c0-1.242-.797-2.367-2.344-2.367s-2.344 1.125-2.344 2.367V27.86a16.3 16.3 0 0 0-2.554 1.313v-14.72c0-1.242-.727-2.367-2.297-2.367c-1.617 0-2.39 1.125-2.39 2.367Z\"/>",
  checkmark_shield_fill: "<path fill=\"currentColor\" d=\"M27.988 51.297c.375 0 .961-.14 1.57-.445C42.66 43.469 47.185 40.375 47.185 31.96V14.289c0-2.414-1.055-3.187-3-4.008c-2.743-1.125-11.532-4.289-14.25-5.25c-.633-.187-1.266-.328-1.946-.328c-.656 0-1.289.14-1.922.328c-2.718.985-11.507 4.149-14.25 5.25c-1.945.797-3 1.594-3 4.008v17.672c0 8.414 4.547 11.484 17.625 18.89c.61.305 1.172.446 1.547.446M24.801 39.39c-.797 0-1.43-.352-2.086-1.149l-6.75-8.344c-.352-.445-.563-1.007-.563-1.523c0-1.102.844-1.945 1.899-1.945c.656 0 1.242.258 1.805.984l5.601 7.242l10.875-17.46c.469-.727 1.078-1.079 1.688-1.079c1.03 0 2.015.68 2.015 1.805c0 .515-.281 1.078-.586 1.547L26.77 38.242c-.492.774-1.171 1.149-1.968 1.149\"/>",
  lock_fill: "<path fill=\"currentColor\" d=\"M28 4.258c-6.54 0-12.516 4.664-12.516 14.25v5.625c-2.53.305-3.773 1.828-3.773 4.828v17.883c0 3.375 1.547 4.898 4.664 4.898h23.25c3.117 0 4.664-1.523 4.664-4.898V28.938c0-3-1.242-4.594-3.773-4.875v-5.555c0-9.586-5.977-14.25-12.516-14.25m-8.742 13.734c0-6.539 3.89-10.125 8.742-10.125s8.742 3.586 8.742 10.125v6.047l-17.484.023Z\"/>",
  chart_bar_fill: "<path fill=\"currentColor\" d=\"M44.724 49.251h6.641c3.075 0 4.635-1.47 4.635-4.39v-32.4c0-2.92-1.56-4.413-4.635-4.413h-6.64c-3.053 0-4.636 1.493-4.636 4.412v32.402c0 2.919 1.583 4.39 4.635 4.39m-20.055 0h6.64c3.076 0 4.658-1.47 4.658-4.39V18.968c0-2.919-1.582-4.412-4.658-4.412h-6.64c-3.053 0-4.613 1.493-4.613 4.412v25.895c0 2.919 1.56 4.39 4.613 4.39m-20.034 0h6.64c3.076 0 4.636-1.47 4.636-4.39v-19.41c0-2.92-1.56-4.412-4.635-4.412h-6.64C1.581 21.04 0 22.533 0 25.452v19.41c0 2.919 1.582 4.39 4.635 4.39\"/>",
  tag_fill: "<path fill=\"currentColor\" d=\"M26.113 51.215c3.352 3.351 6.797 3.398 10.243-.024L51.19 36.38c3.422-3.422 3.375-6.89.024-10.242L28.293 3.262c-1.758-1.758-2.742-1.875-5.227-1.875H14.16c-2.484 0-3.258.61-5.015 2.367l-5.391 5.39c-1.781 1.782-2.367 2.555-2.367 5.04v8.906c0 2.46.093 3.469 1.875 5.226Zm-8.015-31.078c-1.828 0-3.211-1.43-3.211-3.211c0-1.805 1.383-3.211 3.21-3.211c1.829 0 3.212 1.406 3.212 3.21c0 1.782-1.383 3.212-3.211 3.212\"/>",
  sparkles: "<path fill=\"currentColor\" d=\"M26.688 12.66c.28 0 .421-.164.492-.422c.726-3.914.68-4.008 4.758-4.781c.28-.047.445-.21.445-.492c0-.281-.164-.445-.446-.492c-4.054-.82-3.937-.914-4.757-4.782c-.07-.257-.211-.421-.492-.421s-.422.164-.493.421c-.82 3.868-.68 3.961-4.757 4.782c-.258.046-.446.21-.446.492c0 .281.188.445.445.492c4.079.82 4.032.867 4.758 4.781c.07.258.211.422.492.422M15.344 28.785c.445 0 .75-.281.797-.703c.843-6.258 1.054-6.258 7.523-7.5c.422-.07.727-.352.727-.797c0-.422-.305-.726-.727-.797c-6.469-.89-6.703-1.101-7.523-7.476c-.047-.422-.352-.727-.797-.727c-.422 0-.727.305-.774.75c-.773 6.281-1.101 6.258-7.523 7.453c-.422.094-.727.375-.727.797c0 .469.305.727.82.797c6.376 1.031 6.657 1.195 7.43 7.453c.047.469.352.75.774.75m15.89 25.946c.61 0 1.055-.446 1.172-1.079c1.664-12.843 3.469-14.789 16.172-16.195c.656-.07 1.102-.562 1.102-1.172s-.446-1.078-1.102-1.172c-12.703-1.406-14.508-3.351-16.172-16.195c-.117-.633-.562-1.055-1.172-1.055s-1.054.422-1.148 1.055c-1.664 12.844-3.492 14.789-16.172 16.195c-.68.094-1.125.563-1.125 1.172c0 .61.445 1.102 1.125 1.172c12.656 1.664 14.414 3.375 16.172 16.195c.094.633.539 1.078 1.148 1.078\"/>",
  slider_horizontal_3: "<path fill=\"currentColor\" d=\"M36.402 19.316A5.65 5.65 0 0 0 41.7 15.59h8.11c.96 0 1.804-.844 1.804-1.899c0-1.054-.843-1.875-1.804-1.875h-8.086c-.797-2.18-2.883-3.773-5.32-3.773s-4.524 1.594-5.298 3.773H6.285c-1.055 0-1.898.82-1.898 1.875a1.89 1.89 0 0 0 1.898 1.899h24.82a5.65 5.65 0 0 0 5.297 3.726m0-2.882c-1.523 0-2.742-1.22-2.742-2.766a2.716 2.716 0 0 1 2.742-2.742c1.547 0 2.742 1.195 2.742 2.742s-1.195 2.766-2.742 2.766m-30.21 9.68c-.962 0-1.805.843-1.805 1.898s.843 1.875 1.804 1.875h8.368c.773 2.203 2.859 3.773 5.296 3.773a5.63 5.63 0 0 0 5.32-3.773h24.54c1.054 0 1.898-.82 1.898-1.875a1.89 1.89 0 0 0-1.898-1.899h-24.54c-.796-2.156-2.882-3.726-5.32-3.726c-2.414 0-4.5 1.57-5.296 3.726Zm13.663 4.64a2.73 2.73 0 0 1-2.742-2.742a2.716 2.716 0 0 1 2.742-2.742c1.57 0 2.743 1.195 2.743 2.742c0 1.523-1.172 2.742-2.743 2.742m16.547 17.203c2.438 0 4.524-1.57 5.297-3.75h8.11c.96 0 1.804-.82 1.804-1.875s-.843-1.898-1.804-1.898h-8.11a5.62 5.62 0 0 0-5.297-3.727a5.62 5.62 0 0 0-5.297 3.727H6.285a1.89 1.89 0 0 0-1.898 1.898c0 1.055.843 1.875 1.898 1.875h24.82c.774 2.18 2.86 3.75 5.297 3.75m0-2.883a2.73 2.73 0 0 1-2.742-2.742c0-1.57 1.219-2.742 2.742-2.742c1.547 0 2.742 1.172 2.742 2.742a2.716 2.716 0 0 1-2.742 2.742\"/>",
  checkmark: "<path fill=\"currentColor\" d=\"M23.078 48.027c1.008 0 1.805-.445 2.367-1.312L47.594 11.84c.422-.68.61-1.195.61-1.735c0-1.289-.868-2.132-2.157-2.132c-.914 0-1.453.304-2.016 1.195L22.984 42.707L12.062 28.41c-.585-.82-1.148-1.148-2.015-1.148c-1.313 0-2.25.914-2.25 2.203c0 .539.234 1.148.68 1.71L20.64 46.669c.726.914 1.43 1.36 2.437 1.36\"/>",
} as const;

type IconName = keyof typeof ICON;
function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true" className="pointer-events-none" dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

export type Consent = { necessary: true; analytics: boolean; marketing: boolean; personalisation: boolean };
type Optional = Omit<Consent, "necessary">;
type Corner = "bl" | "br" | "tl" | "tr";
const CORNERS: Corner[] = ["bl", "br", "tl", "tr"];

const CATS: { key: keyof Consent; label: string; text: string; icon: IconName; locked?: boolean }[] = [
  { key: "necessary", label: "Necessary", text: "Sign-in, your basket and security.", icon: "lock_fill", locked: true },
  { key: "analytics", label: "Analytics", text: "Anonymous counts of what gets read.", icon: "chart_bar_fill" },
  { key: "marketing", label: "Marketing", text: "Which ads brought you here.", icon: "tag_fill" },
  { key: "personalisation", label: "Personalisation", text: "Suggestions from what you browsed.", icon: "sparkles" },
];
const OPTIONAL: (keyof Optional)[] = ["analytics", "marketing", "personalisation"];

const M = 16; // distance from the edges
const P = 48; // the docked button
const R = 24; // panel corner radius
const OPEN = { type: "spring", stiffness: 300, damping: 30 } as const;
const SNAP = { type: "spring", stiffness: 240, damping: 23 } as const;
const PRESS = { type: "spring", stiffness: 520, damping: 30 } as const;

const rubber = (o: number) => 40 * (1 - Math.exp(-o / 90));
const NONE: Optional = { analytics: false, marketing: false, personalisation: false };

/** an iOS switch: the knob widens while you hold it */
function Switch({ on, locked, label, tabbable, onToggle }: { on: boolean; locked?: boolean; label: string; tabbable: boolean; onToggle: () => void }) {
  const [press, setPress] = useState(false);
  const held = press && !locked;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      aria-disabled={locked || undefined}
      tabIndex={tabbable ? 0 : -1}
      onClick={() => !locked && onToggle()}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      onPointerLeave={() => setPress(false)}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full border-0 p-0 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 ${locked ? "cursor-default" : "cursor-pointer"}`}
      style={{ background: on ? (locked ? "#9fe2b1" : "#30d158") : "#e9e9eb" }}
    >
      <motion.span
        className="absolute left-[2px] top-[2px] block h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,.15),0_1px_1px_rgba(0,0,0,.16)]"
        initial={false}
        animate={{ x: on ? (held ? 16 : 20) : 0, width: held ? 31 : 27 }}
        transition={{ type: "spring", stiffness: 520, damping: 32 }}
      />
    </button>
  );
}

/** a page to sit on, for the contained demo */
function DemoPage() {
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-black/[.06] px-6 py-4">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">Northwind Coffee</span>
        <span className="hidden gap-5 text-[13px] text-[#6e6e73] sm:flex">
          <span>Shop</span>
          <span>Subscriptions</span>
          <span>Journal</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center px-8 pt-12 text-center">
        <p className="m-0 text-[13px] font-medium text-[#b25000]">New this week</p>
        <h3 className="m-0 mt-2 text-[clamp(26px,4vw,36px)] font-semibold leading-[1.08] tracking-[-0.03em] text-[#1d1d1f]">
          Fresh roasts,
          <br />
          every Monday.
        </h3>
        <p className="m-0 mt-3 max-w-[340px] text-[15px] leading-[1.45] text-[#6e6e73]">Single-origin beans, roasted on Sunday and at your door the next day.</p>
      </div>
    </div>
  );
}

/**
 * Consent Dock: the cookie banner every site needs, without the nag. Choose
 * and the banner drains into a small button in the corner; customise and the
 * switches fall in a domino run before it closes. The button is a physical
 * thing: throw it and it flies to whichever corner you aimed at, the way a
 * picture-in-picture video does on iPhone, and it stretches if you pull it off
 * the edge. Tap it to grow the preferences back out of it. Arrow keys move it
 * between corners; the choice can be saved to localStorage.
 */
export function ConsentDock({
  contained = false,
  corner: startCorner = "bl",
  storageKey,
  title = "Cookies, your call.",
  text = "We use a few to keep the site working and, if you allow it, to learn what is useful. Change your mind any time from the button in the corner.",
  autoplay = false,
  onChange,
  children,
  className = "",
}: {
  /** sit inside a box of its own (with `children` as the page) instead of over the whole window */
  contained?: boolean;
  corner?: Corner;
  /** remember the choice in localStorage under this key */
  storageKey?: string;
  title?: string;
  text?: string;
  /** play through a choice and a few throws by itself until the first interaction */
  autoplay?: boolean;
  onChange?: (consent: Consent) => void;
  /** the page behind, in contained mode */
  children?: ReactNode;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const layer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLButtonElement>(null);
  const inView = useInView(layer, { amount: 0.4 });
  const touched = useRef(false);

  const [size, setSize] = useState({ w: 640, h: 440 });
  const sizeRef = useRef(size);
  const [corner, setCorner] = useState<Corner>(startCorner);
  const cornerRef = useRef(corner);
  // handlers and the throw physics read these; keep them current as soon as the layout commits
  useLayoutEffect(() => {
    sizeRef.current = size;
    cornerRef.current = corner;
  });
  const [view, setView] = useState<"banner" | "custom">("banner");
  const [decided, setDecided] = useState<Consent | null>(null);
  const [draft, setDraftState] = useState<Optional>(NONE);
  const draftRef = useRef(draft);
  const setDraft = (d: Optional) => {
    draftRef.current = d;
    setDraftState(d);
  };
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pop, setPop] = useState(0);
  const [said, setSaid] = useState("");

  const t = useMotionValue(1); // 1 open, 0 docked
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ph = useMotionValue(190);
  const cmv = useMotionValue(CORNERS.indexOf(startCorner));
  const lift = useMotionValue(1);

  const PW = Math.max(P, Math.min(372, size.w - 2 * M));

  // the layer we live in: our own box when contained, the window otherwise
  useLayoutEffect(() => {
    const el = layer.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the panel's height follows its content
  const first = useRef(true);
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      if (first.current || reduced) {
        first.current = false;
        ph.set(h);
      } else animate(ph, h, OPEN);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ph, reduced]);

  // a remembered choice starts docked
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const c = JSON.parse(raw) as Consent;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage only exists in the browser, so a saved choice is read after mount
      setDecided({ ...c, necessary: true });
      setDraft({ analytics: !!c.analytics, marketing: !!c.marketing, personalisation: !!c.personalisation });
      setView("custom");
      setOpen(false);
      t.set(0);
    } catch {
      /* storage blocked: ask again */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  /* ---------------------------------------------------------------- shape */
  const clip = useTransform(() => {
    const k = 1 - t.get();
    const H = ph.get();
    const c = CORNERS[Math.round(cmv.get())];
    const left = c[1] === "l" ? 0 : (PW - P) * k;
    const right = c[1] === "l" ? (PW - P) * k : 0;
    const top = c[0] === "t" ? 0 : Math.max(0, H - P) * k;
    const bottom = c[0] === "t" ? Math.max(0, H - P) * k : 0;
    const rad = P / 2 + (R - P / 2) * t.get();
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${rad}px)`;
  });
  const origin = useTransform(() => {
    const c = CORNERS[Math.round(cmv.get())];
    return `${c[1] === "l" ? P / 2 : PW - P / 2}px ${c[0] === "t" ? P / 2 : ph.get() - P / 2}px`;
  });
  const contentOpacity = useTransform(t, [0.5, 0.95], [0, 1]);
  const pillOpacity = useTransform(t, [0, 0.28], [1, 0]);
  const shadow = useTransform(lift, [1, 1.1], ["drop-shadow(0 10px 24px rgba(0,0,0,.16)) drop-shadow(0 0 .5px rgba(0,0,0,.3))", "drop-shadow(0 22px 34px rgba(0,0,0,.24)) drop-shadow(0 0 .5px rgba(0,0,0,.3))"]);

  const rest = useCallback((c: Corner) => {
    const { w, h } = sizeRef.current;
    return { x: c[1] === "l" ? M : w - M - P, y: c[0] === "t" ? M : h - M - P };
  }, []);

  /* ---------------------------------------------------- open and closing */
  const setT = (to: number) => {
    if (reduced) t.set(to);
    else animate(t, to, OPEN);
  };
  const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, reduced ? 0 : ms));

  const commit = (c: Optional, how: string) => {
    const consent: Consent = { necessary: true, ...c };
    setDecided(consent);
    setDraft(c);
    onChange?.(consent);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(consent));
      } catch {
        /* private mode */
      }
    }
    setSaid(how);
    setOpen(false);
    setT(0);
    setPop((p) => p + 1);
    if (touched.current) window.setTimeout(() => pill.current?.focus({ preventScroll: true }), 420);
  };

  const domino = async (val: boolean) => {
    setBusy(true);
    for (const k of OPTIONAL) {
      if (draftRef.current[k] !== val) {
        setDraft({ ...draftRef.current, [k]: val });
        await wait(120);
      }
    }
    await wait(340);
    setBusy(false);
    commit({ analytics: val, marketing: val, personalisation: val }, val ? "All cookies allowed." : "Only necessary cookies.");
  };

  const all = (val: boolean) => {
    if (busy) return;
    if (view === "custom" && open) void domino(val);
    else commit({ analytics: val, marketing: val, personalisation: val }, val ? "All cookies allowed." : "Only necessary cookies.");
  };

  const reopen = () => {
    setView("custom");
    if (decided) setDraft({ analytics: decided.analytics, marketing: decided.marketing, personalisation: decided.personalisation });
    setOpen(true);
    setT(1);
    if (touched.current) window.setTimeout(() => layer.current?.querySelector<HTMLElement>(`#${uid}-title`)?.focus({ preventScroll: true }), 60);
  };

  /* ------------------------------------------------- throwing the button */
  const pending = useRef<{ off: { x: number; y: number }; v: { x: number; y: number } } | null>(null);
  const snapTo = (c: Corner, v: { x: number; y: number }) => {
    const from = rest(cornerRef.current);
    const cur = { x: from.x + x.get(), y: from.y + y.get() };
    const to = rest(c);
    const run = (off: { x: number; y: number }) => {
      x.set(off.x);
      y.set(off.y);
      cmv.set(CORNERS.indexOf(c));
      if (reduced) {
        x.set(0);
        y.set(0);
      } else {
        animate(x, 0, { ...SNAP, velocity: v.x });
        animate(y, 0, { ...SNAP, velocity: v.y });
      }
      animate(lift, 1, PRESS);
    };
    if (c === cornerRef.current) run({ x: cur.x - to.x, y: cur.y - to.y });
    else {
      pending.current = { off: { x: cur.x - to.x, y: cur.y - to.y }, v };
      setCorner(c);
    }
  };
  // the new corner is in the DOM: hold the button where it was, then let it fly
  useLayoutEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    x.set(p.off.x);
    y.set(p.off.y);
    cmv.set(CORNERS.indexOf(corner));
    if (reduced) {
      x.set(0);
      y.set(0);
    } else {
      animate(x, 0, { ...SNAP, velocity: p.v.x });
      animate(y, 0, { ...SNAP, velocity: p.v.y });
    }
    animate(lift, 1, PRESS);
  }, [corner, x, y, cmv, lift, reduced]);

  const drag = useRef<{ id: number; x0: number; y0: number; ox: number; oy: number; moved: boolean; s: { t: number; x: number; y: number }[] } | null>(null);
  const onDown = (e: RPointerEvent<HTMLButtonElement>) => {
    touched.current = true;
    if (e.button !== 0 || open) return;
    x.stop();
    y.stop();
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ox: x.get(), oy: y.get(), moved: false, s: [{ t: performance.now(), x: e.clientX, y: e.clientY }] };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(true);
      animate(lift, 1.1, PRESS);
    }
    const now = performance.now();
    d.s.push({ t: now, x: e.clientX, y: e.clientY });
    while (d.s.length > 2 && now - d.s[0].t > 90) d.s.shift();
    const r0 = rest(cornerRef.current);
    const { w, h } = sizeRef.current;
    // free inside the box, stretchy past its edges
    const band = (v: number, lo: number, hi: number) => (v < lo ? lo - rubber(lo - v) : v > hi ? hi + rubber(v - hi) : v);
    const px = band(r0.x + d.ox + dx, 0, w - P);
    const py = band(r0.y + d.oy + dy, 0, h - P);
    x.set(px - r0.x);
    y.set(py - r0.y);
  };
  const onUp = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!d.moved) {
      reopen();
      return;
    }
    setDragging(false);
    const a = d.s[0];
    const b = d.s[d.s.length - 1];
    const fresh = performance.now() - b.t < 60 && b.t > a.t;
    const v = fresh ? { x: ((b.x - a.x) / (b.t - a.t)) * 1000, y: ((b.y - a.y) / (b.t - a.t)) * 1000 } : { x: 0, y: 0 };
    const r0 = rest(cornerRef.current);
    const { w, h } = sizeRef.current;
    // where the throw would carry it, like picture in picture on iPhone
    const px = r0.x + x.get() + P / 2 + v.x * 0.24;
    const py = r0.y + y.get() + P / 2 + v.y * 0.24;
    const c = `${py < h / 2 ? "t" : "b"}${px < w / 2 ? "l" : "r"}` as Corner;
    snapTo(c, v);
  };
  const onPillKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    touched.current = true;
    const c = cornerRef.current;
    const map: Record<string, Corner> = {
      ArrowLeft: `${c[0]}l` as Corner,
      ArrowRight: `${c[0]}r` as Corner,
      ArrowUp: `t${c[1]}` as Corner,
      ArrowDown: `b${c[1]}` as Corner,
    };
    const next = map[e.key];
    if (!next) return;
    e.preventDefault();
    if (next === c) return;
    const a = rest(c);
    const b = rest(next);
    snapTo(next, { x: (b.x - a.x) * 2.2, y: (b.y - a.y) * 2.2 });
  };

  const onPanelKey = (e: KeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    if (e.key === "Escape" && decided) {
      e.preventDefault();
      setOpen(false);
      setT(0);
      window.setTimeout(() => pill.current?.focus({ preventScroll: true }), 300);
    }
  };

  /* ------------------------------------------------------------ autoplay */
  useEffect(() => {
    if (!autoplay || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const pause = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
    const toss = async (c: Corner) => {
      animate(lift, 1.1, PRESS);
      await pause(160);
      if (!ok()) return;
      const a = rest(cornerRef.current);
      const b = rest(c);
      snapTo(c, { x: (b.x - a.x) * 2.6, y: (b.y - a.y) * 2.6 });
    };
    (async () => {
      await pause(1300);
      while (ok()) {
        setView("custom");
        await pause(1100);
        if (!ok()) return;
        setDraft({ ...draftRef.current, analytics: true });
        await pause(800);
        if (!ok()) return;
        await domino(true);
        await pause(1300);
        if (!ok()) return;
        await toss("tr");
        await pause(1400);
        if (!ok()) return;
        await toss("br");
        await pause(1300);
        if (!ok()) return;
        reopen();
        await pause(1500);
        if (!ok()) return;
        await domino(false);
        await pause(1300);
        if (!ok()) return;
        await toss("bl");
        await pause(1300);
        if (!ok()) return;
        // start over: a first visit again
        setDecided(null);
        setDraft(NONE);
        setView("banner");
        setOpen(true);
        setT(1);
        await pause(2200);
      }
    })();
    return () => {
      alive = false;
    };
    // a fixed script
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  /* --------------------------------------------------------------- render */
  const anchor: Record<string, number> = { [corner[1] === "l" ? "left" : "right"]: M, [corner[0] === "t" ? "top" : "bottom"]: M };
  const tab = open;
  const btn = "inline-flex h-10 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border-0 px-3.5 text-[14px] font-medium outline-none [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2";

  const dock = (
    <div ref={layer} className={contained ? "pointer-events-none absolute inset-0 overflow-hidden" : "pointer-events-none fixed inset-0 z-[2147483000]"}>
      <motion.div
        className="absolute"
        style={{ ...anchor, width: PW, height: ph, x, y, scale: lift, transformOrigin: origin, filter: shadow }}
      >
        <motion.div className="absolute inset-0 overflow-hidden bg-white" style={{ clipPath: clip, WebkitClipPath: clip }}>
          <motion.div
            ref={inner}
            role="dialog"
            aria-modal="false"
            aria-labelledby={`${uid}-title`}
            aria-hidden={!open}
            onKeyDown={onPanelKey}
            className={`absolute inset-x-0 top-0 ${open ? "pointer-events-auto" : ""}`}
            style={{ opacity: contentOpacity }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {view === "banner" ? (
                <motion.div key="banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f5f5f7] text-[#1d1d1f]">
                      <Icon name="hand_raised_fill" size={18} />
                    </span>
                    <h3 id={`${uid}-title`} tabIndex={-1} className="m-0 text-[17px] font-semibold tracking-[-0.015em] text-[#1d1d1f] outline-none">
                      {title}
                    </h3>
                  </div>
                  <p className="m-0 mt-3 text-[13.5px] leading-[1.45] text-[#6e6e73]">{text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <motion.button type="button" tabIndex={tab ? 0 : -1} whileTap={{ scale: 0.95 }} onClick={() => ((touched.current = true), all(false))} className={`${btn} bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]`}>
                      Reject all
                    </motion.button>
                    <motion.button type="button" tabIndex={tab ? 0 : -1} whileTap={{ scale: 0.95 }} onClick={() => ((touched.current = true), setView("custom"))} className={`${btn} gap-1.5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]`}>
                      <Icon name="slider_horizontal_3" size={15} />
                      Customise
                    </motion.button>
                    <motion.button type="button" tabIndex={tab ? 0 : -1} whileTap={{ scale: 0.95 }} onClick={() => ((touched.current = true), all(true))} className={`${btn} flex-1 bg-[#0071e3] text-white hover:bg-[#0077ed]`}>
                      Accept all
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} className="p-5">
                  <h3 id={`${uid}-title`} tabIndex={-1} className="m-0 text-[17px] font-semibold tracking-[-0.015em] text-[#1d1d1f] outline-none">
                    Cookie preferences
                  </h3>
                  <p className="m-0 mt-1 text-[13px] text-[#6e6e73]">Choose what this site may use.</p>
                  <ul className="m-0 mt-3 flex list-none flex-col p-0">
                    {CATS.map((c, i) => {
                      const on = c.key === "necessary" ? true : draft[c.key as keyof Optional];
                      return (
                        <li key={c.key} className={`flex items-center gap-3 py-2.5 ${i ? "border-t border-black/[.06]" : ""}`}>
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#f5f5f7] text-[#1d1d1f]">
                            <Icon name={c.icon} size={15} />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-[14px] font-medium text-[#1d1d1f]">{c.label}</span>
                            <span className="truncate text-[12.5px] text-[#86868b]">{c.text}</span>
                          </span>
                          <Switch
                            on={on}
                            locked={c.locked}
                            label={c.label}
                            tabbable={tab}
                            onToggle={() => {
                              touched.current = true;
                              if (!busy) setDraft({ ...draftRef.current, [c.key]: !on });
                            }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                    <button type="button" tabIndex={tab ? 0 : -1} onClick={() => ((touched.current = true), all(false))} className={`${btn} mr-auto bg-transparent !px-1 text-[#0066cc] hover:underline`}>
                      Reject all
                    </button>
                    <motion.button
                      type="button"
                      tabIndex={tab ? 0 : -1}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        touched.current = true;
                        if (!busy) commit(draftRef.current, "Choices saved.");
                      }}
                      className={`${btn} bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]`}
                    >
                      Save
                    </motion.button>
                    <motion.button type="button" tabIndex={tab ? 0 : -1} whileTap={{ scale: 0.95 }} onClick={() => ((touched.current = true), all(true))} className={`${btn} bg-[#0071e3] text-white hover:bg-[#0077ed]`}>
                      Accept all
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* the docked button, at the panel's corner */}
        <motion.button
          ref={pill}
          type="button"
          aria-label="Cookie settings"
          aria-expanded={open}
          aria-hidden={open}
          tabIndex={open ? -1 : 0}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onPillKey}
          onClick={(e) => {
            // keyboard activation (pointer taps are handled on release)
            if (e.detail === 0) {
              touched.current = true;
              reopen();
            }
          }}
          className={`absolute grid h-12 w-12 touch-none place-items-center rounded-full border-0 bg-transparent p-0 text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${open ? "pointer-events-none" : "pointer-events-auto"} ${dragging ? "cursor-grabbing" : "cursor-pointer"}`}
          style={{ [corner[1] === "l" ? "left" : "right"]: 0, [corner[0] === "t" ? "top" : "bottom"]: 0, opacity: pillOpacity }}
        >
          <motion.span key={pop} className="flex" initial={pop ? { scale: 0.4, rotate: -20 } : false} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 520, damping: 14, delay: 0.18 }}>
            <Icon name={decided ? "checkmark_shield_fill" : "hand_raised_fill"} size={22} />
          </motion.span>
        </motion.button>
      </motion.div>
      <span className="sr-only" aria-live="polite">
        {said}
      </span>
    </div>
  );

  if (!contained) return dock;
  return (
    <div className={`relative h-[440px] w-full overflow-hidden rounded-[24px] ${className}`} onPointerDown={() => (touched.current = true)}>
      {children ?? <DemoPage />}
      {dock}
    </div>
  );
}

export default ConsentDock;
```

--- components/consent-dock/index.ts ---

```ts
export { ConsentDock } from "./consent-dock";
export type { Consent } from "./consent-dock";
```
