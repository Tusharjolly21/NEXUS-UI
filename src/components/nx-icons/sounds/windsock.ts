import { swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A gusting wind that swells and fades, with fabric snaps as each ripple runs down the sock. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(1.0), 350, 1500, 0.07); // 0.00-1.00 the gust
  puff(c, o, t(0.2), 0.05, 3400, 0.05, "highpass"); // 0.20 first ripple
  puff(c, o, t(0.4), 0.05, 3000, 0.05, "highpass"); // 0.40
  puff(c, o, t(0.6), 0.05, 3800, 0.05, "highpass"); // 0.60
  puff(c, o, t(0.8), 0.06, 3200, 0.04, "highpass"); // 0.80 last ripple
}
