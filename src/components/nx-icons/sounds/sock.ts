import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 8;

/** Soft cloth swishes as the sock swings to and fro, a little wooden peg creak at the first turn, fading as the swing dies down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.2), 400, 900, 0.035); // 0.00-0.20 the sock swings out
  blip(c, o, 1400, t(0.2), 0.025, 0.07, 1100, "triangle"); // 0.20 the peg creaks at the turn
  swish(c, o, t(0.2), t(0.24), 900, 500, 0.03); // 0.20-0.44 the sock swings back
  puff(c, o, t(0.44), 0.06, 700, 0.03); // 0.44 the cloth flaps at the turn
  swish(c, o, t(0.44), t(0.22), 500, 800, 0.022); // 0.44-0.66 a smaller swing
  swish(c, o, t(0.66), t(0.19), 800, 500, 0.014); // 0.66-0.85 the swing dies down
}
