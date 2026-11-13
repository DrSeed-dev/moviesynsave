import type { ReactNode } from "react";
import type { Metadata } from "next";

// The page itself is a client component, and client components cannot set
// the page title. A layout next to it can.
export const metadata: Metadata = {
  title: "Compress video",
  description:
    "Make a video smaller so it is easier to share. Everything runs on your device.",
};

export default function CompressLayout({ children }: { children: ReactNode }) {
  return children;
}