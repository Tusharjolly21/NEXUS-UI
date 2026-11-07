import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Five staccato pops that climb unevenly like points landing on a graph, then one long glassy scan as the trend line draws across, ending on a soft tick. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[N.G5, 0.04], [N.E6, 0.17], [N.C6, 0.3], [N.A6, 0.44], [N.D6, 0.58]].forEach(([f, at]) => blip(c, o, f, t(at), 0.07, 0.07, f * 1.2));
  swish(c, o, t(0.76), t(0.4), 900, 4600, 0.03);
  ding(c, o, N.B6, t(1.12), 0.04, 0.35);
  tick(c, o, t(1.1), 0.06, 4600);
}
