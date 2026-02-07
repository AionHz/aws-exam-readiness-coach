import type { Metadata } from "next";
import RoleSimClient from "./role-sim-client";

export const metadata: Metadata = {
  title: "Role Sim | AWS Exam Readiness Coach",
  description:
    "Interactive day-in-the-life simulation for an entry-level AWS cloud operations role.",
};

export default function RoleSimPage() {
  return <RoleSimClient />;
}

