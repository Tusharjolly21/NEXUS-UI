import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.36;

/** A low roar of flame that flickers with every squeeze of the fire, dry crackles at each flicker and a sharp pop with each spark that jumps out. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.84), 250, 550, 0.035); // 0.02-0.86 the flame body moves the whole time
  puff(c, o, t(0.15), 0.12, 420, 0.07, "lowpass"); // 0.18 flame stretches up: whoomf
  puff(c, o, t(0.33), 0.12, 380, 0.07, "lowpass"); // 0.36 flame squashes
  puff(c, o, t(0.51), 0.12, 440, 0.07, "lowpass"); // 0.54 flame stretches again
  puff(c, o, t(0.69), 0.12, 360, 0.06, "lowpass"); // 0.72 flame squashes
  tick(c, o, t(0.06), 0.14, 3000); // 0.05 first spark leaves the logs
  puff(c, o, t(0.06), 0.04, 1600, 0.08, "bandpass"); // 0.05 spark pop
  tick(c, o, t(0.21), 0.14, 3600); // 0.20 second spark
  puff(c, o, t(0.21), 0.04, 1300, 0.08, "bandpass"); // 0.20 spark pop
  tick(c, o, t(0.36), 0.14, 2600); // 0.35 third spark
  puff(c, o, t(0.36), 0.04, 1500, 0.08, "bandpass"); // 0.35 spark pop
  tick(c, o, t(0.18), 0.08, 4200); // 0.18 crackle on the flicker
  tick(c, o, t(0.54), 0.08, 3400); // 0.54 crackle on the flicker
  tick(c, o, t(0.57), 0.06, 4800); // 0.57 crackle after it
  tick(c, o, t(0.72), 0.07, 3800); // 0.72 last crackle as the flame settles
}
