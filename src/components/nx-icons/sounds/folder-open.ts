import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft cardboard slap as the folder flap swings shut, a papery rustle as it lifts again, a small flick as a sheet pops up out of it and a soft stop when it is fully open. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.23), 700, 2000, 0.025); // 0.04-0.27 the flap swings shut
  thud(c, o, t(0.27), 130, 0.14, 0.1); // 0.27 the flap lands on the folder
  puff(c, o, t(0.27), 0.08, 1800, 0.05, "lowpass"); // 0.27 a puff of air out of the closed folder
  swish(c, o, t(0.405), t(0.3), 3200, 1800, 0.03); // 0.41-0.70 the flap lifts, paper rustling
  tick(c, o, t(0.585), 0.07, 4200); // 0.585 the sheet reaches its highest point
  thud(c, o, t(0.89), 170, 0.07, 0.06); // 0.89 the flap comes to rest open
}
