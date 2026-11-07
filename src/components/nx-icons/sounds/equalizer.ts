import { ding, blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A bass thump and five sawtooth synth glides that slide up and down as each knob moves, with a filter-style sweep up and back down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.02), 70, 0.22, 0.2);
  [[220, 392], [330, 196], [262, 440], [392, 147], [294, 523]].forEach(([a, b], i) => blip(c, o, a, t(0.05 + i * 0.07), 0.05, 0.4, b, "sawtooth"));
  swish(c, o, t(0.05), t(0.45), 300, 3400, 0.05);
  swish(c, o, t(0.5), t(0.45), 3400, 400, 0.04);
  ding(c, o, 1244.51, t(0.95), 0.05, 0.4);
}
