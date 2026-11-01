import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.59;

/** A buzzing printer motor with rhythmic ticks as the paper feeds out, ending with a ding. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 95, t(0.05), 0.07, 0.6, 105, "sawtooth");
  [0.1, 0.2, 0.3, 0.4, 0.5].forEach((at) => { tick(c, o, t(at), 0.06, 3600); thud(c, o, t(at), 190, 0.03, 0.03); });
  swish(c, o, t(0.12), t(0.5), 1400, 3200, 0.025);
  ding(c, o, N.G6, t(0.72), 0.07, 0.45);
}
