import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.06;

/** A spring roller zips the screen up with a knock, then a ratchet clicks away as it falls, fast at first and slowing down, with a small bounce at the bottom and three bright blips as the chart bars draw back in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.25), 500, 2600, 0.04); // 0.00-0.25 the roller winds the screen up
  thud(c, o, t(0.25), 140, 0.14, 0.07); // 0.25 the screen hits the top of its case
  tick(c, o, t(0.25), 0.14, 2600); // 0.25 knock
  [0.375, 0.402, 0.43, 0.46, 0.492, 0.526, 0.564, 0.608, 0.663].forEach((at, i) => tick(c, o, t(at), 0.07, 2200 - i * 60)); // 0.35-0.75 ratchet while the screen drops and slows
  thud(c, o, t(0.75), 110, 0.09, 0.08); // 0.75 the screen reaches its lowest point and bounces
  blip(c, o, 1400, t(0.7), 0.035, 0.05); // 0.72 first bar draws in
  blip(c, o, 1700, t(0.75), 0.035, 0.05); // 0.77 second bar draws in
  blip(c, o, 2100, t(0.8), 0.035, 0.06); // 0.82 third bar draws in
}
