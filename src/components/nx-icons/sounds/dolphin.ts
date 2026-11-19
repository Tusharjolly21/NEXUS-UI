import { blip, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.1;

/** Two quick bright dolphin whistles as it leaps, a rush of air at the top of the arc, and a splash as it dives back in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 1500, t(0.04), 0.06, 0.12, 2700); // 0.04 the dolphin whistles as it leaves the water
  blip(c, o, 1900, t(0.2), 0.05, 0.1, 3100); // 0.20 a second whistle on the way up
  swish(c, o, t(0.1), t(0.3), 600, 1600, 0.025); // 0.10-0.40 air rushing past at the top of the leap
  puff(c, o, t(0.74), 0.22, 900, 0.09, "lowpass"); // 0.75 it dives back in with a splash
  swish(c, o, t(0.76), t(0.26), 2400, 700, 0.04); // 0.76-1.00 spray falls back on the wave
  thud(c, o, t(0.76), 120, 0.05, 0.12); // 0.76 the weight of the body hitting the water
}
