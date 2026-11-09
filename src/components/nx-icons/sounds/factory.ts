import { swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.57;

/** Two steam chuffs, a low one as the left chimney lets its puff rise and a slightly higher one for the right chimney a quarter second later, each with a soft rising hiss, then two small breaths as fresh puffs form. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.01), 62, 0.12, 0.1); // 0.00 the left puff leaves its chimney
  puff(c, o, t(0.01), 0.24, 900, 0.1, "bandpass"); // 0.00 steam chuff
  swish(c, o, t(0.04), 0.32, 420, 950, 0.035); // 0.04 to 0.36 the puff climbs and fades
  thud(c, o, t(0.26), 70, 0.1, 0.1); // 0.25 the right puff leaves its chimney
  puff(c, o, t(0.26), 0.22, 1150, 0.09, "bandpass"); // 0.25 second chuff
  swish(c, o, t(0.29), 0.32, 460, 1050, 0.03); // 0.29 to 0.61 it climbs and fades
  puff(c, o, t(0.5), 0.12, 2400, 0.028, "bandpass"); // 0.44 to 0.8 a fresh left puff swells at the chimney
  puff(c, o, t(0.74), 0.12, 2600, 0.022, "bandpass"); // 0.69 to 1.05 a fresh right puff swells
}
