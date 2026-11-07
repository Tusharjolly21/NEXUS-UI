import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three round, wooden triangle-wave notes as the segments sweep round one after another, over a low turning whoosh, ending in a bright double ping as the orange piece pops out. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.8), 400, 1700, 0.03);
  blip(c, o, N.A4, t(0.04), 0.07, 0.2, undefined, "triangle");
  blip(c, o, N.E5, t(0.3), 0.07, 0.2, undefined, "triangle");
  blip(c, o, N.C5, t(0.56), 0.07, 0.2, undefined, "triangle");
  ding(c, o, N.D7, t(0.88), 0.05, 0.4);
  tick(c, o, t(0.86), 0.07, 3800);
}
