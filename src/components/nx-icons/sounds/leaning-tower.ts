import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.13;

/** A low stony groan as the tower leans further, a falling whistle as the ball drops, then a hard knock on the ground and a smaller knock on the bounce. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 120, t(0.0), 0.05, 0.18, 90, "triangle"); // 0.00-0.16 the stone tower groans as it leans further
  swish(c, o, t(0.2), t(0.3), 3200, 1400, 0.03); // 0.20-0.50 the ball falls past the tower
  thud(c, o, t(0.5), 200, 0.16, 0.1); // 0.50 the ball hits the ground
  tick(c, o, t(0.5), 0.06, 2600); // 0.50 the hard edge of the impact
  thud(c, o, t(0.74), 230, 0.08, 0.08); // 0.74 it lands again after the bounce
}
