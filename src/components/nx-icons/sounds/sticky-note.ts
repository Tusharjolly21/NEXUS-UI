import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Paper rustles as the note flutters on its sticky edge while a marker squeaks across it twice, once for each line, with a small tick as each line ends. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.2, 3200, 0.03); // 0.00-0.20 the note starts to flutter
  swish(c, o, t(0.05), t(0.3), 2600, 3900, 0.03); // 0.05-0.35 marker draws the first line
  tick(c, o, t(0.35), 0.05, 3400); // 0.35 first line ends
  puff(c, o, t(0.22), 0.07, 2600, 0.035); // 0.225 flutter at the far left tilt
  swish(c, o, t(0.3), t(0.4), 2300, 3300, 0.03); // 0.30-0.70 marker draws the second line
  puff(c, o, t(0.45), 0.07, 2400, 0.03); // 0.45 flutter at the far right tilt
  tick(c, o, t(0.7), 0.06, 3000); // 0.70 second line ends
  puff(c, o, t(0.675), 0.06, 2200, 0.02); // 0.675 flutter settling
}
