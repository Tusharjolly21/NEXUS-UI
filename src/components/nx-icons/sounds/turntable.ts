import { blip, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.77;

/** A needle dropping onto a record with a soft thump and a click, a low platter hum that rises as it spins up and falls as it slows, light vinyl crackle between, and a small click when the arm lifts and parks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 55, t(0.2), 0.05, 0.43, 130, "triangle"); // 0.20-0.62 platter spins up
  blip(c, o, 130, t(0.62), 0.04, 0.43, 58, "triangle"); // 0.62-1.05 platter slows
  tick(c, o, t(0.22), 0.1, 3200); // 0.22 needle lands on the record
  thud(c, o, t(0.22), 95, 0.1, 0.07); // 0.22 soft thump of the arm
  puff(c, o, t(0.3), 0.012, 4500, 0.035); // 0.30 vinyl crackle
  puff(c, o, t(0.38), 0.012, 5200, 0.03); // 0.38 vinyl crackle
  puff(c, o, t(0.47), 0.012, 4300, 0.035); // 0.47 vinyl crackle
  puff(c, o, t(0.58), 0.012, 5000, 0.03); // 0.58 vinyl crackle
  puff(c, o, t(0.69), 0.012, 4600, 0.03); // 0.69 vinyl crackle
  tick(c, o, t(0.75), 0.07, 2000); // 0.75 the arm lifts off the record
  tick(c, o, t(1.1), 0.08, 2600); // 1.10 the arm clicks into its rest
  thud(c, o, t(1.1), 140, 0.07, 0.05); // 1.10 small knock of the rest
}
