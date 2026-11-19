import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.58;

/** A doughy thump as the pretzel lands from its hop, then a fine sprinkle of three tiny salt crystal clicks as they fall onto it. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.21), 300, 700, 0.02); // 0.00-0.21 the pretzel hops up
  thud(c, o, t(0.42), 170, 0.14, 0.12); // 0.42 it lands soft and doughy
  tick(c, o, t(0.59), 0.035, 7600); // 0.59 the first salt crystal lands
  tick(c, o, t(0.65), 0.03, 8200); // 0.65 the second crystal
  tick(c, o, t(0.71), 0.028, 7100); // 0.71 the third crystal
  puff(c, o, t(0.57), 0.18, 7000, 0.012); // 0.57-0.75 a faint hiss of falling salt
}
