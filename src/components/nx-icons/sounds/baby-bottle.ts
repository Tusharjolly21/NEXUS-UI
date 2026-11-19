import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.37;

/** A milky slosh as the bottle tips, three round glugs as it feeds and rocks, and a light plastic tap as it stands back up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.3), 300, 700, 0.03); // 0.00-0.30 the bottle tips and the milk sloshes
  blip(c, o, 500, t(0.3), 0.06, 0.09, 790); // 0.30 the first glug at full tilt
  blip(c, o, 450, t(0.5), 0.045, 0.09, 700); // 0.50 the bottle rocks: a second glug
  blip(c, o, 520, t(0.7), 0.05, 0.09, 820); // 0.70 back at full tilt: a third glug
  tick(c, o, t(1.0), 0.06, 2600); // 1.00 the bottle stands up: plastic tap
  thud(c, o, t(1.0), 170, 0.05, 0.07); // 1.00 its base meets the table
}
