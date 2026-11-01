import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets other devices on your Wi-Fi (your phone) load the dev server's
  // JavaScript. If your computer's IP address changes, update it here.
  allowedDevOrigins: ["192.168.0.102"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;