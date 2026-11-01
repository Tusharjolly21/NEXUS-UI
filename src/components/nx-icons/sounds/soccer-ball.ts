import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.69;

/** A solid kick, a whoosh as the ball flies, a thump on the first bounce and a smaller one on the second. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.02), 100, 0.3, 0.1);
  tick(c, o, t(0.02), 0.14, 2800);
  swish(c, o, t(0.06), t(0.3), 600, 2400, 0.04);
  thud(c, o, t(0.5), 85, 0.22, 0.12);
  puff(c, o, t(0.5), 0.07, 900, 0.05, "lowpass");
  thud(c, o, t(0.9), 100, 0.1, 0.08);
}
