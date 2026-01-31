"use client";

import { useEffect, useMemo, useState } from "react";
import { loadState, saveState, clearState } from "./storage";
import { QUESTIONS, type Topic } from "./questionBank";

export type TopicStats = {
  attempts: number;
  correct: number;
  lastSeen: number | null;
  streakWrong: number;
};

export type AnswerRecord = {
  questionId: string;
  topic: Topic;
  selected: "A" | "B" | "C" | "D";
  correct: boolean;
  timestamp: number;
};

export type ProgressState = {
  version: number;
  answers: AnswerRecord[];
  topicStats: Record<Topic, TopicStats>;
};

export function makeInitialState(): ProgressState {
  // Build topic list from your current question bank (no guessing strings)
  const topics = Array.from(new Set(QUESTIONS.map((q) => q.topic))) as Topic[];

  const topicStats = {} as Record<Topic, TopicStats>;
  for (const t of topics) {
    topicStats[t] = { attempts: 0, correct: 0, lastSeen: null, streakWrong: 0 };
  }

  return {
    version: 1,
    answers: [],
    topicStats
  };
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() => makeInitialState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = loadState();
    setState(s);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  const api = useMemo(() => {
    function recordAnswer(a: AnswerRecord) {
      setState((prev) => {
        const next = structuredClone(prev) as ProgressState;

        next.answers.push(a);

        // cap history so it doesn't grow forever
        if (next.answers.length > 500) next.answers = next.answers.slice(-500);

        const ts = next.topicStats[a.topic] ?? {
          attempts: 0,
          correct: 0,
          lastSeen: null,
          streakWrong: 0
        };

        ts.attempts += 1;
        if (a.correct) ts.correct += 1;
        ts.lastSeen = a.timestamp;
        ts.streakWrong = a.correct ? 0 : ts.streakWrong + 1;

        next.topicStats[a.topic] = ts;
        return next;
      });
    }

    function resetProgress() {
      clearState();
      setState(makeInitialState());
    }

    return { recordAnswer, resetProgress };
  }, []);

  return { state, hydrated, ...api };
}
