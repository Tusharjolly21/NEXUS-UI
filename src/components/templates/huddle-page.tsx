"use client";

/**
 * Huddle: a dark workspace app where a team of AI agents lives in a sidebar like colleagues. Each agent is a little
 * character you design (a body shape, a face, a colour, a voice) and it shows up as a glossy 3D figure in an editor
 * beside the chat that watches the pointer and hops when you change it. Talk to one agent in a direct message, or pull
 * two to four of them into a huddle where they hand the question to each other, mention each other and stream their
 * replies in turn. A composer with @mentions, attachments, a goal, plugins, a model menu and permission modes; a voice
 * mode with an orb that swells as you speak; reactions, retry and copy on every reply; a settings sheet with a
 * marketplace of agents, plugins, models, workspace switches and members.
 *
 * Huddle and every agent, person, figure and message are invented sample content. The icons are Phosphor (MIT), the
 * avatars are DiceBear Notionists (CC0), and Inter and Geist Mono are self-hosted.
 */

import { MotionConfig } from "framer-motion";
import { HuddleApp } from "./huddle/app";

export function HuddlePage() {
  return (
    <MotionConfig reducedMotion="user">
      <HuddleApp />
    </MotionConfig>
  );
}
