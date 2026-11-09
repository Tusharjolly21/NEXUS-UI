import { blip, swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A deep rising whale call as it surfaces, a bright hiss of spray as the spout shoots up, and a low splash as the tail slaps back down, ending on a falling answer. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 150, t(0.08), 0.11, 0.45, 310); // 0.08-0.53 the whale call rises as the body lifts
  blip(c, o, 300, t(0.08), 0.03, 0.4, 620); // 0.08-0.48 its overtone
  swish(c, o, t(0.19), t(0.4), 2500, 6500, 0.1); // 0.19-0.59 the spout sprays up, fastest early
  puff(c, o, t(0.3), 0.08, 1500, 0.04, "lowpass"); // 0.31 the tail breaks the surface
  puff(c, o, t(0.56), 0.12, 700, 0.1, "lowpass"); // 0.585 the tail comes down: a splash
  thud(c, o, t(0.585), 88, 0.1, 0.16); // 0.585 low thud of water
  blip(c, o, 270, t(0.6), 0.07, 0.3, 160); // 0.60-0.90 falling answer as it settles
}
