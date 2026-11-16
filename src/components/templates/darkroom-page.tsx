"use client";

/**
 * Darkroom: a chat-first image studio. Describe a place, a time of day and a feeling, and a print develops on screen:
 * a spiral of grains gathers into the picture, takes on its colours and sharpens into the finished image, then flies
 * into a masonry gallery. Nine print styles (risograph, paper cut, halftone, Bauhaus, cyanotype, topographic contour,
 * gradient mesh, pixel art and ink wash) are painted live on a canvas, and the same prompt and seed always give the
 * same print. Projects and chats in a sidebar, a composer with reference palettes, aspect ratio, image count, model and
 * mode menus, a styles panel that previews your own prompt, a zoomable viewer with pinch, pan and remix, Command K
 * search, favourites, undoable deletes, light and dark themes, and a bottom sheet gallery on phones.
 *
 * Darkroom and every person, project and print are invented sample content; nothing calls an image model. The icons
 * are Phosphor (MIT), the avatar is DiceBear Notionists (CC0), and Inter and Geist Mono are self-hosted.
 */

import { MotionConfig } from "framer-motion";
import { DarkroomApp } from "./darkroom/app";

export function DarkroomPage() {
  return (
    <MotionConfig reducedMotion="user">
      <DarkroomApp />
    </MotionConfig>
  );
}
