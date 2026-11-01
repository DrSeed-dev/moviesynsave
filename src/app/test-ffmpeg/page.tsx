"use client";

import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

type Mode = "compress" | "audio";

export default function TestFFmpeg() {
  const [log, setLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  function addLog(message: string) {
    setLog((prev) => [...prev, message]);
  }

  // Loads FFmpeg once and reuses it for every later run on this page.
  async function getFFmpeg(): Promise<FFmpeg> {
    if (ffmpegRef.current) return ffmpegRef.current;

    addLog("Loading FFmpeg core (downloading .wasm)...");
    const loadStart = performance.now();

    const ffmpeg = new FFmpeg();
    ffmpeg.on("log", ({ message }) => addLog(`[ffmpeg] ${message}`));

    await ffmpeg.load();

    const loadTime = ((performance.now() - loadStart) / 1000).toFixed(1);
    addLog(`FFmpeg core loaded in ${loadTime}s`);

    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }

  async function run(mode: Mode) {
    if (!file) return;

    setIsLoading(true);
    setLog([]);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);

    const startTime = performance.now();

    try {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      addLog(`File selected: ${file.name} (${fileSizeMB} MB)`);
      addLog(`Mode: ${mode === "compress" ? "Compress to 720p" : "Extract audio to MP3"}`);

      const ffmpeg = await getFFmpeg();

      addLog("Writing file into FFmpeg's virtual filesystem...");
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));

      const outputName = mode === "compress" ? "output.mp4" : "output.mp3";
      const args =
        mode === "compress"
          ? [
              "-i", "input.mp4",
              "-vf", "scale=-2:720",
              "-c:v", "libx264",
              "-crf", "28",
              "-preset", "veryfast",
              outputName,
            ]
          : [
              "-i", "input.mp4",
              "-vn",
              "-c:a", "libmp3lame",
              "-b:a", "128k",
              outputName,
            ];

      addLog("Running FFmpeg (this is the real test)...");
      const processStart = performance.now();

      await ffmpeg.exec(args);

      const processTime = ((performance.now() - processStart) / 1000).toFixed(1);
      addLog(`Processing finished in ${processTime}s`);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as BlobPart], {
        type: mode === "compress" ? "video/mp4" : "audio/mpeg",
      });
      const outputSizeMB = (blob.size / 1024 / 1024).toFixed(2);

      addLog(`Output size: ${outputSizeMB} MB (original was ${fileSizeMB} MB)`);

      const url = URL.createObjectURL(blob);
      if (mode === "audio") setAudioUrl(url);
      addLog(`Done. Output URL created: ${url}`);

      const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
      addLog(`Total time (load + process): ${totalTime}s`);
    } catch (err) {
      addLog(`FAILED: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>FFmpeg.wasm Feasibility Test</h1>
      <p>Pick a video file, then choose what to test.</p>

      <input
        type="file"
        accept="video/*"
        disabled={isLoading}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
        <button disabled={!file || isLoading} onClick={() => run("compress")}>
          Compress to 720p
        </button>
        <button disabled={!file || isLoading} onClick={() => run("audio")}>
          Extract audio (MP3)
        </button>
      </div>

      {audioUrl && (
        <div style={{ marginTop: "1.5rem" }}>
          <p>Extracted audio (press play to check it):</p>
          <audio controls src={audioUrl} />
        </div>
      )}

      <pre style={{ marginTop: "1.5rem", whiteSpace: "pre-wrap" }}>
        {log.join("\n")}
      </pre>
    </main>
  );
}