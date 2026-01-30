'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PremiumButton } from '../components/PremiumButton';
import * as Bank from '../../lib/questionBank';
import {
  getFlaggedIds,
  setFlaggedIds,
  toggleFlaggedId,
  subscribe,
} from '../lib/progressStore';

type Question = {
  id: string;
  domain: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: any;
  coach?: any;
  verified?: boolean;
};

function toStringSafe(v: any): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function normalizeChoices(raw: any): string[] {
  const candidate =
    raw?.choices ??
    raw?.options ??
    raw?.answers ??
    raw?.answerChoices ??
    raw?.choicesText ??
    raw;

  if (Array.isArray(candidate)) {
    return candidate.map((x) => toStringSafe(x)).map((s) => s.trim()).filter(Boolean);
  }

  if (candidate && typeof candidate === 'object') {
    const vals = Object.values(candidate)
      .map((x) => toStringSafe(x))
      .map((s) => s.trim())
      .filter(Boolean);
    if (vals.length > 0) return vals;
  }

  if (typeof candidate === 'string') {
    const byNewline = candidate
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (byNewline.length >= 2) return byNewline;

    const byPipe = candidate
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    if (byPipe.length >= 2) return byPipe;
  }

  return [];
}

function normalizeAnswerIndex(raw: any, choices: string[]): number {
  const a =
    raw?.answerIndex ??
    raw?.correctIndex ??
    raw?.answer ??
    raw?.correctAnswer ??
    raw?.correct;

  const n = Number(a);
  if (Number.isFinite(n) && n >= 0) {
    return Math.min(n, Math.max(choices.length - 1, 0));
  }

  if (typeof a === 'string') {
    const letter = a.trim().toUpperCase();
    const code = letter.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      const idx = code - 65;
      if (idx >= 0 && idx < choices.length) return idx;
    }
    const matchIdx = choices.findIndex((c) => c.trim() === a.trim());
    if (matchIdx !== -1) return matchIdx;
  }

  return 0;
}

function normalizeQuestion(raw: any, fallbackId: number): Question | null {
  if (!raw || typeof raw !== 'object') return null;

  const questionText = toStringSafe(raw.question ?? raw.prompt ?? raw.text ?? raw.q ?? raw.title).trim();
  if (!questionText) return null;

  const domain = toStringSafe(raw.domain ?? raw.category ?? raw.topic ?? 'Uncategorized').trim();

  const choices = normalizeChoices(raw);
  if (choices.length < 2) return null;

  const answerIndex = normalizeAnswerIndex(raw, choices);

  const explanation = raw.explanation ?? raw.rationale ?? raw.why ?? '';
  const coach = raw.coach ?? raw.tip ?? raw.hint ?? '';

  const id = toStringSafe(raw.id ?? raw.uid ?? raw.key ?? `${domain}-${fallbackId}`).trim();

  return {
    id,
    domain,
    question: questionText,
    choices,
    answerIndex,
    explanation,
    coach,
  };
}

function normalizeQuestionBank(): Question[] {
  const mod: any = Bank as any;

  const raw =
    mod.QUESTION_BANK ??
    mod.questionBank ??
    mod.QUESTIONS ??
    mod.questions ??
    mod.QUESTIONS_BY_DOMAIN ??
    mod.questionsByDomain ??
    mod.default ??
    null;

  if (!raw) return [];

  let flattened: any[] = [];
  if (Array.isArray(raw)) {
    flattened = raw;
  } else if (typeof raw === 'object') {
    const values = Object.values(raw);
    if (values.every((v) => Array.isArray(v))) flattened = (values as any[]).flat();
  }

  const normalized: Question[] = [];
  for (let i = 0; i < flattened.length; i++) {
    const q = normalizeQuestion(flattened[i], i + 1);
    if (q) normalized.push(q);
  }
  return normalized;
}

export default function FlagsPage() {
  const allQuestions = useMemo(() => normalizeQuestionBank(), []);
  const [hydrated, setHydrated] = useState(false);
  const [flagIds, setFlagIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setHydrated(true);
    setFlagIds(getFlaggedIds());
    const unsubscribe = subscribe(() => {
      setFlagIds(getFlaggedIds());
    });
    return unsubscribe;
  }, []);

  const flagged = useMemo(() => {
    const set = new Set(flagIds);
    const items = allQuestions.filter((q) => set.has(q.id));
    return items;
  }, [allQuestions, flagIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flagged;
    return flagged.filter((x) => {
      const domain = (x.domain || '').toString();
      const question = (x.question || '').toString();
      const choices = (x.choices || []).map((c) => (c || '').toString()).join(' ');
      const haystack = `${domain} ${question} ${choices}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [flagged, query]);

  function unflag(id: string) {
    toggleFlaggedId(id);
  }

  function clearAll() {
    setFlaggedIds([]);
  }

  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-sm text-zinc-400">Loading flagged questions…</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-100">Flagged Questions</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Local-only bookmarks. Use this list to review things you want to revisit.
          </p>
          <div className="mt-3 text-xs text-zinc-500">
            Total flagged: <span className="text-zinc-200 font-semibold">{flagIds.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/quiz" className="no-underline hover:no-underline focus:no-underline">
            <PremiumButton variant="indigo" size="md" type="button">
              Practice
            </PremiumButton>
          </Link>
          <Link href="/dashboard" className="no-underline hover:no-underline focus:no-underline">
            <PremiumButton variant="neutral" size="md" type="button">
              Dashboard
            </PremiumButton>
          </Link>
          <PremiumButton variant="neutral" size="md" type="button" onClick={clearAll}>
            Clear all
          </PremiumButton>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm font-semibold text-zinc-200">Search</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by domain or question text…"
            className="w-full sm:w-80 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-indigo-400/50"
          />
        </div>
      </div>

      <div className="mt-6">
        {flagIds.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
            You haven’t flagged anything yet. Go to <span className="text-zinc-200">Practice</span> and tap the ☆ Flag button.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
            No matches for your search.
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((q) => (
              <div key={q.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs text-zinc-500">{q.domain}</div>
                    <div className="mt-2 text-sm font-semibold text-zinc-100">{q.question}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/quiz?domain=${encodeURIComponent(q.domain)}`}
                      className="no-underline hover:no-underline focus:no-underline"
                      title="Jump to this domain in Practice"
                    >
                      <PremiumButton variant="neutral" size="sm" type="button">
                        Practice domain
                      </PremiumButton>
                    </Link>
                    <PremiumButton
                      variant="orange"
                      size="sm"
                      type="button"
                      onClick={() => unflag(q.id)}
                      title="Remove flag"
                    >
                      ★ Unflag
                    </PremiumButton>
                  </div>
                </div>

                <div className="mt-4 text-xs text-zinc-500">
                  Question ID: <span className="text-zinc-300">{q.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-zinc-500">
        Local-only • Flags stored in your browser
      </div>
    </div>
  );
}
