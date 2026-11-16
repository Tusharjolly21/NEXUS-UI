import type { SHAPES, EXPRESSIONS } from "./shapes";

/** One of the body shapes an agent can take. */
export type ShapeKey = (typeof SHAPES)[number]["key"];
/** One of the faces an agent can make. */
export type EyesKey = (typeof EXPRESSIONS)[number]["key"];

/** An agent on the team (or in the directory, before it is added). */
export type Agent = {
  id: string;
  name: string;
  role: string;
  desc: string;
  shape: string;
  color: string;
  eyes: string;
  lang: string;
  notify: boolean;
  voice: string;
  speed: number;
  custom?: boolean;
};

/** An agent offered in the directory, with who made it and how many teams use it. */
export type DirectoryAgent = Pick<Agent, "id" | "name" | "role" | "desc" | "shape" | "color" | "eyes"> & {
  by: string;
  installs: string;
};

/** A file attached to a message. */
export type Attachment = {
  id: string;
  name: string;
  size: string;
  icon: string;
};

/** One message in a thread. A reply that is still arriving carries the times its words appear. */
export type Msg = {
  id: string;
  from: string;
  text: string;
  at: number;
  streaming?: boolean;
  times?: number[];
  start?: number | null;
  reactions?: string[];
  variant?: number;
  voice?: boolean;
  files?: Attachment[];
};

/** A conversation: a direct message with one agent, or a group of them. */
export type Thread = {
  id: string;
  kind: "dm" | "group";
  agents: string[];
  title?: string;
  busy: string[];
  queue: string[];
  unread: number;
  msgs: Msg[];
};

/** A reply queued to stream into a thread. */
export type Reply = { agent: string; text: string; variant?: number };

/** A count the 3D agent watches: each change makes it hop (kick) or smile (boop). */
export type Pulse = { kick: number; boop: number };
