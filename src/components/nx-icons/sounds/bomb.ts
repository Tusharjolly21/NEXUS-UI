import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.87;

/** A sputtering fuse hiss that sinks in pitch as the spark crawls down the fuse, dry crackles with each fizz, and a flat boom pop with a puff of smoke as the fuse snaps back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.62), 7500, 3500, 0.1); // 0.02 the fuse hisses as the spark burns down
  puff(c, o, t(0.02), 0.6, 6000, 0.02, "highpass"); // 0.02 steady sizzle under the hiss
  tick(c, o, t(0.167), 0.1, 6500); // 0.17 the spark flares
  tick(c, o, t(0.333), 0.08, 5200); // 0.33 the spark shrinks
  tick(c, o, t(0.5), 0.11, 7200); // 0.50 the spark flares
  tick(c, o, t(0.667), 0.1, 4800); // 0.67 the spark shrinks, bomb jiggle at its widest
  thud(c, o, t(0.8), 70, 0.16, 0.28); // 0.80 the fuse resets with a boom
  puff(c, o, t(0.8), 0.18, 1500, 0.08, "lowpass"); // 0.80 burst of smoke
  tick(c, o, t(0.8), 0.12, 3000); // 0.80 sharp crack of the pop
  blip(c, o, 420, t(0.8), 0.035, 0.12, 140, "sawtooth"); // 0.80 pitch drops with the blast
}
