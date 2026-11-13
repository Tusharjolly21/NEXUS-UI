import { ding, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.95;

/** Deep stone grinding as the pyramid rises, three chisel scratches as the hatching of the shaded face is drawn in, a heavy block thump as it settles and a warm sun tone. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.24), 110, 320, 0.05); // 0.00-0.23 the stone grinds upward
  swish(c, o, t(0.1), t(0.3), 2000, 3300, 0.02); // 0.10-0.40 first hatch line is drawn
  swish(c, o, t(0.25), t(0.3), 2300, 3600, 0.02); // 0.25-0.55 second hatch line
  swish(c, o, t(0.4), t(0.3), 2600, 3900, 0.02); // 0.40-0.70 third hatch line
  ding(c, o, 1175, t(0.35), 0.03, 0.4); // 0.35 the sun swells
  thud(c, o, t(0.47), 62, 0.22, 0.2); // 0.47 the block settles
  tick(c, o, t(0.7), 0.08, 3000); // 0.70 last line is complete
}
