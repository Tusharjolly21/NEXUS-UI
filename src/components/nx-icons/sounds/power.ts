import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.93;

/** A firm switch click, a rising electric hum, and a bright ping as the glow rings out. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.16, 2400);
  thud(c, o, t(0.02), 180, 0.08, 0.05);
  blip(c, o, 140, t(0.08), 0.05, 0.4, 420, "triangle");
  swish(c, o, t(0.1), t(0.35), 800, 3600, 0.03);
  ding(c, o, N.E6, t(0.32), 0.08, 0.6);
}
