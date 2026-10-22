import type { RecordedSoundName } from "@/lib/ui-sounds-recorded";

/**
 * Placeholder. The real recordings, as data URIs, are written into this file by
 * `scripts/build-registry.mjs` from `assets-pro/sounds/*.mp3` and are only ever served to Pro accounts
 * (the `ui-sounds-recorded` registry item). They are not part of the site's own bundle.
 */
export const RECORDED_AUDIO: Record<RecordedSoundName, string> = {
  typing: "",
  camera: "",
  message: "",
  notification: "",
  screenshot: "",
};
