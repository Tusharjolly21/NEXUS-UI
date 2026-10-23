# Frost Input

Build a sign-up field with an ice power. Focus it and six-fold frost crystals branch out from where you clicked until the glass is frozen over and the text glows cold. Every key you type drives a crack through the ice from the caret, with chips of ice spitting out. Send it and the field shatters from the point of impact into tumbling shards that fall away to reveal a confirmation, then the field freezes back together. Blur it and the frost thaws. It is a real form field: label, Enter to submit, `onSubmit` callback.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS, `framer-motion` (the confirmation badge and the send button press) and two `<canvas>` layers plus off-screen canvases. `cn` for class merging, `useId` for the input id.
- File: `components/frost-input/frost-input.tsx` plus an `index.ts`. Named exports: `FrostInput` and `FrostInputProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `placeholder` | `string` | `"you@studio.com"` | Placeholder text inside the empty field. |
| `headline` | `string` | `"Join the cold list."` | Headline above the field. |
| `done` | `string` | `"You’re on the list."` | Message shown after the field shatters. |
| `onSubmit` | `(value: string) => void` | none | Called with the trimmed value when the form is sent. |
| `height` | `number` | `420` | Height of the stage, in px. |
| `autoplay` | `boolean` | `false` | A ghost clicks in, types `hello@nexus.design` and sends it, in a loop, until a real pointer or key arrives. |
| `className` | `string` | none | Extra classes for the stage. |

## Layout

- The stage is `relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[24px] px-6` with an inline `height` and a fixed dark blue background (`radial-gradient(120% 90% at 50% 0%, #1d4a6e, #0f2a44 45%, #081624)`), so it reads the same on light and dark pages. Fonts: SF Pro stack with Inter and system fallbacks.
- Inside: a background canvas (`absolute inset-0`, snow, glow, glass body, frost, vapour), then a `<form>` (`relative z-10`, max 460px wide) holding a centred headline (`clamp(28px, 4.4vw, 40px)`, semibold, white), the hint line "Click in. Type. Send it." (15px, `#a9cbe6`) and the pill; then an effects canvas (`absolute inset-0 z-20`, shards, chips, ghost cursor); then the confirmation. Both canvases are `pointer-events-none` and `aria-hidden`.
- The pill is a 60px high, fully rounded `div` holding a transparent `type="email"` input (18px, weight 500, `#eaf7ff`, caret `#bfe6ff`, left padding 24px, right padding 64px) and a 44px round send button at `right-2` (`bg-[#dff2ff]/20`, up-arrow icon). The glass itself is painted on the background canvas under the transparent input.
- The confirmation is a centred row just under the middle of the stage: a 32px round `#bfe6ff` badge with a check mark plus the `done` text (18px semibold, white).
- Canvas size is layout `offsetWidth x offsetHeight x min(2, devicePixelRatio)`. A `ResizeObserver` on the stage and the pill refits. Pill position is the rect difference to the stage divided by the CSS scale (`rect.width / offsetWidth`, treated as 1 when within 0.5%), so the effect still lines up inside a scaled preview.

## Motion

- Frost: focusing seeds a six-armed crystal at the click point (30% across the field when focused by keyboard), then up to two more seeds at random spots 0.45s apart, plus random rim seeds for the first 2.6s. Each arm is a branch with a heading that curls slightly and jitters, speed 38 to 72 px/s, length 40 to 120px. Every 2.2 to 5px a branch throws a twig at about 60 degrees on alternating sides (depth up to 3, capped at 2600 live branches). Strokes are drawn onto an off-screen frost canvas clipped to the pill shape, width 0.85/0.6/0.42/0.32 and alpha 0.42/0.32/0.25/0.18 by depth. Behind each depth 0 and 1 tip a soft radial blob is laid on a haze canvas; a pre-rendered grain texture (tiny light specks and short dashes) is masked by the haze (`source-in`) so the rime is grainy only where frost formed.
- `cold` (0 to 1) eases toward 1 while focused (rate 2.2/s) and back to 0 on blur (rate 1.1/s), snapping to 0 under 0.02, at which point all ice is cleared. It drives the glass: body gradient and border alpha, the top sheen, a blue outer glow (`shadowBlur 30 * cold`), the frost alpha (`min(1, cold * 1.2)`) and the text shadow on the input (`0 0 8px` cold blue, scaled by `cold`). While `cold > 0.3` vapour puffs rise from the top edge (radial gradients, 2 to 3.6s life, drifting up at 11 px/s and growing).
- Typing: each character added calls `crack`. Two cracks start at the caret (end of text up to `width - 70`), heading roughly up and down, length 0.6 to 1.1 times the pill height, step 6 to 12px with a 0.9 rad jitter, splitting into children (depth up to 2, 45% chance every 8 to 18px). Each segment is a dark blue refraction line under a bright white line. A white spall (radial gradient plus seven short strokes) is drawn at the impact. Nine ice chips fly up from the caret (60 to 240 px/s, gravity 900, 0.5 to 1s) and the pill shakes (`shake` set to at least 0.35, decays 4/s, up to 3px by 1.5px of random translate).
- Send (button or Enter, with a non-empty trimmed value): a snapshot canvas of the frozen field (body, frost, cracks, text with a cold glow, send button disc) is taken. An impact point is chosen (the button when sent from it, otherwise the caret). Shards are cut from 18 jittered rays and 14 rings (0, 10, 24, 44, 70, 100, 135, 175, 220, 270, 330, 400, 480, 580 px, each vertex scaled 0.8 to 1.2), neighbours sharing vertices; pieces fully outside the pill are skipped. Each shard flies outward from the impact (speed `140 + 260 / (1 + d/60)` plus up to 90, vertical speed 0.6 times that minus 160 to 280), spins, falls under gravity 1500, starts after a delay of `d / 1400` s, fades from 0.8s to 1.4s and is clipped to the pill shape so only real glass is drawn, with a thin light outline. Seventy chips burst from the impact. The real pill fades out instantly (opacity 0, no transition), the input blurs, `onSubmit(value)` runs and the confirmation springs in (scale 0.8 to 1, y 8 to 0, stiffness 260, damping 18, delay 0.25s). After 3s the confirmation leaves, the value clears and the pill fades back in (0.5s).
- Empty send: the pill shakes and the input is focused.
- Snow: 70 dots fall slowly with a small sideways sway on the background canvas, only when `autoplay` is on.
- Autoplay loop (ghost cursor = white dot with a ring): glide to the field (0.8s), click and focus at 18% of the width (at 1.0s), let it freeze (to 1.6s), type `hello@nexus.design` one character per 0.11s with a crack each, glide to the send button, shatter from the button, hold the confirmation for 3.1s, clear and repeat. The first real pointer down, focus or click ends the demo and hands over a clean field.
- The loop runs only while something is moving (focus, thaw, cracks, shards, chips, vapour, shake, autoplay) and the stage is on screen (`IntersectionObserver`); the last frame stays as the still image and interaction wakes the loop again. The idle field is the empty glass pill with static snow.
- Reduced motion: no snow drift, no demo, no cracks, chips, shake, vapour or shards. Focus grows the frost instantly (about 3 seconds of growth are run at once) and shows it frozen, blur removes it, send hides the field and shows the confirmation with a short fade, and the press scale on the button is off.

## Accessibility

- A real `<form>` with a visually hidden `<label>` ("Email address") tied to the input by `useId`, `type="email"`, `autoComplete="email"`; Enter submits. The send button has `aria-label="Send"` and a visible focus ring.
- A persistent `role="status"` region (visually hidden) announces the `done` text; the animated confirmation is `aria-hidden` so it is not read twice.
- Canvases are `aria-hidden` decoration. Cleanup on unmount cancels the frame, disconnects both observers and restores the inline styles written to the pill and input.
