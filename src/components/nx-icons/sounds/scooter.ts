import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.94;

/** A foot scuff on the pavement as the rider kicks off, a rubbery whirr of two wheels that starts bright and slowly sinks as the spin eases off, three soft ticks where the wheel marks pass at 0.14, 0.31 and 0.51, and a last small tick as it rolls to a stop. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.02 the foot kicks off the pavement, the scooter rocks back
  puff(c, o, t(0.02), 0.09, 900, 0.07, "bandpass");
  // 0.10-0.90 the wheels whirr, bright at first and dropping as the spin slows
  swish(c, o, t(0.1), t(0.8), 3200, 800, 0.028);
  // 0.144 wheel mark passes the half turn
  tick(c, o, t(0.144), 0.09, 4400);
  // 0.308 next half turn
  tick(c, o, t(0.308), 0.08, 3600);
  // 0.507 next half turn, slower
  tick(c, o, t(0.507), 0.07, 3000);
  // 0.90 the wheels stop turning and the scooter is home
  tick(c, o, t(0.9), 0.05, 1800);
}
