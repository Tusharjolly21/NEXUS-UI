import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.22;

/** A soft air swish as the ear leans toward the sound, then two clear sonar-like pings as the inner and the outer wave slide back in beside it. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 600, 1500, 0.02); // 0.00-0.22 the ear leans toward the sound
  ding(c, o, 1480, t(0.48), 0.05, 0.3); // 0.48 the inner wave arrives
  ding(c, o, 1175, t(0.63), 0.055, 0.34); // 0.63 the outer wave arrives
  swish(c, o, t(0.54), t(0.3), 1400, 500, 0.012); // 0.54-0.84 the ear leans back
}
