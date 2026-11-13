import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Gusts of wind that swell with each swing of the kite, a papery flap at every turn, and two light flutters as the tail whips. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.225), 500, 1300, 0.03); // 0.00-0.23 a gust pushes the kite left
  puff(c, o, t(0.225), 0.08, 1800, 0.05); // 0.23 the kite turns, fabric flaps
  swish(c, o, t(0.225), t(0.225), 1500, 700, 0.025); // 0.23-0.45 it swings right
  tick(c, o, t(0.3), 0.05, 2400); // 0.30 the tail swings out
  puff(c, o, t(0.45), 0.08, 2000, 0.045); // 0.45 turns, flaps
  swish(c, o, t(0.45), t(0.225), 700, 1200, 0.02); // 0.45-0.68 swings back
  tick(c, o, t(0.6), 0.04, 2200); // 0.60 the tail swings back
  puff(c, o, t(0.675), 0.07, 1700, 0.035); // 0.68 last flap
  swish(c, o, t(0.675), t(0.225), 1000, 500, 0.012); // 0.68-0.90 the kite settles
}
