"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ASPECT_KEYS, MODELS, modelById, styleName } from "./data";
import { ASPECTS } from "./render";
import { COLORS, EASE, FONT_MONO, clamp } from "./theme";
import type { Aspect, Draft, ImgMap, Project } from "./types";
import { Chip, CountUp, Icon, IconButton, MenuItem, MenuLabel, Popover, Segmented, useDismiss } from "./ui";

/** A small outlined rectangle in the shape of an aspect ratio. */
function AspectIcon({ a: aspect, size = 14 }: { a: Aspect; size?: number }) {
  const ratio = ASPECTS[aspect];
  const w = ratio > 1 ? size / ratio : size;
  const h = ratio > 1 ? size : size * ratio;
  return (
    <span
      className="inline-block rounded-[2.5px]"
      style={{
        width: w,
        height: h,
        boxShadow: "inset 0 0 0 1.5px currentColor",
      }}
    />
  );
}

type DraftSetter = (change: Partial<Draft>) => void;

type ReferencePickerProps = { d: Draft; set: DraftSetter; imgs: ImgMap; order: string[]; close: () => void };

/** The plus menu: borrow a palette from an earlier print, and set aspect ratio and image count. */
function ReferencePicker({ d: draft, set, imgs, order, close }: ReferencePickerProps) {
  const [picking, setPicking] = useState(false);
  return (
    <Popover className="bottom-[calc(100%+10px)] left-0 w-[300px]" origin="bottom left">
      {picking ? (
        <div>
          <div className="flex items-center gap-1 px-1 pb-1.5">
            <IconButton icon="ph:caret-left" label="Back" size={28} iconSize={14} onClick={() => setPicking(false)} />
            <span
              className="text-[13px] font-[500]"
              style={{
                color: COLORS.ink,
              }}
            >
              Choose a reference
            </span>
          </div>
          <div className="thin grid max-h-[230px] grid-cols-4 gap-1.5 overflow-y-auto p-1">
            {order
              .map((id) => imgs[id])
              .filter(Boolean)
              .map((img) => (
                <button
                  key={img.id}
                  type="button"
                  aria-label={`Use ${img.title} as reference`}
                  onClick={() => {
                    set({
                      ref: img.id,
                    });
                    close();
                  }}
                  className="aspect-square overflow-hidden rounded-[8px] transition-transform hover:scale-[1.04]"
                  style={{
                    boxShadow: draft.ref === img.id ? `0 0 0 2px ${COLORS.acc}` : `inset 0 0 0 1px ${COLORS.line}`,
                  }}
                >
                  {/* Prints are blob URLs rendered from canvases. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="size-full object-cover" />
                </button>
              ))}
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="hov flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left"
          >
            <span
              style={{
                color: COLORS.soft,
              }}
            >
              <Icon name="ph:image-square" size={16} />
            </span>
            <span className="flex-1">
              <span
                className="block text-[13px] font-[500]"
                style={{
                  color: COLORS.ink,
                }}
              >
                Reference image
              </span>
              <span
                className="block text-[12px]"
                style={{
                  color: COLORS.soft,
                }}
              >
                Borrow its palette for the next print
              </span>
            </span>
            <Icon name="ph:caret-right" size={13} className="opacity-60" />
          </button>
          <div
            className="mx-2.5 my-1.5 h-px"
            style={{
              background: COLORS.line,
            }}
          />
          <p
            className="px-2.5 pb-1.5 pt-1 text-[12px] font-[500]"
            style={{
              color: COLORS.soft,
            }}
          >
            Aspect ratio
          </p>
          <div className="px-1">
            <Segmented
              id="aspect"
              label="Aspect ratio"
              value={draft.aspect}
              onChange={(aspect) =>
                set({
                  aspect,
                })
              }
              options={ASPECT_KEYS.map((aspectKey) => ({
                v: aspectKey,
                label: (
                  <>
                    <AspectIcon a={aspectKey} size={11} />
                    <span>{aspectKey}</span>
                  </>
                ),
              }))}
            />
          </div>
          <p
            className="px-2.5 pb-1.5 pt-3 text-[12px] font-[500]"
            style={{
              color: COLORS.soft,
            }}
          >
            Images per prompt
          </p>
          <div className="px-1 pb-1">
            <Segmented
              id="count"
              label="Images per prompt"
              value={String(draft.count)}
              onChange={(count) =>
                set({
                  count: Number(count),
                })
              }
              options={["1", "2", "4"].map((count) => ({
                v: count,
                label: count === "1" ? "1 image" : `${count} images`,
              }))}
            />
          </div>
        </>
      )}
    </Popover>
  );
}

/** How full this chat's context is, as a ring and a percentage. */
function ContextRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 7;
  const share = clamp(value / 100);
  return (
    <span
      className="flex items-center gap-1.5"
      data-tip={`${Math.round(value)}% of this chat's context used`}
      tabIndex={0}
      aria-label={`${Math.round(value)} percent of context used`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden={true} className="-rotate-90">
        <circle cx="9" cy="9" r={7} fill="none" stroke="var(--line2)" strokeWidth="2" />
        <motion.circle
          cx="9"
          cy="9"
          r={7}
          fill="none"
          stroke={share > 0.8 ? "var(--acc)" : "var(--text)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{
            strokeDashoffset: circumference * (1 - share),
          }}
          transition={{
            duration: 0.9,
            ease: EASE,
          }}
        />
      </svg>
      <CountUp
        value={Math.round(value)}
        suffix="%"
        className="text-[12px]"
        style={{
          color: COLORS.soft,
          fontFamily: FONT_MONO,
        }}
      />
    </span>
  );
}

type Menu = "plus" | "model" | "project" | "mode";

type ComposerProps = {
  d: Draft;
  set: DraftSetter;
  onSend: () => void;
  busy: boolean;
  imgs: ImgMap;
  order: string[];
  openStyles: () => void;
  projects: Project[];
  project: string;
  setProject: (id: string) => void;
  ctx: number;
  narrow: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
};

/** The prompt box: chips for what is tuned, the text field, menus for reference, style, model, project and mode. */
export function Composer({
  d: draft,
  set,
  onSend,
  busy,
  imgs,
  order,
  openStyles,
  projects,
  project,
  setProject,
  ctx,
  narrow,
  inputRef,
}: ComposerProps) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [typing, setTyping] = useState(false);
  const inputBox = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLDivElement>(null);
  useDismiss(menu !== null, () => setMenu(null), inputBox, footer);
  useLayoutEffect(() => {
    const field = inputRef.current;
    if (field) {
      field.style.height = "0px";
      field.style.height = Math.min(180, field.scrollHeight) + "px";
    }
  }, [draft.text, inputRef]);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  /** Simulated dictation: types a sample prompt in, as if spoken. No microphone is used. */
  const typeSample = () => {
    if (typing) {
      timers.current.forEach(clearTimeout);
      setTyping(false);
      return;
    }
    setTyping(true);
    const spoken = "a lighthouse on a headland at dusk, gulls over the water";
    const before = draft.text ? draft.text.trimEnd() + " " : "";
    timers.current = [...spoken].map((_, i) =>
      window.setTimeout(
        () =>
          set({
            text: before + spoken.slice(0, i + 1),
          }),
        900 + i * 28,
      ),
    );
    timers.current.push(window.setTimeout(() => setTyping(false), 900 + spoken.length * 28 + 200));
  };
  const canSend = draft.text.trim().length > 0 && !busy;
  const model = modelById(draft.model);
  const reference = draft.ref ? imgs[draft.ref] : null;
  const tuned = reference || draft.style || draft.aspect !== "4:5" || draft.count > 1;
  return (
    <div className="relative">
      <div
        ref={inputBox}
        className="relative rounded-[20px] transition-shadow duration-200 focus-within:shadow-[0_0_0_1px_var(--line2),0_0_0_4px_var(--acc-soft)]"
        style={{
          background: COLORS.panel,
          boxShadow: `0 0 0 1px ${COLORS.line2}, 0 18px 40px -24px rgba(0,0,0,.5)`,
        }}
      >
        <AnimatePresence initial={false}>
          {tuned && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.25,
                ease: EASE,
              }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 px-3 pt-3">
                <AnimatePresence initial={false}>
                  {reference && (
                    <Chip
                      key="ref"
                      onRemove={() =>
                        set({
                          ref: null,
                        })
                      }
                      label="Remove reference"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={reference.url} alt="" className="size-4 rounded-[4px] object-cover" />
                      {reference.title}
                      {" palette"}
                    </Chip>
                  )}
                  {draft.style && (
                    <Chip
                      key="style"
                      onRemove={() =>
                        set({
                          style: null,
                        })
                      }
                      label="Remove style"
                      accent={true}
                    >
                      <Icon name="ph:palette" size={13} />
                      {styleName(draft.style)}
                    </Chip>
                  )}
                  {draft.aspect !== "4:5" && (
                    <Chip
                      key="aspect"
                      onRemove={() =>
                        set({
                          aspect: "4:5",
                        })
                      }
                      label="Reset aspect ratio"
                    >
                      <AspectIcon a={draft.aspect} size={10} />
                      {draft.aspect}
                    </Chip>
                  )}
                  {draft.count > 1 && (
                    <Chip
                      key="count"
                      onRemove={() =>
                        set({
                          count: 1,
                        })
                      }
                      label="Back to one image"
                    >
                      <Icon name="ph:squares-four" size={13} />
                      {draft.count}
                      {" images"}
                    </Chip>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <label htmlFor="dr-prompt" className="sr-only">
          Describe an image
        </label>
        <textarea
          id="dr-prompt"
          ref={inputRef}
          value={draft.text}
          rows={1}
          onChange={(event) =>
            set({
              text: event.target.value,
            })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              if (canSend) {
                onSend();
              }
            }
          }}
          placeholder={typing ? "Listening..." : "Describe an image to develop"}
          className="block w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[15px] leading-[1.5] outline-none placeholder:text-[var(--soft)]"
          style={{
            color: COLORS.ink,
            minHeight: 50,
          }}
        />
        <div className="flex items-center gap-1 px-2 pb-2 pt-1">
          <div className="relative">
            <IconButton
              icon="ph:plus"
              label="Reference, aspect and count"
              active={menu === "plus"}
              onClick={() => setMenu(menu === "plus" ? null : "plus")}
            />
            <AnimatePresence>
              {menu === "plus" && (
                <ReferencePicker d={draft} set={set} imgs={imgs} order={order} close={() => setMenu(null)} />
              )}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={openStyles}
            className="flex h-8 items-center gap-1.5 rounded-[9px] px-2 text-[12.5px] font-[500] transition-colors hover:bg-[var(--raise)]"
            style={{
              color: draft.style ? COLORS.ink : COLORS.text,
            }}
          >
            <Icon
              name="ph:palette"
              size={15}
              style={{
                color: draft.style ? COLORS.acc : undefined,
              }}
            />
            {draft.style ? styleName(draft.style) : "Style"}
          </button>
          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menu === "model"}
              onClick={() => setMenu(menu === "model" ? null : "model")}
              className="flex h-8 items-center gap-1 rounded-[9px] px-2 text-[12.5px] font-[500] transition-colors hover:bg-[var(--raise)]"
              style={{
                color: COLORS.text,
              }}
            >
              <Icon name="ph:aperture" size={15} />
              <span className={narrow ? "hidden" : ""}>{model.name}</span>
              <Icon name="ph:caret-down" size={11} className="opacity-60" />
            </button>
            <AnimatePresence>
              {menu === "model" && (
                <Popover className="bottom-[calc(100%+10px)] left-0 w-[268px]">
                  {MODELS.map((option) => (
                    <MenuItem
                      key={option.id}
                      label={option.name}
                      desc={option.desc}
                      hint={`${(option.ms / 1e3).toFixed(1)}s`}
                      checked={draft.model === option.id}
                      onClick={() => {
                        set({
                          model: option.id,
                        });
                        setMenu(null);
                      }}
                    />
                  ))}
                </Popover>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-1" />
          <button
            type="button"
            aria-label={typing ? "Stop dictation" : "Dictate"}
            data-tip={typing ? "Stop" : "Dictate"}
            onClick={typeSample}
            className="grid h-8 min-w-8 place-items-center rounded-[9px] px-1.5 transition-colors hover:bg-[var(--raise)]"
            style={{
              color: typing ? COLORS.acc : COLORS.soft,
            }}
          >
            {typing ? (
              <span className="flex h-4 items-center gap-[2px]">
                {[0, 1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    className="wave block h-full w-[2px] rounded-full"
                    style={{
                      background: "currentColor",
                      animation: `dr-wave .9s ease-in-out ${bar * 0.12}s infinite`,
                    }}
                  />
                ))}
              </span>
            ) : (
              <Icon name="ph:microphone" size={16} />
            )}
          </button>
          <motion.button
            type="button"
            aria-label="Develop"
            data-tip="Develop"
            disabled={!canSend}
            onClick={onSend}
            whileTap={
              canSend
                ? {
                    scale: 0.9,
                  }
                : undefined
            }
            className="grid size-8 place-items-center rounded-full transition-[background,color,opacity] duration-200"
            style={{
              background: canSend ? COLORS.acc : COLORS.raise2,
              color: canSend ? COLORS.accInk : COLORS.soft,
            }}
          >
            {busy ? <Icon name="ph:circle-notch" size={15} className="spin" /> : <Icon name="ph:arrow-up" size={16} />}
          </motion.button>
        </div>
      </div>
      <div
        ref={footer}
        className="mt-2 flex items-center gap-1 px-1 text-[12px]"
        style={{
          color: COLORS.soft,
        }}
      >
        <div className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menu === "project"}
            onClick={() => setMenu(menu === "project" ? null : "project")}
            className="flex h-7 items-center gap-1.5 rounded-[8px] px-1.5 transition-colors hover:bg-[var(--raise)] hover:text-[var(--ink)]"
          >
            <Icon name="ph:folder-simple" size={14} />
            <span className="max-w-[140px] truncate">
              {projects.find((item) => item.id === project)?.name ?? "No project"}
            </span>
            <Icon name="ph:caret-down" size={10} />
          </button>
          <AnimatePresence>
            {menu === "project" && (
              <Popover className="bottom-[calc(100%+8px)] left-0 w-[220px]">
                <p
                  className="px-2.5 pb-1 pt-1.5 text-[11.5px]"
                  style={{
                    color: COLORS.soft,
                  }}
                >
                  Move this chat to
                </p>
                {projects.map((item) => (
                  <MenuItem
                    key={item.id}
                    icon="ph:folder-simple"
                    label={item.name}
                    checked={project === item.id}
                    onClick={() => {
                      setProject(item.id);
                      setMenu(null);
                    }}
                  />
                ))}
              </Popover>
            )}
          </AnimatePresence>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menu === "mode"}
            onClick={() => setMenu(menu === "mode" ? null : "mode")}
            className="flex h-7 items-center gap-1.5 rounded-[8px] px-1.5 transition-colors hover:bg-[var(--raise)] hover:text-[var(--ink)]"
          >
            <Icon name={draft.mode === "agent" ? "ph:sparkle" : "ph:lightning"} size={14} />
            {draft.mode === "agent" ? "Agent" : "Direct"}
            <Icon name="ph:caret-down" size={10} />
          </button>
          <AnimatePresence>
            {menu === "mode" && (
              <Popover className="bottom-[calc(100%+8px)] left-0 w-[260px]">
                <MenuItem
                  icon="ph:sparkle"
                  label="Agent"
                  desc="Reads your prompt, picks a style and says why."
                  checked={draft.mode === "agent"}
                  onClick={() => {
                    set({
                      mode: "agent",
                    });
                    setMenu(null);
                  }}
                />
                <MenuItem
                  icon="ph:lightning"
                  label="Direct"
                  desc="Prints exactly what you ask, no commentary."
                  checked={draft.mode === "direct"}
                  onClick={() => {
                    set({
                      mode: "direct",
                    });
                    setMenu(null);
                  }}
                />
              </Popover>
            )}
          </AnimatePresence>
        </div>
        <div className="flex-1" />
        {!narrow && (
          <span className="mr-2 hidden md:inline">
            <MenuLabel>Enter</MenuLabel>
            {" to develop"}
          </span>
        )}
        <ContextRing value={ctx} />
      </div>
    </div>
  );
}
