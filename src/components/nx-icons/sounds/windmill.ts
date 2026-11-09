import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A wooden creak as the sails wind back, a rising and falling whoosh as they sweep a quarter turn with one low whump at their fastest, and a small wooden knock as they settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 170, t(0.0), 0.07, 0.14, 125, "sawtooth"); // 0.00 to 0.15 the sails wind back a little, wood creaks
  swish(c, o, t(0.14), 0.68, 300, 1400, 0.12); // 0.15 to 0.81 the sails sweep round, loudest mid turn
  thud(c, o, t(0.48), 120, 0.16, 0.12); // 0.49 the sails pass the upright at their fastest
  blip(c, o, 150, t(0.8), 0.06, 0.12, 105, "sawtooth"); // 0.81 the sails overshoot, the shaft creaks back
  blip(c, o, 320, t(0.93), 0.07, 0.05, 280, "triangle"); // 0.95 the sails come to rest, wooden knock
}
