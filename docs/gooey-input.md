# Gooey search input (`GooeyInput`)

An original React component (not affiliated with Aceternity UI) that recreates the **collapsed → expanded** search pill pattern with a **detached circular icon** and **SVG gooey merge** between the pill and the bubble.

**Files in this repo**

| File | Purpose |
|------|---------|
| `src/components/gooey-input/gooey-input.tsx` | Production component |
| `src/components/gooey-input/demo.tsx` | Demo / layout examples |
| `src/app/(site)/demos/gooey-input/page.tsx` | Live demo at `/demos/gooey-input` |

---

## Installation (copy into another Next.js project)

1. **Dependencies** (versions can match your app):

   ```bash
   npm install framer-motion lucide-react clsx tailwind-merge
   ```

2. **Utility** — ensure you have a `cn()` helper (same as shadcn):

   ```ts
   // lib/utils.ts
   import { clsx, type ClassValue } from "clsx";
   import { twMerge } from "tailwind-merge";

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

3. **Copy** `gooey-input.tsx` into your project (e.g. `components/gooey-input.tsx`) and fix the import path for `cn`.

4. **Tailwind** — the component uses your design tokens (`background`, `foreground`, `border`, `muted-foreground`, `primary`, `ring-offset-background`, etc.). Map them in `tailwind.config` / CSS variables like a typical shadcn setup.

5. **Client boundary** — the file starts with `"use client"` because it uses hooks, Framer Motion, and browser-only SVG filters.

---

## Example usage

### Uncontrolled

```tsx
import { GooeyInput } from "@/components/gooey-input";

export function Example() {
  return (
    <GooeyInput
      placeholder="Search docs…"
      defaultValue=""
      onValueChange={(v) => console.log(v)}
      onOpenChange={(open) => console.log(open ? "open" : "closed")}
    />
  );
}
```

### Controlled

```tsx
const [q, setQ] = useState("");

<GooeyInput
  value={q}
  onValueChange={setQ}
  collapsedWidth={120}
  expandedWidth={280}
  expandedOffset={48}
  gooeyBlur={5}
/>;
```

### Disabled

```tsx
<GooeyInput disabled placeholder="Search unavailable" />
```

---

## How the gooey SVG filter works

1. **Two solid shapes** (the rounded pill and the circle) are drawn as normal DOM nodes with the same fill (`background`).

2. The parent of both shapes gets `filter: url(#yourFilterId)`.

3. **`feGaussianBlur`** blurs the alpha and color of the *combined* graphic. Nearby regions bleed into each other so the gap between the pill and the bubble **fills in** like liquid.

4. **`feColorMatrix`** (alpha channel) **boosts contrast** on the blurred alpha so edges become sharp again while keeping the “blob” where the two shapes were close. A typical matrix uses a large multiplier on the alpha row (e.g. `… 0 0 0 19 -9`) so mid-opacity blur becomes nearly opaque—this is what reads as **goo**.

5. **`stdDeviation`** on the blur controls how thick the bridge is: **higher** = softer, wider merge (`gooeyBlur` prop).

6. **Motion** — the pill’s width and the bubble’s horizontal offset animate so the shapes **move closer** when expanded; the filter makes the merge **read as continuous organic matter** instead of two separate boxes.

**Note:** SVG filters are applied to rasterized snapshots of the subtree; keep the filtered subtree small (here: pill + bubble only) for best performance.

---

## Behavior summary

| Behavior | Implementation |
|----------|------------------|
| Collapsed when empty + blurred | `open` is true only when focused or when the trimmed value is non-empty (and not `disabled`) |
| Expand on focus / click bubble | `onFocus` + bubble `onPointerDown` → `input.focus()` |
| Controlled / uncontrolled | `value` vs `defaultValue` + internal state |
| Keyboard | Tab to focus; **Escape** blurs the input |
| A11y | `role="searchbox"`, `sr-only` label, `focus-within` ring on wrapper |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `"Type to search..."` | |
| `className` | `string` | — | Wrapper classes |
| `collapsedWidth` | `number` | `115` | Pill width (px) when collapsed |
| `expandedWidth` | `number` | `200` | Pill width (px) when expanded |
| `expandedOffset` | `number` | `50` | Bubble `translateX` toward pill when expanded (stronger merge) |
| `gooeyBlur` | `number` | `5` | `feGaussianBlur` `stdDeviation` |
| `value` | `string` | — | Controlled value |
| `defaultValue` | `string` | `""` | Uncontrolled initial value |
| `onValueChange` | `(v: string) => void` | — | |
| `onOpenChange` | `(open: boolean) => void` | — | Fires when expanded state changes |
| `disabled` | `boolean` | `false` | Disables goo + interaction |

All other props are passed to the underlying `<input>` (except `size`, `width`, native `onChange` for value pipeline).
