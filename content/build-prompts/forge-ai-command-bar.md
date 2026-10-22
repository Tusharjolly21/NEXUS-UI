Build a command bar for an AI copilot. A white rounded card holds a sparkle badge, a prompt field and a round blue send button, with an Ask / Edit / Build segmented switch and up to three suggestion chips underneath. Send a prompt and the card grows a panel above the field with a soft overshoot: the prompt lands as a heading and progress steps appear one by one, each spinning then ticking off with a green check, while a rainbow light runs round the card's edge. The send button morphs into a stop square. Cmd/Ctrl+K focuses it; Esc stops a run.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, a `cn` helper, framer-motion (`AnimatePresence`, `LayoutGroup`, `animate`, `motion`, `useMotionTemplate`, `useMotionValue`, `useReducedMotion`).
- File: `components/forge-ai-command-bar/forge-ai-command-bar.tsx`, named export `AiCommandBar` plus the alias `export const ForgeAiCommandBar = AiCommandBar`, types `AiCommandBarProps` and `AiCommandMode = "ask" | "edit" | "build"`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `placeholder` | `string` | `"Describe what you need..."` | Empty-field placeholder ("Working on it..." while busy). |
| `suggestions` | `string[]` | "Add a pricing table", "Make the hero animate in", "Switch the app to dark mode" | One-tap prompts (first three shown) while empty and idle. |
| `defaultMode` | `AiCommandMode` | `"build"` | Starting mode. |
| `onSubmit` | `(prompt: string, mode: AiCommandMode) => void` | — | Called with the trimmed prompt on send or chip tap. |
| `steps` | `(prompt, mode) => string[]` | four generic steps | Progress lines. |
| `hotkey` | `string` | `"k"` | Cmd/Ctrl + key focuses the field; `""` disables it and hides the hint. |
| `autoplay` | `boolean` | `false` | Types and runs the suggestions until touched. |
| `className` | `string` | `""` | Root classes. |

Default steps: "Reading the project"; "{Answering|Editing|Building}: {prompt}" (prompts over 34 chars cut to 32 + "..."); "Checking 12 sources" for ask, else "Writing 3 files"; "Done in 1.8s".

## Layout and look

- Root: full width, max 520px. Under the card, a 13px centred `#86868b` (dark `#a1a1a6`) hint 12px below: "Type a prompt or tap a suggestion. Esc stops it."
- Outer shell: radius 24, padding 1.5px (the ring's thickness). Behind it, absolutely filling, the edge light: `conic-gradient(from {angle}deg, #0071e3, #bf5af2, #ff9f0a, #30d158, #0071e3)`, opacity 1 while working, 0 otherwise (0.4s).
- Card: radius 22.5, overflow hidden, white (dark `#1c1c1e`), text `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)` / `.9`).
- Panel (when open): padding 20px top and sides, 16px bottom, bottom border `black/6` (dark `white/8`). Heading: the prompt, 17px semibold, snug, tracking −0.02em. Steps list (12px below, gap 8): rows 13px with gap 10; an 18px status slot holding either a 14px spinner (2px border `#0071e3`/25 with a solid top, dark `#0a84ff`) or a check (green `#30d158` circle r 9 with white path `M5 9.4l2.6 2.5L13 6.4`, stroke 2, round). Text `#6e6e73` / `#a1a1a6` while pending, full ink when done.
- Form row (padding 12, 16px sides from `sm`, gap 8): 36px sparkle badge (`#f0f0f3` / `#2c2c2e`, `#0071e3` / `#0a84ff` four-point star 16px); the 36px-tall input (15px, tracking −0.01em, placeholder `#86868b` / `#8e8e93`, wait cursor when disabled); a `kbd` "Cmd K" (11px, `#f0f0f3` / `#2c2c2e`, `#6e6e73`, radius 6, padding 2×6, only from `sm` and only when empty and idle); a 36px send button `#0071e3` (dark `#0a84ff`) with a 16px up arrow (`M8 13V3.5M3.5 7.5L8 3l4.5 4.5`, stroke 2), disabled `#e8e8ed` / `#86868b` (dark `#2c2c2e` / `#8e8e93`).
- Bottom row (padding 0 12px 12px, wrap, gap 8): mode radiogroup in a `#f0f0f3` / `#2c2c2e` pill with 2px padding; options 12px medium, padding 4×12; the active one sits on a white (dark `#48484a`) pill with `0 1px 3px rgba(0,0,0,.12)`. Then suggestion chips: 12px, padding 4×12, rounded, inset 1px ring `black/8` (dark `white/12`), hover `#f5f5f7` / `#2c2c2e`, truncate.

## Motion

- Panel spring (the signature overshoot): stiffness 260, damping 20. Shell, card, and panel use `layout` with it; the form, bottom row, heading and steps use `layout="position"`. Wrap in a `LayoutGroup` with a `useId` id.
- Panel enters from `opacity 0, y 12, scale 0.98`; exits to `opacity 0, y 8, scale 0.98` in 0.16s (`AnimatePresence mode="popLayout"`).
- General spring: stiffness 420, damping 32. Steps enter from `opacity 0, x −8`. Check pops `scale 0.4 → 1` (spring 600/14) and the tick draws `pathLength 0 → 1` in 0.3s, delay 0.05. Spinner rotates 360° every 0.8s linear.
- Steps reveal every 650ms: show steps up to `shown + 1` (current one spinning); after the last, phase becomes `done` and the panel stays open.
- Edge light: while thinking, animate the angle motion value from current to +360 over 1.6s linear, repeating. Sparkle badge wiggles `rotate [0, 18, −12, 0]`, `scale [1, 1.12, 1]` over 1.2s repeating while busy.
- Send ↔ stop icon (`popLayout`): arrow enters from `y 10` and exits to `y −14`; stop square (12px, radius 3) enters from `scale 0, rotate −90°`. Button `whileTap` 0.88.
- Mode pill: shared `layoutId`, spring 500/30. Chips enter `opacity 0, scale 0.8` staggered 0.04s, exit in 0.12s, `whileHover y −1`, `whileTap` 0.94.
- Reduced motion: no ring spin, wiggle or spinner rotation; checks appear drawn.

## Interaction and states

- Phases: `idle`, `thinking`, `done`. Submit while thinking stops. Empty value does nothing. Running clears the field.
- Esc in the field: stop (if not idle) or clear the text. Stop clears timers, steps and closes the panel.
- Chips call `onSubmit` and run immediately with the current mode.
- Clear all timers on unmount.

## Autoplay demo

After 600ms, for suggestion k: set mode to Ask, Edit, Build in turn, type one character every 38ms starting at 500ms, run it 450ms after the last char; when done wait 1800ms, close, wait 700ms, next. Every step checks a touched flag; any pointer down or key in the root stops it forever. The preview passes `hotkey=""`.

## Accessibility

- Field has a visually hidden label "Prompt" linked by id. The panel is `aria-live="polite"`. Mode switch is `role="radiogroup"` labelled "Mode" with `role="radio"` and `aria-checked`. The send button is labelled "Send" or "Stop". Focus rings 2px `#0071e3` (dark `#0a84ff`).

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Sending a prompt plays `whoosh` (a short airy noise sweep rising from about 400 to 3200 Hz over roughly 0.25s). Switching the mode (Ask, Edit or Build) to a different one plays `tick` (a tiny burst of high-passed noise above about 5 kHz, roughly 12ms) at 50% volume. Tapping a suggestion chip plays `tap` (a short dry click: a sine dropping from 900 to 620 Hz over 60ms plus a faint high hiss). Stopping a run, the progress steps, and the autoplay cycle are silent. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Sending grows a panel above the field with a slight overshoot; the prompt is the heading.
- Steps appear every 650ms, each spinning then ticking with a green check.
- A rainbow light circles the edge only while working.
- Send turns into a stop square; pressing it or Esc cancels and collapses.
- Mode switch slides its pill; chips vanish while typing or running.
- Cmd/Ctrl+K focuses the field.
- Autoplay cycles prompts and modes until the first touch.
