import { tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.18;

/** A leafy rustle as the taco hops up, a crunchy shell crackle as it lands and a smaller crunch on the little bounce. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.2, 2400, 0.025); // 0.00-0.24 the lettuce rustles as the taco rises
  thud(c, o, t(0.44), 190, 0.1, 0.08); // 0.44 the taco lands
  puff(c, o, t(0.44), 0.06, 1900, 0.07); // 0.44 the crunch of the hard shell
  tick(c, o, t(0.452), 0.06, 3300); // 0.45 shell crackle
  tick(c, o, t(0.476), 0.045, 2700); // 0.48 shell crackle
  tick(c, o, t(0.5), 0.035, 3900); // 0.50 the crackle dies down
  puff(c, o, t(0.6), 0.04, 2100, 0.03); // 0.60 a small crunch on the bounce
}
