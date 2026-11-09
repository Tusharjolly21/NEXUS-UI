import { blip, swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.18;

/** Four fur-soft flicks as the ears twitch in turn, left ear first, then the right, followed by four quick sniffs that shrink away as the nose and whiskers wiggle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.1), 0.03, 3400, 0.07, "bandpass"); // 0.108 the left ear flicks out
  tick(c, o, t(0.108), 0.05, 6800); // 0.108 whisper of fur on the left ear
  puff(c, o, t(0.317), 0.03, 3000, 0.05, "bandpass"); // 0.324 the left ear flicks again, smaller
  puff(c, o, t(0.4), 0.03, 4700, 0.07, "bandpass"); // 0.408 the right ear flicks out
  tick(c, o, t(0.408), 0.05, 7600); // 0.408 whisper of fur on the right ear
  puff(c, o, t(0.617), 0.03, 4200, 0.05, "bandpass"); // 0.624 the right ear flicks again, smaller
  puff(c, o, t(0.62), 0.05, 5200, 0.06, "highpass"); // 0.65 first sniff as the nose twitches right
  blip(c, o, 2300, t(0.64), 0.022, 0.05, 3000); // 0.65 the sniff rises in pitch
  puff(c, o, t(0.72), 0.05, 5200, 0.055, "highpass"); // 0.75 second sniff, nose twitches left
  blip(c, o, 2150, t(0.74), 0.02, 0.05, 2800); // 0.75 the sniff rises in pitch
  puff(c, o, t(0.82), 0.05, 5200, 0.045, "highpass"); // 0.85 third sniff, a little smaller
  blip(c, o, 2000, t(0.84), 0.016, 0.05, 2600); // 0.85 the sniff rises in pitch
  puff(c, o, t(0.92), 0.05, 5200, 0.035, "highpass"); // 0.95 last sniff
  blip(c, o, 1900, t(0.94), 0.012, 0.05, 2400); // 0.95 the sniff rises in pitch
  swish(c, o, t(0.95), t(0.1), 6200, 3200, 0.025); // 0.95-1.05 the whiskers settle
}
