import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.05;

/** An airy whirl that climbs as the asterisk spins, a springy twang as it overshoots and a small dry click as it settles back half a turn on. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.44), 900, 3900, 0.045); // 0.00-0.44 the asterisk spins half a turn, arms tucked in
  blip(c, o, 610, t(0.43), 0.07, 0.16, 455, "triangle"); // 0.44 it overshoots and the arms spring back out
  tick(c, o, t(0.64), 0.06, 4300); // 0.64 it swings back past its rest angle
  blip(c, o, 690, t(0.79), 0.03, 0.07, 655); // 0.80 it settles
}
