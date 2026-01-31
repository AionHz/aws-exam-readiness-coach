import { ProgressState } from "./types";
import { makeInitialState } from "./useProgress";

const KEY = "aws_exam_readiness_coach_state_v1";

/**
 * Loads progress state from localStorage.
 * Always returns a valid ProgressState object.
 */
export function loadState(): ProgressState {
  // SSR safety
  if (typeof window === "undefined") return makeInitialState();

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return makeInitialState();

    const parsed = JSON.parse(raw) as unknown;

    // Basic shape checks
    if (!parsed || typeof parsed !== "object") return makeInitialState();

    const p = parsed as ProgressState;

    // Versioning guard
    if (p.version !== 1) return makeInitialState();

    // Ensure required fields exist
    if (!Array.isArray(p.answers)) return makeInitialState();
    if (!p.topicStats || typeof p.topicStats !== "object") return makeInitialState();

    return p;
  } catch {
    return makeInitialState();
  }
}

export function saveState(state: ProgressState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
