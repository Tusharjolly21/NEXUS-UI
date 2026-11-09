import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three sharp kernel pops, each a dry crack with a short rising boing, then a quiet soft landing of kernels and a puff as the heap settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.1), 0.16, 3000); // 0.10 first kernel pops
  blip(c, o, 420, t(0.1), 0.08, 0.07, 900); // 0.10 its boing
  tick(c, o, t(0.24), 0.16, 3600); // 0.24 second kernel pops
  blip(c, o, 520, t(0.24), 0.08, 0.07, 1100); // 0.24 its boing
  tick(c, o, t(0.38), 0.16, 4200); // 0.38 third kernel pops
  blip(c, o, 640, t(0.38), 0.08, 0.07, 1300); // 0.38 its boing
  puff(c, o, t(0.55), 0.07, 1800, 0.03, "lowpass"); // 0.55 the heap settles
  tick(c, o, t(0.65), 0.04, 2400); // 0.65 first kernel drops back
  tick(c, o, t(0.79), 0.04, 2200); // 0.79 second kernel drops back
  tick(c, o, t(0.93), 0.04, 2000); // 0.93 third kernel drops back
}
