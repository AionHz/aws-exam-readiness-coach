import type { Metadata } from "next";
import HandsOnClient from "./hands-on-client";

export const metadata: Metadata = {
  title: "Hands-on | AWS Exam Readiness Coach",
  description:
    "Visual AWS fundamentals lab with interactive flow, resiliency, and scaling simulations.",
};

export default function HandsOnPage() {
  return <HandsOnClient />;
}

