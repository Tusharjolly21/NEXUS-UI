import { ding, blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.22;

/** Relay clicks as each lamp changes: green off and red on (0.05 s), red to amber (0.31 s), amber off (0.61 s) and green on (0.74 s), each lamp with its own soft hum, and a small chime when green lights. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.05), 0.1, 2600); // 0.05 relay clicks: green fades out, red lights
  blip(c, o, 150, t(0.05), 0.06, 0.06, 110, "square"); // 0.05 relay clunk
  blip(c, o, 196, t(0.08), 0.05, 0.25, 190, "sine"); // 0.08 red lamp hum
  tick(c, o, t(0.31), 0.1, 3000); // 0.31 relay clicks: red fades out, amber lights
  blip(c, o, 160, t(0.31), 0.06, 0.06, 115, "square"); // 0.31 relay clunk
  blip(c, o, 262, t(0.34), 0.05, 0.25, 255, "triangle"); // 0.34 amber lamp hum
  tick(c, o, t(0.61), 0.08, 2200); // 0.61 relay clicks: amber goes dark
  blip(c, o, 120, t(0.61), 0.05, 0.06, 90, "square"); // 0.61 relay clunk
  tick(c, o, t(0.74), 0.11, 3400); // 0.74 relay clicks: green lights
  blip(c, o, 170, t(0.74), 0.06, 0.06, 125, "square"); // 0.74 relay clunk
  blip(c, o, 392, t(0.77), 0.05, 0.28, 385, "sine"); // 0.77 green lamp hum
  ding(c, o, 1568, t(0.78), 0.04, 0.4); // 0.78 green is lit: a small go chime
}
