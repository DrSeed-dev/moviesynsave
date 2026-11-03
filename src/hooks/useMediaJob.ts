"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { getEngine, runJob } from "@/lib/ffmpeg/engine";

// ---------- 1. The shape of a job at every stage ----------

export type JobResult = {
  url: string; // a temporary browser URL for the finished file
  downloadName: string;
  inputBytes: number;
  outputBytes: number;
};

// Each stage carries only the data that exists at that stage.
// TypeScript will not let us read `result` unless the status is "done".
export type JobState =
  | { status: "idle" }
  | { status: "ready"; file: File }
  | { status: "preparing"; file: File } // downloading FFmpeg (first visit only)
  | { status: "processing"; file: File; progress: number } // progress is 0 to 1
  | { status: "done"; file: File; result: JobResult }
  | { status: "error"; file: File | null; message: string };

// ---------- 2. Everything that can happen to a job ----------

type Action =
  | { type: "select"; file: File }
  | { type: "prepare" }
  | { type: "process" }
  | { type: "progress"; progress: number }
  | { type: "done"; result: JobResult }
  | { type: "fail"; message: string }
  | { type: "reset" };

// ---------- 3. The rules: given the current state and an action, what is next? ----------

function reducer(state: JobState, action: Action): JobState {
  switch (action.type) {
    case "select":
      return { status: "ready", file: action.file };

    case "prepare": {
      if (state.status === "ready") {
        return { status: "preparing", file: state.file };
      }
      if (state.status === "error" && state.file) {
        return { status: "preparing", file: state.file };
      }
      return state;
    }

    case "process":
      if (state.status === "preparing") {
        return { status: "processing", file: state.file, progress: 0 };
      }
      return state;

    case "progress":
      if (state.status === "processing") {
        return { ...state, progress: action.progress };
      }
      return state;

    case "done":
      if (state.status === "processing") {
        return { status: "done", file: state.file, result: action.result };
      }
      return state;

    case "fail":
      return {
        status: "error",
        file: "file" in state ? state.file : null,
        message: action.message,
      };

    case "reset":
      return { status: "idle" };
  }
}

// ---------- 4. The hook the screens will use ----------

// What makes one tool different from another. Define this OUTSIDE your
// component (as a constant) so it does not change on every render.
export type JobConfig = {
  buildArgs: (input: string, output: string) => string[];
  outputExtension: string; // "mp3", "mp4", ...
  mimeType: string; // "audio/mpeg", ...
};

function makeDownloadName(file: File, extension: string) {
  const baseName = file.name.replace(/\.[^/.]+$/, "") || "output";
  return `${baseName}.${extension}`;
}

export function useMediaJob(config: JobConfig) {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });
  const urlRef = useRef<string | null>(null);

  // Browser URLs for finished files hold memory until we release them.
  const releaseUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  // Release it when the screen goes away.
  useEffect(() => releaseUrl, [releaseUrl]);

  const selectFile = useCallback(
    (file: File) => {
      releaseUrl();
      dispatch({ type: "select", file });
    },
    [releaseUrl]
  );

  const reset = useCallback(() => {
    releaseUrl();
    dispatch({ type: "reset" });
  }, [releaseUrl]);

  const start = useCallback(async () => {
    if (state.status !== "ready" && state.status !== "error") return;
    const file = state.file;
    if (!file) return;

    releaseUrl();
    dispatch({ type: "prepare" });

    try {
      // Download FFmpeg first (instant after the first visit), so the screen
      // can tell "preparing" apart from "processing".
      await getEngine();
      dispatch({ type: "process" });

      const { blob } = await runJob({
        file,
        buildArgs: config.buildArgs,
        outputName: `output.${config.outputExtension}`,
        mimeType: config.mimeType,
        onProgress: (progress) => dispatch({ type: "progress", progress }),
      });

      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      dispatch({
        type: "done",
        result: {
          url,
          downloadName: makeDownloadName(file, config.outputExtension),
          inputBytes: file.size,
          outputBytes: blob.size,
        },
      });
    } catch (error) {
      dispatch({
        type: "fail",
        message:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }, [state, config, releaseUrl]);

  return { state, selectFile, start, reset };
}