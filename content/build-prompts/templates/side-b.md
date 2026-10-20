# Build prompt: Side B — music streaming landing page

Build a single-page marketing site for **Side B**, a music streaming app that starts from the mood you're in rather than the songs you've played: spin a feeling, hum a tune, make someone a mixtape. The feel is Apple-light with a playful streak: a near-white page, white cards, black feature sections and one vivid purple. The hero is a working record player whose vinyl spins while music "plays".

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours (no theme tokens), so it renders the same inside a dark-mode host.
- Framer Motion 12 for all motion. No other animation or UI libraries, no remote images, no web fonts.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Page structure and copy

1. **Sticky pill nav.** Logo: a small spinning record with a purple label, plus "Side B". Links Moods, Mixtapes, Studio, Plans; a purple "Try free" button.
2. **Hero, two columns.** Left: eyebrow "100 million songs. One that fits right now." in purple. Headline "Music for whatever **today** is." (accent on "today"), word by word. Sub: "Side B listens to the mood you're in, not just the songs you've played. Spin a feeling, hum a tune, or make someone a mixtape." Buttons: purple "Try 3 months free" and white "How it picks". Right: a player card. Header: three equaliser bars and "Now playing", "Side B · 2 of 9". A 220px vinyl drawn with repeating radial grooves, a conic sheen and a gradient label, spinning once every 3.2s while playing and easing to rest on pause. Track "Paper Moons" by "Hollow Bay" and a round purple play/pause button whose icon path morphs between the two shapes. Under a hairline, a **Bend Rail** volume slider (default 62).
3. **Genre band.** Two rows of oversized genre words (Soul, Ambient, Jazz, House, Folk, Hip-hop, Classical, Disco, Lo-fi, Afrobeats) run in opposite directions as you scroll and skew with scroll speed; the second row is outlined text, and every third word in the first row is purple. Decorative, so hidden from assistive tech.
4. **Moods** on `#f6f2fb`. "Start from a feeling, not a genre." Card "Spin how you feel." with a **Mood Wheel** (the orb's colour becomes the queue's colour) and card "Or just say it." with a **Voice Orb**: "“Something for a rainy train ride.” Hold to talk. Hum it if you can't remember the name."
5. **Mixtapes.** "Make someone a mixtape." / "Pick up to twelve songs, write on the label, and send the case. They open it on their shelf and the reels start turning." Three dot bullets and a **Tape Shelf** of six labelled cassettes (For the drive from Jules, Paper Moons, Sunday reset from Ana, Night shift, Birthday 30 from Sam, Salt & Iron). Then "New this week / Fresh records, thrown your way." with a **Throw Wheel** of eight gradient album cards.
6. **Studio**, black section. "Side B Studio." / "Sketch a loop on your keyboard, see who's listening and when, and get paid on the day a song plays." Cards: "Sketch a loop." with a **Lit Keyboard** on a light inset; "Payouts, the same day." with four count-up stats ($0.0071 per stream paid daily, 48h upload to live, 92% of revenue to artists, 180 countries); and a wide light card "Your year of listeners, standing up." with a **Standing Calendar** ("thousand listeners").
7. **Plans.** "Three months of Premium, on us." Free $0, Premium $10.99 (dark card with a breathing purple glow), Duo $14.99. Cards lift and tilt slightly on hover, and their little equaliser starts playing while hovered.
8. **FAQ**: how the mood wheel picks, importing playlists, what lossless means, daily artist payouts.
9. **Closing CTA**, a dark rounded panel: "Flip it over. Play the B side." / "Three months of Premium free. Peel the sticker off on your way out." with a white "Start listening" button and a **Sticker Toss** reading "SIDE B · PLAY IT LOUD".
10. **Footer** noting Side B is a template, not a real service.

## Look

- Page `#fbfbfd`, lilac section `#f6f2fb`, dark sections `#000`, `#1c1c1e` and `#1d1d1f`. Ink `#1d1d1f`, secondary `#6e6e73`, captions `#86868b`, dark-mode secondary `#a1a1a6`.
- Purple `#bf5af2` for graphics, darker purple `#7a2fd6` for text and buttons (about 6:1 on white), light purple `#d9a3ff` on black. Pink `#ff9fd0` and gold `#ffd36e` only inside the vinyl label.
- System font stack, antialiased. Hero headline `clamp(52px, 8.4vw, 104px)`, weight 600, line-height 0.95, tracking -0.06em. Genre words `clamp(56px, 9vw, 120px)`.
- Cards radius 28px, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`. Plan cards radius 30px.

## Motion

- Reveals fade and rise once at 25% in view with ease `[0.16, 1, 0.3, 1]`; lists stagger with springs (stiffness 160, damping 22).
- Vinyl: linear infinite rotation while playing; on pause, a soft spring (stiffness 40, damping 12) back to rest. Play/pause path morph uses a spring (stiffness 400, damping 30).
- Equaliser bars loop their heights with slightly different durations per bar.
- Genre band: `useScroll` → `useVelocity` → `useTransform` to ±8deg skew, smoothed with `useSpring` (stiffness 200, damping 30); x offsets come from scroll position modulo the row width. All motion values, no React re-renders.
- Plan hover: lift 8px with a spring (stiffness 300, damping 20) and rotate ±1deg on the side cards.
- The signature interaction: press play/pause and drag the bending volume rail while the record spins.

## Motion Kit components and their jobs

- Bend Rail: the player's volume control.
- Mood Wheel: pick a feeling to build a queue.
- Voice Orb: voice and hum search.
- Tape Shelf: shared mixtapes.
- Throw Wheel: new releases.
- Lit Keyboard: sketching a loop in Studio.
- Standing Calendar: a year of listeners.
- Sticker Toss: the playful closing CTA.

## Responsive and accessibility

- At 390px the hero stacks with the player below the copy, the player and wide demos sit in a fit-to-width scaler, and the genre band is clipped inside its section so there is no horizontal page scroll.
- The play button has an `aria-label` that switches between "Play" and "Pause". Focus rings are visible on every control.
- Keep text at 4.5:1; use the darker purple for text on white.
- No random values or `window` reads during render; respect reduced motion.

## Final checklist

- [ ] The record spins, pauses with a spring and the icon morphs.
- [ ] Genre rows move and skew with scroll speed without re-rendering React.
- [ ] Mood Wheel, Tape Shelf, Throw Wheel and Lit Keyboard respond to drag, click and keys.
- [ ] One accent family, hard-coded; correct in a dark-mode host.
- [ ] No hydration warnings or console errors; no horizontal scroll at 390px.
