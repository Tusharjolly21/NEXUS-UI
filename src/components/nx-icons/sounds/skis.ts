import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.84;

/** Two hissing glides of skis on snow, one after the other in a skating stride, and a soft wooden knock as the second ski slides back into line. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.24), 2600, 5200, 0.045); // 0.00-0.24 the first ski glides forward on the snow
  swish(c, o, t(0.2), t(0.24), 2400, 4800, 0.04); // 0.20-0.44 the second ski glides forward
  swish(c, o, t(0.26), t(0.22), 4200, 2400, 0.02); // 0.24-0.48 the first ski slides back into line
  tick(c, o, t(0.48), 0.04, 3600); // 0.48 the first binding settles
  swish(c, o, t(0.46), t(0.32), 4000, 2000, 0.02); // 0.44-0.80 the second ski slides back
  blip(c, o, 820, t(0.8), 0.04, 0.05, 640, "triangle"); // 0.80 the skis line up with a soft wooden knock
  thud(c, o, t(0.8), 200, 0.04, 0.05); // 0.80 the weight of the knock
}
