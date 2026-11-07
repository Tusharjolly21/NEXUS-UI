import { blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two scratchy bristle sweeps, one each way, with a grainy brush of noise and three light flicks as dust specks fly off. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.32), 800, 2600, 0.05);
  puff(c, o, t(0.06), 0.3, 4200, 0.03, "highpass");
  swish(c, o, t(0.34), t(0.34), 2400, 700, 0.05);
  puff(c, o, t(0.36), 0.3, 3600, 0.03, "highpass");
  [0.46, 0.53, 0.6].forEach((at, i) => blip(c, o, [N.E6, N.B6, N.G6][i], t(at), 0.03, 0.04));
  puff(c, o, t(0.74), 0.12, 2800, 0.02, "highpass");
}
