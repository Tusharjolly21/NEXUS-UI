import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.16;

/** Hollow little shell knocks as the egg rocks from side to side, then a dry crackle that runs along with the zigzag crack. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 540, t(0.14), 0.07, 0.07, 470, "triangle"); // 0.14 the egg rocks to the left and knocks
  blip(c, o, 610, t(0.3), 0.06, 0.07, 530, "triangle"); // 0.30 it rocks to the right
  blip(c, o, 560, t(0.45), 0.04, 0.06, 500, "triangle"); // 0.45 a smaller rock back
  blip(c, o, 640, t(0.58), 0.03, 0.05, 580, "triangle"); // 0.58 the last little rock as the crack starts
  tick(c, o, t(0.6), 0.06, 5200); // 0.60 the shell starts to crack
  tick(c, o, t(0.635), 0.05, 4300); // 0.64 the crack runs on
  tick(c, o, t(0.67), 0.055, 6100); // 0.67 another snap of shell
  tick(c, o, t(0.705), 0.04, 4800); // 0.71 the crack reaches its end
  puff(c, o, t(0.6), 0.12, 3600, 0.02); // 0.60-0.72 the dry crackle under the snaps
}
