import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3;

/** Three layered gusts rushing past, one after the other, with a thin whistle riding on top. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.5), 500, 2800, 0.09);
  swish(c, o, t(0.12), t(0.5), 900, 3600, 0.07);
  swish(c, o, t(0.22), t(0.5), 400, 2200, 0.06);
  blip(c, o, 820, t(0.3), 0.05, 0.4, 1250, "triangle");
  puff(c, o, t(0.35), 0.5, 1800, 0.03, "bandpass");
}
