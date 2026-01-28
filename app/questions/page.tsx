import { QUESTION_COUNT } from "../lib/questionBank";
export default function QuestionsCountPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-xs uppercase tracking-widest text-white/50">
          AWS CLF-C02 Practice
        </div>

        <h1 className="mt-2 text-2xl md:text-3xl font-semibold">
          Current Question Count
        </h1>

        <p className="mt-4 text-white/75 leading-relaxed">
          You currently have{" "}
          <span className="font-semibold text-white">{QUESTION_COUNT}</span>{" "}
questions in the local quiz bank.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href="/quiz"
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Go to /quiz →
          </a>
          <a
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10"
          >
            Go to /dashboard →
          </a>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold">Where this comes from</div>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">
          The quiz uses the shared question bank defined in app/lib/questionBank.ts.
This number is derived from QUESTION_BANK.length.
          </p>
        </div>
      </div>
    </main>
  );
}
