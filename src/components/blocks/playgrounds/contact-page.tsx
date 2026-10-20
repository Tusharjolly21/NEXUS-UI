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

const ACCENT_DESCRIPTION =
  "Accent colour for the submit button, links, field focus and focus outlines. Without it: #0071e3, with links and field focus #2997ff in dark mode.";

/** Shared docs for one of the form-card copy props, with that layout's default. */
const formProp = (name: "formEyebrow" | "formTitle" | "formDescription" | "buttonLabel", value: string): PropDoc => ({
  name,
  type: "string",
  defaultValue: JSON.stringify(value),
  description: {
    formEyebrow: "Small grey label above the form title.",
    formTitle: "The form card's heading.",
    formDescription: "Paragraph under the form title.",
    buttonLabel: "Submit button text.",
  }[name],
});

/** Props every classic layout has besides its own copy: the form copy object, the submit handler and a class name. */
const CONTACT_SHARED_PROPS: PropDoc[] = [
  {
    name: "formCopy",
    type: "Partial<ContactFormCopy>",
    description:
      "Overrides for the form's field labels and placeholders, the optional suffix, and the Sending…, Message sent and error copy. Defaults to DEFAULT_CONTACT_FORM_COPY.",
  },
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
    props: [
      { name: "title", type: "string", defaultValue: '"Let\'s shape the next interface."', description: "Large heading on the left." },
      {
        name: "eyebrow",
        type: "string",
        defaultValue: '"A studio across three time zones"',
        description: "Grey line above the heading.",
      },
      {
        name: "description",
        type: "string",
        defaultValue:
          '"Send a product brief, launch notes or a rough idea. A designer and an engineer read every message and reply with a concrete next step."',
        description: "Paragraph under the heading.",
      },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: `${ACCENT_DESCRIPTION} Also colours the map pin.` },
      formProp("formTitle", "Tell us what you want to build"),
      formProp("buttonLabel", "Send request"),
      {
        name: "email",
        type: "string",
        defaultValue: '"hello@northfield.design"',
        description: "First contact link, opened with mailto:. Empty hides it.",
      },
      {
        name: "showMap",
        type: "boolean",
        defaultValue: "true",
        description: "Show the world map with the pulsing pin. Hiding it also skips loading the map data.",
      },
      {
        name: "phone",
        type: "string",
        defaultValue: '"+44 20 7946 0321"',
        description: "Second contact link; everything but digits and + is stripped for the tel: link. Empty hides it.",
      },
      {
        name: "responseNote",
        type: "string",
        defaultValue: '"Replies within a working day"',
        description: "Plain grey note after the links. Empty hides it.",
      },
      { name: "mapLabel", type: "string", defaultValue: '"We are here"', description: "Text of the pill above the map pin." },
      formProp("formEyebrow", "Project request"),
      formProp("formDescription", "A few details are enough. We will reply with a practical next step, not a sales maze."),
      ...CONTACT_SHARED_PROPS,
    ],
    jsxName: "GlobalSignalContact",
    importLine: contactImport("GlobalSignalContact"),
  },

  "contact-centered": {
    Component: CenteredContactForm,
    props: [
      { name: "title", type: "string", defaultValue: '"Say hello. A real person reads it."', description: "Large heading on the left." },
      {
        name: "brandName",
        type: "string",
        defaultValue: '"Northfield"',
        description: "Name beside the monogram; its first letter fills the monogram.",
      },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: ACCENT_DESCRIPTION },
      formProp("formTitle", "What can we help with?"),
      formProp("buttonLabel", "Start the conversation"),
      formProp("formEyebrow", "Quick hello"),
      formProp(
        "formDescription",
        "Questions, partnerships or a project you want to start. We route every note to the right person.",
      ),
      {
        name: "showSocial",
        type: "boolean",
        defaultValue: "true",
        description: "Show the round GitHub, LinkedIn and Chat buttons under the form (they link to # until you change them).",
      },
      {
        name: "details",
        type: "ContactDetail[]",
        description:
          "Rows of the contact list ({ label, value }). Defaults to CENTERED_CONTACT_DETAILS: New projects, Existing clients, Office hours. An empty list hides it.",
      },
      ...CONTACT_SHARED_PROPS,
    ],
    jsxName: "CenteredContactForm",
    importLine: contactImport("CenteredContactForm"),
  },

  "contact-gradient-proof": {
    Component: GradientProofContact,
    props: [
      formProp("formTitle", "Need help designing a better intake flow?"),
      {
        name: "proofLabel",
        type: "string",
        defaultValue: '"What teams say after launch"',
        description: "Grey label at the top of the quote panel.",
      },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: ACCENT_DESCRIPTION },
      formProp("buttonLabel", "Book a design review"),
      {
        name: "rotateSeconds",
        type: "number",
        defaultValue: "6.5",
        min: 2,
        max: 30,
        step: 0.5,
        description: "Seconds each quote stays before the next one.",
      },
      {
        name: "autoRotate",
        type: "boolean",
        defaultValue: "true",
        description: "Advance the quotes by themselves. Never under reduced motion; paused while the quote is hovered.",
      },
      formProp("formEyebrow", "Customer success"),
      formProp(
        "formDescription",
        "Share the workflow, audience, and deadline. We will suggest a component path that fits your product.",
      ),
      {
        name: "quotes",
        type: "ProofQuote[]",
        description:
          "Testimonials ({ quote, name, role }) the panel cycles through; initials come from the name. Defaults to PROOF_QUOTES (three); an empty list falls back to them.",
      },
      ...CONTACT_SHARED_PROPS,
    ],
    jsxName: "GradientProofContact",
    importLine: contactImport("GradientProofContact"),
  },

  "contact-image-story": {
    Component: ImageStoryContact,
    props: [
      formProp("formTitle", "Write to the people who build it."),
      {
        name: "quote",
        type: "string",
        defaultValue: '"Our launch page finally feels like the product: fast, composed, and unmistakably ours."',
        description: "Testimonial on the frosted card over the photo; curly quotes are added.",
      },
      { name: "accent", type: "string", defaultValue: '"#0071e3"', description: ACCENT_DESCRIPTION },
      { name: "authorName", type: "string", defaultValue: '"Sana Noor"', description: "Who said it; their initials fill the avatar." },
      { name: "authorRole", type: "string", defaultValue: '"Founder, Meadow AI"', description: "Their role, under the name." },
      {
        name: "brandName",
        type: "string",
        defaultValue: '"Northfield"',
        description: "Name beside the monogram on the form card; its first letter fills the monogram.",
      },
      formProp("buttonLabel", "Send message"),
      { name: "brandTagline", type: "string", defaultValue: '"Launch support"', description: "Grey line under the brand name." },
      formProp("formEyebrow", "Talk to the team"),
      formProp(
        "formDescription",
        "Tell us where your page feels stuck. We can help with layout, motion, conversion details, or full section composition.",
      ),
      ...CONTACT_SHARED_PROPS,
    ],
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
