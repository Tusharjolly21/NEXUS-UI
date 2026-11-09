import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A rubber band stretch: air rushes outwards as the four arrows push to the corners, a springy pop at full stretch, a small snap back, and a tick as they settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.32), 500, 2200, 0.05); // 0.00-0.32 the arrows push out, fastest at 0.16
  blip(c, o, 320, t(0.02), 0.07, 0.3, 780, "triangle"); // 0.02-0.32 the stretch rises like a pulled rubber band
  blip(c, o, 520, t(0.3), 0.12, 0.14, 330); // 0.32 the heads reach full stretch: a springy pop
  swish(c, o, t(0.32), t(0.24), 1800, 600, 0.03); // 0.32-0.56 the arrows snap back past their start
  tick(c, o, t(0.56), 0.07, 3200); // 0.56 the small recoil ends
  tick(c, o, t(0.78), 0.05, 2400); // 0.78 the arrows settle
}
