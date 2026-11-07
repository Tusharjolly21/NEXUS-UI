import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three light taps for the title bar dots, then a quick run of clicks as lines build in and a small glassy note to finish. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.A5, N.B5, N.D6].forEach((f, i) => blip(c, o, f, t(0.03 + i * 0.14), 0.07, 0.07, f * 1.12, "triangle"));
  thud(c, o, t(0.35), 190, 0.1, 0.07);
  tick(c, o, t(0.4), 0.09, 3400);
  tick(c, o, t(0.5), 0.08, 4200);
  tick(c, o, t(0.6), 0.07, 5000);
  swish(c, o, t(0.38), t(0.35), 900, 3000, 0.018);
  ding(c, o, N.E6, t(0.7), 0.05, 0.4);
}
