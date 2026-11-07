import { blip, swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.06;

/** A low warm swell as the dough rises with a run of crackling crust, a second swell and crackle, and a soft steam hiss that follows the three wisps. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 110, t(0.02), 0.07, 0.25, 150); // 0.02-0.23 the loaf swells up, a low warm rise
  [0.07, 0.12, 0.15, 0.19, 0.22].forEach((at, i) => { if (i % 2) puff(c, o, t(at), 0.03, 3600, 0.05, "bandpass"); else tick(c, o, t(at), 0.07, 2600 + i * 300); }); // 0.07-0.22 the crust crackles as it stretches
  blip(c, o, 120, t(0.45), 0.06, 0.25, 165); // 0.45-0.68 the second swell
  [0.5, 0.56, 0.6, 0.64, 0.67].forEach((at, i) => { if (i % 2) puff(c, o, t(at), 0.03, 3600, 0.05, "bandpass"); else tick(c, o, t(at), 0.07, 2800 + i * 300); }); // 0.5-0.67 more crackle
  [0.15, 0.33, 0.51].forEach((at) => swish(c, o, t(at), t(0.35), 5200, 3600, 0.02)); // 0.15 0.33 0.51 each wisp of steam starts to rise
}
