import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.63;

/** A motor hum that rises and falls with the drum's full turn, soft cabinet thumps at each shudder, and three water sloshes with two bubble pops while the suds slide about. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 55, t(0.1), 0.07, 0.45, 150, "sawtooth"); // 0.1 to 0.5 the motor spins the drum up, fastest at 0.5
  blip(c, o, 150, t(0.5), 0.05, 0.4, 62, "sawtooth"); // 0.5 to 0.9 the drum slows and stops
  thud(c, o, t(0.25), 70, 0.08, 0.1); // 0.25 cabinet shudders right
  thud(c, o, t(0.4), 66, 0.08, 0.1); // 0.4 shudders left
  thud(c, o, t(0.55), 70, 0.07, 0.1); // 0.55 shudders right
  thud(c, o, t(0.7), 66, 0.06, 0.1); // 0.7 shudders left
  thud(c, o, t(0.85), 70, 0.04, 0.1); // 0.85 last small shudder
  swish(c, o, t(0.12), 0.23, 500, 1100, 0.03); // 0.12 to 0.35 the suds slide left
  swish(c, o, t(0.37), 0.23, 1100, 480, 0.03); // 0.37 to 0.6 the suds slide right
  swish(c, o, t(0.62), 0.23, 520, 900, 0.025); // 0.62 to 0.85 the suds slide left again
  blip(c, o, 900, t(0.52), 0.04, 0.07, 1350); // 0.52 a bubble pops up
  blip(c, o, 1100, t(0.75), 0.035, 0.07, 1600); // 0.75 a bubble pops down
}
