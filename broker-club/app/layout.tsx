import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Broker Club | MCA Sales Engine",
  description:
    "A fast merchant cash advance offer calculator for MCA brokers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
