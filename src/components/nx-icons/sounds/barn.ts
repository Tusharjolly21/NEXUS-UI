import { blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Heavy wooden doors: a creak rising as they swing open, a soft knock where they stop, a lower creak as they swing back, and a two-part slam with a latch click as they meet. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 210, t(0.0), 0.05, 0.3, 330, "sawtooth"); // 0.00 to 0.3 the doors swing open, hinges creak upward
  thud(c, o, t(0.29), 140, 0.1, 0.07); // 0.30 the doors reach their widest, a soft knock
  blip(c, o, 300, t(0.45), 0.045, 0.4, 170, "sawtooth"); // 0.45 to 0.9 the doors swing shut, the creak falls
  thud(c, o, t(0.9), 95, 0.32, 0.14); // 0.90 the left door meets the frame
  thud(c, o, t(0.915), 120, 0.22, 0.1); // 0.90 the right door meets it a moment later
  tick(c, o, t(0.94), 0.09, 1900); // 0.93 the latch drops
}
