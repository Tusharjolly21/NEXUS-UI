import type { ComponentType } from "react";
import type { PropDoc } from "@/components/library/prop-controls";

/**
 * What a block section needs for its Customize tab: the real component, the props a visitor can
 * change (with a live preview), and how to write the result back as JSX.
 */
export type SectionPlayground = {
  /** The section's own exported component (not a preview wrapper), rendered live with the values. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each section has its own props
  Component: ComponentType<any>;
  /**
   * Props the live preview always passes and the visitor can't edit (demo data arrays, `autoplay`,
   * fixed callbacks). Not written into the copied JSX unless listed in `snippetProps`.
   */
  baseProps?: Record<string, unknown>;
  /**
   * Every public prop, documented. The first editable ones (boolean, number, string, string union;
   * no callbacks, arrays, objects or nodes) become controls, so put the most useful first.
   * Number props should set min/max (and step) so the controls stay in a sensible range.
   */
  props: PropDoc[];
  /** JSX tag in the copied snippet, e.g. "SeatRulerPricing". */
  jsxName: string;
  /** Import line(s) for the copied snippet. */
  importLine: string;
  /** Extra JSX attributes always written into the snippet (e.g. `plans={plans}`), one per entry. */
  snippetProps?: string[];
  /** Optional wrapper class for the live preview frame (e.g. a background colour or min height). */
  frameClassName?: string;
};

/** One module per block: section id -> playground. */
export type BlockPlaygrounds = Record<string, SectionPlayground>;
