import { blip, swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.14;

/** A wet squelch while the lemon is squeezed, a bright spritz of juice at the hardest squeeze, a springy pop back and a little flick of the leaf. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.22, 1300, 0.05); // 0.02-0.26 the lemon is squeezed
  swish(c, o, t(0.18), t(0.12), 3800, 6400, 0.03); // 0.18-0.30 juice spritzes at the hardest squeeze
  blip(c, o, 480, t(0.26), 0.07, 0.09, 720); // 0.26 the peel springs back
  tick(c, o, t(0.45), 0.05, 3400); // 0.45 the leaf flicks over
  tick(c, o, t(0.61), 0.03, 3000); // 0.61 the leaf flicks back
}
