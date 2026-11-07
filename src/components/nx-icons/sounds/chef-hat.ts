import { blip, swish, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A quick cloth whoosh as the hat lifts, a firm doff tap, a soft puff of steam and one warm triangle note. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.25), 600, 1900, 0.04);
  tick(c, o, t(0.33), 0.1, 1800);
  thud(c, o, t(0.34), 130, 0.14, 0.09);
  puff(c, o, t(0.4), 0.4, 3600, 0.03, "bandpass");
  blip(c, o, N.A5, t(0.62), 0.06, 0.3, N.A5 * 1.06, "triangle");
}
