"use client";

import { useMediaJob, type JobConfig } from "@/hooks/useMediaJob";

// What makes this tool "Extract audio". Defined outside the component so it
// is created once, not on every render.
const AUDIO_CONFIG: JobConfig = {
  buildArgs: (input, output) => [
    "-i", input,
    "-vn", // no video
    "-c:a", "libmp3lame", // MP3 encoder
    "-b:a", "128k", // standard quality
    output,
  ],
  outputExtension: "mp3",
  mimeType: "audio/mpeg",
};

const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-300";

const secondaryButton =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-neutral-300 px-5 text-sm font-medium transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-700 dark:hover:bg-neutral-800";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ExtractAudioPage() {
  const { state, selectFile, start, reset } = useMediaJob(AUDIO_CONFIG);

  return (
    <main className="min-h-dvh bg-neutral-50 px-4 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Extract audio
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Turn a video into an MP3. Everything happens on your device, so
            your file is never uploaded.
          </p>
        </header>

        <section
          aria-live="polite"
          className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
        >
          {state.status === "idle" && <FilePicker onSelect={selectFile} />}

          {state.status === "ready" && (
            <div className="space-y-5">
              <div className="min-w-0">
                <p className="truncate font-medium">{state.file.name}</p>
                <p className="text-sm text-neutral-500">
                  {formatBytes(state.file.size)}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={start} className={primaryButton}>
                  Extract audio
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
            </div>
          )}

          {state.status === "processing" && (
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <p className="font-medium">Extracting audio</p>
                <p className="text-sm tabular-nums text-neutral-500">
                  {Math.round(state.progress * 100)}%
                </p>
              </div>
              <div
                role="progressbar"
                aria-label="Extraction progress"
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
            </div>
          )}

          {state.status === "done" && (
            <div className="space-y-5">
              <div>
                <p className="font-medium">Your MP3 is ready</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {formatBytes(state.result.inputBytes)} video to{" "}
                  {formatBytes(state.result.outputBytes)} MP3
                </p>
              </div>
              <audio controls src={state.result.url} className="w-full" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={state.result.url}
                  download={state.result.downloadName}
                  className={primaryButton}
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download MP3
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

function FilePicker({ onSelect }: { onSelect: (file: File) => void }) {
  return (
    <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center transition-colors hover:border-neutral-500 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600 dark:border-neutral-700 dark:hover:border-neutral-500">
      <UploadIcon className="h-8 w-8 text-neutral-500" />
      <span className="font-medium">Choose a video</span>
      <span className="text-sm text-neutral-500">
        MP4, MOV, WebM and more
      </span>
      <input
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
          // Reset so choosing the same file again still triggers onChange.
          event.target.value = "";
        }}
      />
    </label>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  );
}