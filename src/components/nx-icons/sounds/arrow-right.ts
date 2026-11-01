import { swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.49;

/** A swish as the arrow shoots off, a tick of its trail, then a softer swish and a tick as it slides back in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.34), 600, 2600, 0.06);
  tick(c, o, t(0.05), 0.08, 4200);
  swish(c, o, t(0.4), t(0.4), 2200, 700, 0.045);
  tick(c, o, t(0.8), 0.11, 3000);
}
