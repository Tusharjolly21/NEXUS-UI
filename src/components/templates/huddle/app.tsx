"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { AgentEditor } from "./agent-editor";
import { Composer } from "./composer";
import { AGENT_DIRECTORY, NEW_AGENT_NAMES, STARTER_AGENTS, STARTER_THREADS, type SettingsTab } from "./data";
import { HuddleSetup } from "./huddle-setup";
import {
  REPLY_BANK,
  SUGGESTIONS,
  THREAD_TITLES,
  detectTopic,
  huddleReplyFor,
  replyFor,
  streamTimes,
  visibleText,
} from "./replies";
import { Settings } from "./settings";
import { AGENT_COLORS, EXPRESSIONS, SHAPES } from "./shapes";
import { Sidebar } from "./sidebar";
import { BASE_CSS, COLORS, FONT_CSS, SPRING, hashString, uid } from "./theme";
import { MemberStrip, MessageList, ThreadHeader } from "./thread";
import { Icon, useMediaQuery } from "./ui";
import { VoiceChat } from "./voice-chat";
import type { ComposerHandle } from "./composer";
import type { Agent, Msg, Pulse, Reply, Thread } from "./types";

export function HuddleApp() {
  const [agents, setAgents] = useState(STARTER_AGENTS);
  const [threads, setThreads] = useState(STARTER_THREADS);
  const [activeId, setActiveId] = useState("d-mochi");
  const [editingId, setEditingId] = useState<string | null>(null);
  // Until the visitor opens or closes it, the editor is open on wide screens and closed on narrower ones.
  const [editorChoice, setEditorChoice] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [huddleWith, setHuddleWith] = useState<string[] | null>(null);
  const [settingsTab, setSettingsTab] = useState<SettingsTab | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [addedAgents, setAddedAgents] = useState<string[]>([]);
  const [plugins, setPlugins] = useState(["docs", "sheets", "slides", "code"]);
  const isPhone = useMediaQuery("(max-width: 899px)");
  const isNarrow = useMediaQuery("(max-width: 1279px)");
  const isTiny = useMediaQuery("(max-width: 520px)");
  const editorOpen = editorChoice ?? !isNarrow;
  const pulse = useRef<Pulse>({
    kick: 0,
    boop: 0,
  });
  const composer = useRef<ComposerHandle>(null);
  const nameField = useRef<HTMLInputElement>(null);
  const searchField = useRef<HTMLInputElement>(null);
  // the latest threads, agents and open thread, for replies that land on a timer after this render
  const threadsRef = useRef(threads);
  const agentsRef = useRef(agents);
  const activeRef = useRef(activeId);
  useLayoutEffect(() => {
    threadsRef.current = threads;
    agentsRef.current = agents;
    activeRef.current = activeId;
  });
  /** Every pending reply timer, by thread, so Stop can cancel them. */
  const timers = useRef<Record<string, number[]>>({});
  useEffect(
    () => () =>
      Object.values(timers.current)
        .flat()
        .forEach((timer) => clearTimeout(timer)),
    [],
  );
  const notify = useCallback(
    (text: string) =>
      setToast({
        id: Date.now(),
        text,
      }),
    [],
  );
  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (isPhone) {
          setMenuOpen(true);
        }
        setTimeout(() => searchField.current?.focus(), isPhone ? 320 : 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPhone]);
  const byId = useMemo<Record<string, Agent>>(
    () => Object.fromEntries(agents.map((agent) => [agent.id, agent])),
    [agents],
  );
  const byName = useMemo<Record<string, Agent>>(
    () => Object.fromEntries(agents.map((agent) => [agent.name.toLowerCase(), agent])),
    [agents],
  );
  const thread = threads.find((item) => item.id === activeId) ?? threads[0];
  const members = thread.agents.map((id) => byId[id]).filter(Boolean);
  const editing = byId[editingId && thread.agents.includes(editingId) ? editingId : thread.agents[0]] ?? agents[0];
  const streaming = thread.msgs.find((msg) => msg.streaming);
  const busy = thread.busy.length > 0 || !!streaming;
  const unread = threads.reduce((acc, item) => acc + (item.id === activeId ? 0 : item.unread), 0);
  const updateThread = useCallback(
    (threadId: string, change: (thread: Thread) => Thread) =>
      setThreads((prev) => prev.map((item) => (item.id === threadId ? change(item) : item))),
    [],
  );
  const later = (threadId: string, delay: number, run: () => void) => {
    const timer = window.setTimeout(run, delay);
    (timers.current[threadId] ??= []).push(timer);
  };
  const playReplies = useCallback(
    (threadId: string, replies: Reply[]) => {
      let lastStart = 0;
      let lastLength = 0;
      replies.forEach((reply, i) => {
        const agent = agentsRef.current.find((agent) => agent.id === reply.agent);
        const thinkFor = i === 0 ? 1e3 + Math.random() * 700 : 650 + Math.random() * 500;
        const startAt = i === 0 ? 120 : lastStart + lastLength * 0.62;
        const streamAt = i === 0 ? startAt + thinkFor : Math.max(startAt + thinkFor, lastStart + lastLength + 380);
        const msgId = uid();
        const times = streamTimes(reply.text, msgId, agent ? 1 / Math.sqrt(agent.speed) : 1);
        const doneAt = times[times.length - 1] + 160;
        later(threadId, startAt, () =>
          updateThread(threadId, (item) => ({
            ...item,
            busy: item.busy.includes(reply.agent) ? item.busy : [...item.busy, reply.agent],
          })),
        );
        later(threadId, streamAt, () =>
          updateThread(threadId, (item) => ({
            ...item,
            busy: item.busy.filter((busyId) => busyId !== reply.agent),
            unread: activeRef.current === threadId ? 0 : item.unread + 1,
            msgs: [
              ...item.msgs,
              {
                id: msgId,
                from: reply.agent,
                text: reply.text,
                at: Date.now(),
                start: Date.now(),
                times,
                streaming: true,
                variant: reply.variant ?? 0,
              },
            ],
          })),
        );
        later(threadId, streamAt + doneAt, () =>
          updateThread(threadId, (item) => ({
            ...item,
            msgs: item.msgs.map((msg) =>
              msg.id === msgId
                ? {
                    ...msg,
                    streaming: false,
                  }
                : msg,
            ),
          })),
        );
        lastStart = streamAt;
        lastLength = doneAt;
      });
    },
    [updateThread],
  );
  const send = useCallback(
    (threadId: string, text: string, extra?: { voice?: boolean }) => {
      const thread = threadsRef.current.find((item) => item.id === threadId);
      if (!thread) {
        return;
      }
      updateThread(threadId, (item) => ({
        ...item,
        msgs: [
          ...item.msgs,
          {
            id: uid(),
            from: "me",
            text,
            at: Date.now(),
            voice: extra?.voice,
          },
        ],
      }));
      const members = thread.agents
        .map((id) => agentsRef.current.find((item) => item.id === id))
        .filter((agent): agent is Agent => !!agent);
      if (!members.length) {
        return;
      }
      if (thread.kind === "dm") {
        const seen = new Set(thread.msgs.map((msg) => msg.text));
        let variant = 0;
        let reply = replyFor(members[0], text, 0);
        while (seen.has(reply) && variant < 3) {
          reply = replyFor(members[0], text, ++variant);
        }
        playReplies(threadId, [
          {
            agent: members[0].id,
            text: reply,
            variant,
          },
        ]);
        return;
      }
      const names = Object.fromEntries(members.map((member) => [member.id, member.name]));
      const mentioned = members.filter((member) => new RegExp(`@${member.name}\\b`, "i").test(text));
      let speakers: Agent[];
      if (mentioned.length) {
        speakers = mentioned;
      } else {
        const topic = detectTopic(text);
        const lead = members.find((member) => member.id === "juno");
        speakers = members
          .filter((member) => member !== lead)
          .map((member) => ({
            member,
            score:
              (topic && REPLY_BANK[member.id]?.[topic] ? 2 : 0) +
              (REPLY_BANK[member.id] ? 1 : 0) +
              hashString(text + member.id),
          }))
          .sort((a, b) => b.score - a.score)
          .map((scored) => scored.member)
          .slice(0, members.length >= 4 ? 3 : 2);
        if (lead) {
          speakers.push(lead);
        }
      }
      const replies: Reply[] = [];
      const order: string[] = [];
      let prevId: string | null = null;
      const seen = new Set(thread.msgs.map((msg) => msg.text));
      speakers.forEach((speaker, i) => {
        let reply = huddleReplyFor(speaker, text, prevId, i, names, order);
        if (seen.has(reply)) {
          reply = huddleReplyFor(speaker, text, prevId, i + 1, names, order, true);
        }
        replies.push({
          agent: speaker.id,
          text: reply,
        });
        order.push(speaker.id);
        prevId = speaker.id;
      });
      playReplies(threadId, replies);
    },
    [updateThread, playReplies],
  );
  const stop = useCallback(() => {
    const threadId = activeRef.current;
    (timers.current[threadId] ?? []).forEach((timer) => clearTimeout(timer));
    timers.current[threadId] = [];
    const now = Date.now();
    updateThread(threadId, (item) => ({
      ...item,
      busy: [],
      msgs: item.msgs.map((msg) =>
        msg.streaming
          ? {
              ...msg,
              text: visibleText(msg, now).trimEnd() || "Stopped.",
              streaming: false,
            }
          : msg,
      ),
    }));
  }, [updateThread]);
  const retry = useCallback(
    (target: Msg) => {
      const thread = threadsRef.current.find((item) => item.msgs.some((msg) => msg.id === target.id));
      if (!thread) {
        return;
      }
      const index = thread.msgs.findIndex((msg) => msg.id === target.id);
      const ask = [...thread.msgs.slice(0, index)].reverse().find((item) => item.from === "me");
      const agent = agentsRef.current.find((agent) => agent.id === target.from);
      if (!agent) {
        return;
      }
      const variant = (target.variant ?? 0) + 1;
      updateThread(thread.id, (item) => ({
        ...item,
        msgs: item.msgs.filter((msg) => msg.id !== target.id),
      }));
      playReplies(thread.id, [
        {
          agent: agent.id,
          text: replyFor(agent, ask?.text ?? "hello", variant),
          variant,
        },
      ]);
    },
    [updateThread, playReplies],
  );
  const react = useCallback(
    (target: Msg, emoji: string) =>
      setThreads((prev) =>
        prev.map((thread) =>
          thread.msgs.some((msg) => msg.id === target.id)
            ? {
                ...thread,
                msgs: thread.msgs.map((msg) =>
                  msg.id === target.id
                    ? {
                        ...msg,
                        reactions: (msg.reactions ?? []).includes(emoji)
                          ? (msg.reactions ?? []).filter((item) => item !== emoji)
                          : [...(msg.reactions ?? []), emoji],
                      }
                    : msg,
                ),
              }
            : thread,
        ),
      ),
    [],
  );
  const copyMessage = useCallback(
    (msg: Msg) => {
      try {
        navigator.clipboard?.writeText(msg.text).catch(() => {});
      } catch {}
      notify("Copied to clipboard");
    },
    [notify],
  );
  const openThread = useCallback(
    (threadId: string) => {
      setActiveId(threadId);
      setEditingId(null);
      setMenuOpen(false);
      updateThread(threadId, (item) => ({
        ...item,
        unread: 0,
      }));
    },
    [updateThread],
  );
  const openAgent = useCallback((agentId: string) => {
    setEditingId(agentId);
    setEditorChoice(true);
  }, []);
  const updateAgent = useCallback(
    (agentId: string, change: Partial<Agent>) =>
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId
            ? {
                ...agent,
                ...change,
              }
            : agent,
        ),
      ),
    [],
  );
  const newAgent = () => {
    const customCount = agentsRef.current.filter((agent) => agent.custom).length;
    const agent: Agent = {
      id: `new-${uid()}`,
      name: NEW_AGENT_NAMES[customCount % NEW_AGENT_NAMES.length],
      role: "New agent",
      desc: "",
      shape: SHAPES[(customCount * 4 + 2) % SHAPES.length].key,
      color: AGENT_COLORS[(customCount * 3 + 6) % AGENT_COLORS.length].hex,
      eyes: EXPRESSIONS[(customCount * 5 + 1) % EXPRESSIONS.length].key,
      lang: "English (US)",
      notify: true,
      voice: "Wren",
      speed: 1,
      custom: true,
    };
    const thread: Thread = {
      id: `d-${agent.id}`,
      kind: "dm",
      agents: [agent.id],
      busy: [],
      queue: [],
      unread: 0,
      msgs: [
        {
          id: uid(),
          from: agent.id,
          text: `Hi, I'm ${agent.name}. Give me a face, a name and a job on the right, then tell me what to work on.`,
          at: Date.now(),
        },
      ],
    };
    setAgents((prev) => [...prev, agent]);
    setThreads((prev) => [...prev, thread]);
    setActiveId(thread.id);
    setEditingId(agent.id);
    setEditorChoice(true);
    setMenuOpen(false);
    setTimeout(() => {
      nameField.current?.focus();
      nameField.current?.select();
    }, 420);
  };
  const startHuddle = (agentIds: string[], topic: string) => {
    const title = topic.length > 34 ? topic.slice(0, 32).replace(/\s+\S*$/, "") + "…" : topic;
    const thread: Thread = {
      id: `g-${uid()}`,
      kind: "group",
      agents: agentIds,
      title: THREAD_TITLES[topic] ?? title.replace(/\?$/, ""),
      busy: [],
      queue: [],
      unread: 0,
      msgs: [],
    };
    setThreads((prev) => [thread, ...prev]);
    setHuddleWith(null);
    setActiveId(thread.id);
    setEditingId(null);
    setMenuOpen(false);
    setTimeout(() => send(thread.id, topic), 900);
  };
  const addAgent = (agentId: string) => {
    const agent = AGENT_DIRECTORY.find((item) => item.id === agentId);
    if (!agent) {
      return;
    }
    if (addedAgents.includes(agentId)) {
      setAddedAgents((prev) => prev.filter((item) => item !== agentId));
      setAgents((prev) => prev.filter((item) => item.id !== agentId));
      setThreads((prev) => prev.filter((item) => !(item.kind === "dm" && item.agents[0] === agentId)));
      if (activeRef.current === `d-${agentId}`) {
        setActiveId("d-mochi");
      }
      notify(`${agent.name} removed from your workspace`);
      return;
    }
    const joined: Agent = {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      desc: agent.desc,
      shape: agent.shape,
      color: agent.color,
      eyes: agent.eyes,
      lang: "English (US)",
      notify: true,
      voice: "Harbor",
      speed: 1,
    };
    setAddedAgents((prev) => [...prev, agentId]);
    setAgents((prev) => [...prev, joined]);
    setThreads((prev) => [
      ...prev,
      {
        id: `d-${agentId}`,
        kind: "dm",
        agents: [agentId],
        busy: [],
        queue: [],
        unread: 1,
        msgs: [
          {
            id: uid(),
            from: agentId,
            text: `Hi, I'm ${agent.name}, your ${agent.role.toLowerCase()}. ${agent.desc}`,
            at: Date.now(),
          },
        ],
      },
    ]);
    notify(`${agent.name} joined your sidebar`);
  };
  const editor = editing && (
    <AgentEditor
      agent={editing}
      onChange={(change) => updateAgent(editing.id, change)}
      onClose={() => setEditorChoice(false)}
      nameRef={nameField}
      pulse={pulse}
      mobile={isPhone}
    />
  );
  const sidebar = (
    <Sidebar
      agents={agents}
      threads={threads}
      active={activeId}
      onOpen={openThread}
      onNewAgent={newAgent}
      onHuddle={() => {
        setMenuOpen(false);
        setHuddleWith(thread.kind === "dm" ? [thread.agents[0]] : []);
      }}
      onSettings={(tab) => {
        setSettingsTab(tab ?? "workspace");
        setMenuOpen(false);
      }}
      notify={notify}
      onClose={isPhone ? () => setMenuOpen(false) : undefined}
      searchRef={searchField}
    />
  );
  const speaker = (streaming == null ? undefined : streaming.from) ?? null;
  return (
    <div
      className="hd fixed inset-0 flex overflow-hidden"
      style={{
        background: COLORS.bg,
      }}
    >
      <style>{FONT_CSS + BASE_CSS}</style>
      {!isPhone && (
        <aside
          className="h-full w-[284px] shrink-0 border-r"
          style={{
            background: COLORS.side,
            borderColor: COLORS.line,
          }}
        >
          {sidebar}
        </aside>
      )}
      <main className="relative flex h-full min-w-0 flex-1 flex-col">
        <ThreadHeader
          thread={thread}
          members={members}
          narrow={isPhone}
          editorOpen={editorOpen}
          unreadElsewhere={unread}
          onMenu={() => setMenuOpen(true)}
          onEdit={() => setEditorChoice(!editorOpen)}
          onVoice={() => setVoiceOpen(true)}
          onHuddle={() => setHuddleWith(thread.kind === "dm" ? [thread.agents[0]] : thread.agents)}
          onAgent={openAgent}
        />
        <MessageList
          thread={thread}
          byId={byId}
          names={byName}
          onCopy={copyMessage}
          onRetry={retry}
          onReact={react}
          onAgent={openAgent}
        />
        <div
          className="relative shrink-0 px-3 pb-3 pt-1 sm:px-6 sm:pb-5"
          style={{
            paddingBottom: isPhone ? "max(12px, env(safe-area-inset-bottom))" : undefined,
          }}
        >
          <div className="mx-auto w-full max-w-[740px]">
            {thread.kind === "group" && (
              <MemberStrip
                agents={members}
                speaker={speaker}
                thinking={thread.busy}
                onPick={(thread) => {
                  return composer.current?.insert(`@${thread.name} `);
                }}
              />
            )}
            <Composer
              ref={composer}
              placeholder={
                thread.kind === "group" ? "Ask the huddle, or @mention someone" : `Message ${members[0]?.name ?? ""}`
              }
              busy={busy}
              onSend={(text) => send(thread.id, text)}
              onStop={stop}
              onVoice={() => setVoiceOpen(true)}
              members={thread.kind === "group" ? members : []}
              compact={isTiny}
              notify={notify}
            />
          </div>
        </div>
        <AnimatePresence>
          {voiceOpen && members[0] && (
            <VoiceChat
              key="voice"
              agent={(thread.kind === "group", members[0])}
              line={
                thread.kind === "group"
                  ? SUGGESTIONS.group
                  : (SUGGESTIONS[members[0].id] ?? "Here's what I'm working on today. Where should I start?")
              }
              onCancel={() => setVoiceOpen(false)}
              onSend={(text) => {
                setVoiceOpen(false);
                send(thread.id, text, {
                  voice: true,
                });
              }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              role="status"
              initial={{
                opacity: 0,
                y: 16,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 8,
                scale: 0.97,
              }}
              transition={SPRING}
              className="pointer-events-none absolute bottom-[132px] left-1/2 z-50 flex max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-full py-2 pl-3 pr-4 text-[13px] font-[550]"
              style={{
                background: "#26262C",
                color: COLORS.ink,
                boxShadow: `0 0 0 1px ${COLORS.line2}, 0 12px 30px rgba(0,0,0,.5)`,
              }}
            >
              <Icon
                name="ph:check-circle-fill"
                size={16}
                style={{
                  color: COLORS.acc,
                }}
              />
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {!isPhone && (
        <AnimatePresence initial={false}>
          {editorOpen &&
            (isNarrow ? (
              <motion.aside
                key="ed-over"
                initial={{
                  x: 400,
                }}
                animate={{
                  x: 0,
                }}
                exit={{
                  x: 400,
                }}
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 36,
                }}
                className="absolute bottom-0 right-0 top-0 z-30 w-[372px] border-l"
                style={{
                  background: COLORS.panel,
                  borderColor: COLORS.line,
                  boxShadow: "-30px 0 80px rgba(0,0,0,.5)",
                }}
              >
                {editor}
              </motion.aside>
            ) : (
              <motion.aside
                key="ed-col"
                initial={{
                  width: 0,
                  opacity: 0,
                }}
                animate={{
                  width: 372,
                  opacity: 1,
                }}
                exit={{
                  width: 0,
                  opacity: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 36,
                }}
                className="h-full shrink-0 overflow-hidden border-l"
                style={{
                  background: COLORS.panel,
                  borderColor: COLORS.line,
                }}
              >
                <div className="h-full w-[372px]">{editor}</div>
              </motion.aside>
            ))}
        </AnimatePresence>
      )}
      <AnimatePresence>
        {isPhone && menuOpen && (
          <motion.div key="drawer" className="fixed inset-0 z-50" initial="a" animate="b" exit="a">
            <motion.div
              variants={{
                a: {
                  opacity: 0,
                },
                b: {
                  opacity: 1,
                },
              }}
              className="absolute inset-0"
              style={{
                background: "rgba(0,0,0,.55)",
              }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Conversations"
              variants={{
                a: {
                  x: "-100%",
                },
                b: {
                  x: 0,
                },
              }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 38,
              }}
              drag="x"
              dragConstraints={{
                left: -320,
                right: 0,
              }}
              dragElastic={{
                left: 0.2,
                right: 0,
              }}
              onDragEnd={(event, info) => {
                if (info.offset.x < -80 || info.velocity.x < -400) {
                  setMenuOpen(false);
                }
              }}
              className="absolute bottom-0 left-0 top-0 w-[86%] max-w-[320px] border-r"
              style={{
                background: COLORS.side,
                borderColor: COLORS.line,
                boxShadow: "30px 0 80px rgba(0,0,0,.5)",
              }}
            >
              {sidebar}
            </motion.aside>
          </motion.div>
        )}
        {isPhone && editorOpen && (
          <MobileSheet
            key="sheet"
            label={`Edit ${editing == null ? undefined : editing.name}`}
            onClose={() => setEditorChoice(false)}
          >
            {editor}
          </MobileSheet>
        )}
      </AnimatePresence>
      <HuddleSetup
        open={!!huddleWith}
        onClose={() => setHuddleWith(null)}
        agents={agents}
        initial={huddleWith ?? []}
        onStart={startHuddle}
      />
      <Settings
        open={!!settingsTab}
        tab={settingsTab ?? "market"}
        setTab={(tab) => setSettingsTab(tab)}
        onClose={() => setSettingsTab(null)}
        added={addedAgents}
        onToggleAgent={addAgent}
        plugins={plugins}
        onTogglePlugin={(plugin) =>
          setPlugins((prev) => (prev.includes(plugin) ? prev.filter((item) => item !== plugin) : [...prev, plugin]))
        }
        notify={notify}
      />
    </div>
  );
}

function MobileSheet({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  const drag = useDragControls();
  return (
    <motion.div className="fixed inset-0 z-50" initial="a" animate="b" exit="a">
      <motion.div
        variants={{
          a: {
            opacity: 0,
          },
          b: {
            opacity: 1,
          },
        }}
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,.55)",
        }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        variants={{
          a: {
            y: "100%",
          },
          b: {
            y: 0,
          },
        }}
        transition={{
          type: "spring",
          stiffness: 340,
          damping: 36,
        }}
        drag="y"
        dragControls={drag}
        dragListener={false}
        dragConstraints={{
          top: 0,
          bottom: 0,
        }}
        dragElastic={{
          top: 0,
          bottom: 0.9,
        }}
        onDragEnd={(event, info) => {
          if (info.offset.y > 110 || info.velocity.y > 500) {
            onClose();
          }
        }}
        className="absolute inset-x-0 bottom-0 flex h-[88dvh] flex-col overflow-hidden rounded-t-[24px]"
        style={{
          background: COLORS.panel,
          boxShadow: `0 -1px 0 ${COLORS.line2}, 0 -30px 80px rgba(0,0,0,.6)`,
        }}
      >
        <div
          onPointerDown={(event) => drag.start(event)}
          className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
          aria-hidden={true}
        >
          <span
            className="h-[5px] w-10 rounded-full"
            style={{
              background: "rgba(255,255,255,.22)",
            }}
          />
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </motion.div>
    </motion.div>
  );
}
