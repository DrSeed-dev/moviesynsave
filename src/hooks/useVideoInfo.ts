"use client";

import { useEffect, useState } from "react";
import { readVideoMetadata, type VideoInfo } from "@/lib/media";

// Gives a screen the length and size of the chosen video, once the browser
// has read them. Returns null while reading, or if it cannot be read.
export function useVideoInfo(file: File | null): VideoInfo | null {
  const [result, setResult] = useState<{
    file: File;
    info: VideoInfo | null;
  } | null>(null);

  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    readVideoMetadata(file).then((info) => {
      if (!cancelled) setResult({ file, info });
    });

    return () => {
      cancelled = true;
    };
  }, [file]);

  // Only trust a result that belongs to the file currently chosen.
  return result && result.file === file ? result.info : null;
}