import { tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A shaken tambourine: sizzling bursts of tiny metal jingles at every turn of the shake, each a handful of bright clicks, getting quieter as the shaking dies away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.06, 7200, 0.03); // 0.00 the shake begins
  puff(c, o, t(0.15), 0.12, 7500, 0.07); // 0.15 shake reverses, jingles burst
  tick(c, o, t(0.162), 0.07, 9000); // 0.16 single jingle
  tick(c, o, t(0.178), 0.06, 6500); // 0.18 single jingle
  puff(c, o, t(0.3), 0.12, 7000, 0.07); // 0.30 shake reverses
  tick(c, o, t(0.312), 0.07, 8800); // 0.31 single jingle
  tick(c, o, t(0.328), 0.06, 6200); // 0.33 single jingle
  puff(c, o, t(0.45), 0.11, 7600, 0.055); // 0.45 shake reverses, weaker
  tick(c, o, t(0.462), 0.06, 9200); // 0.46 single jingle
  puff(c, o, t(0.6), 0.1, 7200, 0.04); // 0.60 reverses, weaker still
  tick(c, o, t(0.612), 0.045, 8600); // 0.61 single jingle
  puff(c, o, t(0.75), 0.1, 7800, 0.025); // 0.75 last small turn
  puff(c, o, t(0.9), 0.08, 8200, 0.012); // 0.90 the jingles settle
}
