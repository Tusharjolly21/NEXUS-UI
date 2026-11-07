import { ding, blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two squelchy wobbles on the stick, a sticky stretch, then a tiny plip as the drip lands and a soft sweet chime. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 330, t(0.04), 0.07, 0.14, 262, "triangle");
  blip(c, o, 294, t(0.2), 0.06, 0.14, 349, "triangle");
  swish(c, o, t(0.25), t(0.25), 900, 1600, 0.02);
  blip(c, o, 1900, t(0.52), 0.05, 0.05, 700);
  thud(c, o, t(0.88), 260, 0.1, 0.07);
  ding(c, o, N.E5, t(0.9), 0.045, 0.3);
  ding(c, o, N.B6, t(0.97), 0.04, 0.3);
}
