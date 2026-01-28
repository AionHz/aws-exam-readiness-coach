import "./globals.css";
import type { Metadata } from "next";
import TopNav from "./components/TopNav";

export const metadata: Metadata = {
  title: "AWS Exam Readiness Coach",
  description: "CLF-C02 Practice",
};

function LogoMark() {
  return (
    <div
      className="w-9 h-9 rounded-md bg-white/10 border border-white/20 flex items-center justify-center"
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="w-7 h-7" role="img" aria-label="App logo">
        <path
          d="M24 41h21a8 8 0 0 0 .8-15.96A11 11 0 0 0 24.7 23a7.2 7.2 0 0 0-.7 14z"
          fill="#EAF2FF"
        />
        <path
          d="M26.5 36.8l4.1 4.2 8.6-9.2"
          fill="none"
          stroke="#22C55E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="49" cy="18" r="3" fill="#60A5FA" />
      </svg>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <header className="sticky top-0 z-50">
          {/* Dark title bar */}
          <div className="bg-[#0B1220]/95 backdrop-blur border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <LogoMark />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      AWS Exam Readiness Coach
                    </div>
                    <div className="text-xs text-white/70 truncate">
                      CLF-C02 Practice • Local Progress
                    </div>
                  </div>
                </div>

                {/* Active tab highlight now follows the route */}
                <TopNav />
              </div>
            </div>
          </div>

          {/* Thin strip under the title bar */}
          <div className="bg-zinc-900 border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
              <div className="text-xs text-white/60">
                Tip: Practice builds stats on your Dashboard.
              </div>
              <div className="text-xs text-white/45">Local-only • No external APIs</div>
            </div>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
