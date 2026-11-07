import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A creaking sway that leans left then right, followed by a springy pop and a bright two-note ping as the flower opens. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 140, t(0.05), 0.05, 0.2, 190, "triangle");
  blip(c, o, 190, t(0.3), 0.05, 0.2, 130, "triangle");
  swish(c, o, t(0.05), t(0.5), 900, 600, 0.015);
  blip(c, o, 300, t(0.2), 0.1, 0.09, 900);
  ding(c, o, N.G5, t(0.3), 0.06, 0.35);
  ding(c, o, N.E6, t(0.4), 0.045, 0.35);
  ding(c, o, N.B6, t(0.5), 0.03, 0.3);
}
