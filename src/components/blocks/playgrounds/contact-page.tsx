"use client";

import {
  CenteredContactForm,
  GlobalSignalContact,
  GradientProofContact,
  ImageStoryContact,
} from "@/components/blocks/contact-page";
import { VoiceNoteContact } from "@/components/blocks/motion-kit/voice-note-contact";
import type { PropDoc } from "@/components/library/prop-controls";
import type { BlockPlaygrounds } from "./types";

/** The four classic contact layouts share one prop surface: a submit handler and a class name. */
const CONTACT_VARIANT_PROPS: PropDoc[] = [
  {
    name: "onSubmit",
    type: "(values: ContactFormValues) => Promise<void | { error?: string }>",
    description:
      "Sends the form ({ name, email, company, message }). Resolve to show the sent state; throw or resolve { error } to show a message. Without it the form simulates a 900 ms send.",
  },
  { name: "className", type: "string", description: "Extra classes on the outer section." },
];

const contactImport = (name: string) => `import { ${name} } from "@/components/blocks/contact-page";`;

const playgrounds: BlockPlaygrounds = {
  "contact-global-signal": {
    Component: GlobalSignalContact,
    props: CONTACT_VARIANT_PROPS,
    jsxName: "GlobalSignalContact",
    importLine: contactImport("GlobalSignalContact"),
  },

  "contact-centered": {
    Component: CenteredContactForm,
    props: CONTACT_VARIANT_PROPS,
    jsxName: "CenteredContactForm",
    importLine: contactImport("CenteredContactForm"),
  },

  "contact-gradient-proof": {
    Component: GradientProofContact,
    props: CONTACT_VARIANT_PROPS,
    jsxName: "GradientProofContact",
    importLine: contactImport("GradientProofContact"),
  },

  "contact-image-story": {
    Component: ImageStoryContact,
    props: CONTACT_VARIANT_PROPS,
    jsxName: "ImageStoryContact",
    importLine: contactImport("ImageStoryContact"),
  },

  "mk-voice-note-contact": {
    Component: VoiceNoteContact,
    baseProps: { autoplay: true },
    props: [
      {
        name: "accent",
        type: "string",
        defaultValue: '"#0071e3"',
        description:
          "Accent colour for the eyebrow, the face, focus rings and the recorded waveform. Without it: #0071e3 light, #0a84ff dark.",
      },
      {
        name: "contactEmail",
        type: "string",
        defaultValue: '"hello@northwind.studio"',
        description: "Email shown in the first contact row on the left.",
      },
      {
        name: "hours",
        type: "string",
        defaultValue: '"Mon to Fri, 9 to 6 CET"',
        description: "Opening hours shown in the second contact row.",
      },
      {
        name: "autoplay",
        type: "boolean",
        defaultValue: "true",
        description:
          "Types a message, then records and plays a voice note by itself until the visitor touches the section. The component's own default is false.",
      },
      {
        name: "onSubmit",
        type: "(data: VoiceNoteContactSubmission) => void",
        description:
          "Runs with the validated, trimmed submission: { kind: \"message\", name, email, message } or { kind: \"voice\", seconds }. Nothing is sent otherwise.",
      },
      { name: "className", type: "string", description: "Extra classes on the outer section." },
    ],
    jsxName: "VoiceNoteContact",
    importLine: "import { VoiceNoteContact } from \"@/components/blocks/motion-kit/voice-note-contact\";",
  },
};

export default playgrounds;
