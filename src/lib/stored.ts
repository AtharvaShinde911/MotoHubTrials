import { useSyncExternalStore } from "react";

/**
 * A tiny client-side store persisted to localStorage. Server render and the
 * first client render see `initial`, so markup matches during hydration.
 */
export function createStoredState<T>(key: string, parse: (raw: unknown) => T, initial: T) {
  let value = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const read = () => {
    if (!loaded && typeof window !== "undefined") {
      loaded = true;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw !== null) value = parse(JSON.parse(raw));
      } catch {
        // Storage blocked or corrupt: keep the initial value.
      }
    }
    return value;
  };

  const set = (next: T) => {
    value = next;
    loaded = true;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Not persisted, but the in-memory value still works.
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  const use = () => useSyncExternalStore(subscribe, read, () => initial);

  return { use, set, get: read };
}
