import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 3.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.17;

/** Sand hissing down until the top runs dry, then a whoosh and a clack as it flips. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.12), t(2.3), 3600, 0.03, "highpass");
  swish(c, o, t(2.55), t(0.35), 500, 2200, 0.04);
  thud(c, o, t(2.92), 200, 0.12, 0.08);
  tick(c, o, t(2.92), 0.1, 2500);
}
