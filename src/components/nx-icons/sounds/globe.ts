import { ding, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.51;

/** A soft turning whoosh that follows the spin up and down, a click as the meridian meets the rim, a lighter click as it goes edge-on, and a small glass note as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), t(0.45), 500, 1900, 0.035); // 0.05-0.5 the globe speeds up
  swish(c, o, t(0.5), t(0.45), 1900, 550, 0.035); // 0.5-0.95 the globe slows down
  tick(c, o, t(0.41), 0.1, 2300); // 0.41 the meridian ellipse meets the rim
  tick(c, o, t(0.77), 0.08, 3300); // 0.77 the meridian is edge-on, a single line
  ding(c, o, 2480, t(0.97), 0.04, 0.35); // 0.97 the meridian settles back into place
}
