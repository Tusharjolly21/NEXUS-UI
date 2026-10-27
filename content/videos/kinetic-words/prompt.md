Make a 9.5-second social teaser as a HyperFrames composition: one index.html, 1080×1920 (9:16), 30 fps, with sound. Light grey background (#f5f5f7), Inter type, very large and tight. The animation is one paused GSAP timeline.

0–3.2s: four words stacked in the middle, "Make", "your", "site", "move.". "Make" is already on screen at frame 0 (it works as the thumbnail) and settles up a little; the other three land one at a time, every 0.4 seconds, rising from below with a blur that sharpens. The last word, "move.", is filled with a blue, violet and pink gradient. The stack blurs and lifts away at the end.
3.0–6.4s: a heading "Ready for any page", then four white rounded cards drop in one after another with a small tilt that settles flat: "Heroes · Blocks", "Pricing · Blocks", "Buttons · Components", "Cards · Components". They hold, then shrink and blur away.
6.2–9.5s: end card, "nexus-ui.com" in heavy black type with "Animated components for React" under it in grey, held for at least two seconds.

The words and colours are plain text and CSS variables at the top of the file; every scene is a block with data-start and data-duration, and the timeline at the bottom is registered as window.__timelines["kinetic-words"].
