"use client";

import { useMemo, useState } from "react";
import { FilePicker } from "@/components/FilePicker";
import { DownloadIcon } from "@/components/icons";
import { useMediaJob, type JobConfig } from "@/hooks/useMediaJob";
import { formatBytes } from "@/lib/format";
import { primaryButton, secondaryButton } from "@/lib/styles";

// ---------- The three choices the user sees ----------
// Users pick an outcome. The numbers behind each one are ours to tune.
// shortSide: the shorter edge of the video, in pixels (480 means "480p").
// crf: FFmpeg's quality dial. Higher means smaller file and lower quality.

type PresetId = "smallest" | "balanced" | "best";

type Preset = {
  id: PresetId;
  label: string;
  description: string;
  shortSide: number;
  crf: number;
  audioKbps: number;
};

const PRESETS: Preset[] = [
  {
    id: "smallest",
    label: "Smallest",
    description: "Best for messaging apps. Up to 480p.",
    shortSide: 480,
    crf: 32,
    audioKbps: 96,
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Good for most sharing. Up to 720p.",
    shortSide: 720,
    crf: 28,
    audioKbps: 128,
  },
  {
    id: "best",
    label: "Best quality",
    description: "Keeps more detail. Up to 1080p. Takes the longest.",
    shortSide: 1080,
    crf: 24,
    audioKbps: 128,
  },
];

// Turns a preset into the instructions for FFmpeg.
function makeConfig(preset: Preset): JobConfig {
  const s = preset.shortSide;

  // Caps the SHORT side at `s` pixels, never enlarges the video, and keeps
  // both sides even (the video format requires even numbers).
  // Landscape: height is capped and width follows (-2 = automatic, even).
  // Portrait or square: width is capped and height follows.
  const scale =
    `scale=w='if(gt(iw,ih),-2,trunc(min(${s},iw)/2)*2)'` +
    `:h='if(gt(iw,ih),trunc(min(${s},ih)/2)*2,-2)'`;

  return {
    buildArgs: (input, output) => [
      "-i", input,
      "-vf", scale,
      "-c:v", "libx264",
      "-preset", "veryfast", // the setting that made phones and laptops usable
      "-crf", String(preset.crf),
      "-pix_fmt", "yuv420p", // plays on every phone and browser
      "-c:a", "aac",
      "-b:a", `${preset.audioKbps}k`,
      "-movflags", "+faststart", // lets the video start playing sooner
      output,
    ],
    outputExtension: "mp4",
    mimeType: "video/mp4",
    nameSuffix: "-compressed",
  };
}

export default function CompressPage() {
  const [presetId, setPresetId] = useState<PresetId>("balanced");

  // The config changes when the user picks a different preset, so we build
  // it with useMemo instead of defining it once outside the component.
  const config = useMemo(
    () => makeConfig(PRESETS.find((p) => p.id === presetId) ?? PRESETS[1]),
    [presetId]
  );

  const { state, selectFile, start, cancel, reset } = useMediaJob(config);

  return (
    <main className="min-h-dvh bg-neutral-50 px-4 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Compress video
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Make a video smaller so it is easier to share. Everything happens
            on your device, so your file is never uploaded.
          </p>
        </header>

        <section
          aria-live="polite"
          className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
        >
          {state.status === "idle" && <FilePicker onSelect={selectFile} />}

          {state.status === "ready" && (
            <div className="space-y-6">
              <div className="min-w-0">
                <p className="truncate font-medium">{state.file.name}</p>
                <p className="text-sm text-neutral-500">
                  {formatBytes(state.file.size)}
                </p>
              </div>

              <fieldset>
                <legend className="mb-3 text-sm font-medium">
                  Choose a size
                </legend>
                <div className="space-y-2">
                  {PRESETS.map((preset) => {
                    const selected = preset.id === presetId;
                    return (
                      <label
                        key={preset.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600 ${
                          selected
                            ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800"
                            : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="preset"
                          value={preset.id}
                          checked={selected}
                          onChange={() => setPresetId(preset.id)}
                          className="mt-1 h-4 w-4 accent-blue-600"
                        />
                        <span>
                          <span className="block font-medium">
                            {preset.label}
                          </span>
                          <span className="block text-sm text-neutral-500">
                            {preset.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Compressing happens on your device, so it can take a while,
                especially on a phone. Keep this tab open until it finishes.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={start} className={primaryButton}>
                  Compress video
                </button>
                <button type="button" onClick={reset} className={secondaryButton}>
                  Choose a different video
                </button>
              </div>
            </div>
          )}

          {state.status === "preparing" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white"
                />
                <p className="font-medium">Preparing the converter</p>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                This is a one-time download. After this visit it is saved on
                your device and loads instantly. On a slow connection it can
                take a few minutes, so keep this tab open.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button type="button" onClick={cancel} className={secondaryButton}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {state.status === "processing" && (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <p className="font-medium">Compressing video</p>
                <p className="text-sm tabular-nums text-neutral-500">
                  {Math.round(state.progress * 100)}%
                </p>
              </div>
              <div
                role="progressbar"
                aria-label="Compression progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(state.progress * 100)}
                className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
              >
                <div
                  className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
                  style={{ width: `${Math.round(state.progress * 100)}%` }}
                />
              </div>
              <p className="truncate text-sm text-neutral-500">
                {state.file.name}
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button type="button" onClick={cancel} className={secondaryButton}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {state.status === "done" && (
            <div className="space-y-5">
              <div>
                <p className="font-medium">Your video is ready</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {formatBytes(state.result.inputBytes)} to{" "}
                  {formatBytes(state.result.outputBytes)}
                  {state.result.outputBytes < state.result.inputBytes
                    ? ` (${Math.round(
                        (1 - state.result.outputBytes / state.result.inputBytes) *
                          100
                      )}% smaller)`
                    : ""}
                </p>
                {state.result.outputBytes >= state.result.inputBytes && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    This video was already small, so the result is not smaller
                    than your original. Try Smallest, or keep the original.
                  </p>
                )}
              </div>
              <video
                controls
                playsInline
                src={state.result.url}
                className="w-full rounded-xl bg-black"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={state.result.url}
                  download={state.result.downloadName}
                  className={primaryButton}
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download video
                </a>
                <button type="button" onClick={reset} className={secondaryButton}>
                  Choose another video
                </button>
              </div>
            </div>
          )}

          {state.status === "error" && (
            <div className="space-y-5">
              <div>
                <p className="font-medium">That did not work</p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {state.message}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {state.file && (
                  <button type="button" onClick={start} className={primaryButton}>
                    Try again
                  </button>
                )}
                <button type="button" onClick={reset} className={secondaryButton}>
                  Start over
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}