// The FFmpeg engine. It knows how to load FFmpeg and run one job on one file.
// It knows nothing about screens, buttons, or React.
// Only import this file from client components (it needs the browser).

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

// FFmpeg lives in the browser's memory for as long as the page is open.
// We keep ONE copy at module level so every tool shares it.
let ffmpeg: FFmpeg | null = null;
let loadingPromise: Promise<FFmpeg> | null = null;

/**
 * Returns the shared FFmpeg instance, downloading it first if needed.
 * If two callers ask at the same moment, they share one download.
 */
export function getEngine(): Promise<FFmpeg> {
  if (ffmpeg) return Promise.resolve(ffmpeg);

  if (!loadingPromise) {
    loadingPromise = (async () => {
      const instance = new FFmpeg();
      await instance.load();
      ffmpeg = instance;
      return instance;
    })().catch((error) => {
      // Let the next call try again instead of being stuck on a failed load.
      loadingPromise = null;
      throw error;
    });
  }

  return loadingPromise;
}

export type RunJobOptions = {
  file: File;
  // Builds the FFmpeg arguments. We pass in the virtual file names so the
  // caller never has to hard-code them.
  buildArgs: (input: string, output: string) => string[];
  outputName: string; // the extension decides the output format, e.g. "audio.mp3"
  mimeType: string; // e.g. "audio/mpeg"
  // Called with a number from 0 to 1 while FFmpeg works.
  onProgress?: (ratio: number) => void;
};

export type RunJobResult = {
  blob: Blob;
  outputName: string;
};

const INPUT_NAME = "input";

export async function runJob(options: RunJobOptions): Promise<RunJobResult> {
  const { file, buildArgs, outputName, mimeType, onProgress } = options;
  const engine = await getEngine();

  const handleProgress = ({ progress }: { progress: number }) => {
    // FFmpeg can occasionally report values outside 0..1, so we clamp.
    onProgress?.(Math.min(1, Math.max(0, progress)));
  };

  engine.on("progress", handleProgress);

  try {
    await engine.writeFile(INPUT_NAME, await fetchFile(file));
    await engine.exec(buildArgs(INPUT_NAME, outputName));

    const data = await engine.readFile(outputName);
    if (typeof data === "string") {
      throw new Error("FFmpeg returned text instead of a file.");
    }

    onProgress?.(1);
    return {
      blob: new Blob([data as BlobPart], { type: mimeType }),
      outputName,
    };
  } finally {
    engine.off("progress", handleProgress);

    // FFmpeg's virtual filesystem lives in memory. Delete our files so they
    // don't pile up, which matters a lot on phones.
    for (const name of [INPUT_NAME, outputName]) {
      try {
        await engine.deleteFile(name);
      } catch {
        // The file may not exist if the job failed early. That is fine.
      }
    }
  }
}