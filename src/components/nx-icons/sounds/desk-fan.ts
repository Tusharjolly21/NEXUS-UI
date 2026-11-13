import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.48;

/** A motor that spins up with a rising buzz and a rush of air while the blades build speed, a steady whoosh at full speed, then the buzz and the air fall away as it winds down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 90, t(0.0), 0.04, 0.5, 520, "sawtooth"); // 0.00-0.44 the motor spins up, the buzz climbs
  swish(c, o, t(0.0), t(0.46), 500, 3400, 0.05); // 0.00-0.46 air rushes as the blades accelerate
  swish(c, o, t(0.46), t(0.3), 3400, 3100, 0.045); // 0.46-0.76 full speed, the blur arcs flash round the hub
  blip(c, o, 520, t(0.46), 0.03, 0.65, 100, "sawtooth"); // 0.46-1.10 the motor winds down, the buzz falls
  swish(c, o, t(0.62), t(0.5), 3000, 400, 0.04); // 0.62-1.12 the air rush dies away with the blades
}
