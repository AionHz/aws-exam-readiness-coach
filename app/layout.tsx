import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import TopNav from "./components/TopNav";
import { Inter } from "next/font/google";
import PremiumBackground from "./components/PremiumBackground";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "AWS Exam Readiness Coach",
  description: "CLF-C02 Practice",
};

function LogoMark() {
  return (
    <Image
      src="/logocloud.png"
      alt=""
      width={32}
      height={32}
      className="rounded-md ring-1 ring-white/10"
      aria-hidden="true"
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`surface ${inter.className} min-h-screen text-zinc-100`}>
        <PremiumBackground />
        <header className="sticky top-0 z-50">
          <div className="bg-slate-950/40 backdrop-blur-md border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 h-[72px] flex items-center">
              <div className="flex items-center justify-between gap-4 w-full">
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

                <TopNav />
              </div>
            </div>
          </div>
        </header>

        <div className="sticky top-[72px] z-40 bg-slate-950/25 backdrop-blur-md border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 h-[40px] flex items-center justify-between">
            <div className="text-xs text-white/60">
              Tip: Practice builds stats on your Dashboard.
            </div>
            <div className="text-xs text-white/45">Local-only • No external APIs</div>
          </div>
        </div>

        <main>{children}</main>
      </body>
    </html>
  );
}
