import { useSyncExternalStore } from "react";

/* The compare tray: up to MAX_COMPARE vehicle slugs, kept in localStorage so it survives navigation and reloads. */

export const MAX_COMPARE = 3;
const KEY = "motohub.compare";

let slugs: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (Array.isArray(raw)) slugs = raw.filter((s) => typeof s === "string").slice(0, MAX_COMPARE);
  } catch {
    // Storage blocked or corrupt: start with an empty tray.
  }
}

function set(next: string[]) {
  slugs = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Not persisted, but the in-memory tray still works.
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const EMPTY: string[] = [];

export function useCompare() {
  const list = useSyncExternalStore(
    subscribe,
    () => (load(), slugs),
    () => EMPTY,
  );
  return {
    slugs: list,
    has: (slug: string) => list.includes(slug),
    isFull: list.length >= MAX_COMPARE,
    toggle: (slug: string) =>
      set(
        list.includes(slug)
          ? list.filter((s) => s !== slug)
          : list.length < MAX_COMPARE
            ? [...list, slug]
            : list,
      ),
    replace: (next: string[]) => set(next.slice(0, MAX_COMPARE)),
    clear: () => set([]),
  };
}
