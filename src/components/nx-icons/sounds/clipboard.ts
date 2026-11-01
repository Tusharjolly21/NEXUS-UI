import { ding, blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.01;

/** A spring-clip snap, three rising blips as the tick is drawn, and a bright ding when it is checked off. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.16, 2600);
  thud(c, o, t(0.02), 230, 0.06, 0.04);
  [N.C6, N.E6, N.G6].forEach((f, i) => blip(c, o, f, t(0.28 + i * 0.1), 0.06, 0.1));
  ding(c, o, N.C7, t(0.6), 0.08, 0.5);
}
