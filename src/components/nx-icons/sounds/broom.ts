import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.66;

/** Scratchy bristle swishes that follow each sweep of the broom, loudest on the long middle sweep, then three tiny dry flicks as specks of dust fly off. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 1500, 2600, 0.04); // 0.0-0.22 first short sweep
  puff(c, o, t(0.03), 0.18, 4500, 0.03, "highpass");
  swish(c, o, t(0.22), t(0.3), 2800, 1400, 0.055); // 0.22-0.52 the long main sweep, fastest near 0.37
  puff(c, o, t(0.24), 0.28, 4000, 0.035, "highpass");
  swish(c, o, t(0.52), t(0.26), 1400, 2600, 0.045); // 0.52-0.78 the sweep back, fastest near 0.65
  puff(c, o, t(0.54), 0.24, 4200, 0.03, "highpass");
  swish(c, o, t(0.78), t(0.22), 2400, 1500, 0.02); // 0.78-1.0 a small last brush
  [0.465, 0.535, 0.605].forEach((at, i) => {
    tick(c, o, t(at), 0.045, 6500 + i * 600); // 0.465 0.535 0.605 a speck of dust flies off
    puff(c, o, t(at), 0.06, 6000, 0.025, "highpass");
  });
}
