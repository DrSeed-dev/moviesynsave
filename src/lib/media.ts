// Reads basic facts about a video (length and size) using the browser's own
// video player, without FFmpeg. This is instant, and it works for most files.
// If the browser cannot read the file, we return null and the page simply
// skips the extra information.

export type VideoInfo = {
  durationSeconds: number;
  width: number;
  height: number;
};

export function readVideoMetadata(
  file: File,
  timeoutMs = 5000
): Promise<VideoInfo | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    let settled = false;

    const finish = (info: VideoInfo | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeAttribute("src");
      video.load(); // lets the browser let go of the file
      URL.revokeObjectURL(url);
      resolve(info);
    };

    // Some formats never report back. Do not wait forever.
    const timer = setTimeout(() => finish(null), timeoutMs);

    video.preload = "metadata";
    video.muted = true;

    video.onloadedmetadata = () => {
      const { duration, videoWidth, videoHeight } = video;
      if (Number.isFinite(duration) && duration > 0 && videoWidth > 0) {
        finish({
          durationSeconds: duration,
          width: videoWidth,
          height: videoHeight,
        });
      } else {
        finish(null);
      }
    };
    video.onerror = () => finish(null);

    video.src = url;
  });
}