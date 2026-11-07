import { ding, blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.73;

/** A low electronic hum under soft swishes that follow the headset turning, and a three-note power-up chime that rises as the lens rings pulse out (0.2), the lenses glow brightest (0.35) and glow again (0.75). */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.04 the headset hums into life as it starts turning
  blip(c, o, 92, t(0.04), 0.04, 0.9, 150, "triangle");
  // 0-1.0 the head turns left, right, left, right
  swish(c, o, t(0.02), t(0.23), 600, 1100, 0.03);
  swish(c, o, t(0.25), t(0.25), 1100, 500, 0.032);
  swish(c, o, t(0.5), t(0.25), 500, 800, 0.028);
  swish(c, o, t(0.75), t(0.23), 800, 400, 0.022);
  // 0.15-0.35 the lens cores swell
  swish(c, o, t(0.12), t(0.24), 800, 3500, 0.04);
  // 0.2 lens rings pulse out
  ding(c, o, 1175, t(0.2), 0.05, 0.3);
  // 0.35 the lens glow is brightest
  ding(c, o, 1760, t(0.35), 0.06, 0.4);
  // 0.75 second, smaller glow
  ding(c, o, 2349, t(0.75), 0.035, 0.3);
}
