import type { Metadata } from "next";
import TipsClient from "./tips-client";

export const metadata: Metadata = {
  title: "Tips | AWS Exam Readiness Coach",
  description:
    "Interactive CLF-C02 study guide with high-yield tips, phrase decoder, and keyword drill.",
};

export default function TipsPage() {
  return <TipsClient />;
}
