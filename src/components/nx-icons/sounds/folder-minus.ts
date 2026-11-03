import { blip, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.79;

/** A hollow thud as the folder front tips, a falling whoosh as the minus comes down large, a firm stamp as it lands, and two soft falling notes as the front closes again. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.04), 100, 0.16, 0.12);
  swish(c, o, t(0.15), t(0.3), 2600, 500, 0.05);
  thud(c, o, t(0.46), 90, 0.28, 0.14);
  blip(c, o, N.E6, t(0.48), 0.05, 0.14, N.B5);
  blip(c, o, N.C6, t(0.62), 0.04, 0.16, N.G5);
  puff(c, o, t(0.7), 0.08, 1800, 0.03, "bandpass");
}
