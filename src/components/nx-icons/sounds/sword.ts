import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A rising draw-back swish, a sharp downward whoosh with a clink as the slash lands, and two bright metallic pings for the glint. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.28), 500, 1700, 0.05);
  swish(c, o, t(0.3), t(0.2), 5200, 1800, 0.1);
  tick(c, o, t(0.38), 0.14, 3200);
  blip(c, o, 1450, t(0.4), 0.05, 0.1, 900, "square");
  ding(c, o, N.G7, t(0.58), 0.07, 0.45);
  ding(c, o, N.C8, t(0.76), 0.05, 0.4);
}
