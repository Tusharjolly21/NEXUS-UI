import { ding, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.67;

/** A soft winding hiss as the loop arrow winds back a notch, a catch as it reverses, then a ratchet of clock ticks that bunches up in the middle of the backwards spin with a whirr rising and falling, and a small bell ring as everything settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.136), 400, 900, 0.025); // 0.00-0.14 the arrow winds back a notch
  thud(c, o, t(0.136), 260, 0.07, 0.05); // 0.14 the arrow catches and reverses
  swish(c, o, t(0.14), t(0.35), 700, 2400, 0.03); // 0.14-0.49 the whirr climbs as the spin speeds up, fastest at 0.49
  swish(c, o, t(0.49), t(0.36), 2400, 700, 0.03); // 0.49-0.85 the whirr falls as the spin slows
  [0.31, 0.358, 0.399, 0.435, 0.469, 0.502, 0.535, 0.57, 0.608, 0.652, 0.709].forEach((at, i) => tick(c, o, t(at), 0.07 + (i % 3 === 0 ? 0.04 : 0), 3000 + (i % 2) * 500)); // 0.31-0.71 a tick for every 30 degrees of the loop
  tick(c, o, t(0.85), 0.12, 2800); // 0.85 the loop and the hands land at their start
  ding(c, o, 1480, t(0.85), 0.05, 0.3); // 0.85 a small bell ring as the clock settles
}
