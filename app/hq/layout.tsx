import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HQ",
  description: "Private operations dashboard.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function HqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
