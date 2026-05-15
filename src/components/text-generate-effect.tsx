/** Re-export shim: some bundlers resolve `@/components/text-generate-effect` to file before directory. */
export type {
  TextGenerateMode,
  TextGenerateAs,
  TextGenerateTrigger,
  TextGenerateEffectProps,
} from "./text-generate-effect/text-generate-effect";
export { TextGenerateEffect } from "./text-generate-effect/text-generate-effect";
export { TextGenerateEffectDemo } from "./text-generate-effect/demo";
