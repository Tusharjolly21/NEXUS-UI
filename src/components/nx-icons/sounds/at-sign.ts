import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.61;

/** A spiralling whoosh that climbs as the sign spins, two ticks as it passes, and a notification ping at the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.7), 500, 4600, 0.05);
  blip(c, o, 220, t(0.03), 0.04, 0.6, 700, "triangle");
  tick(c, o, t(0.27), 0.08, 3000);
  tick(c, o, t(0.52), 0.08, 3600);
  ding(c, o, N.A6, t(0.78), 0.08, 0.5);
}
