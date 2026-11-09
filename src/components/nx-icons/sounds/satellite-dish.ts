import { ding, blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.28;

/** A small motor whine that turns with the dish as it swings away and back, gear ticks at each turn, and three clean pings as the signal locks on. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 190, t(0.0), 0.04, 0.3, 330, "sawtooth"); // 0.00-0.30 the dish swings away
  blip(c, o, 330, t(0.3), 0.04, 0.25, 180, "sawtooth"); // 0.30-0.55 it sweeps back
  blip(c, o, 180, t(0.55), 0.03, 0.2, 260, "sawtooth"); // 0.55-0.75 it nears the signal
  blip(c, o, 260, t(0.75), 0.03, 0.25, 200, "sawtooth"); // 0.75-1.00 it settles
  tick(c, o, t(0.3), 0.06, 2000); // 0.30 gear tick at the end of the swing
  tick(c, o, t(0.55), 0.06, 2300); // 0.55 gear tick at the turn
  ding(c, o, 2090, t(0.66), 0.06, 0.15); // 0.66 the inner arc lights up
  ding(c, o, 2790, t(0.74), 0.05, 0.15); // 0.74 the outer arc lights up
  ding(c, o, 3320, t(0.99), 0.05, 0.25); // 0.99 both arcs steady: lock confirmed
}
