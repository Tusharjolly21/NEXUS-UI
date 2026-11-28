// The shape of a playground (see playgrounds.ts). Split from the playgrounds themselves so it can be imported anywhere.
import type * as React from "react";

export type PlaygroundControl =
  | {
      kind: "range";
      prop: string;
      label: string;
      min: number;
      max: number;
      step: number;
      unit?: string;
      defaultValue: number;
    }
  | { kind: "toggle"; prop: string; label: string; defaultValue: boolean; /** The value it starts at when it differs from the component default (autoplay starts on). */ startOn?: boolean }
  | { kind: "select"; prop: string; label: string; options: readonly string[]; defaultValue: string }
  | { kind: "color"; prop: string; label: string; options: readonly string[]; defaultValue: string };

export type PlaygroundValues = Record<string, number | boolean | string>;

export type Playground = {
  /** Component name used in the generated JSX snippet. */
  componentName: string;
  importPath: string;
  controls: PlaygroundControl[];
  /** Props that are always present in the snippet, written verbatim (e.g. `avatars={avatars}`). */
  snippetBaseProps?: string[];
  /** Which surface the stage starts on. */
  defaultFill?: "light" | "dark";
  /** A fixed scene (own photo, shader or dark card) that ignores light/dark: the stage stays light and the Fill switch is hidden, so it never looks like the switch is broken. */
  lightOnly?: boolean;
  /** One line shown above the playground, for a component with something more to try than the controls (its own content, say). */
  blurb?: string;
  /** The component fills whatever box it is given (a full-bleed background): keep the stage at a fixed height instead of letting it grow to the component. */
  fillStage?: boolean;
  render: (values: PlaygroundValues, fill: "light" | "dark") => React.ReactNode;
};
