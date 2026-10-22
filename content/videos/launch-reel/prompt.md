Make a 12-second vertical (1080×1920, 30fps) launch reel for my site in a clean Apple keynote style. Light background (#f5f5f7) with two very soft blurred colour lights (blue top-left, pink bottom-right) drifting slowly. Font: Inter Display, bold, tight tracking (-0.045em). Music: 120 BPM soft beat, every cut and word change lands on a beat.

0–2s: Centered three-line headline "Make your / [word] / move.". Line 1 and 3 rise in with blur. The middle word is a blue→purple→pink→orange gradient and swaps every half second (landing page → dashboard → pricing page → portfolio): the old word lifts and blurs out, the new one rises from below out of a blur.

2–2.75s: Match cut. The headline shrinks and moves until it sits exactly on top of the real headline in a screenshot of my homepage, which fades in inside a floating window (rounded 34px, soft layered shadow, slim top bar with three grey dots and a centred "nexus-ui.com" address pill). While the type travels, hide the site's own headline under a background-coloured patch; when they line up, crossfade type and patch away so it reads as one headline.

2.75–4.5s: Slow push-in (1 → 1.2) on the headline. The site's coloured word swaps on the beat too (use crops of the real page for each word, blurred cross-dissolve). Caption above the window: "Motion, ready to paste." words rising in one by one.

4.5–7.5s: The window scrolls a stitched full-page screenshot in two eased moves (to the component grid, hold, then to the bottom), with a tiny vertical motion blur that follows scroll speed and the site's floating nav pinned at the top. Caption builds on the beats: "Components." "Blocks." "Templates." (last word in the gradient).

7.5–10s: The window lifts, shrinks and blurs away. Eight real component tiles (crops from the site, rounded 26px cards with soft shadows) spring up from below in a staggered, alternating order into a two-row-height mosaic that drifts upward slowly. Title "183 animated components." with a grey line "Each with its own physics."

10–12s: Tiles dissolve. End card: the logo springs in from a small rotated state, then "Nexus UI" (132px bold), "nexus-ui.com" in the gradient, and a white pill "Free to start · React + Motion" with a green dot, each rising in 0.15s apart. The card breathes in by 2%.

Build it as a React component that is a pure function of time t (no timers inside), so it can be scrubbed and rendered frame by frame to MP4.
