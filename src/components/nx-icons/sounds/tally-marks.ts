import { swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.81;

/** Four short chalk scratches, one for each downstroke, each ending in a tiny tick, then a longer rising scratch and a firmer tick as the slash is struck through them. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.16), 3800, 2200, 0.03); // 0.00-0.16 first stroke
  tick(c, o, t(0.16), 0.05, 3500); // 0.16 first stroke ends
  swish(c, o, t(0.12), t(0.16), 3700, 2100, 0.03); // 0.12-0.28 second stroke
  tick(c, o, t(0.28), 0.05, 3400); // 0.28 second stroke ends
  swish(c, o, t(0.24), t(0.16), 3600, 2000, 0.03); // 0.24-0.40 third stroke
  tick(c, o, t(0.4), 0.05, 3300); // 0.40 third stroke ends
  swish(c, o, t(0.36), t(0.16), 3500, 1900, 0.03); // 0.36-0.52 fourth stroke
  tick(c, o, t(0.52), 0.05, 3200); // 0.52 fourth stroke ends
  swish(c, o, t(0.5), t(0.3), 2200, 4200, 0.04); // 0.50-0.80 the slash
  tick(c, o, t(0.8), 0.1, 2800); // 0.80 the slash ends
}
