/** Shared shapes for the Darkroom template: prints, jobs, chats and the composer draft. */

export type Aspect = "1:1" | "4:5" | "3:2" | "16:9";

export type StyleId =
  "riso" | "papercut" | "halftone" | "bauhaus" | "cyanotype" | "contour" | "mesh" | "pixel" | "inkwash";

export type ModelId = "emulsion" | "swift" | "silverpoint";

export type Mode = "agent" | "direct";

export type Theme = "dark" | "light";

/** Everything needed to paint one print again, pixel for pixel. */
export type PrintSpec = {
  prompt: string;
  style: StyleId;
  seed: number;
  aspect: Aspect;
  palette?: string | null;
};

/** A finished print in the gallery. */
export type Img = {
  id: string;
  url: string;
  w: number;
  h: number;
  spec: PrintSpec;
  palette: string;
  title: string;
  model: ModelId;
  at: number;
  fav: boolean;
  chat: string;
  scale: number;
};

export type ImgMap = Record<string, Img>;

export type JobStatus = "developing" | "done";

/** One request to develop one or more prints, shown as a result card in the chat. */
export type Job = {
  id: string;
  prompt: string;
  specs: PrintSpec[];
  ids: string[];
  model: ModelId;
  mode: Mode;
  status: JobStatus;
  at: number;
  dur: number;
  vote: number;
  note: string;
  upscale?: boolean;
  label?: string;
};

export type UserMsg = { id: string; role: "user"; text: string; tags: string[] };

export type ArtMsg = { id: string; role: "art"; job: Job };

export type Msg = UserMsg | ArtMsg;

export type Chat = {
  id: string;
  title: string;
  project: string;
  ctx: number;
  msgs: Msg[];
  at: number;
};

export type Project = { id: string; name: string };

export type Draft = {
  text: string;
  style: StyleId | null;
  aspect: Aspect;
  count: number;
  ref: string | null;
  model: ModelId;
  mode: Mode;
};

export type DevelopOptions = {
  style: StyleId | null;
  aspect: Aspect;
  count: number;
  model: ModelId;
  mode: Mode;
  palette?: string | null;
  seedBase?: number;
  upscale?: boolean;
  userText?: string;
  tags?: string[];
};

/** A print flying from its chat card into the gallery. */
export type Flight = { id: string; url: string; from: DOMRect; to: DOMRect; toButton: boolean };

export type Toast = { id: string; text: string; undo?: () => void };

/** What a gallery tile or the viewer can do with a print. */
export type ViewerActs = {
  open: (id: string) => void;
  fav: (id: string) => void;
  download: (id: string) => void;
  remove: (id: string) => void;
};

/** What a result card in the chat can do with its job. */
export type PrintActs = {
  open: (id: string) => void;
  download: (id: string) => void;
  copy: (text: string) => void;
  finish: (jobId: string) => void;
  vote: (jobId: string, vote: number) => void;
  variations: (job: Job) => void;
  upscale: (id: string) => void;
};

export type SeedPlaceholder = { id: string; aspect: Aspect };

export type GalleryTab = "gallery" | "styles";
