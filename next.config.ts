import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets other devices on your Wi-Fi (your phone) load the dev server's
  // JavaScript. If your computer's IP address changes, update it here.
  allowedDevOrigins: ["192.168.0.102"],
};

export default nextConfig;