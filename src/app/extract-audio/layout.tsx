import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Extract audio",
  description:
    "Turn a video into an MP3. Everything runs on your device.",
};

export default function ExtractAudioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}