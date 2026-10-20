# Mentorship Bento

Build a "why choose us" bento section for an interview-prep community: six tiles that each pair an Apple-style title/figure/caption lockup with a small live illustration — a hover-tracked mentor list, a cohort ring, chat threads (one static, one that types itself), a dark live-room tile with a rotating speaker, and a weekly bar chart. It should feel calm and editorial, with everything rising into place once as it scrolls into view.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useInView`, `useMotionValue`, `useTransform`, `useReducedMotion`, variants).
- File: `components/blocks/animated-bento-grid.tsx`, default export `WhyChooseUsBento`.

## API

No props. All copy and data are constants at the top of the file (see Demo data).

## Layout and look

- Section: bg `#f5f5f7` / dark `#000`; padding 64px × 16px, 96px × 24px from `sm`, 32px sides from `lg`. Content max 72rem (`max-w-6xl`) centred.
- Header: grid, 16px gap; from `md` two columns `1.25fr 1fr`, bottom-aligned. H2 34px (48px from `sm`), semibold, leading 1.07, tracking −0.035em, `#1d1d1f` / `#f5f5f7`, balanced. Lead paragraph 17px, leading 1.47, `#6e6e73` / `#a1a1a6`, max 28rem, right-aligned in its column from `md` with 8px bottom padding.
- Tile grid: 40px below (56px from `sm`); 1 column, 2 from `md`, 6 from `lg`; gap 12px (16px from `sm`).
- Tile: `article`, radius 28px, padding 24px (28px from `sm`), flex column, `overflow: hidden`. Light: white, `0 0 0 1px rgba(0,0,0,.05)`, hover adds `0 20px 40px -24px rgba(0,0,0,.25)`. Dark: `#1c1c1e`, `0 0 0 1px rgba(255,255,255,.08)`, hover `0 0 0 1px rgba(255,255,255,.12), 0 24px 48px -24px rgba(0,0,0,.8)`. Inverse tile: `#1d1d1f` (dark `#1c1c1e`), hover shadow `0 24px 48px -24px rgba(0,0,0,.45)`. Shadow transition 500ms ease-out.
- Tile copy lockup: title 15px semibold; figure 12px below, 56px (64px from `sm`) semibold, leading 1, tracking −0.04em, optional unit 24px (28px `sm`) baseline-aligned with 6px gap; caption 12px below, 15px, leading 1.47, max 30ch, muted. Inverse: title/figure `#f5f5f7`, caption `#a1a1a6`.
- Monogram: round, white semibold initials at 36% of size, gradient `#a1a1a6 → #86868b` (dark `#636366 → #48484a`); the "You" variant is solid `#0071e3` reading "You".
- Tiles in order:
  1. **Mentors who have hired** (`md` span 2, `lg` span 4): row from `sm` (copy left, list right, bottom-aligned, 32px gap). Figure counts up to 140. List: 320px wide (full on phones), radius 20px, bg `#f5f5f7` / `#2c2c2e`, 6px padding; rows 12px × 10px with a 34px monogram, name 14px semibold, role 12px muted, slot 12px `#86868b` / `#98989d` tabular on the right. The hovered row sits on a white pill (radius 14px, `0 2px 6px rgba(0,0,0,.08), 0 0 0 .5px rgba(0,0,0,.04)`; dark `#3a3a3c`).
  2. **A cohort at your level** (`lg` span 2): figure "6" unit "people". Below, a 196px square: a 148px hairline circle (`black/8%` / `white/10%`), six 38px monograms on a 74px-radius ring starting at −90° every 60° (with a 3px ring in the tile colour), and a 52px "You" in the centre with a 4px ring.
  3. **Someone checks in** (`lg` span 2): figure "Daily"; static chat pinned to the bottom (24px top padding).
  4. **Help before you give up** (`lg` span 2): figure "24/7"; live chat, min height 188px, bottom-aligned.
  5. **Live doubt-clearing** (inverse, `lg` span 2, row span 2): top line 13px medium `#a1a1a6` with an 8px red `#ff3b30` dot and a ping halo: "Open room, graphs and DP". Copy 20px below: figure "4" unit "min". Then (32px below) a stage: min 176px, radius 20px, `#2c2c2e`, showing the current speaker's 72px monogram (`#8e8e93 → #636366`) over a pill `black/40%` 12px medium name. Below, a 5-column grid (8px gap) of square radius-14px `#2c2c2e` cells with 26px monograms; the current speaker's cell has `inset 0 0 0 2px #0071e3`.
  6. **Progress you can see** (`md` span 2, `lg` span 4): row from `sm`. Figure counts up to 38, unit "solved". Right block 340px: a pill (radius 14px, well bg, 14px × 10px) with an 8px `#34c759` dot and "Mock interview with Priya at 7:30 pm" (time muted); a 132px-tall bar chart of 7 bars, 8px gap, radius 8px, heights `value/9`; today's bar `#0071e3` with its value in 12px semibold `#0071e3` / `#2997ff` above, others `#e8e8ed` / `#3a3a3c`; day letters 12px below (today semibold ink).
- Chat bubbles: radius 18px, 14px × 8px padding, 14px, leading 1.35, max 85%; "me" right-aligned `#0071e3` white; "them" left `#e9e9eb` / `#3a3a3c`. 6px gap.

## Motion

- Section uses `initial="hidden" whileInView="visible"` once, margin −80px, staggering children 0.08s; the grid staggers tiles 0.07s.
- Rise variant: from `opacity 0, y 16, blur(6px)` to rest, spring 240 / 30. Reduced motion: plain 0.4s fade.
- Count-up: on first view (margin −80px), spring with duration 1.6s, bounce 0, delay 0.25s, from 0; rendered with `toLocaleString`.
- Mentor highlight: shared `layoutId`, spring 420 / 34; rows stagger 0.06s after 0.2s. Leaving the list resets to the first row.
- Cohort ring: monograms fly out from the centre (`scale .4` → 1) to their ring positions, spring 220 / 20, delay `0.3 + i × 0.05s`.
- Static chat: bubbles stagger 0.12s after 0.3s, from `y 10, scale .92, blur(4px)`, spring 420 / 34, origin on their own side.
- Live chat: a frame timeline advances every 1100ms while in view: for each "them" message a typing frame then the message; two hold frames at the end; then it restarts with new keys. New bubbles enter as above with `layout`; old ones exit by fading/blurring in 0.2s. Typing dots: three 6px dots, opacity `[.35,1,.35]` and `y [0,−2,0]`, 1s loop, staggered 0.16s.
- Live room: speaker changes every 2600ms while in view; names swap with `y 40% → 0 → −40%` and `blur(8px)`, spring 240 / 30; the blue cell ring follows via `layoutId` (420 / 34).
- Week bars: `scaleY 0 → 1` from the bottom, spring 260 / 24, delay `0.3 + i × 0.05s`.

## Interaction and states

- Hovering mentor rows moves the highlight; everything else is ambient. Intervals run only while their tile is in view and stop under reduced motion (live chat then shows the full thread).

## Demo data

- Header: "Interview prep goes faster with people in your corner." / "Daily practice, a cohort at your level, and engineers who have sat on the other side of the table."
- Captions: tile 1 "Staff engineers and hiring managers who run real interview loops, on call for weekly 1:1s."; tile 2 "Same target roles, same timeline. You meet every morning."; tile 3 "Your cohort sees your streak and asks about the set you promised to finish."; tile 4 "Ask the group when a problem stalls you. Someone has solved it before."; tile 5 "Median time to get unstuck. Drop in, share your screen, and talk it through."; tile 6 "Problems this month, mock interviews booked, and a reminder before every session."
- Mentors: Priya Nair (Staff engineer, payments, Tue 7:30 pm), Emily Ross (Engineering manager, Wed 6:00 pm), Daniel Kim (Principal engineer, Thu 8:15 pm), Sara Moreno (Hiring manager, 120+ loops, Sat 10:00 am).
- Cohort: Alex Chen, Jordan Lee, Sam Patel, Taylor Brooks, Morgan Diaz, Riley Park. Room: the first five.
- Check-in chat: them "Did you finish the graphs set?" / me "14 of 15. The last one is a beast." / them "Send me your approach before standup?"
- Help chat: them "An hour on this DP problem and I'm stuck." / me "What's your recurrence so far?" / them "dp[i] = best ending at i, but it's off by one." / me "Try: best using the first i items."
- Week: M4 T6 W3 T7 F5 S9 S4, today = Saturday (index 5), max 9.

## Accessibility

- Count-ups render the final number in an `sr-only` span and hide the animated one.
- Decorative illustrations (cohort ring, live chat, live room) are `aria-hidden`; the bar chart is `role="img"` with "Problems solved per day this week, peaking at 9 on Saturday".
- Ring positions are rounded to 2 decimals so server and client markup match. Ping animation stops under `motion-reduce`.

## Acceptance checklist

- [ ] Six tiles: 4+2 / 2+2+2(tall) / 4 layout on desktop, two columns on tablet, one on phones.
- [ ] Tiles rise in with a blur once, staggered.
- [ ] 140 and 38 count up when first seen.
- [ ] Hovering mentors slides the white highlight; leaving resets to Priya.
- [ ] Cohort monograms spring out from "You" into a ring.
- [ ] The help chat types, shows typing dots, then loops.
- [ ] The dark tile cycles speakers every 2.6s with the blue ring following.
- [ ] Saturday's bar is blue with "9" above it.
- [ ] Dark mode uses `#000` page and `#1c1c1e` tiles.
- [ ] Reduced motion shows everything static and complete.
