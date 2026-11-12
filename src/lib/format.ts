// Turns a byte count into text people can read, like "1.78 MB".
export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// The length of a video, like "1:56" or "1:02:10".
export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// How long a job took, like "42s" or "2m 8s".
export function formatElapsed(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

// A rough "time left", in words people trust more than exact seconds.
export function formatTimeLeft(seconds: number) {
  if (seconds < 60) return "less than a minute";
  const minutes = Math.round(seconds / 60);
  return minutes === 1 ? "about 1 minute" : `about ${minutes} minutes`;
}