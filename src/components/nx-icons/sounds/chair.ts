import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.42;

/** A low rumble of little wheels rolling across the floor, a gas-lift hiss and a click as the backrest reclines, then the rumble again as it rolls back and a click as it locks upright. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.38), 220, 480, 0.05); // 0.00-0.38 the wheels roll forward
  puff(c, o, t(0.36), 0.12, 1800, 0.05); // 0.38 the gas lift hisses as the backrest tilts
  tick(c, o, t(0.38), 0.1, 2200); // 0.38 the recline locks with a click
  swish(c, o, t(0.59), t(0.36), 480, 220, 0.045); // 0.59-0.95 the wheels roll back
  tick(c, o, t(0.95), 0.09, 1900); // 0.95 the backrest locks upright
  thud(c, o, t(0.95), 170, 0.06, 0.1); // 0.95 the chair stops
}
