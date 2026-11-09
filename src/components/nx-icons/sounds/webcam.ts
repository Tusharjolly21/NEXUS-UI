import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.3;

/** A tiny motor whirr that follows the ball as it swings left, right and back, three quick focus ratchets as the lens breathes, and two short recording beeps as the red light comes on. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 170, t(0.0), 0.035, 0.2, 300, "sawtooth"); // 0.00-0.20 the ball turns left
  blip(c, o, 300, t(0.2), 0.035, 0.24, 160, "sawtooth"); // 0.20-0.44 it swings right
  blip(c, o, 165, t(0.44), 0.03, 0.2, 270, "sawtooth"); // 0.44-0.64 it comes back
  blip(c, o, 270, t(0.64), 0.025, 0.16, 190, "sawtooth"); // 0.64-0.80 it settles
  tick(c, o, t(0.54), 0.08, 3300); // 0.54 the lens opens fully
  tick(c, o, t(0.675), 0.07, 2500); // 0.68 the lens closes down
  tick(c, o, t(0.81), 0.06, 2900); // 0.81 the lens eases back
  blip(c, o, 1480, t(0.625), 0.045, 0.07); // 0.63 the red light comes back on
  blip(c, o, 1480, t(0.95), 0.045, 0.09); // 0.95 the red light settles on
}
