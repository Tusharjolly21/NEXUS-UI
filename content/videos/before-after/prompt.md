Make a 10-second before/after comparison video for LinkedIn and X that renders in 4:5, 1:1 and 16:9 from one React component. Light #f5f5f7 background, Inter Display. Music 120 BPM with a soft riser under the wipe.

The subject is one dashboard card (revenue amount with a change pill, a "Yearly billing" switch, an 8-bar chart and an "Upgrade plan" button) rendered twice in exactly the same geometry:
- Before: flat and static. Plain grey borders, 6px corners, no shadow, grey bars at fixed heights, a square grey switch that's off, a flat grey button, regular-weight type.
- After: the Nexus version. 32px corners and a soft shadow, the amount as odometer digits, a green change pill, a springy green switch, gradient bars with a live tooltip, and a blue button with a light moving around its border.
The After card is clipped to the right of a vertical divider with a round handle (two chevrons). Crucially, each After element animates in proportion to how far the divider has passed it, so the wipe itself brings things to life: the digits roll as it crosses them, bars grow left to right behind it, the switch springs on when the divider reaches it.

0–1.5s: "Same UI." then a grey "Different feeling." rise in, then move up as a caption.
1.5–2.1s: the card and the "Before" / "After" labels appear; the divider slides in from the right edge.
2.1–3.6s: the divider sweeps to the middle; hold with a small left-right nudge so both halves read side by side.
5–6.2s: it sweeps all the way left; everything is After. Caption becomes "Now it moves." The chart keeps breathing and the amount ticks up.
8–10s: the card shrinks and blurs; end card "Nexus UI" and "nexus-ui.com" in the gradient.

Pure function of time t with frame size props; all copy is props.
