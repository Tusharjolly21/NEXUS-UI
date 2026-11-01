import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.53;

/** A quick whoosh and a fabric thwump as it opens, then rain tapping lightly on the canopy. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 900, 3000, 0.05);
  thud(c, o, t(0.26), 120, 0.14, 0.08);
  puff(c, o, t(0.26), 0.12, 1600, 0.04, "bandpass");
  [0.34, 0.42, 0.55, 0.63, 0.74, 0.86].forEach((at, i) => { tick(c, o, t(at), 0.07, 3800 + (i % 3) * 600); blip(c, o, 900 + (i % 3) * 180, t(at), 0.03, 0.05); });
}
