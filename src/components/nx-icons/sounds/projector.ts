import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A relay click as the beam cuts out, a lamp winding up, a bright sweep as the beam bursts on, two flicker ticks and a slow fade as the lit screen settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.1), 0.1, 1400); // 0.10 the beam cuts out
  blip(c, o, 120, t(0.1), 0.05, 0.14, 520, "sawtooth"); // 0.10-0.25 the lamp winds up
  swish(c, o, t(0.25), t(0.3), 700, 3600, 0.04); // 0.25-0.55 the beam bursts on and the screen lights up
  tick(c, o, t(0.36), 0.07, 3200); // 0.36 the beam dips
  tick(c, o, t(0.58), 0.06, 3600); // 0.58 the second dip
  swish(c, o, t(0.7), t(0.3), 1800, 600, 0.02); // 0.70-1.00 the lit screen fades back
}
