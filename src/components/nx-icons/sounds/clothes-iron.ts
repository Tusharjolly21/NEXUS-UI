import { swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low gliding rumble as the iron slides over the board, a press of weight at the far end, and three short steam hisses as the vents swell one after another. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.4), 260, 520, 0.045); // 0.00-0.40 the iron glides forward
  thud(c, o, t(0.4), 220, 0.07, 0.1); // 0.40 the iron presses down at the far end
  puff(c, o, t(0.3), 0.14, 5500, 0.05); // 0.30 the first vent hisses
  puff(c, o, t(0.45), 0.14, 6000, 0.05); // 0.45 the second vent hisses
  puff(c, o, t(0.6), 0.14, 6500, 0.05); // 0.60 the third vent hisses
  swish(c, o, t(0.4), t(0.35), 520, 240, 0.035); // 0.40-0.75 the iron glides back
  swish(c, o, t(0.75), t(0.25), 300, 200, 0.02); // 0.75-1.00 the iron settles
}
