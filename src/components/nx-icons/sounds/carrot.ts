import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.26;

/** A low whoosh for the twirl in two halves, then three crisp green leaf flicks that crackle one after another, with a last crunchy tick as the carrot settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 400, 1300, 0.04); // 0.00 to 0.22 the carrot twirls out
  swish(c, o, t(0.23), t(0.22), 1300, 500, 0.035); // 0.23 to 0.45 back the other way
  puff(c, o, t(0.3), 0.045, 4300, 0.07, "bandpass"); // 0.30 first leaf flicks to its extreme
  puff(c, o, t(0.42), 0.045, 4900, 0.07, "bandpass"); // 0.42 second leaf flicks
  puff(c, o, t(0.54), 0.045, 5500, 0.07, "bandpass"); // 0.54 third leaf flicks
  swish(c, o, t(0.46), t(0.22), 500, 1000, 0.02); // 0.46 to 0.68 the carrot swings round once more
  tick(c, o, t(0.9), 0.07, 1700); // 0.90 the carrot settles with a crunchy tick
  puff(c, o, t(0.98), 0.05, 5200, 0.025, "bandpass"); // 0.98 the last leaf comes to rest
}
