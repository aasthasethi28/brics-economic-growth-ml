import { useSyncExternalStore } from "react";
import type { ResearchResults } from "./schema";

// In-memory store for results loaded this session (imported file or demo preview).
let current: ResearchResults | null = null;
const listeners = new Set<() => void>();

export function setResults(r: ResearchResults | null) {
  current = r;
  listeners.forEach((l) => l());
}

export function useResults() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:8000";
