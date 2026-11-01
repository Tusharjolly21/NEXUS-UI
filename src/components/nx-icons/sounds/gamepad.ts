import { blip, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.88;

/** Three chirpy 8-bit beeps, one for each button press, and a coin-like ding. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.C6, t(0.06), 0.06, 0.08, undefined, "square");
  blip(c, o, N.E6, t(0.27), 0.06, 0.08, undefined, "square");
  blip(c, o, N.G6, t(0.42), 0.06, 0.08, undefined, "square");
  tick(c, o, t(0.05), 0.08, 3000);
  tick(c, o, t(0.26), 0.08, 3000);
  tick(c, o, t(0.41), 0.08, 3000);
  blip(c, o, N.C7, t(0.58), 0.06, 0.05, undefined, "square");
  blip(c, o, N.E7, t(0.64), 0.06, 0.2, undefined, "square");
}
