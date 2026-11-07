import { swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.9;

/** A cardboard slide under the card as it lifts and glides one column right (two lobes of movement), a wooden knock when it lands at 0.52, then the same slide back with a softer knock as it lands at 1.3. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.04 card lifts off
  tick(c, o, t(0.04), 0.05, 3200);
  // 0-0.52 card glides right: speeds up, then slows into the landing
  swish(c, o, t(0.0), t(0.26), 800, 1800, 0.035);
  swish(c, o, t(0.26), t(0.26), 1800, 900, 0.032);
  // 0.52 card lands in the next column
  thud(c, o, t(0.52), 230, 0.17, 0.07);
  tick(c, o, t(0.52), 0.08, 2500);
  // 0.8 card lifts off again
  tick(c, o, t(0.8), 0.04, 3000);
  // 0.78-1.3 card glides back
  swish(c, o, t(0.78), t(0.26), 900, 1700, 0.028);
  swish(c, o, t(1.04), t(0.26), 1700, 800, 0.025);
  // 1.3 card lands back in the first column
  thud(c, o, t(1.3), 130, 0.1, 0.07);
  tick(c, o, t(1.3), 0.05, 2200);
}
