import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 4.03;

/** A smooth airy whirr that rises and falls with the spinning globe, a small creak of the axle as it starts and a soft click as it stops. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 340, t(0.0), 0.03, 0.08, 420, "triangle"); // 0.00 the axle creaks as the globe starts to turn
  swish(c, o, t(0.05), t(1.0), 900, 1500, 0.04); // 0.05-1.05 the whirr follows the spin
  tick(c, o, t(1.1), 0.05, 2400); // 1.10 the globe stops in the stand
}
