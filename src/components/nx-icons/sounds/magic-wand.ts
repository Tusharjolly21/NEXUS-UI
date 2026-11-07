import { ding, blip, swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.4;

/** A light whoosh as the wand flicks back and a fast one as it flicks forward, a glass chime as the star flares, glitter as the rays fly out, and two glints as the little stars twinkle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.17), 500, 1500, 0.025); // 0.00-0.17 the wand flicks back
  swish(c, o, t(0.18), t(0.22), 600, 3200, 0.07); // 0.18-0.40 the fast forward flick, fastest at 0.29
  swish(c, o, t(0.42), t(0.18), 2200, 900, 0.03); // 0.42-0.60 the wand flicks back again
  swish(c, o, t(0.62), t(0.17), 1500, 700, 0.015); // 0.62-0.80 the wand settles
  blip(c, o, 1800, t(0.36), 0.05, 0.3, 2900, "triangle"); // 0.36 the star starts to flare
  ding(c, o, 2300, t(0.45), 0.09, 0.45); // 0.45 the star is at its brightest
  puff(c, o, t(0.32), 0.35, 8200, 0.04, "highpass"); // 0.32-0.67 the four rays fly out as a glitter of air
  [0.4, 0.47, 0.54].forEach((at, i) => tick(c, o, t(at), 0.05, 6500 + i * 900)); // 0.40 0.47 0.54 sparks of the rays
  ding(c, o, 3500, t(0.84), 0.06, 0.28); // 0.84 the first small star twinkles open
  ding(c, o, 4800, t(0.94), 0.05, 0.25); // 0.94 the second small star twinkles open
}
