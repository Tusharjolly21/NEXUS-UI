# Consent Dock

Add the "Consent Dock" component from Nexus UI to my project.

The cookie banner every site needs, without the nag. Choose, and the banner drains into a small button in the corner; customise, and the switches fall in a domino run before it closes. The button is a physical thing: throw it and it flies to whichever corner you aimed at, the way a picture-in-picture video does on iPhone, and it stretches if you pull it off the edge. Tap it to grow the preferences back out of it. Arrow keys move it between corners, and the choice can be saved to localStorage. It records the choice and hands it to onChange; it does not load or block any scripts itself, so wire onChange to your analytics. Until you touch it, it plays through a choice and a few throws on its own. Also includes Privacy Banner, a cookie banner with a real cookie on its corner that loses bites with every choice, and a switch for each kind of cookie under Customize.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ConsentDock } from "@/components/consent-dock/consent-dock";`. The props are typed and documented in the code.

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

# Privacy Banner

Add the "Privacy Banner" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { PrivacyBanner } from "@/components/consent-dock/privacy-banner";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/consent-dock/privacy-banner.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/immutability, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type CookieGroup = {
  id: string;
  name: string;
  detail: string;
  locked?: boolean;
  default?: boolean;
};
export type PrivacyBannerProps = {
  groups?: CookieGroup[];
  /** a photo of a cookie, seen from above; a cut-out on a transparent background looks best */
  cookie?: string;
  title?: string;
  body?: string;
  onSave?: (choices: Record<string, boolean>) => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const I = {
  lock: "M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16M96 56a32 32 0 0 1 64 0v24H96Z",
  sliders:
    "M40 88h33a32 32 0 0 0 62 0h81a8 8 0 0 0 0-16h-81a32 32 0 0 0-62 0H40a8 8 0 0 0 0 16m64-24a16 16 0 1 1-16 16a16 16 0 0 1 16-16m112 104h-17a32 32 0 0 0-62 0H40a8 8 0 0 0 0 16h97a32 32 0 0 0 62 0h17a8 8 0 0 0 0-16m-48 24a16 16 0 1 1 16-16a16 16 0 0 1-16 16",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const DEFAULT_GROUPS: CookieGroup[] = [
  {
    id: "essential",
    name: "Essential",
    detail: "Keep you signed in, hold your basket and protect the site. Always on.",
    locked: true,
    default: true,
  },
  {
    id: "preferences",
    name: "Preferences",
    detail: "Remember your language and display settings.",
    default: true,
  },
  {
    id: "analytics",
    name: "Analytics",
    detail: "Count page visits without identifying you.",
    default: false,
  },
  {
    id: "marketing",
    name: "Marketing",
    detail: "Let ad partners show you our products on other sites.",
    default: false,
  },
];

/** a chocolate chip cookie from above, photo by Matt Reiter on Unsplash, cropped round it */
const COOKIE =
  "https://images.unsplash.com/photo-1611082191524-1c049443f288?fm=jpg&q=85&w=480&h=480&fit=crop&crop=focalpoint&fp-x=0.495&fp-y=0.501&fp-z=2.05";

// bites taken out of the cookie, in the order they are taken: centre and radius in a 64 box
const BITES = [
  { x: 58, y: 16, r: 11 },
  { x: 62, y: 38, r: 10 },
  { x: 44, y: 61, r: 12 },
  { x: 10, y: 52, r: 11 },
  { x: 9, y: 16, r: 13 },
  { x: 32, y: 32, r: 32 },
];
// the scalloped edge of a bite: each bite is a few overlapping circles, the way teeth leave it
const TEETH = [
  [0, 0, 1],
  [0.55, 0.35, 0.62],
  [-0.5, 0.42, 0.6],
  [0.3, -0.6, 0.55],
  [-0.4, -0.5, 0.58],
] as const;

function Cookie({ src, bites, hover, size }: { src: string; bites: number; hover: boolean; size: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      animate={hover && bites === 0 ? { rotate: [0, -8, 6, 0] } : { rotate: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: "block",
        overflow: "visible",
        filter: "drop-shadow(0 6px 6px rgba(70,35,8,0.28)) drop-shadow(0 1px 1px rgba(70,35,8,0.3))",
      }}
    >
      <defs>
        <clipPath id={`cc-${uid}`}>
          <circle cx="32" cy="32" r="31" />
        </clipPath>
        <mask id={`bm-${uid}`}>
          <rect width="64" height="64" fill="#fff" />
          {BITES.slice(0, bites).map((b, i) =>
            TEETH.map(([dx, dy, k], j) => (
              <motion.circle
                key={`${i}-${j}`}
                cx={b.x + dx * b.r * 0.55}
                cy={b.y + dy * b.r * 0.55}
                initial={{ r: 0 }}
                animate={{ r: b.r * k }}
                transition={{
                  type: "spring",
                  stiffness: 600,
                  damping: 22,
                  delay: j * 0.015,
                }}
                fill="#000"
              />
            )),
          )}
        </mask>
      </defs>
      <g mask={`url(#bm-${uid})`}>
        <image
          href={src}
          x="0"
          y="0"
          width="64"
          height="64"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#cc-${uid})`}
        />
      </g>
    </motion.svg>
  );
}

type Crumb = { id: number; x: number; y: number; vx: number; r: number };

/**
 * A cookie consent card with a real cookie on it, a photo sitting on the card's corner. Point at it and it wobbles;
 * every choice takes bites out of it, with crumbs falling: accept everything and most of it goes, reject everything
 * and it loses one small bite. Customize grows the card into a list of switches, one per kind of cookie (the
 * essential ones locked on). A choice turns the card into a confirmation with a check that draws itself, then it
 * tucks away into a small pill that says what you chose and opens the settings again.
 */
export default function PrivacyBanner({
  groups = DEFAULT_GROUPS,
  cookie = COOKIE,
  title = "We use cookies",
  body = "Essential cookies keep you signed in and hold your basket. With your permission we also use a few to see which pages people read.",
  onSave,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: PrivacyBannerProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const initial = useMemo(() => Object.fromEntries(groups.map((g) => [g.id, !!g.default || !!g.locked])), [groups]);
  const [mode, setModeS] = useState<"ask" | "custom" | "done" | "pill">("ask");
  const modeRef = useRef(mode);
  const setMode = (m: typeof mode) => {
    modeRef.current = m;
    setModeS(m);
  };
  const [choice, setChoice] = useState<Record<string, boolean>>(initial);
  const [bites, setBites] = useState(0);
  const [hover, setHover] = useState(false);
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const [verdict, setVerdict] = useState("");
  const touched = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const bite = (k = 1) => {
    if (reduce) {
      setBites((b) => Math.min(BITES.length, b + k));
      return;
    }
    for (let i = 0; i < k; i++)
      timers.current.push(
        window.setTimeout(() => {
          setBites((b) => {
            const nb = Math.min(BITES.length, b + 1);
            const at = BITES[nb - 1];
            if (at) {
              const now = Date.now();
              setCrumbs((cs) => [
                ...cs.slice(-18),
                ...Array.from({ length: 5 }, (_, j) => ({
                  id: now + j + Math.random(),
                  x: at.x * 1.44,
                  y: at.y * 1.44,
                  vx: (Math.random() - 0.5) * 40,
                  r: 1.4 + Math.random() * 2,
                })),
              ]);
            }
            return nb;
          });
          sfx.tick({ freq: 500 + Math.random() * 300, gain: 0.07 });
          sfx.whoosh(3000, 1200, { dur: 0.08, gain: 0.03 });
        }, i * 260),
      );
  };

  const finish = (c: Record<string, boolean>, label: string, bitesTaken: number) => {
    setChoice(c);
    onSave?.(c);
    bite(bitesTaken);
    const on = Object.values(c).filter(Boolean).length;
    setVerdict(label || `${on} of ${groups.length} allowed`);
    timers.current.push(
      window.setTimeout(
        () => {
          setMode("done");
          sfx.note(659, { dur: 0.2, gain: 0.05 });
          sfx.note(988, { at: 0.12, dur: 0.5, gain: 0.05, bell: 0.6 });
        },
        bitesTaken * 260 + 150,
      ),
      window.setTimeout(() => setMode("pill"), bitesTaken * 260 + 2300),
    );
  };
  const acceptAll = () => finish(Object.fromEntries(groups.map((g) => [g.id, true])), "All cookies allowed", 5);
  const rejectAll = () =>
    finish(Object.fromEntries(groups.map((g) => [g.id, !!g.locked])), "Only essential cookies", 1);
  const save = () => {
    const on = Object.values(choice).filter(Boolean).length;
    finish(choice, `${on} of ${groups.length} kinds allowed`, Math.max(1, Math.round((on / groups.length) * 5)));
  };
  const reopen = () => {
    setBites(0);
    setCrumbs([]);
    setMode("custom");
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      await wait(1400);
      while (alive && !touched.current) {
        setHover(true);
        await wait(700);
        setHover(false);
        setMode("custom");
        sfx.whoosh(500, 1200, { dur: 0.3, gain: 0.03 });
        await wait(1200);
        if (!alive || touched.current) return;
        setChoice((c) => ({ ...c, analytics: true }));
        await wait(900);
        if (!alive || touched.current) return;
        save();
        await wait(4200);
        if (!alive || touched.current) return;
        setBites(0);
        setCrumbs([]);
        setChoice(initial);
        setMode("ask");
        await wait(1600);
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const btn = (label: string, onClick: () => void, kind: "ghost" | "soft" | "dark", icon?: string) => (
    <motion.button
      layout
      type="button"
      onClick={() => {
        touched.current = true;
        onClick();
      }}
      whileTap={{ scale: 0.96 }}
      className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
      style={{
        height: 40,
        padding: "0 16px",
        borderRadius: 20,
        border: 0,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background:
          kind === "dark" ? "linear-gradient(180deg,#2c2c2e,#1d1d1f)" : kind === "soft" ? "#f2f2f5" : "transparent",
        color: kind === "dark" ? "#fff" : "#1d1d1f",
        boxShadow: kind === "dark" ? "inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 18px -10px rgba(0,0,0,0.6)" : "none",
      }}
    >
      {icon && <Ico d={icon} size={15} />}
      {label}
    </motion.button>
  );

  const on = Object.values(choice).filter(Boolean).length;

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f2f2f4] ${className}`}
      style={{
        minHeight: 420,
        padding: "32px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
      }}
    >
      <LayoutGroup id={uid}>
        <AnimatePresence mode="popLayout">
          {mode !== "pill" ? (
            <motion.section
              key="card"
              layout
              role="dialog"
              aria-label="Cookie preferences"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, y: 60, filter: "blur(6px)" }}
              transition={{
                type: "spring",
                stiffness: 340,
                damping: 32,
                filter: { duration: 0.3 },
              }}
              style={{
                position: "relative",
                width: "min(100%, 400px)",
                background: "#fff",
                borderRadius: mode === "done" ? 30 : 26,
                padding: 22,
                boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -32px rgba(60,40,10,0.45)",
              }}
            >
              {mode !== "done" && (
                <motion.div
                  layout="position"
                  role="button"
                  tabIndex={-1}
                  aria-label="Take a bite"
                  onPointerEnter={() => setHover(true)}
                  onPointerLeave={() => setHover(false)}
                  onClick={() => {
                    touched.current = true;
                    if (bites < BITES.length - 1) bite(1);
                  }}
                  initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: -12, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: -26,
                    width: 92,
                    height: 92,
                    cursor: "pointer",
                    zIndex: 2,
                  }}
                >
                  <Cookie src={cookie} bites={bites} hover={hover} size={92} />
                  {crumbs.map((c) => (
                    <motion.span
                      key={c.id}
                      initial={{ x: c.x, y: c.y, opacity: 1 }}
                      animate={{
                        x: c.x + c.vx,
                        y: c.y + 70,
                        opacity: 0,
                        rotate: 200,
                      }}
                      transition={{ duration: 0.95, ease: [0.3, 0, 1, 0.6] }}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: c.r * 2,
                        height: c.r * 1.6,
                        borderRadius: "40% 60% 50% 45%",
                        background: c.r > 2.6 ? "#7a4518" : "#c98a3d",
                        pointerEvents: "none",
                      }}
                    />
                  ))}
                </motion.div>
              )}
              <AnimatePresence mode="popLayout" initial={false}>
                {mode === "done" ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: "grid",
                      justifyItems: "center",
                      textAlign: "center",
                      padding: "16px 0 8px",
                    }}
                  >
                    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#30d158"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        style={{ rotate: -90, transformOrigin: "32px 32px" }}
                      />
                      <motion.path
                        d="M20 33 L28 41 L45 23"
                        fill="none"
                        stroke="#30d158"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, delay: 0.4 }}
                      />
                    </svg>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        color: "#1d1d1f",
                        marginTop: 10,
                      }}
                    >
                      Preferences saved
                    </div>
                    <div style={{ fontSize: 13.5, color: "#6e6e73", marginTop: 3 }}>
                      {verdict}. You can change this at any time.
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="ask" layout exit={{ opacity: 0, filter: "blur(6px)" }}>
                    <motion.div layout style={{ paddingRight: 92 }}>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 650,
                          letterSpacing: "-0.025em",
                          color: "#1d1d1f",
                        }}
                      >
                        {title}
                      </div>
                    </motion.div>
                    <motion.p
                      layout
                      style={{
                        margin: "8px 0 0",
                        paddingRight: 40,
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "#424245",
                      }}
                    >
                      {body}
                    </motion.p>
                    <AnimatePresence initial={false}>
                      {mode === "custom" && (
                        <motion.div
                          key="list"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 30,
                          }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ display: "grid", gap: 8, paddingTop: 14 }}>
                            {groups.map((g, i) => {
                              const v = !!choice[g.id];
                              return (
                                <motion.label
                                  key={g.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.08 + i * 0.05 }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "11px 12px",
                                    borderRadius: 16,
                                    background: v ? "#f4faf6" : "#f7f7f9",
                                    transition: "background 0.3s",
                                    cursor: g.locked ? "default" : "pointer",
                                  }}
                                >
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                      style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "#1d1d1f",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                      }}
                                    >
                                      {g.name}
                                      {g.locked && (
                                        <span style={{ color: "#86868b" }}>
                                          <Ico d={I.lock} size={11} />
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12.5,
                                        color: "#6e6e73",
                                        lineHeight: 1.4,
                                        marginTop: 1,
                                      }}
                                    >
                                      {g.detail}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={v}
                                    aria-label={g.name}
                                    disabled={g.locked}
                                    onClick={() => {
                                      touched.current = true;
                                      setChoice((c) => ({
                                        ...c,
                                        [g.id]: !c[g.id],
                                      }));
                                      sfx.tick({
                                        freq: v ? 900 : 1600,
                                        gain: 0.05,
                                      });
                                    }}
                                    className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                                    style={{
                                      width: 46,
                                      height: 28,
                                      borderRadius: 14,
                                      border: 0,
                                      padding: 3,
                                      display: "flex",
                                      background: v ? "#30d158" : "#e3e3e8",
                                      opacity: g.locked ? 0.55 : 1,
                                      transition: "background 0.25s",
                                      cursor: g.locked ? "not-allowed" : "pointer",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <motion.span
                                      animate={{ x: v ? 18 : 0 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 600,
                                        damping: 32,
                                      }}
                                      style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 11,
                                        background: "#fff",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                      }}
                                    />
                                  </button>
                                </motion.label>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div
                      layout
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 16,
                      }}
                    >
                      {mode === "custom" ? (
                        <>
                          {btn("Back", () => setMode("ask"), "ghost")}
                          <span style={{ flex: 1 }} />
                          {btn("Reject all", rejectAll, "soft")}
                          {btn(`Allow ${on} of ${groups.length}`, save, "dark")}
                        </>
                      ) : (
                        <>
                          {btn(
                            "Customize",
                            () => {
                              setMode("custom");
                              sfx.whoosh(500, 1200, { dur: 0.3, gain: 0.03 });
                            },
                            "ghost",
                            I.sliders,
                          )}
                          <span style={{ flex: 1 }} />
                          {btn("Reject all", rejectAll, "soft")}
                          {btn("Accept all", acceptAll, "dark")}
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          ) : (
            <motion.button
              key="pill"
              layout
              type="button"
              onClick={() => {
                touched.current = true;
                reopen();
              }}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
              style={{
                alignSelf: "end",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                height: 50,
                padding: "0 18px 0 8px",
                borderRadius: 24,
                border: 0,
                background: "#fff",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 16px 30px -18px rgba(60,40,10,0.5)",
                cursor: "pointer",
                fontSize: 13.5,
                color: "#1d1d1f",
              }}
            >
              <Cookie src={cookie} bites={bites} hover={false} size={34} />
              <span style={{ fontWeight: 600 }}>{verdict}</span>
              <span style={{ color: "#0071e3", fontWeight: 600 }}>Change</span>
            </motion.button>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
