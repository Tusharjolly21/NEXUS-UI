import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.75;

/** A low rolling rumble of wheels forward and back, with a hollow clack as the front wheels drop back down after the little wheelie. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.32), 180, 420, 0.06); // 0.00-0.32 the skate rolls forward
  blip(c, o, 95, t(0.0), 0.04, 0.3, 120, "triangle"); // 0.00-0.30 the wheels hum on the floor
  swish(c, o, t(0.32), t(0.31), 420, 200, 0.045); // 0.32-0.63 it rocks back on its heel and rolls back
  thud(c, o, t(0.63), 140, 0.12, 0.1); // 0.63 the front wheels drop back down
  tick(c, o, t(0.63), 0.07, 2600); // 0.63 the hollow clack of the wheels
  swish(c, o, t(0.64), t(0.26), 300, 160, 0.025); // 0.64-0.90 it rolls home
}
