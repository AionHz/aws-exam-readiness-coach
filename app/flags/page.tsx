'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PremiumButton } from '../components/PremiumButton';
import { QUESTION_BANK } from '../lib/questionBank';
import {
  getFlaggedIds,
  setFlaggedIds,
  toggleFlaggedId,
  subscribe,
} from '../lib/progressStore';

type Question = {
  id: string;
  domain: string;
  prompt: string;
  choices: { id: string; text: string }[];
};

function getAllQuestions(): Question[] {
  return QUESTION_BANK.map((q) => ({
    id: q.id,
    domain: q.domain,
    prompt: q.prompt,
    choices: q.choices.map((c) => ({ id: c.id, text: c.text })),
  }));
}

export default function FlagsPage() {
  const allQuestions = useMemo(() => getAllQuestions(), []);
  const [flagIds, setFlagIds] = useState<string[]>(() => getFlaggedIds());
  const [query, setQuery] = useState('');

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setFlagIds(getFlaggedIds());
    });
    return unsubscribe;
  }, []);

  const flagged = useMemo(() => {
    const set = new Set(flagIds);
    return allQuestions.filter((q) => set.has(q.id));
  }, [allQuestions, flagIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flagged;
    return flagged.filter((item) => {
      const choices = item.choices.map((c) => c.text).join(' ');
      const haystack = `${item.domain} ${item.prompt} ${choices}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [flagged, query]);

  function unflag(id: string) {
    toggleFlaggedId(id);
  }

  function clearAll() {
    setFlaggedIds([]);
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
            You haven&apos;t flagged anything yet. Go to <span className="text-zinc-200">Practice</span> and tap the ☆ Flag button.
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
                    <div className="mt-2 text-sm font-semibold text-zinc-100">{q.prompt}</div>
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
