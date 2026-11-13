import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A pen scratching twice as two lines are written, a descending whoosh, then a heavy wax stamp thump with a papery thwack as the seal lands, a small bounce and a soft settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.25), 2800, 3800, 0.03); // 0.00-0.25 the first line is written
  swish(c, o, t(0.14), t(0.25), 2400, 3300, 0.03); // 0.14-0.39 the second line is written
  swish(c, o, t(0.35), t(0.25), 1400, 500, 0.03); // 0.35-0.60 the seal comes down
  thud(c, o, t(0.6), 95, 0.15, 0.2); // 0.60 the seal lands on the paper
  puff(c, o, t(0.6), 0.1, 900, 0.06, "lowpass"); // 0.60 a puff of air under the stamp
  tick(c, o, t(0.6), 0.09, 1800); // 0.60 thwack of the paper
  tick(c, o, t(0.725), 0.05, 2500); // 0.725 the seal bounces up a touch
  tick(c, o, t(0.85), 0.03, 2000); // 0.85 and settles
}
