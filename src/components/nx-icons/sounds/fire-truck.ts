import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A hydraulic pump whine and hiss as the ladder raises (0.00 to 0.30), a metallic clink when it locks, a long rasping metal slide as the next section runs out (0.30 to 0.72) ending in a clack, then a falling whine as it folds back down (0.86 to 1.20) and a heavy clunk as it rests on the truck. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.00-0.30 the ladder raises on its ram, pump whining up
  blip(c, o, 180, t(0.0), 0.04, 0.32, 360, "sawtooth");
  swish(c, o, t(0.0), t(0.3), 500, 1500, 0.02);
  // 0.30 the ladder locks at its angle
  blip(c, o, 1400, t(0.3), 0.04, 0.07, 1100, "triangle");
  tick(c, o, t(0.3), 0.1, 2500);
  // 0.30-0.72 the next section slides out, metal rasping on metal
  swish(c, o, t(0.3), t(0.42), 2600, 900, 0.03);
  puff(c, o, t(0.32), 0.38, 3400, 0.03, "bandpass");
  // 0.72 the section reaches its end stop
  tick(c, o, t(0.72), 0.12, 1800);
  thud(c, o, t(0.72), 130, 0.1, 0.07);
  // 0.86-1.20 the ladder slides in and folds down, pump whining down
  blip(c, o, 380, t(0.86), 0.04, 0.34, 160, "sawtooth");
  swish(c, o, t(0.86), t(0.34), 1500, 500, 0.02);
  // 1.20 the ladder comes to rest on the truck
  thud(c, o, t(1.2), 100, 0.14, 0.12);
  tick(c, o, t(1.2), 0.08, 2200);
}
