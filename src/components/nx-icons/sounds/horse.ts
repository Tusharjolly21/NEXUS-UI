import { ding, blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two gentle nods: a warm snort as the head dips, a bright ring of the bridle bit at the bottom of each nod, and a soft nicker between them while the mane ripples. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.12), 0.1, 1100, 0.07, "lowpass"); // 0.12-0.22 a snort as the head starts to dip
  ding(c, o, 2850, t(0.225), 0.05, 0.16); // 0.225 the bridle rings at the bottom of the first nod
  ding(c, o, 3650, t(0.23), 0.022, 0.1); // 0.225 a second, tinier ring
  swish(c, o, t(0.25), t(0.2), 900, 2200, 0.05); // 0.25-0.45 the mane ripples as the head lifts
  blip(c, o, 190, t(0.3), 0.04, 0.3, 255, "sawtooth"); // 0.30-0.60 a soft nicker as the head lifts
  puff(c, o, t(0.56), 0.1, 1000, 0.06, "lowpass"); // 0.56-0.66 a second, smaller snort
  ding(c, o, 2700, t(0.675), 0.04, 0.14); // 0.675 the bridle rings at the bottom of the second nod
  swish(c, o, t(0.7), t(0.2), 900, 2000, 0.035); // 0.70-0.90 the mane settles
}
