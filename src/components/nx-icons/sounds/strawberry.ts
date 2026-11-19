import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.38;

/** A soft juicy plop as the strawberry lands, then a springy boing as its stem flicks from side to side. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.24), 450, 1100, 0.015); // 0.00-0.24 the strawberry hops up
  blip(c, o, 280, t(0.42), 0.1, 0.09, 200); // 0.42 it lands with a juicy plop
  puff(c, o, t(0.42), 0.05, 900, 0.035, "lowpass"); // 0.42 the squash
  blip(c, o, 620, t(0.5), 0.05, 0.08, 980); // 0.50 the stem springs over
  blip(c, o, 700, t(0.61), 0.03, 0.07, 940); // 0.61 it springs back
  blip(c, o, 660, t(0.7), 0.018, 0.06, 820); // 0.70 a last little twang
}
