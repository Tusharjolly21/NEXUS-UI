# No Results

Build a "no results" state that tells you why and fixes it for you. A search field holds a typo, filter chips narrow the list, and the list is empty. The empty state names the cause and offers the fix in one tap: the missing letter slides into the search box, the filter chips peel away one by one and the matching rows drop back in. The search box stays a real input, so typing the typo back brings the empty state back.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`), an `IntersectionObserver` and the page visibility API.
- File: `components/no-results/no-results.tsx` plus an `index.ts`. Named exports `NoResults`, the constants `NO_RESULTS_ROWS`, `NO_RESULTS_FILTERS`, `NO_RESULTS_TYPO`, and the types `NoResultsProps`, `NoResultsRow`, `NoResultsFilter`, `NoResultsTypo`, `NoResultsStatus`.

## API

`NoResultsRow`: `{ id: string; who: string; amount: string; status: "Paid" | "Pending" | "Overdue"; age: number }`. `NoResultsFilter`: `{ label: string; test: (row) => boolean }`. `NoResultsTypo`: `{ wrong: string[]; right: string }`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `rows` | `NoResultsRow[]` | four demo invoices | Rows shown once nothing hides them. |
| `filters` | `NoResultsFilter[]` | "Status: Paid", "Last 7 days" | Chips applied at the start. A row stays only if every filter keeps it. |
| `query` | `string` | `"invoce march"` | Starting text of the search box. |
| `typo` | `NoResultsTypo` | `{ wrong: ["invoce","invioce","invocie"], right: "invoice" }` | Misspellings to spot (case-insensitive) and the word that replaces them. |
| `noun` | `string` | `"invoices"` | Used in the headline and the input label. |
| `maxRows` | `number` | `6` | Most rows shown. |
| `onFixTypo` | `(query) => void` | none | Called with the corrected query when the fix button is pressed. Not called by autoplay. |
| `onClearFilters` | `() => void` | none | Called when Clear filters is pressed. Not called by autoplay. |
| `autoplay` | `boolean` | `false` | Demos the fix on a loop until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds. |
| `className` | `string` | none | Extra classes on the card. |

Demo rows: INV-1042 Orbitly $4,200 Pending, 3 days; INV-1039 Fernhill $1,180 Overdue, 12; INV-1036 Vela $860 Paid, 19; INV-1031 Quadrant $12,400 Paid, 24. "Status: Paid" keeps Paid rows; "Last 7 days" keeps rows with `age <= 7`. With both filters nothing matches even after the typo is fixed, which is the point of the demo.

The list is empty while the query contains a typo or no row passes every filter. The query itself does not filter rows.

## Layout and look

- Card: width 520px, `max-width: 100%`, radius 28px, white / dark `#1c1c1e`, padding 20px (24px from 640px), shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark: ring `rgba(255,255,255,.08)`, shadow alpha .9).
- Search field: a `<label>` 48px tall, radius 14px, bg `#f5f5f7` / dark `#2c2c2e`, 16px side padding, 10px gap; a 16px magnifier icon (stroke `#86868b`, 2.4px) then the text area, 22px tall. The visible text is a row of single-letter spans (16px, `#1d1d1f` / dark `#f5f5f7`, `white-space: pre`, `aria-hidden`), one span per character. A real `<input>` sits exactly on top with transparent text and a `#0071e3` (dark `#0a84ff`) caret, labelled `Search <noun>`.
- Chip row: 12px below, wrapping, 8px gap, min-height 30px. A chip is a 30px pill, bg `#eef5ff` / dark `rgba(10,132,255,.2)`, text `#0071e3` / dark `#6cb6ff`, 12.5px medium, 12px left and 8px right padding, with a 10px cross icon. A "Reset" text button (12.5px medium, same blue) is pushed right and appears only after the state differs from the start.
- Results area: 12px below the chips, min-height 250px.
- Empty state: centred, 24px top padding, 16px side padding. A 150px by 72px illustration: three rounded bars (10px tall, widths 100%, 78%, 88%, tops 10, 32 and 54px, `#f0f0f3` / dark `#2c2c2e`) with a 44px magnifier (1.8px stroke, `#1d1d1f` / dark `#f5f5f7`, lens filled white 75% / dark `#1c1c1e` 75%) drifting over them. Then the headline `No <noun> match "<query>"` (16px semibold, 16px above; "…" when the query is empty), the reason (13.5px, `#6e6e73` / dark `#a1a1a6`, 4px below): "There's a typo, and 2 filters are narrowing things down." / "Looks like a typo." / "2 filters are hiding everything." (counts follow the chips), then 16px below a wrap row of buttons: the primary `Search "invoice" instead` (36px pill, 13px medium, bg `#1d1d1f` text white; dark bg `#f5f5f7` text `#1d1d1f`) shown while a typo exists, and `Clear 2 filters` (36px pill, bg `#f5f5f7` / dark `#2c2c2e`) shown while chips remain.
- List: rows with a 1px bottom hairline (`rgba(0,0,0,.05)` / dark `rgba(255,255,255,.08)`, none on the last), 12px vertical padding, 12px gap: id (mono 12px, `#6e6e73` / dark `#a1a1a6`, 76px), name (14px medium, flexible, truncates), a status pill (11.5px semibold, fully rounded, 8px by 2px padding) and the amount (14px tabular, right aligned, 70px). Pill colours: Paid `#e9f9ee` on `#1a7f37` (dark `rgba(48,209,88,.15)` on `#4ade80`); Pending `#fff4e5` on `#b25e00` (dark `rgba(255,159,10,.15)` on `#ffb340`); Overdue `#fff1f0` on `#c4271b` (dark `rgba(255,69,58,.15)` on `#ff6961`).

## Motion

- Letters: each character has a stable key. When the text changes, find the common prefix and suffix and keep their keys, so only the edited letters are new. A new letter enters from `opacity 0, y -10, scale .6` on a spring (stiffness 500, damping 26) with a `rgba(52,199,89,.3)` highlight behind it that fades out over 800ms after a 600ms delay. Letters to its right slide along with `layout="position"` inside a `LayoutGroup`.
- Chips: enter from `opacity 0, scale .8`; the exit peels away to `x 30, rotate 8, opacity 0` over 250ms; remaining chips `layout`-animate into place.
- Clear filters removes the chips from the first, one every 180ms.
- Empty state and list swap with `AnimatePresence mode="popLayout"`: the empty state enters from `y 10, opacity 0` and leaves to `y -8` over 180ms. Rows drop in from `y -14, opacity 0, blur 4px` to rest on a spring (stiffness 380, damping 30) staggered 60ms per row, the blur clearing over 250ms.
- The magnifier loops forever over 3.4s ease-in-out through `x: 0, 100, 30, 0`, `y: 0, 18, 26, 0`, `rotate: 0, 8, -6, 0`.
- Reduced motion: no letter slide or highlight, no magnifier motion, no layout animation, short fades, chips clear at once.

## Interaction and states

- Typing edits the real input; the letters follow. The empty state appears whenever a listed typo is present.
- The fix button replaces the typo with `typo.right` and calls `onFixTypo`. Clear filters peels all chips; pressing a single chip removes it. Reset restores the starting query and chips.
- After a keyboard activation of one of these buttons (the button disappears), focus moves to the results area.

## Autoplay demo

Only while the card is on screen, the tab is visible and motion is not reduced. Loop of 7.6s: reset at 0, fix the typo at 1.8s, clear the filters at 3.6s, reset at 7.4s. Any pointer press or typing stops the loop for good. The demo never calls the callbacks.

## Accessibility

- The input is labelled `Search <noun>`; the animated letters are `aria-hidden`. A polite `sr-only` `role="status"` region announces the headline and reason when the list is empty, otherwise `<n> <noun> shown`.
- Chips are buttons labelled `Remove filter <label>`; the magnifier illustration is `aria-hidden`. Focus rings are 2px `#0071e3` (dark `#0a84ff`) outlines with 2px offset; the search field shows the same outline on focus within.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- The fix button plays `pop` (0.5) as the letter lands. Clear filters plays `tick` (0.4) on the first chip and then on every second chip, so two chips make one tick. Removing a single chip plays `tick` (0.4); Reset plays `tap` (0.35).
- Autoplay plays the same `pop` and `tick` through `play.auto`, which stays silent until the visitor has interacted with the page once. Typing and hover are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs with the component.

## Acceptance checklist

- [ ] The card opens on `invoce march` with two chips and an empty state saying there is a typo and 2 filters.
- [ ] "Search "invoice" instead" slides the missing letter in with a green flash and the headline updates.
- [ ] "Clear 2 filters" peels the chips away one by one and the four rows drop in with a blur clearing.
- [ ] Typing `invoce` back into the field brings the empty state back.
- [ ] Reset appears only when something has changed and restores the start.
- [ ] Keyboard use never loses focus; the live region reads the result.
- [ ] Autoplay fixes, clears and resets on a loop and stops for good on touch.
- [ ] Dark mode uses the dark card, tinted pills and the lighter blue; layout holds at 320px.
