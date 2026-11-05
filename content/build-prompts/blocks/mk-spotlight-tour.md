# Spotlight Tour

Add the "Spotlight Tour" section from Nexus UI to my project.

Spotlight Tour: an onboarding walkthrough lit by liquid light. The page dims and one element stays lit, edged by an iridescent rim that slowly breathes. On Next the light drains out of the current element and pours across in a stream of droplets into the next one, which swells open with a small overshoot. A tongue of light reaches toward the frosted-glass tip card, whose words blur in one by one. Bring the pointer near the light and it reaches out for it like a drop of water, stretching a bridge to the pointer, while the dim thins around the pointer like a torch. The lit element stays clickable; clicking the dim nudges the card; finishing floods the view with light. Keyboard: Arrow Right or Enter for next, Arrow Left for back, Escape to leave. Reduced motion skips the pour.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { SpotlightTour } from "@/components/blocks/motion-kit/spotlight-tour";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `steps` | `TourStep[]` | `DEMO_STEPS` |  |
| `children` | `ReactNode` | none | The interface the tour walks through. Without children it shows a small demo dashboard. |
| `launcher` | `string \| null` | `"Take the tour"` | Label of the launcher pill. Pass null to hide the launcher and drive the tour with `open`. |
| `open` | `boolean` | none |  |
| `onOpenChange` | `(open: boolean) => void` | none |  |
| `onFinish` | `() => void` | none |  |
| `padding` | `number` | `8` | Space between the target and the edge of the light, in px. |
| `autoplay` | `boolean` | `false` | Walk through the tour on its own until someone touches it. Off by default. |
| `className` | `string` | `""` |  |

--- components/blocks/motion-kit/spotlight-tour/index.ts ---

```ts
export { SpotlightTour } from "./spotlight-tour";
export type { TourStep, SpotlightTourProps } from "./spotlight-tour";
```

--- components/blocks/motion-kit/spotlight-tour/spotlight-tour.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICON = {
  sparkles: "<path fill=\"currentColor\" d=\"M26.688 12.66c.28 0 .421-.164.492-.422c.726-3.914.68-4.008 4.758-4.781c.28-.047.445-.21.445-.492c0-.281-.164-.445-.446-.492c-4.054-.82-3.937-.914-4.757-4.782c-.07-.257-.211-.421-.492-.421s-.422.164-.493.421c-.82 3.868-.68 3.961-4.757 4.782c-.258.046-.446.21-.446.492c0 .281.188.445.445.492c4.079.82 4.032.867 4.758 4.781c.07.258.211.422.492.422M15.344 28.785c.445 0 .75-.281.797-.703c.843-6.258 1.054-6.258 7.523-7.5c.422-.07.727-.352.727-.797c0-.422-.305-.726-.727-.797c-6.469-.89-6.703-1.101-7.523-7.476c-.047-.422-.352-.727-.797-.727c-.422 0-.727.305-.774.75c-.773 6.281-1.101 6.258-7.523 7.453c-.422.094-.727.375-.727.797c0 .469.305.727.82.797c6.376 1.031 6.657 1.195 7.43 7.453c.047.469.352.75.774.75m15.89 25.946c.61 0 1.055-.446 1.172-1.079c1.664-12.843 3.469-14.789 16.172-16.195c.656-.07 1.102-.562 1.102-1.172s-.446-1.078-1.102-1.172c-12.703-1.406-14.508-3.351-16.172-16.195c-.117-.633-.562-1.055-1.172-1.055s-1.054.422-1.148 1.055c-1.664 12.844-3.492 14.789-16.172 16.195c-.68.094-1.125.563-1.125 1.172c0 .61.445 1.102 1.125 1.172c12.656 1.664 14.414 3.375 16.172 16.195c.094.633.539 1.078 1.148 1.078\"/>",
  xmark: "<path fill=\"currentColor\" d=\"M10.023 43.023c-.796.797-.82 2.157 0 2.954c.82.796 2.157.796 2.977 0l15-15l15 15c.797.796 2.156.82 2.977 0c.796-.82.796-2.157 0-2.954L30.953 28l15.024-15c.796-.797.82-2.156 0-2.953c-.844-.82-2.18-.82-2.977 0l-15 15l-15-15c-.82-.82-2.18-.844-2.977 0c-.796.82-.796 2.156 0 2.953l15 15Z\"/>",
  checkmark_alt: "<path fill=\"currentColor\" d=\"m45.646 14.646l.708.708a2 2 0 0 1 0 2.828l-22.94 22.94a2 2 0 0 1-2.828 0l-9.94-9.94a2 2 0 0 1 0-2.828l.708-.708a2 2 0 0 1 2.828 0l6.404 6.404a2 2 0 0 0 2.828 0l19.404-19.404a2 2 0 0 1 2.828 0\"/>",
  house_fill: "<path fill=\"currentColor\" d=\"M.625 27.824c0 1.125.89 1.805 1.992 1.805c.68 0 1.219-.328 1.688-.797L27.18 7.996c.257-.258.539-.352.843-.352c.282 0 .54.094.82.352l22.852 20.836c.492.469 1.031.797 1.688.797c1.101 0 1.992-.68 1.992-1.805c0-.703-.258-1.148-.703-1.547l-8.11-7.382V5.043c0-1.031-.656-1.687-1.687-1.687h-3.07c-1.008 0-1.711.656-1.711 1.687v7.969l-9.282-8.485C29.992 3.754 28.984 3.38 28 3.38c-.985 0-1.969.375-2.813 1.148L1.328 26.277c-.422.399-.703.844-.703 1.547m6.703 19.664c0 3.258 1.969 5.157 5.273 5.157h9.493V35.98c0-1.078.726-1.78 1.804-1.78h8.274c1.078 0 1.781.702 1.781 1.78v16.665h9.469c3.304 0 5.25-1.899 5.25-5.157V30.332l-19.899-17.93c-.258-.234-.539-.351-.82-.351c-.258 0-.516.117-.797.375L7.328 30.449Z\"/>",
  doc_text_fill: "<path fill=\"currentColor\" d=\"M15.555 53.125h24.89c4.852 0 7.266-2.461 7.266-7.336V24.508H30.742c-3 0-4.406-1.43-4.406-4.43V2.875H15.555c-4.828 0-7.266 2.484-7.266 7.36v35.554c0 4.898 2.438 7.336 7.266 7.336m15.258-31.828h16.64c-.164-.961-.844-1.899-1.945-3.047L32.57 5.102c-1.078-1.125-2.062-1.805-3.047-1.97v16.9c0 .843.446 1.265 1.29 1.265m-11.836 13.36c-.961 0-1.641-.68-1.641-1.594c0-.915.68-1.594 1.64-1.594h18.07c.938 0 1.665.68 1.665 1.593c0 .915-.727 1.594-1.664 1.594Zm0 8.929c-.961 0-1.641-.68-1.641-1.594s.68-1.594 1.64-1.594h18.07c.938 0 1.665.68 1.665 1.594s-.727 1.594-1.664 1.594Z\"/>",
  person_2_fill: "<path fill=\"currentColor\" d=\"M38.723 28.549c4.417 0 8.217-3.944 8.217-9.08c0-5.074-3.82-8.833-8.217-8.833c-4.396 0-8.217 3.841-8.217 8.874c0 5.095 3.8 9.039 8.217 9.039m-23.645.473c3.821 0 7.15-3.452 7.15-7.91c0-4.416-3.35-7.683-7.15-7.683c-3.82 0-7.19 3.349-7.169 7.725c0 4.416 3.328 7.868 7.17 7.868M3.616 47.572h15.612c-2.136-3.102.473-9.347 4.89-12.757c-2.28-1.52-5.219-2.65-9.06-2.65C5.793 32.164 0 39.004 0 44.695c0 1.85 1.027 2.877 3.616 2.877m22.186 0h25.822c3.225 0 4.376-.925 4.376-2.733c0-5.3-6.636-12.613-17.297-12.613c-10.641 0-17.277 7.313-17.277 12.614c0 1.807 1.15 2.732 4.376 2.732\"/>",
  chart_bar_fill: "<path fill=\"currentColor\" d=\"M44.724 49.251h6.641c3.075 0 4.635-1.47 4.635-4.39v-32.4c0-2.92-1.56-4.413-4.635-4.413h-6.64c-3.053 0-4.636 1.493-4.636 4.412v32.402c0 2.919 1.583 4.39 4.635 4.39m-20.055 0h6.64c3.076 0 4.658-1.47 4.658-4.39V18.968c0-2.919-1.582-4.412-4.658-4.412h-6.64c-3.053 0-4.613 1.493-4.613 4.412v25.895c0 2.919 1.56 4.39 4.613 4.39m-20.034 0h6.64c3.076 0 4.636-1.47 4.636-4.39v-19.41c0-2.92-1.56-4.412-4.635-4.412h-6.64C1.581 21.04 0 22.533 0 25.452v19.41c0 2.919 1.582 4.39 4.635 4.39\"/>",
  gear_alt_fill: "<path fill=\"currentColor\" fill-rule=\"evenodd\" d=\"M22.792 51.433a23.9 23.9 0 0 1-6.878-2.694l.124-2.425c.169-3.307-2.384-5.85-5.682-5.682l-2.68.137a23.9 23.9 0 0 1-2.854-6.517l2.104-1.9c2.458-2.218 2.452-5.822 0-8.035l-2.243-2.025A23.9 23.9 0 0 1 7.28 15.88l3.076.157c3.307.169 5.85-2.384 5.682-5.682L15.88 7.28a23.9 23.9 0 0 1 6.41-2.597l2.026 2.243c2.22 2.458 5.823 2.452 8.036 0l1.9-2.104a23.9 23.9 0 0 1 6.516 2.853l-.137 2.68c-.169 3.308 2.384 5.851 5.682 5.683l2.425-.124a23.9 23.9 0 0 1 2.694 6.878l-1.69 1.525c-2.457 2.22-2.45 5.823 0 8.036l1.561 1.408a23.9 23.9 0 0 1-2.958 6.975l-2.032-.104c-3.307-.169-5.85 2.384-5.682 5.682l.104 2.032a23.9 23.9 0 0 1-6.975 2.958l-1.408-1.56c-2.22-2.458-5.823-2.452-8.036 0zM28 38c5.523 0 10-4.477 10-10s-4.477-10-10-10s-10 4.477-10 10s4.477 10 10 10\"/>",
  search: "<path fill=\"currentColor\" d=\"M23.957 41.77a18.02 18.02 0 0 0 10.477-3.376l11.109 11.11a2.66 2.66 0 0 0 1.898.773c1.524 0 2.625-1.172 2.625-2.672c0-.703-.234-1.359-.75-1.874L38.277 34.668c2.32-3.047 3.703-6.82 3.703-10.922c0-9.914-8.109-18.023-18.023-18.023c-9.937 0-18.023 8.109-18.023 18.023S14.02 41.77 23.957 41.77m0-3.891c-7.758 0-14.133-6.398-14.133-14.133S16.2 9.613 23.957 9.613c7.734 0 14.133 6.399 14.133 14.133c0 7.735-6.399 14.133-14.133 14.133\"/>",
  plus: "<path fill=\"currentColor\" d=\"M27.988 47.734c1.149 0 2.11-.914 2.11-2.039V30.11h15.14c1.125 0 2.11-.96 2.11-2.109c0-1.148-.985-2.086-2.11-2.086h-15.14v-15.61c0-1.124-.961-2.038-2.11-2.038c-1.148 0-2.086.914-2.086 2.039v15.61h-15.14c-1.125 0-2.11.937-2.11 2.085s.985 2.11 2.11 2.11h15.14v15.585c0 1.125.938 2.04 2.086 2.04\"/>",
  arrow_up_right: "<path fill=\"currentColor\" d=\"M44.02 36.215V14.207c0-1.336-.844-2.227-2.227-2.227l-22.008.047c-1.289 0-2.156.961-2.156 2.063c0 1.101.984 2.039 2.062 2.039h6.985l11.156-.422l-4.266 3.75l-20.93 20.977c-.421.422-.655.937-.655 1.43c0 1.1.984 2.156 2.132 2.156c.54 0 1.032-.211 1.453-.633L36.543 22.41l3.75-4.242l-.422 10.664v7.477c0 1.078.938 2.062 2.063 2.062c1.101 0 2.086-.914 2.086-2.156\"/>",
} as const;

type IconName = keyof typeof ICON;
function Icon({ name, size = 18, className = "" }: { name: IconName; size?: number; className?: string }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

export type TourStep = {
  /** CSS selector for the element to light up, looked up inside the tour. The first visible match wins. */
  target: string;
  title: string;
  body: string;
};

export type SpotlightTourProps = {
  steps?: TourStep[];
  /** The interface the tour walks through. Without children it shows a small demo dashboard. */
  children?: ReactNode;
  /** Label of the launcher pill. Pass null to hide the launcher and drive the tour with `open`. */
  launcher?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFinish?: () => void;
  /** Space between the target and the edge of the light, in px. */
  padding?: number;
  /** Walk through the tour on its own until someone touches it. Off by default. */
  autoplay?: boolean;
  className?: string;
};

const DEMO_STEPS: TourStep[] = [
  { target: '[data-tour="nav"]', title: "Everything in one place", body: "Move between invoices, customers and reports from here. Your place is kept when you come back." },
  { target: '[data-tour="search"]', title: "Find anything", body: "Search invoices, people and amounts. Press Command K from anywhere to jump straight in." },
  { target: '[data-tour="metric"]', title: "Your month at a glance", body: "Revenue updates the moment a payment lands, measured against the same day last month." },
  { target: '[data-tour="create"]', title: "Send your first invoice", body: "It takes about a minute. Your business details are filled in for you." },
];

type Rect = { l: number; t: number; r: number; b: number };
type Side = "top" | "bottom" | "left" | "right";
type Spring = { type: "spring"; stiffness: number; damping: number; mass?: number };

const CARD: Spring = { type: "spring", stiffness: 280, damping: 28 };
const EDGE = 12; // the card keeps this far from the tour's edges

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** a full-size rectangle with a rounded hole, for clip-path with the evenodd rule */
function holePath(w: number, h: number, l: number, t: number, r: number, b: number, rad: number) {
  r = Math.max(r, l + 1);
  b = Math.max(b, t + 1);
  const k = clamp(rad, 0, Math.min((r - l) / 2, (b - t) / 2));
  return `path(evenodd, "M-2 -2H${w + 2}V${h + 2}H-2Z M${l + k} ${t}H${r - k}A${k} ${k} 0 0 1 ${r} ${t + k}V${b - k}A${k} ${k} 0 0 1 ${r - k} ${b}H${l + k}A${k} ${k} 0 0 1 ${l} ${b - k}V${t + k}A${k} ${k} 0 0 1 ${l + k} ${t}Z")`;
}

function visible(el: Element) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
}

// ─── Demo dashboard ────────────────────────────────────────────────────────────

const BARS = [38, 52, 44, 61, 48, 70, 57, 66, 74, 62, 80, 92];

function DemoDashboard() {
  const nav: [IconName, string][] = [
    ["house_fill", "Home"],
    ["doc_text_fill", "Invoices"],
    ["person_2_fill", "Customers"],
    ["chart_bar_fill", "Reports"],
  ];
  return (
    <div className="flex h-[500px] w-full bg-[#fbfbfd] text-left text-[#1d1d1f]">
      <aside data-tour="nav" className="hidden w-[170px] shrink-0 flex-col gap-[2px] border-r border-black/[.06] p-3 md:flex">
        <div className="mb-3 flex items-center gap-2 px-2 pt-1 text-[14px] font-semibold tracking-[-0.01em]">
          <span className="grid h-6 w-6 place-items-center rounded-[7px] bg-[#1d1d1f] text-white">
            <Icon name="doc_text_fill" size={13} />
          </span>
          Ledger
        </div>
        {nav.map(([icon, label], i) => (
          <span key={label} className={`flex items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-[13px] ${i === 0 ? "bg-black/[.055] font-medium" : "text-[#3a3a3c]"}`}>
            <Icon name={icon} size={15} className={i === 0 ? "text-[#0071e3]" : "text-[#6e6e73]"} />
            {label}
          </span>
        ))}
        <span className="mt-auto flex items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-[13px] text-[#3a3a3c]">
          <Icon name="gear_alt_fill" size={15} className="text-[#6e6e73]" />
          Settings
        </span>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-black/[.06] px-4 py-3">
          <div data-tour="search" className="flex h-8 min-w-0 max-w-[260px] flex-1 items-center gap-2 rounded-[9px] bg-black/[.045] px-2.5 text-[13px] text-[#6e6e73]">
            <Icon name="search" size={13} />
            <span className="truncate">Search</span>
            <kbd className="ml-auto hidden font-sans text-[11px] text-[#6e6e73] sm:block">⌘K</kbd>
          </div>
          <button
            type="button"
            tabIndex={-1}
            data-tour="create"
            className="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#0071e3] px-3 text-[13px] font-medium text-white"
          >
            <Icon name="plus" size={11} />
            <span className="hidden sm:inline">New invoice</span>
            <span className="sm:hidden">New</span>
          </button>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e8f1fd] text-[12px] font-semibold text-[#0058b0]">SK</span>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden p-4">
          <p className="m-0 text-[13px] text-[#6e6e73]">Tuesday, 3 November</p>
          <h4 className="m-0 mt-0.5 text-[20px] font-semibold tracking-[-0.022em]">Good morning, Sam</h4>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1.25fr_1fr]">
            <div data-tour="metric" className="rounded-[14px] bg-white p-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
              <div className="flex items-center justify-between text-[12px] text-[#6e6e73]">
                Revenue this month
                <span className="flex items-center gap-0.5 font-medium text-[#1b6e31]">
                  <Icon name="arrow_up_right" size={10} />
                  12%
                </span>
              </div>
              <div className="mt-1 text-[24px] font-semibold tabular-nums tracking-[-0.03em]">$48,210</div>
              <div className="mt-2 flex h-10 items-end gap-[3px]" aria-hidden="true">
                {BARS.map((h, i) => (
                  <span key={i} className={`flex-1 rounded-[2px] ${i === BARS.length - 1 ? "bg-[#0071e3]" : "bg-[#0071e3]/20"}`} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="hidden rounded-[14px] bg-white p-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.05)] sm:block">
              <div className="text-[12px] text-[#6e6e73]">Outstanding</div>
              <div className="mt-1 text-[24px] font-semibold tabular-nums tracking-[-0.03em]">$6,940</div>
              <div className="mt-2 text-[12px] text-[#6e6e73]">7 invoices, 2 overdue</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[.06]">
                <span className="block h-full w-[28%] rounded-full bg-[#c93400]" />
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-[14px] bg-white px-3.5 py-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
            {[
              ["Juniper Studio", "INV-2041", "$2,400.00", "Paid"],
              ["Oak & Ash", "INV-2040", "$860.00", "Sent"],
              ["Field Notes Co.", "INV-2039", "$1,120.00", "Overdue"],
            ].map(([who, no, amt, st], i) => (
              <div key={no} className={`flex items-center gap-3 py-2 text-[13px] ${i ? "border-t border-black/[.05]" : ""}`}>
                <span className="min-w-0 flex-1 truncate font-medium">{who}</span>
                <span className="hidden text-[#6e6e73] sm:block">{no}</span>
                <span className="tabular-nums">{amt}</span>
                <span
                  className={`w-[62px] rounded-full py-[2px] text-center text-[11px] font-medium ${
                    st === "Paid" ? "bg-[#e5f5ea] text-[#1b6e31]" : st === "Sent" ? "bg-[#e8f1fd] text-[#0058b0]" : "bg-[#fdeee4] text-[#9c3600]"
                  }`}
                >
                  {st}
                </span>
              </div>
            ))}
          </div>
        </div>
        <nav data-tour="nav" className="flex items-center justify-around border-t border-black/[.06] py-2 md:hidden">
          {nav.map(([icon, label], i) => (
            <span key={label} className={`flex flex-col items-center gap-0.5 text-[10px] ${i === 0 ? "text-[#0071e3]" : "text-[#6e6e73]"}`}>
              <Icon name={icon} size={18} />
              {label}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}

// ─── The liquid light ──────────────────────────────────────────────────────────
// The dimmed layer is one WebGL quad. Its holes are rounded boxes in a signed distance field; between steps
// the old hole drains toward the new one, a stream of droplets carries the light across, and the new hole
// swells open with a little overshoot. Smooth-min blends everything so it reads as one liquid.

type Hole = { cx: number; cy: number; hw: number; hh: number; r: number };
const holeOf = (q: Rect): Hole => ({ cx: (q.l + q.r) / 2, cy: (q.t + q.b) / 2, hw: Math.max(1, (q.r - q.l) / 2), hh: Math.max(1, (q.b - q.t) / 2), r: Math.min(18, (q.b - q.t) / 2, (q.r - q.l) / 2) });
const NONE: Hole = { cx: -9999, cy: -9999, hw: 0, hh: 0, r: 0 };
const DROPS = 14;
const POUR = 1.05; // seconds for one pour

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 uSize; uniform float uDpr; uniform float uTime;
uniform vec4 uA; uniform float uAr; uniform vec4 uB; uniform float uBr;
uniform vec3 uDrops[${DROPS}]; uniform vec3 uBeak; uniform vec2 uCenter;
uniform float uDim; uniform float uGlow;
uniform vec3 uCur; uniform vec3 uTorch;
float box(vec2 p, vec4 b, float r){
  if (b.z < 0.5 || b.w < 0.5) return 1e4;
  r = min(r, min(b.z, b.w));
  vec2 q = abs(p - b.xy) - b.zw + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec3 iri(float t){
  // Apple-Intelligence-like spectrum: blue, violet, pink, amber
  vec3 c0 = vec3(0.16, 0.62, 1.0), c1 = vec3(0.56, 0.36, 0.97), c2 = vec3(1.0, 0.37, 0.64), c3 = vec3(1.0, 0.64, 0.28);
  t = fract(t) * 4.0;
  if (t < 1.0) return mix(c0, c1, t);
  if (t < 2.0) return mix(c1, c2, t - 1.0);
  if (t < 3.0) return mix(c2, c3, t - 2.0);
  return mix(c3, c0, t - 3.0);
}
void main(){
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;
  float d = smin(box(p, uA, uAr), box(p, uB, uBr), 26.0);
  for (int i = 0; i < ${DROPS}; i++) { vec3 o = uDrops[i]; if (o.z > 0.3) d = smin(d, length(p - o.xy) - o.z, 21.0); }
  if (uBeak.z > 0.3) d = smin(d, length(p - uBeak.xy) - uBeak.z, 16.0);
  // the light reaches for the pointer like surface tension
  if (uCur.z > 0.3) d = smin(d, length(p - uCur.xy) - uCur.z, 34.0);
  float inside = smoothstep(0.8, -0.8, d);
  vec2 v = p - uCenter;
  float ang = atan(v.y, v.x) / 6.28318;
  float breathe = 0.78 + 0.22 * sin(uTime * 1.7);
  vec3 tint = iri(ang + uTime * 0.07);
  float glow = exp(-max(d, 0.0) / 15.0) * breathe * uGlow * (1.0 - inside);
  float halo = exp(-max(d, 0.0) / 46.0) * 0.35 * uGlow * (1.0 - inside);
  float rim = smoothstep(1.6, 0.0, abs(d - 0.4));
  float grain = (hash(floor(p * uDpr) + fract(uTime)) - 0.5) * 0.035;
  vec3 dim = vec3(0.035, 0.035, 0.045) + grain;
  float a = uDim * 0.64 * (1.0 - inside);
  // and the dim thins a little around the pointer, like a torch
  vec2 tp = p - uTorch.xy;
  a *= 1.0 - 0.2 * uTorch.z * exp(-dot(tp, tp) / 13000.0);
  vec3 col = dim * a;
  col += tint * (glow * 0.95 + halo) * uDim;
  a = clamp(a + (glow * 0.7 + halo * 0.6) * uDim, 0.0, 1.0);
  vec3 edge = mix(vec3(1.0), tint, 0.45) * rim * uDim * 0.95;
  col += edge; a = max(a, rim * uDim * 0.9);
  float spill = exp(-max(-d, 0.0) / 7.0) * inside * 0.16 * uGlow * uDim; // a little light leaks inward
  col += tint * spill; a = max(a, spill * 0.6);
  gl_FragColor = vec4(col, a);
}`;

type Gl = { gl: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null> };
function makeGl(canvas: HTMLCanvasElement): Gl | null {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  try {
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const u: Gl["u"] = {};
    ["uSize", "uDpr", "uTime", "uA", "uAr", "uB", "uBr", "uDrops", "uBeak", "uCenter", "uDim", "uGlow", "uCur", "uTorch"].forEach((n) => (u[n] = gl.getUniformLocation(prog, n)));
    return { gl, u };
  } catch {
    return null;
  }
}

const easeIn = (x: number) => x * x * x;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
/** a spring-ish 0 → 1 that overshoots once */
const swell = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(8.5 * x));
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** the point on a hole's edge facing another point */
function edgeToward(h: Hole, x: number, y: number) {
  const dx = x - h.cx;
  const dy = y - h.cy;
  const k = Math.min(h.hw / Math.max(1e-3, Math.abs(dx)), h.hh / Math.max(1e-3, Math.abs(dy)));
  return { x: h.cx + dx * Math.min(1, k), y: h.cy + dy * Math.min(1, k) };
}

type Sim = {
  cur: Hole | null; // settled light
  next: Hole | null; // where it's pouring to
  t0: number;
  dur: number;
  closing: boolean;
  dim: number;
  dimFrom: number;
  dimTo: number;
  dimT0: number;
  beak: { x: number; y: number; t0: number } | null;
};

// ─── The tour ──────────────────────────────────────────────────────────────────

const STOP = Symbol("stop");

/**
 * Spotlight Tour: an onboarding walkthrough lit by liquid light.
 * The page dims and one element stays lit, edged by an iridescent rim that slowly breathes. On Next the light
 * drains out of the current element and pours across in a stream of droplets into the next one, which swells
 * open with a small overshoot. A tongue of light reaches toward the frosted-glass tip card, whose words blur in
 * one by one. Bring the pointer near the light and it reaches out for it like a drop of water, stretching a
 * bridge to the pointer, while the dim thins around the pointer like a torch. The lit element stays clickable;
 * clicking the dim nudges the card; finishing floods the view with light.
 * Keyboard: Arrow Right or Enter for next, Arrow Left for back, Escape to leave. Reduced motion skips the pour.
 */
export function SpotlightTour({
  steps = DEMO_STEPS,
  children,
  launcher = "Take the tour",
  open: openProp,
  onOpenChange,
  onFinish,
  padding = 8,
  autoplay = false,
  className = "",
}: SpotlightTourProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const launchRef = useRef<HTMLButtonElement>(null);
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const [live, setLive] = useState(false);
  const [route, setRoute] = useState<number[]>([]);
  const [at, setAt] = useState(0);
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [cardIn, setCardIn] = useState(false);
  const [noGl, setNoGl] = useState(false);
  const [hit, setHit] = useState<Rect | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const titleId = useId();
  const bodyId = useId();
  const reduced = useReducedMotion();
  const closing = useRef(false);

  const sim = useRef<Sim>({ cur: null, next: null, t0: 0, dur: POUR, closing: false, dim: 0, dimFrom: 0, dimTo: 0, dimT0: 0, beak: null });

  // the card rides on its own spring and tips a little in the direction it travels
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const ch = useMotionValue(0);
  const nudge = useMotionValue(0);
  const cardX = useTransform([cx, nudge], ([a, n]: number[]) => a + n);
  const vx = useVelocity(cx);
  const tilt = useSpring(useTransform(vx, (v) => Math.max(-5, Math.min(5, v * 0.006))), { stiffness: 260, damping: 20 });

  const setOpen = useCallback(
    (v: boolean) => {
      if (openProp === undefined) setOpenState(v);
      onOpenChange?.(v);
    },
    [openProp, onOpenChange],
  );

  const rectOf = useCallback(
    (stepIndex: number): Rect | null => {
      const root = rootRef.current;
      const step = steps[stepIndex];
      if (!root || !step) return null;
      const el = [...root.querySelectorAll(step.target)].find(visible);
      if (!el) return null;
      const a = el.getBoundingClientRect();
      const o = root.getBoundingClientRect();
      return { l: a.left - o.left - padding, t: a.top - o.top - padding, r: a.right - o.left + padding, b: a.bottom - o.top + padding };
    },
    [steps, padding],
  );

  /** start a pour toward a rectangle (or snap there) */
  const pour = useCallback(
    (to: Rect, instant = false) => {
      const s = sim.current;
      const now = performance.now() / 1000;
      const h = holeOf(to);
      if (instant || !s.cur || reduced) {
        s.cur = h;
        s.next = null;
        return;
      }
      if (s.next) s.cur = s.next; // a pour already under way: start from where it was heading
      s.next = h;
      s.t0 = now;
      s.dur = POUR;
      s.beak = null;
    },
    [reduced],
  );

  const fadeDim = (to: number) => {
    const s = sim.current;
    s.dimFrom = s.dim;
    s.dimTo = to;
    s.dimT0 = performance.now() / 1000;
  };

  // ─── the render loop ───
  useEffect(() => {
    if (!live) return;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const g = makeGl(canvas);
    if (!g) {
      setNoGl(true);
      return;
    }
    const { gl, u } = g;
    const drops = new Float32Array(DROPS * 3);
    let raf = 0;
    const start = performance.now() / 1000;
    // the pointer: a blob of light that follows it on a spring, and a torch
    const ptr = { x: 0, y: 0, on: false };
    const cur = { x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, torch: 0 };
    let lastT = start;
    const onMove = (e: PointerEvent) => {
      const b = root.getBoundingClientRect();
      ptr.x = e.clientX - b.left;
      ptr.y = e.clientY - b.top;
      if (!ptr.on) {
        cur.x = ptr.x;
        cur.y = ptr.y;
      }
      ptr.on = e.pointerType === "mouse" || e.pointerType === "pen";
    };
    const onOut = () => (ptr.on = false);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onOut);
    const sdBox = (px: number, py: number, h: Hole) => {
      if (h.hw < 0.5) return 1e4;
      const r = Math.min(h.r, h.hw, h.hh);
      const qx = Math.abs(px - h.cx) - h.hw + r;
      const qy = Math.abs(py - h.cy) - h.hh + r;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    };
    const frame = () => {
      const s = sim.current;
      const now = performance.now() / 1000;
      const dt = Math.min(0.05, now - lastT);
      lastT = now;
      const w = root.clientWidth;
      const h = root.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      // dim
      const dk = clamp01((now - s.dimT0) / 0.42);
      s.dim = s.dimFrom + (s.dimTo - s.dimFrom) * easeInOut(dk);

      let A: Hole = s.cur ?? NONE;
      let B: Hole = NONE;
      let center = { x: A.cx, y: A.cy };
      drops.fill(0);
      let glow = 1;
      if (s.next && s.cur) {
        const p = clamp01((now - s.t0) / s.dur);
        const from = s.cur;
        const to = s.next;
        if (s.closing) {
          // the light floods the whole view
          const e = easeOut(p);
          A = { cx: from.cx + (to.cx - from.cx) * e, cy: from.cy + (to.cy - from.cy) * e, hw: from.hw + (to.hw - from.hw) * e, hh: from.hh + (to.hh - from.hh) * e, r: from.r + (to.r - from.r) * e };
          center = { x: A.cx, y: A.cy };
          glow = 1 + Math.sin(p * Math.PI) * 0.8;
        } else {
          const exit = edgeToward(from, to.cx, to.cy);
          const entry = edgeToward(to, from.cx, from.cy);
          // the old light drains toward its exit point
          const sa = 1 - easeIn(clamp01(p / 0.55));
          A = { cx: exit.x + (from.cx - exit.x) * sa, cy: exit.y + (from.cy - exit.y) * sa, hw: from.hw * sa, hh: from.hh * sa, r: from.r * sa };
          // the new light swells open from its entry point
          const sb = swell(clamp01((p - 0.38) / 0.62));
          B = { cx: entry.x + (to.cx - entry.x) * Math.min(1, sb), cy: entry.y + (to.cy - entry.y) * Math.min(1, sb), hw: to.hw * sb, hh: to.hh * sb, r: to.r * Math.min(1, sb) };
          // droplets ride an arc between them
          const mx = (exit.x + entry.x) / 2;
          const my = (exit.y + entry.y) / 2;
          const dx = entry.x - exit.x;
          const dy = entry.y - exit.y;
          const len = Math.hypot(dx, dy) || 1;
          const bend = Math.min(90, len * 0.22);
          const ctrl = { x: mx - (dy / len) * bend, y: my + (dx / len) * bend };
          for (let i = 0; i < DROPS; i++) {
            const q = clamp01((p - 0.05 - i * 0.027) / 0.52);
            if (q <= 0 || q >= 1) continue;
            const e = easeInOut(q);
            const x = (1 - e) * (1 - e) * exit.x + 2 * (1 - e) * e * ctrl.x + e * e * entry.x;
            const y = (1 - e) * (1 - e) * exit.y + 2 * (1 - e) * e * ctrl.y + e * e * entry.y;
            const r = (5.5 + ((i * 7) % 5) * 1.4) * Math.pow(Math.sin(Math.PI * q), 0.55);
            drops[i * 3] = x;
            drops[i * 3 + 1] = y;
            drops[i * 3 + 2] = r;
          }
          center = p < 0.5 ? { x: A.cx, y: A.cy } : { x: to.cx, y: to.cy };
          glow = 1 + Math.sin(p * Math.PI) * 0.6; // the rim burns brighter while it travels
        }
        if (p >= 1) {
          s.cur = s.closing ? s.next : s.next;
          s.next = null;
        }
      }
      // the tongue of light toward the card
      let beak = [0, 0, 0];
      if (s.beak && !s.next) {
        const k = swell(clamp01((now - s.beak.t0) / 0.6));
        beak = [s.beak.x, s.beak.y, 10 * k];
      }
      gl.uniform2f(u.uSize, w, h);
      gl.uniform1f(u.uDpr, dpr);
      gl.uniform1f(u.uTime, now - start);
      gl.uniform4f(u.uA, A.cx, A.cy, A.hw, A.hh);
      gl.uniform1f(u.uAr, A.r);
      gl.uniform4f(u.uB, B.cx, B.cy, B.hw, B.hh);
      gl.uniform1f(u.uBr, B.r);
      gl.uniform3fv(u.uDrops, drops);
      gl.uniform3f(u.uBeak, beak[0], beak[1], beak[2]);
      gl.uniform2f(u.uCenter, center.x, center.y);
      gl.uniform1f(u.uDim, s.dim);
      gl.uniform1f(u.uGlow, reduced ? 0.8 : glow);
      // reach: only while the light is settled, and more the closer the pointer gets to it
      const near = s.cur && !s.next && !s.closing && ptr.on && !reduced ? sdBox(ptr.x, ptr.y, s.cur) : 1e4;
      const want = near > 2 && near < 150 ? 15 * Math.pow(1 - near / 150, 0.75) : 0;
      for (let k = 0, n = Math.max(1, Math.ceil(dt / (1 / 240))); k < n; k++) {
        const h = dt / n;
        cur.vx += (-170 * (cur.x - ptr.x) - 17 * cur.vx) * h;
        cur.vy += (-170 * (cur.y - ptr.y) - 17 * cur.vy) * h;
        cur.x += cur.vx * h;
        cur.y += cur.vy * h;
        cur.vr += (-220 * (cur.r - want) - 16 * cur.vr) * h;
        cur.r += cur.vr * h;
      }
      cur.torch += ((ptr.on && s.dim > 0.5 && !reduced ? 1 : 0) - cur.torch) * Math.min(1, dt * 6);
      gl.uniform3f(u.uCur, cur.x, cur.y, Math.max(0, cur.r));
      gl.uniform3f(u.uTorch, ptr.x, ptr.y, cur.torch);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onOut);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [live, reduced]);

  /** place the card beside the light and aim the tongue at it */
  const place = useCallback(
    (to: Rect, instant = false) => {
      const root = rootRef.current;
      const card = cardRef.current;
      const body = bodyRef.current;
      if (!root || !card || !body) return;
      const w = root.clientWidth;
      const h = root.clientHeight;
      const cw = card.offsetWidth;
      const chNext = body.offsetHeight;
      const room = { bottom: h - to.b, top: to.t, right: w - to.r, left: to.l };
      const gap = 22;
      const fits = (s: Side) => (s === "bottom" || s === "top" ? room[s] >= chNext + gap + 8 : room[s] >= cw + gap + 8);
      const found = (["bottom", "top", "right", "left"] as Side[]).find(fits);
      const s: Side = found ?? (room.bottom >= room.top ? "bottom" : "top");
      const midX = (to.l + to.r) / 2;
      const midY = (to.t + to.b) / 2;
      let x: number;
      let y: number;
      if (s === "bottom" || s === "top") {
        x = clamp(midX - cw / 2, EDGE, w - cw - EDGE);
        y = clamp(s === "bottom" ? to.b + gap : to.t - gap - chNext, EDGE, h - chNext - EDGE);
      } else {
        y = clamp(midY - chNext / 2, EDGE, h - chNext - EDGE);
        x = s === "right" ? to.r + gap : to.l - gap - cw;
      }
      if (instant) {
        cx.jump(x);
        cy.jump(y);
        ch.jump(chNext);
      } else {
        animate(cx, x, { ...CARD, delay: reduced ? 0 : 0.32 });
        animate(cy, y, { ...CARD, delay: reduced ? 0 : 0.32 });
        animate(ch, chNext, { type: "spring", stiffness: 380, damping: 36 });
      }
      // the tongue grows from the light's edge toward the card once the pour has landed
      if (found) {
        const hole = holeOf(to);
        const tx = s === "bottom" || s === "top" ? clamp(midX, x + 24, x + cw - 24) : s === "right" ? x : x + cw;
        const ty = s === "bottom" ? y : s === "top" ? y + chNext : clamp(midY, y + 20, y + chNext - 20);
        const e = edgeToward(hole, tx, ty);
        const len = Math.hypot(tx - e.x, ty - e.y) || 1;
        sim.current.beak = { x: e.x + ((tx - e.x) / len) * 9, y: e.y + ((ty - e.y) / len) * 9, t0: performance.now() / 1000 + (reduced ? 0 : POUR * 0.85) };
      } else sim.current.beak = null;
    },
    [cx, cy, ch, reduced],
  );

  // opening: find the steps that can be shown, start the light at the launcher
  useEffect(() => {
    const root = rootRef.current;
    if (!open || !root) return;
    const r = steps.map((_, i) => i).filter((i) => rectOf(i));
    if (!r.length) return setOpen(false);
    setSize({ w: root.clientWidth, h: root.clientHeight });
    const lb = launchRef.current?.getBoundingClientRect();
    const o = root.getBoundingClientRect();
    const s = sim.current;
    s.closing = false;
    s.next = null;
    s.cur = lb && lb.width ? holeOf({ l: lb.left - o.left, t: lb.top - o.top, r: lb.right - o.left, b: lb.bottom - o.top }) : holeOf({ l: -60, t: -60, r: root.clientWidth + 60, b: root.clientHeight + 60 });
    fadeDim(1);
    closing.current = false;
    setRoute(r);
    setAt(0);
    setDone(false);
    setLeaving(false);
    setCardIn(false);
    setLive(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // each step: pour the light, then bring the card
  useLayoutEffect(() => {
    if (!live || !open || done) return;
    const to = rectOf(route[at]);
    if (!to) return;
    pour(to);
    setHit(to);
    place(to, !cardIn);
    if (!cardIn) {
      const t = setTimeout(() => setCardIn(true), reduced ? 0 : POUR * 650);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, at, route]);

  // keep aligned when the layout changes
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !live) return;
    let key = `${root.clientWidth}x${root.clientHeight}`;
    const ro = new ResizeObserver(() => {
      const now = `${root.clientWidth}x${root.clientHeight}`;
      if (now === key) return;
      key = now;
      setSize({ w: root.clientWidth, h: root.clientHeight });
      const to = rectOf(route[at]);
      if (to && open && !done) {
        pour(to, true);
        setHit(to);
        place(to, true);
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, at, route, open, done]);

  useEffect(() => {
    if (live && open && cardIn) requestAnimationFrame(() => cardRef.current?.querySelector<HTMLButtonElement>("[data-next]")?.focus({ preventScroll: true }));
  }, [live, open, cardIn]);

  const finish = useCallback(
    (completed: boolean) => {
      const root = rootRef.current;
      if (!root || closing.current) return;
      closing.current = true;
      const hadFocus = root.contains(document.activeElement);
      const close = () => {
        setLeaving(true);
        const s = sim.current;
        const w = root.clientWidth;
        const h = root.clientHeight;
        if (s.next) s.cur = s.next;
        s.beak = null;
        s.closing = true;
        s.next = holeOf({ l: -80, t: -80, r: w + 80, b: h + 80 });
        s.next.r = 60;
        s.t0 = performance.now() / 1000;
        s.dur = reduced ? 0.01 : 0.8;
        fadeDim(0);
        setOpen(false);
        if (hadFocus) launchRef.current?.focus({ preventScroll: true });
        setTimeout(() => {
          setLive(false);
          setDone(false);
          setLeaving(false);
          setCardIn(false);
          setHit(null);
          sim.current.cur = null;
          sim.current.next = null;
        }, reduced ? 50 : 820);
      };
      if (completed) {
        setDone(true);
        onFinish?.();
        if (hadFocus) requestAnimationFrame(() => cardRef.current?.focus({ preventScroll: true }));
        setTimeout(close, 1100);
      } else close();
    },
    [setOpen, onFinish, reduced],
  );

  useEffect(() => {
    if (!open && live && !closing.current) finish(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useLayoutEffect(() => {
    if (done && bodyRef.current) animate(ch, bodyRef.current.offsetHeight, { type: "spring", stiffness: 380, damping: 36 });
  }, [done, ch]);

  const next = () => (at >= route.length - 1 ? finish(true) : setAt(at + 1));
  const back = () => {
    if (at === 0) return;
    setAt(at - 1);
    if (at === 1) requestAnimationFrame(() => cardRef.current?.querySelector<HTMLButtonElement>("[data-next]")?.focus({ preventScroll: true }));
  };

  const onCardKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      finish(false);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      back();
    } else if (e.key === "Tab") {
      const f = [...(cardRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [])];
      if (!f.length) return;
      const i = f.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  };

  const poke = () => animate(nudge, [0, -10, 8, -5, 2, 0], { duration: 0.5, ease: "easeOut" });

  // ─── Autoplay: a ghost pointer starts the tour and steps through it ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  const inView = useInView(rootRef, { amount: 0.4 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const running = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      running.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
      animate(gs, 1, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let last = performance.now();
        const tick = () => {
          if (!alive) return rej(STOP);
          const now = performance.now();
          if (inViewRef.current) left -= now - last;
          last = now;
          if (left <= 0) res();
          else setTimeout(tick, Math.min(60, Math.max(16, left)));
        };
        tick();
      });
    const run = (mv: MotionValue<number>, target: number, duration: number) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - target) < 0.01) return res();
        const c = animate(mv, target, { duration, ease: [0.4, 0, 0.2, 1], onComplete: () => (running.delete(c), res()) });
        running.add(c);
      });
    const tap = async (sel: string) => {
      const el = root.querySelector<HTMLElement>(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const o = root.getBoundingClientRect();
      const x = r.left - o.left + r.width / 2;
      const y = r.top - o.top + r.height / 2;
      if (go.get() < 0.5) {
        gx.set(x + 40);
        gy.set(y + 30);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, x, 0.6), run(gy, y, 0.6)]);
      await run(gs, 0.78, 0.1);
      el.click();
      await run(gs, 1, 0.16);
    };
    (async () => {
      while (alive) {
        await wait(1100);
        await tap("[data-launch]");
        await run(go, 0, 0.25);
        for (let i = 0; i < steps.length; i++) {
          await wait(i === 0 ? 2400 : 2300);
          if (!root.querySelector("[data-next]")) break;
          await tap("[data-next]");
          await run(go, 0, 0.3);
        }
        await wait(3000);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const step = steps[route[at]] ?? steps[0];
  const total = route.length;
  const words = step.body.split(" ");
  const showCard = live && cardIn && !leaving;

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] [-webkit-tap-highlight-color:transparent] ${className}`}
    >
      {children ?? <DemoDashboard />}

      {/* launcher: a dark pill with a slowly turning iridescent edge */}
      {launcher !== null && (
        <motion.button
          ref={launchRef}
          type="button"
          data-launch
          onClick={() => setOpen(true)}
          initial={false}
          animate={open ? { scale: 0.6, opacity: 0, y: 8 } : { scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-hidden={open}
          tabIndex={open ? -1 : 0}
          className="group absolute bottom-4 right-4 z-10 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
        >
          <span aria-hidden="true" className="absolute -inset-1 rounded-full opacity-60 blur-md transition-opacity group-hover:opacity-90">
            <motion.span className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, #2a9eff, #8f5cf7, #ff5fa2, #ffa347, #2a9eff)" }} animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
          </span>
          <span className="relative block overflow-hidden rounded-full p-[1.5px]">
            <motion.span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[300%] w-[300%] -translate-x-1/2 -translate-y-1/2"
              style={{ background: "conic-gradient(from 0deg, #2a9eff, #8f5cf7, #ff5fa2, #ffa347, #2a9eff)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative flex h-10 items-center gap-2 rounded-full bg-[#111113] pl-3.5 pr-4 text-[14px] font-medium text-white">
              <Icon name="sparkles" size={15} />
              {launcher}
            </span>
          </span>
        </motion.button>
      )}

      {live && (
        <>
          {/* the liquid light */}
          <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" />
          {noGl && <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-[#09090b]/60" style={hit ? { clipPath: holePath(size.w, size.h, hit.l, hit.t, hit.r, hit.b, 14) } : undefined} />}
          {/* clicks on the dim nudge the card; clicks in the light reach the element underneath */}
          <div
            aria-hidden="true"
            onPointerDown={poke}
            className="absolute inset-0 z-[21]"
            style={hit && !leaving ? { clipPath: holePath(size.w, size.h, hit.l, hit.t, hit.r, hit.b, 14), WebkitClipPath: holePath(size.w, size.h, hit.l, hit.t, hit.r, hit.b, 14) } : { pointerEvents: "none" }}
          />

          {/* the tip card: frosted glass */}
          <motion.div
            ref={cardRef}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            onKeyDown={onCardKey}
            initial={false}
            animate={showCard ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.92, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 30, opacity: { duration: 0.25 }, filter: { duration: 0.25 } }}
            style={{ x: cardX, y: cy, height: ch, rotate: tilt, pointerEvents: showCard ? "auto" : "none" }}
            className="absolute left-0 top-0 z-30 w-[min(320px,calc(100%-24px))] rounded-[22px] text-left text-[#1d1d1f] outline-none"
          >
            <div className="absolute inset-0 rounded-[22px] bg-white/[.78] shadow-[inset_0_0_0_1px_rgba(255,255,255,.7),inset_0_1px_0_rgba(255,255,255,.95),0_30px_60px_-22px_rgba(0,0,0,.6),0_0_0_.5px_rgba(0,0,0,.08)] backdrop-blur-2xl backdrop-saturate-150" />
            <span aria-hidden="true" className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#8f5cf7]/70 to-transparent" />
            <div className="relative h-full overflow-hidden rounded-[22px]">
              <div ref={bodyRef} className="p-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {done ? (
                    <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center gap-3 py-1">
                      <motion.span
                        initial={{ scale: 0, rotate: -40 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.05 }}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1d1d1f] text-white"
                      >
                        <Icon name="checkmark_alt" size={16} />
                      </motion.span>
                      <div>
                        <p id={titleId} className="m-0 text-[16px] font-semibold tracking-[-0.02em]">
                          You&apos;re all set
                        </p>
                        <p id={bodyId} className="m-0 text-[13px] text-[#57575c]">
                          Reopen the tour any time from the launcher.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="steps" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="m-0 pt-0.5 text-[12px] font-medium tabular-nums text-[#57575c]">
                          <span className="relative inline-block h-[15px] overflow-hidden align-top">
                            <AnimatePresence mode="popLayout" initial={false}>
                              <motion.span key={at} className="block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 32 }}>
                                {at + 1}
                              </motion.span>
                            </AnimatePresence>
                          </span>{" "}
                          of {total}
                        </p>
                        <button
                          type="button"
                          aria-label="Skip the tour"
                          onClick={() => finish(false)}
                          className="-mr-1.5 -mt-1.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#57575c] outline-none transition-colors hover:bg-black/[.06] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                        >
                          <Icon name="xmark" size={11} />
                        </button>
                      </div>
                      {/* the words blur in one after another */}
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div key={route[at]} exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.14 } }}>
                          <h3 id={titleId} className="m-0 mt-1 text-[18px] font-semibold leading-[1.25] tracking-[-0.024em]">
                            {step.title.split(" ").map((w, i) => (
                              <motion.span
                                key={i}
                                className="inline-block whitespace-pre"
                                initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{ delay: 0.3 + i * 0.05, duration: 0.42, ease: [0.2, 0.7, 0.2, 1] }}
                              >
                                {w}{" "}
                              </motion.span>
                            ))}
                          </h3>
                          <p id={bodyId} className="m-0 mt-1.5 text-[14px] leading-[1.45] text-[#57575c]">
                            {words.map((w, i) => (
                              <motion.span
                                key={i}
                                className="inline-block whitespace-pre"
                                initial={{ opacity: 0, filter: "blur(5px)" }}
                                animate={{ opacity: 1, filter: "blur(0px)" }}
                                transition={{ delay: 0.42 + i * 0.02, duration: 0.38 }}
                              >
                                {w}{i < words.length - 1 ? " " : ""}
                              </motion.span>
                            ))}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                      <div className="mt-4 flex items-center gap-2">
                        {/* progress: the current dot is a pill that flows from dot to dot */}
                        <div className="relative mr-auto flex items-center gap-[6px]" aria-hidden="true">
                          {route.map((_, i) => (
                            <span key={i} className={`relative block h-[6px] w-[6px] rounded-full ${i < at ? "bg-[#1d1d1f]" : "bg-black/[.15]"}`}>
                              {i === at && (
                                <motion.span
                                  layoutId={`${titleId}-dot`}
                                  className="absolute -left-[1px] top-0 h-[6px] w-[18px] rounded-full bg-[#1d1d1f]"
                                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                                />
                              )}
                            </span>
                          ))}
                        </div>
                        <AnimatePresence initial={false}>
                          {at > 0 && (
                            <motion.button
                              type="button"
                              onClick={back}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.16 }}
                              className="h-8 rounded-full px-3 text-[13px] font-medium text-[#1d1d1f] outline-none transition-colors hover:bg-black/[.06] focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                            >
                              Back
                            </motion.button>
                          )}
                        </AnimatePresence>
                        <button
                          type="button"
                          data-next
                          onClick={next}
                          className="h-8 min-w-[68px] rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                        >
                          {at >= total - 1 ? "Done" : "Next"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          <p className="sr-only" aria-live="polite">
            {done ? "Tour complete" : `Step ${at + 1} of ${total}: ${step.title}`}
          </p>
        </>
      )}

      {/* ghost pointer for the self-demo */}
      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-40 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}
```
