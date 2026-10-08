import { createStoredState } from "@/lib/stored";

/* The compare tray: up to MAX_COMPARE vehicle slugs, kept in localStorage so it survives navigation and reloads. */

export const MAX_COMPARE = 3;

const EMPTY: string[] = [];

const tray = createStoredState<string[]>(
  "motohub.compare",
  (raw) =>
    Array.isArray(raw)
      ? raw.filter((s): s is string => typeof s === "string").slice(0, MAX_COMPARE)
      : EMPTY,
  EMPTY,
);

export function useCompare() {
  const list = tray.use();
  return {
    slugs: list,
    has: (slug: string) => list.includes(slug),
    isFull: list.length >= MAX_COMPARE,
    toggle: (slug: string) =>
      tray.set(
        list.includes(slug)
          ? list.filter((s) => s !== slug)
          : list.length < MAX_COMPARE
            ? [...list, slug]
            : list,
      ),
    replace: (next: string[]) => tray.set(next.slice(0, MAX_COMPARE)),
    clear: () => tray.set([]),
  };
}
