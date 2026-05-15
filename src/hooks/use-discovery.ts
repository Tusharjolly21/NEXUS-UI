"use client";

import * as React from "react";
import type { BookmarkKind } from "@/lib/catalog/taxonomy";
import { useCatalogStorage } from "@/hooks/use-catalog-storage";

type Bookmark = { kind: BookmarkKind; slug: string };

const KEY_FAV = "lf:favorites:v1";
const KEY_MARK = "lf:bookmarks:v1";
const KEY_RECENT = "lf:recent:v1";

export function useDiscoveryLists() {
  const [favorites, setFavorites] = useCatalogStorage<Bookmark[]>(KEY_FAV, []);
  const [bookmarks, setBookmarks] = useCatalogStorage<Bookmark[]>(KEY_MARK, []);
  const [recent, setRecent] = useCatalogStorage<string[]>(KEY_RECENT, []);

  const pushRecent = React.useCallback(
    (slug: string) => {
      setRecent((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const next = [slug, ...list.filter((s) => s !== slug)].slice(0, 12);
        return next;
      });
    },
    [setRecent],
  );

  const toggleFavorite = React.useCallback(
    (kind: BookmarkKind, slug: string) => {
      setFavorites((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const exists = list.some((b) => b.kind === kind && b.slug === slug);
        if (exists) return list.filter((b) => !(b.kind === kind && b.slug === slug));
        return [{ kind, slug }, ...list];
      });
    },
    [setFavorites],
  );

  const toggleBookmark = React.useCallback(
    (kind: BookmarkKind, slug: string) => {
      setBookmarks((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const exists = list.some((b) => b.kind === kind && b.slug === slug);
        if (exists) return list.filter((b) => !(b.kind === kind && b.slug === slug));
        return [{ kind, slug }, ...list];
      });
    },
    [setBookmarks],
  );

  const isFavorite = React.useCallback(
    (kind: BookmarkKind, slug: string) =>
      (Array.isArray(favorites) ? favorites : []).some((b) => b.kind === kind && b.slug === slug),
    [favorites],
  );

  const isBookmarked = React.useCallback(
    (kind: BookmarkKind, slug: string) =>
      (Array.isArray(bookmarks) ? bookmarks : []).some((b) => b.kind === kind && b.slug === slug),
    [bookmarks],
  );

  return {
    favorites,
    bookmarks,
    recent,
    pushRecent,
    toggleFavorite,
    toggleBookmark,
    isFavorite,
    isBookmarked,
  };
}

export const useDiscovery = useDiscoveryLists;
