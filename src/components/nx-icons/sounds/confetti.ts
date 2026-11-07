import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.06;

/** A hollow pop and puff of air as the popper fires, a flick of tiny bits flying out, a few bright glints as the pieces reach the top of their arc, a soft paper rustle as they flutter down, and three light taps as they land. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.02 the popper fires and kicks back
  thud(c, o, t(0.02), 190, 0.22, 0.1);
  puff(c, o, t(0.03), 0.12, 4200, 0.07, "highpass");
  // 0.04-0.34 the six pieces burst out
  puff(c, o, t(0.04), 0.3, 3500, 0.035, "bandpass");
  // 0.17 popper squashes back, 0.33 it rebounds
  tick(c, o, t(0.17), 0.05, 2200);
  thud(c, o, t(0.33), 330, 0.05, 0.05);
  // 0.36 / 0.42 / 0.48 pieces reach the top of their arc and glint
  blip(c, o, 4200, t(0.36), 0.03, 0.04, 5200);
  blip(c, o, 3600, t(0.42), 0.025, 0.04, 4400);
  blip(c, o, 4800, t(0.48), 0.025, 0.04, 5800);
  // 0.42-0.88 pieces flutter down
  swish(c, o, t(0.42), t(0.46), 6000, 2500, 0.022);
  // 0.8 / 0.86 / 0.92 pieces land
  tick(c, o, t(0.8), 0.04, 3000);
  tick(c, o, t(0.86), 0.035, 4000);
  tick(c, o, t(0.92), 0.03, 3400);
}
