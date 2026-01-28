import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#050816] to-[#060b1f] text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            AWS Exam Readiness Coach
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
            Adaptive practice for the AWS Certified Cloud Practitioner (CLF-C02). Drill smart.
            Track weaknesses. Know when you’re truly ready.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/quiz"
              className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-400"
            >
              Start Practice
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-white/15"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Adaptive Drilling</div>
            <div className="mt-1 text-sm text-white/70">
              The system focuses on weak areas so you improve faster.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Readiness Score</div>
            <div className="mt-1 text-sm text-white/70">
              A real-time score that shows when you’re exam-ready.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Weakness Tracking</div>
            <div className="mt-1 text-sm text-white/70">
              Automatically identifies topics holding you back.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
